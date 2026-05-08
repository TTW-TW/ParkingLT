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
        // Google Cloud Run 是第二來源：
        // Cloudflare 失敗後才會打到這裡，所以這裡也要控制時間
        // 單次最多等 4 秒，失敗後等 0.3 秒再重試第 2 次
        const data = await fetchRemoteWithRetry(targetUrl, {
            maxAttempts: 2,
            timeoutMs: 4000,
            delayMs: 300,
        });

        // 設定瀏覽器不要快取資料，確保每次都是拿到最新的停車位
        res.set({
            "Content-Type": "application/json; charset=utf-8",
            "Cache-Control":
                "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
            Pragma: "no-cache",
            Expires: "0",
            "X-Proxy-Source": "google-cloud-run",
        });

        res.send(data);
    } catch (error) {
        console.error("抓取失敗:", error.message);

        // 上游宜蘭縣 API 失敗，用 502 表示代理來源取資料失敗
        res.set({
            "Content-Type": "application/json; charset=utf-8",
            "Cache-Control":
                "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
            Pragma: "no-cache",
            Expires: "0",
            "X-Proxy-Source": "google-cloud-run-error",
        });

        res.status(502).json({
            error: "Upstream API failed",
            detail: error.message,
        });
    }
});

async function fetchRemoteWithRetry(
    targetUrl,
    { maxAttempts = 2, timeoutMs = 4000, delayMs = 300 } = {},
) {
    let lastError;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            console.log(`Google Cloud Run upstream attempt ${attempt}`);
            return await fetchRemoteOnce(targetUrl, timeoutMs);
        } catch (error) {
            lastError = error;
            console.error(
                `Google Cloud Run upstream attempt ${attempt} failed: ${error.message}`,
            );

            if (attempt < maxAttempts) {
                await sleep(delayMs);
            }
        }
    }

    throw lastError;
}

async function fetchRemoteOnce(targetUrl, timeoutMs) {
    const response = await axios({
        method: "get",
        url: targetUrl,
        headers: {
            Accept: "application/json, text/plain, */*",
            "Accept-Language": "zh-TW,zh-Hant;q=0.9,en-US;q=0.8,en;q=0.7",
            "Cache-Control": "no-cache",
            Pragma: "no-cache",
            Referer: "https://tp.e-land.gov.tw/",
            // 模擬手機瀏覽器，避免被政府伺服器擋掉
            "User-Agent":
                "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1",
        },
        timeout: timeoutMs,
        responseType: "arraybuffer",
    });

    return response.data;
}

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

// Cloud Run 規定必須監聽 PORT 8080
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`伺服器啟動在 port ${PORT}`);
});
