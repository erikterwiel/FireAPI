const Bottle = require("bottlejs");

const UserService = require("./services/user");
const AuthManager = require("./managers/auth");
const FireManager = require("./managers/fire");
const UserManager = require("./managers/user");

const bottle = new Bottle();

bottle.service("userService", UserService);
bottle.service("authManager", AuthManager, "userService");
bottle.service("fireManager", FireManager, "userService");
bottle.service("userManager", UserManager, "userService");

module.exports = bottle.container;

