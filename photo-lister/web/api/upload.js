// Edge Function — no execution timeout, native FormData, no Buffer needed.

export const config = { runtime: 'edge' };

const BOILERPLATE = `
<hr>
<p><strong>COMPATIBILITY / FITMENT</strong><br>
Buyer is responsible for confirming compatibility/fitment for their intended use. The pictures should do most of the describing and W.Y.S.I.W.Y.G (what you see is what you get).</p>

<p><strong>SHIPPING</strong><br>
Items ship quickly and are packed securely. For safe transit, detachable parts may be removed/disassembled and packaged separately.</p>

<p><strong>RETURNS &amp; ISSUES</strong><br>
Returns are handled according to the return policy shown in this listing and eBay's Money Back Guarantee. If there's a problem, please message us through eBay first, and we'll work with you to resolve it quickly.</p>

<p><strong>PAYMENT</strong><br>
Payment is processed through eBay checkout using the payment methods available there.</p>

<p><strong>FRAUD PREVENTION</strong><br>
We record serial numbers/unique identifiers where applicable.</p>

<p><strong>SHIPPING COST</strong><br>
Shipping is calculated by eBay based on package size/weight, destination, and carrier rates.</p>`;

const TASK = (imageUrl) => `A seller has uploaded a photo of an item they want to list on eBay.

Download the image and save it to /tmp/item_photo.jpg using your bash tool:
curl -sL "${imageUrl}" -o /tmp/item_photo.jpg

Then analyze /tmp/item_photo.jpg using your vision capability to identify the item (brand, model, type, condition).

After identifying the item:
1. Search eBay sold comps using the Finding API (findCompletedItems) to get low/avg/high sold prices
2. Write an SEO-optimized title (≤80 chars, keyword-first, no ALL CAPS)
3. Write a structured HTML description (bullets: what it is, condition, what's included). After your custom content, append this exact boilerplate HTML at the end of the description:
${BOILERPLATE}

4. Estimate the total shipping weight in ounces (item + typical packaging). For example: a power drill kit ~80-128oz, a small cup ~16-32oz.

5. Write result.json to /mnt/session/outputs/ with these exact fields:
   - item_identified: string describing what the item is
   - title: listing title (≤80 chars)
   - description: full HTML description string
   - price_recommended: number (no $ sign, e.g. 49.99)
   - comp_low: number
   - comp_avg: number
   - comp_high: number
   - category_id: eBay category ID as a string
   - condition_id: eBay condition code (1000=New, 3000=Used)
     - weight_oz: estimated package weight in ounces as a number
   - photo_url: the exact image URL you downloaded (i.e. "${imageUrl}")

DO NOT call eBay AddItem — the listing will be created separately.`;

const RUBRIC = `1. Image downloaded and item identified
2. eBay sold comps found (low/avg/high)
3. Title ≤80 chars, keyword-first, no ALL CAPS
4. HTML description written with boilerplate appended
5. result.json written with all required fields including photo_url`;

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export default async function handler(request) {
  if (request.method !== 'POST') return jsonResponse({ error: 'Method not allowed' }, 405);

  const apiKey = process.env.ANTHROPIC_API_KEY;
  const agentId = process.env.CMA_AGENT_ID;
  const envId = process.env.CMA_ENV_ID;
  const vaultId = process.env.CMA_VAULT_ID;
  if (!apiKey || !agentId || !envId || !vaultId) {
    return jsonResponse({ error: 'Server misconfigured — missing env vars' }, 500);
  }

  try {
    // 1. Parse image from form data (native Edge API — no manual multipart parsing)
    const formData = await request.formData();
    const imageFile = formData.get('image');
    if (!imageFile) throw new Error('No image found in upload');

    // 2. Upload to litterbox.catbox.moe (free temp host, 1h)
    const catboxForm = new FormData();
    catboxForm.append('reqtype', 'fileupload');
    catboxForm.append('time', '1h');
    catboxForm.append('fileToUpload', imageFile, 'item.jpg');

    const catboxRes = await fetch('https://litterbox.catbox.moe/resources/internals/api.php', {
      method: 'POST',
      body: catboxForm,
    });
    if (!catboxRes.ok) throw new Error('Image host upload failed: HTTP ' + catboxRes.status);
    const imageUrl = (await catboxRes.text()).trim();
    if (!imageUrl.startsWith('http')) throw new Error('Image host returned unexpected response: ' + imageUrl.substring(0, 100));

    // 3. Create CMA session
    const BASE = 'https://api.anthropic.com/v1';
    const cmaHeaders = {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-beta': 'managed-agents-2026-04-01',
      'content-type': 'application/json',
    };

    const sessionRes = await fetch(`${BASE}/sessions`, {
      method: 'POST',
      headers: cmaHeaders,
      body: JSON.stringify({
        agent: agentId,
        environment_id: envId,
        vault_ids: [vaultId],
        title: 'photo-to-draft — ' + new Date().toISOString(),
      }),
    });
    if (!sessionRes.ok) throw new Error('Failed to create session: ' + await sessionRes.text());
    const { id: sessionId } = await sessionRes.json();

    // 4. Kick off agent
    const kickRes = await fetch(`${BASE}/sessions/${sessionId}/events`, {
      method: 'POST',
      headers: cmaHeaders,
      body: JSON.stringify({
        events: [{
          type: 'user.define_outcome',
          description: TASK(imageUrl),
          rubric: { type: 'text', content: RUBRIC },
          max_iterations: 8,
        }],
      }),
    });
    if (!kickRes.ok) throw new Error('Failed to kick off session: ' + await kickRes.text());

    return jsonResponse({ session_id: sessionId });
  } catch (err) {
    return jsonResponse({ error: err.message }, 500);
  }
}
