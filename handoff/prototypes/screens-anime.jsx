// Anime / Manga Inflected — direction 3
// Vibe: Hoyolab × Pixiv × Crunchyroll. Manga panels + ben-day dots + SFX text.
// Light theme by default, vibrant accents, kawaii-but-not-cringe.

const MNG = {
  bg: '#FAF7FF',
  bg2: '#F0EBFF',
  ink: '#0F0E1A',
  inkDim: 'rgba(15,14,26,.55)',
  inkFaint: 'rgba(15,14,26,.32)',
  paper: '#FFFFFF',
  panel: '#1A1726',
  pink: '#FF4D8B',
  cyan: '#00C2D6',
  yellow: '#FFE34A',
  violet: '#7C5BFF',
  display: '"DM Serif Display", "Noto Serif JP", serif',
  ui: '"Inter", "Noto Sans JP", system-ui, sans-serif',
  mono: '"JetBrains Mono", monospace',
  panelFont: '"Bangers", "DM Serif Display", system-ui, sans-serif',
};

if (typeof document !== 'undefined' && !document.getElementById('mng-styles')) {
  const s = document.createElement('style');
  s.id = 'mng-styles';
  s.textContent = `
    .mng { color: ${MNG.ink}; font-family: ${MNG.ui}; -webkit-font-smoothing: antialiased; }
    .mng * { box-sizing: border-box; }
    .mng-bd {
      background-image: radial-gradient(${MNG.ink} 1px, transparent 1.4px);
      background-size: 5px 5px;
    }
    .mng-bd-pink {
      background-image: radial-gradient(${MNG.pink} 1.2px, transparent 1.6px);
      background-size: 6px 6px;
    }
    .mng-screentone {
      background-image:
        repeating-linear-gradient(45deg, ${MNG.ink} 0 1px, transparent 1px 4px);
    }
    .mng-burst {
      clip-path: polygon(50% 0%,55% 14%,68% 6%,68% 20%,82% 18%,76% 30%,90% 32%,80% 42%,
        96% 48%,84% 54%,98% 64%,82% 64%,90% 78%,74% 72%,76% 88%,64% 78%,60% 96%,
        50% 84%,40% 96%,36% 78%,24% 88%,26% 72%,10% 78%,18% 64%,2% 64%,16% 54%,
        4% 48%,20% 42%,10% 32%,24% 30%,18% 18%,32% 20%,32% 6%,45% 14%);
    }
    .mng-zigzag {
      background:
        linear-gradient(135deg, ${MNG.ink} 25%, transparent 25.5%) 0 0/8px 8px,
        linear-gradient(225deg, ${MNG.ink} 25%, transparent 25.5%) 0 0/8px 8px;
    }
    @keyframes mng-pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.05)} }
    @keyframes mng-marq { from{transform:translateX(0)} to{transform:translateX(-50%)} }
    .mng-marquee { display:flex; animation: mng-marq 35s linear infinite; }
    .mng-pulse { animation: mng-pulse 2s ease-in-out infinite; }
    .mng-panel { border: 2.5px solid ${MNG.ink}; box-shadow: 4px 4px 0 ${MNG.ink}; background: ${MNG.paper}; }
    .mng-panel-y { border: 2.5px solid ${MNG.ink}; box-shadow: 4px 4px 0 ${MNG.yellow}; background: ${MNG.paper}; }
    .mng-panel-p { border: 2.5px solid ${MNG.ink}; box-shadow: 4px 4px 0 ${MNG.pink}; background: ${MNG.paper}; }
    .mng-panel-c { border: 2.5px solid ${MNG.ink}; box-shadow: 4px 4px 0 ${MNG.cyan}; background: ${MNG.paper}; }
    .mng-action-line {
      background: repeating-linear-gradient(from 0deg at 50% 50%, ${MNG.ink} 0 1deg, transparent 1deg 4deg);
    }
  `;
  document.head.appendChild(s);
}

function MngPoster({ story, accent = MNG.pink }) {
  const fandom = window.HC_DATA.FANDOMS.find(f => f.id === story.fandom);
  return (
    <div style={{ position:'relative', aspectRatio:'2/3', width:'100%',
      border:`2.5px solid ${MNG.ink}`, boxShadow:`3px 3px 0 ${accent}`, overflow:'hidden', background: MNG.paper }}>
      {/* gradient sky */}
      <div style={{ position:'absolute', inset:0,
        background: `linear-gradient(180deg, ${fandom.color1}, ${fandom.color2})` }}/>
      {/* radial action lines */}
      <div className="mng-action-line" style={{
        position:'absolute', inset:'-30%', opacity:.18 }}/>
      {/* ben-day dots overlay on bottom */}
      <div style={{ position:'absolute', left:0, right:0, bottom: '38%', height: '30%',
        background: `radial-gradient(${MNG.ink} 1px, transparent 1.5px)`, backgroundSize:'5px 5px',
        opacity:.4, mixBlendMode:'multiply' }}/>
      {/* bold band */}
      <div style={{ position:'absolute', left:0, right:0, bottom:0,
        background: MNG.ink, padding:'8px 10px' }}>
        <div style={{ fontFamily: MNG.panelFont, fontSize: 9, letterSpacing:'.15em', color: accent }}>{fandom.sub.toUpperCase()}</div>
        <div style={{ fontFamily: MNG.display, fontSize: 14, color: MNG.paper, lineHeight: 1.05, textWrap:'balance', marginTop:2 }}>{story.title}</div>
      </div>
      {/* corner sticker */}
      <div style={{ position:'absolute', top: 6, right: 6, width: 32, height: 32,
        background: accent, color: MNG.ink, display:'flex', alignItems:'center', justifyContent:'center',
        border:`2px solid ${MNG.ink}`, transform:'rotate(8deg)',
        fontFamily: MNG.panelFont, fontSize: 9, letterSpacing:'.05em', textAlign:'center', lineHeight:1 }} className="mng-burst">
        NEW!
      </div>
    </div>
  );
}

// 1. MOBILE FEED
function MngFeedMobile() {
  const { STORIES, FANDOMS } = window.HC_DATA;
  return (
    <div className="mng" style={{ width:'100%', height:'100%', background: MNG.bg, position:'relative', overflow:'hidden' }}>
      {/* halftone bg blob */}
      <div className="mng-bd-pink" style={{ position:'absolute', top: -40, right:-40, width: 220, height: 220, borderRadius:'50%', opacity:.4 }}/>
      <div className="mng-bd" style={{ position:'absolute', bottom: 200, left:-30, width: 160, height: 160, borderRadius:'50%', opacity:.18 }}/>

      {/* status */}
      <div style={{ position:'relative', zIndex:2, display:'flex', justifyContent:'space-between',
        padding:'10px 18px 4px', fontFamily: MNG.mono, fontSize: 11, color: MNG.ink }}>
        <span>1:42</span><span>●●● 5G 92%</span>
      </div>

      {/* nav */}
      <div style={{ position:'relative', zIndex:2, padding:'8px 18px 6px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div style={{ display:'flex', alignItems:'baseline', gap: 6 }}>
          <div style={{ fontFamily: MNG.display, fontSize: 26, fontWeight: 400, lineHeight:1, color: MNG.ink }}>
            head<span style={{ color: MNG.pink }}>canon</span>
          </div>
          <div style={{ width: 8, height: 8, background: MNG.pink, borderRadius:'50%' }}/>
        </div>
        <div style={{ display:'flex', gap: 8 }}>
          <div style={{ width: 32, height: 32, border: `2px solid ${MNG.ink}`, background: MNG.yellow, display:'flex', alignItems:'center', justifyContent:'center', boxShadow:`2px 2px 0 ${MNG.ink}` }}>🔍</div>
          <div style={{ width: 32, height: 32, border: `2px solid ${MNG.ink}`, background: MNG.paper, display:'flex', alignItems:'center', justifyContent:'center', boxShadow:`2px 2px 0 ${MNG.ink}`, fontSize: 16 }}>♡</div>
        </div>
      </div>

      {/* fandom chips — manga panel style */}
      <div style={{ position:'relative', zIndex:2, padding:'10px 18px 4px', display:'flex', gap: 6, overflowX:'auto' }}>
        {FANDOMS.map((f, i) => {
          const sel = i === 0;
          const colors = [MNG.pink, MNG.cyan, MNG.yellow, MNG.violet, MNG.pink];
          return (
            <div key={f.id} style={{
              padding:'5px 10px', whiteSpace:'nowrap',
              border:`2px solid ${MNG.ink}`,
              background: sel ? colors[i] : MNG.paper,
              color: MNG.ink,
              fontFamily: MNG.panelFont, fontSize: 11, letterSpacing:'.05em',
              boxShadow: sel ? `2px 2px 0 ${MNG.ink}` : 'none',
              transform: sel ? 'translate(-1px,-1px)' : 'none',
            }}>
              {sel && '☆ '}{f.name.toUpperCase()}
            </div>
          );
        })}
      </div>

      {/* hero panel — manga splash */}
      <div style={{ position:'relative', zIndex:2, padding:'14px 18px 12px' }}>
        <div className="mng-panel-p" style={{ position:'relative', overflow:'hidden', height: 250 }}>
          {/* poster image */}
          <div style={{ position:'absolute', inset:0, background: `linear-gradient(135deg, #5B2A4F, #0E1A36)` }}/>
          <div className="mng-action-line" style={{ position:'absolute', inset:'-20%', opacity:.25 }}/>
          {/* speech bubble */}
          <div style={{ position:'absolute', top: 14, left: 12, padding:'10px 14px',
            background: MNG.paper, border:`2px solid ${MNG.ink}`, maxWidth: 180,
            fontFamily: MNG.display, fontSize: 12, lineHeight: 1.2, color: MNG.ink }}>
            «Грейнджер, если ты пришла ругаться, я очень устал».
            <div style={{ position:'absolute', bottom:-12, left: 30,
              width: 0, height: 0, borderLeft:'10px solid transparent', borderRight:'10px solid transparent',
              borderTop:`12px solid ${MNG.paper}` }}/>
            <div style={{ position:'absolute', bottom:-15, left: 28,
              width: 0, height: 0, borderLeft:'12px solid transparent', borderRight:'12px solid transparent',
              borderTop:`14px solid ${MNG.ink}`, zIndex: -1 }}/>
          </div>
          {/* SFX text */}
          <div style={{ position:'absolute', right: 8, top: 60, fontFamily: MNG.panelFont, fontSize: 38,
            color: MNG.yellow, transform:'rotate(-8deg)', letterSpacing:'.04em',
            WebkitTextStroke: `2px ${MNG.ink}`, lineHeight: .9 }}>
            FWOOSH<br/><span style={{ fontSize: 22, color: MNG.pink }}>...</span>
          </div>
          {/* title strip */}
          <div style={{ position:'absolute', bottom: 0, left: 0, right: 0,
            background: MNG.ink, padding:'10px 14px', borderTop:`2px solid ${MNG.ink}` }}>
            <div style={{ fontFamily: MNG.panelFont, fontSize: 9, color: MNG.yellow, letterSpacing:'.18em' }}>VOL.1 · CH.7 · DRAMIONE</div>
            <div style={{ fontFamily: MNG.display, fontSize: 18, color: MNG.paper, lineHeight: 1.05, textWrap:'balance', marginTop: 2 }}>
              Зимний свет в подземельях
            </div>
          </div>
        </div>
        {/* SFX label below */}
        <div style={{ display:'flex', justifyContent:'space-between', marginTop: 8, fontFamily: MNG.mono, fontSize: 9.5, color: MNG.ink }}>
          <span>♡ 24.8k · 14 ch · @lunaxhalf</span>
          <span style={{ background: MNG.yellow, padding:'2px 6px', border:`1.5px solid ${MNG.ink}` }}>WATCH ▸ 4 ep</span>
        </div>
      </div>

      {/* SFX divider */}
      <div style={{ position:'relative', zIndex:2, padding:'4px 18px', display:'flex', alignItems:'center', gap:8 }}>
        <div style={{ fontFamily: MNG.panelFont, fontSize: 22, color: MNG.pink, letterSpacing:'.04em', WebkitTextStroke: `1.5px ${MNG.ink}`, lineHeight:1 }}>
          ZOOM!!
        </div>
        <div style={{ flex:1, height: 2.5, background: MNG.ink }}/>
        <div style={{ fontFamily: MNG.mono, fontSize: 9, color: MNG.ink }}>NOW TRENDING</div>
      </div>

      {/* grid 2x2 mini panels */}
      <div style={{ position:'relative', zIndex:2, padding:'10px 18px 100px', display:'grid', gridTemplateColumns:'1fr 1fr', gap: 10 }}>
        {STORIES.slice(1, 5).map((s, i) => {
          const accents = [MNG.cyan, MNG.yellow, MNG.violet, MNG.pink];
          const f = FANDOMS.find(x => x.id === s.fandom);
          return (
            <div key={s.id}>
              <MngPoster story={s} accent={accents[i]}/>
              <div style={{ marginTop: 8, fontFamily: MNG.panelFont, fontSize: 10, color: MNG.ink, letterSpacing:'.04em' }}>
                {f.name.toUpperCase()} · {s.pair.split(' × ')[0].toUpperCase()}/{s.pair.split(' × ')[1].toUpperCase()}
              </div>
              <div style={{ fontFamily: MNG.mono, fontSize: 9, color: MNG.inkDim, marginTop: 2 }}>♡ {s.likes} · {s.minutes}m</div>
            </div>
          );
        })}
      </div>

      {/* tab bar */}
      <div style={{ position:'absolute', bottom: 0, left:0, right:0, padding: '10px 14px 16px',
        background: MNG.paper, borderTop:`2.5px solid ${MNG.ink}`,
        display:'flex', justifyContent:'space-around', fontFamily: MNG.panelFont, fontSize: 10, letterSpacing:'.05em' }}>
        {[['☆','FEED', MNG.pink],['✎','MAKE', null],['♡','SAVED', null],['◯','ME', null]].map(([icon,t,c], i) => (
          <div key={i} style={{ textAlign:'center', color: c || MNG.ink }}>
            <div style={{ fontSize: 16, lineHeight: 1 }}>{icon}</div>
            <div style={{ marginTop: 2 }}>{t}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// 2. MOBILE — CREATE
function MngCreateMobile() {
  const { TROPES } = window.HC_DATA;
  return (
    <div className="mng" style={{ width:'100%', height:'100%', background: MNG.bg, position:'relative', overflow:'hidden' }}>
      <div className="mng-bd-pink" style={{ position:'absolute', top: 220, right:-30, width: 200, height: 200, borderRadius:'50%', opacity:.3 }}/>

      <div style={{ display:'flex', justifyContent:'space-between', padding:'10px 18px 4px',
        fontFamily: MNG.mono, fontSize: 11, color: MNG.ink }}>
        <span>1:42</span><span>●●● 5G 92%</span>
      </div>

      <div style={{ padding:'8px 18px 12px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div style={{ width: 30, height: 30, background: MNG.paper, border:`2px solid ${MNG.ink}`, display:'flex', alignItems:'center', justifyContent:'center',
          boxShadow:`2px 2px 0 ${MNG.ink}`, fontSize: 16 }}>×</div>
        <div style={{ fontFamily: MNG.panelFont, fontSize: 12, letterSpacing:'.16em' }}>STAGE 02 / 05</div>
        <div style={{ fontFamily: MNG.mono, fontSize: 10, color: MNG.pink }}>DRAFT</div>
      </div>

      {/* progress */}
      <div style={{ display:'flex', gap: 4, padding:'0 18px 16px' }}>
        {[1,2,3,4,5].map(n => (
          <div key={n} style={{ flex:1, height: 8, background: n <= 2 ? MNG.pink : MNG.paper,
            border:`2px solid ${MNG.ink}` }}/>
        ))}
      </div>

      {/* SFX-style title */}
      <div style={{ padding:'4px 18px 14px' }}>
        <div style={{ fontFamily: MNG.display, fontSize: 30, lineHeight: .96, color: MNG.ink, textWrap:'balance' }}>
          Подбираем <span style={{ background: MNG.yellow, padding:'0 4px', border:`2px solid ${MNG.ink}`, boxShadow:`2px 2px 0 ${MNG.ink}`, display:'inline-block', transform:'rotate(-1.5deg)' }}>пейринг</span>
        </div>
        <div style={{ fontFamily: MNG.ui, fontSize: 12, color: MNG.inkDim, marginTop: 8, lineHeight: 1.4 }}>
          Ship — главный хук. От него зависят все доступные тропы и тон главы.
        </div>
      </div>

      {/* selected pair card — manga panel */}
      <div style={{ padding:'0 18px 18px' }}>
        <div className="mng-panel-c" style={{ padding:'14px', position:'relative' }}>
          <div style={{ position:'absolute', top: -10, left: 12, padding:'2px 8px', background: MNG.cyan, border:`2px solid ${MNG.ink}`, boxShadow:`2px 2px 0 ${MNG.ink}`,
            fontFamily: MNG.panelFont, fontSize: 9, letterSpacing:'.16em' }}>SHIP CONFIRMED!</div>
          <div style={{ display:'flex', alignItems:'center', gap: 8, marginTop: 4 }}>
            <div style={{ width: 50, height: 50, background:`linear-gradient(135deg, #5B2A4F, #0E1A36)`, border:`2px solid ${MNG.ink}`,
              boxShadow:`2px 2px 0 ${MNG.ink}` }}/>
            <div style={{ fontFamily: MNG.panelFont, fontSize: 28, color: MNG.pink, WebkitTextStroke:`1.5px ${MNG.ink}` }}>×</div>
            <div style={{ width: 50, height: 50, background:`linear-gradient(135deg, #2A4F5B, #1A1426)`, border:`2px solid ${MNG.ink}`,
              boxShadow:`2px 2px 0 ${MNG.ink}` }}/>
            <div style={{ flex:1, marginLeft: 8 }}>
              <div style={{ fontFamily: MNG.display, fontSize: 18, lineHeight: 1.05 }}>Драко × Гермиона</div>
              <div style={{ fontFamily: MNG.panelFont, fontSize: 10, color: MNG.ink, letterSpacing:'.1em', marginTop: 2 }}>DRAMIONE · YEAR 7</div>
            </div>
          </div>
        </div>
      </div>

      {/* tropes — manga sticker pack */}
      <div style={{ padding:'0 18px' }}>
        <div style={{ display:'flex', alignItems:'center', gap: 8, marginBottom: 12 }}>
          <div style={{ background: MNG.ink, color: MNG.paper, padding:'4px 10px', fontFamily: MNG.panelFont, fontSize: 10, letterSpacing:'.16em' }}>
            ☆ TROPES PACK ☆
          </div>
          <div style={{ flex:1, height: 2, background: MNG.ink }}/>
          <div style={{ fontFamily: MNG.mono, fontSize: 10 }}>2/3</div>
        </div>

        <div style={{ display:'flex', flexWrap:'wrap', gap: 8 }}>
          {TROPES.map((t, i) => {
            const sel = i === 0 || i === 1;
            const colors = [MNG.pink, MNG.yellow, MNG.cyan, MNG.violet, MNG.pink, MNG.cyan, MNG.yellow, MNG.violet];
            const c = colors[i];
            return (
              <div key={t.id} style={{
                padding:'6px 11px',
                background: sel ? c : MNG.paper,
                border: `2px solid ${MNG.ink}`,
                fontFamily: MNG.panelFont, fontSize: 11, letterSpacing:'.04em', color: MNG.ink,
                boxShadow: sel ? `2px 2px 0 ${MNG.ink}` : 'none',
                transform: sel ? 'translate(-1px,-1px) rotate(-1deg)' : `rotate(${(i%2?1:-1)*0.6}deg)`,
              }}>
                {sel ? '★ ' : ''}{t.name.toUpperCase()}
              </div>
            );
          })}
        </div>

        {/* speech bubble — AI tip */}
        <div style={{ marginTop: 22, position:'relative', padding:'12px 14px', background: MNG.paper,
          border:`2px solid ${MNG.ink}`, boxShadow: `3px 3px 0 ${MNG.ink}` }}>
          <div style={{ position:'absolute', top: -10, left: 16, padding:'2px 8px', background: MNG.yellow, border:`2px solid ${MNG.ink}`,
            fontFamily: MNG.panelFont, fontSize: 9, letterSpacing:'.14em' }}>AI SENSEI ✦</div>
          <div style={{ fontFamily: MNG.ui, fontSize: 12, lineHeight: 1.5, color: MNG.ink, marginTop: 4 }}>
            «<b>Enemies-to-lovers</b> + <b>slow burn</b> = 12+ глав. Я разгоню напряжение медленно. Готова ждать?»
          </div>
        </div>
      </div>

      {/* CTA */}
      <div style={{ position:'absolute', bottom: 0, left:0, right:0, padding:'12px 18px 18px',
        background: MNG.bg, borderTop:`2.5px solid ${MNG.ink}` }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
          padding:'14px', background: MNG.pink, border:`2.5px solid ${MNG.ink}`, boxShadow:`4px 4px 0 ${MNG.ink}`,
          fontFamily: MNG.display, fontSize: 18, color: MNG.paper }}>
          <span>NEXT → завязка</span>
          <span style={{ fontFamily: MNG.panelFont, fontSize: 22, WebkitTextStroke: `1px ${MNG.paper}` }}>→</span>
        </div>
      </div>
    </div>
  );
}

// 3. MOBILE — STORY PAGE
function MngStoryMobile() {
  const { CHAPTER_LIST, STORIES } = window.HC_DATA;
  const story = STORIES[0];
  return (
    <div className="mng" style={{ width:'100%', height:'100%', background: MNG.bg, position:'relative', overflow:'hidden' }}>
      <div style={{ display:'flex', justifyContent:'space-between', padding:'10px 18px 4px',
        fontFamily: MNG.mono, fontSize: 11, color: MNG.ink }}>
        <span>1:42</span><span>●●● 5G 92%</span>
      </div>

      <div style={{ padding:'8px 18px', display:'flex', justifyContent:'space-between' }}>
        <div style={{ width: 30, height: 30, background: MNG.paper, border:`2px solid ${MNG.ink}`,
          boxShadow:`2px 2px 0 ${MNG.ink}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:14 }}>←</div>
        <div style={{ display:'flex', gap: 6 }}>
          {['♡','↗','⋯'].map((g, i) => (
            <div key={i} style={{ width: 30, height: 30, background: i === 0 ? MNG.pink : MNG.paper, border:`2px solid ${MNG.ink}`,
              boxShadow:`2px 2px 0 ${MNG.ink}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, color: i === 0 ? MNG.paper : MNG.ink }}>{g}</div>
          ))}
        </div>
      </div>

      {/* hero — manga style cover */}
      <div style={{ padding:'12px 18px 14px' }}>
        <div className="mng-panel-p" style={{ position:'relative', overflow:'hidden', aspectRatio:'4/3' }}>
          <div style={{ position:'absolute', inset:0, background:'linear-gradient(135deg, #5B2A4F, #0E1A36)' }}/>
          <div className="mng-action-line" style={{ position:'absolute', inset:'-30%', opacity:.2 }}/>
          {/* halftone gradient */}
          <div style={{ position:'absolute', left:0, right:0, bottom:0, height:'60%',
            background:`radial-gradient(${MNG.ink} 1.2px, transparent 1.6px)`, backgroundSize:'5px 5px',
            opacity:.5, mixBlendMode:'multiply' }}/>
          {/* SFX */}
          <div style={{ position:'absolute', top: 14, right: 10, fontFamily: MNG.panelFont, fontSize: 30,
            color: MNG.yellow, transform:'rotate(8deg)', WebkitTextStroke: `2px ${MNG.ink}`, lineHeight: .9, letterSpacing:'.04em' }}>
            !!!
          </div>
          {/* corner stamp */}
          <div className="mng-burst" style={{ position:'absolute', top: 8, left: 8, width: 60, height: 60,
            background: MNG.yellow, color: MNG.ink, border: `2px solid ${MNG.ink}`,
            display:'flex', alignItems:'center', justifyContent:'center', textAlign:'center',
            fontFamily: MNG.panelFont, fontSize: 9, letterSpacing:'.05em', lineHeight: 1, transform:'rotate(-8deg)' }}>
            <div>MUST<br/>READ<br/>VOL.1</div>
          </div>
        </div>
      </div>

      {/* title block */}
      <div style={{ padding:'0 18px' }}>
        <div style={{ fontFamily: MNG.panelFont, fontSize: 11, letterSpacing:'.16em', color: MNG.pink, marginBottom: 6 }}>VOL.1 · DRAMIONE · 14 CH</div>
        <div style={{ fontFamily: MNG.display, fontSize: 32, lineHeight: 0.96, textWrap:'balance', color: MNG.ink }}>
          Зимний свет<br/>в подземельях
        </div>
        <div style={{ fontFamily: MNG.ui, fontSize: 12, color: MNG.inkDim, marginTop: 8, lineHeight: 1.5, textWrap:'pretty' }}>
          {story.tagline}
        </div>
      </div>

      {/* meta panel */}
      <div style={{ padding:'14px 18px' }}>
        <div className="mng-panel-y" style={{ display:'flex', justifyContent:'space-around', padding:'10px',
          fontFamily: MNG.mono, fontSize: 10, color: MNG.ink }}>
          <div><div style={{ color: MNG.inkDim, fontSize: 8 }}>AUTHOR</div>@lunaxhalf</div>
          <div><div style={{ color: MNG.inkDim, fontSize: 8 }}>CHAPTERS</div>14 / ∞</div>
          <div><div style={{ color: MNG.inkDim, fontSize: 8 }}>LIKES</div>♡ 24.8k</div>
        </div>
      </div>

      {/* watch CTA panel */}
      <div style={{ padding:'0 18px 14px' }}>
        <div style={{ display:'flex', gap: 8 }}>
          <div className="mng-panel" style={{ flex: 1, padding:'12px 14px', background: MNG.ink, color: MNG.paper, position:'relative' }}>
            <div style={{ fontFamily: MNG.panelFont, fontSize: 9, letterSpacing:'.18em', color: MNG.yellow }}>★ NEW</div>
            <div style={{ fontFamily: MNG.display, fontSize: 16, lineHeight: 1.05, marginTop: 2 }}>WATCH MODE</div>
            <div style={{ fontFamily: MNG.mono, fontSize: 9, color: MNG.cyan, marginTop: 4 }}>4 EP · 18 MIN</div>
          </div>
          <div style={{ width: 64, background: MNG.pink, border:`2.5px solid ${MNG.ink}`, boxShadow:`4px 4px 0 ${MNG.ink}`,
            display:'flex', alignItems:'center', justifyContent:'center', fontSize: 24, color: MNG.paper }}>▶</div>
        </div>
      </div>

      {/* chapters as panel rows */}
      <div style={{ padding:'4px 18px 100px' }}>
        <div style={{ display:'flex', alignItems:'center', gap: 8, marginBottom: 10 }}>
          <div style={{ background: MNG.ink, color: MNG.paper, padding:'3px 10px',
            fontFamily: MNG.panelFont, fontSize: 10, letterSpacing:'.16em' }}>★ CHAPTERS</div>
          <div style={{ flex:1, height: 2, background: MNG.ink }}/>
        </div>
        {CHAPTER_LIST.slice(0, 4).map((c) => {
          const reading = c.state === 'reading';
          return (
            <div key={c.n} style={{
              display:'flex', alignItems:'stretch', gap: 8, marginBottom: 8,
              opacity: c.state === 'lock' ? .35 : 1 }}>
              <div style={{ width: 44, background: reading ? MNG.pink : MNG.paper, border:`2px solid ${MNG.ink}`,
                display:'flex', alignItems:'center', justifyContent:'center',
                fontFamily: MNG.panelFont, fontSize: 16, color: reading ? MNG.paper : MNG.ink, boxShadow:`2px 2px 0 ${MNG.ink}` }}>
                {c.n.toString().padStart(2,'0')}
              </div>
              <div style={{ flex:1, padding:'8px 10px', background: MNG.paper, border:`2px solid ${MNG.ink}`,
                boxShadow:`2px 2px 0 ${MNG.ink}` }}>
                <div style={{ fontFamily: MNG.display, fontSize: 14, lineHeight: 1.1, color: MNG.ink }}>{c.t}</div>
                <div style={{ fontFamily: MNG.mono, fontSize: 9, color: MNG.inkDim, marginTop: 2 }}>
                  {c.m}m · {c.state === 'read' ? 'прочитано ✓' : reading ? 'продолжить →' : 'дальше'}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* sticky CTA */}
      <div style={{ position:'absolute', bottom: 0, left:0, right:0, padding:'12px 18px 18px',
        background: MNG.bg, borderTop:`2.5px solid ${MNG.ink}` }}>
        <div style={{ padding:'14px', background: MNG.pink, border:`2.5px solid ${MNG.ink}`, boxShadow:`4px 4px 0 ${MNG.ink}`,
          fontFamily: MNG.display, fontSize: 18, color: MNG.paper, textAlign:'center' }}>
          ☆ ПРОДОЛЖИТЬ ГЛ. 7 ☆
        </div>
      </div>
    </div>
  );
}

// 4. DESKTOP FEED
function MngFeedDesktop() {
  const { STORIES, FANDOMS } = window.HC_DATA;
  return (
    <div className="mng" style={{ width:'100%', height:'100%', background: MNG.bg, position:'relative', overflow:'hidden' }}>
      <div className="mng-bd-pink" style={{ position:'absolute', top: -100, right: -100, width: 400, height: 400, borderRadius:'50%', opacity:.3 }}/>
      <div className="mng-bd" style={{ position:'absolute', bottom: 200, left: -80, width: 240, height: 240, borderRadius:'50%', opacity:.18 }}/>

      {/* top bar */}
      <div style={{ position:'relative', zIndex:5, padding:'14px 36px',
        display:'flex', justifyContent:'space-between', alignItems:'center', borderBottom:`2.5px solid ${MNG.ink}`, background: MNG.paper }}>
        <div style={{ display:'flex', alignItems:'baseline', gap: 24 }}>
          <div style={{ fontFamily: MNG.display, fontSize: 32, lineHeight: 1, color: MNG.ink }}>
            head<span style={{ color: MNG.pink }}>canon</span>
            <span style={{ display:'inline-block', marginLeft: 4, width: 8, height: 8, background: MNG.pink, borderRadius:'50%' }}/>
          </div>
          <div style={{ display:'flex', gap: 14, fontFamily: MNG.panelFont, fontSize: 12, letterSpacing:'.1em', color: MNG.ink }}>
            <span style={{ background: MNG.yellow, padding:'2px 8px', border:`2px solid ${MNG.ink}` }}>☆ FEED</span>
            <span>FANDOMS</span>
            <span>TROPES</span>
            <span>WATCH ▸</span>
          </div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap: 12 }}>
          <div style={{ padding:'6px 14px', border:`2px solid ${MNG.ink}`, fontFamily: MNG.mono, fontSize: 10, letterSpacing:'.06em', color: MNG.inkDim }}>
            🔍 ship me up...
          </div>
          <div style={{ padding:'6px 14px', background: MNG.pink, border:`2px solid ${MNG.ink}`, boxShadow:`2px 2px 0 ${MNG.ink}`,
            fontFamily: MNG.display, fontSize: 14, color: MNG.paper }}>+ NEW ☆</div>
          <div style={{ width: 36, height: 36, background:`linear-gradient(135deg,${MNG.pink},${MNG.cyan})`, border:`2px solid ${MNG.ink}`,
            boxShadow:`2px 2px 0 ${MNG.ink}` }}/>
        </div>
      </div>

      {/* yellow marquee strip */}
      <div style={{ overflow:'hidden', padding:'5px 0', background: MNG.yellow, borderBottom:`2.5px solid ${MNG.ink}` }}>
        <div className="mng-marquee">
          {[...Array(2)].map((_, k) => (
            <div key={k} style={{ display:'flex', alignItems:'center', gap: 28, padding:'0 28px', whiteSpace:'nowrap',
              fontFamily: MNG.panelFont, fontSize: 14, color: MNG.ink, letterSpacing:'.04em' }}>
              ☆ ENEMIES-TO-LOVERS ★ SLOW BURN ☆ TIME TRAVEL ★ SOULMATE MARKS ☆ FAKE DATING ★ HURT/COMFORT ☆ MODERN AU ★ —
            </div>
          ))}
        </div>
      </div>

      {/* hero — splash panel */}
      <div style={{ position:'relative', zIndex:5, padding:'30px 36px 20px',
        display:'grid', gridTemplateColumns:'1.1fr 1fr', gap: 30, alignItems:'center' }}>
        <div>
          <div style={{ fontFamily: MNG.panelFont, fontSize: 12, letterSpacing:'.18em', color: MNG.pink, marginBottom: 16,
            display:'inline-block', background: MNG.paper, padding:'4px 10px', border:`2px solid ${MNG.ink}`, boxShadow:`2px 2px 0 ${MNG.ink}` }}>
            ★ TODAY'S MAIN STORY ★
          </div>
          <div style={{ fontFamily: MNG.display, fontSize: 78, lineHeight: 0.92, color: MNG.ink, textWrap:'balance', marginBottom: 18 }}>
            «Зимний свет<br/>в <span style={{ background: MNG.pink, color: MNG.paper, padding:'0 8px', display:'inline-block', transform:'rotate(-1deg)', border:`3px solid ${MNG.ink}`, boxShadow:`4px 4px 0 ${MNG.ink}` }}>подзе-</span><br/>мельях».
          </div>
          <div style={{ fontFamily: MNG.ui, fontSize: 15, lineHeight: 1.5, color: MNG.ink, opacity:.85, textWrap:'pretty', maxWidth: 520, marginBottom: 26 }}>
            Год седьмой, Хогвартс под комендантским часом, и единственный, кто заметил её отсутствие — последний человек, которого она хотела бы видеть.
          </div>
          <div style={{ display:'flex', gap: 12, alignItems:'center' }}>
            <div style={{ padding:'12px 22px', background: MNG.ink, color: MNG.paper,
              fontFamily: MNG.display, fontSize: 16, border:`2.5px solid ${MNG.ink}`, boxShadow:`4px 4px 0 ${MNG.pink}` }}>
              ☆ ЧИТАТЬ ГЛ.7 ☆
            </div>
            <div style={{ padding:'12px 22px', background: MNG.cyan, fontFamily: MNG.display, fontSize: 14,
              border:`2.5px solid ${MNG.ink}`, boxShadow:`4px 4px 0 ${MNG.ink}`, color: MNG.ink }}>
              ▶ WATCH · 4 EP
            </div>
            <div style={{ fontFamily: MNG.mono, fontSize: 11, color: MNG.inkDim, marginLeft: 8 }}>
              ♡ 24.8K · @LUNAXHALF · 14 ch
            </div>
          </div>
        </div>
        {/* splash panel */}
        <div className="mng-panel-p" style={{ position:'relative', overflow:'hidden', aspectRatio:'4/3' }}>
          <div style={{ position:'absolute', inset: 0, background:'linear-gradient(135deg, #5B2A4F, #0E1A36)' }}/>
          <div className="mng-action-line" style={{ position:'absolute', inset:'-30%', opacity:.25 }}/>
          {/* speech bubble */}
          <div style={{ position:'absolute', top: 28, left: 28, padding:'12px 16px',
            background: MNG.paper, border:`2.5px solid ${MNG.ink}`, maxWidth: 220 }}>
            <div style={{ fontFamily: MNG.display, fontSize: 14, lineHeight: 1.2, color: MNG.ink }}>
              «Грейнджер, если ты пришла ругаться, я очень устал».
            </div>
            <div style={{ position:'absolute', bottom:-16, left: 40,
              width:0, height:0, borderLeft:'14px solid transparent', borderRight:'14px solid transparent', borderTop:`16px solid ${MNG.paper}` }}/>
          </div>
          <div style={{ position:'absolute', right: 30, bottom: 36, fontFamily: MNG.panelFont, fontSize: 64, color: MNG.yellow,
            transform:'rotate(-8deg)', WebkitTextStroke: `3px ${MNG.ink}`, lineHeight: .85, letterSpacing:'.04em' }}>
            FWOOSH<br/><span style={{ fontSize: 38, color: MNG.pink, WebkitTextStroke:`2.5px ${MNG.ink}` }}>...!!!</span>
          </div>
          {/* halftone overlay */}
          <div style={{ position:'absolute', left:0, right:0, bottom:0, height:'45%',
            background:`radial-gradient(${MNG.ink} 1.2px, transparent 1.6px)`, backgroundSize:'5px 5px',
            opacity:.4, mixBlendMode:'multiply' }}/>
          <div className="mng-burst" style={{ position:'absolute', top: -6, right: -6, width: 80, height: 80,
            background: MNG.yellow, border: `2.5px solid ${MNG.ink}`,
            display:'flex', alignItems:'center', justifyContent:'center', textAlign:'center',
            fontFamily: MNG.panelFont, fontSize: 11, letterSpacing:'.05em', lineHeight: 1, transform:'rotate(8deg)' }}>
            <div>MUST<br/>READ!!</div>
          </div>
        </div>
      </div>

      {/* dymo divider */}
      <div style={{ position:'relative', zIndex:5, padding:'14px 36px 8px',
        display:'flex', alignItems:'center', gap: 12 }}>
        <div style={{ background: MNG.ink, color: MNG.paper, padding:'4px 12px',
          fontFamily: MNG.panelFont, fontSize: 12, letterSpacing:'.16em' }}>★ ZOOM!! NOW TRENDING</div>
        <div style={{ flex:1, height: 2.5, background: MNG.ink }}/>
        <div style={{ fontFamily: MNG.mono, fontSize: 10 }}>SEE ALL 1248 →</div>
      </div>

      {/* poster grid as manga panel page */}
      <div style={{ position:'relative', zIndex:5, padding:'10px 36px 36px',
        display:'grid', gridTemplateColumns:'repeat(5, 1fr)', gap: 18 }}>
        {STORIES.slice(1).map((s, i) => {
          const accents = [MNG.cyan, MNG.yellow, MNG.violet, MNG.pink, MNG.cyan];
          const f = FANDOMS.find(x => x.id === s.fandom);
          return (
            <div key={s.id} style={{ transform: `rotate(${(i % 2 ? 1 : -1) * 0.8}deg)` }}>
              <MngPoster story={s} accent={accents[i]}/>
              <div style={{ marginTop: 10 }}>
                <div style={{ display:'inline-block', background: accents[i], color: MNG.ink,
                  padding:'2px 8px', border:`1.5px solid ${MNG.ink}`, fontFamily: MNG.panelFont, fontSize: 10, letterSpacing:'.1em', marginBottom: 6 }}>
                  ☆ {f.name.toUpperCase()}
                </div>
                <div style={{ fontFamily: MNG.display, fontSize: 14, lineHeight: 1.15, color: MNG.ink, marginBottom: 4 }}>{s.title}</div>
                <div style={{ fontFamily: MNG.mono, fontSize: 9, color: MNG.inkDim }}>♡ {s.likes} · {s.minutes}M · {s.wm}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

window.MngFeedMobile = MngFeedMobile;
window.MngCreateMobile = MngCreateMobile;
window.MngStoryMobile = MngStoryMobile;
window.MngFeedDesktop = MngFeedDesktop;
