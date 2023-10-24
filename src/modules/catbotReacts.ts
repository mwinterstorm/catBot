import { intReactions, intReactTrigger } from "../interfaces";
import mongoose from "mongoose";
import * as emoji from 'node-emoji'

const reactTriggerSchema = new mongoose.Schema<intReactTrigger>({
    word: { type: [String], required: true },
    regex: { type: String, required: false },
    caseSensitive: { type: Boolean, required: true },
    pluralOk: { type: Boolean, required: true },
    canPossess: { type: Boolean, required: true },
    overrideEmote: { type: String, required: false },
})

export const reactSchema = new mongoose.Schema<intReactions>({
    reactType: { type: String, required: false },
    trigger: {
        type: [reactTriggerSchema],
        required: true,
    },
    emote: { type: String, required: true },
    modifiers: {
        type: [reactTriggerSchema],
        required: false,
    },
});

export const reaction = mongoose.model('reaction', reactSchema);

export async function catbotReacts(message: String, eId: String) {
    let arr = message.split(' ')
    for (let i = 0; i < arr.length; i++) {
        const regex = new RegExp(`\\b(${arr[i]})\\b`, 'i')
        if (await reaction.exists({ 'trigger.word': regex })) {
            const res: intReactions = await reaction.findOne({ 'trigger.word': { $regex: regex } }, { 'reactType': 1, 'trigger.$': 1, 'emote': 1, 'modifiers': 1 }).lean() || { trigger: [], emote: '' }

            // CHECK IF BASE REACT MODIFIED BY REGEX
            if (res.modifiers && res.modifiers.length > 0 && res.modifiers) {
                for (let m = 0; m < res.modifiers.length; m++) {
                    if (res.modifiers[m].regex) {
                        const regTest = new RegExp(res.modifiers[m].regex?.toString() || '', 'gi')
                        if (regTest.test(message.toString())) {
                            const emote = emoji.emojify(res.modifiers[m].overrideEmote?.toString() || '') || '';
                            const item = (emote != '') ? { emote: emote, eId: eId, react: true } : { emote: '', eId: eId, react: false }                            
                            return item

                        }
                    }
                }
            }
            
            // OTHERWISE FIND EMOTE
            const emote = await (
                (!res.trigger[0].caseSensitive) ?
                    emoji.emojify(res.emote.toString()) :
                    (reaction.findOne({ 'trigger.word': { $regex: new RegExp(`\\b(${arr[i]})\\b`) } }, { 'reactType': 1, 'trigger.$': 1, 'emote': 1 }).lean().then(res => {
                        if (res && res.emote) {
                            return emoji.emojify(res.emote.toString())
                        }
                    }))) || ''
            const item = (emote != '') ? { emote: emote, eId: eId, react: true } : { emote: '', eId: eId, react: false }
            return item
        }
    }

    // IF NO REACT
    const item = { react: false, eId: eId, emote: null, }
    return item
}
