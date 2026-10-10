import type {
  EscrowData,
  NotificationData,
} from "@/components/dashboard/RoleEscrowDashboard";

export const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

export type Demo<T> = T & { isDemo: true };

export function seededRandom(seed: number) {
  let value = seed >>> 0;
  return () => {
    value += 0x6d2b79f5;
    let result = Math.imul(value ^ (value >>> 15), 1 | value);
    result ^= result + Math.imul(result ^ (result >>> 7), 61 | result);
    return ((result ^ (result >>> 14)) >>> 0) / 4294967296;
  };
}

export const seedFor = (uid: string) =>
  [...uid].reduce(
    (hash, character) => (hash * 31 + character.charCodeAt(0)) | 0,
    7,
  );

const HOTELS = [
  "Grand Plaza Hotel",
  "Oceanview Resort & Spa",
  "Mountain Peak Lodge",
  "Sunset Beach Resort",
  "Downtown Suites",
  "Royal Garden Hotel",
  "Alpine Chalet",
  "Metropolitan Tower",
  "Palm Oasis Resort",
  "Harborview Inn",
];

const STATUSES: EscrowData["status"][] = [
  "pending",
  "funded",
  "check_in_approved",
  "check_out_approved",
  "completed",
  "cancelled",
];

const MILESTONES = [
  { id: "deposit", name: "Deposit" },
  { id: "check_in", name: "Check-in" },
  { id: "check_out", name: "Check-out" },
  { id: "release", name: "Funds Release" },
];

export function generateMockEscrows(
  count: number,
  uid: string,
): Demo<EscrowData>[] {
  const random = seededRandom(seedFor(uid));
  const baseDate = Date.UTC(2025, 0, 1);

  return Array.from({ length: count }, (_, index) => {
    const status = STATUSES[Math.floor(random() * STATUSES.length)];
    const checkInDate = new Date(
      baseDate + Math.floor(random() * 90) * 86400000,
    );
    const checkOutDate = new Date(
      checkInDate.getTime() + (Math.floor(random() * 14) + 1) * 86400000,
    );
    const createdAt = new Date(baseDate - Math.floor(random() * 60) * 86400000);
    const updatedAt = new Date(
      createdAt.getTime() + Math.floor(random() * 30) * 86400000,
    );
    const hotelName = HOTELS[Math.floor(random() * HOTELS.length)];
    const milestoneStatuses = MILESTONES.map((milestone) => {
      let milestoneStatus: NonNullable<
        EscrowData["milestones"]
      >[number]["status"] = "pending";

      if (milestone.id === "deposit") {
        milestoneStatus =
          status === "pending" || status === "cancelled"
            ? "pending"
            : "completed";
      } else if (milestone.id === "check_in") {
        if (
          ["check_in_approved", "check_out_approved", "completed"].includes(
            status,
          )
        ) {
          milestoneStatus = "completed";
        } else if (status === "funded") {
          milestoneStatus = "in_progress";
        }
      } else if (milestone.id === "check_out") {
        if (status === "check_out_approved" || status === "completed") {
          milestoneStatus = "completed";
        } else if (status === "check_in_approved") {
          milestoneStatus = "in_progress";
        }
      } else if (status === "completed") {
        milestoneStatus = "completed";
      }

      const milestoneDate =
        milestone.id === "check_in"
          ? checkInDate
          : milestone.id === "check_out"
            ? checkOutDate
            : milestone.id === "release"
              ? new Date(checkOutDate.getTime() + 86400000)
              : new Date(createdAt.getTime() + 86400000);

      return {
        id: milestone.id,
        name: milestone.name,
        status: milestoneStatus,
        dueDate: milestoneDate.toISOString(),
        ...(milestoneStatus === "completed"
          ? {
              completedAt: new Date(
                milestoneDate.getTime() + 3600000,
              ).toISOString(),
            }
          : {}),
      };
    });

    return {
      isDemo: true,
      id: `demo-escrow-${String(index + 1).padStart(4, "0")}`,
      contractId: `DEMO-${String(index + 1).padStart(4, "0")}`,
      status,
      amount: Math.floor(random() * 5000) + 500,
      asset: { code: "XLM" },
      metadata: {
        bookingId: `DEMO-BK${String(index + 1).padStart(4, "0")}`,
        hotelName,
        checkInDate: checkInDate.toISOString(),
        checkOutDate: checkOutDate.toISOString(),
        counterparty: index % 2 === 0 ? "Demo host" : "Demo guest",
      },
      nextMilestone: milestoneStatuses.find(
        (milestone) => milestone.status !== "completed",
      )?.id,
      milestones: milestoneStatuses,
      marker: "DEMO",
      createdAt: createdAt.toISOString(),
      updatedAt: updatedAt.toISOString(),
    };
  });
}

export function generateMockNotifications(
  escrows: Demo<EscrowData>[],
): Demo<NotificationData>[] {
  return escrows
    .flatMap((escrow, index) => {
      const bookingId = escrow.metadata?.bookingId ?? "N/A";
      const hotel = escrow.metadata?.hotelName
        ? ` at ${escrow.metadata.hotelName}`
        : "";
      const messageByStatus: Record<EscrowData["status"], string> = {
        pending: `Update for booking #${bookingId}${hotel}`,
        funded: `Booking #${bookingId}${hotel} has been funded`,
        check_in_approved: `Check-in approved for booking #${bookingId}${hotel}`,
        check_out_approved: `Check-out completed for booking #${bookingId}${hotel}`,
        completed: `Booking #${bookingId}${hotel} has been completed`,
        cancelled: `Booking #${bookingId}${hotel} was cancelled`,
      };
      const type: NotificationData["type"] =
        escrow.status === "funded" || escrow.status === "completed"
          ? "payment"
          : escrow.status === "cancelled"
            ? "alert"
            : "milestone";

      return [
        {
          isDemo: true as const,
          id: `demo-notification-${escrow.id}`,
          type,
          message: messageByStatus[escrow.status],
          timestamp: escrow.updatedAt,
          read: index % 2 === 0,
          escrowId: escrow.id,
        },
      ];
    })
    .sort(
      (first, second) =>
        Date.parse(second.timestamp) - Date.parse(first.timestamp),
    );
}
