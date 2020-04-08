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

  getInstance (file) {
    return this.use(`App/Models/${file.replace('.js', '')}`)
  }
}

module.exports = ModelLoader