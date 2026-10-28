const fs = require("fs");
const ts = require("typescript");
const esbuild = require("esbuild");

let code = fs.readFileSync("assets/client.js", "utf8");

// 1. In vy(), change 3-day generator to today only:
const targetVyDays = "p=t?[t]:[i,x,A]";
const repVyDays = "p=t?[t]:[i]";
if (code.includes(targetVyDays)) {
  code = code.replace(targetVyDays, repVyDays);
  console.log("✓ Updated vy() 3-day generator to today only!");
}

// 2. In vy(), deduplicate deliveries before saving:
const targetVySave = "Oe(z.DELIVERIES,g)";
const repVySave = "(()=>{const dMap=new Map();for(const d of g){if(!d||!d.id)continue;const k=(d.subscriptionId||d.customerId||d.id)+'_'+(d.deliveryDate||d.date||i)+'_'+(d.mealSlot||d.mealType||'lunch').toLowerCase();if(!dMap.has(k))dMap.set(k,d);}g=Array.from(dMap.values());Oe(z.DELIVERIES,g);})()";
if (code.includes(targetVySave)) {
  code = code.replace(targetVySave, repVySave);
  console.log("✓ Updated vy() save with deduplication!");
}

// 3. Replace KitchenTerminalOrdersQueue header
const start = code.indexOf("KitchenTerminalOrdersQueue({ deliveries = [], subscriptions = [], activeStaff, onRefresh }) {");
if (start === -1) {
  console.error("KitchenTerminalOrdersQueue not found!");
  process.exit(1);
}
const end = code.indexOf("const updateOrderStatus", start);
if (end === -1) {
  console.error("const updateOrderStatus not found!");
  process.exit(1);
}

const repQueueHeader = `KitchenTerminalOrdersQueue({ deliveries = [], subscriptions = [], activeStaff, onRefresh }) {
  const [filterDate, setFilterDate] = w.useState("today");
  const [filterShift, setFilterShift] = w.useState("all");
  const [filterStatus, setFilterStatus] = w.useState("all");
  const [processingId, setProcessingId] = w.useState(null);

  const todayStr = new Date().toISOString().split("T")[0];
  const tmrw = new Date(); tmrw.setDate(tmrw.getDate() + 1);
  const tomorrowStr = tmrw.toISOString().split("T")[0];

  const cleanDuplicateDeliveries = () => {
    try {
      const list = je(z.DELIVERIES, []);
      const m = new Map();
      for (const d of list) {
        if (!d || !d.id) continue;
        const k = (d.subscriptionId || d.customerId || d.id) + "_" + (d.deliveryDate || d.date || todayStr) + "_" + (d.mealSlot || d.mealType || "lunch").toLowerCase();
        if (!m.has(k)) m.set(k, d);
      }
      const cleaned = Array.from(m.values());
      Oe(z.DELIVERIES, cleaned);
      if (onRefresh) onRefresh();
    } catch(e){}
  };

  const pendingOrders = w.useMemo(() => {
    const dMap = new Map();
    deliveries.forEach(d => {
      if (!d || !d.id) return;
      if (d.status === "cancelled" || d.status === "delivered") return;
      const dDate = d.deliveryDate || d.date || todayStr;
      if (filterDate === "today" && dDate !== todayStr) return;
      if (filterDate === "tomorrow" && dDate !== tomorrowStr) return;
      if (filterShift !== "all" && (d.mealSlot || d.mealType || "lunch").toLowerCase() !== filterShift) return;
      if (filterStatus === "pending" && d.status !== "scheduled" && d.status !== "pending") return;
      if (filterStatus === "cooking" && d.status !== "preparing") return;
      if (filterStatus === "packed" && d.status !== "packed") return;
      const k = (d.subscriptionId || d.customerId || d.id) + "_" + dDate + "_" + (d.mealSlot || d.mealType || "lunch").toLowerCase();
      if (!dMap.has(k)) dMap.set(k, d);
    });
    return Array.from(dMap.values());
  }, [deliveries, filterDate, filterShift, filterStatus, todayStr, tomorrowStr]);

  `;

code = code.substring(0, start) + repQueueHeader + code.substring(end);
console.log("✓ Replaced KitchenTerminalOrdersQueue header with date filter & deduplication!");

// 4. In Shift Filters, inject Date selector tabs & Clean Duplicates button
const pShift = code.indexOf("// Shift Filters");
if (pShift !== -1) {
  const injectDateBar = `// Date & Shift Filters
          s.jsxs("div", {
            className: "flex items-center gap-2 flex-wrap",
            children: [
              s.jsxs("div", {
                className: "flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200",
                children: [
                  { id: "today", label: "📅 आज (Today)" },
                  { id: "tomorrow", label: "🌅 कल (Tomorrow)" },
                  { id: "all", label: "📋 सब (All Dates)" }
                ].map(dt => s.jsx("button", {
                  key: dt.id,
                  type: "button",
                  onClick: () => setFilterDate(dt.id),
                  className: "px-2.5 py-1 rounded-lg text-xs font-black transition-all cursor-pointer " + (filterDate === dt.id ? "bg-amber-600 text-white shadow-xs" : "bg-transparent hover:bg-slate-200 text-slate-700"),
                  children: dt.label
                }))
              }),
              s.jsx("button", {
                type: "button",
                onClick: cleanDuplicateDeliveries,
                className: "px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-[11px] font-black cursor-pointer transition-all",
                title: "डेटाबेस से डुप्लीकेट डिलीवरी हटाएँ",
                children: "🧹 डुप्लीकेट साफ़ करें"
              })
            ]
          }),
          `;
  code = code.substring(0, pShift) + injectDateBar + code.substring(pShift);
  console.log("✓ Added Date selector tabs & Clean button to queue header!");
}

// 5. Update "सभी ऑर्डर्स" badge to show pendingOrders.length
const oldBadge = 'label: `सभी ऑर्डर्स (${deliveries.filter(d => d.status !== "delivered" && d.status !== "cancelled").length})`';
const newBadge = 'label: `सभी ऑर्डर्स (${pendingOrders.length})`';
if (code.includes(oldBadge)) {
  code = code.replace(oldBadge, newBadge);
  console.log("✓ Updated 'सभी ऑर्डर्स' badge to show accurate filtered count!");
}

// Save to client.js and public/assets/client.js
fs.writeFileSync("assets/client.js", code);
fs.writeFileSync("public/assets/client.js", code);

console.log("Verifying TypeScript syntax...");
const sf = ts.createSourceFile("client.js", code, ts.ScriptTarget.Latest, true);
console.log("client.js diagnostics count:", sf.parseDiagnostics.length);
if (sf.parseDiagnostics.length > 0) {
  sf.parseDiagnostics.forEach(d => console.log("Error:", d.messageText, "at", d.start));
  process.exit(1);
}

try {
  esbuild.transformSync(code, { loader: "js" });
  console.log("🎉 ALL DELIVERIES FILTERING & DEDUPLICATION FIXES APPLIED SUCCESSFULLY!");
} catch (e) {
  console.error("esbuild error:", e);
  process.exit(1);
}
