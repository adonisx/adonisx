const TreeMapper = require(`${src}/Helpers/TreeMapper`)

test('Tree mapper should create a recursive tree by map', () => {
  const map = [
    {
      model: 'User',
      table: 'users',
      relations: [
        {
          name: 'HasMany',
          model: 'UserPost'
        }
      ]
    },
    {
      model: 'UserPost',
      table: 'user_posts',
      relations: [
        {
          name: 'HasMany',
          model: 'PostComment'
        }
      ]
    },
    {
      model: 'PostComment',
      table: 'post_comments',
      relations: []
    }
  ]
  const mapper = new TreeMapper()
  const tree = mapper.create(map)

  expect(tree.length).toBe(3)
  expect(tree[0].model).toBe('User')
  expect(tree[0].children.length).toBe(1)
  expect(tree[0].children[0].model).toBe('UserPost')
  expect(tree[0].children[0].children.length).toBe(1)
  expect(tree[0].children[0].children[0].model).toBe('PostComment')
})

test('I should be able to add recursive models', () => {
  const map = [
    {
      model: 'Category',
      table: 'categories',
      relations: [
        {
          name: 'HasMany',
          model: 'Category'
        },
        {
          name: 'HasOne',
          model: 'Category'
        }
      ]
    }
  ]
  const mapper = new TreeMapper()
  const tree = mapper.create(map)

  expect(tree.length).toBe(1)
  expect(tree[0].model).toBe('Category')
  expect(tree[0].is_recursive).toBe(true)
})
