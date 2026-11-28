import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

const base = process.argv[2];
if (!base || !/^[0-9a-f]{40}$/.test(base)) throw new Error("Expected a full base commit SHA");
const files = execFileSync(
  "git",
  ["diff", "--diff-filter=d", "--name-only", "-z", `${base}...HEAD`],
  { encoding: "utf8" },
).split("\0").filter(Boolean);
const failures = [];
for (const file of files.filter((name) => /\.[cm]?[jt]sx?$/.test(name))) {
  const contents = readFileSync(file, "utf8");
  contents.split(/\r?\n/).forEach((line, index) => {
    if (/[\u202A-\u202E\u2066-\u2069\u200B-\u200D\uFEFF]/u.test(line)) failures.push(`${file}:${index + 1}: hidden Unicode control`);
    if (line.length > 500) failures.push(`${file}:${index + 1}: source line exceeds 500 characters`);
  });

  const dynamicCodePatterns = [
    /\beval\s*\(/gu,
    /\bnew\s+Function\s*\(/gu,
    /require\s*\(\s*["']vm["']\s*\)/gu,
  ];
  if (file !== "scripts/check-suspicious-code.mjs") {
    dynamicCodePatterns.push(/\bchild_process\b/gu);
  }
  for (const pattern of dynamicCodePatterns) {
    for (const match of contents.matchAll(pattern)) {
      const line = contents.slice(0, match.index).split(/\r?\n/).length;
      failures.push(`${file}:${line}: dangerous dynamic-code pattern`);
    }
  }
}
if (failures.length) { console.error(failures.join("\n")); process.exitCode = 1; }
else console.log(`Scanned ${files.length} changed files; no suspicious patterns found.`);
