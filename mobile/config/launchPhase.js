import Constants from 'expo-constants';

export const LAUNCH_PHASE = Constants.expoConfig?.extra?.launchPhase || 'A';

function parseBooleanFlag(value, defaultValue = false) {
	if (value === undefined || value === null) return defaultValue;
	return String(value).toLowerCase() === 'true';
}

export const SHOW_ONBOARDING_TEST_TAB = parseBooleanFlag(
	Constants.expoConfig?.extra?.showOnboardingTestTab,
	true
);

export const isLaunchA = LAUNCH_PHASE === 'A';
export const isLaunchB = LAUNCH_PHASE === 'B';