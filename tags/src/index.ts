// Core model
export * from "./type.js"; // TaggedCard, BoostValue, HealTarget, TimingQualifier
export * from "./base.js"; // TagBase, CompoundTagBase
export * from "./tag-type-union.js"; // TagType
export * from "./tag-interface-union.js"; // Tag (+ all Tag* interfaces)

// All TagType* enum objects + Tag* interfaces (generated barrel)
export * from "./tags/index.js";

// Compound tag data (CompoundTagType enum + compoundTags + individual consts)
export * from "./compound-tags/compound-tags.js";

// Groups + i18n display strings (the first-class, named grouping layer)
export * from "./tag-group.js";
export * from "./strings.js";

// Tooling. The tagged cards are NOT exported as TS objects — the only way to consume
// them is the published `@5argon/arkham-tags/cards.json`: `hydrate()` it into typed
// cards, then `createRepository()` to query them. `query.js` holds the pure
// compound-definition helpers (membership / where-matching), needing no card data.
export * from "./hydrate.js";
export * from "./repository.js";
export * from "./query.js";

// Kohaku re-exports so consumers don't need to depend on kohaku directly
export * from "./kohaku.js";
