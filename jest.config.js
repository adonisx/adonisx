const path = require('path')

module.exports = {
  globals: {
    src: path.join(__dirname, 'src')
  },
  testMatch: [
    '**/tests/units/**/*.[jt]s?(x)'
  ]
}
