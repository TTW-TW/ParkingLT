let map;
let markers = [];

const normalIcon = L.icon({
    iconUrl: "img/parkingIconNormal.svg",
    iconSize: [40, 42],
    iconAnchor: [16, 42],
});

const chosenIcon = L.icon({
    iconUrl: "img/parkingIconChosen.svg",
    iconSize: [60, 68],
    iconAnchor: [20, 50],
});

function initMap() {
    map = L.map("map").setView([24.677, 121.777], 16);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(
        map,
    );
}

function updateMapMarkers(siteIndex, parkingIndex, shouldFly = true) {
    // 清除舊 Marker
    markers.forEach((m) => map.removeLayer(m));
    markers = [];

    const site = config.favorateParking[siteIndex];

    // 定位到中心
    // 只有在 shouldFly 為 true 時才移動地圖 (例如切換大區域時)
    if (shouldFly) {
        map.flyTo([site.mapCenterY, site.mapCenterX], 16);
    }

    site.parkingCoords.forEach((coord, idx) => {
        const isSelected = idx === parkingIndex;
        const marker = L.marker(coord, {
            icon: isSelected ? chosenIcon : normalIcon,
            zIndexOffset: isSelected ? 1000 : 0,
        }).addTo(map);

        marker.on("click", () => {
            currentParkingIdx = idx; // 連動 main.js
            renderInfo(false);
        });

        markers.push(marker);
    });
}
