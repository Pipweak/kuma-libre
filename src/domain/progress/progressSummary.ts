import type { ProgressByEntry, QuizDirection } from '@/domain/quiz';

export type MasteryMetric = {
  masteredCount: number;
  percentage: number;
  totalCount: number;
};

export type ProgressSummary = {
  comprehension: MasteryMetric;
  overall: MasteryMetric;
  production: MasteryMetric;
};

function createMetric(masteredCount: number, totalCount: number): MasteryMetric {
  return {
    masteredCount,
    percentage: totalCount === 0 ? 0 : Math.round((masteredCount / totalCount) * 100),
    totalCount,
  };
}

function isMastered(progress: ProgressByEntry, entryId: string, direction: QuizDirection): boolean {
  return progress[entryId]?.[direction]?.score === 3;
}

/**
 * Summarizes direction-specific and overall mastery for one corpus scope.
 * Overall mastery requires the entry to be green in both directions.
 */
export function summarizeProgress(
  entryIds: readonly string[],
  progress: ProgressByEntry,
): ProgressSummary {
  let comprehensionCount = 0;
  let productionCount = 0;
  let overallCount = 0;

  for (const entryId of entryIds) {
    const comprehensionMastered = isMastered(progress, entryId, 'comprehension');
    const productionMastered = isMastered(progress, entryId, 'production');

    comprehensionCount += Number(comprehensionMastered);
    productionCount += Number(productionMastered);
    overallCount += Number(comprehensionMastered && productionMastered);
  }

  return {
    comprehension: createMetric(comprehensionCount, entryIds.length),
    overall: createMetric(overallCount, entryIds.length),
    production: createMetric(productionCount, entryIds.length),
  };
}
