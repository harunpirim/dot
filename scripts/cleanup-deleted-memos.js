import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const memosDir = path.resolve('src/memos');
const deleteMarker = /(^|\s)\[del\](?=\s|$)/im;
const syncDeleteMarker = /\[del\]\s*([^\n\r]+)/gi;

function normalizeTitle(value) {
  return value
    .replace(/\s+\/\s+\d{4}-\d{2}-\d{2}$/, '')
    .replace(/[*_`~[\]#>:-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function getDeletedTitlesFromHeadCommit() {
  let message = '';

  try {
    message = execSync('git log -1 --pretty=%B', { encoding: 'utf8' });
  } catch {
    return new Set();
  }

  if (!message.startsWith('Sync from Mac mini:')) {
    return new Set();
  }

  const titles = new Set();
  let match;

  while ((match = syncDeleteMarker.exec(message)) !== null) {
    const normalized = normalizeTitle(match[1]);
    if (normalized) titles.add(normalized);
  }

  return titles;
}

function getMemoTitle(content) {
  const body = content.replace(/^---\s*[\r\n]+[\s\S]*?[\r\n]+---/, '').trim();
  const firstNonEmptyLine = body
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find(Boolean);

  return firstNonEmptyLine ? normalizeTitle(firstNonEmptyLine) : '';
}

function walkMarkdownFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const markdownFiles = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      markdownFiles.push(...walkMarkdownFiles(fullPath));
      continue;
    }

    if (entry.isFile() && entry.name.endsWith('.md')) {
      markdownFiles.push(fullPath);
    }
  }

  return markdownFiles;
}

function removeEmptyDirectories(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    removeEmptyDirectories(path.join(dir, entry.name));
  }

  if (dir === memosDir) return;

  if (fs.readdirSync(dir).length === 0) {
    fs.rmdirSync(dir);
  }
}

function main() {
  if (!fs.existsSync(memosDir)) {
    console.log('No src/memos directory found. Skipping.');
    return;
  }

  const markdownFiles = walkMarkdownFiles(memosDir);
  const deletedFiles = [];
  const deletedTitles = getDeletedTitlesFromHeadCommit();

  for (const filePath of markdownFiles) {
    const content = fs.readFileSync(filePath, 'utf8');
    const memoTitle = getMemoTitle(content);

    if (!deleteMarker.test(content) && !deletedTitles.has(memoTitle)) continue;

    fs.unlinkSync(filePath);
    deletedFiles.push(path.relative(process.cwd(), filePath));
  }

  removeEmptyDirectories(memosDir);

  if (deletedFiles.length === 0) {
    console.log('No [del]-marked memos found.');
    return;
  }

  console.log(`Deleted ${deletedFiles.length} memo(s):`);
  for (const filePath of deletedFiles) {
    console.log(`- ${filePath}`);
  }
}

main();
