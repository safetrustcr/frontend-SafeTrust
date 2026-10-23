# Host guide

This guide walks you through setting up a host account, managing property listings, communicating with guests, and tracking escrows on SafeTrust.

---

## Get a host account

**You need:** a registered SafeTrust account.
**Saved?** Saved. Account roles are recorded in the backend `user_roles` database and provided through Firebase authentication claims.

1. Create a standard account or sign in at **/login**. All new accounts start with the `guest` role.
2. To request host privileges, contact the SafeTrust support or administration team through the help desk or contact channels.
3. The platform administrator grants the `host` role in the backend database.
4. Sign out and sign back in to refresh your account permissions. Your sidebar navigation will now show host options including **My apartments**, **New Apartment**, and **Escrow Dashboard**.

**If it doesn't work:** do not use an administrator account for hosting. If host links do not appear after approval, log out completely and log back in so your browser refreshes the authentication token.

---

## List a property

**You need:** a signed-in account with the host role.
**Saved?** Demo only. Listings are saved to the current demo repository and stored in your local session ([#590](https://github.com/safetrustcr/frontend-SafeTrust/issues/590)).

1. Open the sidebar navigation and select **New Apartment** (or navigate to **/dashboard/apartments/new**).
2. Enter the required property details: property name (**Title**), a clear **Description**, and the **Price** per night in USDC.
3. In the address section, specify the street, neighborhood, city, and province.
4. Enter the property coordinates (**Latitude** and **Longitude**). You can look up your property's GPS coordinates using an online map.
5. Select the number of **Bedrooms** and **Bathrooms**, choose the **Available from** date, and check **Pet friendly** if pets are allowed.
6. Check applicable amenities and paste your image URLs or select images to upload.
7. Select **Register** to submit your listing.

**If it doesn't work:** ensure all required fields are filled out and coordinates are valid decimal numbers. If submission fails, check for red error text below any missing fields.

---

## Edit or remove a property

**You need:** a signed-in host account with existing property listings.
**Saved?** Demo only. Changes stay in your current session and local repository ([#590](https://github.com/safetrustcr/frontend-SafeTrust/issues/590)).

1. Open the sidebar navigation and select **My apartments** (or go to **/dashboard/apartments**).
2. Locate the listing you want to change in the apartments table.
3. Select the action menu (**...**) at the right end of the listing row.
4. Choose **Edit** to update property details, pricing, or amenities, or choose **Remove** to delete the listing.
5. Confirm the action to apply the update.

**If it doesn't work:** if the action menu does not appear, make sure you are signed in as a host and refresh the page.

---

## See who's interested

**You need:** a signed-in host account with active listings.
**Saved?** Demo only. Rental offers are loaded from the mock offer repository ([#590](https://github.com/safetrustcr/frontend-SafeTrust/issues/590)).

1. In the sidebar navigation, select **Profile** (route **/dashboard/profile**).
2. In the profile settings sidebar under **Other**, select **Offers** (route **/dashboard/apartments/offers**).
3. Select the property you want to inspect to open the **Interested people** table.
4. Use the search box to find specific guests by name, phone, or wallet address. You can also filter by offer status or dates.
5. Review the guest details, offer date, and status.
6. Select **Accept** to accept an offer or **Reject** to decline it.

**If it doesn't work:** if no offers appear, verify you have selected the correct property or check that your listings have active inquiries.

---

## Answer messages

**You need:** a signed-in host account.
**Saved?** Demo only. Messages are stored in local browser state and mock conversation stores ([#591](https://github.com/safetrustcr/frontend-SafeTrust/issues/591)).

1. Open the sidebar navigation and select **Messages** (or go to **/dashboard/messages**).
2. Select a guest conversation thread from the left panel.
3. Review the conversation history and question about your property.
4. Type your reply in the message composer at the bottom of the window and select the send button.

**If it doesn't work:** if new messages do not appear right away, select the conversation thread again to refresh the message list.

---

## Notifications

**You need:** a signed-in account.
**Saved?** Demo only. Read status is maintained in your active session.

1. Open the sidebar navigation and select **Notifications** (or go to **/dashboard/notifications**).
2. Review notifications by category:
   - **Escrow funded**: informs you that a guest deposited funds for a booking.
   - **Bid accepted / offers**: updates when an offer status changes.
   - **Action required**: alerts you when a contract milestone needs host signature or confirmation.
3. Click any notification item to mark it as read and view related details.
4. Select **Mark all as read** at the top right to clear all unread notification badges.

**If it doesn't work:** if unread badges persist after selecting **Mark all as read**, reload the page.

---

## Track escrows

**You need:** a signed-in host account and a connected Stellar wallet.
**Saved?** Saved. Escrow contract statuses are synced with the Stellar blockchain.

1. Open the sidebar navigation and select **Escrow Dashboard** (or go to **/dashboard/escrow-dashboard**).
2. Check your active contracts against the six lifecycle statuses:
   - **Pending:** The escrow contract has been created and is waiting for the guest to deposit funds.
   - **Funded:** The guest has deposited USDC into the contract on Stellar.
   - **Check-in Approved:** The guest has arrived at the property and verified check-in.
   - **Check-out Approved:** The stay is finished and departure conditions are verified.
   - **Completed:** All funds and deposits have been disbursed to host and guest.
   - **Cancelled:** The reservation was cancelled before stay or refunded under contract terms.
3. Select any escrow card or contract row to view transaction hashes and milestone timestamps.
4. To learn what conditions release the payment, read **[How escrow payments work](/help/escrow-explained)**.

**If it doesn't work:** if your dashboard does not show a recent transaction, check that your wallet is on the correct network (Testnet) and select the refresh option.

---

## Hotels

**You need:** a signed-in account.
**Saved?** Demo only. Hotel features are an experimental prototype ([#664](https://github.com/safetrustcr/frontend-SafeTrust/issues/664)).

1. The sidebar navigation contains **Hotels** and **New Hotel**, which are marked as demo features.
2. These routes demonstrate experimental hotel management and do not process live bookings.
3. To list and manage actual rental properties today, always use **New Apartment** (route **/dashboard/apartments/new**).

**If it doesn't work:** do not use **Hotels** for live guest reservations. Use **My apartments** and **New Apartment** for all active listings.
