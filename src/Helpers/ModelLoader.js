class ModelLoader {
  constructor (use, fs, modelDirectory) {
    this.use = use
    this.fs = fs
    this.modelDirectory = modelDirectory
  }

  getFiles () {
    return this.fs
      .readdirSync(this.modelDirectory)
      .filter(file => file !== 'XModel.js')
  }

  getContent (namespace) {
    return this.use(namespace)
  }

  getModel (file) {
    return this.use(`App/Models/${file.replace('.js', '')}`)
  }

  getInstance (Model) {
    return new Model()
  }

  getModelRelationMethods (instance) {
    const properties = new Set()
    let currentObj = instance
    do {
      Object.getOwnPropertyNames(currentObj).map(item => properties.add(item))
    } while ((currentObj = Object.getPrototypeOf(currentObj)))

    const defaultMethods = [
      'constructor',
      '_formatDateFields',
      '_getSetterValue',
      '_getGetterValue',
      '_setCreatedAt',
      '_setUpdatedAt',
      '_syncOriginals',
      '_insert',
      '_update',
      '_convertDatesToMomentInstances',
      'set',
      'toObject',
      'save',
      'delete',
      'newUp',
      'setRelated',
      'getRelated',
      'load',
      'loadMany',
      'hasOne',
      'hasMany',
      'belongsTo',
      'belongsToMany',
      'manyThrough',
      'reload',
      '_instantiate',
      'fill',
      'merge',
      'freeze',
      'unfreeze',
      'toJSON',
      '__defineGetter__',
      '__defineSetter__',
      'hasOwnProperty',
      '__lookupGetter__',
      '__lookupSetter__',
      'isPrototypeOf',
      'propertyIsEnumerable',
      'toString',
      'valueOf',
      'toLocaleString'
    ]

    return [...properties.keys()]
      .filter(item => typeof instance[item] === 'function')
      .filter(item => defaultMethods.indexOf(item) === -1)
  }
}

module.exports = ModelLoader
