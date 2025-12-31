const wdio = require('webdriverio');
const assert = require('./assertions.js');

const clearStatus = async (node) => {
  node.status({})
}

const successStatus = async (node, message) => {
  node.status({
    fill: 'green',
    shape: 'dot',
    text: message
  })
}

const infoStatus = async (node, message) => {
  node.status({
    fill: 'blue',
    shape: 'ring',
    text: message
  })
}

const warningStatus = async (node, message) => {
  node.status({
    fill: 'yellow',
    shape: 'dot',
    text: message
  })
}

const errorStatus = async (node, message) => {
  node.status({
    fill: 'red',
    shape: 'dot',
    text: message
  })
}

const handleError = async (node, msg) => {
  errorStatus(node, msg.error.message)
  node.error(msg.error.message, msg)
}

const newSession = async (options) => {
  return new Promise(async (resolve, reject) => {
    try {
      let driver = await wdio.remote(options)
      resolve(driver)
    }
    catch (ex) {
      reject(ex)
    }
  })
}

const getSession = async (RED, node, msg) => {
  return new Promise(async (resolve, reject) => {
    try {
      var driver
      if (node.saveType == 'browser')
        driver = await getTypeInputValue(RED, node, msg, 'global', 'browser')
      else if (node.saveType == 'desktop')
        driver = await getTypeInputValue(RED, node, msg, 'global', 'desktop')
      else
        driver = await getTypeInputValue(RED, node, msg, node.saveType, node.save)
      resolve(driver)
    }
    catch (ex) {
      reject(ex)
    }
  })
}

const deleteSession = async (RED, node, msg) => {
  return new Promise(async (resolve, reject) => {
    try {
      let driver = await getSession(RED, node, msg)

      if (driver) {
        if (node.saveType == 'browser')
          await setTypeInputValue(RED, node, msg, 'global', 'browser', undefined)
        else if (node.saveType == 'desktop')
          await setTypeInputValue(RED, node, msg, 'global', 'desktop', undefined)
        else
          await setTypeInputValue(RED, node, msg, node.saveType, node.save, undefined)
        
        await driver.deleteSession()    
        resolve(driver.sessionId)
      }
      else {
        var ex = {}
        ex.message = 'Driver not existed'
        reject(ex)
      }
    }
    catch (ex) {
      reject(ex)
    }
  })
}

const getElementId = async (browser, using, value) => {
  let elementId
  try {
    const element = await browser.findElement(using, value)
    if (element && Object.keys(element)) {
      elementId = element[Object.keys(element)[0]]
    } else {
      let e
      if (element && element.message) {
        e = element.message
      } else {
        e = 'Element not found'
      }
      throw new Error(e)
    }
  } catch (e) {
    throw e
  }
  return elementId
}


// const initializeLog = async (node) => {
//   return new Promise(async (resolve, reject) => {
//     var context = node.context()
//   })
// }

// const endLog = async (node) => {
//   return new Promise(async (resolve, reject) => {
//     var context = node.context()
//   })  
// }

// const enterLog = async (node, message) => {
//   return new Promise(async (resolve, reject) => {
//     var context = node.context()
//   })
// }

// const saveLog = async (node, msg) => {
//   return new Promise(async (resolve, reject) => {
//     var context = node.context()
//   })
// }

const getTypeInputValue = async (RED, node, msg, type, value) => {
  return new Promise((resolve, reject) => {
    try {
      var r = ''
      var context = node.context();
      switch (type) {
        case 'msg':
          r = RED.util.getMessageProperty(msg, value)
          break
        case 'flow':
          r = context.flow.get(value)
          break
        case 'global':
          r = context.global.get(value)
          break
        case 'str':
          try {
            r = unescape(JSON.parse('"' + value + '"'))
          } catch (e) {
            r = value
          }
          break
        case 'num':
          r = parseFloat(value)
          break
        case 'json':
          if (value !== '') {
            r = JSON.parse(value)
          } else {
            r = undefined
          }
          break
        case 'env':
          r = process.env[value]
          break
        default:
          r = undefined
      }
      resolve(r)
    }
    catch (ex) {
      reject(ex)
    }
  })
}

const setTypeInputValue = async (RED, node, msg, type, prop, value) => {
  return new Promise((resolve, reject) => {
    try {
      var context = node.context();
      switch (type) {
        case 'msg':
          RED.util.setMessageProperty(msg, prop, value, true)
          break
        case 'flow':
          context.flow.set(prop, value)
          break
        case 'global':
          context.global.set(prop, value)
          break
        case 'env':
          process.env[prop] = value
          break
        default:
          RED.util.setMessageProperty(msg, prop, value, true)
      }
      resolve('done')
    }
    catch (ex) {
      reject(ex)
    }
  })
}

const assertions = async (RED, node, msg) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (Array.isArray(node.captureData) && node.captureData.length) {
        let data = node.assertionData
        let log = []
        for (i = 0; i < data.length; i++) {
          let temp = {
            assertionName: data[i].assertionName,
          }
          temp.expected = await getTypeInputValue(RED, node, msg, data[i].expectedType, data[i].expectedValue)
          temp.actual = await getTypeInputValue(RED, node, msg, data[i].actualType, data[i].actualValue)
          switch (data[i].condition) {
            case 'equal':
              temp.result = await assert.equal(temp.expected, temp.actual)
              break
            case 'notEqual':
              temp.result = await assert.notEqual(temp.expected, temp.actual)
              break
            case 'greater':
              temp.result = await assert.greaterThan(temp.expected, temp.actual)
              break
            case 'greaterEqual':
              temp.result = await assert.greaterThanEqual(temp.expected, temp.actual)
              break
            case 'less':
              temp.result = await assert.lessThan(temp.expected, temp.actual)
              break
            case 'lessEqual':
              temp.result = await assert.lessThanEqual(temp.expected, temp.actual)
              break
            case 'contains':
              temp.result = await assert.contains(temp.expected, temp.actual)
              break
            case 'notContains':
              temp.result = await assert.notContains(temp.expected, temp.actual)
              break
          }

          if(!temp.result && data[i].skipOnFail == 'no'){
            temp.finalResult = 'FAIL'
            temp.message = `Assertion Failed - ${temp.assertionName}`
            log.push(temp)
            break
          }

          if(!temp.result && data[i].skipOnFail == 'yes'){
            temp.finalResult = 'FAIL - SKIPPED'
            temp.message = `Assertion Failed - ${temp.assertionName}`
          }
          else{
            temp.finalResult = 'PASS'
          }

          log.push(temp)
        }
        resolve(log)
      }
      else{
        resolve('done')
      }
    }
    catch (ex) {
      reject(ex)
    }
  })
}

const logNode = async (RED, node, msg,log) => {
  return new Promise( async (resolve, reject) => {
    try{
      let logs = await getTypeInputValue(RED, node, msg, node.logType, node.log) || []
      logs.push(log)
      await setTypeInputValue(RED, node, msg, node.logType, node.log, logs)
      resolve('done')
    }
    catch(ex){
      reject(ex)
    }
  })
}

module.exports = {
  clearStatus,
  successStatus,
  infoStatus,
  warningStatus,
  handleError,
  newSession,
  getSession,
  deleteSession,
  getTypeInputValue,
  setTypeInputValue,
  assertions,
  logNode
}