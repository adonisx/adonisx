class MockFs {
  static readdirSync () {
    return [
      'Users.js',
      'UsersPosts.js'
    ]
  }
}

module.exports = MockFs