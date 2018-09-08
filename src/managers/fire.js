const fs = require("fs");
const parser = require("csv-parser");

class FireManager {
  constructor() {
    this._govFires = undefined;
  }

  async initialize() {
    const govFires = [];

    await new Promise(resolve => {
      fs.createReadStream("./data/MODIS_C6_USA_contiguous_and_Hawaii_24h.csv")
        .pipe(parser())
        .on("data", row => {
          const { latitude, longitude, acq_date: updatedDate } = row;

          govFires.push({
            latitude,
            longitude,
            radius: 1000,
            updatedDate,
          });
        })
        .on("end", () => {
          resolve();
        });
    });

    const sortedGovFires = govFires.sort((a, b) => {
      if (a.latitude > b.latitude) {
        return -1;
      } else if (a.latitude < b.latitude) {
        return 1;
      } else {
        return 0;
      }
    });

    const filteredGovFires = [];
    for (let i = 0; i < sortedGovFires.length; i++) {
      if (i === sortedGovFires.length - 1) {
        filteredGovFires.push(sortedGovFires[i]);
        break;
      }

      console.log(Math.abs(sortedGovFires[i].latitude - sortedGovFires[i + 1].latitude));
      if (Math.abs(sortedGovFires[i].latitude - sortedGovFires[i + 1].latitude) > 0.01125) {
        console.log("pushing");
        filteredGovFires.push(sortedGovFires[i]);
      }
    }
// 88.9km = 1 deg;
// 1km = 0.01125 deg

    this._govFires = govFires;
  }


  async getAllFires() {
    const fires = JSON.parse(JSON.stringify(this._govFires));
    return {
      status: 200,
      json: fires,
    };
  }
}

module.exports = FireManager;
