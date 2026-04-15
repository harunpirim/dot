import fs from 'fs';
import path from 'path';

const memosDir = path.resolve('src/memos');
const deleteMarker = /(^|\s)\[del\](?=\s|$)/im;

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

  for (const filePath of markdownFiles) {
    const content = fs.readFileSync(filePath, 'utf8');

    if (!deleteMarker.test(content)) continue;

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
