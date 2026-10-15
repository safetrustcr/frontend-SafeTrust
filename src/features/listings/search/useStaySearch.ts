"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { localToday } from "./date-only";
import { parseStaySearch } from "./stay-search";

export function useStaySearch() {
  const params = useSearchParams();
  const paramsString = params.toString();
  const [today] = useState(localToday); // fixed for the session; no midnight flicker
  const search = useMemo(
    () => parseStaySearch(new URLSearchParams(paramsString), today),
    [paramsString, today],
  );
  return { search, today };
}
