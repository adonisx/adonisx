const TriggerHelper = require(`${src}/Helpers/TriggerHelper`)

test('I should be able to define a trigger', async () => {
  const helper = new TriggerHelper()

  helper.on('onAfterDeleteUser', 'UserTrigger.onAfterDeleteUser')
  expect(typeof helper.map.onAfterDeleteUser).toBe('object')
  expect(helper.map.onAfterDeleteUser.length).toBe(1)
  expect(helper.map.onAfterDeleteUser[0]).toBe('UserTrigger.onAfterDeleteUser')
})

test('I should be able to trigger a defined method', async () => {
  const instance = {}
  instance.onAfterDeleteUser = jest.fn()
  instance.onAfterDeleteUserSecond = jest.fn()

  const modelLoader = {}
  modelLoader.getContent = jest.fn(() => {
    return 'MyTriggerFile'
  })
  modelLoader.getInstance = jest.fn(() => {
    return instance
  })

  const helper = new TriggerHelper(modelLoader)

  // Defining relationships
  helper.on('onAfterDeleteUser', 'UserTrigger.onAfterDeleteUser')
  helper.on('onAfterDeleteUser', 'UserTrigger.onAfterDeleteUserSecond')

  // Fire defined triggers with a custom data
  const data = { userId: 1 }
  await helper.fire('onAfterDeleteUser', data)

  // Our trigger instance method should be able to call with custom data
  expect(instance.onAfterDeleteUser.mock.calls.length).toBe(1)
  expect(instance.onAfterDeleteUser.mock.calls[0][0]).toBe(data)
  expect(instance.onAfterDeleteUserSecond.mock.calls.length).toBe(1)
  expect(instance.onAfterDeleteUserSecond.mock.calls[0][0]).toBe(data)
})

test('I should be able to get an exception if there is not any method in my trigger implementation', async () => {
  const instance = {}
  const modelLoader = {}
  modelLoader.getContent = jest.fn(() => {
    return 'MyTriggerFile'
  })
  modelLoader.getInstance = jest.fn(() => {
    return instance
  })

  const helper = new TriggerHelper(modelLoader)

  // Defining relationships
  helper.on('onAfterDeleteUser', 'UserTrigger.onAfterDeleteUser')

  // Fire defined triggers with a custom data
  try {
    await helper.fire('onAfterDeleteUser', {})
    expect(true).toBe(false)
  } catch (err) {
    expect(err.message).toBe('There is not any onAfterDeleteUser() in UserTrigger')
  }
})
