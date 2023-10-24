import { intReactions, intReactTrigger } from "../interfaces";
import mongoose from "mongoose";
import * as emoji from 'node-emoji'

const reactTriggerSchema = new mongoose.Schema<intReactTrigger>({
    word: { type: [String], required: true },
    caseSensitive: { type: Boolean, required: true },
    pluralOk: { type: Boolean, required: true },
    canPossess: { type: Boolean, required: true },
})

export const reactSchema = new mongoose.Schema<intReactions>({
    reactType: { type: String, required: false },
    trigger: {
        type: [reactTriggerSchema],
        required: true,
    },
    emote: { type: String, required: true },
});

export const reaction = mongoose.model('reaction', reactSchema);

export async function catbotReacts(message: String, eId: String) {
    let arr = message.split(' ')
    for (let i = 0; i < arr.length; i++) {
        const regex = new RegExp(`\\b(${arr[i]})\\b`, 'i')
        if (await reaction.exists({ 'trigger.word': regex })) {
            const res: intReactions = await reaction.findOne({ 'trigger.word': { $regex: regex } }, { 'reactType': 1, 'trigger.$': 1, 'emote': 1 }).lean() || { trigger: [], emote: '' }
            const emote = await (
                (!res.trigger[0].caseSensitive) ? 
                emoji.emojify(res.emote.toString()) : 
                (reaction.findOne({ 'trigger.word': { $regex: new RegExp(`\\b(${arr[i]})\\b`) } }, { 'reactType': 1, 'trigger.$': 1, 'emote': 1 }).lean().then(res => { 
                if (res && res.emote) {
                    return emoji.emojify(res.emote.toString())
                }}))) || ''
            const item = (emote != '') ? {emote: emote,eId: eId,react: true} : {emote: '',eId: eId,react: false} 
            return item
        }
    }
    const item = {react: false,eId: eId,emote: null,}
    return item
}
