/**
 * First-load JS gzip budgets per runtime profile (FE-54).
 *
 * Current baseline measured from Next.js production build output (gzip):
 * - (marketing): 219 kB - 328 kB (target budget: ≤ 340 kB; 10% reduction from initial ~360 kB)
 * - (auth):      197 kB - 323 kB (target budget: ≤ 335 kB; 10% reduction from initial ~360 kB)
 * - (app):       192 kB - 308 kB (target budget: ≤ 320 kB; 10% reduction from initial ~350 kB)
 * - (checkout):  194 kB - 597 kB (target budget: ≤ 630 kB; 10% reduction from initial ~680 kB)
 *
 * Values in kilobytes (kB).
 */
const GROUP_BUDGETS = {
  marketing: {
    name: "(marketing)",
    maxKb: 340,
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
    maxKb: 335,
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
    maxKb: 320,
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
      "/(checkout)/hotels/[id]/book/page",
      "/(checkout)/rent/[id]/escrow/[escrowId]/page",
      "/(checkout)/rent/[id]/escrow/create/page",
      "/(checkout)/room/page",
    ],
  },
};

module.exports = { GROUP_BUDGETS };
