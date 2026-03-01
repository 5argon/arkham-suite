<script>
	import { FaIconType } from '@5argon/arkham-life-ui';
	import DocButton from '$lib/docs/_components/DocButton.svelte';
</script>

## The three file types

arkham.life can produce three kinds of file. Everything is actually just a `.json` text file that is compressed.

- **`.ahlifedb` — your whole database.** Every campaign, every player (you and everyone at your table), and every play group, in one compressed file. You can recompile anyone's profile from it. This is your real save file. **Save** and **Load** it on **Save / Load Database**. A plain `.json` version is available there too, for inspection. You get the same thing if you rename `.ahlifedb` to `.zip`, unzip it, then rename it to `.json`. Uncompressed, the size could reach ~10 MB after multiple years of play.
- **`.ahlifecam` — one shared campaign.** A single campaign baked with each participant's UID, name, and choice of card used as the icon. The purpose of exporting one campaign, instead of saving `.ahlifedb`, is so you can hand it to other players (not someone in your frequent play group whose player you maintain) who maintain their own `.ahlifedb`, to add it to their own database. Bulk export of selected campaigns is possible.
- **`.ahlifepro` — one compiled profile.** A precomputed, render-ready snapshot of a single player's or play group's profile. A plain `.json` version is available for inspection too. There are no longer any campaigns or decks, only insights. It is impossible to get any decks or any archived campaigns back from this file. Usually you view profiles compiled fresh from the database that you are currently working on in the browser. But with `.ahlifepro`, you can view any unrelated profile of someone else with this site's viewer.

## Online profile viewing

Besides loading `.ahlifepro` from your computer to view it directly, no one really wants to share their own profile online by handing you the download link to `.ahlifepro`.

Instead, they can upload `.ahlifepro` to one of the compatible hosting services and point the viewer page there with URL parameters. The viewer page would download the self-hosted `.ahlifepro` for the viewer. This is essentially a way to take a profile online. Now they can share that slightly ugly link with anyone on the internet to come view it. More importantly, the management and potential loss of access to further update this profile is not my responsibility. Yeah!

How to do this is coming soon.
