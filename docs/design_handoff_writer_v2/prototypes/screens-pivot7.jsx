// Pivot v3 — Граф связей персонажей (сигнатурная фича, край выразительный).
// DESIGN-writer.md §4: Obsidian-стиль на нашей ДНК — узлы со свечным glow «дышат»,
// связи амбер/роза-хэйрлайны, подписи Bodoni-курсивом, тёмный баклажан-холст.
// ЖИВОЙ: клик по персонажу подсвечивает его связи, гасит остальные.
// Использует pvT, PV_FONT, PvMono.

// узлы: единые данные, позиции для desktop (940×600) и mobile (320×540)
const PV_NODES = [
  { id:'hermione', name:'Гермиона', role:'главная', grad:'mix-poster-grad-4', r:44, facts:19,
    d:{ x:360, y:300 }, m:{ x:120, y:250 } },
  { id:'draco', name:'Драко', role:'второй главный', grad:'mix-poster-grad-1', r:44, facts:14,
    d:{ x:610, y:290 }, m:{ x:215, y:210 } },
  { id:'slughorn', name:'Слизнорт', role:'наставник', grad:'mix-poster-grad-3', r:30, facts:6,
    d:{ x:500, y:110 }, m:{ x:156, y:76 } },
  { id:'lavender', name:'Лаванда', role:'знает больше', grad:'mix-poster-grad-5', r:30, facts:4,
    d:{ x:250, y:480 }, m:{ x:80, y:430 } },
  { id:'ron', name:'Рон', role:'бывшее', grad:'mix-poster-grad-2', r:28, facts:8,
    d:{ x:120, y:200 }, m:{ x:50, y:150 } },
  { id:'harry', name:'Гарри', role:'друг', grad:'mix-poster-grad-3', r:30, facts:9,
    d:{ x:520, y:500 }, m:{ x:200, y:440 } },
  { id:'pansy', name:'Панси', role:'долг', grad:'mix-poster-grad-2', r:26, facts:5,
    d:{ x:820, y:180 }, m:{ x:286, y:142 } },
];

// связи: type задаёт цвет (rose = чувство/тайна, amber = сюжет/связь)
const PV_LINKS = [
  { a:'hermione', b:'draco', label:'напряжение', type:'rose', w: 2.4 },
  { a:'hermione', b:'ron', label:'бывшее', type:'rose', dim: true },
  { a:'hermione', b:'harry', label:'дружба', type:'amber' },
  { a:'hermione', b:'slughorn', label:'протеже', type:'amber' },
  { a:'draco', b:'slughorn', label:'наставник', type:'amber' },
  { a:'draco', b:'pansy', label:'долг помолвки', type:'amber' },
  { a:'draco', b:'harry', label:'вражда', type:'rose', dim: true },
  { a:'lavender', b:'hermione', label:'общая тайна', type:'amber' },
  { a:'lavender', b:'draco', label:'видела письмо', type:'rose' },
];

function pvNode(id) { return PV_NODES.find(n => n.id === id); }

function PvGraphCore({ T, W, H, posKey: pos, isMobile }) {
  const { useState } = React;
  const [sel, setSel] = useState(null);
  const p = (n) => n[pos];

  // множество связанных с выбранным
  const connected = new Set();
  if (sel) {
    connected.add(sel);
    PV_LINKS.forEach(l => {
      if (l.a === sel) connected.add(l.b);
      if (l.b === sel) connected.add(l.a);
    });
  }
  const linkActive = (l) => !sel || l.a === sel || l.b === sel;
  const nodeActive = (n) => !sel || connected.has(n.id);

  const col = (t, active) => {
    const base = t === 'rose' ? T.rose : T.amber;
    return active ? base : (T.light ? 'rgba(36,24,48,.14)' : 'rgba(245,239,224,.09)');
  };

  return (
    <div onClick={() => setSel(null)} style={{ position:'relative', width: W, height: H, margin:'0 auto' }}>
      <style>{`@keyframes pvBreathe{0%,100%{opacity:.35;transform:scale(.82)}50%{opacity:.9;transform:scale(1.12)}}
        @keyframes pvBreatheSlow{0%,100%{opacity:.28;transform:scale(.9)}50%{opacity:.7;transform:scale(1.08)}}`}</style>

      {/* SVG связи */}
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H}
        style={{ position:'absolute', inset:0, overflow:'visible' }}>
        {PV_LINKS.map((l, i) => {
          const A = p(pvNode(l.a)), B = p(pvNode(l.b));
          const active = linkActive(l);
          const mx = (A.x + B.x) / 2, my = (A.y + B.y) / 2;
          return (
            <g key={i} style={{ transition:'opacity .4s', opacity: active ? 1 : 0.25 }}>
              <line x1={A.x} y1={A.y} x2={B.x} y2={B.y}
                stroke={col(l.type, active)}
                strokeWidth={active ? (l.w || 1.5) : 1}
                strokeDasharray={l.dim ? '4 5' : 'none'}
                strokeLinecap="round"/>
              {(sel && active) && (
                <text x={mx} y={my - 5} textAnchor="middle"
                  style={{ fontFamily:'var(--mix-display)', fontStyle:'italic',
                    fontSize: isMobile ? 10 : 12, fill: l.type === 'rose' ? T.rose : T.amber,
                    paintOrder:'stroke', stroke: T.bg, strokeWidth: 3 }}>{l.label}</text>
              )}
            </g>
          );
        })}
      </svg>

      {/* узлы */}
      {PV_NODES.map(n => {
        const c = p(n);
        const active = nodeActive(n);
        const isSel = sel === n.id;
        const R = n.r * (isMobile ? 0.82 : 1);
        return (
          <div key={n.id} onClick={(e) => { e.stopPropagation(); setSel(isSel ? null : n.id); }}
            style={{ position:'absolute', left: c.x, top: c.y, transform:'translate(-50%,-50%)',
              cursor:'pointer', textAlign:'center', zIndex: isSel ? 4 : 2,
              transition:'opacity .4s', opacity: active ? 1 : 0.3 }}>
            {/* дышащий glow */}
            <div style={{ position:'absolute', left:'50%', top: R + 2, transform:'translate(-50%,-50%)',
              width: R * 2.9, height: R * 2.9, borderRadius:'50%', pointerEvents:'none',
              background:`radial-gradient(circle, ${T.amber}${isSel ? '66' : '33'}, transparent 68%)`,
              animation:`${R > 34 ? 'pvBreathe' : 'pvBreatheSlow'} ${3 + n.facts % 3}s ease-in-out infinite`,
              mixBlendMode:'screen' }}/>
            {/* портрет-кружок */}
            <div className={n.grad} style={{ width: R * 2, height: R * 2, borderRadius:'50%',
              border:`${isSel ? 2 : 1}px solid ${isSel ? T.amber : T.borderStrong}`,
              position:'relative', overflow:'hidden', margin:'0 auto',
              boxShadow: isSel ? `0 0 0 4px ${T.amber}22, 0 8px 30px rgba(0,0,0,.5)` : `0 6px 20px rgba(0,0,0,.4)` }}>
              <div className="mix-grain"/>
              <div style={{ position:'absolute', inset:0,
                background:'radial-gradient(circle at 50% 35%, transparent, rgba(0,0,0,.35))' }}/>
            </div>
            {/* подпись */}
            <div style={{ marginTop: 6 }}>
              <div style={{ fontFamily: PV_FONT.display, fontStyle:'italic',
                fontSize: R > 34 ? (isMobile ? 14 : 16) : (isMobile ? 11 : 13),
                color: T.ink, lineHeight: 1 }}>{n.name}</div>
              <PvMono c={isSel ? T.amber : T.inkFaint} size={isMobile ? 6.5 : 7.5}
                style={{ marginTop: 2 }}>{n.role}</PvMono>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── DESKTOP ───────────────────────────────────────────────────
function PvGraphDesktop() {
  const T = pvT(false);
  return (
    <div className="mix" style={{ width:'100%', height:'100%', background: T.bg,
      position:'relative', overflow:'hidden', display:'flex', flexDirection:'column' }}>
      <div style={{ position:'absolute', left:'50%', top:'40%', width: 520, height: 520,
        transform:'translate(-50%,-50%)', background:`radial-gradient(circle, ${T.glow}, transparent 62%)`,
        pointerEvents:'none' }}/>

      {/* top bar */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
        padding:'12px 20px', borderBottom:`1px solid ${T.border}`, zIndex: 6, position:'relative' }}>
        <div style={{ display:'flex', alignItems:'center', gap: 12 }}>
          <div style={{ display:'flex', alignItems:'baseline', gap: 3 }}>
            <span style={{ fontFamily: PV_FONT.display, fontStyle:'italic', fontSize: 18, color: T.ink }}>head</span>
            <span className="mix-chrome" style={{ fontFamily: PV_FONT.display, fontSize: 18, fontWeight: 600 }}>canon</span>
          </div>
          <span style={{ color: T.inkFaint }}>/</span>
          <span style={{ fontFamily: PV_FONT.display, fontStyle:'italic', fontSize: 14, color: T.ink }}>Зимний свет в подземельях</span>
          <span style={{ color: T.inkFaint }}>/</span>
          <PvMono c={T.amber}>❋ граф связей</PvMono>
        </div>
        <div style={{ display:'flex', gap: 8, alignItems:'center' }}>
          <span style={{ padding:'5px 12px', borderRadius: 999, fontFamily: PV_FONT.ui, fontSize: 11.5,
            border:`1px solid ${T.amber}55`, color: T.amber }}>❋ граф</span>
          <span style={{ padding:'5px 12px', borderRadius: 999, fontFamily: PV_FONT.ui, fontSize: 11.5,
            color: T.inkDim }}>▤ карточки</span>
          <span style={{ padding:'4px 12px', borderRadius: 999, border:`1px solid ${T.amber}66`, color: T.amber,
            fontFamily: PV_FONT.display, fontStyle:'italic', fontSize: 12.5, marginLeft: 6 }}>+ связь</span>
        </div>
      </div>

      {/* graph */}
      <div style={{ flex:1, position:'relative', zIndex: 3, display:'flex', alignItems:'center', overflow:'hidden' }}>
        <PvGraphCore T={T} W={940} H={600} posKey="d" pos="d" isMobile={false}/>
      </div>

      {/* подсказка + легенда */}
      <div style={{ position:'relative', zIndex: 6, padding:'10px 22px', borderTop:`1px solid ${T.border}`,
        display:'flex', justifyContent:'space-between', alignItems:'center',
        background:'rgba(0,0,0,.2)' }}>
        <PvMono c={T.inkFaint} size={8.5}>клик по персонажу — только его связи · клик по холсту — сбросить</PvMono>
        <div style={{ display:'flex', gap: 18 }}>
          <span style={{ display:'flex', alignItems:'center', gap: 6 }}>
            <span style={{ width: 16, height: 2, background: T.rose, borderRadius: 2 }}/>
            <PvMono c={T.inkDim} size={8}>чувство · тайна</PvMono>
          </span>
          <span style={{ display:'flex', alignItems:'center', gap: 6 }}>
            <span style={{ width: 16, height: 2, background: T.amber, borderRadius: 2 }}/>
            <PvMono c={T.inkDim} size={8}>сюжетная связь</PvMono>
          </span>
        </div>
      </div>
    </div>
  );
}

// ── MOBILE ────────────────────────────────────────────────────
function PvGraphMobile() {
  const T = pvT(false);
  return (
    <div className="mix" style={{ width:'100%', height:'100%', background: T.bg,
      position:'relative', overflow:'hidden', display:'flex', flexDirection:'column' }}>
      <div style={{ position:'absolute', left:'50%', top:'42%', width: 320, height: 320,
        transform:'translate(-50%,-50%)', background:`radial-gradient(circle, ${T.glow}, transparent 62%)`,
        pointerEvents:'none' }}/>
      <div style={{ display:'flex', justifyContent:'space-between', padding:'10px 18px 4px',
        fontFamily: PV_FONT.mono, fontSize: 11, color: T.ink, opacity:.8, position:'relative', zIndex: 5 }}>
        <span>1:42</span><span>•••○ 5G 92%</span>
      </div>

      {/* header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
        padding:'6px 16px 12px', borderBottom:`1px solid ${T.border}`, position:'relative', zIndex: 5 }}>
        <span style={{ color: T.inkDim, fontSize: 16 }}>←</span>
        <div style={{ textAlign:'center' }}>
          <PvMono c={T.amber} size={8.5}>❋ граф связей</PvMono>
          <div style={{ fontFamily: PV_FONT.display, fontStyle:'italic', fontSize: 12.5, color: T.ink, marginTop: 1 }}>
            Зимний свет…
          </div>
        </div>
        <span style={{ color: T.amber, fontSize: 17 }}>+</span>
      </div>

      {/* graph */}
      <div style={{ flex:1, position:'relative', zIndex: 3, overflow:'hidden',
        display:'flex', alignItems:'center', justifyContent:'center' }}>
        <PvGraphCore T={T} W={320} H={540} posKey="m" pos="m" isMobile={true}/>
      </div>

      {/* легенда */}
      <div style={{ position:'relative', zIndex: 5, padding:'10px 18px 14px', borderTop:`1px solid ${T.border}`,
        background:'rgba(0,0,0,.2)' }}>
        <PvMono c={T.inkFaint} size={7.5} style={{ display:'block', textAlign:'center', marginBottom: 8 }}>
          коснись персонажа — его связи
        </PvMono>
        <div style={{ display:'flex', gap: 18, justifyContent:'center' }}>
          <span style={{ display:'flex', alignItems:'center', gap: 6 }}>
            <span style={{ width: 14, height: 2, background: T.rose, borderRadius: 2 }}/>
            <PvMono c={T.inkDim} size={7.5}>чувство</PvMono>
          </span>
          <span style={{ display:'flex', alignItems:'center', gap: 6 }}>
            <span style={{ width: 14, height: 2, background: T.amber, borderRadius: 2 }}/>
            <PvMono c={T.inkDim} size={7.5}>сюжет</PvMono>
          </span>
        </div>
      </div>
    </div>
  );
}

window.PvGraphDesktop = PvGraphDesktop;
window.PvGraphMobile = PvGraphMobile;
