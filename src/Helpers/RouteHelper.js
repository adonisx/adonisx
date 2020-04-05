class RouteHelper {
  constructor () {
    this.map = {}
    this.middlewares = {}
  }

  set (url, model) {
    this.map[url] = model
  }

  get (url) {
    return this.map[url]
  }

  setMiddleware (idKey, model) {
    if (this.middlewares[idKey] === undefined) {
      this.middlewares[idKey] = model
    }
  }

  getMiddlewareModel (idKey) {
    return this.middlewares[idKey]
  }
}

module.exports = RouteHelper
