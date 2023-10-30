import mongoose from "mongoose";
import * as emoji from 'node-emoji';
import { intReactions, intReactTrigger, intReactWords, intRegItem } from './catbotReacts/interfaces';
import { sendEmote } from "../matrix";
import addStats from './stats';

const reactTriggerSchema = new mongoose.Schema<intReactTrigger>({
    word: { type: [String], required: true },
    regex: { type: String, required: false },
    caseSensitive: { type: Boolean, required: true },
    pluralOk: { type: Boolean, required: true },
    canPossess: { type: Boolean, required: true },
    overrideEmote: { type: String, required: false },
});

export const reactSchema = new mongoose.Schema<intReactions>({
    reactType: { type: String, required: true },
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

export async function catbotReacts(roomId: string, message: string, eId: string, mentions: string[], catbotId: string, catbotName: string) {
    const wordsRaw = await reaction.find({}, { 'trigger.word': 1, 'trigger.canPossess': 1, 'trigger.caseSensitive': 1, 'trigger.pluralOk': 1, 'reactType': 1, }).lean()
    let words: intReactWords[] = []
    for (let i = 0; i < wordsRaw.length; i++) {
        for (let w = 0; w < wordsRaw[i].trigger.length; w++) {
            for (let j = 0; j < wordsRaw[i].trigger[w].word.length; j++) {
                const entry = wordsRaw[i]
                const item: intReactWords = {
                    word: entry.trigger[w].word[j].toString(),
                    regex: new RegExp(''),
                    type: entry.reactType?.toString(),
                    canPlural: (entry.trigger[w].pluralOk) ? true : false,
                    canPossess: (entry.trigger[w].canPossess) ? true : false,
                    caseSensitive: (entry.trigger[w].caseSensitive) ? true : false
                }
                words.push(item)
            }
        }
    }
    for (let i = 0; i < words.length; i++) {
        let regItem: intRegItem = {
            word: '',
            options: ''
        }
        if (words[i].canPlural && !words[i].canPossess) {
            regItem.word = `\\b(${words[i].word}s?)\\b`
        } else if (words[i].canPlural && words[i].canPossess) {
            regItem.word = `\\b(${words[i].word}s?'?(?=s)?)\\b`
        } else if (!words[i].canPlural && words[i].canPossess) {
            regItem.word = `\\b(${words[i].word}'?(?=s)?)\\b`
        } else {
            regItem.word = `\\b(${words[i].word})\\b`
        }
        if (words[i].caseSensitive) {
            regItem.options = 'g'
        } else {
            regItem.options = 'gi'
        }
        words[i].regex = new RegExp(regItem.word, regItem.options)
    }

    for (let i = 0; i < words.length; i++) {
        if (words[i].regex.test(message)) {
            const foundObj = await reaction.findOne({ 'reactType': words[i].type })

            let emote = ''
            let emoteOverride = false
            // Check if emote modified
            if (foundObj?.modifiers && foundObj.modifiers.length > 0 && foundObj.modifiers) {
                for (let m = 0; m < foundObj.modifiers.length; m++) {
                    if (foundObj.modifiers[m].regex) {
                        const modTest = new RegExp(foundObj.modifiers[m].regex?.toString() || '', '')
                        if (modTest.test(message)) {
                            emoteOverride = true
                            emote = emoji.emojify(foundObj.modifiers[m].overrideEmote?.toString() || '')
                        }
                    }
                }
            }
            if (!emoteOverride) {
                emote = emoji.emojify(foundObj?.emote.toString() || '')
            }
            await sendEmote(roomId, eId, emote, 'catbotReacts')
            addStats('msgAction', roomId, 'catbotReacts')
        }
    }

// React to mention of self
const catBotFind = new RegExp(catbotName, 'gi')
if (mentions.includes(catbotId) || catBotFind.test(message)) {
    await sendEmote(roomId, eId, emoji.emojify(':cat:'), 'catbotReacts')
    addStats('msgAction', roomId, 'catbotReacts')
}

return
}

