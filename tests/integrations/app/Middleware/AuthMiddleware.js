'use strict'

const moment = use('moment')
const Token = use('App/Models/Token')
const HttpException = use('AdonisX/Exceptions/HttpException')

class AuthMiddleware {
  async handle ({ request }, next) {
    // Fetch the token from header
    let token = request.header('Authorization')

    // If the token is empty, we should check cookies
    if (token === undefined) {
      token = request.plainCookie('token')
    }

    // token null controll
    if (token === undefined || token == null) {
      throw new HttpException(401, 'Unauthorized')
    }

    token = token.replace('Bearer ', '')
    // token length control
    if (token.length === 0) {
      throw new HttpException(401, 'Unauthorized')
    }

    // fetch token datas with user informations
    const userToken = await Token
      .query()
      .with('user')
      .where('token', token)
      .where('expire_at', '>', moment().format('YYYY-MM-DD HH:mm:ss'))
      .first()

    if (userToken === null) {
      throw new HttpException('Unauthorized', 401)
    }

    userToken.expire_at = moment().add(30, 'minutes').format('YYYY-MM-DD HH:mm:ss')
    await userToken.save()

    request.auth = {
      user: userToken.toJSON().user
    }

    if (next) {
      await next()
    }
  }
}

module.exports = AuthMiddleware
