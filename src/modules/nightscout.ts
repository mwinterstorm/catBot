import * as int from '../interfaces'
import { checkActionWords } from '../helpers'
import { sendMsg } from '../matrix'
import { getCurrentSugarMsg } from './nightscout/getFromNightscout'

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
        const sugarMsg = await getCurrentSugarMsg()
        await sendMsg(roomId, sugarMsg.html)
    }
    return
}

export default {
    nightscout,
}