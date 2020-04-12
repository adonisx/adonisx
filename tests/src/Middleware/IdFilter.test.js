const IdFilter = require(`${src}/Middleware/IdFilter`)

test('I should be able to set matched url', async () => {
  const request = {}
  const params = {
    userId: 1
  }

  request.url = jest.fn(() => {
    return '/api/users/1/posts'
  })

  const filter = new IdFilter()
  filter._setMatchedUrl(request, params)

  expect(request.url.mock.calls.length).toBe(1)
  expect(request.apix.url).toBe('/api/users/:userId/posts')
})

test('I should be able to set parent columns', async () => {
  const request = {
    apix: {
      url: '/api/users/:userId/posts'
    }
  }

  const filter = new IdFilter()
  filter._setParentColumns(request)
  expect(request.apix.parent_column).toBe('userId')
})

test('I should be able to set multiple parent columns', async () => {
  const request = {
    apix: {
      url: '/api/users/:userId/posts/:postId/comments'
    }
  }

  const filter = new IdFilter()
  filter._setParentColumns(request)
  expect(request.apix.parent_column).toBe('postId')
})

test('I should be able to get special id keys', async () => {
  const filter = new IdFilter()
  const result = filter._getSpecialIdKeys('/api/users/:userId/posts/:postId/comments/:id')
  expect(result.length).toBe(2)
  expect(result[0]).toBe('userId')
  expect(result[1]).toBe('postId')
})

test('I should be able to load model', async () => {
  global.use = jest.fn(() => {
    return 'MyModel'
  })

  const filter = new IdFilter()
  const model = filter._loadModel('User')

  expect(global.use.mock.calls.length).toBe(1)
  expect(global.use.mock.calls[0][0]).toBe('App/Models/User')
  expect(model).toBe('MyModel')
})

test('I should be able execute findOrFail query for model and idKey', async () => {
  const UserModel = {}
  UserModel.query = jest.fn(() => { return UserModel })
  UserModel.where = jest.fn(() => { return UserModel })
  UserModel.firstOrFail = jest.fn(async () => {
    return {
      toJSON () {
        return 'MyQueryResult'
      }
    }
  })

  const filter = new IdFilter()
  const result = await filter._findOrFail(UserModel, { userId: 666 }, 'userId')

  expect(UserModel.query.mock.calls.length).toBe(1)
  expect(UserModel.where.mock.calls.length).toBe(1)
  expect(UserModel.where.mock.calls[0][0]).toBe('id')
  expect(UserModel.where.mock.calls[0][1]).toBe(666)
  expect(UserModel.firstOrFail.mock.calls.length).toBe(1)
  expect(result).toBe('MyQueryResult')
})

test('I should be able set query results to layers', async () => {
  const ctx = {
    request: {
      apix: {
        url: '/api/users/:userId/posts',
        layers: {}
      }
    },
    params: {}
  }
  const next = jest.fn(() => {})
  const routeHelper = {}
  routeHelper.getMiddlewareModel = jest.fn(() => {
    return {
      model: 'XModel',
      table: 'users'
    }
  })

  const filter = new IdFilter(routeHelper)
  filter._setMatchedUrl = jest.fn(() => {})
  filter._setParentColumns = jest.fn(() => {})
  filter._getSpecialIdKeys = jest.fn(() => {
    return [
      'userId'
    ]
  })
  filter._loadModel = jest.fn(() => {
    return 'XModelInstance'
  })
  filter._findOrFail = jest.fn(() => {
    return {
      id: 1,
      name: 'Foo'
    }
  })
  filter._callCustomMiddlewares = jest.fn()

  await filter.handle(ctx, next)

  expect(next.mock.calls.length).toBe(1)
  expect(filter._setMatchedUrl.mock.calls.length).toBe(1)
  expect(filter._setParentColumns.mock.calls.length).toBe(1)
  expect(filter._getSpecialIdKeys.mock.calls.length).toBe(1)
  expect(filter._loadModel.mock.calls.length).toBe(1)
  expect(filter._findOrFail.mock.calls.length).toBe(1)

  expect(ctx.request.apix.layers.user.id).toBe(1)
  expect(ctx.request.apix.layers.user.name).toBe('Foo')
})

test('I should be able call understand if there is not any middleware on this route', async () => {
  const ctx = {
    request: {
      method () {
        return 'GET'
      },
      apix: {
        url: '/api/users/:userId/posts'
      }
    }
  }
  const filter = new IdFilter()
  expect(filter._hasMiddleware(ctx, 'App/Middleware/CustomMiddleware')).toBe(true)
  expect(filter._hasMiddleware(ctx, { method: 'GET', middleware: 'App/Middleware/CustomMiddleware' })).toBe(true)
  expect(filter._hasMiddleware(ctx, { method: 'POST', middleware: 'App/Middleware/CustomMiddleware' })).toBe(false)
})

test('I should be able to load middleware instance', async () => {
  const ctx = {
    request: {
      method () {
        return 'GET'
      },
      apix: {
        url: '/api/users/:userId/posts'
      }
    }
  }
  global.use = jest.fn(() => {
    return 'MiddlewareInstance'
  })
  const filter = new IdFilter()
  expect(filter._getMiddlewareInstance(ctx, 'App/Middleware/CustomMiddleware')).toBe('MiddlewareInstance')
  expect(filter._getMiddlewareInstance(ctx, { middleware: 'App/Middleware/CustomMiddleware' })).toBe('MiddlewareInstance')
})

test('I should be able call custom middlewares', async () => {
  const ctx = {
    request: {
      method () {
        return 'GET'
      },
      apix: {
        url: '/api/users/:userId/posts'
      }
    }
  }
  const next = jest.fn(() => {})
  const routeHelper = {}
  routeHelper.get = jest.fn(() => {
    return {
      middlewares: [
        'App/Middleware/CustomMiddleware',
        'App/Middleware/CustomMiddleware',
        { method: 'GET', middleware: 'App/Middleware/CustomMiddleware' },
        { method: 'POST', middleware: 'App/Middleware/CustomMiddleware' }
      ]
    }
  })

  let counter = 0
  class CustomerMiddleware {
    handle (ctx, next) {
      counter++
      next()
    }
  }

  global.use = jest.fn(() => {
    return CustomerMiddleware
  })

  const filter = new IdFilter(routeHelper)
  await filter._callCustomMiddlewares(ctx, next)

  expect(counter).toBe(3)
})
