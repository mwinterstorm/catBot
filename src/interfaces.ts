// Actions
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
        requiresBothIncludeAndExclude?: boolean
    }
    modName: string
    modData?: any,
    effect: string
}

// Help
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

type Nullable<T> = T | null

//Export
export {
    intAction,
    intHelpItem,
    intHelpTriggerItem,
    intHelpTriggerModifierItem,
    Nullable,
}
