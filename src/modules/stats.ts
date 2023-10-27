import { Nullable } from "../interfaces";
import { getRoomMembers } from "../matrix";
import { intAddStatsActivity, intAddStatsModuleType, intAddStatsType, intStats, intStatsReport } from "./stats/interfaces";
import { stats } from "./stats/schema";

let dbstats: intStats
let runningTotal: number = 0

export default async function addStats(type: typeof intAddStatsType[keyof typeof intAddStatsType], roomId?: Nullable<string>, module?: typeof intAddStatsModuleType[keyof typeof intAddStatsModuleType], activity?: typeof intAddStatsActivity[keyof typeof intAddStatsActivity]) {
    if (type == 'totalProcessedMsgs' && !module) {
        runningTotal++
        if (!dbstats.totalProcessedMsgs) {
            dbstats.totalProcessedMsgs = 1
        } else {
            dbstats.totalProcessedMsgs++
        }

        if (roomId) {
            const index = dbstats.rooms?.findIndex(x => x.roomId === roomId)
            const now = new Date();
            if (roomId && index == -1) {
                const members = (await getRoomMembers(roomId)).members
                dbstats.rooms?.push({
                    roomId: roomId,
                    members: members,
                    totalProcessedMsgs: 1,
                    totalMsgActions: 0,
                    modules: [],
                    activities: [],
                    statsSince: now,
                    lastUpdate: now,
                })
            } else if (roomId && index != -1) {
                const room = dbstats.rooms[index]
                dbstats.rooms[index] = {
                    roomId: room.roomId,
                    members: room.members,
                    totalProcessedMsgs: ++room.totalProcessedMsgs,
                    totalMsgActions: room.totalMsgActions,
                    modules: room.modules,
                    activities: room.activities,
                    statsSince: room.statsSince,
                    lastUpdate: now,
                }
            }
        }
    } else if (type == 'totalProcessedMsgs' && module) {
        runningTotal++
        if (module) {
            const now = new Date();
            const mIndex = dbstats.modules?.findIndex(x => x.moduleName == module)
            if (module && mIndex == -1) {
                dbstats.modules?.push({
                    moduleName: module,
                    totalProcessedMsgs: 1,
                    totalMsgActions: 0,
                    activities: [],
                    statsSince: now,
                    lastUpdate: now,
                })
            } else if (module && mIndex != -1) {
                const mData = dbstats.modules[mIndex]
                dbstats.modules[mIndex] = {
                    moduleName: mData.moduleName,
                    totalProcessedMsgs: ++mData.totalProcessedMsgs,
                    totalMsgActions: mData.totalMsgActions,
                    activities: mData.activities,
                    statsSince: mData.statsSince,
                    lastUpdate: now,
                }
            }
        }
        if (module && roomId) {
            const now = new Date();
            const roomIndex = dbstats.rooms?.findIndex(x => x.roomId === roomId)
            const room = dbstats.rooms[roomIndex]
            const mIndex = room.modules?.findIndex(x => x.moduleName == module)
            if (module && mIndex == -1) {
                dbstats.rooms[roomIndex].modules?.push({
                    moduleName: module,
                    totalProcessedMsgs: 1,
                    totalMsgActions: 0,
                    activities: [],
                    statsSince: now,
                    lastUpdate: now,
                })
            } else if (module && mIndex != -1 && dbstats.rooms[roomIndex].modules[mIndex]) {
                const mData = room.modules[mIndex]
                dbstats.rooms[roomIndex].modules[mIndex] = {
                    moduleName: mData.moduleName,
                    totalProcessedMsgs: ++mData.totalProcessedMsgs,
                    totalMsgActions: mData.totalMsgActions,
                    activities: mData.activities,
                    statsSince: mData.statsSince,
                    lastUpdate: now,
                }
            }
        }
    } else if (type == 'msgAction' && !module) {
        runningTotal++
        if (!dbstats.totalMsgActions) {
            dbstats.totalMsgActions = 1
        } else {
            ++dbstats.totalMsgActions
        }

        if (roomId) {
            const index = dbstats.rooms?.findIndex(x => x.roomId === roomId)
            const now = new Date();
            const room = dbstats.rooms[index]
            if (roomId && index == -1) {
                const members = (await getRoomMembers(roomId)).members
                dbstats.rooms?.push({
                    roomId: roomId,
                    members: members,
                    totalProcessedMsgs: 1,
                    totalMsgActions: 1,
                    modules: [],
                    activities: [],
                    statsSince: now,
                    lastUpdate: now,
                })
            } else if (roomId && index != -1) {
                dbstats.rooms[index] = {
                    roomId: room.roomId,
                    members: room.members,
                    totalProcessedMsgs: ++room.totalProcessedMsgs,
                    totalMsgActions: ++room.totalMsgActions,
                    modules: room.modules,
                    activities: room.activities,
                    statsSince: room.statsSince,
                    lastUpdate: now,
                }
            }
        }
    } else if (type == 'msgAction' && module) {
        if (!dbstats.totalMsgActions) {
            dbstats.totalMsgActions = 1
        } else {
            ++dbstats.totalMsgActions
        }
        runningTotal++
        const now = new Date();
        if (module && roomId) {
            const roomIndex = dbstats.rooms?.findIndex(x => x.roomId === roomId)
            const room = dbstats.rooms[roomIndex]
            const mIndex = dbstats.rooms[roomIndex].modules?.findIndex(x => x.moduleName == module)
            if (roomIndex == -1) {
                const members = (await getRoomMembers(roomId)).members
                dbstats.rooms.push({
                    roomId: roomId,
                    members: members,
                    totalProcessedMsgs: 1,
                    totalMsgActions: 1,
                    modules: [],
                    activities: [],
                    statsSince: now,
                    lastUpdate: now,
                })
            } else if (roomIndex != -1) {
                dbstats.rooms[roomIndex] = {
                    roomId: room.roomId,
                    members: room.members,
                    totalProcessedMsgs: ++room.totalProcessedMsgs,
                    totalMsgActions: ++room.totalMsgActions,
                    modules: room.modules,
                    activities: room.activities,
                    statsSince: room.statsSince,
                    lastUpdate: now,
                }
            }
            if (module && mIndex == -1) {
                dbstats.rooms[roomIndex].modules?.push({
                    moduleName: module,
                    totalProcessedMsgs: 1,
                    totalMsgActions: 1,
                    activities: [],
                    statsSince: now,
                    lastUpdate: now,

                })
            } else if (module && mIndex != -1) {
                const mData = room.modules[mIndex]
                dbstats.rooms[roomIndex].modules[mIndex] = {
                    moduleName: mData.moduleName,
                    totalProcessedMsgs: ++mData.totalProcessedMsgs,
                    totalMsgActions: ++mData.totalMsgActions,
                    activities: mData.activities,
                    statsSince: mData.statsSince,
                    lastUpdate: now,
                }
            }
            const mmIndex = dbstats.modules?.findIndex(x => x.moduleName == module)
            if (module && mmIndex == -1) {
                dbstats.modules?.push({
                    moduleName: module,
                    totalProcessedMsgs: 1,
                    totalMsgActions: 1,
                    activities: [],
                    statsSince: now,
                    lastUpdate: now,
                })
            } else if (module && mmIndex != -1) {
                const mData = dbstats.modules[mmIndex]
                dbstats.modules[mmIndex] = {
                    moduleName: mData.moduleName,
                    totalProcessedMsgs: ++mData.totalProcessedMsgs,
                    totalMsgActions: ++mData.totalMsgActions,
                    activities: mData.activities,
                    statsSince: mData.statsSince,
                    lastUpdate: now,
                }
            }
        } else if (module && !roomId) {
            const mIndex = dbstats.modules?.findIndex(x => x.moduleName == module)
            if (module && mIndex == -1) {
                dbstats.modules?.push({
                    moduleName: module,
                    totalProcessedMsgs: 1,
                    totalMsgActions: 1,
                    activities: [],
                    statsSince: now,
                    lastUpdate: now,
                })
            } else if (module && mIndex != -1) {
                const mData = dbstats.modules[mIndex]
                dbstats.modules[mIndex] = {
                    moduleName: mData.moduleName,
                    totalProcessedMsgs: ++mData.totalProcessedMsgs,
                    totalMsgActions: ++mData.totalMsgActions,
                    activities: mData.activities,
                    statsSince: mData.statsSince,
                    lastUpdate: now,
                }
            }
        }
    } else if (type == 'totalActivity' && activity) {
        runningTotal++
        const index = dbstats.activities?.findIndex(x => x.activityName === activity)
        const now = new Date();
        if (activity && index == -1) {
            dbstats.activities?.push({
                activityName: activity,
                totalActivity: 1,
                statsSince: now,
                lastUpdate: now,
            })
        } else if (activity && index != -1) {
            const action = dbstats.activities[index]
            dbstats.activities[index] = {
                activityName: action.activityName,
                totalActivity: ++action.totalActivity,
                statsSince: action.statsSince,
                lastUpdate: now,
            }
        }
        if (activity && roomId) {
            const rIx = dbstats.rooms?.findIndex(x => x.roomId === roomId)
            if (rIx) {
                const room = dbstats.rooms[rIx]
                const aIx = room.activities?.findIndex(x => x.activityName === activity)
                if (activity && aIx == -1) {
                    dbstats.rooms[rIx].activities.push({
                        activityName: activity,
                        totalActivity: 1,
                        statsSince: now,
                        lastUpdate: now,
                    })
                } else if (activity && aIx != -1) {
                    const action = dbstats.rooms[rIx].activities[aIx]
                    dbstats.rooms[rIx].activities[aIx] = {
                        activityName: action.activityName,
                        totalActivity: ++action.totalActivity,
                        statsSince: action.statsSince,
                        lastUpdate: now,
                    }
                }
                if (activity && module) {
                    const rIx = dbstats.rooms?.findIndex(x => x.roomId === roomId)
                    const mIx = dbstats.modules?.findIndex(x => x.moduleName === module)
                    const mrIx = dbstats.rooms[rIx].modules?.findIndex(x => x.moduleName === module)
                    const m = dbstats.modules[mIx]
                    const mr = dbstats.rooms[rIx].modules[mrIx]
                    const aIx = m.activities?.findIndex(x => x.activityName === activity)
                    const arIx = mr.activities?.findIndex(x => x.activityName === activity)
                    if (activity && aIx == -1) {
                        dbstats.modules[mIx].activities?.push({
                            activityName: activity,
                            totalActivity: 1,
                            statsSince: now,
                            lastUpdate: now,
                        })
                    } else if (activity && aIx != -1) {
                        const action = m.activities[aIx]
                        dbstats.activities[index] = {
                            activityName: action.activityName,
                            totalActivity: ++action.totalActivity,
                            statsSince: action.statsSince,
                            lastUpdate: now,
                        }
                    }
                    if (activity && arIx == -1) {
                        dbstats.rooms[rIx].modules[mrIx].activities?.push({
                            activityName: activity,
                            totalActivity: 1,
                            statsSince: now,
                            lastUpdate: now,
                        })
                    } else if (activity && arIx != -1) {
                        const action = mr.activities[aIx]
                        dbstats.activities[index] = {
                            activityName: action.activityName,
                            totalActivity: ++action.totalActivity,
                            statsSince: action.statsSince,
                            lastUpdate: now,
                        }
                    }
                }
            }
        }
    }
    // write DB every x messages processed
    if (runningTotal >= 210) {
        await writedb(dbstats)
        runningTotal = 0
    }
    console.log(runningTotal);
}

export async function getStats() {
    let empty = {
        statsSince: new Date(),
        totalProcessedMsgs: 0,
        totalMsgActions: 0,
        rooms: [],
        modules: [],
        activities: [],
        lastUpdate: new Date,
    }
    const statsDBEntry: intStats = await stats.findOne({}) || empty
    // console.log(statsDBEntry);
    const report: intStatsReport = {
        totalProcessedMsgs: statsDBEntry.totalProcessedMsgs,
        totalActions: statsDBEntry.totalMsgActions,
        emotesSent: statsDBEntry.activities[statsDBEntry.activities.findIndex(x => x.activityName === 'sendEmote')].totalActivity,
        msgsSent: statsDBEntry.activities[statsDBEntry.activities.findIndex(x => x.activityName === 'sendMsg')].totalActivity,
        // repliesSent: statsDBEntry.activities[statsDBEntry.activities.findIndex(x => x.activityName === 'sendReply')].totalActivity,
        weatherReportsSent: statsDBEntry.modules[statsDBEntry.modules.findIndex(x => x.moduleName === 'weather')].totalMsgActions,
        sugarSent: statsDBEntry.modules[statsDBEntry.modules.findIndex(x => x.moduleName === 'nightscout')].totalMsgActions,
        conversationsEvesdropped: statsDBEntry.rooms.length,
        timesKittyHelped: statsDBEntry.activities[statsDBEntry.activities.findIndex(x => x.activityName === 'kittyHelped')].totalActivity,
        timesRestarted: statsDBEntry.activities[statsDBEntry.activities.findIndex(x => x.activityName === 'restart')].totalActivity,
    }
    return report

}

export async function initialiseStats() {
    const statsdb = await stats.where({}).countDocuments().lean()
    if (statsdb == 0) {
        console.log('meow! no statsdb, creating db entry...');
        const now = new Date()
        const entry: intStats = {
            statsSince: now,
            totalProcessedMsgs: 0,
            totalMsgActions: 0,
            lastUpdate: now,
            rooms: [],
            modules: [],
            activities: [],
        }
        stats.findOneAndUpdate({}, entry, { upsert: true, new: true }).exec()
        dbstats = entry
        console.log('... meow! done!');
    } else {
        const statsDBEntry = await stats.findOne({})
        let item: intStats = {
            statsSince: new Date(statsDBEntry?.statsSince || new Date()),
            totalMsgActions: statsDBEntry?.totalMsgActions || 0,
            totalProcessedMsgs: statsDBEntry?.totalProcessedMsgs || 0,
            lastUpdate: new Date(statsDBEntry?.lastUpdate || new Date()),
            rooms: statsDBEntry?.rooms || [],
            modules: statsDBEntry?.modules || [],
            activities: statsDBEntry?.activities || [],
        }
        dbstats = item
        console.log("meow! I've done " + statsDBEntry?.totalMsgActions?.toLocaleString('en-NZ') + ' actions and read ' + statsDBEntry?.totalProcessedMsgs.toLocaleString('en-NZ') + ' of your messages');
    }
    let interval = setInterval(() => { writedb(dbstats) }, 777777)
    return
}

async function writedb(statsEntry: intStats) {
    const now = new Date()
    const result = await stats.findOneAndUpdate({ statsSince: statsEntry.statsSince }, statsEntry, { upsert: true, new: true }).exec()
    console.log('meow! saved stats at ' + now.toLocaleString('en-NZ') + '! I\'ve read ' + statsEntry.totalProcessedMsgs + ' of your messages');
    return result || 'error'
}