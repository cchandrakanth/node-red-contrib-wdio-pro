const common = require('../../utils')
var fs = require('fs')

var locate = async (node) => {
    return new Promise(async (resolve, reject) => {
        try {
            let driver = node.driver
            var element = await driver.findElement(node.using, node.attr1)
            resolve(element.ELEMENT)
        }
        catch (ex) {
            reject(ex)
        }
    })
}


var action = async (node) => {
    return new Promise(async (resolve, reject) => {
        try {
            let element = node.element
            let driver = node.driver
            let log = ''
            if (node.action == 'click') {
                await driver.elementClick(element)
                log = `Click on Element: ${element.elementId}`
            }
            else if (node.action == 'doubleClick') {
                await driver.moveToElement(element)
                await driver.positionDoubleClick()
                log = `Double Click on Element: ${element.elementId}`
            }
            else if (node.action == 'sendKeys') {
                await driver.elementSendKeys(element, node.attr2)
                log = `Enter value to Element: ${element.elementId}, Value: ${node.attr2}`
            }

            resolve(log)
        }
        catch (ex) {
            reject(ex)
        }
    })
}

//Add capture method
var capture = async (RED, node, msg) => {
    return new Promise(async (resolve, reject) => {
        try {
            let driver = node.driver
            let element = node.element
            let log = []
            if (Array.isArray(node.captureData) && node.captureData.length) {
                let data = node.captureData
                for (i = 0; i < data.length; i++) {
                    let temp = {}
                    temp.save = `${data[i].prop1Type}.${data[i].prop1}`
                    switch (data[i].condition) {
                        case 'screenshot':
                            let image = await driver.takeScreenshot()
                            let filePath = await common.getTypeInputValue(RED, node, msg, data[i].prop1Type, data[i].prop1)
                            let imageBuffer = Buffer.from(image, "base64");
                            fs.writeFileSync(filePath, imageBuffer);
                            temp.condition = `Screenshot`
                            temp.value = attrValue
                            break
                        case 'getWindowSize':
                            let size = await driver._getWindowSize()
                            await common.setTypeInputValue(RED, node, msg, data[i].prop1Type, data[i].prop1, size)
                            temp.condition = `Get Window Size`
                            temp.value = size
                            break

                    }
                    log.push(temp)
                }
                resolve(log)
            }
            else {
                resolve('done')
            }
        }
        catch (ex) {
            reject(ex)
        }
    })
}

module.exports = {
    locate,
    action,
    capture
}