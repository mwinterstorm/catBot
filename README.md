# catBot
A matrix bot.
I'm redoing [catBot_red](https://github.com/mwinterstorm/catbot_red) (a matrix bot based on node red). This is not ready for prime time - see implemented features below.

## Features
1. [x] Emote reactions to certain phrases
1. [ ] Message replies
1. [ ] Updates its profile pic from cat pictures
1. [ ] Cat facts from cat fact api

## Integrations
1. [ ] Nightscout 
1. [ ] Home Assistant
1. [ ] Unifi Protect

## Admin
1. [ ] Admin dash to add react phrases / enable integrations etc (currently through config JSON files)
1. [ ] Installation script to set up DB and write .env file

# Config
1. For all files in /config, appending .local to the name will override the defaults
1. You can edit these files to add more reactions, e.g.:
    1. initReactDb.json - is what the emote reactions DB is initialised with
    1. currently only initialises these once, you will need to delete db records to amend an existing entry (it will add new entries)

# Installation
1. Need to install and run mongoDB (e.g. on macos run ```brew services run mongodb-community```)
1. Script coming soon
   