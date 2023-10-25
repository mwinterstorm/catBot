// CATBOT REACTS
interface intReactions {
    reactType?: String
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

export {
    intReactions,
    intReactTrigger
}