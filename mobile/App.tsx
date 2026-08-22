import { useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Alert, AppState, FlatList, Image, Linking, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { Ionicons } from "@expo/vector-icons";
import { analyze, downloadUrl, health, type MediaFormat, type PreviewInfo } from "./src/api";

type Tab = "home" | "history" | "settings";
type DownloadItem = { id: string; title: string; progress: number; status: "downloading" | "completed" | "failed"; ext: string; uri?: string };
const ADSTERRA_SMARTLINK = "https://www.profitableratecpmnetwork.com/bzxi45g82?key=3a29179c0eac28c72d162db955abdd06";

export default function App() {
  const [tab, setTab] = useState<Tab>("home");
  const [url, setUrl] = useState("");
  const [preview, setPreview] = useState<PreviewInfo | null>(null);
  const [selected, setSelected] = useState<MediaFormat | null>(null);
  const [busy, setBusy] = useState(false);
  const [apiReady, setApiReady] = useState<boolean | null>(null);
  const [message, setMessage] = useState("ألصق رابط فيديو عام ومسموح بتنزيله.");
  const [downloads, setDownloads] = useState<DownloadItem[]>([]);
  const pendingAnalyzeUrl = useRef<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const checkHealth = () => health().then(() => mounted && setApiReady(true)).catch(() => mounted && setApiReady(false));
    checkHealth();
    const interval = setInterval(checkHealth, 15000);
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        checkHealth();
        const pendingUrl = pendingAnalyzeUrl.current;
        if (pendingUrl) {
          pendingAnalyzeUrl.current = null;
          setTimeout(() => { if (mounted) void performAnalyze(pendingUrl); }, 250);
        }
      }
    });
    return () => { mounted = false; clearInterval(interval); subscription.remove(); };
  }, []);

  const videoFormats = useMemo(() => preview?.formats.filter((format) => format.hasVideo) ?? [], [preview]);

  async function performAnalyze(targetUrl: string) {
    setBusy(true); setPreview(null); setSelected(null); setMessage("جارٍ فحص الرابط والجودات الفعلية...");
    try {
      const result = await analyze(targetUrl);
      if (!result.formats?.length) throw new Error("لم يجد الخادم صيغة متاحة لهذا الرابط.");
      setPreview(result); setSelected(result.formats.find((format) => format.hasVideo) ?? result.formats[0]); setMessage("تم العثور على الجودات المتاحة فعليًا.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "تعذر فحص الرابط."); }
    finally { setBusy(false); }
  }

  async function handleAnalyze() {
    const targetUrl = url.trim();
    if (!targetUrl) { setMessage("أدخل رابطًا أولًا."); return; }
    setBusy(true); setPreview(null); setSelected(null); setMessage("جارٍ فتح الإعلان قبل عرض قائمة الجودات...");
    pendingAnalyzeUrl.current = targetUrl;
    try {
      await Linking.openURL(ADSTERRA_SMARTLINK);
    } catch {
      pendingAnalyzeUrl.current = null;
      setBusy(false);
      setMessage("تعذر فتح الإعلان. حاول مرة أخرى.");
    }
  }

  async function handleDownload(format: MediaFormat) {
    const id = `${Date.now()}`;
    const title = preview?.title ?? "LinkLoad video";
    const ext = format.ext ?? "mp4";
    setDownloads((items) => [{ id, title, progress: 0, status: "downloading", ext }, ...items]);
    setBusy(true); setMessage("جارٍ تنزيل الملف في الخلفية...");
    try {
      const target = `${FileSystem.cacheDirectory ?? ""}linkload-${id}.${ext}`;
      const task = FileSystem.createDownloadResumable(downloadUrl(url.trim(), format.formatId), target, {}, (state) => {
        const progress = state.totalBytesExpectedToWrite ? Math.round(state.totalBytesWritten / state.totalBytesExpectedToWrite * 100) : 0;
        setDownloads((items) => items.map((item) => item.id === id ? { ...item, progress } : item));
      });
      const result = await task.downloadAsync();
      setDownloads((items) => items.map((item) => item.id === id ? { ...item, progress: 100, status: "completed", uri: result?.uri } : item));
      setMessage("اكتمل التنزيل. يمكنك مشاركة الملف أو فتحه من سجل التنزيلات.");
      setPreview(null); setUrl("");
    } catch (error) {
      setDownloads((items) => items.map((item) => item.id === id ? { ...item, status: "failed" } : item));
      setMessage(error instanceof Error ? error.message : "تعذر تنزيل الملف.");
    } finally {
      setBusy(false);
      health().then(() => setApiReady(true)).catch(() => setApiReady(false));
    }
  }

  async function openAd() {
    try {
      await Linking.openURL(ADSTERRA_SMARTLINK);
    } catch {
      Alert.alert("LinkLoad", "تعذر فتح الإعلان في المتصفح.");
    }
  }

  async function share(item: DownloadItem) {
    if (!item.uri || !(await Sharing.isAvailableAsync())) { Alert.alert("LinkLoad", "المشاركة غير متاحة على هذا الجهاز."); return; }
    await Sharing.shareAsync(item.uri, { dialogTitle: "مشاركة ملف LinkLoad" });
  }

  return <SafeAreaView style={styles.safe}><View style={styles.app}><View style={styles.topbar}><View style={styles.brandRow}><View style={styles.logo}><Ionicons name="play" size={15} color="#fff" /></View><Text style={styles.brand}>Link<Text style={styles.brandAccent}>Load</Text></Text></View><View style={styles.statusPill}><View style={[styles.statusDot, apiReady === true && styles.statusReady]} /><Text style={styles.statusText}>{apiReady === true ? "متصل" : apiReady === false ? "غير متصل" : "..."}</Text></View></View>{tab === "home" ? <HomeScreen url={url} setUrl={setUrl} preview={preview} selected={selected} setSelected={setSelected} busy={busy} message={message} handleAnalyze={handleAnalyze} handleDownload={handleDownload} videoFormats={videoFormats} /> : tab === "history" ? <HistoryScreen downloads={downloads} share={share} /> : <SettingsScreen apiReady={apiReady} />}</View><View style={styles.tabs}><TabButton icon="home-outline" active={tab === "home"} label="الرئيسية" onPress={() => setTab("home")} /><TabButton icon="download-outline" active={tab === "history"} label="التنزيلات" onPress={() => setTab("history")} badge={downloads.length || undefined} /><TabButton icon="settings-outline" active={tab === "settings"} label="الإعدادات" onPress={() => setTab("settings")} /></View></SafeAreaView>;
}

function HomeScreen({ url, setUrl, preview, selected, setSelected, busy, message, handleAnalyze, handleDownload, videoFormats }: { url: string; setUrl: (value: string) => void; preview: PreviewInfo | null; selected: MediaFormat | null; setSelected: (format: MediaFormat) => void; busy: boolean; message: string; handleAnalyze: () => void; handleDownload: (format: MediaFormat) => void; videoFormats: MediaFormat[] }) {
  return <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled"><View style={styles.hero}><Text style={styles.eyebrow}>تحميل سريع، واضح، وآمن</Text><Text style={styles.heroTitle}>حمّل فيديوهاتك{`\n`}<Text style={styles.accent}>بسهولة وأمان</Text></Text><Text style={styles.heroBody}>ألصق الرابط، اعرض الجودات الفعلية، ثم اختر الملف المناسب لهاتفك.</Text></View><View style={styles.card}><View style={styles.cardHeader}><View><Text style={styles.cardEyebrow}>تنزيل جديد</Text><Text style={styles.cardTitle}>ابدأ برابط</Text></View><Ionicons name="shield-checkmark-outline" size={22} color="#8f84f4" /></View><TextInput value={url} onChangeText={setUrl} placeholder="ألصق رابط فيديو هنا..." placeholderTextColor="#777b8c" style={styles.input} autoCapitalize="none" autoCorrect={false} returnKeyType="done" onSubmitEditing={handleAnalyze} /><Pressable style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]} onPress={handleAnalyze} disabled={busy}><Text style={styles.primaryText}>{busy ? "جارٍ التنفيذ..." : "فحص الرابط"}</Text>{busy ? <ActivityIndicator color="#fff" size="small" /> : <Ionicons name="arrow-forward" size={17} color="#fff" />}</Pressable><Text style={styles.hint}>{message}</Text></View>{preview ? <View style={styles.previewCard}>{preview.thumbnail ? <Image source={{ uri: preview.thumbnail }} style={styles.previewImage} /> : <View style={styles.previewFallback}><Ionicons name="videocam-outline" size={24} color="#8f84f4" /></View>}<Text style={styles.previewTitle} numberOfLines={2}>{preview.title || "Video preview"}</Text><Text style={styles.previewMeta}>{preview.uploader || "Public source"} {preview.duration ? `• ${Math.round(preview.duration / 60)} min` : ""}</Text><Text style={styles.chooseLabel}>اختر الجودة المتاحة</Text><View style={styles.formatGrid}>{videoFormats.slice(0, 8).map((format) => <Pressable key={format.formatId} onPress={() => setSelected(format)} style={[styles.formatChip, selected?.formatId === format.formatId && styles.formatChipActive]}><Text style={[styles.formatChipTitle, selected?.formatId === format.formatId && styles.formatChipTitleActive]}>{format.height ? `${format.height}p` : format.ext?.toUpperCase() || "Media"}</Text><Text style={styles.formatChipMeta}>{format.ext?.toUpperCase() || "FILE"}{format.fps ? ` · ${format.fps}fps` : ""}</Text></Pressable>)}</View>{selected ? <Pressable style={styles.downloadButton} onPress={() => handleDownload(selected)} disabled={busy}><Ionicons name="download-outline" size={18} color="#fff" /><Text style={styles.primaryText}>تنزيل {selected.height ? `${selected.height}p` : selected.ext?.toUpperCase()}</Text></Pressable> : null}</View> : null}<View style={styles.adGateNotice}><Ionicons name="megaphone-outline" size={16} color="#a99dff" /><Text style={styles.adGateText}>سيظهر إعلان قبل عرض قائمة الجودات.</Text></View><View style={styles.notice}><Ionicons name="information-circle-outline" size={17} color="#7c72e5" /><Text style={styles.noticeText}>للمحتوى العام والمصرّح بتنزيله فقط. لا يدعم LinkLoad تجاوز DRM أو الحسابات الخاصة.</Text></View></ScrollView>;
}

function AdCard({ onOpenAd }: { onOpenAd: () => void }) {
  return <View style={styles.adCard}><View style={styles.adHeader}><View style={styles.adIcon}><Ionicons name="megaphone-outline" size={18} color="#fff" /></View><View style={styles.adCopy}><Text style={styles.adEyebrow}>دعم LinkLoad</Text><Text style={styles.adTitle}>إعلان اختياري</Text><Text style={styles.adBody}>يفتح الإعلان في المتصفح ويمكنك تجاهله تمامًا.</Text></View></View><Pressable onPress={onOpenAd} style={({ pressed }) => [styles.adButton, pressed && styles.pressed]}><Text style={styles.adButtonText}>عرض الإعلان</Text><Ionicons name="open-outline" size={16} color="#d9d3ff" /></Pressable></View>;
}

function HistoryScreen({ downloads, share }: { downloads: DownloadItem[]; share: (item: DownloadItem) => void }) {
  return <View style={styles.screen}><Text style={styles.screenEyebrow}>سجل التنزيلات</Text><Text style={styles.screenTitle}>ملفاتك الأخيرة</Text>{downloads.length === 0 ? <View style={styles.empty}><Ionicons name="download-outline" size={28} color="#8f84f4" /><Text style={styles.emptyTitle}>لا توجد تنزيلات بعد</Text><Text style={styles.emptyText}>ستظهر الملفات هنا بعد أول تنزيل.</Text></View> : <FlatList data={downloads} keyExtractor={(item) => item.id} contentContainerStyle={styles.list} renderItem={({ item }) => <View style={styles.downloadRow}><View style={styles.downloadIcon}><Ionicons name={item.status === "completed" ? "checkmark" : item.status === "failed" ? "close" : "time-outline"} size={18} color={item.status === "completed" ? "#46c28f" : item.status === "failed" ? "#ed7082" : "#9b8fff"} /></View><View style={styles.downloadInfo}><Text style={styles.downloadTitle} numberOfLines={1}>{item.title}</Text><Text style={styles.downloadMeta}>{item.ext.toUpperCase()} • {item.status === "completed" ? "اكتمل" : item.status === "failed" ? "فشل" : `${item.progress}%`}</Text><View style={styles.miniProgress}><View style={[styles.miniProgressFill, { width: `${item.progress}%` }]} /></View></View>{item.status === "completed" ? <Pressable onPress={() => share(item)}><Ionicons name="share-outline" size={20} color="#8f84f4" /></Pressable> : null}</View>} />}</View>;
}

function SettingsScreen({ apiReady }: { apiReady: boolean | null }) {
  return <ScrollView contentContainerStyle={styles.content}><Text style={styles.screenEyebrow}>الإعدادات</Text><Text style={styles.screenTitle}>LinkLoad</Text><View style={styles.settingsCard}><SettingRow icon="server-outline" title="خدمة التنزيل" value={apiReady ? "متصلة" : "بانتظار VPS"} ready={apiReady === true} /><SettingRow icon="shield-checkmark-outline" title="الخصوصية" value="ملفات مؤقتة" /><SettingRow icon="language-outline" title="اللغة" value="العربية / English" /></View><View style={styles.notice}><Ionicons name="server-outline" size={17} color="#7c72e5" /><Text style={styles.noticeText}>يمكن تغيير عنوان الخادم لاحقًا من EXPO_PUBLIC_API_URL عند شراء الـVPS، دون تغيير منطق التطبيق.</Text></View></ScrollView>;
}

function SettingRow({ icon, title, value, ready }: { icon: keyof typeof Ionicons.glyphMap; title: string; value: string; ready?: boolean }) { return <View style={styles.settingRow}><Ionicons name={icon} size={20} color="#8f84f4" /><View style={styles.settingInfo}><Text style={styles.settingTitle}>{title}</Text><Text style={styles.settingValue}>{value}</Text></View>{ready ? <Ionicons name="checkmark-circle" size={19} color="#46c28f" /> : <Ionicons name="chevron-back" size={17} color="#777b8c" />}</View>; }
function TabButton({ icon, active, label, onPress, badge }: { icon: keyof typeof Ionicons.glyphMap; active: boolean; label: string; onPress: () => void; badge?: number }) { return <Pressable onPress={onPress} style={styles.tabButton}><Ionicons name={icon} size={22} color={active ? "#9b8fff" : "#747889"} /><Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{label}</Text>{badge ? <View style={styles.badge}><Text style={styles.badgeText}>{badge}</Text></View> : null}</Pressable>; }

const styles = StyleSheet.create({ safe: { flex: 1, backgroundColor: "#08080f" }, app: { flex: 1, backgroundColor: "#08080f" }, topbar: { height: 72, paddingHorizontal: 20, flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderBottomWidth: 1, borderBottomColor: "#1b1b28" }, brandRow: { flexDirection: "row", alignItems: "center" }, logo: { width: 30, height: 30, borderRadius: 10, backgroundColor: "#704cff", alignItems: "center", justifyContent: "center", transform: [{ rotate: "-8deg" }] }, brand: { color: "#f6f4ff", fontSize: 21, fontWeight: "800", marginLeft: 9, letterSpacing: -0.8 }, brandAccent: { color: "#927dff" }, statusPill: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 15, backgroundColor: "#141522" }, statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#7b7e8c" }, statusReady: { backgroundColor: "#46c28f" }, statusText: { color: "#8a8d9d", fontSize: 10 }, content: { padding: 20, paddingBottom: 34 }, hero: { paddingTop: 28, paddingBottom: 25 }, eyebrow: { color: "#9b8fff", fontSize: 12, fontWeight: "700", marginBottom: 14 }, heroTitle: { color: "#f7f5ff", fontSize: 38, fontWeight: "800", lineHeight: 44, letterSpacing: -1 }, accent: { color: "#9b8fff" }, heroBody: { color: "#9693a6", fontSize: 13, lineHeight: 21, marginTop: 15, maxWidth: 330 }, card: { backgroundColor: "#13131e", borderWidth: 1, borderColor: "#272638", borderRadius: 16, padding: 16 }, cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 15 }, cardEyebrow: { color: "#9b8fff", fontSize: 10, fontWeight: "700", marginBottom: 5 }, cardTitle: { color: "#f6f4ff", fontSize: 17, fontWeight: "800" }, input: { height: 50, borderRadius: 10, borderWidth: 1, borderColor: "#292a3a", backgroundColor: "#0f0f18", color: "#f5f3ff", paddingHorizontal: 14, fontSize: 13, textAlign: "right" }, primaryButton: { height: 49, borderRadius: 10, backgroundColor: "#704cff", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 10 }, pressed: { opacity: .78, transform: [{ scale: .99 }] }, primaryText: { color: "#fff", fontWeight: "800", fontSize: 13 }, hint: { color: "#858898", fontSize: 10, textAlign: "center", marginTop: 11, lineHeight: 16 }, previewCard: { backgroundColor: "#13131e", borderColor: "#29283d", borderWidth: 1, borderRadius: 16, marginTop: 14, padding: 14 }, previewImage: { height: 160, borderRadius: 11, backgroundColor: "#0d0d15", marginBottom: 12 }, previewFallback: { height: 90, borderRadius: 11, backgroundColor: "#22203c", alignItems: "center", justifyContent: "center", marginBottom: 12 }, previewTitle: { color: "#f7f5ff", fontSize: 14, fontWeight: "700", lineHeight: 20 }, previewMeta: { color: "#858898", fontSize: 10, marginTop: 5 }, chooseLabel: { color: "#a6a3b4", fontSize: 11, fontWeight: "700", marginTop: 16, marginBottom: 9 }, formatGrid: { flexDirection: "row", flexWrap: "wrap", gap: 7 }, formatChip: { minWidth: 74, borderWidth: 1, borderColor: "#2a2b3a", borderRadius: 9, paddingVertical: 8, paddingHorizontal: 9, backgroundColor: "#10101a" }, formatChipActive: { borderColor: "#7f6aff", backgroundColor: "#272144" }, formatChipTitle: { color: "#d1cede", fontSize: 12, fontWeight: "800" }, formatChipTitleActive: { color: "#a99dff" }, formatChipMeta: { color: "#77798a", fontSize: 9, marginTop: 3 }, downloadButton: { height: 46, marginTop: 14, borderRadius: 10, backgroundColor: "#704cff", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },   adCard: { backgroundColor: "#17152a", borderWidth: 1, borderColor: "#35305d", borderRadius: 14, padding: 14, marginTop: 15 }, adHeader: { flexDirection: "row", alignItems: "center" }, adIcon: { width: 36, height: 36, borderRadius: 11, backgroundColor: "#704cff", alignItems: "center", justifyContent: "center" }, adCopy: { flex: 1, marginLeft: 10 }, adEyebrow: { color: "#a99dff", fontSize: 10, fontWeight: "700" }, adTitle: { color: "#f7f5ff", fontSize: 14, fontWeight: "800", marginTop: 3 }, adBody: { color: "#9693a6", fontSize: 10, marginTop: 3 }, adButton: { height: 40, borderRadius: 9, borderWidth: 1, borderColor: "#51478e", marginTop: 12, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7 }, adButtonText: { color: "#d9d3ff", fontSize: 12, fontWeight: "800" }, adGateNotice: { flexDirection: "row", gap: 8, alignItems: "center", backgroundColor: "#17152a", borderRadius: 9, borderWidth: 1, borderColor: "#35305d", padding: 10, marginTop: 12 }, adGateText: { flex: 1, color: "#a99dff", fontSize: 10 }, notice: { flexDirection: "row", gap: 9, alignItems: "flex-start", backgroundColor: "#111120", borderRadius: 10, borderWidth: 1, borderColor: "#252441", padding: 12, marginTop: 15 }, noticeText: { flex: 1, color: "#898798", fontSize: 10, lineHeight: 16 }, tabs: { height: 72, borderTopWidth: 1, borderTopColor: "#1c1c29", backgroundColor: "#101019", flexDirection: "row", justifyContent: "space-around", alignItems: "center", paddingBottom: 5 }, tabButton: { alignItems: "center", justifyContent: "center", minWidth: 82, gap: 4, position: "relative" }, tabLabel: { color: "#747889", fontSize: 10 }, tabLabelActive: { color: "#9b8fff", fontWeight: "700" }, badge: { position: "absolute", top: -5, right: 13, backgroundColor: "#704cff", minWidth: 15, height: 15, borderRadius: 8, alignItems: "center", justifyContent: "center" }, badgeText: { color: "#fff", fontSize: 8, fontWeight: "800" }, screen: { flex: 1, padding: 20 }, screenEyebrow: { color: "#9b8fff", fontSize: 11, fontWeight: "700", marginTop: 22, marginBottom: 8 }, screenTitle: { color: "#f7f5ff", fontSize: 27, fontWeight: "800", marginBottom: 24 }, empty: { alignItems: "center", justifyContent: "center", paddingVertical: 100 }, emptyTitle: { color: "#f7f5ff", fontSize: 15, fontWeight: "700", marginTop: 14 }, emptyText: { color: "#858898", fontSize: 11, marginTop: 7 }, list: { paddingBottom: 30 }, downloadRow: { backgroundColor: "#13131e", borderWidth: 1, borderColor: "#282839", borderRadius: 12, padding: 12, flexDirection: "row", alignItems: "center", marginBottom: 9 }, downloadIcon: { width: 35, height: 35, borderRadius: 10, backgroundColor: "#22213b", alignItems: "center", justifyContent: "center" }, downloadInfo: { flex: 1, marginHorizontal: 10 }, downloadTitle: { color: "#f1effa", fontSize: 12, fontWeight: "700" }, downloadMeta: { color: "#858898", fontSize: 10, marginTop: 4 }, miniProgress: { height: 3, backgroundColor: "#292a3a", borderRadius: 3, marginTop: 8, overflow: "hidden" }, miniProgressFill: { height: 3, backgroundColor: "#8f84f4" }, settingsCard: { backgroundColor: "#13131e", borderWidth: 1, borderColor: "#29283a", borderRadius: 14, paddingHorizontal: 14 }, settingRow: { minHeight: 64, borderBottomWidth: 1, borderBottomColor: "#252536", flexDirection: "row", alignItems: "center", gap: 12 }, settingRowLast: { borderBottomWidth: 0 }, settingInfo: { flex: 1 }, settingTitle: { color: "#f0eef7", fontSize: 12, fontWeight: "700" }, settingValue: { color: "#858898", fontSize: 10, marginTop: 4 }
});
