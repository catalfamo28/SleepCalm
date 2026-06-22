// Edge Function — no execution timeout, polls CMA session then calls eBay AddItem.

export const config = { runtime: 'edge' };

function shippingCost(oz) {
  if (oz < 16) return { service: 'USPSFirstClass', cost: '5.99' };
  return { service: 'USPSPriority', cost: '14.99' };
}

function buildAddItemXml(result, userToken) {
  const scheduleDate = new Date();
  scheduleDate.setDate(scheduleDate.getDate() + 20);
  scheduleDate.setHours(14, 0, 0, 0); // 10 AM Eastern = 14:00 UTC
  const scheduleTime = scheduleDate.toISOString().replace(/\.\d{3}Z$/, 'Z');

  const price = parseFloat(result.price_recommended) || 25.00;
  const ship = shippingCost(result.weight_oz || 8);

  const title = String(result.title || 'Item for sale')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .substring(0, 80);

  return `<?xml version="1.0" encoding="utf-8"?>
<AddItemRequest xmlns="urn:ebay:apis:eBLBaseComponents">
  <RequesterCredentials>
    <eBayAuthToken>${userToken}</eBayAuthToken>
  </RequesterCredentials>
  <Item>
    <Title>${title}</Title>
    <Description><![CDATA[${result.description || result.title || 'Item for sale'}]]></Description>
    <PrimaryCategory><CategoryID>${result.category_id || '99'}</CategoryID></PrimaryCategory>
    <StartPrice>${price.toFixed(2)}</StartPrice>
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
      <ShippingType>Flat</ShippingType>
      <ShippingServiceOptions>
        <ShippingServicePriority>1</ShippingServicePriority>
        <ShippingService>${ship.service}</ShippingService>
        <ShippingServiceCost currencyID="USD">${ship.cost}</ShippingServiceCost>
      </ShippingServiceOptions>
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
  const xml = buildAddItemXml(result, userToken);
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
  if (!res.ok) throw new Error('eBay HTTP ' + res.status + ': ' + text.substring(0, 200));

  const ackMatch = text.match(/<Ack>(\w+)<\/Ack>/);
  const ack = ackMatch ? ackMatch[1] : 'Unknown';
  if (ack === 'Failure') {
    const errMatch = text.match(/<LongMessage><!\[CDATA\[([^\]]+)\]\]><\/LongMessage>|<LongMessage>([^<]+)<\/LongMessage>/);
    const errMsg = errMatch ? (errMatch[1] || errMatch[2]) : text.substring(0, 200);
    throw new Error('eBay AddItem failed: ' + errMsg);
  }

  const itemIdMatch = text.match(/<ItemID>(\d+)<\/ItemID>/);
  if (!itemIdMatch) throw new Error('No ItemID in eBay response: ' + text.substring(0, 200));
  return itemIdMatch[1];
}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export default async function handler(request) {
  if (request.method !== 'GET') return jsonResponse({ error: 'Method not allowed' }, 405);

  const { searchParams } = new URL(request.url);
  const session_id = searchParams.get('session_id');
  if (!session_id) return jsonResponse({ error: 'Missing session_id' }, 400);

  const apiKey = process.env.ANTHROPIC_API_KEY;
  const ebayAppId = process.env.EBAY_APP_ID;
  const ebayCertId = process.env.EBAY_CERT_ID;
  const ebayUserToken = process.env.EBAY_USER_TOKEN;

  const BASE = 'https://api.anthropic.com/v1';
  const cmaHeaders = {
    'x-api-key': apiKey,
    'anthropic-version': '2023-06-01',
    'anthropic-beta': 'managed-agents-2026-04-01',
  };

  try {
    const sessRes = await fetch(`${BASE}/sessions/${session_id}`, { headers: cmaHeaders });
    if (!sessRes.ok) throw new Error('Session fetch failed: ' + sessRes.status);
    const sess = await sessRes.json();

    if (sess.status === 'running') return jsonResponse({ status: 'running' });

    if (sess.status === 'idle') {
      const filesRes = await fetch(`${BASE}/files?scope_id=${session_id}`, { headers: cmaHeaders });
      const files = await filesRes.json();
      const resultFile = (files.data || []).find(f => f.filename === 'result.json');
      if (!resultFile) return jsonResponse({ status: 'done', result: null });

      const contentRes = await fetch(`${BASE}/files/${resultFile.id}/content`, { headers: cmaHeaders });
      const result = await contentRes.json();

      if (ebayAppId && ebayCertId && ebayUserToken) {
        try {
          const itemId = await callAddItem(result, ebayAppId, ebayCertId, ebayUserToken);
          result.ebay_item_id = itemId;
        } catch (ebayErr) {
          result.ebay_error = ebayErr.message;
        }
      }

      return jsonResponse({ status: 'done', result });
    }

    return jsonResponse({ status: 'error', message: 'Session ended with status: ' + sess.status });
  } catch (err) {
    return jsonResponse({ status: 'error', message: err.message }, 500);
  }
}
