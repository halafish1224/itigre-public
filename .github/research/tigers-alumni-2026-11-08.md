# Tigers alumni batch — 2026-11-08

Base: `24862ded5f6bc0b32bcd89c34e4729a0336d33fd` (PR #122 already merged).
Scope: five existing profiles; second-career reading paths in player and coaching archives.
Research notes live under `.github/`, excluded from the Pages artifact by the existing workflow.

## Prior work and overlap

- Main already contains the Lin Chen-hsien, Lan Wen-cheng, Lin Kun-han and Kang Ming-shan coaching/education additions from #122. Preserve those profiles; link to them rather than research them again.
- Open #1 is a CMS draft. Leave it untouched.
- Open #82 covers Nakao's 1999 coaching roles and is currently not mergeable. Preserve the main chronology; this batch appends a separate legacy section only. Do not replace or merge #82 as part of this batch.
- Existing 55 roster entries remain unchanged.

## Evidence ledger

### 林仲秋 / lin-chung-chiu

- TSG Hawks, 2025-12-18: https://www.tsghawks.com/4屆全壘打王助陣-林仲秋春訓期間擔任客座教練/
- CNA reporter article, same day: https://www.cna.com.tw/news/aspt/202512180237.aspx
- Both identify prior Whales manager/Bulls batting-coach roles and Dongshih coaching from 2009, described as 16 years at the announcement date. This is a historical duration, not an assertion of uninterrupted employment through today's date.
- The club announcement and CNA coverage concern the same announcement, not two independently discovered personnel records. Existing 2026 VL reporting separately covers his actual spring-training instruction.

### 翁豐堉 / weng-feng-yu

- Contemporary KMDN, 2014-07-22: https://www.kmdn.gov.tw/1117/1271/1272/241553/
- Contemporary KMDN, 2015-08-08: https://www.kmdn.gov.tw/1117/1271/1272/256703/
- CNA, 2015-01-14: https://www.cna.com.tw/news/aspt/201501140427.aspx
- Existing KMDN retrospective, 2023-04-29: https://www.kmdn.gov.tw/1117/1271/4189/554190/
- 2014 report explicitly places Huang and Weng together with Hsi Yuan's junior-high division. The 2015 article documents a later visit. Do not collapse the two visits into one event or infer school appointment start/end dates.
- CNA's original is now partially paywalled, but its visible lead confirms the county-government visit and promotion intent. No claim relies on inaccessible text.

### 陳該發 / chen-gai-fa

- School original: https://www.ksu.edu.tw/focusNews/detail/14462
- School release readable on CNA's supplied-content platform, 2024-06-21: https://www.cna.com.tw/postwrite/chi/374455
- UDN reporter coverage, 2024-06-22: https://udn.com/news/story/6898/8047315
- School source and UDN agree on the 2020 batting-coach appointment and 2024 business-administration master's degree. School page is JavaScript-dependent; its supplied release provides the readable text.
- CNA supplied content is explicitly labeled as a school release, not a CNA reporter story and not an independent second source. UDN overlaps substantially with the release; do not overstate independence.
- Summarize the thesis topic rather than reproduce its full title or infer that it proves a particular leadership method superior.

### 林岳亮 / lin-yueh-liang

- Existing UDN, 2001-07-28: https://catalog.digitalarchives.tw/item/00/32/25/6e.html
- UDN, 2002-01-04: https://catalog.digitalarchives.tw/item/00/32/28/35.html
- CPBL, 2002-08-03: https://cpbl.com.tw/xmdoc/cont?sid=0L132508654240496944
- CPBL, 2003-05-16: https://cpbl.com.tw/xmdoc/cont?sid=0L132508533381246871
- The 2001 market work was an interruption, not final retirement. January 2002 is a return-to-team report; later official match reporting confirms actual participation, avoiding reliance on a proposed return alone.
- Do not convert his stated coaching aspiration into a verified coaching appointment. Do not infer present occupation from old reporting. No disciplinary allegations are added.
- The live CPBL individual profile intermittently returns 404 in this environment; prefer the official dated match reports for the comeback addition. No new aggregate statistics are published.

### 黃武雄 / huang-wu-hsiung

- E.SUN's contemporary sponsor announcement, 2010-08-02: https://www.esunfhc.com/zh-tw/news-center/news-center/news/detail?id=BC125620E22941179F4A2D8B99E46B90&p=56D9E07D6A2E46C1B66E32E1F142C43F
- Presidential Office, 2010-09-12: https://www.president.gov.tw/NEWS/14639
- Contemporary KMDN, 2014-07-22, as above, confirms his Hsi Yuan role with Weng.
- Sponsor source identifies Huang as manager and the 8–4 final; Presidential Office independently confirms the 2010 championship, but does not identify the manager. The sponsor's “first” wording conflicts with the Presidential Office's 27-year interval. Publish the championship without repeating the “first” claim.
- Avoid adding private family, injury or health details.

## Validation and continuity

- Existing Tigers preflight: 60 HTML pages, 809 local links/assets passed.
- Additional one-off check: 17 local fragment links resolve; roster remains 55 cards.
- Browser preview: five second-life cards, no desktop horizontal overflow; Chen card opens the new biography anchor; coaching legacy section renders correctly.
- Mobile: added scoped single-column CSS at 600px; no mobile viewport emulation available in the supported browser API, so mobile visual QA is not claimed.
- No new image assets, third-party photos, deployment configuration changes, Tumblr operations or Netlify workflow dispatches.
- Next batch: deepen Lin Kun-han and Kang Ming-shan only where official school/government sources add to #122; then extend five-to-ten-person batches to Tsai Sheng-feng, Lan Wen-cheng and Lin Chen-hsien. Resolve #82 separately against current main and its original sources.
