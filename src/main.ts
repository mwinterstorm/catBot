import express, { Express, Request, Response, Application } from 'express';
import dotenv from 'dotenv';
dotenv.config({ path: `.env.${process.env.NODE_ENV}` });
import { MatrixAuth, MatrixClient, SimpleFsStorageProvider, AutojoinRoomsMixin, RustSdkCryptoStorageProvider } from 'matrix-bot-sdk';

const homeserverUrl = process.env.MATRIX_BASE_URL || '';
async function login(homeserverUrl: string) {
    const auth = new MatrixAuth(homeserverUrl);
    const botUser = process.env.BOT_USER || '';
    const botPass = process.env.BOT_PASS || '';
    const authclient = await auth.passwordLogin(botUser, botPass);
    return authclient.accessToken
}
const accessToken = process.env.BOT_TOKEN || '';
const storage = new SimpleFsStorageProvider("catbot.json");
if (accessToken != '') {

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
        if (!body?.startsWith("!hello")) return;

        // Now that we've passed all the checks, we can actually act upon the command
        // console.log("here");

        if (Math.random() <= 0.1) {
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
    login(homeserverUrl).then(token => {
        console.log("CatBot needs a valid access token");
        console.log("Copy this access token to your bot's .env: ", token);
        console.log("Also delete folder /crypt before restart");

    })
}