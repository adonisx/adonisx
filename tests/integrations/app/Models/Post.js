'use strict'

const XModel = use('AdonisX/Models/XModel')

class Post extends XModel {
  static get fillable () {
    return ['title', 'content']
  }

  static get validations () {
    return {
      title: 'required|max:100',
      content: 'required'
    }
  }

  static get middlewares () {
    return [
      'App/Middleware/AuthMiddleware'
    ]
  }

  user () {
    return this.hasOne('App/Models/User', 'user_id', 'id')
  }
}

module.exports = Post
