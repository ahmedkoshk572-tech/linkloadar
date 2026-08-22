# LinkLoad Android

تطبيق Android أصلي مبني بـExpo وReact Native، وليس WebView. يحتوي على شاشة رئيسية لتحليل الرابط، عرض الصورة والعنوان والجودات الفعلية، تنزيل الملف، تبويب سجل التنزيلات، وتبويب الإعدادات وحالة الـBackend.

## تشغيل محليًا

```bash
cd mobile
cp .env.example .env
pnpm install
pnpm start
```

ضع عنوان خدمة التنزيل الحقيقية في `EXPO_PUBLIC_API_URL`. أثناء التطوير على محاكي Android يمكن استخدام عنوان جهاز التطوير المناسب بدل `localhost`.

## بناء APK

```bash
cd mobile
npx eas login
npm install -g eas-cli
eas build --platform android --profile preview
```

ملف `eas.json` يخرج APK قابلًا للتثبيت في ملف preview. ملف production مضبوط لإخراج Android App Bundle عند تجهيز حساب Google Play.

## بعد شراء VPS

شغّل Backend LinkLoad على VPS مع Docker أو Python و`yt-dlp` و`ffmpeg`، ثم حدّث:

```bash
EXPO_PUBLIC_API_URL=https://api.example.com
```

أعد بناء التطبيق فقط عندما تريد تغيير القيمة المضمنة في النسخة؛ ويمكن لاحقًا نقل الإعداد إلى remote config إذا احتجت تبديل الخادم دون إعادة إصدار.
