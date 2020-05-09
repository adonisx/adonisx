const { test, trait } = use('Test/Suite')('01-User')

trait('Test/ApiClient')

test('I should be able to list all users', async ({ client }) => {
  const response = await client
    .get('/api/users')
    .end()
  response.assertStatus(200)
})
