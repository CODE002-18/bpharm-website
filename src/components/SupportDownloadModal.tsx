import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Heart, CheckCircle2, AlertCircle } from 'lucide-react';
import { ResourceItem } from '../types';

export const getActiveRazorpayKey = (): string => {
  try {
    const local = localStorage.getItem('bpharmhub_razorpay_key')?.trim();
    if (local && local.length > 5) return local;
  } catch {
    // ignore
  }
  return (import.meta as any).env?.VITE_RAZORPAY_KEY_ID || 'rzp_live_TzFIfYL0hhE4kn';
};

export const setStoredRazorpayKey = (key: string): void => {
  try {
    localStorage.setItem('bpharmhub_razorpay_key', key.trim());
  } catch {
    // ignore
  }
};

interface SupportDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  resource: ResourceItem | null;
  onProceedDownload: () => void;
}

const DONATION_AMOUNTS = [19, 29, 49, 99, 499, 999, 1999];

export const SupportDownloadModal: React.FC<SupportDownloadModalProps> = ({
  isOpen,
  onClose,
  resource,
  onProceedDownload,
}) => {
  const [selectedAmount, setSelectedAmount] = useState<number>(99);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  // Helper to dynamically load Razorpay checkout script
  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if ((window as any).Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleSupportAndContinue = async () => {
    setIsProcessing(true);
    setErrorNotice(null);

    const activeKey = getActiveRazorpayKey();

    // If key has not been configured yet (placeholder)
    if (!activeKey || activeKey === 'YOUR_RAZORPAY_KEY_ID') {
      setTimeout(() => {
        setIsProcessing(false);
        setSuccessNotice(
          `Thank you for choosing to support with ₹${selectedAmount}! (Add VITE_RAZORPAY_KEY_ID to activate live Razorpay). Starting PDF download...`
        );
        setTimeout(() => {
          onProceedDownload();
          onClose();
          setSuccessNotice(null);
        }, 1200);
      }, 600);
      return;
    }

    try {
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        throw new Error('Could not load Razorpay payment gateway. Please check your internet connection.');
      }

      const options = {
        key: activeKey,
        amount: selectedAmount * 100, // Amount in paise
        currency: 'INR',
        name: 'BPharmHub',
        description: `Student Contribution: ₹${selectedAmount} for ${resource?.subjectCode || 'B.Pharm'} Notes`,
        image: '/logo.png',
        handler: (response: { razorpay_payment_id: string }) => {
          setIsProcessing(false);
          setSuccessNotice(`Payment of ₹${selectedAmount} successful! (ID: ${response.razorpay_payment_id}). Starting download...`);
          setTimeout(() => {
            onProceedDownload();
            onClose();
            setSuccessNotice(null);
          }, 1200);
        },
        prefill: {
          name: 'B.Pharm Student',
          email: 'bpharmhub@gmail.com',
        },
        theme: {
          color: '#2EC4B6',
        },
        modal: {
          ondismiss: () => {
            setIsProcessing(false);
          },
        },
      };

      const razorpayInstance = new (window as any).Razorpay(options);
      razorpayInstance.on('payment.failed', (resp: { error: { description: string } }) => {
        setIsProcessing(false);
        setErrorNotice(resp.error?.description || 'Payment failed or cancelled.');
      });
      razorpayInstance.open();
    } catch (err) {
      setIsProcessing(false);
      setErrorNotice(err instanceof Error ? err.message : 'Failed to launch Razorpay.');
    }
  };

  const handleContinueWithoutSupporting = () => {
    onProceedDownload();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && resource && (
        <motion.div
          key="support-modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-900/50 dark:bg-black/85 p-4 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
          onClick={onClose}
        >
          <motion.div
            key="support-modal-card"
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 10 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-xl overflow-hidden rounded-[28px] border border-[var(--border-hairline)] bg-[var(--bg-surface)] dark:bg-[#0A1618] p-7 sm:p-9 text-[var(--text-primary)] dark:text-white shadow-2xl dark:border-[#2EC4B6]/30 dark:shadow-teal-950/60"
          >
            {/* Top Close Button */}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close modal"
              className="absolute right-6 top-6 flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition-colors hover:bg-slate-200 dark:bg-white/10 dark:text-slate-300 dark:hover:bg-[#2EC4B6]/20 dark:hover:text-[#2EC4B6]"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Support Our Platform Pill Badge */}
            <div className="inline-flex items-center gap-1.5 rounded-full border border-[var(--brand-teal)]/30 bg-[var(--brand-mint-soft)] dark:border-[#2EC4B6]/35 dark:bg-[#2EC4B6]/15 px-3.5 py-1 text-xs font-semibold text-[var(--brand-teal)] dark:text-[#2EC4B6]">
              <span>Support Our Platform</span>
              <span role="img" aria-label="gift heart">💝</span>
            </div>

            {/* Bold Headline */}
            <h2 className="mt-4 text-2xl font-bold tracking-tight text-[var(--text-primary)] dark:text-white sm:text-[28px] leading-[1.25]">
              We have removed ads and made all our notes and resources completely free to keep education accessible for everyone.
            </h2>

            {/* Subtitle Description */}
            <p className="mt-3 text-sm leading-relaxed text-[var(--text-secondary)] dark:text-slate-300">
              Your contribution helps us maintain the servers, create new content, and keep this platform running for thousands of students like you.
            </p>

            {/* Feedback Alerts */}
            {successNotice && (
              <div className="mt-4 flex items-center gap-2 rounded-2xl border border-emerald-500/40 bg-emerald-50 dark:bg-emerald-500/15 p-3.5 text-xs font-medium text-emerald-800 dark:text-emerald-300">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>{successNotice}</span>
              </div>
            )}

            {errorNotice && (
              <div className="mt-4 flex items-center gap-2 rounded-2xl border border-rose-500/40 bg-rose-50 dark:bg-rose-500/15 p-3.5 text-xs font-medium text-rose-800 dark:text-rose-300">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorNotice}</span>
              </div>
            )}

            {/* Donation Amount Selection Grid */}
            <div className="mt-6 grid grid-cols-4 gap-2.5 sm:gap-3">
              {DONATION_AMOUNTS.map((amt) => {
                const isSelected = selectedAmount === amt;
                return (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setSelectedAmount(amt)}
                    className={`rounded-2xl py-3 text-center text-base font-bold transition-all ${isSelected
                        ? 'bg-gradient-to-r from-[#0D5C63] to-[#2EC4B6] text-white shadow-lg shadow-teal-700/25 dark:shadow-teal-500/30 scale-[1.02] border border-transparent dark:border-[#2EC4B6]'
                        : 'border border-[var(--border-hairline)] bg-[var(--bg-subtle)] text-[var(--text-primary)] hover:border-[var(--brand-teal)]/40 hover:bg-[var(--bg-canvas)] dark:border-[#1E383C] dark:bg-[#122428]/70 dark:text-slate-200 dark:hover:bg-[#122428] dark:hover:border-[#2EC4B6]/50 dark:hover:text-white'
                      }`}
                  >
                    ₹{amt}
                  </button>
                );
              })}
            </div>

            {/* Action Buttons */}
            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleSupportAndContinue}
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#0D5C63] via-[#14959E] to-[#2EC4B6] py-3.5 px-6 text-sm font-bold text-white shadow-lg shadow-teal-800/25 dark:shadow-teal-500/30 transition-all hover:from-[#094449] hover:via-[#0D5C63] hover:to-[#25A89B] hover:shadow-teal-400/40 active:scale-[0.98] disabled:opacity-50"
              >
                <Heart className="h-4 w-4 fill-current" />
                <span>{isProcessing ? 'Opening Razorpay...' : 'Support & Continue'}</span>
              </button>

              <button
                type="button"
                onClick={handleContinueWithoutSupporting}
                className="flex-1 rounded-2xl border border-[var(--border-hairline)] bg-[var(--bg-subtle)] py-3.5 px-6 text-center text-sm font-medium text-[var(--text-secondary)] transition-colors hover:border-[var(--brand-teal)]/40 hover:text-[var(--text-primary)] hover:bg-[var(--bg-canvas)] dark:border-[#1E383C] dark:bg-[#122428]/80 dark:text-slate-300 dark:hover:bg-[#1A3338] dark:hover:border-[#2EC4B6]/40 dark:hover:text-white"
              >
                Continue without supporting
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
