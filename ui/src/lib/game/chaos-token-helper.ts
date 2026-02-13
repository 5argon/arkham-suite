import { ChaosToken } from '@5argon/arkham-kohaku'
import { u } from '@5argon/arkham-string'

export function chaosTokensToString(tokens: ChaosToken[]): string {
	return u.chaosTokensToString(tokens)
}

export function chaosTokenToString(token: ChaosToken): string {
	return u.chaosTokenToString(token)
}
