# Next Directions — ebay-photo-to-draft

## v1 — Email notification
After the draft is created, send an email with the item title, recommended price, and a link to the eBay draft.
- Needs: Gmail MCP connector + vault credential, or a transactional email service (Resend/SendGrid)
- Mechanism: agent calls the email API after writing result.json

## v2 — Price comps in the result
Show the full eBay sold comps table (item title, sold price, sold date) in the page result so you can make an informed pricing decision before publishing.
- Already partially there — the agent fetches comps; just surface more detail in result.json

## v3 — Multi-photo upload
Send multiple photos at once; agent picks the clearest one for identification and includes all URLs in the eBay listing's PictureDetails so you don't have to add photos manually in Seller Hub.
- Mechanism: upload all images to Vercel Blob, pass all URLs to the agent, agent uses AddItem with PictureDetails array

## v4 — Category auto-confirm
Before creating the draft, show the detected category and ask for a quick tap to confirm or change it — prevents miscategorization on unusual items.
- Mechanism: two-step API flow (identify → confirm UI → AddItem)
