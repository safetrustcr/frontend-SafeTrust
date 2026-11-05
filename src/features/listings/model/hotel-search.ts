import { isIsoDate } from "@/lib/date";

export type HotelSearch = {
  where: string;
  from: string | null;
  to: string | null;
};

export function parseHotelSearch(params: URLSearchParams): HotelSearch {
  const where = (params.get("where") ?? "").trim().slice(0, 80);
  const from = params.get("from");
  const to = params.get("to");
  const validRange =
    !!from && !!to && isIsoDate(from) && isIsoDate(to) && from < to;
  return { where, from: validRange ? from : null, to: validRange ? to : null };
}

export function hotelSearchHref(s: Partial<HotelSearch>): string {
  const q = new URLSearchParams();
  if (s.where?.trim()) q.set("where", s.where.trim());
  if (s.from && s.to) {
    q.set("from", s.from);
    q.set("to", s.to);
  }
  const qs = q.toString();
  return qs ? `/hotels/search?${qs}` : "/hotels/search";
}
