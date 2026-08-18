# خيارات مزود API

## Apify TrueFetch

الصفحة: https://apify.com/truefetch/best-video-downloader

توضح الصفحة أن Actor `truefetch/best-video-downloader` يقبل `video_url` ويعيد metadata، ويمكنه إرجاع ملف MP4 مخزن أو رابط ملف حسب المصدر والجودة. الصفحة تعرض زر Try for free ورابط API، ويحتاج الاستخدام البرمجي إلى حساب Apify وToken من إعدادات الحساب.

## RapidAPI Multi-Platform Video Downloader

الصفحة: https://rapidapi.com/ldspn115/api/multi-platform-video-downloader

نتيجة البحث تشير إلى API متعدد المنصات لاستخراج metadata وروابط تنزيل مباشرة، لكن صفحة التفاصيل لم تُحمّل في المتصفح لذلك يجب عدم افتراض endpoint أو أسماء الحقول قبل أن يرسل المستخدم رابط المزود أو يختار المزود رسميًا.

## التوصية الأولية

Apify أسهل للتحقق لأن صفحة الخدمة تعرض Actor ID، مدخل video_url، ومخرجات metadata والملف. لا ينبغي وضع Token في GitHub؛ يجب حفظه باسم `DOWNLOAD_API_KEY` في أسرار الخادم، مع حفظ عنوان الخدمة باسم `DOWNLOAD_API_URL`.
