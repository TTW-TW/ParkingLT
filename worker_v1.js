export default {
  async fetch(request, env, ctx) {
    // 固定的後端 API，不隨前端傳入的參數變動
    const targetUrl = "https://tp.e-land.gov.tw/ATIS/api/ParkingAPI/GetNestDetailAll?lat=24.67&lng=121.77";

    // 1. 處理預檢請求 (OPTIONS)
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
          "Access-Control-Allow-Headers": "*"
        }
      });
    }

    try {
      // 2. 抓取資料時，強制加上模擬瀏覽器的 User-Agent (這對政府伺服器很重要)
      const response = await fetch(targetUrl, {
        method: 'GET',
        headers: { 
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1'
        },
        // 設定 cf 屬性，強制不要在 Cloudflare 層級快取這個對後端的請求
        cf: { cacheTtl: 0, cacheEverything: false }
      });

      if (!response.ok) {
         throw new Error(`Remote API returned ${response.status}`);
      }

      const data = await response.arrayBuffer();

      // 4. 回傳給前端
      return new Response(data, {
        status: 200,
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET",
          // 強制瀏覽器與中間層不要快取
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          "Pragma": "no-cache",
          "Expires": "0"
        }
      });

    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), {
        status: 500,
        headers: { 
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*" 
        }
      });
    }
  }
};