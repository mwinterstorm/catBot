import ns from './http'
import { intSugar } from './interfaces'

export async function getCurrentSugar () {
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

export async function getCurrentSugarMsg() {
    const sugar = await getCurrentSugar() 
    const html = "<p>Sugar is <b>" + sugar.mmoll + "</b><br>It is <em>" + sugar.direction + "</em> (" + sugar.delta + ")<br>Reading is " + sugar.timeAgo + " mins old"   
    const response = {
        plain: sugar.time + ' (' + sugar.timeAgo + ') - Sugar is ' + sugar.mmoll + ' and ' + sugar.direction,
        html:  html
    }
    return response
}

export async function getRecentSugar () {
    const d = await ns.get('/api/v1/entries/sgv?count=48')
    const data: intSugar[] = d.data
    // const bgDate = new Date(data.date)
    // const now = new Date()
    // const timeAgo = new Date(now.getTime() - bgDate.getTime())
    // const timeAgoMsg = (timeAgo.getMinutes() < 60) ? timeAgo.getMinutes() + ':' + timeAgo.getSeconds() : 'No reading over 60 mins'
    // const response = {
    //     mmoll: Math.trunc((data.sgv / 18) * 100) / 100,
    //     delta: Math.trunc((data.delta/ 18) * 100) / 100,
    //     direction: data.direction,
    //     timeAgo: timeAgoMsg,
    //     time: bgDate.toLocaleDateString('en-NZ') + ' ' + bgDate.toLocaleTimeString('en-NZ'),
    //     now: now.toLocaleDateString('en-NZ') + ' ' +now.toLocaleTimeString('en-NZ'),
    // }
    return data
}

export async function getRecentSugarMsg() {
    const s = await getRecentSugar() 
    const sugar: any = s[Math.floor(Math.random() * s.length)]
    const html = "<p>Sugar is <b>" + sugar.sgv + "</b><br>It is <em>" + sugar.direction + "</em> (" + sugar.delta + ")<br>Reading is " + sugar.dateString + " mins old"   
    const response = {
        plain: sugar.time + ' (' + sugar.timeAgo + ') - Sugar is ' + sugar.mmoll + ' and ' + sugar.direction,
        html:  html
    }
    return response
}

export default {
    getCurrentSugar,
    getCurrentSugarMsg,
    getRecentSugar,
    getRecentSugarMsg,
}