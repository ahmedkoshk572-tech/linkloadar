# LinkLoad

موقع عربي/إنجليزي لمعالجة روابط الفيديو العامة وعرض المعاينة والجودات الفعلية ثم تنزيل الجودة المختارة عبر محرك `yt-dlp` داخل خادم التشغيل.

> الخدمة مخصصة للمحتوى العام الذي يملك المستخدم حق تنزيله فقط. لا تتجاوز DRM أو الجدران المدفوعة أو تسجيل الدخول أو الفيديوهات الخاصة أو قيود الوصول الجغرافي.

## الموقع المنشور

واجهة الموقع المنشورة هي: [linkloadar.vercel.app](https://linkloadar.vercel.app)

مستودع GitHub هو: [ahmedkoshk572-tech/linkloadar](https://github.com/ahmedkoshk572-tech/linkloadar)

يحافظ إعداد `vercel.json` على نشر واجهة Vite في نفس رابط Vercel. لأن Vercel لا يوفر بيئة Docker دائمة لتشغيل `yt-dlp` و`ffmpeg`، يجب تشغيل الـBackend الحقيقي على VPS أو خدمة Docker منفصلة، ثم ضبط متغير Vercel التالي:

```bash
VITE_DOWNLOADER_API_URL=https://your-downloader-backend.example.com
```

عند ترك المتغير فارغًا تستخدم الواجهة نفس النطاق `/downloader/*`، وهو مناسب للتشغيل المحلي أو عندما يكون الـBackend خلف reverse proxy على نفس النطاق.

## التشغيل المحلي الكامل

يتطلب التشغيل الحقيقي Python و`yt-dlp` و`ffmpeg`. أسهل طريقة هي Docker:

```bash
docker build -t linkload .
docker run --rm -p 3000:3000 linkload
```

بعد التشغيل افتح `http://localhost:3000`. ويمكن تشغيل الواجهة منفصلة عبر:

```bash
pnpm install
pnpm dev
```

## API

- `GET /downloader/health` للتحقق من جاهزية المحرك.
- `GET /downloader/preview?url=<PUBLIC_URL>` لإرجاع العنوان والصورة والمدة والجودات التي يجدها `yt-dlp`.
- `GET /downloader/download?url=<PUBLIC_URL>&format_id=<FORMAT_ID>` لبدء تنزيل الجودة المختارة.

جميع الروابط تمر عبر تحقق من البروتوكول ومنع عناوين الشبكات الخاصة، وتُصنّف أخطاء تسجيل الدخول و403 وDRM بدل إظهار تفاصيل تقنية للمستخدم.

## النشر

GitHub يحفظ الكود فقط. نشر الواجهة على Vercel يحافظ على رابط `linkloadar.vercel.app`، أما Backend التنزيل فيحتاج بيئة تشغّل Docker أو Python و`yt-dlp` و`ffmpeg`. ملف `Dockerfile` الجذري جاهز لتشغيل الواجهة والخادم، و`downloader-service/` يوفر خدمة FastAPI مستقلة عند الحاجة.

لا تضع أي مفاتيح أو ملفات `.env` في المستودع. الخدمة لا تحاول تجاوز حماية المنصات، وقد ترفض بعض المنصات الطلبات الآلية أو تتطلب تسجيل دخول/ملفات cookies.

## الفحوص

```bash
pnpm test
pnpm check
pnpm build
```
