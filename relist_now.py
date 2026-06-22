#!/usr/bin/env python3
"""
Find scheduled listings matching keywords, end them, and relist immediately.
"""
import os, sys, xml.etree.ElementTree as ET, urllib.request, json

APP_ID     = os.environ['EBAY_APP_ID']
CERT_ID    = os.environ['EBAY_CERT_ID']
USER_TOKEN = os.environ['EBAY_USER_TOKEN']
ENDPOINT   = 'https://api.ebay.com/ws/api.dll'

KEYWORDS = ['shirt', 'accord']  # case-insensitive match against title

def ebay(call, body):
    req = urllib.request.Request(ENDPOINT, body.encode('utf-8'), {
        'Content-Type': 'text/xml',
        'X-EBAY-API-SITEID': '0',
        'X-EBAY-API-COMPATIBILITY-LEVEL': '967',
        'X-EBAY-API-APP-NAME': APP_ID,
        'X-EBAY-API-CERT-NAME': CERT_ID,
        'X-EBAY-API-CALL-NAME': call,
        'X-EBAY-API-DEV-NAME': 'dev',
    })
    with urllib.request.urlopen(req, timeout=30) as r:
        return r.read().decode('utf-8')

def get_scheduled():
    items = []
    page = 1
    while True:
        resp = ebay('GetMyeBaySelling', f"""<?xml version="1.0" encoding="utf-8"?>
<GetMyeBaySellingRequest xmlns="urn:ebay:apis:eBLBaseComponents">
  <RequesterCredentials><eBayAuthToken>{USER_TOKEN}</eBayAuthToken></RequesterCredentials>
  <ScheduledList><Include>true</Include>
    <Pagination><EntriesPerPage>50</EntriesPerPage><PageNumber>{page}</PageNumber></Pagination>
  </ScheduledList>
  <DetailLevel>ReturnAll</DetailLevel>
</GetMyeBaySellingRequest>""")
        root = ET.fromstring(resp)
        ns = {'e': 'urn:ebay:apis:eBLBaseComponents'}
        page_items = root.findall('.//e:ScheduledList//e:Item', ns)
        if not page_items:
            break
        for item in page_items:
            iid   = item.findtext('e:ItemID', '', ns)
            title = item.findtext('e:Title', '', ns)
            if iid:
                items.append({'id': iid, 'title': title})
        total = root.find('.//e:ScheduledList/e:PaginationResult/e:TotalNumberOfPages', ns)
        if total is None or page >= int(total.text or 1):
            break
        page += 1
    return items

def get_full_item(iid):
    resp = ebay('GetItem', f"""<?xml version="1.0" encoding="utf-8"?>
<GetItemRequest xmlns="urn:ebay:apis:eBLBaseComponents">
  <RequesterCredentials><eBayAuthToken>{USER_TOKEN}</eBayAuthToken></RequesterCredentials>
  <ItemID>{iid}</ItemID>
  <DetailLevel>ReturnAll</DetailLevel>
</GetItemRequest>""")
    root = ET.fromstring(resp)
    ns = {'e': 'urn:ebay:apis:eBLBaseComponents'}
    item = root.find('.//e:Item', ns)
    if item is None:
        return None
    def t(path): return item.findtext(path, '', ns)
    def e(s): return s.replace('&','&amp;').replace('<','&lt;').replace('>','&gt;')

    title       = t('e:Title')
    desc        = t('e:Description') or title
    cat         = t('e:PrimaryCategory/e:CategoryID') or '99'
    price       = t('e:StartPrice') or '25.00'
    cond        = t('e:ConditionID') or '3000'
    svc         = t('.//e:ShippingServiceOptions/e:ShippingService') or 'USPSPriority'
    cost        = t('.//e:ShippingServiceOptions/e:ShippingServiceCost') or '14.99'
    ship_type   = t('e:ShippingDetails/e:ShippingType') or 'Flat'
    return dict(title=title, desc=desc, cat=cat, price=price, cond=cond,
                svc=svc, cost=cost, ship_type=ship_type)

def end_item(iid):
    resp = ebay('EndItem', f"""<?xml version="1.0" encoding="utf-8"?>
<EndItemRequest xmlns="urn:ebay:apis:eBLBaseComponents">
  <RequesterCredentials><eBayAuthToken>{USER_TOKEN}</eBayAuthToken></RequesterCredentials>
  <ItemID>{iid}</ItemID>
  <EndingReason>NotAvailable</EndingReason>
</EndItemRequest>""")
    root = ET.fromstring(resp)
    ns = {'e': 'urn:ebay:apis:eBLBaseComponents'}
    return root.findtext('e:Ack', '', ns)

def add_item(d):
    xml = f"""<?xml version="1.0" encoding="utf-8"?>
<AddItemRequest xmlns="urn:ebay:apis:eBLBaseComponents">
  <RequesterCredentials><eBayAuthToken>{USER_TOKEN}</eBayAuthToken></RequesterCredentials>
  <Item>
    <Title>{d['title'].replace('&','&amp;').replace('<','&lt;').replace('>','&gt;')[:80]}</Title>
    <Description><![CDATA[{d['desc']}]]></Description>
    <PrimaryCategory><CategoryID>{d['cat']}</CategoryID></PrimaryCategory>
    <StartPrice>{d['price']}</StartPrice>
    <ConditionID>{d['cond']}</ConditionID>
    <Country>US</Country><Currency>USD</Currency>
    <DispatchTimeMax>3</DispatchTimeMax>
    <ListingDuration>GTC</ListingDuration>
    <ListingType>FixedPriceItem</ListingType>
    <Quantity>1</Quantity><Site>US</Site>
    <ShippingDetails>
      <ShippingType>{d['ship_type']}</ShippingType>
      <ShippingServiceOptions>
        <ShippingServicePriority>1</ShippingServicePriority>
        <ShippingService>{d['svc']}</ShippingService>
        <ShippingServiceCost currencyID="USD">{d['cost']}</ShippingServiceCost>
      </ShippingServiceOptions>
    </ShippingDetails>
    <ReturnPolicy>
      <ReturnsAcceptedOption>ReturnsAccepted</ReturnsAcceptedOption>
      <RefundOption>MoneyBack</RefundOption>
      <ReturnsWithinOption>Days_30</ReturnsWithinOption>
      <ShippingCostPaidByOption>Buyer</ShippingCostPaidByOption>
    </ReturnPolicy>
  </Item>
</AddItemRequest>"""
    resp = ebay('AddItem', xml)
    root = ET.fromstring(resp)
    ns = {'e': 'urn:ebay:apis:eBLBaseComponents'}
    ack = root.findtext('e:Ack', '', ns)
    iid = root.findtext('.//e:ItemID', '', ns)
    err = root.findtext('.//e:Errors/e:LongMessage', '', ns)
    return ack, iid, err

def main():
    print("Fetching scheduled listings...")
    all_items = get_scheduled()
    print(f"Total scheduled: {len(all_items)}")

    matches = [i for i in all_items if any(k in i['title'].lower() for k in KEYWORDS)]
    if not matches:
        print("No matching listings found for keywords:", KEYWORDS)
        return

    print(f"\nFound {len(matches)} matching listings:")
    for m in matches:
        print(f"  {m['id']} — {m['title']}")

    for m in matches:
        iid = m['id']
        title = m['title']
        print(f"\nProcessing: {title}")

        details = get_full_item(iid)
        if not details:
            print(f"  ERROR: Could not fetch item details for {iid}")
            continue

        ack = end_item(iid)
        if ack not in ('Success', 'Warning'):
            print(f"  ERROR ending item: {ack}")
            continue
        print(f"  Ended scheduled listing {iid}")

        ack2, new_iid, err = add_item(details)
        if ack2 in ('Success', 'Warning') and new_iid:
            print(f"  Relisted LIVE as item {new_iid}")
        else:
            print(f"  ERROR relisting: {err or ack2}")

    print("\nDone.")

if __name__ == '__main__':
    main()
