import { describe, it, expect } from "@jest/globals";
import { notificationHref, NOTIFICATIONS_PATH } from "./notificationHref";

describe("notificationHref", () => {
  it("returns escrow path when escrowId is present and valid", () => {
    const notification = {
      id: "notif-1",
      type: "milestone" as const,
      message: "Test message",
      timestamp: "2024-01-01T00:00:00Z",
      read: false,
      escrowId: "ST-1-1714000000000",
    };
    expect(notificationHref(notification)).toBe(
      "/dashboard/escrow/ST-1-1714000000000",
    );
  });

  it("returns inbox path with anchor when escrowId is missing", () => {
    const notification = {
      id: "notif-2",
      type: "payment" as const,
      message: "Test message",
      timestamp: "2024-01-01T00:00:00Z",
      read: false,
    };
    expect(notificationHref(notification)).toBe(
      `${NOTIFICATIONS_PATH}#notification-notif-2`,
    );
  });

  it("returns inbox path with anchor when escrowId is invalid (unsafe characters)", () => {
    const notification = {
      id: "notif-3",
      type: "alert" as const,
      message: "Test message",
      timestamp: "2024-01-01T00:00:00Z",
      read: false,
      escrowId: "../../malicious-path",
    };
    expect(notificationHref(notification)).toBe(
      `${NOTIFICATIONS_PATH}#notification-notif-3`,
    );
  });

  it("returns inbox path with anchor when escrowId is invalid (special characters)", () => {
    const notification = {
      id: "notif-4",
      type: "milestone" as const,
      message: "Test message",
      timestamp: "2024-01-01T00:00:00Z",
      read: false,
      escrowId: "ST-1<script>alert(1)</script>",
    };
    expect(notificationHref(notification)).toBe(
      `${NOTIFICATIONS_PATH}#notification-notif-4`,
    );
  });

  it("handles alphanumeric with hyphens and underscores as valid", () => {
    const notification = {
      id: "notif-5",
      type: "milestone" as const,
      message: "Test message",
      timestamp: "2024-01-01T00:00:00Z",
      read: false,
      escrowId: "ST-1_1714000000000-test",
    };
    expect(notificationHref(notification)).toBe(
      "/dashboard/escrow/ST-1_1714000000000-test",
    );
  });
});
