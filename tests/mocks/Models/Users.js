'use strict'

const XModel = use('APIX/Models/XModel')

class Users extends XModel {
  static get table () {
    return 'users'
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

  // userPosts () {
  //   return this.hasMany('App/Models/UsersPosts')
  // }
}

module.exports = Users
