import path from "node:path";
import { Circle, Document, Font, Page, Rect, StyleSheet, Svg, Text, View, renderToBuffer } from "@react-pdf/renderer";
import { getScorecardCopy } from "../../content/scorecard/copy";
import { getQuestionContent } from "../../content/scorecard/questions";
import { formatNumber, levelLabel, normalizeLocale, type Locale } from "../i18n";
import { COLORS as C, profileBars, quadrantCells, quadrantPoint } from "../scorecard/chart-geometry";
import { AREAS, type FindingText, type Quadrant as QuadrantId, type ReportModel } from "../scorecard/types";

const font = (file: string) => path.join(process.cwd(), "public/fonts", file);
Font.register({ family: "DM Sans", fonts: [{ src: font("dm-sans-400.ttf"), fontWeight: 400 }, { src: font("dm-sans-500.ttf"), fontWeight: 500 }, { src: font("dm-sans-700.ttf"), fontWeight: 700 }] });
Font.register({ family: "Manrope", fonts: [{ src: font("manrope-600.ttf"), fontWeight: 600 }, { src: font("manrope-700.ttf"), fontWeight: 700 }] });
Font.registerHyphenationCallback(word => [word]);

const s = StyleSheet.create({
  page: { backgroundColor: C.paper, color: C.ink, fontFamily: "DM Sans", fontSize: 9.5, lineHeight: 1.5, padding: 40, paddingBottom: 56 },
  label: { fontSize: 7.5, fontWeight: 500, letterSpacing: 1, textTransform: "uppercase", color: C.green, marginBottom: 5 },
  h1: { fontFamily: "Manrope", fontWeight: 600, fontSize: 24, lineHeight: 1.15, marginBottom: 8 },
  h2: { fontFamily: "Manrope", fontWeight: 600, fontSize: 15, marginBottom: 10, marginTop: 18 },
  h3: { fontFamily: "Manrope", fontWeight: 700, fontSize: 11, marginBottom: 4 },
  muted: { color: C.muted },
  card: { borderWidth: 1, borderColor: C.line, borderRadius: 8, padding: 12, marginBottom: 8 },
  row: { flexDirection: "row", gap: 10 },
  // An explicit A4 top offset stays stable when the page is split; bottom drifts during pagination.
  footer: { position: "absolute", top: 806, left: 40, right: 40, flexDirection: "row", justifyContent: "space-between", fontSize: 7.5, color: C.muted },
});

function Finding({ f, tint, locale }: { f: FindingText; tint?: string; locale: Locale }) {
  return (
    <View style={[s.card, tint ? { backgroundColor: tint, borderColor: tint } : {}]} wrap={false}>
      <Text style={s.h3}>{f.title}</Text>
      {f.observed ? <Text style={s.muted}>{f.observed}</Text> : null}
      {f.why ? <Text style={{ marginTop: 4 }}>{f.why}</Text> : null}
      <Text style={{ marginTop: 6 }}><Text style={{ fontWeight: 700 }}>{locale === "hu" ? "Teendő: " : "Do this: "}</Text>{f.action}</Text>
      {f.done ? <Text style={{ marginTop: 4 }}><Text style={{ fontWeight: 700 }}>{locale === "hu" ? "Akkor kész, ha: " : "Done when: "}</Text>{f.done}</Text> : null}
    </View>
  );
}

function Profile({ r }: { r: ReportModel }) {
  const locale = normalizeLocale(r.locale ?? "en");
  const { AREA_NAMES } = getQuestionContent(locale);
  const { capNote } = getScorecardCopy(locale);
  const track = 240, rowH = 26;
  const rows = profileBars(r, track);
  return (
    <View>
      {rows.map(row => (
        <View key={row.area} style={{ flexDirection: "row", alignItems: "center", minHeight: rowH }} wrap={false}>
          <Text style={{ width: 130, paddingRight: 6 }}>{AREA_NAMES[row.area]}</Text>
          <Svg width={track} height={12}>
            <Rect x={0} y={0} width={track} height={12} rx={3} fill="#E6E7E0" />
            {row.ghostWidth > 0 ? <Rect x={0} y={0} width={row.ghostWidth} height={12} rx={3} fill={C.ghost} /> : null}
            <Rect x={0} y={0} width={row.width} height={12} rx={3} fill={C.ink} />
          </Svg>
          <Text style={{ width: 145, textAlign: "right", paddingLeft: 6 }}>{formatNumber(r.areas[row.area].score, locale)} · {levelLabel(r.areas[row.area].level, locale)}</Text>
        </View>
      ))}
      {r.ai.capped ? (
        <Text style={[s.muted, { marginTop: 6 }]}>{locale === "hu" ? "Miért alacsonyabb az AI-felkészültség? " : "Why AI readiness is capped: "}{capNote(r)}</Text>
      ) : null}
    </View>
  );
}

function Quadrant({ r }: { r: ReportModel }) {
  const locale = normalizeLocale(r.locale ?? "en");
  const { QUADRANT_AXES, QUADRANT_TEXT, automationCapNote } = getScorecardCopy(locale);
  const size = 130, radius = 7;
  const { opportunity, readiness, capped, quadrant } = r.automation;
  const p = quadrantPoint(opportunity, readiness, size, radius);
  const cells = quadrantCells(size);
  const q = QUADRANT_TEXT[quadrant];
  // Quadrant names sit above and below the square, so the dot can never cover them.
  const labels = (top: boolean) => (
    <View style={{ flexDirection: "row", width: size }}>
      {(Object.keys(cells) as QuadrantId[]).filter(k => cells[k].top === top).map(k => (
        <Text key={k} style={{ width: cells[k].w, textAlign: "center", fontSize: 6.5, color: k === quadrant ? C.ink : C.muted, fontWeight: k === quadrant ? 700 : 400 }}>{QUADRANT_TEXT[k].title}</Text>
      ))}
    </View>
  );
  return (
    <View style={[s.row, { alignItems: "center" }]} wrap={false}>
      <View style={{ width: size }}>
        {labels(true)}
        <Svg width={size} height={size} style={{ marginVertical: 3 }}>
          {(Object.keys(cells) as QuadrantId[]).map(k => (
            <Rect key={k} x={cells[k].x} y={cells[k].y} width={cells[k].w} height={cells[k].h} fill={k === quadrant ? "#EAF0DC" : "#FFFFFF"} stroke={C.line} />
          ))}
          <Circle cx={p.x} cy={p.y} r={radius} fill={C.lime} stroke={C.ink} strokeWidth={2} />
        </Svg>
        {labels(false)}
        <Text style={[s.muted, { fontSize: 6.5, marginTop: 4 }]}>↑ {QUADRANT_AXES.up}{"\n"}→ {QUADRANT_AXES.right}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={s.h3}>{q.title}</Text>
        <Text>{q.text}</Text>
        <Text style={[s.muted, { marginTop: 4 }]}>{locale === "hu" ? "Lehetőség" : "Opportunity"} {formatNumber(opportunity, locale)} · {locale === "hu" ? "Felkészültség" : "Readiness"} {formatNumber(readiness, locale)} {locale === "hu" ? "(4 pontból)" : "(of 4)"}</Text>
        {capped ? <Text style={[s.muted, { marginTop: 4 }]}>{automationCapNote(r)}</Text> : null}
      </View>
    </View>
  );
}

export function ReportDocument({ r, reportUrl }: { r: ReportModel; reportUrl: string }) {
  const locale = normalizeLocale(r.locale ?? "en");
  const hu = locale === "hu";
  const { ROADMAP_COLUMNS, formatReportDate, freeTextLabel, reportIntro } = getScorecardCopy(locale);
  const { AREA_NAMES } = getQuestionContent(locale);
  const title = hu ? "Grismont Folyamat-pontozó" : "Grismont Discovery Scorecard";
  const date = formatReportDate(r);
  return (
    <Document title={`${hu ? "Folyamat-pontozó" : "Discovery Scorecard"} – ${r.intake.firstName}`} author="Grismont" language={locale}>
      <Page size="A4" style={s.page}>
        <View style={s.footer} fixed>
          <Text style={{ flex: 1, paddingRight: 10 }}>grismont · {reportUrl}</Text>
          <Text render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}${hu ? " oldal" : ""}`} />
        </View>
        <Text style={s.label}>{title} · {date}</Text>
        <Text style={s.h1}>{hu ? `${r.intake.firstName}, itt tartasz most.` : `${r.intake.firstName}, here's where you stand.`}</Text>
        <Text style={s.muted}>{reportIntro(r)}</Text>
        <View wrap={false}>
          <Text style={s.h2}>{hu ? "Eredmények hat területen" : "Your profile"}</Text>
          <Profile r={r} />
        </View>
        <View wrap={false}>
          <Text style={s.h2}>{hu ? "Automatizálás: lehetőség és felkészültség" : "Automation: opportunity vs. readiness"}</Text>
          <Quadrant r={r} />
        </View>
        <View wrap={false}>
          <Text style={s.h2}>{hu ? "A legnagyobb kockázat" : "Your biggest risk"}</Text>
          <Finding f={r.biggestRisk} tint={C.lilac} locale={locale} />
        </View>
        {r.quickWins.map((f, i) => (
          <View key={f.id} wrap={false} break={i === 0}>
            {i === 0 ? <Text style={s.h2}>{hu ? "Három gyors javítás a jövő hétre" : "Three quick wins for next week"}</Text> : null}
            <Finding f={f} locale={locale} />
          </View>
        ))}
        <View wrap={false}>
          <Text style={s.h2}>{hu ? "90 napos fejlesztési ütemterv" : "Your 90-day roadmap"}</Text>
          <View style={s.row}>
            {ROADMAP_COLUMNS.map(({ key, label }) => (
              <View key={key} style={{ flex: 1 }}>
                <Text style={s.label}>{label}</Text>
                {r.roadmap[key].map(f => (
                  <View key={f.id} style={[s.card, { padding: 9 }]} wrap={false}>
                    <Text style={[s.h3, { fontSize: 9.5 }]}>{f.title}</Text>
                    <Text style={{ fontSize: 8.5 }}>{f.action}</Text>
                    <Text style={[s.muted, { fontSize: 8, marginTop: 3 }]}>{hu ? "Akkor kész, ha: " : "Done when: "}{f.done}</Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        </View>
        {AREAS.map((a, i) => (
          <View key={a} wrap={false} break={i === 0}>
            {i === 0 ? <Text style={s.h2}>{hu ? "Részletes értékelés területenként" : "Area by area"}</Text> : null}
            <View style={{ borderTopWidth: 1, borderColor: C.line, paddingVertical: 8 }}>
              <Text style={s.label}>{AREA_NAMES[a]} · {formatNumber(r.areas[a].score, locale)} · {levelLabel(r.areas[a].level, locale)}</Text>
              <Text style={s.h3}>{r.areas[a].note.title}</Text>
              <Text>{r.areas[a].note.why}</Text>
              <Text style={s.muted}>{r.areas[a].note.observed} {hu ? "Erre figyelj:" : "Focus:"} {r.areas[a].note.action}</Text>
            </View>
          </View>
        ))}
        {r.freeText ? (
          <View style={[s.card, { marginTop: 14 }]} wrap={false}>
            <Text style={s.label}>{freeTextLabel(r)}</Text>
            <Text style={{ fontFamily: "Manrope", fontWeight: 600, fontSize: 11 }}>{hu ? "„" : "“"}{r.freeText}”</Text>
            <Text style={[s.muted, { marginTop: 4 }]}>{hu ? "Ha beszélünk, ezzel kezdjük." : "We'll start our call here."}</Text>
          </View>
        ) : null}
        <View style={[s.card, { backgroundColor: C.ink, borderColor: C.ink, marginTop: 14 }]} wrap={false}>
          <Text style={[s.label, { color: C.lime }]}>{hu ? "Javasolt következő lépés" : "Suggested next step"}</Text>
          <Text style={[s.h3, { color: C.paper }]}>{r.nextStep.text.title}</Text>
          <Text style={{ color: "#CDD2C7" }}>{r.nextStep.text.why}</Text>
          <Text style={{ color: C.paper, marginTop: 4 }}>{r.nextStep.text.action}</Text>
          <Text style={{ color: "#CDD2C7", marginTop: 6 }}>{hu ? "Segítsek az első gyors javításban? Egy ingyenes, 20 perces beszélgetésben átnézzük a pontszámaidat, és megbeszéljük az első lépést." : "Want help with the first quick win? In a free 20-minute call we go through your scores and agree the first step."}</Text>
        </View>
      </Page>
    </Document>
  );
}

export function renderReportPdf(r: ReportModel, reportUrl: string): Promise<Buffer> {
  return renderToBuffer(<ReportDocument r={r} reportUrl={reportUrl} />);
}
