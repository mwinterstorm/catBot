import ns from './nightscout/http'
import { intSugar } from './nightscout/interfaces'
import * as int from '../interfaces'
import { checkActionWords } from '../helpers'
import { sendMsg } from '../matrix'

export async function nightscout (roomId: string, body: any) {
    const actions: int.intAction[] = [
        {
            name: 'getSugar',
            triggers: [/\bsugar\b/i],
            modifiers: [
                {
                    modName: 'getSugarHistory',
                    msgContext: {
                        msgIncludes: [/\bgraph\b/gi, /\bpast\b/gi, /\bhistory\b/gi,]
                    }
                }
            ]
        },
        {
            name: 'diabetes',
            triggers: [/\bdiabetes\b/i],
        }
    ]
    const active: any = await checkActionWords(actions, body) || false;
    if (active.action == 'help') {
        // console.log('gather actions for help');
        // console.log(active.actions);
    } else if (active.active) {
        // NIGHTSCOUT LOGIC
        const sugarMsg = await getCurrentSugarMsg()
        await sendMsg(roomId, sugarMsg.html)
    }
}

async function getCurrentSugar () {
    const d = await ns.get('/api/v1/entries/sgv?count=1')
    const data: intSugar = d.data[0]
    const bgDate = new Date(data.date)
    const now = new Date()
    const timeAgo = new Date(now.getTime() - bgDate.getTime())
    const timeAgoMsg = (timeAgo.getMinutes() < 60) ? timeAgo.getMinutes() + ':' + timeAgo.getSeconds() : 'No reading over 60 mins'
    const response = {
        mmoll: Math.trunc((data.sgv / 18) * 100) / 100,
        delta: Math.trunc((data.delta/ 18) * 100) / 100,
        direction: data.direction,
        timeAgo: timeAgoMsg,
        time: bgDate.toLocaleDateString('en-NZ') + ' ' + bgDate.toLocaleTimeString('en-NZ'),
        now: now.toLocaleDateString('en-NZ') + ' ' +now.toLocaleTimeString('en-NZ'),
    }
    return response
}

async function getCurrentSugarMsg() {
    const sugar = await getCurrentSugar() 
    const html = "<p>Sugar is <b>" + sugar.mmoll + "</b><br>It is <em>" + sugar.direction + "</em> (" + sugar.delta + ")<br>Reading is " + sugar.timeAgo + " mins old"   
    const response = {
        plain: sugar.time + ' (' + sugar.timeAgo + ') - Sugar is ' + sugar.mmoll + ' and ' + sugar.direction,
        html:  html
    }
    return response
}

export default {
    nightscout,
}