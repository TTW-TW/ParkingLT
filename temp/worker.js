export default {
    async fetch(request, env, ctx) {
        // 固定的後端 API，不隨前端傳入的參數變動
        const targetUrl =
            "https://tp.e-land.gov.tw/ATIS/api/ParkingAPI/GetNestDetailAll?lat=24.67&lng=121.77";

        const corsHeaders = {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, OPTIONS",
            "Access-Control-Allow-Headers": "*",
        };

        const noStoreHeaders = {
            // 強制瀏覽器與中間層不要快取
            "Cache-Control":
                "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
            Pragma: "no-cache",
            Expires: "0",
        };

        // 1. 處理預檢請求 (OPTIONS)
        if (request.method === "OPTIONS") {
            return new Response(null, {
                status: 204,
                headers: {
                    ...corsHeaders,
                    ...noStoreHeaders,
                },
            });
        }

        if (request.method !== "GET") {
            return new Response(
                JSON.stringify({ error: "Method not allowed" }),
                {
                    status: 405,
                    headers: {
                        "Content-Type": "application/json; charset=utf-8",
                        ...corsHeaders,
                        ...noStoreHeaders,
                    },
                },
            );
        }

        try {
            // 2. 抓取資料時，強制加上模擬瀏覽器的 User-Agent (這對政府伺服器很重要)
            // Cloudflare 成功時通常 3 秒內會回來，所以單次最多等 3.5 秒
            // 如果第 1 次失敗，等 0.3 秒後再即時重試第 2 次
            const data = await fetchRemoteWithRetry(targetUrl, {
                maxAttempts: 2,
                timeoutMs: 3500,
                delayMs: 300,
            });

            // 4. 回傳給前端
            return new Response(data, {
                status: 200,
                headers: {
                    "Content-Type": "application/json; charset=utf-8",
                    "X-Proxy-Source": "cloudflare-worker",
                    ...corsHeaders,
                    ...noStoreHeaders,
                },
            });
        } catch (e) {
            return new Response(
                JSON.stringify({
                    error: "Upstream API failed",
                    detail: e.message,
                }),
                {
                    status: 502,
                    headers: {
                        "Content-Type": "application/json; charset=utf-8",
                        "X-Proxy-Source": "cloudflare-worker-error",
                        ...corsHeaders,
                        ...noStoreHeaders,
                    },
                },
            );
        }
    },
};

async function fetchRemoteWithRetry(
    targetUrl,
    { maxAttempts = 2, timeoutMs = 3500, delayMs = 300 } = {},
) {
    let lastError;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            console.log(`Cloudflare upstream attempt ${attempt}`);
            return await fetchRemoteOnce(targetUrl, timeoutMs);
        } catch (error) {
            lastError = error;
            console.error(
                `Cloudflare upstream attempt ${attempt} failed: ${error.message}`,
            );

            if (attempt < maxAttempts) {
                await sleep(delayMs);
            }
        }
    }

    throw lastError;
}

async function fetchRemoteOnce(targetUrl, timeoutMs) {
    const controller = new AbortController();

    const timeoutId = setTimeout(() => {
        controller.abort();
    }, timeoutMs);

    try {
        const response = await fetch(targetUrl, {
            method: "GET",
            signal: controller.signal,
            headers: {
                Accept: "application/json, text/plain, */*",
                "Accept-Language": "zh-TW,zh-Hant;q=0.9,en-US;q=0.8,en;q=0.7",
                "Cache-Control": "no-cache",
                Pragma: "no-cache",
                Referer: "https://tp.e-land.gov.tw/",
                "User-Agent":
                    "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1",
            },
            // 設定 cf 屬性，強制不要在 Cloudflare 層級快取這個對後端的請求
            cf: { cacheTtl: 0, cacheEverything: false },
        });

        if (!response.ok) {
            throw new Error(`Remote API returned ${response.status}`);
        }

        return await response.arrayBuffer();
    } finally {
        clearTimeout(timeoutId);
    }
}

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
