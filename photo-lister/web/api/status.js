// Vercel serverless function — polls CMA session status and fetches result.json
export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { session_id } = req.query;
  if (!session_id) return res.status(400).json({ error: 'Missing session_id' });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  const BASE = 'https://api.anthropic.com/v1';
  const headers = {
    'x-api-key': apiKey,
    'anthropic-version': '2023-06-01',
    'anthropic-beta': 'managed-agents-2026-04-01',
  };

  try {
    const sessRes = await fetch(`${BASE}/sessions/${session_id}`, { headers });
    if (!sessRes.ok) throw new Error('Session fetch failed');
    const sess = await sessRes.json();

    if (sess.status === 'running') return res.json({ status: 'running' });

    if (sess.status === 'idle') {
      // Fetch result.json from the session's files
      const filesRes = await fetch(`${BASE}/files?scope_id=${session_id}`, { headers });
      const files = await filesRes.json();
      const resultFile = (files.data || []).find(f => f.filename === 'result.json');

      if (!resultFile) return res.json({ status: 'done', result: null });

      const contentRes = await fetch(`${BASE}/files/${resultFile.id}/content`, { headers });
      const result = await contentRes.json();
      return res.json({ status: 'done', result });
    }

    return res.json({ status: 'error', message: 'Session ended with status: ' + sess.status });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: err.message });
  }
}
