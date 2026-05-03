/**
 * ParkingLT 核心邏輯
 * 1. 讀取本地 JSON 資料
 * 2. 整合靜態與動態資訊
 * 3. 渲染地圖點位
 */

document.addEventListener("DOMContentLoaded", async () => {
    // 初始化地圖（中心點設在宜蘭）
    const map = L.map("map").setView([24.75, 121.76], 12);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    try {
        // 同步讀取兩份 JSON 檔案
        const [resParks, resAvails] = await Promise.all([
            fetch("CarPark.json"),
            fetch("ParkingCityAvailability.json"),
        ]);

        const parkData = await resParks.json();
        const availData = await resAvails.json();

        // 1. 資料正規化 (Data Normalization): 將可用車位轉為 Map 以利快速查找 (O(1))
        const availMap = new Map();
        availData.ParkingAvailabilities.forEach((item) => {
            availMap.set(item.CarParkID, item);
        });

        let liveCount = 0;
        const allParks = parkData.CarParks;

        // 2. 遍歷所有點位並標註
        allParks.forEach((park) => {
            const parkID = park.CarParkID;
            const liveInfo = availMap.get(parkID); // 串接剩餘車位資訊
            const position = [
                park.CarParkPosition.PositionLat,
                park.CarParkPosition.PositionLon,
            ];

            // 判斷是否有即時車位資料，設定不同樣式
            const hasLive = !!liveInfo;
            if (hasLive) liveCount++;

            // 組合 Popup HTML (大字體、高對比)
            let popupHtml = `
                <div class="elder-popup">
                    <b>${park.CarParkName.Zh_tw}</b><br>
                    <small>${park.Address}</small><br>
            `;

            if (hasLive) {
                popupHtml += `
                    <div class="badge has-data">
                        剩餘車位：<span class="avail-num">${liveInfo.AvailableSpaces}</span> / ${liveInfo.TotalSpaces}
                    </div>
                `;
            } else {
                popupHtml += `<div class="badge no-data">暫無即時車位資訊</div>`;
            }
            popupHtml += `</div>`;

            // 標記點位
            const marker = L.marker(position).addTo(map);
            marker.bindPopup(popupHtml);

            // 若無即時資料，可以微調透明度讓視覺更清楚
            if (!hasLive) {
                marker.setOpacity(0.6);
            }
        });

        // 3. 更新統計面板
        document.getElementById("stat-content").innerHTML = `
            <div class="stat-item">停車場總數：${allParks.length}</div>
            <div class="stat-item">即時連線數：${liveCount}</div>
        `;
    } catch (error) {
        console.error("資料讀取失敗:", error);
        document.getElementById("stat-content").innerHTML =
            '<span style="color:red">資料讀取錯誤，請檢查 JSON 檔案或 Server 狀態</span>';
    }
});
