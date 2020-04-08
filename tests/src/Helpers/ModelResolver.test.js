const ModelResolver = require(`${src}/Helpers/ModelResolver`)
test('Model loader should be able to load all models except XModel', () => {
  const modelLoader = {}
  const treeMapper = {}
  modelLoader.getFiles = jest.fn(() => {
    return [
      'User.js',
      'UserPost.js'
    ]
  })

  const UserModel = {
    userPosts () {
      return {
        $relation: {},
        RelatedModel: {
          name: 'UserPost'
        }
      }
    }
  }
  const UserPostModel = {}

  modelLoader.getModel = jest.fn()
  modelLoader.getModel.mockReturnValueOnce(UserModel).mockReturnValueOnce(UserPostModel)

  modelLoader.getInstance = jest.fn()
  modelLoader.getInstance.mockReturnValueOnce(UserModel).mockReturnValueOnce(UserPostModel)

  modelLoader.getModelRelationMethods = jest.fn()
  modelLoader.getModelRelationMethods.mockReturnValueOnce(['userPosts']).mockReturnValueOnce([])

  treeMapper.create = jest.fn()
  treeMapper.create.mockReturnValueOnce('MyTree')

  const resolver = new ModelResolver(modelLoader, treeMapper)
  const result = resolver.get()
  
  expect(modelLoader.getFiles.mock.calls.length).toBe(1)
  expect(modelLoader.getModel.mock.calls.length).toBe(2)
  expect(modelLoader.getInstance.mock.calls.length).toBe(2)
  expect(modelLoader.getModelRelationMethods.mock.calls.length).toBe(2)
  expect(treeMapper.create.mock.calls.length).toBe(1)
})