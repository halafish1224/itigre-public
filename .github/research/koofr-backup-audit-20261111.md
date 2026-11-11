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

## Restored with high confidence

### Tumblr post 178756580097 — 星星城市與我們

- Backup group timestamp: `2018-10-05 04.51.41`
- Three images belong to the same archived Instagram post group.
- One 1080 × 1080 backup image was visually verified as the uncropped original of the surviving Instagram preview used by this article.
- All three originals were copied to Cloudinary under `itigre/halafish/koofr-178756580097-*` before being referenced by the article.

### Tumblr post 179172879202 — 終於見到桑德斯上校

- Backup timestamp: `2018-10-18 06.37.53`.
- The backup is a KFC tiny-planet scene showing the store and Colonel Sanders figure; the surviving preview for the same article shows the same store and figure from conventional angles.
- Article date, subject, venue, and surviving preview all agree. The original was copied to Cloudinary as `itigre/halafish/koofr-179172879202-01` before publication.

## Deferred candidates

The following groups share dates or visual clues with existing articles but do not yet meet the same-image verification threshold. They must not be published without another confirming signal (surviving preview crop, caption/permalink metadata, or manual confirmation).

- `2019-04-15 15.15.28` — three travel-day images; possible post 184199586482.
- `2019-06-03 16.35.00` — three presentation/classroom images; possible post 185339120112. This overlaps the separate Mercuries Tigers editorial stream and is intentionally left untouched.
- `2019-06-06 08.27.32` — Korean meal image; same-date post title does not reliably describe it.
- `2019-06-07 06.43.32` — Running Man challenge image; automated feature matching produced a false positive and was rejected.
- `2019-07-20 02.11.29` — boxed food order; possible group-buying post, but not yet verified.

## Rule for future recovery

Upload verified originals to Cloudinary first, retain the original Instagram link as provenance, then update the article. Date-only or generic visual similarity is insufficient.
