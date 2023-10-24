interface intReactions {
    reactType?: String
    trigger: intReactTrigger[]
    emote: String
    modifiers?: intReactTrigger[] //overrides emote if has both trigger.word and modifier.word
}

interface intReactTrigger {
    word: String[]
    caseSensitive: Boolean
    pluralOk: Boolean
    canPossess: Boolean
    overrideEmote?: String
}

export {
    intReactions,
    intReactTrigger
}