const express = require("express");
const axios = require("axios");
const cors = require("cors");
const app = express();

// 允許任何地方的網頁呼叫這個 API
app.use(cors());

app.get("/", async (req, res) => {
    // 宜蘭縣政府的 API 網址
    const targetUrl =
        "https://tp.e-land.gov.tw/ATIS/api/ParkingAPI/GetNestDetailAll?lat=24.67&lng=121.77";

    try {
        const response = await axios({
            method: "get",
            url: targetUrl,
            headers: {
                Accept: "application/json",
                // 模擬手機瀏覽器，避免被政府伺服器擋掉
                "User-Agent":
                    "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1",
            },
            timeout: 15000,
            responseType: "arraybuffer",
        });

        // 設定瀏覽器不要快取資料，確保每次都是拿到最新的停車位
        res.set({
            "Content-Type": "application/json; charset=utf-8",
            "Cache-Control":
                "no-store, no-cache, must-revalidate, proxy-revalidate",
            Pragma: "no-cache",
            Expires: "0",
        });

        res.send(response.data);
    } catch (error) {
        console.error("抓取失敗:", error.message);
        res.status(500).json({ error: error.message });
    }
});

// Cloud Run 規定必須監聽 PORT 8080
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`伺服器啟動在 port ${PORT}`);
});
