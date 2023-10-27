import fs from 'fs'
import * as int from './interfaces'
import { sendMsg } from './matrix'
import reg from 'regex-to-strings'
import addStats from './modules/stats'

export async function checkActionWords(actions: int.intAction[], message: string) {
    const help = /\bhelp\b/gi
    for (let i = 0; i < actions.length; i++) {
        for (let t = 0; t < actions[i].triggers.length; t++) {
            const action = actions[i]
            const trigger = action.triggers[t]
            if (trigger.test(message)) {
                if (action.modifiers && action.modifiers.length > 0) {
                    let activeModifiers: intActiveMod[] = []
                    for (let m = 0; m < action.modifiers.length; m++) {
                        const mod = action.modifiers[m]
                        if (mod.msgContext.msgIncludes && mod.msgContext.msgExcludes) {
                            let modtriggered: boolean = false
                            let incTrigger: boolean = false
                            let exTrigger: boolean = true
                            let modTrigger: string = ''
                            for (let n = 0; n < mod.msgContext.msgIncludes.length; n++) {
                                if (mod.msgContext.msgIncludes[n].test(message)) {
                                    incTrigger = true
                                    modTrigger = reg.expandN(mod.msgContext.msgIncludes[n],1).toString().toLowerCase()
                                }
                            }
                            for (let n = 0; n < mod.msgContext.msgExcludes.length; n++) {
                                if (mod.msgContext.msgExcludes[n].test(message)) {
                                    exTrigger = false
                                }
                            }
                            if (mod.msgContext.requiresBothIncludeAndExclude && incTrigger && exTrigger) {
                                modtriggered = true
                            } else if (!mod.msgContext.requiresBothIncludeAndExclude && incTrigger) {
                                modtriggered = true
                            } else if (!mod.msgContext.requiresBothIncludeAndExclude && exTrigger) { 
                                modtriggered = true
                            }
                            if (modtriggered) {
                                const activeMod: intActiveMod = {
                                        name: mod.modName,
                                        data: [mod.modData, modTrigger] || undefined,
                                }
                                activeModifiers.push(activeMod)
                            }
                        } else if (mod.msgContext.msgIncludes) {
                            for (let n = 0; n < mod.msgContext.msgIncludes.length; n++) {
                                if (mod.msgContext.msgIncludes[n].test(message)) {
                                    const activeMod: intActiveMod = {
                                        name: mod.modName,
                                        data: [mod.modData, reg.expandN(mod.msgContext.msgIncludes[n],1).toString().toLowerCase()] || undefined,
                                }
                                activeModifiers.push(activeMod)
                                }
                            }
                        } else if (mod.msgContext.msgExcludes) {
                            for (let n = 0; n < mod.msgContext.msgExcludes.length; n++) {
                                let modtriggered = true
                                if (mod.msgContext.msgExcludes[n].test(message)) {
                                    modtriggered = false
                                }
                                if (modtriggered) {
                                    const activeMod: intActiveMod = {
                                        name: mod.modName,
                                        data: [mod.modData, reg.expandN(mod.msgContext.msgExcludes[n],1).toString().toLowerCase()] || undefined,
                                }
                                activeModifiers.push(activeMod)
                                }
                            }
                        }
                    }
                    const name = action.name
                    const response: response = {
                        active: true,
                        action: name,
                        trigger: action,
                        modifiers: activeModifiers
                    }
                    return response
                }
                const name = action.name
                const response: response = {
                    active: true,
                    action: name,
                    trigger: action
                }
                return response
            } else if (help.test(message)) {
                const response: response = {
                    active: true,
                    action: 'help',
                    actions: actions
                }
                return response
            }
        }
    }
    return {
        active: false,
        action: 'none',
        actions: actions
    }
}

export async function getAbout() {
    const file = JSON.parse(fs.readFileSync('package.json', { encoding: 'utf-8' }))
    const name = file.name;
    const version = file.version;
    const description = file.description;
    const author = file.author;
    const license = file.license;
    const response = {
        name: name,
        version: version,
        description: description,
        author: author,
        license: license,
    }
    return response
}

// global variables for constructing help message

let received: number
let help: int.intHelpItem[]
async function helpMsg(roomId: string, helpItem: int.intHelpItem) {
    let wait = 2 //increase for each time that this function is called, or add a conditional like below if not guaranteed will be called
    if (process.env.NIGHTSCOUT) {
        wait++
    }
    if (received == undefined) {
        received = 1
    } else {
        received++
    }

    if (help === undefined) {
        help = []
    }
    help.push(helpItem)

    if (received >= wait) {
        help.sort(function(a, b) {
            if (a.module < b.module) {
                return -1
            }
            if (a.module > b.module) {
                return 1
            }
            return 0
        })
        let helpArr = []
        helpArr.push('<body><h2><b>MEOW! CatBot Kitty Helps You!</b></h2><ul>')
        for (let i = 0; i < help.length; i++) {
            let trigArr = []
            if (help[i].triggers) {
                const trig = help[i].triggers
                if (trig && trig.length > 0) {
                    for (let j = 0; j < trig.length; j++) {
                        let trigWords = []
                        for (let t = 0; t < trig[j].trigger.length; t++) {
                            trigWords.push(' ' + trig[j].trigger[t])
                        }
                        const trigWordsString = trigWords.join()
                        let trigItem = '<li>' + '<b>' + trigWordsString + '</b>' + ': ' + trig[j].effect + '</li>'
                        trigArr.push(trigItem)
                    }
                }
            }
            const triggers = trigArr.join('')

            let item = '' + '<h4>' + help[i].module + '</h4>' + '<em>' + help[i].desc + '</em><br><ul>' + triggers + '</ul>'
            helpArr.push(item)
        }
        helpArr.push('</ul></body>')
        const helpHtml = helpArr.join('')
        // construct message for matrix
        sendMsg(roomId, helpHtml,null,'<head><meta name="viewport" content="width=device-width></head>"','help')
        received = 0
        help = []
        addStats('msgAction', roomId, 'help')
        addStats('totalActivity',roomId,'adminFunctions','kittyHelped')
    }
    return
}

export async function helpConstructor(roomId: string, actions: int.intAction[], moduleName: string, moduleDesc: string ) {
    addStats('totalProcessedMsgs', roomId, 'help')
    let help: int.intHelpItem = {module: moduleName, desc: moduleDesc}
    for (let i = 0; i < actions.length; i++) {
        let triggerWords = []
        for (let w = 0; w < actions[i].triggers.length; w++) {
            triggerWords.push(' ' + reg.expandN(actions[i].triggers[w],1).toString().toLocaleLowerCase('en-NZ'))
        }
        let item: int.intHelpTriggerItem = {
            trigger: triggerWords,
            effect: actions[i].effect
        }
        if (actions[i].modifiers) {
            const mod = actions[i].modifiers
            let modItems: int.intHelpTriggerModifierItem[] = []
            if (mod && mod.length > 0) {
                let incWords: string[] = []
                let exWords: string[] = []
                for (let m = 0; m < mod?.length; m++) {
                    if (mod[m].msgContext.msgIncludes) {
                        const incW = mod[m].msgContext.msgIncludes
                        if (incW && incW?.length > 0) {
                            for (let j = 0; j < incW.length; j++) {
                                incWords.push(' ' + reg.expandN(incW[j],1).toString().toLowerCase())
                            }
                        }
                    }
                    if (mod[m].msgContext.msgExcludes) {
                        const exW = mod[m].msgContext.msgExcludes
                        if (exW && exW?.length > 0) {
                            for (let j = 0; j < exW.length; j++) {
                                exWords.push(' ' + reg.expandN(exW[j],1).toString().toLowerCase())
                            }
                        }
                    }
                    let modItem: int.intHelpTriggerModifierItem = {
                        modIncludes: incWords,
                        modExcludes: exWords,
                        modEffect: mod[m].effect
                    }
                    modItems.push(modItem)
                }
            }
            if (!item.modifiers) {
                item.modifiers = []
            }
            item.modifiers = modItems
        }
        if (!help.triggers) {
            help.triggers = []
        }
        help.triggers.push(item)
    }
    helpMsg(roomId, help)
    return
}

export default {
    checkActionWords,
    getAbout,
    helpMsg,
}

interface response {
    active: boolean
    action: string
    trigger?: int.intAction
    actions?: int.intAction[]
    modifiers?: intActiveMod[]
}

interface intActiveMod {
    name?: string
    data?: any
}