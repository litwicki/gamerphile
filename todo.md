# Class Colors

I want to add css class colors to the app that can be called on demand to colorize foreground, background, and border colors.

This page has the table of colors: https://wowpedia.fandom.com/wiki/Class_colors

I want to be able to reference them like this, for a "Warrior" for example:

- bg-warrior (this makes the background color match that of the warrior class color)
- border-warrior(this makes the border color match that of the warrior class color)
- text-warrior (this makes the text color match that of the warrior class color)

I also want there to be a "muted" version of each; bg-warrior-muted, text-warrior-muted, and so on.

# Update API Types

The API types are woefully insufficient. We need to ensure ALL API Types are captured based on the game-data-apis here: https://community.developer.battle.net/documentation/world-of-warcraft/game-data-apis

We also need to ensure all Profile APIs are captured: https://community.developer.battle.net/documentation/world-of-warcraft/profile-apis

# App Routes

I want to plan for the following routes, we'll map these to API data later.

## Global Routes

## Realm specific routes

- Realm details: /{realm}/{region}

- Character details: /{realm}/{region}/{character}
example: hyjal/us/thezdin
- Character details edit: /{realm}/{region}/{character} (requires logged in user has this character in their profile)

Guild details: /{realm}/{region}/{guildname}
Guild details edit: /{realm}/{region}/{guildname}/edit (requires verification logged in user has a character in their profile that matches the guild leader of the guild)

## Character Routes

M+ page /{realm}/{region}/{character}/keys
Raid page /{realm}/{region}/{character}/raids
Log page /{realm}/{region}/{character}/logs
UI page /{realm}/{region}/{character}/ui