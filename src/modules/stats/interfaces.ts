import { RegexOptions } from "mongoose"

interface intStats {
    statsSince: Date
    totalProcessedMsgs: number
    totalMsgActions: number
    rooms: intStatsRooms[]
    modules: intStatsModules[]
    activities: intStatsActivities[]
    katStats: intKatStats[]
    lastUpdate: Date
}

interface intStatsRooms {
    roomId: string
    totalProcessedMsgs: number
    totalMsgActions: number
    modules: intStatsModules[]
    activities: intStatsActivities[]
    members?: string[]
    statsSince: Date
    lastUpdate: Date
}

interface intStatsModules {
    moduleName: string
    totalProcessedMsgs: number
    totalMsgActions: number
    activities: intStatsActivities[]
    statsSince: Date
    lastUpdate: Date
} 

interface intStatsActivities {
    activityName: string
    totalActivity: number
    statsSince: Date
    lastUpdate: Date
}

interface intKatStats {
    kat: string
    timesMentioned: number
    statsSince: Date
    lastUpdate: Date
}

interface intKatRegex {
    kat: string
    regex: RegExp
}

interface intStatsReport {
    totalProcessedMsgs: number
    totalActions: number
    emotesSent: number
    msgsSent: number
    // repliesSent: number
    weatherReportsSent: number
    sugarSent: number
    conversationsEvesdropped: number
    timesKittyHelped: number
    timesRestarted: number
    catStats: intStatsReportCatStats[]
}

interface intStatsReportCatStats {
    cat: string
    timesMentioned: number
}

const intAddStatsType =  {
    0: 'totalProcessedMsgs', 
    1: 'msgAction', 
    2: 'totalActivity',
    3: 'catStats',
} as const

const intAddStatsModuleType = {
    0: 'adminFunctions',
    1: 'catbotReacts',
    2: 'nightscout',
    3: 'weather',
    98: 'help',
    99: 'randomFunctions',
    100: 'kittyServer',
} as const

const intAddStatsActivity = {
    0: 'sendMsg',
    1: 'sendReply',
    2: 'sendEmote',
    3: 'kittyHelped',
    100: 'restart',
} as const

const intKats = {
    0: 'Reagan',
    1: 'Thatcher',
    2: 'Romeo',
    3: 'Gusto',
    100: 'cat',
} as const

//Export
export {
    intAddStatsActivity,
    intAddStatsModuleType,  
    intAddStatsType,  
    intKats,
    intKatRegex,
    intKatStats,
    intStats,
    intStatsActivities,
    intStatsModules,
    intStatsReport,
    intStatsReportCatStats,
    intStatsRooms,
}