import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const ROOTS = [
  join(process.cwd(), "src/components/dashboard/apartments"),
  join(process.cwd(), "src/app/dashboard/apartments"),
];

const sources = (directory: string): string[] =>
  readdirSync(directory).flatMap((name) => {
    const path = join(directory, name);
    if (statSync(path).isDirectory()) return sources(path);
    return /\.tsx?$/.test(name) && !/\.test\.tsx?$/.test(name) ? [path] : [];
  });

it("apartment screens have no stub delays or skeleton-mode copy", () => {
  const offenders = ROOTS.flatMap(sources).filter((path) =>
    /setTimeout|skeleton mode/.test(readFileSync(path, "utf8")),
  );
  expect(offenders).toEqual([]);
});
