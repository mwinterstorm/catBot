import mongoose from "mongoose";
import { intStatsActivities, intStats, intStatsRooms } from './interfaces';
import { intStatsModules } from "./interfaces";

const statsActivitySchema = new mongoose.Schema<intStatsActivities>({
    activityName: {type: String, required: true},
    totalActivity: {type: Number, required: true},
    statsSince: {type: Date, required: true},
    lastUpdate: {type: Date, required: true}
})

const statsModuleSchema = new mongoose.Schema<intStatsModules>({
    moduleName: {type: String, required: true},
    totalProcessedMsgs: {type: Number, required: true},
    totalMsgActions: {type: Number, required: true},
    activities: { type: [statsActivitySchema], required: true },
    statsSince: {type: Date, required: true},
    lastUpdate: {type: Date, required: true},
})

const statsRoomSchema = new mongoose.Schema<intStatsRooms>({
    roomId: {type: String, required: true},
    totalProcessedMsgs: {type: Number, required: true},
    totalMsgActions: {type: Number, required: true},
    modules: {type: [statsModuleSchema], required: true},
    activities: { type: [statsActivitySchema], required: true },
    members: {type: [String], required: false},
    statsSince: {type: Date, required: true},
    lastUpdate: {type: Date, required: true},
})

export const statsSchema = new mongoose.Schema<intStats>({
    totalProcessedMsgs: {type: Number, required: true},
    totalMsgActions: {type: Number, required: false},
    rooms: { type: [statsRoomSchema], required: true},
    modules: { type : [statsModuleSchema], required: true},
    activities: { type: [statsActivitySchema], required: true },
    statsSince: { type: Date, required: true },
    lastUpdate: {type: Date, required: true},
});

export const stats = mongoose.model('stats', statsSchema);