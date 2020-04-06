module.exports = (map, key) => {
  if (map[key] === undefined) {
    throw new Error(`Key not found on mocking map: ${key}`)
  }

  return map[key]
}