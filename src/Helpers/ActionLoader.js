class ActionLoader {
  constructor (use, fs, actionDirectory) {
    this.use = use
    this.fs = fs
    this.actionDirectory = actionDirectory
    this.actions = this.getFiles()
  }

  getFiles () {
    return this.fs
      .readdirSync(this.actionDirectory)
      .map(file => {
        return {
          file,
          model: file.replace('Actions.js', '')
        }
      })
  }

  getInstance (file) {
    return this.use(`App/Actions/${file.replace('.js', '')}`)
  }
}

module.exports = ActionLoader
