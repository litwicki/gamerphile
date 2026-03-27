# Implement Client API wrapper for Raider.IO

Based on this API create a wrapper we can use to fetch data: https://raider.io/api. Use the RAIDERIO_API_KEY env variable already set.

Add a footer link to https://raider.io using this logo (resized to max 40px height): https://cdn.raiderio.net/images/brand/Logo_2ColorWhite.svg

Add a footer link to https://warcraftlogs.com using this logo (resized to max height 40px): https://assets.rpglogs.com/img/warcraft/header-logo.png?v=4

# Layouts and Components

Set public/voidspire.png as the website background as a paralax.
Create and set the default theme "Midnight" by analyzing the colors in ./public/voidspire.png and creating a theme from it. Make this the default theme used on the website.

If the user is not logged in, next to the "sign in" button add a cog iconbutton. Clicking this button opens a menu with options to select which region they want to set as their default.

Can be a primary region: world, us, eu, kr, tw. Or a subregion: english, french, german, italian, oceanic, russian, spanish, eu-english, eu-portuguese, eu-spanish, us-english, brazil, us-spanish, us-central, us-eastern, us-mountain, us-pacific

"World" is default.

## Profile Page

Add a "profile" page for authenticated users, and include a dropdown allowing users to select a theme from the class themes we created. This should include a "Default" theme.

## Create RSS component that will render cards based on a provided feed URL

Create a rss component that displays rss objects as cards

## Bento Grid for the home page

Create a bento grid on the home page with the following sections: Blue Tracker, Leaderboards, UI, Gamers. The grid should look like this: https://shadcnstudio.com/preview/bento-grid/bento-grid/bento-grid-17

### Blue Tracker
I want the left column to be blue tracker rss items from https://www.wowhead.com/blue-tracker?rss

### Leaderboards

I want the middle top section to be a leaderboards section of top ranking Raiding or M+ (tab selections)
Using the "raid-rankings" API, display a raid rankings hierarchy like seen in ./raid_rankings.png

Do the same for "/api/v1/mythic-plus/static-data" and render this leaderboard section with the ability for the user to switch between RAID | M+ displays.

### User Interface
I want the middle bottom section to be UI

### Gamers
I want the right section to be "Gamers" and I want this section to be it's own 3x3 grid of character cards