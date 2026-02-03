import Constants from 'expo-constants';

export const LAUNCH_PHASE = Constants.expoConfig?.extra?.launchPhase || 'A';

export const isLaunchA = LAUNCH_PHASE === 'A';
export const isLaunchB = LAUNCH_PHASE === 'B';