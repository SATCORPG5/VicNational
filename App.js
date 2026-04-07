import { useState, useEffect, useRef, useCallback } from "react";

/* ═══════════════════════════════════════════════════════════════════════════
   50kW DIESEL GENSET — ENGINEERING REFERENCE DASHBOARD
   Aesthetic: Heavy Industrial SCADA / HMI Control Room
   ═══════════════════════════════════════════════════════════════════════════ */

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;700&display=swap');

:root {
  --bg0: #080c10;
  --bg1: #0d1520;
  --bg2: #111e2e;
  --bg3: #162438;
  --border: #1c3250;
  --border2: #244060;
  --amber: #e8a020;
  --amber2: #ffcc60;
  --green: #30e060;
  --green2: #18c040;
  --red: #f03030;
  --red2: #ff6060;
  --blue: #3090e0;
  --blue2: #60b8ff;
  --cyan: #20c8d0;
  --yellow: #e0d020;
  --l1: #e84040;    /* L1 Red */
  --l2: #e0c020;    /* L2 Yellow */
  --l3: #3080e0;    /* L3 Blue */
  --neu: #a0a0a0;   /* Neutral */
  --gnd: #30a050;   /* Ground */
  --text-hi: #d0e8ff;
  --text-md: #6090b0;
  --text-lo: #304860;
  --mono: 'JetBrains Mono', monospace;
  --sans: 'Rajdhani', sans-serif;
}

* { box-sizing: border-box; margin: 0; padding: 0; }

.app {
  font-family: var(--sans);
  background: var(--bg0);
  color: var(--text-hi);
  min-height: 100vh;
  font-weight: 500;
}

/* ── HEADER ── */
.hdr {
  display: flex; align-items: center; justify-content: space-between;
  padding: 10px 20px;
  background: var(--bg1);
  border-bottom: 1px solid var(--border);
  flex-wrap: wrap; gap: 8px;
}
.hdr-left { display: flex; align-items: center; gap: 16px; }
.hdr-tag {
  font-family: var(--mono); font-size: 9px; letter-spacing: 2px;
  padding: 3px 10px; background: var(--amber); color: #000;
  text-transform: uppercase;
}
.hdr h1 {
  font-size: 18px; font-weight: 700; letter-spacing: 3px;
  text-transform: uppercase; color: var(--text-hi);
}
.hdr-sub { font-family: var(--mono); font-size: 10px; color: var(--text-md); letter-spacing: 1px; }
.hdr-status { display: flex; align-items: center; gap: 8px; }
.status-dot { width: 8px; height: 8px; border-radius: 50%; }
.status-dot.run { background: var(--green); box-shadow: 0 0 8px var(--green); animation: blink 2s infinite; }
@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.5} }
.status-label { font-family: var(--mono); font-size: 11px; color: var(--green); letter-spacing: 2px; }
.hdr-time { font-family: var(--mono); font-size: 11px; color: var(--text-md); }

/* ── TABS ── */
.tabs {
  display: flex; border-bottom: 1px solid var(--border);
  background: #0a1018; padding: 0 20px; overflow-x: auto; gap: 2px;
}
.tab {
  padding: 11px 18px; font-size: 11px; font-weight: 700; letter-spacing: 2px;
  text-transform: uppercase; cursor: pointer; color: var(--text-lo);
  border-bottom: 2px solid transparent; transition: all .15s;
  background: none; border-top: none; border-left: none; border-right: none;
  font-family: var(--sans); white-space: nowrap;
}
.tab:hover { color: var(--text-md); }
.tab.active { color: var(--amber); border-bottom-color: var(--amber); }

/* ── LAYOUT ── */
.body { padding: 16px; display: flex; flex-direction: column; gap: 14px; }
.row { display: flex; gap: 14px; flex-wrap: wrap; }
.col { display: flex; flex-direction: column; gap: 14px; }

/* ── PANEL ── */
.panel {
  background: var(--bg2); border: 1px solid var(--border); border-radius: 1px;
  position: relative; overflow: hidden;
}
.panel::before {
  content: attr(data-label);
  position: absolute; top: 0; left: 0;
  font-family: var(--mono); font-size: 8px; letter-spacing: 2px;
  padding: 3px 10px; background: var(--border); color: var(--text-md);
  text-transform: uppercase; z-index: 2;
}
.panel-inner { padding: 28px 14px 14px; }
.panel-inner.no-label { padding: 14px; }
.panel.accent-amber { border-top: 2px solid var(--amber); }
.panel.accent-green { border-top: 2px solid var(--green); }
.panel.accent-red { border-top: 2px solid var(--red); }
.panel.accent-blue { border-top: 2px solid var(--blue); }
.panel.accent-cyan { border-top: 2px solid var(--cyan); }

/* ── GAUGES ── */
.gauges-row { display: flex; gap: 10px; flex-wrap: wrap; justify-content: center; }
.gauge-wrap { display: flex; flex-direction: column; align-items: center; gap: 4px; }
.gauge-label { font-family: var(--mono); font-size: 8px; letter-spacing: 1px; color: var(--text-md); text-transform: uppercase; }
.gauge-value { font-family: var(--mono); font-size: 11px; font-weight: 700; color: var(--amber2); }

/* ── SPEC TABLE ── */
.spec-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.spec-table td { padding: 5px 10px; border-bottom: 1px solid var(--border); }
.spec-table td:first-child { color: var(--text-md); font-family: var(--mono); font-size: 10px; letter-spacing: 1px; width: 45%; }
.spec-table td:last-child { color: var(--amber2); font-weight: 600; text-align: right; }
.spec-table tr:last-child td { border-bottom: none; }

/* ── DATA TILE ── */
.tile-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px,1fr)); gap: 8px; }
.tile {
  background: var(--bg1); border: 1px solid var(--border); padding: 10px 12px;
  border-left: 3px solid var(--border2); cursor: default; transition: border-color .15s;
}
.tile:hover { border-left-color: var(--amber); }
.tile-k { font-family: var(--mono); font-size: 8px; letter-spacing: 1.5px; color: var(--text-md); text-transform: uppercase; margin-bottom: 4px; }
.tile-v { font-size: 18px; font-weight: 700; color: var(--amber2); line-height: 1; }
.tile-u { font-size: 10px; color: var(--text-md); margin-left: 2px; }
.tile-sub { font-size: 11px; color: var(--text-lo); margin-top: 3px; }

/* ── FAULT TREE ── */
.fault-item { display: flex; align-items: center; gap: 10px; padding: 7px 10px; border-bottom: 1px solid var(--border); font-size: 13px; }
.fault-item:last-child { border-bottom: none; }
.fault-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.fault-sev { font-family: var(--mono); font-size: 9px; padding: 2px 7px; border-radius: 1px; font-weight: 700; letter-spacing: 1px; }
.fault-name { flex: 1; }
.fault-thr { font-family: var(--mono); font-size: 10px; color: var(--text-md); text-align: right; }

/* ── MAINT TABLE ── */
.maint-row { display: flex; gap: 0; border-bottom: 1px solid var(--border); align-items: stretch; }
.maint-row:last-child { border-bottom: none; }
.maint-interval { font-family: var(--mono); font-size: 10px; font-weight: 700; color: var(--amber); min-width: 90px; padding: 8px 12px; background: var(--bg1); border-right: 1px solid var(--border); display: flex; align-items: center; }
.maint-items { padding: 8px 12px; font-size: 13px; color: var(--text-hi); line-height: 1.7; }

/* ── FLOW ANIMATION ── */
@keyframes flowRight { from{stroke-dashoffset:20} to{stroke-dashoffset:0} }
@keyframes flowLeft  { from{stroke-dashoffset:0}  to{stroke-dashoffset:20} }
@keyframes flowDown  { from{stroke-dashoffset:20} to{stroke-dashoffset:0} }
.flow-fuel  { stroke: #e8a020; stroke-width: 2.5; fill:none; stroke-dasharray: 6 4; animation: flowRight 0.6s linear infinite; }
.flow-elec  { stroke: #3090e0; stroke-width: 2;   fill:none; stroke-dasharray: 8 4; animation: flowRight 0.4s linear infinite; }
.flow-cool  { stroke: #20c8d0; stroke-width: 2;   fill:none; stroke-dasharray: 6 4; animation: flowRight 0.8s linear infinite; }
.flow-exhaust { stroke: #806040; stroke-width: 2; fill:none; stroke-dasharray: 5 5; animation: flowRight 1s linear infinite; }
.flow-ctrl  { stroke: #e0d020; stroke-width: 1.5; fill:none; stroke-dasharray: 4 4; animation: flowRight 1.2s linear infinite; }
.flow-return { stroke: #e8a020; stroke-width: 1.5; fill:none; stroke-dasharray: 4 6; animation: flowLeft 0.8s linear infinite; opacity:0.5; }

/* ── OSCILLOSCOPE ── */
.scope-wrap { background: #010a04; border: 1px solid #0a2010; border-radius: 1px; }
.scope-grid-line { stroke: #0a2010; stroke-width: 0.5; }
.scope-axis { stroke: #102010; stroke-width: 1; }

/* ── SECTION HEADER ── */
.sec-hdr { font-family: var(--mono); font-size: 9px; letter-spacing: 3px; color: var(--text-md); text-transform: uppercase; margin-bottom: 10px; display: flex; align-items: center; gap: 8px; }
.sec-hdr::after { content:''; flex:1; height:1px; background: var(--border); }

/* ── BADGE ── */
.badge { font-family: var(--mono); font-size: 9px; letter-spacing: 1px; padding: 2px 8px; border-radius: 1px; }
.badge-red { background: #3a0808; color: var(--red2); border: 1px solid var(--red); }
.badge-amber { background: #2a1800; color: var(--amber2); border: 1px solid var(--amber); }
.badge-green { background: #082010; color: var(--green); border: 1px solid var(--green2); }

/* ── PHASOR ── */
.phasor-legend { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 8px; }
.pleg { display: flex; align-items: center; gap: 6px; font-family: var(--mono); font-size: 10px; }
.pleg-line { width: 24px; height: 2px; }
`;

/* ═══════════════════════════════════════════════════
   UTILITY: ARC-GAUGE
   ═══════════════════════════════════════════════════ */
function ArcGauge({ value, min, max, label, unit, size=90, color="#e8a020", warn, danger, decimals=0 }) {
  const pct = Math.max(0, Math.min(1, (value - min) / (max - min)));
  const startAngle = -225; const sweepAngle = 270;
  const angle = startAngle + pct * sweepAngle;
  const r = size / 2 - 10; const cx = size / 2; const cy = size / 2 + 5;
  const toXY = (deg) => {
    const rad = (deg * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  };
  const arcPath = (a1, a2, col) => {
    const s = toXY(a1); const e = toXY(a2);
    const large = Math.abs(a2 - a1) > 180 ? 1 : 0;
    return <path d={`M${s.x},${s.y} A${r},${r} 0 ${large} 1 ${e.x},${e.y}`} stroke={col} strokeWidth="4" fill="none" strokeLinecap="round"/>;
  };
  const needle = toXY(angle);
  let valColor = color;
  if (danger !== undefined && value >= danger) valColor = "#f03030";
  else if (warn !== undefined && value >= warn) valColor = "#e8a020";
  return (
    <div className="gauge-wrap">
      <svg width={size} height={size} style={{overflow:"visible"}}>
        {/* Track */}
        {arcPath(-225, 45, "#162438")}
        {/* Fill */}
        {arcPath(-225, angle, valColor)}
        {/* Needle */}
        <line x1={cx} y1={cy} x2={needle.x} y2={needle.y} stroke={valColor} strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx={cx} cy={cy} r="3" fill={valColor}/>
        {/* Value */}
        <text x={cx} y={cy+18} textAnchor="middle" fill={valColor} fontSize="14" fontFamily="'JetBrains Mono'" fontWeight="700">{value.toFixed(decimals)}</text>
        <text x={cx} y={cy+28} textAnchor="middle" fill="#4a7090" fontSize="8" fontFamily="'JetBrains Mono'">{unit}</text>
        {/* Min/Max ticks */}
        <text x={toXY(-225).x-4} y={toXY(-225).y+10} fill="#304860" fontSize="7" fontFamily="'JetBrains Mono'" textAnchor="middle">{min}</text>
        <text x={toXY(45).x+4}   y={toXY(45).y+10}   fill="#304860" fontSize="7" fontFamily="'JetBrains Mono'" textAnchor="middle">{max}</text>
      </svg>
      <div className="gauge-label">{label}</div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   OSCILLOSCOPE — 3-PHASE SINE WAVES
   ═══════════════════════════════════════════════════ */
function Oscilloscope({ load=0.75 }) {
  const canvasRef = useRef(null);
  const frameRef  = useRef(null);
  const tRef      = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width; const H = canvas.height;
    const mid = H / 2; const amp = (H / 2) * 0.78;
    const cycles = 2.5;

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      // Background
      ctx.fillStyle = "#010a04";
      ctx.fillRect(0, 0, W, H);
      // Grid
      ctx.strokeStyle = "#0a2010"; ctx.lineWidth = 0.5;
      for (let x = 0; x <= W; x += W/10) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
      for (let y = 0; y <= H; y += H/6)  { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
      // Center axis
      ctx.strokeStyle = "#102010"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(0, mid); ctx.lineTo(W, mid); ctx.stroke();

      // Phase colors
      const phases = [
        { color: "#e84040", offset: 0,           label: "L1  277V" },
        { color: "#e0c020", offset: (2*Math.PI)/3, label: "L2  277V" },
        { color: "#3080e0", offset: (4*Math.PI)/3, label: "L3  277V" },
      ];
      const t = tRef.current;

      phases.forEach(ph => {
        ctx.strokeStyle = ph.color; ctx.lineWidth = 1.5;
        ctx.shadowColor = ph.color; ctx.shadowBlur = 3;
        ctx.beginPath();
        for (let px = 0; px < W; px++) {
          const angle = (px / W) * cycles * 2 * Math.PI + ph.offset - t;
          const y = mid - Math.sin(angle) * amp;
          px === 0 ? ctx.moveTo(px, y) : ctx.lineTo(px, y);
        }
        ctx.stroke();
        ctx.shadowBlur = 0;
      });

      // Labels top-right
      phases.forEach((ph, i) => {
        ctx.fillStyle = ph.color; ctx.font = "bold 9px 'JetBrains Mono'";
        ctx.fillText(ph.label, W - 80, 16 + i * 14);
      });

      // Frequency label
      ctx.fillStyle = "#304860"; ctx.font = "9px 'JetBrains Mono'";
      ctx.fillText("60.0 Hz  |  2.5 CYC", 8, H - 6);
      ctx.fillText(`LOAD ${(load*100).toFixed(0)}%`, W - 55, H - 6);

      // Trigger marker
      ctx.strokeStyle = "#e0d020"; ctx.lineWidth = 1; ctx.setLineDash([3,3]);
      ctx.beginPath(); ctx.moveTo(0, mid); ctx.lineTo(10, mid); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = "#e0d020"; ctx.font = "8px 'JetBrains Mono'";
      ctx.fillText("T", 2, mid - 3);

      tRef.current += 0.04;
      frameRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(frameRef.current);
  }, [load]);

  return (
    <div className="scope-wrap">
      <canvas ref={canvasRef} width={580} height={130} style={{width:"100%",height:"auto",display:"block"}}/>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   PHASOR DIAGRAM
   ═══════════════════════════════════════════════════ */
function PhasorDiagram({ pf=0.85, load=0.75 }) {
  const size = 160; const cx = size/2; const cy = size/2; const r = 62;
  const phases = [0, 120, 240];
  const pfAngle = Math.acos(pf) * (180/Math.PI);
  const toXY = (deg, radius=r) => ({
    x: cx + radius * Math.cos((deg-90) * Math.PI/180),
    y: cy + radius * Math.sin((deg-90) * Math.PI/180),
  });
  const colors = ["#e84040","#e0c020","#3080e0"];
  const phaseLabels = ["L1","L2","L3"];
  return (
    <svg width={size} height={size} style={{overflow:"visible"}}>
      {/* Circles */}
      <circle cx={cx} cy={cy} r={r} stroke="#0a2030" strokeWidth="0.5" fill="none"/>
      <circle cx={cx} cy={cy} r={r*0.5} stroke="#0a2030" strokeWidth="0.5" fill="none"/>
      {/* Axes */}
      <line x1={cx-r-8} y1={cy} x2={cx+r+8} y2={cy} stroke="#102030" strokeWidth="0.5"/>
      <line x1={cx} y1={cy-r-8} x2={cx} y2={cy+r+8} stroke="#102030" strokeWidth="0.5"/>
      {/* Phase vectors */}
      {phases.map((ph, i) => {
        const tip = toXY(ph); const tipS = toXY(ph, r*load);
        return (
          <g key={i}>
            <defs><marker id={`arr${i}`} markerWidth="5" markerHeight="4" refX="5" refY="2" orient="auto">
              <polygon points="0 0, 5 2, 0 4" fill={colors[i]}/>
            </marker></defs>
            <line x1={cx} y1={cy} x2={tip.x} y2={tip.y} stroke={colors[i]} strokeWidth="2" markerEnd={`url(#arr${i})`} opacity="0.9"/>
            <text x={tip.x+(tip.x-cx)*0.18} y={tip.y+(tip.y-cy)*0.18+3}
              fill={colors[i]} fontSize="9" fontFamily="'JetBrains Mono'" textAnchor="middle">{phaseLabels[i]}</text>
          </g>
        );
      })}
      {/* Current phasor (lagging) */}
      {(() => {
        const tip = toXY(pfAngle);
        return <>
          <defs><marker id="arrc" markerWidth="5" markerHeight="4" refX="5" refY="2" orient="auto">
            <polygon points="0 0, 5 2, 0 4" fill="#20c8d0"/>
          </marker></defs>
          <line x1={cx} y1={cy} x2={tip.x} y2={tip.y} stroke="#20c8d0" strokeWidth="1.5" strokeDasharray="4,2" markerEnd="url(#arrc)" opacity="0.7"/>
          <text x={tip.x+8} y={tip.y} fill="#20c8d0" fontSize="8" fontFamily="'JetBrains Mono'">I (lag)</text>
        </>;
      })()}
      {/* PF arc */}
      <path d={`M ${cx} ${cy-20} A 20 20 0 0 1 ${cx+20*Math.sin(pfAngle*Math.PI/180)} ${cy-20*Math.cos(pfAngle*Math.PI/180)}`}
        stroke="#e0d020" strokeWidth="1" fill="none"/>
      <text x={cx+12} y={cy-12} fill="#e0d020" fontSize="8" fontFamily="'JetBrains Mono'">φ</text>
      {/* Center */}
      <circle cx={cx} cy={cy} r="3" fill="#3090e0"/>
    </svg>
  );
}

/* ═══════════════════════════════════════════════════
   SYSTEM FLOW SCHEMATIC (animated SVG)
   ═══════════════════════════════════════════════════ */
function SystemFlow({ onSelect, selected }) {
  const comps = {
    tank:   { x:20,  y:155, w:90,  h:70, label:"FUEL TANK",    sub:"80 GAL / 303L",    color:"#1a300a" },
    filt:   { x:150, y:168, w:80,  h:44, label:"FUEL FILTER",  sub:"Change @500hr",     color:"#1a2a0a" },
    eng:    { x:275, y:130, w:120, h:110,label:"DIESEL ENGINE", sub:"4-CYL / 1800RPM",  color:"#1a2a0e" },
    cool:   { x:275, y:35,  w:120, h:55, label:"RADIATOR",     sub:"Coolant Loop",      color:"#0a1a2a" },
    alt:    { x:445, y:130, w:110, h:110,label:"ALTERNATOR",   sub:"3φ 60Hz Brushless", color:"#0a1a2e" },
    avr:    { x:445, y:280, w:110, h:50, label:"AVR",          sub:"±1% Regulation",    color:"#1a0a2e" },
    brk:    { x:605, y:130, w:95,  h:50, label:"160A BREAKER", sub:"3-Pole / Manual",   color:"#2a0a0a" },
    dist:   { x:605, y:210, w:95,  h:75, label:"DIST PANEL",   sub:"Camlocks+Twistlk",  color:"#0a1a2a" },
    load:   { x:755, y:165, w:80,  h:60, label:"LOAD",         sub:"0–50kW / 0.8PF",   color:"#0a1a0a" },
    ctrl:   { x:275, y:280, w:120, h:50, label:"DSE CTRL",     sub:"Deep Sea 7310",     color:"#1a1a0a" },
    bat:    { x:150, y:280, w:80,  h:50, label:"BATTERY",      sub:"12V / 600CCA",      color:"#1a0a00" },
    exh:    { x:430, y:35,  w:80,  h:50, label:"EXHAUST",      sub:"Muffler / Stack",   color:"#1a1010" },
  };
  const flows = [
    { type:"flow-fuel",    d:"M 110 190 L 150 190" },
    { type:"flow-fuel",    d:"M 230 190 L 275 190" },
    { type:"flow-cool",    d:"M 335 130 L 335 90" },
    { type:"flow-cool",    d:"M 335 90 L 335 90" },
    { type:"flow-exhaust", d:"M 395 60 L 430 60" },
    { type:"flow-elec",    d:"M 555 185 L 605 185" },
    { type:"flow-elec",    d:"M 605 180 L 605 210" },
    { type:"flow-elec",    d:"M 700 248 L 755 195" },
    { type:"flow-ctrl",   d:"M 395 305 L 445 305" },
    { type:"flow-ctrl",   d:"M 275 305 L 230 305" },
    { type:"flow-ctrl",   d:"M 150 305 L 150 285" },
    { type:"flow-return",  d:"M 150 285 L 150 230 L 110 230 L 110 190" },
  ];
  return (
    <svg width="100%" viewBox="0 0 870 380" style={{maxWidth:"100%",minHeight:"240px"}}>
      <defs>
        {["fuel","elec","cool","ctrl","exhaust"].map(t => (
          <marker key={t} id={`m-${t}`} markerWidth="6" markerHeight="5" refX="6" refY="2.5" orient="auto">
            <polygon points="0 0, 6 2.5, 0 5" fill={
              t==="fuel"?"#e8a020": t==="elec"?"#3090e0": t==="cool"?"#20c8d0": t==="ctrl"?"#e0d020":"#806040"
            }/>
          </marker>
        ))}
      </defs>
      {/* Animated flows */}
      {flows.map((f, i) => (
        <path key={i} className={f.type} d={f.d} markerEnd={`url(#m-${f.type.replace("flow-","").replace("return","fuel")})`}/>
      ))}
      {/* Components */}
      {Object.entries(comps).map(([id, c]) => (
        <g key={id} style={{cursor:"pointer"}} onClick={() => onSelect(id===selected?null:id)}>
          <rect x={c.x} y={c.y} width={c.w} height={c.h}
            fill={id===selected ? c.color+"ee" : c.color+"99"}
            stroke={id===selected ? "#e8a020" : "#1c3250"}
            strokeWidth={id===selected ? 2 : 1} rx="2"/>
          <text x={c.x+c.w/2} y={c.y+c.h/2-5} fill={id===selected?"#fff":"#c0d8f0"} fontSize="9" fontWeight="700" textAnchor="middle" fontFamily="'JetBrains Mono'" letterSpacing="0.5">{c.label}</text>
          <text x={c.x+c.w/2} y={c.y+c.h/2+8} fill={id===selected?"#e8a020":"#3a6080"} fontSize="7" textAnchor="middle" fontFamily="'JetBrains Mono'">{c.sub}</text>
        </g>
      ))}
      {/* Flow legend */}
      {[["#e8a020","DIESEL FUEL"],["#3090e0","AC POWER"],["#20c8d0","COOLANT"],["#e0d020","CTRL SIGNAL"],["#806040","EXHAUST"]].map(([c,l],i) => (
        <g key={i}>
          <line x1={10+i*140} y1={368} x2={40+i*140} y2={368} stroke={c} strokeWidth="2"/>
          <text x={44+i*140} y={371} fill="#3a6080" fontSize="8" fontFamily="'JetBrains Mono'">{l}</text>
        </g>
      ))}
      <text x="435" y="378" fill="#162438" fontSize="8" textAnchor="middle" fontFamily="'JetBrains Mono'" letterSpacing="2">50kW DIESEL GENSET — SYSTEM FLOW DIAGRAM · CLICK COMPONENT FOR SPECS</text>
    </svg>
  );
}

/* ═══════════════════════════════════════════════════
   COMPONENT DETAIL PANEL
   ═══════════════════════════════════════════════════ */
const COMP_DETAILS = {
  tank:  { title:"FUEL TANK", specs:[["Capacity","80 USG / 303 L"],["Construction","Double-walled steel"],["Fuel type","ASTM #2 Diesel / ULSD"],["Level sender","Electronic float, 4–20 mA"],["Consumption @ 100%","3.7 GPH / 14.0 L/hr"],["Consumption @ 75%","2.8 GPH / 10.6 L/hr"],["Consumption @ 50%","2.0 GPH / 7.6 L/hr"],["Full-load runtime","~21.6 hours"],["Inlet","3/4\" NPT external fill"],["Low-fuel alarm","20% (16 gal)"],["Containment","110% spill containment"]] },
  filt:  { title:"FUEL FILTER / WATER SEP", specs:[["Primary filter","10 micron"],["Secondary filter","2 micron (engine-mounted)"],["Water separator","Integral bowl, 1/4 turn drain"],["Change interval","500 hours or 1 year"],["Thread","3/4-16 UNF"],["Pressure drop max","15 PSI @ rated flow"],["Bypass valve","Opens @ 25 PSI ΔP"],["Vent","Manual air bleed"]] },
  eng:   { title:"DIESEL ENGINE", specs:[["Cylinders","4 inline / water-cooled"],["Displacement","2.4–4.5L (model dependent)"],["Bore × Stroke","~94 × 90 mm (varies)"],["Compression ratio","16:1 to 17.5:1"],["Aspiration","Turbocharged (T4F)"],["Rated speed","1800 RPM"],["Idle speed","1200 RPM"],["Injection","Common rail, 2000 bar"],["Oil capacity","10–14 qt / 9.5–13.2 L"],["Coolant capacity","12–16 qt"],["Tier rating","EPA Tier 4 Final"],["Power (mech)","~72 HP @ 1800 RPM"]] },
  cool:  { title:"COOLING SYSTEM", specs:[["Type","Closed-circuit liquid, radiator"],["Coolant","50/50 EG/Water"],["Thermostat opens","82°C / 180°F"],["Normal temp range","82–95°C"],["High temp alarm","100°C / 212°F"],["Shutdown temp","104°C / 219°F"],["Fan","Belt-driven, pusher"],["Coolant capacity","~3.5 gal / 13.3 L"],["Freeze protection","–37°C / –34°F"],["Pressure cap","15 PSI"],["Block heater","120V / 1500W (standard)"]] },
  alt:   { title:"ALTERNATOR", specs:[["Type","Brushless, self-exciting"],["Phases","3 (120° displacement)"],["Poles","2-pole (requires 1800 RPM)"],["Excitation","Permanent magnet pilot"],["Insulation","Class H (180°C rated)"],["Protection","IP23 minimum"],["Voltage regulation","AVR ±1%"],["THD voltage","<3% at linear load"],["Winding","2/3 pitch (reduces harmonics)"],["Coupling","SAE direct / disc"],["Max temperature rise","125°C class H"],["Efficiency","~93% at rated load"]] },
  avr:   { title:"AUTOMATIC VOLTAGE REGULATOR", specs:[["Regulation accuracy","±1% no-load to full-load"],["Sensing","3-phase average / single"],["Response time","<20 ms to transient"],["Soft-start ramp","Adjustable 0–10 sec"],["Stability","P+I+D control"],["Input voltage range","±20% rated"],["Frequency range","50/60 Hz selectable"],["Protection","Loss of sensing, over-excitation"],["Model (rental typical)","DeepSea DSA109"],["Trimmer pot","V, stability, lag/lead"]] },
  brk:   { title:"MAIN CIRCUIT BREAKER", specs:[["Rating","160A continuous"],["Poles","3-pole"],["Interrupting capacity","22 kAIC @ 480V"],["Trip curve","Thermal-magnetic"],["Coordination","Selective (not cascade)"],["Phase loss protection","Via controller, not breaker"],["Mounting","Set-mounted, door-accessible"],["Cable entry","Bottom, with lug box"],["UL/CSA listing","Yes"],["Manual operation","External handle, padlockable"]] },
  dist:  { title:"DISTRIBUTION PANEL", specs:[["Camlock outputs","L1 / L2 / L3 / N / GND — 400A"],["Twistlock 50A","3× CS6364 (3φ 50A 125/250V)"],["GFCI duplex","2× 20A 120V NEMA 5-20R"],["Bus bars","500 MCM mechanical lugs"],["Neutral lug","Insulated, bondable"],["Ground lug","Bonded to frame"],["Panel rating","480V / 200A / 3φ 4W"],["IP rating","IP44 minimum"],["Cable guards","Lug box covers standard"]] },
  load:  { title:"LOAD — OPERATING PARAMETERS", specs:[["Rated output","50 kW / 62.5 kVA"],["Standby output","52 kW / 65 kVA"],["Voltage (3φ)","480V L-L / 277V L-N"],["Voltage (1φ)","120/240V L-L via tap"],["Current (480V 3φ)","72A / phase"],["Current (208V 3φ)","~139A / phase"],["Power factor","0.8 rated"],["Load step accept","100% single step (NFPA 110)"],["Motor starting","~150% inrush capacity"],["Altitude derate","3% per 1000ft >1000ft"],["Temp derate","1% per 5°C >25°C ambient"]] },
  ctrl:  { title:"DSE 7310 CONTROLLER", specs:[["Display","Backlit LCD 128×64"],["Protections monitored","20+ parameters"],["Start attempts","3 × 10s, 10s rest"],["Voltage sense","±0.5% accuracy"],["Frequency sense","±0.1 Hz accuracy"],["Battery monitoring","9.5–15V range"],["Data logging","99 event history"],["Communication","RS-232 / USB-B"],["Remote I/O","Dry contact start/stop"],["Auto-start delay","Configurable 0–300s"],["Warm-up timer","Configurable 0–300s"]] },
  bat:   { title:"STARTING BATTERY", specs:[["Voltage","12V DC"],["Type","AGM / Flooded lead-acid"],["CCA rating","600 CCA minimum"],["Ah capacity","70–100 Ah"],["Charger","Trickle, AC-powered 120V"],["Low battery alarm","11.5V"],["Low crank cutout","9.5V (protects starter)"],["Charge voltage","13.8V float / 14.4V absorption"],["Cable size","2/0 AWG minimum"],["Polarity check","Before connecting"]] },
  exh:   { title:"EXHAUST SYSTEM", specs:[["Muffler type","Critical/residential silencer"],["Sound reduction","18–25 dB(A) insertion loss"],["Back pressure max","3 in H₂O (critical silencer)"],["Exhaust temp","400–550°C at manifold"],["Pipe size","3–4\" OD (model dependent)"],["Materials","Aluminized steel / SS flex section"],["Emissions (T4F)","PM <0.02 g/kWh, NOx <0.4"],["Condensate trap","Required on vertical discharge"],["Rain cap","Gravity type standard"]] },
};

/* ═══════════════════════════════════════════════════
   FAULT PROTECTION TABLE
   ═══════════════════════════════════════════════════ */
const FAULTS = [
  { sev:"SHUTDOWN", color:"#f03030", bg:"#3a0808", name:"Low Oil Pressure",        threshold:"< 20 PSI",       delay:"Immediate" },
  { sev:"SHUTDOWN", color:"#f03030", bg:"#3a0808", name:"High Coolant Temperature", threshold:"> 104°C / 219°F",delay:"Immediate" },
  { sev:"SHUTDOWN", color:"#f03030", bg:"#3a0808", name:"Overspeed",               threshold:"> 63 Hz (2100 RPM)",delay:"Immediate" },
  { sev:"SHUTDOWN", color:"#f03030", bg:"#3a0808", name:"Overcrank Failure",        threshold:"3 attempts × 10s",delay:"Auto sequence" },
  { sev:"SHUTDOWN", color:"#f03030", bg:"#3a0808", name:"Emergency Stop (E-STOP)", threshold:"Manual button",  delay:"Immediate" },
  { sev:"SHUTDOWN", color:"#f03030", bg:"#3a0808", name:"High Battery Charge",     threshold:"> 15.5V",        delay:"5 seconds" },
  { sev:"ALARM",   color:"#e8a020", bg:"#2a1800", name:"Low Coolant Level",        threshold:"Float switch",   delay:"10 seconds" },
  { sev:"ALARM",   color:"#e8a020", bg:"#2a1800", name:"Low Fuel Level",           threshold:"< 20% (16 gal)", delay:"60 seconds" },
  { sev:"ALARM",   color:"#e8a020", bg:"#2a1800", name:"Low Oil Pressure (warn)",  threshold:"< 25 PSI",       delay:"3 seconds" },
  { sev:"ALARM",   color:"#e8a020", bg:"#2a1800", name:"High Temp Warning",        threshold:"> 100°C / 212°F",delay:"5 seconds" },
  { sev:"ALARM",   color:"#e8a020", bg:"#2a1800", name:"Overload",                 threshold:"> 110% rated",   delay:"10 seconds" },
  { sev:"ALARM",   color:"#e8a020", bg:"#2a1800", name:"Under Voltage",            threshold:"< 90% nominal",  delay:"3 seconds" },
  { sev:"ALARM",   color:"#e8a020", bg:"#2a1800", name:"Over Voltage",             threshold:"> 110% nominal", delay:"3 seconds" },
  { sev:"WARN",    color:"#3090e0", bg:"#0a1828", name:"Battery Low Voltage",      threshold:"< 11.5V DC",     delay:"5 seconds" },
  { sev:"WARN",    color:"#3090e0", bg:"#0a1828", name:"Charge Alternator Fail",   threshold:"< 12.8V running",delay:"10 seconds" },
  { sev:"WARN",    color:"#3090e0", bg:"#0a1828", name:"High Frequency",           threshold:"> 61.5 Hz",      delay:"3 seconds" },
];

/* ═══════════════════════════════════════════════════
   MAINTENANCE SCHEDULE
   ═══════════════════════════════════════════════════ */
const MAINT = [
  { interval:"DAILY / PRE-USE", items:["Check fuel level & fill if < 50%","Check engine oil level (cold, level surface)","Inspect coolant level in overflow tank","Check for fuel, oil, or coolant leaks","Inspect air filter restriction indicator","Check battery terminals for corrosion","Run under 25–30% load minimum for 30 min (wet-stacking prevention)"] },
  { interval:"50 HRS / WEEKLY", items:["Change engine oil & filter (first 50hr break-in oil change)","Inspect drive belts for cracks, tension","Check exhaust system for leaks","Inspect electrical connections, cable lug torque","Test battery voltage (should read 12.6–12.8V resting)","Exercise E-stop button and verify restart","Clean air filter pre-cleaner"] },
  { interval:"250 HRS / QUARTERLY", items:["Oil & filter change (standard interval post break-in)","Replace primary fuel filter","Inspect/clean battery posts & cables","Check coolant concentration (freeze protection, pH)","Inspect radiator fins for blockage (compressed air)","Verify voltage & frequency at no-load and full-load","Clean control panel dust filter","Inspect enclosure door seals"] },
  { interval:"500 HRS / SEMI-ANNUAL", items:["Replace secondary fuel filter","Replace air filter element","Coolant system flush & refill (EG/DI water 50/50)","Inspect and re-torque all electrical lugs (150 in·lb std lug)","Test all shutdowns manually (low oil pressure sim, overspeed)","Inspect alternator brushes (if brushed type — verify output voltage stability)","Load bank test to 100% for 2 hours minimum","Check and adjust valve clearances (engine manual spec)"] },
  { interval:"1,000 HRS / ANNUAL", items:["Complete major service (all filters, fluids, belts)","Replace coolant hoses and clamps","Replace thermostat","Inspect and test ATS/transfer switch","Meggering of alternator windings (min 2 MΩ phase-to-ground)","Fuel injection timing verification","Governor calibration check (1800 RPM under load)","Full load bank test: step load 25→50→75→100% and verify recovery","Update hour meter record and service log"] },
  { interval:"2,000 HRS", items:["Rebuild or replace coolant pump","Replace injectors or return for calibration","Valve job inspection (carbon build-up, seat wear)","Alternator bearing replacement","Starter motor inspection and overhaul if required","Engine compression test (min 450 PSI, <10% cylinder variance)"] },
];

/* ═══════════════════════════════════════════════════
   LOAD CALCULATOR
   ═══════════════════════════════════════════════════ */
function LoadCalc() {
  const [items, setItems] = useState([
    { name:"Tower Lights (4×)", kw:8.0, pf:1.0 },
    { name:"Air Compressor",    kw:7.5, pf:0.85 },
    { name:"Site Trailer HVAC", kw:5.0, pf:0.95 },
    { name:"Power Tools",       kw:3.0, pf:0.9  },
  ]);
  const [newName, setNewName] = useState(""); const [newKW, setNewKW] = useState(""); const [newPF, setNewPF] = useState("0.9");
  const totalKW  = items.reduce((s,i) => s+i.kw, 0);
  const totalKVA = items.reduce((s,i) => s+(i.kw/i.pf), 0);
  const avgPF    = totalKW / totalKVA;
  const pctLoad  = totalKW / 50;
  const fuelUse  = 3.7 * pctLoad;
  const runtime  = 80 / fuelUse;
  const barColor = pctLoad < 0.7 ? "#30e060" : pctLoad < 0.9 ? "#e8a020" : "#f03030";
  const addItem  = () => { if(newName && newKW) { setItems([...items,{name:newName,kw:parseFloat(newKW),pf:parseFloat(newPF)}]); setNewName(""); setNewKW(""); } };
  const rmItem   = (i) => setItems(items.filter((_,j)=>j!==i));
  return (
    <div>
      <div className="sec-hdr">LOAD CALCULATOR — 50kW GENSET</div>
      <div style={{display:"flex",gap:"14px",flexWrap:"wrap"}}>
        <div style={{flex:1,minWidth:"220px"}}>
          {/* Items */}
          {items.map((item,i) => (
            <div key={i} style={{display:"flex",alignItems:"center",gap:"8px",padding:"6px 8px",borderBottom:"1px solid var(--border)",fontSize:"13px"}}>
              <div style={{flex:1}}>{item.name}</div>
              <div style={{fontFamily:"var(--mono)",fontSize:"10px",color:"var(--amber2)",minWidth:"50px",textAlign:"right"}}>{item.kw.toFixed(1)} kW</div>
              <div style={{fontFamily:"var(--mono)",fontSize:"10px",color:"var(--text-md)",minWidth:"40px",textAlign:"right"}}>PF {item.pf}</div>
              <button onClick={()=>rmItem(i)} style={{background:"#2a0808",border:"1px solid var(--red)",color:"var(--red2)",padding:"1px 7px",cursor:"pointer",fontFamily:"var(--mono)",fontSize:"10px"}}>✕</button>
            </div>
          ))}
          {/* Add row */}
          <div style={{display:"flex",gap:"6px",padding:"8px 0",flexWrap:"wrap"}}>
            <input value={newName} onChange={e=>setNewName(e.target.value)} placeholder="Load name" style={{flex:2,minWidth:"90px",background:"var(--bg1)",border:"1px solid var(--border)",color:"var(--text-hi)",padding:"4px 8px",fontFamily:"var(--sans)",fontSize:"13px"}}/>
            <input value={newKW} onChange={e=>setNewKW(e.target.value)} placeholder="kW" style={{width:"60px",background:"var(--bg1)",border:"1px solid var(--border)",color:"var(--amber2)",padding:"4px 8px",fontFamily:"var(--mono)",fontSize:"12px"}}/>
            <input value={newPF} onChange={e=>setNewPF(e.target.value)} placeholder="PF" style={{width:"55px",background:"var(--bg1)",border:"1px solid var(--border)",color:"var(--text-hi)",padding:"4px 8px",fontFamily:"var(--mono)",fontSize:"12px"}}/>
            <button onClick={addItem} style={{background:"var(--bg3)",border:"1px solid var(--amber)",color:"var(--amber2)",padding:"4px 12px",cursor:"pointer",fontFamily:"var(--mono)",fontSize:"10px",letterSpacing:"1px"}}>+ ADD</button>
          </div>
        </div>
        {/* Results */}
        <div style={{width:"200px",display:"flex",flexDirection:"column",gap:"8px"}}>
          <div className="tile"><div className="tile-k">Total Real Power</div><div><span className="tile-v">{totalKW.toFixed(1)}</span><span className="tile-u">kW</span></div></div>
          <div className="tile"><div className="tile-k">Total Apparent</div><div><span className="tile-v">{totalKVA.toFixed(1)}</span><span className="tile-u">kVA</span></div></div>
          <div className="tile"><div className="tile-k">Avg Power Factor</div><div><span className="tile-v" style={{color:avgPF>0.8?"var(--green)":"var(--amber)"}}>{avgPF.toFixed(3)}</span></div></div>
          <div className="tile"><div className="tile-k">% of 50kW Rating</div>
            <div style={{marginTop:"6px"}}>
              <div style={{height:"8px",background:"var(--bg0)",borderRadius:"1px",overflow:"hidden"}}>
                <div style={{width:`${Math.min(100,pctLoad*100)}%`,height:"100%",background:barColor,transition:"width .3s"}}/>
              </div>
              <div style={{fontFamily:"var(--mono)",fontSize:"14px",color:barColor,marginTop:"4px"}}>{(pctLoad*100).toFixed(0)}%{pctLoad>1?" ⚠ OVERLOAD":""}</div>
            </div>
          </div>
          <div className="tile"><div className="tile-k">Fuel Use</div><div><span className="tile-v">{fuelUse.toFixed(1)}</span><span className="tile-u">GPH</span></div></div>
          <div className="tile"><div className="tile-k">Runtime (80 gal)</div><div><span className="tile-v">{runtime.toFixed(1)}</span><span className="tile-u">hrs</span></div></div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   TABS CONTENT
   ═══════════════════════════════════════════════════ */
const TABS = ["System View","Electrical","Protection","Maintenance","Load Calc"];

export default function App() {
  const [tab, setTab] = useState(0);
  const [sel, setSel] = useState(null);
  const [load, setLoad] = useState(0.75);
  const [time, setTime] = useState("");

  // Simulated live gauges
  const [gaugeData, setGaugeData] = useState({ rpm:1800, hz:60.0, volt:480, oil:58, temp:88, kw:38, pf:0.84, bat:12.7 });
  useEffect(() => {
    const iv = setInterval(() => {
      setGaugeData(g => ({
        rpm:  1800 + (Math.random()-0.5)*4,
        hz:   60.0 + (Math.random()-0.5)*0.08,
        volt: 480  + (Math.random()-0.5)*2,
        oil:  58   + (Math.random()-0.5)*2,
        temp: 88   + (Math.random()-0.5)*1,
        kw:   38   + (Math.random()-0.5)*1.5,
        pf:   0.84 + (Math.random()-0.5)*0.01,
        bat:  12.7 + (Math.random()-0.5)*0.05,
      }));
    }, 700);
    const tick = setInterval(() => setTime(new Date().toLocaleTimeString()), 1000);
    return () => { clearInterval(iv); clearInterval(tick); };
  }, []);

  return (
    <div className="app">
      <style>{CSS}</style>

      {/* HEADER */}
      <div className="hdr">
        <div className="hdr-left">
          <div className="hdr-tag">GENSET-001</div>
          <div>
            <div className="hdr" style={{padding:0,background:"none",border:"none"}}>
              <h1>50kW Diesel Generator</h1>
            </div>
            <div className="hdr-sub">CAT / PERKINS / JOHN DEERE SERIES · EPA TIER 4 FINAL · 480V 3φ 60Hz</div>
          </div>
        </div>
        <div className="hdr-status">
          <div className="status-dot run"/>
          <div className="status-label">RUNNING</div>
          <div className="hdr-time" style={{marginLeft:12}}>{time}</div>
        </div>
      </div>

      {/* TABS */}
      <div className="tabs">
        {TABS.map((t,i)=>(
          <button key={i} className={`tab${tab===i?" active":""}`} onClick={()=>setTab(i)}>{t}</button>
        ))}
      </div>

      {/* ── TAB 0: SYSTEM VIEW ── */}
      {tab===0 && (
        <div className="body">
          {/* Live Gauges */}
          <div className="panel accent-amber" data-label="Live Instrumentation · Simulated Running Values">
            <div className="panel-inner">
              <div className="gauges-row">
                <ArcGauge value={gaugeData.rpm} min={0} max={2400} label="ENGINE RPM" unit="RPM" warn={2000} danger={2100} decimals={0}/>
                <ArcGauge value={gaugeData.hz}  min={55} max={65}  label="FREQUENCY"  unit="Hz"  warn={61.5} danger={63} color="#3090e0" decimals={1}/>
                <ArcGauge value={gaugeData.volt} min={400} max={520} label="VOLTAGE L-L" unit="V" warn={510} danger={515} color="#3090e0" decimals={0}/>
                <ArcGauge value={gaugeData.oil} min={0} max={100} label="OIL PRESS" unit="PSI" warn={25} danger={20} color="#30e060" decimals={0}/>
                <ArcGauge value={gaugeData.temp} min={40} max={120} label="COOLANT °C" unit="°C" warn={100} danger={104} color="#20c8d0" decimals={0}/>
                <ArcGauge value={gaugeData.kw}  min={0} max={55}  label="OUTPUT kW"  unit="kW" warn={50} danger={52} color="#e0d020" decimals={1}/>
                <ArcGauge value={gaugeData.pf}  min={0} max={1}   label="PWR FACTOR" unit="PF" color="#c84aff" decimals={2}/>
                <ArcGauge value={gaugeData.bat} min={9} max={16}  label="BATTERY V"  unit="Vdc" warn={11.5} color="#30e060" decimals={1}/>
              </div>
            </div>
          </div>

          {/* System Flow */}
          <div className="panel accent-green" data-label="System Flow · Click Any Component for Specs">
            <div className="panel-inner">
              <SystemFlow onSelect={setSel} selected={sel}/>
            </div>
          </div>

          {/* Detail Panel */}
          {sel && COMP_DETAILS[sel] && (
            <div className="panel accent-amber" data-label={`Component Detail — ${COMP_DETAILS[sel].title}`}>
              <div className="panel-inner">
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                  <div className="sec-hdr" style={{margin:0}}>{COMP_DETAILS[sel].title}</div>
                  <button onClick={()=>setSel(null)} style={{background:"var(--bg1)",border:"1px solid var(--border)",color:"var(--text-md)",padding:"3px 12px",cursor:"pointer",fontFamily:"var(--mono)",fontSize:"10px"}}>✕ CLOSE</button>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))",gap:"0 20px"}}>
                  {COMP_DETAILS[sel].specs.map(([k,v],i)=>(
                    <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:"1px solid var(--border)",gap:"8px"}}>
                      <span style={{fontFamily:"var(--mono)",fontSize:"9px",color:"var(--text-md)",letterSpacing:"0.5px",textTransform:"uppercase"}}>{k}</span>
                      <span style={{fontFamily:"var(--mono)",fontSize:"10px",color:"var(--amber2)",fontWeight:700,textAlign:"right"}}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Key Specs Tiles */}
          <div className="panel" data-label="Key Operating Parameters">
            <div className="panel-inner">
              <div className="tile-grid">
                {[
                  {k:"Standby Rating",     v:"52",   u:"kW",   s:"65 kVA @ 0.8 PF"},
                  {k:"Prime Rating",       v:"50",   u:"kW",   s:"62.5 kVA continuous"},
                  {k:"Engine Speed",       v:"1800", u:"RPM",  s:"2-pole = 60 Hz"},
                  {k:"Voltage 3φ",         v:"480",  u:"V L-L",s:"277V phase-neutral"},
                  {k:"Current @ 480V",     v:"72",   u:"A/ph", s:"3-phase balanced"},
                  {k:"Fuel Consumption",   v:"3.7",  u:"GPH",  s:"@ 100% load"},
                  {k:"Runtime (80 gal)",   v:"21.6", u:"hrs",  s:"@ full load"},
                  {k:"Noise Level",        v:"69",   u:"dBA",  s:"@ 23 ft / 7m"},
                  {k:"Weight w/chassis",   v:"3,920",u:"lbs",  s:"1,778 kg"},
                  {k:"Dimensions (L)",     v:"156",  u:"in",   s:"13 ft overall"},
                  {k:"Compression Ratio",  v:"16:1", u:"",     s:"Auto-ignition"},
                  {k:"Injection Pressure", v:"2000", u:"bar",  s:"Common rail"},
                ].map((t,i)=>(
                  <div className="tile" key={i}>
                    <div className="tile-k">{t.k}</div>
                    <div><span className="tile-v">{t.v}</span><span className="tile-u">{t.u}</span></div>
                    <div className="tile-sub">{t.s}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 1: ELECTRICAL ── */}
      {tab===1 && (
        <div className="body">
          {/* Oscilloscope */}
          <div className="panel accent-blue" data-label="3-Phase Output Waveform · Live Simulation">
            <div className="panel-inner">
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10,flexWrap:"wrap",gap:8}}>
                <div className="phasor-legend">
                  {[["#e84040","L1 — 277V (0°)"],["#e0c020","L2 — 277V (120°)"],["#3080e0","L3 — 277V (240°)"],["#20c8d0","Current I (lag)"]].map(([c,l])=>(
                    <div className="pleg" key={l}><div className="pleg-line" style={{background:c}}/>{l}</div>
                  ))}
                </div>
                <div style={{display:"flex",alignItems:"center",gap:"8px",fontFamily:"var(--mono)",fontSize:"10px",color:"var(--text-md)"}}>
                  Load: <input type="range" min="10" max="100" value={Math.round(load*100)} onChange={e=>setLoad(e.target.value/100)} style={{width:"80px"}}/> {Math.round(load*100)}%
                </div>
              </div>
              <Oscilloscope load={load}/>
            </div>
          </div>

          {/* Phasor + Power Triangle */}
          <div className="row">
            <div className="panel accent-cyan" data-label="Phasor Diagram" style={{flex:"0 0 auto"}}>
              <div className="panel-inner">
                <PhasorDiagram pf={gaugeData.pf} load={load}/>
                <div style={{fontFamily:"var(--mono)",fontSize:"9px",color:"var(--text-md)",marginTop:"8px",textAlign:"center"}}>
                  φ = {(Math.acos(gaugeData.pf)*180/Math.PI).toFixed(1)}°<br/>
                  PF = cos(φ) = {gaugeData.pf.toFixed(3)}<br/>
                  Lagging (inductive load)
                </div>
              </div>
            </div>

            <div className="panel accent-blue" data-label="Power Triangle" style={{flex:1,minWidth:"200px"}}>
              <div className="panel-inner">
                <div className="sec-hdr">POWER RELATIONSHIPS</div>
                {(() => {
                  const kw = gaugeData.kw; const kva = kw/gaugeData.pf; const kvar = Math.sqrt(kva*kva - kw*kw);
                  const W = 220; const H = 130;
                  const scl = W * 0.85 / kva;
                  return (
                    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{maxWidth:"100%"}}>
                      {/* Triangle */}
                      <polygon points={`20,${H-20} ${20+kw*scl},${H-20} ${20+kw*scl},${H-20-kvar*scl}`} fill="#0a1a2e" stroke="#1c3250" strokeWidth="1"/>
                      {/* kW (real) */}
                      <line x1={20} y1={H-20} x2={20+kw*scl} y2={H-20} stroke="#30e060" strokeWidth="2.5"/>
                      <text x={20+kw*scl/2} y={H-8} fill="#30e060" fontSize="9" textAnchor="middle" fontFamily="'JetBrains Mono'" fontWeight="700">P = {kw.toFixed(1)} kW</text>
                      {/* kVAR (reactive) */}
                      <line x1={20+kw*scl} y1={H-20} x2={20+kw*scl} y2={H-20-kvar*scl} stroke="#f03030" strokeWidth="2.5"/>
                      <text x={20+kw*scl+5} y={H-20-kvar*scl/2} fill="#f03030" fontSize="9" fontFamily="'JetBrains Mono'" fontWeight="700">Q = {kvar.toFixed(1)} kVAR</text>
                      {/* kVA (apparent) */}
                      <line x1={20} y1={H-20} x2={20+kw*scl} y2={H-20-kvar*scl} stroke="#3090e0" strokeWidth="2.5"/>
                      <text x={20+kw*scl/2-20} y={H-20-kvar*scl/2-8} fill="#3090e0" fontSize="9" textAnchor="middle" fontFamily="'JetBrains Mono'" fontWeight="700">S = {kva.toFixed(1)} kVA</text>
                      {/* angle */}
                      <text x={50} y={H-24} fill="#e0d020" fontSize="8" fontFamily="'JetBrains Mono'">φ={( Math.acos(gaugeData.pf)*180/Math.PI).toFixed(1)}°</text>
                    </svg>
                  );
                })()}
                <table className="spec-table" style={{marginTop:"8px"}}>
                  <tbody>
                    <tr><td>Apparent Power S</td><td>{(gaugeData.kw/gaugeData.pf).toFixed(1)} kVA</td></tr>
                    <tr><td>Real Power P</td><td>{gaugeData.kw.toFixed(1)} kW</td></tr>
                    <tr><td>Reactive Power Q</td><td>{(Math.sqrt(Math.pow(gaugeData.kw/gaugeData.pf,2)-Math.pow(gaugeData.kw,2))).toFixed(1)} kVAR</td></tr>
                    <tr><td>Efficiency</td><td>~93%</td></tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="panel accent-amber" data-label="Voltage / Current Reference" style={{flex:1,minWidth:"200px"}}>
              <div className="panel-inner">
                <div className="sec-hdr">OUTPUT CONFIGURATIONS</div>
                <table className="spec-table">
                  <tbody>
                    {[
                      ["3φ 4W L-L","480V / 72A"],["3φ 4W L-N","277V / 72A"],
                      ["3φ 4W L-L","208V / 139A"],["3φ 4W L-N","120V / 139A"],
                      ["1φ L-L","240V / 208A"],["1φ L-N","120V / 416A"],
                      ["THD (linear load)","< 3%"],["THD (non-linear)","< 8%"],
                      ["Voltage regulation","±1% no-load→full"],
                      ["Load step (100%)","< 15% V dip, 3s recover"],
                      ["Short circuit","22 kAIC @ 480V"],
                      ["Phase rotation","A-B-C (standard US)"],
                      ["Insulation class","Class H (180°C)"],
                      ["Voltage waveform","Sinusoidal, 2/3 pitch"],
                    ].map(([k,v],i)=>(
                      <tr key={i}><td>{k}</td><td>{v}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* IEC Wiring Color Reference */}
          <div className="panel" data-label="Conductor Color Reference — IEC 60446 / NEC">
            <div className="panel-inner no-label" style={{paddingTop:28}}>
              <div className="sec-hdr">PHASE IDENTIFICATION</div>
              <div className="row" style={{gap:"8px",flexWrap:"wrap"}}>
                {[
                  {label:"L1 (Phase A)",  nec:"Black",  iec:"Brown",  color:"#c84040"},
                  {label:"L2 (Phase B)",  nec:"Red",    iec:"Black",  color:"#909090"},
                  {label:"L3 (Phase C)",  nec:"Blue",   iec:"Grey",   color:"#3060c0"},
                  {label:"Neutral (N)",   nec:"White",  iec:"Blue",   color:"#505080"},
                  {label:"Ground (PE)",   nec:"Green",  iec:"Grn/Yel",color:"#30a050"},
                  {label:"Camlock L1",    nec:"Red cam",iec:"—",       color:"#c84040"},
                  {label:"Camlock L2",    nec:"Blk cam",iec:"—",       color:"#505050"},
                  {label:"Camlock L3",    nec:"Blu cam",iec:"—",       color:"#3060c0"},
                  {label:"Camlock N",     nec:"Wht cam",iec:"—",       color:"#808080"},
                  {label:"Camlock GND",   nec:"Grn cam",iec:"—",       color:"#30a050"},
                ].map(t=>(
                  <div key={t.label} style={{background:"var(--bg1)",border:`1px solid var(--border)`,borderLeft:`4px solid ${t.color}`,padding:"8px 12px",minWidth:"140px",flex:"1"}}>
                    <div style={{fontFamily:"var(--mono)",fontSize:"9px",color:"var(--text-md)",marginBottom:"3px"}}>{t.label}</div>
                    <div style={{fontFamily:"var(--mono)",fontSize:"10px",color:"var(--text-hi)"}}>NEC: {t.nec}</div>
                    <div style={{fontFamily:"var(--mono)",fontSize:"10px",color:"var(--text-md)"}}>IEC: {t.iec}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: PROTECTION ── */}
      {tab===2 && (
        <div className="body">
          <div className="row">
            <div className="panel accent-red" data-label="Protection & Fault Relay Schedule" style={{flex:2,minWidth:"300px"}}>
              <div className="panel-inner">
                {FAULTS.map((f,i)=>(
                  <div className="fault-item" key={i}>
                    <div className="fault-dot" style={{background:f.color,boxShadow:`0 0 5px ${f.color}44`}}/>
                    <span className="fault-sev badge" style={{background:f.bg,color:f.color,border:`1px solid ${f.color}`}}>{f.sev}</span>
                    <span className="fault-name">{f.name}</span>
                    <span className="fault-thr">{f.threshold}</span>
                    <span style={{fontFamily:"var(--mono)",fontSize:"9px",color:"var(--text-lo)",minWidth:"90px",textAlign:"right"}}>{f.delay}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="col" style={{flex:1,minWidth:"200px"}}>
              <div className="panel accent-amber" data-label="Start Sequence Logic">
                <div className="panel-inner">
                  {[
                    {n:"1", label:"Start signal received",   sub:"Remote or panel"},
                    {n:"2", label:"Pre-crank checks",        sub:"Battery V > 11.5V, no active faults"},
                    {n:"3", label:"Fuel solenoid opens",     sub:"12V energized"},
                    {n:"4", label:"Cranking begins",         sub:"Starter motor, max 10s"},
                    {n:"5", label:"Engine fires (oil rise)", sub:"Oil pressure > 20 PSI within 10s"},
                    {n:"6", label:"Warm-up timer",           sub:"Configurable 0–300s"},
                    {n:"7", label:"Hz & V confirmed stable", sub:"60.0 Hz ±0.5, 480V ±5%"},
                    {n:"8", label:"Breaker closes → LOAD",   sub:"Transfer or manual close"},
                  ].map((s,i)=>(
                    <div key={i} style={{display:"flex",gap:"10px",alignItems:"flex-start",padding:"6px 0",borderBottom:"1px solid var(--border)"}}>
                      <div style={{background:"var(--amber)",color:"#000",fontFamily:"var(--mono)",fontSize:"9px",fontWeight:"700",minWidth:"18px",height:"18px",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:"1px"}}>{s.n}</div>
                      <div>
                        <div style={{fontSize:"13px"}}>{s.label}</div>
                        <div style={{fontFamily:"var(--mono)",fontSize:"9px",color:"var(--text-md)"}}>{s.sub}</div>
                      </div>
                    </div>
                  ))}
                  <div style={{fontFamily:"var(--mono)",fontSize:"9px",color:"var(--text-lo)",marginTop:"8px"}}>OVERCRANK: 3 attempts × 10s with 10s rest. After 3 failures → LOCK OUT alarm.</div>
                </div>
              </div>

              <div className="panel accent-blue" data-label="Operating Limits Reference">
                <div className="panel-inner">
                  <table className="spec-table">
                    <tbody>
                      {[
                        ["Oil pressure normal","45–75 PSI"],["Oil pressure low warn","25 PSI"],["Oil pressure shutdown","20 PSI"],
                        ["Coolant temp normal","82–95°C"],["Coolant temp alarm","100°C"],["Coolant temp shutdown","104°C"],
                        ["Frequency normal","59.5–60.5 Hz"],["Overspeed shutdown","63 Hz (2100 RPM)"],
                        ["Voltage normal","456–504V (±5%)"],["Over-voltage alarm","528V (+10%)"],
                        ["Battery normal","12.4–13.0V"],["Low battery alarm","11.5V"],["Low crank cutout","9.5V"],
                        ["Min ambient","–20°C (w/ block heater)"],["Max ambient","50°C (derated)"],
                        ["Max altitude","3,300m (derated >1000m)"],
                      ].map(([k,v],i)=>(
                        <tr key={i}><td>{k}</td><td>{v}</td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 3: MAINTENANCE ── */}
      {tab===3 && (
        <div className="body">
          <div className="row">
            <div className="panel accent-green" data-label="Preventive Maintenance Schedule" style={{flex:2}}>
              <div className="panel-inner">
                {MAINT.map((m,i)=>(
                  <div className="maint-row" key={i}>
                    <div className="maint-interval">{m.interval}</div>
                    <div className="maint-items">
                      {m.items.map((item,j)=>(
                        <div key={j} style={{display:"flex",gap:"8px",alignItems:"flex-start"}}>
                          <span style={{color:"var(--green2)",fontFamily:"var(--mono)",fontSize:"10px",marginTop:"2px",flexShrink:0}}>▸</span>
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="col" style={{flex:1,minWidth:"220px"}}>
              <div className="panel accent-amber" data-label="Fluid Specifications">
                <div className="panel-inner">
                  <table className="spec-table">
                    <tbody>
                      {[
                        ["Engine oil grade","15W-40 API CK-4"],["Oil capacity","10–14 qt"],["Extended drain","250 hr max"],
                        ["Coolant type","EG 50/50 pre-mix"],["Coolant capacity","~3.5 gal"],["Coolant change","1000 hr or 1 yr"],
                        ["Coolant pH","7.5–9.0"],["Freeze protect","-37°C / -34°F"],
                        ["Diesel fuel","ASTM D975 #2"],["ULSD","15ppm max S required"],["Biodiesel","B5 max (T4F)"],
                        ["Battery electrolyte","Distilled H₂O only"],
                      ].map(([k,v],i)=>( <tr key={i}><td>{k}</td><td>{v}</td></tr> ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="panel accent-red" data-label="Common Failure Modes & Field Diagnosis">
                <div className="panel-inner">
                  {[
                    {fault:"Won't crank", cause:"Battery < 12.4V, loose cable, blown fuse", fix:"Load test battery, check terminal torque"},
                    {fault:"Cranks, won't start", cause:"Fuel solenoid, air in fuel, fuel filter clogged", fix:"Prime fuel system, check solenoid 12V signal"},
                    {fault:"Low voltage",  cause:"AVR trim, loose excitation wiring, overload", fix:"Adjust AVR trim pot, check load vs rating"},
                    {fault:"High fuel use", cause:"Load > 80%, injector wear, air filter blocked", fix:"Load test, service air filter"},
                    {fault:"Wet stacking", cause:"Running < 30% load chronically", fix:"Load bank at 75%+ for 2 hrs to burn off carbon"},
                    {fault:"Overheating",  cause:"Low coolant, blocked radiator, failed thermostat", fix:"Check coolant, clear fins, test thermostat"},
                  ].map((f,i)=>(
                    <div key={i} style={{padding:"7px 0",borderBottom:"1px solid var(--border)"}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                        <span style={{color:"var(--red2)",fontFamily:"var(--mono)",fontSize:"10px",fontWeight:"700"}}>{f.fault}</span>
                      </div>
                      <div style={{fontSize:"12px",color:"var(--text-md)",marginTop:"2px"}}><b style={{color:"#6080a0"}}>Cause:</b> {f.cause}</div>
                      <div style={{fontSize:"12px",color:"var(--green)",marginTop:"1px"}}><b>Fix:</b> {f.fix}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 4: LOAD CALC ── */}
      {tab===4 && (
        <div className="body">
          <div className="panel accent-amber" data-label="Load Sizing Calculator — 50kW Genset">
            <div className="panel-inner"><LoadCalc/></div>
          </div>
          <div className="row">
            <div className="panel accent-blue" data-label="Derating Factors" style={{flex:1,minWidth:"200px"}}>
              <div className="panel-inner">
                <table className="spec-table">
                  <tbody>
                    {[
                      ["Altitude (>1000 ft)","−3% per 1,000 ft"],
                      ["1,000 ft","−3% → 48.5 kW"],["2,000 ft","−6% → 47.0 kW"],
                      ["3,000 ft","−9% → 45.5 kW"],["5,000 ft","−15% → 42.5 kW"],
                      ["",""],
                      ["Temp (>25°C amb)","−1% per 5°C"],
                      ["30°C ambient","−1% → 49.5 kW"],["40°C ambient","−3% → 48.5 kW"],
                      ["50°C ambient","−5% → 47.5 kW"],
                      ["",""],
                      ["Non-linear load (VFDs)","Add 20–25% margin"],
                      ["Motor starting (DOL)","Add LRC × 0.25 to sizing"],
                      ["Continuous duty rule","Load at 80% max continuously"],
                    ].map(([k,v],i)=>( <tr key={i}><td>{k}</td><td>{v}</td></tr> ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="panel accent-green" data-label="Noise Levels vs Distance" style={{flex:1,minWidth:"200px"}}>
              <div className="panel-inner">
                <div className="sec-hdr">SOUND PRESSURE — ATTENUATED ENCLOSURE</div>
                {[
                  {dist:"7m / 23ft",dba:69,label:"Rated test distance"},
                  {dist:"10m / 33ft",dba:65,label:"Typical setback"},
                  {dist:"15m / 49ft",dba:61,label:"Loud conversation"},
                  {dist:"25m / 82ft",dba:56,label:"Normal conversation"},
                  {dist:"50m / 164ft",dba:50,label:"Quiet office"},
                  {dist:"100m / 328ft",dba:44,label:"Library"},
                ].map(d=>(
                  <div key={d.dist} style={{display:"flex",alignItems:"center",gap:"10px",padding:"5px 0",borderBottom:"1px solid var(--border)"}}>
                    <div style={{minWidth:"110px",fontFamily:"var(--mono)",fontSize:"9px",color:"var(--text-md)"}}>{d.dist}</div>
                    <div style={{flex:1,height:"8px",background:"var(--bg0)",borderRadius:"1px",overflow:"hidden"}}>
                      <div style={{width:`${(d.dba/80)*100}%`,height:"100%",background:`hsl(${120-d.dba*1.2}deg,70%,45%)`}}/>
                    </div>
                    <div style={{fontFamily:"var(--mono)",fontSize:"10px",color:"var(--amber2)",minWidth:"50px",textAlign:"right",fontWeight:"700"}}>{d.dba} dBA</div>
                    <div style={{fontFamily:"var(--mono)",fontSize:"9px",color:"var(--text-lo)",minWidth:"120px"}}>{d.label}</div>
                  </div>
                ))}
                <div style={{fontFamily:"var(--mono)",fontSize:"9px",color:"var(--text-lo)",marginTop:"8px"}}>
                  Rule: +6 dB per halved distance. Sound attenuated enclosure reduces bare-engine level by 18–25 dB(A).
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

