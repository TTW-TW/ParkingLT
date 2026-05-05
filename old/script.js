document.addEventListener("DOMContentLoaded", async () => {
    // 初始化地圖，中心點設在羅東轉運站附近
    const map = L.map("map").setView([24.677, 121.779], 14);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
            '&copy; <a href="https://tp.e-land.gov.tw/">宜蘭縣交通資訊網</a>',
    }).addTo(map);

    try {
        // 讀取本地端 json
        // 未來若要直接 fetch API，需注意瀏覽器 CORS 限制，建議透過後端或 Proxy 轉接
        const response = await fetch("yl_government.json", {
            method: "GET",
            headers: {
                accept: "application/json",
            },
        });

        const data = await response.json();

        let totalParks = data.length;
        let liveCount = 0;

        data.forEach((park) => {
            // 資料對照：X 是經度(Lon)，Y 是緯度(Lat)
            const position = [park.Y, park.X];

            // 判斷是否有車位資訊 (AvailableCar 為 -1 代表無即時資料)
            const hasLive = park.AvailableCar !== -1;
            if (hasLive) liveCount++;

            // 組合長輩友善 Popup
            let popupHtml = `
                <div class="elder-popup">
                    <b>${park.CName}</b><br>
                    <div class="fee-info">
                        💰 ${park.PayEX || "費率請洽現場"}
                    </div>
                    <small>📍 ${park.CAddress}</small>
            `;

            if (hasLive) {
                popupHtml += `
                    <div class="badge has-data">
                        剩餘車位：<span class="avail-num">${park.AvailableCar}</span> / ${park.TotalCar}
                    </div>
                `;
            } else {
                popupHtml += `<div class="badge no-data">目前無即時資訊</div>`;
            }

            if (park.chargingPoint > 0) {
                popupHtml += `<div style="margin-top:5px; color:#1565c0; font-weight:bold;">⚡ 內含充電樁：${park.chargingPoint} 支</div>`;
            }

            popupHtml += `</div>`;

            // 標記在地圖上
            const marker = L.marker(position).addTo(map);
            marker.bindPopup(popupHtml);

            // 若為重點標記 (如你要的 Times新羅東轉運站)，可以直接預設開啟或改色
            if (park.ID === 240) {
                marker.bindTooltip("目標：新羅東轉運站", {
                    permanent: true,
                    direction: "top",
                });
            }
        });

        document.getElementById("stat-content").innerHTML = `
            <div>總載入站點：${totalParks}</div>
            <div>即時車位站點：${liveCount}</div>
            <hr>
            <small>更新時間參考：<br>${data[0].Updatetime || "N/A"}</small>
        `;
    } catch (error) {
        console.error("讀取失敗:", error);
        document.getElementById("stat-content").innerText =
            "檔案讀取失敗，請確認 yl_government.json 是否在同目錄。";
    }
});
