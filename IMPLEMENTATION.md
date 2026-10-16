# Universal Solar Power Solutions

## Implemented locally

- Retained the original scroll-controlled panel sequence and its poster/reduced-motion fallbacks.
- Applied Universal Solar branding with navy and solar-gold styling.
- Added an interactive working-system explainer with daylight and battery controls.
- Added five planning tools: home sizing, business ROI/finance, roof concept grid, local bill-text parsing, and solar/storage comparison.
- Added 25-year cash flows, unlevered NPV/IRR, degradation, O&M, editable yield and sensitivity. CSV export includes assumptions.
- Added guided two-step qualification, consent, proposal summary handoff, source, service classification, timeframe, contact preference and server-generated reference.
- Added maintenance / warranty / renewal requests and English/Tamil knowledge filters.
- Retained an empty verified-project journal: no invented installations, statistics, customer reviews or credentials.
- Added sitemap, robots and non-PII browser measurement events. Development remains noindex without a canonical URL.

## What requires company input before public launch

1. Verify legal identity, address, phone/WhatsApp number, service area, offered services, operating hours, emergency coverage and response targets.
2. Supply approved project records and photographs, commissioned capacities and permission to use customer references. Add only verified entries to `src/lib/content.ts`.
3. Have an engineer validate generation assumptions against Indian weather data, actual equipment, shade, tariff and export rules. Current yields and prices are illustrative editable inputs, not market quotations or location-based predictions.
4. Configure `ENQUIRY_WEBHOOK_URL` (HTTPS) and optional `ENQUIRY_WEBHOOK_TOKEN`. The receiving service must persist records, assign an owner, acknowledge customers, notify staff and schedule follow-ups. The website only reports delivery after that endpoint accepts the request. There is no connected CRM, outbound email or WhatsApp integration in this checkout.
5. Finalize the privacy contact, processors, retention/deletion schedule and access controls before accepting real enquiries. Add persistent abuse protection at the hosting edge and receiving endpoint.
6. Set `NEXT_PUBLIC_SITE_URL` to the real canonical domain. Connect consent-managed analytics if required.

## Enquiry integration contract

`POST /api/enquiry` requires same-origin JSON, validates fields and forwards to the configured server-only HTTPS endpoint. Fields: name, email, phone, property, location, requirements, service, timeframe, preference, estimate, consent, acquisitionSource, reference, source, leadCategory, leadStatus, followUpRequired, submittedAt. `source` is `universal-solar-website`; `acquisitionSource` is the bounded campaign source or entry path. Treat all forwarded text as untrusted input. Do not render it as raw HTML in your CRM. A delivery reference is not a service ticket with tracking capability.

CRM implementation should map service requests to operations and installation/survey requests to sales, create an owner/task, and track enquiry → survey → proposal → won → commissioned → paid. Record acquisition cost and actual project margin in the CRM. Webhook acceptance alone cannot establish that these downstream actions happened.

## Deliberately pending integrations

Authenticated customer documents, ticket tracking, secure image/bill uploads, OCR, real inverter monitoring, multi-site assets, automated proposals, SMS/email acknowledgements, WhatsApp Business and live weather modelling need credentials, storage, permissions and operational choices. The UI does not simulate any of these as live. Bill analysis is local pasted text; roof placement is an explicitly conceptual grid. No personal information is stored in localStorage.

## Model boundaries

Generation is annual, with no hourly load simulation. Usable capacity is limited to roof area at 10 m²/kWp. Annual yield includes ordinary losses; shade is additional. Financial outputs exclude subsidy, taxes, insurance, demand/fixed-charge savings and inverter replacement. Export credit and O&M are flat; tariff escalation and module degradation are explicit. IRR is unlevered. Loan comparison uses monthly amortization, annualized for display. Battery comparison uses average daily surplus, usable storage and night load; includes periodic replacement costs in its undiscounted 25-year balance, without battery fade or hourly dispatch. Bankable proposals require a separate engineering and financial review.

Sources checked 16 October 2026: https://pvwatts.nlr.gov/pvwatts.php/ and the MNRE National Rooftop Solar Portal https://solarrooftop.pmsuryaghar.gov.in/ linking to https://pmsuryaghar.gov.in/. No subsidy amounts or tariff schedules are hardcoded.

## Validation

Run `npm run typecheck`, `npm run build`, and `npm test`. Playwright covers frame animation, responsive navigation, unavailable delivery, calculator edge cases, scenario handoff, service requests and Tamil filtering. Real mobile Core Web Vitals and provider integration tests remain deployment checks.

## Additional conversion improvements

- Dedicated `/solutions/residential` and `/solutions/commercial` pages connect each audience to the right calculator and preselected survey enquiry.
- `/tools?mode=business` opens business ROI directly; the proposed capacity remains visible under financial assumptions across tool tabs. Scenario reset clears all planning inputs.
- The business ROI view includes an accessible 25-year cumulative/annual cash-flow chart and keyboard-operable year inspection. CSV metadata is quoted and escaped, with UTF-8 BOM for rupee characters.
- Approved project records support sector/capacity filtering, scope, equipment, commissioning date, outcomes with a documented basis, and public evidence links. No sample installations are published. Private client documents must never be put into the public content module.
- A persistent quick-contact bar links to survey and maintenance requests. Set optional `BUSINESS_PHONE` and `BUSINESS_WHATSAPP` to verified international numbers to expose direct contact links. These are public business contacts, never credentials. The bar hides on the enquiry page.
- Phone, WhatsApp and survey clicks join the existing analytics event queue. No provider is connected automatically.
- Warranty and maintenance renewal requests are classified as service leads alongside maintenance faults.

## Homepage films

The two user-supplied WhatsApp clips are integrated as illustrative media, never project evidence. The solar-array clip is the full-width homepage entrance; the residential clip sits in the home-solutions feature. Optimized public copies are in `public/media/`, so the site does not depend on temporary WhatsApp paths. Source originals are untouched. The entrance has a 480px mobile variant, muted playback, a visible pause/play control and an extracted still poster. The residential clip loads only while visible. Reduced-motion and save-data settings prevent automatic video loading; a visitor may explicitly choose playback. Videos pause when outside the viewport or the page is hidden. The existing panel scroll study remains in the engineering section. Browser tests cover mobile source selection, pause/resume, reduced-motion/save-data behavior, media failure and the relocated scroll sequence.
