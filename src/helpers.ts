import fs from 'fs'
import * as int from './interfaces'

export async function checkActionWords(actions: int.intAction[], message: string) {
    const help = /\bhelp\b/gi
    for (let i = 0; i < actions.length; i++) {
        for (let t = 0; t < actions[i].triggers.length; t++) {
            const action = actions[i]
            const trigger = action.triggers[t]
            if (trigger.test(message)) {
                if (action.modifiers && action.modifiers.length > 0) {
                    for (let m = 0; m < action.modifiers.length; m++) {
                        const mod = action.modifiers[m]
                        if (mod.msgContext.msgIncludes && mod.msgContext.msgExcludes) {
                            let modtriggered = false
                            for (let n = 0; n < mod.msgContext.msgIncludes.length; n ++) {
                                if (mod.msgContext.msgIncludes[n].test(message)) {
                                    modtriggered = true
                                }
                            }
                            for (let n = 0; n < mod.msgContext.msgExcludes.length; n ++) {
                                if (mod.msgContext.msgExcludes[n].test(message)) {
                                    modtriggered = false
                                }
                            }
                            if (modtriggered) {
                                const name = action.name
                                const response: response = {
                                    active: true,
                                    action: name,
                                    trigger: action,
                                    modifier: {
                                        name: mod.modName,
                                        data: mod.modData || undefined
                                    }
                                }
                                return response
                            }
                        } else if (mod.msgContext.msgIncludes) {

                        } else if (mod.msgContext.msgExcludes) {

                        }
                    }
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

export default {
    checkActionWords,
    getAbout,
}

interface response {
    active: boolean
    action: string
    trigger?: int.intAction
    actions?: int.intAction[]
    modifier?: {
        name?: string
        data?: any
    }
}