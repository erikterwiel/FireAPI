const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

class AuthManager {

  constructor(userService) {
    this._userService = userService;
  }

  async signup(user) {
    const { email, password, properties } = user;
    if (await this._userService.find(email)) {
      return {
        status: 500,
        json: { error: "Email already exists" },
      };
    }
    const newUser = new User({
      _id: new mongoose.Types.ObjectId(),
      email,
      password,
      properties,
    });
    await this._userService.create(newUser);
    const token = await this._getToken(email);
    return {
      status: 201,
      json: {
        user,
        token,
      },
    }
  }

  async login(credentials) {
    const { email, password } = credentials;
    const user = await this._userService.find(email);
    if (!user) {
      return {
        status: 404,
        json: { error: "Invalid email" },
      };
    }
    if (user.password !== password) {
      return {
        status: 403,
        json: { error: "Invalid password" }
      };
    }
    return {
      status: 200,
      json: user,
    }
  }

  async verify(token) {
    const result = await this._verifyToken(token);
    if (!result.email) {
      return { status: 403, json: result };
    }
    try {
      const user = await this._userService.find(result.email);
      return { status: 200, json: user };
    } catch (error) {
      return { status: 403, json: error };
    }
  }

  _getToken(email) {
    return new Promise((resolve) => {
      jwt.sign({ email }, "thatOneOverThere", (err, token) => {
        resolve(token);
      });
    });
  }

  _verifyToken(token) {
    return new Promise((resolve) => {
      jwt.verify(token, "thatOneOverThere", (err, authData) => {
        if (err) {
          resolve(err);
        } else {
          resolve(authData);
        }
      });
    });
  }
}

module.exports = AuthManager;
