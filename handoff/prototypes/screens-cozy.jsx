// Cozy Cinematic — direction 1
// Vibe: A24 × Penguin Classics × Apple TV+ × Letterboxd
// Aubergine + amber + dusty rose. Fraunces / Newsreader / Inter.

const COZY = {
  bg: '#0F0E17',
  surface: '#1A1426',
  surface2: '#221A2E',
  text: '#F5EFE0',
  textDim: 'rgba(245,239,224,.55)',
  textFaint: 'rgba(245,239,224,.32)',
  amber: '#E5A95A',
  rose: '#D67890',
  border: 'rgba(245,239,224,.10)',
  borderStrong: 'rgba(245,239,224,.18)',
  display: '"Fraunces", "Instrument Serif", serif',
  body: '"Newsreader", "Source Serif Pro", Georgia, serif',
  ui: '"Inter", system-ui, sans-serif',
};

// Film-grain noise via CSS — added once
if (typeof document !== 'undefined' && !document.getElementById('cozy-styles')) {
  const s = document.createElement('style');
  s.id = 'cozy-styles';
  s.textContent = `
    .cozy { color: ${COZY.text}; font-family: ${COZY.ui}; -webkit-font-smoothing: antialiased; }
    .cozy * { box-sizing: border-box; }
    .cozy-grain::after {
      content:''; position:absolute; inset:0; pointer-events:none;
      background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='1.4' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.96  0 0 0 0 0.93  0 0 0 0 0.87  0 0 0 .14 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>");
      mix-blend-mode: overlay; opacity:.55;
    }
    .cozy-vignette::before {
      content:''; position:absolute; inset:0; pointer-events:none;
      background: radial-gradient(120% 80% at 50% 35%, transparent 40%, rgba(15,14,23,.85) 100%);
    }
    .cozy-candle {
      position:absolute; pointer-events:none;
      background: radial-gradient(circle, rgba(229,169,90,.28), rgba(229,169,90,0) 65%);
      filter: blur(8px);
    }
    @keyframes cozy-flicker { 0%,100%{opacity:.9} 50%{opacity:1} 70%{opacity:.85} }
    .cozy-candle.flicker { animation: cozy-flicker 4s ease-in-out infinite; }
    @keyframes cozy-marquee { from { transform: translateX(0) } to { transform: translateX(-50%) } }
    .cozy-marquee-row { display:flex; animation: cozy-marquee 80s linear infinite; }
    .cozy-poster { position:relative; aspect-ratio: 2/3; overflow:hidden; border-radius: 4px; }
    .cozy-poster .grain { position:absolute; inset:0; opacity:.5;
      background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='2.2' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 .12 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>");
      mix-blend-mode: overlay; pointer-events:none;
    }
    .cozy-poster .vig { position:absolute; inset:0; pointer-events:none;
      background: radial-gradient(110% 70% at 50% 35%, transparent 50%, rgba(0,0,0,.7) 100%); }
    .cozy-rule { height:1px; background: linear-gradient(to right, transparent, ${COZY.borderStrong} 30%, ${COZY.borderStrong} 70%, transparent); }
    .cozy-tabnum { font-variant-numeric: tabular-nums; letter-spacing:.04em; }
    .cozy-dropcap::first-letter {
      font-family: ${COZY.display}; font-weight: 500; font-style: italic;
      font-size: 5.4em; line-height: .82; float: left;
      color: ${COZY.amber}; padding: .12em .14em 0 0;
      text-shadow: 0 0 24px rgba(229,169,90,.35);
    }
    .cozy-link:hover { color: ${COZY.amber}; }
  `;
  document.head.appendChild(s);
}

// Mock movie poster, given fandom colors
function CozyPoster({ story, height = '100%' }) {
  const fandom = window.HC_DATA.FANDOMS.find(f => f.id === story.fandom);
  return (
    <div className="cozy-poster" style={{ height, width: '100%' }}>
      <div style={{
        position:'absolute', inset:0,
        background: `radial-gradient(120% 80% at 30% 20%, ${fandom.color1}, ${fandom.color2} 70%, #000)`,
      }}/>
      {/* faux silhouette via blurred shape */}
      <div style={{
        position:'absolute', left:'30%', top:'40%', width:'40%', height:'55%',
        background: `radial-gradient(ellipse, rgba(0,0,0,.55), transparent 70%)`,
        filter:'blur(20px)',
      }}/>
      <div className="vig"/>
      <div className="grain"/>
      {/* title block */}
      <div style={{
        position:'absolute', left:0, right:0, bottom:0, padding:'10px 12px 12px',
      }}>
        <div style={{ fontFamily: COZY.ui, fontSize:8, letterSpacing:'.18em', textTransform:'uppercase',
          color: COZY.textDim, marginBottom: 4 }}>{fandom.sub}</div>
        <div style={{ fontFamily: COZY.display, fontStyle:'italic', fontWeight:400,
          fontSize: 16, lineHeight: 1.05, color: COZY.text, textWrap:'balance' }}>{story.title}</div>
      </div>
      {/* runtime tag */}
      <div style={{
        position:'absolute', top:8, right:8,
        fontFamily: COZY.ui, fontSize:8, letterSpacing:'.16em', textTransform:'uppercase',
        background:'rgba(15,14,23,.65)', backdropFilter:'blur(4px)',
        color: COZY.amber, padding:'3px 6px', borderRadius:2, border:`1px solid ${COZY.border}`,
      }}>{story.wm}</div>
    </div>
  );
}

// ─────────────────────────────────────────────
// 1. MOBILE FEED  — cinematic poster discovery
// ─────────────────────────────────────────────
function CozyFeedMobile() {
  const { STORIES } = window.HC_DATA;
  const time = '01:42';
  return (
    <div className="cozy" style={{ width:'100%', height:'100%', background: COZY.bg, position:'relative', overflow:'hidden' }}>
      <div className="cozy-grain" style={{ position:'absolute', inset:0 }}/>
      <div className="cozy-candle flicker" style={{ width: 280, height: 280, top: -100, left: -80 }}/>
      <div className="cozy-candle flicker" style={{ width: 200, height: 200, bottom: 80, right: -60, animationDelay:'.8s' }}/>

      {/* status bar mock */}
      <div style={{ display:'flex', justifyContent:'space-between', padding:'10px 18px 4px',
        fontFamily: COZY.ui, fontSize: 11, color: COZY.textDim, letterSpacing:'.08em' }}>
        <span>{time}</span><span style={{ display:'flex', gap:6 }}><span>●●●</span><span>5G</span><span>92%</span></span>
      </div>

      {/* nav */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 18px 4px' }}>
        <div style={{ fontFamily: COZY.display, fontStyle:'italic', fontSize: 22, fontWeight:400, letterSpacing:'-.01em' }}>
          headcanon<span style={{ color: COZY.amber }}>·</span>
        </div>
        <div style={{ display:'flex', gap:10, fontSize:11, fontFamily: COZY.ui, color: COZY.textDim, letterSpacing:'.08em' }}>
          <span>Q</span><span>♡</span><span>◐</span>
        </div>
      </div>

      {/* late-night strip */}
      <div style={{ margin:'6px 18px 8px', padding:'8px 10px',
        border:`1px solid ${COZY.border}`, borderRadius: 4, fontFamily: COZY.ui,
        display:'flex', justifyContent:'space-between', alignItems:'center',
        background:'linear-gradient(to right, rgba(229,169,90,.06), transparent)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <span style={{ width:6, height:6, borderRadius:'50%', background: COZY.amber, boxShadow:`0 0 10px ${COZY.amber}` }}/>
          <span style={{ fontSize: 9.5, letterSpacing:'.18em', textTransform:'uppercase', color: COZY.text }}>late-night режим</span>
        </div>
        <span style={{ fontSize: 9.5, color: COZY.amber, fontVariantNumeric:'tabular-nums', letterSpacing:'.05em' }}>гаснет в 02:30</span>
      </div>

      {/* fandoms marquee */}
      <div style={{ overflow:'hidden', margin:'6px 0 14px', borderTop:`1px solid ${COZY.border}`, borderBottom:`1px solid ${COZY.border}`, padding:'8px 0' }}>
        <div className="cozy-marquee-row" style={{ animationDuration:'45s' }}>
          {[...window.HC_DATA.FANDOMS, ...window.HC_DATA.FANDOMS].map((f, i) => (
            <div key={i} style={{ display:'flex', alignItems:'center', gap:10, padding:'0 18px', whiteSpace:'nowrap',
              fontFamily: COZY.display, fontStyle:'italic', fontSize:14, color: i % 5 === 0 ? COZY.amber : COZY.text }}>
              {f.name} <span style={{ color: COZY.textFaint, fontFamily: COZY.ui, fontStyle:'normal', fontSize: 9, letterSpacing:'.16em' }}>· {f.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* hero poster — broken grid */}
      <div style={{ padding:'0 18px', position:'relative' }}>
        <div style={{ fontFamily: COZY.ui, fontSize: 8.5, letterSpacing:'.22em', textTransform:'uppercase', color: COZY.textDim, marginBottom: 8, display:'flex', justifyContent:'space-between' }}>
          <span>сегодня в твоей ленте</span><span style={{ color: COZY.amber }}>№ 042</span>
        </div>
        <div style={{ position:'relative', height: 230 }}>
          {/* small offset cards */}
          <div style={{ position:'absolute', left: 0, top: 18, width: 92, transform:'rotate(-2.2deg)', boxShadow:'0 18px 30px rgba(0,0,0,.5)' }}>
            <CozyPoster story={STORIES[1]}/>
          </div>
          <div style={{ position:'absolute', right: 0, top: 30, width: 86, transform:'rotate(2deg)', boxShadow:'0 18px 30px rgba(0,0,0,.5)' }}>
            <CozyPoster story={STORIES[2]}/>
          </div>
          {/* hero center */}
          <div style={{ position:'absolute', left:'50%', top: 0, width: 130, transform:'translateX(-50%)', boxShadow:'0 24px 50px rgba(0,0,0,.6), 0 0 0 1px rgba(229,169,90,.2)' }}>
            <CozyPoster story={STORIES[0]}/>
          </div>
        </div>
        <div style={{ marginTop: 16, textAlign:'center' }}>
          <div style={{ fontFamily: COZY.ui, fontSize: 8.5, letterSpacing:'.22em', textTransform:'uppercase', color: COZY.amber, marginBottom: 4 }}>main feature</div>
          <div style={{ fontFamily: COZY.display, fontStyle:'italic', fontSize: 22, lineHeight: 1.05, textWrap:'balance', padding:'0 8px' }}>
            «Зимний свет в подземельях»
          </div>
          <div style={{ fontFamily: COZY.body, fontSize: 11, color: COZY.textDim, fontStyle:'italic', marginTop: 6 }}>
            гл. 7 · enemies-to-lovers · slow burn
          </div>
        </div>
      </div>

      {/* divider */}
      <div className="cozy-rule" style={{ margin:'22px 30px 14px' }}/>

      {/* second list — editorial single column */}
      <div style={{ padding:'0 18px 18px' }}>
        <div style={{ fontFamily: COZY.ui, fontSize: 8.5, letterSpacing:'.22em', textTransform:'uppercase', color: COZY.textDim, marginBottom: 12, display:'flex', justifyContent:'space-between' }}>
          <span>в эфире сегодня</span><span>см. все →</span>
        </div>
        {STORIES.slice(3, 5).map((s) => {
          const f = window.HC_DATA.FANDOMS.find(x => x.id === s.fandom);
          return (
            <div key={s.id} style={{ display:'flex', gap:12, marginBottom: 14, alignItems:'flex-start' }}>
              <div style={{ width: 56, flex:'0 0 56px' }}>
                <CozyPoster story={s}/>
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontFamily: COZY.ui, fontSize: 8, letterSpacing:'.18em', textTransform:'uppercase', color: COZY.amber, marginBottom: 4 }}>{f.sub} · {s.pair}</div>
                <div style={{ fontFamily: COZY.display, fontStyle:'italic', fontSize: 15, lineHeight: 1.15, color: COZY.text, marginBottom: 4 }}>{s.title}</div>
                <div style={{ fontFamily: COZY.body, fontSize: 10.5, color: COZY.textDim, fontStyle:'italic', lineHeight: 1.4, textWrap:'pretty' }}>{s.tagline}</div>
                <div style={{ display:'flex', gap:10, marginTop:6, fontSize:9, fontFamily: COZY.ui, color: COZY.textFaint, letterSpacing:'.06em' }}>
                  <span className="cozy-tabnum">♡ {s.likes}</span><span>·</span><span className="cozy-tabnum">{s.minutes} мин</span><span>·</span><span style={{ color: COZY.amber }}>{s.wm}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* tab bar */}
      <div style={{ position:'absolute', bottom: 0, left:0, right:0, padding:'14px 18px 22px',
        background:'linear-gradient(to top, rgba(15,14,23,.95), rgba(15,14,23,0))',
        display:'flex', justifyContent:'space-around', fontFamily: COZY.ui, fontSize: 9, letterSpacing:'.16em', textTransform:'uppercase' }}>
        <div style={{ textAlign:'center', color: COZY.amber }}>
          <div style={{ fontSize: 14 }}>◐</div>
          <div>лента</div>
        </div>
        <div style={{ textAlign:'center', color: COZY.textDim }}>
          <div style={{ fontSize: 14 }}>✎</div>
          <div>создать</div>
        </div>
        <div style={{ textAlign:'center', color: COZY.textDim }}>
          <div style={{ fontSize: 14 }}>♡</div>
          <div>сейв</div>
        </div>
        <div style={{ textAlign:'center', color: COZY.textDim }}>
          <div style={{ fontSize: 14 }}>◯</div>
          <div>я</div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// 2. MOBILE — CREATE STORY (fandom → характеры → тропы)
// ─────────────────────────────────────────────
function CozyCreateMobile() {
  const { FANDOMS, TROPES } = window.HC_DATA;
  return (
    <div className="cozy" style={{ width:'100%', height:'100%', background: COZY.bg, position:'relative', overflow:'hidden' }}>
      <div className="cozy-grain" style={{ position:'absolute', inset:0 }}/>
      <div className="cozy-candle flicker" style={{ width: 240, height: 240, top: 200, right: -80 }}/>

      {/* status */}
      <div style={{ display:'flex', justifyContent:'space-between', padding:'10px 18px 4px',
        fontFamily: COZY.ui, fontSize: 11, color: COZY.textDim, letterSpacing:'.08em' }}>
        <span>01:42</span><span>●●● 5G 92%</span>
      </div>

      {/* header */}
      <div style={{ padding:'12px 18px 18px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div style={{ fontFamily: COZY.ui, fontSize: 18, color: COZY.textDim }}>×</div>
        <div style={{ fontFamily: COZY.ui, fontSize: 8.5, letterSpacing:'.22em', textTransform:'uppercase', color: COZY.textDim }}>акт первый</div>
        <div style={{ fontFamily: COZY.ui, fontSize: 11, color: COZY.amber, letterSpacing:'.04em' }}>черновик</div>
      </div>

      {/* progress strip — like film slate */}
      <div style={{ display:'flex', gap:6, padding:'0 18px 18px' }}>
        {['fandom','пара','тропы','завязка','глава 1'].map((step, i) => (
          <div key={step} style={{ flex:1, display:'flex', flexDirection:'column', gap:4 }}>
            <div style={{ height:2, background: i <= 1 ? COZY.amber : COZY.border }}/>
            <div style={{ fontFamily: COZY.ui, fontSize: 7.5, letterSpacing:'.14em', textTransform:'uppercase',
              color: i <= 1 ? COZY.text : COZY.textFaint }}>{step}</div>
          </div>
        ))}
      </div>

      {/* big serif question */}
      <div style={{ padding:'0 18px 22px' }}>
        <div style={{ fontFamily: COZY.display, fontStyle:'italic', fontWeight:400, fontSize: 26,
          lineHeight: 1.05, color: COZY.text, textWrap:'balance' }}>
          Чьи это будут <span style={{ color: COZY.amber }}>двое</span>, на этот раз?
        </div>
        <div style={{ fontFamily: COZY.body, fontSize: 12, fontStyle:'italic', color: COZY.textDim, marginTop:10, textWrap:'pretty', lineHeight: 1.45 }}>
          Можно выбрать пару из существующих персонажей, или вписать собственных. Ship — это первое, что делает историю.
        </div>
      </div>

      {/* selected pair card */}
      <div style={{ margin:'0 18px 16px', padding:'14px', position:'relative',
        border:`1px solid ${COZY.borderStrong}`, borderRadius: 4,
        background:'linear-gradient(135deg, rgba(229,169,90,.08), rgba(214,120,144,.05))' }}>
        <div style={{ position:'absolute', top:-7, left: 12, padding:'1px 6px', background: COZY.bg,
          fontFamily: COZY.ui, fontSize: 8, letterSpacing:'.22em', textTransform:'uppercase', color: COZY.amber }}>выбранный ship</div>
        <div style={{ display:'flex', alignItems:'center', gap:14 }}>
          <div style={{ width: 44, height: 44, borderRadius:'50%', background:`linear-gradient(135deg, #5B2A4F, #0E1A36)`, position:'relative', overflow:'hidden' }}>
            <div style={{ position:'absolute', inset:0, background:'radial-gradient(circle at 30% 30%, rgba(255,255,255,.2), transparent 50%)' }}/>
          </div>
          <div style={{ fontFamily: COZY.display, fontStyle:'italic', fontSize: 22, color: COZY.amber }}>×</div>
          <div style={{ width: 44, height: 44, borderRadius:'50%', background:`linear-gradient(135deg, #2A4F5B, #1A1426)`, position:'relative', overflow:'hidden' }}>
            <div style={{ position:'absolute', inset:0, background:'radial-gradient(circle at 30% 30%, rgba(255,255,255,.2), transparent 50%)' }}/>
          </div>
          <div style={{ flex:1, minWidth:0, marginLeft: 6 }}>
            <div style={{ fontFamily: COZY.display, fontStyle:'italic', fontSize: 16, color: COZY.text }}>Драко × Гермиона</div>
            <div style={{ fontFamily: COZY.ui, fontSize: 9, letterSpacing:'.12em', textTransform:'uppercase', color: COZY.textDim, marginTop:2 }}>dramione · hogwarts · 7-й год</div>
          </div>
        </div>
      </div>

      {/* tropes */}
      <div style={{ padding:'0 18px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom: 10 }}>
          <div style={{ fontFamily: COZY.ui, fontSize: 8.5, letterSpacing:'.22em', textTransform:'uppercase', color: COZY.textDim }}>тропы · до 3х</div>
          <div style={{ fontFamily: COZY.ui, fontSize: 9, color: COZY.amber }}>2 / 3 выбрано</div>
        </div>
        <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
          {TROPES.map((t, i) => {
            const sel = i === 0 || i === 1;
            return (
              <div key={t.id} style={{
                fontFamily: COZY.body, fontStyle: sel ? 'italic' : 'normal', fontSize: 12,
                padding:'7px 11px', borderRadius: 999,
                border:`1px solid ${sel ? COZY.amber : COZY.border}`,
                color: sel ? COZY.bg : COZY.text,
                background: sel ? COZY.amber : 'transparent',
              }}>{t.name}</div>
            );
          })}
        </div>

        {/* trope detail card for the selected */}
        <div style={{ marginTop: 18, padding:'12px 14px', borderLeft:`1.5px solid ${COZY.amber}` }}>
          <div style={{ fontFamily: COZY.display, fontStyle:'italic', fontSize: 14, color: COZY.amber, marginBottom: 4 }}>enemies-to-lovers</div>
          <div style={{ fontFamily: COZY.body, fontSize: 11.5, fontStyle:'italic', color: COZY.textDim, lineHeight:1.45, textWrap:'pretty' }}>
            Самый шерящийся троп. 58% всех публикаций. ИИ настроит первые главы на постепенное напряжение, не на быструю развязку.
          </div>
        </div>
      </div>

      {/* CTA */}
      <div style={{ position:'absolute', bottom: 0, left:0, right:0, padding:'14px 18px 28px',
        background:'linear-gradient(to top, rgba(15,14,23,1) 60%, rgba(15,14,23,0))' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
          padding:'14px 18px', borderRadius: 4,
          background: COZY.amber, color: COZY.bg }}>
          <div style={{ fontFamily: COZY.display, fontStyle:'italic', fontSize: 16 }}>Дальше — завязка</div>
          <div style={{ fontFamily: COZY.ui, fontSize: 18 }}>→</div>
        </div>
        <div style={{ textAlign:'center', marginTop: 10, fontFamily: COZY.ui, fontSize: 9.5, letterSpacing:'.14em', color: COZY.textDim, textTransform:'uppercase' }}>
          или <span style={{ color: COZY.text }}>пусть ИИ удивит</span>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// 3. MOBILE — STORY PAGE (cinema-poster preview + chapters)
// ─────────────────────────────────────────────
function CozyStoryMobile() {
  const { STORIES, CHAPTER_LIST } = window.HC_DATA;
  const story = STORIES[0];
  return (
    <div className="cozy" style={{ width:'100%', height:'100%', background: COZY.bg, position:'relative', overflow:'hidden' }}>
      <div className="cozy-grain" style={{ position:'absolute', inset:0, zIndex: 5 }}/>
      {/* Hero poster — full bleed */}
      <div style={{ position:'absolute', inset: 0, height: 360 }}>
        <div style={{ position:'absolute', inset:0,
          background:`linear-gradient(180deg, #5B2A4F 0%, #0E1A36 60%, ${COZY.bg} 100%)` }}/>
        <div style={{ position:'absolute', left:'50%', top:'25%', width:'70%', height:'60%',
          transform:'translateX(-50%)', borderRadius:'50%',
          background:'radial-gradient(circle, rgba(0,0,0,.6), transparent 65%)',
          filter:'blur(28px)' }}/>
        <div className="cozy-grain" style={{ position:'absolute', inset:0, opacity:.7 }}/>
      </div>

      {/* status */}
      <div style={{ position:'relative', zIndex:10, display:'flex', justifyContent:'space-between',
        padding:'10px 18px 4px', fontFamily: COZY.ui, fontSize: 11, color: COZY.text, letterSpacing:'.08em' }}>
        <span>01:42</span><span>●●● 5G 92%</span>
      </div>

      {/* nav */}
      <div style={{ position:'relative', zIndex:10, display:'flex', justifyContent:'space-between', padding:'12px 18px' }}>
        <div style={{ fontFamily: COZY.ui, fontSize: 14 }}>←</div>
        <div style={{ display:'flex', gap:14, fontFamily: COZY.ui, fontSize: 12, color: COZY.text }}>
          <span>♡</span><span>↗</span><span>⋯</span>
        </div>
      </div>

      {/* poster title block */}
      <div style={{ position:'relative', zIndex:10, padding:'140px 18px 0' }}>
        <div style={{ display:'inline-block', padding:'3px 8px', border:`1px solid ${COZY.amber}`, color: COZY.amber,
          fontFamily: COZY.ui, fontSize: 8.5, letterSpacing:'.22em', textTransform:'uppercase', borderRadius:2, marginBottom: 10 }}>
          {story.wm}
        </div>
        <div style={{ fontFamily: COZY.display, fontStyle:'italic', fontWeight: 400,
          fontSize: 36, lineHeight: .98, letterSpacing:'-.01em', textWrap:'balance', marginBottom: 8 }}>
          Зимний свет<br/>
          <span style={{ color: COZY.amber }}>в подземельях</span>
        </div>
        <div style={{ fontFamily: COZY.ui, fontSize: 9, letterSpacing:'.22em', textTransform:'uppercase', color: COZY.text, opacity:.85 }}>
          dramione · slow burn · enemies → lovers
        </div>
      </div>

      {/* meta row */}
      <div style={{ position:'relative', zIndex:10, padding:'14px 18px',
        display:'flex', justifyContent:'space-between', alignItems:'center',
        borderTop:`1px solid ${COZY.border}`, borderBottom:`1px solid ${COZY.border}`,
        margin:'18px 18px 0', fontFamily: COZY.ui, fontSize: 10, letterSpacing:'.06em' }}>
        <div><span style={{ color: COZY.textDim }}>авт.</span> <span style={{ color: COZY.text }}>@lunaxhalf</span></div>
        <div><span style={{ color: COZY.textDim }}>гл.</span> <span className="cozy-tabnum" style={{ color: COZY.text }}>14 / ∞</span></div>
        <div><span className="cozy-tabnum" style={{ color: COZY.amber }}>♡ 24.8k</span></div>
      </div>

      {/* synopsis */}
      <div style={{ position:'relative', zIndex:10, padding:'18px 18px 16px' }}>
        <div style={{ fontFamily: COZY.body, fontSize: 13, fontStyle:'italic', color: COZY.text, lineHeight: 1.5, textWrap:'pretty' }}>
          «{story.tagline}»
        </div>
      </div>

      {/* chapters list */}
      <div style={{ position:'relative', zIndex:10, padding:'4px 18px 100px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:10,
          fontFamily: COZY.ui, fontSize: 8.5, letterSpacing:'.22em', textTransform:'uppercase', color: COZY.textDim }}>
          <span>главы</span><span>{CHAPTER_LIST.length} опубликовано</span>
        </div>
        {CHAPTER_LIST.slice(0, 4).map((c) => {
          const reading = c.state === 'reading';
          return (
            <div key={c.n} style={{ display:'flex', alignItems:'baseline', gap:14, padding:'10px 0', borderBottom:`1px solid ${COZY.border}`,
              opacity: c.state === 'lock' ? .35 : 1 }}>
              <div className="cozy-tabnum" style={{ width: 22, fontFamily: COZY.ui, fontSize: 11,
                color: reading ? COZY.amber : COZY.textDim }}>0{c.n}</div>
              <div style={{ flex:1 }}>
                <div style={{ fontFamily: COZY.display, fontStyle:'italic', fontSize: 14,
                  color: reading ? COZY.amber : COZY.text }}>{c.t}</div>
                <div style={{ fontFamily: COZY.ui, fontSize: 9, letterSpacing:'.1em', color: COZY.textFaint, marginTop: 2 }}>{c.m} мин · {c.state === 'read' ? 'прочитано' : reading ? 'продолжить' : 'дальше'}</div>
              </div>
              {reading && <div style={{ fontFamily: COZY.ui, fontSize: 14, color: COZY.amber }}>▸</div>}
            </div>
          );
        })}
      </div>

      {/* sticky CTA */}
      <div style={{ position:'absolute', zIndex: 20, bottom:0, left:0, right:0, padding:'14px 18px 28px',
        background:'linear-gradient(to top, rgba(15,14,23,1) 60%, rgba(15,14,23,0))' }}>
        <div style={{ display:'flex', gap: 10 }}>
          <div style={{ flex:1, padding:'14px', textAlign:'center', borderRadius: 4,
            background: COZY.amber, color: COZY.bg, fontFamily: COZY.display, fontStyle:'italic', fontSize: 15 }}>Продолжить чтение</div>
          <div style={{ width: 48, padding:'14px 0', textAlign:'center', borderRadius: 4,
            border:`1px solid ${COZY.amber}`, color: COZY.amber, fontSize: 16 }}>▶</div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// 4. DESKTOP FEED  — editorial cinema editorial
// ─────────────────────────────────────────────
function CozyFeedDesktop() {
  const { STORIES, FANDOMS } = window.HC_DATA;
  return (
    <div className="cozy" style={{ width:'100%', height:'100%', background: COZY.bg, position:'relative', overflow:'hidden', fontFamily: COZY.ui }}>
      <div className="cozy-grain" style={{ position:'absolute', inset:0, zIndex: 1 }}/>
      <div className="cozy-candle flicker" style={{ width: 460, height: 460, top: -160, left: '38%' }}/>
      <div className="cozy-candle flicker" style={{ width: 320, height: 320, bottom: -120, right: 100, animationDelay:'1.2s' }}/>

      {/* Top bar */}
      <div style={{ position:'relative', zIndex: 5, display:'flex', alignItems:'center', justifyContent:'space-between',
        padding:'18px 36px', borderBottom:`1px solid ${COZY.border}` }}>
        <div style={{ display:'flex', alignItems:'baseline', gap:24 }}>
          <div style={{ fontFamily: COZY.display, fontStyle:'italic', fontSize: 26 }}>headcanon<span style={{ color: COZY.amber }}>·</span></div>
          <div style={{ display:'flex', gap:18, fontSize: 11, letterSpacing:'.16em', textTransform:'uppercase', color: COZY.textDim }}>
            <span style={{ color: COZY.amber }}>лента</span>
            <span>фандомы</span>
            <span>тропы</span>
            <span>watch</span>
          </div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:18, fontSize: 11, color: COZY.textDim, letterSpacing:'.1em' }}>
          <span style={{ display:'flex', alignItems:'center', gap:6, padding:'6px 12px', border:`1px solid ${COZY.border}`, borderRadius: 999 }}>
            <span style={{ width:5, height:5, borderRadius:'50%', background: COZY.amber, boxShadow:`0 0 10px ${COZY.amber}` }}/>
            late-night · до 02:30
          </span>
          <span style={{ fontFamily: COZY.display, fontStyle:'italic', fontSize: 13, color: COZY.text }}>создать главу</span>
          <span style={{ width: 30, height: 30, borderRadius:'50%', background:`linear-gradient(135deg, ${COZY.rose}, ${COZY.amber})` }}/>
        </div>
      </div>

      {/* Date strip */}
      <div style={{ position:'relative', zIndex: 5, padding:'10px 36px',
        display:'flex', justifyContent:'space-between',
        fontSize: 9, letterSpacing:'.22em', textTransform:'uppercase', color: COZY.textFaint, borderBottom:`1px solid ${COZY.border}` }}>
        <span>сб · 9 мая 2026 · номер сорок-два</span>
        <span>сегодня в эфире · 1 248 новых глав</span>
      </div>

      {/* Hero — broken layout */}
      <div style={{ position:'relative', zIndex: 5, padding:'40px 36px 24px',
        display:'grid', gridTemplateColumns:'1fr 240px 1fr', gap: 36, alignItems:'stretch' }}>
        <div>
          <div style={{ fontFamily: COZY.ui, fontSize: 9, letterSpacing:'.22em', textTransform:'uppercase', color: COZY.amber, marginBottom: 14 }}>main feature · фандом hogwarts</div>
          <div style={{ fontFamily: COZY.display, fontStyle:'italic', fontWeight:400, fontSize: 56, lineHeight: 0.96, letterSpacing:'-.01em', marginBottom: 18, textWrap:'balance' }}>
            Зимний свет<br/>в подземельях<span style={{ color: COZY.amber }}>.</span>
          </div>
          <div style={{ fontFamily: COZY.body, fontStyle:'italic', fontSize: 15, lineHeight: 1.5, color: COZY.textDim, textWrap:'pretty', marginBottom: 18 }}>
            Год седьмой, Хогвартс под комендантским часом, и единственный, кто заметил её отсутствие в библиотеке — последний человек, которого она хотела бы видеть.
          </div>
          <div style={{ display:'flex', gap:24, fontSize: 10, letterSpacing:'.14em', textTransform:'uppercase', color: COZY.textFaint }}>
            <span><span style={{ color: COZY.text }}>@lunaxhalf</span> · автор</span>
            <span><span style={{ color: COZY.text }}>14 глав</span></span>
            <span><span style={{ color: COZY.amber }}>♡ 24.8k</span></span>
          </div>
          <div style={{ display:'flex', gap:10, marginTop: 30 }}>
            <div style={{ padding:'12px 22px', background: COZY.amber, color: COZY.bg, borderRadius: 3,
              fontFamily: COZY.display, fontStyle:'italic', fontSize: 14 }}>Читать главу 7</div>
            <div style={{ padding:'12px 22px', border:`1px solid ${COZY.borderStrong}`, color: COZY.text, borderRadius: 3,
              fontFamily: COZY.ui, fontSize: 11, letterSpacing:'.16em', textTransform:'uppercase' }}>смотреть · 4 эп.</div>
          </div>
        </div>
        <div style={{ transform:'rotate(-1.5deg)', boxShadow:'0 30px 80px rgba(0,0,0,.6)' }}>
          <CozyPoster story={STORIES[0]}/>
        </div>
        <div style={{ display:'flex', flexDirection:'column', justifyContent:'space-between' }}>
          <div>
            <div style={{ fontFamily: COZY.ui, fontSize: 9, letterSpacing:'.22em', textTransform:'uppercase', color: COZY.textDim, marginBottom: 14 }}>сегодня поднимается</div>
            {STORIES.slice(1, 4).map((s, i) => {
              const f = FANDOMS.find(x => x.id === s.fandom);
              return (
                <div key={s.id} style={{ display:'flex', gap:12, padding:'10px 0', borderTop: i ? `1px solid ${COZY.border}` : 'none' }}>
                  <div className="cozy-tabnum" style={{ fontFamily: COZY.display, fontStyle:'italic', fontSize: 24, color: COZY.amber, width: 28 }}>0{i+2}</div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize: 8.5, letterSpacing:'.18em', textTransform:'uppercase', color: COZY.textDim, marginBottom: 3 }}>{f.sub}</div>
                    <div style={{ fontFamily: COZY.display, fontStyle:'italic', fontSize: 15, lineHeight: 1.1, marginBottom: 3 }}>{s.title}</div>
                    <div style={{ fontSize: 9.5, color: COZY.textFaint, letterSpacing:'.06em' }}>♡ {s.likes} · {s.minutes} мин · {s.wm}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="cozy-rule" style={{ margin:'10px 36px 0' }}/>

      {/* Section header */}
      <div style={{ position:'relative', zIndex: 5, padding:'24px 36px 16px', display:'flex', justifyContent:'space-between', alignItems:'baseline' }}>
        <div>
          <div style={{ fontSize: 9, letterSpacing:'.22em', textTransform:'uppercase', color: COZY.textDim, marginBottom: 6 }}>тёплый бинж · late-night collection</div>
          <div style={{ fontFamily: COZY.display, fontStyle:'italic', fontSize: 28 }}>Чтобы заснуть в три, а проснуться в восемь<span style={{ color: COZY.rose }}>.</span></div>
        </div>
        <div style={{ fontSize: 11, color: COZY.amber, letterSpacing:'.1em' }}>смотреть всё →</div>
      </div>

      {/* Poster row */}
      <div style={{ position:'relative', zIndex: 5, padding:'8px 36px 36px', display:'grid', gridTemplateColumns:'repeat(5, 1fr)', gap:18 }}>
        {STORIES.slice(1).map((s, i) => {
          const f = FANDOMS.find(x => x.id === s.fandom);
          return (
            <div key={s.id} style={{ transform: i % 2 ? 'translateY(8px)' : 'translateY(-4px)' }}>
              <CozyPoster story={s}/>
              <div style={{ marginTop: 10 }}>
                <div style={{ fontSize: 8, letterSpacing:'.18em', textTransform:'uppercase', color: COZY.amber, marginBottom: 3 }}>{f.sub}</div>
                <div style={{ fontFamily: COZY.display, fontStyle:'italic', fontSize: 13, lineHeight: 1.15, color: COZY.text, marginBottom: 4 }}>{s.title}</div>
                <div style={{ fontSize: 9, color: COZY.textFaint }}>♡ {s.likes} · {s.minutes} мин</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

window.CozyFeedMobile = CozyFeedMobile;
window.CozyCreateMobile = CozyCreateMobile;
window.CozyStoryMobile = CozyStoryMobile;
window.CozyFeedDesktop = CozyFeedDesktop;
