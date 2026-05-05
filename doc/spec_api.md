# API 說明

## 串接來源

- 採用兩個來源(一主要、一備援)的方式
- 如果主要來源沒有成功返還，則改接備援

## 主要來源 - 宜蘭縣交通資訊

- apiUrl = "https://tp.e-land.gov.tw/ATIS/api/ParkingAPI/GetNestDetailAll?lat=25.03025734778557&lng=121.51909921977521&_=1777821268523"
- 參考介面端："https://tp.e-land.gov.tw/ATIS?Parking=ShowParkingTab"

## 備援來源 - 交通部 TDX 運輸資料流通服務

- apiBase = "https://tdx.transportdata.tw/api/basic"
- 剩餘車位 api (Get) = "/v1/Parking/OffStreet/ParkingAvailability/City/{City}"
    - "https://tdx.transportdata.tw/api/basic/v1/Parking/OffStreet/ParkingAvailability/City/YilanCounty?%24top=100&%24format=JSON"
- api規格頁面："https://tdx.transportdata.tw/api-service/swagger/basic/945f57da-f29d-4dfd-94ec-c35d9f62be7d#/CityCarParky"

## 【常用地點】及所需停車場

- 開設一個config.favorateParking 陣列物件讓我可以自行編輯
- 此陣列的長度，會對應到`spec_frontend.md` 中的 `3. 常用地點`數量
- `siteName` 是要顯示在 `3. 常用地點` 按鈕中的名稱
- `parkingZhName`、`parkingApi1ID` 、 `parkingApi2ID`、`parkingGoogleMap`、`parkingGoogleMap` 均為陣列資料，且陣列長度必須相等
- `parkingZhName` 是要顯示在 `4. 停車場資訊` 的停車場名稱 (包在左右切換按鈕中間的)
- `parkingApi1ID` 是對應主要 API 來源的停車場 key 資訊，方便撈資料
- `parkingApi2ID` 是對應備援 API 來源的停車場 key 資訊，方便撈資料，如果為 null 表示 api 中沒有這筆停車場
- `parkingAddress` 是要顯示在 `4. 停車場資訊` 的"鄰近地址"
- `parkingGoogleMap` 是要顯示在 `4. 停車場資訊` 的 【Google 導航超連結】(點擊會開啟 Google Map)
- `defaultParking` 表示該地點中預設展示的停車場
- `mapCenterX`、 `mapCenterY`表示 leaflet 地圖定位中心經緯度
- (如果你有更好的資料結構建議，也可以採用你的方案)

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
        parkingApi2ID: [240, 84, 228],
        parkingAddress: ["", "", ""],
        parkingGoogleMap: ["", "", ""],
        defaultParking: "Times新羅東轉運站",
        mapCenterX: 121.773988298883,
        mapCenterY: 24.6770576875315,
    },
    {
        siteName: "公正國小",
        parkingZhName: ["羅東公正地下停車場", "公正平面停車場"],
        parkingApi1ID: [31, 35],
        parkingApi2ID: [31, 35],
        parkingAddress: ["", ""],
        parkingGoogleMap: ["", ""],
        defaultParking: "羅東公正地下停車場",
        mapCenterX: 121.773988298883,
        mapCenterY: 24.6770576875315,
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
        parkingApi2ID: [219, 34, 81, 214],
        parkingAddress: ["", "", "", ""],
        parkingGoogleMap: ["", "", "", ""],
        defaultParking: "羅東公正地下停車場",
        mapCenterX: 121.773988298883,
        mapCenterY: 24.6770576875315,
    },
    {
        siteName: "前站",
        parkingZhName: ["羅東停一停車場", "TIMES羅東站前路停車場"],
        parkingApi1ID: [33, 263],
        parkingApi2ID: [33, 263],
        parkingAddress: ["", ""],
        parkingGoogleMap: ["", ""],
        defaultParking: "羅東公正地下停車場",
        mapCenterX: 121.773988298883,
        mapCenterY: 24.6770576875315,
    },
];
```

## 串接目標

- 目前只有`4. 停車場資訊` 的"剩餘車位" 和 "總共車位" 裡面的車位數字需要串即時資訊，其他都寫死
- 剩餘車位
    - 宜蘭縣交通資訊對應欄位："AvailableCar"
    - 交通部 TDX 對應欄位："AvailableSpaces"
- 總共車位
    - 宜蘭縣交通資訊對應欄位："TotalCar"
    - 交通部 TDX 對應欄位："TotalSpaces"

## 停車場 icon 定位點

- 為固定資料，不須串接，請讀取`yl_government.json`：
    - 找到我所有目標 "parkingApi1ID" 所對應的 "ID"
    - 裡面的 X 和 Y 就是所需點位，請把它存下來做為之後的定位點
    - 看你要擴充在 `config.favorateParking` 或是另外存一個參數都可以
