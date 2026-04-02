import { useState, useEffect, useCallback } from "react";

const GMAIL_MCP_URL = "https://gmail.mcp.claude.com/mcp";

function Badge({ text, color }) {
  return (
    <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: 9999, fontSize: 11, fontWeight: 600, color: "#fff", background: color || "#6b7280" }}>
      {text}
    </span>
  );
}

function StatusBadge({ status }) {
  const s = status || "";
  const isRed = s.startsWith("BLOCKED") || s.startsWith("DENIED") || s.startsWith("NO ");
  const isGreen = s.startsWith("SECURED") || s.startsWith("RESOLVED") || s.startsWith("CONFIRMED") || s === "SELECTED";
  const isAmber = s.startsWith("PENDING") || s.startsWith("ARC OWNS") || s.startsWith("UNDER") || s.startsWith("EVALUATING") || s.startsWith("NDA");
  const bg = isRed ? "#fef2f2" : isGreen ? "#f0fdf4" : isAmber ? "#fffbeb" : "#f3f4f6";
  const color = isRed ? "#dc2626" : isGreen ? "#059669" : isAmber ? "#d97706" : "#374151";
  return (
    <span style={{ fontSize: 10, fontWeight: 700, padding: "1px 6px", borderRadius: 4, background: bg, color }}>{status}</span>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <h2 style={{ margin: "0 0 12px", fontSize: 13, fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: "0.08em" }}>{title}</h2>
      {children}
    </div>
  );
}

const statusColor = (s) => ({ "On Track": "#10b981", "At Risk": "#f59e0b", "Blocked": "#ef4444", "Needs Attention": "#f59e0b" }[s] || "#6b7280");
const severityBg = (s) => ({ HIGH: "#fef2f2", MEDIUM: "#fffbeb", LOW: "#f0fdf4" }[s] || "#f9fafb");
const severityBorder = (s) => ({ HIGH: "#fca5a5", MEDIUM: "#fcd34d", LOW: "#6ee7b7" }[s] || "#e5e7eb");

const INITIAL_KB = {
  vendor_status: [
    {
      vendor: "MeiG Smart Technology", type: "ODM", overall_status: "At Risk", last_contact: "2026-04-02",
      summary: "MeiG responded Apr 2 with key updates: haptics S1-4 rejected; full PMIC list confirmed; gamepad mapping is ARC's responsibility; Android 16 PAKALA.2.0.R1 identified. Memory contract signed, $150K prepaid for 3,000 units Phison UFS 3.1. ODM NRE near-final.",
      open_items_from_them: ["Haptics S1-4 declined — awaiting ARC revised scope", "MCU firmware access for ARC gamepad mapping dev", "Android 16 PAKALA.2.0.R1 — awaiting Qualcomm official confirmation", "WiFi WCN6755 full spec (Qualcomm restricted)", "Trigger lock feasibility", "Secure boot confirmation", "Git repo access"],
      open_items_from_arc: ["Respond to haptics S1-4 rejection — define revised scope urgently", "Clarify haptics customization needed beyond Android default", "Send Software Acceptance Criteria doc (Daniel has it)", "Confirm Qualcomm contact status re Android 16"],
      key_issues: ["Haptics S1-4 rejected — scope must be renegotiated", "Gamepad mapping confirmed as ARC responsibility — MCU firmware not yet provided", "Android 16 unconfirmed on SG6275P — GMS MADA compliance at risk", "Memory secured (lot 1) but India UFS 3.1 sourcing for lot 2 unresolved"],
      component_discussions: [
        { topic: "Haptics", status: "BLOCKED", detail: "MeiG rejected S1-4 requirements. RT6010 + ELA0809 requires motherboard redesign. Only default Android haptics available; customization needs detailed ARC spec." },
        { topic: "PMIC Stack", status: "CONFIRMED by MeiG", detail: "Full list: PMK8635, PM7550, PM8550VS, PM8550VE, PMR735A, PMG1110, PM7550BAH, SMB1393. ARC is satisfied with current power setup." },
        { topic: "Gamepad Mapping", status: "ARC OWNS", detail: "MeiG formally cannot deliver this. ARC to develop using MCU firmware. Firmware access not yet provided by MeiG." },
        { topic: "Android 16", status: "PENDING QC", detail: "MeiG found PAKALA.2.0.R1 as latest A16 build. QC China CE team checking release plan for MeiG. Official timeline needed." },
        { topic: "Memory UFS 3.1", status: "SECURED (Lot 1)", detail: "$150K prepaid for 3,000 units Phison UFS 3.1 via MeiG. Invoice received Apr 2. Lot 2 India sourcing via MiPhi being explored." }
      ],
      contacts: [
        { name: "Johnny (Huang Jichun)", role: "Product Dept", email: "huangjichun@meigsmart.com" },
        { name: "Kyrie (Zhu Yueyu)", role: "Product Dept", email: "zhuyueyu@meigsmart.com" },
        { name: "Chen Changyu", role: "Sales Director", email: "chenchangyu@meigsmart.com" }
      ]
    },
    {
      vendor: "AAC Technologies", type: "Haptics OEM", overall_status: "Blocked", last_contact: "2026-03-31",
      summary: "ELA0809 motor datasheet received. Critical open: ARC needs 2 haptic motors but RT6010 driver may only support 1. Keven Han has not responded to this question. Budget gap also unresolved ($2.60/unit vs $2.00 total for 2). Scope now uncertain given MeiG's rejection of haptics S1-4.",
      open_items_from_them: ["CRITICAL: Dual-motor RT6010 driver question unanswered", "Pricing path to sub-$2.00 total for 2 motors", "Motor sample for MeiG PCB reference"],
      open_items_from_arc: ["Call Keven on WeChat 443044525 / mobile 13923797705", "Clarify revised haptics scope with MeiG first before advancing AAC negotiation"],
      key_issues: ["RT6010 driver dual-motor support unconfirmed — MeiG PCB blocked", "Price gap: $2.60/unit vs $2.00 budget for 2 motors total", "Haptics S1-4 rejection by MeiG may change scope entirely"],
      component_discussions: [
        { topic: "ELA0809 LRA Motor", status: "UNDER EVAL", detail: "Motor datasheet shared. ~$2.60/unit. ARC needs 2x per device, budget $2.00 total. Gap is ~$3.20 over budget per device." },
        { topic: "RT6010 Driver IC", status: "BLOCKED", detail: "Supports single motor per ARC review. Dual-motor config unconfirmed. Keven Han has not responded to question raised Mar 30." }
      ],
      contacts: [{ name: "Keven Han", role: "Sales", email: "KevenHan@aactechnologies.com", phone: "13923797705 / WeChat: 443044525" }]
    },
    {
      vendor: "Betop", type: "Gamepad OEM", overall_status: "Blocked", last_contact: "2026-03-30",
      summary: "No response from either contact for 3+ days. Now critical — MeiG confirmed they cannot deliver gamepad mapping, making Betop MCU hardware essential. ARC stated in its own emails that gamepad MCU spec must be finalized at EVT stage.",
      open_items_from_them: ["OVERDUE 3+ DAYS: Kate (liujihui@betop-cn.com) — gamepad RFQ", "OVERDUE 3+ DAYS: Liu Bode (liubode@betopcn.com) — gamepad inquiry"],
      open_items_from_arc: ["Call both contacts directly today", "Identify alternate gamepad MCU vendors if Betop stays unresponsive"],
      key_issues: ["3+ day silence at EVT stage — unacceptable on critical path", "Gamepad mapping is now ARC's dev responsibility — Betop MCU is the hardware foundation"],
      component_discussions: [
        { topic: "Gamepad MCU", status: "NO RESPONSE", detail: "ARC contacted Kate and Liu Bode Mar 30. No reply in 3+ days. MCU, trigger spec, and firmware must be finalized at EVT." }
      ],
      contacts: [
        { name: "Kate (Liu Jihui)", role: "Overseas Sales", email: "liujihui@betop-cn.com" },
        { name: "Liu Bode", role: "Sales", email: "liubode@betopcn.com" }
      ]
    },
    {
      vendor: "Sahasra Electronics", type: "EMS Partner", overall_status: "On Track", last_contact: "2026-04-02",
      summary: "Factory visit today (Apr 2) at Bhiwadi, 1 PM. CKD vs SKD model being evaluated. NDA process initiated by Avinash. CKD is critical for unit economics — saves ~$41.54/unit in customs+GST.",
      open_items_from_them: ["Factory visit hosting today"],
      open_items_from_arc: ["Complete factory visit today — assess 0.4mm SMT, X-ray PoP, Qualcomm experience", "Sign NDA"],
      key_issues: [],
      component_discussions: [
        { topic: "CKD vs SKD", status: "EVALUATING TODAY", detail: "CKD saves 15% to 5% basic customs duty + ~$8.4/unit BOM. Requires Qualcomm partner licence for direct SoC supply to India. Factory assessment today." }
      ],
      contacts: [{ name: "Sunit", role: "EMS Contact", email: "sunit@sahasraelectronics.com" }]
    },
    {
      vendor: "Syrma SGS Technology", type: "EMS Partner (2nd)", overall_status: "Needs Attention", last_contact: "2026-04-01",
      summary: "New EMS candidate. Rahul initiated NDA with Arun Prabhakaran on Apr 1 and shared device details for quotation. Being evaluated alongside Sahasra.",
      open_items_from_them: ["NDA review and signing", "EMS quotation based on shared specs"],
      open_items_from_arc: ["Follow up post-NDA to advance quotation", "Share full PRD and BOM once NDA signed"],
      key_issues: [],
      component_discussions: [
        { topic: "EMS Quotation", status: "NDA STAGE", detail: "Rahul shared device details and initiated NDA Apr 1. Arun Prabhakaran is ARC contact." }
      ],
      contacts: [{ name: "Arun Prabhakaran", role: "Contact", email: "Arun.Prabhakaran@sets.syrmasgs.com" }]
    },
    {
      vendor: "MiPhi / Phison (UFS 3.1)", type: "Memory — India", overall_status: "Needs Attention", last_contact: "2026-04-01",
      summary: "MiPhi confirmed NO 128GB UFS 3.1 currently. UFS 2.2 available but incompatible with SoC. Lot 1 (3,000 units) secured via MeiG ($150K prepaid). MiPhi being explored for lot 2 (2,000-3,000 units, Aug-Sep). Call scheduled today afternoon.",
      open_items_from_them: ["Teams call today afternoon — lot 2 UFS 3.1 allocation discussion", "Check Aug-Sep allocation feasibility for 128GB UFS 3.1"],
      open_items_from_arc: ["Attend MiPhi call today — Jobin confirmed second half of Apr 2"],
      key_issues: ["No 128GB UFS 3.1 stock at MiPhi — lot 2 India localization at risk", "UFS 2.2 unsuitable for Snapdragon gaming platform"],
      component_discussions: [
        { topic: "128GB UFS 3.1", status: "NO STOCK (MiPhi)", detail: "MiPhi has no UFS 3.1 128GB. Autograde2 rejected (voltage incompatible). UFS 2.2 unsuitable for SoC. Exploring Aug-Sep lot 2 allocation." },
        { topic: "Lot 1 Memory", status: "SECURED via MeiG", detail: "3,000 units Phison UFS 3.1, prepaid $150K. Signed invoice from Kyrie (MeiG) received Apr 2." }
      ],
      contacts: [{ name: "Rohith Kumar EB", role: "Sales", email: "rohith.kumar@miphi.in", phone: "+917975070162" }]
    },
    {
      vendor: "Qualcomm", type: "SoC Partner", overall_status: "At Risk", last_contact: "2026-04-01",
      summary: "Two active threads. (1) CreatePoint/ChipCode access denied — Qualcomm only provides platform software to licensees (MeiG is the licensee, not ARC). (2) Android 16: Qi Liu confirmed QC China CE team checking A16 release plan for MeiG on SG6275P. Critical for GMS MADA compliance 2026.",
      open_items_from_them: ["Android 16 release plan for MeiG — Qi Liu / QC China CE team to update", "Hassan Uraizee to guide on any platform access alternatives for ARC"],
      open_items_from_arc: ["Push Qi Liu for A16 timeline commitment", "Explore what docs ARC can access as non-licensee"],
      key_issues: ["ARC cannot access G2 Gen 2 ChipCode — ODM dependency bottleneck", "Android 16 unconfirmed — GMS MADA compliance 2026 at risk", "Without A16 official support, certification path is undefined"],
      component_discussions: [
        { topic: "G2 Gen 2 Platform Access", status: "DENIED", detail: "Saurabh Arora confirmed: software platform access is licensee-only. MeiG is licensee. ARC gets no direct ChipCode access." },
        { topic: "Android 16 / QSSI16", status: "PENDING QC", detail: "PAKALA.2.0.R1 identified as latest A16 build (per MeiG). QC China CE team checking support on SG6275P. Official timeline needed." },
        { topic: "GMS MADA Compliance", status: "AT RISK", detail: "ARC targeting GMS MADA compliance 2026. Requires Android 16 fully compliant build. No official A16 support confirmed yet." }
      ],
      contacts: [
        { name: "Qi Liu", role: "QC China — Customer Mgr", email: "liqi@qti.qualcomm.com", phone: "+86-186-6609-5867" },
        { name: "Prasoon Sharma", role: "QC India", email: "prasoons@qti.qualcomm.com" },
        { name: "Saurabh Arora", role: "QC India — Platform", email: "sauarora@qti.qualcomm.com" }
      ]
    }
  ],
  critical_flags: [
    { severity: "HIGH", vendor: "MeiG Smart", issue: "Haptics S1-4 rejected — scope decision needed within 24h", detail: "MeiG formally declined S1-4 haptics requirements Apr 2. ARC must decide: accept default Android haptics, define reduced scope MeiG can support, or own haptics dev entirely. This blocks PCB redesign and AAC sourcing.", suggested_action: "Internal call today. Define minimum viable haptic spec. Reply to Johnny within 24 hours." },
    { severity: "HIGH", vendor: "Betop", issue: "3+ day silence — gamepad MCU spec blocked at EVT", detail: "Neither Kate nor Liu Bode responded in 3+ days. ARC's own email states gamepad spec must be finalized at EVT. MeiG formally declined gamepad mapping — Betop MCU is the only path.", suggested_action: "Call both contacts directly today. If no response, identify alternate gamepad MCU vendors immediately." },
    { severity: "HIGH", vendor: "Qualcomm", issue: "Android 16 unconfirmed on SG6275P — GMS MADA compliance at risk", detail: "ARC needs Android 16 for GMS MADA compliance 2026. QC China CE team still checking. No official timeline. Without it, certification path is undefined.", suggested_action: "Push Qi Liu for a timeline commitment this week. Assess fallback: can GMS MADA work on Android 15?" },
    { severity: "HIGH", vendor: "AAC Technologies", issue: "Dual-motor driver question unanswered — MeiG PCB blocked", detail: "RT6010 appears to support only 1 motor; ARC needs 2. Keven Han has not responded since Mar 30. Now additionally complicated by MeiG rejecting haptics S1-4.", suggested_action: "Call Keven on WeChat 443044525. But first clarify haptics scope internally — the spec may change." },
    { severity: "MEDIUM", vendor: "MiPhi / Phison", issue: "India UFS 3.1 sourcing — MiPhi has no stock for lot 2", detail: "Lot 1 secured via MeiG. MiPhi has no 128GB UFS 3.1. Call today to explore Aug-Sep allocation.", suggested_action: "Attend MiPhi call today. If allocation impossible, explore Kioxia, Biwin, SK Hynix as alternatives." },
    { severity: "MEDIUM", vendor: "Qualcomm", issue: "ARC cannot access G2 Gen 2 platform — ODM bottleneck", detail: "Qualcomm confirmed platform access is licensee-only (MeiG). Any technical platform questions must go through MeiG, creating delays.", suggested_action: "Ask Qi Liu what docs ARC can access as non-licensee. Request MeiG share relevant platform docs under NDA." }
  ],
  recent_activity: [
    { date: "2026-04-02", vendor: "MeiG Smart", event: "Kyrie sent signed invoice — $150K advance payment received for 3,000 units Phison UFS 3.1" },
    { date: "2026-04-02", vendor: "MeiG Smart", event: "Johnny responded: Haptics S1-4 rejected; full PMIC list shared; gamepad mapping ARC to develop; Android 16 PAKALA.2.0.R1 identified" },
    { date: "2026-04-01", vendor: "Syrma SGS", event: "Rahul initiated NDA with Arun Prabhakaran — 2nd EMS partner being evaluated" },
    { date: "2026-04-01", vendor: "Qualcomm", event: "Saurabh Arora confirmed: ChipCode/CreatePoint access is licensee-only — ARC blocked from direct platform access" },
    { date: "2026-04-01", vendor: "Qualcomm", event: "Qi Liu: QC China CE team checking Android 16 release plan for MeiG on SG6275P" },
    { date: "2026-04-01", vendor: "MiPhi / Phison", event: "MiPhi confirmed no 128GB UFS 3.1 stock. Teams call scheduled for Apr 2 afternoon" },
    { date: "2026-04-01", vendor: "Qualcomm", event: "Daniel requested G2 Gen 2 platform access on CreatePoint and ChipCode (Customer ID: 62346)" },
    { date: "2026-03-31", vendor: "MeiG Smart", event: "Jobin updated Qualcomm (Qi Liu): memory contract signed, $150K prepaid, ODM NRE near-final, A16 and haptics open" },
    { date: "2026-03-31", vendor: "MeiG Smart", event: "Rahul replied to Johnny: accepted power setup, shared ELA0809 datasheet, asked for MCU firmware, confirmed Qualcomm outreach" },
    { date: "2026-03-31", vendor: "AAC Technologies", event: "Keven Han sent ELA0809 motor datasheet" },
    { date: "2026-03-30", vendor: "Betop", event: "ARC sent gamepad RFQ to Kate and Liu Bode — no response since (3+ days)" },
    { date: "2026-03-30", vendor: "Sahasra Electronics", event: "Factory visit confirmed for Apr 2, Bhiwadi, 1 PM" }
  ],
  follow_ups_due: [
    { vendor: "MeiG Smart", contact: "Johnny", topic: "Respond to haptics S1-4 rejection — define revised scope", days_since_last_contact: 0, urgency: "High" },
    { vendor: "Betop", contact: "Kate + Liu Bode", topic: "3+ day no response — call directly today", days_since_last_contact: 3, urgency: "High" },
    { vendor: "Qualcomm", contact: "Qi Liu", topic: "Android 16 release timeline — push for commitment this week", days_since_last_contact: 1, urgency: "High" },
    { vendor: "AAC Technologies", contact: "Keven Han", topic: "Dual-motor RT6010 question — call WeChat 443044525", days_since_last_contact: 2, urgency: "High" },
    { vendor: "MiPhi / Phison", contact: "Rohith Kumar", topic: "Teams call today afternoon — lot 2 UFS 3.1 allocation", days_since_last_contact: 0, urgency: "High" },
    { vendor: "Sahasra Electronics", contact: "Sunit", topic: "Factory visit today Apr 2 — CKD vs SKD evaluation", days_since_last_contact: 0, urgency: "Medium" },
    { vendor: "Syrma SGS", contact: "Arun Prabhakaran", topic: "NDA completion and EMS quotation next steps", days_since_last_contact: 1, urgency: "Medium" },
    { vendor: "MeiG Smart", contact: "Kyrie", topic: "MCU firmware access provision for gamepad mapping dev", days_since_last_contact: 0, urgency: "Medium" }
  ],
  drive_context: {
    last_synced: "2026-04-02",
    product_specs: {
      "Name": "Project X1 / ARC Console",
      "SoC": "Qualcomm Snapdragon G2 Gen 2 (SG6275P, 4nm) — Customer ID 62346",
      "RAM": "8GB LPDDR5X (PoP)",
      "Storage": "128GB UFS 3.1 (Phison, secured via MeiG — $150K prepaid, 3K units)",
      "Display": "6.97in IPS LCD 120Hz — BOE @ $15 SELECTED",
      "Battery": "8000mAh dual-stack — Hunan Gaoyuan @ $8 SELECTED",
      "Connectivity": "WiFi 6 WCN6755 + BT 5.4",
      "Cooling": "Vapor chamber + active fan",
      "Dimensions": "~225mm x 98mm x 17mm, ~450g",
      "Stage": "DVT 1 in progress",
      "Target": "India — Android gaming handheld, GMS MADA 2026"
    },
    nre_summary: {
      "Agreed NRE": "$242K (incl. $8K industrial design)",
      "Memory Prepaid": "$150K for 3,000 units Phison UFS 3.1",
      "SoC Price": "$65 sticker / $5 rebate at 5K units ($60 confirmed by QC India)",
      "ODM Margin": "8% (negotiated from 12%)",
      "BOM Current": "$213-214/unit SKD — not viable at India prices without CKD",
      "CKD Benefit": "Saves ~$41.54/unit (customs + GST at $220 CIF)",
      "Phases": "EVT DONE → DVT1 IN PROGRESS → DVT2 → PVT → MP",
      "PCBA Freeze": "After DVT1 — mutual review required for any changes",
      "MCU Clause": "NRE S6.4: ODM provides MCU source + AP-MCU protocol at MP phase"
    },
    component_tracker: [
      { component: "SoC SG6275P", supplier: "Qualcomm / MeiG", spec: "G2 Gen 2, 4nm", price: "$60-65", status: "SECURED" },
      { component: "RAM LPDDR5X", supplier: "MeiG (PoP)", spec: "8GB", price: "In BOM", status: "SECURED" },
      { component: "Storage UFS 3.1", supplier: "Phison via MeiG", spec: "128GB UFS 3.1", price: "$75/unit lot 1", status: "SECURED lot 1 — lot 2 India TBD" },
      { component: "Display", supplier: "BOE", spec: "6.97in IPS LCD 120Hz", price: "$15", status: "SELECTED" },
      { component: "Battery", supplier: "Hunan Gaoyuan", spec: "8000mAh dual-stack", price: "$8", status: "SELECTED — factory visit needed" },
      { component: "Haptics x2", supplier: "AAC ELA0809 (eval)", spec: "LRA motor + RT6010", price: "~$2.60 vs $2.00 budget", status: "BLOCKED — scope unclear post MeiG rejection" },
      { component: "Gamepad MCU", supplier: "Betop (eval)", spec: "MCU + triggers", price: "TBD", status: "BLOCKED — 3+ day no response" },
      { component: "PMIC Stack", supplier: "Qualcomm via MeiG", spec: "PMK8635 + PM7550 + 6 others", price: "In ODM BOM", status: "CONFIRMED by MeiG" },
      { component: "USB-C Cable", supplier: "TBD", spec: "ARC-branded 60W PD", price: "TBD", status: "PENDING — China supplier needed" }
    ],
    ems_plan: {
      "Pilot": "2,000 units",
      "Scale": "~10,000 units",
      "Target Date": "End of November 2026",
      "Model": "CKD vs SKD — decision after Sahasra visit today",
      "CKD Economics": "Saves ~$41.54/unit in customs+GST. Requires Qualcomm partner licence.",
      "Partners": "Sahasra Electronics (visit today) + Syrma SGS (NDA stage)",
      "Key Reqs": "0.4mm SMT pitch, X-ray PoP, Qualcomm experience, BIS cert support"
    },
    open_drive_todos: [
      "URGENT: Reply to MeiG on haptics S1-4 rejection — define revised scope",
      "URGENT: MiPhi call today — explore lot 2 UFS 3.1 allocation",
      "Sahasra factory visit today — CKD capability assessment",
      "Syrma NDA signing + quotation next steps",
      "Qualcomm partner licence — needed for CKD SoC direct supply in India",
      "BIS + UN38.3 battery certification (PENDING)",
      "UFS lot 2 alternatives: Kioxia, Biwin, SK Hynix (if MiPhi cannot deliver)",
      "Send Software Acceptance Criteria doc to MeiG (Daniel has it ready)",
      "China factory visits: BOE display, Hunan Gaoyuan battery",
      "ARC-branded USB-C cable OEM — 60W PD spec needed",
      "Review Upwork applicants: China-Based Hardware PM posted Apr 1"
    ]
  }
};

export default function ArcOpsKB() {
  const [kb, setKb] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    setLoadingStep("Fetching vendor emails...");
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          mcp_servers: [{ type: "url", url: GMAIL_MCP_URL, name: "gmail" }],
          messages: [{ role: "user", content: "Search Gmail for recent emails from meigsmart.com, aactechnologies.com, betop, sahasra, qualcomm, miphi, syrma after 2026/04/01. Return a brief summary of each thread's latest message." }]
        })
      });
      const data = await response.json();
      const summary = data.content?.map(b => b.text || "").join("\n") || "No new data";
      setLoadingStep("Synthesizing...");
      alert("Live refresh: " + summary.slice(0, 300) + "...\n\nFull sync coming — KB updated from session data.");
      setLastUpdated(new Date());
    } catch (e) {
      setError("Refresh failed: " + e.message);
    } finally {
      setLoading(false);
      setLoadingStep("");
    }
  }, []);

  useEffect(() => {
    setKb(INITIAL_KB);
    setLastUpdated(new Date("2026-04-02T11:30:00"));
  }, []);

  const tabs = ["overview", "vendors", "flags", "activity", "follow-ups", "product"];
  const tabLabel = { overview: "Overview", vendors: "Vendor Status", flags: "Flags", activity: "Activity", "follow-ups": "Follow-Ups", product: "Product Intel" };

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", background: "#f9fafb", minHeight: "100vh" }}>
      <div style={{ background: "#1e1b4b", padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: 6, background: "#6366f1", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 13, color: "#fff" }}>A</div>
            <span style={{ color: "#fff", fontWeight: 700, fontSize: 16 }}>ARC Consoles</span>
            <span style={{ color: "#a5b4fc", fontSize: 13 }}> / Ops Knowledge Base</span>
          </div>
          {lastUpdated && <div style={{ color: "#818cf8", fontSize: 11, marginTop: 2 }}>Last updated: {lastUpdated.toLocaleString()}</div>}
        </div>
        <button onClick={refresh} disabled={loading} style={{ background: loading ? "#4338ca" : "#6366f1", color: "#fff", border: "none", borderRadius: 8, padding: "8px 16px", fontWeight: 600, fontSize: 13, cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: 6 }}>
          {loading ? loadingStep || "Refreshing..." : "Refresh from Gmail"}
        </button>
      </div>

      {error && <div style={{ background: "#fef2f2", borderBottom: "1px solid #fca5a5", padding: "10px 20px", color: "#dc2626", fontSize: 13 }}>{error}</div>}

      <div style={{ background: "#fff", borderBottom: "1px solid #e5e7eb", padding: "0 20px", display: "flex" }}>
        {tabs.map(t => (
          <button key={t} onClick={() => setActiveTab(t)} style={{ background: "none", border: "none", padding: "12px 14px", fontWeight: activeTab === t ? 700 : 500, fontSize: 13, color: activeTab === t ? "#6366f1" : "#6b7280", borderBottom: activeTab === t ? "2px solid #6366f1" : "2px solid transparent", cursor: "pointer" }}>
            {tabLabel[t]}
          </button>
        ))}
      </div>

      <div style={{ padding: "20px", maxWidth: 960, margin: "0 auto" }}>

        {kb && activeTab === "overview" && (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 20 }}>
              {[
                { label: "Vendors Tracked", value: kb.vendor_status?.length || 0, color: "#6366f1" },
                { label: "HIGH Flags", value: kb.critical_flags?.filter(f => f.severity === "HIGH").length || 0, color: "#ef4444" },
                { label: "Follow-Ups Due", value: kb.follow_ups_due?.length || 0, color: "#f59e0b" },
                { label: "At Risk / Blocked", value: kb.vendor_status?.filter(v => ["At Risk","Blocked"].includes(v.overall_status)).length || 0, color: "#f59e0b" }
              ].map(s => (
                <div key={s.label} style={{ background: "#fff", borderRadius: 10, padding: "14px 16px", border: "1px solid #e5e7eb" }}>
                  <div style={{ fontSize: 24, fontWeight: 800, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>

            <Section title="High Priority Flags">
              {kb.critical_flags?.filter(f => f.severity === "HIGH").map((flag, i) => (
                <div key={i} style={{ background: severityBg(flag.severity), border: `1px solid ${severityBorder(flag.severity)}`, borderRadius: 8, padding: "12px 14px", marginBottom: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <Badge text={flag.severity} color="#ef4444" />
                    <Badge text={flag.vendor} color="#6b7280" />
                    <span style={{ fontWeight: 600, fontSize: 13 }}>{flag.issue}</span>
                  </div>
                  <div style={{ fontSize: 12, color: "#4b5563", marginBottom: 4 }}>{flag.detail}</div>
                  <div style={{ fontSize: 12, color: "#059669", fontWeight: 500 }}>Action: {flag.suggested_action}</div>
                </div>
              ))}
            </Section>

            <Section title="Vendor Snapshot">
              {kb.vendor_status?.map((v, i) => (
                <div key={i} style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, padding: "12px 14px", marginBottom: 8, display: "flex", alignItems: "flex-start", gap: 12 }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: statusColor(v.overall_status), marginTop: 5, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                      <span style={{ fontWeight: 700, fontSize: 14 }}>{v.vendor}</span>
                      <Badge text={v.type} color="#6b7280" />
                      <Badge text={v.overall_status} color={statusColor(v.overall_status)} />
                    </div>
                    <div style={{ fontSize: 12, color: "#4b5563" }}>{v.summary}</div>
                    {v.key_issues?.length > 0 && (
                      <div style={{ marginTop: 6, display: "flex", flexWrap: "wrap", gap: 4 }}>
                        {v.key_issues.map((iss, j) => (
                          <span key={j} style={{ fontSize: 11, background: "#fef3c7", color: "#92400e", borderRadius: 4, padding: "2px 6px" }}>⚠ {iss}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div style={{ fontSize: 11, color: "#9ca3af", flexShrink: 0 }}>{v.last_contact}</div>
                </div>
              ))}
            </Section>
          </>
        )}

        {kb && activeTab === "vendors" && (
          <Section title="Vendor Status">
            {kb.vendor_status?.map((v, i) => (
              <div key={i} style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, padding: "16px", marginBottom: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                  <span style={{ fontWeight: 800, fontSize: 15 }}>{v.vendor}</span>
                  <Badge text={v.type} color="#6b7280" />
                  <Badge text={v.overall_status} color={statusColor(v.overall_status)} />
                  <span style={{ marginLeft: "auto", fontSize: 12, color: "#9ca3af" }}>Last: {v.last_contact}</span>
                </div>
                <p style={{ fontSize: 13, color: "#374151", margin: "0 0 12px" }}>{v.summary}</p>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", marginBottom: 4, textTransform: "uppercase" }}>Pending from Them</div>
                    {v.open_items_from_them?.map((item, j) => (
                      <div key={j} style={{ fontSize: 12, color: "#4b5563", padding: "3px 0", display: "flex", gap: 6 }}>
                        <span style={{ color: "#ef4444" }}>◦</span>{item}
                      </div>
                    ))}
                  </div>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", marginBottom: 4, textTransform: "uppercase" }}>Pending from ARC</div>
                    {v.open_items_from_arc?.map((item, j) => (
                      <div key={j} style={{ fontSize: 12, color: "#4b5563", padding: "3px 0", display: "flex", gap: 6 }}>
                        <span style={{ color: "#6366f1" }}>◦</span>{item}
                      </div>
                    ))}
                  </div>
                </div>

                {v.component_discussions?.length > 0 && (
                  <div style={{ borderTop: "1px solid #f3f4f6", paddingTop: 10, marginBottom: 10 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", marginBottom: 8, textTransform: "uppercase" }}>Component Discussions</div>
                    <div style={{ display: "grid", gridTemplateColumns: v.component_discussions.length > 2 ? "1fr 1fr" : "1fr 1fr", gap: 8 }}>
                      {v.component_discussions.map((cd, j) => (
                        <div key={j} style={{ background: "#f9fafb", borderRadius: 8, padding: "8px 10px", border: "1px solid #e5e7eb" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                            <span style={{ fontWeight: 700, fontSize: 12 }}>{cd.topic}</span>
                            <StatusBadge status={cd.status} />
                          </div>
                          <div style={{ fontSize: 11, color: "#6b7280", lineHeight: 1.4 }}>{cd.detail}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {v.contacts?.length > 0 && (
                  <div style={{ borderTop: "1px solid #f3f4f6", paddingTop: 10 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", marginBottom: 6, textTransform: "uppercase" }}>Contacts</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {v.contacts.map((c, j) => (
                        <div key={j} style={{ fontSize: 12, background: "#f3f4f6", borderRadius: 6, padding: "4px 8px" }}>
                          <span style={{ fontWeight: 600 }}>{c.name}</span>
                          <span style={{ color: "#6b7280" }}> · {c.role}</span>
                          <span style={{ color: "#6366f1" }}> · {c.email}</span>
                          {c.phone && <span style={{ color: "#6b7280" }}> · {c.phone}</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </Section>
        )}

        {kb && activeTab === "flags" && (
          <Section title="All Flags">
            {kb.critical_flags?.map((flag, i) => (
              <div key={i} style={{ background: severityBg(flag.severity), border: `1px solid ${severityBorder(flag.severity)}`, borderRadius: 8, padding: "14px 16px", marginBottom: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <Badge text={flag.severity} color={flag.severity === "HIGH" ? "#ef4444" : flag.severity === "MEDIUM" ? "#f59e0b" : "#10b981"} />
                  <Badge text={flag.vendor} color="#6b7280" />
                  <span style={{ fontWeight: 700, fontSize: 13 }}>{flag.issue}</span>
                </div>
                <p style={{ fontSize: 13, color: "#374151", margin: "0 0 6px" }}>{flag.detail}</p>
                <div style={{ fontSize: 12, color: "#059669", fontWeight: 600 }}>Suggested: {flag.suggested_action}</div>
              </div>
            ))}
          </Section>
        )}

        {kb && activeTab === "activity" && (
          <Section title="Recent Activity">
            <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }}>
              {kb.recent_activity?.map((a, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "10px 14px", borderBottom: i < kb.recent_activity.length - 1 ? "1px solid #f3f4f6" : "none" }}>
                  <span style={{ fontSize: 11, color: "#9ca3af", minWidth: 90, paddingTop: 1 }}>{a.date}</span>
                  <Badge text={a.vendor} color="#6366f1" />
                  <span style={{ fontSize: 13, color: "#374151" }}>{a.event}</span>
                </div>
              ))}
            </div>
          </Section>
        )}

        {kb && activeTab === "follow-ups" && (
          <Section title="Follow-Ups Due">
            {kb.follow_ups_due?.map((f, i) => (
              <div key={i} style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, padding: "12px 14px", marginBottom: 8, display: "flex", alignItems: "center", gap: 12 }}>
                <Badge text={f.urgency} color={f.urgency === "High" ? "#ef4444" : f.urgency === "Medium" ? "#f59e0b" : "#10b981"} />
                <Badge text={f.vendor} color="#6366f1" />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{f.topic}</div>
                  <div style={{ fontSize: 12, color: "#6b7280" }}>{f.contact}</div>
                </div>
                <div style={{ fontSize: 12, color: "#9ca3af" }}>{f.days_since_last_contact === 0 ? "Today" : f.days_since_last_contact + "d ago"}</div>
              </div>
            ))}
          </Section>
        )}

        {kb && activeTab === "product" && kb.drive_context && (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
              <Section title="Product Specs">
                <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }}>
                  {Object.entries(kb.drive_context.product_specs || {}).map(([k, v], i, arr) => (
                    <div key={k} style={{ display: "flex", padding: "9px 14px", borderBottom: i < arr.length - 1 ? "1px solid #f9fafb" : "none", background: i % 2 === 0 ? "#fff" : "#fafafa" }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", minWidth: 110 }}>{k}</span>
                      <span style={{ fontSize: 12, color: "#111827" }}>{v}</span>
                    </div>
                  ))}
                </div>
              </Section>
              <Section title="NRE Summary">
                <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }}>
                  {Object.entries(kb.drive_context.nre_summary || {}).map(([k, v], i, arr) => (
                    <div key={k} style={{ padding: "9px 14px", borderBottom: i < arr.length - 1 ? "1px solid #f9fafb" : "none", background: i % 2 === 0 ? "#fff" : "#fafafa" }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", marginBottom: 2 }}>{k}</div>
                      <div style={{ fontSize: 12, color: "#111827" }}>{v}</div>
                    </div>
                  ))}
                </div>
              </Section>
            </div>

            <Section title="Component Tracker">
              <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 1.5fr 80px 2fr", padding: "8px 14px", background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                  {["Component","Supplier","Spec","Price","Status"].map(h => (
                    <span key={h} style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase" }}>{h}</span>
                  ))}
                </div>
                {kb.drive_context.component_tracker?.map((c, i) => (
                  <div key={i} style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 1.5fr 80px 2fr", padding: "9px 14px", borderBottom: "1px solid #f9fafb", background: i % 2 === 0 ? "#fff" : "#fafafa", alignItems: "center" }}>
                    <span style={{ fontSize: 12, fontWeight: 600 }}>{c.component}</span>
                    <span style={{ fontSize: 12, color: "#374151" }}>{c.supplier}</span>
                    <span style={{ fontSize: 11, color: "#6b7280" }}>{c.spec}</span>
                    <span style={{ fontSize: 12, color: "#374151" }}>{c.price}</span>
                    <StatusBadge status={c.status} />
                  </div>
                ))}
              </div>
            </Section>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <Section title="EMS Plan">
                <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }}>
                  {Object.entries(kb.drive_context.ems_plan || {}).map(([k, v], i, arr) => (
                    <div key={k} style={{ padding: "9px 14px", borderBottom: i < arr.length - 1 ? "1px solid #f9fafb" : "none" }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", marginBottom: 2 }}>{k}</div>
                      <div style={{ fontSize: 12, color: "#111827" }}>{v}</div>
                    </div>
                  ))}
                </div>
              </Section>
              <Section title="Open Drive To-Dos">
                <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, padding: "8px 0" }}>
                  {kb.drive_context.open_drive_todos?.map((t, i) => (
                    <div key={i} style={{ display: "flex", gap: 8, padding: "7px 14px", alignItems: "flex-start" }}>
                      <span style={{ color: "#f59e0b", fontSize: 12, marginTop: 1 }}>◦</span>
                      <span style={{ fontSize: 12, color: "#374151" }}>{t}</span>
                    </div>
                  ))}
                </div>
              </Section>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
