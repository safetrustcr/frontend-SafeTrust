/** @jest-environment node */
import { spawnSync } from "node:child_process";

const GUEST_PATHS = [
  "src/app/rent",
  "src/app/guest",
  "src/app/page.tsx",
  "src/components/listings",
  "src/features/listings",
  "src/components/DestinationCarousel.tsx",
];

it("guest UI has no hard-coded orange", () => {
  const result = spawnSync(
    "git",
    [
      "grep",
      "-nE",
      "orange-[0-9]|accent-orange",
      "--",
      ...GUEST_PATHS,
      ":!*.test.*",
    ],
    { encoding: "utf8" },
  );
  expect(result.error).toBeUndefined();
  expect(result.stderr).toBe("");
  expect(result.stdout).toBe("");
  // git grep exits with 1 when no matches exist, and 0 when the guard fails.
  expect(result.status).toBe(1);
});
