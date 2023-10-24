import { reaction } from "../modules/catbotReacts";
import fs from 'fs'

export async function initialiseDB() {
    const reactions = (fs.existsSync('config/initReactDb.json.local')) ? JSON.parse(fs.readFileSync('config/initReactDb.json.local', { encoding: 'utf-8' })) : JSON.parse(fs.readFileSync('config/initReactDb.json', { encoding: 'utf-8' }))    
    let list = []
    for (let i = 0; i < reactions.length; i++) {
        let reactItem = reactions[i]
        let result = await reaction.findOneAndUpdate({ reactType: reactItem.reactType }, reactItem, { upsert: true, new: true, rawResult: true })
        list.push(' ' + reactItem.reactType)
        result.value instanceof reaction
    }
    console.log('meow! initialised' + list + ' reactions in DB');
    return
}