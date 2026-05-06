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

    document.getElementById("greeting-text").innerText =
        config.greetingText[timeKey];
    document.getElementById("greeting-img").src =
        `img/greeting_${timeKey}.webp`;
}

// 2. 抓取 API 資料 (宜蘭縣主要來源) [cite: 29, 30]
// main.js

// [開發建議]：手動切換此布林值，如果是 true 則讀取本地 json 檔案
const isLocalTest = false;

async function fetchData() {
    let apiUrl = "https://steep-bush-ea3a.forestsound520.workers.dev";

    try {
        let response;
        if (isLocalTest) {
            // 在本地測試時，使用 fetch 讀取專案目錄下的 yl_government.json [cite: 11]
            // 注意：這仍需在 Live Server 環境下運行 [cite: 31, 32]
            const localRes = await fetch("data/yl_government.json");
            apiData = await localRes.json();
            console.log("正在使用【本地測試資料】渲染網頁");
        } else {
            // 正式環境使用 Axios 打真實 API (使用上面判斷後的 apiUrl) [cite: 11]
            // 我們將 config.apiUrl 替換為動態判斷後的 apiUrl [cite: 21, 23]
            response = await axios.get(apiUrl);
            apiData = response.data;
            console.log("正在讀取【宜蘭縣政府即時 API】");
        }

        // 更新 UI 上的更新時間
        document.getElementById("update-time").innerText =
            new Date().toLocaleTimeString();

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
    const container = document.getElementById("slots-color-container");

    document.getElementById("parking-name").innerText = parkingName;
    document.getElementById("available-slots").innerText = liveInfo
        ? liveInfo.AvailableCar
        : "--"; // AvailableCar [cite: 29]
    document.getElementById("total-slots").innerText = liveInfo
        ? liveInfo.TotalCar
        : "--"; // TotalCar [cite: 29]
    document.getElementById("parking-address").innerText =
        site.parkingAddress[currentParkingIdx];
    document.getElementById("google-nav").href =
        site.parkingGoogleMap[currentParkingIdx];

    if (liveInfo && liveInfo.TotalCar > 0) {
        const available = liveInfo.AvailableCar;
        const total = liveInfo.TotalCar;
        const ratio = available / total; // 計算比例

        document.getElementById("available-slots").innerText = available;
        document.getElementById("total-slots").innerText = total;

        // 剩餘車位顏色計算邏輯 [cite: 3]
        container.classList.remove(
            "text-green-600",
            "text-yellow-700",
            "text-red-700",
        );
        if (ratio > 0.5) {
            container.classList.add("text-green-600");
        } else if (ratio >= 0.2) {
            container.classList.add("text-yellow-700");
        } else {
            container.classList.add("text-red-700");
        }
    } else {
        document.getElementById("available-slots").innerText = "--";
        document.getElementById("total-slots").innerText = "--";
        container.classList.remove(
            "text-green-600",
            "text-yellow-700",
            "text-red-700",
        );
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
    document.getElementById("parking-info-section").classList.add("hidden");
    document.getElementById("map-container").classList.add("hidden");
    document.getElementById("error-section").classList.remove("hidden");
}

function showNormalUI() {
    document.getElementById("loading-section").classList.add("hidden"); // 隱藏載入區
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
        <button onclick="switchSite(${i})" class="py-2 border-r border-gray-600 last:border-0 ${i === currentSiteIdx ? "active-site" : "bg-white"}">
            ${site.siteName}
        </button>
    `,
        )
        .join("");
}
