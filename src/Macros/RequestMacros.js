module.exports = {
  getFillableFields (model) {
    const method = this.method()
    if (!model.fillable) {
      return this.only([])
    }

    if (model.fillable[method]) {
      return this.only(model.fillable[method])
    }

    // For example the method is POST. But the user defined a fillable field for
    // only PUT. In this case, there is not any fillable fields to use. That's why
    // we should return an empty array
    if (Array.isArray(model.fillable) === false) {
      return this.only([])
    }

    return this.only(model.fillable)
  }
}
