const utils = require('../utils')

module.exports = function(RED) {
  function launchApp(config) {
    RED.nodes.createNode(this, config)
    this.save = config.save
    this.saveType = config.saveType
    this.log = config.log
    this.logType = config.logType
    this.capabilitiesType = config.capabilitiesType
    this.capabilities = config.capabilities
    const node = this

    let log = {
      nodeId: node.id,
      name : node.name || node.type.replace('-',' '),
      driverName : node.save,
      driverType : node.saveType,
      log : node.log,
      logType : node.logType,
      logLevel : config.logLevel,
      killSession: config.killSession,
      timestamp: (new Date()).toISOString()
    }

    node.on('input', async (msg) => {
      try {
        utils.clearStatus(node)
        node.capabilities = await utils.getTypeInputValue(RED, node, msg, config.capabilitiesType, config.capabilities)
        log.capabilities = node.capabilities
        log.url = config.providerUri || msg.providerUri || 'http://localhost'
        var options = Object.assign(
          { logLevel: config.logLevel},
          { baseUrl: log.url},
          //await parseUri(config.providerUri || msg.providerUri, node),
          await getCapabilities(node)
        )
        let driver = await utils.newSession(options, node)
        await saveDriver(RED, node, msg, driver)
        log.session = driver
        log.msg = `Created Session - Session Id: ${driver.sessionId}`
        await utils.logNode(RED, node, msg,log)
        utils.successStatus(node,'New session - created')
        node.send(msg)
      } catch (ex) {
        msg.error = ex
        utils.handleError(node,msg)
      }
    })

    node.on('close', async () => {
      try {
        utils.clearStatus(node)
        if (config.killSession) {
          if(config.saveType == 'msg'){
            utils.warningStatus(node, `msg.${config.save} - can not be deleted.`)
          }
          else{
            await utils.deleteSession(RED, node, {})
            utils.successStatus(node, 'Session - deleted on deploy')
          }
        }
      } catch (ex) {
        let msg = {}
        msg.error = ex
        utils.handleError(node,msg)
      }
    })
  }

  RED.nodes.registerType('launch-app', launchApp)
}

const parseUri = async (uri, node) => {
  let uriComponents
  try {
    if (uri[uri.length - 1] !== '/') uri += '/'
    let parsed = uri.match(/(\w+):\/\/(.+):(\d+)(\/.*)/)
    uriComponents = {
      protocol: parsed[1],
      hostname: parsed[2],
      port: parseInt(parsed[3]),
      path: parsed[4]
    }
  } catch (ex) {
    let msg = {}
    msg.error = ex
    await utils.handleError(node,msg)
    //utils.handleError('Invalid URI, expected format "<protocol>://<host>:<port>/<path>', node)
  }

  return uriComponents
}

const getCapabilities =  async (node) => {
  var capabilities = null
  if(node.saveType == 'browser')
    capabilities = { "capabilities": { "browserName":"chrome"}}
  else if (node.saveType == 'desktop')
    capabilities = { "capabilities": { "app":"Root", "platformName":"Windows","deviceName": "windowsPC"}}
  else
    capabilities = node.capabilities

  return capabilities
}

const saveDriver =  async (RED, node, msg, value) => {
  if(node.saveType == 'browser')
    await utils.setTypeInputValue(RED, node, msg, 'global', 'browser', value)
  else if (node.saveType == 'desktop')
    await utils.setTypeInputValue(RED, node, msg, 'global', 'desktop', value)
  else
    await utils.setTypeInputValue(RED, node, msg, node.saveType, node.save, value)
}