import AsyncStorage from "@react-native-async-storage/async-storage";
import InAppReview from "react-native-in-app-review";

const REVIEW_TRACKER_KEY = "cashy_review_tracking_state";
const MIN_DAYS_USED = 7;
const MIN_APP_OPENS = 5;
const MIN_TRANSACTIONS = 1;
const REVIEW_COOLDOWN_DAYS = 60;

export type ReviewTrackingState = {
  firstOpenDate: string;
  appOpenCount: number;
  transactionCount: number;
  walletsCreated: number;
  lastReviewPromptDate: string | null;
  hasReviewed: boolean;
};

function createInitialState(now = new Date()): ReviewTrackingState {
  return {
    firstOpenDate: now.toISOString(),
    appOpenCount: 0,
    transactionCount: 0,
    walletsCreated: 0,
    lastReviewPromptDate: null,
    hasReviewed: false,
  };
}

function daysBetween(fromIso: string, to = new Date()) {
  const from = new Date(fromIso).getTime();
  return Math.floor((to.getTime() - from) / (1000 * 60 * 60 * 24));
}

async function readReviewState() {
  const raw = await AsyncStorage.getItem(REVIEW_TRACKER_KEY);
  if (!raw) return createInitialState();

  try {
    return { ...createInitialState(), ...JSON.parse(raw) } as ReviewTrackingState;
  } catch {
    return createInitialState();
  }
}

async function writeReviewState(state: ReviewTrackingState) {
  await AsyncStorage.setItem(REVIEW_TRACKER_KEY, JSON.stringify(state));
}

function canRequestReview(state: ReviewTrackingState, now = new Date()) {
  if (state.hasReviewed) return false;
  if (daysBetween(state.firstOpenDate, now) < MIN_DAYS_USED) return false;
  if (state.appOpenCount < MIN_APP_OPENS) return false;
  if (state.transactionCount < MIN_TRANSACTIONS) return false;

  if (!state.lastReviewPromptDate) return true;

  return daysBetween(state.lastReviewPromptDate, now) >= REVIEW_COOLDOWN_DAYS;
}

async function requestReviewIfEligible(state: ReviewTrackingState) {
  if (!canRequestReview(state)) return state;
  if (!InAppReview.isAvailable()) return state;

  const nextState = {
    ...state,
    lastReviewPromptDate: new Date().toISOString(),
  };

  await writeReviewState(nextState);

  try {
    await InAppReview.RequestInAppReview();
  } catch {}

  return nextState;
}

export async function recordAppOpenForReview() {
  const state = await readReviewState();
  await writeReviewState({
    ...state,
    appOpenCount: state.appOpenCount + 1,
  });
}

export async function recordTransactionCreatedAndMaybeRequestReview() {
  const state = await readReviewState();
  const nextState = {
    ...state,
    transactionCount: state.transactionCount + 1,
  };

  await writeReviewState(nextState);
  return requestReviewIfEligible(nextState);
}

export async function recordWalletCreatedForReview() {
  const state = await readReviewState();
  await writeReviewState({
    ...state,
    walletsCreated: state.walletsCreated + 1,
  });
}

export async function getReviewTrackingState() {
  return readReviewState();
}

export async function resetReviewTrackingState() {
  await AsyncStorage.removeItem(REVIEW_TRACKER_KEY);
}
