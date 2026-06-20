#!/usr/bin/env python3
"""
Appends store boilerplate to all eBay Scheduled listings EXCEPT those
created by Agent 1 this week (scheduled within the last 7 days).
"""

import os, sys, xml.etree.ElementTree as ET
from datetime import datetime, timezone, timedelta
import urllib.request, urllib.parse

APP_ID    = os.environ['EBAY_APP_ID']
CERT_ID   = os.environ['EBAY_CERT_ID']
USER_TOKEN = os.environ['EBAY_USER_TOKEN']
ENDPOINT  = 'https://api.ebay.com/ws/api.dll'

BOILERPLATE = """
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
Shipping is calculated by eBay based on package size/weight, destination, and carrier rates.</p>
"""

def ebay_request(call_name, body_xml):
    headers = {
        'Content-Type': 'text/xml',
        'X-EBAY-API-SITEID': '0',
        'X-EBAY-API-COMPATIBILITY-LEVEL': '967',
        'X-EBAY-API-APP-NAME': APP_ID,
        'X-EBAY-API-CERT-NAME': CERT_ID,
        'X-EBAY-API-CALL-NAME': call_name,
        'X-EBAY-API-DEV-NAME': 'dev',
    }
    req = urllib.request.Request(ENDPOINT, body_xml.encode('utf-8'), headers)
    with urllib.request.urlopen(req, timeout=30) as resp:
        return resp.read().decode('utf-8')

def get_scheduled_listings():
    """Fetch all scheduled listings via GetMyeBaySelling."""
    items = []
    page = 1
    while True:
        xml = f"""<?xml version="1.0" encoding="utf-8"?>
<GetMyeBaySellingRequest xmlns="urn:ebay:apis:eBLBaseComponents">
  <RequesterCredentials><eBayAuthToken>{USER_TOKEN}</eBayAuthToken></RequesterCredentials>
  <ScheduledList>
    <Include>true</Include>
    <Pagination>
      <EntriesPerPage>50</EntriesPerPage>
      <PageNumber>{page}</PageNumber>
    </Pagination>
  </ScheduledList>
  <DetailLevel>ReturnAll</DetailLevel>
</GetMyeBaySellingRequest>"""
        resp = ebay_request('GetMyeBaySelling', xml)
        root = ET.fromstring(resp)
        ns = {'e': 'urn:ebay:apis:eBLBaseComponents'}

        page_items = root.findall('.//e:ScheduledList//e:Item', ns)
        if not page_items:
            break

        for item in page_items:
            item_id = item.findtext('e:ItemID', '', ns)
            title = item.findtext('e:Title', '', ns)
            start_time_el = item.find('e:ListingDetails/e:StartTime', ns)
            start_time = start_time_el.text if start_time_el is not None else None
            schedule_el = item.find('e:ScheduleTime', ns)
            schedule_time = schedule_el.text if schedule_el is not None else None

            if item_id:
                items.append({
                    'item_id': item_id,
                    'title': title,
                    'start_time': start_time,
                    'schedule_time': schedule_time,
                })

        total_pages_el = root.find('.//e:ScheduledList/e:PaginationResult/e:TotalNumberOfPages', ns)
        if total_pages_el is None or page >= int(total_pages_el.text or 1):
            break
        page += 1

    return items

def get_item_description(item_id):
    xml = f"""<?xml version="1.0" encoding="utf-8"?>
<GetItemRequest xmlns="urn:ebay:apis:eBLBaseComponents">
  <RequesterCredentials><eBayAuthToken>{USER_TOKEN}</eBayAuthToken></RequesterCredentials>
  <ItemID>{item_id}</ItemID>
  <DetailLevel>ItemReturnDescription</DetailLevel>
</GetItemRequest>"""
    resp = ebay_request('GetItem', xml)
    root = ET.fromstring(resp)
    ns = {'e': 'urn:ebay:apis:eBLBaseComponents'}
    return root.findtext('.//e:Description', '', ns)

def revise_description(item_id, new_desc):
    xml = f"""<?xml version="1.0" encoding="utf-8"?>
<ReviseItemRequest xmlns="urn:ebay:apis:eBLBaseComponents">
  <RequesterCredentials><eBayAuthToken>{USER_TOKEN}</eBayAuthToken></RequesterCredentials>
  <Item>
    <ItemID>{item_id}</ItemID>
    <Description><![CDATA[{new_desc}]]></Description>
  </Item>
</ReviseItemRequest>"""
    resp = ebay_request('ReviseItem', xml)
    root = ET.fromstring(resp)
    ns = {'e': 'urn:ebay:apis:eBLBaseComponents'}
    ack = root.findtext('e:Ack', '', ns)
    errors = [e.findtext('e:LongMessage', '', ns) for e in root.findall('.//e:Errors', ns)]
    return ack, errors

def main():
    # Agent 1 ran this week — skip listings started in the last 7 days
    cutoff = datetime.now(timezone.utc) - timedelta(days=7)

    print("Fetching scheduled listings...")
    items = get_scheduled_listings()
    print(f"Found {len(items)} scheduled listings")

    skipped = 0
    updated = 0
    already_has = 0
    errors = 0

    for item in items:
        title = item['title']
        item_id = item['item_id']
        start_time = item['start_time']

        # Skip Agent 1 listings (created in the last 7 days)
        if start_time:
            try:
                created = datetime.fromisoformat(start_time.replace('Z', '+00:00'))
                if created > cutoff:
                    print(f"  SKIP (Agent 1, recent): {title[:60]}")
                    skipped += 1
                    continue
            except Exception:
                pass

        desc = get_item_description(item_id)

        # Skip if boilerplate already present
        if 'COMPATIBILITY / FITMENT' in desc or 'W.Y.S.I.W.Y.G' in desc:
            print(f"  SKIP (already has boilerplate): {title[:60]}")
            already_has += 1
            continue

        # Skip power cords (hard rule)
        if 'power cord' in title.lower():
            print(f"  SKIP (power cord): {title[:60]}")
            skipped += 1
            continue

        new_desc = desc + BOILERPLATE
        ack, errs = revise_description(item_id, new_desc)

        if ack in ('Success', 'Warning'):
            print(f"  UPDATED: {title[:60]}")
            updated += 1
        else:
            print(f"  ERROR ({ack}): {title[:60]} — {errs}")
            errors += 1

    print(f"\nDone. Updated: {updated} | Already had boilerplate: {already_has} | Skipped (Agent 1/power cord): {skipped} | Errors: {errors}")

if __name__ == '__main__':
    main()
