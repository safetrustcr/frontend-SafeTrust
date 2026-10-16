const fs = require("fs");
const path = require("path");
const zlib = require("zlib");
const { GROUP_BUDGETS } = require("./route-budgets");

const appManifestPath = path.join(
  process.cwd(),
  ".next",
  "app-build-manifest.json",
);

if (!fs.existsSync(appManifestPath)) {
  console.error(
    "Error: .next/app-build-manifest.json not found. Run 'npm run build' first.",
  );
  process.exit(1);
}

const appManifest = JSON.parse(fs.readFileSync(appManifestPath, "utf8"));

let hasFailure = false;

console.log("Checking route group first-load JS gzip budgets...\n");

for (const [_groupKey, group] of Object.entries(GROUP_BUDGETS)) {
  console.log(`--- ${group.name} (Budget: <= ${group.maxKb} kB) ---`);
  let maxFoundInGroup = 0;

  for (const route of group.routes) {
    const chunks = appManifest.pages[route];
    if (!chunks) {
      console.warn(`  [WARN] Route ${route} not found in manifest`);
      continue;
    }

    const uniqueChunks = Array.from(new Set(chunks));
    let totalGzipBytes = 0;

    for (const chunk of uniqueChunks) {
      const chunkPath = path.join(process.cwd(), ".next", chunk);
      if (fs.existsSync(chunkPath)) {
        totalGzipBytes += zlib.gzipSync(fs.readFileSync(chunkPath)).length;
      }
    }

    const totalKb = Math.round(totalGzipBytes / 1024);
    if (totalKb > maxFoundInGroup) {
      maxFoundInGroup = totalKb;
    }

    const status = totalKb <= group.maxKb ? "PASS" : "FAIL";
    if (status === "FAIL") {
      hasFailure = true;
      console.error(
        `  [${status}] ${route}: ${totalKb} kB (exceeds ${group.maxKb} kB)`,
      );
    } else {
      console.log(`  [${status}] ${route}: ${totalKb} kB`);
    }
  }

  console.log(
    `  Max first-load in ${group.name}: ${maxFoundInGroup} kB / ${group.maxKb} kB\n`,
  );
}

if (hasFailure) {
  console.error("Size check FAILED: one or more routes exceeded their budget.");
  process.exit(1);
} else {
  console.log("All route groups are within first-load JS budgets!");
}
