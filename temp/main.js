// 請用這段取代你的 fetchData(signal) 函式

// 這段完整保留你原本的註解邏輯，只有改 API 來源與 timeout 控制。

async function fetchData(signal) {
    // 預留一個給 GitHub Actions 替換的標記字串
    let apiUrl = "API_URL_PLACEHOLDER";

    // 安全機制：如果在本地開發且沒被替換，則指向你的 Worker
    if (apiUrl === "API_URL_PLACEHOLDER") {
        apiUrl = "https://parking-space-lt.vigor-api-proxy.workers.dev/";
    }

    // 第二來源：Google Cloud Run 台灣區代理
    const googleCloudRunUrl =
        "https://yilan-parking-proxy-234889249421.asia-east1.run.app/";

    // API 來源優先順序：
    // 1. 優先打 Cloudflare Worker，因為成本較低
    // 2. Cloudflare 失敗、522、timeout 或取不到資料時，才改打 Google Cloud Run
    const apiSources = [
        {
            name: "Cloudflare Worker",
            url: apiUrl,
            timeout: 8500,
        },
        {
            name: "Google Cloud Run",
            url: googleCloudRunUrl,
            timeout: 9500,
        },
    ];

    // 如果沒有傳入 signal，自己建立一個 10 秒的 AbortController
    let controller;
    let timeoutId;
    if (!signal) {
        controller = new AbortController();
        signal = controller.signal;
        timeoutId = setTimeout(() => controller.abort(), 20000);
    }

    try {
        if (isLocalTest) {
            // 本地測試
            const localRes = await fetch("data/yl_government.json");
            apiData = await localRes.json();
        } else {
            // 正式環境
            // 依序嘗試 API 來源：先 Cloudflare，再 Google Cloud Run
            let lastError;

            for (const source of apiSources) {
                try {
                    console.log(`嘗試從 ${source.name} 抓取資料`);

                    apiData = await requestApiSource(source, signal);

                    console.log(`${source.name} 抓取成功`);
                    break;
                } catch (error) {
                    lastError = error;
                    console.warn(`${source.name} 抓取失敗:`, error.message);
                }
            }

            // 兩個來源都失敗時，才讓 fetchData 回傳 false
            if (!apiData || !Array.isArray(apiData)) {
                throw lastError || new Error("所有 API 來源皆失敗");
            }
        }

        if (timeoutId) clearTimeout(timeoutId);

        // 更新 UI 上的更新時間
        const now = new Date();
        const month = String(now.getMonth() + 1).padStart(2, "0");
        const date = String(now.getDate()).padStart(2, "0");
        const weekDays = ["日", "一", "二", "三", "四", "五", "六"];
        const dayOfWeek = weekDays[now.getDay()]; // 取得星期幾
        const timeStr = now.toLocaleTimeString("zh-TW", {
            hour12: false,
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
        });

        // 組合成：05/07 (四) 20:21:03
        const formattedDate = `${month}/${date} (${dayOfWeek}) ${timeStr}`;
        document.getElementById("update-time").innerText = formattedDate;

        showNormalUI();
        renderInfo();

        return true; // 告訴點擊事件「真的成功了」
    } catch (error) {
        console.error("資料獲取失敗:", error);
        if (error.name === "AbortError") console.warn("請求超時被取消");
        return false;
    }
}

// 請新增這個 helper function

// 請放在 fetchData(signal) 後面即可。

async function requestApiSource(source, outerSignal) {
    const sourceController = new AbortController();
    let isSourceTimeout = false;

    // 單一來源的 timeout 控制：
    // Cloudflare 最多等 8.5 秒
    // Google Cloud Run 最多等 9.5 秒
    const sourceTimeoutId = setTimeout(() => {
        isSourceTimeout = true;
        sourceController.abort();
    }, source.timeout);

    // 如果外層 20 秒總 timeout 被觸發，也要一起取消目前這次請求
    const abortFromOuterSignal = () => {
        sourceController.abort();
    };

    if (outerSignal) {
        if (outerSignal.aborted) {
            sourceController.abort();
        } else {
            outerSignal.addEventListener("abort", abortFromOuterSignal, {
                once: true,
            });
        }
    }

    try {
        const response = await axios.get(source.url, {
            signal: sourceController.signal,
            timeout: source.timeout,
        });

        // 確認回來的是停車資料陣列，不接受錯誤物件或異常格式
        if (!Array.isArray(response.data)) {
            throw new Error(`${source.name} 回傳資料格式不正確`);
        }

        return response.data;
    } catch (error) {
        if (isSourceTimeout) {
            throw new Error(`${source.name} 超過 ${source.timeout}ms 未回應`);
        }

        if (error.response) {
            throw new Error(
                `${source.name} 回傳 HTTP ${error.response.status}`,
            );
        }

        throw error;
    } finally {
        clearTimeout(sourceTimeoutId);

        if (outerSignal) {
            outerSignal.removeEventListener("abort", abortFromOuterSignal);
        }
    }
}
