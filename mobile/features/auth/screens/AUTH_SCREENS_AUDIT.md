# Auth screens audit

Overview of `features/auth/screens` and how each file fits into login and account-creation.

## Folder structure

```
screens/
├── EntryScreen.js              # Landing (not signed in)
├── SignupScreen.js             # Stub → SignupStep1
├── CompleteSignupScreen.js     # Final step: backend signup + login
├── account-creation/
│   ├── SignupStep1Screen.js    # Name, phone, email, password
│   ├── SignupStep2Screen.js    # Gender, DOB, graduation year → Cognito signup → ConfirmOtp
│   ├── SignupStep3Screen.js    # LEGACY / alternate: dating/friends prefs before OTP
│   └── ConfirmOtpScreen.js     # Email OTP → Welcome
├── existing-users/
│   ├── LoginScreen.js          # Email + password login
│   └── ForgotPasswordScreen.js # Request reset → code + new password
└── profile-onboarding/
    ├── WelcomeScreen.js       # Choose Romantic and/or Platonic
    ├── RomanticPreferencesScreen.js  # Who to meet romantically
    └── PlatonicPreferencesScreen.js  # Who to meet as friends
```

## Flow summary

**Login**
- Entry → Login → (Cognito login) → `onSignedIn` → main app  
- Login → Forgot password → ForgotPasswordScreen (request → confirm)

**Sign up (current)**
- Entry → Sign up → **SignupStep1** (name, phone, email, password)  
  → **SignupStep2** (gender, DOB, graduation year)  
  → Cognito signup  
  → **ConfirmOtp** (email OTP)  
  → **Welcome** (Romantic / Platonic choice)  
  → **RomanticPreferences** and/or **PlatonicPreferences**  
  → **CompleteSignup** (backend signup + login) → `onSignedIn` → main app

**Stub**
- SignupScreen immediately replaces with SignupStep1 (no longer a single-screen signup).

## Legacy / alternate

| File | Note |
|------|------|
| **SignupScreen.js** | Body is legacy: single-screen signup (name, phone, email, password, gender, DOB) is dead code; component only redirects to SignupStep1. |
| **SignupStep3Screen.js** | Not registered in AuthStack. Alternate path (Step1 → Step2 → Step3 → ConfirmOtp) for collecting dating/friends preferences before OTP. Current flow does preferences after OTP (Welcome → Romantic/Platonic). |

## Import path rules (after subfolders)

- **screens/** (EntryScreen, SignupScreen, CompleteSignupScreen): use `../../../` to reach mobile root (styles, auth, api).
- **screens/account-creation/**, **screens/existing-users/**, **screens/profile-onboarding/**: use `../../../../` to reach mobile root; use `../../../` to reach `features/` (e.g. `../../../profile/...` for ChipRow).

## AuthStack (navigation)

- Entry, Login, Signup, SignupStep1, SignupStep2, ConfirmOtp, ForgotPassword, Welcome, RomanticPreferences, PlatonicPreferences, CompleteSignup.
- SignupStep3 is **not** in the stack (legacy/alternate).
