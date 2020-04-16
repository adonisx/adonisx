class TriggerHelper {
  constructor (modelLoader) {
    this.modelLoader = modelLoader
    this.map = {}
    this.form = null
  }

  on (key, definition) {
    if (this.map[key] === undefined) {
      this.map[key] = []
    }
    this.map[key].push(definition)
  }

  async fire (key, data) {
    const definitions = this.map[key]
    if (!definitions) {
      return
    }

    for (const definition of definitions) {
      const [file, method] = definition.split('.')
      const TriggerFile = this.modelLoader.getContent(`App/Triggers/${file}`)
      const instance = this.modelLoader.getInstance(TriggerFile)

      if (typeof instance[method] !== 'function') {
        throw new Error(`There is not any ${method}() in ${file}`)
      }

      await instance[method](data)
    }
  }
}

module.exports = TriggerHelper
