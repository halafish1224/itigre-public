# 2019 首爾、釜山旅記原照復原核對（2026-11-09）

基準：public main e5f5dc8743fe28b9ec921665368f18a8f2a63343；Astro main 92eff7d8b4f5b9290bdbae10c18c8f9228c23f48。檢查兩庫 open PR 未見本批文章重疊。

## 核對方法

從旅記正文既有的典藏短文連結追到 archive.json 內原始 Instagram 長網址，再開啟該貼文的公開 captioned embed。核對 Username 為 halafish、原 caption、地點（可取得時）、實際主圖。僅使用 EmbeddedMediaImage，未取頭像、推薦貼文或網站 OG 縮圖。逐張檢視圖片，並核對 CDN efg 的 regular_photo 標記；不以縮圖看起來像照片就視為靜態照片。保留原始碼及現有圖片，不變動原文和既有連結。

## 採用照片

| 典藏 ID | 原始貼文 | 畫面核對 |
|---|---|---|
| 184912353517 | https://www.instagram.com/p/BxgwqFTH05S/ | 滿足五香豬腳的切片豬腳與芝麻醬汁 |
| 184931987132 | https://www.instagram.com/p/Bxi9LJ-HR4D/ | 2019 年 5 月首爾往釜山的 KTX 車票 |
| 184936683722 | https://www.instagram.com/p/BxjbfB2nTLE/ | 釜山凡胎手工炸醬麵餐桌上的餐點、洋蔥與醬汁 |
| 184954516847 | https://www.instagram.com/p/BxldcFGnCUP/ | 釜山 PO TID 咖啡廳的磚牆店面與亮燈入口 |
| 184956103557 | https://www.instagram.com/p/BxloK5VnAW2/ | 海田烤腸餐桌上鋪滿蔥花的烤腸 |
| 184981086812 | https://www.instagram.com/p/BxoXJyhntqs/ | 釜山雙胞胎豬肉湯飯的湯飯、切片肉與小菜 |

詳細欄位：見同名 JSON；六張皆為 regular_photo。凡胎為輪播首張，只復原已核看的這一張，不推論其他輪播內容。KTX 票面可見 2019 年 5 月日期及首爾－釜山方向。PO TID 圖片可見店名入口；貼文 caption 為 harrypotter／網美咖啡廳。圖片不是新拍或 AI 重繪。

## 排除與待查

- 184863397162（一隻雞）：雖作者、caption、地點均吻合，但 efg 為 video_default_cover_frame，排除影片封面。
- 新馬 2015、首爾聖誕 2017：正式頁面與 main 的 journal-body 均為 0 img；典藏短文只存文字、無 Instagram 原網址。舊 Tumblr 頁面讀取為 403（瀏覽器檢查）或 404；未能建立原照對照，維持待查，不靠地點或標籤猜配。
- 分享對話連結未能讀取；採本次使用者提供的交接內容與兩庫最新 main 為準。

## 範圍與驗證

旅記原有九張圖片全部保留，新增六張，共十五張；六則對應短文各一張，共用同一批站內 WebP。正文去除新 figure 後與編輯前逐字相同，所有原有 href 保留。新增圖片均有 alt、固有尺寸、lazy loading 及 async decoding。

本檔是內部復原紀錄，放在 .github/research，不插入公開文章正文。
