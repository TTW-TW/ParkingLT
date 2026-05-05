# API 說明

## 串接來源

- 採用兩個來源(一主要、一備援)的方式
- 如果主要來源沒有成功返還，則改接備援

## 主要來源 - 宜蘭縣交通資訊

- apiUrl = "https://tp.e-land.gov.tw/ATIS/api/ParkingAPI/GetNestDetailAll?lat=25.03025734778557&lng=121.51909921977521&_=1777821268523"
- 參考介面端："https://tp.e-land.gov.tw/ATIS?Parking=ShowParkingTab"

## 備援來源 - 停車我最大

- apiUrl = "https://parkboss.tw/api/v1/query-parking-space-by-coordinate?lat=24.683&lon=121.777"
- 參考介面端："https://parkboss.tw/map/yilan-county"

## 【常用地點】及所需停車場

- 開設一個config.favorateParking 陣列物件讓我可以自行編輯
- 此陣列的長度，會對應到`spec_frontend.md` 中的 `3. 常用地點`數量
- `siteName` 是要顯示在 `3. 常用地點` 按鈕中的名稱
- `parkingZhName`、`parkingApi1ID` 和 `parkingApi2ID` 均為陣列資料，且陣列長度必須相等
- `parkingZhName` 是要顯示在 `4. 停車場資訊` 的停車場名稱 (包在左右切換按鈕中間的)
- `parkingApi1ID` 是對應主要 API 來源的停車場 key 資訊，方便撈資料
- `parkingApi2ID` 是對應備援 API 來源的停車場 key 資訊，方便撈資料，如果為 null 表示 api 中沒有這筆停車場
- `defaultParking` 表示該地點中預設展示的停車場
- (如果有更好的資料結構建議也可以採用你的方案)

```javascript
// config.favorateParking
[
    {
        siteName: "首都客運",
        parkingZhName: [
            "Times新羅東轉運站",
            "TIMES羅東光榮路停車場",
            "博客停車場-羅東光榮場",
        ],
        parkingApi1ID: [240, 84, 228],
        parkingApi2ID: ["ila-240", "ila-84", "ila-228"],
        defaultParking: "Times新羅東轉運站",
    },
    {
        siteName: "公正國小",
        parkingZhName: ["羅東公正地下停車場", "公正平面停車場"],
        parkingApi1ID: [31, 35],
        parkingApi2ID: ["ila-31", null],
        defaultParking: "羅東公正地下停車場",
    },
    {
        siteName: "後站",
        parkingZhName: [
            "TIMES羅東站東路第4停車場",
            "羅東停三停車場",
            "TIMES羅東車站前停車場",
            "羅東陽明路停車場",
        ],
        parkingApi1ID: [219, 34, 81, 214],
        parkingApi2ID: ["ila-219", "ila-34", "ila-81", "ila-214"],
        defaultParking: "羅東公正地下停車場",
    },
    {
        siteName: "前站",
        parkingZhName: ["羅東停一停車場", "TIMES羅東站前路停車場"],
        parkingApi1ID: [33, 263],
        parkingApi2ID: ["ila-33", "ila-263"],
        defaultParking: "羅東公正地下停車場",
    },
];
```

【首都羅東】 (預設展示：Times新羅東轉運站)

- Times新羅東轉運站
- TIMES羅東光榮路停車場
- 博客停車場-羅東光榮場
  nul
  【公正國小】 (預設展示：羅東公正地下停車場)

- 羅東公正地下停車場
- 公正平面停車場

【後站】(預設展示：TIMES羅東站東路第4停車場)

- TIMES羅東站東路第4停車場
- 羅東停三停車場
- TIMES羅東車站前停車場
- 羅東陽明路停車場

【前站】 (預設展示：羅東停一停車場)

- 羅東停一停車場
- TIMES羅東站前路停車場
