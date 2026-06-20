// Vercel serverless function — receives image, uploads to Anthropic Files API,
// creates a CMA session, returns session_id for polling.
import { put } from '@vercel/blob';

export const config = { api: { bodyParser: false } };

async function readMultipart(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const body = Buffer.concat(chunks);
  const contentType = req.headers['content-type'] || '';
  const boundary = contentType.split('boundary=')[1];
  if (!boundary) throw new Error('No boundary in multipart');

  // Parse multipart body — find the image part
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

    // 2. Upload image to Vercel Blob for a public URL the agent can download
    const blob = await put(`item-photos/${Date.now()}.jpg`, imageData, {
      access: 'public',
      contentType: mimeType,
    });
    const imageUrl = blob.url;

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

    // 4. Kick off with the outcome event
    const task = `A seller has uploaded a photo of an item they want to list on eBay.\n\nImage URL: ${imageUrl}\n\nIdentify the item, research eBay sold comps, write an SEO-optimized listing (title ≤80 chars, structured HTML description), and create a draft listing in eBay using AddItem with a ScheduleTime 30 days from today. Write result.json to /mnt/session/outputs/.`;
    const rubric = `1. Item correctly identified from the photo\n2. eBay sold comps found (low/avg/high)\n3. Title ≤80 chars, keyword-first, no ALL CAPS\n4. HTML description with condition and details\n5. AddItem succeeds — valid eBay Item ID in result.json\n6. ScheduleTime is 30+ days in the future`;

    const kickRes = await fetch(`${BASE}/sessions/${sessionId}/events`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        events: [{
          type: 'user.define_outcome',
          description: task,
          rubric: { type: 'text', content: rubric },
          max_iterations: 3,
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
