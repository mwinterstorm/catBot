# catBot
A matrix bot.
I'm redoing [catBot_red](https://github.com/mwinterstorm/catbot_red) (a matrix bot based on node red). This is not ready for prime time - see implemented features below.

## Features
1. [x] Emote reactions to certain phrases
1. [ ] Message replies
1. [ ] Updates its profile pic from cat pictures
1. [ ] Cat facts from cat fact api
1. [ ] Weather

## Integrations
1. [ ] Nightscout 
    1. [x] ```sugar``` - reply with current sugar
    1. [ ] ```sugar graph``` - reply with graph of past 4 hours sugar
    1. [ ] automatic blood sugar alerts
1. [ ] Home Assistant
    1 [ ] get locations of everyone
1. [ ] Unifi Protect
    1. Doorbell / camera integration
1. [ ] fireApp / yahoo finance
    1. [ ] automatic daily summary

## Admin / other
1. [ ] implement user roles 
1. [ ] Admin dash to add react phrases etc / enable integrations etc (currently through config JSON files)
1. [ ] Installation script to set up DB and write .env file


# Config
1. For all files in /config, appending .local to the name will override the defaults
1. You can edit these files to add more reactions, e.g.:
    1. initReactDb.json - is what the emote reactions DB is initialised with
    1. will update reactDB if changed on each catbot restart ~~currently only initialises these once, you will need to delete db records to amend an existing entry (it will add new entries)~~ 

# Installation
1. Need to install and run mongoDB (e.g. on macos run ```brew services run mongodb-community```)
1. pull repo ```gh repo clone mwinterstorm/catBot```
1. install dependancies ```npm install```
1. run 
    - deploy with pm2 using local .env: ```NODE_ENV=development.local pm2 start -n catbot node -- --no-warnings --experimental-specifier-resolution=node --loader ts-node/esm src/main.ts```
    - without pm2  ```node --no-warnings --experimental-specifier-resolution=node --loader ts-node/esm src/main.ts```
    - dev mode ```npm run dev```
1. Script coming soonish to install / start database / set up local .env

# Update
1. run ```bash update.sh``` to update
    - requires to have been start with PM2 as above

   