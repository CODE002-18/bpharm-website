import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  X,
  Download,
  ChevronUp,
  ChevronDown,
  Minus,
  Plus,
  ArrowUpDown,
  Maximize2,
  Loader2,
  Layers,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import * as pdfjsLib from 'pdfjs-dist';
import { ResourceItem } from '../types';
import {
  resolveResourcePdfBytes,
  generateAndDownloadSamplePdf,
} from '../utils/pdfGenerator';
import { SupportDownloadModal } from './SupportDownloadModal';

// Configure PDF.js worker using standard ESM URL resolution
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

interface PdfPreviewModalProps {
  resource: ResourceItem | null;
  onClose: () => void;
  onRecordDownload: (resource: ResourceItem) => void;
}

/**
 * Single rendered canvas page for a PDF document using PDF.js
 */
const PdfJsCanvasPage: React.FC<{
  pdfDoc: pdfjsLib.PDFDocumentProxy;
  pageNum: number;
  scale: number;
  className?: string;
}> = ({ pdfDoc, pageNum, scale, className }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    let cancelled = false;
    let renderTask: pdfjsLib.RenderTask | null = null;

    pdfDoc
      .getPage(pageNum)
      .then((page) => {
        if (cancelled || !canvasRef.current) return;
        const viewport = page.getViewport({ scale });
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        if (!context) return;

        const outputScale = window.devicePixelRatio || 1;
        canvas.width = Math.floor(viewport.width * outputScale);
        canvas.height = Math.floor(viewport.height * outputScale);
        canvas.style.width = `${Math.floor(viewport.width)}px`;
        canvas.style.height = `${Math.floor(viewport.height)}px`;

        const transform =
          outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : undefined;

        renderTask = page.render({
          canvasContext: context,
          transform,
          viewport,
          canvas,
        });
      })
      .catch(() => {
        // Ignore cancelled render tasks
      });

    return () => {
      cancelled = true;
      if (renderTask) {
        try {
          renderTask.cancel();
        } catch {
          // ignore
        }
      }
    };
  }, [pdfDoc, pageNum, scale]);

  return <canvas ref={canvasRef} className={className || 'max-w-full h-auto block bg-white'} />;
};

/**
 * Core Studio PDF Reader (Left Thumbnail Sidebar + Center Multi-Page Canvas + Floating Dark Pill Toolbar)
 * Optimized for both desktop and mobile phone screens!
 */
const StudioPdfViewer: React.FC<{
  resource: ResourceItem;
  heightClass?: string;
  onDownload: () => void;
  onOpenFullscreen?: () => void;
}> = ({ resource, heightClass = 'h-[78vh] min-h-[500px]', onDownload, onOpenFullscreen }) => {
  // Mobile check and responsive container measurement
  const [containerWidth, setContainerWidth] = useState<number>(() => {
    return typeof window !== 'undefined' ? window.innerWidth : 800;
  });

  const isMobile = containerWidth < 768;

  // Collapse sidebar by default on mobile phones so PDF gets full screen width immediately
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    return typeof window !== 'undefined' ? window.innerWidth >= 768 : true;
  });

  const [activePage, setActivePage] = useState(1);
  const [pageInput, setPageInput] = useState('1');
  const [zoom, setZoom] = useState(100);
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [pdfNumPages, setPdfNumPages] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const mainScrollRef = useRef<HTMLDivElement | null>(null);
  const pageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const thumbRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Dynamically measure container width to auto-fit A4 page width perfectly on mobile
  useEffect(() => {
    const handleResize = () => {
      if (mainScrollRef.current) {
        setContainerWidth(mainScrollRef.current.clientWidth);
      } else if (typeof window !== 'undefined') {
        setContainerWidth(window.innerWidth);
      }
    };
    handleResize();

    let ro: ResizeObserver | null = null;
    if (mainScrollRef.current && typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver((entries) => {
        for (const entry of entries) {
          if (entry.contentRect.width > 0) {
            setContainerWidth(entry.contentRect.width);
          }
        }
      });
      ro.observe(mainScrollRef.current);
    }

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      if (ro) ro.disconnect();
    };
  }, []);

  // Compute base fit-to-width scale (Standard A4 width is 595.28 pt)
  const baseScale = useMemo(() => {
    if (!containerWidth || containerWidth <= 0) {
      return typeof window !== 'undefined' && window.innerWidth < 640 ? 0.58 : 1.15;
    }
    const padding = containerWidth < 640 ? 16 : 48;
    const availableWidth = Math.max(260, containerWidth - padding);
    const fit = availableWidth / 595.28;
    return Math.min(1.35, Math.max(0.44, fit));
  }, [containerWidth]);

  // Check if external Google Drive link
  const driveEmbedUrl = React.useMemo(() => {
    const raw = resource.pdfDataUrl?.trim() || '';
    const match = raw.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (match) return `https://drive.google.com/file/d/${match[1]}/preview`;
    const openMatch = raw.match(/drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/);
    if (openMatch) return `https://drive.google.com/file/d/${openMatch[1]}/preview`;
    return null;
  }, [resource.pdfDataUrl]);

  // Load the exact PDF bytes for this specific resource (uploaded PDF or resource-specific PDF)
  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setPdfDoc(null);
    setActivePage(1);
    setPageInput('1');

    if (driveEmbedUrl) {
      setIsLoading(false);
      return;
    }

    resolveResourcePdfBytes(resource)
      .then(({ bytes }) => {
        if (cancelled) return;
        // Pass a fresh copy of Uint8Array because PDF.js transfers the ArrayBuffer to its worker
        const copy = new Uint8Array(bytes);
        const loadingTask = pdfjsLib.getDocument({ data: copy });
        return loadingTask.promise;
      })
      .then((doc) => {
        if (cancelled || !doc) return;
        setPdfDoc(doc);
        setPdfNumPages(doc.numPages);
        setIsLoading(false);
      })
      .catch((err) => {
        console.warn('PDF.js render warning:', err);
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [resource, driveEmbedUrl]);

  const totalPages = pdfNumPages || 1;

  const scrollToPage = (targetPage: number) => {
    const clamped = Math.max(1, Math.min(totalPages, targetPage));
    setActivePage(clamped);
    setPageInput(String(clamped));
    const node = pageRefs.current[clamped - 1];
    if (node && mainScrollRef.current) {
      node.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Keep left thumbnail sidebar scrolled to the active page thumbnail
  useEffect(() => {
    if (!sidebarOpen) return;
    const thumbNode = thumbRefs.current[activePage - 1];
    if (thumbNode) {
      thumbNode.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [activePage, sidebarOpen]);

  // Update activePage when user scrolls the main canvas
  const handleMainScroll = () => {
    const container = mainScrollRef.current;
    if (!container) return;

    // If scrolled to the bottom of the container, select the last page
    if (
      container.scrollHeight > container.clientHeight &&
      container.scrollTop + container.clientHeight >= container.scrollHeight - 20
    ) {
      if (activePage !== totalPages) {
        setActivePage(totalPages);
        setPageInput(String(totalPages));
      }
      return;
    }

    const containerRect = container.getBoundingClientRect();
    const threshold = containerRect.top + containerRect.height * 0.48;

    let current = 1;
    for (let i = 0; i < totalPages; i++) {
      const el = pageRefs.current[i];
      if (el) {
        const rect = el.getBoundingClientRect();
        if (rect.top <= threshold) {
          current = i + 1;
        }
      }
    }
    if (current !== activePage) {
      setActivePage(current);
      setPageInput(String(current));
    }
  };

  const handleZoomOut = () => setZoom((z) => Math.max(40, z - 15));
  const handleZoomIn = () => setZoom((z) => Math.min(180, z + 15));
  const handleFitToggle = () => setZoom((z) => (z === 100 ? 75 : 100));

  if (driveEmbedUrl) {
    return (
      <div className={`relative flex w-full overflow-hidden bg-[#EFF2F6] ${heightClass}`}>
        <iframe
          src={driveEmbedUrl}
          title={resource.title}
          className="h-full w-full border-0 bg-white"
          allow="autoplay"
        />
      </div>
    );
  }

  return (
    <div className={`relative flex w-full overflow-hidden bg-[#EFF2F6] select-none ${heightClass}`}>
      {/* MOBILE BACKDROP WHEN THUMBNAIL DRAWER IS OPEN */}
      {sidebarOpen && isMobile && (
        <div
          className="absolute inset-0 z-30 bg-black/50 backdrop-blur-xs transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* LEFT THUMBNAIL SIDEBAR (SLIDE-OUT DRAWER ON MOBILE, SPLIT COLUMN ON DESKTOP) */}
      <AnimatePresence initial={false}>
        {sidebarOpen && (
          <motion.aside
            key="pdf-thumb-sidebar"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: isMobile ? 150 : 176, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className={`${
              isMobile
                ? 'absolute inset-y-0 left-0 z-40 shadow-2xl'
                : 'relative shrink-0'
            } h-full overflow-y-auto border-r border-[#D6DAE1] bg-[#F2F4F7] py-4 px-3 space-y-4`}
          >
            {isMobile && (
              <div className="flex items-center justify-between pb-2 border-b border-[#D6DAE1] text-[11px] font-semibold text-[#5F6368]">
                <span>Pages ({totalPages})</span>
                <button
                  type="button"
                  onClick={() => setSidebarOpen(false)}
                  className="rounded-full p-1 hover:bg-[#E4E7EC] text-slate-600"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
            {pdfDoc &&
              Array.from({ length: totalPages }).map((_, idx) => {
                const pNum = idx + 1;
                const isSelected = activePage === pNum;
                return (
                  <button
                    key={pNum}
                    ref={(el) => {
                      thumbRefs.current[idx] = el;
                    }}
                    type="button"
                    onClick={() => {
                      scrollToPage(pNum);
                      if (isMobile) setSidebarOpen(false);
                    }}
                    className="group flex w-full flex-col items-center focus:outline-none"
                  >
                    <div
                      className={`relative w-[100px] sm:w-[114px] aspect-[1/1.414] overflow-hidden rounded-[2px] bg-white transition-all flex items-center justify-center ${
                        isSelected
                          ? 'ring-2 ring-[var(--brand-teal)] shadow-md'
                          : 'ring-1 ring-black/15 shadow-xs group-hover:ring-[var(--brand-teal)]/60'
                      }`}
                    >
                      <PdfJsCanvasPage pdfDoc={pdfDoc} pageNum={pNum} scale={0.17} />
                    </div>
                    <span
                      className={`mt-1 text-xs font-medium tabular-nums ${
                        isSelected ? 'font-bold text-[var(--brand-teal)]' : 'text-[#3C4043]'
                      }`}
                    >
                      {pNum}
                    </span>
                  </button>
                );
              })}
          </motion.aside>
        )}
      </AnimatePresence>

      {/* DESKTOP VERTICAL DIVIDER HANDLE */}
      {!isMobile && (
        <div className="relative z-10 flex h-full w-3 shrink-0 items-center justify-center bg-[#E4E7EC] border-r border-[#D0D5DD]">
          <button
            type="button"
            onClick={() => setSidebarOpen((o) => !o)}
            title={sidebarOpen ? 'Hide Page Thumbnails' : 'Show Page Thumbnails'}
            aria-label="Toggle Page Thumbnails Sidebar"
            className="flex h-12 w-full items-center justify-center text-[#5F6368] hover:text-[#1F2937]"
          >
            <span className="text-[9px] leading-none">{sidebarOpen ? '◀' : '▶'}</span>
          </button>
        </div>
      )}

      {/* MAIN SCROLLABLE MULTI-PAGE DOCUMENT STAGE */}
      <div
        ref={mainScrollRef}
        onScroll={handleMainScroll}
        className="relative flex-1 overflow-x-hidden overflow-y-auto bg-[#EFF2F6] px-1.5 sm:px-8 py-3 sm:py-6 pb-20 touch-pan-y"
      >
        {isLoading || !pdfDoc ? (
          <div className="flex h-full min-h-[320px] flex-col items-center justify-center gap-2 text-xs text-[#475569]">
            <Loader2 className="h-6 w-6 animate-spin text-[var(--brand-teal)]" />
            <span>Loading PDF Document ({resource.title})...</span>
          </div>
        ) : (
          <div className="mx-auto flex flex-col items-center space-y-4 sm:space-y-7">
            {Array.from({ length: totalPages }).map((_, idx) => {
              const pNum = idx + 1;
              return (
                <div
                  key={pNum}
                  ref={(el) => {
                    pageRefs.current[idx] = el;
                  }}
                  className="flex justify-center w-full"
                >
                  <div className="overflow-hidden rounded-[2px] bg-white shadow-[0_2px_14px_rgba(0,0,0,0.14)] max-w-full">
                    <PdfJsCanvasPage
                      pdfDoc={pdfDoc}
                      pageNum={pNum}
                      scale={baseScale * (zoom / 100)}
                      className="max-w-full h-auto block bg-white"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* FLOATING BOTTOM DARK CONTROL PILL */}
      <div className="pointer-events-none absolute bottom-2 sm:bottom-4 left-0 right-0 z-20 flex justify-center px-1.5 sm:px-3">
        <div className="pointer-events-auto flex items-center gap-1 sm:gap-2.5 rounded-xl sm:rounded-md bg-[#242729]/95 px-2 sm:px-3.5 py-1 sm:py-1.5 text-white shadow-2xl backdrop-blur-md border border-white/10 max-w-[96vw] overflow-x-auto no-scrollbar">
          {/* Thumbnails toggle for both mobile and desktop */}
          <button
            type="button"
            onClick={() => setSidebarOpen((o) => !o)}
            title={sidebarOpen ? 'Hide Page Thumbnails' : 'Show Page Thumbnails'}
            className={`p-1 rounded text-white/80 hover:text-white transition-colors ${
              sidebarOpen ? 'bg-white/15 text-[var(--brand-teal)]' : ''
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
          </button>

          {/* Divider */}
          <div className="mx-0.5 h-4 w-px bg-white/20 shrink-0" />

          {/* Up / Previous Page */}
          <button
            type="button"
            onClick={() => scrollToPage(activePage - 1)}
            disabled={activePage <= 1}
            title="Previous Page"
            className="p-1 text-white/85 hover:text-white disabled:opacity-35"
          >
            <ChevronUp className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </button>

          {/* Down / Next Page */}
          <button
            type="button"
            onClick={() => scrollToPage(activePage + 1)}
            disabled={activePage >= totalPages}
            title="Next Page"
            className="p-1 text-white/85 hover:text-white disabled:opacity-35"
          >
            <ChevronDown className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </button>

          {/* Editable Page Input Box + / Total */}
          <div className="flex items-center gap-1 text-xs sm:text-sm font-medium">
            <input
              type="text"
              inputMode="numeric"
              aria-label="Current Page Number"
              value={pageInput}
              onChange={(e) => setPageInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const parsed = parseInt(pageInput, 10);
                  if (!Number.isNaN(parsed)) scrollToPage(parsed);
                }
              }}
              onBlur={() => {
                const parsed = parseInt(pageInput, 10);
                if (!Number.isNaN(parsed)) scrollToPage(parsed);
                else setPageInput(String(activePage));
              }}
              className="w-8 sm:w-12 rounded-[3px] bg-[#525659] px-1 py-0.5 text-center text-xs sm:text-sm font-medium text-white focus:outline-none focus:ring-1 focus:ring-[var(--brand-teal)]"
            />
            <span className="text-white/80">/</span>
            <span className="tabular-nums text-white/95">{totalPages}</span>
          </div>

          {/* Divider */}
          <div className="mx-0.5 h-4 w-px bg-white/20 shrink-0" />

          {/* Zoom Out Circle Button */}
          <button
            type="button"
            onClick={handleZoomOut}
            title="Zoom Out"
            className="flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full border border-white/75 text-white hover:bg-white/10"
          >
            <Minus className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
          </button>

          {/* Zoom In Circle Button */}
          <button
            type="button"
            onClick={handleZoomIn}
            title="Zoom In"
            className="flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full border border-white/75 text-white hover:bg-white/10"
          >
            <Plus className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
          </button>

          {/* Zoom Percentage Box */}
          <div className="hidden sm:block min-w-[56px] rounded-[3px] bg-[#525659] px-2 py-0.5 text-center text-xs font-medium tabular-nums text-white">
            {zoom}%
          </div>

          {/* Fit to Width / Fit to Page Toggle */}
          <button
            type="button"
            onClick={handleFitToggle}
            title="Fit Page / Width"
            className="p-1 text-white/85 hover:text-white"
          >
            <ArrowUpDown className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </button>

          {/* Optional Fullscreen Button for Inline Viewer Only */}
          {onOpenFullscreen && (
            <button
              type="button"
              onClick={onOpenFullscreen}
              title="Open Fullscreen Viewer"
              className="p-1 text-white/85 hover:text-white"
            >
              <Maximize2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Inline PDF Preview Box used on Subject Pages
 */
export const InlinePdfPreviewBox: React.FC<{
  resource: ResourceItem;
  onOpenFullPreview: (res: ResourceItem) => void;
  onRequestDownload?: (res: ResourceItem) => void;
}> = ({ resource, onOpenFullPreview, onRequestDownload }) => {
  if (resource.pdfDataUrl && resource.pdfDataUrl.trim().length > 0) {
    return (
      <div className="mt-5 overflow-hidden rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-canvas)] shadow-xs">
        <StudioPdfViewer
          resource={resource}
          heightClass="h-[440px] sm:h-[560px]"
          onDownload={() => {
            if (onRequestDownload) {
              onRequestDownload(resource);
            } else {
              void generateAndDownloadSamplePdf(resource);
            }
          }}
          onOpenFullscreen={() => onOpenFullPreview(resource)}
        />
      </div>
    );
  }

  return (
    <div className="mt-5 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-canvas)] p-4">
      <div className="mb-2 flex items-center justify-between text-[11px] text-[var(--text-muted)]">
        <span className="font-mono font-semibold text-[var(--text-secondary)]">
          STUDY SHEET SUMMARY ({resource.subjectCode})
        </span>
        <button
          type="button"
          onClick={() => onOpenFullPreview(resource)}
          className="font-semibold text-[var(--brand-teal)] hover:underline"
        >
          Open Multi-Page PDF Preview →
        </button>
      </div>
      <pre className="max-h-48 overflow-y-auto whitespace-pre-wrap font-mono text-xs leading-relaxed text-[var(--text-primary)]">
        {resource.previewContent}
      </pre>
    </div>
  );
};

/**
 * Fullscreen Modal PDF Viewer (Edge-to-edge on mobile phones for optimal study experience)
 */
export const PdfPreviewModal: React.FC<PdfPreviewModalProps> = ({
  resource,
  onClose,
  onRecordDownload,
}) => {
  const [supportModalOpen, setSupportModalOpen] = useState(false);

  const handleDownloadClick = () => {
    if (!resource) return;
    setSupportModalOpen(true);
  };

  const handleProceedDownload = () => {
    if (!resource) return;
    onRecordDownload(resource);
    void generateAndDownloadSamplePdf(resource);
  };

  return (
    <>
      <AnimatePresence>
        {resource && (
          <motion.div
            key="pdf-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-0 sm:p-4 backdrop-blur-xs"
            role="dialog"
            aria-modal="true"
            aria-labelledby="pdf-modal-title"
            onClick={onClose}
          >
            <motion.div
              key="pdf-modal-card"
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="flex h-[100dvh] sm:h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-none sm:rounded-2xl border-0 sm:border border-[var(--border-hairline)] bg-[var(--bg-surface)] shadow-2xl"
            >
              {/* Top clinical toolbar (compact on mobile) */}
              <div className="flex items-center justify-between gap-2 sm:gap-4 border-b border-[var(--border-hairline)] bg-[var(--bg-subtle)] px-3 py-2 sm:px-5 sm:py-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1 sm:gap-2 text-[11px] sm:text-xs text-[var(--text-secondary)]">
                    <span className="font-mono font-semibold text-[var(--brand-teal)]">
                      {resource.subjectCode}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>Sem {resource.semester}</span>
                    <span aria-hidden="true" className="hidden xs:inline">·</span>
                    <span className="hidden xs:inline">{resource.university}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono tabular-nums">{resource.fileSize}</span>
                  </div>
                  <h2
                    id="pdf-modal-title"
                    className="mt-0.5 truncate text-xs sm:text-base font-bold text-[var(--text-primary)] leading-tight"
                  >
                    {resource.title}
                  </h2>
                </div>

                <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={handleDownloadClick}
                    className="inline-flex items-center gap-1 sm:gap-1.5 rounded-full bg-[var(--brand-teal)] px-3 py-1.5 sm:px-4 text-xs font-semibold text-white transition-colors hover:bg-[var(--brand-teal-hover)] whitespace-nowrap shrink-0"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Download</span>
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    aria-label="Close preview"
                    className="rounded-full p-1.5 text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-canvas)] hover:text-[var(--text-primary)]"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Studio Multi-Page PDF Viewer */}
              <div className="flex-1 overflow-hidden">
                <StudioPdfViewer
                  resource={resource}
                  heightClass="h-full"
                  onDownload={handleDownloadClick}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <SupportDownloadModal
        isOpen={supportModalOpen}
        onClose={() => setSupportModalOpen(false)}
        resource={resource}
        onProceedDownload={handleProceedDownload}
      />
    </>
  );
};
