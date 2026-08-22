# Expo build notes

The Expo account `ahmedabdelaziz199` is signed in through Google. A LinkLoad project was created in Expo with project ID `f70150db-31f9-4c51-9221-571a6ba08dec`.

Expo's onboarding page provided these CLI commands for a connected project:

```bash
npx eas-cli@latest init --id f70150db-31f9-4c51-9221-571a6ba08dec
npx eas-cli@latest build --profile production
```

The Access tokens page is available at `https://expo.dev/accounts/ahmedabdelaziz199/settings/access-tokens`. It provides a Create token flow with a token name field and a Generate new token button. A personal token is needed only to authenticate the local EAS CLI when the browser session cannot complete the localhost callback.

The token creation modal was opened and named `LinkLoad Build`. The first generate attempt left the modal open with the Generate button visually disabled, so the token has not been captured or stored.

A Personal Access Token named `LinkLoad Build` was successfully created in Expo and copied through the browser UI. Its secret value is intentionally not written to the repository or documentation.
