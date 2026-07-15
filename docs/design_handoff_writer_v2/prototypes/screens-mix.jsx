// Editorial Y2K — direction 4 (mix of 1 + 2)
// Vibe: Cozy palette (aubergine + amber + cream) + Y2K energy (marquee, broken
// grid, sticker bursts, holographic chrome accents, ironic Times-italic blurbs).
// No hot pink as primary. Sophisticated base; playful punctuation.

const MIX = {
  bg: '#160B22',
  bg2: '#1F1230',
  surface: '#241638',
  ink: '#F5EFE0',
  inkDim: '#A89BB5',
  inkFaint: '#6E6478',
  amber: '#E5A95A',
  rose: '#D67890',
  rust: '#B85D3D',
  chrome1: '#C9D4E8',
  chrome2: '#E5A95A',
  chrome3: '#D67890',
  border: 'rgba(245,239,224,.10)',
  borderStrong: 'rgba(245,239,224,.20)',
  display: 'var(--mix-display)',
  displayItalic: 'var(--mix-display-italic)',
  body: 'var(--mix-body)',
  ui: 'var(--mix-ui)',
  mono: 'var(--mix-mono)',
  ironic: 'var(--mix-ironic)',
};

if (typeof document !== 'undefined' && !document.getElementById('mix-styles')) {
  const s = document.createElement('style');
  s.id = 'mix-styles';
  s.textContent = `
    /* Default typeset — editorial */
    .mix {
      --mix-display: "Cormorant Garamond", "Fraunces", serif;
      --mix-display-italic: "Cormorant Garamond", "Instrument Serif", serif;
      --mix-body: "Lora", Georgia, serif;
      --mix-ui: "Inter Tight", "Inter", system-ui, sans-serif;
      --mix-mono: "JetBrains Mono", monospace;
      --mix-ironic: "Lora", Georgia, serif;
      --mix-display-weight: 500;
      --mix-display-italic-weight: 500;
    }
    .mix.ts-literary, body.ts-literary .mix {
      --mix-display: "Bodoni Moda", "DM Serif Display", serif;
      --mix-display-italic: "Bodoni Moda", "DM Serif Display", serif;
      --mix-body: "EB Garamond", Georgia, serif;
      --mix-ui: "DM Sans", system-ui, sans-serif;
      --mix-ironic: "EB Garamond", Georgia, serif;
      --mix-display-weight: 500;
      --mix-display-italic-weight: 500;
    }
    .mix.ts-modern, body.ts-modern .mix {
      --mix-display: "Bricolage Grotesque", system-ui, sans-serif;
      --mix-display-italic: "Bricolage Grotesque", system-ui, sans-serif;
      --mix-body: "DM Sans", system-ui, sans-serif;
      --mix-ui: "DM Sans", system-ui, sans-serif;
      --mix-ironic: "Bricolage Grotesque", system-ui, sans-serif;
      --mix-display-weight: 700;
      --mix-display-italic-weight: 600;
    }
    .mix.ts-indie, body.ts-indie .mix {
      --mix-display: "Fraunces", serif;
      --mix-display-italic: "Instrument Serif", "Fraunces", serif;
      --mix-body: "Newsreader", Georgia, serif;
      --mix-ui: "Inter", system-ui, sans-serif;
      --mix-ironic: "Newsreader", Georgia, serif;
      --mix-display-weight: 400;
      --mix-display-italic-weight: 400;
    }
    .mix [style*="--mix-display"], .mix em { font-weight: var(--mix-display-weight); }
    .mix em { font-weight: var(--mix-display-italic-weight); }
    .mix { color: ${MIX.ink}; font-family: ${MIX.ui}; -webkit-font-smoothing: antialiased; }
    .mix * { box-sizing: border-box; }
    @keyframes mix-marq { from{transform:translateX(0)} to{transform:translateX(-50%)} }
    @keyframes mix-twink { 0%,100%{opacity:.25;transform:scale(.7)} 50%{opacity:.95;transform:scale(1.05)} }
    @keyframes mix-shine { 0%{background-position:0% 50%} 100%{background-position:200% 50%} }
    .mix-marquee { display:flex; animation: mix-marq 38s linear infinite; }
    .mix-twink { animation: mix-twink 2.6s ease-in-out infinite; }
    .mix-grain::after {
      content:''; position:absolute; inset:0; pointer-events:none;
      background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='1.3' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.96  0 0 0 0 0.93  0 0 0 0 0.87  0 0 0 .14 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>");
      mix-blend-mode: overlay; opacity:.45;
    }
    .mix-vignette::before {
      content:''; position:absolute; inset:0; pointer-events:none;
      background: radial-gradient(120% 80% at 50% 30%, transparent 40%, rgba(15,8,22,.78) 100%);
    }
    .mix-chrome {
      background: linear-gradient(110deg, ${MIX.chrome1} 0%, ${MIX.chrome2} 38%, ${MIX.chrome3} 64%, ${MIX.chrome1} 100%);
      background-size: 200% 100%;
      animation: mix-shine 9s linear infinite;
      -webkit-background-clip: text; background-clip: text; color: transparent;
    }
    .mix-chrome-bg {
      background: linear-gradient(110deg, ${MIX.chrome1} 0%, ${MIX.chrome2} 38%, ${MIX.chrome3} 64%, ${MIX.chrome1} 100%);
      background-size: 200% 100%;
      animation: mix-shine 9s linear infinite;
    }
    .mix-candle {
      position:absolute; pointer-events:none;
      background: radial-gradient(circle, rgba(229,169,90,.32), rgba(229,169,90,0) 65%);
      filter: blur(8px);
    }
    .mix-burst {
      clip-path: polygon(50% 0%,57% 14%,72% 6%,68% 22%,86% 18%,76% 32%,94% 36%,80% 44%,
        100% 50%,82% 56%,92% 72%,76% 68%,80% 86%,64% 76%,60% 100%,
        50% 84%,40% 100%,36% 76%,20% 86%,24% 68%,8% 72%,18% 56%,0% 50%,20% 44%,
        6% 36%,24% 32%,14% 18%,32% 22%,28% 6%,43% 14%);
    }
    .mix-tape {
      background: rgba(229,169,90,.55);
      border-left: 1px dashed rgba(255,255,255,.35);
      border-right: 1px dashed rgba(255,255,255,.35);
    }
    .mix-poster-grad-1 { background: linear-gradient(150deg, #5B2A4F, #1A0A28); }
    .mix-poster-grad-2 { background: linear-gradient(150deg, #7C2A2A, #1B0F1B); }
    .mix-poster-grad-3 { background: linear-gradient(150deg, #A04A1F, #2A1A0A); }
    .mix-poster-grad-4 { background: linear-gradient(150deg, #1E2A4D, #0A0E1A); }
    .mix-poster-grad-5 { background: linear-gradient(150deg, #3A6E8F, #0E1830); }
    .mix-divider {
      background: linear-gradient(90deg, transparent, ${MIX.amber}, transparent);
      height: 1px; opacity:.5;
    }
  `;
  document.head.appendChild(s);
}

// ─── decor primitives ─────────────────────────────────────────
function MixSparkle({ size = 10, color = MIX.amber, style = {} }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} style={style} className="mix-twink">
      <path d="M12 0 L13.5 10.5 L24 12 L13.5 13.5 L12 24 L10.5 13.5 L0 12 L10.5 10.5 Z"
        fill={color}/>
    </svg>
  );
}
function MixStar4({ size = 12, color = MIX.amber, style = {} }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} style={style}>
      <path d="M12 1 C12 7 13 11 23 12 C13 13 12 17 12 23 C12 17 11 13 1 12 C11 11 12 7 12 1Z"
        fill={color}/>
    </svg>
  );
}
function MixCandle({ x, y, size = 100, opacity = 1 }) {
  return <div className="mix-candle" style={{ left:x, top:y, width:size, height:size, opacity }}/>;
}

// Generic poster — cozy treatment with one Y2K disruption (sticker + tape)
function MixPoster({ story, gradN = 1, sticker, accent = MIX.amber }) {
  const fandom = window.HC_DATA.FANDOMS.find(f => f.id === story.fandom);
  return (
    <div style={{ position:'relative', aspectRatio:'2/3', width:'100%',
      borderRadius: 6, overflow:'hidden', border:`1px solid ${MIX.borderStrong}`,
      boxShadow:'0 10px 30px rgba(0,0,0,.55), inset 0 1px 0 rgba(255,255,255,.06)' }}>
      <div className={`mix-poster-grad-${gradN}`} style={{ position:'absolute', inset:0 }}/>
      <div className="mix-grain"/>
      <div className="mix-vignette"/>
      {/* light leak */}
      <div style={{ position:'absolute', top:'-30%', right:'-20%', width:'70%', height:'70%',
        background:`radial-gradient(circle, ${accent}55, transparent 60%)`, mixBlendMode:'screen' }}/>
      {/* tiny serial */}
      <div style={{ position:'absolute', top: 8, left: 10, fontFamily: MIX.mono, fontSize: 8.5,
        letterSpacing:'.12em', color: MIX.ink, opacity:.7 }}>HC—{story.id.toUpperCase()} · {fandom.id.toUpperCase()}</div>
      {/* title block bottom */}
      <div style={{ position:'absolute', left: 12, right: 12, bottom: 12 }}>
        <div style={{ fontFamily: MIX.mono, fontSize: 8, letterSpacing:'.16em',
          color: accent, marginBottom: 4 }}>{story.trope.split(' · ')[0].toUpperCase()}</div>
        <div style={{ fontFamily: MIX.display, fontSize: 16, lineHeight: 1.02,
          color: MIX.ink, textWrap:'balance' }}>{story.title}</div>
      </div>
      {sticker && (
        <div className="mix-burst" style={{ position:'absolute', top: -6, right: -6,
          width: 38, height: 38, background: accent, color: MIX.bg,
          display:'flex', alignItems:'center', justifyContent:'center',
          fontSize: 16, transform:'rotate(8deg)' }}>★</div>
      )}
      {/* tape strip — Y2K ephemera */}
      <div className="mix-tape" style={{ position:'absolute', top: 18, right: -10,
        width: 56, height: 18, transform:'rotate(22deg)', opacity:.78 }}/>
    </div>
  );
}

// ─── 1. MOBILE FEED ───────────────────────────────────────────
function MixFeedMobile() {
  const { STORIES, FANDOMS } = window.HC_DATA;
  return (
    <div className="mix" style={{ width:'100%', height:'100%', background: MIX.bg,
      position:'relative', overflow:'hidden' }}>
      <MixCandle x={-40} y={120} size={220} opacity={.7}/>
      <MixCandle x={240} y={520} size={180} opacity={.55}/>

      {/* status */}
      <div style={{ position:'relative', display:'flex', justifyContent:'space-between',
        padding:'10px 18px 4px', fontFamily: MIX.mono, fontSize: 11, color: MIX.ink, opacity:.85 }}>
        <span>1:42 AM</span>
        <span>•••○ 5G 92%</span>
      </div>

      {/* nav: wordmark with chrome 'canon' */}
      <div style={{ position:'relative', padding:'10px 18px 4px',
        display:'flex', justifyContent:'space-between', alignItems:'flex-end' }}>
        <div style={{ display:'flex', alignItems:'baseline', gap: 4 }}>
          <span style={{ fontFamily: MIX.display, fontSize: 28, lineHeight: 1, fontStyle:'italic', fontWeight: 400 }}>head</span>
          <span className="mix-chrome" style={{ fontFamily: MIX.display, fontSize: 28, lineHeight: 1, fontWeight: 600 }}>canon</span>
          <MixStar4 size={10} color={MIX.amber} style={{ marginLeft: 2, marginBottom: 14 }}/>
        </div>
        <div style={{ display:'flex', gap: 12, color: MIX.inkDim, fontSize: 16 }}>
          <span>⌕</span><span style={{ color: MIX.amber }}>♡</span>
        </div>
      </div>

      {/* tagline — ironic Times italic */}
      <div style={{ padding:'2px 18px 12px', fontFamily: MIX.ironic, fontStyle:'italic',
        fontSize: 13, color: MIX.ink, opacity: .88, letterSpacing:'.01em' }}>
        ★ полночное чтиво для тех, кто не спит ★
      </div>

      {/* fandom chips */}
      <div style={{ display:'flex', gap: 6, padding:'0 18px 10px', overflowX:'auto' }}>
        {FANDOMS.map((f, i) => {
          const sel = i === 0;
          return (
            <div key={f.id} style={{ padding:'5px 11px', whiteSpace:'nowrap',
              borderRadius: 999, fontFamily: MIX.ui, fontSize: 11, letterSpacing:'.02em',
              border: sel ? `1px solid ${MIX.amber}` : `1px solid ${MIX.border}`,
              background: sel ? `${MIX.amber}1F` : 'transparent',
              color: sel ? MIX.amber : MIX.inkDim, fontWeight: sel ? 600 : 400 }}>
              {sel && '☆ '}{f.name}
            </div>
          );
        })}
      </div>

      {/* HERO — editorial cover w/ marquee bar above */}
      <div style={{ overflow:'hidden', borderTop:`1px solid ${MIX.border}`, borderBottom:`1px solid ${MIX.border}`,
        padding:'4px 0', background: `${MIX.amber}10` }}>
        <div className="mix-marquee">
          {[...Array(2)].map((_, k) => (
            <div key={k} style={{ display:'flex', alignItems:'center', gap: 18, padding:'0 18px',
              whiteSpace:'nowrap', fontFamily: MIX.mono, fontSize: 9.5, letterSpacing:'.18em', color: MIX.amber }}>
              <span>NOW READING</span><span style={{ opacity:.5 }}>◆</span>
              <span style={{ color: MIX.ink }}>зимний свет в подземельях</span>
              <span style={{ opacity:.5 }}>◆</span>
              <span>ГЛ.7</span><span style={{ opacity:.5 }}>◆</span>
              <span style={{ color: MIX.rose }}>14 ГЛАВ · 24.8K ♡</span>
              <span style={{ opacity:.5 }}>◆</span>
              <span>WATCH MODE · 4 EP</span>
              <span style={{ opacity:.5 }}>◆</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding:'14px 18px 14px' }}>
        <div style={{ position:'relative', borderRadius: 8, overflow:'hidden',
          aspectRatio:'4/5', boxShadow:'0 14px 40px rgba(0,0,0,.6), inset 0 1px 0 rgba(255,255,255,.08)',
          border:`1px solid ${MIX.borderStrong}` }}>
          <div className="mix-poster-grad-1" style={{ position:'absolute', inset:0 }}/>
          <div className="mix-grain"/>
          <div className="mix-vignette"/>
          {/* light leak */}
          <div style={{ position:'absolute', top:'-20%', right:'-15%', width:'70%', height:'60%',
            background:`radial-gradient(circle, ${MIX.amber}66, transparent 60%)`, mixBlendMode:'screen' }}/>
          {/* serial top */}
          <div style={{ position:'absolute', top: 12, left: 14, right: 14,
            display:'flex', justifyContent:'space-between',
            fontFamily: MIX.mono, fontSize: 9, letterSpacing:'.18em', color: MIX.inkDim }}>
            <span>VOL.1 / CH.7</span>
            <span style={{ color: MIX.amber }}>◆ DRAMIONE</span>
          </div>
          {/* burst sticker */}
          <div className="mix-burst" style={{ position:'absolute', top: 14, right: 14,
            width: 56, height: 56, background: MIX.amber, color: MIX.bg,
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize: 26, transform:'rotate(-8deg)' }}>★</div>
          {/* title block */}
          <div style={{ position:'absolute', left: 16, right: 16, bottom: 18 }}>
            <div style={{ fontFamily: MIX.mono, fontSize: 9, letterSpacing:'.2em',
              color: MIX.amber, marginBottom: 6 }}>ENEMIES-TO-LOVERS · SLOW BURN</div>
            <div style={{ fontFamily: MIX.display, fontSize: 28, lineHeight: 0.96,
              color: MIX.ink, textWrap:'balance', fontWeight: 400 }}>
              Зимний свет<br/>в <em style={{ fontFamily: MIX.displayItalic, fontStyle:'italic', color: MIX.amber }}>подземельях</em>.
            </div>
            <div style={{ fontFamily: MIX.body, fontSize: 12.5, lineHeight: 1.45,
              color: MIX.ink, opacity: .92, marginTop: 8, textWrap:'pretty' }}>
              Год седьмой, Хогвартс под комендантским часом — единственный, кто заметил её отсутствие, последний, кого она хотела бы видеть.
            </div>
          </div>
        </div>

        {/* meta row */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
          marginTop: 12, fontFamily: MIX.mono, fontSize: 10, color: MIX.inkDim }}>
          <span>@lunaxhalf · 14 гл · 9 мин</span>
          <span style={{ display:'flex', alignItems:'center', gap: 6 }}>
            <span style={{ padding:'4px 11px', borderRadius:999,
              background: `linear-gradient(110deg, ${MIX.chrome1}, ${MIX.chrome2} 50%, ${MIX.chrome3})`,
              color: MIX.bg, boxShadow: `0 0 0 1px ${MIX.ink}22, 0 4px 14px ${MIX.chrome2}55`,
              fontFamily: MIX.display, fontStyle:'italic', fontSize: 11, fontWeight: 700 }}>▸ watch · 4 эп</span>
            <span style={{ color: MIX.rose }}>♡ 24.8k</span>
          </span>
        </div>
      </div>

      {/* divider */}
      <div style={{ position:'relative', padding:'4px 18px',
        display:'flex', alignItems:'center', gap: 10 }}>
        <div className="mix-divider" style={{ flex:1 }}/>
        <div style={{ fontFamily: MIX.display, fontStyle:'italic', fontSize: 13, color: MIX.amber }}>
          ✦ ещё на полке
        </div>
        <div className="mix-divider" style={{ flex:1 }}/>
      </div>

      {/* asymmetric grid — Y2K broken column */}
      <div style={{ padding:'10px 18px 100px', display:'grid',
        gridTemplateColumns: '1.1fr .9fr', gap: 12 }}>
        <div style={{ transform:'translateY(0)' }}>
          <MixPoster story={STORIES[1]} gradN={2} accent={MIX.amber} sticker="hot"/>
          <div style={{ marginTop: 8, fontFamily: MIX.mono, fontSize: 9, color: MIX.inkDim }}>
            BG3 · @tav.exe
          </div>
        </div>
        <div style={{ transform:'translateY(20px)' }}>
          <MixPoster story={STORIES[2]} gradN={3} accent={MIX.rust}/>
          <div style={{ marginTop: 8, fontFamily: MIX.mono, fontSize: 9, color: MIX.inkDim }}>
            ATLA · @firelily
          </div>
        </div>
        <div style={{ transform:'translateY(-12px)' }}>
          <MixPoster story={STORIES[3]} gradN={4} accent={MIX.amber} sticker="★"/>
          <div style={{ marginTop: 8, fontFamily: MIX.mono, fontSize: 9, color: MIX.inkDim }}>
            JJK · @cursedwomb
          </div>
        </div>
        <div style={{ transform:'translateY(8px)' }}>
          <MixPoster story={STORIES[4]} gradN={5} accent={MIX.rose}/>
          <div style={{ marginTop: 8, fontFamily: MIX.mono, fontSize: 9, color: MIX.inkDim }}>
            GENSHIN · @monddrunk
          </div>
        </div>
      </div>

      {/* tab bar */}
      <div style={{ position:'absolute', bottom: 0, left:0, right:0, padding:'10px 14px 16px',
        background: `linear-gradient(180deg, transparent, ${MIX.bg} 45%)`,
        borderTop:`1px solid ${MIX.border}`, backdropFilter:'blur(12px)',
        display:'flex', justifyContent:'space-around', alignItems:'flex-end' }}>
        {[['☆','лента', MIX.amber],['✎','создать'],['♡','полка'],['◯','я']].map(([icon, t, c], i) => (
          <div key={i} style={{ textAlign:'center', color: c || MIX.inkDim }}>
            <div style={{ fontSize: 17, lineHeight: 1 }}>{icon}</div>
            <div style={{ marginTop: 4, fontFamily: MIX.display, fontStyle:'italic',
              fontSize: 13, fontWeight: 500, letterSpacing:'.01em' }}>{t}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── 2. MOBILE CREATE ─────────────────────────────────────────
function MixCreateMobile() {
  const { TROPES } = window.HC_DATA;
  return (
    <div className="mix" style={{ width:'100%', height:'100%', background: MIX.bg,
      position:'relative', overflow:'hidden' }}>
      <MixCandle x={200} y={-40} size={240} opacity={.6}/>
      <MixCandle x={-40} y={400} size={200} opacity={.5}/>

      <div style={{ position:'relative', display:'flex', justifyContent:'space-between',
        padding:'10px 18px 4px', fontFamily: MIX.mono, fontSize: 11, color: MIX.ink, opacity:.85 }}>
        <span>1:42 AM</span><span>•••○ 5G 92%</span>
      </div>

      <div style={{ padding:'8px 18px 16px', display:'flex', alignItems:'center',
        justifyContent:'space-between' }}>
        <span style={{ fontSize: 18, color: MIX.inkDim }}>×</span>
        <div style={{ fontFamily: MIX.mono, fontSize: 10, letterSpacing:'.16em', color: MIX.inkDim }}>
          STAGE 02 / 05
        </div>
        <span style={{ fontFamily: MIX.display, fontStyle:'italic', fontSize: 12, color: MIX.amber }}>
          draft saved ✓
        </span>
      </div>

      {/* compact progress — current + next only */}
      <div style={{ padding:'0 18px 22px' }}>
        <div style={{ display:'flex', alignItems:'center', gap: 12, marginBottom: 8 }}>
          <div style={{ flex:1, height: 3, background: MIX.border, borderRadius: 2, position:'relative', overflow:'hidden' }}>
            <div style={{ position:'absolute', inset:'0 60% 0 0', background: MIX.amber, borderRadius: 2 }}/>
          </div>
          <span style={{ fontFamily: MIX.mono, fontSize: 10, color: MIX.inkDim, letterSpacing:'.1em' }}>40%</span>
        </div>
        <div style={{ fontFamily: MIX.body, fontStyle:'italic', fontSize: 12, color: MIX.inkDim }}>
          дальше — <span style={{ color: MIX.amber }}>тропы пакета</span>
        </div>
      </div>

      {/* heading */}
      <div style={{ position:'relative', padding:'0 18px 18px' }}>
        <div style={{ position:'absolute', top: -6, right: 18 }}>
          <MixSparkle size={14} color={MIX.amber}/>
        </div>
        <div style={{ fontFamily: MIX.mono, fontSize: 10, letterSpacing:'.18em',
          color: MIX.amber, marginBottom: 8 }}>★ STEP 02 — SHIP</div>
        <div style={{ fontFamily: MIX.display, fontSize: 32, lineHeight: 0.98, fontWeight: 400,
          textWrap:'balance' }}>
          Подбираем <em style={{ fontFamily: MIX.displayItalic, color: MIX.amber }}>пейринг</em>.
        </div>
        <div style={{ fontFamily: MIX.ironic, fontStyle:'italic', fontSize: 13,
          color: MIX.inkDim, marginTop: 10, lineHeight: 1.5 }}>
          Ship — главный хук. От него зависят все доступные тропы и тон главы. Никакого спойлера, обещаем.
        </div>
      </div>

      {/* selected pair card — editorial w/ tape */}
      <div style={{ position:'relative', margin:'0 18px 22px' }}>
        <div style={{ position:'absolute', top: -8, left: 22, width: 50, height: 16,
          transform:'rotate(-4deg)' }} className="mix-tape"/>
        <div style={{ position:'absolute', top: -8, right: 22, width: 50, height: 16,
          transform:'rotate(5deg)' }} className="mix-tape"/>
        <div style={{ position:'relative', padding: 14,
          border:`1px solid ${MIX.borderStrong}`, borderRadius: 6,
          background: MIX.surface, boxShadow:'0 10px 30px rgba(0,0,0,.5)' }}>
          <div style={{ fontFamily: MIX.mono, fontSize: 9, letterSpacing:'.18em',
            color: MIX.amber, marginBottom: 10 }}>SHIP CONFIRMED</div>
          <div style={{ display:'flex', alignItems:'center', gap: 12 }}>
            <div className="mix-poster-grad-1" style={{ width: 52, height: 52, borderRadius: 6,
              border:`1px solid ${MIX.border}`, position:'relative' }}>
              <div className="mix-grain"/>
            </div>
            <div style={{ fontFamily: MIX.display, fontStyle:'italic', fontSize: 26, color: MIX.amber }}>×</div>
            <div className="mix-poster-grad-4" style={{ width: 52, height: 52, borderRadius: 6,
              border:`1px solid ${MIX.border}`, position:'relative' }}>
              <div className="mix-grain"/>
            </div>
            <div style={{ flex:1, marginLeft: 4 }}>
              <div style={{ fontFamily: MIX.display, fontSize: 18, lineHeight: 1.05 }}>Драко × Гермиона</div>
              <div style={{ fontFamily: MIX.mono, fontSize: 9, color: MIX.inkDim, letterSpacing:'.1em', marginTop: 2 }}>DRAMIONE · YEAR 7</div>
            </div>
          </div>
        </div>
      </div>

      {/* tropes — sticker-tag mix */}
      <div style={{ padding:'0 18px 14px' }}>
        <div style={{ display:'flex', alignItems:'baseline', justifyContent:'space-between', marginBottom: 12 }}>
          <div style={{ fontFamily: MIX.display, fontSize: 18, fontStyle:'italic' }}>
            ✦ тропы пакета
          </div>
          <div style={{ fontFamily: MIX.mono, fontSize: 10, color: MIX.inkDim }}>2 / 3</div>
        </div>

        <div style={{ display:'flex', flexWrap:'wrap', gap: 8 }}>
          {TROPES.map((t, i) => {
            const sel = i === 0 || i === 1;
            const tilt = (i % 2 ? 1 : -1) * (0.6 + (i % 3) * 0.3);
            return (
              <div key={t.id} style={{
                padding:'6px 12px', borderRadius: 999,
                fontFamily: sel ? MIX.display : MIX.ui,
                fontStyle: sel ? 'italic' : 'normal',
                fontSize: 12,
                background: sel ? MIX.amber : 'transparent',
                color: sel ? MIX.bg : MIX.inkDim,
                border: sel ? `1px solid ${MIX.amber}` : `1px solid ${MIX.border}`,
                fontWeight: sel ? 600 : 400,
                transform: sel ? `rotate(${tilt}deg)` : 'none',
                boxShadow: sel ? '0 4px 14px rgba(229,169,90,.35)' : 'none',
              }}>
                {sel && '★ '}{t.name}
              </div>
            );
          })}
        </div>

        {/* AI tip — quote-block */}
        <div style={{ marginTop: 22, position:'relative',
          padding:'14px 16px 14px 22px',
          borderLeft:`2px solid ${MIX.amber}`,
          background: `${MIX.amber}10`,
          borderRadius:'0 6px 6px 0' }}>
          <div style={{ position:'absolute', top: -6, left: -10 }}>
            <MixStar4 size={14} color={MIX.amber}/>
          </div>
          <div style={{ fontFamily: MIX.mono, fontSize: 9, letterSpacing:'.18em',
            color: MIX.amber, marginBottom: 6 }}>AI · РЕДАКТОР</div>
          <div style={{ fontFamily: MIX.body, fontStyle:'italic', fontSize: 13.5,
            lineHeight: 1.5, color: MIX.ink, textWrap:'pretty' }}>
            «Enemies-to-lovers + slow burn — 12+ глав. Я разгоню напряжение медленно. Готова <em style={{ color: MIX.amber }}>ждать</em>?»
          </div>
        </div>
      </div>

      {/* CTA */}
      <div style={{ position:'absolute', bottom: 0, left:0, right:0, padding:'14px 18px 22px',
        background: `linear-gradient(180deg, transparent, ${MIX.bg} 40%)`,
        borderTop:`1px solid ${MIX.border}`, backdropFilter:'blur(10px)' }}>
        <div style={{ display:'flex', gap: 10, alignItems:'stretch' }}>
          <div style={{ padding:'14px 18px', borderRadius: 999,
            border:`1px solid ${MIX.borderStrong}`, color: MIX.inkDim,
            fontFamily: MIX.display, fontStyle:'italic', fontSize: 14, fontWeight: 500,
            display:'flex', alignItems:'center' }}>
            ← назад
          </div>
          <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'space-between',
            padding:'14px 20px', borderRadius: 999,
            background: MIX.amber, color: MIX.bg }}>
            <span style={{ fontFamily: MIX.display, fontStyle:'italic', fontSize: 16, fontWeight: 600 }}>
              дальше · завязка
            </span>
            <span style={{ fontFamily: MIX.display, fontSize: 18 }}>→</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── 3. MOBILE STORY PAGE ─────────────────────────────────────
function MixStoryMobile() {
  const { CHAPTER_LIST, STORIES } = window.HC_DATA;
  const story = STORIES[0];
  return (
    <div className="mix" style={{ width:'100%', height:'100%', background: MIX.bg,
      position:'relative', overflow:'hidden' }}>
      <MixCandle x={-30} y={300} size={220} opacity={.6}/>

      <div style={{ position:'relative', display:'flex', justifyContent:'space-between',
        padding:'10px 18px 4px', fontFamily: MIX.mono, fontSize: 11, color: MIX.ink, opacity:.85 }}>
        <span>1:42 AM</span><span>•••○ 5G 92%</span>
      </div>

      <div style={{ padding:'8px 18px', display:'flex', justifyContent:'space-between',
        alignItems:'center', position:'relative', zIndex:5 }}>
        <span style={{ color: MIX.inkDim, fontSize: 18 }}>←</span>
        <div style={{ display:'flex', gap: 14, color: MIX.inkDim, fontSize: 14 }}>
          <span style={{ color: MIX.amber }}>♡</span>
          <span>↗</span>
          <span>⋯</span>
        </div>
      </div>

      {/* HERO cover — landscape, with tape + sticker */}
      <div style={{ position:'relative', margin:'12px 18px 0' }}>
        <div style={{ position:'absolute', top: -6, left: 30, width: 50, height: 16,
          transform:'rotate(-4deg)', zIndex: 3 }} className="mix-tape"/>
        <div style={{ position:'absolute', top: -6, right: 30, width: 50, height: 16,
          transform:'rotate(5deg)', zIndex: 3 }} className="mix-tape"/>
        <div style={{ position:'relative', borderRadius: 8, overflow:'hidden',
          aspectRatio:'4/3', border:`1px solid ${MIX.borderStrong}`,
          boxShadow:'0 14px 40px rgba(0,0,0,.6)' }}>
          <div className="mix-poster-grad-1" style={{ position:'absolute', inset:0 }}/>
          <div className="mix-grain"/>
          <div className="mix-vignette"/>
          {/* light leak */}
          <div style={{ position:'absolute', top:'-15%', right:'-10%', width:'60%', height:'70%',
            background:`radial-gradient(circle, ${MIX.amber}66, transparent 60%)`, mixBlendMode:'screen' }}/>
          <div className="mix-burst" style={{ position:'absolute', top: 14, left: 14,
            width: 56, height: 56, background: MIX.amber, color: MIX.bg,
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize: 26, transform:'rotate(-10deg)' }}>★</div>
          <div style={{ position:'absolute', bottom: 12, left: 14, right: 14,
            display:'flex', justifyContent:'space-between',
            fontFamily: MIX.mono, fontSize: 9, letterSpacing:'.18em', color: MIX.inkDim }}>
            <span>HOGWARTS · 1997</span>
            <span style={{ color: MIX.amber }}>★ MUST READ</span>
          </div>
        </div>
      </div>

      {/* title block */}
      <div style={{ padding:'18px 18px 6px' }}>
        <div style={{ fontFamily: MIX.mono, fontSize: 9.5, letterSpacing:'.2em',
          color: MIX.amber, marginBottom: 8 }}>VOL.1 · DRAMIONE · ENEMIES-TO-LOVERS</div>
        <div style={{ fontFamily: MIX.display, fontSize: 30, lineHeight: 0.95,
          textWrap:'balance', fontWeight: 400 }}>
          Зимний свет<br/>в <em style={{ fontFamily: MIX.displayItalic, color: MIX.amber }}>подземельях</em>.
        </div>
        <div style={{ fontFamily: MIX.body, fontStyle:'italic', fontSize: 13,
          color: MIX.inkDim, marginTop: 10, lineHeight: 1.5, textWrap:'pretty' }}>
          {story.tagline}
        </div>
      </div>

      {/* meta row */}
      <div style={{ padding:'14px 18px', display:'flex', justifyContent:'space-between',
        fontFamily: MIX.mono, fontSize: 10, color: MIX.inkDim, borderBottom:`1px solid ${MIX.border}`,
        margin:'0 18px', borderTop:`1px solid ${MIX.border}`, padding:'10px 0' }}>
        <div><span style={{ opacity:.6 }}>by </span>@lunaxhalf</div>
        <div>14 / ∞ глав</div>
        <div style={{ color: MIX.rose }}>♡ 24.8k</div>
      </div>

      {/* watch CTA */}
      <div style={{ padding:'14px 18px 12px' }}>
        <div style={{ display:'flex', alignItems:'center', gap: 10 }}>
          <div style={{ flex:1, position:'relative',
            padding:'12px 14px', borderRadius: 8,
            background: `linear-gradient(135deg, ${MIX.surface}, ${MIX.bg2})`,
            border:`1px solid ${MIX.amber}40`, overflow:'hidden' }}>
            <div style={{ fontFamily: MIX.mono, fontSize: 9, letterSpacing:'.18em',
              color: MIX.amber, marginBottom: 4 }}>★ WATCH MODE · NEW</div>
            <div style={{ fontFamily: MIX.display, fontStyle:'italic', fontSize: 16, color: MIX.ink }}>
              4 эп · 18 мин кино.
            </div>
          </div>
          <div style={{ width: 56, height: 56, borderRadius:'50%',
            background: MIX.amber, color: MIX.bg,
            display:'flex', alignItems:'center', justifyContent:'center', fontSize: 22 }}>▶</div>
        </div>
      </div>

      {/* chapters */}
      <div style={{ padding:'4px 18px 100px' }}>
        <div style={{ display:'flex', alignItems:'baseline', justifyContent:'space-between', marginBottom: 8 }}>
          <div style={{ fontFamily: MIX.display, fontSize: 16, fontStyle:'italic' }}>✦ главы</div>
          <div style={{ fontFamily: MIX.mono, fontSize: 9.5, color: MIX.inkDim, letterSpacing:'.1em' }}>
            6 ИЗ 14 ПРОЧИТАНО
          </div>
        </div>
        {CHAPTER_LIST.slice(0, 5).map(c => {
          const reading = c.state === 'reading';
          const read = c.state === 'read';
          const lock = c.state === 'lock';
          return (
            <div key={c.n} style={{
              display:'flex', alignItems:'center', gap: 12,
              padding:'10px 0', borderBottom: `1px solid ${MIX.border}`,
              opacity: lock ? .35 : 1 }}>
              <div style={{ width: 28, fontFamily: MIX.mono, fontSize: 11,
                color: reading ? MIX.amber : MIX.inkFaint, letterSpacing:'.1em' }}>
                {c.n.toString().padStart(2,'0')}
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontFamily: MIX.display, fontSize: 14, lineHeight: 1.2,
                  color: reading ? MIX.amber : MIX.ink, fontWeight: reading ? 500 : 400,
                  textDecoration: read ? 'line-through' : 'none', textDecorationColor: MIX.inkFaint }}>
                  {c.t}
                </div>
                <div style={{ fontFamily: MIX.mono, fontSize: 9, color: MIX.inkFaint,
                  marginTop: 2, letterSpacing:'.05em' }}>
                  {c.m}m · {read ? 'прочитано' : reading ? 'продолжить →' : lock ? 'будет позже' : 'дальше'}
                </div>
              </div>
              {reading && <span style={{ color: MIX.amber, fontSize: 14 }}>▸</span>}
            </div>
          );
        })}
      </div>

      {/* sticky CTA */}
      <div style={{ position:'absolute', bottom: 0, left:0, right:0, padding:'12px 18px 22px',
        background: `linear-gradient(180deg, transparent, ${MIX.bg} 40%)`,
        backdropFilter:'blur(10px)' }}>
        <div style={{ padding:'14px 20px', borderRadius: 999, background: MIX.amber, color: MIX.bg,
          textAlign:'center', fontFamily: MIX.display, fontStyle:'italic', fontSize: 17, fontWeight: 600 }}>
          ★ продолжить главу 7
        </div>
      </div>
    </div>
  );
}

// ─── 4. DESKTOP FEED ──────────────────────────────────────────
function MixFeedDesktop() {
  const { STORIES, FANDOMS } = window.HC_DATA;
  return (
    <div className="mix" style={{ width:'100%', height:'100%', background: MIX.bg,
      position:'relative', overflow:'hidden' }}>
      <MixCandle x={-100} y={200} size={400} opacity={.45}/>
      <MixCandle x={900} y={500} size={380} opacity={.4}/>

      {/* top nav */}
      <div style={{ position:'relative', zIndex:5, padding:'18px 36px',
        display:'flex', justifyContent:'space-between', alignItems:'center',
        borderBottom:`1px solid ${MIX.border}` }}>
        <div style={{ display:'flex', alignItems:'baseline', gap: 36 }}>
          <div style={{ display:'flex', alignItems:'baseline', gap: 4 }}>
            <span style={{ fontFamily: MIX.display, fontSize: 30, fontStyle:'italic', fontWeight: 400 }}>head</span>
            <span className="mix-chrome" style={{ fontFamily: MIX.display, fontSize: 30, fontWeight: 600 }}>canon</span>
            <MixStar4 size={11} color={MIX.amber} style={{ marginLeft: 3 }}/>
          </div>
          <div style={{ display:'flex', gap: 22, fontFamily: MIX.ui, fontSize: 13, color: MIX.inkDim }}>
            <span style={{ color: MIX.amber, fontFamily: MIX.display, fontStyle:'italic' }}>★ лента</span>
            <span>фандомы</span>
            <span>тропы</span>
            <span>watch ▸</span>
          </div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap: 16 }}>
          <div style={{ padding:'7px 14px', borderRadius: 999, border:`1px solid ${MIX.border}`,
            fontFamily: MIX.mono, fontSize: 11, color: MIX.inkDim }}>⌕  ship me up…</div>
          <div style={{ padding:'8px 16px', borderRadius: 999, background: MIX.amber, color: MIX.bg,
            fontFamily: MIX.display, fontStyle:'italic', fontSize: 14, fontWeight: 600 }}>+ новая история</div>
          <div style={{ width: 36, height: 36, borderRadius: '50%',
            background:`linear-gradient(135deg, ${MIX.amber}, ${MIX.rose})`, border:`1px solid ${MIX.borderStrong}` }}/>
        </div>
      </div>

      {/* marquee */}
      <div style={{ overflow:'hidden', borderBottom:`1px solid ${MIX.border}`,
        padding:'7px 0', background: `${MIX.amber}10` }}>
        <div className="mix-marquee">
          {[...Array(2)].map((_, k) => (
            <div key={k} style={{ display:'flex', alignItems:'center', gap: 28, padding:'0 28px',
              whiteSpace:'nowrap', fontFamily: MIX.mono, fontSize: 10, letterSpacing:'.18em', color: MIX.amber }}>
              <span>★ NOW READING ★</span><span style={{ color: MIX.inkDim }}>◆</span>
              <span style={{ color: MIX.ink, fontFamily: MIX.display, fontStyle:'italic', letterSpacing:0, fontSize: 14 }}>зимний свет в подземельях</span>
              <span style={{ color: MIX.inkDim }}>◆</span>
              <span>ENEMIES-TO-LOVERS · SLOW BURN · TIME TRAVEL · HURT/COMFORT · FAKE DATING · MODERN AU</span>
              <span style={{ color: MIX.inkDim }}>◆</span>
              <span style={{ color: MIX.rose }}>★ NEW · WATCH MODE · 4 EP ★</span>
              <span style={{ color: MIX.inkDim }}>◆</span>
            </div>
          ))}
        </div>
      </div>

      {/* HERO — editorial split */}
      <div style={{ position:'relative', zIndex:3, padding:'40px 36px 30px',
        display:'grid', gridTemplateColumns:'1.15fr 1fr', gap: 40, alignItems:'center' }}>
        <div style={{ position:'relative' }}>
          <div style={{ position:'absolute', top: -8, right: 60 }}>
            <MixSparkle size={18} color={MIX.amber}/>
          </div>
          <div style={{ fontFamily: MIX.mono, fontSize: 10.5, letterSpacing:'.2em',
            color: MIX.amber, marginBottom: 18 }}>★ TODAY'S MAIN STORY · DRAMIONE · 14 CH</div>
          <div style={{ fontFamily: MIX.display, fontSize: 92, lineHeight: 0.92,
            textWrap:'balance', fontWeight: 400, marginBottom: 22 }}>
            Зимний свет<br/>в <em style={{ fontFamily: MIX.displayItalic, color: MIX.amber }}>подземельях</em>.
          </div>
          <div style={{ fontFamily: MIX.body, fontSize: 16, lineHeight: 1.55,
            color: MIX.inkDim, textWrap:'pretty', maxWidth: 540, marginBottom: 28 }}>
            <span style={{ fontFamily: MIX.display, fontStyle:'italic', fontSize: 38, lineHeight: 0.6,
              color: MIX.amber, float:'left', marginRight: 8, marginTop: 10 }}>«</span>
            Год седьмой, Хогвартс под комендантским часом, и единственный, кто заметил её отсутствие в библиотеке — последний человек, которого она хотела бы видеть.
          </div>
          <div style={{ display:'flex', gap: 14, alignItems:'center' }}>
            <div style={{ padding:'13px 24px', borderRadius: 999, background: MIX.amber, color: MIX.bg,
              fontFamily: MIX.display, fontStyle:'italic', fontSize: 16, fontWeight: 600 }}>
              ★ читать главу 7
            </div>
            <div style={{ padding:'13px 24px', borderRadius: 999, border:`1px solid ${MIX.amber}80`,
              color: MIX.amber, fontFamily: MIX.display, fontStyle:'italic', fontSize: 14 }}>
              ▸ watch · 4 ep
            </div>
            <div style={{ fontFamily: MIX.mono, fontSize: 11, color: MIX.inkDim, marginLeft: 10, letterSpacing:'.06em' }}>
              ♡ 24.8K · @LUNAXHALF
            </div>
          </div>
        </div>
        {/* hero cover */}
        <div style={{ position:'relative' }}>
          <div style={{ position:'absolute', top: -10, left: 50, width: 80, height: 22,
            transform:'rotate(-4deg)', zIndex: 4 }} className="mix-tape"/>
          <div style={{ position:'absolute', top: -10, right: 50, width: 80, height: 22,
            transform:'rotate(5deg)', zIndex: 4 }} className="mix-tape"/>
          <div className="mix-burst" style={{ position:'absolute', top: -14, right: -14, width: 76, height: 76,
            background: MIX.amber, color: MIX.bg, zIndex: 5,
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize: 36, transform:'rotate(8deg)' }}>★</div>
          <div style={{ position:'relative', borderRadius: 10, overflow:'hidden',
            aspectRatio:'4/5', border:`1px solid ${MIX.borderStrong}`,
            boxShadow:'0 30px 80px rgba(0,0,0,.65)' }}>
            <div className="mix-poster-grad-1" style={{ position:'absolute', inset:0 }}/>
            <div className="mix-grain"/>
            <div className="mix-vignette"/>
            <div style={{ position:'absolute', top:'-15%', right:'-10%', width:'70%', height:'60%',
              background:`radial-gradient(circle, ${MIX.amber}77, transparent 60%)`, mixBlendMode:'screen' }}/>
            <div style={{ position:'absolute', top: 18, left: 22, right: 22,
              display:'flex', justifyContent:'space-between',
              fontFamily: MIX.mono, fontSize: 11, letterSpacing:'.2em', color: MIX.inkDim }}>
              <span>VOL.1 · CH.7</span>
              <span style={{ color: MIX.amber }}>◆ HC—S1</span>
            </div>
            <div style={{ position:'absolute', bottom: 28, left: 22, right: 22 }}>
              <div style={{ fontFamily: MIX.mono, fontSize: 10, letterSpacing:'.2em',
                color: MIX.amber, marginBottom: 10 }}>ENEMIES-TO-LOVERS</div>
              <div style={{ fontFamily: MIX.display, fontSize: 36, lineHeight: 0.94,
                fontWeight: 400, textWrap:'balance' }}>
                Зимний свет в <em style={{ fontFamily: MIX.displayItalic, color: MIX.amber }}>подземельях</em>.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* divider w/ italic label */}
      <div style={{ position:'relative', zIndex:3, padding:'10px 36px',
        display:'flex', alignItems:'center', gap: 16 }}>
        <div className="mix-divider" style={{ flex:1 }}/>
        <div style={{ fontFamily: MIX.display, fontStyle:'italic', fontSize: 18, color: MIX.amber }}>
          ✦ ещё на полке сегодня ✦
        </div>
        <div className="mix-divider" style={{ flex:1 }}/>
        <div style={{ fontFamily: MIX.mono, fontSize: 10, color: MIX.inkDim, letterSpacing:'.16em' }}>
          ALL 1248 →
        </div>
      </div>

      {/* asymmetric desktop grid */}
      <div style={{ position:'relative', zIndex:3, padding:'18px 36px 36px',
        display:'grid', gridTemplateColumns:'repeat(5, 1fr)', gap: 20, alignItems:'flex-start' }}>
        {STORIES.slice(1).map((s, i) => {
          const offsets = [0, 18, -10, 26, -4];
          const rots = [-0.6, 0.8, -1, 0.6, -0.4];
          const stickers = [null, 'hot', null, '★', null];
          const accents = [MIX.amber, MIX.rust, MIX.amber, MIX.rose, MIX.amber];
          const f = FANDOMS.find(x => x.id === s.fandom);
          return (
            <div key={s.id} style={{ transform: `translateY(${offsets[i]}px) rotate(${rots[i]}deg)` }}>
              <MixPoster story={s} gradN={i + 1} sticker={stickers[i]} accent={accents[i]}/>
              <div style={{ marginTop: 12 }}>
                <div style={{ fontFamily: MIX.mono, fontSize: 9.5, letterSpacing:'.15em',
                  color: MIX.amber, marginBottom: 4 }}>
                  ★ {f.name.toUpperCase()}
                </div>
                <div style={{ fontFamily: MIX.display, fontSize: 16, lineHeight: 1.1,
                  color: MIX.ink, marginBottom: 4, textWrap:'balance' }}>{s.title}</div>
                <div style={{ fontFamily: MIX.body, fontStyle:'italic', fontSize: 12,
                  color: MIX.inkDim, lineHeight: 1.4, textWrap:'pretty', marginBottom: 6 }}>
                  {s.pair}
                </div>
                <div style={{ fontFamily: MIX.mono, fontSize: 9.5, color: MIX.inkFaint,
                  letterSpacing:'.06em' }}>
                  ♡ {s.likes} · {s.minutes}m · {s.wm}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── 5. READER (chapter view) ─────────────────────────────────
function MixReaderMobile() {
  const { CHAPTER_TEXT } = window.HC_DATA;
  return (
    <div className="mix" style={{ width:'100%', height:'100%', background: MIX.bg,
      position:'relative', overflow:'hidden' }}>
      <MixCandle x={-40} y={140} size={220} opacity={.55}/>
      <MixCandle x={220} y={620} size={220} opacity={.5}/>

      <div style={{ position:'relative', display:'flex', justifyContent:'space-between',
        padding:'10px 18px 4px', fontFamily: MIX.mono, fontSize: 11, color: MIX.ink, opacity:.85 }}>
        <span>1:42 AM</span><span>•••○ 5G 92%</span>
      </div>

      <div style={{ padding:'4px 18px 10px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <span style={{ color: MIX.inkDim, fontSize: 18 }}>←</span>
        <div style={{ textAlign:'center', flex:1 }}>
          <div style={{ fontFamily: MIX.mono, fontSize: 9.5, letterSpacing:'.18em', color: MIX.inkDim }}>VOL.1 · CH.07</div>
          <div style={{ fontFamily: MIX.display, fontStyle:'italic', fontSize: 13, color: MIX.amber, marginTop: 1 }}>зимний свет в подземельях</div>
        </div>
        <div style={{ display:'flex', gap: 14, color: MIX.inkDim, fontSize: 14 }}>
          <span>Aa</span><span>⚙</span>
        </div>
      </div>

      <div style={{ padding:'0 18px 24px', display:'flex', alignItems:'center', gap: 10 }}>
        <div style={{ flex:1, height: 2, background: MIX.border, borderRadius: 1, overflow:'hidden' }}>
          <div style={{ width:'34%', height:'100%', background: MIX.amber }}/>
        </div>
        <span style={{ fontFamily: MIX.mono, fontSize: 9, color: MIX.inkDim, letterSpacing:'.1em' }}>стр 3 / 9</span>
      </div>

      <div style={{ padding:'4px 26px 22px' }}>
        <div style={{ fontFamily: MIX.display, fontStyle:'italic', fontSize: 13, color: MIX.amber, letterSpacing:'.04em' }}>глава седьмая</div>
        <div style={{ fontFamily: MIX.display, fontSize: 28, lineHeight: 1.0, marginTop: 6, fontWeight: 500, textWrap:'balance' }}>
          Письмо, которое <em style={{ color: MIX.amber }}>нельзя</em> было писать.
        </div>
        <div style={{ display:'flex', alignItems:'center', gap: 10, marginTop: 14 }}>
          <div style={{ flex:1, height: 1, background: MIX.borderStrong }}/>
          <span style={{ fontFamily: MIX.mono, fontSize: 9, color: MIX.inkDim, letterSpacing:'.2em' }}>✦</span>
          <div style={{ flex:1, height: 1, background: MIX.borderStrong }}/>
        </div>
      </div>

      <div style={{ padding:'0 26px 130px' }}>
        <p style={{ fontFamily: MIX.body, fontSize: 16, lineHeight: 1.6, color: MIX.ink, margin: 0, textAlign:'justify', textWrap:'pretty', hyphens:'auto' }}>
          <span style={{ fontFamily: MIX.display, fontStyle:'italic', fontWeight: 500, float:'left', fontSize: 64, lineHeight: 0.85, marginRight: 8, marginTop: 6, color: MIX.amber }}>С</span>
          {(CHAPTER_TEXT && CHAPTER_TEXT[0]) ? CHAPTER_TEXT[0].slice(1) : 'нег падал четвёртый час подряд, и в подземельях пахло влажными книгами и холодным камнем. Гермиона шла быстрее, чем обычно — не от страха, от холода. В руках было письмо, которое она не собиралась отправлять.'}
        </p>
        <p style={{ fontFamily: MIX.body, fontSize: 16, lineHeight: 1.6, color: MIX.ink, marginTop: 14, textAlign:'justify', textWrap:'pretty', hyphens:'auto' }}>
          {(CHAPTER_TEXT && CHAPTER_TEXT[1]) || 'Она вывернула из-за угла и в первую секунду не поняла, что видит. В окне — силуэт. Голова прислонена к стеклу. Один из немногих вечеров, когда в подземельях светятся все свечи. Он стоял без мантии, в одной рубашке, рука в кармане — похож не на себя.'}
        </p>
        <div style={{ display:'flex', alignItems:'center', gap: 10, margin:'18px 0' }}>
          <div style={{ flex:1, height: 1, background: MIX.border }}/>
          <span style={{ fontFamily: MIX.display, fontStyle:'italic', fontSize: 13, color: MIX.amber }}>✦</span>
          <div style={{ flex:1, height: 1, background: MIX.border }}/>
        </div>
        <p style={{ fontFamily: MIX.body, fontSize: 16, lineHeight: 1.6, color: MIX.ink, margin: 0, textAlign:'justify', textWrap:'pretty', hyphens:'auto' }}>
          {(CHAPTER_TEXT && CHAPTER_TEXT[2]) || '«Грейнджер», — сказал он, не оборачиваясь. «Если ты пришла ругаться, я очень устал». Гермиона остановилась посреди коридора. Письмо в руке вдруг стало очень тяжёлым.'}
        </p>
      </div>

      <div style={{ position:'absolute', bottom: 0, left:0, right:0, padding:'12px 16px 18px',
        background: `linear-gradient(180deg, transparent, ${MIX.bg} 30%)`, backdropFilter:'blur(10px)' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
          padding:'10px 14px', borderRadius: 14, background: MIX.surface, border:`1px solid ${MIX.border}` }}>
          <div>
            <div style={{ fontFamily: MIX.mono, fontSize: 9, letterSpacing:'.18em', color: MIX.inkDim }}>NEXT</div>
            <div style={{ fontFamily: MIX.display, fontStyle:'italic', fontSize: 14, color: MIX.ink, marginTop: 2 }}>
              гл. 8 · зеркало, которое лгало бы.
            </div>
          </div>
          <div style={{ padding:'8px 14px', borderRadius: 999,
            background: `linear-gradient(110deg, ${MIX.chrome1}, ${MIX.chrome2} 50%, ${MIX.chrome3})`,
            color: MIX.bg, fontFamily: MIX.display, fontStyle:'italic', fontSize: 12, fontWeight: 700 }}>
            ▸ watch
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── 6. WATCH MODE ─────────────────────────────────────
function MixWatchMobile() {
  return (
    <div className="mix" style={{ width:'100%', height:'100%', background:'#06030C',
      position:'relative', overflow:'hidden' }}>
      <div style={{ position:'relative', display:'flex', justifyContent:'space-between',
        padding:'10px 18px 4px', fontFamily: MIX.mono, fontSize: 11, color: MIX.ink, opacity:.7 }}>
        <span>1:42 AM</span><span>•••○ 5G 92%</span>
      </div>

      <div style={{ padding:'8px 18px 14px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <span style={{ color: MIX.inkDim, fontSize: 22 }}>×</span>
        <div style={{ textAlign:'center' }}>
          <div style={{ fontFamily: MIX.mono, fontSize: 9.5, letterSpacing:'.2em', color: MIX.inkDim }}>WATCH MODE · EP 02 / 04</div>
          <div style={{ fontFamily: MIX.display, fontStyle:'italic', fontSize: 13, color: MIX.amber, marginTop: 2 }}>
            зимний свет в подземельях
          </div>
        </div>
        <span style={{ color: MIX.inkDim, fontSize: 14 }}>⌄</span>
      </div>

      <div style={{ padding:'4px 16px 0', position:'relative' }}>
        <div style={{ position:'relative', borderRadius: 10, overflow:'hidden', aspectRatio:'16/9',
          boxShadow:'0 30px 80px rgba(0,0,0,.7), inset 0 1px 0 rgba(255,255,255,.05)',
          border:`1px solid ${MIX.borderStrong}` }}>
          <div className="mix-poster-grad-1" style={{ position:'absolute', inset:0 }}/>
          <div className="mix-grain"/>
          <div style={{ position:'absolute', left:'10%', top:'30%', width:'45%', height:'80%',
            background:`radial-gradient(circle, ${MIX.amber}88, transparent 60%)`, mixBlendMode:'screen', filter:'blur(2px)' }}/>
          <div style={{ position:'absolute', left:'24%', top:'48%', width: 4, height: 14, borderRadius: 2,
            background:`linear-gradient(180deg, ${MIX.amber}, transparent)`, boxShadow:`0 0 14px ${MIX.amber}`, transform:'translate(-50%,-50%)' }}/>
          <div className="mix-vignette"/>
          <div style={{ position:'absolute', top: 12, right: 14,
            fontFamily: MIX.mono, fontSize: 9.5, letterSpacing:'.18em', color: MIX.ink, opacity:.7 }}>
            03:42 / 04:21
          </div>
          <div style={{ position:'absolute', left: 18, right: 18, bottom: 16,
            padding:'10px 14px', borderRadius: 6,
            background:'rgba(10,5,18,.62)', backdropFilter:'blur(8px)',
            border:`1px solid rgba(229,169,90,.25)` }}>
            <div style={{ fontFamily: MIX.mono, fontSize: 8.5, letterSpacing:'.2em', color: MIX.amber, marginBottom: 4 }}>ДРАКО</div>
            <div style={{ fontFamily: MIX.display, fontStyle:'italic', fontSize: 16, lineHeight: 1.2, color: MIX.ink, textWrap:'balance' }}>
              «Грейнджер, если ты пришла ругаться, я очень <em style={{ color: MIX.amber }}>устал</em>».
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding:'18px 22px 6px' }}>
        <div style={{ position:'relative', height: 4, background: MIX.border, borderRadius: 2 }}>
          <div style={{ position:'absolute', inset:'0 14% 0 0', background: MIX.amber, borderRadius: 2 }}/>
          <div style={{ position:'absolute', left:'86%', top:'50%', transform:'translate(-50%,-50%)',
            width: 12, height: 12, background: MIX.amber, borderRadius:'50%',
            boxShadow:`0 0 0 4px ${MIX.amber}30, 0 0 16px ${MIX.amber}` }}/>
        </div>
        <div style={{ display:'flex', justifyContent:'space-between', marginTop: 8,
          fontFamily: MIX.mono, fontSize: 9.5, color: MIX.inkDim, letterSpacing:'.08em' }}>
          <span>03:42</span><span>−00:39</span>
        </div>
      </div>

      <div style={{ padding:'10px 22px 18px', display:'flex', alignItems:'center', justifyContent:'center', gap: 28 }}>
        <span style={{ color: MIX.inkDim, fontSize: 18 }}>« 10</span>
        <span style={{ color: MIX.inkDim, fontSize: 18 }}>◂◂</span>
        <div style={{ width: 60, height: 60, borderRadius:'50%',
          background: MIX.amber, color: MIX.bg,
          display:'flex', alignItems:'center', justifyContent:'center', fontSize: 24,
          boxShadow:`0 6px 24px ${MIX.amber}55` }}>‖</div>
        <span style={{ color: MIX.inkDim, fontSize: 18 }}>▸▸</span>
        <span style={{ color: MIX.inkDim, fontSize: 18 }}>10 »</span>
      </div>

      <div style={{ padding:'8px 16px 6px' }}>
        <div style={{ fontFamily: MIX.mono, fontSize: 9.5, letterSpacing:'.18em', color: MIX.inkDim, marginBottom: 10, padding:'0 4px' }}>
          ★ ЭПИЗОДЫ ГЛАВЫ 7
        </div>
        <div style={{ display:'flex', gap: 8, overflowX:'auto', padding:'0 4px 6px' }}>
          {[
            { n:'01', t:'Снег, четвёртый час', m:'4:08', state:'done' },
            { n:'02', t:'Драко у окна', m:'4:21', state:'now' },
            { n:'03', t:'Запах одеколона', m:'4:55', state:'next' },
            { n:'04', t:'Письмо', m:'4:42', state:'next' },
          ].map(ep => {
            const now = ep.state === 'now';
            const done = ep.state === 'done';
            return (
              <div key={ep.n} style={{ flex:'0 0 140px',
                padding:'10px 12px', borderRadius: 8,
                background: now ? `${MIX.amber}18` : MIX.surface,
                border: now ? `1px solid ${MIX.amber}` : `1px solid ${MIX.border}` }}>
                <div style={{ display:'flex', justifyContent:'space-between',
                  fontFamily: MIX.mono, fontSize: 9, letterSpacing:'.14em',
                  color: now ? MIX.amber : MIX.inkDim, marginBottom: 6 }}>
                  <span>EP {ep.n}{done && ' ✓'}{now && ' ●'}</span><span>{ep.m}</span>
                </div>
                <div style={{ fontFamily: MIX.display, fontStyle:'italic', fontSize: 13,
                  lineHeight: 1.15, color: now ? MIX.ink : MIX.inkDim }}>
                  {ep.t}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ position:'absolute', bottom: 0, left:0, right:0, padding:'10px 18px 18px', textAlign:'center' }}>
        <span style={{ fontFamily: MIX.body, fontStyle:'italic', fontSize: 12, color: MIX.inkDim }}>
          предпочитаешь буквы? <span style={{ color: MIX.amber, textDecoration:'underline', textDecorationColor: `${MIX.amber}55` }}>читать главу →</span>
        </span>
      </div>
    </div>
  );
}

window.MixFeedMobile = MixFeedMobile;
window.MixCreateMobile = MixCreateMobile;
window.MixStoryMobile = MixStoryMobile;
window.MixFeedDesktop = MixFeedDesktop;
window.MixReaderMobile = MixReaderMobile;
window.MixWatchMobile = MixWatchMobile;
