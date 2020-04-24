const getCtx = () => {
  return {
    request: {},
    response: {},
    params: {}
  }
}

const getController = () => {
  const XController = require(`${src}/Controllers/XController`)
  return new XController()
}

const verifyJson = (ctx, times, argument) => {
  expect(ctx.response.json.mock.calls.length).toBe(times)
  expect(ctx.response.json.mock.calls[0][0]).toBe(argument)
}

test('I should be able to create a new instance of XController.', () => {
  const repository = {}

  global.use = jest.fn(() => {
    return repository
  })

  const controller = getController()

  expect(global.use.mock.calls.length).toBe(1)
  expect(global.use.mock.calls[0][0]).toBe('AdonisX/Repositories/MainRepository')
  expect(controller.repository).toBe(repository)
})

test('I should be able to paginate records via index method.', async () => {
  const repository = {}
  const ctx = getCtx()

  global.use = jest.fn(() => {
    return repository
  })

  repository.paginate = jest.fn(() => {
    return 'PaginationResult'
  })

  ctx.response.json = jest.fn(() => {
    return 'JsonResponse'
  })

  const controller = getController()
  const result = await controller.index(ctx)

  expect(repository.paginate.mock.calls.length).toBe(1)
  expect(repository.paginate.mock.calls[0][0]).toBe(ctx.request)
  expect(repository.paginate.mock.calls[0][1]).toBe(ctx.params)

  verifyJson(ctx, 1, 'PaginationResult')
  expect(result).toBe('JsonResponse')
})

test('I should be able to show one record via show method.', async () => {
  const repository = {}
  const ctx = getCtx()

  global.use = jest.fn(() => {
    return repository
  })

  repository.firstOrFail = jest.fn(() => {
    return 'OneRecord'
  })

  ctx.response.json = jest.fn(() => {
    return 'JsonResponse'
  })

  const controller = getController()
  const result = await controller.show(ctx)

  expect(repository.firstOrFail.mock.calls.length).toBe(1)
  expect(repository.firstOrFail.mock.calls[0][0]).toBe(ctx.request)
  expect(repository.firstOrFail.mock.calls[0][1]).toBe(ctx.params)

  verifyJson(ctx, 1, 'OneRecord')
  expect(result).toBe('JsonResponse')
})

test('I should be to store a new record.', async () => {
  const repository = {}
  const ctx = getCtx()

  global.use = jest.fn(() => {
    return repository
  })

  repository.store = jest.fn(() => {
    return 'OneRecord'
  })

  ctx.response.json = jest.fn(() => {
    return 'JsonResponse'
  })

  const controller = getController()
  const result = await controller.store(ctx)

  expect(repository.store.mock.calls.length).toBe(1)
  expect(repository.store.mock.calls[0][0]).toBe(ctx.request)
  expect(repository.store.mock.calls[0][1]).toBe(ctx.params)

  verifyJson(ctx, 1, 'OneRecord')
  expect(result).toBe('JsonResponse')
})

test('I should be to update a record.', async () => {
  const repository = {}
  const ctx = getCtx()

  global.use = jest.fn(() => {
    return repository
  })

  repository.update = jest.fn(() => {
    return 'OneRecord'
  })

  ctx.response.json = jest.fn(() => {
    return 'JsonResponse'
  })

  const controller = getController()
  const result = await controller.update(ctx)

  expect(repository.update.mock.calls.length).toBe(1)
  expect(repository.update.mock.calls[0][0]).toBe(ctx.request)
  expect(repository.update.mock.calls[0][1]).toBe(ctx.params)

  verifyJson(ctx, 1, 'OneRecord')
  expect(result).toBe('JsonResponse')
})

test('I should be to destroy a record.', async () => {
  const repository = {}
  const ctx = getCtx()

  global.use = jest.fn(() => {
    return repository
  })

  repository.destroy = jest.fn(() => {
    return 'OneRecord'
  })

  ctx.response.ok = jest.fn(() => {
    return 'EmptyResponse'
  })

  const controller = getController()
  const result = await controller.destroy(ctx)

  expect(repository.destroy.mock.calls.length).toBe(1)
  expect(repository.destroy.mock.calls[0][0]).toBe(ctx.request)
  expect(repository.destroy.mock.calls[0][1]).toBe(ctx.params)

  expect(ctx.response.ok.mock.calls.length).toBe(1)

  expect(result).toBe('EmptyResponse')
})

test('I should be to list basic routes.', async () => {
  const repository = {}
  const ctx = getCtx()

  global.use = jest.fn(() => {
    return repository
  })

  repository.getBasicRoutes = jest.fn(() => {
    return 'RouteList'
  })

  ctx.response.json = jest.fn(() => {
    return 'JsonResponse'
  })

  const controller = getController()
  const result = await controller.getBasicRoutes(ctx)

  expect(repository.getBasicRoutes.mock.calls.length).toBe(1)

  verifyJson(ctx, 1, 'RouteList')
  expect(result).toBe('JsonResponse')
})

test('I should be to list extended routes.', async () => {
  const repository = {}
  const ctx = getCtx()

  global.use = jest.fn(() => {
    return repository
  })

  repository.getAllRoutes = jest.fn(() => {
    return 'RouteList'
  })

  ctx.response.json = jest.fn(() => {
    return 'JsonResponse'
  })

  const controller = getController()
  const result = await controller.getAllRoutes(ctx)

  expect(repository.getAllRoutes.mock.calls.length).toBe(1)

  verifyJson(ctx, 1, 'RouteList')
  expect(result).toBe('JsonResponse')
})
