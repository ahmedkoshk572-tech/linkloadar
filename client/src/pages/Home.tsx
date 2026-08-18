import { useMemo, useState } from "react";
import { ArrowDown, ArrowLeft, Check, Clipboard, Download, Facebook, FileVideo, Instagram, Link2, Moon, Play, Search, ShieldCheck, Sparkles, Sun, Twitter, Video, X, Youtube } from "lucide-react";

type Platform = { name: string; slug: string; icon: typeof Youtube; color: string };

const platforms: Platform[] = [
  { name: "يوتيوب", slug: "youtube", icon: Youtube, color: "#ff3b30" },
  { name: "تيك توك", slug: "tiktok", icon: Video, color: "#36e0e8" },
  { name: "فيسبوك", slug: "facebook", icon: Facebook, color: "#1877f2" },
  { name: "إنستغرام", slug: "instagram", icon: Instagram, color: "#ef4b9b" },
  { name: "إكس", slug: "x", icon: X, color: "#e6e8f0" },
  { name: "ريديت", slug: "reddit", icon: Search, color: "#ff6d3b" },
  { name: "فيميو", slug: "vimeo", icon: Play, color: "#24a8df" },
  { name: "دايلي موشن", slug: "dailymotion", icon: FileVideo, color: "#5a60ff" },
];

export function detectPlatform(value: string) {
  const lower = value.toLowerCase();
  if (lower.includes("youtube") || lower.includes("youtu.be")) return "يوتيوب";
  if (lower.includes("tiktok")) return "تيك توك";
  if (lower.includes("facebook") || lower.includes("fb.watch")) return "فيسبوك";
  if (lower.includes("instagram")) return "إنستغرام";
  if (lower.includes("twitter") || lower.includes("x.com")) return "إكس";
  if (lower.includes("reddit")) return "ريديت";
  if (lower.includes("vimeo")) return "فيميو";
  if (lower.includes("dailymotion")) return "دايلي موشن";
  return "منصة غير معروفة";
}

export default function Home() {
  const [url, setUrl] = useState("");
  const [dark, setDark] = useState(true);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const platform = useMemo(() => (url ? detectPlatform(url) : ""), [url]);

  const handleDownload = () => {
    if (!url.trim()) {
      setStatus("error");
      setMessage("ألصق رابط الفيديو أولاً للمتابعة.");
      return;
    }
    try {
      const parsed = new URL(url.trim());
      if (!parsed.protocol.startsWith("http")) throw new Error("invalid");
    } catch {
      setStatus("error");
      setMessage("تأكد من أن الرابط يبدأ بـ https:// أو http://");
      return;
    }
    setStatus("loading");
    setMessage("جارٍ فحص الرابط وتجهيز أفضل جودة متاحة...");
    window.setTimeout(() => {
      setStatus("success");
      setMessage(`تم التعرف على الرابط — المنصة: ${platform || "غير معروفة"}. اختر الجودة من مزوّد التحميل عند التفعيل.`);
    }, 700);
  };

  const copyExample = async () => {
    await navigator.clipboard?.writeText("https://www.youtube.com/watch?v=example");
    setUrl("https://www.youtube.com/watch?v=example");
    setStatus("idle");
  };

  return (
    <main className={dark ? "app dark" : "app light"} dir="rtl">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <header className="topbar container">
        <a className="brand" href="#top" aria-label="لينك لود الرئيسية"><span className="brand-mark"><Play size={15} fill="currentColor" /></span><span>لينك<span>لود</span></span></a>
        <nav className="nav-links" aria-label="التنقل الرئيسي">
          <a href="#top">الرئيسية</a><a href="#how">كيف يعمل</a><a href="#platforms">المنصات المدعومة</a><a href="#faq">الأسئلة الشائعة</a>
        </nav>
        <div className="top-actions"><button className="icon-button" onClick={() => setDark(!dark)} aria-label="تبديل المظهر">{dark ? <Sun size={17} /> : <Moon size={17} />}</button><a className="outline-button" href="#downloader">جرّب لينك لود <ArrowLeft size={15} /></a></div>
      </header>

      <section id="top" className="hero container">
        <div className="eyebrow"><span className="eyebrow-dot" /> تحميل سريع، واضح، ومن أي مكان</div>
        <div className="hero-icon"><Link2 size={27} /></div>
        <h1>حمّل فيديوهاتك<br /><span>بسهولة وأمان</span></h1>
        <p className="hero-copy">ألصق رابط الفيديو من منصتك المفضلة واحصل على أفضل جودة متاحة.<br />بدون حساب، وبدون خطوات معقدة.</p>
        <div id="downloader" className="download-card">
          <div className="input-row"><div className="input-wrap"><Link2 size={18} /><input value={url} onChange={(e) => { setUrl(e.target.value); setStatus("idle"); }} onKeyDown={(e) => e.key === "Enter" && handleDownload()} placeholder="ألصق رابط الفيديو هنا..." aria-label="رابط الفيديو" /><button className="paste-button" onClick={copyExample}><Clipboard size={15} /> مثال</button></div><button className="download-button" onClick={handleDownload}><Download size={18} /> تحميل</button></div>
          <div className="platform-strip">{platforms.map(({ name, icon: Icon, color }) => <span key={name} className="platform-pill"><Icon size={14} color={color} />{name}</span>)}</div>
          {status !== "idle" && <div className={`status ${status}`}><span className="status-dot">{status === "success" ? <Check size={13} /> : status === "loading" ? <span className="spinner" /> : "!"}</span>{message}</div>}
        </div>
        <div className="privacy-note"><ShieldCheck size={14} /> لا نحتفظ بروابطك. تُحذف الملفات المؤقتة تلقائياً بعد التحميل.</div>
      </section>

      <section id="how" className="section container"><div className="section-heading"><span>بسيط من البداية للنهاية</span><h2>لماذا <strong>لينك لود؟</strong></h2></div><div className="feature-grid"><article><span className="step">01</span><h3>انسخ الرابط</h3><p>انسخ رابط الفيديو من التطبيق أو المتصفح الذي تستخدمه.</p></article><article><span className="step">02</span><h3>ألصق واضغط</h3><p>ألصق الرابط في المربع واضغط زر التحميل، وسنتولى الباقي.</p></article><article><span className="step">03</span><h3>اختر الجودة</h3><p>اختر من الصيغ والجودات الحقيقية المتاحة للفيديو.</p></article></div></section>

      <section id="platforms" className="section platforms-section container"><div className="section-heading"><span>كل روابطك في مكان واحد</span><h2>المنصات <strong>المدعومة</strong></h2></div><div className="platform-grid">{platforms.map(({ name, icon: Icon, color }) => <a href="#downloader" className="platform-card" key={name}><span className="platform-icon"><Icon size={22} color={color} /></span><span>{name}</span><ArrowLeft size={16} /></a>)}</div></section>

      <section id="faq" className="faq-section"><div className="container faq-inner"><div><span className="eyebrow"><Sparkles size={14} /> مصمم ليكون واضحاً</span><h2>جاهز لتحميل<br /><strong>أول فيديو؟</strong></h2><p>جرّب لينك لود الآن. الخدمة تدعم الروابط العامة فقط وتحترم حقوق أصحاب المحتوى.</p></div><a className="download-button large" href="#downloader">ابدأ الآن <ArrowLeft size={17} /></a></div></section>
      <footer className="footer container"><a className="brand" href="#top"><span className="brand-mark"><Play size={15} fill="currentColor" /></span><span>لينك<span>لود</span></span></a><p>حمّل فيديوهاتك. بسرعة. ببساطة. من أي مكان.</p><span>© 2026 لينك لود</span></footer>
    </main>
  );
}
