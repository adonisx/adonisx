global.use = jest.fn(require('./../../mocks/MockUse'))

const XModel = require('./../../../src/Models/XModel')

test('XModel should have all actions', () => {
  expect(XModel.actions.length).toBe(4)
})

test('XModel should be inhereited from AdonisJs Model', () => {
  const instance = new XModel
  expect(instance._isMyMock).toBe(true)
  expect(global.use.mock.calls.length).toBe(1)
  expect(global.use.mock.calls[0][0]).toBe('Model')
})
