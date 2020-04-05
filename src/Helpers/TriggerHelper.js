const { pascalCase } = use('change-case')

class TriggerHelper {
  constructor () {
    this.map = {}
    this.form = null
  }

  async fire (when, model, trigger, data) {
    const definitions = this.map[model]
    if (!definitions) {
      return
    }

    const calls = definitions.filter(definition => definition.when === when && definition.trigger === trigger)
    for (const call of calls) {
      const TriggerFile = use(call.class)
      const instance = new TriggerFile()
      if (typeof instance[call.method] !== 'function') {
        throw new Error(`There is not any ${call.method}() in ${call.class}`)
      }
      await instance[call.method](data)
    }
  }

  call (name) {
    this.form = {
      name,
      model: null,
      actions: []
    }
    return this
  }

  before (action) {
    this.form.actions.push({
      when: 'onBefore',
      action
    })
    return this
  }

  after (action) {
    this.form.actions.push({
      when: 'onAfter',
      action
    })
    return this
  }

  onModel (model) {
    this.form.model = model
    this._add()
    this.form = null
  }

  _add () {
    if (this.map[this.form.model] === undefined) {
      this.map[this.form.model] = []
    }

    const actions = this.form.actions.map(action => {
      return {
        when: action.when,
        trigger: action.action,
        method: `${action.when}${pascalCase(action.action)}`,
        class: this.form.name
      }
    })
    this.map[this.form.model].push(...actions)
  }
}

module.exports = TriggerHelper
