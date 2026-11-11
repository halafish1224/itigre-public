# Koofr backup audit — 2026-11-11

Source: `https://k00.fr/02rl5cr8`

## Inventory observed

- GitHub backup
- Instagram Archived Live
- Instagram Archived Posts
- Instagram IGTV Videos
- Instagram Reels
- Instagram Stories

The `Instagram Archived Posts` folder currently contains 30 files: 23 JPG images and 7 MP4 videos.

## Matching method

Instagram shortcodes encode the media creation timestamp. For this archive, subtracting seven hours from that timestamp aligns the result with the Koofr filename time. A filename match within seconds is treated as authoritative and is checked against the page title or surviving preview before publication.

## Restored with high confidence

| Post | Backup timestamp | Images | Evidence |
| --- | --- | ---: | --- |
| 178756580097 — 星星城市與我們 | 2018-10-05 04.51.41 | 3 | Same archived group; one original visually matches the surviving crop. |
| 179178662582 — 海邊的卡夫卡 | 2018-10-18 06.37.53 | 1 | Shortcode time and backup filename match to the second. |
| 179190099737 — 即雨岡山 | 2018-10-18 14.15.28 | 1 | Shortcode time and backup filename match to the second; image shows Okayama Castle. |
| 182819743022 — 資深藝人見面會 | 2019-02-14 22.22.31 | 1 | Exact one-hour seasonal offset; title and event collage agree. |
| 182835767042 — 整裝上路 | 2019-02-15 17.11.45 | 1 | Exact one-hour seasonal offset; travel collage agrees. |
| 184211990622 — 麥當當都還沒開 | 2019-04-15 15.15.28 | 3 | Shortcode time and backup filename differ by one second. |
| 185349508722 — 叫叫CABD | 2019-06-03 16.35.00 | 3 | Shortcode time and backup filename differ by one second. |
| 185408210477 — 半個月前的餓食記錄 | 2019-06-06 08.27.32 | 1 | Shortcode time and backup filename match to the second; food caption agrees. |
| 185429118357 — Running Man 挑戰 | 2019-06-07 06.43.32 | 1 | Shortcode time and backup filename match to the second; challenge caption agrees. |
| 185495131247 — 2019 Korea 記趣 | 2019-06-10 06.05.44 | 1 | Shortcode time and backup filename match to the second. |
| 186418612722 — 今日團購 | 2019-07-20 02.11.29 | 1 | Shortcode time and backup filename match to the second; boxed product agrees. |

All originals were copied to Cloudinary under `itigre/halafish/koofr-*` before the article pages referenced them. The earlier placement of the KFC tiny-planet image on post 179172879202 was corrected after timestamp decoding showed it belongs to post 179178662582.

## Deferred candidates

These files still lack a unique timestamp or content match and must not be published without another confirming signal:

- `2016-04-29 05.23.40`
- `2018-09-23 01.34.55`
- `2018-09-23 19.36.23`
- `2018-09-29 06.56.53`
- `2019-02-14 05.51.59`

## Rule for future recovery

Decode and compare the Instagram timestamp first, confirm the subject or surviving preview, upload the verified original to Cloudinary, retain the Instagram link as provenance, and then update the article. Date-only or generic visual similarity is insufficient.
