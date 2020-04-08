const ModelResolver = require(`${src}/Helpers/ModelResolver`)
test('Model resolver should resolve all model relations', () => {
  const modelLoader = {}
  const treeMapper = {}
  modelLoader.getFiles = jest.fn(() => {
    return [
      'User.js',
      'UserPost.js'
    ]
  })

  const UserModel = {
    actions: 'ModelActions',
    table: 'users',
    userPosts () {
      return {
        $relation: {},
        RelatedModel: {
          name: 'UserPost'
        }
      }
    }
  }
  const UserPostModel = {
    table: 'user_posts',
    actions: 'ModelActions'
  }

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

  const map = treeMapper.create.mock.calls[0][0]
  /*
    We should have an object like this on "map" variable.
    [
      {
        actions: 'ModelActions',
        model: 'User',
        table: 'users',
        relations: [
          {
            model: 'UserPost'
          }
        ]
      },
      {
        actions: 'ModelActions',
        model: 'UserPost',
        table: 'user_posts',
        relations: []
      }
    ]
  */
  expect(map.length).toBe(2)
  expect(map[0].model).toBe('User')
  expect(map[0].table).toBe('users')
  expect(map[0].actions).toBe('ModelActions')
  expect(map[0].relations.length).toBe(1)
  expect(map[0].relations[0].model).toBe('UserPost')

  expect(map[1].model).toBe('UserPost')
  expect(map[1].table).toBe('user_posts')
  expect(map[1].actions).toBe('ModelActions')
  expect(map[1].relations.length).toBe(0)
})