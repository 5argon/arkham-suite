# Icons from arkham.build

SVGs for icons that are not in the ArkhamCards IcoMoon export (`../selection.json`, `../svg/`).
That project belongs to ArkhamCards, so nothing is added to it; `../generate.ts` turns every SVG in
this folder into a component as well.

Source: arkham.build's own IcoMoon project for encounter icons,
[`frontend/src/assets/icomoon/arkham.build_ encounters.json`](https://github.com/fspoettel/arkham.build/tree/main/frontend/src/assets/icomoon).
The paths are copied as-is from that project (no tracing), so they match the glyphs in arkham.build's
`encounters.woff2`.

| File | Glyph name in the project | What it is |
| --- | --- | --- |
| `traces_to_nowhere_pack.svg` | `traces_to_nowhere_pack` | Traces to Nowhere (scenario pack) product symbol |
| `traces_to_nowhere.svg` | `traces_to_nowhere` | Traces to Nowhere encounter set |
| `dimensional_madness.svg` | `dimensional_madness` | Dimensional Madness encounter set |

To add more, download that JSON and run, from `icon/`:

```
node tool/extract-arkham-build.mjs "<path to arkham.build_ encounters.json>" tool/svg-arkham-build <glyph names…>
```
