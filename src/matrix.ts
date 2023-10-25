import { MatrixClient, SimpleFsStorageProvider, AutojoinRoomsMixin, RustSdkCryptoStorageProvider } from 'matrix-bot-sdk';
import { catbotReacts } from './modules/catbotReacts';
import { nightscout } from './modules/nightscout';
import { checkActionWords, getAbout } from './helpers';

const storage = new SimpleFsStorageProvider("catbot.json");

let client: any

export async function matrix(homeserverUrl: string, accessToken: string) {
    const cryptoProvider = new RustSdkCryptoStorageProvider("./crypt");
    client = new MatrixClient(homeserverUrl, accessToken, storage, cryptoProvider);
    AutojoinRoomsMixin.setupOnClient(client);
    const catSelf = await client.getUserId()
    client.on("room.message", processEvents);
    client.start().then(() => console.log("meow! catBot started!"));

    async function processEvents(roomId: string, event: any) {
        const body = event['content']['body'];
        const sender = event.sender
        const timeS = new Date(event.origin_server_ts).toLocaleString()
        const eId = event.event_id
        const mentions = (event.content['m.mentions']?.user_ids) ? event.content['m.mentions'].user_ids : ['none']

        console.log(timeS + ' - ' + sender + ': ' + body);

        // Don't handle unhelpful events (ones that aren't text messages, are redacted, or sent by us)
        if (event['sender'] === catSelf) return;
        if (event['content']?.['msgtype'] !== 'm.text') return;

        // CATBOT REACTS
        catbotReacts(roomId, body, eId, mentions, catSelf)

        // CATBOT RESPONDS
        // const response = await catbotResponds(body, eId)
        // console.log(response);

        // TRIGGERED INTEGRATIONS
        if (body?.startsWith('!meow') || mentions.includes(catSelf)) {
            // NIGHTSCOUT INTEGRATION
            if (process.env.NIGHTSCOUT) {
                nightscout(roomId, body)
            }

            // Universal commands
            universalCommands(roomId, body)

        }

        // Put in functions that run randomly on messages under here
        if (Math.random() <= 0.001) {
            await client.replyNotice(roomId, event, 'Meow! It\'s me CatBot!', 'Meow! It\'s me CatBot! 🐱🤖');
        }
    }
}

export async function sendMsg(roomId: string, text: string, replyEvent?: any, customMeow?: string) {
    if (customMeow) {
        text = customMeow + ' ' + text
    } else {
        text = 'meow! ' + text
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
        console.log({details: {roomId: roomId, eventId: eventId, emote: emote }},err);
    }
}

async function universalCommands(roomId: string, body: any) {
    const actions = [
        {
            name: 'about',
            triggers: [/\babout\b/i],
        },
        {
            name: 'version',
            triggers: [/\bversion\b/i,],
        }
    ]
    const active: any = await checkActionWords(actions, body) || { active: false, action: 'none', actions: [] }
    if (active) {
        if (active.action == 'help') {
            console.log('gather actions for help');
            console.log(active.actions);
        } else if (active.action == 'about') {
            const res = await getAbout()
            await client.sendHtmlNotice(roomId, 'meow! Let me tell you about <b>' + res.name + '</b>! <br>' + res.description + ' by <b>' + res.author + '</b><br> Version is <b>' + res.version + '</b><br>Licensed under ' + res.license)
        } else if (active.action == 'version') {
            const res = await getAbout()
            await client.sendHtmlNotice(roomId, 'meow! <b>' + res.name + '</b> version is <b>' + res.version + '</b>')
        }
    }

}

export default {
    matrix,
    sendEmote,
    sendMsg
}