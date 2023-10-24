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
    intSugar,
}