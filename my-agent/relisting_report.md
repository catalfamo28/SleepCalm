# Weekly eBay Stale-Listing Refresh — Relisting Report

**Run date (eBay official time):** 2026-06-20T04:08:54.280Z  
**Staleness threshold:** active listings unsold **90+ days** as of run date (started on/before 2026-03-22 04:08 UTC).  
**Seller account:** authenticated via eBay Trading API (GetSellerList / GetItem / EndItem / AddItem).

## Summary

- **Active listings scanned:** 235 (all active listings across the seller account).
- **Stale active listings found (90+ days):** 121.
- **Excluded — title contains "power cord" (per policy; skipped silently, not itemized):** 12.
- **Eligible stale listings (after power-cord exclusion):** 109.
- **Processed (ended + rewritten + relisted on a future schedule):** 94.
- **Skipped — could not relist without changing/inventing item specifics or category (left active):** 15.
- **Scheduled go-live window:** 2026-06-21 → 2026-07-09 (10:00 AM US/Eastern each day), max 5 new listings per day, starting tomorrow.

### How each stale listing was handled

1. `GetSellerList` was paged across rolling ≤121-day start-time windows to enumerate every active listing.
2. Listings with `StartTime` 90+ days before the run date were flagged stale; any title containing "power cord" (case-insensitive) was excluded and never read, ended, or relisted.
3. For each eligible listing: `GetItem` pulled full detail; the title and description were rewritten for SEO; `EndItem` (reason `NotAvailable`) ended the old listing; `AddItem` created a replacement that preserves the original **category, price, condition, item specifics, and all photos**, changing only the **title**, **description**, and adding a future **ScheduleTime**.
4. Scheduling assigns at most **5 listings per day**, oldest (most stale) first, beginning **tomorrow (2026-06-21) at 10:00 AM Eastern (14:00 UTC)**. This also respects eBay's hard 21-day maximum scheduling horizon; all 94 processable listings fit within it (no item required deferral).

## Scheduled new listings (per day)

| Go-live date (10:00 AM ET) | New listings scheduled |
|---|---|
| 2026-06-21 | 5 |
| 2026-06-22 | 5 |
| 2026-06-23 | 5 |
| 2026-06-24 | 5 |
| 2026-06-25 | 5 |
| 2026-06-26 | 5 |
| 2026-06-27 | 5 |
| 2026-06-28 | 5 |
| 2026-06-29 | 5 |
| 2026-06-30 | 5 |
| 2026-07-01 | 5 |
| 2026-07-02 | 5 |
| 2026-07-03 | 5 |
| 2026-07-04 | 5 |
| 2026-07-05 | 5 |
| 2026-07-06 | 5 |
| 2026-07-07 | 5 |
| 2026-07-08 | 5 |
| 2026-07-09 | 4 |

## Processed listings — old vs. new

| # | Old Item ID | Old Title | New Title (SEO) | Days Stale | Go-Live (ET) | New Item ID |
|---|---|---|---|---|---|---|
| 1 | 185937290737 | Vintage Udico Electric Can Opener Knife Sharpener Tested Working Retro Kitchen A | Vintage Udico Electric Can Opener Knife Sharpener Tested Working Retro Kitchen | 1104 | 2026-06-21 | 178238185151 |
| 2 | 186051162574 | Western Electric Jacket Vintage L Vtg Windbreaker Adult Men's Patches, Pins | Western Electric Jacket Vintage L Vtg Windbreaker Adult Men's Patches, Pins | 1028 | 2026-06-21 | 178238185931 |
| 3 | 186139139759 | Bicycle License Cereal Plate Alpha Bits Premiums Post Mini Toy Vintage Unopened | Bicycle License Cereal Plate Alpha Bits Premiums Post Mini Toy Vintage Unopened | 966 | 2026-06-21 | 188536086892 |
| 4 | 186244123337 | Nintendo NES Rad Racer Gyromite Lot of 2 Cartridges Cleaned Tested Label VG | Nintendo NES Rad Racer Gyromite Lot of 2 Cartridges Cleaned Tested Label Vg | 893 | 2026-06-21 | 188536086928 |
| 5 | 176353168536 | Little People Vintage Fisher Price Sesame Street Big Bird Figure Nest Muppets Vt | Little People Vintage Fisher Price Sesame Street Big Bird Figure Nest Muppets | 783 | 2026-06-21 | 178238186018 |
| 6 | 186435587460 | 12 Fresca  Beverage Soda Pop Bottle Cork Cap Vintage | 12 Fresca Beverage Soda Pop Bottle Cork Cap Vintage | 771 | 2026-06-22 | 188536087006 |
| 7 | 186435588542 | Antique Vintage 60s Canada Dry Club Soda Cork Bottle Cap | Antique Vintage 60s Canada Dry Club Soda Cork Bottle Cap | 771 | 2026-06-22 | 178238186076 |
| 8 | 186435589522 | 5 SCHWEPPES VINTAGE SODA  BOTTLE CAPS QUININE WATER | 5 Schweppes Vintage Soda Bottle Caps Quinine Water | 771 | 2026-06-22 | 178238186101 |
| 9 | 186445679647 | 5 Antique Vintage 60s Canada Dry Club Soda / Diet Rite Cola Bottle Cap | 5 Antique Vintage 60s Canada Dry Club Soda / Diet Rite Cola Bottle Cap | 764 | 2026-06-22 | 188536087058 |
| 10 | 186447582174 | 9 Fresca Beverage Soda Pop Bottle Cork Cap Vintage | 9 Fresca Beverage Soda Pop Bottle Cork Cap Vintage | 763 | 2026-06-22 | 178238186137 |
| 11 | 186450149525 | 15 Fresca Beverage Soda Pop Bottle Cork Cap Vintage | 15 Fresca Beverage Soda Pop Bottle Cork Cap Vintage | 762 | 2026-06-23 | 178238186161 |
| 12 | 176385817704 | Casio TV-400T LCD Pocket TV Portable Handheld Vintage 1990s Collectible Tested | Casio TV-400T LCD Pocket TV Portable Handheld Vintage 1990s Collectible Tested | 761 | 2026-06-23 | 188536087122 |
| 13 | 176391332300 | Hail Satan 100% Evil Satanic Scented Candle 9oz | Hail Satan 100% Evil Satanic Scented Candle 9oz New | 758 | 2026-06-23 | 188536087147 |
| 14 | 176772436797 | Gatorade Kansas City Chiefs NFL Pro Team Bi-Color Game Towel 22" x 42" | Gatorade Kansas City Chiefs NFL Pro Team Bi-Color Game Towel 22" x 42" New | 531 | 2026-06-23 | 178238186288 |
| 15 | 176852083348 | NEW Set Of 6 Hexagon Colorful Led Quantum Wall Lights | New Set Of 6 Hexagon Colorful Led Quantum Wall Lights | 488 | 2026-06-23 | 188536087291 |
| 16 | 187286736950 | Sony T-160 VHS Premium Grade Tapes 8 Hour 4 pack VTG media *NEW/UNOPENED * | Sony T-160 VHS Premium Grade Tapes 8 Hour 4 pack Vtg media NEW/UNOPENED | 382 | 2026-06-24 | 188536087315 |
| 17 | 177156136127 | San Francisco Giants ticket 1987 National League Game 4 Championship Series | San Francisco Giants ticket 1987 National League Game 4 Championship Series | 380 | 2026-06-24 | 188536087333 |
| 18 | 177160102736 | GE Personal Security Alarm Window Door 56789 Pack New Wireless Entry Chime Mode | GE Personal Security Alarm Window Door 56789 Pack New Wireless Entry Chime Mode | 379 | 2026-06-24 | 178238186428 |
| 19 | 177168289995 | Very RARE Vintage 1980 VAN HALEN Concert Tour Pin-Back BUTTON | Very Rare Vintage 1980 Van Halen Concert Tour Pin-Back Button | 377 | 2026-06-24 | 178238186454 |
| 20 | 187331851769 | Vintage McDonald's Car Window Mug Cup Holder Advertising Fast Food  Yellow HTF | Vintage McDonald's Car Window Mug Cup Holder Advertising Fast Food Yellow HTF | 370 | 2026-06-24 | 188536087415 |
| 21 | 187343533512 | Lucy and Me Lucy Rigg Bears Baby bib and Baby Blocks Boy Girl Figurines 85 | Lucy and Me Lucy Rigg Bears Baby bib and Baby Blocks Boy Girl Figurines 85 Used | 367 | 2026-06-25 | 178238186492 |
| 22 | 177209079934 | Lucy and Me Bear Enesco Lucy Rigg Pink Hat and Coat with Umbrella Fancy Dress | Lucy and Me Bear Enesco Lucy Rigg Pink Hat and Coat with Umbrella Fancy Dress | 365 | 2026-06-25 | 178238186509 |
| 23 | 177211458586 | Lucy & Me Pajamas Good Night Bear Lucy Rigg ENESCO 85 and 86 Lot of 3 | Lucy & Me Pajamas Good Night Bear Lucy Rigg Enesco 85 and 86 Lot of 3 Used | 364 | 2026-06-25 | 178238186527 |
| 24 | 177282923111 | Dave & Busters Ashtray Logo Round Glass D&B Advertising Food Games Restaurant | Dave & Busters Ashtray Logo Round Glass D&B Advertising Food Games Restaurant | 334 | 2026-06-25 | 178238186540 |
| 25 | 187441783126 | Vintage Soft Sense Skin Lotion by SC Johnson 1st Year Scarce 1981  33% Full 6 oz | Vintage Soft Sense Skin Lotion by Sc Johnson 1st Year Scarce 1981 33% Full 6 oz | 328 | 2026-06-25 | 178238186557 |
| 26 | 187444015114 | Vintage Peanuts Date Book 1968 Bound Calendar Charles M Schultz Charlie Brown | Vintage Peanuts Date Book 1968 Bound Calendar Charles M Schultz Charlie Brown | 327 | 2026-06-26 | 188536087529 |
| 27 | 187444017776 | Vintage Peanuts Date Book 1969 Bound Calendar Charles M Schultz Charlie Brown | Vintage Peanuts Date Book 1969 Bound Calendar Charles M Schultz Charlie Brown | 327 | 2026-06-26 | 188536087632 |
| 28 | 187484513056 | LADY GAGA Rolling Stone Magazine July 8 - 22, 2010 Eminem, Elton John, | Lady Gaga Rolling Stone Magazine July 8 - 22, 2010 Eminem, Elton John Used | 311 | 2026-06-26 | 178238186693 |
| 29 | 177376337566 | 2 Vintage ENJOY COCA-COLA IN ONE-WAY RESEALABLE BOTTLES STORE Shelf DISPLAY SIGN | 2 Vintage Enjoy Coca-cola In One-way Resealable Bottles Store Shelf Display Sign | 293 | 2026-06-26 | 178238186709 |
| 30 | 177376338835 | Vintage ENJOY COCA-COLA IN ONE-WAY RESEALABLE BOTTLES STORE Shelf DISPLAY SIGN | Vintage Enjoy Coca-cola In One-way Resealable Bottles Store Shelf Display Sign | 293 | 2026-06-26 | 178238186724 |
| 31 | 177422898111 | Calibrated Screwdriver Sandvik Coromant Screwdriver  QS4 FH Quickset | Calibrated Screwdriver Sandvik Coromant Screwdriver QS4 Fh Quickset New | 274 | 2026-06-27 | 188536087716 |
| 32 | 177429471523 | Vintage 1972 Lot of 9 Mattel Tuff Stuff Plastic Pretend Play Food Toys | Vintage 1972 Lot of 9 Mattel Tuff Stuff Plastic Pretend Play Food Toys | 271 | 2026-06-27 | 178238186756 |
| 33 | 187605437582 | Vintage Glasbake Kitten Cat with Yarn Coffee Mug Cup 8 oz USA | Vintage Glasbake Kitten Cat with Yarn Coffee Mug Cup 8 oz USA | 264 | 2026-06-27 | 188536087797 |
| 34 | 177466264740 | Philips Sonicare Replacement Brush Heads EFFECTACLEAN SONIC 5-Replacement | Philips Sonicare Replacement Brush Heads Effectaclean Sonic 5-Replacement New | 257 | 2026-06-27 | 188536087820 |
| 35 | 187662414932 | 2025 Matchbox 1972 Lotus Europa White Diecast Car 1:64 Unopened | 2025 Matchbox 1972 Lotus Europa White Diecast Car 1:64 Unopened New | 244 | 2026-06-27 | 188536087856 |
| 36 | 177521458005 | Vintage Johnson's Baby Oil 12 Fluid Ounce Glass Bottle and Box | Vintage Johnson's Baby Oil 12 Fluid Ounce Glass Bottle and Box New | 237 | 2026-06-28 | 188536087903 |
| 37 | 177527135592 | Lululemon Tight Pants Leggings White Smoke Size 10 | Lululemon Tight Pants Leggings White Smoke Size 10 | 236 | 2026-06-28 | 188536087921 |
| 38 | 177527136984 | Tommy Bahama 100% Silk  Men's Medium Dark  Tropical Hawaiian Button Up | Tommy Bahama 100% Silk Men's Medium Dark Tropical Hawaiian Button Up Used | 236 | 2026-06-28 | 178238186909 |
| 39 | 177529776055 | Lululemon Sculpt Tank Black Sleeveless Split Back Workout Tank Top Size 12 | Lululemon Sculpt Tank Black Sleeveless Split Back Workout Tank Top Size 12 Used | 234 | 2026-06-28 | 188536087952 |
| 40 | 187691516514 | KitchenAid Food Grinder Attachment (Model FGA) – Original Vintage Style | KitchenAid Food Grinder Attachment (Model Fga) – Original Vintage Style | 234 | 2026-06-28 | 188536087965 |
| 41 | 177534431804 | Lululemon Tight Pants Leggings Lime Size 10 | Lululemon Tight Pants Leggings Lime Size 10 Used | 233 | 2026-06-29 | 178238186942 |
| 42 | 177539698573 | Sandman Doppler SND-D1K Smart Clock 6 USB Alexa Blackout Edition New Sealed | Sandman Doppler SND-D1K Smart Clock 6 USB Alexa Blackout Edition New Sealed | 230 | 2026-06-29 | 188536087991 |
| 43 | 187723164700 | Vintage Woolite Foam Cleaner Fabric & Upholstery Removes Stains and Odors 14 oz | Vintage Woolite Foam Cleaner Fabric & Upholstery Removes Stains and Odors 14 oz | 223 | 2026-06-29 | 188536088001 |
| 44 | 187744348788 | Vintage Handi Wipes Reusable Cleaning Cloths Pack Of 5 21x13" | Vintage Handi Wipes Reusable Cleaning Cloths Pack Of 5 21x13" New | 216 | 2026-06-29 | 178238186972 |
| 45 | 187750019693 | Handi Wipes Heavy Duty Reusable Cloths, 5 Count,  2 Packs  21" X 13" NOS Vintage | Handi Wipes Heavy Duty Reusable Cloths, 5 Count, 2 Packs 21" X 13" NOS Vintage | 215 | 2026-06-29 | 178238186984 |
| 46 | 187750019965 | AirCal Airplane Luggage Name Tag Suitcase Travel Bag Memorabilia New Sealed | AirCal Airplane Luggage Name Tag Suitcase Travel Bag Memorabilia New Sealed | 215 | 2026-06-30 | 188536088049 |
| 47 | 187753563848 | Vintage 1999 Jack in the Box Bendable Jack Figure Kid Meal Toy New NIP COOL GOLF | Vintage 1999 Jack in the Box Bendable Jack Figure Kid Meal Toy New NIP Cool Golf | 214 | 2026-06-30 | 188536088434 |
| 48 | 177592465366 | Vintage 1999 Jack in the Box Bendable Jack Figure Kid Meal Toy New NIP COOL NEWS | Vintage 1999 Jack in the Box Bendable Jack Figure Kid Meal Toy New NIP Cool News | 213 | 2026-06-30 | 188536088712 |
| 49 | 177592465888 | Vintage 1999 Jack in the Box Bendable Jack Figure Kids Meal Toy New NIP COOL HAM | Vintage 1999 Jack in the Box Bendable Jack Figure Kids Meal Toy New NIP Cool Ham | 213 | 2026-06-30 | 178238187109 |
| 50 | 187760333478 | Starfrit Pro Apple Peeler with Apple Corer Slicer Ships Fast | Starfrit Pro Apple Peeler with Apple Corer Slicer Ships Fast New | 211 | 2026-06-30 | 188536089073 |
| 51 | 177600816323 | Gilson Pipetman Classic P20 Adjustable Pipette 2-20µL | Gilson Pipetman Classic P20 Adjustable Pipette 2-20µL Used | 210 | 2026-07-01 | 188536089196 |
| 52 | 177605640038 | Gilson Pipetman P100 Single-Channel Pipette 10-100 uL | Gilson Pipetman P100 Single-Channel Pipette 10-100 uL Used | 209 | 2026-07-01 | 178238187157 |
| 53 | 187769426411 | Gilson P200 Pipetman ~ 20-200ul Pipette Pipettor Single Channel | Gilson P200 Pipetman 20-200ul Pipette Pipettor Single Channel Used | 209 | 2026-07-01 | 178238187179 |
| 54 | 187839235914 | Vintage 2002 The Far Side Page-a-Day Calendar - Last Impressions - Gary Larson | Vintage 2002 The Far Side Page-a-Day Calendar - Last Impressions - Gary Larson | 189 | 2026-07-01 | 188536089529 |
| 55 | 177672281162 | Sgt. Pepper's Lonely Hearts Club Band - 1978 Sealed Trading Card Pack Lot of 10 | Sgt. Pepper's Lonely Hearts Club Band - 1978 Sealed Trading Card Pack Lot of 10 | 188 | 2026-07-01 | 188536090199 |
| 56 | 187840846468 | Vintage Junior Miss Thermos Bottle Aladdin Plastic 8 Oz For Lunch Box | Vintage Junior Miss Thermos Bottle Aladdin Plastic 8 Oz For Lunch Box | 188 | 2026-07-02 | 178238187229 |
| 57 | 187862537199 | Vintage REVERE WARE 4.5 Quart Stock Pot Copper Clad Bottom With Lid | Vintage Revere Ware 4.5 Quart Stock Pot Copper Clad Bottom With Lid | 181 | 2026-07-02 | 178238187241 |
| 58 | 177692852089 | NFL Conference Lunch Box And Thermos 1976 | NFL Conference Lunch Box And Thermos 1976 Used | 181 | 2026-07-02 | 178238187268 |
| 59 | 187865505877 | Vintage Napkin Holder Gamut Designs Lucite Wheat Seeds | Vintage Napkin Holder Gamut Designs Lucite Wheat Seeds | 180 | 2026-07-02 | 188536092768 |
| 60 | 177699095101 | PUREPLUS Replacement Refrigerator Water Filter PP RWF4200A NEW | Pureplus Replacement Refrigerator Water Filter Pp RWF4200A New | 180 | 2026-07-02 | 188536093521 |
| 61 | 187886823153 | Babolat Falcon 105 sq. in. Adult Tennis Raquet And Bag Used Once | Babolat Falcon 105 sq. in. Adult Tennis Raquet And Bag Used Once | 174 | 2026-07-03 | 178238187475 |
| 62 | 187922237719 | Dyson V15 V11 V10 V8 Motorhead Mini Quick Release Attachment OEM Genuine New | Dyson V15 V11 V10 V8 Motorhead Mini Quick Release Attachment OEM Genuine New | 164 | 2026-07-03 | 178238187606 |
| 63 | 177757620217 | Guess Jeans Jacket Acid Wash Vintage Denim Size 18 Georges Marciano | Guess Jeans Jacket Acid Wash Vintage Denim Size 18 Georges Marciano | 162 | 2026-07-03 | 188536095656 |
| 64 | 177760858489 | Lot of 6 Chamberlain NLS1 Wireless Portable Intercom & Instructions tested works | Lot of 6 Chamberlain NLS1 Wireless Portable Intercom & Instructions tested works | 161 | 2026-07-03 | 188536096375 |
| 65 | 177784223729 | Vintage METLOX CERAMIC made In USA Shell Shrimp Cocktail Serving Dish 12.5” | Vintage Metlox Ceramic made In USA Shell Shrimp Cocktail Serving Dish 12.5” | 154 | 2026-07-03 | 178238187918 |
| 66 | 187960896550 | Holy Bible: RSV Burgundy, Genuine Leather By Saint Benedict Press | Holy Bible: RSV Burgundy, Genuine Leather By Saint Benedict Press Used | 154 | 2026-07-04 | 188536097999 |
| 67 | 187962741374 | Walt Disney's Treasury of Children's Classics Hardback 1978 Vintage Stories | Walt Disney's Treasury of Children's Classics Hardback 1978 Vintage Stories | 154 | 2026-07-04 | 188536098805 |
| 68 | 187962744611 | My Dog Piggy Bank Dog & Food Bowl Animated Coin Bank - Brand New & Sealed | My Dog Piggy Bank Dog & Food Bowl Animated Coin Bank - Brand New & Sealed | 154 | 2026-07-04 | 188536099274 |
| 69 | 187964801109 | Tru-Flate Brass Coupler 1/4 in. Male NPT No. 12-125 NOS | Tru-Flate Brass Coupler 1/4 in. Male NPT No. 12-125 NOS New | 152 | 2026-07-04 | 188536099839 |
| 70 | 177790049241 | Lot of 5 Disney Laserdisc, Bambi Dumbo Aladdin Cinderella Pinocchio | Lot of 5 Disney Laserdisc, Bambi Dumbo Aladdin Cinderella Pinocchio Used | 152 | 2026-07-04 | 178238188858 |
| 71 | 187967170463 | Tru-flate 2 Pack 1/4" X 1/4" NPT Coupler Nipple Female Pipe NOS No. 3C-VP | Tru-flate 2 Pack 1/4" X 1/4" NPT Coupler Nipple Female Pipe NOS No. 3C-VP New | 152 | 2026-07-05 | 188536100983 |
| 72 | 177790069982 | Milton 1/8-Inch Rubber Blow Gun Tip No. S152 NOS | Milton 1/8-Inch Rubber Blow Gun Tip No. S152 NOS New | 152 | 2026-07-05 | 188536101545 |
| 73 | 177794369275 | Vintage Case Logic 30 Cassette Travel Carrying Case With Handle | Vintage Case Logic 30 Cassette Travel Carrying Case With Handle | 150 | 2026-07-05 | 188536101927 |
| 74 | 187999179580 | New Vintage Alaska State Park Moose Souvenir Patch NOS | New Vintage Alaska State Park Moose Souvenir Patch NOS | 143 | 2026-07-05 | 188536102469 |
| 75 | 187999180576 | Vtg NACCO COPCO Denmark  Brown Enamel Cast Iron Lasagna Baking Dish 14 x 8.5” | Vtg Nacco Copco Denmark Brown Enamel Cast Iron Lasagna Baking Dish 14 x 8.5” | 143 | 2026-07-05 | 178238190227 |
| 76 | 188010066443 | Craftsman C3 19.2V Cordless Power Tools  & Battery Lithium Ion Lot Of 8 WORKS | Craftsman C3 19.2V Cordless Power Tools & Battery Lithium Ion Lot Of 8 Works | 140 | 2026-07-06 | 178238190431 |
| 77 | 188011986833 | RSV Holy Bible Melton Concordance Revised Standard Version Black Leather 1952 | RSV Holy Bible Melton Concordance Revised Standard Version Black Leather 1952 | 140 | 2026-07-06 | 178238190697 |
| 78 | 177823835911 | Cafe Du Monde Coffee Mug Cup French Market NOLA New Orleans LA Louisiana | Cafe Du Monde Coffee Mug Cup French Market Nola New Orleans La Louisiana Used | 140 | 2026-07-06 | 178238190965 |
| 79 | 188029178497 | Breville Mini Smart Oven BOV450XL Toaster Oven Stainless Steel With Rack | Breville Mini Smart Oven BOV450XL Toaster Oven Stainless Steel With Rack Used | 134 | 2026-07-06 | 178238191167 |
| 80 | 188046084052 | Antique Machinist Tool Die Tap Wrench 24 Inches Long | Antique Machinist Tool Die Tap Wrench 24 Inches Long | 129 | 2026-07-06 | 178238191399 |
| 81 | 177868323011 | VTG Capodimonte Italy  "The Cheaters" 3 Boys Playing Cards Porcelain Vintage | Vtg Capodimonte Italy "The Cheaters" 3 Boys Playing Cards Porcelain Vintage | 124 | 2026-07-07 | 178238191626 |
| 82 | 188064789168 | NOS Lot of 3 Vintage Christmas Cartoons VHS Tapes Frosty, Rudolph & Santa Claus | NOS Lot of 3 Vintage Christmas Cartoons VHS Tapes Frosty, Rudolph & Santa Claus | 124 | 2026-07-07 | 188536105956 |
| 83 | 188068298393 | Sambo's Restaurant Wooden Nickel Chattanooga, TN Token Coffee Chip .10 | Sambo's Restaurant Wooden Nickel Chattanooga, Tn Token Coffee Chip .10 | 122 | 2026-07-07 | 178238192130 |
| 84 | 188091279748 | Greenworks G24 24v Lithium-Ion Battery Charger OEM #2903102 Tested | Greenworks G24 24v Lithium-Ion Battery Charger OEM #2903102 Tested | 116 | 2026-07-07 | 178238192441 |
| 85 | 188103585951 | MONIN Flavor Station 2-Tier Wire Syrup Bottle Rack Metal Display Organizer Stand | Monin Flavor Station 2-Tier Wire Syrup Bottle Rack Metal Display Organizer Stand | 112 | 2026-07-07 | 188536107302 |
| 86 | 177948462775 | VINTAGE SCHICK XTREME 3 DISPOSABLE RAZOR | Vintage Schick Xtreme 3 Disposable Razor New | 101 | 2026-07-08 | 178238193013 |
| 87 | 177963266032 | 1978 APRIL BYTE MAGAZINE - SMALL SYSTEMS JOURNAL COMPUTERS TECH - L 20774 | 1978 April Byte Magazine - Small Systems Journal Computers Tech - L 20774 Used | 96 | 2026-07-08 | 178238193290 |
| 88 | 177963274625 | Smart Nora Contactless Snoring Solution -  With Pillow Insert - White | Smart Nora Contactless Snoring Solution - With Pillow Insert - White Used | 96 | 2026-07-08 | 188536108844 |
| 89 | 188169807574 | Sol de Miró ESPAÑA Spain Tourism Logo Large Tile | Sol de Miró España Spain Tourism Logo Large Tile Used | 96 | 2026-07-08 | 178238193791 |
| 90 | 188173732034 | Apple A1243 Wired USB Slim Keyboard Tested - Works Great | Apple A1243 Wired USB Slim Keyboard Tested - Works Great | 95 | 2026-07-08 | 178238194018 |
| 91 | 177974225627 | LG 6711A20034G Air Conditioner Remote Control OEM Replacement Tested Working | LG 6711A20034G Air Conditioner Remote Control OEM Replacement Tested Working | 93 | 2026-07-09 | 178238194274 |
| 92 | 177974225947 | Lasko 6 Button Remote Control - Tested Works Great | Lasko 6 Button Remote Control - Tested Works Great | 93 | 2026-07-09 | 188536111489 |
| 93 | 188189290167 | On the Pulse of Morning - Hardcover By Angelou, Maya | On the Pulse of Morning - Hardcover By Angelou, Maya Used | 91 | 2026-07-09 | 188536112064 |
| 94 | 188191342796 | Genuine OEM Sony Remote RMT-D130A for  Sony CD DVD Player | Genuine OEM Sony Remote RMT-D130A for Sony CD DVD Player Used | 91 | 2026-07-09 | 188536112829 |

## Skipped listings (left active — require manual attention)

These eligible stale listings were **not** ended or relisted because doing so would require changing the category or adding/altering item specifics, which policy forbids. They remain active and unchanged.

| Item ID | Title | Skip reason |
|---|---|---|
| 176391181254 | Maui County Lahaina TShirt Surf USA Unisex Jersey Short Sleeve Tee | eBay now requires the Color & Size item specific(s) in this category, which the original listing does not contain. Relisting would require adding item specifics that are not stated in the original (policy forbids inventing/changing specifics). Left ACTIVE for manual review. |
| 186455959242 | Paia Maui Tribal Hawaiian shirt Island Wear Unisex Jersey Short Sleeve Tee | eBay now requires the Color & Size item specific(s) in this category, which the original listing does not contain. Relisting would require adding item specifics that are not stated in the original (policy forbids inventing/changing specifics). Left ACTIVE for manual review. |
| 187010211229 | Nobody Cares Work Harder Shirt Motivational Fitness Gym Graphic Tee Workout | eBay now requires the Color & Size item specific(s) in this category, which the original listing does not contain. Relisting would require adding item specifics that are not stated in the original (policy forbids inventing/changing specifics). Left ACTIVE for manual review. |
| 176888761861 | Nobody Cares Work Harder Shirt Motivational Gym Fitness Graphic Tee Workout | eBay now requires the Color & Size item specific(s) in this category, which the original listing does not contain. Relisting would require adding item specifics that are not stated in the original (policy forbids inventing/changing specifics). Left ACTIVE for manual review. |
| 176987134990 | Lahaina Maui Tribal Hawaiian shirt Island Wear Unisex Jersey Tee | eBay now requires the Color & Size item specific(s) in this category, which the original listing does not contain. Relisting would require adding item specifics that are not stated in the original (policy forbids inventing/changing specifics). Left ACTIVE for manual review. |
| 176987242032 | Makawao Maui Tribal Hawaiian shirt Island Wear Unisex Jersey Tee | eBay now requires the Color & Size item specific(s) in this category, which the original listing does not contain. Relisting would require adding item specifics that are not stated in the original (policy forbids inventing/changing specifics). Left ACTIVE for manual review. |
| 187121784763 | Kula Maui Tribal Hawaiian shirt Island Wear Unisex Jersey Tee | eBay now requires the Color & Size item specific(s) in this category, which the original listing does not contain. Relisting would require adding item specifics that are not stated in the original (policy forbids inventing/changing specifics). Left ACTIVE for manual review. |
| 176989891664 | Hilo Hawaii Tribal Hawaiian shirt Island Wear Unisex Jersey Tee | eBay now requires the Color & Size item specific(s) in this category, which the original listing does not contain. Relisting would require adding item specifics that are not stated in the original (policy forbids inventing/changing specifics). Left ACTIVE for manual review. |
| 176990130438 | Makawao Maui Paniolo Cowboy Hawaiian shirt Island Wear Unisex Jersey Tee | eBay now requires the Color & Size item specific(s) in this category, which the original listing does not contain. Relisting would require adding item specifics that are not stated in the original (policy forbids inventing/changing specifics). Left ACTIVE for manual review. |
| 176990137141 | Hona Hawaii Tribal Hawaiian shirt Island Wear Unisex Jersey Tee | eBay now requires the Color & Size item specific(s) in this category, which the original listing does not contain. Relisting would require adding item specifics that are not stated in the original (policy forbids inventing/changing specifics). Left ACTIVE for manual review. |
| 187415564921 | 1975 Topps Wacky Packages 3rd. Series Hurtz Canary Food | Trading-card category requires a 'Card Condition' item specific that is not present in the original listing. Cannot supply it without inventing a grade. Left ACTIVE for manual review. |
| 187423145770 | SUPER CIGAR CRISP Wacky Packages 6th Series 1974  Tan back | Trading-card category requires a 'Card Condition' item specific that is not present in the original listing. Cannot supply it without inventing a grade. Left ACTIVE for manual review. |
| 188023527473 | TESLA Model 3 OEM Front License  Plate Holder Fastener PN 1123007-00-A Cover | The original listing's category ID is no longer valid for new listings. Relisting would require changing the category (policy forbids changing category). Left ACTIVE for manual review. |
| 177846045149 | NEW OEM TESLA MODEL 3 Y FRONT HOOD LOGO BADGE EMBLEM OEM 1494949-00-A | The original listing's category ID is no longer valid for new listings. Relisting would require changing the category (policy forbids changing category). Left ACTIVE for manual review. |
| 177854337341 | Breville 12c Grind Control Drip Coffee Maker Brushed Stainless Steel BDC650BSS | Category now permits only a single 'Coffee Type' value, but the original carries multiple values. Relisting would require altering item specifics (policy forbids). Left ACTIVE for manual review. |

## Excluded listings (policy: "power cord")

- **12** active stale listings whose titles contain "power cord" were excluded under the hard no-touch policy. Per policy they are **not itemized** here — they were skipped silently, never read for rewriting, never ended, and counted only as excluded.

## Notes

- No new listing goes live immediately; every relist uses a future `ScheduleTime` (earliest 2026-06-21 10:00 AM ET).
- No title exceeds 80 characters; ALL-CAPS, `L@@K`, and decorative filler were removed; condition keywords were added where helpful. Titles and descriptions were rewritten only for presentation — no facts, specs, prices, categories, conditions, or item specifics were changed or invented.
- Descriptions were rebuilt as structured HTML bullets (item details, condition, what's included) drawn strictly from each listing's own title, item specifics, and condition data.
