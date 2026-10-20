import { AREAS, type AreaId, type Finding, type FindingCtx, type NextStepKind, type TextFields } from "../../../lib/scorecard/types";

/**
 * The findings library. Every report sentence comes from here.
 * Writing rules: no theory, no buzzwords, every action is time-boxed and has a "done" a non-expert can check.
 * Bump CONTENT_VERSION whenever wording or rules change; stored reports keep their snapshot.
 */
export const CONTENT_VERSION = "2026-10-20.1";

type When = (c: FindingCtx) => boolean;
const t = (title: string, observed: string, why: string, action: string, done: string): TextFields => ({ title, observed, why, action, done });
const always: When = () => true;
const LOW = 2.75; // below this an area is "Documented" or weaker

const quickWin = (id: string, area: AreaId, priority: number, when: When, text: TextFields, extra: Partial<Finding> = {}): Finding =>
  ({ kind: "quickWin", id, area, priority, when, text, ...extra }) as Finding;
const risk = (id: string, area: AreaId | "ALL", priority: number, when: When, text: TextFields): Finding =>
  ({ kind: "risk", id, area, priority, when, text });
const roadmap = (id: string, area: AreaId, window: 30 | 60 | 90, priority: number, when: When, title: string, action: string, done: string): Finding =>
  ({ kind: "roadmap", id, area, window, priority, when, text: t(title, "", "", action, done) });
const note = (area: AreaId, tier: "low" | "mid" | "high", title: string, why: string, action: string): Finding => ({
  kind: "areaNote", id: `note-${area}-${tier}`, area, priority: 0,
  when: c => (tier === "low" ? c.s[area] < 1.5 : tier === "mid" ? c.s[area] >= 1.5 && c.s[area] < LOW : c.s[area] >= LOW),
  text: t(title, "Weakest answer here: {weakest}.", why, action, ""),
});
const nextStep = (id: string, step: NextStepKind, when: When, text: TextFields, extra: Partial<Finding> = {}): Finding =>
  ({ kind: "nextStep", id, step, area: "ALL", priority: 0, when, text, ...extra }) as Finding;

export const FINDINGS: Finding[] = [
  // ───────────────────────── Quick wins ─────────────────────────
  // Flow and waste
  quickWin("qw-fw-approval", "FW", 75, c => c.is("FW2", "approval") && c.score("FW1") <= 2, t(
    "Give every approval a threshold and a deadline",
    "A one-hour request takes “{FW1}”, and you said it mostly waits for an approval.",
    "Approvals are the most common reason a one-hour task takes a week, and most of them end up approving everything anyway.",
    "List the approvals this kind of request needs. For each, decide the value below which the requester decides alone, and what happens if the approver hasn't answered within 24 hours (auto-approve or escalate). Put it on one page and announce it.",
    "Every approval on the list has a value threshold and a response time, and the team can say what they are.")),
  quickWin("qw-fw-intake", "FW", 72, c => c.is("FW2", "info") || (c.score("FW3") <= 1 && c.is("FW2", "rework")), t(
    "Stop starting work that is missing information",
    "You said requests mostly wait for “{FW2}”, and work comes back “{FW3}”.",
    "Starting without the inputs guarantees waiting halfway through and rework at the end. Both feel like normal work, so nobody counts them.",
    "Write the minimum information a request needs before anyone starts it (5–8 items). Turn it into a short form or checklist. An incomplete request goes straight back to the sender, not halfway through the work.",
    "New requests come in through the checklist, and you can count how many were sent back at the start rather than the end.")),
  quickWin("qw-fw-rework-log", "FW", 70, c => c.score("FW3") <= 1, t(
    "Log every piece of returned work for two weeks",
    "You said work comes back: “{FW3}”.",
    "Rework feels random until it's counted. Usually two or three causes produce most of it, and they're often at the very start of the process.",
    "For two weeks, each time work comes back, write one line in a shared sheet: what came back, who sent it back, what was missing or wrong. Then sort by cause.",
    "You have the top three causes of rework with a count next to each."),
    { byIndustry: { manufacturing: { action: "For two weeks, log every rework, scrap or correction at the station where it's found: part or order, what was wrong, where it came from. A sheet on a clipboard at each station is enough. Then sort by cause." } } }),
  quickWin("qw-fw-board", "FW", 66, c => c.score("FW4") <= 1, t(
    "Put all open work on one visible list",
    "Handoffs today: “{FW4}”.",
    "When work moves through chat and hallway conversations, nobody can see what is waiting, so the oldest items are the ones that get forgotten.",
    "Create one shared board with four columns: To do, Doing, Waiting on someone, Done. Every request gets a card with an owner and a date. Review it standing up, 10 minutes, twice a week.",
    "Anyone can answer “what's the oldest open item and who has it?” in under a minute."),
    { byIndustry: { manufacturing: { action: "Put a whiteboard where the work happens, with four columns: To do, Doing, Waiting on someone, Done. Every order or job gets a card with an owner and a due date. Review it at the start of the shift, 10 minutes." } } }),
  quickWin("qw-fw-walk", "FW", 20, c => c.s.FW < LOW, t(
    "Follow five requests from start to finish",
    "Your weakest answer here: {weakest}.",
    "Most lead time is waiting, not working. Until you see where the waiting happens, every fix is a guess.",
    "Pick five ordinary requests. For each, note when it arrived, every time it changed hands, and when it was done. One row per handoff in a shared sheet is enough.",
    "You can point to the single step where the five requests waited longest.")),
  quickWin("qw-fw-target", "FW", 20, c => c.s.FW >= LOW, t(
    "Set a lead-time target for {process}",
    "One-hour requests take “{FW1}”.",
    "Once work flows, the next gain comes from a target everyone can see. Without one, lead time drifts back up without anyone noticing.",
    "Take the most common kind of work in {process}, measure its lead time on the last 20 cases, and agree a target (for example: 90% done within two days). Show the weekly result where the team can see it.",
    "The team sees weekly lead time against the target, and misses are discussed at the next team meeting.")),

  // Stability and standards
  quickWin("qw-ss-backup", "SS", 78, c => c.score("SS3") <= 1, t(
    "Name and train a backup for your single point of failure",
    "If the key person were away for two weeks: “{SS3}”.",
    "A process that stops when one person is away is a business risk, not a staffing detail. It also caps how much that process can grow.",
    "Name the backup this week. For the next four weeks, the backup does the task once a week while the expert watches, and writes down everything the expert had to explain.",
    "The backup has run the process alone for a full week without calling the expert."),
    { bySize: { "1-10": { action: "In a small team the key person is often the founder. Name the backup this week, and for four weeks let them do the task once a week while you watch. Write down everything you had to explain." } } }),
  quickWin("qw-ss-standard", "SS", 72, c => c.score("SS1") <= 1 || c.score("SS2") <= 1, t(
    "Write a one-page standard for the three most error-prone steps",
    "New people learn by “{SS1}”, and when two people do the same task: “{SS2}”.",
    "If the method lives in one person's head, quality depends on who did the work today. Automating it would copy that inconsistency at speed.",
    "Pick the three steps where mistakes happen most. With the person who does them best, write one page per step: inputs, steps, a picture or screenshot of “good”, and the two most common mistakes. Then have someone else do the task using only the page.",
    "A colleague who hasn't done the task before completes it correctly using only the page.")),
  quickWin("qw-ss-exceptions", "SS", 64, c => c.score("SS4") <= 1, t(
    "Write down the five most common exceptions and how to handle them",
    "Exceptions today: “{SS4}”.",
    "Exceptions handled case by case are where errors and escalations pile up. They also block automation later, because software needs the rules.",
    "Ask the people who handle escalations for the five exceptions they see most. For each, write how to recognise it, what to do, and who decides when unsure.",
    "The five exceptions are written down, and the senior person receives noticeably fewer escalations a month later.")),
  quickWin("qw-ss-changelog", "SS", 55, c => c.score("SS5") <= 1, t(
    "Keep a one-line change log for how you work",
    "Process changes reach people: “{SS5}”.",
    "When changes travel by word of mouth, half the team works the old way for weeks, and the errors look like individual mistakes.",
    "Create a shared “How we work: changes” page. Every process change gets a dated line: what changed, why, and where the updated instructions are. Link it where the team already looks.",
    "The last three process changes are on the page, and people check it before asking.")),
  quickWin("qw-ss-watch-twice", "SS", 20, c => c.s.SS < LOW, t(
    "Watch the same task done by two different people",
    "Your weakest answer here: {weakest}.",
    "Differences between people are invisible from a desk. Seeing them side by side shows which way works best, and that is your first standard.",
    "Pick the most critical task in {process}. Watch two people do it and note every difference in steps, tools and checks. Agree which way is best and write it on one page.",
    "One page describes the agreed way, and both people have done the task that way once.")),
  quickWin("qw-ss-review-dates", "SS", 20, c => c.s.SS >= LOW, t(
    "Put an owner and a review date on every standard",
    "Your weakest answer here: {weakest}.",
    "Written standards decay quietly. Within a year, many describe a process that no longer exists, and people stop trusting all of them.",
    "Give each standard an owner and a review date six months out. At review, the owner watches the task done once and updates the page.",
    "Every standard shows an owner and a review date that isn't overdue.")),

  // Data and measurement
  quickWin("qw-dm-count", "DM", 76, c => c.score("DM1") <= 1, t(
    "Start counting one number by hand",
    "Asked about your error or rework rate, you said: “{DM1}”.",
    "You can't tell whether a change helped without a before and an after. A tally sheet is enough to start; a system can come later.",
    "Pick one measure for {process}: errors, rework or late deliveries. Write down exactly what counts, so everyone counts the same way. Count it daily for four weeks.",
    "You have four weeks of daily counts with a written definition, so you know your baseline.")),
  quickWin("qw-dm-definitions", "DM", 68, c => c.score("DM3") <= 1, t(
    "Write down the definitions of your five most-argued numbers",
    "When two people pull the same number: “{DM3}”.",
    "When people get different numbers, meetings are spent on whose number is right instead of what to do about it.",
    "List the five figures that cause arguments. For each, write the exact definition, the source system or file, any filters, and who owns it. Put the page next to the report.",
    "The next time a number is questioned, the answer is on the definitions page.")),
  quickWin("qw-dm-report-map", "DM", 62, c => c.score("DM2") <= 1, t(
    "Map where every number in your main report comes from",
    "Your management numbers come from: “{DM2}”.",
    "Hand-built reports cost hours every period and hide errors. Mapping them is the first step to automating them, and usually turns up numbers nobody uses.",
    "Take your main report. For each number, note the source, who touches it and how long it takes. Mark every number nobody has acted on in the last three months, and stop producing it.",
    "You have a one-page map of the report, and at least one number has been dropped or automated.")),
  quickWin("qw-dm-baseline", "DM", 58, c => c.score("DM4") <= 1, t(
    "Write a before-number for the next fix",
    "Decisions about process problems are based on: “{DM4}”.",
    "Without a before-number, every fix “worked”. That's how organisations keep solving the same problem every year.",
    "Before your next process change, write one line: the problem, today's number, and the number you expect after. Check it again four weeks later.",
    "The next change has a written before and after, checked at four weeks.")),
  quickWin("qw-dm-fallback-low", "DM", 20, c => c.s.DM < LOW, t(
    "Pick one number and make it trustworthy",
    "Your weakest answer here: {weakest}.",
    "Most companies have too many numbers and trust none of them. One trusted number beats a dashboard nobody believes.",
    "Choose the one figure that best shows how {process} is doing. Write its definition and source, and have one person produce it the same way every week for four weeks.",
    "The same person has produced the number four weeks in a row, the same way, and nobody has disputed it.")),
  quickWin("qw-dm-trend", "DM", 20, c => c.s.DM >= LOW, t(
    "Review trends, not single numbers",
    "Your weakest answer here: {weakest}.",
    "Single numbers trigger overreaction to normal variation. Trends show whether something really changed.",
    "Plot your key process measure weekly for the last 12 weeks on a simple line chart. Agree a rule: act on a run of six points in one direction, not on one bad week.",
    "The weekly review uses the chart, and the last decision you made refers to the trend.")),

  // Automation potential
  quickWin("qw-ap-postmortem", "AP", 66, c => c.score("AP5") === 0, t(
    "Find out why the last tool was abandoned, before buying the next",
    "The last automation or tool you introduced: “{AP5}”.",
    "Tools are usually abandoned for process reasons (no owner, didn't fit how the work really happens) rather than technical ones. The next tool will fail the same way unless you know why.",
    "Ask three people who were supposed to use it: what did it make harder? Write down the top reasons before choosing any new tool.",
    "The reasons are written down, and each one has an answer in your next tool decision.")),
  quickWin("qw-ap-rules", "AP", 64, c => c.score("AP3") <= 1 && c.s.opportunity >= 2, t(
    "Write the most repetitive task in {process} as if/then rules",
    "Could you write the steps as rules today? “{AP3}”.",
    "If you can't write the rules, software can't follow them. Writing them also shows where people make judgement calls that need a standard first.",
    "Take the most repetitive task in {process}. Write it as numbered steps with an if/then for each decision, using real recent cases. Mark every step where the answer is “it depends”.",
    "The rules handle ten recent cases correctly on paper, and every “it depends” has someone who decides it.")),
  quickWin("qw-ap-handover", "AP", 60, c => c.score("AP5") === 2, t(
    "Document and hand over the automation you already have",
    "Your last automation: “{AP5}”.",
    "An automation only one person can fix is a single point of failure, and it usually fails silently.",
    "Have the person who built it write one page: what it does, where it runs, what breaks it, how to restart it. A second person then restarts it once using only the page.",
    "Someone other than the builder has restarted or fixed it using the page.")),
  quickWin("qw-ap-exports", "AP", 52, c => c.score("AP4") <= 1 && c.s.opportunity >= 2, t(
    "Check which of your systems let data out",
    "Do your systems let data out? “{AP4}”.",
    "Automation depends on getting data in and out of systems. Checking this first avoids buying tools that can't connect to what you use.",
    "List the systems involved in your biggest manual tasks. For each, check the vendor's documentation or ask support: export formats, API access, and whether your plan includes it.",
    "Every system on the list has a yes or no for export and API, with the source.")),
  quickWin("qw-ap-inventory", "AP", 30, c => c.s.opportunity >= 2, t(
    "List your copy-and-paste tasks with their weekly hours",
    "You estimated “{AP1}” hours a week re-typing data, and that “{AP2}” recurring tasks follow fixed rules.",
    "Not all manual work is worth automating. A list with hours and mistake rates shows the two or three tasks that actually pay back.",
    "Ask each team member to list recurring tasks where they move data between systems, with hours per week and how often mistakes happen. Merge into one list and rank by hours, then by mistakes.",
    "You have a ranked list, and the top task has a named owner.")),
  quickWin("qw-ap-not-bottleneck", "AP", 15, c => c.s.opportunity < 2, t(
    "Don't buy automation yet: it isn't your bottleneck",
    "You estimated “{AP1}” hours a week re-typing data, and that “{AP2}” recurring tasks follow fixed rules.",
    "With little rule-based manual work, automation would take a long time to pay back. Flow, quality or ownership probably matter more for you right now.",
    "Agree a simple rule: any automation proposal must state the hours saved per week. Anything under five hours a week is parked, and the budget goes to the weakest area in this report.",
    "The rule is written down, and the next automation proposal you receive states its weekly hours saved.")),

  // AI readiness
  quickWin("qw-ai-rule", "AI", 82, c => c.score("AI1") <= 1, t(
    "Write a one-page AI data rule this month",
    "On rules for data in AI tools: “{AI1}”. AI use today: “{AI2}”.",
    "People are already using AI, rule or not. Without a rule, customer and company data ends up in personal free accounts. With one, the same use becomes safe and visible.",
    "Write one page: which tools are approved, which data must never go in (customer personal data, contracts, financials, passwords), what is fine (public information, your own drafts), and who to ask. Present it to everyone in one meeting.",
    "The page is published, everyone has heard it, and people know which tool to use.")),
  quickWin("qw-ai-inventory", "AI", 70, c => c.score("AI2") === 0, t(
    "Ask people what they already use AI for",
    "AI use today: “{AI2}”.",
    "Hidden use is both your best list of real use cases and your biggest data risk. You need both to be visible.",
    "Run an anonymous five-minute survey: which AI tools do you use for work, for which tasks, and what data goes in? Make it clear there is no blame.",
    "You have a list of actual uses, sorted into “fine”, “fine with a company account” and “stop”.")),
  quickWin("qw-ai-problem", "AI", 62, c => c.score("AI5") <= 1 && c.s.foundation >= 1.5, t(
    "Pick one AI use case and put a number on it",
    "On a specific problem for AI: “{AI5}”.",
    "“We should use AI” leads to tool purchases with nothing to show for them. One specific task with a number lets you decide whether it's worth it.",
    "Choose one task that is frequent, text-heavy and low-risk (for example, drafting replies to common questions or summarising documents). Time it on ten real cases today.",
    "You have one named task, its current time per case, and a target.")),
  quickWin("qw-ai-test-set", "AI", 60, c => c.score("AI4") <= 1 && c.score("AI5") >= 2, t(
    "Collect 20 past cases with the right answer",
    "If AI drafted an answer, how would you check it? “{AI4}”.",
    "Without a way to check AI output, you'll either trust it blindly or check everything by hand, which cancels out the time saved.",
    "For your AI use case, gather 20 real past examples together with the answer you'd accept as correct. Write down what makes an answer wrong.",
    "You have 20 cases and a written definition of “correct” to test any AI tool against.")),
  quickWin("qw-ai-knowledge", "AI", 56, c => c.score("AI3") <= 1, t(
    "Write down the answers to your 20 most common questions",
    "The know-how to answer typical questions lives: “{AI3}”.",
    "AI can only answer from knowledge that is written down. The same page makes new people faster today, with or without AI.",
    "Collect the 20 questions customers or colleagues ask most. Write the current correct answer to each in one shared document with an owner.",
    "The 20 answers are in one place, and new people use it instead of asking around.")),
  quickWin("qw-ai-trial", "AI", 20, c => c.s.AI < LOW && c.s.foundation >= 2, t(
    "Run a four-week AI trial on one low-risk task",
    "Your weakest answer here: {weakest}.",
    "Your process basics are solid enough to try AI properly. A short, measured trial tells you more than any vendor demo.",
    "Pick one frequent, low-risk, text-heavy task. Use an approved tool on a company account for four weeks. Measure time per case and errors found, before and after.",
    "You have before and after numbers for time per case and errors, and a keep-or-stop decision.")),
  quickWin("qw-ai-measure", "AI", 20, c => c.s.AI >= LOW, t(
    "Measure your AI use against its baseline",
    "Your weakest answer here: {weakest}.",
    "AI use that isn't measured either gets cut at the first budget review, or keeps running long after it stopped paying.",
    "For each AI use case in place, compare time per case and error rate with the pre-AI baseline over four weeks.",
    "Each use case has a before/after number and a keep, change or stop decision.")),

  // People and ownership
  quickWin("qw-po-owner", "PO", 74, c => c.score("PO2") <= 1, t(
    "Name one owner for {process}",
    "Who owns {process} end to end: “{PO2}”.",
    "When everyone owns a piece, the handoffs belong to nobody, and that is where most delays and errors happen.",
    "Name one person who owns the process end to end, from request to delivery. Give them one measure (for example, lead time) and the right to call the other teams to a 30-minute monthly review.",
    "The owner's name and measure are written down, and the first monthly review has taken place."),
    { bySize: { "1-10": { action: "In a team this size the owner is usually you. Write down the one measure you'll check monthly for this process, and who covers it when you're away." } } }),
  quickWin("qw-po-problems", "PO", 66, c => c.score("PO3") <= 1, t(
    "Give problems a place to go, and close the loop",
    "When someone spots a problem: “{PO3}”.",
    "If raising a problem changes nothing, people stop raising problems and work around them, so the cost stays hidden.",
    "Put up a simple problem board (on a wall or shared online). Anyone can add to it. Review it for 15 minutes weekly: pick one problem, give it an owner, and tell the person who raised it what happened.",
    "Every problem raised in the last month has a status, and the people who raised them have heard back.")),
  quickWin("qw-po-stick", "PO", 60, c => c.score("PO1") <= 1, t(
    "Check whether last year's improvements are still alive",
    "The last improvement, three months on: “{PO1}”.",
    "Improvements fade when nobody checks. Fixing the same problem twice costs more than checking once.",
    "List three improvements from the past year. Go and see whether each is still done that way. For each one that faded, write down why.",
    "You know which improvements stuck, and why the others didn't.")),
  quickWin("qw-po-time", "PO", 56, c => c.score("PO4") <= 1, t(
    "Protect two hours a week for one improvement",
    "Time for improvement work: “{PO4}”.",
    "With no time set aside, improvement only happens in a crisis, which means only the loudest problems ever get fixed.",
    "Pick two people. Block two hours a week for six weeks to work on one problem from this report. Review the result in week six.",
    "Six weeks of blocked time used, and the result reviewed with a number.")),
  quickWin("qw-po-review", "PO", 20, c => c.s.PO < LOW, t(
    "Start a 20-minute monthly process review",
    "Your weakest answer here: {weakest}.",
    "Improvement sticks when someone looks at it regularly. A short fixed review does more than an occasional big push.",
    "Once a month, the owner of {process} shows its one measure, the biggest problem this month, and what was done about it. Same day, same time, 20 minutes.",
    "Three reviews have happened in a row without being cancelled.")),
  quickWin("qw-po-teach", "PO", 20, c => c.s.PO >= LOW, t(
    "Have your best improvers coach one other team",
    "Your weakest answer here: {weakest}.",
    "Your improvement habits work where they exist. Spreading them is cheaper than building them again elsewhere.",
    "Pair one person who leads improvements well with a team that doesn't yet. They run one small improvement together over six weeks.",
    "The second team has finished one improvement with a measured result.")),

  // ───────────────────────── Risks ─────────────────────────
  risk("risk-shadow-ai", "AI", 95, c => c.score("AI1") <= 1 && (c.score("AI2") === 0 || c.score("AI2") >= 2), t(
    "Company data in personal AI accounts",
    "On rules for data in AI tools: “{AI1}”. AI use today: “{AI2}”.",
    "Free consumer AI tools can keep and reuse what's pasted into them, and you have no record of it. One pasted customer list can become a data protection incident.",
    "This week, tell people which tool to use and what must never go in. This month, provide an approved tool on company accounts.",
    "An approved tool is in place, the rule is announced, and work no longer goes through personal accounts.")),
  risk("risk-automate-chaos", "ALL", 90, c => c.s.opportunity >= 2.5 && c.s.foundation < 2, t(
    "Automating a process that isn't stable yet",
    "You have plenty of manual, rule-based work (opportunity {score.opportunity} of 4), but the process underneath isn't stable yet (stability {score.SS}, data {score.DM}).",
    "Automation copies a process exactly, including its errors and workarounds. The usual result is errors at machine speed and a tool nobody trusts after three months.",
    "Before spending on automation, stabilise the process you want to automate: one written standard and a measured error rate for four weeks. Automate only once the error rate holds steady.",
    "The target process has a standard and four weeks of steady error data before any automation money is spent.")),
  risk("risk-key-person", "SS", 85, c => c.score("SS3") <= 1, t(
    "One person away, and the process stops",
    "If the key person were away for two weeks: “{SS3}”.",
    "Illness, resignation or a holiday becomes an operational outage. It also caps growth: the process can't handle more than that person's hours.",
    "Name a backup now and have them run the process weekly under supervision for a month. Write down everything the expert had to explain.",
    "The backup has run the process alone for a full week.")),
  risk("risk-messenger", "PO", 84, c => c.score("PO5") <= 1, t(
    "Bad news arrives late",
    "When someone shows a process is worse than thought: “{PO5}”.",
    "When raising problems is risky, they only surface once they're expensive. Any improvement or AI programme will be told what leadership wants to hear.",
    "Leadership publicly thanks the next person who raises a process problem, and acts on it visibly within two weeks.",
    "The next problem raised got a thank-you and a visible action within two weeks.")),
  risk("risk-ai-unchecked", "AI", 82, c => c.score("AI2") >= 3 && c.score("AI4") <= 1, t(
    "AI outputs that nobody checks",
    "AI use today: “{AI2}”. How you'd check an AI output: “{AI4}”.",
    "AI tools are confidently wrong some of the time. Without criteria for a correct output, errors reach customers before anyone notices.",
    "Write what a correct output looks like for each use case, review a sample of 10 outputs a week, and log the errors you find.",
    "Every AI use case has written criteria and a weekly error count.")),
  risk("risk-blind", "DM", 80, c => c.score("DM1") <= 1 && c.score("DM4") <= 1, t(
    "Decisions without a baseline",
    "Your error rate: “{DM1}”. Decisions are based on: “{DM4}”.",
    "Without a baseline you can't tell a fix that worked from one that didn't, so money goes to the loudest problem, not the biggest.",
    "Start counting one number now, and require a before and after number for every change you fund.",
    "The next funded change has a written before-number.")),
  risk("risk-repeat-failure", "AP", 78, c => c.score("AP5") === 0 && c.s.opportunity >= 2, t(
    "The next tool fails like the last one",
    "Your last tool: “{AP5}”, while manual work remains high (“{AP1}” hours a week).",
    "The pressure to automate is real, and the last attempt failed. Without knowing why, the next purchase will likely follow the same path.",
    "Before selecting a tool, write down why the last one was abandoned and make an owner and a process standard preconditions for the next.",
    "The next tool decision names an owner and references the written reasons.")),
  risk("risk-rework", "FW", 74, c => c.score("FW3") <= 1, t(
    "Rework is quietly eating your capacity",
    "Work comes back: “{FW3}”.",
    "Constant rework means you pay for much of your work twice. It stays invisible because it looks like normal work, so it's often the first thing people try to automate.",
    "Count returned work for two weeks and fix the top cause at the start of the process.",
    "Rework count is down on the top cause, measured over the following four weeks.")),
  // Fallback: the lowest area, whatever its level.
  ...AREAS.map(area => risk(`risk-lowest-${area}`, area, 10, c => c.lowestArea === area, {
    FW: t("Work that waits more than it moves", "Your weakest answer in your lowest area: {weakest}.", "Waiting time grows quietly with volume. When demand rises, lead times jump and customers notice before you do.", "Follow five requests end to end, find where they wait longest, and remove that wait first.", "The longest wait you found is shorter, measured on the next five requests."),
    SS: t("Results depend on who did the work", "Your weakest answer in your lowest area: {weakest}.", "When the method varies by person, quality varies too, and any automation will copy the variation.", "Write a one-page standard for the most error-prone step and test it with someone new.", "Someone new does the step correctly from the page alone."),
    DM: t("Numbers nobody fully trusts", "Your weakest answer in your lowest area: {weakest}.", "Untrusted numbers mean decisions fall back to opinion, and every improvement or AI project lacks a baseline.", "Pick one figure, define it in writing, and produce it the same way for four weeks.", "Four weeks of the same number, produced the same way, without dispute."),
    AP: t("Automation that won't hold", "Your weakest answer in your lowest area: {weakest}.", "Low readiness means automations break on exceptions, depend on one person, or can't reach the data they need.", "Fix readiness before buying: written rules for the target task, a named owner, and confirmed data access.", "The target task has rules, an owner and confirmed data access."),
    AI: t("AI adopted before the basics", "Your weakest answer in your lowest area: {weakest}.", "AI without rules, written knowledge or a way to check outputs either leaks data or produces work that has to be redone.", "Publish an AI data rule and write down the knowledge your first use case would need.", "The rule is published, and the knowledge for one use case is written down."),
    PO: t("Improvements that don't last", "Your weakest answer in your lowest area: {weakest}.", "Without owners and time, every improvement fades within months, and the next project starts from the same place.", "Name one owner for your key process and hold a short monthly review of its one measure.", "Three monthly reviews held in a row."),
  }[area])),

  // ───────────────────────── Roadmap ─────────────────────────
  // Days 1–30: see the work, make it safe.
  roadmap("rm30-walk", "FW", 30, 40, always, "Walk the process", "Map one request from start to finish with the people who do it, marking every wait and every rework loop.", "A one-page map with the three longest waits circled."),
  roadmap("rm30-baseline", "DM", 30, 70, c => c.s.DM < LOW, "Start a baseline", "Count lead time and errors for {process} by hand, daily, with a written definition.", "Four weeks of counts by day 30."),
  roadmap("rm30-owner", "PO", 30, 65, c => c.score("PO2") <= 2, "Name the process owner", "One person owns the key process end to end, with one measure.", "Name and measure written down and shared."),
  roadmap("rm30-ai-rule", "AI", 30, 75, c => c.score("AI1") <= 2, "Publish the AI data rule", "One page on approved tools and data that must never go in, presented to everyone.", "Rule published; approved tool chosen."),
  roadmap("rm30-board", "FW", 30, 55, c => c.score("FW4") <= 2, "Make open work visible", "One board for all open work, reviewed for 10 minutes twice a week.", "The board is current and the oldest item is known."),
  roadmap("rm30-backup", "SS", 30, 72, c => c.score("SS3") <= 1, "Train a backup", "The backup runs {process} weekly under supervision.", "First supervised run done; notes written."),
  roadmap("rm30-intake", "FW", 30, 50, c => c.score("FW3") <= 2, "Set the minimum inputs", "Define what a request must contain before work starts, and send incomplete ones back.", "Checklist in use for all new requests."),
  roadmap("rm30-rhythm", "PO", 30, 25, always, "Set the review rhythm", "Book a 20-minute monthly review of the key measure with the process owner for the next three months.", "Three dates in the calendar, first one held."),
  // Days 31–60: standardise, remove waste.
  roadmap("rm60-waste", "FW", 60, 40, always, "Remove the biggest wait", "Take the longest wait from the walk and remove it: an approval threshold, a queue limit or a dropped handoff.", "Lead time on the next ten requests is shorter than the baseline."),
  roadmap("rm60-standards", "SS", 60, 65, c => c.s.SS < 3.5, "Write the standards", "One-page standards for the three most error-prone steps, each tested by someone new.", "Three tested standards in a shared place."),
  roadmap("rm60-exceptions", "SS", 60, 55, c => c.score("SS4") <= 2, "Write the exception rules", "Rules for the five most common exceptions, with who decides when unsure.", "Escalations to the senior person are down."),
  roadmap("rm60-definitions", "DM", 60, 60, c => c.score("DM3") <= 2, "Agree the numbers", "Written definitions and sources for the five most-argued figures.", "One definitions page that everyone uses."),
  roadmap("rm60-report", "DM", 60, 50, c => c.score("DM2") <= 2, "Slim the management report", "Map each number's source and effort, drop unused numbers, and automate the costliest one.", "Report time per period is measurably lower."),
  roadmap("rm60-problems", "PO", 60, 52, c => c.score("PO3") <= 2, "Open the problem board", "A place to raise problems, reviewed weekly, with feedback to whoever raised each one.", "Every problem raised has a status."),
  roadmap("rm60-rules", "AP", 60, 58, c => c.s.opportunity >= 2, "Write the automation rules", "Write the top automation candidate as if/then rules and test them against ten recent cases.", "Rules handle ten real cases correctly on paper."),
  roadmap("rm60-review-dates", "SS", 60, 20, always, "Keep standards alive", "Give every standard an owner and a six-month review date.", "No standard without an owner or a review date."),
  // Days 61–90: automate, add AI where it pays, make it stick.
  roadmap("rm90-automate", "AP", 90, 70, c => c.s.opportunity >= 2 && c.s.automationReady >= 2, "Automate the top candidate", "Automate one task with one owner and a one-page runbook. Measure the hours saved against the baseline.", "Automation live, owner named, hours saved measured."),
  roadmap("rm90-automate-gate", "AP", 90, 70, c => c.s.opportunity >= 2 && c.s.automationReady < 2, "Decide on automation, with a gate", "Automate only once the target process has held its standard and error rate for four weeks, and its rules, data access and owner are in place. Otherwise, keep preparing.", "A go/no-go decision based on four weeks of data and a readiness check."),
  roadmap("rm90-ai-pilot", "AI", 90, 60, c => c.s.foundation >= 2, "Run a measured AI pilot", "Four weeks on one use case with an approved tool, tested against 20 past cases with known correct answers.", "Before/after time and error numbers, and a keep-or-stop decision."),
  roadmap("rm90-ai-prepare", "AI", 90, 60, c => c.s.foundation < 2, "Prepare for AI, without buying anything", "Write the answers to your 20 most common questions and collect 20 past cases with correct outputs. No tool purchase yet.", "Both sets exist and have an owner."),
  roadmap("rm90-sustain", "PO", 90, 50, always, "Check what stuck", "Go and see whether the 30- and 60-day changes are still done that way. Re-measure the baseline and compare.", "Before/after comparison written up; faded changes have a reason."),
  roadmap("rm90-train", "PO", 90, 45, c => c.s.PO < LOW, "Build the skill in-house", "Train the process owner and two team members in basic problem solving (5 Whys, simple run charts), so the next improvement doesn't need outside help.", "The trained team runs the next improvement on its own."),

  // ───────────────────────── Area notes ─────────────────────────
  note("FW", "low", "Work waits far more than it moves", "Most of your lead time is probably waiting: in inboxes, for approvals, for missing information. That's good news: waiting is cheaper to remove than work.", "Find the biggest wait before changing anything else."),
  note("FW", "mid", "Flow works, with friction at the handoffs", "Work gets done, but it slows down where it changes hands. These waits are rarely visible from inside a single team.", "Make the handoffs visible and remove the longest wait."),
  note("FW", "high", "Work flows", "Requests move quickly and rework is under control. The risk now is drift: lead times creep back without a visible target.", "Set and display a lead-time target."),
  note("SS", "low", "The method lives in people's heads", "Quality depends on who does the work today. That also makes this area the main thing blocking automation and AI: software needs a stable process to copy.", "Write down the critical steps and test them with someone new."),
  note("SS", "mid", "Partly standardised", "Some work follows a written way, some depends on the person. Exceptions and changes are where it breaks down.", "Cover exceptions and keep standards current when the process changes."),
  note("SS", "high", "Stable and standardised", "The same work gets done the same way. That's the base automation and AI need.", "Keep standards owned and reviewed so they don't go stale."),
  note("DM", "low", "Decisions run on opinion", "Without trusted numbers you can't see whether a change helped, and every AI or automation business case is a guess.", "Count one number by hand before investing in reporting tools."),
  note("DM", "mid", "Numbers exist, trust is partial", "Data is there, but definitions vary and reports take manual work. People argue about numbers instead of acting on them.", "Agree definitions and sources for the numbers that matter."),
  note("DM", "high", "Data you can act on", "Numbers are trusted and used. The next step is reading trends instead of reacting to single values.", "Review run charts, not snapshots."),
  note("AP", "low", "Not ready to automate", "The rules aren't written, systems don't easily share data, or past tools didn't stick. Automating now would be expensive and fragile.", "Write the rules and confirm data access before choosing any tool."),
  note("AP", "mid", "Partly ready", "Some of the groundwork is in place. Gaps in rules, data access or ownership will decide whether automation lasts.", "Close the readiness gaps for one task before automating it."),
  note("AP", "high", "Ready to automate", "Rules, system access and ownership are mostly in place. Choose targets by hours saved, not by what a tool can do.", "Automate the top candidate and measure the hours saved."),
  note("AI", "low", "AI basics are missing", "No clear data rule, knowledge that isn't written down, or no way to check outputs. AI here mainly adds risk.", "Publish a data rule and write down the knowledge first."),
  note("AI", "mid", "Groundwork partly there", "Some rules and knowledge exist, but use cases aren't specific or measured yet.", "Pick one use case with a number and a way to check its output."),
  note("AI", "high", "Ready for measured AI use", "Rules, knowledge and checks are in place. The risk now is running AI that nobody measures.", "Measure each use case against its baseline."),
  note("PO", "low", "Improvements belong to nobody", "Without owners, time or safety to raise problems, any improvement will fade within months.", "Name an owner and give problems a place to go."),
  note("PO", "mid", "Ownership exists, but it's thin", "Some improvements stick and some fade. It depends on individuals rather than a habit.", "Make a short monthly review the habit."),
  note("PO", "high", "An improvement culture", "People raise problems, own processes and keep improvements alive. That's the hardest part, and you have it.", "Spread the habit to the teams that don't have it yet."),

  // ───────────────────────── Next step ─────────────────────────
  nextStep("ns-fix-first", "fix-first", c => c.s.foundation < 1.5, t(
    "Fix these three things first",
    "Your process stability ({score.SS}) and data ({score.DM}) are the weakest foundations in this report.",
    "Training, workshops or automation would all build on ground that moves. The first 30 days of your roadmap are the most valuable thing you can do right now.",
    "Work through the Days 1–30 items. In our call we'll go through them and decide what you can do alone and where help is worth paying for.",
    "")),
  nextStep("ns-training", "training", c => c.s.PO < 2, t(
    "Training, so improvements stick",
    "People and ownership ({score.PO}) is holding everything else back.",
    "Without people who own the method, any improvement fades once the project ends. Training the process owner and a few team members makes the next improvements yours.",
    "A practical Lean Six Sigma training for the process owner and two or three team members, using your own processes as the case studies.",
    ""),
    { bySize: { "1-10": { action: "Skip formal certificates. A one-day hands-on session for the whole team, using one of your own processes, is enough to build the habit." } } }),
  nextStep("ns-project", "project", c => c.s.opportunity >= 3 && c.s.automationReady >= 2, t(
    "An automation project with a measured result",
    "You have plenty of rule-based manual work (opportunity {score.opportunity}) and solid enough foundations (stability {score.SS}, data {score.DM}).",
    "This is where automation pays back fastest. The risk is choosing the target by tool features rather than hours saved.",
    "A delivery project: baseline the top candidate, write its rules, automate it with an owner and a runbook, and measure the hours saved.",
    "")),
  nextStep("ns-workshop-ai", "workshop", c => c.score("AI5") >= 2, t(
    "An AI use-case workshop",
    "You already have a specific use case in mind: “{AI5}”.",
    "The step from idea to a pilot that's worth running is the one most companies skip. A focused session turns the use case into a test plan with a number.",
    "A half-day AI use-case workshop: sharpen the use case, define what a correct output is, collect test cases, and set the pilot measure.",
    "")),
  nextStep("ns-workshop-vsm", "workshop", always, t(
    "A process mapping workshop",
    "Your weakest area is {lowest}.",
    "You have the basics in place; the next gain is in the flow across teams, which nobody sees from inside one team.",
    "A one-day value stream mapping workshop with the people who do the work: map one key process, find the biggest waits, and leave with three decided actions.",
    "")),
];
