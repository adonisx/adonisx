const crypto = use('crypto')
const Hash = use('Hash')

module.exports = {
  async onBeforeCreate ({ request, params, data }) {
    data.password_salt = crypto.randomBytes(32).toString('base64')
    data.password_hash = await Hash.make(
      request.input('password') + data.password_salt
    )
    delete data.password
  },

  async onBeforePaginate ({ request, params, query }) {
    query.select(['id', 'name', 'surname', 'created_at', 'updated_at'])
  }
}
