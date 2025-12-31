const common = require('../utils')
const utils = require('./utils/element')

module.exports = function(RED) {
  function browserElement(config) {
    RED.nodes.createNode(this, config)
    const node = this
    node.save = config.save
    node.saveType = config.saveType
    node.log = config.log
    node.logType = config.logType
    node.find = config.find
    node.using = config.using
    node.findBy = config.findBy
    node.look = config.look
    node.wait = config.wait
    node.check = config.check
    node.exception = config.exception
    node.action = config.action
    node.captureData = config.captureData
    node.assertionData = config.assertionData
    node.selectors = config.selectors || []

    let log = {
      nodeId: node.id,
      name: node.name || node.type.replace('-', ' '),
      driverName: node.save,
      driverType: node.saveType,
      log: node.log,
      logType: node.logType,
      find : node.find,
      using : node.using,
      findBy : node.findBy,
      look : node.look,
      wait : node.wait,
      check : node.check,
      exception : node.exception,
      action : node.action,
      captureData: node.captureData,
      assertionData: node.assertionData,
      timestamp: (new Date()).toISOString()
    }

    node.on('input', async (msg) => {
      try {
        common.clearStatus(node)
        node.browser = await common.getSession(RED, node, msg)
        node.attr1 = config.param1?await common.getTypeInputValue(RED, node, msg, config.param1Type, config.param1):''
        node.attr2 = config.param2?await common.getTypeInputValue(RED, node, msg, config.param2Type, config.param2):''
        node.attr3 = config.param3?await common.getTypeInputValue(RED, node, msg, config.param3Type, config.param3):''
        node.attr4 = config.param4?await common.getTypeInputValue(RED, node, msg, config.param4Type, config.param4):''
        node.attr5 = config.param5?await common.getTypeInputValue(RED, node, msg, config.param5Type, config.param5):''
        node.attr6 = config.param6?await common.getTypeInputValue(RED, node, msg, config.param6Type, config.param6):''
        node.attr8 = config.param8?await common.getTypeInputValue(RED, node, msg, config.param8Type, config.param8):''
        node.attr9 = config.param9?await common.getTypeInputValue(RED, node, msg, config.param9Type, config.param9):''

        log.sessionId = node.browser.sessionId
        log.attr1 = node.attr1
        log.attr2 = node.attr2
        log.attr3 = node.attr3
        log.attr4 = node.attr4
        log.attr5 = node.attr5
        log.attr6 = node.attr6
        log.attr7 = node.param7
        log.attr8 = node.attr8
        log.attr9 = node.attr9
        const {element, using, value} = await utils.locate(RED, node, msg)
        node.element = element
        log.using = using
        log.value = value
        log.element = node.element
        if(node.wait) log.waitLog = await utils.wait(node)
        let checkResults = await utils.elementCheck(node)
        node.checkLog = checkResults.log
        node.skipRestOfActions = node.attr7
        if(node.check && (!node.param7 || node.param7 == false) && checkResults.check){
          if(node.action) log.actionLog = await utils.action(node)
        }
        else{
          if(node.action) log.actionLog = await utils.action(node)
        }
        log.captureLog = await utils.capture(RED,node,msg)

        log.assertionsLog = node.assertionData.length?await common.assertions(RED, node, msg):[]
        await common.logNode(RED, node, msg, log)
        //Throw exception if there is an fail
        if(log.assertionsLog.length > 0){
          console.log('inside assertion log check')
          let lastAssertion = log.assertionsLog[(log.assertionsLog.length - 1)]
          if(lastAssertion.finalResult == 'FAIL'){
            throw {
              message: `Assertion Failed - ${lastAssertion.assertionName}`
            }
          }
        }
        common.successStatus(node, 'Done')
        node.send(msg)
      } catch (ex) {
        msg.error = ex
        common.handleError(node,msg)
      }
    })
  }
  RED.nodes.registerType('browser-element', browserElement)
}
