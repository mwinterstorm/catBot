import { intResponse, intResponseTrigger } from "../interfaces";
import mongoose from "mongoose";
import * as emoji from 'node-emoji'

const responseTriggerSchema = new mongoose.Schema<intResponseTrigger>({
    word: { type: [String], required: true },
    caseSensitive: { type: Boolean, required: true },
    overrideResponse: { type: String, required: false },
})

export const responseSchema = new mongoose.Schema<intResponse>({
    responseType: { type: String, required: false },
    trigger: {
        type: [responseTriggerSchema],
        required: true,
    },
    isReply: {type: Boolean, required: true},
    response: { type: String, required: false },
    modifiers: {
        type: [responseTriggerSchema],
        required: false,
    },
});

export const response = mongoose.model('response', responseSchema);

export async function catbotResponds(message: String, eId: String) {
    let arr = message.split(' ')
    for (let i = 0; i < arr.length; i++) {
        const regex = new RegExp(`\\b(${arr[i]})\\b`, 'i')
        if (await response.exists({ 'trigger.word': regex })) {
            const res: intResponse = await response.findOne({ 'trigger.word': { $regex: regex } }, { 'reactType': 1, 'trigger.$': 1, 'emote': 1, 'modifiers': 1 }).lean() || { trigger: [], isReply: false }
            
    //         // CHECK IF BASE REACT MODIFIED
    //         if (res.modifiers && res.modifiers.length > 0) {
    //             for (let m = 0; m < res.modifiers.length; m++) {
    //                 for (let w = 0; w < res.modifiers[m].word.length; w++) {
    //                     const regMod = new RegExp(`\\b(${res.modifiers[m].word[w]})\\b`, 'gi')
    //                     if (regMod.test(message.toString())) {
    //                         const emote = emoji.emojify(res.modifiers[m].overrideEmote?.toString() || '') || '';
    //                         console.log(emote);
                            
    //                         const item = (emote != '') ? {emote: emote,eId: eId,react: true} : {emote: '',eId: eId,react: false} 
    //                         return item
    //                     }
    //                 }
    //             }
    //         }

    //         // OTHERWISE FIND EMOTE
    //         const emote = await (
    //             (!res.trigger[0].caseSensitive) ? 
    //             emoji.emojify(res.emote.toString()) : 
    //             (reaction.findOne({ 'trigger.word': { $regex: new RegExp(`\\b(${arr[i]})\\b`) } }, { 'reactType': 1, 'trigger.$': 1, 'emote': 1 }).lean().then(res => { 
    //             if (res && res.emote) {
    //                 return emoji.emojify(res.emote.toString())
    //             }}))) || ''
    //         const item = (emote != '') ? {emote: emote,eId: eId,react: true} : {emote: '',eId: eId,react: false} 
    //         return item
    //     }
    // }

}}
    // IF NO REACT
    const item = {respond: false, eId: eId, response: null, isReply: false}
    return item
}
