// Vercel serverless function — uploads image to litterbox.catbox.moe (free temp host),
// creates a CMA session with the public URL for the agent to download.

export const config = { api: { bodyParser: false } };

async function readMultipart(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const body = Buffer.concat(chunks);
  const contentType = req.headers['content-type'] || '';
  const boundary = contentType.split('boundary=')[1];
  if (!boundary) throw new Error('No boundary in multipart');

  const parts = body.toString('binary').split('--' + boundary);
  for (const part of parts) {
    if (!part.includes('Content-Disposition')) continue;
    if (!part.includes('name="image"')) continue;
    const headerEnd = part.indexOf('\r\n\r\n');
    if (headerEnd === -1) continue;
    const headerSection = part.substring(0, headerEnd);
    const contentTypeMatch = headerSection.match(/Content-Type:\s*([^\r\n]+)/i);
    const mimeType = contentTypeMatch ? contentTypeMatch[1].trim() : 'image/jpeg';
    const imageData = Buffer.from(part.substring(headerEnd + 4).replace(/\r\n--$/, ''), 'binary');
    return { imageData, mimeType };
  }
  throw new Error('No image found in upload');
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  const agentId = process.env.CMA_AGENT_ID;
  const envId = process.env.CMA_ENV_ID;
  const vaultId = process.env.CMA_VAULT_ID;
  if (!apiKey || !agentId || !envId || !vaultId) {
    return res.status(500).json({ error: 'Server misconfigured — missing env vars' });
  }

  try {
    // 1. Parse the uploaded image
    const { imageData, mimeType } = await readMultipart(req);

    // 2. Upload to litterbox.catbox.moe — free temp host (1h), no auth needed
    const form = new FormData();
    const blob = new Blob([imageData], { type: mimeType });
    form.append('reqtype', 'fileupload');
    form.append('time', '1h');
    form.append('fileToUpload', blob, 'item.jpg');

    const uploadRes = await fetch('https://litterbox.catbox.moe/resources/internals/api.php', {
      method: 'POST',
      body: form,
    });
    if (!uploadRes.ok) throw new Error('Image host upload failed: ' + await uploadRes.text());
    const imageUrl = (await uploadRes.text()).trim();
    if (!imageUrl.startsWith('http')) throw new Error('Unexpected response from image host: ' + imageUrl);

    // 3. Create a CMA session
    const BASE = 'https://api.anthropic.com/v1';
    const headers = {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-beta': 'managed-agents-2026-04-01',
      'content-type': 'application/json',
    };

    const sessionRes = await fetch(`${BASE}/sessions`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        agent: agentId,
        environment_id: envId,
        vault_ids: [vaultId],
        title: 'photo-to-draft — ' + new Date().toISOString(),
      }),
    });
    if (!sessionRes.ok) throw new Error('Failed to create session: ' + await sessionRes.text());
    const session = await sessionRes.json();
    const sessionId = session.id;

    // 4. Kick off with the image URL
    const task = `A seller has uploaded a photo of an item they want to list on eBay.

Download the image and save it to /tmp/item_photo.jpg using your bash tool:
curl -sL "${imageUrl}" -o /tmp/item_photo.jpg

Then analyze /tmp/item_photo.jpg using your vision capability to identify the item (brand, model, type, condition).

After identifying the item:
1. Search eBay sold comps using the Finding API (findCompletedItems) to get low/avg/high sold prices
2. Write an SEO-optimized title (≤80 chars, keyword-first, no ALL CAPS)
3. Write a structured HTML description (bullets: what it is, condition, what's included)
4. Create a draft in eBay using AddItem with ScheduleTime 30 days from today at 10 AM Eastern
5. Write result.json to /mnt/session/outputs/ with: item_identified, title, price_recommended, comp_low, comp_avg, comp_high, ebay_item_id, schedule_time`;

    const rubric = `1. Image downloaded and item identified\n2. eBay sold comps found (low/avg/high)\n3. Title ≤80 chars, keyword-first, no ALL CAPS\n4. HTML description written\n5. AddItem succeeds — valid eBay Item ID in result.json\n6. ScheduleTime is 30+ days in the future`;

    const kickRes = await fetch(`${BASE}/sessions/${sessionId}/events`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        events: [{
          type: 'user.define_outcome',
          description: task,
          rubric: { type: 'text', content: rubric },
          max_iterations: 5,
        }],
      }),
    });
    if (!kickRes.ok) throw new Error('Failed to kick off session: ' + await kickRes.text());

    res.status(200).json({ session_id: sessionId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
