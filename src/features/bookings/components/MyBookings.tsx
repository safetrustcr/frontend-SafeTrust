"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Calendar, Compass, Building, ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/layouts/PageHeader";
import { Button } from "@/components/ui/button";
import { EscrowStatusBadge } from "@/components/dashboard/EscrowStatusBadge";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { DEMO_BOOKINGS, type BookingItem } from "@/features/bookings";
import { cn } from "@/lib/utils";

type FilterTab = "All" | "Active" | "Completed" | "Disputed" | "Cancelled";
type ActiveRoleTab = "guest" | "host";

const FILTER_TABS: FilterTab[] = [
  "All",
  "Active",
  "Completed",
  "Disputed",
  "Cancelled",
];

export interface MyBookingsProps {
  initialBookings?: BookingItem[];
  userRoles?: ("guest" | "host")[];
}

export function MyBookings({
  initialBookings = DEMO_BOOKINGS,
  userRoles,
}: MyBookingsProps) {
  const router = useRouter();
  const { user } = useCurrentUser();

  // If userRoles is passed in via props, use it; otherwise infer from useCurrentUser
  const roles: ("guest" | "host")[] = useMemo(() => {
    if (userRoles) return userRoles;
    const filtered = user?.roles?.filter(
      (r): r is "guest" | "host" => r === "guest" || r === "host",
    );
    if (filtered && filtered.length > 0) return filtered;
    return ["guest", "host"];
  }, [userRoles, user?.roles]);

  const hasGuest = roles.includes("guest");
  const hasHost = roles.includes("host");

  // Derive initial effective role
  const getEffectiveRole = (
    current: ActiveRoleTab,
    availableRoles: ("guest" | "host")[],
  ): ActiveRoleTab => {
    if (availableRoles.includes(current)) return current;
    if (availableRoles.includes("guest")) return "guest";
    if (availableRoles.includes("host")) return "host";
    return "guest";
  };

  const [activeRoleTab, setActiveRoleTab] = useState<ActiveRoleTab>(() =>
    hasGuest ? "guest" : "host",
  );
  const [activeFilter, setActiveFilter] = useState<FilterTab>("All");

  // Reconcile role selection when auth / roles change
  useEffect(() => {
    setActiveRoleTab((prev) => {
      const next = getEffectiveRole(prev, roles);
      if (next !== prev) {
        setActiveFilter("All");
      }
      return next;
    });
  }, [hasGuest, hasHost, roles]);

  const guestTabRef = useRef<HTMLButtonElement>(null);
  const hostTabRef = useRef<HTMLButtonElement>(null);

  const handleRoleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (!hasGuest || !hasHost) return;

    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      e.preventDefault();
      const nextRole: ActiveRoleTab =
        activeRoleTab === "guest" ? "host" : "guest";
      setActiveRoleTab(nextRole);
      setActiveFilter("All");
      if (nextRole === "guest") {
        guestTabRef.current?.focus();
      } else {
        hostTabRef.current?.focus();
      }
    }
  };

  const roleBookings = initialBookings.filter((b) => b.role === activeRoleTab);
  const filteredBookings = roleBookings.filter((booking) => {
    if (activeFilter === "All") return true;
    return booking.status.toLowerCase() === activeFilter.toLowerCase();
  });

  return (
    <div className="min-w-0 space-y-6">
      <PageHeader
        title="My bookings"
        description="Review your past and upcoming trips or manage guest reservations on your listings."
      />

      {/* Role Navigation Tabs (Trips vs Hosting) - hidden or single if user only has 1 role */}
      {hasGuest && hasHost ? (
        <div
          role="tablist"
          aria-label="Booking role"
          className="flex border-b border-border"
        >
          <button
            ref={guestTabRef}
            id="role-tab-guest"
            role="tab"
            aria-selected={activeRoleTab === "guest"}
            aria-controls="role-tabpanel-bookings"
            tabIndex={activeRoleTab === "guest" ? 0 : -1}
            onClick={() => {
              setActiveRoleTab("guest");
              setActiveFilter("All");
            }}
            onKeyDown={handleRoleKeyDown}
            className={cn(
              "px-4 py-2.5 text-sm font-medium border-b-2 transition-colors",
              activeRoleTab === "guest"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            Trips
          </button>
          <button
            ref={hostTabRef}
            id="role-tab-host"
            role="tab"
            aria-selected={activeRoleTab === "host"}
            aria-controls="role-tabpanel-bookings"
            tabIndex={activeRoleTab === "host" ? 0 : -1}
            onClick={() => {
              setActiveRoleTab("host");
              setActiveFilter("All");
            }}
            onKeyDown={handleRoleKeyDown}
            className={cn(
              "px-4 py-2.5 text-sm font-medium border-b-2 transition-colors",
              activeRoleTab === "host"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            Hosting
          </button>
        </div>
      ) : null}

      {/* Status Filters */}
      <nav
        aria-label="Filter bookings by status"
        className="flex gap-2 overflow-x-auto pb-1"
      >
        {FILTER_TABS.map((tab) => {
          const isSelected = activeFilter === tab;
          return (
            <button
              key={tab}
              type="button"
              aria-current={isSelected ? "true" : undefined}
              onClick={() => setActiveFilter(tab)}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors border shrink-0",
                isSelected
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background text-muted-foreground border-border hover:bg-muted hover:text-foreground",
              )}
            >
              {tab}
            </button>
          );
        })}
      </nav>

      {/* Content panel */}
      <div
        id="role-tabpanel-bookings"
        role={hasGuest && hasHost ? "tabpanel" : undefined}
        aria-labelledby={
          hasGuest && hasHost
            ? activeRoleTab === "guest"
              ? "role-tab-guest"
              : "role-tab-host"
            : undefined
        }
      >
        {filteredBookings.length === 0 ? (
          roleBookings.length > 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-card p-8 text-center sm:p-12">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted text-muted-foreground mb-4">
                {activeRoleTab === "guest" ? (
                  <Compass className="h-7 w-7" aria-hidden="true" />
                ) : (
                  <Building className="h-7 w-7" aria-hidden="true" />
                )}
              </div>
              <h3 className="text-lg font-semibold text-foreground">
                No bookings match this filter
              </h3>
              <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
                Try clearing your filter or choosing a different status.
              </p>
              <div className="mt-6">
                <Button
                  variant="outline"
                  onClick={() => setActiveFilter("All")}
                >
                  Clear filters
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-card p-8 text-center sm:p-12">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted text-muted-foreground mb-4">
                {activeRoleTab === "guest" ? (
                  <Compass className="h-7 w-7" aria-hidden="true" />
                ) : (
                  <Building className="h-7 w-7" aria-hidden="true" />
                )}
              </div>
              <h3 className="text-lg font-semibold text-foreground">
                {activeRoleTab === "guest"
                  ? "No trips yet, browse stays"
                  : "No bookings yet"}
              </h3>
              <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
                {activeRoleTab === "guest"
                  ? "Explore incredible places to stay and book securely with smart contract escrow."
                  : "You haven't received any bookings on your listings yet. Keep your listing details and availability updated."}
              </p>
              <div className="mt-6">
                {activeRoleTab === "guest" ? (
                  <Button asChild>
                    <Link
                      href="/rent"
                      className="inline-flex items-center gap-2"
                    >
                      Browse stays
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                  </Button>
                ) : (
                  <Button asChild>
                    <Link
                      href="/dashboard/apartments"
                      className="inline-flex items-center gap-2"
                    >
                      View your listings
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          )
        ) : (
          <div className="space-y-4">
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-hidden rounded-xl border border-border bg-card shadow-sm">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-border bg-muted/50 text-xs font-semibold text-muted-foreground uppercase">
                  <tr>
                    <th scope="col" className="px-5 py-3.5">
                      Stay
                    </th>
                    <th scope="col" className="px-5 py-3.5">
                      Dates
                    </th>
                    <th scope="col" className="px-5 py-3.5">
                      Amount
                    </th>
                    <th scope="col" className="px-5 py-3.5">
                      Status
                    </th>
                    <th scope="col" className="px-5 py-3.5 text-right">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredBookings.map((booking) => (
                    <tr
                      key={booking.id}
                      className="transition-colors hover:bg-muted/40"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3.5">
                          <div className="relative h-14 w-16 shrink-0 overflow-hidden rounded-lg border bg-muted">
                            <Image
                              src={booking.listingPhoto}
                              alt={booking.listingName}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-medium text-foreground">
                              {booking.listingName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {activeRoleTab === "guest"
                                ? `Host: ${booking.hostName ?? "Verified Host"}`
                                : `Guest: ${booking.guestName ?? "Verified Guest"}`}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap text-muted-foreground">
                        {booking.checkIn} → {booking.checkOut}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap font-semibold text-foreground">
                        ${booking.amount.toLocaleString()}{" "}
                        <span className="text-xs font-normal text-muted-foreground">
                          {booking.currency}
                        </span>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <EscrowStatusBadge status={booking.status} />
                      </td>
                      <td className="px-5 py-4 text-right whitespace-nowrap">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            router.push(
                              `/rent/${booking.listingId}/escrow/${booking.escrowId}`,
                            )
                          }
                        >
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View (Strictly no horizontal scroll at 360px) */}
            <div className="grid grid-cols-1 gap-3 md:hidden">
              {filteredBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="overflow-hidden rounded-xl border border-border bg-card p-4 shadow-sm"
                >
                  <div className="flex gap-3">
                    <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-lg border bg-muted">
                      <Image
                        src={booking.listingPhoto}
                        alt={booking.listingName}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="truncate text-sm font-semibold text-foreground">
                          {booking.listingName}
                        </h4>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {activeRoleTab === "guest"
                          ? `Host: ${booking.hostName ?? "Verified Host"}`
                          : `Guest: ${booking.guestName ?? "Verified Guest"}`}
                      </p>
                      <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar
                          className="h-3.5 w-3.5 shrink-0"
                          aria-hidden="true"
                        />
                        <span>
                          {booking.checkIn} - {booking.checkOut}
                        </span>
                      </p>
                      <div className="mt-2 flex items-center justify-between gap-2">
                        <p className="text-sm font-bold text-foreground">
                          ${booking.amount.toLocaleString()}{" "}
                          <span className="text-[10px] font-normal text-muted-foreground">
                            {booking.currency}
                          </span>
                        </p>
                        <EscrowStatusBadge status={booking.status} />
                      </div>
                    </div>
                  </div>
                  <div className="mt-3.5 border-t border-border pt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-xs font-medium"
                      onClick={() =>
                        router.push(
                          `/rent/${booking.listingId}/escrow/${booking.escrowId}`,
                        )
                      }
                    >
                      View details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function MyBookingsPage() {
  return <MyBookings />;
}
