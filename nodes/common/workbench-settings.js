const utils = require('../utils')

module.exports = function(RED) {
    function wbConfig(config) {
      RED.nodes.createNode(this, config)
      this.optionsSelected = config.optionsSelected
      this.options = config.options
      this.pageAction = config.pageAction
      this.log = config.log
      this.logType = config.logType
      const node = this
      
      let log = {
        nodeId: node.id,
        name : node.name || node.type.replace('-',' '),
        log : node.log,
        logType : node.logType,
        pageAction : node.pageAction,
        options: node.options,
        timestamp: (new Date()).toISOString()
      }

      node.on('input', async (msg) => {
        try {
            utils.clearStatus(node)
            let globalCtx = this.context().global
            globalCtx.set('PageOrActionName', node.name)
            globalCtx.set('PageOrAction', node.pageAction || 'page')
            let options = ["AbortOnError","PageHealth","Create","Read","Update","Delete","BusinessRule"]
            options.forEach( option => {
                globalCtx.set(option, false)
                if(node.options.includes(option)){
                    globalCtx.set(option, true)
                    if(option == 'PAGE') globalCtx.set('CountTotalPages', (globalCtx.get('CountTotalPages') || 0) + 1)
                    if(option == 'ACTION') globalCtx.set('CountTotalActions', (globalCtx.get('CountTotalActions') || 0) + 1)
                }
            })
            utils.logNode(RED, node, msg, log)
            utils.successStatus(node, 'Workbench settings - Applied')
            node.send(msg)
        } catch (ex) {
            node.error(ex.message, msg)
        }
      })
    }
    RED.nodes.registerType('workbench-settings', wbConfig)
  }