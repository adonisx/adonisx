const TriggerHelper = require(`${src}/Helpers/TriggerHelper`)

test('Trigger helper should be able to trigger the method when it has been fired', async () => {
  const modelLoader = {}
  modelLoader.getContent = jest.fn(() => {
    return () => {}
  })
  let data = {}
  modelLoader.getInstance = jest.fn(() => {
    return {
      async onBeforePaginate (_data) {
        data = _data
      }
    }
  })

  const helper = new TriggerHelper(modelLoader)

  helper
    .call('App/Triggers/UserTrigger')
    .before('paginate')
    .onModel('App/Models/User')

  await helper.fire('onBefore', 'App/Models/User', 'paginate', { userId: 666, name: 'Foo Bar' })
  expect(modelLoader.getContent.mock.calls.length).toBe(1)
  expect(modelLoader.getInstance.mock.calls.length).toBe(1)
  expect(data.userId).toBe(666)
  expect(data.name).toBe('Foo Bar')
})

test('Trigger helper should be able to not trigger any method when it does not have any definition', async () => {
  const modelLoader = {}
  modelLoader.getContent = jest.fn(() => {
    return () => {}
  })
  modelLoader.getInstance = jest.fn(() => {
    return {}
  })

  const helper = new TriggerHelper(modelLoader)
  await helper.fire('onBefore', 'App/Models/User', 'paginate', { userId: 666, name: 'Foo Bar' })
  expect(modelLoader.getContent.mock.calls.length).toBe(0)
  expect(modelLoader.getInstance.mock.calls.length).toBe(0)
})

