const Model = use('Model')

class XModel extends Model {
  static get actions () {
    return ['GET', 'POST', 'PUT', 'DELETE']
  }

  static get middlewares () {
    return []
  }

  static get validations () {
    return null
  }
}

module.exports = XModel
