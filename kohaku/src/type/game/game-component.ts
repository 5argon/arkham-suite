export type GameComponent = ChaosToken

export enum ChaosToken {
	TokenP1,
	Token0,
	TokenM1,
	TokenM2,
	TokenM3,
	TokenM4,
	TokenM5,
	TokenM6,
	TokenM7,
	TokenM8,
	TokenSkull,
	TokenCultist,
	TokenTablet,
	TokenElderThing,
	TokenAutofail,
	TokenElderSign,
	TokenFrost,
    TokenBless,
    TokenCurse
}

/**
 * Stable ArkhamDB / ArkhamCards string code for each chaos token. This is the
 * game-wide token vocabulary used wherever tokens are addressed by string —
 * e.g. campaign-data's `chaosToken` inference (`tablet`, `elder_thing`, `frost`)
 * and the recorded final-chaos-bag keys in arkham.life. Symbol tokens use the
 * canonical ArkhamCards ids; numeric tokens use signed strings.
 */
export const chaosTokenCode: Record<ChaosToken, string> = {
	[ChaosToken.TokenP1]: '+1',
	[ChaosToken.Token0]: '0',
	[ChaosToken.TokenM1]: '-1',
	[ChaosToken.TokenM2]: '-2',
	[ChaosToken.TokenM3]: '-3',
	[ChaosToken.TokenM4]: '-4',
	[ChaosToken.TokenM5]: '-5',
	[ChaosToken.TokenM6]: '-6',
	[ChaosToken.TokenM7]: '-7',
	[ChaosToken.TokenM8]: '-8',
	[ChaosToken.TokenSkull]: 'skull',
	[ChaosToken.TokenCultist]: 'cultist',
	[ChaosToken.TokenTablet]: 'tablet',
	[ChaosToken.TokenElderThing]: 'elder_thing',
	[ChaosToken.TokenAutofail]: 'auto_fail',
	[ChaosToken.TokenElderSign]: 'elder_sign',
	[ChaosToken.TokenFrost]: 'frost',
	[ChaosToken.TokenBless]: 'bless',
	[ChaosToken.TokenCurse]: 'curse'
};

/** Reverse lookup: ArkhamDB token code → `ChaosToken`. */
export const chaosTokenByCode: Record<string, ChaosToken> = Object.fromEntries(
	Object.entries(chaosTokenCode).map(([token, code]) => [code, Number(token) as ChaosToken])
);

/** Canonical display/iteration order of the chaos bag (matches the printed sheet). */
export const chaosTokenOrder: ChaosToken[] = [
	ChaosToken.TokenP1,
	ChaosToken.Token0,
	ChaosToken.TokenM1,
	ChaosToken.TokenM2,
	ChaosToken.TokenM3,
	ChaosToken.TokenM4,
	ChaosToken.TokenM5,
	ChaosToken.TokenM6,
	ChaosToken.TokenM7,
	ChaosToken.TokenM8,
	ChaosToken.TokenSkull,
	ChaosToken.TokenCultist,
	ChaosToken.TokenTablet,
	ChaosToken.TokenElderThing,
	ChaosToken.TokenAutofail,
	ChaosToken.TokenElderSign,
	ChaosToken.TokenFrost,
	ChaosToken.TokenBless,
	ChaosToken.TokenCurse
];