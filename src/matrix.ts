import { MatrixClient, SimpleFsStorageProvider, AutojoinRoomsMixin, RustSdkCryptoStorageProvider } from 'matrix-bot-sdk';
import { emojify } from 'node-emoji';
import { catbotReacts } from './modules/catbotReacts';
import { checkActionWords, getAbout, helpConstructor } from './helpers';
import { wttr } from './modules/weather';

const storage = new SimpleFsStorageProvider("catbot.json");

let client: any

export async function matrix(homeserverUrl: string, accessToken: string) {
    const cryptoProvider = new RustSdkCryptoStorageProvider("./crypt");
    client = new MatrixClient(homeserverUrl, accessToken, storage, cryptoProvider);
    AutojoinRoomsMixin.setupOnClient(client);
    const catSelf = await client.getUserId()
    const catSelfData = await client.getUserProfile(catSelf)

    client.on("room.message", processEvents);
    client.start().then(() => console.log("meow! catBot started!"));

    async function processEvents(roomId: string, event: any) {
        const body = event['content']['body'];
        const eId = event.event_id
        const mentions = (event.content['m.mentions']?.user_ids) ? event.content['m.mentions'].user_ids : ['none']
        
        // Log all messages processed
        // const sender = event.sender
        // const timeS = new Date(event.origin_server_ts).toLocaleString()
        // console.log(timeS + ' - ' + sender + ': ' + body);

        // Don't handle unhelpful events (ones that aren't text messages, are redacted, or sent by us)
        if (event['sender'] === catSelf) return;
        if (event['content']?.['msgtype'] !== 'm.text') return;

        // CATBOT REACTS
        catbotReacts(roomId, body, eId, mentions, catSelf, catSelfData.displayname)

        // CATBOT RESPONDS
        // const response = await catbotResponds(body, eId)
        // console.log(response);

        // TRIGGERED INTEGRATIONS
        // send commands with either '!meow' or a mention or in a room with only bot (last one needed for android which doesn't seem to include mentions)
        const roomMembers: [] = await client.getJoinedRoomMembers(roomId);
        const numberRoomMembers: number = roomMembers.length;
        const fbody = event['content']['formatted_body'];
        if (body?.startsWith('!meow') || mentions.includes(catSelf) || numberRoomMembers == 2 || fbody?.includes('https://matrix.to/#/' + catSelf)) {

            // Universal commands
            universalCommands(roomId, body)

            // NIGHTSCOUT INTEGRATION
            if (process.env.NIGHTSCOUT) {
                import('./modules/nightscout')
                    .then(ns => {
                        ns.nightscout(roomId, body)
                    })
            }

            wttr(roomId, body)
        }

        // Put in functions that run randomly on messages under here
        if (Math.random() <= 0.001) {
            await client.replyNotice(roomId, event, 'Meow! It\'s me CatBot!', 'Meow! It\'s me CatBot! 🐱🤖');
        }
    }
}

export async function sendMsg(roomId: string, text: string, replyEvent?: any, customMeow?: string) {
    if (customMeow) {
        text = customMeow + text
    } else if (customMeow === undefined) {
        text = emojify(':cat:') + ' meow! ' + text
    }
    if (!replyEvent) {
        client.sendHtmlNotice(roomId, text)
    } else {
        client.replyHtmlNotice(roomId, replyEvent, text.replace(/<[^>]+>/g, ''), text)
    }
}

export async function sendEmote(roomId: string, eventId: string, emote: string) {
    try {
        await client.sendRawEvent(roomId, 'm.reaction', { 'm.relates_to': { event_id: eventId, key: emote, rel_type: 'm.annotation' } })
    } catch (err) {
        console.error({ details: { roomId: roomId, eventId: eventId, emote: emote } }, err);
    }
}

async function universalCommands(roomId: string, body: any) {
    const actions = [
        {
            name: 'about',
            triggers: [/\babout\b/i],
            effect: 'Find out about catBot'
        },
        {
            name: 'help',
            triggers: [/\bhelp\b/],
            effect: 'This help message'
        },
        {
            name: 'version',
            triggers: [/\bversion\b/i,],
            effect: 'Get catBot version number'
        },
    ]
    const active: any = await checkActionWords(actions, body) || { active: false, action: 'none', actions: [] }
    if (active) {
        if (active.action == 'help') {
            const moduleName = 'General Functions'
            const moduleDesc = 'General Built in functions'
            helpConstructor(roomId, actions, moduleName, moduleDesc)
        } else if (active.action == 'about') {
            const res = await getAbout()
            await sendMsg(roomId, 'Let me tell you about <b>' + res.name + '</b>! <br>' + res.description + ' by <b>' + res.author + '</b><br> Version is <b>' + res.version + '</b><br>Licensed under ' + res.license)
        } else if (active.action == 'version') {
            const res = await getAbout()
            await sendMsg(roomId, '<b>' + res.name + '</b> version is <b>' + res.version + '</b>')
        }
    }

}

export default {
    matrix,
    sendEmote,
    sendMsg
}