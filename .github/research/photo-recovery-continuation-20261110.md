# Photo recovery continuation — 2026-11-10

## Completed in this pass

- Migrated 311 public body-image references across 37 article pages from local `recovered-media` URLs to their existing verified Cloudinary URLs.
- Synchronized 320 mappings in `halafish1224/itigre-astro`; the source repository retains nine additional AIMYON mappings not present in the published page.
- Verified all 37 live article pages: no rendered `<img src>` still points to `recovered-media`.
- Cleaned the remaining AIMYON full-size image link so both the rendered image and its click-through target use Cloudinary.
- Twelve sampled Cloudinary asset URLs returned HTTP 200.

## Exact Instagram candidates prepared for the next Cloudinary upload batch

These are not speculative keyword matches. Each image was retrieved from the Open Graph image of the exact Instagram permalink already embedded in the corresponding ITIGRE article, and the Open Graph description identified the account as `halafish`.

| Article ID | ITIGRE title | Instagram permalink | Prepared image |
|---|---|---|---|
| 707769571369680896 | #塞車也是旅程的一段 | https://www.instagram.com/p/Cn_iNWYvcAD0ZDKBDCoSvHyzrEt0oeYDsF_lBM0/ | 640×640 WebP, 82,540 bytes |
| 707771992935432192 | 漢堡排。 | https://www.instagram.com/p/Cn_mnVhvj81qZTwtZl4YCHRxWCreCuPMUd59200/ | 640×640 WebP, 90,216 bytes |
| 708219335043366912 | #sakura | https://www.instagram.com/p/CoMUU6wvgzUqi47ZA2aLK0qblqFEay7jYTKA1g0/ | 486×486 WebP, 76,288 bytes |
| 708298203719663616 | #海鮮大咖。（在 十八食酒居食屋（十八食堂）） | https://www.instagram.com/p/CoOjyWsvBKHbm4WuEK27cstVg0TNdVUNyu70jE0/ | 640×640 WebP, 61,840 bytes |
| 708323891676938240 | 好久不見的書展 | https://www.instagram.com/p/CoPSgVbvCo4YuMMwDoLqmo58D3P_Dsc8QYmHPc0/ | 640×640 WebP, 45,336 bytes |
| 708329960052555776 | #taipei101 | https://www.instagram.com/p/CoPdjQgPdhvt4jWlHLQO4OMyBHf-MpuSrNNMqU0/ | 640×640 WebP, 56,322 bytes |
| 708839305704046592 | 菜菜菜菜 | https://www.instagram.com/p/Cod8C9ZP0Ja1cvt9maVpLFM9jfc3vZuEjGH6000/ | 640×640 WebP, 68,884 bytes |
| 708929939259457536 | 早早早早 | https://www.instagram.com/p/Cogg6AUvuCtVv2-j8qQ9TDd6nEe4-_LfJvhO3U0/ | 576×575 WebP, 30,140 bytes |
| 709402370778497024 | #sakura wow | https://www.instagram.com/p/Cot8QRJPUHfDNHc_KlPd3j93_Md0HCtbhdrPMU0/ | 640×640 WebP, 79,198 bytes |
| 709874105100451840 | 髒空氣裡的美麗畫面 | https://www.instagram.com/p/Co7WVbpvDDg6GMe03gxWwOAsAordah3CCHit1g0/ | 640×640 WebP, 8,126 bytes |
| 710463462715867136 | 室內菜場小時候是電動場 | https://www.instagram.com/p/CpMGXkkvAnW3FCXoa9V0A1hKTHg-kgBExKfG_00/ | 640×639 WebP, 115,338 bytes |
| 710778489332203520 | 用爆裂的麥香堡 | https://www.instagram.com/p/CpVDZkNvgwo-2-w6_n4ZXIlYT0hMOuubuJIuFo0/ | 640×640 WebP, 36,778 bytes |

## Publication gate

Do not add these twelve images to article bodies until the actual files have been uploaded into the user's Cloudinary account and the resulting `res.cloudinary.com` URLs are recorded. An Instagram CDN or OG URL is not considered a completed restoration.

## Remaining metadata note

The article `post/145361208772/虎衣開箱系列文/` still carries old `data-orig-src` metadata values, but every rendered `<img src>` was verified to use Cloudinary. These metadata values do not affect what visitors see and should only be cleaned when their original-file click targets are intentionally migrated.
