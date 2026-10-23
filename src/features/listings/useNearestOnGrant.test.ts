import { renderHook } from "@testing-library/react";
import type { GeoPoint } from "@/types/destination";
import {
  DEFAULT_FILTERS,
  type RentFilters,
} from "@/components/listings/filters/useRentFilters";
import { useNearestOnGrant } from "./useNearestOnGrant";

describe("useNearestOnGrant", () => {
  it("switches to nearest when location is granted and sort is relevance", () => {
    const setFilters = jest.fn();
    const filters: RentFilters = { ...DEFAULT_FILTERS, sort: "relevance" };
    let position: GeoPoint | null = null;
    const outside = false;

    const { rerender } = renderHook(() =>
      useNearestOnGrant(position, outside, filters, setFilters),
    );

    expect(setFilters).not.toHaveBeenCalled();

    // Grant position
    position = { lat: 9.93, lng: -84.08 };
    rerender();

    expect(setFilters).toHaveBeenCalledWith({ sort: "nearest" });
  });

  it("does not switch to nearest if outside Costa Rica", () => {
    const setFilters = jest.fn();
    const filters: RentFilters = { ...DEFAULT_FILTERS, sort: "relevance" };
    let position: GeoPoint | null = null;
    const outside = true;

    const { rerender } = renderHook(() =>
      useNearestOnGrant(position, outside, filters, setFilters),
    );

    position = { lat: 35.67, lng: 139.65 };
    rerender();

    expect(setFilters).not.toHaveBeenCalled();
  });

  it("never overrides a user-chosen sort (e.g. price-low)", () => {
    const setFilters = jest.fn();
    const filters: RentFilters = { ...DEFAULT_FILTERS, sort: "price-low" };
    let position: GeoPoint | null = null;
    const outside = false;

    const { rerender } = renderHook(() =>
      useNearestOnGrant(position, outside, filters, setFilters),
    );

    position = { lat: 9.93, lng: -84.08 };
    rerender();

    expect(setFilters).not.toHaveBeenCalled();
  });

  it("does not trigger repeatedly if position is unchanged", () => {
    const setFilters = jest.fn();
    const filters: RentFilters = { ...DEFAULT_FILTERS, sort: "relevance" };
    const pos = { lat: 9.93, lng: -84.08 };

    const { rerender } = renderHook(() =>
      useNearestOnGrant(pos, false, filters, setFilters),
    );

    // Initial mount with pos already there: previous.current initializes to pos
    expect(setFilters).not.toHaveBeenCalled();

    rerender();
    expect(setFilters).not.toHaveBeenCalled();
  });
});
