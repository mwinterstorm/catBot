

// General
interface intAction {
    name: string
    triggers: RegExp[]
    effect: string
    modifiers?: intActionModifier[]
}

interface intActionModifier {
    msgContext: {
        msgIncludes?: RegExp[]
        msgExcludes?: RegExp[]
    }
    modName: string
    modData?: any,
    effect: string
}

interface intHelpItem {
    module: string
    desc: string
    triggers?: intHelpTriggerItem[]
}

interface intHelpTriggerItem {
    trigger: string[]
    effect: string
    modifiers?: intHelpTriggerModifierItem[]
}

interface intHelpTriggerModifierItem {
    modIncludes: string[]
    modExcludes: string[]
    modEffect: string
}

export {
    intAction,
    intHelpItem,
    intHelpTriggerItem,
    intHelpTriggerModifierItem,
    
}
