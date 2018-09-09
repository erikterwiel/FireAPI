const User = require("../models/user");

class UserService {
  async create(data) {
    return data.save();
  }

  async find(email) {
    return User.findOne({ email }).exec();
  }

  async get() {
    return User.find().exec();
  }

  async update(email, data) {
    return User.update({ email }, { $set: data }).exec();
  }
}

module.exports = UserService;
