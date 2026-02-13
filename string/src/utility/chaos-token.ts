import { ChaosToken } from '@5argon/arkham-kohaku'
import * as m from '../paraglide/messages.js'

export function chaosTokensToString(tokens: ChaosToken[], tokenSuffix?: boolean): string {
	return tokens.map((x) => chaosTokenToString(x, tokenSuffix)).join(', ')
}

export function chaosTokenToString(token: ChaosToken, tokenSuffix?: boolean): string {
	const suffix = tokenSuffix ? ` ${m.gameChaosTokenToken()}` : ''
	switch (token) {
		case ChaosToken.Token0:
			return '0' + suffix
		case ChaosToken.TokenM1:
			return '-1' + suffix
		case ChaosToken.TokenM2:
			return '-2' + suffix
		case ChaosToken.TokenM3:
			return '-3' + suffix
		case ChaosToken.TokenM4:
			return '-4' + suffix
		case ChaosToken.TokenM5:
			return '-5' + suffix
		case ChaosToken.TokenM6:
			return '-6' + suffix
		case ChaosToken.TokenM7:
			return '-7' + suffix
		case ChaosToken.TokenM8:
			return '-8' + suffix
		case ChaosToken.TokenP1:
			return '+1' + suffix
		case ChaosToken.TokenSkull:
			return m.gameChaosTokenSkull() + suffix
		case ChaosToken.TokenCultist:
			return m.gameChaosTokenCultist() + suffix
		case ChaosToken.TokenTablet:
			return m.gameChaosTokenTablet() + suffix
		case ChaosToken.TokenElderThing:
			return m.gameChaosTokenElderThing() + suffix
		case ChaosToken.TokenAutofail:
			return m.gameChaosTokenAutofail() + suffix
		case ChaosToken.TokenElderSign:
			return m.gameChaosTokenElderSign() + suffix
		case ChaosToken.TokenFrost:
			return m.gameChaosTokenFrost() + suffix
		case ChaosToken.TokenBless:
			return m.gameChaosTokenBless() + suffix
		case ChaosToken.TokenCurse:
			return m.gameChaosTokenCurse() + suffix
		default:
			return 'Unknown' + suffix
	}
}
