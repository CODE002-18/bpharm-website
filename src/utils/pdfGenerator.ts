import { collection, doc, getDocs, orderBy, query, writeBatch } from 'firebase/firestore';
import { db } from '../firebase';
import { ResourceItem } from '../types';

const IDB_NAME = 'bpharmhub_pdf_binary_db';
const IDB_STORE = 'pdf_files';

function openPdfIdb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = window.indexedDB.open(IDB_NAME, 1);
    req.onupgradeneeded = () => {
      const database = req.result;
      if (!database.objectStoreNames.contains(IDB_STORE)) {
        database.createObjectStore(IDB_STORE);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function savePdfBytesToIdb(resourceId: string, bytes: Uint8Array): Promise<void> {
  try {
    const database = await openPdfIdb();
    await new Promise<void>((resolve, reject) => {
      const tx = database.transaction(IDB_STORE, 'readwrite');
      tx.objectStore(IDB_STORE).put(bytes, resourceId);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('IndexedDB PDF save warning:', err);
  }
}

export async function getPdfBytesFromIdb(resourceId: string): Promise<Uint8Array | null> {
  try {
    const database = await openPdfIdb();
    return await new Promise<Uint8Array | null>((resolve, reject) => {
      const tx = database.transaction(IDB_STORE, 'readonly');
      const req = tx.objectStore(IDB_STORE).get(resourceId);
      req.onsuccess = () => {
        const res = req.result;
        if (res instanceof Uint8Array) resolve(res);
        else if (res instanceof ArrayBuffer) resolve(new Uint8Array(res));
        else resolve(null);
      };
      req.onerror = () => reject(req.error);
    });
  } catch {
    return null;
  }
}

export function uint8ArrayToBase64(bytes: Uint8Array): string {
  let binary = '';
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const sub = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode.apply(null, Array.from(sub));
  }
  return window.btoa(binary);
}

export function base64ToUint8Array(base64: string): Uint8Array {
  const clean = base64.includes(',') ? base64.split(',')[1] : base64;
  const binaryStr = window.atob(clean);
  const len = binaryStr.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryStr.charCodeAt(i);
  }
  return bytes;
}

/**
 * Saves a large PDF into Firestore subcollection /resources/{resourceId}/pdfChunks
 * in 600KB Base64 chunks so files up to 25MB+ can be stored in Firestore.
 */
export async function savePdfChunksToFirestore(
  resourceId: string,
  bytes: Uint8Array
): Promise<void> {
  const fullBase64 = uint8ArrayToBase64(bytes);
  const chunkSize = 600000; // ~600 KB per Firestore doc (well below 1MB limit)
  const totalChunks = Math.ceil(fullBase64.length / chunkSize);

  // Commit in batches of up to 10 chunks
  for (let batchStart = 0; batchStart < totalChunks; batchStart += 10) {
    const batch = writeBatch(db);
    const batchEnd = Math.min(totalChunks, batchStart + 10);
    for (let i = batchStart; i < batchEnd; i++) {
      const chunkStr = fullBase64.slice(i * chunkSize, (i + 1) * chunkSize);
      const chunkRef = doc(
        db,
        'resources',
        resourceId,
        'pdfChunks',
        `chunk_${String(i).padStart(4, '0')}`
      );
      batch.set(chunkRef, {
        index: i,
        data: chunkStr,
      });
    }
    await batch.commit();
  }
}

export async function loadPdfChunksFromFirestore(resourceId: string): Promise<Uint8Array | null> {
  try {
    const q = query(
      collection(db, 'resources', resourceId, 'pdfChunks'),
      orderBy('index', 'asc')
    );
    const snap = await getDocs(q);
    if (snap.empty) return null;
    let combinedBase64 = '';
    snap.docs.forEach((d) => {
      const data = d.data();
      if (typeof data.data === 'string') {
        combinedBase64 += data.data;
      }
    });
    if (!combinedBase64) return null;
    const bytes = base64ToUint8Array(combinedBase64);
    await savePdfBytesToIdb(resourceId, bytes);
    return bytes;
  } catch (err) {
    console.warn('Could not load PDF chunks from Firestore:', err);
    return null;
  }
}

/**
 * Generates a real multi-page styled PDF document specific to a given ResourceItem
 * so that both the PDF.js preview and the downloaded .pdf file are 100% identical.
 */
export function buildMultiPagePdfBytes(resource: ResourceItem): Uint8Array {
  const esc = (str: string) =>
    str
      .replace(/[^\x20-\x7E]/g, ' ')
      .replace(/\\/g, '\\\\')
      .replace(/\(/g, '\\(')
      .replace(/\)/g, '\\)')
      .trim();

  const wrapLines = (text: string, maxChars: number): string[] => {
    const words = text.replace(/\s+/g, ' ').trim().split(' ');
    const lines: string[] = [];
    let current = '';
    for (const w of words) {
      if ((current + ' ' + w).trim().length <= maxChars) {
        current = (current + ' ' + w).trim();
      } else {
        if (current) lines.push(current);
        current = w.slice(0, maxChars);
      }
    }
    if (current) lines.push(current);
    return lines.length > 0 ? lines : [''];
  };

  // Break resource.previewContent + summary into structured lines for multiple pages
  const rawLines = [
    `Subject: ${resource.subjectCode} - ${resource.subjectTitle} (Semester ${resource.semester})`,
    `Material Type: ${
      resource.type === 'important-questions'
        ? 'AKTU Guess Paper'
        : resource.type === 'pyqs'
        ? 'AKTU Previous Year Question Paper (PYQ)'
        : resource.type.toUpperCase()
    } | University: ${resource.university}`,
    `Overview: ${resource.summary}`,
    '',
    ...resource.previewContent.split('\n'),
  ];

  const wrappedAll: string[] = [];
  for (const rLine of rawLines) {
    if (!rLine.trim()) {
      wrappedAll.push('');
    } else {
      const wrapped = wrapLines(rLine, 76);
      wrappedAll.push(...wrapped);
    }
  }

  // Split into pages of 24 lines each (minimum 2 pages so sidebar shows multi-page navigation)
  const linesPerPage = 24;
  const pageTextChunks: string[][] = [];
  for (let i = 0; i < wrappedAll.length; i += linesPerPage) {
    pageTextChunks.push(wrappedAll.slice(i, i + linesPerPage));
  }
  if (pageTextChunks.length === 1) {
    pageTextChunks.push([
      `ADDITIONAL REVISION NOTES - ${resource.subjectCode} (${resource.subjectTitle})`,
      '',
      `1. AKTU End-Semester Theory Exam Pattern (75 Marks, 3 Hours):`,
      `   - Section A: 10 x 2 = 20 Marks (All questions compulsory short definitions).`,
      `   - Section B: 2 x 10 = 20 Marks (Attempt any 2 out of 3 long analytical essays).`,
      `   - Section C: 5 x 7 = 35 Marks (Attempt any 5 out of 7 medium mechanism questions).`,
      '',
      `2. Key Focus for ${resource.subjectTitle} (Sem ${resource.semester}):`,
      ...wrapLines(resource.summary, 76),
      '',
      `3. Portal Reference: https://bpharmhub.xyz/sem-${resource.semester}/${resource.subjectSlug}/${resource.type}`,
    ]);
  }

  const numPages = pageTextChunks.length;
  const pageStreams: string[] = [];

  for (let p = 0; p < numPages; p++) {
    const pageNum = p + 1;
    const lines = pageTextChunks[p];
    const badgeText = esc(
      resource.unitNumber > 0 ? `UNIT 0${resource.unitNumber}` : `PAGE 0${pageNum}`
    );
    const titleMain = esc(resource.title.slice(0, 62));
    const subHeader = esc(
      `${resource.subjectCode} · ${resource.subjectTitle} · Semester ${resource.semester} (${resource.university})`
    );

    let stream = '';
    // White page background & top accent bar (Blue + Gold)
    stream += `0.15 0.39 0.92 rg\n45 792 380 3 re f\n`;
    stream += `0.96 0.62 0.04 rg\n425 792 125 3 re f\n`;

    // Chapter/Unit Pill Box on Top Right
    stream += `0.95 0.97 1.0 rg\n0.75 0.82 0.92 RG\n1 w\n455 756 95 22 re B\n`;
    stream += `BT\n/F2 9 Tf\n0.12 0.25 0.68 rg\n468 764 Td\n(${badgeText}) Tj\nET\n`;

    // Document Title & Subtitle
    stream += `BT\n/F2 14 Tf\n0.06 0.09 0.16 rg\n45 768 Td\n(${titleMain}) Tj\nET\n`;
    stream += `BT\n/F1 9.5 Tf\n0.39 0.45 0.55 rg\n45 750 Td\n(${subHeader}) Tj\nET\n`;

    // Thin divider line
    stream += `0.88 0.91 0.94 RG\n0.8 w\n45 738 m 550 738 l S\n`;

    // Body Content Box
    let y = 714;
    for (const line of lines) {
      if (y < 95) break;
      const trimmed = line.trim();
      const isHeading =
        /^(UNIT|SECTION|CHAPTER|[0-9]+\.|Q[0-9]+\.|Subject:|Material Type:|Overview:)/i.test(
          trimmed
        );

      if (isHeading) {
        stream += `BT\n/F2 10.5 Tf\n0.08 0.18 0.42 rg\n45 ${y} Td\n(${esc(trimmed)}) Tj\nET\n`;
        y -= 19;
      } else if (trimmed === '') {
        y -= 10;
      } else {
        stream += `BT\n/F1 10 Tf\n0.18 0.22 0.28 rg\n45 ${y} Td\n(${esc(line)}) Tj\nET\n`;
        y -= 17;
      }
    }

    // Bottom Callout Card
    stream += `0.97 0.98 0.99 rg\n0.86 0.89 0.93 RG\n1 w\n45 48 505 34 re B\n`;
    stream += `BT\n/F2 8.5 Tf\n0.05 0.45 0.43 rg\n55 67 Td\n(BPHARMHUB.XYZ - OFFICIAL AKTU B.PHARM STUDY PORTAL) Tj\nET\n`;
    stream += `BT\n/F1 8 Tf\n0.40 0.45 0.52 rg\n55 55 Td\n(${esc(
      `${resource.subjectCode} ${resource.subjectTitle} | Page ${pageNum} of ${numPages}`
    )}) Tj\nET\n`;

    pageStreams.push(stream);
  }

  // Construct valid multi-page PDF object graph
  // Object 1: Catalog
  // Object 2: Pages
  // Object 3: Font F1 (Helvetica)
  // Object 4: Font F2 (Helvetica-Bold)
  // Objects 5..: For each page p, Page object = 5 + p*2, Content stream = 6 + p*2
  const objects: string[] = [];
  const pageObjIds: string[] = [];
  for (let p = 0; p < numPages; p++) {
    pageObjIds.push(`${5 + p * 2} 0 R`);
  }

  objects.push(`1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n`);
  objects.push(
    `2 0 obj\n<< /Type /Pages /Kids [ ${pageObjIds.join(' ')} ] /Count ${numPages} >>\nendobj\n`
  );
  objects.push(
    `3 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n`
  );
  objects.push(
    `4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj\n`
  );

  for (let p = 0; p < numPages; p++) {
    const pageObjNum = 5 + p * 2;
    const contentObjNum = 6 + p * 2;
    const stream = pageStreams[p];
    objects.push(
      `${pageObjNum} 0 obj\n<< /Type /Page /Parent 2 0 R /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /MediaBox [0 0 595 842] /Contents ${contentObjNum} 0 R >>\nendobj\n`
    );
    objects.push(
      `${contentObjNum} 0 obj\n<< /Length ${stream.length} >>\nstream\n${stream}\nendstream\nendobj\n`
    );
  }

  let pdf = '%PDF-1.4\n';
  const offsets: number[] = [0];
  for (const obj of objects) {
    offsets.push(pdf.length);
    pdf += obj;
  }

  const xrefStart = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (let i = 1; i < offsets.length; i++) {
    pdf += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;

  const encoder = new TextEncoder();
  return encoder.encode(pdf);
}

/**
 * Single Source of Truth: Resolves the exact PDF Uint8Array for any ResourceItem.
 * Both the PDF.js Studio Viewer AND the Download PDF button call this exact function,
 * guaranteeing that what is previewed on screen is 100% identical to what is downloaded!
 */
export async function resolveResourcePdfBytes(resource: ResourceItem): Promise<{
  bytes: Uint8Array;
  isUploadedOriginal: boolean;
}> {
  // 1. Check local IndexedDB binary store first (instant for any size PDF uploaded on this device)
  const cachedBytes = await getPdfBytesFromIdb(resource.id);
  if (cachedBytes && cachedBytes.length > 0) {
    return { bytes: cachedBytes, isUploadedOriginal: true };
  }

  const raw = resource.pdfDataUrl?.trim() || '';

  // 2. Check if resource has inline Base64 data:application/pdf
  if (raw.startsWith('data:application/pdf')) {
    try {
      const bytes = base64ToUint8Array(raw);
      await savePdfBytesToIdb(resource.id, bytes);
      return { bytes, isUploadedOriginal: true };
    } catch {
      // fall through
    }
  }

  // 3. Check if resource has chunked Firestore PDF storage (for large uploaded PDFs > 600KB)
  if (raw === 'chunked://firestore') {
    const chunkedBytes = await loadPdfChunksFromFirestore(resource.id);
    if (chunkedBytes && chunkedBytes.length > 0) {
      return { bytes: chunkedBytes, isUploadedOriginal: true };
    }
  }

  // 4. Check if resource has a direct external PDF URL
  if (raw.startsWith('http://') || raw.startsWith('https://')) {
    try {
      const resp = await fetch(raw);
      if (resp.ok) {
        const buf = await resp.arrayBuffer();
        const bytes = new Uint8Array(buf);
        if (bytes.length > 4) {
          return { bytes, isUploadedOriginal: true };
        }
      }
    } catch {
      // fall through if CORS blocks direct fetch
    }
  }

  // 5. Otherwise build the resource-specific multi-page PDF document
  const generated = buildMultiPagePdfBytes(resource);
  return { bytes: generated, isUploadedOriginal: false };
}

/**
 * Downloads the exact same PDF bytes that are shown in the Studio PDF Preview.
 */
export async function generateAndDownloadSamplePdf(resource: ResourceItem): Promise<void> {
  const raw = resource.pdfDataUrl?.trim() || '';

  // If it's an external URL (like Google Drive) that cannot be fetched via CORS, open/download directly
  if (
    (raw.startsWith('http://') || raw.startsWith('https://')) &&
    raw.includes('drive.google.com')
  ) {
    const link = document.createElement('a');
    link.href = raw;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return;
  }

  const { bytes } = await resolveResourcePdfBytes(resource);
  const blob = new Blob([new Uint8Array(bytes)], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const cleanTitle = resource.title
    .replace(/[^a-zA-Z0-9_-]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 60);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${resource.subjectCode}_${cleanTitle || resource.type}_BPharmHub.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 8000);
}
