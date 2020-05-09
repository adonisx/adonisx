const RouteCreator = require(`${src}/Helpers/RouteCreator`)

const getRoute = () => {
  const route = {}
  route.get = jest.fn(() => { return route })
  route.post = jest.fn(() => { return route })
  route.put = jest.fn(() => { return route })
  route.delete = jest.fn(() => { return route })
  route.middleware = jest.fn(() => {})
  return route
}

const getRouteHelper = () => {
  const routeHelper = {}
  routeHelper.set = jest.fn(() => {})
  routeHelper.setMiddleware = jest.fn(() => {})
  return routeHelper
}

const testGet = (route, call, url, method) => {
  expect(route.get.mock.calls[call][0]).toBe(url)
  expect(route.get.mock.calls[call][1]).toBe(method)
}

test('I should be able to create all routes by model tree', () => {
  const route = getRoute()
  const routeHelper = getRouteHelper()

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

  testGet(route, 0, '/api/users', 'MainController.index')
  testGet(route, 1, '/api/users/:id', 'MainController.show')
  testGet(route, 2, '/api/users/:userId/posts', 'MainController.index')
  testGet(route, 3, '/api/users/:userId/posts/:id', 'MainController.show')
  testGet(route, 4, '/dev/routes/list', 'MainController.getBasicRoutes')
  testGet(route, 5, '/dev/routes/all', 'MainController.getAllRoutes')

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

test('I should be able to create recursive routes', () => {
  const route = getRoute()
  const routeHelper = getRouteHelper()

  const tree = [
    {
      is_recursive: true,
      model: 'Category',
      table: 'categories',
      actions: ['GET', 'POST', 'PUT', 'DELETE'],
      relations: [],
      children: []
    }
  ]

  const creator = new RouteCreator(route, routeHelper)
  creator.create(tree)

  // Validating GET requests
  expect(route.get.mock.calls.length).toBe(6)

  testGet(route, 0, '/api/categories', 'MainController.index')
  testGet(route, 1, '/api/categories/:id', 'MainController.show')
  testGet(route, 2, '/api/categories/:categoryId/children', 'MainController.index')
  testGet(route, 3, '/api/categories/:categoryId/children/:id', 'MainController.show')

  expect(route.post.mock.calls[1][0]).toBe('/api/categories/:categoryId/children')
  expect(route.post.mock.calls[1][1]).toBe('MainController.store')
})
