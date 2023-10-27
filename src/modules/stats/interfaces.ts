
interface intStats {
    statsSince: Date
    totalProcessedMsgs: number
    totalMsgActions?: number
    rooms: intStatsRooms[]
    modules: intStatsModules[]
    activities: intStatsActivities[]
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

const intAddStatsType =  {
    0: 'totalProcessedMsgs', 
    1: 'msgAction', 
    2: 'totalActivity'
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

//Export
export {
    intStats,
    intStatsRooms,
    intStatsModules,
    intStatsActivities,
    intAddStatsType,  
    intAddStatsModuleType,  
    intAddStatsActivity,
}