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

interface intResponse {
    responseType?: String
    trigger: intReactTrigger[]
    isReply: Boolean
    response?: String 
    modifiers?: intResponseTrigger[] //overrides emote if has both trigger.word and modifier.word
}

interface intResponseTrigger {
    word: String[]
    caseSensitive: Boolean
    overrideResponse?: String 
}

export {
    intReactions,
    intReactTrigger,
    intResponse,
    intResponseTrigger,
}