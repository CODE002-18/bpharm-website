import React, { useState, useMemo } from 'react';
import { Calculator, RotateCcw } from 'lucide-react';
import { motion } from 'motion/react';

interface SemesterRow {
  sem: number;
  sgpa: string;
  credits: string;
}

const DEFAULT_SEM_ROWS: SemesterRow[] = [
  { sem: 1, sgpa: '8.20', credits: '27' },
  { sem: 2, sgpa: '8.45', credits: '29' },
  { sem: 3, sgpa: '7.95', credits: '24' },
  { sem: 4, sgpa: '8.60', credits: '28' },
  { sem: 5, sgpa: '', credits: '26' },
  { sem: 6, sgpa: '', credits: '30' },
  { sem: 7, sgpa: '', credits: '24' },
  { sem: 8, sgpa: '', credits: '22' },
];

export const StudyToolsView: React.FC = () => {
  const [formulaMode, setFormulaMode] = useState<'aktu-official' | 'direct'>('aktu-official');
  const [semRows, setSemRows] = useState<SemesterRow[]>(DEFAULT_SEM_ROWS);

  const cgpaStats = useMemo(() => {
    let totalWeighted = 0;
    let totalCredits = 0;
    let filledCount = 0;

    for (const row of semRows) {
      const sgpaVal = parseFloat(row.sgpa);
      const credVal = parseFloat(row.credits);
      if (!isNaN(sgpaVal) && sgpaVal > 0 && sgpaVal <= 10 && !isNaN(credVal) && credVal > 0) {
        totalWeighted += sgpaVal * credVal;
        totalCredits += credVal;
        filledCount++;
      }
    }

    const cgpa = totalCredits > 0 ? totalWeighted / totalCredits : 0;
    let percentage = 0;
    if (cgpa > 0) {
      if (formulaMode === 'aktu-official') {
        percentage = (cgpa - 0.75) * 10;
      } else {
        percentage = cgpa * 10;
      }
    }

    const division =
      cgpa >= 7.5
        ? 'First Division with Honours / Distinction'
        : cgpa >= 6.0
          ? 'First Division'
          : cgpa >= 5.0
            ? 'Second Division'
            : 'In Progress';

    return {
      cgpa: cgpa.toFixed(2),
      percentage: Math.max(0, percentage).toFixed(2),
      totalCredits,
      filledCount,
      division,
    };
  }, [semRows, formulaMode]);

  const handleSgpaChange = (index: number, value: string) => {
    const next = [...semRows];
    next[index] = { ...next[index], sgpa: value };
    setSemRows(next);
  };

  const handleCreditChange = (index: number, value: string) => {
    const next = [...semRows];
    next[index] = { ...next[index], credits: value };
    setSemRows(next);
  };

  const handleClearAll = () => {
    setSemRows(semRows.map((row) => ({ ...row, sgpa: '' })));
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="border-b border-[var(--border-hairline)] pb-6">
        <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
          <Calculator className="h-4 w-4 text-[var(--brand-teal)]" />
          <span>AKTU Lucknow · B.Pharm Credit-Weighted Calculator</span>
        </div>
        <h1 className="mt-2 text-2xl font-bold text-[var(--text-primary)] sm:text-3xl">
          AKTU B.Pharm CGPA &amp; Percentage Calculator
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-[var(--text-secondary)]">
          Enter your semester-wise SGPA and PCI credits from Sem 1 to Sem 8 to calculate your exact cumulative CGPA,
          equivalent percentage, and AKTU division classification.
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
        className="mt-8 grid gap-8 lg:grid-cols-12 items-start"
      >
        <div className="lg:col-span-7 rounded-2xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--border-hairline)] pb-4">
            <div>
              <h2 className="text-lg font-bold text-[var(--text-primary)]">Semester SGPA &amp; Credit Entry</h2>
              <p className="text-xs text-[var(--text-secondary)]">
                Leave upcoming semesters blank to calculate your current cumulative CGPA.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1 rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-subtle)] p-1">
                <button
                  type="button"
                  onClick={() => setFormulaMode('aktu-official')}
                  className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap ${
                    formulaMode === 'aktu-official'
                      ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-xs'
                      : 'text-[var(--text-secondary)]'
                  }`}
                >
                  AKTU Official ((CGPA-0.75)×10)
                </button>
                <button
                  type="button"
                  onClick={() => setFormulaMode('direct')}
                  className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap ${
                    formulaMode === 'direct'
                      ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-xs'
                      : 'text-[var(--text-secondary)]'
                  }`}
                >
                  Direct (CGPA×10)
                </button>
              </div>
              <button
                type="button"
                onClick={handleClearAll}
                className="inline-flex items-center gap-1 rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-subtle)] px-2.5 py-1.5 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Clear
              </button>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {semRows.map((row, idx) => (
              <motion.div
                key={row.sem}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.15, delay: idx * 0.02 }}
                className="flex items-center justify-between gap-3 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-canvas)] p-3"
              >
                <span className="font-mono text-xs font-semibold text-[var(--text-primary)] w-14">
                  Sem {row.sem}
                </span>
                <div className="flex items-center gap-2">
                  <label className="text-xs text-[var(--text-secondary)]">
                    SGPA
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="10"
                      placeholder="e.g. 8.2"
                      value={row.sgpa}
                      onChange={(e) => handleSgpaChange(idx, e.target.value)}
                      className="ml-1.5 w-20 rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-2.5 py-1.5 font-mono text-xs text-[var(--text-primary)] focus:border-[var(--brand-teal)] focus:outline-none tabular-nums"
                    />
                  </label>
                  <label className="text-xs text-[var(--text-secondary)]">
                    Cr
                    <input
                      type="number"
                      min="1"
                      max="40"
                      value={row.credits}
                      onChange={(e) => handleCreditChange(idx, e.target.value)}
                      className="ml-1.5 w-14 rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-2 py-1.5 font-mono text-xs text-[var(--text-primary)] focus:border-[var(--brand-teal)] focus:outline-none tabular-nums"
                    />
                  </label>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-5 rounded-2xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-6">
          <div className="text-xs font-mono text-[var(--text-secondary)]">AKTU CREDIT-WEIGHTED RESULT</div>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-subtle)] p-4">
              <div className="text-xs text-[var(--text-secondary)]">Cumulative CGPA</div>
              <div className="mt-1 font-mono text-3xl font-bold text-[var(--brand-teal)] tabular-nums">
                {cgpaStats.cgpa}
              </div>
            </div>
            <div className="rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-subtle)] p-4">
              <div className="text-xs text-[var(--text-secondary)]">Equivalent %</div>
              <div className="mt-1 font-mono text-3xl font-bold text-[var(--text-primary)] tabular-nums">
                {cgpaStats.percentage}%
              </div>
            </div>
          </div>

          <div className="mt-5 space-y-2.5 border-t border-[var(--border-hairline)] pt-4 text-xs text-[var(--text-secondary)]">
            <div className="flex justify-between">
              <span>Semesters Counted:</span>
              <span className="font-mono font-semibold text-[var(--text-primary)] tabular-nums">
                {cgpaStats.filledCount} / 8
              </span>
            </div>
            <div className="flex justify-between">
              <span>Total PCI Credits Earned:</span>
              <span className="font-mono font-semibold text-[var(--text-primary)] tabular-nums">
                {cgpaStats.totalCredits} Credits
              </span>
            </div>
            <div className="flex justify-between">
              <span>AKTU Division Status:</span>
              <span className="font-semibold text-[var(--brand-teal)]">{cgpaStats.division}</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
