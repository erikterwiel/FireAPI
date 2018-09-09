const fs = require("fs");
const csvParser = require("csv-parser");
const RssParser = require("rss-parser");
const AWS = require("aws-sdk");

AWS.config.update({
  accessKeyId: process.env.AWS_KEY || require("../constants/accessKeyId"),
  secretAccessKey: process.env.AWS_SECRET_KEY || require("../constants/secretAccessKey"),
  region: "us-east-1"
});

class FireManager {
  constructor(userService) {
    this._govFires = undefined;
    this._govIncidents = undefined;
    this._rssParser = new RssParser({ customFields: { item: ["geo:lat", "geo:long" ]} });
    this._userService = userService;
  }

  async initialize() {
    const govFires = [];

    await new Promise(resolve => {
      fs.createReadStream("./data/MODIS_C6_USA_contiguous_and_Hawaii_24h.csv")
        .pipe(csvParser())
        .on("data", row => {
          const { latitude, longitude, acq_date: updatedDate } = row;
          govFires.push({
            latitude: parseFloat(latitude),
            longitude: parseFloat(longitude),
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
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
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

  async reportFire({ latitude, longitude, email }) {
    const users = await this._userService.get();
    users.forEach(user => {
      user.properties.forEach(property => {
        if (Math.abs(property.latitude - latitude) < 0.1 || Math.abs(property.longitude - longitude) < 0.1) {
          this._sendAlert({
            propertyEmail: user.email,
            property,
            latitude,
            longitude,
            issuer: email,
          });
        }
      })
    });
    return {
      status: 200,
      json: {},
    }
  }

  async _sendAlert({ propertyEmail, property, latitude, longitude, issuer }) {
    const params = {
      Subject: `${property.title} Threatened By Fire!`,
      Message: `${propertyEmail}, your property "${property.title}" is being endangered by a forest fire at coordinates ${latitude}, ${longitude}, discovered by ${issuer}!`,
      TopicArn: "arn:aws:sns:us-east-1:132885165810:fire",
    };
    try {
      const publishText = await new AWS.SNS({ apiVersion: "2010-03-31" }).publish(params).promise();
      console.log("success", publishText);
    } catch (error) {
      console.log("error", error);
    }
  }
}

module.exports = FireManager;
