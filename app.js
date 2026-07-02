const breakerRatings = [6, 10, 16, 20, 25, 32, 40, 50, 63, 80, 100, 125, 160, 200, 250, 315, 400, 500, 630, 800, 1000, 1250, 1600, 2000, 2500, 3200];
const acbFrames = [
  { af: 800, at: 800, icu: 50, ics: 50, device: "MCCB/ACB", poles: "3P/4P", trip: "LSI" },
  { af: 1000, at: 1000, icu: 50, ics: 50, device: "ACB", poles: "3P/4P", trip: "LSI" },
  { af: 1250, at: 1250, icu: 65, ics: 65, device: "ACB", poles: "3P/4P", trip: "LSIG" },
  { af: 1600, at: 1600, icu: 65, ics: 65, device: "ACB", poles: "3P/4P", trip: "LSIG" },
  { af: 2000, at: 2000, icu: 85, ics: 85, device: "ACB", poles: "3P/4P", trip: "LSIG" },
  { af: 2500, at: 2500, icu: 85, ics: 85, device: "ACB", poles: "3P/4P", trip: "LSIG" },
  { af: 3200, at: 3200, icu: 100, ics: 100, device: "ACB", poles: "3P/4P", trip: "LSIG" },
  { af: 4000, at: 4000, icu: 100, ics: 100, device: "ACB", poles: "3P/4P", trip: "LSIG" },
  { af: 5000, at: 5000, icu: 100, ics: 100, device: "ACB", poles: "3P/4P", trip: "LSIG" },
  { af: 6300, at: 6300, icu: 120, ics: 120, device: "ACB", poles: "3P/4P", trip: "LSIG" },
];

const wires = [
  { size: 1.5, "Cu PVC conduit": 15, "Cu XLPE conduit": 18, "Cu PVC tray": 21, "Al PVC conduit": 0 },
  { size: 2.5, "Cu PVC conduit": 20, "Cu XLPE conduit": 24, "Cu PVC tray": 28, "Al PVC conduit": 0 },
  { size: 4, "Cu PVC conduit": 27, "Cu XLPE conduit": 32, "Cu PVC tray": 37, "Al PVC conduit": 0 },
  { size: 6, "Cu PVC conduit": 34, "Cu XLPE conduit": 41, "Cu PVC tray": 47, "Al PVC conduit": 0 },
  { size: 10, "Cu PVC conduit": 47, "Cu XLPE conduit": 57, "Cu PVC tray": 65, "Al PVC conduit": 38 },
  { size: 16, "Cu PVC conduit": 63, "Cu XLPE conduit": 76, "Cu PVC tray": 87, "Al PVC conduit": 50 },
  { size: 25, "Cu PVC conduit": 84, "Cu XLPE conduit": 101, "Cu PVC tray": 114, "Al PVC conduit": 66 },
  { size: 35, "Cu PVC conduit": 104, "Cu XLPE conduit": 125, "Cu PVC tray": 141, "Al PVC conduit": 83 },
  { size: 50, "Cu PVC conduit": 125, "Cu XLPE conduit": 151, "Cu PVC tray": 169, "Al PVC conduit": 99 },
  { size: 70, "Cu PVC conduit": 160, "Cu XLPE conduit": 192, "Cu PVC tray": 215, "Al PVC conduit": 125 },
  { size: 95, "Cu PVC conduit": 194, "Cu XLPE conduit": 232, "Cu PVC tray": 264, "Al PVC conduit": 150 },
  { size: 120, "Cu PVC conduit": 225, "Cu XLPE conduit": 269, "Cu PVC tray": 305, "Al PVC conduit": 176 },
  { size: 150, "Cu PVC conduit": 260, "Cu XLPE conduit": 309, "Cu PVC tray": 352, "Al PVC conduit": 203 },
  { size: 185, "Cu PVC conduit": 297, "Cu XLPE conduit": 353, "Cu PVC tray": 402, "Al PVC conduit": 231 },
  { size: 240, "Cu PVC conduit": 350, "Cu XLPE conduit": 415, "Cu PVC tray": 474, "Al PVC conduit": 273 },
  { size: 300, "Cu PVC conduit": 401, "Cu XLPE conduit": 477, "Cu PVC tray": 545, "Al PVC conduit": 313 },
  { size: 400, "Cu PVC conduit": 463, "Cu XLPE conduit": 571, "Cu PVC tray": 621, "Al PVC conduit": 361 },
  { size: 500, "Cu PVC conduit": 530, "Cu XLPE conduit": 656, "Cu PVC tray": 712, "Al PVC conduit": 412 },
  { size: 630, "Cu PVC conduit": 610, "Cu XLPE conduit": 758, "Cu PVC tray": 820, "Al PVC conduit": 475 },
  { size: 800, "Cu PVC conduit": 700, "Cu XLPE conduit": 870, "Cu PVC tray": 940, "Al PVC conduit": 545 },
  { size: 1000, "Cu PVC conduit": 800, "Cu XLPE conduit": 1000, "Cu PVC tray": 1080, "Al PVC conduit": 620 },
];

const categories = ["Lighting", "Receptacle", "HVAC", "Motor/Pump", "Residential", "Retail", "Office", "Kitchen", "EV Charger", "Elevator", "Fire Pump", "General"];
const cableMethods = ["Cu PVC conduit", "Cu XLPE conduit", "Cu PVC tray", "Al PVC conduit"];
const storeKey = "central-electrical-load-online-v1";
let loads = [];
let extractedLoads = [];

const $ = (id) => document.getElementById(id);
const fmt = (value, digits = 1) => Number.isFinite(value) ? value.toLocaleString("en-US", { maximumFractionDigits: digits, minimumFractionDigits: digits }) : "-";
const num = (id, fallback = 0) => Number($(id).value || fallback);

function optionize(select, values) {
  select.innerHTML = values.map((value) => `<option value="${value}">${value}</option>`).join("");
}

function nextAt(value, ratings) {
  return ratings.find((rating) => rating >= value) ?? null;
}

function cableCombos(method) {
  const combos = [];
  for (let runs = 1; runs <= 6; runs += 1) {
    wires.forEach((wire) => {
      if (runs > 1 && wire.size < 500) return;
      const ampacity = wire[method] || 0;
      if (!ampacity) return;
      combos.push({
        ampacity: ampacity * runs,
        runs,
        size: wire.size,
        label: `${runs} x ${wire.size} sq.mm/phase`,
      });
    });
  }
  return combos.sort((a, b) => a.ampacity - b.ampacity);
}

function selectCable(current, method) {
  return cableCombos(method).find((combo) => combo.ampacity >= current) ?? { label: "เกินตาราง", ampacity: 0 };
}

function selectBreaker(current) {
  return nextAt(current, breakerRatings) ?? "เกินตาราง";
}

function selectAcb(breakerAt) {
  return acbFrames.find((frame) => frame.af >= breakerAt) ?? { af: "เกินตาราง", at: "เกินตาราง", icu: "-", ics: "-", device: "ตรวจตาราง", poles: "-", trip: "-" };
}

function connectedVa(row) {
  const qty = Number(row.qty || 0);
  const kw = Number(row.kw || 0);
  const amp = Number(row.amp || 0);
  const voltage = Number(row.voltage || 400);
  const pf = Number(row.pf || 0.9);
  if (row.inputType === "Current A") {
    return row.phase === "3 Phase"
      ? Math.sqrt(3) * voltage * amp * qty * pf
      : voltage * amp * qty * pf;
  }
  return qty * kw * 1000;
}

function phaseVa(row, totalVa, index) {
  if (row.phase === "3 Phase") {
    const each = totalVa / 3;
    return { a: each, b: each, c: each };
  }
  const phaseIndex = row.phaseLoad === "A" ? 0 : row.phaseLoad === "B" ? 1 : row.phaseLoad === "C" ? 2 : index % 3;
  return {
    a: phaseIndex === 0 ? totalVa : 0,
    b: phaseIndex === 1 ? totalVa : 0,
    c: phaseIndex === 2 ? totalVa : 0,
  };
}

function groundSize(size) {
  if (size <= 4) return 2.5;
  if (size <= 16) return size;
  if (size <= 35) return 16;
  if (size <= 70) return 25;
  if (size <= 120) return 50;
  return 70;
}

function wireType(method) {
  if (method.includes("XLPE")) return "XLPE";
  if (method.includes("PVC")) return "IEC01";
  return method.split(" ")[1] || "IEC01";
}

function conduitType(method) {
  if (method.includes("tray")) return "Cable Tray";
  if (method.includes("conduit")) return "PVC";
  return "Conduit";
}

function conduitSize(cable) {
  const size = Number(cable.size || 0);
  if (size <= 4) return "3/4 in";
  if (size <= 10) return "1 in";
  if (size <= 25) return "1-1/4 in";
  if (size <= 50) return "1-1/2 in";
  if (size <= 95) return "2 in";
  if (size <= 185) return "3 in";
  return "Cable Tray";
}

function breakerType(at) {
  if (at >= 800) return "ACB";
  if (at >= 100) return "MCCB";
  return "CB";
}

function interruptingCapacity(at) {
  if (at <= 63) return 6;
  if (at <= 250) return 10;
  if (at <= 630) return 36;
  return 50;
}

function wireSizeText(row, cable) {
  const size = Number(cable.size || 0);
  const runs = Number(cable.runs || 1);
  if (!size) return cable.label || "-";
  const conductors = row.phase === "3 Phase" ? 4 : 2;
  const prefix = runs > 1 ? `${runs}R ` : "";
  return `${prefix}${conductors}x${size}/${groundSize(size)}G`;
}

function standardSchedule(calculated) {
  return calculated.map((item, index) => {
    const row = item.row;
    const calc = item.calc;
    const totalVa = connectedVa(row);
    const phases = phaseVa(row, totalVa, index);
    const demandVa = totalVa * Number(row.demand || 1);
    const breakerAt = Number(calc.breaker || 0);
    return {
      circuit: index + 1,
      description: row.name,
      panel: row.panel || "MDB",
      phase: row.phase,
      pole: row.phase === "3 Phase" ? 3 : 1,
      breakerAt: calc.breaker,
      breakerType: breakerType(breakerAt),
      ic: interruptingCapacity(breakerAt),
      wireSize: wireSizeText(row, calc.cable),
      wireType: wireType(row.cableMethod || ""),
      conduitType: conduitType(row.cableMethod || ""),
      conduitSize: conduitSize(calc.cable),
      aVa: phases.a,
      bVa: phases.b,
      cVa: phases.c,
      totalVa,
      currentA: calc.runCurrent,
      demandVa,
    };
  });
}

function phaseSummary(standardRows) {
  const totals = standardRows.reduce((sum, row) => {
    sum.a += Number(row.aVa || 0);
    sum.b += Number(row.bVa || 0);
    sum.c += Number(row.cVa || 0);
    return sum;
  }, { a: 0, b: 0, c: 0 });
  const values = [totals.a, totals.b, totals.c];
  const max = Math.max(...values);
  const min = Math.min(...values);
  const avg = values.reduce((sum, value) => sum + value, 0) / 3;
  const unbalance = avg > 0 ? (max - min) / avg * 100 : 0;
  return { ...totals, max, min, avg, unbalance };
}

function designWarnings(summary, standardRows, phase) {
  const warnings = [];
  if (!standardRows.length) {
    warnings.push({ level: "warn", text: "ยังไม่มีรายการโหลด กรุณาเพิ่มโหลดก่อนส่งรายงาน" });
  }
  if (phase.unbalance > 20) {
    warnings.push({ level: "warn", text: `โหลด 1P/รวมเฟสไม่บาลานซ์ ${fmt(phase.unbalance, 1)}% ควรจัดเฟส A/B/C ใหม่` });
  } else if (standardRows.length) {
    warnings.push({ level: "ok", text: `Phase balance อยู่ในระดับตรวจสอบได้ (${fmt(phase.unbalance, 1)}%)` });
  }
  summary.calculated.forEach((item, index) => {
    if (!item.calc.cable.ampacity || item.calc.breaker === "เกินตาราง") {
      warnings.push({ level: "warn", text: `Circuit ${index + 1} ${item.row.name}: กระแสสูงเกินตารางที่ตั้งไว้ ต้องตรวจขนาดสาย/วิธีติดตั้ง` });
    }
    if (item.row.inputType === "kW" && Number(item.row.kw || 0) <= 0) {
      warnings.push({ level: "warn", text: `Circuit ${index + 1} ${item.row.name}: ยังไม่ได้ใส่ kW` });
    }
    if (item.row.inputType === "Current A" && Number(item.row.amp || 0) <= 0) {
      warnings.push({ level: "warn", text: `Circuit ${index + 1} ${item.row.name}: ยังไม่ได้ใส่ FLA` });
    }
  });
  warnings.push({ level: "note", text: "ต้องตรวจตาราง วสท., derating, voltage drop, short-circuit และ coordination ก่อนออกแบบใช้งานจริง" });
  return warnings;
}

function calcLoad(row) {
  const qty = Number(row.qty || 0);
  const kw = Number(row.kw || 0);
  const amp = Number(row.amp || 0);
  const voltage = Number(row.voltage || 400);
  const pf = Number(row.pf || 0.9);
  const eff = Number(row.eff || 1);
  const demand = Number(row.demand || 1);
  const branchFactor = Number(row.branchFactor || 1.25);
  const runCurrent = row.inputType === "Current A"
    ? amp * qty
    : row.phase === "3 Phase"
      ? qty * kw * 1000 / (Math.sqrt(3) * voltage * pf * eff)
      : qty * kw * 1000 / (voltage * pf * eff);
  const designCurrent = runCurrent * demand * branchFactor;
  const cable = selectCable(designCurrent, row.cableMethod);
  const breaker = selectBreaker(designCurrent);
  return { runCurrent, designCurrent, cable, breaker };
}

function getSummary() {
  const calculated = loads.map((row) => ({ row, calc: calcLoad(row) }));
  const totalKw = loads.reduce((sum, row) => sum + Number(row.qty || 0) * Number(row.kw || 0), 0);
  const runCurrent = calculated.reduce((sum, item) => sum + item.calc.runCurrent, 0);
  const designCurrent = calculated.reduce((sum, item) => sum + item.calc.designCurrent, 0);
  const largestMotor = Math.max(0, ...calculated.filter((item) => item.row.motorAdd === "Yes").map((item) => item.calc.runCurrent));
  const spare = num("mainSpare", 0) / 100;
  const mainCurrent = (designCurrent + largestMotor * 0.25) * (1 + spare);
  const mainCable = selectCable(mainCurrent, $("mainCableMethod").value);
  const mainBreaker = selectBreaker(mainCurrent);
  const acb = selectAcb(Number(mainBreaker || 0));
  return { calculated, totalKw, runCurrent, designCurrent, largestMotor, mainCurrent, mainCable, mainBreaker, acb };
}

function addLoadFromForm() {
  loads.push({
    zone: $("zoneInput").value.trim() || "Project",
    panel: $("panelInput").value.trim() || "MDB",
    category: $("categoryInput").value,
    name: $("loadNameInput").value.trim() || "Load",
    inputType: $("inputTypeInput").value,
    qty: Number($("qtyInput").value || 1),
    kw: Number($("kwInput").value || 0),
    amp: Number($("ampInput").value || 0),
    voltage: Number($("voltageInput").value || 400),
    phase: $("phaseInput").value,
    phaseLoad: $("phaseLoadInput").value,
    pf: Number($("pfInput").value || 0.9),
    eff: Number($("effInput").value || 1),
    demand: Number($("demandInput").value || 1),
    branchFactor: Number($("branchFactorInput").value || 1.25),
    motorAdd: $("motorAddInput").value,
    length: Number($("lengthInput").value || 0),
    cableMethod: $("cableMethodInput").value,
  });
  $("loadNameInput").value = "";
  $("kwInput").value = "";
  $("ampInput").value = "";
  render();
}

function normalizeImportedLoad(row) {
  return {
    zone: row.zone || row.project_zone || "PDF",
    panel: row.panel || "MDB",
    category: row.category || "General",
    name: row.name || row.load_name || "PDF Load",
    inputType: row.inputType || row.input_type || "kW",
    qty: Number(row.qty || 1),
    kw: Number(row.kw || row.kw_per_unit || 0),
    amp: Number(row.amp || row.current_a_per_unit || 0),
    voltage: Number(row.voltage || 400),
    phase: row.phase || "3 Phase",
    phaseLoad: row.phaseLoad || row.phase_load || "Auto",
    pf: Number(row.pf || 0.9),
    eff: Number(row.eff || row.efficiency || 1),
    demand: Number(row.demand || row.demand_factor || 1),
    branchFactor: Number(row.branchFactor || row.branch_factor || 1.25),
    motorAdd: row.motorAdd || (row.apply_motor_adder ? "Yes" : "No"),
    length: Number(row.length || row.length_m || 0),
    cableMethod: row.cableMethod || row.cable_method || "Cu XLPE conduit",
    sourcePage: row.sourcePage || row.page || "",
    validationStatus: row.validationStatus || row.validation_status || "",
    validationIssue: row.validationIssue || row.validation_issue || "",
    assumption: row.assumption || "",
  };
}

function setPdfStatus(message, mode = "info") {
  const el = $("pdfStatus");
  if (!el) return;
  el.textContent = message;
  el.className = `status-box ${mode}`;
}

function renderExtractedLoads() {
  const body = $("extractedTableBody");
  if (!body) return;
  body.innerHTML = extractedLoads.map((row) => {
    const statusClass = row.validationStatus === "OK" ? "ok" : row.validationStatus ? "warn" : "calc";
    return `
      <tr>
        <td>${row.sourcePage || ""}</td>
        <td>${row.panel}</td>
        <td>${row.category}</td>
        <td>${row.name}</td>
        <td>${row.inputType}</td>
        <td>${fmt(row.qty, 0)}</td>
        <td>${fmt(row.kw)}</td>
        <td>${fmt(row.amp)}</td>
        <td>${fmt(row.voltage, 0)}</td>
        <td>${row.phase}</td>
        <td class="${statusClass}">${row.validationStatus || "Review"}</td>
        <td>${[row.validationIssue, row.assumption].filter(Boolean).join(" | ")}</td>
      </tr>
    `;
  }).join("");
}

async function extractPdf() {
  const input = $("pdfInput");
  const file = input?.files?.[0];
  if (!file) {
    setPdfStatus("กรุณาเลือก PDF ก่อน", "warn");
    return;
  }
  setPdfStatus(`กำลังอ่าน PDF: ${file.name}`);
  const data = new FormData();
  data.append("file", file);
  try {
    const response = await fetch("/api/extract-pdf", { method: "POST", body: data });
    const result = await response.json();
    if (!result.ok) {
      setPdfStatus(result.error || "อ่าน PDF ไม่สำเร็จ", "warn");
      return;
    }
    extractedLoads = (result.loads || []).map(normalizeImportedLoad);
    renderExtractedLoads();
    const warning = (result.warnings || []).join(" | ");
    const suffix = warning ? ` (${warning})` : "";
    setPdfStatus(`อ่านได้ ${extractedLoads.length} load rows จาก ${result.pageCount} หน้า${suffix}`, extractedLoads.length ? "ok" : "warn");
  } catch (error) {
    setPdfStatus(`อ่าน PDF ไม่สำเร็จ: ${error.message}`, "warn");
  }
}

function importExtractedLoads() {
  if (!extractedLoads.length) {
    setPdfStatus("ยังไม่มีข้อมูลจาก PDF ให้นำเข้า", "warn");
    return;
  }
  loads.push(...extractedLoads.map(normalizeImportedLoad));
  setPdfStatus(`นำเข้า ${extractedLoads.length} rows เข้า Load Schedule แล้ว`, "ok");
  render();
}

async function exportExtractedCsv() {
  if (!extractedLoads.length) {
    setPdfStatus("ยังไม่มีข้อมูลจาก PDF ให้ export", "warn");
    return;
  }
  const response = await fetch("/api/export-extracted-csv", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ loads: extractedLoads }),
  });
  const result = await response.json();
  if (!result.ok) {
    setPdfStatus(result.error || "Export CSV ไม่สำเร็จ", "warn");
    return;
  }
  window.open(result.csvPath, "_blank");
  setPdfStatus(`Export CSV แล้ว: ${result.csvPath}`, "ok");
}

function removeLoad(index) {
  loads.splice(index, 1);
  render();
}

function renderLoads(calculated) {
  $("loadTableBody").innerHTML = calculated.map((item, index) => {
    const row = item.row;
    const calc = item.calc;
    return `
      <tr>
        <td>${index + 1}</td>
        <td>${row.zone}</td>
        <td>${row.panel}</td>
        <td>${row.category}</td>
        <td>${row.name}</td>
        <td>${row.inputType}</td>
        <td>${fmt(row.qty, 0)}</td>
        <td>${fmt(row.kw)}</td>
        <td>${fmt(row.amp)}</td>
        <td class="calc">${fmt(calc.runCurrent)}</td>
        <td class="calc">${fmt(calc.designCurrent)}</td>
        <td class="calc">${calc.cable.label}</td>
        <td class="calc">${calc.breaker}</td>
        <td><button class="remove-btn" type="button" data-remove="${index}">ลบ</button></td>
      </tr>
    `;
  }).join("");

  document.querySelectorAll("[data-remove]").forEach((button) => {
    button.addEventListener("click", () => removeLoad(Number(button.dataset.remove)));
  });
}

function renderStandardSchedule(calculated) {
  const body = $("standardScheduleBody");
  if (!body) return;
  const rows = standardSchedule(calculated);
  body.innerHTML = rows.map((row) => `
    <tr>
      <td>${row.circuit}</td>
      <td>${row.description}</td>
      <td>${row.panel}</td>
      <td>${row.phase}</td>
      <td class="calc">${row.pole}</td>
      <td class="calc">${row.breakerAt}</td>
      <td class="calc">${row.breakerType}</td>
      <td class="calc">${row.ic}</td>
      <td class="calc">${row.wireSize}</td>
      <td class="calc">${row.wireType}</td>
      <td class="calc">${row.conduitType} ${row.conduitSize}</td>
      <td class="calc">${fmt(row.aVa, 0)}</td>
      <td class="calc">${fmt(row.bVa, 0)}</td>
      <td class="calc">${fmt(row.cVa, 0)}</td>
      <td class="calc">${fmt(row.totalVa, 0)}</td>
      <td class="calc">${fmt(row.currentA)}</td>
      <td class="calc">${fmt(row.demandVa, 0)}</td>
    </tr>
  `).join("");
}

function renderPanels(calculated) {
  const panels = new Map();
  calculated.forEach((item) => {
    const key = item.row.panel || "MDB";
    const current = panels.get(key) || { design: 0, largestMotor: 0 };
    current.design += item.calc.designCurrent;
    if (item.row.motorAdd === "Yes") current.largestMotor = Math.max(current.largestMotor, item.calc.runCurrent);
    panels.set(key, current);
  });

  const rows = [...panels.entries()].map(([panel, value]) => {
    const design = value.design + value.largestMotor * 0.25;
    const cable = selectCable(design, $("mainCableMethod").value);
    const breaker = selectBreaker(design);
    const acb = selectAcb(Number(breaker || 0));
    return { panel, design, cable, breaker, acb };
  });

  $("panelSummaryBody").innerHTML = rows.map((row) => `
    <tr>
      <td>${row.panel}</td>
      <td class="calc">${fmt(row.design)}</td>
      <td class="calc">${row.cable.label}</td>
      <td class="calc">${row.breaker}</td>
      <td class="calc">${row.acb.device}</td>
      <td class="calc">${row.acb.icu} / ${row.acb.ics}</td>
    </tr>
  `).join("");

  return rows;
}

function renderAcb(panelRows, summary) {
  const rows = [
    { board: "MAIN", design: summary.mainCurrent, breaker: summary.mainBreaker, cable: summary.mainCable, acb: summary.acb },
    ...panelRows.map((row) => ({ board: row.panel, design: row.design, breaker: row.breaker, cable: row.cable, acb: row.acb })),
  ];

  $("acbScheduleBody").innerHTML = rows.map((row) => `
    <tr>
      <td>${row.board}</td>
      <td class="calc">${fmt(row.design)}</td>
      <td class="calc">${row.breaker}</td>
      <td class="calc">${row.acb.device}</td>
      <td class="calc">${row.acb.af}</td>
      <td class="calc">${row.acb.trip}</td>
      <td class="calc">${row.acb.poles}</td>
    </tr>
  `).join("");
}

function renderPhaseAndWarnings(summary) {
  const standardRows = standardSchedule(summary.calculated);
  const phase = phaseSummary(standardRows);
  $("phaseA").textContent = `${fmt(phase.a, 0)} VA`;
  $("phaseB").textContent = `${fmt(phase.b, 0)} VA`;
  $("phaseC").textContent = `${fmt(phase.c, 0)} VA`;
  $("phaseUnbalance").textContent = `${fmt(phase.unbalance, 1)}%`;
  const warnings = designWarnings(summary, standardRows, phase);
  $("warningList").innerHTML = warnings.map((item) => `<div class="check ${item.level}">${item.text}</div>`).join("");
}

function renderReportPreview() {
  const frame = $("reportPreview");
  if (!frame) return;
  frame.srcdoc = reportHtml();
}

function render() {
  const summary = getSummary();
  $("totalKw").textContent = `${fmt(summary.totalKw)} kW`;
  $("mainCurrent").textContent = `${fmt(summary.mainCurrent)} A`;
  $("mainCable").textContent = summary.mainCable.label;
  $("mainBreaker").textContent = `${summary.mainBreaker} A`;
  $("mainDevice").textContent = summary.acb.device;
  $("mainAcb").textContent = `${summary.acb.af}AF / ${summary.acb.at}AT`;
  renderLoads(summary.calculated);
  renderStandardSchedule(summary.calculated);
  const panelRows = renderPanels(summary.calculated);
  renderAcb(panelRows, summary);
  renderPhaseAndWarnings(summary);
  renderReportPreview();
}

function seedLoads() {
  loads = [
    { zone: "Mall", panel: "MDB", category: "Lighting", name: "Common area lighting", inputType: "kW", qty: 1, kw: 35, amp: 0, voltage: 400, phase: "3 Phase", pf: 0.95, eff: 1, demand: 1, branchFactor: 1.25, motorAdd: "No", length: 60, cableMethod: "Cu XLPE conduit" },
    { zone: "Mall", panel: "MDB", category: "Receptacle", name: "Shop outlets allowance", inputType: "kW", qty: 1, kw: 80, amp: 0, voltage: 400, phase: "3 Phase", pf: 0.9, eff: 1, demand: 0.8, branchFactor: 1.25, motorAdd: "No", length: 65, cableMethod: "Cu XLPE conduit" },
    { zone: "Office", panel: "MDB", category: "HVAC", name: "VRF outdoor units", inputType: "kW", qty: 1, kw: 120, amp: 0, voltage: 400, phase: "3 Phase", pf: 0.9, eff: 0.92, demand: 1, branchFactor: 1.25, motorAdd: "Yes", length: 50, cableMethod: "Cu XLPE conduit" },
    { zone: "Building", panel: "MCC", category: "Motor/Pump", name: "Transfer pump", inputType: "kW", qty: 2, kw: 22, amp: 0, voltage: 400, phase: "3 Phase", pf: 0.86, eff: 0.9, demand: 1, branchFactor: 1.25, motorAdd: "Yes", length: 45, cableMethod: "Cu XLPE conduit" },
    { zone: "Home Project", panel: "MDB", category: "Residential", name: "House feeder group", inputType: "kW", qty: 20, kw: 12, amp: 0, voltage: 230, phase: "1 Phase", pf: 0.9, eff: 1, demand: 0.55, branchFactor: 1.25, motorAdd: "No", length: 30, cableMethod: "Cu PVC conduit" },
    { zone: "EV", panel: "DB-EV", category: "EV Charger", name: "AC charger", inputType: "kW", qty: 4, kw: 7.4, amp: 0, voltage: 230, phase: "1 Phase", pf: 0.95, eff: 1, demand: 0.8, branchFactor: 1.25, motorAdd: "No", length: 35, cableMethod: "Cu PVC conduit" },
    { zone: "Kitchen", panel: "DB-K", category: "Kitchen", name: "Kitchen equipment", inputType: "kW", qty: 1, kw: 45, amp: 0, voltage: 400, phase: "3 Phase", pf: 0.9, eff: 1, demand: 0.75, branchFactor: 1.25, motorAdd: "No", length: 40, cableMethod: "Cu XLPE conduit" },
    { zone: "Lift", panel: "MDB", category: "Elevator", name: "Lift motor", inputType: "Current A", qty: 1, kw: 0, amp: 85, voltage: 400, phase: "3 Phase", pf: 0.85, eff: 0.9, demand: 1, branchFactor: 1.25, motorAdd: "Yes", length: 55, cableMethod: "Cu XLPE conduit" },
  ];
}

function saveState() {
  const state = {
    projectName: $("projectName").value,
    systemVoltage: $("systemVoltage").value,
    mainCableMethod: $("mainCableMethod").value,
    mainSpare: $("mainSpare").value,
    loads,
  };
  localStorage.setItem(storeKey, JSON.stringify(state));
}

function loadState() {
  const raw = localStorage.getItem(storeKey);
  if (!raw) {
    seedLoads();
    return;
  }
  try {
    const state = JSON.parse(raw);
    $("projectName").value = state.projectName || "Central Load Template";
    $("systemVoltage").value = state.systemVoltage || 400;
    $("mainCableMethod").value = state.mainCableMethod || "Cu XLPE conduit";
    $("mainSpare").value = state.mainSpare || 20;
    loads = Array.isArray(state.loads) ? state.loads : [];
  } catch {
    seedLoads();
  }
}

function exportCsv() {
  const summary = getSummary();
  const standardRows = standardSchedule(summary.calculated);
  const rows = [
    ["Circuit No", "Description", "Zone", "Panel", "Category", "Phase", "CB Pole", "CB AT", "CB Type", "IC kA", "Wire Size", "Wire Type", "Conduit", "A VA", "B VA", "C VA", "Total VA", "Current A", "Demand VA", "Input", "Qty", "kW", "FLA"],
    ...summary.calculated.map((item, index) => {
      const standard = standardRows[index];
      return [
      standard.circuit,
      standard.description,
      item.row.zone,
      item.row.panel,
      item.row.category,
      item.row.phase,
      standard.pole,
      standard.breakerAt,
      standard.breakerType,
      standard.ic,
      standard.wireSize,
      standard.wireType,
      `${standard.conduitType} ${standard.conduitSize}`,
      standard.aVa.toFixed(0),
      standard.bVa.toFixed(0),
      standard.cVa.toFixed(0),
      standard.totalVa.toFixed(0),
      standard.currentA.toFixed(2),
      standard.demandVa.toFixed(0),
      item.row.inputType,
      item.row.qty,
      item.row.kw,
      item.row.amp,
    ];
    }),
  ];
  const csv = rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "central-load-schedule.csv";
  link.click();
  URL.revokeObjectURL(link.href);
}

async function exportStandardPdf() {
  openReport(true);
}

function reportHtml() {
  const summary = getSummary();
  const panels = renderPanels(summary.calculated);
  const standardRows = standardSchedule(summary.calculated).map((row) => `
    <tr>
      <td>${row.circuit}</td>
      <td>${row.description}</td>
      <td>${row.panel}</td>
      <td>${row.phase}</td>
      <td>${row.pole}</td>
      <td>${row.breakerAt}</td>
      <td>${row.breakerType}</td>
      <td>${row.ic}</td>
      <td>${row.wireSize}</td>
      <td>${row.wireType}</td>
      <td>${row.conduitType} ${row.conduitSize}</td>
      <td>${fmt(row.aVa, 0)}</td>
      <td>${fmt(row.bVa, 0)}</td>
      <td>${fmt(row.cVa, 0)}</td>
      <td>${fmt(row.totalVa, 0)}</td>
      <td>${fmt(row.currentA)}</td>
      <td>${fmt(row.demandVa, 0)}</td>
    </tr>
  `).join("");
  const loadRows = summary.calculated.map((item, index) => `
    <tr>
      <td>${index + 1}</td>
      <td>${item.row.panel}</td>
      <td>${item.row.category}</td>
      <td>${item.row.name}</td>
      <td>${item.row.inputType}</td>
      <td>${fmt(item.row.qty, 0)}</td>
      <td>${fmt(item.row.kw)}</td>
      <td>${fmt(item.row.amp)}</td>
      <td>${fmt(item.calc.runCurrent)}</td>
      <td>${fmt(item.calc.designCurrent)}</td>
      <td>${item.calc.cable.label}</td>
      <td>${item.calc.breaker}</td>
    </tr>
  `).join("");
  const panelRows = panels.map((row) => `
    <tr>
      <td>${row.panel}</td>
      <td>${fmt(row.design)}</td>
      <td>${row.cable.label}</td>
      <td>${row.breaker}</td>
      <td>${row.acb.device}</td>
      <td>${row.acb.af}AF / ${row.acb.at}AT</td>
      <td>${row.acb.icu} / ${row.acb.ics}</td>
    </tr>
  `).join("");
  return `<!doctype html>
  <html lang="th">
    <head>
      <meta charset="utf-8">
      <title>Electrical Design Report</title>
      <style>
        @page { size: A4 landscape; margin: 10mm; }
        body { font-family: "Segoe UI", Tahoma, sans-serif; color: #1f2937; margin: 28px; }
        h1 { color: #1f4e79; margin-bottom: 4px; }
        h2 { background: #0f766e; color: white; padding: 8px 10px; font-size: 16px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 18px; font-size: 10px; }
        th, td { border: 1px solid #b7c9d6; padding: 6px; text-align: left; }
        th { background: #1f4e79; color: white; }
        .metrics { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin: 16px 0; }
        .metric { border: 1px solid #b7c9d6; padding: 10px; background: #eaf3f8; }
        .note { background: #fff4d6; padding: 10px; border: 1px solid #d6b85f; }
        .signature { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 32px; text-align: center; }
        .sign-line { border-top: 1px solid #1f2937; padding-top: 8px; }
        @media print { body { margin: 0; } button { display: none; } }
      </style>
    </head>
    <body>
      <h1>Electrical Design Report</h1>
      <div>${$("projectName").value || "Central Load Template"}</div>
      <div class="metrics">
        <div class="metric"><b>Total Load</b><br>${fmt(summary.totalKw)} kW</div>
        <div class="metric"><b>Main Current</b><br>${fmt(summary.mainCurrent)} A</div>
        <div class="metric"><b>Main Cable</b><br>${summary.mainCable.label}</div>
        <div class="metric"><b>Main Breaker</b><br>${summary.mainBreaker} A / ${summary.acb.device}</div>
      </div>
      <h2>Load Schedule</h2>
      <table>
        <thead><tr><th>Circuit No.</th><th>Description</th><th>Panel</th><th>Phase</th><th>CB Pole</th><th>CB AT</th><th>Type</th><th>IC>= kA</th><th>Wire Size</th><th>Wire Type</th><th>Conduit</th><th>A VA</th><th>B VA</th><th>C VA</th><th>Total VA</th><th>Current A</th><th>Demand VA</th></tr></thead>
        <tbody>${standardRows}</tbody>
      </table>
      <h2>Calculation Detail</h2>
      <table>
        <thead><tr><th>No.</th><th>Panel</th><th>Category</th><th>Load</th><th>Input</th><th>Qty</th><th>kW</th><th>A</th><th>Run A</th><th>Design A</th><th>Cable</th><th>Breaker</th></tr></thead>
        <tbody>${loadRows}</tbody>
      </table>
      <h2>Panel / ACB Schedule</h2>
      <table>
        <thead><tr><th>Panel</th><th>Design A</th><th>Cable</th><th>Breaker</th><th>Device</th><th>AF/AT</th><th>Icu/Ics</th></tr></thead>
        <tbody>${panelRows}</tbody>
      </table>
      <div class="note">หมายเหตุ: ผลลัพธ์เป็นแบบช่วยออกแบบเบื้องต้น ต้องตรวจตาราง วสท., derating, voltage drop, short-circuit calculation และ selectivity/coordination ก่อนส่งงานจริง</div>
      <div class="signature">
        <div><div class="sign-line">ผู้จัดทำ / Prepared by</div></div>
        <div><div class="sign-line">ผู้ตรวจสอบ / Checked by</div></div>
      </div>
    </body>
  </html>`;
}

function openReport(autoPrint = false) {
  const blob = new Blob([reportHtml()], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const win = window.open(url, "_blank");
  if (autoPrint && win) {
    setTimeout(() => win.print(), 600);
  }
}

function init() {
  optionize($("mainCableMethod"), cableMethods);
  optionize($("cableMethodInput"), cableMethods);
  optionize($("categoryInput"), categories);
  $("mainCableMethod").value = "Cu XLPE conduit";
  $("cableMethodInput").value = "Cu XLPE conduit";
  loadState();
  render();

  ["projectName", "systemVoltage", "mainCableMethod", "mainSpare"].forEach((id) => {
    $(id).addEventListener("input", render);
    $(id).addEventListener("change", render);
  });
  $("addRowBtn").addEventListener("click", addLoadFromForm);
  $("clearRowsBtn").addEventListener("click", () => {
    loads = [];
    render();
  });
  $("saveBtn").addEventListener("click", saveState);
  $("exportBtn").addEventListener("click", exportCsv);
  $("exportPdfBtn").addEventListener("click", exportStandardPdf);
  $("reportBtn").addEventListener("click", () => openReport(false));
  $("printBtn").addEventListener("click", () => window.print());
  $("refreshPreviewBtn")?.addEventListener("click", renderReportPreview);
  $("extractPdfBtn")?.addEventListener("click", extractPdf);
  $("importExtractedBtn")?.addEventListener("click", importExtractedLoads);
  $("exportExtractedBtn")?.addEventListener("click", exportExtractedCsv);
  $("samplePdfBtn")?.addEventListener("click", () => window.open(`sample_load_schedule.pdf?v=${Date.now()}`, "_blank"));
}

init();
