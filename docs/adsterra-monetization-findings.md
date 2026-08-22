# Adsterra monetization findings

Date: 2026-08-22

Adsterra's official mobile app monetization guide states that Smart Direct Link can be attached to a text, button, or picture in an Android APK. It describes the flow as a user clicking the link, being guided to an advertising page/offer, and the publisher earning from views or conversions. Source: https://adsterra.com/blog/app-monetization/

Adsterra's official Smartlink page describes Smartlink as one URL that selects relevant offers, and specifically lists APK developers as a target audience. Its setup flow is: sign up as a publisher, open Smartlinks, add a Smartlink with the appropriate traffic type, wait for Active status, then copy the URL into the traffic source. It recommends visible but intentional placements and warns against navigation buttons or accidental clicks. Source: https://adsterra.com/smartlink-ads/

Implementation implication for LinkLoad: the currently documented Adsterra path is a user-triggered external Smart Direct Link, not a native Android banner/interstitial SDK integration. LinkLoad is a native Expo/React Native app, so the implementation should avoid turning it into a WebView. The app should only add an intentional ad button/card after the user provides an active Adsterra Smartlink URL and confirms the desired placement.

Build note: the Expo personal access-token page is available under the logged-in account. Only the previously revoked token is listed; no active token value is stored in the project. A new temporary token is required for the next APK build and will be deleted after the artifact is downloaded.

Build note: APK build 3 completed successfully and was downloaded locally. Verification confirmed that the compiled Android bundle contains both the Adsterra Smartlink host and the temporary Backend URL. The source tree was restored to the configurable Backend placeholder and pushed to GitHub; the test URL is only in the APK artifact.

Build note: a new temporary Expo access token named "LinkLoad Direct Save Build" was created in the logged-in Expo account for the APK build. Its value is intentionally not stored in project files or documentation and will be revoked after the APK artifact is downloaded.

Build note: APK build 4 completed and was downloaded successfully. The archive passed integrity checks, and the compiled bundle contains the new Smartlink host, the temporary Backend URL, and the automatic MediaLibrary save flow. The source Backend URL was restored to its configurable placeholder afterward.

Build note: APK build 4 (direct-save flow) was downloaded and passed archive integrity checks. The bundle contains the new Adsterra Smartlink and the temporary Backend URL used only for this test build. Source code was restored to the configurable Backend placeholder before release.
