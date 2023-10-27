import { MatrixClient, SimpleFsStorageProvider, AutojoinRoomsMixin, RustSdkCryptoStorageProvider } from 'matrix-bot-sdk';
import { emojify } from 'node-emoji';
import { catbotReacts } from './modules/catbotReacts';
import { checkActionWords, getAbout, helpConstructor } from './helpers';
import { wttr } from './modules/weather';
import { lastlaunchtime } from './main';
import addStats, { forceSave2db, getStats } from './modules/stats';
import { intAddStatsModuleType } from './modules/stats/interfaces';
import { Nullable, intAction } from './interfaces';

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
        addStats('totalProcessedMsgs', roomId)
        addStats('catStats', roomId, null, null, body)

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
            client.setTyping(roomId, true, 10000)
            let typing: number = 0
            // NIGHTSCOUT INTEGRATION
            if (process.env.NIGHTSCOUT) {
                ++typing

                import('./modules/nightscout')
                    .then(ns => {
                        ns.nightscout(roomId, body).then(() => {
                            --typing
                            if (typing <= 0) {
                                client.setTyping(roomId, false)
                            }

                        })
                    })
            }

            // WEATHER
            ++typing
            wttr(roomId, body).then(() => {
                --typing
                if (typing <= 0) {
                    client.setTyping(roomId, false)
                }
            }
            )

            // ADMIN COMMANDS
            ++typing
            universalCommands(roomId, body).then(() => {
                --typing
                if (typing <= 0) {
                    client.setTyping(roomId, false)
                }
            })
        }

        // Put in functions that run randomly on messages under here
        if (Math.random() <= 0.01) {
            addStats('totalProcessedMsgs', roomId, 'randomFunctions')
            if (Math.random() <= 0.01) {
                await client.replyNotice(roomId, event, 'Meow! It\'s me CatBot!', 'Meow! It\'s me CatBot! 🐱🤖');
                addStats('msgAction', roomId, 'randomFunctions')
            }
        }
    }
}

export async function sendMsg(roomId: string, text: string, replyEvent?: any, customMeow?: Nullable<string>, module?: typeof intAddStatsModuleType[keyof typeof intAddStatsModuleType]) {
    if (customMeow) {
        text = customMeow + text
    } else if (customMeow === null || customMeow === undefined) {
        text = emojify(':cat:') + ' meow! ' + text
    }
    if (!replyEvent) {
        client.sendHtmlNotice(roomId, text)
        addStats('totalActivity', roomId, module, 'sendMsg')
    } else {
        client.replyHtmlNotice(roomId, replyEvent, text.replace(/<[^>]+>/g, ''), text)
        addStats('totalActivity', roomId, module, 'sendReply')
    }
}

export async function sendEmote(roomId: string, eventId: string, emote: string, module: typeof intAddStatsModuleType[keyof typeof intAddStatsModuleType]) {
    try {
        await client.sendRawEvent(roomId, 'm.reaction', { 'm.relates_to': { event_id: eventId, key: emote, rel_type: 'm.annotation' } })
        addStats('totalActivity', roomId, module, 'sendEmote')
    } catch (err) {
        console.error({ details: { roomId: roomId, eventId: eventId, emote: emote } }, err);
    }
}

async function universalCommands(roomId: string, body: any) {
    const actions: intAction[] = [
        {
            name: 'about',
            triggers: [/\babout\b/gi],
            effect: 'Find out about catBot'
        },
        {
            name: 'help',
            triggers: [/\bhelp\b/gi],
            effect: 'This help message'
        },
        {
            name: 'memberships',
            triggers: [/\bmemberships\b/gi, /\bmember\b/gi, /\brooms\b/gi,],
            effect: 'This help message'
        },
        {
            name: 'stats',
            triggers: [/\bstats\b/gi,],
            effect: 'Get catBot stats',
            modifiers: [{
                modName: 'saveToDb',
                msgContext: {
                    msgIncludes: [/\bsave\b/gi]
                },
                effect: 'force save current stats to db'
            }]
        },
        {
            name: 'uptime',
            triggers: [/\buptime\b/i,],
            effect: 'Get catBot uptime'
        },
        {
            name: 'version',
            triggers: [/\bversion\b/i,],
            effect: 'Get catBot version number'
        },
    ]
    const active: any = await checkActionWords(actions, body) || { active: false, action: 'none', actions: [] }
    if (active) {
        addStats('totalProcessedMsgs', roomId, 'adminFunctions')
        if (active.action == 'help') {
            const moduleName = 'Admin Functions'
            const moduleDesc = 'General Built in functions'
            helpConstructor(roomId, actions, moduleName, moduleDesc)
        } else if (active.action == 'about') {
            const res = await getAbout()
            await sendMsg(roomId, 'Let me tell you about <b>' + res.name + '</b>! <br>' + res.description + ' by <b>' + res.author + '</b><br> Version is <b>' + res.version + '</b><br>Licensed under ' + res.license, null, null, 'adminFunctions')
            addStats('msgAction', roomId, 'adminFunctions')
        } else if (active.action == 'memberships') {
            const res = await client.getJoinedRooms()
            let rooms: any = []
            for (let p = 0; p < res.length; p++) {
                let a = await client.getPublishedAlias(res[p])
                if (a) {
                    rooms.push(a)
                }
            }
            for (let r = 0; r < rooms.length; r++) {
                rooms[r] = '<li>' + rooms[r] + '</li>'
            }

            await sendMsg(roomId, (await client.getUserProfile(await client.getUserId())).displayname + ' is a member of <b>' + res.length + '</b> rooms. Named rooms are: <ul>' + rooms.toString().replace(/,/g, '') + '</ul>', null, null, 'adminFunctions')
        } else if (active.action == 'stats') {
            const res = await getStats()
            if (active.modifiers.length > 0) {
                for (let i = 0; i < active.modifiers.length; i++) {
                    if (active.modifiers[i].name == 'saveToDb') {
                        let forceSave = await forceSave2db()
                        await sendMsg(roomId, forceSave.msg, null, null, 'adminFunctions')
                        addStats('msgAction', roomId, 'adminFunctions')
                    }
                }
            } else {
                await sendMsg(roomId, '<h4>Here are some<b> catStats!</b></h4><ul><li>I\'ve read <b>' + res.totalProcessedMsgs.toLocaleString('en-NZ') + '</b> messages over <b>' + res.conversationsEvesdropped.toLocaleString('en-NZ') + '</b> conversations I have evesdropped on.</li><li>I\'ve sent <b>' + res.msgsSent.toLocaleString('en-NZ') + ' </b> messages and <b>' + res.emotesSent.toLocaleString('en-NZ') + ' </b> emotes.</li><li><b>' + res.weatherReportsSent.toLocaleString('en-NZ') + '</b> times I\'ve told you the weather.</li><li>I\'ve restarted <b>' + res.timesRestarted.toLocaleString('en-NZ') + ' </b> times and checked on sugar levels <b>' + res.sugarSent.toLocaleString('en-NZ') + '</b> times.</li><li> You have asked me for kitty help on <b>' + res.timesKittyHelped.toLocaleString('en-NZ') + '</b> occassions.</li></ul>', null, null, 'adminFunctions')
                addStats('msgAction', roomId, 'adminFunctions')
            }
        } else if (active.action == 'uptime') {
            const res = new Date(lastlaunchtime)[Symbol.toPrimitive]('number')
            const now = Date.now()
            let diff = (now - res) / 1000
            const years = Math.trunc(diff / 31536000)
            const y = (years > 0) ? years + ' years ' : ''
            diff = diff - (years * 3153600)
            const months = Math.trunc(diff / 2592000)
            const m = (months > 0) ? months + ' months ' : ''
            diff = diff - (months * 2592000)
            const days = Math.trunc(diff / 86400)
            const d = (days > 0) ? days + ' days ' : ''
            diff = diff - (days * 86400)
            const hours = Math.trunc(diff / 3600)
            const h = (hours > 9) ? hours : '0' + hours
            diff = diff - (hours * 3600)
            const mins = Math.trunc(diff / 60)
            const mm = (mins > 9) ? mins : '0' + mins
            diff = diff - (mins * 60)
            const secs = Math.trunc(diff)
            const s = (secs > 9) ? secs : '0' + secs
            const timeAgo = y + m +  d + h + ':' + mm + ':' + s
            await sendMsg(roomId, '<br>Running since: <b>' + lastlaunchtime.toLocaleString('en-NZ') + '</b> <br> Uptime: <b>' + timeAgo + '</b>', null, null, 'adminFunctions')
            addStats('msgAction', roomId, 'adminFunctions')
        } else if (active.action == 'version') {
            const res = await getAbout()
            await sendMsg(roomId, '<b>' + res.name + '</b> version is <b>' + res.version + '</b>', null, null, 'adminFunctions')
            addStats('msgAction', roomId, 'adminFunctions')
        }
    }
    return
}

export async function getRoomMembers(roomId: string) {
    const members = await client.getJoinedRoomMembers(roomId);
    const count = members.length
    return { members: members, count: count }
}

export default {
    matrix,
    sendEmote,
    sendMsg,
    getRoomMembers,
}