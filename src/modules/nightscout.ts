import ns from './nightscout/http'
import { intSugar } from '../interfaces'

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
    const html = "<p>Meow!<br>Sugar is <b>" + sugar.mmoll + "</b><br>It is <em>" + sugar.direction + "</em> (" + sugar.delta + ")<br>Reading is " + sugar.timeAgo + " mins old"   
    const response = {
        plain: 'meow!' + sugar.time + ' (' + sugar.timeAgo + ') - Sugar is ' + sugar.mmoll + ' and ' + sugar.direction,
        html:  html
    }
    return response
}

export default {
    getCurrentSugar,
    getCurrentSugarMsg,
}