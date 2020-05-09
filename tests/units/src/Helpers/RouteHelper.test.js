const RouteHelper = require(`${src}/Helpers/RouteHelper`)

test('Route helper should be able to hold models for url definitions', () => {
  const helper = new RouteHelper()

  helper.set('api/users', 'User')
  expect(helper.get('api/users')).toBe('User')
})

test('Route helper should be able to hold middlewares for url id keys', () => {
  const helper = new RouteHelper()

  helper.setMiddleware('userId', 'User')
  expect(helper.getMiddlewareModel('userId')).toBe('User')
})
