#!/usr/bin/env node
/**
 * Development tool: download every campaign of an ArkhamCards account, including the uploaded ones
 * that the app's own "Backup Campaign Data" leaves out.
 *
 * Signs in to the account, then runs the same GraphQL queries the app runs. The Firebase project and
 * API keys are read from a local clone of the ArkhamCards repository.
 *
 * Signing in is with Google by default: a page on a local server opens in the browser, first shows
 * whether ArkhamCards' sign-in service accepts it, and posts the tokens back after the Google popup.
 * With `--email`, it is with email and password instead.
 *
 * Writes two files:
 * - `arkhamcards-cloud-<time>.json`: the server's records as returned, nothing converted.
 * - `ACB-cloud-<time>.acb`: the same campaigns in the app's backup format (version 1), the format
 *   "Restore Campaign Data" reads. With `--merge <app backup>`, the app backup's local campaigns are
 *   added and the file is named `ACB-all-<time>.acb`.
 *
 * Usage:
 *   node life/scripts/arkhamcards-export.mjs [--out <dir>] [--merge <file.acb>] [--arkhamcards <clone>] [--email]
 *
 * With `--email`, the email and password are asked for in the terminal, or read from
 * ARKHAMCARDS_EMAIL and ARKHAMCARDS_PASSWORD. Nothing about the sign-in is stored.
 */
import { execFile } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { homedir } from 'node:os';
import { join, resolve } from 'node:path';
import { createInterface } from 'node:readline/promises';
import { pathToFileURL } from 'node:url';
import { parseArgs } from 'node:util';

const GRAPHQL_URL = 'https://gapi.arkhamcards.com/v1/graphql';
const HASURA_CLAIMS = 'https://hasura.io/jwt/claims';
const CONCURRENCY = 4;

/** The app's fragments (`src/data/graphql/fragments.graphql`) that the queries below use. */
const FRAGMENTS = `
fragment UserInfo on users {
  id
  handle
}
fragment GuideInput on guide_input {
  id
  campaign_id
  step
  scenario
  type
  payload
}
fragment GuideAchievement on guide_achievement {
  id
  campaign_id
  type
  value
  bool_value
}
fragment IdDeck on campaign_deck {
  id
  owner_id
  arkhamdb_id
  local_uuid
  campaign_id
}
fragment FullChaosBagResult on chaos_bag_result {
  id
  bless
  curse
  drawn
  sealed
  totalDrawn
  tarot
  difficulty
  history
}
fragment MiniDeck on campaign_deck {
  ...IdDeck
  investigator
}
fragment BasicDeck on campaign_deck {
  ...MiniDeck
  arkhamdb_user
  content
  content_hash
}
fragment HistoryDeck on campaign_deck {
  ...BasicDeck
  owner {
    ...UserInfo
  }
  next_deck {
    ...IdDeck
  }
  previous_deck {
    ...IdDeck
  }
}
fragment LatestDeck on campaign_deck {
  ...BasicDeck
  owner {
    ...UserInfo
  }
  campaign {
    id
    uuid
    name
    cycleCode
  }
  investigator_data {
    id
    killed
    insane
    physical
    mental
  }
  previous_deck {
    ...BasicDeck
  }
}
fragment MiniInvestigatorData on investigator_data {
  id
  campaign_id
  investigator
  mental
  physical
  insane
  killed
  storyAssets
}
fragment FullGuideInvestigatorData on investigator_data {
  ...MiniInvestigatorData
  addedCards
  ignoreStoryAssets
  removedCards
  cardCounts
  specialXp
  availableXp
}
fragment FullInvestigatorData on investigator_data {
  ...FullGuideInvestigatorData
  spentXp
}
fragment MiniCampaign on campaign {
  id
  uuid
  name
  cycleCode
  standaloneId
  difficulty
  scenarioResults
  guided
  archived
  owner_id
  latest_decks(order_by: { owner_id: asc }) {
    deck {
      ...MiniDeck
    }
  }
  investigators(order_by: { created_at: asc }) {
    id
    investigator
    printing
  }
  investigator_data(order_by: { created_at: asc }) {
    ...MiniInvestigatorData
  }
  updated_at
}
fragment FullCampaign on campaign {
  id
  updated_at
  uuid
  name
  deleted
  cycleCode
  standaloneId
  difficulty
  campaignNotes
  chaosBag
  showInterludes
  scenarioResults
  weaknessSet
  guided
  guide_version
  tarot_reading
  archived
  owner_id
  investigators(order_by: { created_at: asc }) {
    id
    investigator
    printing
  }
  investigator_data(order_by: { created_at: asc }) {
    ...FullInvestigatorData
  }
  latest_decks(order_by: { owner_id: asc }) {
    deck {
      ...LatestDeck
    }
  }
  link_a_campaign {
    id
    uuid
  }
  link_b_campaign {
    id
    uuid
  }
  linked_campaign {
    id
    uuid
  }
}
fragment FullCampaignGuideState on campaign_guide {
  id
  uuid
  updated_at
  guide_inputs(order_by: [{ created_at: asc }, { inserted_idx: asc }]) {
    ...GuideInput
  }
  guide_achievements(order_by: { created_at: asc }) {
    ...GuideAchievement
  }
}
`;

/**
 * The app's queries (`src/data/graphql/readCampaigns.graphql`, `decks.graphql`), plus two for the
 * creation times the app doesn't read: the campaign's, and each guide input's.
 */
const QUERIES = {
	getMyCampaigns: `
query getMyCampaigns($userId: String!) {
  users_by_pk(id: $userId) {
    id
    campaigns {
      campaign {
        ...MiniCampaign
        link_a_campaign {
          ...MiniCampaign
        }
        link_b_campaign {
          ...MiniCampaign
        }
      }
    }
  }
}`,
	getCampaign: `
query getCampaign($campaign_id: Int!) {
  campaign_by_pk(id: $campaign_id) {
    ...FullCampaign
  }
}`,
	getCampaignAccess: `
query getCampaignAccess($campaign_id: Int!) {
  campaign_by_pk(id: $campaign_id) {
    id
    uuid
    owner {
      ...UserInfo
    }
    access {
      user {
        ...UserInfo
      }
    }
  }
}`,
	getCampaignGuide: `
query getCampaignGuide($campaign_id: Int!) {
  campaign_guide(where: { id: { _eq: $campaign_id } }) {
    ...FullCampaignGuideState
  }
}`,
	getChaosBagResults: `
query getChaosBagResults($campaign_id: Int!) {
  chaos_bag_result_by_pk(id: $campaign_id) {
    ...FullChaosBagResult
  }
}`,
	getDeckHistory: `
query getDeckHistory($campaign_id: Int!, $investigator: String!) {
  campaign_deck(where: { campaign_id: { _eq: $campaign_id }, investigator: { _eq: $investigator } }) {
    ...HistoryDeck
  }
}`,
	getCampaignCreatedAt: `
query getCampaignCreatedAt($campaign_id: Int!) {
  campaign_by_pk(id: $campaign_id) {
    id
    created_at
  }
}`,
	getGuideInputDates: `
query getGuideInputDates($campaign_id: Int!) {
  campaign_guide(where: { id: { _eq: $campaign_id } }) {
    id
    created_at
    guide_inputs(order_by: [{ created_at: asc }, { inserted_idx: asc }]) {
      id
      created_at
      updated_at
    }
  }
}`
};

/** Each fragment's text by name. */
const fragmentDefs = new Map(
	FRAGMENTS.split(/\n(?=fragment )/)
		.map((text) => text.trim())
		.filter(Boolean)
		.map((text) => [/^fragment (\w+)/.exec(text)[1], text])
);

/** A query with every fragment it spreads, directly or through other fragments, and no others. */
export function withFragments(query) {
	const needed = new Set();
	const visit = (text) => {
		for (const [, name] of text.matchAll(/\.\.\.(\w+)/g)) {
			if (needed.has(name)) continue;
			needed.add(name);
			visit(fragmentDefs.get(name));
		}
	};
	visit(query);
	return [query.trim(), ...[...needed].map((name) => fragmentDefs.get(name))].join('\n');
}

/** The object without its `null` and `undefined` fields. */
function defined(object) {
	return Object.fromEntries(
		Object.entries(object).filter(([, v]) => v !== null && v !== undefined)
	);
}

/** A server deck as the app's `DeckId`. */
function toDeckId(deck) {
	return deck.arkhamdb_id && deck.arkhamdb_user
		? {
				id: deck.arkhamdb_id,
				local: false,
				uuid: `${deck.arkhamdb_id}`,
				arkhamdb_user: deck.arkhamdb_user
			}
		: { local: true, uuid: deck.local_uuid ?? '' };
}

/**
 * A `FullCampaign` record as the app's local `Campaign`: the reverse of the app's
 * `useUploadNewCampaign` (`src/data/remote/campaigns.ts`). A guided campaign keeps spent XP in
 * `adjustedInvestigatorData`, an unguided one in `investigatorData`.
 */
export function toLocalCampaign(campaign) {
	const investigatorData = {};
	const adjustedInvestigatorData = {};
	for (const row of campaign.investigator_data ?? []) {
		const data = defined({
			addedCards: row.addedCards,
			removedCards: row.removedCards,
			storyAssets: row.storyAssets,
			ignoreStoryAssets: row.ignoreStoryAssets,
			insane: row.insane,
			killed: row.killed,
			mental: row.mental,
			physical: row.physical,
			specialXp: row.specialXp,
			cardCounts: row.cardCounts,
			availableXp: row.availableXp
		});
		if (campaign.guided) {
			investigatorData[row.investigator] = data;
			if (row.spentXp !== null && row.spentXp !== undefined) {
				adjustedInvestigatorData[row.investigator] = { spentXp: row.spentXp };
			}
		} else {
			investigatorData[row.investigator] = defined({ ...data, spentXp: row.spentXp });
		}
	}
	const investigatorPrintings = {};
	for (const row of campaign.investigators ?? []) {
		if (row.printing) investigatorPrintings[row.investigator] = row.printing;
	}
	const linkA = campaign.link_a_campaign;
	const linkB = campaign.link_b_campaign;
	return defined({
		uuid: campaign.uuid,
		name: campaign.name,
		difficulty: campaign.difficulty,
		cycleCode: campaign.cycleCode,
		standaloneId: campaign.standaloneId,
		lastUpdated: campaign.updated_at,
		showInterludes: campaign.showInterludes,
		deckIds: (campaign.latest_decks ?? []).flatMap((row) => (row.deck ? [toDeckId(row.deck)] : [])),
		nonDeckInvestigators: (campaign.investigators ?? []).map((row) => row.investigator),
		investigatorPrintings: Object.keys(investigatorPrintings).length
			? investigatorPrintings
			: undefined,
		guided: campaign.guided,
		guideVersion: typeof campaign.guide_version === 'number' ? campaign.guide_version : undefined,
		adjustedInvestigatorData: campaign.guided ? adjustedInvestigatorData : undefined,
		tarotReading: campaign.tarot_reading,
		archived: campaign.archived,
		investigatorData,
		chaosBag: campaign.chaosBag,
		weaknessSet: campaign.weaknessSet,
		campaignNotes: campaign.campaignNotes,
		scenarioResults: campaign.scenarioResults,
		linkUuid: linkA && linkB ? { campaignIdA: linkA.uuid, campaignIdB: linkB.uuid } : undefined,
		linkedCampaignUuid: campaign.linked_campaign?.uuid
	});
}

/**
 * A `FullCampaignGuideState` record as the app's local `CampaignGuideState`. Each input is its
 * `payload` with `step`, `scenario` and `type` put back, the reverse of `guideInputToInsert`.
 */
export function toLocalGuide(guide, campaignUuid) {
	return defined({
		uuid: guide.uuid ?? campaignUuid,
		inputs: (guide.guide_inputs ?? []).map((row) =>
			defined({ ...row.payload, step: row.step, scenario: row.scenario, type: row.type })
		),
		achievements: (guide.guide_achievements ?? []).map((row) =>
			row.type === 'count'
				? { id: row.id, type: 'count', value: row.value ?? 0 }
				: { id: row.id, type: 'binary', value: !!row.bool_value }
		),
		lastUpdated: guide.updated_at
	});
}

/** Every version of the campaign's decks made in ArkhamCards, as the app's `LocalDeck`. */
export function toLocalDecks(deckHistory) {
	const decks = [];
	for (const versions of Object.values(deckHistory ?? {})) {
		for (const row of versions) {
			if (!row.local_uuid || row.arkhamdb_id || !row.content) continue;
			const deck = { ...row.content, local: true, uuid: row.local_uuid };
			if (!deck.previousDeckId && row.previous_deck?.local_uuid) {
				deck.previousDeckId = { local: true, uuid: row.previous_deck.local_uuid };
			}
			if (!deck.nextDeckId && row.next_deck?.local_uuid) {
				deck.nextDeckId = { local: true, uuid: row.next_deck.local_uuid };
			}
			decks.push(deck);
		}
	}
	return decks;
}

/** The exported records as the app's `BackupState`. Deleted campaigns are left out. */
export function toBackup(records) {
	const campaigns = [];
	const guides = [];
	const decks = new Map();
	for (const record of records) {
		if (record.campaign.deleted) continue;
		const campaign = toLocalCampaign(record.campaign);
		campaigns.push(campaign);
		if (campaign.guided && record.guide) guides.push(toLocalGuide(record.guide, campaign.uuid));
		for (const deck of toLocalDecks(record.deckHistory)) decks.set(deck.uuid, deck);
	}
	return { version: 1, campaigns, decks: [...decks.values()], guides };
}

/** An app backup with the export added; an exported campaign, guide or deck replaces one with the same uuid. */
export function mergeBackups(appBackup, exported) {
	const byUuid = (base, extra) => {
		const map = new Map(base.map((item) => [item.uuid, item]));
		for (const item of extra) map.set(item.uuid, item);
		return [...map.values()];
	};
	return {
		version: 1,
		campaigns: byUuid(appBackup.campaigns ?? [], exported.campaigns),
		decks: byUuid(appBackup.decks ?? [], exported.decks),
		guides: byUuid(appBackup.guides ?? [], exported.guides)
	};
}

/** The Firebase project and the API keys to try, from the clone's iOS and Android config files. */
async function readFirebaseConfig(cloneDir) {
	const keys = [];
	let projectId;
	try {
		const plist = await readFile(join(cloneDir, 'GoogleService-Info.plist'), 'utf8');
		const value = (name) =>
			new RegExp(`<key>${name}</key>\\s*<string>([^<]+)</string>`).exec(plist)?.[1];
		projectId = value('PROJECT_ID');
		const key = value('API_KEY');
		if (key) {
			keys.push({
				label: 'iOS',
				key,
				headers: { 'X-Ios-Bundle-Identifier': value('BUNDLE_ID') ?? '' }
			});
		}
	} catch {
		// Not every clone has the iOS file.
	}
	try {
		const services = JSON.parse(await readFile(join(cloneDir, 'google-services.json'), 'utf8'));
		projectId ??= services.project_info?.project_id;
		for (const client of services.client ?? []) {
			const packageName = client.client_info?.android_client_info?.package_name;
			for (const { current_key: key } of client.api_key ?? []) {
				if (!key || keys.some((k) => k.key === key)) continue;
				keys.push({
					label: 'Android',
					key,
					headers: packageName ? { 'X-Android-Package': packageName } : {}
				});
			}
		}
	} catch {
		// Not every clone has the Android file.
	}
	if (!keys.length || !projectId) {
		throw new Error(
			`No Firebase config found in ${cloneDir}. Pass the ArkhamCards clone with --arkhamcards.`
		);
	}
	return { projectId, keys };
}

/**
 * The page that signs in with Google. On load it asks Firebase, for each key, whether the key works
 * from a browser and whether `localhost` may sign in; nothing about the account is sent until the
 * button is pressed. After sign-in it posts the tokens to `tokenPath`.
 */
export function googleSignInPage({ projectId, keys }, tokenPath) {
	const config = JSON.stringify({
		projectId,
		keys: keys.map(({ label, key }) => ({ label, key })),
		tokenPath
	}).replace(/</g, '\\u003c');
	return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>ArkhamCards export</title>
<style>
	body { font: 16px/1.5 system-ui, sans-serif; max-width: 40rem; margin: 3rem auto; padding: 0 1rem; }
	li { margin: 0.25rem 0; }
	button { font: inherit; padding: 0.5rem 1rem; cursor: pointer; }
	button:disabled { cursor: default; }
	.bad { color: #b00020; }
</style>
</head>
<body>
<h1>ArkhamCards export</h1>
<p>Checking ArkhamCards' sign-in service from this page:</p>
<ul id="checks"></ul>
<p><button id="sign-in" disabled>Sign in with Google</button></p>
<p id="status"></p>
<script type="application/json" id="config">${config}</script>
<script type="module">
	import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
	import {
		GoogleAuthProvider,
		browserPopupRedirectResolver,
		inMemoryPersistence,
		initializeAuth,
		signInWithPopup
	} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';

	const config = JSON.parse(document.getElementById('config').textContent);
	const checks = document.getElementById('checks');
	const button = document.getElementById('sign-in');
	const status = document.getElementById('status');
	const say = (text, bad = false) => {
		status.textContent = text;
		status.className = bad ? 'bad' : '';
	};
	const check = (text, bad = false) => {
		const item = document.createElement('li');
		item.textContent = text;
		if (bad) item.className = 'bad';
		checks.append(item);
	};

	let chosen = null;
	for (const { label, key } of config.keys) {
		try {
			const response = await fetch('https://identitytoolkit.googleapis.com/v1/projects?key=' + key);
			const body = await response.json().catch(() => ({}));
			if (!response.ok) {
				check(label + ' key: rejected (' + (body.error?.message ?? response.status) + ')', true);
				continue;
			}
			const allowed = (body.authorizedDomains ?? []).includes('localhost');
			check(label + ' key: accepted. localhost ' + (allowed ? 'may' : 'may NOT') + ' sign in.', !allowed);
			if (allowed && !chosen) chosen = key;
		} catch (error) {
			check(label + ' key: request failed (' + error.message + ')', true);
		}
	}

	if (!chosen) {
		say('No key can sign in from this page. Copy the lines above back to Claude.', true);
	} else {
		const app = initializeApp({
			apiKey: chosen,
			authDomain: config.projectId + '.firebaseapp.com',
			projectId: config.projectId
		});
		const auth = initializeAuth(app, {
			persistence: inMemoryPersistence,
			popupRedirectResolver: browserPopupRedirectResolver
		});
		button.disabled = false;
		say('Ready.');
		button.addEventListener('click', async () => {
			button.disabled = true;
			say('Signing in…');
			try {
				const { user } = await signInWithPopup(auth, new GoogleAuthProvider());
				const response = await fetch(config.tokenPath, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						key: chosen,
						idToken: await user.getIdToken(),
						refreshToken: user.refreshToken
					})
				});
				if (!response.ok) throw new Error('the export script did not take the sign-in');
				say('Signed in as ' + (user.email ?? user.uid) + '. The export continues in the terminal; you can close this tab.');
			} catch (error) {
				button.disabled = false;
				say('Sign-in failed: ' + (error.code ?? '') + ' ' + error.message, true);
			}
		});
	}
</script>
</body>
</html>
`;
}

/**
 * Signs in with Google through a page on a local server: prints and opens its address, then waits
 * for the page to post the tokens back. The server only answers under a random path.
 */
export async function googleSignIn(firebase, { openBrowser = true } = {}) {
	const secret = randomBytes(16).toString('hex');
	const pagePath = `/${secret}`;
	const tokenPath = `/${secret}/token`;
	let settle;
	const posted = new Promise((done, fail) => (settle = { done, fail }));
	const server = createServer((request, response) => {
		if (request.method === 'GET' && request.url === pagePath) {
			response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
			response.end(googleSignInPage(firebase, tokenPath));
			return;
		}
		if (request.method === 'POST' && request.url === tokenPath) {
			let body = '';
			request.on('data', (chunk) => (body += chunk));
			request.on('end', () => {
				try {
					const tokens = JSON.parse(body);
					const apiKey = firebase.keys.find((k) => k.key === tokens.key);
					if (!apiKey || !tokens.idToken || !tokens.refreshToken) throw new Error('bad sign-in');
					response.writeHead(204).end();
					settle.done({ apiKey, idToken: tokens.idToken, refreshToken: tokens.refreshToken });
				} catch (error) {
					response.writeHead(400).end();
					settle.fail(error);
				}
			});
			return;
		}
		response.writeHead(404).end();
	});
	await new Promise((done) => server.listen(0, 'localhost', done));
	const url = `http://localhost:${server.address().port}${pagePath}`;
	console.log(`Sign in with Google in your browser:\n  ${url}`);
	if (openBrowser && process.platform === 'darwin') execFile('open', [url], () => {});
	const timeout = setTimeout(
		() => settle.fail(new Error('No sign-in within 10 minutes.')),
		10 * 60 * 1000
	);
	try {
		const tokens = await posted;
		const claims = tokenClaims(tokens.idToken);
		return { ...tokens, userId: claims.user_id ?? claims.sub };
	} finally {
		clearTimeout(timeout);
		server.close();
	}
}

/** Firebase errors that mean the email or password is wrong, so trying another key won't help. */
const ACCOUNT_ERRORS =
	/INVALID_LOGIN_CREDENTIALS|INVALID_PASSWORD|EMAIL_NOT_FOUND|INVALID_EMAIL|USER_DISABLED|TOO_MANY_ATTEMPTS/;

async function signIn(email, password, apiKeys) {
	const failures = [];
	for (const apiKey of apiKeys) {
		const response = await fetch(
			`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey.key}`,
			{
				method: 'POST',
				headers: { 'Content-Type': 'application/json', ...apiKey.headers },
				body: JSON.stringify({ email, password, returnSecureToken: true })
			}
		);
		const body = await response.json().catch(() => ({}));
		if (response.ok)
			return {
				apiKey,
				idToken: body.idToken,
				refreshToken: body.refreshToken,
				userId: body.localId
			};
		const message = body.error?.message ?? `HTTP ${response.status}`;
		if (ACCOUNT_ERRORS.test(message)) throw new Error(`ArkhamCards sign-in failed: ${message}`);
		failures.push(message);
	}
	throw new Error(`No API key was accepted for sign-in:\n  ${failures.join('\n  ')}`);
}

function tokenClaims(idToken) {
	return JSON.parse(Buffer.from(idToken.split('.')[1], 'base64url').toString('utf8'));
}

/** A token the GraphQL server accepts: one carrying Hasura claims, refreshing until it has them. */
async function hasuraToken(session) {
	let { idToken, refreshToken } = session;
	for (let attempt = 0; attempt < 5; attempt++) {
		if (tokenClaims(idToken)[HASURA_CLAIMS]) return idToken;
		await new Promise((done) => setTimeout(done, 1000));
		const response = await fetch(
			`https://securetoken.googleapis.com/v1/token?key=${session.apiKey.key}`,
			{
				method: 'POST',
				headers: { 'Content-Type': 'application/x-www-form-urlencoded', ...session.apiKey.headers },
				body: new URLSearchParams({ grant_type: 'refresh_token', refresh_token: refreshToken })
			}
		);
		const body = await response.json().catch(() => ({}));
		if (!response.ok)
			throw new Error(`Token refresh failed: ${body.error?.message ?? response.status}`);
		idToken = body.id_token;
		refreshToken = body.refresh_token;
	}
	throw new Error(
		'The account has no ArkhamCards server access yet. Sign in once in the app, then try again.'
	);
}

async function graphql(token, name, variables) {
	const response = await fetch(GRAPHQL_URL, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
		body: JSON.stringify({ operationName: name, query: withFragments(QUERIES[name]), variables })
	});
	const body = await response.json().catch(() => ({}));
	if (!response.ok || body.errors) {
		const detail = body.errors?.map((e) => e.message).join('; ') ?? `HTTP ${response.status}`;
		throw new Error(`${name} failed: ${detail}`);
	}
	return body.data;
}

/** Runs `task` over `items`, `limit` at a time, keeping the order. */
async function mapPooled(items, limit, task) {
	const results = new Array(items.length);
	let next = 0;
	const worker = async () => {
		while (next < items.length) {
			const index = next++;
			results[index] = await task(items[index], index);
		}
	};
	await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
	return results;
}

async function exportCampaign(token, id) {
	const { campaign_by_pk: campaign } = await graphql(token, 'getCampaign', { campaign_id: id });
	if (!campaign) return null;
	const [guideData, chaosData] = await Promise.all([
		graphql(token, 'getCampaignGuide', { campaign_id: id }),
		graphql(token, 'getChaosBagResults', { campaign_id: id })
	]);
	// Every investigator the campaign lists, not only those with a deck attached now, so the history
	// of a deck detached since is asked for too.
	const investigators = [
		...new Set([
			...(campaign.latest_decks ?? []).flatMap((row) => row.deck?.investigator ?? []),
			...(campaign.investigators ?? []).map((row) => row.investigator)
		])
	];
	const deckHistory = {};
	for (const investigator of investigators) {
		const data = await graphql(token, 'getDeckHistory', { campaign_id: id, investigator });
		deckHistory[investigator] = data.campaign_deck;
	}
	return {
		campaign,
		guide: guideData.campaign_guide[0] ?? null,
		chaosBagResults: chaosData.chaos_bag_result_by_pk,
		deckHistory,
		members: await exportMembers(token, id),
		dates: await exportDates(token, id)
	};
}

/**
 * The campaign's members, as the app's Edit players lists them: its owner and everyone given access,
 * each `{ id, handle }`. A member keeps access after their deck is detached. `{ error }` when the
 * query fails.
 */
async function exportMembers(token, id) {
	try {
		const data = (await graphql(token, 'getCampaignAccess', { campaign_id: id })).campaign_by_pk;
		return [data?.owner, ...(data?.access ?? []).map((a) => a.user)].filter(Boolean);
	} catch (error) {
		return { error: error.message };
	}
}

/**
 * When the campaign and each of its guide inputs were created on the server. A campaign made on a
 * device and uploaded later has its upload time, and so do the inputs it had then. Either query
 * failing, as when an account may not read the field, leaves its part `null` with the reason.
 */
async function exportDates(token, id) {
	const dates = { campaignCreatedAt: null, guideCreatedAt: null, inputs: null, errors: [] };
	try {
		const data = await graphql(token, 'getCampaignCreatedAt', { campaign_id: id });
		dates.campaignCreatedAt = data.campaign_by_pk?.created_at ?? null;
	} catch (error) {
		dates.errors.push(error.message);
	}
	try {
		const guide = (await graphql(token, 'getGuideInputDates', { campaign_id: id }))
			.campaign_guide[0];
		dates.guideCreatedAt = guide?.created_at ?? null;
		dates.inputs = guide?.guide_inputs ?? null;
	} catch (error) {
		dates.errors.push(error.message);
	}
	return dates;
}

async function askHidden(question) {
	const stdin = process.stdin;
	if (!stdin.isTTY) throw new Error('Run this in a terminal, or set ARKHAMCARDS_PASSWORD.');
	process.stdout.write(question);
	stdin.setRawMode(true);
	stdin.resume();
	stdin.setEncoding('utf8');
	return new Promise((done) => {
		let value = '';
		const onData = (chunk) => {
			for (const char of chunk) {
				if (char === '\r' || char === '\n') {
					stdin.off('data', onData);
					stdin.setRawMode(false);
					stdin.pause();
					process.stdout.write('\n');
					done(value);
					return;
				}
				if (char === '\u0003') {
					process.stdout.write('\n');
					process.exit(130);
				}
				if (char === '\u007f' || char === '\b') value = value.slice(0, -1);
				else value += char;
			}
		};
		stdin.on('data', onData);
	});
}

async function credentials() {
	let email = process.env.ARKHAMCARDS_EMAIL;
	if (!email) {
		const prompt = createInterface({ input: process.stdin, output: process.stdout });
		email = (await prompt.question('ArkhamCards email: ')).trim();
		prompt.close();
	}
	const password = process.env.ARKHAMCARDS_PASSWORD ?? (await askHidden('ArkhamCards password: '));
	return { email, password };
}

function timestamp(date = new Date()) {
	const pad = (n) => String(n).padStart(2, '0');
	return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}-${pad(date.getHours())}${pad(date.getMinutes())}`;
}

async function main() {
	const { values } = parseArgs({
		options: {
			out: { type: 'string', default: join(homedir(), 'Documents', 'arkhamcards-exports') },
			merge: { type: 'string' },
			arkhamcards: { type: 'string', default: join(homedir(), 'Documents', 'ArkhamCards') },
			email: { type: 'boolean', default: false }
		}
	});
	// `yarn` runs scripts from the package folder; INIT_CWD is where the command was typed.
	const base = process.env.INIT_CWD ?? process.cwd();
	const appBackup = values.merge
		? JSON.parse(await readFile(resolve(base, values.merge), 'utf8'))
		: null;
	if (appBackup && appBackup.version !== 1) {
		throw new Error('--merge needs a backup made by a current ArkhamCards (version 1).');
	}
	const firebase = await readFirebaseConfig(resolve(base, values.arkhamcards));
	let session;
	if (values.email) {
		const { email, password } = await credentials();
		session = await signIn(email, password, firebase.keys);
	} else {
		session = await googleSignIn(firebase);
	}
	const token = await hasuraToken(session);
	console.log('Signed in.');

	const { users_by_pk: user } = await graphql(token, 'getMyCampaigns', { userId: session.userId });
	if (!user) throw new Error('The server has no record of this account.');
	const ids = new Set();
	for (const { campaign } of user.campaigns ?? []) {
		for (const c of [campaign, campaign?.link_a_campaign, campaign?.link_b_campaign])
			if (c) ids.add(c.id);
	}
	console.log(`Found ${ids.size} campaigns on the server. Downloading…`);

	const records = (
		await mapPooled([...ids], CONCURRENCY, (id) => exportCampaign(token, id))
	).filter(Boolean);
	const exported = toBackup(records);
	const backup = appBackup ? mergeBackups(appBackup, exported) : exported;

	const outDir = resolve(base, values.out);
	await mkdir(outDir, { recursive: true });
	const stamp = timestamp();
	const rawPath = join(outDir, `arkhamcards-cloud-${stamp}.json`);
	const acbPath = join(outDir, `ACB-${appBackup ? 'all' : 'cloud'}-${stamp}.acb`);
	const raw = {
		source: GRAPHQL_URL,
		exportedAt: new Date().toISOString(),
		userId: session.userId,
		campaigns: records
	};
	await writeFile(rawPath, JSON.stringify(raw, null, 2));
	await writeFile(acbPath, JSON.stringify(backup));

	for (const record of records) {
		const c = record.campaign;
		const created = record.dates.campaignCreatedAt?.slice(0, 10);
		const notes = [
			c.guided ? 'guided' : 'unguided',
			created ? `created ${created}` : 'created date not readable',
			`updated ${c.updated_at.slice(0, 10)}`,
			c.archived && 'archived',
			c.deleted && 'deleted, not in .acb'
		]
			.filter(Boolean)
			.join(', ');
		console.log(`  ${c.name} (${c.cycleCode}, ${notes})`);
	}
	const dateErrors = [...new Set(records.flatMap((record) => record.dates.errors))];
	if (dateErrors.length)
		console.log(`\nSome creation times could not be read:\n  ${dateErrors.join('\n  ')}`);
	console.log(
		`\n${backup.campaigns.length} campaigns, ${backup.guides.length} guides, ${backup.decks.length} decks in the backup.`
	);
	console.log(`Raw server records: ${rawPath}`);
	console.log(`ArkhamCards backup: ${acbPath}`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
	main().catch((error) => {
		console.error(error.message ?? error);
		process.exit(1);
	});
}
