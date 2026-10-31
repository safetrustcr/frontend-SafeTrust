# Guest guide

This guide walks you through finding a rental, contacting a host, and paying through an escrow on SafeTrust.

---

## Browse without an account

**You need:** a web browser and an internet connection.
**Saved?** Demo only. Your browsing state is kept in your browser and is not saved to a server.

1. Open **/rent** in your browser. This page is public and does not require an account.
2. In the destination carousel, select a destination card (such as **San José**, **Guanacaste**, or **Puntarenas**), or select **All of Costa Rica** to view every listing.
3. Select a category chip (such as **Family**, **Students**, or **Remote workers**). Category chips describe **who the place suits**, not how many guests can stay.
4. Scroll through the cards to view matching rental properties.

**If it doesn't work:** if listings do not appear, refresh your browser or select **Reset** in the toolbar to clear active filters.

---

## Use your location (optional)

**You need:** a device with location services and browser location permissions enabled.
**Saved?** Demo only. Coordinates stay in browser memory and are never saved to any server.

1. On **/rent**, find the toolbar above the property cards and select **Use my location**.
2. When your browser asks for permission, select **Allow**.
3. Listings reorder automatically by distance, and the **Sort** menu enables **Nearest**.
4. To remove your coordinates at any time, select **Clear location** in the toolbar.

**If it doesn't work:** sharing your location is completely optional. If permission is denied or your device lacks GPS, pick a destination card or choose **All of Costa Rica** instead.

---

## Filter and sort places

**You need:** an active browser window on **/rent**.
**Saved?** Saved in the address bar. Filter and sort settings update URL query parameters so you can bookmark or share the link.

1. On **/rent**, select **Filters** to open the filter drawer.
2. Enter a minimum and maximum price in USDC, or choose the number of bedrooms you need.
3. Select the **Sort** dropdown to sort listings by **Relevance**, **Price: Low to High**, **Price: High to Low**, or **Nearest** (available only after sharing location).
4. Review the updated listing results. To clear all active filters, chips, and sort choices, select **Reset**.

**If it doesn't work:** if no places match your criteria, select **Reset** to clear all filters and see all available listings.

---

## Open a place

**You need:** an active browser window on **/rent**.
**Saved?** Saved. Listing details are loaded from current rental data.

1. On **/rent**, select any rental card or click its title.
2. The browser navigates to the listing page at **/rent/[id]**.
3. Review photos, price per night in USDC, bedroom and bathroom counts, amenities, host details, and the location map.
4. Note the cancellation terms and checkout options.

**If it doesn't work:** if a listing fails to load or shows a broken link, return to **/rent** and select a different property.

---

## Get suggestions

**You need:** an active browser window or a signed-in guest account.
**Saved?** Demo only. Recommendations are generated from current featured properties.

1. Open the sidebar navigation and select **Suggestions view** (or go to **/guest/suggestions**).
2. Browse curated property cards grouped by travel style and location.
3. Select any suggestion card to view its full details and booking terms on **/rent/[id]**.

**If it doesn't work:** if recommendations do not show, navigate directly to **/rent** to explore all available listings.

---

## Save a place to your wishlist

**You need:** an account (sign in with email, Google, or a Stellar wallet).
**Saved?** Demo only. Wishlists are kept for this browser session ([#664](https://github.com/safetrustcr/frontend-SafeTrust/issues/664)).

1. On **/rent** or on any listing detail page at **/rent/[id]**, locate the listing card.
2. Select the **Heart** icon next to the title or on the card image. The heart icon fills to show the place is saved.
3. Open the sidebar navigation and select **Wishlists** (or go to **/dashboard/favorites**).
4. The saved place appears in your wishlist list.

**If it doesn't work:** if you are signed out, you will be redirected to **/login** and brought back to the listing once you sign in. Select the **Heart** icon again after signing in.

---

## Message the host

**You need:** a signed-in account.
**Saved?** Demo only. Conversations are stored in browser local storage and active session state ([#591](https://github.com/safetrustcr/frontend-SafeTrust/issues/591)).

1. On a listing card or detail page at **/rent/[id]**, select **Message host**.
2. The app opens the message composer at **/dashboard/messages/new?listing=[id]** (or opens your existing thread under **/dashboard/messages**).
3. Type your question in the text box at the bottom of the conversation window.
4. Press Enter or select the send icon to deliver your message.
5. Open **Messages** in the sidebar at any time to check for replies.

**If it doesn't work:** if you are signed out, you will be prompted to sign in before the chat screen opens.

---

## Create an account or sign in

**You need:** an email address and password, a Google account, or a Stellar wallet (such as Freighter).
**Saved?** Saved. User accounts and session tokens are stored securely through Firebase Authentication ([#667](https://github.com/safetrustcr/frontend-SafeTrust/issues/667)).

1. Select **Sign In** or **Register** from the header, or navigate to **/login** (or **/register**).
2. Choose your sign-in method: enter your email and password, select **Continue with Google**, or choose **Connect Stellar Wallet** with Freighter.
3. If you register with an email address, check your inbox for a verification email and visit **/verify-email** to confirm your account.
4. After signing in, SafeTrust automatically returns you to the page you were viewing before.

**If it doesn't work:** if your credentials are not recognized, check your email spelling or use password reset. If connecting with a wallet, make sure your Freighter browser extension is unlocked.

---

## Book and pay into escrow

**You need:** a signed-in account, a connected Stellar wallet (such as Freighter) set to the network shown on the page, and enough USDC balance for the reservation and network fee.
**Saved?** Saved. Escrow contracts are deployed and funded on the Stellar blockchain ([#698](https://github.com/safetrustcr/frontend-SafeTrust/issues/698)).

1. On a listing card or place page at **/rent/[id]**, select **Book**.
2. The app opens the checkout screen at **/rent/[id]/escrow/create**.
3. Review your dates, total USDC amount, and safety deposit terms.
4. Your payment is held safely in an escrow on Stellar until stay conditions are met. For release rules and milestone details, read **[How escrow payments work](/help/escrow-explained)**.
5. Select **Fund Escrow** and approve the transaction in your Freighter wallet popup.

**If it doesn't work:** if the transaction fails or the wallet prompt does not open, make sure your wallet is on the network shown on the page, has enough XLM on that network for transaction fees, and holds enough USDC.

---

## Check your bookings and escrows

**You need:** a signed-in account with active or past reservations.
**Saved?** Saved. Escrow status is retrieved directly from the Stellar blockchain.

1. Open the sidebar navigation and select **Escrows** (or go to **/dashboard/escrow**).
2. Review the list of your bookings, contract IDs, amounts, and current statuses (such as _Funded_, _Check-in Approved_, or _Completed_).
3. Select any escrow row to view contract transaction hashes or confirm your check-in when you arrive.

**If it doesn't work:** if a newly funded escrow does not appear right away, wait a few seconds for blockchain confirmation and refresh the page.
