const config = {
    // 問候語設定
    greetingText: {
        midnight: "夜深了，開車要打起精神喔",
        morning: "早安，用咖啡開啟美好的一天",
        noon: "午安，出門別忘了關瓦斯、帶手機",
        afternoon: "午後時光，喝杯花草茶吧",
        night: "晚安，回家的路上不要打瞌睡喔",
    },

    // 常用地點資料 [cite: 17]
    favorateParking: [
        {
            siteName: "首都",
            parkingZhName: [
                "Times新羅東轉運站",
                "TIMES羅東光榮路停車場",
                "博客停車場-羅東光榮場",
            ],
            parkingApi1ID: [240, 84, 228],
            parkingAddress: [
                "羅東鎮羅榮路2號B1、B2",
                "宜蘭縣羅東鎮光榮路327號旁空地",
                "羅東鎮光榮路267號",
            ],
            parkingGoogleMap: [
                "https://www.google.com/maps?q=24.677496,121.779139",
                "https://www.google.com/maps?q=24.678400,121.777631",
                "https://www.google.com/maps?q=24.675890,121.777533",
            ],
            defaultParking: "Times新羅東轉運站",
            mapCenterX: 121.777539,
            mapCenterY: 24.677496,
            parkingCoords: [
                [24.677496, 121.779139],
                [24.6784, 121.777631],
                [24.67589, 121.777533],
            ],
        },
        {
            siteName: "公正國小",
            parkingZhName: ["羅東公正地下停車場", "公正平面停車場"],
            parkingApi1ID: [31, 35],
            parkingAddress: [
                "宜蘭縣羅東鎮中華路47號地下一、二樓",
                "宜蘭縣羅東鎮公正路199號",
            ],
            parkingGoogleMap: [
                "https://www.google.com/maps?q=24.678900,121.767050",
                "https://www.google.com/maps?q=24.679290,121.766660",
            ],
            defaultParking: "羅東公正地下停車場",
            mapCenterX: 121.76705,
            mapCenterY: 24.6789,
            parkingCoords: [
                [24.6789, 121.76705],
                [24.67929, 121.76666],
            ],
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
            parkingAddress: [
                "宜蘭縣羅東鎮傳藝路三段239號旁",
                "羅東鎮站前東路2號",
                "宜蘭縣羅東鎮傳藝路三段229號旁",
                "宜蘭縣羅東鎮陽明路41號旁",
            ],
            parkingGoogleMap: [
                "https://www.google.com/maps?q=24.677340,121.775213",
                "https://www.google.com/maps?q=24.678434,121.775137",
                "https://www.google.com/maps?q=24.678429,121.775263",
                "https://www.google.com/maps?q=24.676993,121.776536",
            ],
            defaultParking: "TIMES羅東車站前停車場",
            mapCenterX: 121.775263,
            mapCenterY: 24.678429,
            parkingCoords: [
                [24.67734, 121.775213],
                [24.678434, 121.775137],
                [24.678429, 121.775263],
                [24.676993, 121.776536],
            ],
        },
        {
            siteName: "前站",
            parkingZhName: ["羅東停一停車場", "TIMES羅東站前路停車場"],
            parkingApi1ID: [33, 263],
            parkingAddress: [
                "宜蘭縣羅東鎮火車站前站廣場南側",
                "宜蘭縣羅東鎮站前路30號旁",
            ],
            parkingGoogleMap: [
                "https://www.google.com/maps?q=24.677057,121.773988",
                "https://www.google.com/maps?q=24.676856,121.773932",
            ],
            defaultParking: "羅東停一停車場",
            mapCenterX: 121.775263,
            mapCenterY: 24.678429,
            parkingCoords: [
                [24.677057, 121.773988],
                [24.676856, 121.773932],
            ],
        },
    ],

    // API 網址 [cite: 29]
    apiUrl: "https://tp.e-land.gov.tw/ATIS/api/ParkingAPI/GetNestDetailAll?lat=24.67&lng=121.77",
};
