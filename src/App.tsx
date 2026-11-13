/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { motion, AnimatePresence } from 'motion/react';
import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  deleteDoc,
  updateDoc,
  writeBatch,
} from 'firebase/firestore';
import {
  Search,
  BookOpen,
  Download,
  Sun,
  Moon,
  Calculator,
  Newspaper,
  Home,
  ChevronRight,
  Clock,
  FlaskConical,
  Eye,
  LogOut,
  UserCheck,
} from 'lucide-react';
import {
  auth,
  db,
  signInWithGoogle,
  logOutUser,
  handleFirestoreError,
  OperationType,
  ADMIN_EMAIL,
} from './firebase';
import {
  Subject,
  ResourceItem,
  BlogPost,
  ResourceType,
  RecentlyViewedItem,
} from './types';
import {
  INITIAL_SUBJECTS,
  INITIAL_RESOURCES,
  INITIAL_BLOG_POSTS,
  HERO_LAB_IMAGE,
} from './data/seedData';
import { PdfPreviewModal, InlinePdfPreviewBox } from './components/PdfPreviewModal';
import { SupportDownloadModal } from './components/SupportDownloadModal';
import { StudyToolsView } from './components/StudyToolsView';
import { AdminPortalView } from './components/AdminPortalView';
import { StaticLegalPages, StaticPageType } from './components/StaticLegalPages';
import { generateAndDownloadSamplePdf } from './utils/pdfGenerator';

export default function App() {
  // 1. Theme State (Light / Dark Lab Mode)
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem('bpharmhub_theme') === 'dark';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      localStorage.setItem('bpharmhub_theme', darkMode ? 'dark' : 'light');
    } catch {
      // ignore storage quota errors
    }
  }, [darkMode]);

  // 2. Clean URL Router State
  const [currentPath, setCurrentPath] = useState<string>(() => window.location.pathname || '/');

  const navigate = useCallback((to: string) => {
    window.history.pushState({}, '', to);
    setCurrentPath(to);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    const handlePopState = () => setCurrentPath(window.location.pathname || '/');
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // 3. Auth & Cloud / Local Data State
  const [user, setUser] = useState<User | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>(INITIAL_SUBJECTS);
  const [resources, setResources] = useState<ResourceItem[]>(INITIAL_RESOURCES);
  const [blogs, setBlogs] = useState<BlogPost[]>(INITIAL_BLOG_POSTS);

  const [recentlyViewed, setRecentlyViewed] = useState<RecentlyViewedItem[]>(() => {
    try {
      const raw = localStorage.getItem('bpharmhub_recent');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const [isSeeding, setIsSeeding] = useState(false);

  // Track Auth State — strictly allow only ADMIN_EMAIL
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser && currentUser.email?.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
        logOutUser();
        setUser(null);
        return;
      }
      setUser(currentUser);
    });
    return () => unsub();
  }, []);

  const isAdmin = Boolean(
    user && user.emailVerified && user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()
  );

  // Real-time Firestore Listeners for Subjects, Resources, Blogs
  useEffect(() => {
    const unsubSubjects = onSnapshot(
      collection(db, 'subjects'),
      (snap) => {
        if (!snap.empty) {
          const loaded: Subject[] = snap.docs.map((d) => ({
            id: d.id,
            ...(d.data() as Omit<Subject, 'id'>),
          }));
          loaded.sort((a, b) => a.semester - b.semester || a.code.localeCompare(b.code));
          setSubjects(loaded);
        }
      },
      (err) => {
        console.warn('Using fallback subjects catalog:', err.message);
      }
    );

    const unsubResources = onSnapshot(
      collection(db, 'resources'),
      (snap) => {
        if (!snap.empty) {
          const loaded: ResourceItem[] = snap.docs.map((d) => ({
            id: d.id,
            ...(d.data() as Omit<ResourceItem, 'id'>),
          }));
          loaded.sort((a, b) => b.downloads - a.downloads);
          setResources(loaded);
        }
      },
      (err) => {
        console.warn('Using fallback resources catalog:', err.message);
      }
    );

    const unsubBlogs = onSnapshot(
      collection(db, 'blogs'),
      (snap) => {
        if (!snap.empty) {
          const loaded: BlogPost[] = snap.docs.map((d) => ({
            id: d.id,
            ...(d.data() as Omit<BlogPost, 'id'>),
          }));
          setBlogs(loaded);
        }
      },
      (err) => {
        console.warn('Using fallback blog posts:', err.message);
      }
    );

    return () => {
      unsubSubjects();
      unsubResources();
      unsubBlogs();
    };
  }, []);

  // 4. PDF Preview & Recently Viewed State
  const [previewResource, setPreviewResource] = useState<ResourceItem | null>(null);
  const [supportDownloadResource, setSupportDownloadResource] = useState<ResourceItem | null>(null);

  const handleOpenPreview = (resource: ResourceItem) => {
    setPreviewResource(resource);
    const entry: RecentlyViewedItem = {
      resourceId: resource.id,
      title: resource.title,
      subjectTitle: resource.subjectTitle,
      subjectSlug: resource.subjectSlug,
      semester: resource.semester,
      type: resource.type,
      viewedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    const nextRecent = [entry, ...recentlyViewed.filter((r) => r.resourceId !== resource.id)].slice(0, 6);
    setRecentlyViewed(nextRecent);
    try {
      localStorage.setItem('bpharmhub_recent', JSON.stringify(nextRecent));
    } catch {
      // ignore
    }
  };

  const getSubjectTabResource = useCallback(
    (subject: Subject, tabType: ResourceType): ResourceItem => {
      const existing = resources.find((r) => r.subjectSlug === subject.slug && r.type === tabType);
      if (existing) return existing;
      const typeLabelUpper =
        tabType === 'important-questions'
          ? 'GUESS PAPER'
          : tabType === 'pyqs'
          ? 'PYQ'
          : tabType.replace('-', ' ').toUpperCase();
      const typeLabelClean =
        tabType === 'important-questions'
          ? 'Guess Paper'
          : tabType === 'pyqs'
          ? 'PYQ'
          : tabType.replace('-', ' ');
      return {
        id: `auto-${subject.code}-${tabType}`,
        title: `${subject.code} ${subject.title} – Official AKTU ${typeLabelUpper} PDF Pack`,
        subjectSlug: subject.slug,
        subjectCode: subject.code,
        subjectTitle: subject.title,
        semester: subject.semester,
        type: tabType,
        unitNumber: 0,
        university: 'AKTU',
        pages: tabType === 'syllabus' ? 6 : 24,
        fileSize: tabType === 'syllabus' ? '410 KB' : '1.6 MB',
        summary: `Complete AKTU & PCI-aligned ${typeLabelClean} for ${subject.title} (${subject.code}). Covers ${subject.summary}`,
        previewContent: `${subject.code}: ${subject.title.toUpperCase()} (AKTU ${typeLabelUpper})\nSemester ${subject.semester} | Department: ${subject.category} | AKTU Lucknow (PCI Regulation)\n\nCore Syllabus & Exam Coverage:\n${subject.summary}\n\nUnit-Wise Breakdown (Units 1 to ${subject.unitsCount}):\n- Unit 1: Foundational definitions, classification, and standard official pharmacopoeial principles.\n- Unit 2: Detailed mechanisms, instrumentation/formulation equations, and comparative tables.\n- Unit 3: High-yield AKTU Section B (10-mark) and Section C (7-mark) end-semester questions.\n- Unit 4 & 5: Clinical applications, quality control assays, and GPAT rapid-revision pointers.`,
        featured: false,
        downloads: 1420,
        authorUid: 'system-seed',
        createdAt: '2026-02-01T10:00:00.000Z',
      };
    },
    [resources]
  );

  const handleRecordDownload = (resource: ResourceItem) => {
    setResources((prev) =>
      prev.map((r) => (r.id === resource.id ? { ...r, downloads: (r.downloads || 0) + 1 } : r))
    );
  };

  // 5. Instant Global Search State
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Instant Search Results for Hero Dropdown
  const instantSearchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return { matchingSubjects: [], matchingResources: [] };
    const matchingSubjects = subjects
      .filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.code.toLowerCase().includes(q) ||
          s.category.toLowerCase().includes(q)
      )
      .slice(0, 4);
    const matchingResources = resources
      .filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.subjectTitle.toLowerCase().includes(q) ||
          r.subjectCode.toLowerCase().includes(q) ||
          r.summary.toLowerCase().includes(q)
      )
      .slice(0, 5);
    return { matchingSubjects, matchingResources };
  }, [searchQuery, subjects, resources]);

  // 6. Admin CRUD Handlers
  const handleSeedDatabase = async () => {
    if (!user || !isAdmin) return;
    setIsSeeding(true);
    try {
      const batch = writeBatch(db);
      for (const s of INITIAL_SUBJECTS) {
        const ref = doc(db, 'subjects', s.id);
        batch.set(ref, {
          code: s.code,
          title: s.title,
          slug: s.slug,
          semester: s.semester,
          category: s.category,
          summary: s.summary,
          unitsCount: s.unitsCount,
          trending: s.trending,
          createdAt: s.createdAt,
        });
      }
      for (const r of INITIAL_RESOURCES) {
        const ref = doc(db, 'resources', r.id);
        batch.set(ref, {
          title: r.title,
          subjectSlug: r.subjectSlug,
          subjectCode: r.subjectCode,
          subjectTitle: r.subjectTitle,
          semester: r.semester,
          type: r.type,
          unitNumber: r.unitNumber,
          university: r.university,
          pages: r.pages,
          fileSize: r.fileSize,
          summary: r.summary,
          previewContent: r.previewContent,
          featured: r.featured,
          downloads: r.downloads,
          authorUid: user.uid,
          createdAt: r.createdAt,
        });
      }
      for (const b of INITIAL_BLOG_POSTS) {
        const ref = doc(db, 'blogs', b.id);
        batch.set(ref, {
          title: b.title,
          slug: b.slug,
          category: b.category,
          readTime: b.readTime,
          publishedDate: b.publishedDate,
          excerpt: b.excerpt,
          content: b.content,
          imageUrl: b.imageUrl,
          authorName: b.authorName,
          authorUid: user.uid,
          createdAt: b.createdAt,
        });
      }
      await batch.commit();
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'seed-batch');
    } finally {
      setIsSeeding(false);
    }
  };

  const handleCreateResource = async (item: Omit<ResourceItem, 'id'>, customId?: string): Promise<string> => {
    const id = customId || `res-${Date.now()}`;
    setResources((prev) => [{ id, ...item }, ...prev]);
    try {
      await setDoc(doc(db, 'resources', id), item);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `resources/${id}`);
    }
    return id;
  };

  const handleUpdateResource = async (id: string, item: Omit<ResourceItem, 'id'>) => {
    setResources((prev) => prev.map((r) => (r.id === id ? { id, ...item } : r)));
    try {
      await updateDoc(doc(db, 'resources', id), {
        title: item.title,
        subjectSlug: item.subjectSlug,
        subjectCode: item.subjectCode,
        subjectTitle: item.subjectTitle,
        semester: item.semester,
        type: item.type,
        unitNumber: item.unitNumber,
        university: item.university,
        pages: item.pages,
        fileSize: item.fileSize,
        summary: item.summary,
        previewContent: item.previewContent,
        ...(item.pdfDataUrl ? { pdfDataUrl: item.pdfDataUrl } : {}),
        featured: item.featured,
        downloads: item.downloads,
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `resources/${id}`);
    }
  };

  const handleDeleteResource = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'resources', id));
      setResources((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `resources/${id}`);
    }
  };

  const handleCreateSubject = async (subj: Omit<Subject, 'id'>) => {
    const id = `sub-${subj.code.toLowerCase().replace(/[^a-z0-9]/g, '')}-${Date.now()}`;
    try {
      await setDoc(doc(db, 'subjects', id), subj);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `subjects/${id}`);
    }
  };

  const handleDeleteSubject = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'subjects', id));
      setSubjects((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `subjects/${id}`);
    }
  };

  const handleCreateBlog = async (blog: Omit<BlogPost, 'id'>) => {
    const id = `blog-${Date.now()}`;
    try {
      await setDoc(doc(db, 'blogs', id), blog);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `blogs/${id}`);
    }
  };

  const handleDeleteBlog = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'blogs', id));
      setBlogs((prev) => prev.filter((b) => b.id !== id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `blogs/${id}`);
    }
  };

  // 7. Parse Current Clean Route & Update Dynamic SEO Title
  const routeInfo = useMemo(() => {
    const clean = currentPath.replace(/\/+$/, '') || '/';
    // Match /sem-3/pharmaceutical-organic-chemistry/notes or /sem-3/pharmaceutical-organic-chemistry
    const subjectMatch = clean.match(/^\/sem-([1-8])\/([a-z0-9-]+)(?:\/([a-z-]+))?$/);
    if (subjectMatch) {
      const semNum = Number(subjectMatch[1]);
      const subjectSlug = subjectMatch[2];
      const tabParam = (subjectMatch[3] || 'notes') as ResourceType;
      const validTabs: ResourceType[] = ['notes', 'syllabus', 'pyqs', 'important-questions'];
      const activeTab: ResourceType = validTabs.includes(tabParam) ? tabParam : 'notes';
      return { view: 'subject' as const, semNum, subjectSlug, activeTab };
    }

    // Match /sem-1 to /sem-8
    const semMatch = clean.match(/^\/sem-([1-8])$/);
    if (semMatch) {
      return { view: 'semester' as const, semNum: Number(semMatch[1]) };
    }

    // Match /blog/:slug
    const blogPostMatch = clean.match(/^\/blog\/([a-z0-9-]+)$/);
    if (blogPostMatch) {
      return { view: 'blog-detail' as const, blogSlug: blogPostMatch[1] };
    }

    if (clean === '/resources') return { view: 'semester' as const, semNum: 1 };
    if (clean === '/tools') return { view: 'tools' as const };
    if (clean === '/blog') return { view: 'blog' as const };
    if (clean === '/admin') return { view: 'admin' as const };
    if (clean === '/about') return { view: 'static' as const, staticPage: 'about' as StaticPageType };
    if (clean === '/contact') return { view: 'static' as const, staticPage: 'contact' as StaticPageType };
    if (clean === '/privacy') return { view: 'static' as const, staticPage: 'privacy' as StaticPageType };
    if (clean === '/disclaimer') return { view: 'static' as const, staticPage: 'disclaimer' as StaticPageType };
    if (clean === '/dmca') return { view: 'static' as const, staticPage: 'dmca' as StaticPageType };

    return { view: 'home' as const };
  }, [currentPath]);

  // Dynamic per-page SEO title update
  useEffect(() => {
    if (routeInfo.view === 'semester') {
      document.title = `AKTU B.Pharm Semester ${routeInfo.semNum} Notes, Syllabus & PYQs – BPharmHub`;
    } else if (routeInfo.view === 'subject') {
      const subj = subjects.find((s) => s.slug === routeInfo.subjectSlug);
      document.title = subj
        ? `${subj.title} (${subj.code}) AKTU ${routeInfo.activeTab.toUpperCase()} – Sem ${routeInfo.semNum} | BPharmHub`
        : 'AKTU Subject Study Hub – BPharmHub';
    } else if (routeInfo.view === 'tools') {
      document.title = 'AKTU B.Pharm CGPA & Percentage Calculator (Sem 1–8) – BPharmHub';
    } else if (routeInfo.view === 'blog') {
      document.title = 'AKTU Exam Dates, GPAT 2027 & Pharmacy Career Guidance – BPharmHub';
    } else {
      document.title = 'BPharmHub – AKTU B.Pharm Notes, PYQ, Guess Paper & Study Tools (Sem 1–8)';
    }
  }, [routeInfo, subjects]);

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-canvas)] text-[var(--text-primary)] pb-16 md:pb-0">
      {/* STRICT 3-ZONE TOP BAR CONTRACT */}
      <header className="sticky top-0 z-40 flex items-center justify-between gap-8 border-b border-[var(--border-hairline)] bg-[var(--bg-surface)]/95 px-4 py-3.5 backdrop-blur-md sm:px-8">
        {/* Zone 1: Monogram + Wordmark */}
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            navigate('/');
          }}
          className="flex items-center gap-1.5 font-display text-lg font-bold tracking-tight text-[var(--brand-teal)] whitespace-nowrap shrink-0 group"
        >
          <img
            src="/logo.png"
            alt="BPharmHub Monogram"
            className="h-8 w-8 object-contain transition-transform duration-200 group-hover:scale-105 dark:hidden"
          />
          <img
            src="/logo-dark.png"
            alt="BPharmHub Monogram"
            className="h-8 w-8 object-contain transition-transform duration-200 group-hover:scale-105 hidden dark:block"
          />
          <span className="tracking-tight">BPharmHub</span>
        </a>

        {/* Zone 2: 5 concise single-line text navigation links */}
        <nav aria-label="Primary Navigation" className="hidden md:flex items-center gap-7 text-sm font-medium text-[var(--text-secondary)]">
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              navigate('/');
            }}
            className={`hover:text-[var(--text-primary)] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 ${
              routeInfo.view === 'home' ? 'text-[var(--brand-teal)] font-semibold' : ''
            }`}
          >
            Home
          </a>
          <a
            href="/sem-1"
            onClick={(e) => {
              e.preventDefault();
              navigate('/sem-1');
            }}
            className={`hover:text-[var(--text-primary)] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 ${
              routeInfo.view === 'semester' || routeInfo.view === 'subject' ? 'text-[var(--brand-teal)] font-semibold' : ''
            }`}
          >
            Resources
          </a>
          <a
            href="/tools"
            onClick={(e) => {
              e.preventDefault();
              navigate('/tools');
            }}
            className={`hover:text-[var(--text-primary)] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 ${
              routeInfo.view === 'tools' ? 'text-[var(--brand-teal)] font-semibold' : ''
            }`}
          >
            Tools
          </a>
          <a
            href="/blog"
            onClick={(e) => {
              e.preventDefault();
              navigate('/blog');
            }}
            className={`hover:text-[var(--text-primary)] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 ${
              routeInfo.view === 'blog' || routeInfo.view === 'blog-detail' ? 'text-[var(--brand-teal)] font-semibold' : ''
            }`}
          >
            Updates
          </a>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={() => navigate('/contact')}
            className="rounded-full bg-[var(--brand-teal)] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[var(--brand-teal-hover)] whitespace-nowrap shrink-0"
          >
            Contact Us
          </button>
        </div>
      </header>

      {/* Secondary Utility Ribbon (Below the Top Bar Contract for Theme Toggle, Saved Bookmarks, Quick URL Demo & Admin Login Only) */}
      <div className="border-b border-[var(--border-hairline)] bg-[var(--bg-subtle)] px-4 py-2 sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3 overflow-x-auto text-[var(--text-secondary)]">
            <span className="font-mono text-[11px] font-semibold text-[var(--brand-teal)] whitespace-nowrap">
              AKTU B.PHARM HUB (SEM 1–8 · PCI SYLLABUS)
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setDarkMode((d) => !d)}
              aria-label="Toggle dark or light lab theme"
              className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-3 py-1 text-xs font-medium text-[var(--text-primary)] transition-colors hover:border-[var(--brand-teal)] whitespace-nowrap"
            >
              {darkMode ? (
                <>
                  <Sun className="h-3.5 w-3.5 text-amber-400" />
                  <span>Light Lab</span>
                </>
              ) : (
                <>
                  <Moon className="h-3.5 w-3.5 text-[var(--brand-teal)]" />
                  <span>Dark Lab</span>
                </>
              )}
            </button>

            <span aria-hidden="true" className="text-[var(--border-hairline)]">|</span>

            {user ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => navigate('/admin')}
                  className="inline-flex items-center gap-1 font-semibold text-[var(--brand-teal)] hover:underline whitespace-nowrap"
                >
                  <UserCheck className="h-3.5 w-3.5" />
                  <span>Admin Panel</span>
                </button>
                <button
                  type="button"
                  onClick={() => logOutUser()}
                  className="inline-flex items-center gap-1 text-[var(--text-secondary)] hover:text-[var(--accent-coral)] whitespace-nowrap"
                  title="Sign out of Admin"
                >
                  <LogOut className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => navigate('/admin')}
                className="font-semibold text-[var(--brand-teal)] hover:underline whitespace-nowrap"
              >
                Admin Login
              </button>
            )}
          </div>
        </div>
      </div>

      {/* MAIN VIEWPORT CONTENT WITH PAGE TRANSITIONS */}
      <main className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPath}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* ==================== VIEW 1: HOME PAGE ==================== */}
            {routeInfo.view === 'home' && (
              <div>
                {/* Hero Section with Pharma-Lab Split & Instant Search */}
                <section className="pharma-hex-bg border-b border-[var(--border-hairline)] py-10 sm:py-16">
                  <div className="mx-auto max-w-7xl px-4 sm:px-8">
                    <div className="grid gap-10 lg:grid-cols-12 items-stretch">
                      {/* Left Column: Headline, Search & Semester Quick-Pills */}
                      <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                        className="lg:col-span-7 flex flex-col justify-center"
                      >
                        <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                          <FlaskConical className="h-4 w-4 text-[var(--brand-teal)]" />
                          <span>AKTU Lucknow & PCI Syllabus Aligned</span>
                          <span aria-hidden="true">·</span>
                          <span>Optimized for Slow Mobile Networks</span>
                        </div>

                        <h1 className="mt-3 text-3xl font-bold tracking-tight text-[var(--text-primary)] sm:text-5xl leading-[1.12]">
                          Your Complete AKTU B.Pharm Study Lab from Sem 1 to Sem 8.
                        </h1>

                        <p className="mt-4 max-w-2xl text-base leading-relaxed text-[var(--text-secondary)]">
                          One distraction-free place for AKTU unit-wise handwritten & digital notes, official PCI syllabus,
                          5-year AKTU end-semester PYQ (Section A, B & C), sessional & end-sem Guess Paper, and CGPA calculator.
                        </p>

                        {/* Instant Search Bar */}
                        <div className="relative mt-6 max-w-2xl">
                          <div className="flex items-center rounded-full border-2 border-[var(--brand-teal)] bg-[var(--bg-surface)] px-4 py-2.5 shadow-sm transition-transform focus-within:scale-[1.01]">
                            <Search className="h-5 w-5 text-[var(--brand-teal)] shrink-0" />
                            <input
                              type="search"
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              placeholder="Search subjects, codes (BP301T), Benzene, Pharmacology, PYQs..."
                              aria-label="Search across all B.Pharm notes and subjects"
                              className="ml-3 w-full bg-transparent text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none"
                            />
                            {searchQuery && (
                              <button
                                type="button"
                                onClick={() => setSearchQuery('')}
                                className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] px-2"
                              >
                                Clear
                              </button>
                            )}
                          </div>

                          {/* Instant Search Dropdown Results */}
                          <AnimatePresence>
                            {searchQuery.trim().length > 0 && (
                              <motion.div
                                initial={{ opacity: 0, y: 6, scale: 0.98 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 4, scale: 0.98 }}
                                transition={{ duration: 0.15 }}
                                className="absolute left-0 right-0 top-full z-30 mt-2 rounded-2xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-4 shadow-xl"
                              >
                                {instantSearchResults.matchingSubjects.length === 0 &&
                                instantSearchResults.matchingResources.length === 0 ? (
                                  <div className="py-4 text-center text-xs text-[var(--text-secondary)]">
                                    No direct match for "{searchQuery}". Try searching "Organic", "BP404T", or
                                    "Pharmacology".
                                  </div>
                                ) : (
                                  <div className="space-y-4">
                                    {instantSearchResults.matchingSubjects.length > 0 && (
                                      <div>
                                        <div className="text-[11px] font-mono font-semibold text-[var(--text-muted)]">
                                          PCI SUBJECTS
                                        </div>
                                        <div className="mt-1.5 divide-y divide-[var(--border-hairline)]">
                                          {instantSearchResults.matchingSubjects.map((s) => (
                                            <button
                                              key={s.id}
                                              type="button"
                                              onClick={() => {
                                                setSearchQuery('');
                                                navigate(`/sem-${s.semester}/${s.slug}/notes`);
                                              }}
                                              className="flex w-full items-center justify-between py-2 text-left text-xs hover:bg-[var(--bg-subtle)] px-2 rounded-lg"
                                            >
                                              <span>
                                                <strong className="font-mono text-[var(--brand-teal)]">{s.code}</strong>{' '}
                                                · {s.title}
                                              </span>
                                              <span className="text-[var(--text-muted)]">Sem {s.semester} →</span>
                                            </button>
                                          ))}
                                        </div>
                                      </div>
                                    )}

                                    {instantSearchResults.matchingResources.length > 0 && (
                                      <div>
                                        <div className="text-[11px] font-mono font-semibold text-[var(--text-muted)]">
                                          STUDY NOTES & PYQS
                                        </div>
                                        <div className="mt-1.5 divide-y divide-[var(--border-hairline)]">
                                          {instantSearchResults.matchingResources.map((r) => (
                                            <button
                                              key={r.id}
                                              type="button"
                                              onClick={() => {
                                                setSearchQuery('');
                                                handleOpenPreview(r);
                                              }}
                                              className="flex w-full items-center justify-between py-2 text-left text-xs hover:bg-[var(--bg-subtle)] px-2 rounded-lg"
                                            >
                                              <span className="truncate pr-3 font-medium text-[var(--text-primary)]">
                                                {r.title}
                                              </span>
                                              <span className="shrink-0 font-mono text-[var(--brand-teal)]">
                                                Preview PDF
                                              </span>
                                            </button>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>

                        {/* Semester Quick-Links (Sem 1–8 Capsule Pills) */}
                        <div className="mt-7">
                          <div className="text-xs font-medium text-[var(--text-secondary)]">
                            Jump Directly to Your Semester:
                          </div>
                          <div className="mt-2.5 flex flex-wrap gap-2">
                            {[1, 2, 3, 4, 5, 6, 7, 8].map((sem, idx) => (
                              <motion.button
                                key={sem}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.16, delay: idx * 0.025 }}
                                whileHover={{ y: -2 }}
                                whileTap={{ scale: 0.97 }}
                                type="button"
                                onClick={() => navigate(`/sem-${sem}`)}
                                className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-4 py-2 text-xs font-semibold text-[var(--text-primary)] shadow-2xs transition-colors hover:border-[var(--brand-teal)] hover:bg-[var(--brand-mint-soft)] whitespace-nowrap shrink-0"
                              >
                                <span className="font-mono text-[var(--brand-teal)]">0{sem}</span>
                                <span>Semester {sem}</span>
                              </motion.button>
                            ))}
                          </div>
                        </div>
                      </motion.div>

                      {/* Right Column: Clinical Lab Hero Visual Card */}
                      <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.22, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
                        className="lg:col-span-5 flex flex-col"
                      >
                        <div className="relative flex-1 overflow-hidden rounded-2xl border border-[var(--border-hairline)] bg-[var(--bg-subtle)] min-h-[280px] group">
                          <img
                            src={HERO_LAB_IMAGE}
                            alt="Clean pharmaceutical laboratory workbench with volumetric flasks, molecular structure model, and open B.Pharm study notebook"
                            referrerPolicy="no-referrer"
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-6 text-white">
                            <div className="text-xs font-mono text-teal-300">
                              OFFICIAL AKTU TOOL · SEM 1 TO SEM 8
                            </div>
                            <div className="mt-1 text-lg font-bold">
                              AKTU B.Pharm CGPA &amp; Percentage Calculator
                            </div>
                            <p className="mt-1 text-xs text-slate-200">
                              Calculate your credit-weighted cumulative CGPA, exact percentage using the official formula ((CGPA − 0.75) × 10), and check First Division with Honours eligibility.
                            </p>
                            <div className="mt-4 flex flex-wrap gap-2">
                              <button
                                type="button"
                                onClick={() => navigate('/tools')}
                                className="rounded-full bg-[#2EC4B6] px-5 py-2 text-xs font-bold text-[#081315] hover:bg-teal-300 transition-colors whitespace-nowrap shadow-sm"
                              >
                                Try CGPA Tools →
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    </div>

                    {/* Full-Width 4-Column Quantitative Proof Bar Below Hero */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: 0.1 }}
                      className="mt-10 grid grid-cols-2 gap-4 rounded-2xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-5 sm:grid-cols-4"
                    >
                      <div>
                        <div className="font-mono text-2xl font-bold text-[var(--brand-teal)] tabular-nums">
                          8 Semesters
                        </div>
                        <div className="mt-0.5 text-xs text-[var(--text-secondary)]">
                          34+ Core & Elective PCI Subjects
                        </div>
                      </div>
                      <div>
                        <div className="font-mono text-2xl font-bold text-[var(--text-primary)] tabular-nums">
                          4-in-1 Tabs
                        </div>
                        <div className="mt-0.5 text-xs text-[var(--text-secondary)]">
                          Notes · Syllabus · PYQ · Guess Paper
                        </div>
                      </div>
                      <div>
                        <div className="font-mono text-2xl font-bold text-[var(--text-primary)] tabular-nums">
                          &lt; 1.8 MB
                        </div>
                        <div className="mt-0.5 text-xs text-[var(--text-secondary)]">
                          Compressed PDFs for 3G/4G Mobile Networks
                        </div>
                      </div>
                      <div>
                        <div className="font-mono text-2xl font-bold text-[var(--accent-coral)] tabular-nums">
                          100% Free
                        </div>
                        <div className="mt-0.5 text-xs text-[var(--text-secondary)]">
                          No Paywalls or Mandatory Login Walls
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </section>

                {/* Recently Viewed Ribbon (Optimized for mobile phone touch-scroll & desktop grid) */}
                {recentlyViewed.length > 0 && (
                  <section className="mx-auto max-w-7xl px-4 pt-6 sm:pt-8 sm:px-8">
                    <div className="rounded-2xl border border-[var(--border-hairline)] bg-[var(--bg-subtle)] p-3.5 sm:p-5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs font-semibold text-[var(--text-primary)]">
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--brand-teal)]/10 text-[var(--brand-teal)]">
                            <Clock className="h-3.5 w-3.5" />
                          </span>
                          <span>Recently Viewed Notes &amp; Papers</span>
                          <span className="rounded-full bg-[var(--brand-teal)]/15 px-1.5 py-0.5 text-[10px] font-bold text-[var(--brand-teal)]">
                            {recentlyViewed.length}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setRecentlyViewed([]);
                            localStorage.removeItem('bpharmhub_recent');
                          }}
                          className="text-[11px] sm:text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                        >
                          Clear
                        </button>
                      </div>

                      {/* Smooth touch-scroll carousel on mobile, 2/3-column grid on desktop */}
                      <div className="mt-3 flex gap-3 overflow-x-auto pb-1.5 sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:overflow-visible no-scrollbar snap-x snap-mandatory">
                        {recentlyViewed.slice(0, 6).map((rv) => (
                          <button
                            key={rv.resourceId}
                            type="button"
                            onClick={() => {
                              const found = resources.find((r) => r.id === rv.resourceId);
                              if (found) handleOpenPreview(found);
                            }}
                            className="group flex min-w-[260px] sm:min-w-0 flex-1 flex-col justify-between rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-3.5 text-left text-xs transition-all hover:border-[var(--brand-teal)] hover:shadow-xs active:scale-[0.98] snap-start"
                          >
                            <div>
                              <div className="flex items-center gap-1.5 text-[11px] text-[var(--text-muted)]">
                                <span className="font-mono font-bold text-[var(--brand-teal)]">
                                  Sem {rv.semester}
                                </span>
                                <span aria-hidden="true">·</span>
                                <span className="truncate max-w-[150px]">{rv.subjectTitle}</span>
                              </div>
                              <div className="mt-1.5 font-semibold text-[var(--text-primary)] line-clamp-2 leading-snug group-hover:text-[var(--brand-teal)] transition-colors">
                                {rv.title}
                              </div>
                            </div>

                            <div className="mt-3 flex items-center justify-between border-t border-[var(--border-hairline)]/70 pt-2 text-[10px] text-[var(--text-muted)]">
                              <span className="inline-flex items-center gap-1">
                                <BookOpen className="h-3 w-3 text-[var(--brand-teal)]" />
                                <span>{rv.viewedAt}</span>
                              </span>
                              <span className="font-semibold text-[var(--brand-teal)] inline-flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                                Resume <ChevronRight className="h-3.5 w-3.5" />
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </section>
                )}

            {/* Why BPharmHub Feature Pillars */}
            <section className="mx-auto max-w-7xl px-4 py-12 sm:px-8">
              <div>
                <div className="text-xs font-mono text-[var(--brand-teal)]">WHY BPHARMHUB.XYZ?</div>
                <h2 className="mt-1 text-2xl font-bold text-[var(--text-primary)]">
                  Built for Real Pharmacy Classrooms, Lab Vivas &amp; Last-Minute Revisions
                </h2>
              </div>
              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-5">
                  <div className="font-semibold text-sm text-[var(--text-primary)]">
                    01. Starred (*) Drug SAR &amp; Mechanisms
                  </div>
                  <p className="mt-1.5 text-xs leading-relaxed text-[var(--text-secondary)]">
                    Every Medicinal Chemistry and Organic Chemistry note highlights the exact starred drugs and
                    named reactions asked in 10-mark university questions.
                  </p>
                </div>
                <div className="rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-5">
                  <div className="font-semibold text-sm text-[var(--text-primary)]">
                    02. Complete AKTU PYQ &amp; Section A/B/C
                  </div>
                  <p className="mt-1.5 text-xs leading-relaxed text-[var(--text-secondary)]">
                    Dedicated solved papers tailored strictly for AKTU Lucknow 75-mark theory exams: Section A (2 marks),
                    Section B (10 marks), and Section C (7 marks).
                  </p>
                </div>
                <div className="rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-5">
                  <div className="font-semibold text-sm text-[var(--text-primary)]">
                    03. High-Yield Guess Paper &amp; PYQs
                  </div>
                  <p className="mt-1.5 text-xs leading-relaxed text-[var(--text-secondary)]">
                    Curated semester-end guess papers and important questions compiled from previous 5-year exam trends
                    to maximize your sessional and semester scores.
                  </p>
                </div>
                <div className="rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-5">
                  <div className="font-semibold text-sm text-[var(--text-primary)]">
                    04. Instant Multi-Page PDF Preview
                  </div>
                  <p className="mt-1.5 text-xs leading-relaxed text-[var(--text-secondary)]">
                    View actual multi-page PDFs with thumbnail navigation and direct zoom directly in your browser
                    before downloading—100% free with zero paywalls.
                  </p>
                </div>
              </div>
            </section>


            {/* Latest Blog & Exam Updates Preview */}
            <section className="border-t border-[var(--border-hairline)] bg-[var(--bg-surface)] py-12">
              <div className="mx-auto max-w-7xl px-4 sm:px-8">
                <div className="flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <div className="text-xs text-[var(--text-secondary)]">
                      GPAT · NIPER JEE · Lateral Entry · Pharma Careers
                    </div>
                    <h2 className="mt-1 text-2xl font-bold text-[var(--text-primary)]">
                      Latest Pharmacy News & Exam Guidance
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate('/blog')}
                    className="text-xs font-semibold text-[var(--brand-teal)] hover:underline"
                  >
                    Read All Articles →
                  </button>
                </div>

                <div className="mt-6 grid gap-6 md:grid-cols-3">
                  {blogs.slice(0, 3).map((post) => (
                    <article
                      key={post.id}
                      className="flex flex-col overflow-hidden rounded-2xl border border-[var(--border-hairline)] bg-[var(--bg-canvas)]"
                    >
                      <div className="aspect-[4/3] w-full overflow-hidden bg-[var(--bg-subtle)]">
                        <img
                          src={post.imageUrl}
                          alt={post.title}
                          loading="lazy"
                          referrerPolicy="no-referrer"
                          className="h-full w-full object-cover transition-transform duration-200 hover:scale-[1.02]"
                        />
                      </div>
                      <div className="flex flex-1 flex-col justify-between p-5">
                        <div>
                          <div className="text-xs text-[var(--text-secondary)]">
                            <span>{post.category}</span>
                            <span aria-hidden="true"> · </span>
                            <span>{post.publishedDate}</span>
                            <span aria-hidden="true"> · </span>
                            <span>{post.readTime}</span>
                          </div>
                          <h3 className="mt-2 text-base font-bold text-[var(--text-primary)]">
                            <button
                              type="button"
                              onClick={() => navigate(`/blog/${post.slug}`)}
                              className="text-left hover:text-[var(--brand-teal)]"
                            >
                              {post.title}
                            </button>
                          </h3>
                          <p className="mt-2 line-clamp-3 text-xs text-[var(--text-secondary)]">{post.excerpt}</p>
                        </div>
                        <div className="mt-4 pt-3 border-t border-[var(--border-hairline)] flex items-center justify-between text-xs">
                          <span className="text-[var(--text-muted)] truncate">{post.authorName}</span>
                          <button
                            type="button"
                            onClick={() => navigate(`/blog/${post.slug}`)}
                            className="font-semibold text-[var(--brand-teal)] hover:underline shrink-0"
                          >
                            Read Guide →
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </section>
          </div>
        )}

        {/* ==================== VIEW 2: SEMESTER PAGE (/sem-1 to /sem-8) ==================== */}
        {routeInfo.view === 'semester' && (
          <div className="mx-auto max-w-7xl px-4 py-10 sm:px-8">
            {/* Breadcrumb & Semester Switcher Pills */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--border-hairline)] pb-6">
              <div>
                <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
                  <button type="button" onClick={() => navigate('/')} className="hover:underline">
                    Home
                  </button>
                  <ChevronRight className="h-3.5 w-3.5" />
                  <span className="font-semibold text-[var(--brand-teal)]">Semester {routeInfo.semNum}</span>
                </div>
                <h1 className="mt-2 text-2xl font-bold text-[var(--text-primary)] sm:text-3xl">
                  B.Pharm Semester {routeInfo.semNum} Subjects & PCI Study Material
                </h1>
                <p className="mt-1 text-sm text-[var(--text-secondary)]">
                  Select a subject below to view unit-wise Notes, official PCI Syllabus, PYQ, and Guess Paper.
                </p>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => navigate(`/sem-${s}`)}
                    className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                      routeInfo.semNum === s
                        ? 'bg-[var(--brand-teal)] text-white'
                        : 'border border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    Sem {s}
                  </button>
                ))}
              </div>
            </div>

            {/*Subjects Grid for Active Semester */}
            <div className="mt-8 grid gap-6 md:grid-cols-2">
              {subjects
                .filter((s) => s.semester === routeInfo.semNum)
                .map((subj, idx) => {
                  const subjResources = resources.filter((r) => r.subjectSlug === subj.slug);
                  return (
                    <motion.div
                      key={subj.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.18, delay: idx * 0.04 }}
                      whileHover={{ y: -3 }}
                      className="flex flex-col justify-between rounded-2xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-6 transition-colors hover:border-[var(--brand-teal)]"
                    >
                      <div>
                        <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
                          <span>
                            <strong className="font-mono text-[var(--brand-teal)]">{subj.code}</strong> ·{' '}
                            {subj.category}
                          </span>
                          <span className="font-mono tabular-nums">{subj.unitsCount} PCI Units</span>
                        </div>

                        <h2 className="mt-2 text-xl font-bold text-[var(--text-primary)]">
                          <button
                            type="button"
                            onClick={() => navigate(`/sem-${subj.semester}/${subj.slug}/notes`)}
                            className="text-left hover:text-[var(--brand-teal)]"
                          >
                            {subj.title}
                          </button>
                        </h2>

                        <p className="mt-2 text-xs leading-relaxed text-[var(--text-secondary)]">{subj.summary}</p>
                      </div>

                      <div className="mt-6 border-t border-[var(--border-hairline)] pt-4">
                        <div className="text-[11px] font-medium text-[var(--text-muted)] mb-2.5">
                          Direct Study Tabs ({subjResources.length} curated files available):
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {(
                            [
                              { id: 'notes', label: 'Unit Notes' },
                              { id: 'syllabus', label: 'Syllabus' },
                              { id: 'pyqs', label: 'PYQ' },
                              { id: 'important-questions', label: 'Guess Paper' },
                            ] as { id: ResourceType; label: string }[]
                          ).map((tab) => (
                            <button
                              key={tab.id}
                              type="button"
                              onClick={() => handleOpenPreview(getSubjectTabResource(subj, tab.id))}
                              className="rounded-full border border-[var(--border-hairline)] bg-[var(--bg-subtle)] px-3.5 py-1.5 text-xs font-semibold text-[var(--text-primary)] transition-colors hover:border-[var(--brand-teal)] hover:bg-[var(--brand-teal)] hover:text-white whitespace-nowrap"
                            >
                              {tab.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
            </div>
          </div>
        )}

        {/* ==================== VIEW 3: SUBJECT PAGE (/sem-3/pharmaceutical-organic-chemistry/notes) ==================== */}
        {routeInfo.view === 'subject' && (() => {
          const subject =
            subjects.find((s) => s.slug === routeInfo.subjectSlug) ||
            subjects.find((s) => s.semester === routeInfo.semNum) ||
            subjects[0];

          const allSubjectResources = resources.filter((r) => r.subjectSlug === subject.slug);
          const tabResources = allSubjectResources.filter((r) => r.type === routeInfo.activeTab);

          const displayResources: ResourceItem[] =
            tabResources.length > 0
              ? tabResources
              : [
                  {
                    id: `auto-${subject.code}-${routeInfo.activeTab}`,
                    title: `${subject.code} ${subject.title} – Official AKTU ${
                      routeInfo.activeTab === 'important-questions'
                        ? 'GUESS PAPER'
                        : routeInfo.activeTab === 'pyqs'
                        ? 'PYQ'
                        : routeInfo.activeTab.replace('-', ' ').toUpperCase()
                    } PDF Pack`,
                    subjectSlug: subject.slug,
                    subjectCode: subject.code,
                    subjectTitle: subject.title,
                    semester: subject.semester,
                    type: routeInfo.activeTab,
                    unitNumber: 0,
                    university: 'AKTU',
                    pages: routeInfo.activeTab === 'syllabus' ? 6 : 24,
                    fileSize: routeInfo.activeTab === 'syllabus' ? '410 KB' : '1.6 MB',
                    summary: `Complete AKTU & PCI-aligned ${
                      routeInfo.activeTab === 'important-questions'
                        ? 'Guess Paper'
                        : routeInfo.activeTab === 'pyqs'
                        ? 'PYQ'
                        : routeInfo.activeTab.replace('-', ' ')
                    } for ${subject.title} (${subject.code}). Covers ${subject.summary}`,
                    previewContent: `${subject.code}: ${subject.title.toUpperCase()} (AKTU ${
                      routeInfo.activeTab === 'important-questions'
                        ? 'GUESS PAPER'
                        : routeInfo.activeTab === 'pyqs'
                        ? 'PYQ'
                        : routeInfo.activeTab.toUpperCase()
                    })\nSemester ${subject.semester} | Department: ${subject.category} | AKTU Lucknow (PCI Regulation)\n\nCore Syllabus & Exam Coverage:\n${subject.summary}\n\nUnit-Wise Breakdown (Units 1 to ${subject.unitsCount}):\n- Unit 1: Foundational definitions, classification, and standard official pharmacopoeial principles.\n- Unit 2: Detailed mechanisms, instrumentation/formulation equations, and comparative tables.\n- Unit 3: High-yield AKTU Section B (10-mark) and Section C (7-mark) end-semester questions.\n- Unit 4 & 5: Clinical applications, quality control assays, and GPAT rapid-revision pointers.`,
                    featured: false,
                    downloads: 1420,
                    authorUid: 'system-seed',
                    createdAt: '2026-02-01T10:00:00.000Z',
                  },
                ];

          return (
            <div className="mx-auto max-w-7xl px-4 py-10 sm:px-8">
              {/* Breadcrumb */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs text-[var(--text-secondary)]">
                <button type="button" onClick={() => navigate('/')} className="hover:underline">
                  Home
                </button>
                <ChevronRight className="h-3.5 w-3.5" />
                <button
                  type="button"
                  onClick={() => navigate(`/sem-${subject.semester}`)}
                  className="hover:underline"
                >
                  Semester {subject.semester}
                </button>
                <ChevronRight className="h-3.5 w-3.5" />
                <span className="font-mono font-semibold text-[var(--brand-teal)]">{subject.code}</span>
                <span>·</span>
                <span className="text-[var(--text-primary)] font-medium">{subject.title}</span>
              </div>

              {/* Subject Header */}
              <div className="mt-4 rounded-2xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-6 sm:p-8">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="max-w-3xl">
                    <div className="text-xs text-[var(--text-secondary)]">
                      <span className="font-mono font-bold text-[var(--brand-teal)]">{subject.code}</span>
                      <span> · Semester {subject.semester} · {subject.category} · {subject.unitsCount} PCI Units</span>
                    </div>
                    <h1 className="mt-1.5 text-2xl font-bold text-[var(--text-primary)] sm:text-3xl">
                      {subject.title}
                    </h1>
                    <p className="mt-2 text-sm text-[var(--text-secondary)]">{subject.summary}</p>
                  </div>

                  <div className="font-mono text-xs text-[var(--text-muted)] bg-[var(--bg-subtle)] px-3.5 py-2 rounded-xl border border-[var(--border-hairline)]">
                    Clean Route: /sem-{subject.semester}/{subject.slug}/{routeInfo.activeTab}
                  </div>
                </div>

                {/* 4 Interactive Resource Type Tabs */}
                <div className="mt-6 flex flex-wrap gap-2 border-t border-[var(--border-hairline)] pt-5">
                  {(
                    [
                      { id: 'notes', label: 'Notes (Unit 1–5)' },
                      { id: 'syllabus', label: 'PCI Syllabus' },
                      { id: 'pyqs', label: 'PYQ' },
                      { id: 'important-questions', label: 'Guess Paper' },
                    ] as { id: ResourceType; label: string }[]
                  ).map((tab) => {
                    const isActive = routeInfo.activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => {
                          navigate(`/sem-${subject.semester}/${subject.slug}/${tab.id}`);
                          handleOpenPreview(getSubjectTabResource(subject, tab.id));
                        }}
                        className={`rounded-full px-4 py-2 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                          isActive
                            ? 'bg-[var(--brand-teal)] text-white shadow-xs'
                            : 'border border-[var(--border-hairline)] bg-[var(--bg-canvas)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                        }`}
                      >
                        {tab.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Resource Cards for Selected Tab */}
              <div className="mt-8 space-y-4">
                {displayResources.map((item, idx) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.18, delay: idx * 0.04 }}
                      className="rounded-2xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-6"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="max-w-3xl">
                          <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--text-secondary)]">
                            <span className="font-mono font-semibold text-[var(--brand-teal)]">
                              {item.unitNumber === 0 ? 'All Units (1–5)' : `Unit ${item.unitNumber}`}
                            </span>
                            <span aria-hidden="true">·</span>
                            <span>{item.university}</span>
                            <span aria-hidden="true">·</span>
                            <span className="font-mono tabular-nums">
                              {item.pages} Pages ({item.fileSize})
                            </span>
                            <span aria-hidden="true">·</span>
                            <span className="font-mono tabular-nums">
                              {item.downloads.toLocaleString()} Downloads
                            </span>
                          </div>

                          <h2 className="mt-2 text-lg font-bold text-[var(--text-primary)]">{item.title}</h2>
                          <p className="mt-1.5 text-xs leading-relaxed text-[var(--text-secondary)]">
                            {item.summary}
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleOpenPreview(item)}
                            className="inline-flex items-center gap-1.5 rounded-full bg-[var(--brand-teal)] px-4 py-2 text-xs font-semibold text-white hover:bg-[var(--brand-teal-hover)] whitespace-nowrap"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            Instant PDF Preview
                          </button>
                          <button
                            type="button"
                            onClick={() => setSupportDownloadResource(item)}
                            className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border-hairline)] bg-[var(--bg-subtle)] px-4 py-2 text-xs font-semibold text-[var(--text-primary)] hover:border-[var(--brand-teal)] whitespace-nowrap"
                          >
                            <Download className="h-3.5 w-3.5" />
                            Download PDF
                          </button>
                        </div>
                      </div>

                      {/* Inline Original PDF or Study Sheet Preview Box */}
                      <InlinePdfPreviewBox
                        resource={item}
                        onOpenFullPreview={handleOpenPreview}
                        onRequestDownload={(res) => setSupportDownloadResource(res)}
                      />
                    </motion.div>
                ))}
              </div>
            </div>
          );
        })()}

        {/* ==================== VIEW 4: EXAM-PREP TOOLS (/tools) ==================== */}
        {routeInfo.view === 'tools' && <StudyToolsView />}

        {/* ==================== VIEW 6: BLOG & UPDATES (/blog & /blog/:slug) ==================== */}
        {routeInfo.view === 'blog' && (
          <div className="mx-auto max-w-6xl px-4 py-10 sm:px-8">
            <div className="border-b border-[var(--border-hairline)] pb-6">
              <div className="text-xs text-[var(--text-secondary)]">
                GPAT 2027 · NIPER JEE · D.Pharm to B.Pharm Lateral Entry · Career Roadmaps
              </div>
              <h1 className="mt-1 text-2xl font-bold text-[var(--text-primary)] sm:text-3xl">
                Pharmacy Exam Alerts & Student Career Guides
              </h1>
            </div>

            <div className="mt-8 grid gap-8 md:grid-cols-3">
              {blogs.map((post, idx) => (
                <motion.article
                  key={post.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.18, delay: idx * 0.04 }}
                  whileHover={{ y: -3 }}
                  className="flex flex-col overflow-hidden rounded-2xl border border-[var(--border-hairline)] bg-[var(--bg-surface)]"
                >
                  <div className="aspect-[4/3] w-full overflow-hidden bg-[var(--bg-subtle)]">
                    <img
                      src={post.imageUrl}
                      alt={post.title}
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      className="h-full w-full object-cover transition-transform duration-300 hover:scale-[1.03]"
                    />
                  </div>
                  <div className="flex flex-1 flex-col justify-between p-6">
                    <div>
                      <div className="text-xs text-[var(--text-secondary)]">
                        <span>{post.category}</span>
                        <span aria-hidden="true"> · </span>
                        <span>{post.publishedDate}</span>
                        <span aria-hidden="true"> · </span>
                        <span>{post.readTime}</span>
                      </div>
                      <h2 className="mt-2 text-lg font-bold text-[var(--text-primary)]">
                        <button
                          type="button"
                          onClick={() => navigate(`/blog/${post.slug}`)}
                          className="text-left hover:text-[var(--brand-teal)]"
                        >
                          {post.title}
                        </button>
                      </h2>
                      <p className="mt-2 text-xs leading-relaxed text-[var(--text-secondary)]">{post.excerpt}</p>
                    </div>

                    <div className="mt-5 pt-4 border-t border-[var(--border-hairline)] flex items-center justify-between text-xs">
                      <span className="text-[var(--text-muted)] truncate">{post.authorName}</span>
                      <button
                        type="button"
                        onClick={() => navigate(`/blog/${post.slug}`)}
                        className="font-semibold text-[var(--brand-teal)] hover:underline shrink-0"
                      >
                        Read Full Article →
                      </button>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          </div>
        )}

        {routeInfo.view === 'blog-detail' && (() => {
          const post = blogs.find((b) => b.slug === routeInfo.blogSlug) || blogs[0];
          return (
            <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
              <button
                type="button"
                onClick={() => navigate('/blog')}
                className="text-xs font-semibold text-[var(--brand-teal)] hover:underline"
              >
                ← Back to All Pharmacy Updates
              </button>

              <article className="mt-4 overflow-hidden rounded-2xl border border-[var(--border-hairline)] bg-[var(--bg-surface)]">
                <div className="aspect-[16/9] w-full overflow-hidden bg-[var(--bg-subtle)]">
                  <img
                    src={post.imageUrl}
                    alt={post.title}
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="p-6 sm:p-10">
                  <div className="text-xs text-[var(--text-secondary)]">
                    <span className="font-semibold text-[var(--brand-teal)]">{post.category}</span>
                    <span aria-hidden="true"> · </span>
                    <span>{post.publishedDate}</span>
                    <span aria-hidden="true"> · </span>
                    <span>{post.readTime}</span>
                  </div>
                  <h1 className="mt-2 text-2xl font-bold text-[var(--text-primary)] sm:text-3xl">{post.title}</h1>
                  <div className="mt-2 text-xs text-[var(--text-muted)]">By {post.authorName}</div>

                  <div className="mt-6 space-y-4 whitespace-pre-line text-sm leading-relaxed text-[var(--text-primary)] border-t border-[var(--border-hairline)] pt-6">
                    {post.content}
                  </div>
                </div>
              </article>
            </div>
          );
        })()}

        {/* ==================== VIEW 7: ADMIN PORTAL (/admin) ==================== */}
        {routeInfo.view === 'admin' && (
          <AdminPortalView
            user={user}
            isAdmin={isAdmin}
            onSignIn={async () => {
              const cred = await signInWithGoogle();
              if (cred.user.email?.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
                await logOutUser();
                throw new Error(
                  'Access Denied: Your account is not authorized to access the BPharmHub Administration Console. Please sign in with a verified administrator account.'
                );
              }
            }}
            subjects={subjects}
            resources={resources}
            blogs={blogs}
            onCreateResource={handleCreateResource}
            onUpdateResource={handleUpdateResource}
            onDeleteResource={handleDeleteResource}
            onCreateSubject={handleCreateSubject}
            onDeleteSubject={handleDeleteSubject}
            onCreateBlog={handleCreateBlog}
            onDeleteBlog={handleDeleteBlog}
            onSeedDatabase={handleSeedDatabase}
            isSeeding={isSeeding}
          />
        )}

        {/* ==================== VIEW 8: STATIC & LEGAL PAGES ==================== */}
        {routeInfo.view === 'static' && (
          <StaticLegalPages page={routeInfo.staticPage} onNavigate={navigate} />
        )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* CLEAN EDITORIAL FOOTER */}
      <footer className="border-t border-[var(--border-hairline)] bg-[var(--bg-surface)] py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-8">
          <div className="grid gap-8 sm:grid-cols-2 lg:justify-between text-xs">
            <div className="max-w-md">
              {/* Social Sites Links */}
              <div>
                <div className="font-semibold text-[var(--text-primary)]">Join Our Student Community</div>
                <div className="mt-2.5 flex flex-col items-start gap-2">
                  <a
                    href="https://t.me/+dU4BhLne--xlZGQ1"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Join BPharmHub on Telegram"
                    title="Telegram Channel"
                    className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border-hairline)] bg-[var(--bg-subtle)] px-3 py-1.5 text-[11px] font-medium text-[var(--text-secondary)] transition-colors hover:border-[var(--brand-teal)] hover:text-[var(--brand-teal)]"
                  >
                    <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                    </svg>
                    <span>Telegram</span>
                  </a>

                  <a
                    href="https://www.youtube.com/channel/UC8KsZh0zl11gzuR9AgA88Tg"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Subscribe to BPharmHub on YouTube"
                    title="YouTube Lectures"
                    className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border-hairline)] bg-[var(--bg-subtle)] px-3 py-1.5 text-[11px] font-medium text-[var(--text-secondary)] transition-colors hover:border-[var(--brand-teal)] hover:text-[var(--brand-teal)]"
                  >
                    <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                    </svg>
                    <span>YouTube</span>
                  </a>

                  <a
                    href="https://www.instagram.com/bpharmhub/"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Follow BPharmHub on Instagram"
                    title="Instagram"
                    className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border-hairline)] bg-[var(--bg-subtle)] px-3 py-1.5 text-[11px] font-medium text-[var(--text-secondary)] transition-colors hover:border-[var(--brand-teal)] hover:text-[var(--brand-teal)]"
                  >
                    <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059-1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                    <span>Instagram</span>
                  </a>
                </div>
              </div>
            </div>

            <div className="sm:justify-self-end">
              <div className="font-semibold text-[var(--text-primary)]">Institutional & Legal</div>
              <ul className="mt-2.5 space-y-1.5 text-[var(--text-secondary)]">
                <li>
                  <button type="button" onClick={() => navigate('/about')} className="hover:underline">
                    About BPharmHub
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => navigate('/contact')} className="hover:underline">
                    Contact & Note Submissions
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => navigate('/privacy')} className="hover:underline">
                    Privacy Policy
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => navigate('/disclaimer')} className="hover:underline">
                    Clinical & Academic Disclaimer
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => navigate('/dmca')} className="hover:underline">
                    DMCA Takedown Policy
                  </button>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-8 border-t border-[var(--border-hairline)] pt-6 flex flex-wrap items-center justify-between gap-4 text-xs text-[var(--text-muted)]">
            <span>© {new Date().getFullYear()} BPharmHub (bpharmhub.xyz). Built exclusively for AKTU B.Pharm Students.</span>
            <span>Aligned with AKTU Lucknow & Pharmacy Council of India (PCI) Syllabus.</span>
          </div>
        </div>
      </footer>

      {/* THUMB-FRIENDLY MOBILE BOTTOM NAVIGATION BAR */}
      <nav
        aria-label="Mobile Bottom Navigation"
        className="fixed bottom-0 left-0 right-0 z-40 flex md:hidden items-center justify-around border-t border-[var(--border-hairline)] bg-[var(--bg-surface)]/95 py-2 backdrop-blur-md"
      >
        <button
          type="button"
          onClick={() => navigate('/')}
          className={`flex flex-col items-center gap-0.5 px-3 py-1 text-[11px] font-medium ${
            routeInfo.view === 'home' ? 'text-[var(--brand-teal)] font-bold' : 'text-[var(--text-secondary)]'
          }`}
        >
          <Home className="h-4 w-4" />
          <span>Home</span>
        </button>
        <button
          type="button"
          onClick={() => navigate('/sem-1')}
          className={`flex flex-col items-center gap-0.5 px-3 py-1 text-[11px] font-medium ${
            routeInfo.view === 'semester' || routeInfo.view === 'subject'
              ? 'text-[var(--brand-teal)] font-bold'
              : 'text-[var(--text-secondary)]'
          }`}
        >
          <BookOpen className="h-4 w-4" />
          <span>Resources</span>
        </button>
        <button
          type="button"
          onClick={() => navigate('/tools')}
          className={`flex flex-col items-center gap-0.5 px-3 py-1 text-[11px] font-medium ${
            routeInfo.view === 'tools' ? 'text-[var(--brand-teal)] font-bold' : 'text-[var(--text-secondary)]'
          }`}
        >
          <Calculator className="h-4 w-4" />
          <span>Tools</span>
        </button>
        <button
          type="button"
          onClick={() => navigate('/blog')}
          className={`flex flex-col items-center gap-0.5 px-3 py-1 text-[11px] font-medium ${
            routeInfo.view === 'blog' || routeInfo.view === 'blog-detail'
              ? 'text-[var(--brand-teal)] font-bold'
              : 'text-[var(--text-secondary)]'
          }`}
        >
          <Newspaper className="h-4 w-4" />
          <span>Updates</span>
        </button>
      </nav>

      {/* PDF PREVIEW & SAMPLE DOWNLOAD MODAL */}
      <PdfPreviewModal
        resource={previewResource}
        onClose={() => setPreviewResource(null)}
        onRecordDownload={handleRecordDownload}
      />

      {/* RAZORPAY SUPPORT CONTRIBUTION POPUP ON DIRECT DOWNLOAD */}
      <SupportDownloadModal
        isOpen={Boolean(supportDownloadResource)}
        onClose={() => setSupportDownloadResource(null)}
        resource={supportDownloadResource}
        onProceedDownload={() => {
          if (supportDownloadResource) {
            handleRecordDownload(supportDownloadResource);
            void generateAndDownloadSamplePdf(supportDownloadResource);
          }
        }}
      />
    </div>
  );
}
