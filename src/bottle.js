const Bottle = require("bottlejs");

const UserService = require("./services/user");
const AuthManager = require("./managers/auth");
const FireManager = require("./managers/fire");

const bottle = new Bottle();

bottle.service("userService", UserService);
bottle.service("authManager", AuthManager, "authService");
bottle.service("fireManager", FireManager);

module.exports = bottle.container;

