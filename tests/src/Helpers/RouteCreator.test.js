const RouteCreator = require(`${src}/Helpers/RouteCreator`)

test('I should be able to create all routes by model tree', () => {
  const route = {}
  route.get = jest.fn(() => { return route })
  route.post = jest.fn(() => { return route })
  route.put = jest.fn(() => { return route })
  route.delete = jest.fn(() => { return route })
  route.middleware = jest.fn(() => {})

  const routeHelper = {}
  routeHelper.set = jest.fn(() => {})
  routeHelper.setMiddleware = jest.fn(() => {})

  const tree = [
    {
      model: 'User',
      actions: ['GET', 'POST', 'PUT', 'DELETE'],
      children: [
        {
          model: 'UserPost',
          actions: ['GET', 'POST', 'PUT'],
          children: []
        }
      ]
    }
  ]

  const creator = new RouteCreator(route, routeHelper)
  creator.create(tree)

  // Validating GET requests
  expect(route.get.mock.calls.length).toBe(6)

  expect(route.get.mock.calls[0][0]).toBe('/api/users')
  expect(route.get.mock.calls[0][1]).toBe('MainController.index')

  expect(route.get.mock.calls[1][0]).toBe('/api/users/:id')
  expect(route.get.mock.calls[1][1]).toBe('MainController.show')

  expect(route.get.mock.calls[2][0]).toBe('/api/users/:userId/posts')
  expect(route.get.mock.calls[2][1]).toBe('MainController.index')

  expect(route.get.mock.calls[3][0]).toBe('/api/users/:userId/posts/:id')
  expect(route.get.mock.calls[3][1]).toBe('MainController.show')

  expect(route.get.mock.calls[4][0]).toBe('/dev/routes/list')
  expect(route.get.mock.calls[4][1]).toBe('MainController.getBasicRoutes')

  expect(route.get.mock.calls[5][0]).toBe('/dev/routes/all')
  expect(route.get.mock.calls[5][1]).toBe('MainController.getAllRoutes')

  expect(route.post.mock.calls.length).toBe(2)
  expect(route.post.mock.calls[0][0]).toBe('/api/users')
  expect(route.post.mock.calls[0][1]).toBe('MainController.store')
  expect(route.post.mock.calls[1][0]).toBe('/api/users/:userId/posts')
  expect(route.post.mock.calls[1][1]).toBe('MainController.store')

  expect(route.put.mock.calls.length).toBe(2)
  expect(route.put.mock.calls[0][0]).toBe('/api/users/:id')
  expect(route.put.mock.calls[0][1]).toBe('MainController.update')
  expect(route.put.mock.calls[1][0]).toBe('/api/users/:userId/posts/:id')
  expect(route.put.mock.calls[1][1]).toBe('MainController.update')

  // It is "1" because in UserPost model we don't support DELETE method.
  expect(route.delete.mock.calls.length).toBe(1)
  expect(route.delete.mock.calls[0][0]).toBe('/api/users/:id')
  expect(route.delete.mock.calls[0][1]).toBe('MainController.destroy')

  // We should add idFilter middleware
  expect(route.middleware.mock.calls.length).toBe(9)
  expect(route.middleware.mock.calls[0][0]).toBe('idFilter')

  // We need this model relationship in XController
  expect(routeHelper.set.mock.calls.length).toBe(2)
  expect(routeHelper.set.mock.calls[0][0]).toBe('/api/users')
  expect(routeHelper.set.mock.calls[0][1]).toBe(tree[0])
  expect(routeHelper.set.mock.calls[1][0]).toBe('/api/users/:userId/posts')
  expect(routeHelper.set.mock.calls[1][1]).toBe(tree[0].children[0])

  // We need this middleware records in XController
  expect(routeHelper.setMiddleware.mock.calls.length).toBe(1)
  expect(routeHelper.setMiddleware.mock.calls[0][0]).toBe('userId')
  expect(routeHelper.setMiddleware.mock.calls[0][1]).toBe(tree[0])
})
