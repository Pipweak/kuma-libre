export type PerformanceMetrics = {
  criticalCssGzipBytes: number;
  criticalJavaScriptGzipBytes: number;
  emittedBrandAssetBytes: number;
  largestJavaScriptBytes: number;
};

export type PerformanceBudgets = PerformanceMetrics;

export const V1_PERFORMANCE_BUDGETS: PerformanceBudgets = {
  criticalCssGzipBytes: 16 * 1024,
  criticalJavaScriptGzipBytes: 220 * 1024,
  emittedBrandAssetBytes: 850 * 1024,
  largestJavaScriptBytes: 500_000,
};

const METRIC_LABELS: Record<keyof PerformanceMetrics, string> = {
  criticalCssGzipBytes: 'CSS critique gzip',
  criticalJavaScriptGzipBytes: 'JavaScript critique gzip',
  emittedBrandAssetBytes: 'assets de marque émis',
  largestJavaScriptBytes: 'plus grand chunk JavaScript',
};

/** Compare production build metrics to the accepted V1 baseline budgets. */
export function findPerformanceBudgetViolations(
  metrics: PerformanceMetrics,
  budgets: PerformanceBudgets = V1_PERFORMANCE_BUDGETS,
): string[] {
  return (Object.keys(budgets) as Array<keyof PerformanceBudgets>)
    .filter((metric) => metrics[metric] > budgets[metric])
    .map(
      (metric) =>
        `${METRIC_LABELS[metric]} : ${formatKibibytes(metrics[metric])} > ${formatKibibytes(budgets[metric])}`,
    );
}

export function formatKibibytes(bytes: number): string {
  return `${(bytes / 1024).toFixed(1)} KiB`;
}
