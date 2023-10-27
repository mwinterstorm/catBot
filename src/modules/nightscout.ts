import * as int from '../interfaces'
import { checkActionWords, helpConstructor } from '../helpers'
import { sendMsg } from '../matrix'
import { getCurrentSugarMsg, getRecentSugarMsg } from './nightscout/getFromNightscout'
import addStats from './stats'

export async function nightscout(roomId: string, body: any) {
    const actions: int.intAction[] = [
        {
            name: 'getSugar',
            triggers: [/\bsugar\b/i, /\bdiabetes\b/i],
            effect: 'Get sugar from nightscout',
            modifiers: [
                {
                    modName: 'getSugarHistory',
                    msgContext: {
                        msgIncludes: [/\bgraph\b/gi, /\bpast\b/gi, /\bhistory\b/gi,]
                    },
                    effect: 'Get graph of recent sugar'
                }
            ]
        },

    ]
    const active = await checkActionWords(actions, body) || false;    
    if (active.active == true) {
        addStats('totalProcessedMsgs',roomId,'nightscout')
    }
    if (active.action == 'help') {
        const moduleName = 'Nightscout'
        const moduleDesc = 'Integration with Nightscout (https://nightscout.github.io/)'
        helpConstructor(roomId, actions,moduleName,moduleDesc)
    // } else if (active.modifiers?[0].name == 'getSugarHistory') {
        // need to loop through all active modifiers
    //     const msg = await getRecentSugarMsg()        
    //     await sendMsg(roomId, msg.html, null, '')
    } else if (active.active) {
        const sugarMsg = await getCurrentSugarMsg()
        await sendMsg(roomId, sugarMsg.html,null,null,'nightscout')
        addStats('msgAction', roomId, 'nightscout')
    }
    return
}

export default {
    nightscout,
}