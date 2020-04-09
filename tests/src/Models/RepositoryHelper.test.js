test('I should be able to create a XModel instance.', () => {
  class AdonisModel {
    isExtended () {
      return true
    }
  }
  global.use = jest.fn(() => {
    return AdonisModel
  })

  const XModel = require(`${src}/Models/XModel`)
  expect(XModel.actions.length).toBe(4)
  expect(XModel.actions[0]).toBe('GET')

  const instance = new XModel()
  expect(instance.isExtended()).toBe(true)
})

