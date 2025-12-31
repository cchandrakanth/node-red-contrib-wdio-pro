const common = require('../../utils')

var getLocater = async (using, value) => {
    var locator = ''
    switch (using) {
        case 'id':
            locator = `#${value}`
            break
        case 'name':
            locator = `[name='${value}']`
            break
        case 'className':
            locator = `.${value}`
            break
        case 'tagName':
            locator = value
            break
        case 'cssSelector':
            locator = value
            break
        case 'text':
            locator = `=${value}`
            break
        case 'partialText':
            locator = `*=${value}`
            break
        case 'xPath':
            locator = value
            break
        default:
            locator = value
    }
    return locator
}

var searchElement = async (node, element) => {
    return new Promise(async (resolve, reject) => {
        try {
            var temp_element = null
            var repeat = parseInt(node.attr3) || 1
            for (i = 0; i < repeat; i++) {
                if (node.look == 'parent') {
                    temp_element = await element.parentElement()
                }
                else if (node.look == 'next') {
                    temp_element = await element.nextElement()
                }
                else {
                    temp_element =  await element.previousElement()
                }
                element = temp_element
            }
            resolve(element)
        }
        catch (ex) {
            reject(ex)
        }
    })
}

var locate = async (RED, node, msg) => {
    return new Promise(async (resolve, reject) => {
        try {
            let browser = node.browser
            var element = null
            let using = node.using
            let value = node.attr1
            if (node.find == 'multiple') {
                var selectors = node.selectors || []
                for (i = 0; i < selectors.length; i++) {
                    using = selectors[i].using
                    value = selectors[i].value
                    element = await browser.$(await getLocater(using, value))
                    if(element.elementId) break
                }
                if(!element.elementId){
                    var ex = {}
                    ex.message = 'Element not found with given multiple selectors'
                    reject(ex)
                }
            }
            else if (node.find == 'findElement') {
                if (!node.look) {
                    element = await browser.$(await getLocater(using, value))
                }
                else {
                    let tempElement = await browser.$(await getLocater(using, value))
                    element = await searchElement(node, tempElement)
                }
            }
            else if (node.find == 'findElements') {
                var elements = await browser.$$(await getLocater(using, value))
                var curr_element = null
                await common.setTypeInputValue(RED, node, msg, 'msg', 'getElements', elements)
                if (node.findBy == 'nth') {
                    curr_element = elements[parseInt(node.attr2) - 1]
                }
                else if (node.findBy == 'attr') {
                    let attribute = node.attr2.split('=')[0]
                    let attrValue = node.attr2.split('=')[1]
                    curr_element = elements.filter(async item => await item.getAttribute(attribute) == attrValue)[0]
                }
                else if (node.findBy == 'val') {
                    curr_element = elements.filter(async item => await item.getValue() == node.attr2)[0]                    
                }
                else if(node.findBy == 'text') {
                    curr_element = elements.filter(async item => await item.getText() == node.attr2)[0]
                }
                else{
                    curr_element = elements[0]
                }

                if (!node.look) {
                    element = curr_element
                }
                else {
                    element = await searchElement(node, curr_element)
                }
            }
            else {
                if (!node.look) {
                    element = node.attr1
                }
                else {
                    element = await searchElement(node, node.attr1)
                }
            }
            await common.setTypeInputValue(RED, node, msg, 'msg', 'getElement', element)
            resolve({element, using, value})
        }
        catch (ex) {
            reject(ex)
        }
    })
}

var wait = async (node) => {
    return new Promise(async (resolve, reject) => {
        try {
            var element = node.element
            let log = ''
            if (node.wait == 'waitClickable') {
                await element.waitForClickable(node.attr4)
                log = `Wait for the element to be clickable. Wait ${JSON.stringify(node.attr4, null, 2)}`
            }
            else if (node.wait == 'waitDisplayed') {
                await element.waitForDisplayed(node.attr4)
                log = `Wait for the element to be displayed. Wait ${JSON.stringify(node.attr4, null, 2)}`
            }
            else if (node.wait == 'waitEnabled') {
                await element.waitForEnabled(node.attr4)
                log = `Wait for the element to be enabled. Wait ${JSON.stringify(node.attr4, null, 2)}`
            }
            else if (node.wait == 'waitForExist') {
                await element.waitForExist(node.attr4)
                log = `Wait for the element to be exist. Wait ${JSON.stringify(node.attr4, null, 2)}`
            }
            else {
                await element.waitUntil(node.attr4, node.attr5)
                log = `Wait for the element - function. wait ${node.attr4} - function`
            }
            resolve(log)
        }
        catch (ex) {
            reject(ex)
        }
    })
}

var elementCheck = async (node) => {
    return new Promise(async (resolve, reject) => {
        try {
            let check = true
            let element = node.element
            let log = ''
            if (node.check == 'isClickable') {
                check = await element.isClickable()
                log = `Check for element clickable: ${check}`
            }
            else if (node.check == 'isDisplayed') {
                check = await element.isDisplayed()
                log = `Check for element clickable: ${check}`
            }
            else if (node.check == 'isDisplayedInViewport') {
                check = await element.isDisplayedInViewport()
                log = `Check for element clickable: ${check}`
            }
            else if (node.check == 'isEnabled') {
                check = await element.isEnabled()
                log = `Check for element clickable: ${check}`
            }
            else if (node.check == 'isExisting') {
                check = await element.isExisting()
                log = `Check for element clickable: ${check}`
            }
            else if (node.check == 'isFocused') {
                check = await element.isFocused()
                log = `Check for element clickable: ${check}`
            }
            else if (node.check == 'isSelected') {
                check = await element.isSelected()
                log = `Check for element clickable: ${check}`
            }
            else {
                check = await element.isEqual(node.attr6)
                log = `Check for element clickable: ${check}`
            }
            resolve({log, check})
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
            let browser = node.browser
            let log = ''
            if (node.action == 'addValue') {
                node.attr9 ? await element.addValue(node.attr8, node.attr9) : await element.addValue(node.attr8)
                log = `Added value to the current element value. Value: ${node.attr8 + node.attr9? ', Options : '+ JSON.stringify(node.attr9, null, 2) : null}`
            }
            else if (node.action == 'clearValue') {
                await element.clearValue()
                log = `Clear value of the element`
            }
            else if (node.action == 'click') {
                node.param8 ? await element.click(node.param8) : await element.click()
                log = `Click on the element`
            }
            else if (node.action == 'doubleClick') {
                await element.doubleClick()
                log = `Double Click on the element`
            }
            else if (node.action == 'dragAndDrop') {
                node.attr9 ? await element.dragAndDrop(node.attr8, node.attr9) : await element.dragAndDrop(node.attr8)
                log = `Drag and drop to element ${node.attr8 + node.attr9? ', Options : '+ JSON.stringify(node.attr9, null, 2) : null}`
            }
            else if (node.action == 'uploadFile') {
                let path = await browser.uploadFile(node.attr8)
                await element.setValue(path)
                log = `Uploaded file from ${path} to element`
            }
            else if (node.action == 'moveTo') {
                node.attr8 ? await element.moveTo(node.attr8) : await element.moveTo()
                log = `${node.attr8? 'Hover on element to '+ node.attr8: 'Hover on element'}`
            }
            else if (node.action == 'selectByAttribute') {
                await element.selectByAttribute(node.attr8, node.attr9)
                log = `Select the dropdown using attribute: ${node.attr8} and value: ${node.attr9}`
            }
            else if (node.action == 'selectByIndex') {
                await element.selectByIndex(node.attr8)
                log = `Select the dropdown using index: ${node.attr8}`
            }
            else if (node.action == 'selectByVisibleText') {
                await element.selectByVisibleText(node.attr8)
                log = `Select the dropdown using Visual Text: ${node.attr8}`
            }
            else if (node.action == 'setValue') {
                node.attr9 ? await element.setValue(node.attr8, node.attr9) : await element.setValue(node.attr8)
                log = `Set value to the current element value. Value: ${node.attr8 + node.attr9? ', Options : '+ JSON.stringify(node.attr9, null, 2) : null}`
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
            var element = node.element
            if (Array.isArray(node.captureData) && node.captureData.length) {
                let data = node.captureData
                let log = []
                for (i = 0; i < data.length; i++) {
                    temp = {}
                    temp.save = `${data[i].prop1Type}.${data[i].prop1}`
                    switch (data[i].condition) {
                        case 'getAttribute':
                            let attr = await common.getTypeInputValue(RED, node, msg, data[i].prop2Type, data[i].prop2)
                            let attrValue = await element.getAttribute(attr)
                            await common.setTypeInputValue(RED, node, msg, data[i].prop1Type, data[i].prop1, attrValue)
                            temp.condition = `Get Attribute`
                            temp.value = attrValue
                            break
                        case 'getCSSProperty':
                            let prop = await common.getTypeInputValue(RED, node, msg, data[i].prop2Type, data[i].prop2)
                            let propValue = await element.getCSSProperty(prop)
                            await common.setTypeInputValue(RED, node, msg, data[i].prop1Type, data[i].prop1, propValue)
                            temp.condition = `Get CSS Property value`
                            temp.value = propValue
                            break
                        case 'getHTML':
                            let html = data[i].prop2? await common.getTypeInputValue(RED, node, msg, data[i].prop2Type, data[i].prop2):''
                            let htmlValue = html? await element.getHTML(html): await element.getHTML()
                            await common.setTypeInputValue(RED, node, msg, data[i].prop1Type, data[i].prop1, htmlValue)
                            temp.condition = `Get HTML`
                            temp.value = htmlValue
                            break
                        case 'getLocation':
                            let location = data[i].prop2? await common.getTypeInputValue(RED, node, msg, data[i].prop2Type, data[i].prop2):''
                            let locationValue = location? await element.getLocation(location): await element.getLocation()
                            await common.setTypeInputValue(RED, node, msg, data[i].prop1Type, data[i].prop1, locationValue)
                            temp.condition = `Get Location`
                            temp.value = locationValue
                            break
                        case 'getProperty':
                            let property = await common.getTypeInputValue(RED, node, msg, data[i].prop2Type, data[i].prop2)
                            let propertyValue = await element.getProperty(property)
                            await common.setTypeInputValue(RED, node, msg, data[i].prop1Type, data[i].prop1, propertyValue)
                            temp.condition = `Get Property`
                            temp.value = propertyValue
                            break
                        case 'getSize':
                            let size = data[i].prop2? await common.getTypeInputValue(RED, node, msg, data[i].prop2Type, data[i].prop2):''
                            let sizeValue = size? await element.getSize(size): await element.getSize()
                            await common.setTypeInputValue(RED, node, msg, data[i].prop1Type, data[i].prop1, sizeValue)
                            temp.condition = `Get Size`
                            temp.value = sizeValue
                            break
                        case 'getTagName':
                            let tag =  await element.getTagName()
                            await common.setTypeInputValue(RED, node, msg, data[i].prop1Type, data[i].prop1, tag)
                            temp.condition = `Get Tag Name`
                            temp.value = tag
                            break
                        case 'getText':
                            let text =  await element.getText()
                            await common.setTypeInputValue(RED, node, msg, data[i].prop1Type, data[i].prop1, text)
                            temp.condition = `Get Text`
                            temp.value = text
                            break
                        case 'getValue':
                            let value =  await element.getValue()
                            await common.setTypeInputValue(RED, node, msg, data[i].prop1Type, data[i].prop1, value)
                            temp.condition = `Get Value`
                            temp.value = value
                            break
                        case 'saveScreenshot':
                            let filePath = await common.getTypeInputValue(RED, node, msg, data[i].prop1Type, data[i].prop1)
                            await element.saveScreenshot(filePath)
                            temp.condition = `Get Element Screenshot`
                            temp.value = filePath
                            break
                        case 'getElement':
                            await common.setTypeInputValue(RED, node, msg, data[i].prop1Type, data[i].prop1, msg.getElement)
                            temp.condition = `Get Element`
                            break
                        case 'getElements':
                            await common.setTypeInputValue(RED, node, msg, data[i].prop1Type, data[i].prop1, msg.getElements)
                            temp.condition = `Get Elements`
                            break

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

module.exports = {
    locate,
    wait,
    elementCheck,
    action,
    capture
}