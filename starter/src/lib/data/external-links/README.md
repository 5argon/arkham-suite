# Adding Your Content To "Explore Investigator Expansion"

In this folder, you will see `.json` files with name of abbreviated cycle name. Make a pull request with your edit and
it'll be online after I merge and rebuild the site. You can always append your edit after the final item in the array,
the renderer will sort contents coming from you closer together.

You can just learn from existing file `fhv.json` and compare with the website what each field does, or read the details
below.

## JSON Format

Starts as an array (`[ ]`), inside contains objects of this format :

- `site` : Name of your content site, not the name of your article. They are sorted by this first, so it is important to
  make each entry from the same auther having the same `site`.
- `name` : Article's name.
- `url` : URL to get to your content. If your content is a blog and it suports readable URL that changes when you rename
  the article, beware of causing links here to be broken. (Your content management system might support a more fixed URL
  that won't change according to your article's name.)
- `date` (Optional) : It sort your newest stuff up top if you provide the date. The format is `YYYY-MM-DD`.
- `cards` (Optional) : If your content talk about a specific card inside the expansion, having this array will put your
  content on the 2nd tab where it could show small image of cards. Viewer curious about only a specific card will be
  more interested in your content this way. Input the card ID that is the same as in `arkhamdb.com`. This is an array of
  string even if there is only one card.
