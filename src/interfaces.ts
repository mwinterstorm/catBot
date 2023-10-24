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

// CATBOT RESPONDS
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


// NIGHTSCOUT
interface intSugar {
    _id: String
    device: String
    date: number
    dateString: String
    sgv: number
    delta: number
    direction: String
    type: String
    filtered: number
    unfiltered: number
    rssi: number
    noise: number
    sysTime: String
    utcOffset: number
    mills: number
}

export {
    intReactions,
    intReactTrigger,
    intResponse,
    intResponseTrigger,
    intSugar,
}