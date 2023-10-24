import { intReactions, intReactTrigger } from "../interfaces";
import mongoose from "mongoose";
import * as emoji from 'node-emoji'

const reactTriggerSchema = new mongoose.Schema<intReactTrigger>({
    word: { type: [String], required: true },
    caseSensitive: { type: Boolean, required: true },
    pluralOk: { type: Boolean, required: true },
    canPossess: { type: Boolean, required: true },
    overrideEmote: { type: String, required: false }
})

export const reactTrigger = mongoose.model('reactTrigger', reactTriggerSchema);

export const reactSchema = new mongoose.Schema<intReactions>({
    reactType: { type: String, required: false },
    trigger: {
        type: [reactTriggerSchema],
        required: true
    },
    emote: { type: String, required: true },
});

export const reaction = mongoose.model('reaction', reactSchema);

export async function catbotReacts(message: String, eId: String) {
    // console.log(message);
    let arr = message.split(' ')
    // console.log(arr);
    for (let i = 0; i < arr.length; i++) {
        if (await reaction.exists({'trigger.word': arr[i]}) ) {
            const res = await reaction.findOne({'trigger.word': arr[i]}).lean() || {emote: ':skull_and_crossbones:'}
            const emote = emoji.emojify(res.emote.toString())
            const item = {
                emote: emote,
                eId: eId,
                react: true
            }
            return item
        }   
    }
    const item = {
        react: false,
        eId: eId,
        emote: null,
    }
    return item
}
