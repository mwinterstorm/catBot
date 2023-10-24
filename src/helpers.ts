import { expandN } from "regex-to-strings"
import fs from 'fs'

async function checkActionWords(actions: RegExp[], message: string) {

    const help = /\bhelp\b/gi
    for (let i = 0; i < actions.length; i++) {
        if (actions[i].test(message)) {
            const action = expandN(actions[i],1)
            const response: response = {
                active: true,
                action: action[0].toLowerCase(),
                actions: actions
            }
            return response
        } else if (help.test(message)) {
            const action = expandN(actions[i],1)
            const response: response = {
                active: true,
                action: action[0].toLowerCase(),
                actions: actions
            }
            return response
        }
    }
    return {
        active: false,
        action: 'none',
        actions: actions
    }
}

async function getAbout() {
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
    actions: RegExp[]
}