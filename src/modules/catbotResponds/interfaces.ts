interface intResponse {
    responseType?: String
    trigger: intResponseTrigger[]
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
    intResponse,
    intResponseTrigger
}