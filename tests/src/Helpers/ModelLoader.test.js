const ModelLoader = require(`${src}/Helpers/ModelLoader`)

test('Model loader should be able to load all models except XModel', () => {
  const use = {}
  const fs = {}
  fs.readdirSync = jest.fn(() => {
    return [
      'XModel.js',
      'User.js',
      'UserPost.js'
    ]
  })

  const directory = {}
  const loader = new ModelLoader(use, fs, directory)
  const files = loader.getFiles()
  
  expect(fs.readdirSync.mock.calls.length).toBe(1)
  expect(files.length).toBe(2)
  expect(files.some(file => file === 'XModel.js')).toBe(false)
})

test('Model loader should be able to get a model instance by model file name', () => {
  const use = jest.fn((filename) => {
    return 'MyInstance'
  })

  const loader = new ModelLoader(use, null, null)
  const instance = loader.getInstance('User.js')
  
  expect(use.mock.calls.length).toBe(1)
  expect(use.mock.calls[0][0]).toBe('App/Models/User')
  expect(instance).toBe('MyInstance')
})