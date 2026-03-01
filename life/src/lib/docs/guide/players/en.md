<script>
	import { FaIconType } from '@5argon/arkham-life-ui';
	import DocButton from '$lib/docs/_components/DocButton.svelte';
</script>

## Players and UIDs

Inside `.ahlifedb` is a list of **players**: yourself (the owner) plus anyone else you record on behalf of (family at your table, say). Each player has a **UID**, which is a short code like `ABC-2DE-FGH`. This generation is offline and actually has no guarantee of conflict avoidance. But in typical use there should be no problem.

Not only are the UIDs used within the same `.ahlifedb` to identify the same player, they also allow the import / export feature of `.ahlifecam` to reconcile and integrate automatically.

For example, say you (A and B, maintained in the same `.ahlifedb`) just played with someone (C) you met for the first time, who is also maintaining their own `.ahlifedb` that only contains C themself. After the campaign ended, they say they would like to archive the campaign into their own `.ahlifedb` to get the card usage into the player. You want to do so too, but both sides want to avoid duplicating the data input work if possible. With `.ahlifecam` exporting, only one side has to do the work, and the other side just imports.

Both of you (A and B) would be "guests" in their `.ahlifedb`. But this guest can be freely assigned any arbitrary UID. If you tell them the correct UIDs of A and B, however, magic occurs when importing. The campaign loads on your side with A and B (who were guests there) turned into real players without any fix-ups, and C instead becomes a guest from your viewpoint. (It is still possible to change the mapping to anything you want when importing. It's just more convenient with matching UIDs.)

## Play Groups

Once you have a few players in your `.ahlifedb`, you can bundle some of them into a **play group**. A play group is just a name (like "Thursday Night Crew") and a list of members picked from your players. A player can be in as many groups as you want.

The point of a play group is the combined profile. Every player already compiles into their own profile, but a play group compiles into one shared profile that aggregates across all of its members at once. You get the group's collective card usage, investigators played, campaign clears, endings, and everything else, as if the whole table were a single subject. It is handy for seeing how your regular group is doing together, on top of how each person is doing alone.

This is purely a viewing convenience, and it changes nothing about your data. A play group does not touch your campaigns or alter who participated in them. Members are stored as references to your players, so the group always reflects whoever is currently in it. Add or remove a member and the shared profile just recompiles around the new lineup. Delete the group and none of your campaigns or players are affected at all.

Overlapping players between play groups is possible, and I believe is quite a common pattern. For example, A and B live in the same home and could play 2P games together often, but every once in a while A, B, and C meet up to play 3P campaigns. You can have a Play Group for both [A, B] and [A, B, C].
