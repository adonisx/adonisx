const use = require('./../../mocks/Use')
global.use = jest.fn((key) => {
  const map = {
    'fs': require('./../../mocks/MockFs'),
    'Helpers': require('./../../mocks/MockHelpers'),
    'Model': require('./../../mocks/MockModel'),
    'App/Models/Users': require('./../../mocks/Models/Users'),
    'App/Models/UsersPosts': require('./../../mocks/Models/UsersPosts'),
    'APIX/Models/XModel': require('./../../../src/Models/XModel')
  }
  return use(map, key)
})

const ModelResolver = require('./../../../src/Helpers/ModelResolver')
const resolver = new ModelResolver()

test('XModel should have all actions', () => {
  const map = resolver.get()
  console.log(map)
  expect(map.length).toBe(2)
  expect(map[0].model).toBe('Users')
  expect(map[0].table).toBe('users')
  expect(map[0].actions.length).toBe(4)
})
