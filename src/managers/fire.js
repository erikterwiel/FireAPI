const fs = require("fs");
const csvParser = require("csv-parser");
const RssParser = require("rss-parser");

class FireManager {
  constructor() {
    this._govFires = undefined;
    this._govIncidents = undefined;
    this._rssParser = new RssParser({ customFields: { item: ["geo:lat", "geo:long" ]} });
  }

  async initialize() {
    const govFires = [];

    await new Promise(resolve => {
      fs.createReadStream("./data/MODIS_C6_USA_contiguous_and_Hawaii_24h.csv")
        .pipe(csvParser())
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

      if (Math.abs(sortedGovFires[i].latitude - sortedGovFires[i + 1].latitude) > 0.009009 &&
        Math.abs(sortedGovFires[i].longitude - sortedGovFires[i + 1].longitude) > 0.01125) {
        filteredGovFires.push(sortedGovFires[i]);
      }
    }

    this._govFires = filteredGovFires;

    const rawIncidents = await this._rssParser.parseURL("https://inciweb.nwcg.gov/feeds/rss/incidents/");
    this._govIncidents = rawIncidents.items.map(rawIncident => {
      const { title, "geo:lat": latitude, "geo:long": longitude, content, pubDate: date } = rawIncident;
      return {
        title,
        latitude,
        longitude,
        content,
        date,
      };
    });
  }


  async getAllFires() {
    const circles = JSON.parse(JSON.stringify(this._govFires));
    const markers = JSON.parse(JSON.stringify(this._govIncidents));
    return {
      status: 200,
      json: { circles, markers },
    };
  }
}

module.exports = FireManager;
