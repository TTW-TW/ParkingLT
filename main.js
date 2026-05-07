let currentSiteIdx = 0;
let currentParkingIdx = 0;
let apiData = [];

// 1. 初始化問候區 [cite: 6]
function updateGreeting() {
    const hour = new Date().getHours();
    let timeKey = "night";
    if (hour >= 0 && hour < 6) timeKey = "midnight";
    else if (hour >= 6 && hour < 11) timeKey = "morning";
    else if (hour >= 11 && hour < 13) timeKey = "noon";
    else if (hour >= 13 && hour < 18) timeKey = "afternoon";

    const greetingTextEl = document.getElementById("greeting-text");
    const greetingImgEl = document.getElementById("greeting-img");

    // 立即更新文字，縮短等待感
    greetingTextEl.innerText = config.greetingText[timeKey];

    // 預載機制：先在記憶體中建立圖片物件下載
    const imgPath = `img/greeting_${timeKey}.webp`;
    const preloader = new Image();

    preloader.onload = () => {
        // 確定圖片下載完成後，才設定 src 並調整透明度現身
        greetingImgEl.src = imgPath;
        greetingImgEl.style.opacity = "1";
    };

    preloader.src = imgPath;
}

// 2. 抓取 API 資料 (宜蘭縣主要來源) [cite: 29, 30]

// 典籍【刷新按鈕】的冷卻效果 + 資料更新狀態

const refreshBtn = document.getElementById("refresh-btn");
const updateTimeEl = document.getElementById("update-time");
const updateStatusEl = document.getElementById("update-status");

refreshBtn.addEventListener("click", async () => {
    // 1. 防止重複點擊
    if (refreshBtn.classList.contains("cooldown")) return;

    // 2. 初始化 UI 狀態
    refreshBtn.classList.add("cooldown");
    refreshBtn.disabled = true;

    updateStatusEl.innerText = "更新中";
    updateStatusEl.className = "font-bold ml-1 status-updating";

    // 設定 10 秒超時機制 [cite: 58]
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
        // 3. 執行資料抓取 (假設 fetchData 會回傳成功與否)
        // 注意：這裡使用你原本設定的 apiUrl 與 Axios/Fetch 邏輯
        const success = await fetchData(controller.signal);

        clearTimeout(timeoutId);

        if (success) {
            // 情況 1：成功
            updateStatusEl.innerText = "更新成功";
            updateStatusEl.className = "font-bold ml-1 status-success";
            updateTimeEl.innerText = new Date().toLocaleTimeString(); // 更新時間
        } else {
            // 情況 2：API 返還錯誤 (但沒斷線)
            throw new Error("Fetch failed");
        }
    } catch (error) {
        // 情況 3：失敗或 10 秒超時
        updateStatusEl.innerText = "更新失敗";
        updateStatusEl.className = "font-bold ml-1 status-error";
        // 注意：不調用 showErrorUI()，讓使用者保留查看舊資料的權利
        console.warn("手動刷新失敗，保留舊有數據內容");
    } finally {
        // 4. 三秒後消失狀態文字
        setTimeout(() => {
            updateStatusEl.innerText = "";
        }, 6000);

        // 5. 確保按鈕在 5 秒後恢復
        setTimeout(() => {
            refreshBtn.classList.remove("cooldown");
            refreshBtn.disabled = false;
        }, 6000);
    }
});

// [開發建議]：手動切換此布林值，如果是 true 則讀取本地 json 檔案
const isLocalTest = false;

async function fetchData(signal) {
    // 預留一個給 GitHub Actions 替換的標記字串
    let apiUrl = "API_URL_PLACEHOLDER";

    // 安全機制：如果在本地開發且沒被替換，則指向你的 Worker
    if (apiUrl === "API_URL_PLACEHOLDER") {
        apiUrl = "https://steep-bush-ea3a.forestsound520.workers.dev";
    }

    try {
        let response;
        if (isLocalTest) {
            // 在本地測試時，使用 fetch 讀取專案目錄下的 yl_government.json [cite: 11]
            // 注意：這仍需在 Live Server 環境下運行 [cite: 31, 32]
            const localRes = await fetch("data/yl_government.json");
            apiData = await localRes.json();
        } else {
            // 正式環境使用 Axios 打真實 API (使用上面判斷後的 apiUrl) [cite: 11]
            // 我們將 config.apiUrl 替換為動態判斷後的 apiUrl [cite: 21, 23]
            response = await axios.get(apiUrl, { timeout: 10000 });
            apiData = response.data;
        }

        // 更新 UI 上的更新時間
        const now = new Date();
        const options = {
            month: "2-digit", // 顯示月份 (如 05)
            day: "2-digit", // 顯示日期 (如 07)
            hour: "2-digit", // 顯示小時 (如 01)
            minute: "2-digit", // 顯示分鐘
            second: "2-digit", // 顯示秒
            hour12: false, // 使用 24 小時制
            timeZone: "Asia/Taipei", // 確保時區正確
        };

        const formattedDate = now.toLocaleString("zh-TW", options);
        document.getElementById("update-time").innerText = formattedDate;

        showNormalUI();
        renderInfo();
    } catch (error) {
        console.error("資料獲取失敗:", error);
        showErrorUI();
    }
}

function renderInfo(shouldFly = true) {
    const site = config.favorateParking[currentSiteIdx];
    const parkingName = site.parkingZhName[currentParkingIdx];
    const parkingId = site.parkingApi1ID[currentParkingIdx];

    // 尋找 API 中的對應資料
    const liveInfo = apiData.find((item) => item.ID === parkingId);
    const availableSlotsElement = document.getElementById("available-slots");
    const totalSlotsElement = document.getElementById("total-slots");
    const container = document.getElementById("slots-color-container");

    document.getElementById("parking-name").innerText = parkingName;
    document.getElementById("total-slots").innerText = liveInfo
        ? liveInfo.TotalCar
        : "--"; // TotalCar [cite: 29]
    document.getElementById("parking-address").innerText =
        site.parkingAddress[currentParkingIdx];
    document.getElementById("google-nav").href =
        site.parkingGoogleMap[currentParkingIdx];

    // 初始化 UI 狀態
    container.classList.remove(
        "text-green-600",
        "text-yellow-700",
        "text-red-700",
        "text-yellow-900",
        "bg-yellow-300",
    );

    availableSlotsElement.classList.add("text-3xl");

    if (liveInfo) {
        const available = liveInfo.AvailableCar;
        const total = liveInfo.TotalCar;

        // 1. 處理總車位顯示
        totalSlotsElement.innerText = total > 0 ? total : "--";

        // 2. 處理剩餘車位文字：判斷是否為 -1
        if (available === -1 || available === "-1") {
            availableSlotsElement.innerText = "未提供";
            // 成功套用你要求的文字黃底結果
            availableSlotsElement.classList.remove("text-3xl");
            container.classList.add("text-yellow-900", "bg-yellow-300");
        } else {
            availableSlotsElement.innerText = available;

            // 3. 處理顏色邏輯 (僅在數值正常且有總車位時計算)
            if (total > 0) {
                const ratio = available / total;
                if (ratio > 0.5) {
                    container.classList.add("text-green-600");
                } else if (ratio >= 0.2) {
                    container.classList.add("text-yellow-700");
                } else {
                    container.classList.add("text-red-700");
                }
            }
        }
    } else {
        // 完全沒資料的情況
        availableSlotsElement.innerText = "--";
        totalSlotsElement.innerText = "--";
    }

    updateMapMarkers(currentSiteIdx, currentParkingIdx, shouldFly);
}

// 切換地點
function switchSite(idx) {
    currentSiteIdx = idx;
    currentParkingIdx = 0; // 重置為該地點的第一個停車場
    renderSiteButtons();
    renderInfo();
}

// 切換停車場 (左右按鈕)
window.switchParking = (idx, shouldFly = false) => {
    const site = config.favorateParking[currentSiteIdx];
    if (idx < 0) currentParkingIdx = site.parkingZhName.length - 1;
    else if (idx >= site.parkingZhName.length) currentParkingIdx = 0;
    else currentParkingIdx = idx;

    renderInfo(shouldFly); // 左右切換通常不需要飛越地圖
};

// UI 切換邏輯
function showErrorUI() {
    // 關鍵！必須強制隱藏載入區，否則大笨鳥會被蓋住
    document.getElementById("loading-section").classList.add("hidden");
    document.getElementById("main-content").classList.add("hidden");

    // 顯示錯誤區
    document.getElementById("error-section").classList.remove("hidden");
}

function showNormalUI() {
    document.getElementById("loading-section").classList.add("hidden"); // 隱藏載入區
    document.getElementById("error-section").classList.add("hidden"); // 隱藏錯誤區
    document.getElementById("main-content").classList.remove("hidden"); // 顯示主內容

    // 重要：地圖從隱藏變顯示後，必須重新計算尺寸，否則會出現圖磚消失的 Bug
    if (map) {
        setTimeout(() => {
            map.invalidateSize();
        }, 100);
    }

    document.getElementById("error-section").classList.add("hidden");
}

// 監聽按鈕
document.getElementById("refresh-btn").addEventListener("click", fetchData);
document
    .getElementById("prev-parking")
    .addEventListener("click", () => switchParking(currentParkingIdx - 1));
document
    .getElementById("next-parking")
    .addEventListener("click", () => switchParking(currentParkingIdx + 1));

// 初始化
window.onload = () => {
    initMap();
    updateGreeting();
    renderSiteButtons();
    fetchData();
};

// main.js - 在檔案最下方加入這段

// --- 手機滑動 (Swipe) 支援邏輯 ---
let touchStartX = 0;
let touchEndX = 0;
const touchArea = document.getElementById("touch-area");

touchArea.addEventListener(
    "touchstart",
    function (e) {
        touchStartX = e.changedTouches[0].screenX;
    },
    { passive: true },
);

touchArea.addEventListener(
    "touchend",
    function (e) {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    },
    { passive: true },
);

function handleSwipe() {
    const swipeThreshold = 50; // 滑動距離超過 50px 才觸發，避免誤觸
    if (touchEndX < touchStartX - swipeThreshold) {
        // 向左滑 (Swipe Left) -> 下一個停車場
        switchParking(currentParkingIdx + 1);
    }
    if (touchEndX > touchStartX + swipeThreshold) {
        // 向右滑 (Swipe Right) -> 上一個停車場
        switchParking(currentParkingIdx - 1);
    }
}

function renderSiteButtons() {
    const container = document.getElementById("site-buttons");
    container.innerHTML = config.favorateParking
        .map(
            (site, i) => `
        <button onclick="switchSite(${i})" class="py-3 border-r border-gray-600 last:border-0 ${i === currentSiteIdx ? "active-site" : "bg-white"}">
            ${site.siteName}
        </button>
    `,
        )
        .join("");
}
