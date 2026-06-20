# Next Directions — eBay Stale Listing Refresher

Planned upgrades in version order. Each item is ready to build when the prerequisite is in place.

---

## v1 — Weekly preview report (email + Google Sheet)

**What:** Before ending or relisting anything, the agent writes a preview report — one tab per week in a Google Sheet and an email to the founder — showing every item that's about to be processed: old title, proposed new title, days stale, scheduled go-live date. The run then proceeds automatically (or you can add an approval gate).

**Why deferred:** Needs Gmail API OAuth credentials and Google Sheets API credentials, which weren't on hand during the v0 build.

**How:**
1. Create a Google Cloud project, enable Gmail API + Sheets API, generate OAuth 2.0 credentials
2. Add to vault: `GMAIL_CREDENTIALS` (type: environment_variable) and `GOOGLE_SHEETS_CREDENTIALS` (type: environment_variable)
3. Update agent system prompt to write the preview Sheet tab first (using the Sheets API), send the email (using the Gmail API), then proceed with the ends and relists
4. Attach the vault to the deployment alongside the existing eBay vault

---

## v2 — Price comps alongside the relist (same Google Sheet, new columns)

**What:** For each relisted item, pull eBay's recent sold comps (low / avg / high) and add them as columns in the weekly Sheet tab. Flag any item where the founder's price is >20% off the average sold price.

**Why deferred:** Requires eBay Marketplace Insights API access (a separate entitlement from the standard Trading API) and depends on the v1 Sheet already existing.

**How:**
1. Apply for eBay Marketplace Insights API access at developer.ebay.com (may require partner approval)
2. Use `GET /buy/marketplace_insights/v1_beta/item_sales/search?q=<keywords>&category_ids=<id>` to pull sold comps per item
3. Add columns to the Sheet: `comp_low` · `comp_avg` · `comp_high` · `your_price` · `price_flag` (TRUE if >20% off avg)

---

## v3 — Eval regression check before any agent version promotion

**Reminder:** Before bumping the deployment to a new agent version, run `evals/run-evals.sh` against the new version. Only promote if all verdict criteria hold.
