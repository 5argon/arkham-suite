<script>
	import { FaIconType } from '@5argon/arkham-life-ui';
	import DocButton from '$lib/docs/_components/DocButton.svelte';
</script>

## Purposes

Say you wanted to look back at all your previous Arkham Horror LCG campaigns. The campaign logs are that. With this site, you can take the time to go through all of them and digitize them into one file that I call "database".

You may soon be curious about aggregated statistics, such as what cards or investigators you haven't played yet or played too much. This tool can compile all your past campaigns inside the database into "profiles" that let you take a look at new insights. It automatically does so for each player in your play group, and also makes a bonus insight for your entire play group together.

It is deliberately designed to have no registration and social pressure. There is nothing collecting your plays into global scoreboards or trends or anything like that. This might be unexpected compared to how these types of stats-keeping sites work on other online competitive games, but I'm guessing the player base of this game might actually align with the tool working this way more than I thought? I hope?

With some hoops removed, it comes with new hoops and quirks I need to explain below.

## It's a browser-based file editing tool

Nothing is online. You are working on a database file called `.ahlifedb`, containing everything from your campaign logs, all upgrades of all the decks used (copied completely, no longer tied to online deckbuilders / hosting service like `arkhamdb.com` or `arkham.build`), and the assignments to players so it can determine the same player across different campaigns.

You **Save** and **Load** this `.ahlifedb` file to and from your computer, just like any desktop program that does things. The words **Save** and **Load** are used deliberately for the `.ahlifedb` database file, to make you treat it like saving real work rather than making an optional backup. (Other file types like `.ahlifecam` and `.ahlifepro` keep the words **Import** and **Export**, because those are about moving a piece of data in and out, not saving your main work.) Except that, when you close the browser without saving your work, it seems to magically still keep your work there. It's a built-in browser storage feature called <a href="https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API" target="_blank" rel="noopener noreferrer">IndexedDB</a>, and it is important that you know this is not a hosting or something that you can rely on forever. What is stuck in the browser should be thought of as **unsaved work**.

The browser can **delete this data without warning**. For example, this can happen if you clear site data or browsing history, use private/incognito mode, or your device runs low on disk space. Reloading the page is safe (your data is still there), but a browser cleanup is not. If that wipe happens and you never saved, the data is simply gone.

Don't think of saving `.ahlifedb` as "creating a backup". Think of it as typical saving of your work!

<DocButton href="/database" label="Save .ahlifedb" icon={FaIconType.Export} />

## Instant navigation & offline readiness

This site is made with Svelte and it has some ability to preload pages that you didn't even visit yet. When you know about this mechanic, combined with the fact above that all the work only modifies the in-browser IndexedDB, it is possible to continue working and saving even while internet access is lacking.

A word on what this does and doesn't do. This makes navigation **instant for your current browsing
session**: once a section is readied, you can wander around it even if your connection drops. It is
**not yet full offline mode**, so note these limits:

- Don't press refresh, or it's going to ask for internet again.
- Card **images** come from an image server, so they only appear if they've been **loaded before**.
- Pages full of art you've never opened may show blank cards while offline, everything else still works.

Your **database**, though, is always available with no connection at all. The only enemy is your browser clearing it.
