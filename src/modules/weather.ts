import { wttr as w } from "./weather/http";
import { intAction } from '../interfaces'
import { checkActionWords, helpConstructor } from "../helpers";
import { sendMsg } from "../matrix";

export async function wttr(roomId: string, body: any) {
    const actions: intAction[] = [
        {
            name: 'weather',
            triggers: [/\bweather\b/i, /\bwttr\b/i,],
            effect: 'Get the weather at your location',
            modifiers: [{
                modName: 'todayForecast',
                msgContext: {
                    msgIncludes: [/\bforecast\b/gi, /\btoday\b/gi, /\bt\b/gi, /\bf\b/gi],
                    msgExcludes: [/\btomorrow\b/gi, /\btt\b/gi],
                    requiresBothIncludeAndExclude: true
                },
                effect: "get Today's forecast"
            },
            {
                modName: 'tomorrowForecast',
                msgContext: {
                    msgIncludes: [/\btomorrow\b/gi, /\btt\b/gi, /\bff\b/gi]
                },
                effect: "get Tomorrows's forecast"
            },
            {
                modName: 'cityLocation',
                msgContext: {
                    msgIncludes: [/\bc\b/gi, /\bl\b/gi, /\bcityname\b/gi, /\blatlong\b/gi, /\blocation\b/gi,]
                },
                effect: "get weather at location",
                modData: body
            },
            {
                modName: 'detail',
                msgContext: {
                    msgIncludes: [/\bd\b/gi,]
                },
                effect: "Show extra detail",
            },
            {
                modName: 'quickSimple',
                msgContext: {
                    msgIncludes: [/\bq\b/gi, /\\bs\b/gi,]
                },
                effect: "Show quick & simple",
            }]
        }
    ]
    const active: any = await checkActionWords(actions, body) || { active: false, action: 'none', actions: [] }
    if (active) {
        if (active.action == 'help') {
            const moduleName = 'Weather'
            const moduleDesc = 'Get the weather!'
            helpConstructor(roomId, actions, moduleName, moduleDesc)
        } else if (active.action == 'weather') {
            let options: any = {
                forecast: false,
                tomorrow: false,
                detail: false,
                simple: false,
            }
            let city: any = 'none'
            if (active.modifiers) {
                for (let i = 0; i < active.modifiers.length; i++) {
                    if (active.modifiers[i].name == 'cityLocation') {
                        const arr: string[] = active.modifiers[i].data[0].split(' ')
                        const index = arr.indexOf(active.modifiers[i].data[1])
                        city = ''
                        for (let c = index + 1; c < arr.length; c++) {
                            city = city + ' ' + arr[c]
                        }
                    } else if (active.modifiers[i].name == 'todayForecast') {
                        options.forecast = true
                    } else if (active.modifiers[i].name == 'tomorrowForecast') {
                        options.tomorrow = true
                    } else if (active.modifiers[i].name == 'detail') {
                        options.detail = true
                    } else if (active.modifiers[i].name == 'quickSimple') {
                        options.simple = true
                    }
                }
                if (city == 'none') {
                    city = undefined
                }
                const res = await getWeather(options, city)
                await sendMsg(roomId, res.toString())
                return
            }
        }
    }
}

export async function getWeather(options?: { forecast?: boolean, tomorrow?: boolean, detail?: boolean, simple?: boolean }, city?: string) {        
    let opt: string = '?Fn'
    let apiVersion = ''
    if (!city) {
        city = 'Wellington'
    }
    let view: any = 0
    if (options?.forecast) {
        view = 1
    }
    if (options?.tomorrow) {
        view = 2
    }
    if (options?.simple){
        apiVersion = ''
        view = ''
        opt = '?format=4'
    }
    if (options?.detail){
        apiVersion = 'v2.'
    }
    try {
        const weather: any = await w('/' + city + opt + view,apiVersion)
        return weather.data
    } catch (err) {
        console.log(err);
    }
}


