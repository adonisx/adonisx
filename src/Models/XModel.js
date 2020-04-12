const Model = use('Model')

class XModel extends Model {
  static get actions () {
    return ['GET', 'POST', 'PUT', 'DELETE']
  }

  static get middlewares () {
    return []
  }
}

module.exports = XModel
