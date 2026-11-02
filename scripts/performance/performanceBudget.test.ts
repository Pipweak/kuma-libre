import { describe, expect, it } from 'vitest';

import {
  findPerformanceBudgetViolations,
  formatKibibytes,
  type PerformanceBudgets,
} from './performanceBudget';

const BUDGETS: PerformanceBudgets = {
  criticalCssGzipBytes: 100,
  criticalJavaScriptGzipBytes: 200,
  emittedBrandAssetBytes: 300,
  largestJavaScriptBytes: 400,
};

describe('findPerformanceBudgetViolations', () => {
  it('accepts metrics exactly at their budgets', () => {
    expect(findPerformanceBudgetViolations(BUDGETS, BUDGETS)).toEqual([]);
  });

  it('reports every metric that exceeds its budget', () => {
    expect(
      findPerformanceBudgetViolations(
        {
          criticalCssGzipBytes: 101,
          criticalJavaScriptGzipBytes: 200,
          emittedBrandAssetBytes: 301,
          largestJavaScriptBytes: 400,
        },
        BUDGETS,
      ),
    ).toEqual([
      'CSS critique gzip : 0.1 KiB > 0.1 KiB',
      'assets de marque émis : 0.3 KiB > 0.3 KiB',
    ]);
  });
});

describe('formatKibibytes', () => {
  it('uses a stable one-decimal KiB representation', () => {
    expect(formatKibibytes(1536)).toBe('1.5 KiB');
  });
});
