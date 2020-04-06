module.exports = (key) => {
  const map = {
    'Model': require('./MockModel')
  }
  return map[key]
}