"use client";

import { createContext, useContext, type ReactNode } from "react";
import { MESSAGES_HREF } from "../model/routes";

type MessagesAreaValue = {
  /** Base path of the inbox: `/dashboard/messages` or `/guest/messages`. */
  base: string;
  /** Guest area: only conversations where the signed-in user is the guest. */
  guestOnly: boolean;
};

const MessagesAreaContext = createContext<MessagesAreaValue>({
  base: MESSAGES_HREF,
  guestOnly: false,
});

/** Scopes the messaging components to the dashboard or the guest area. */
export function MessagesArea({
  base,
  guestOnly = false,
  children,
}: MessagesAreaValue & { guestOnly?: boolean; children: ReactNode }) {
  return (
    <MessagesAreaContext.Provider value={{ base, guestOnly }}>
      {children}
    </MessagesAreaContext.Provider>
  );
}

export const useMessagesArea = () => useContext(MessagesAreaContext);
