// CATBOT REACTS
interface intReactions {
    reactType: String
    trigger: intReactTrigger[]
    emote: String // form of :partying:
    modifiers?: intReactTrigger[] //overrides emote if has both trigger.word and modifier.word
}

interface intReactTrigger {
    word: String[]
    regex?: String // required where inReactTrigger is a modifier
    caseSensitive: Boolean
    pluralOk: Boolean
    canPossess: Boolean
    overrideEmote?: String // form of :partying:
}

interface intReactWords {
    word: string
    regex: RegExp
    type: string
    canPlural: boolean
    canPossess: boolean
    caseSensitive: boolean
}

interface intRegItem {
    word: string
    options: string
}

export {
    intReactions,
    intReactTrigger,
    intReactWords,
    intRegItem,

}