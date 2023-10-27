import express, { Request, Response, Application } from 'express';
import dotenv from 'dotenv';
dotenv.config({ path: `.env.${process.env.NODE_ENV}` });
import { MatrixAuth } from 'matrix-bot-sdk';
import mongoose from 'mongoose';

import { matrix } from './matrix'
import { initialiseDB } from './setup/initialiseDB';
import { getAbout } from './helpers';
import addStats, { initialiseStats } from './modules/stats';
// import { catbotResponds } from './modules/catbotResponds';

export const lastlaunchtime = new Date()

// Get errors for rejected promises
process.on('unhandledRejection', (reason, p) => {
    console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
    // application specific logging, throwing an error, or other logic here
  });

// Database storage
const mdbURL = process.env.DB_URL + ':' + process.env.DB_PORT
const mdbDatabase = 'catbot'
try {
    await mongoose.connect(`mongodb://${mdbURL}/${mdbDatabase}`)
    console.log('meow! DB connected');
    initialiseDB()
} catch (err) {
    console.error(err)
}

const homeserverUrl = process.env.MATRIX_BASE_URL || 'invalid_homeserver';
if (homeserverUrl == 'invalid_homeserver') {
    throw new Error('Meow! Please add your matrix homeserver URL to your .env file')
}

const accessToken = process.env.BOT_TOKEN || 'invalid_token';
if (accessToken != 'invalid_token') {

    // initialise matrix connection and processing
    await matrix(homeserverUrl, accessToken)

    // initialise api 
    const app: Application = express();
    const port = process.env.PORT || 5508;

    app.get('/', async (req: Request, res: Response) => {
        res.json({ 
            meow: 'meow! catbot is a-ok!', 
            runningSince: lastlaunchtime.toLocaleString('en-NZ'),
            version: (await getAbout()).version,
            author: (await getAbout()).author, 
        });
    });

    app.listen(port, () => {
        console.log(`meow! catbot is listening at http://localhost:${port}`);
    });

    //initialise stats
    await initialiseStats()
    addStats('totalActivity',null,'kittyServer','restart')
} else {
    const auth = new MatrixAuth(homeserverUrl);
    const botUser = process.env.BOT_USER || 'invalid_user';
    const botPass = process.env.BOT_PASS || 'invalid_pass';
    if (botUser == 'invalid_user' || botPass == 'invalid_pass') {
        throw new Error('Meow! Please register a bot user and add username / password to .env file');
    }
    const authclient = await auth.passwordLogin(botUser, botPass);
    console.log("CatBot needs a valid access token");
    console.log("Copy this access token to your bot's .env: ", authclient.accessToken);
    console.log("Also delete folder /crypt before restart");
}
export default {}