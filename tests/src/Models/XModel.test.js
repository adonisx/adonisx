const use = require('./../../mocks/Use')
global.use = jest.fn((key) => {
  const map = {
    'Model': require('./../../mocks/MockModel')
  }
  return use(map, key)
})

const XModel = require('./../../../src/Models/XModel')

test('XModel should have all actions', () => {
  expect(XModel.actions.length).toBe(4)
})

test('XModel should be inhereited from AdonisJs Model', () => {
  const instance = new XModel
  expect(instance._isMyMock).toBe(true)
})
