

// General
interface intAction {
    name: string
    triggers: RegExp[]
    modifiers?: intActionModifier[]
}

interface intActionModifier {
    msgContext: {
        msgIncludes?: RegExp[]
        msgExcludes?: RegExp[]
    }
    modName: string
    modData?: any
}

export {
    intAction,
}