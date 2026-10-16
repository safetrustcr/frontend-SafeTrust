"use client";

import { getUnreadCount } from "../data/repository";

export function useUnreadCount(userId?: string): number {
  return userId ? getUnreadCount(userId) : 0;
}
