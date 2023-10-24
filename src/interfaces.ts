interface intReactions {
    reactType?: String
    trigger: intReactTrigger[]
    emote: String
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