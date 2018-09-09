class UserManager {
  constructor(userService) {
    this._userService = userService;
  }

  async update(data) {
    try {
      const result = await this._userService.update(data.email, data);
      return {
        status: 200,
        json: result,
      }
    } catch (error) {
      return { status: 500, json: error };
    }
  }
}

module.exports = UserManager;
