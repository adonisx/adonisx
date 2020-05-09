'use strict'

const crypto = use('crypto')
const moment = use('moment')
const Hash = use('Hash')
const User = use('App/Models/User')
const Token = use('App/Models/Token')
const ValidationHelper = use('AdonisX/Helpers/ValidationHelper')
const ApiException = use('AdonisX/Exceptions/ApiException')

class UserController {
  async login ({ request, response }) {
    await ValidationHelper.validate(request.method(), request.all(), {
      email: 'required|email',
      password: 'required|min:6|max:20'
    })

    const user = await User
      .query()
      .where('email', request.input('email'))
      .firstOrFail()

    const isSame = await Hash.verify(
      request.input('password') + user.password_salt,
      user.password_hash
    )

    if (!isSame) {
      throw new ApiException('User not found!')
    }

    const token = crypto.randomBytes(32).toString('base64')
    await Token.create({
      user_id: user.id,
      token,
      expire_at: moment().add(30, 'minutes').format('YYYY-MM-DD HH:mm:ss')
    })

    return response.json({
      id: user.id,
      name: user.name,
      surname: user.surname,
      token
    })
  }
}

module.exports = UserController
