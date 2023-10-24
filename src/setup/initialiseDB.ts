import { reaction } from "../modules/catbotReacts";
import fs from 'fs'

export async function initialiseDB() {
    const reactions = (fs.existsSync('config/initReactDb.json.local')) ? JSON.parse(fs.readFileSync('config/initReactDb.json.local', { encoding: 'utf-8' })) : JSON.parse(fs.readFileSync('config/initReactDb.json', { encoding: 'utf-8' }))
    for (let i = 0; i < reactions.length; i++) {
        let reactItem = new reaction(reactions[i])
        console.log('meow! initialising ' + reactItem.reactType + ' reactions in DB');
        reaction.findOneAndUpdate({ reactType: reactItem.reactType }, reactItem, { upsert: true })
    }
    return
}