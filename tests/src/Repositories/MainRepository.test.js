const MainRepository = require(`${src}/Repositories/MainRepository`)

const getDependencies = () => {
  return JSON.parse(JSON.stringify({
    validation: {},
    route: {},
    trigger: {},
    repositoryHelper: {},
    queryParser: {}
  }))
}

const getInstance = (dep) => {
  return new MainRepository(
    dep.validation,
    dep.route,
    dep.trigger,
    dep.repositoryHelper,
    dep.queryParser
  )
}

const getRequest = () => {
  return JSON.parse(JSON.stringify({
    apix: {
      url: 'api/users/1/posts',
      parent_column: 'userId'
    }
  }))
}

test('I should be able to paginate by route definition.', async () => {
  // Model mock
  const query = {}
  query.paginate = jest.fn(() => {
    return 'PaginationResult'
  })

  const UserPost = {}
  UserPost.query = jest.fn(() => {
    return query
  })

  // Request mock
  const request = getRequest()
  request.all = jest.fn(() => {})

  // Constructer mocks
  const dep = getDependencies()
  dep.repositoryHelper.getModelPath = jest.fn(() => {
    return 'App/Models/UserPost'
  })
  dep.repositoryHelper.getModel = jest.fn(() => {
    return UserPost
  })
  dep.repositoryHelper.addParentIdCondition = jest.fn(() => {})
  dep.trigger.fire = jest.fn(() => {})
  dep.queryParser.get = jest.fn(() => {
    return {
      page: 3,
      per_page: 25,
      fields: null,
      sort: null
    }
  })
  dep.queryParser.applyFields = jest.fn(() => {})
  dep.queryParser.applySorting = jest.fn(() => {})
  dep.queryParser.applyWheres = jest.fn(() => {})

  const repository = getInstance(dep)
  const result = await repository.paginate(request, { userId: 1 })

  expect(dep.repositoryHelper.getModelPath.mock.calls.length).toBe(1)
  expect(dep.repositoryHelper.getModelPath.mock.calls[0][0]).toBe('api/users/1/posts')

  expect(dep.repositoryHelper.getModel.mock.calls.length).toBe(1)
  expect(dep.repositoryHelper.getModel.mock.calls[0][0]).toBe('App/Models/UserPost')

  expect(dep.repositoryHelper.addParentIdCondition.mock.calls.length).toBe(1)
  expect(dep.repositoryHelper.addParentIdCondition.mock.calls[0][0]).toBe(query)
  expect(dep.repositoryHelper.addParentIdCondition.mock.calls[0][1].userId).toBe(1)
  expect(dep.repositoryHelper.addParentIdCondition.mock.calls[0][2]).toBe('userId')

  expect(dep.trigger.fire.mock.calls.length).toBe(2)
  expect(dep.trigger.fire.mock.calls[0][0]).toBe('onBefore')
  expect(dep.trigger.fire.mock.calls[0][1]).toBe('App/Models/UserPost')
  expect(dep.trigger.fire.mock.calls[0][2]).toBe('paginate')
  expect(dep.trigger.fire.mock.calls[0][3].query).toBe(query)

  expect(dep.trigger.fire.mock.calls[1][0]).toBe('onAfter')
  expect(dep.trigger.fire.mock.calls[1][1]).toBe('App/Models/UserPost')
  expect(dep.trigger.fire.mock.calls[1][2]).toBe('paginate')
  expect(dep.trigger.fire.mock.calls[1][3].result).toBe('PaginationResult')

  expect(query.paginate.mock.calls.length).toBe(1)
  expect(query.paginate.mock.calls[0][0]).toBe(3)
  expect(query.paginate.mock.calls[0][1]).toBe(25)

  expect(result).toBe('PaginationResult')
})

test('I should be able to get first record by route definition.', async () => {
  // Model mock
  const query = {}
  query.where = jest.fn(() => {})
  query.firstOrFail = jest.fn(() => {
    return 'FirstOrFailResult'
  })

  const UserPost = {}
  UserPost.query = jest.fn(() => {
    return query
  })

  // Request mock
  const request = getRequest()
  request.apix.url = 'api/users/1/posts/2'
  request.all = jest.fn(() => {})

  // Constructer mocks
  const dep = getDependencies()
  dep.repositoryHelper.getModelPath = jest.fn(() => {
    return 'App/Models/UserPost'
  })
  dep.repositoryHelper.getModel = jest.fn(() => {
    return UserPost
  })
  dep.repositoryHelper.addParentIdCondition = jest.fn(() => {})
  dep.trigger.fire = jest.fn(() => {})

  // Query parser mocks
  dep.queryParser.get = jest.fn(() => {
    return {
      page: 3,
      per_page: 25,
      fields: null,
      sort: null
    }
  })
  dep.queryParser.applyFields = jest.fn(() => {})
  dep.queryParser.applySorting = jest.fn(() => {})
  dep.queryParser.applyWheres = jest.fn(() => {})

  const repository = getInstance(dep)
  const result = await repository.firstOrFail(request, { userId: 1, id: 2 })

  expect(dep.repositoryHelper.getModelPath.mock.calls.length).toBe(1)
  expect(dep.repositoryHelper.getModelPath.mock.calls[0][0]).toBe('api/users/1/posts/2')

  expect(dep.repositoryHelper.getModel.mock.calls.length).toBe(1)
  expect(dep.repositoryHelper.getModel.mock.calls[0][0]).toBe('App/Models/UserPost')

  expect(dep.repositoryHelper.addParentIdCondition.mock.calls.length).toBe(1)
  expect(dep.repositoryHelper.addParentIdCondition.mock.calls[0][0]).toBe(query)
  expect(dep.repositoryHelper.addParentIdCondition.mock.calls[0][1].userId).toBe(1)
  expect(dep.repositoryHelper.addParentIdCondition.mock.calls[0][2]).toBe('userId')

  expect(dep.trigger.fire.mock.calls.length).toBe(2)
  expect(dep.trigger.fire.mock.calls[0][0]).toBe('onBefore')
  expect(dep.trigger.fire.mock.calls[0][1]).toBe('App/Models/UserPost')
  expect(dep.trigger.fire.mock.calls[0][2]).toBe('firstOrFail')
  expect(dep.trigger.fire.mock.calls[0][3].query).toBe(query)

  expect(dep.trigger.fire.mock.calls[1][0]).toBe('onAfter')
  expect(dep.trigger.fire.mock.calls[1][1]).toBe('App/Models/UserPost')
  expect(dep.trigger.fire.mock.calls[1][2]).toBe('firstOrFail')
  expect(dep.trigger.fire.mock.calls[1][3].item).toBe('FirstOrFailResult')

  expect(query.where.mock.calls.length).toBe(1)
  expect(query.where.mock.calls[0][0]).toBe('id')
  expect(query.where.mock.calls[0][1]).toBe(2)

  expect(query.firstOrFail.mock.calls.length).toBe(1)

  expect(result).toBe('FirstOrFailResult')
})

test('I should be able to get an error while trying to reach unfound record.', async () => {
  // Model mock
  const query = {}
  query.where = jest.fn(() => {})
  query.firstOrFail = jest.fn(() => {
    throw new Error()
  })

  const UserPost = {}
  UserPost.query = jest.fn(() => {
    return query
  })

  // Request mock
  const request = getRequest()
  request.apix.url = 'api/users/1/posts/2'
  request.all = jest.fn(() => {})

  // Constructer mocks
  const dep = getDependencies()
  dep.repositoryHelper.getModelPath = jest.fn(() => {
    return 'App/Models/UserPost'
  })
  dep.repositoryHelper.getModel = jest.fn(() => {
    return UserPost
  })
  dep.repositoryHelper.getModelName = jest.fn(() => {
    return 'UserPost'
  })
  dep.repositoryHelper.addParentIdCondition = jest.fn(() => {})
  dep.trigger.fire = jest.fn(() => {})

  dep.queryParser.get = jest.fn(() => {
    return {
      fields: null,
      sort: null
    }
  })
  dep.queryParser.applyFields = jest.fn(() => {})
  dep.queryParser.applySorting = jest.fn(() => {})
  dep.queryParser.applyWheres = jest.fn(() => {})

  const repository = getInstance(dep)

  let exceptionName = null
  try {
    await repository.firstOrFail(request, { userId: 1, id: 2 })
  } catch (exception) {
    exceptionName = exception.name
  }
  expect(exceptionName).toBe('HttpException')
})


test('I should be able to create a record by route definition.', async () => {
  // Model mock
  const query = {}
  query.where = jest.fn(() => {})
  query.firstOrFail = jest.fn(() => {
    return 'FirstOrFailResult'
  })

  const UserPost = {}
  UserPost.query = jest.fn(() => {
    return query
  })
  UserPost.create = jest.fn(() => {
    return 'CreatedPost'
  })
  UserPost.validations = 'MyValidationRules'

  // This is the form which has been sent by user to create
  const form = {
    title: 'Post Title',
    description: 'Post description in here.'
  }

  // Request mock
  const request = getRequest()
  request.apix.url = 'api/users/1/posts'
  request.all = jest.fn(() => {
    return form
  })
  request.only = jest.fn(() => {
    return form
  })

  // Constructer mocks
  const dep = getDependencies()
  dep.repositoryHelper.getModelPath = jest.fn(() => {
    return 'App/Models/UserPost'
  })
  dep.repositoryHelper.getModel = jest.fn(() => {
    return UserPost
  })

  // Trigger mocks
  dep.trigger.fire = jest.fn(() => {})

  // Validation mocks
  dep.validation.validate = jest.fn(async () => {})

  const repository = getInstance(dep)
  const result = await repository.store(request, { userId: 1 })

  expect(dep.repositoryHelper.getModelPath.mock.calls.length).toBe(1)
  expect(dep.repositoryHelper.getModelPath.mock.calls[0][0]).toBe('api/users/1/posts')

  expect(dep.repositoryHelper.getModel.mock.calls.length).toBe(1)
  expect(dep.repositoryHelper.getModel.mock.calls[0][0]).toBe('App/Models/UserPost')

  expect(dep.validation.validate.mock.calls.length).toBe(1)
  expect(dep.validation.validate.mock.calls[0][0]).toBe(form)
  expect(dep.validation.validate.mock.calls[0][1]).toBe('MyValidationRules')

  expect(dep.trigger.fire.mock.calls.length).toBe(2)
  expect(dep.trigger.fire.mock.calls[0][0]).toBe('onBefore')
  expect(dep.trigger.fire.mock.calls[0][1]).toBe('App/Models/UserPost')
  expect(dep.trigger.fire.mock.calls[0][2]).toBe('create')
  expect(dep.trigger.fire.mock.calls[0][3].data.title).toBe('Post Title')
  expect(dep.trigger.fire.mock.calls[0][3].data.description).toBe('Post description in here.')
  expect(dep.trigger.fire.mock.calls[0][3].data.user_id).toBe(1)

  expect(dep.trigger.fire.mock.calls[1][0]).toBe('onAfter')
  expect(dep.trigger.fire.mock.calls[1][1]).toBe('App/Models/UserPost')
  expect(dep.trigger.fire.mock.calls[1][2]).toBe('create')
  expect(dep.trigger.fire.mock.calls[1][3].item).toBe('CreatedPost')

  expect(UserPost.create.mock.calls.length).toBe(1)

  expect(result).toBe('CreatedPost')
})

test('I should be able to update a record by route definition.', async () => {
  // Item mocks
  const item = {
    id: 2,
    user_id: 1,
    title: 'Post Title',
    description: null
  }
  item.merge = jest.fn(() => {
    item.description = 'Updated description'
  })
  item.toJSON = jest.fn(() => {
    return item
  })
  item.save = jest.fn(async () => {})

  // Query mocks
  const query = {}
  query.where = jest.fn(() => {
    return query
  })
  query.firstOrFail = jest.fn(async () => {
    return item
  })

  // Model mocks
  const UserPost = {}
  UserPost.query = jest.fn(() => {
    return query
  })
  UserPost.validations = 'MyValidationRules'

  // This is the form which has been sent by user to create
  const form = {
    title: 'Post Title',
    description: 'Post description in here.'
  }

  // Request mock
  const request = getRequest()
  request.apix.url = 'api/users/1/posts/2'
  request.only = jest.fn(() => {
    return form
  })

  // Constructer mocks
  const dep = getDependencies()
  dep.repositoryHelper.getModelPath = jest.fn(() => {
    return 'App/Models/UserPost'
  })
  dep.repositoryHelper.getModel = jest.fn(() => {
    return UserPost
  })
  dep.repositoryHelper.addParentIdCondition = jest.fn(() => {})

  // Trigger mocks
  dep.trigger.fire = jest.fn(() => {})

  // Validation mocks
  dep.validation.validate = jest.fn(async () => {})

  const repository = getInstance(dep)
  const result = await repository.update(request, { userId: 1 })

  expect(dep.repositoryHelper.getModelPath.mock.calls.length).toBe(1)
  expect(dep.repositoryHelper.getModelPath.mock.calls[0][0]).toBe('api/users/1/posts/2')

  expect(dep.repositoryHelper.getModel.mock.calls.length).toBe(1)
  expect(dep.repositoryHelper.getModel.mock.calls[0][0]).toBe('App/Models/UserPost')

  expect(dep.validation.validate.mock.calls.length).toBe(1)
  expect(dep.validation.validate.mock.calls[0][0]).toBe(item)
  expect(dep.validation.validate.mock.calls[0][1]).toBe('MyValidationRules')

  expect(dep.trigger.fire.mock.calls.length).toBe(4)
  expect(dep.trigger.fire.mock.calls[0][0]).toBe('onBefore')
  expect(dep.trigger.fire.mock.calls[0][1]).toBe('App/Models/UserPost')
  expect(dep.trigger.fire.mock.calls[0][2]).toBe('updateQuery')

  expect(dep.trigger.fire.mock.calls[1][0]).toBe('onAfter')
  expect(dep.trigger.fire.mock.calls[1][1]).toBe('App/Models/UserPost')
  expect(dep.trigger.fire.mock.calls[1][2]).toBe('updateQuery')
  expect(dep.trigger.fire.mock.calls[1][3].item.title).toBe('Post Title')
  expect(dep.trigger.fire.mock.calls[1][3].item.user_id).toBe(1)

  expect(dep.trigger.fire.mock.calls[2][0]).toBe('onBefore')
  expect(dep.trigger.fire.mock.calls[2][1]).toBe('App/Models/UserPost')
  expect(dep.trigger.fire.mock.calls[2][2]).toBe('update')
  expect(dep.trigger.fire.mock.calls[2][3].item.title).toBe('Post Title')
  expect(dep.trigger.fire.mock.calls[2][3].item.description).toBe('Updated description')
  expect(dep.trigger.fire.mock.calls[2][3].item.user_id).toBe(1)

  expect(result).toBe(item)
})

test('I should be able to delete a record by route definition.', async () => {
  // Item mocks
  const item = {
    id: 2,
    user_id: 1,
    title: 'Post Title',
    description: null
  }
  item.toJSON = jest.fn(() => {
    return item
  })

  // Query mocks
  const query = {}
  query.where = jest.fn(() => {
    return query
  })
  query.firstOrFail = jest.fn(async () => {
    return item
  })
  query.delete = jest.fn(async () => {})

  // Model mocks
  const UserPost = {}
  UserPost.query = jest.fn(() => {
    return query
  })

  // Request mock
  const request = getRequest()
  request.apix.url = 'api/users/1/posts/2'

  // Constructer mocks
  const dep = getDependencies()
  dep.repositoryHelper.getModelPath = jest.fn(() => {
    return 'App/Models/UserPost'
  })
  dep.repositoryHelper.getModel = jest.fn(() => {
    return UserPost
  })
  dep.repositoryHelper.addParentIdCondition = jest.fn(() => {})

  // Trigger mocks
  dep.trigger.fire = jest.fn(() => {})

  const repository = getInstance(dep)
  await repository.destroy(request, { userId: 1 })

  expect(dep.repositoryHelper.getModelPath.mock.calls.length).toBe(1)
  expect(dep.repositoryHelper.getModelPath.mock.calls[0][0]).toBe('api/users/1/posts/2')

  expect(dep.repositoryHelper.getModel.mock.calls.length).toBe(1)
  expect(dep.repositoryHelper.getModel.mock.calls[0][0]).toBe('App/Models/UserPost')

  expect(dep.trigger.fire.mock.calls.length).toBe(2)
  expect(dep.trigger.fire.mock.calls[0][0]).toBe('onBefore')
  expect(dep.trigger.fire.mock.calls[0][1]).toBe('App/Models/UserPost')
  expect(dep.trigger.fire.mock.calls[0][2]).toBe('delete')

  expect(dep.trigger.fire.mock.calls[1][0]).toBe('onAfter')
  expect(dep.trigger.fire.mock.calls[1][1]).toBe('App/Models/UserPost')
  expect(dep.trigger.fire.mock.calls[1][2]).toBe('delete')
  expect(dep.trigger.fire.mock.calls[1][3].item.title).toBe('Post Title')
  expect(dep.trigger.fire.mock.calls[1][3].item.user_id).toBe(1)
})

test('I should be able to list all routes with basic style.', async () => {
  const dep = getDependencies()
  dep.route.list = jest.fn(() => {
    return [
      {
        toJSON () {
          return {
            route: 'api/users',
            verbs: ['GET', 'POST']
          }
        }
      }
    ]
  })

  const repository = getInstance(dep)
  const result = await repository.getBasicRoutes()

  expect(result.length).toBe(1)
  expect(result[0]).toBe('api/users [GET|POST]')
})

test('I should be able to list all routes with full detail style.', async () => {
  const dep = getDependencies()
  const routes = [
    {
      toJSON () {
        return {
          route: 'api/users',
          verbs: ['GET', 'POST']
        }
      }
    }
  ]
  dep.route.list = jest.fn(() => {
    return routes
  })

  const repository = getInstance(dep)
  const result = await repository.getAllRoutes()

  expect(result.length).toBe(1)
  expect(result[0].route).toBe('api/users')
  expect(result[0].verbs.length).toBe(2)
  expect(result[0].verbs[0]).toBe('GET')
  expect(result[0].verbs[1]).toBe('POST')
})