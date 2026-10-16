import { readdirSync, readFileSync } from "node:fs";
import { join, relative, sep } from "node:path";

const appDirectory = join(process.cwd(), "src", "app");
const allowedClientPages = new Set([
  "bookings/[bookingId]/escrow/page.tsx",
  "bookings/new/escrow/page.tsx",
  "dashboard/apartments/[id]/edit/page.tsx",
  "dashboard/apartments/[id]/offers/page.tsx",
  "dashboard/escrow/page.tsx",
  "dashboard/favorites/page.tsx",
  "dashboard/hotels/[id]/edit/page.tsx",
  "dashboard/hotels/[id]/page.tsx",
  "dashboard/hotels/new/page.tsx",
  "dashboard/hotels/page.tsx",
  "dashboard/messages/[conversationId]/page.tsx",
  "dashboard/messages/page.tsx",
  "dashboard/notifications/page.tsx",
  "guest/suggestions/page.tsx",
  "hotels/search/page.tsx",
  "rent/[id]/escrow/[escrowId]/page.tsx",
  "rent/[id]/escrow/create/page.tsx",
  "rent/page.tsx",
  "room/page.tsx",
]);

function findPages(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      return findPages(path);
    }
    return entry.isFile() && entry.name === "page.tsx" ? [path] : [];
  });
}

const clientDirective =
  /^\uFEFF?\s*(?:(?:\/\/[^\r\n]*|\/\*[\s\S]*?\*\/)\s*)*["']use client["']\s*;?/;
const clientPages = new Set(
  findPages(appDirectory)
    .filter((path) => clientDirective.test(readFileSync(path, "utf8")))
    .map((path) => relative(appDirectory, path).split(sep).join("/")),
);
const unexpected = [...clientPages].filter(
  (path) => !allowedClientPages.has(path),
);
const stale = [...allowedClientPages].filter((path) => !clientPages.has(path));

if (unexpected.length || stale.length) {
  for (const path of unexpected) {
    console.error(`Unexpected client route page: src/app/${path}`);
  }
  for (const path of stale) {
    console.error(`Remove migrated page from allowlist: src/app/${path}`);
  }
  process.exitCode = 1;
} else {
  console.log(
    `Thin-page check passed (${clientPages.size} client route pages remain on the allowlist).`,
  );
}
