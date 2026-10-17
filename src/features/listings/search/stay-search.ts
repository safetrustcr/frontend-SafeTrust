export interface StaySearch {
  q: string;
}

export const EMPTY_STAY_SEARCH: StaySearch = { q: "" };

export function readStaySearch(params: URLSearchParams): StaySearch {
  return { q: params.get("q") ?? "" };
}

export function writeStaySearch(search: StaySearch, params: URLSearchParams) {
  const query = search.q.trim();
  if (query) params.set("q", query);
  else params.delete("q");
}
