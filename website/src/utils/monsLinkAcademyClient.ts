import {initializeApp, getApp, getApps, type FirebaseApp} from 'firebase/app';
import {
  getAuth,
  onAuthStateChanged,
  signInAnonymously,
  signOut,
  type Auth,
} from 'firebase/auth';
import {getFunctions, httpsCallable, type Functions} from 'firebase/functions';
import {
  collection,
  doc,
  getFirestore,
  limit,
  onSnapshot,
  orderBy,
  query,
  type Firestore,
} from 'firebase/firestore';
import {get, getDatabase, ref, type Database} from 'firebase/database';

type AuthMethod = 'eth' | 'sol' | 'apple' | 'x';

type MonsLinkFirebaseClient = {
  app: FirebaseApp;
  auth: Auth;
  database: Database;
  firestore: Firestore;
  functions: Functions;
};

type MonsLinkVerifyResponse = {
  ok?: boolean;
  uid?: string;
  profileId?: string;
  username?: string | null;
  address?: string | null;
  eth?: string | null;
  sol?: string | null;
  emoji?: number;
  aura?: string | null;
  rating?: number | null;
  nonce?: number | null;
  totalManaPoints?: number | null;
  cardBackgroundId?: number | null;
  cardSubtitleId?: number | null;
  profileCounter?: string | null;
  profileMons?: unknown;
  cardStickers?: unknown;
  mining?: MonsLinkMiningData | null;
};

export type MonsLinkMiningMaterials = {
  dust: number;
  slime: number;
  gum: number;
  metal: number;
  ice: number;
};

export type MonsLinkMiningData = {
  lastRockDate: string | null;
  materials: MonsLinkMiningMaterials;
};

export type MonsLinkProfile = {
  id: string;
  loginUid: string;
  username: string | null;
  eth: string | null;
  sol: string | null;
  emoji: number;
  aura: string | null;
  rating: number | null;
  totalManaPoints: number;
  cardBackgroundId: number | null;
  cardSubtitleId: number | null;
  profileCounter: string | null;
  profileMons: unknown;
  cardStickers: unknown;
  mining: MonsLinkMiningData;
};

export type MonsLinkGameItem = {
  id: string;
  inviteId: string;
  kind: 'auto' | 'direct';
  status: 'pending' | 'waiting' | 'active' | 'ended';
  latestMatchId: string | null;
  hostLoginId: string | null;
  guestLoginId: string | null;
  ownerLoginId: string | null;
  listSortAtMs: number;
  opponentName: string | null;
  opponentEmoji: number | null;
  monsLinkUrl: string;
};

export type MonsLinkSession = {
  profileId: string;
  loginUid: string;
};

export type MonsLinkMatchRecord = {
  color: string | null;
  emojiId: number | null;
  fen: string;
  flatMovesString: string | null;
  gameVariant: string | null;
  status: string | null;
};

export type MonsLinkGameMatchPair = {
  hostMatch: MonsLinkMatchRecord | null;
  guestMatch: MonsLinkMatchRecord | null;
};

const MONS_LINK_FIREBASE_APP_NAME = 'mons-link-academy';
const MONS_LINK_SESSION_STORAGE_KEY = 'mons-academy-mons-link-session-v1';
const MONS_LINK_FIREBASE_CONFIG = {
  apiKey: 'AIzaSyC8Ihr4kDd34z-RXe8XTBCFtFbXebifo5Y',
  authDomain: 'mons-link.firebaseapp.com',
  projectId: 'mons-link',
  storageBucket: 'mons-link.firebasestorage.app',
  messagingSenderId: '390871694056',
  appId: '1:390871694056:web:49d0679d38f3045030675d',
};

const emptyMiningMaterials: MonsLinkMiningMaterials = {
  dust: 0,
  slime: 0,
  gum: 0,
  metal: 0,
  ice: 0,
};

let client: MonsLinkFirebaseClient | null = null;
let initialAuthStatePromise: Promise<void> | null = null;

function getMonsLinkClient(): MonsLinkFirebaseClient {
  if (client !== null) {
    return client;
  }
  const app =
    getApps().some((candidate) => candidate.name === MONS_LINK_FIREBASE_APP_NAME)
      ? getApp(MONS_LINK_FIREBASE_APP_NAME)
      : initializeApp(MONS_LINK_FIREBASE_CONFIG, MONS_LINK_FIREBASE_APP_NAME);
  client = {
    app,
    auth: getAuth(app),
    database: getDatabase(app),
    firestore: getFirestore(app),
    functions: getFunctions(app),
  };
  return client;
}

function waitForInitialAuthState(auth: Auth): Promise<void> {
  if (initialAuthStatePromise !== null) {
    return initialAuthStatePromise;
  }
  initialAuthStatePromise = new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, () => {
      unsubscribe();
      resolve();
    });
  });
  return initialAuthStatePromise;
}

async function ensureMonsLinkAuth(): Promise<string> {
  const {auth} = getMonsLinkClient();
  if (auth.currentUser?.uid) {
    return auth.currentUser.uid;
  }
  await waitForInitialAuthState(auth);
  if (auth.currentUser?.uid) {
    return auth.currentUser.uid;
  }
  const credential = await signInAnonymously(auth);
  return credential.user.uid;
}

async function callMonsLinkFunction<TResponse>(
  name: string,
  payload: Record<string, unknown>,
): Promise<TResponse> {
  await ensureMonsLinkAuth();
  const {functions} = getMonsLinkClient();
  const callable = httpsCallable(functions, name);
  const response = await callable(payload);
  return response.data as TResponse;
}

function normalizeNumber(value: unknown, fallback = 0): number {
  const numeric = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
}

function normalizeMiningData(source: unknown): MonsLinkMiningData {
  const raw =
    source && typeof source === 'object'
      ? (source as {materials?: unknown; lastRockDate?: unknown})
      : {};
  const materialsInput =
    raw.materials && typeof raw.materials === 'object'
      ? (raw.materials as Record<string, unknown>)
      : (source as Record<string, unknown> | undefined);
  return {
    lastRockDate: typeof raw.lastRockDate === 'string' ? raw.lastRockDate : null,
    materials: {
      dust: Math.max(0, Math.round(normalizeNumber(materialsInput?.dust))),
      slime: Math.max(0, Math.round(normalizeNumber(materialsInput?.slime))),
      gum: Math.max(0, Math.round(normalizeNumber(materialsInput?.gum))),
      metal: Math.max(0, Math.round(normalizeNumber(materialsInput?.metal))),
      ice: Math.max(0, Math.round(normalizeNumber(materialsInput?.ice))),
    },
  };
}

function readCustom(data: Record<string, unknown>): Record<string, unknown> {
  return data.custom && typeof data.custom === 'object'
    ? (data.custom as Record<string, unknown>)
    : {};
}

function profileFromData(
  profileId: string,
  loginUid: string,
  data: Record<string, unknown>,
): MonsLinkProfile {
  const custom = readCustom(data);
  const emoji = Math.max(1, Math.floor(normalizeNumber(custom.emoji, 1)));
  return {
    id: profileId,
    loginUid,
    username: typeof data.username === 'string' ? data.username : null,
    eth: typeof data.eth === 'string' ? data.eth : null,
    sol: typeof data.sol === 'string' ? data.sol : null,
    emoji,
    aura: typeof custom.aura === 'string' ? custom.aura : null,
    rating: data.rating === undefined || data.rating === null ? null : normalizeNumber(data.rating, 1500),
    totalManaPoints: Math.max(0, Math.round(normalizeNumber(data.totalManaPoints))),
    cardBackgroundId:
      custom.cardBackgroundId === undefined || custom.cardBackgroundId === null
        ? null
        : Math.round(normalizeNumber(custom.cardBackgroundId)),
    cardSubtitleId:
      custom.cardSubtitleId === undefined || custom.cardSubtitleId === null
        ? null
        : Math.round(normalizeNumber(custom.cardSubtitleId)),
    profileCounter: typeof custom.profileCounter === 'string' ? custom.profileCounter : null,
    profileMons: custom.profileMons,
    cardStickers: custom.cardStickers,
    mining: normalizeMiningData(data.mining),
  };
}

function profileFromVerifyResponse(response: MonsLinkVerifyResponse): MonsLinkProfile | null {
  if (!response.profileId || !response.uid) {
    return null;
  }
  return {
    id: response.profileId,
    loginUid: response.uid,
    username: response.username ?? null,
    eth: response.eth ?? (response.address && response.address.startsWith('0x') ? response.address : null),
    sol: response.sol ?? (response.address && !response.address.startsWith('0x') ? response.address : null),
    emoji: Math.max(1, Math.floor(normalizeNumber(response.emoji, 1))),
    aura: response.aura ?? null,
    rating: response.rating ?? null,
    totalManaPoints: Math.max(0, Math.round(normalizeNumber(response.totalManaPoints))),
    cardBackgroundId: response.cardBackgroundId ?? null,
    cardSubtitleId: response.cardSubtitleId ?? null,
    profileCounter: response.profileCounter ?? null,
    profileMons: response.profileMons,
    cardStickers: response.cardStickers,
    mining: normalizeMiningData(response.mining),
  };
}

function mapGameItem(id: string, data: Record<string, unknown>): MonsLinkGameItem | null {
  const inviteId = typeof data.inviteId === 'string' && data.inviteId !== '' ? data.inviteId : id;
  if (!inviteId) {
    return null;
  }
  const rawStatus = typeof data.status === 'string' ? data.status : 'ended';
  const status =
    rawStatus === 'pending' || rawStatus === 'waiting' || rawStatus === 'active' || rawStatus === 'ended'
      ? rawStatus
      : 'ended';
  const listSortAt = data.listSortAt as {toMillis?: () => number} | number | undefined;
  const listSortAtMs =
    typeof listSortAt === 'number'
      ? listSortAt
      : typeof listSortAt?.toMillis === 'function'
        ? listSortAt.toMillis()
        : Date.now();
  const rawOpponentEmoji = data.opponentEmoji ?? data.opponentEmojiId;
  return {
    id,
    inviteId,
    kind: data.kind === 'auto' ? 'auto' : 'direct',
    status,
    latestMatchId: typeof data.latestMatchId === 'string' ? data.latestMatchId : inviteId,
    hostLoginId: typeof data.hostLoginId === 'string' ? data.hostLoginId : null,
    guestLoginId: typeof data.guestLoginId === 'string' ? data.guestLoginId : null,
    ownerLoginId: typeof data.ownerLoginId === 'string' ? data.ownerLoginId : null,
    listSortAtMs,
    opponentName:
      typeof data.opponentName === 'string'
        ? data.opponentName
        : typeof data.opponentDisplayName === 'string'
          ? data.opponentDisplayName
          : null,
    opponentEmoji:
      rawOpponentEmoji === undefined || rawOpponentEmoji === null
        ? null
        : Math.floor(normalizeNumber(rawOpponentEmoji, NaN)),
    monsLinkUrl: `https://mons.link/${encodeURIComponent(inviteId)}`,
  };
}

function normalizeMatchRecord(value: unknown): MonsLinkMatchRecord | null {
  if (!value || typeof value !== 'object') {
    return null;
  }
  const data = value as Record<string, unknown>;
  if (typeof data.fen !== 'string' || data.fen.trim() === '') {
    return null;
  }
  return {
    color: typeof data.color === 'string' ? data.color : null,
    emojiId:
      data.emojiId === undefined || data.emojiId === null
        ? null
        : Math.floor(normalizeNumber(data.emojiId, NaN)),
    fen: data.fen,
    flatMovesString:
      typeof data.flatMovesString === 'string' ? data.flatMovesString : null,
    gameVariant: typeof data.gameVariant === 'string' ? data.gameVariant : null,
    status: typeof data.status === 'string' ? data.status : null,
  };
}

function buildSiweMessage(address: string, chainId: number, nonce: string): string {
  const domain = window.location.host;
  const uri = window.location.origin;
  const issuedAt = new Date().toISOString();
  return `${domain} wants you to sign in with your Ethereum account:
${address}

mons ftw

URI: ${uri}
Version: 1
Chain ID: ${chainId}
Nonce: ${nonce}
Issued At: ${issuedAt}`;
}

function writeStoredSession(session: MonsLinkSession): void {
  try {
    window.localStorage.setItem(MONS_LINK_SESSION_STORAGE_KEY, JSON.stringify(session));
  } catch {}
}

export function readStoredMonsLinkSession(): MonsLinkSession | null {
  if (typeof window === 'undefined') {
    return null;
  }
  try {
    const raw = window.localStorage.getItem(MONS_LINK_SESSION_STORAGE_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as Partial<MonsLinkSession>;
    if (typeof parsed.profileId !== 'string' || typeof parsed.loginUid !== 'string') {
      return null;
    }
    return {profileId: parsed.profileId, loginUid: parsed.loginUid};
  } catch {
    return null;
  }
}

export async function signOutMonsLinkAcademy(): Promise<void> {
  const {auth} = getMonsLinkClient();
  try {
    window.localStorage.removeItem(MONS_LINK_SESSION_STORAGE_KEY);
  } catch {}
  await signOut(auth);
  initialAuthStatePromise = null;
}

export async function signInMonsLinkWithEthereum(): Promise<MonsLinkProfile> {
  if (typeof window === 'undefined') {
    throw new Error('Ethereum sign in is unavailable here.');
  }
  const ethereum = (window as Window & {ethereum?: any}).ethereum;
  if (!ethereum?.request) {
    throw new Error('No Ethereum wallet found.');
  }
  await ensureMonsLinkAuth();
  const intent = await callMonsLinkFunction<{
    intentId: string;
    nonce: string;
  }>('beginAuthIntent', {method: 'eth'});
  const accounts = (await ethereum.request({method: 'eth_requestAccounts'})) as string[];
  const address = accounts[0];
  if (!address) {
    throw new Error('No Ethereum account selected.');
  }
  const chainIdHex = (await ethereum.request({method: 'eth_chainId'})) as string;
  const chainId = Number.parseInt(chainIdHex, 16) || 1;
  const message = buildSiweMessage(address, chainId, intent.nonce);
  const signature = (await ethereum.request({
    method: 'personal_sign',
    params: [message, address],
  })) as string;
  const response = await callMonsLinkFunction<MonsLinkVerifyResponse>('verifyEthAddress', {
    message,
    signature,
    intentId: intent.intentId,
    emoji: 1,
    aura: '',
  });
  if (response.ok === false) {
    throw new Error('Ethereum signature was not accepted.');
  }
  const profile = profileFromVerifyResponse(response);
  if (profile === null) {
    throw new Error('Ethereum sign in did not return a profile.');
  }
  writeStoredSession({profileId: profile.id, loginUid: profile.loginUid});
  return profile;
}

export async function signInMonsLinkWithSolana(): Promise<MonsLinkProfile> {
  if (typeof window === 'undefined') {
    throw new Error('Solana sign in is unavailable here.');
  }
  const solana = (window as Window & {solana?: any}).solana;
  if (!solana) {
    throw new Error('No Solana wallet found.');
  }
  await ensureMonsLinkAuth();
  if (!solana.connected) {
    await solana.connect();
  }
  const publicKey = solana.publicKey?.toString?.();
  if (!publicKey) {
    throw new Error('No Solana account selected.');
  }
  const intent = await callMonsLinkFunction<{
    intentId: string;
    nonce: string;
  }>('beginAuthIntent', {method: 'sol'});
  const message = `Sign in mons.link with Solana nonce ${intent.nonce}`;
  const signatureResponse = await solana.signMessage(new TextEncoder().encode(message));
  const signatureBytes =
    signatureResponse instanceof Uint8Array
      ? signatureResponse
      : new Uint8Array(signatureResponse.signature);
  const signature = btoa(String.fromCharCode(...Array.from(signatureBytes)));
  const response = await callMonsLinkFunction<MonsLinkVerifyResponse>('verifySolanaAddress', {
    address: publicKey,
    signature,
    intentId: intent.intentId,
    emoji: 1,
    aura: '',
  });
  if (response.ok === false) {
    throw new Error('Solana signature was not accepted.');
  }
  const profile = profileFromVerifyResponse(response);
  if (profile === null) {
    throw new Error('Solana sign in did not return a profile.');
  }
  writeStoredSession({profileId: profile.id, loginUid: profile.loginUid});
  return profile;
}

export function subscribeMonsLinkAcademyData(
  session: MonsLinkSession,
  onProfile: (profile: MonsLinkProfile | null) => void,
  onGames: (games: MonsLinkGameItem[]) => void,
  onError: (error: Error) => void,
): () => void {
  const {firestore} = getMonsLinkClient();
  let unsubscribeProfile: (() => void) | null = null;
  let unsubscribeGames: (() => void) | null = null;
  let disposed = false;

  void ensureMonsLinkAuth()
    .then(() => {
      if (disposed) {
        return;
      }
      unsubscribeProfile = onSnapshot(
        doc(firestore, 'users', session.profileId),
        (snapshot) => {
          if (!snapshot.exists()) {
            onProfile(null);
            return;
          }
          onProfile(
            profileFromData(
              session.profileId,
              session.loginUid,
              snapshot.data() as Record<string, unknown>,
            ),
          );
        },
        (error) => onError(error),
      );
      unsubscribeGames = onSnapshot(
        query(
          collection(firestore, 'users', session.profileId, 'games'),
          orderBy('sortBucket', 'asc'),
          orderBy('listSortAt', 'desc'),
          limit(120),
        ),
        (snapshot) => {
          onGames(
            snapshot.docs.flatMap((gameDoc) => {
              const mapped = mapGameItem(gameDoc.id, gameDoc.data() as Record<string, unknown>);
              return mapped === null ? [] : [mapped];
            }),
          );
        },
        (error) => onError(error),
      );
    })
    .catch((error) => onError(error instanceof Error ? error : new Error(String(error))));

  return () => {
    disposed = true;
    unsubscribeProfile?.();
    unsubscribeGames?.();
  };
}

export async function fetchMonsLinkGameMatches(
  game: MonsLinkGameItem,
): Promise<MonsLinkGameMatchPair> {
  const matchId = game.latestMatchId || game.inviteId;
  if (!matchId) {
    throw new Error('This mons.link game is missing a match id.');
  }
  const {database} = getMonsLinkClient();
  const matchReads: Array<Promise<[keyof MonsLinkGameMatchPair, MonsLinkMatchRecord | null]>> = [];
  if (game.hostLoginId) {
    matchReads.push(
      get(ref(database, `players/${game.hostLoginId}/matches/${matchId}`)).then((snapshot) => [
        'hostMatch',
        normalizeMatchRecord(snapshot.val()),
      ]),
    );
  }
  if (game.guestLoginId) {
    matchReads.push(
      get(ref(database, `players/${game.guestLoginId}/matches/${matchId}`)).then((snapshot) => [
        'guestMatch',
        normalizeMatchRecord(snapshot.val()),
      ]),
    );
  }
  if (matchReads.length === 0) {
    throw new Error('This mons.link game is missing player ids.');
  }
  const entries = await Promise.all(matchReads);
  const pair: MonsLinkGameMatchPair = {hostMatch: null, guestMatch: null};
  entries.forEach(([key, match]) => {
    pair[key] = match;
  });
  if (pair.hostMatch === null && pair.guestMatch === null) {
    throw new Error('No saved board state was found for this mons.link game.');
  }
  return pair;
}

export const monsLinkAuthProviderNotes: Record<AuthMethod, string | null> = {
  eth: null,
  sol: null,
  apple: 'Apple sign in needs the mons.link Apple service/redirect config to include Academy.',
  x: 'X sign in needs the mons.link X redirect allowed origins to include this Academy URL.',
};

export const monsLinkEmptyMiningMaterials = emptyMiningMaterials;
