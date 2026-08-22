# Adsterra in-app findings

- Official Smartlink page: https://adsterra.com/smartlink-ads/
- Official Direct Link guide: https://adsterra.com/blog/guide-for-working-with-direct-links/
- Official app monetization guide: https://adsterra.com/blog/app-monetization/

The official Direct Link guide explicitly describes Smart Direct Link as a monetization unit with no visual format, only a URL. It says that in mobile apps publishers place the URL on visible/clickable elements such as text, images, or a custom banner. The official app monetization guide describes the flow as the user clicking the Direct Link and being guided to an advertising page. These sources do not document an official Adsterra Android SDK or a native in-app interstitial API for Smartlink.

Therefore, the current external-browser flow matches the documented Smartlink behavior. To display the Smartlink inside LinkLoad itself, the practical implementation would be an in-app WebView modal for the ad surface only; the rest of LinkLoad would remain a native React Native app. This may not guarantee that every ad landing page stays inside the WebView, and the publisher should confirm that this use is allowed for the account/traffic type. A true native full-screen ad with a network-controlled X/close event would require an ad SDK or ad format that provides an Android SDK, not just a Smartlink URL.

Build note: Expo account page is authenticated and currently shows only the previously revoked token. A new temporary token is required for the APK that embeds the Smartlink inside a modal WebView; no token value is stored in project files.

Build note: a temporary Expo token named "LinkLoad In-App Ad Build" was created for the in-app advertisement APK. Its secret value is not stored in the repository or documentation and will be revoked after the build artifact is downloaded.

Build note: APK build 5 completed and was downloaded successfully. The archive passed integrity checks; the bundle contains the new Smartlink host and temporary Backend URL. The source Backend URL was restored to the configurable placeholder after the build. The app bundle includes the in-app WebView flow with an internal close button; the network URL itself is not expected to expose a module name string in the compiled bundle.

Build note: APK build 5 for the in-app Smartlink modal was downloaded and passed archive integrity checks. The bundle contains the new Smartlink host and temporary Backend URL. Source was restored to the configurable Backend placeholder after build. The Expo token used for this build is pending final revocation verification.
