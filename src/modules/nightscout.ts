import ns from './nightscout/http'
import { intSugar } from '../interfaces'

export async function getCurrentSugar () {
    const d = await ns.get('/api/v1/entries/sgv?count=1')
    const data: intSugar = d.data[0]
    const bgDate = new Date(data.date)
    const now = new Date()
    const timeAgo = new Date(now.getTime() - bgDate.getTime())
    const timeAgoMsg = (timeAgo.getMinutes() < 60) ? timeAgo.getMinutes() + ':' + timeAgo.getSeconds() + ' ago' : 'No reading over 60 mins'
    const mmoll = data.sgv / 18
    const mmollDelta = data.delta / 18
    const response = {
        mmoll: Math.trunc(mmoll * 100) / 100,
        delta: Math.trunc(mmollDelta * 100) / 100,
        direction: data.direction,
        timeAgo: timeAgoMsg,
        time: bgDate.toLocaleDateString('en-NZ') + ' ' + bgDate.toLocaleTimeString('en-NZ'),
        now: now.toLocaleDateString('en-NZ') + ' ' +now.toLocaleTimeString('en-NZ'),
    }
    return response
    
}

