# Icon System

This directory contains the Font Awesome icon system for the UI package.

## Components

### FaIcon

A Svelte 5 component that renders Font Awesome icons as SVG with full Tailwind styling support.

**Props:**
- `icon: FaIconType` - The icon type to display (required)
- `spin?: boolean` - Whether to animate the icon with a spinning effect (default: false)
- `class?: string` - Additional CSS classes to apply

**Usage:**

```svelte
<script lang="ts">
  import { FaIcon, FaIconType } from '@5argon/arkham-ui';
</script>

<FaIcon icon={FaIconType.Customizable} />
<FaIcon icon={FaIconType.Loading} spin />
<FaIcon icon={FaIconType.Permanent} class="text-red-500" />
```

### FaIconType Enum

An enum containing all available icon types:

- **Card Properties**: `Customizable`, `Bonded`, `Exceptional`, `Permanent`, `Myriad`, `Weakness`, `AnyWeakness`, `InvestigatorRestriction`, `Investigator`
- **UI Controls**: `Plus`, `Minus`, `Delete`, `Expand`, `Collapse`, `Grip`
- **Navigation**: `RightSingle`, `RightDouble`, `ArrowUp`, `ArrowDown`, `ArrowLeftBordered`, `ArrowRightBordered`, `FoldoutRight`, `FoldoutDown`
- **Notifications**: `NoticeInfo`, `NoticeSuccess`, `NoticeError`
- **Misc**: `Loading`, `Manual`, `CheckBox`, `CheckBoxChecked`, `Experience`, `Unlock`, `Explosion`

## Implementation Notes

- Icons are rendered using the `SvgIcon` wrapper for consistent sizing (w-4 h-4 by default)
- SVG files are located in `/static/fa/` directory
- Icons can be colored using Tailwind's `text-*` classes
- The component is fully compatible with Svelte 5's runes system
