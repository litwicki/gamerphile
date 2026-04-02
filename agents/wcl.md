# Warcraft logs and more..

Implement a full warcraft logs client and API wrapper. Let's name that internally "wcl" for short. Here's the full documentation: https://www.warcraftlogs.com/v2-api-docs/warcraft/query.doc.html

I want to be able to query for individual character details like their latest public log data, their overall percentile on parses, and so son.

## RaiderIO Rank Coloring

Implement M+ rank coloring using these colors: https://raiderio-color.wisak.me/. These are available via the raider.io API: https://raider.io/api#/mythic_plus/getApiV1MythicplusScoretiers. All M+ ratings should be printed with the color coding applied.

## Character page widgets

### Raid Progress

- Add region and world rank to raid progress
- Add a "see more" button that expands the widget to include a table of all raid bosses and whether or not they've been killed.
- The table should include 3 small tabs (Normal, Heroic, Mythic). Clicking on a tab changes the table to the progression for that difficulty. If there is 0 progress in a difficulty, disable the tab.

### M+ Rating

Add an overall color coded value for their Realm Rank, Region Rank, and World Rank

Add a tab for each spec, and clicking the tab changes the widget to display the values for that spec. If there is no data for that spec, disable the tab.

Change the background of the tab to be the image corresponding to the spec. For example if Protection spec for Warrior, display the protection spec Shield image as the background of the tab.

### M+ History

Fix the layout for each record to look like this

[bold]Windrunner Spire[/bold]       {key_level}
372.5 26:25
---
[bold]Skyreach[/bold]               {key_level}
368.2 25:33

Rather than linking to the raider.io page with the details of that run, clicking the item expands that row to reveal a table of players and specs. Clicking on a player will load a modal that has the full table of details for that run including their role, character name, ilvl, trinkets, tier set pieces, talent summary, score, and finally a cog wheel that opens a menu:

> Copy Talents
> Character Profile
> View Gear
> Videos

## Warcraft Logs

Update the warcraft logs widget to include their character data from warcraft logs

## Responsive layout

When in mobile responsive view, render the top 50% of the character image as the hero section with their name, spec, race, class, and realm/region overlaying the image.

Add support for ultrawide mode on the character page so it responds accordingly.