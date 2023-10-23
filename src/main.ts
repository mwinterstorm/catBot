import express, { Express, Request, Response, Application } from 'express';
import dotenv from 'dotenv';
dotenv.config({ path: `.env.${process.env.NODE_ENV}` });
import { MatrixAuth, MatrixClient, SimpleFsStorageProvider, AutojoinRoomsMixin, RustSdkCryptoStorageProvider } from 'matrix-bot-sdk';

const storage = new SimpleFsStorageProvider("catbot.json");

const homeserverUrl = process.env.MATRIX_BASE_URL || 'invalid_homeserver';
if (homeserverUrl == 'invalid_homeserver') {
    throw new Error('Meow! Please add your matrix homeserver URL to your .env file')
}

const accessToken = process.env.BOT_TOKEN || 'invalid_token';
if (accessToken != 'invalid_token') {

    const cryptoProvider = new RustSdkCryptoStorageProvider("./crypt");
    const client = new MatrixClient(homeserverUrl, accessToken, storage, cryptoProvider);
    AutojoinRoomsMixin.setupOnClient(client);
    client.on("room.message", handleCommand);
    client.start().then(() => console.log("meow! catBot started!"));

    async function handleCommand(roomId: string, event: any) {
        const body = event['content']['body'];
        const sender = event.sender
        const timeS = new Date(event.origin_server_ts).toLocaleString()
        console.log(timeS + ' - ' + sender + ': ' + body);

        // Don't handle unhelpful events (ones that aren't text messages, are redacted, or sent by us)
        if (event['content']?.['msgtype'] !== 'm.text') return;
        if (event['sender'] === await client.getUserId()) return;

        // Check to ensure that the `!hello` command is being run
        // if (!body?.startsWith("!hello")) return;

        // Now that we've passed all the checks, we can actually act upon the command
        // console.log("here");

        if (Math.random() <= 0.01) {
            await client.replyNotice(roomId, event, "Hi! It's me CatBot!");
        }
    }

    const app: Application = express();
    const port = process.env.PORT || 5508;

    app.get('/', (req: Request, res: Response) => {
        res.json({ meow: 'meow! catbot is a-ok!', });
    });

    app.listen(port, () => {
        console.log(`meow! catbot is listening at http://localhost:${port}`);
    });
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
export { }