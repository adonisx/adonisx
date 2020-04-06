'use strict'

const XModel = use('APIX/Models/XModel')

class UsersPosts extends XModel {
  static get table () {
    return 'user_posts'
  }

  static get fillable () {
    return ['email', 'name', 'surname', 'age']
  }

  static get validations () {
    return {
      email: 'required|email',
      name: 'required|max:50',
      surname: 'required|max:50',
      age: 'max:100'
    }
  }
}

module.exports = UsersPosts
