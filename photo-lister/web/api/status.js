// Vercel serverless function — polls CMA session, then calls eBay AddItem directly
// when the agent has finished identifying the item and writing listing details.

function buildAddItemXml(result, appId, userToken) {
  const scheduleDate = new Date();
  scheduleDate.setDate(scheduleDate.getDate() + 20);
  scheduleDate.setHours(14, 0, 0, 0); // 10 AM Eastern = 14:00 UTC
  const scheduleTime = scheduleDate.toISOString().replace(/\.\d{3}Z$/, 'Z');

  return `<?xml version="1.0" encoding="utf-8"?>
<AddItemRequest xmlns="urn:ebay:apis:eBLBaseComponents">
  <RequesterCredentials>
    <eBayAuthToken>${userToken}</eBayAuthToken>
  </RequesterCredentials>
  <Item>
    <Title>${result.title.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').substring(0,80)}</Title>
    <Description><![CDATA[${result.description || result.title}]]></Description>
    <PrimaryCategory><CategoryID>${result.category_id || '99'}</CategoryID></PrimaryCategory>
    <StartPrice>${result.price_recommended}</StartPrice>
    <ConditionID>${result.condition_id || '3000'}</ConditionID>
    <Country>US</Country>
    <Currency>USD</Currency>
    <DispatchTimeMax>3</DispatchTimeMax>
    <ListingDuration>GTC</ListingDuration>
    <ListingType>FixedPriceItem</ListingType>
    <Quantity>1</Quantity>
    <Site>US</Site>
    <ScheduleTime>${scheduleTime}</ScheduleTime>
    <ShippingDetails>
      <ShippingType>Calculated</ShippingType>
      <ShippingServiceOptions>
        <ShippingServicePriority>1</ShippingServicePriority>
        <ShippingService>${result.shipping_service || 'USPSGroundAdvantage'}</ShippingService>
      </ShippingServiceOptions>
      <PackageDetails>
        <WeightMajor unit="lbs">${Math.floor((result.weight_oz || 8) / 16)}</WeightMajor>
        <WeightMinor unit="oz">${Math.round((result.weight_oz || 8) % 16)}</WeightMinor>
        <PackageDepth unit="in">${result.package_depth || 4}</PackageDepth>
        <PackageLength unit="in">${result.package_length || 8}</PackageLength>
        <PackageWidth unit="in">${result.package_width || 6}</PackageWidth>
        <PackageType>PackageThickEnvelope</PackageType>
      </PackageDetails>
    </ShippingDetails>
    <ReturnPolicy>
      <ReturnsAcceptedOption>ReturnsAccepted</ReturnsAcceptedOption>
      <RefundOption>MoneyBack</RefundOption>
      <ReturnsWithinOption>Days_30</ReturnsWithinOption>
      <ShippingCostPaidByOption>Buyer</ShippingCostPaidByOption>
    </ReturnPolicy>
  </Item>
</AddItemRequest>`;
}

async function callAddItem(result, appId, certId, userToken) {
  const xml = buildAddItemXml(result, appId, userToken);
  const res = await fetch('https://api.ebay.com/ws/api.dll', {
    method: 'POST',
    headers: {
      'Content-Type': 'text/xml',
      'X-EBAY-API-SITEID': '0',
      'X-EBAY-API-COMPATIBILITY-LEVEL': '967',
      'X-EBAY-API-APP-NAME': appId,
      'X-EBAY-API-CERT-NAME': certId,
      'X-EBAY-API-CALL-NAME': 'AddItem',
      'X-EBAY-API-DEV-NAME': 'dev',
    },
    body: xml,
  });
  const text = await res.text();
  if (!res.ok) throw new Error('eBay AddItem HTTP ' + res.status + ': ' + text.substring(0, 300));

  const itemIdMatch = text.match(/<ItemID>(\d+)<\/ItemID>/);
  const errorMatch = text.match(/<LongMessage><!\[CDATA\[([^\]]+)\]\]><\/LongMessage>|<LongMessage>([^<]+)<\/LongMessage>/);
  const ackMatch = text.match(/<Ack>(\w+)<\/Ack>/);

  const ack = ackMatch ? ackMatch[1] : 'Unknown';
  if (ack === 'Failure') {
    const errMsg = errorMatch ? (errorMatch[1] || errorMatch[2]) : text.substring(0, 300);
    throw new Error('eBay AddItem failed: ' + errMsg);
  }
  if (!itemIdMatch) throw new Error('No ItemID in eBay response: ' + text.substring(0, 300));
  return itemIdMatch[1];
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { session_id } = req.query;
  if (!session_id) return res.status(400).json({ error: 'Missing session_id' });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  const ebayAppId = process.env.EBAY_APP_ID;
  const ebayCertId = process.env.EBAY_CERT_ID;
  const ebayUserToken = process.env.EBAY_USER_TOKEN;

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
      // Fetch result.json from session outputs
      const filesRes = await fetch(`${BASE}/files?scope_id=${session_id}`, { headers });
      const files = await filesRes.json();
      const resultFile = (files.data || []).find(f => f.filename === 'result.json');
      if (!resultFile) return res.json({ status: 'done', result: null });

      const contentRes = await fetch(`${BASE}/files/${resultFile.id}/content`, { headers });
      const result = await contentRes.json();

      // Call eBay AddItem from Vercel (reliable network)
      if (ebayAppId && ebayCertId && ebayUserToken) {
        try {
          const itemId = await callAddItem(result, ebayAppId, ebayCertId, ebayUserToken);
          result.ebay_item_id = itemId;
        } catch (ebayErr) {
          result.ebay_error = ebayErr.message;
        }
      }

      return res.json({ status: 'done', result });
    }

    return res.json({ status: 'error', message: 'Session ended with status: ' + sess.status });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: err.message });
  }
}
