const common = require('../../utils')

var action = async (node) => {
    return new Promise(async (resolve, reject) => {
        try {
            let browser = node.browser
            let log = ''
            if (node.category != 'noAction') {
                switch (node.subCategory) {
                    case "setCookies":
                        await browser.setCookies(node.attr1)
                        log = `Set the cookies with ${node.attr1}`
                        break
                    case "deleteCookies":
                        await browser.deleteCookies(node.attr1)
                        log = `Delete cookies with ${node.attr1}`
                        break
                    case "keys":
                        await browser.keys(node.attr1)
                        log = `Type Keys with ${node.attr1}`
                        break
                    case "execute":
                        await browser.execute(node.attr1)
                        log = `Execute the Javascript ${node.attr1}`
                        break
                    case "navigateTo":
                        await browser.url(node.attr1)
                        log = `Navigate to the URL ${node.attr1}`
                        break
                    case "back":
                        await browser.back()
                        log = `Navigate back`
                        break
                    case "forward":
                        await browser.forward()
                        log = `Navigate forward`
                        break
                    case "refresh":
                        await browser.refresh()
                        log = `Browser refresh/reload`
                        break
                    case "newWindow":
                        await browser.newWindow(node.attr1, node.attr2)
                        log = `Open new window with Url: ${node.attr1} and Options: ${node.attr2}`
                        break
                    case "setWindowSize":
                        await browser.setWindowSize(node.attr1, node.attr2)
                        log = `Set window size with width: ${node.attr1} and height: ${node.attr2}`
                        break
                    case "switchWindow":
                        await browser.switchWindow(node.attr1)
                        log = `Switch to window with string/regex: ${node.attr1}`
                        break
                    case "maximize":
                        await browser.maximizeWindow()
                        log = `Maximize the browser`
                        break
                    case "pause":
                        await browser.pause(node.attr1)
                        log = `Pause for ${node.attr1}`
                        break
                    case "setTimeout":
                        await browser.setTimeout(node.attr1)
                        log = `Set browser timeout : ${node.attr1}`
                        break
                    case "waitUntil":
                        await browser.waitUntil(node.attr1, node.attr2)
                        log = `Wait until : ${node.attr1}`
                        break
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

var capture = async (RED, node, msg) => {
    return new Promise(async (resolve, reject) => {
        try {
            let browser = node.browser
            if (Array.isArray(node.captureData) && node.captureData.length) {
                let data = node.captureData
                let log = []
                for (i = 0; i < data.length; i++) {
                    let temp = {}
                    temp.save = `${data[i].type}.${data[i].value}`
                    switch (data[i].condition) {
                        case 'screenshot':
                            let filePath = await common.getTypeInputValue(RED, node, msg, data[i].type, data[i].value)
                            await browser.saveScreenshot(filePath)
                            temp.condition = `Screen Shot - Save to local`
                            temp.value = filePath
                            break
                        case 'getUrl':
                            let url = await browser.getUrl()
                            await common.setTypeInputValue(RED, node, msg, data[i].type, data[i].value, url)
                            temp.condition = `Get Url`
                            temp.value = url
                            break
                        case 'getWindowSize':
                            let size = await browser.getWindowSize()
                            await common.setTypeInputValue(RED, node, msg, data[i].type, data[i].value, size)
                            temp.condition = `Get Window Size`
                            temp.value = size
                            break
                        case 'getCookies':
                            let cookies = await browser.getCookies()
                            await common.setTypeInputValue(RED, node, msg, data[i].type, data[i].value, cookies)
                            temp.condition = `Get Cookies`
                            temp.value = cookies
                            break
                        case 'getTitle':
                            let title = await browser.getTitle()
                            await common.setTypeInputValue(RED, node, msg, data[i].type, data[i].value, title)
                            temp.condition = `Get Title`
                            temp.value = title
                            break
                        case 'pageSource':
                            let html = await browser.getPageSource()
                            await common.setTypeInputValue(RED, node, msg, data[i].type, data[i].value, html)
                            temp.condition = `Page Source`
                            temp.value = html
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
    action,
    capture
}