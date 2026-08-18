import { useEffect, useMemo, useState } from "react";
import { ArrowDown, ArrowLeft, Check, Clipboard, Download, Facebook, FileVideo, Link2, Moon, Play, Search, ShieldCheck, Sparkles, Sun, Video, X, Youtube } from "lucide-react";

type Platform = { name: string; icon: typeof Youtube; color: string };
type Quality = { label: string; detail: string; size: string; recommended?: boolean };

const platforms: Platform[] = [
  { name: "YouTube", icon: Youtube, color: "#ff3b30" }, { name: "TikTok", icon: Video, color: "#36e0e8" },
  { name: "Facebook", icon: Facebook, color: "#1877f2" }, { name: "Instagram", icon: Video, color: "#ef4b9b" },
  { name: "X", icon: X, color: "#e6e8f0" }, { name: "Reddit", icon: Search, color: "#ff6d3b" },
  { name: "Vimeo", icon: Play, color: "#24a8df" }, { name: "Dailymotion", icon: FileVideo, color: "#5a60ff" },
];

export const qualities: Quality[] = [
  { label: "4K Ultra HD", detail: "2160p · MP4", size: "أفضل جودة" },
  { label: "Full HD", detail: "1080p · MP4", size: "موصى بها", recommended: true },
  { label: "HD", detail: "720p · MP4", size: "جودة عالية" },
  { label: "SD", detail: "480p · MP4", size: "حجم متوسط" },
  { label: "اقتصادية", detail: "360p · MP4", size: "حجم صغير" },
  { label: "صوت فقط", detail: "MP3 · 320kbps", size: "استخراج الصوت" },
];

export function detectPlatform(value: string) {
  const lower = value.toLowerCase();
  if (lower.includes("youtube") || lower.includes("youtu.be")) return "YouTube";
  if (lower.includes("tiktok")) return "TikTok";
  if (lower.includes("facebook") || lower.includes("fb.watch")) return "Facebook";
  if (lower.includes("instagram")) return "Instagram";
  if (lower.includes("twitter") || lower.includes("x.com")) return "X";
  if (lower.includes("reddit")) return "Reddit";
  if (lower.includes("vimeo")) return "Vimeo";
  if (lower.includes("dailymotion")) return "Dailymotion";
  return "Unknown platform";
}

export const copy = {
  ar: { dir: "rtl" as const, lang: "العربية", other: "English", home: "الرئيسية", how: "كيف يعمل", supported: "المنصات المدعومة", faq: "الأسئلة الشائعة", try: "جرّب لينك لود", eyebrow: "تحميل سريع، واضح، ومن أي مكان", titleA: "حمّل فيديوهاتك", titleB: "بسهولة وأمان", desc: "ألصق رابط الفيديو من منصتك المفضلة واحصل على أفضل جودة متاحة.", desc2: "بدون حساب، وبدون خطوات معقدة.", placeholder: "ألصق رابط الفيديو هنا...", example: "مثال", download: "فحص الرابط", privacy: "لا نحتفظ بروابطك. تُحذف الملفات المؤقتة تلقائياً بعد التحميل.", simple: "بسيط من البداية للنهاية", why: "لماذا لينك لود؟", steps: ["انسخ الرابط", "ألصق واضغط", "اختر الجودة"], stepText: ["انسخ رابط الفيديو من التطبيق أو المتصفح الذي تستخدمه.", "ألصق الرابط واضغط فحص الرابط لعرض الجودات المتاحة.", "اختر الجودة المناسبة واضغط زر التحميل بجانبها."], platforms: "المنصات المدعومة", ready: "جاهز لتحميل", first: "أول فيديو؟", start: "ابدأ الآن", unknown: "منصة غير معروفة", invalid: "تأكد من أن الرابط يبدأ بـ https:// أو http://", empty: "ألصق رابط الفيديو أولاً للمتابعة.", checking: "جارٍ فحص الرابط وتجهيز الجودات المتاحة...", result: "الجودات المتاحة للرابط", format: "الصيغة", downloadQuality: "تحميل", best: "موصى بها", note: "الجودات المعروضة هي خيارات الواجهة. التوفر الفعلي يعتمد على مصدر الفيديو ومزود الاستخراج." },
  en: { dir: "ltr" as const, lang: "English", other: "العربية", home: "Home", how: "How it works", supported: "Supported platforms", faq: "FAQ", try: "Try LinkLoad", eyebrow: "Fast, clear downloads from anywhere", titleA: "Download your videos", titleB: "simply and safely", desc: "Paste a video link from your favorite platform and get the best available quality.", desc2: "No account and no complicated steps.", placeholder: "Paste video URL here...", example: "Example", download: "Check link", privacy: "We do not permanently store your links. Temporary files are deleted automatically.", simple: "Simple from start to finish", why: "Why LinkLoad?", steps: ["Copy the link", "Paste and check", "Choose quality"], stepText: ["Copy the video URL from the app or browser you use.", "Paste it and check the link to view available qualities.", "Choose a quality and click its download button."], platforms: "Supported platforms", ready: "Ready to download", first: "your first video?", start: "Start now", unknown: "Unknown platform", invalid: "Make sure the URL starts with https:// or http://", empty: "Paste a video URL first to continue.", checking: "Checking the link and preparing available qualities...", result: "Available qualities", format: "Format", downloadQuality: "Download", best: "Recommended", note: "The displayed qualities are interface options. Actual availability depends on the video source and extraction provider." },
};

export default function Home() {
  const [url, setUrl] = useState("");
  const [dark, setDark] = useState(true);
  const [language, setLanguage] = useState<"ar" | "en">("ar");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [showQualities, setShowQualities] = useState(false);
  const t = copy[language];
  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = t.dir;
  }, [language, t.dir]);
  const platform = useMemo(() => (url ? detectPlatform(url) : ""), [url]);

  const handleDownload = () => {
    if (!url.trim()) { setStatus("error"); setMessage(t.empty); setShowQualities(false); return; }
    try { const parsed = new URL(url.trim()); if (!parsed.protocol.startsWith("http")) throw new Error("invalid"); }
    catch { setStatus("error"); setMessage(t.invalid); setShowQualities(false); return; }
    setStatus("loading"); setShowQualities(false); setMessage(t.checking);
    window.setTimeout(() => { setStatus("success"); setMessage(`${t.result} · ${platform || t.unknown}`); setShowQualities(true); }, 700);
  };

  const copyExample = async () => { await navigator.clipboard?.writeText("https://www.youtube.com/watch?v=example"); setUrl("https://www.youtube.com/watch?v=example"); setStatus("idle"); setShowQualities(false); };
  const downloadQuality = (quality: Quality) => { setMessage(`${quality.label} — ${t.downloadQuality} ${platform || t.unknown}`); setStatus("success"); };

  return <main className={dark ? "app dark" : "app light"} dir={t.dir}>
    <div className="ambient ambient-one" /><div className="ambient ambient-two" />
    <header className="topbar container"><a className="brand" href="#top"><span className="brand-mark"><Play size={15} fill="currentColor" /></span><span>Link<span>Load</span></span></a>
      <nav className="nav-links"><a href="#top">{t.home}</a><a href="#how">{t.how}</a><a href="#platforms">{t.supported}</a><a href="#faq">{t.faq}</a></nav>
      <div className="top-actions"><button className="language-button" onClick={() => setLanguage(language === "ar" ? "en" : "ar")} aria-label="Switch language">{t.other}</button><button className="icon-button" onClick={() => setDark(!dark)} aria-label="Toggle theme">{dark ? <Sun size={17} /> : <Moon size={17} />}</button><a className="outline-button" href="#downloader">{t.try} <ArrowLeft size={15} /></a></div>
    </header>
    <section id="top" className="hero container"><div className="eyebrow"><span className="eyebrow-dot" />{t.eyebrow}</div><div className="hero-icon"><Link2 size={27} /></div><h1>{t.titleA}<br /><span>{t.titleB}</span></h1><p className="hero-copy">{t.desc}<br />{t.desc2}</p>
      <div id="downloader" className="download-card"><div className="input-row"><div className="input-wrap"><Link2 size={18} /><input value={url} onChange={e => { setUrl(e.target.value); setStatus("idle"); setShowQualities(false); }} onKeyDown={e => e.key === "Enter" && handleDownload()} placeholder={t.placeholder} aria-label="Video URL" /><button className="paste-button" onClick={copyExample}><Clipboard size={15} />{t.example}</button></div><button className="download-button" onClick={handleDownload}><Download size={18} />{t.download}</button></div><div className="platform-strip">{platforms.map(({ name, icon: Icon, color }) => <span key={name} className="platform-pill"><Icon size={14} color={color} />{name}</span>)}</div>{status !== "idle" && <div className={`status ${status}`}><span className="status-dot">{status === "success" ? <Check size={13} /> : status === "loading" ? <span className="spinner" /> : "!"}</span>{message}</div>}
        {showQualities && <div className="quality-panel"><div className="quality-header"><div><strong>{t.result}</strong><small>{platform || t.unknown}</small></div><span><ShieldCheck size={14} />{t.note}</span></div><div className="quality-list">{qualities.map(q => <div className="quality-row" key={q.label}><div className="quality-badge"><ArrowDown size={15} /><b>{q.label}</b></div><div className="quality-info"><strong>{q.detail}</strong><span>{q.size}{q.recommended && <em>{t.best}</em>}</span></div><button className="quality-download" onClick={() => downloadQuality(q)}><Download size={14} />{t.downloadQuality}</button></div>)}</div></div>}
      </div><div className="privacy-note"><ShieldCheck size={14} />{t.privacy}</div>
    </section>
    <section id="how" className="section container"><div className="section-heading"><span>{t.simple}</span><h2>{t.why}</h2></div><div className="feature-grid">{t.steps.map((step, i) => <article key={step}><span className="step">0{i + 1}</span><h3>{step}</h3><p>{t.stepText[i]}</p></article>)}</div></section>
    <section id="platforms" className="section platforms-section container"><div className="section-heading"><span>{t.platforms}</span><h2>{t.supported}</h2></div><div className="platform-grid">{platforms.map(({ name, icon: Icon, color }) => <a href="#downloader" className="platform-card" key={name}><span className="platform-icon"><Icon size={22} color={color} /></span><span>{name}</span><ArrowLeft size={16} /></a>)}</div></section>
    <section id="faq" className="faq-section"><div className="container faq-inner"><div><span className="eyebrow"><Sparkles size={14} />{t.ready}</span><h2>{t.first}</h2><p>{t.note}</p></div><a className="download-button large" href="#downloader">{t.start} <ArrowLeft size={17} /></a></div></section>
    <footer className="footer container"><a className="brand" href="#top"><span className="brand-mark"><Play size={15} fill="currentColor" /></span><span>Link<span>Load</span></span></a><p>Download videos. Fast. Simple. Anywhere.</p><span>© 2026 LinkLoad</span></footer>
  </main>;
}
