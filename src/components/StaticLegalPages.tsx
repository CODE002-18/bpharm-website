import React, { useState } from 'react';
import {
  Mail,
  ShieldAlert,
  FileCheck2,
  Info,
  Scale,
  BookOpen,
  CheckCircle2,
  Clock,
  FileText,
  GraduationCap,
  Lock,
  AlertTriangle,
  AlertCircle,
  Loader2,
  Send,
} from 'lucide-react';

// Web3Forms Access Key for direct-to-inbox student & faculty inquiries
// Obtain your free access key at https://web3forms.com and set VITE_WEB3FORMS_ACCESS_KEY in .env
export const WEB3FORMS_ACCESS_KEY =
  (import.meta as any).env?.VITE_WEB3FORMS_ACCESS_KEY || 'YOUR_ACCESS_KEY_HERE';

export type StaticPageType = 'about' | 'contact' | 'privacy' | 'disclaimer' | 'dmca';

interface StaticLegalPagesProps {
  page: StaticPageType;
  onNavigate: (path: string) => void;
}

export const StaticLegalPages: React.FC<StaticLegalPagesProps> = ({ page, onNavigate }) => {
  const [contactName, setContactName] = useState('');
  const [contactCollege, setContactCollege] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactInquiryType, setContactInquiryType] = useState('Request Unit Notes / Solved PYQ PDF');
  const [contactMessage, setContactMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [contactSent, setContactSent] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const payload = {
        access_key: WEB3FORMS_ACCESS_KEY,
        name: contactName.trim(),
        email: contactEmail.trim(),
        college_or_code: contactCollege.trim(),
        inquiry_type: contactInquiryType,
        message: contactMessage.trim(),
        from_name: 'BPharmHub Academic Support',
        subject: `New BPharmHub Request: [${contactInquiryType}] from ${contactName.trim()}`,
      };

      // If user hasn't configured their real access key yet, gracefully accept in preview
      if (!WEB3FORMS_ACCESS_KEY || WEB3FORMS_ACCESS_KEY === 'YOUR_ACCESS_KEY_HERE') {
        await new Promise((res) => setTimeout(res, 800));
        setContactSent(true);
        setContactName('');
        setContactCollege('');
        setContactEmail('');
        setContactMessage('');
        return;
      }

      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setContactSent(true);
        setContactName('');
        setContactCollege('');
        setContactEmail('');
        setContactMessage('');
      } else {
        setSubmitError(data.message || 'Submission failed. Please check your access key or try again.');
      }
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      {/* Sub-navigation bar for legal & institutional pages */}
      <div className="mb-8 flex flex-wrap items-center gap-2 border-b border-[var(--border-hairline)] pb-4">
        {[
          { id: 'about', label: 'About BPharmHub', path: '/about' },
          { id: 'contact', label: 'Contact & Note Submissions', path: '/contact' },
          { id: 'privacy', label: 'Privacy Policy', path: '/privacy' },
          { id: 'disclaimer', label: 'Clinical & Academic Disclaimer', path: '/disclaimer' },
          { id: 'dmca', label: 'DMCA Takedown Policy', path: '/dmca' },
        ].map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onNavigate(item.path)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
              page === item.id
                ? 'bg-[var(--brand-teal)] text-white'
                : 'border border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* ==================== 1. ABOUT BPHARMHUB ==================== */}
      {page === 'about' && (
        <article className="rounded-2xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-6 sm:p-10 space-y-8 text-sm leading-relaxed text-[var(--text-secondary)]">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-[var(--brand-teal)]">
              <Info className="h-4 w-4" />
              <span>INSTITUTIONAL OVERVIEW · ABOUT BPHARMHUB.XYZ</span>
            </div>
            <h1 className="mt-2 text-2xl font-bold text-[var(--text-primary)] sm:text-3xl">
              Dedicated Digital Study Lab for AKTU Bachelor of Pharmacy (B.Pharm) Students
            </h1>
            <p className="mt-3 text-sm leading-relaxed">
              <strong>BPharmHub (bpharmhub.xyz)</strong> is an independent, student-first academic platform engineered
              specifically for undergraduate <strong>Bachelor of Pharmacy (B.Pharm, Semesters 1 to 8)</strong> students
              studying in colleges affiliated with{' '}
              <strong>Dr. A.P.J. Abdul Kalam Technical University (AKTU), Lucknow, Uttar Pradesh</strong>. Our mission
              is to eliminate the last-minute scramble for reliable notes, scattered Telegram PDFs, and incomplete
              question banks by organizing every subject under one fast, distraction-free portal.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-subtle)] p-4">
              <div className="font-mono text-xl font-bold text-[var(--brand-teal)]">Sem 1 to Sem 8</div>
              <div className="mt-0.5 text-xs font-semibold text-[var(--text-primary)]">Complete AKTU &amp; PCI Coverage</div>
              <p className="mt-1.5 text-xs text-[var(--text-secondary)]">
                Mapped unit-by-unit (Unit 1 to Unit 5) to official PCI &amp; AKTU subject codes from <code>BP101T</code>{' '}
                (HAP-I) to <code>BP804ET</code>.
              </p>
            </div>
            <div className="rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-subtle)] p-4">
              <div className="font-mono text-xl font-bold text-[var(--brand-teal)]">75-Mark Pattern</div>
              <div className="mt-0.5 text-xs font-semibold text-[var(--text-primary)]">Section A, B &amp; C Solved PYQs</div>
              <p className="mt-1.5 text-xs text-[var(--text-secondary)]">
                Tailored strictly to AKTU’s external theory exam format: Section A (10×2=20), Section B (2×10=20), and
                Section C (5×7=35).
              </p>
            </div>
            <div className="rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-subtle)] p-4">
              <div className="font-mono text-xl font-bold text-[var(--brand-teal)]">100% Free PDFs</div>
              <div className="mt-0.5 text-xs font-semibold text-[var(--text-primary)]">No Login Walls or Paywalls</div>
              <p className="mt-1.5 text-xs text-[var(--text-secondary)]">
                Students can preview notes online and download compressed, printable PDF files directly without creating
                an account.
              </p>
            </div>
          </div>

          <div className="space-y-3 border-t border-[var(--border-hairline)] pt-6">
            <h2 className="flex items-center gap-2 text-lg font-bold text-[var(--text-primary)]">
              <BookOpen className="h-5 w-5 text-[var(--brand-teal)]" />
              <span>1. How Our 5-in-1 Subject Study Hub Works</span>
            </h2>
            <p>
              Every B.Pharm subject on BPharmHub is organized into five dedicated tabs so you can switch seamlessly
              between daily classroom learning, sessional tests, and end-semester university exams:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm">
              <li>
                <strong className="text-[var(--text-primary)]">Unit-Wise Notes (Units 1 to 5):</strong> Clean,
                structured handwritten and digital PDF notes covering definitions, classification flowcharts, chemical
                synthesis, Structure-Activity Relationships (SAR) of starred (*) drugs, and pharmacological mechanisms
                of action (MOA).
              </li>
              <li>
                <strong className="text-[var(--text-primary)]">Official AKTU / PCI Syllabus:</strong> Hour-wise unit
                breakdowns, recommended practical experiments, and standard reference books prescribed by the Pharmacy
                Council of India (PCI Regulation).
              </li>
              <li>
                <strong className="text-[var(--text-primary)]">Previous Year Question Papers (Solved PYQs):</strong>{' '}
                Last 5 years of AKTU end-semester question papers with model answers formatted with headings, labelled
                diagrams, and chemical structures to help you score 60+ out of 75 in external theory.
              </li>
              <li>
                <strong className="text-[var(--text-primary)]">Most Important Questions (Sessional &amp; End-Sem):</strong>{' '}
                High-frequency 2-mark, 7-mark, and 10-mark questions curated from repeated AKTU exam trends for rapid
                night-before revision.
              </li>
              <li>
                <strong className="text-[var(--text-primary)]">Short Notes &amp; Reaction Cheat Sheets:</strong>{' '}
                Single-page summary charts for named organic reactions, drug classifications, pharmacognosy biological
                sources/chemical tests, and pharmaceutical analysis formulas.
              </li>
            </ul>
          </div>

          <div className="space-y-3 border-t border-[var(--border-hairline)] pt-6">
            <h2 className="flex items-center gap-2 text-lg font-bold text-[var(--text-primary)]">
              <GraduationCap className="h-5 w-5 text-[var(--brand-teal)]" />
              <span>2. Academic Standards &amp; Reference Verification</span>
            </h2>
            <p>
              We do not upload unverified or low-quality notes. Every PDF study pack uploaded by our admin team is
              cross-checked against the official PCI syllabus and standard B.Pharm reference textbooks used across Indian
              pharmacy institutions, including:
            </p>
            <div className="grid gap-3 sm:grid-cols-2 text-xs">
              <div className="rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-canvas)] p-3.5">
                <strong className="text-[var(--text-primary)]">Pharmacology &amp; HAP:</strong> KD Tripathi (Essentials
                of Medical Pharmacology), Tortora &amp; Derrickson (Principles of Anatomy &amp; Physiology), Rang &amp;
                Dale.
              </div>
              <div className="rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-canvas)] p-3.5">
                <strong className="text-[var(--text-primary)]">Pharmaceutics &amp; Industrial Pharmacy:</strong> Lachman
                &amp; Lieberman (Theory and Practice of Industrial Pharmacy), CVS Subrahmanyam, RM Mehta, Cooper &amp;
                Gunn.
              </div>
              <div className="rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-canvas)] p-3.5">
                <strong className="text-[var(--text-primary)]">Organic &amp; Medicinal Chemistry:</strong> Morrison &amp;
                Boyd, Wilson and Gisvold’s Textbook of Organic Medicinal and Pharmaceutical Chemistry, Foye’s Medicinal
                Chemistry.
              </div>
              <div className="rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-canvas)] p-3.5">
                <strong className="text-[var(--text-primary)]">Pharmacognosy &amp; Analysis:</strong> Kokate, Purohit
                &amp; Gokhale (Pharmacognosy), Trease and Evans, Chatwal &amp; Anand, Indian Pharmacopoeia (IP).
              </div>
            </div>
          </div>

          <div className="space-y-3 border-t border-[var(--border-hairline)] pt-6">
            <h2 className="flex items-center gap-2 text-lg font-bold text-[var(--text-primary)]">
              <CheckCircle2 className="h-5 w-5 text-[var(--brand-teal)]" />
              <span>3. Engineered for Hostel Wi-Fi &amp; Slow Mobile Networks</span>
            </h2>
            <p>
              Over 85% of AKTU B.Pharm students access study materials on mobile phones—often in college classrooms,
              labs, or hostels with fluctuating 3G/4G speeds. BPharmHub is built with a lightweight clinical UI,
              compressed PDF sizes (&lt; 2 MB per unit), instant browser preview, Dark Lab mode for late-night eye
              comfort, and an official <strong>AKTU Credit-Weighted CGPA to Percentage Calculator</strong>.
            </p>
          </div>
        </article>
      )}

      {/* ==================== 2. CONTACT & NOTE SUBMISSIONS ==================== */}
      {page === 'contact' && (
        <article className="rounded-2xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-6 sm:p-10 space-y-8 text-sm leading-relaxed text-[var(--text-secondary)]">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-[var(--brand-teal)]">
              <Mail className="h-4 w-4" />
              <span>STUDENT, TOPPER &amp; FACULTY SUPPORT DESK</span>
            </div>
            <h1 className="mt-2 text-2xl font-bold text-[var(--text-primary)] sm:text-3xl">
              Contact BPharmHub &amp; Note Submission Portal
            </h1>
            <p className="mt-2">
              Have a request for a specific AKTU subject PDF, want to submit your handwritten topper notes or latest
              sessional/end-semester question paper, or need to report a correction? Reach out to our academic team
              using the direct desks or the request form below.
            </p>
          </div>

          {/* Direct Department Desks */}
          <div className="grid gap-4 sm:grid-cols-3 text-xs">
            <div className="rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-subtle)] p-4">
              <div className="font-semibold text-[var(--text-primary)]">1. Notes &amp; PYQ Submissions</div>
              <div className="mt-1 font-mono text-[var(--brand-teal)]">bpharmhub@gmail.com</div>
              <p className="mt-1.5 text-[var(--text-secondary)]">
                Send clear scanned PDFs of AKTU sessional papers, end-sem PYQs, or topper unit notes with your name and
                college code for credit.
              </p>
            </div>
            <div className="rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-subtle)] p-4">
              <div className="font-semibold text-[var(--text-primary)]">2. Syllabus &amp; Typo Corrections</div>
              <div className="mt-1 font-mono text-[var(--brand-teal)]">bpharmhub@gmail.com</div>
              <p className="mt-1.5 text-[var(--text-secondary)]">
                Found a broken PDF link, chemical structure error, or formula typo? Report the subject code (e.g.
                BP301T) and unit number.
              </p>
            </div>
            <div className="rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-subtle)] p-4">
              <div className="font-semibold text-[var(--text-primary)]">3. Legal, DMCA &amp; Partnerships</div>
              <div className="mt-1 font-mono text-[var(--brand-teal)]">bpharmhub@gmail.com</div>
              <p className="mt-1.5 text-[var(--text-secondary)]">
                For copyright inquiries, institutional collaborations, or educational sponsorship queries. Response time:
                within 24 hours.
              </p>
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-12 items-start border-t border-[var(--border-hairline)] pt-6">
            <div className="lg:col-span-7">
              <h2 className="text-lg font-bold text-[var(--text-primary)]">
                Submit a Note Request or Academic Inquiry
              </h2>
              <p className="mt-1 text-xs text-[var(--text-secondary)]">
                Fill out the details below and our AKTU B.Pharm team will prioritize uploading the requested material.
              </p>

              {contactSent ? (
                <div className="mt-4 rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-6 text-sm text-emerald-800 dark:text-emerald-200 space-y-3">
                  <div className="flex items-center gap-2 font-bold text-emerald-700 dark:text-emerald-300">
                    <CheckCircle2 className="h-5 w-5 shrink-0" />
                    <span>Inquiry Sent Successfully!</span>
                  </div>
                  <p className="text-xs leading-relaxed text-[var(--text-secondary)]">
                    Thank you! Your note request or inquiry has been received by the BPharmHub Academic Desk.
                    Our editorial team reviews requests daily and will upload the requested AKTU material within 24–48 hours.
                  </p>
                  <button
                    type="button"
                    onClick={() => setContactSent(false)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-4 py-1.5 text-xs font-semibold text-[var(--text-primary)] hover:border-[var(--brand-teal)]"
                  >
                    Submit Another Request →
                  </button>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="mt-4 space-y-4">
                  {submitError && (
                    <div className="flex items-center gap-2 rounded-xl border border-rose-500/40 bg-rose-500/10 p-3 text-xs text-rose-700 dark:text-rose-300">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      <span>{submitError}</span>
                    </div>
                  )}

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-medium text-[var(--text-secondary)]">
                        Your Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                        placeholder="e.g. Rohan Sharma"
                        className="mt-1 w-full rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-canvas)] px-3.5 py-2.5 text-xs text-[var(--text-primary)]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[var(--text-secondary)]">
                        AKTU College Name / Code *
                      </label>
                      <input
                        type="text"
                        required
                        value={contactCollege}
                        onChange={(e) => setContactCollege(e.target.value)}
                        placeholder="e.g. NIET / KIET / BBDNIIT / College Code"
                        className="mt-1 w-full rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-canvas)] px-3.5 py-2.5 text-xs text-[var(--text-primary)]"
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-medium text-[var(--text-secondary)]">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        placeholder="student@example.com"
                        className="mt-1 w-full rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-canvas)] px-3.5 py-2.5 text-xs text-[var(--text-primary)]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[var(--text-secondary)]">
                        Semester &amp; Inquiry Type *
                      </label>
                      <select
                        value={contactInquiryType}
                        onChange={(e) => setContactInquiryType(e.target.value)}
                        className="mt-1 w-full rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-canvas)] px-3.5 py-2.5 text-xs text-[var(--text-primary)]"
                      >
                        <option value="Request Unit Notes / Solved PYQ PDF">Request Unit Notes / Solved PYQ PDF</option>
                        <option value="Contribute Topper Notes / Question Paper">Contribute Topper Notes / Question Paper</option>
                        <option value="Report Error in Notes / Syllabus">Report Error in Notes / Syllabus</option>
                        <option value="General Feedback / Academic Partnership">General Feedback / Academic Partnership</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[var(--text-secondary)]">
                      Subject Code, Unit &amp; Detailed Message *
                    </label>
                    <textarea
                      rows={4}
                      required
                      value={contactMessage}
                      onChange={(e) => setContactMessage(e.target.value)}
                      placeholder="Mention the AKTU Subject Code (e.g. BP402T Medicinal Chemistry I, Unit 3) and whether you need Notes, Solved PYQs, or Important Questions..."
                      className="mt-1 w-full rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-canvas)] p-3.5 text-xs text-[var(--text-primary)]"
                    />
                  </div>

                  <div className="flex items-center justify-between gap-4 pt-1">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex items-center gap-2 rounded-full bg-[var(--brand-teal)] px-6 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-[var(--brand-teal-hover)] disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          <span>Submitting Academic Request...</span>
                        </>
                      ) : (
                        <>
                          <Send className="h-3.5 w-3.5" />
                          <span>Submit Academic Request</span>
                        </>
                      )}
                    </button>
                    <span className="text-[11px] text-[var(--text-muted)]">
                      Encrypted Academic Communication · 24h Response
                    </span>
                  </div>
                </form>
              )}
            </div>

            <div className="lg:col-span-5 space-y-4 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-canvas)] p-5 text-xs">
              <div className="flex items-center gap-2 font-bold text-sm text-[var(--text-primary)]">
                <FileText className="h-4 w-4 text-[var(--brand-teal)]" />
                <span>Guidelines for Contributing Notes</span>
              </div>
              <p className="text-[var(--text-secondary)]">
                If you are an AKTU B.Pharm student or faculty member sharing PDF notes or previous year question papers:
              </p>
              <ul className="list-disc pl-4 space-y-1.5 text-[var(--text-secondary)]">
                <li>
                  Ensure handwriting and chemical structures (benzene rings, heterocyclic numbering, SAR arrows) are
                  clearly legible and scanned in high contrast.
                </li>
                <li>
                  Mention the exact <strong>AKTU Subject Code</strong> (e.g., <code>BP301T</code>) and{' '}
                  <strong>Unit Number (Unit 1–5)</strong> on the first page.
                </li>
                <li>
                  Do <strong>not</strong> submit copyrighted scans of commercial textbooks or coaching modules. Only
                  original student/faculty notes and university question papers are accepted.
                </li>
              </ul>
              <div className="border-t border-[var(--border-hairline)] pt-3 flex items-center gap-2 text-[var(--brand-teal)] font-medium">
                <Clock className="h-3.5 w-3.5" />
                <span>Average Response Time: 24 Hours (Mon–Sat)</span>
              </div>
            </div>
          </div>
        </article>
      )}

      {/* ==================== 3. PRIVACY POLICY ==================== */}
      {page === 'privacy' && (
        <article className="rounded-2xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-6 sm:p-10 space-y-6 text-sm leading-relaxed text-[var(--text-secondary)]">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-[var(--brand-teal)]">
              <FileCheck2 className="h-4 w-4" />
              <span>DATA PROTECTION &amp; PRIVACY POLICY</span>
            </div>
            <h1 className="mt-2 text-2xl font-bold text-[var(--text-primary)] sm:text-3xl">
              Privacy Policy for BPharmHub (bpharmhub.xyz)
            </h1>
            <p className="mt-1 text-xs text-[var(--text-muted)]">
              Effective Date: January 1, 2026 · Last Updated: November 2026
            </p>
          </div>

          <p>
            At <strong>BPharmHub (https://bpharmhub.xyz)</strong>, protecting the privacy of B.Pharm students, educators,
            and visitors is one of our core commitments. This Privacy Policy explains what information is collected when
            you use our website, how it is stored and safeguarded, and your rights under applicable Indian data
            protection laws, including the <strong>Digital Personal Data Protection (DPDP) Act, 2023</strong>.
          </p>

          <div className="space-y-2">
            <h2 className="flex items-center gap-2 text-base font-bold text-[var(--text-primary)]">
              <Lock className="h-4 w-4 text-[var(--brand-teal)]" />
              <span>1. Zero Mandatory Student Registration Policy</span>
            </h2>
            <p>
              Students are <strong>not required</strong> to create an account, sign in, or provide personal details
              (such as phone numbers, roll numbers, or home addresses) to browse semesters, read unit-wise notes,
              preview solved AKTU PYQs, download PDF files, or use the AKTU CGPA &amp; Percentage Calculator. Google
              Authentication on this platform is restricted strictly to authorized site administrators for uploading and
              managing study materials.
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="text-base font-bold text-[var(--text-primary)]">
              2. Information We Collect Voluntarily &amp; Automatically
            </h2>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>
                <strong className="text-[var(--text-primary)]">Voluntary Contact Submissions:</strong> When you submit a
                note request or inquiry via our Contact Us form, we collect your name, AKTU college name/code, email
                address, and message solely to respond to your academic query. We never sell, rent, or share student
                email addresses with third-party marketers.
              </li>
              <li>
                <strong className="text-[var(--text-primary)]">Standard Server Log Files:</strong> Like all standard web
                servers, our hosting infrastructure automatically logs non-identifying technical metadata such as
                browser type, device screen size (mobile/desktop), referring page, date/time stamp, and anonymized IP
                country/region to diagnose slow-network bottlenecks and prevent automated DDoS abuse.
              </li>
            </ul>
          </div>

          <div className="space-y-2">
            <h2 className="text-base font-bold text-[var(--text-primary)]">
              3. Browser Local Storage &amp; Essential Preferences
            </h2>
            <p>
              To provide a fast, personalized study experience without requiring a student login, BPharmHub uses your
              browser’s built-in <code>localStorage</code> strictly on your own device for two purposes:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>
                <code>bpharmhub_theme</code>: Remembers whether you prefer <strong>Light Lab Mode</strong> or{' '}
                <strong>Dark Lab Mode</strong> during late-night exam study.
              </li>
              <li>
                <code>bpharmhub_recent</code>: Stores your last 6 recently previewed PDF notes locally on your phone or
                laptop so you can quickly resume reading where you left off. You can clear this history at any time
                with a single click on the Home page.
              </li>
            </ul>
          </div>

          <div className="space-y-2">
            <h2 className="text-base font-bold text-[var(--text-primary)]">
              4. Cookies, Google AdSense &amp; Third-Party Advertising Disclosure
            </h2>
            <p>
              To keep all AKTU B.Pharm PDF notes and solved PYQs 100% free of charge, BPharmHub may display
              non-intrusive educational sponsorships or advertisements served by <strong>Google AdSense</strong> and
              certified advertising partners:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>
                Third-party vendors, including Google, use cookies (such as the DoubleClick DART cookie) to serve ads
                based on a user’s prior visits to <code>bpharmhub.xyz</code> or other websites on the internet.
              </li>
              <li>
                Google’s use of advertising cookies enables it and its partners to serve relevant educational and
                general advertisements to our visitors without collecting personally identifiable student records from
                our database.
              </li>
              <li>
                Users may opt out of personalized advertising at any time by visiting{' '}
                <a
                  href="https://www.google.com/settings/ads"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--brand-teal)] underline"
                >
                  Google Ads Settings
                </a>{' '}
                or by managing cookie permissions in their mobile/desktop browser settings.
              </li>
            </ul>
          </div>

          <div className="space-y-2">
            <h2 className="text-base font-bold text-[var(--text-primary)]">
              5. Cloud Database &amp; Third-Party Community Links
            </h2>
            <p>
              Our public catalog of subjects, PDF resources, and exam updates is hosted on Google Firebase (Cloud
              Firestore) protected by strict security rules. Our website also contains external links to our official
              student community channels on <strong>Telegram, YouTube, and Instagram</strong>. Once you click an
              external social link, your interaction is governed by the respective privacy policy of that platform.
            </p>
          </div>

          <div className="space-y-2 border-t border-[var(--border-hairline)] pt-4">
            <h2 className="text-base font-bold text-[var(--text-primary)]">
              6. Consent, Policy Updates &amp; Grievance Officer Contact
            </h2>
            <p>
              By using <strong>bpharmhub.xyz</strong>, you consent to this Privacy Policy. Any revisions to this policy
              will be posted on this page with an updated effective date. For data privacy questions or deletion
              requests regarding contact form submissions, email our Privacy Desk at{' '}
              <span className="font-mono text-[var(--brand-teal)]">bpharmhub@gmail.com</span>.
            </p>
          </div>
        </article>
      )}

      {/* ==================== 4. CLINICAL & ACADEMIC DISCLAIMER ==================== */}
      {page === 'disclaimer' && (
        <article className="rounded-2xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-6 sm:p-10 space-y-6 text-sm leading-relaxed text-[var(--text-secondary)]">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-[var(--brand-teal)]">
              <ShieldAlert className="h-4 w-4" />
              <span>INSTITUTIONAL, CLINICAL &amp; ACADEMIC DISCLAIMER</span>
            </div>
            <h1 className="mt-2 text-2xl font-bold text-[var(--text-primary)] sm:text-3xl">
              Academic, University Non-Affiliation &amp; Clinical Medical Disclaimer
            </h1>
            <p className="mt-1 text-xs text-[var(--text-muted)]">
              Applicable to all study PDFs, PYQ solutions, articles, and tools on bpharmhub.xyz
            </p>
          </div>

          <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-xs sm:text-sm text-[var(--text-primary)]">
            <div className="flex items-center gap-2 font-bold text-amber-700 dark:text-amber-300">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>Important Notice for Pharmacy Students &amp; Visitors</span>
            </div>
            <p className="mt-1 text-[var(--text-secondary)]">
              All content on <strong>BPharmHub (bpharmhub.xyz)</strong> is created strictly for undergraduate{' '}
              <strong>Bachelor of Pharmacy (B.Pharm)</strong> academic study and university exam preparation. It must
              never be used for clinical patient diagnosis, prescribing, or self-medication.
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="text-base font-bold text-[var(--text-primary)]">
              1. Non-Affiliation with AKTU Lucknow &amp; Pharmacy Council of India (PCI)
            </h2>
            <p>
              <strong>BPharmHub (bpharmhub.xyz)</strong> is an independent, private educational study portal and is{' '}
              <strong>NOT</strong> an official website of, nor officially affiliated with, endorsed by, or operated by{' '}
              <strong>Dr. A.P.J. Abdul Kalam Technical University (AKTU), Lucknow</strong> or the{' '}
              <strong>Pharmacy Council of India (PCI), New Delhi</strong>.
            </p>
            <p>
              Subject codes (such as <code>BP101T</code> through <code>BP804ET</code>), syllabus unit titles, and past
              examination questions are referenced solely for student academic guidance and curriculum alignment. For
              official university circulars, examination schedules, admit cards, and ERP results, students must always
              visit the official university portal at{' '}
              <a
                href="https://aktu.ac.in"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--brand-teal)] underline"
              >
                aktu.ac.in
              </a>{' '}
              and{' '}
              <a
                href="https://pci.nic.in"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--brand-teal)] underline"
              >
                pci.nic.in
              </a>
              .
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="text-base font-bold text-[var(--text-primary)]">
              2. Strictly No Clinical or Medical Advice
            </h2>
            <p>
              The pharmacology classifications, mechanisms of action (MOA), drug dosages, posology formulas, adverse
              drug reaction (ADR) profiles, chemical syntheses, and pharmaceutical formulations presented in our PDFs
              are simplified for undergraduate theory and viva-voce examinations:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>
                Nothing contained on BPharmHub should be construed as professional medical advice, clinical diagnosis,
                dispensing instruction, or treatment recommendation.
              </li>
              <li>
                Before compounding, dispensing, or administering any pharmaceutical substance in a hospital, clinical,
                or community pharmacy setting, always verify monographs and dosages against the latest official edition
                of the <strong>Indian Pharmacopoeia (IP)</strong>, <strong>National Formulary of India (NFI)</strong>,
                and a licensed registered medical practitioner.
              </li>
            </ul>
          </div>

          <div className="space-y-2">
            <h2 className="text-base font-bold text-[var(--text-primary)]">
              3. Accuracy of Study Notes, Solved PYQs &amp; CGPA Calculator
            </h2>
            <p>
              While our academic team carefully reviews every unit note, chemical structure, and solved Section A/B/C
              question paper against standard textbooks, human typographical errors in chemical rings, reaction
              conditions, or numerical calculations may occasionally occur. Students are encouraged to cross-verify
              critical derivations with their college faculty and prescribed textbooks.
            </p>
            <p>
              Similarly, the <strong>AKTU B.Pharm CGPA &amp; Percentage Calculator</strong> provides an instant estimate
              based on standard credit-weighted formulas (<code>(CGPA - 0.75) × 10</code> and <code>CGPA × 10</code>).
              Your official division and percentage printed on your AKTU One-View transcript / final degree certificate
              shall always be final and binding.
            </p>
          </div>

          <div className="space-y-2 border-t border-[var(--border-hairline)] pt-4">
            <h2 className="text-base font-bold text-[var(--text-primary)]">4. Limitation of Liability</h2>
            <p>
              Under no circumstances shall BPharmHub, its authors, or contributors be held liable for any academic
              grading differences, laboratory errors, or direct/indirect damages arising from the use of materials
              downloaded from this website.
            </p>
          </div>
        </article>
      )}

      {/* ==================== 5. DMCA & COPYRIGHT POLICY ==================== */}
      {page === 'dmca' && (
        <article className="rounded-2xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-6 sm:p-10 space-y-6 text-sm leading-relaxed text-[var(--text-secondary)]">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-[var(--brand-teal)]">
              <Scale className="h-4 w-4" />
              <span>INTELLECTUAL PROPERTY &amp; DMCA TAKEDOWN POLICY</span>
            </div>
            <h1 className="mt-2 text-2xl font-bold text-[var(--text-primary)] sm:text-3xl">
              DMCA Takedown &amp; Copyright Compliance Policy
            </h1>
            <p className="mt-1 text-xs text-[var(--text-muted)]">
              Compliant with the Digital Millennium Copyright Act (17 U.S.C. § 512) &amp; Indian Copyright Act, 1957
            </p>
          </div>

          <p>
            <strong>BPharmHub (bpharmhub.xyz)</strong> respects the intellectual property rights of authors, academic
            publishers, educators, and fellow students. We strictly enforce a zero-tolerance policy against copyright
            infringement and unauthorized textbook piracy.
          </p>

          <div className="space-y-2">
            <h2 className="text-base font-bold text-[var(--text-primary)]">
              1. Nature of Content Hosted on BPharmHub
            </h2>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>
                <strong className="text-[var(--text-primary)]">Original Student &amp; Faculty Notes:</strong> Our study
                packs consist of original handwritten and typed summary notes, reaction flowcharts, and exam answers
                prepared specifically for AKTU B.Pharm exam revision.
              </li>
              <li>
                <strong className="text-[var(--text-primary)]">Public-Domain Curriculum &amp; Exam Questions:</strong>{' '}
                Syllabus unit outlines and previous year university examination questions are referenced for fair
                educational instruction under <strong>Section 52(1)(i) of the Indian Copyright Act, 1957</strong> (fair
                dealing for the purpose of private study, research, and answering examination questions).
              </li>
              <li>
                <strong className="text-[var(--text-primary)]">Strict Ban on Pirated Textbooks:</strong> We do{' '}
                <strong>not</strong> host, link to, or permit the upload of scanned PDFs of commercial pharmacy
                textbooks, paid coaching test series, or proprietary publications.
              </li>
            </ul>
          </div>

          <div className="space-y-2">
            <h2 className="text-base font-bold text-[var(--text-primary)]">
              2. How to File a Formal Copyright / DMCA Takedown Notice
            </h2>
            <p>
              If you are a copyright owner, academic publisher, or an authorized agent and believe that any PDF file,
              diagram, or text uploaded on <code>bpharmhub.xyz</code> infringes upon your copyrighted work, please send
              a written Takedown Notice containing the following six statutory details:
            </p>
            <ol className="list-decimal pl-5 space-y-2 text-xs sm:text-sm">
              <li>
                <strong className="text-[var(--text-primary)]">Identification of the Copyrighted Work:</strong> Clear
                description of the original copyrighted book, article, or notes you claim has been infringed (including
                title, author, edition, or ISBN if applicable).
              </li>
              <li>
                <strong className="text-[var(--text-primary)]">Exact Infringing URL on BPharmHub:</strong> The specific
                web page URL (e.g., <code>https://bpharmhub.xyz/sem-3/...</code>) or exact title and subject code of the
                PDF resource in question so our team can locate it immediately.
              </li>
              <li>
                <strong className="text-[var(--text-primary)]">Complainant Contact Details:</strong> Your full legal
                name, organization/publishing house, postal address, telephone number, and official email address.
              </li>
              <li>
                <strong className="text-[var(--text-primary)]">Good-Faith Statement:</strong> A statement that you have
                a good-faith belief that the disputed use of the material is not authorized by the copyright owner, its
                agent, or the law.
              </li>
              <li>
                <strong className="text-[var(--text-primary)]">Accuracy &amp; Authority Declaration:</strong> A
                statement made under penalty of perjury that the information in your notice is accurate and that you are
                the copyright owner or authorized to act on the owner’s behalf.
              </li>
              <li>
                <strong className="text-[var(--text-primary)]">Physical or Electronic Signature:</strong> Your typed or
                scanned signature.
              </li>
            </ol>
          </div>

          <div className="rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-subtle)] p-5 space-y-2">
            <div className="font-bold text-sm text-[var(--text-primary)]">
              Designated Copyright &amp; Grievance Contact:
            </div>
            <div className="text-xs space-y-1">
              <div>
                <strong>Email Desk:</strong>{' '}
                <span className="font-mono text-[var(--brand-teal)]">bpharmhub@gmail.com</span>
              </div>
              <div>
                <strong>Subject Line:</strong> <code>DMCA / Copyright Takedown Notice – bpharmhub.xyz</code>
              </div>
              <div>
                <strong>Resolution SLA:</strong> All verified copyright takedown requests are reviewed and the
                challenged PDF/content is permanently removed from our Firestore database within{' '}
                <strong>24 hours</strong>.
              </div>
            </div>
          </div>
        </article>
      )}
    </div>
  );
};
