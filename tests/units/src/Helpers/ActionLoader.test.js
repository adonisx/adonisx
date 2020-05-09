const ActionLoader = require(`${src}/Helpers/ActionLoader`)

test('I should be able to load all actions', () => {
  const use = {}
  const fs = {}
  fs.readdirSync = jest.fn(() => {
    return [
      'UserActions.js',
      'PostActions.js'
    ]
  })

  const directory = {}
  const loader = new ActionLoader(use, fs, directory)

  expect(fs.readdirSync.mock.calls.length).toBe(1)
  expect(loader.actions.length).toBe(2)
  expect(loader.actions[0].file).toBe('UserActions.js')
  expect(loader.actions[0].model).toBe('User')
})

test('I should be able to get action instance', () => {
  const TestActions = {
    name: 'TestActions'
  }

  const use = jest.fn(() => {
    return TestActions
  })

  const fs = {}
  fs.readdirSync = jest.fn(() => {
    return [
      'UserActions.js'
    ]
  })

  const directory = {}
  const loader = new ActionLoader(use, fs, directory)
  const instance = loader.getInstance('UserActions.js')
  expect(instance.name).toBe('TestActions')
})
