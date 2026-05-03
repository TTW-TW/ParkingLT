const fs = require("fs");
const path = require("path");

const dataPathBasic = path.join(__dirname, "CarPark.json");
const dataPathLeft = path.join(__dirname, "ParkingCityAvailability.json");

function loadJSONBasic() {
    try {
        const rawData = fs.readFileSync(dataPathBasic, "utf-8");
        const jsonData = JSON.parse(rawData); // 使用不同的變數名稱
        const carInfo = jsonData.CarParks;
        console.log(carInfo.length);
        carInfo.forEach((element) => {
            console.log(
                "CarParkID = ",
                element.CarParkID,
                "CarParkName = ",
                element.CarParkName.Zh_tw,
            );
        });
    } catch (error) {
        console.error("Error reading JSON:", error);
    }
}

function loadJSONLeft() {
    try {
        const rawData = fs.readFileSync(dataPathLeft, "utf-8");
        const jsonData = JSON.parse(rawData); // 使用不同的變數名稱
        const carInfo = jsonData.ParkingAvailabilities;
        console.log("=================================================");
        console.log(carInfo.length);
        carInfo.forEach((element) => {
            console.log(
                "CarParkID = ",
                element.CarParkID,
                "CarParkName = ",
                element.CarParkName.Zh_tw,
            );
        });
    } catch (error) {
        console.error("Error reading JSON:", error);
    }
}

loadJSONBasic();
loadJSONLeft();
