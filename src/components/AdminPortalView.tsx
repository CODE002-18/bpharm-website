import React, { useState } from 'react';
import { User } from 'firebase/auth';
import {
  ShieldCheck,
  Plus,
  Trash2,
  Edit3,
  Database,
  FileText,
  BookOpen,
  Newspaper,
  LogIn,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
import { Subject, ResourceItem, BlogPost, ResourceType } from '../types';
import { BLOG_GPAT_IMAGE } from '../data/seedData';
import {
  savePdfBytesToIdb,
  savePdfChunksToFirestore,
  uint8ArrayToBase64,
} from '../utils/pdfGenerator';

interface AdminPortalViewProps {
  user: User | null;
  isAdmin: boolean;
  onSignIn: () => Promise<void>;
  subjects: Subject[];
  resources: ResourceItem[];
  blogs: BlogPost[];
  onCreateResource: (item: Omit<ResourceItem, 'id'>, customId?: string) => Promise<string>;
  onUpdateResource: (id: string, item: Omit<ResourceItem, 'id'>) => Promise<void>;
  onDeleteResource: (id: string) => Promise<void>;
  onCreateSubject: (subj: Omit<Subject, 'id'>) => Promise<void>;
  onDeleteSubject: (id: string) => Promise<void>;
  onCreateBlog: (blog: Omit<BlogPost, 'id'>) => Promise<void>;
  onDeleteBlog: (id: string) => Promise<void>;
  onSeedDatabase: () => Promise<void>;
  isSeeding: boolean;
}

export const AdminPortalView: React.FC<AdminPortalViewProps> = ({
  user,
  isAdmin,
  onSignIn,
  subjects,
  resources,
  blogs,
  onCreateResource,
  onUpdateResource,
  onDeleteResource,
  onCreateSubject,
  onDeleteSubject,
  onCreateBlog,
  onDeleteBlog,
  onSeedDatabase,
  isSeeding,
}) => {
  const [activeTab, setActiveTab] = useState<'analytics' | 'resources' | 'subjects' | 'blogs'>('analytics');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Resource Form State
  const [editingResourceId, setEditingResourceId] = useState<string | null>(null);
  const [resTitle, setResTitle] = useState('');
  const [resSubjectSlug, setResSubjectSlug] = useState(subjects[0]?.slug || 'pharmaceutical-organic-chemistry');
  const [resType, setResType] = useState<ResourceType>('notes');
  const [resUnit, setResUnit] = useState<number>(1);
  const [resUniversity, setResUniversity] = useState<ResourceItem['university']>('AKTU');
  const [resPages, setResPages] = useState<number>(20);
  const [resFileSize, setResFileSize] = useState('1.4 MB');
  const [resSummary, setResSummary] = useState('');
  const [resPreviewContent, setResPreviewContent] = useState('');
  const [resPdfDataUrl, setResPdfDataUrl] = useState<string>('');
  const [resPdfBytes, setResPdfBytes] = useState<Uint8Array | null>(null);
  const [resPdfFileName, setResPdfFileName] = useState<string>('');
  const [resFeatured, setResFeatured] = useState(false);
  const [isUploadingPdf, setIsUploadingPdf] = useState(false);

  // Subject Form State
  const [subCode, setSubCode] = useState('');
  const [subTitle, setSubTitle] = useState('');
  const [subSemester, setSubSemester] = useState<number>(1);
  const [subCategory, setSubCategory] = useState<Subject['category']>('Pharmacology');
  const [subSummary, setSubSummary] = useState('');
  const [subUnitsCount, setSubUnitsCount] = useState<number>(5);
  const [subTrending, setSubTrending] = useState(false);

  // Blog Form State
  const [blogTitle, setBlogTitle] = useState('');
  const [blogCategory, setBlogCategory] = useState<BlogPost['category']>('GPAT & NIPER');
  const [blogReadTime, setBlogReadTime] = useState('5 min read');
  const [blogExcerpt, setBlogExcerpt] = useState('');
  const [blogContent, setBlogContent] = useState('');

  const showSuccess = (msg: string) => {
    setStatusMessage(msg);
    setErrorMessage(null);
    setTimeout(() => setStatusMessage(null), 4000);
  };

  const showError = (msg: string) => {
    setErrorMessage(msg);
    setStatusMessage(null);
  };

  const handlePdfFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      showError('Please select a valid .PDF file.');
      return;
    }
    const sizeKb = file.size / 1024;
    const formattedSize =
      sizeKb >= 1024 ? `${(sizeKb / 1024).toFixed(2)} MB` : `${Math.max(1, Math.round(sizeKb))} KB`;
    setResFileSize(formattedSize);
    setResPdfFileName(file.name);
    if (!resTitle.trim()) {
      setResTitle(file.name.replace(/\.pdf$/i, '').replace(/[_-]+/g, ' '));
    }

    const reader = new FileReader();
    reader.onload = async () => {
      if (reader.result instanceof ArrayBuffer) {
        const bytes = new Uint8Array(reader.result);
        setResPdfBytes(bytes);

        // Auto-detect exact page count of the uploaded PDF using PDF.js
        try {
          const doc = await pdfjsLib.getDocument({ data: new Uint8Array(bytes) }).promise;
          if (doc.numPages > 0) {
            setResPages(doc.numPages);
          }
          showSuccess(
            `Attached Original PDF: ${file.name} (${formattedSize}, ${doc.numPages} Pages) ready to publish!`
          );
        } catch {
          showSuccess(`Attached Original PDF: ${file.name} (${formattedSize}) ready to publish!`);
        }

        if (bytes.length <= 580 * 1024) {
          setResPdfDataUrl(`data:application/pdf;base64,${uint8ArrayToBase64(bytes)}`);
        } else {
          setResPdfDataUrl('chunked://firestore');
        }
      }
    };
    reader.onerror = () => {
      showError('Could not read the selected PDF file.');
    };
    reader.readAsArrayBuffer(file);
  };

  const handleAdminSignInClick = async () => {
    setErrorMessage(null);
    try {
      await onSignIn();
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Admin login failed.');
    }
  };

  if (!user || !isAdmin) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <div className="rounded-2xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-8 shadow-xs">
          <img
            src="/logo.png"
            alt="BPharmHub Monogram"
            className="mx-auto h-14 w-14 object-contain mb-2 dark:hidden"
          />
          <img
            src="/logo-dark.png"
            alt="BPharmHub Monogram"
            className="mx-auto h-14 w-14 object-contain mb-2 hidden dark:block"
          />
          <h1 className="mt-3 text-2xl font-bold text-[var(--text-primary)]">
            BPharmHub Administration Console
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">
            Restricted Institutional Portal. Authenticate with your verified BPharmHub Administrator account to publish
            academic PDF notes, official AKTU syllabus documents, PYQs, Guess Papers, and editorial updates.
          </p>

          {errorMessage && (
            <div className="mt-4 flex items-center justify-center gap-2 rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-left text-xs font-medium text-rose-700 dark:text-rose-300">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <button
            type="button"
            onClick={handleAdminSignInClick}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-[var(--brand-teal)] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[var(--brand-teal-hover)]"
          >
            <LogIn className="h-4 w-4" />
            Authenticate as Administrator
          </button>
        </div>
      </div>
    );
  }

  const totalDownloads = resources.reduce((acc, r) => acc + (r.downloads || 0), 0);

  const handleEditResourceClick = (item: ResourceItem) => {
    setEditingResourceId(item.id);
    setResTitle(item.title);
    setResSubjectSlug(item.subjectSlug);
    setResType(item.type);
    setResUnit(item.unitNumber);
    setResUniversity(item.university);
    setResPages(item.pages);
    setResFileSize(item.fileSize);
    setResSummary(item.summary);
    setResPreviewContent(item.previewContent);
    setResPdfDataUrl(item.pdfDataUrl || '');
    setResPdfBytes(null);
    setResPdfFileName(item.pdfDataUrl ? 'Existing Uploaded PDF' : '');
    setResFeatured(item.featured);
    setActiveTab('resources');
  };

  const handleResourceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploadingPdf(true);
    try {
      const targetSubject = subjects.find((s) => s.slug === resSubjectSlug) || subjects[0];
      if (!targetSubject) {
        showError('Please select a valid subject.');
        return;
      }

      const targetId = editingResourceId || `res-${Date.now()}`;

      let finalPdfDataUrl = resPdfDataUrl.trim();
      if (resPdfBytes && resPdfBytes.length > 0) {
        // Save full original PDF binary to IndexedDB immediately for instant preview & download
        await savePdfBytesToIdb(targetId, resPdfBytes);
        if (resPdfBytes.length <= 580 * 1024) {
          finalPdfDataUrl = `data:application/pdf;base64,${uint8ArrayToBase64(resPdfBytes)}`;
        } else {
          finalPdfDataUrl = 'chunked://firestore';
        }
      }

      const fallbackSummary =
        resSummary.trim() ||
        `Official ${resType.replace('-', ' ')} PDF for ${targetSubject.code} ${targetSubject.title} (Semester ${targetSubject.semester}).`;
      const fallbackPreview =
        resPreviewContent.trim() ||
        `Uploaded PDF Document: ${resTitle.trim()}\nSubject: ${targetSubject.code} - ${targetSubject.title} (Sem ${targetSubject.semester})\nUniversity: ${resUniversity} | Pages: ${resPages} | Size: ${resFileSize}\nClick "Instant PDF Preview" or "Download PDF" to view or download the exact uploaded PDF document.`;

      const payload: Omit<ResourceItem, 'id'> = {
        title: resTitle.trim().slice(0, 180),
        subjectSlug: targetSubject.slug,
        subjectCode: targetSubject.code,
        subjectTitle: targetSubject.title,
        semester: targetSubject.semester,
        type: resType,
        unitNumber: Number(resUnit),
        university: resUniversity,
        pages: Number(resPages) || 10,
        fileSize: resFileSize.trim().slice(0, 30) || '1.2 MB',
        summary: fallbackSummary.slice(0, 600),
        previewContent: fallbackPreview.slice(0, 4000),
        ...(finalPdfDataUrl ? { pdfDataUrl: finalPdfDataUrl.slice(0, 900000) } : {}),
        featured: resFeatured,
        downloads: editingResourceId
          ? resources.find((r) => r.id === editingResourceId)?.downloads || 120
          : 1,
        authorUid: user.uid,
        createdAt: editingResourceId
          ? resources.find((r) => r.id === editingResourceId)?.createdAt || new Date().toISOString()
          : new Date().toISOString(),
      };

      if (editingResourceId) {
        await onUpdateResource(editingResourceId, payload);
      } else {
        await onCreateResource(payload, targetId);
      }

      // If large PDF (> 580 KB), also upload chunks to Firestore subcollection
      if (resPdfBytes && resPdfBytes.length > 580 * 1024) {
        try {
          await savePdfChunksToFirestore(targetId, resPdfBytes);
        } catch (chunkErr) {
          console.warn('Chunk upload warning (stored in local IndexedDB):', chunkErr);
        }
      }

      showSuccess(
        editingResourceId
          ? 'Original PDF study material updated successfully!'
          : 'Original PDF study material uploaded & published!'
      );

      setEditingResourceId(null);
      setResTitle('');
      setResSummary('');
      setResPreviewContent('');
      setResPdfDataUrl('');
      setResPdfBytes(null);
      setResPdfFileName('');
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to save PDF resource');
    } finally {
      setIsUploadingPdf(false);
    }
  };

  const handleSubjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const cleanSlug = subTitle
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
        .slice(0, 120);

      await onCreateSubject({
        code: subCode.trim().toUpperCase().slice(0, 20),
        title: subTitle.trim().slice(0, 140),
        slug: cleanSlug,
        semester: Number(subSemester),
        category: subCategory,
        summary: subSummary.trim().slice(0, 500),
        unitsCount: Number(subUnitsCount) || 5,
        trending: subTrending,
        createdAt: new Date().toISOString(),
      });
      setSubCode('');
      setSubTitle('');
      setSubSummary('');
      showSuccess('Subject added to PCI catalog.');
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to add subject');
    }
  };

  const handleBlogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const cleanSlug = blogTitle
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
        .slice(0, 140);

      await onCreateBlog({
        title: blogTitle.trim().slice(0, 180),
        slug: cleanSlug,
        category: blogCategory,
        readTime: blogReadTime.trim().slice(0, 30) || '5 min read',
        publishedDate: 'November 2026',
        excerpt: blogExcerpt.trim().slice(0, 500),
        content: blogContent.trim().slice(0, 8000),
        imageUrl: BLOG_GPAT_IMAGE,
        authorName: user.displayName || 'BPharmHub Editorial Team',
        authorUid: user.uid,
        createdAt: new Date().toISOString(),
      });
      setBlogTitle('');
      setBlogExcerpt('');
      setBlogContent('');
      showSuccess('Blog update published.');
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to publish blog post');
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--border-hairline)] pb-6">
        <div>
          <div className="text-xs text-[var(--text-secondary)]">
            <span>Authenticated as {user.email}</span>
            <span aria-hidden="true"> · </span>
            <span className="font-semibold text-[var(--brand-teal)]">
              {isAdmin ? 'Verified Admin Access' : 'Read-Only Student Account'}
            </span>
          </div>
          <h1 className="mt-1 text-2xl font-bold text-[var(--text-primary)]">
            BPharmHub Content & Analytics Console
          </h1>
        </div>

        {isAdmin && (
          <button
            type="button"
            disabled={isSeeding}
            onClick={async () => {
              await onSeedDatabase();
              showSuccess('Firestore synced with all 8 semesters of PCI sample data.');
            }}
            className="inline-flex items-center gap-2 rounded-full border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-4 py-2 text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] disabled:opacity-50"
          >
            <Database className="h-3.5 w-3.5 text-[var(--brand-teal)]" />
            {isSeeding ? 'Syncing Seed Data...' : 'Sync / Repair 8-Sem Seed Data to Firestore'}
          </button>
        )}
      </div>

      {statusMessage && (
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-xs font-medium text-emerald-700 dark:text-emerald-300">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-xs font-medium text-rose-700 dark:text-rose-300">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span className="truncate">{errorMessage}</span>
        </div>
      )}

      {/* Admin Navigation Tabs */}
      <div className="mt-6 flex flex-wrap items-center gap-2 border-b border-[var(--border-hairline)] pb-4">
        {[
          { id: 'analytics', label: 'Analytics Overview', icon: Database },
          { id: 'resources', label: `Upload & Manage Notes (${resources.length})`, icon: FileText },
          { id: 'subjects', label: `Manage Subjects (${subjects.length})`, icon: BookOpen },
          { id: 'blogs', label: `Blog & GPAT News (${blogs.length})`, icon: Newspaper },
        ].map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id as typeof activeTab)}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition-colors whitespace-nowrap ${
                activeTab === t.id
                  ? 'bg-[var(--brand-teal)] text-white'
                  : 'border border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: ANALYTICS */}
      {activeTab === 'analytics' && (
        <div className="mt-8 space-y-8">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-5">
              <div className="text-xs text-[var(--text-secondary)]">Total PCI Subjects (Sem 1–8)</div>
              <div className="mt-2 font-mono text-3xl font-bold text-[var(--text-primary)] tabular-nums">
                {subjects.length}
              </div>
              <div className="mt-1 text-xs text-[var(--text-muted)]">100% PCI Syllabus Coverage</div>
            </div>
            <div className="rounded-2xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-5">
              <div className="text-xs text-[var(--text-secondary)]">Published PDFs & Notes</div>
              <div className="mt-2 font-mono text-3xl font-bold text-[var(--brand-teal)] tabular-nums">
                {resources.length}
              </div>
              <div className="mt-1 text-xs text-[var(--text-muted)]">Notes, PYQ, Syllabus & Guess Paper</div>
            </div>
            <div className="rounded-2xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-5">
              <div className="text-xs text-[var(--text-secondary)]">Cumulative PDF Downloads</div>
              <div className="mt-2 font-mono text-3xl font-bold text-[var(--text-primary)] tabular-nums">
                {totalDownloads.toLocaleString()}
              </div>
              <div className="mt-1 text-xs text-[var(--text-muted)]">Across All AKTU B.Pharm Colleges</div>
            </div>
            <div className="rounded-2xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-5">
              <div className="text-xs text-[var(--text-secondary)]">Published GPAT & Career Posts</div>
              <div className="mt-2 font-mono text-3xl font-bold text-[var(--text-primary)] tabular-nums">
                {blogs.length}
              </div>
              <div className="mt-1 text-xs text-[var(--text-muted)]">Editorial Articles Live</div>
            </div>
          </div>

          <div className="rounded-2xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-6">
            <h2 className="text-base font-bold text-[var(--text-primary)]">
              Semester-Wise Material & Download Breakdown
            </h2>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[var(--border-hairline)] text-[var(--text-secondary)]">
                    <th className="py-2.5 pr-4">Semester</th>
                    <th className="py-2.5 px-4">Subjects</th>
                    <th className="py-2.5 px-4">Uploaded PDFs</th>
                    <th className="py-2.5 pl-4 text-right">Total Downloads</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-hairline)] font-mono tabular-nums">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => {
                    const semSubj = subjects.filter((s) => s.semester === sem).length;
                    const semRes = resources.filter((r) => r.semester === sem);
                    const semDl = semRes.reduce((a, b) => a + b.downloads, 0);
                    return (
                      <tr key={sem}>
                        <td className="py-3 pr-4 font-sans font-semibold text-[var(--text-primary)]">
                          Semester {sem}
                        </td>
                        <td className="py-3 px-4 text-[var(--text-secondary)]">{semSubj} Subjects</td>
                        <td className="py-3 px-4 text-[var(--text-secondary)]">{semRes.length} Files</td>
                        <td className="py-3 pl-4 text-right font-semibold text-[var(--brand-teal)]">
                          {semDl.toLocaleString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MANAGE RESOURCES */}
      {activeTab === 'resources' && (
        <div className="mt-8 grid gap-8 lg:grid-cols-12 items-start">
          <form
            onSubmit={handleResourceSubmit}
            className="lg:col-span-5 rounded-2xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-6 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-[var(--text-primary)]">
                {editingResourceId ? 'Edit Study Material' : 'Upload New Note / PYQ'}
              </h2>
              {editingResourceId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingResourceId(null);
                    setResTitle('');
                    setResSummary('');
                    setResPreviewContent('');
                  }}
                  className="text-xs text-[var(--accent-coral)] hover:underline"
                >
                  Cancel Edit
                </button>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)]">Document Title *</label>
              <input
                type="text"
                required
                minLength={3}
                maxLength={180}
                value={resTitle}
                onChange={(e) => setResTitle(e.target.value)}
                placeholder="e.g. Unit 3: Stereochemistry & Heterocyclic Rings Notes"
                className="mt-1 w-full rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-canvas)] px-3.5 py-2 text-xs text-[var(--text-primary)]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)]">Subject *</label>
                <select
                  value={resSubjectSlug}
                  onChange={(e) => setResSubjectSlug(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-canvas)] px-3 py-2 text-xs text-[var(--text-primary)]"
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.slug}>
                      Sem {s.semester} · {s.code} - {s.title}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)]">Resource Type *</label>
                <select
                  value={resType}
                  onChange={(e) => setResType(e.target.value as ResourceType)}
                  className="mt-1 w-full rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-canvas)] px-3 py-2 text-xs text-[var(--text-primary)]"
                >
                  <option value="notes">Unit Notes</option>
                  <option value="syllabus">Official Syllabus</option>
                  <option value="pyqs">PYQ</option>
                  <option value="important-questions">Guess Paper</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)]">Unit (0=All)</label>
                <input
                  type="number"
                  min={0}
                  max={5}
                  value={resUnit}
                  onChange={(e) => setResUnit(Number(e.target.value))}
                  className="mt-1 w-full rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-canvas)] px-3 py-2 font-mono text-xs text-[var(--text-primary)]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)]">University</label>
                <select
                  value={resUniversity}
                  onChange={(e) => setResUniversity(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-canvas)] px-2.5 py-2 text-xs text-[var(--text-primary)]"
                >
                  <option value="AKTU">AKTU (Dr. A.P.J. Abdul Kalam Tech Univ)</option>
                  <option value="AKTU (PCI Syllabus)">AKTU (PCI Syllabus)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)]">Pages</label>
                <input
                  type="number"
                  min={1}
                  max={500}
                  value={resPages}
                  onChange={(e) => setResPages(Number(e.target.value))}
                  className="mt-1 w-full rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-canvas)] px-3 py-2 font-mono text-xs text-[var(--text-primary)]"
                />
              </div>
            </div>

            <div className="rounded-xl border-2 border-dashed border-[var(--brand-teal)]/50 bg-[var(--bg-subtle)] p-4">
              <label className="block text-xs font-bold text-[var(--brand-teal)]">
                1. Upload Original PDF File (.pdf) *
              </label>
              <p className="mt-0.5 text-[11px] text-[var(--text-secondary)]">
                Select any PDF from your device (auto-detects pages &amp; stores the exact original PDF for preview and download).
              </p>
              <input
                type="file"
                accept="application/pdf,.pdf"
                onChange={handlePdfFileSelect}
                className="mt-2.5 block w-full text-xs text-[var(--text-secondary)] file:mr-3 file:rounded-full file:border-0 file:bg-[var(--brand-teal)] file:px-4 file:py-1.5 file:text-xs file:font-semibold file:text-white hover:file:bg-[var(--brand-teal-hover)]"
              />
              {resPdfFileName && (
                <div className="mt-2 flex items-center justify-between rounded-lg bg-[var(--bg-surface)] px-3 py-1.5 text-xs text-[var(--brand-teal)] font-medium">
                  <span className="truncate">
                    Attached: {resPdfFileName} ({resFileSize}, {resPages} Pages)
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setResPdfDataUrl('');
                      setResPdfBytes(null);
                      setResPdfFileName('');
                    }}
                    className="ml-2 text-rose-600 hover:underline shrink-0"
                  >
                    Remove
                  </button>
                </div>
              )}

              <div className="mt-3">
                <label className="block text-[11px] font-medium text-[var(--text-secondary)]">
                  Or Direct PDF / Google Drive Link (Optional):
                </label>
                <input
                  type="url"
                  value={
                    resPdfDataUrl.startsWith('data:') || resPdfDataUrl === 'chunked://firestore'
                      ? ''
                      : resPdfDataUrl
                  }
                  onChange={(e) => {
                    setResPdfDataUrl(e.target.value);
                    setResPdfBytes(null);
                    setResPdfFileName(e.target.value ? 'External PDF URL' : '');
                  }}
                  placeholder="https://example.com/sem3-organic-chem-notes.pdf"
                  className="mt-1 w-full rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-3 py-1.5 font-mono text-xs text-[var(--text-primary)]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)]">Short Summary (Optional)</label>
              <textarea
                rows={2}
                maxLength={600}
                value={resSummary}
                onChange={(e) => setResSummary(e.target.value)}
                placeholder="Brief overview of topics covered in this PDF (auto-filled if left blank)..."
                className="mt-1 w-full rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-canvas)] p-3 text-xs text-[var(--text-primary)]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)]">
                Quick Text Preview / Notes Extract (Optional)
              </label>
              <textarea
                rows={3}
                maxLength={4000}
                value={resPreviewContent}
                onChange={(e) => setResPreviewContent(e.target.value)}
                placeholder="Optional key points or syllabus topics for instant text preview..."
                className="mt-1 w-full rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-canvas)] p-3 font-mono text-xs text-[var(--text-primary)]"
              />
            </div>


            <button
              type="submit"
              disabled={!isAdmin || isUploadingPdf}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[var(--brand-teal)] px-5 py-2.5 text-xs font-semibold text-white hover:bg-[var(--brand-teal-hover)] disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              {isUploadingPdf
                ? 'Uploading Original PDF...'
                : editingResourceId
                ? 'Save Changes'
                : 'Publish Study Material'}
            </button>
          </form>

          <div className="lg:col-span-7 space-y-3">
            {resources.map((item) => (
              <div
                key={item.id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-4"
              >
                <div className="min-w-0 flex-1">
                  <div className="text-xs text-[var(--text-secondary)]">
                    <span className="font-mono font-semibold text-[var(--brand-teal)]">{item.subjectCode}</span>
                    <span>
                      {' '}
                      · Sem {item.semester} ·{' '}
                      {item.type === 'important-questions'
                        ? 'Guess Paper'
                        : item.type === 'pyqs'
                        ? 'PYQ'
                        : item.type}{' '}
                      · {item.university}
                    </span>
                  </div>
                  <h3 className="mt-1 truncate text-sm font-semibold text-[var(--text-primary)]">{item.title}</h3>
                </div>
                {isAdmin && (
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleEditResourceClick(item)}
                      className="inline-flex items-center gap-1 rounded-lg border border-[var(--border-hairline)] px-2.5 py-1.5 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    >
                      <Edit3 className="h-3.5 w-3.5" /> Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteResource(item.id)}
                      className="inline-flex items-center gap-1 rounded-lg border border-rose-500/30 px-2.5 py-1.5 text-xs text-rose-600 hover:bg-rose-500/10"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Delete
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: MANAGE SUBJECTS */}
      {activeTab === 'subjects' && (
        <div className="mt-8 grid gap-8 lg:grid-cols-12 items-start">
          <form
            onSubmit={handleSubjectSubmit}
            className="lg:col-span-5 rounded-2xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-6 space-y-4"
          >
            <h2 className="text-base font-bold text-[var(--text-primary)]">Add PCI Subject</h2>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)]">PCI Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. BP305T"
                  value={subCode}
                  onChange={(e) => setSubCode(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-canvas)] px-3 py-2 font-mono text-xs text-[var(--text-primary)]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)]">Semester (1–8) *</label>
                <select
                  value={subSemester}
                  onChange={(e) => setSubSemester(Number(e.target.value))}
                  className="mt-1 w-full rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-canvas)] px-3 py-2 text-xs text-[var(--text-primary)]"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                    <option key={s} value={s}>
                      Semester {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)]">Subject Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Cosmetic Science"
                value={subTitle}
                onChange={(e) => setSubTitle(e.target.value)}
                className="mt-1 w-full rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-canvas)] px-3.5 py-2 text-xs text-[var(--text-primary)]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)]">Department Category</label>
              <select
                value={subCategory}
                onChange={(e) => setSubCategory(e.target.value as Subject['category'])}
                className="mt-1 w-full rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-canvas)] px-3 py-2 text-xs text-[var(--text-primary)]"
              >
                <option value="Pharmacology">Pharmacology</option>
                <option value="Pharmaceutics">Pharmaceutics</option>
                <option value="Medicinal Chemistry">Medicinal Chemistry</option>
                <option value="Pharmaceutical Analysis">Pharmaceutical Analysis</option>
                <option value="Pharmacognosy">Pharmacognosy</option>
                <option value="Core & Allied">Core & Allied</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)]">Syllabus Overview *</label>
              <textarea
                rows={3}
                required
                value={subSummary}
                onChange={(e) => setSubSummary(e.target.value)}
                placeholder="Key units and topics..."
                className="mt-1 w-full rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-canvas)] p-3 text-xs text-[var(--text-primary)]"
              />
            </div>


            <button
              type="submit"
              disabled={!isAdmin}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[var(--brand-teal)] px-5 py-2.5 text-xs font-semibold text-white hover:bg-[var(--brand-teal-hover)] disabled:opacity-50"
            >
              <Plus className="h-4 w-4" /> Add Subject
            </button>
          </form>

          <div className="lg:col-span-7 space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
            {subjects.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between gap-4 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-3.5"
              >
                <div>
                  <div className="text-xs text-[var(--text-secondary)]">
                    <span className="font-mono font-bold text-[var(--brand-teal)]">{s.code}</span>
                    <span> · Semester {s.semester} · {s.category}</span>
                  </div>
                  <div className="text-sm font-semibold text-[var(--text-primary)]">{s.title}</div>
                </div>
                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => onDeleteSubject(s.id)}
                    className="rounded-lg border border-rose-500/30 p-2 text-rose-600 hover:bg-rose-500/10"
                    aria-label={`Delete ${s.title}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: MANAGE BLOGS */}
      {activeTab === 'blogs' && (
        <div className="mt-8 grid gap-8 lg:grid-cols-12 items-start">
          <form
            onSubmit={handleBlogSubmit}
            className="lg:col-span-5 rounded-2xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-6 space-y-4"
          >
            <h2 className="text-base font-bold text-[var(--text-primary)]">Publish GPAT / Exam Article</h2>
            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)]">Article Headline *</label>
              <input
                type="text"
                required
                minLength={5}
                value={blogTitle}
                onChange={(e) => setBlogTitle(e.target.value)}
                placeholder="e.g. NBEMS GPAT 2027 Registration Dates & Checklist"
                className="mt-1 w-full rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-canvas)] px-3.5 py-2 text-xs text-[var(--text-primary)]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)]">Category</label>
                <select
                  value={blogCategory}
                  onChange={(e) => setBlogCategory(e.target.value as BlogPost['category'])}
                  className="mt-1 w-full rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-canvas)] px-3 py-2 text-xs text-[var(--text-primary)]"
                >
                  <option value="GPAT & NIPER">GPAT & NIPER</option>
                  <option value="Exam Alerts">Exam Alerts</option>
                  <option value="Career Guidance">Career Guidance</option>
                  <option value="D.Pharm to B.Pharm">D.Pharm to B.Pharm</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)]">Read Time</label>
                <input
                  type="text"
                  value={blogReadTime}
                  onChange={(e) => setBlogReadTime(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-canvas)] px-3 py-2 text-xs text-[var(--text-primary)]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)]">Short Excerpt *</label>
              <textarea
                rows={2}
                required
                minLength={10}
                value={blogExcerpt}
                onChange={(e) => setBlogExcerpt(e.target.value)}
                className="mt-1 w-full rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-canvas)] p-3 text-xs text-[var(--text-primary)]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)]">Full Article Body *</label>
              <textarea
                rows={6}
                required
                minLength={20}
                value={blogContent}
                onChange={(e) => setBlogContent(e.target.value)}
                className="mt-1 w-full rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-canvas)] p-3 text-xs text-[var(--text-primary)]"
              />
            </div>

            <button
              type="submit"
              disabled={!isAdmin}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[var(--brand-teal)] px-5 py-2.5 text-xs font-semibold text-white hover:bg-[var(--brand-teal-hover)] disabled:opacity-50"
            >
              <Plus className="h-4 w-4" /> Publish Article
            </button>
          </form>

          <div className="lg:col-span-7 space-y-3">
            {blogs.map((b) => (
              <div
                key={b.id}
                className="flex items-center justify-between gap-4 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-4"
              >
                <div className="min-w-0 flex-1">
                  <div className="text-xs text-[var(--text-secondary)]">
                    <span>{b.category}</span>
                    <span> · {b.publishedDate} · {b.readTime}</span>
                  </div>
                  <div className="mt-1 truncate text-sm font-semibold text-[var(--text-primary)]">{b.title}</div>
                </div>
                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => onDeleteBlog(b.id)}
                    className="rounded-lg border border-rose-500/30 p-2 text-rose-600 hover:bg-rose-500/10"
                    aria-label={`Delete ${b.title}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
