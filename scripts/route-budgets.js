/**
 * First-load JS gzip budgets per runtime profile (FE-54).
 *
 * Current baseline measured from the route-group layouts in Next.js 15.5.27:
 * - (marketing): 530 kB - 610 kB (budget: ≤ 620 kB)
 * - (auth):      459 kB - 586 kB (budget: ≤ 600 kB)
 * - (app):       454 kB - 572 kB (budget: ≤ 585 kB)
 * - (checkout):  456 kB - 611 kB (budget: ≤ 630 kB)
 *
 * Values in kilobytes (kB).
 */
const GROUP_BUDGETS = {
  marketing: {
    name: "(marketing)",
    maxKb: 620,
    routes: [
      "/(marketing)/page",
      "/(marketing)/rent/page",
      "/(marketing)/rent/[id]/page",
      "/(marketing)/hotels/page",
      "/(marketing)/hotels/[id]/page",
      "/(marketing)/hotels/search/page",
      "/(marketing)/guest/suggestions/page",
    ],
  },
  auth: {
    name: "(auth)",
    maxKb: 600,
    routes: [
      "/(auth)/login/page",
      "/(auth)/register/page",
      "/(auth)/forgot-password/page",
      "/(auth)/reset-password/page",
      "/(auth)/verify-email/page",
    ],
  },
  app: {
    name: "(app)",
    maxKb: 585,
    routes: [
      "/(app)/dashboard/page",
      "/(app)/dashboard/apartments/page",
      "/(app)/dashboard/apartments/[id]/edit/page",
      "/(app)/dashboard/apartments/[id]/offers/page",
      "/(app)/dashboard/apartments/new/page",
      "/(app)/dashboard/escrow/page",
      "/(app)/dashboard/escrow-dashboard/page",
      "/(app)/dashboard/escrow/[id]/page",
      "/(app)/dashboard/favorites/page",
      "/(app)/dashboard/guest/page",
      "/(app)/dashboard/hotels/page",
      "/(app)/dashboard/hotels/[id]/page",
      "/(app)/dashboard/hotels/[id]/edit/page",
      "/(app)/dashboard/hotels/new/page",
      "/(app)/dashboard/messages/page",
      "/(app)/dashboard/messages/[conversationId]/page",
      "/(app)/dashboard/notifications/page",
      "/(app)/dashboard/profile/page",
      "/(app)/dashboard/users/page",
    ],
  },
  checkout: {
    name: "(checkout)",
    maxKb: 630,
    routes: [
      "/(checkout)/bookings/[bookingId]/escrow/page",
      "/(checkout)/bookings/new/escrow/page",
      "/(checkout)/hotels/[id]/book/page",
      "/(checkout)/rent/[id]/escrow/[escrowId]/page",
      "/(checkout)/rent/[id]/escrow/create/page",
      "/(checkout)/room/page",
    ],
  },
};

module.exports = { GROUP_BUDGETS };
