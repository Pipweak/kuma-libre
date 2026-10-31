import { readFile, readdir } from 'node:fs/promises';
import { dirname, extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';

import {
  findPerformanceBudgetViolations,
  formatKibibytes,
  type PerformanceMetrics,
} from './performanceBudget';

type ManifestChunk = {
  assets?: string[];
  css?: string[];
  file: string;
  imports?: string[];
  isEntry?: boolean;
};

type ViteManifest = Record<string, ManifestChunk>;

const REPOSITORY_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const DIST_ROOT = join(REPOSITORY_ROOT, 'dist');
const MANIFEST_PATH = join(DIST_ROOT, '.vite/manifest.json');

async function main(): Promise<void> {
  const manifest = parseManifest(JSON.parse(await readFile(MANIFEST_PATH, 'utf8')) as unknown);
  const criticalChunks = collectCriticalChunks(manifest);
  const criticalJavaScript = new Set<string>();
  const criticalCss = new Set<string>();

  for (const chunk of criticalChunks) {
    if (extname(chunk.file) === '.js') criticalJavaScript.add(chunk.file);
    for (const cssFile of chunk.css ?? []) criticalCss.add(cssFile);
  }

  const allAssetFiles = await listFiles(join(DIST_ROOT, 'assets'));
  const allJavaScript = allAssetFiles.filter((file) => extname(file) === '.js');
  const emittedBrandAssets = allAssetFiles.filter((file) =>
    /[\\/]kuma-[^\\/]+\.(?:avif|png|webp)$/u.test(file),
  );
  const metrics: PerformanceMetrics = {
    criticalCssGzipBytes: await totalGzipBytes(criticalCss),
    criticalJavaScriptGzipBytes: await totalGzipBytes(criticalJavaScript),
    emittedBrandAssetBytes: await totalBytes(emittedBrandAssets),
    largestJavaScriptBytes: Math.max(...(await Promise.all(allJavaScript.map(fileSize))), 0),
  };

  console.log(
    [
      `JavaScript critique gzip : ${formatKibibytes(metrics.criticalJavaScriptGzipBytes)}`,
      `CSS critique gzip : ${formatKibibytes(metrics.criticalCssGzipBytes)}`,
      `Plus grand chunk JavaScript : ${formatKibibytes(metrics.largestJavaScriptBytes)}`,
      `Assets de marque émis : ${formatKibibytes(metrics.emittedBrandAssetBytes)}`,
    ].join('\n'),
  );

  const violations = findPerformanceBudgetViolations(metrics);
  if (violations.length > 0) {
    throw new Error(`Budgets de performance dépassés :\n- ${violations.join('\n- ')}`);
  }
}

function parseManifest(value: unknown): ViteManifest {
  if (!isRecord(value)) throw new Error('Le manifeste Vite est invalide.');

  for (const [key, chunk] of Object.entries(value)) {
    if (!isRecord(chunk) || typeof chunk.file !== 'string') {
      throw new Error(`Entrée de manifeste invalide : ${key}.`);
    }
  }

  return value as ViteManifest;
}

function collectCriticalChunks(manifest: ViteManifest): ManifestChunk[] {
  const entry = manifest['index.html'];
  if (!entry?.isEntry) throw new Error("Le manifeste Vite ne contient pas l'entrée index.html.");

  const visited = new Set<string>();
  const chunks: ManifestChunk[] = [];
  const visit = (key: string): void => {
    if (visited.has(key)) return;
    visited.add(key);
    const chunk = manifest[key];
    if (!chunk) throw new Error(`Import statique absent du manifeste : ${key}.`);
    chunks.push(chunk);
    for (const importedKey of chunk.imports ?? []) visit(importedKey);
  };

  visit('index.html');
  return chunks;
}

async function listFiles(directory: string): Promise<string[]> {
  return (await readdir(directory, { withFileTypes: true })).flatMap((entry) =>
    entry.isFile() ? [join(directory, entry.name)] : [],
  );
}

async function totalGzipBytes(files: ReadonlySet<string>): Promise<number> {
  const sizes = await Promise.all(
    [...files].map(async (file) => gzipSync(await readFile(join(DIST_ROOT, file))).byteLength),
  );
  return sizes.reduce((sum, size) => sum + size, 0);
}

async function totalBytes(files: readonly string[]): Promise<number> {
  const sizes = await Promise.all(files.map(fileSize));
  return sizes.reduce((sum, size) => sum + size, 0);
}

async function fileSize(path: string): Promise<number> {
  return (await readFile(path)).byteLength;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

void main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
