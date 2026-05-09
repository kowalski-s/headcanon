// Y2K Tumblr Revival — direction 2
// Vibe: Tumblr 2012 × early Pinterest × glittery × dreamcore
// Black bg + hot pink + holographic + sparkles. Times New Roman irony + Display.

const Y2K = {
  bg: '#0a0014',
  bg2: '#16001f',
  surface: '#1d0028',
  ink: '#ffe4f4',
  inkDim: 'rgba(255,228,244,.6)',
  pink: '#FF6FB5',
  hotPink: '#FF2E93',
  lavender: '#C4A0FF',
  glitter: '#FFD86F',
  cyan: '#7CF1FF',
  display: '"Tan Pearl", "Antic Didone", "Italiana", serif',
  body: '"EB Garamond", "Times New Roman", serif',
  ui: '"Inter", system-ui, sans-serif',
  mono: '"JetBrains Mono", monospace',
};

if (typeof document !== 'undefined' && !document.getElementById('y2k-styles')) {
  const s = document.createElement('style');
  s.id = 'y2k-styles';
  s.textContent = `
    .y2k { color: ${Y2K.ink}; font-family: ${Y2K.ui}; }
    .y2k * { box-sizing: border-box; }
    @keyframes y2k-spin { to { transform: rotate(360deg) } }
    @keyframes y2k-pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.06)} }
    @keyframes y2k-marq { from{transform:translateX(0)} to{transform:translateX(-50%)} }
    @keyframes y2k-twinkle { 0%,100%{opacity:.2;transform:scale(.7)} 50%{opacity:1;transform:scale(1.1)} }
    .y2k-marquee { display:flex; animation: y2k-marq 30s linear infinite; }
    .y2k-twinkle { animation: y2k-twinkle 2.4s ease-in-out infinite; }
    .y2k-rot { animation: y2k-spin 18s linear infinite; }
    .y2k-grad-pink { background: linear-gradient(135deg, #FF2E93 0%, #FF6FB5 50%, #FFA8E2 100%); }
    .y2k-grad-holo { background:
      conic-gradient(from 90deg at 50% 50%,
        #FF6FB5, #FFD86F, #7CF1FF, #C4A0FF, #FF6FB5); }
    .y2k-checker { background-image:
      linear-gradient(45deg, ${Y2K.hotPink} 25%, transparent 25%),
      linear-gradient(-45deg, ${Y2K.hotPink} 25%, transparent 25%),
      linear-gradient(45deg, transparent 75%, ${Y2K.hotPink} 75%),
      linear-gradient(-45deg, transparent 75%, ${Y2K.hotPink} 75%);
      background-size: 12px 12px;
      background-position: 0 0, 0 6px, 6px -6px, -6px 0;
    }
    .y2k-glow-pink { text-shadow: 0 0 18px rgba(255,46,147,.7), 0 0 4px rgba(255,168,226,.9); }
    .y2k-card { border:1.5px solid ${Y2K.pink}; box-shadow: 6px 6px 0 ${Y2K.hotPink}; }
    .y2k-tape { position:absolute; width:60px; height:18px; background: rgba(255,216,111,.7);
      border-left:1px dashed rgba(0,0,0,.2); border-right:1px dashed rgba(0,0,0,.2);
      mix-blend-mode: screen; }
    .y2k-cursor::after { content:'♥'; color:${Y2K.hotPink}; margin-left:2px; animation: y2k-pulse 1s infinite; }
  `;
  document.head.appendChild(s);
}

function Sparkle({ size = 10, color = Y2K.glitter, style = {} }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" style={style}>
      <path d="M10 0 L11.5 8.5 L20 10 L11.5 11.5 L10 20 L8.5 11.5 L0 10 L8.5 8.5 Z" fill={color}/>
    </svg>
  );
}

function Y2kPoster({ story, height = '100%', tape = true }) {
  const fandom = window.HC_DATA.FANDOMS.find(f => f.id === story.fandom);
  return (
    <div style={{ position:'relative', height, width:'100%', aspectRatio:'2/3' }}>
      {tape && <div className="y2k-tape" style={{ top: -6, left: '20%', transform:'rotate(-4deg)' }}/>}
      <div style={{ position:'absolute', inset:0, borderRadius: 4, overflow:'hidden',
        boxShadow: `4px 4px 0 ${Y2K.hotPink}, 0 0 30px rgba(255,46,147,.35)` }}>
        <div style={{ position:'absolute', inset:0,
          background: `linear-gradient(135deg, ${fandom.color1}, ${fandom.color2}), radial-gradient(circle at 30% 25%, rgba(255,168,226,.4), transparent 60%)`,
          backgroundBlendMode:'screen' }}/>
        <div style={{ position:'absolute', inset:0,
          background:'radial-gradient(ellipse at 50% 60%, rgba(0,0,0,.5), transparent 70%)' }}/>
        {/* dreamy rim light */}
        <div style={{ position:'absolute', inset:0,
          background:`linear-gradient(45deg, transparent 60%, rgba(255,168,226,.4) 100%)`, mixBlendMode:'screen' }}/>
        <Sparkle size={14} color={Y2K.glitter} style={{ position:'absolute', top: '20%', left: '70%' }}/>
        <Sparkle size={10} color="#fff"     style={{ position:'absolute', top: '50%', left: '20%' }}/>
        <Sparkle size={8}  color={Y2K.cyan} style={{ position:'absolute', bottom:'30%', right:'30%' }}/>
        <div style={{ position:'absolute', left:0, right:0, bottom:0, padding:'10px 10px 12px',
          background:'linear-gradient(to top, rgba(10,0,20,.85), transparent)' }}>
          <div style={{ fontFamily: Y2K.body, fontStyle:'italic', fontSize: 14, color: Y2K.ink, textWrap:'balance', lineHeight: 1.05 }}>
            {story.title}
          </div>
          <div style={{ fontFamily: Y2K.mono, fontSize: 7.5, color: Y2K.lavender, marginTop: 4, letterSpacing:'.05em' }}>
            ♡ {story.likes} · {story.pair.toLowerCase()}
          </div>
        </div>
      </div>
    </div>
  );
}

// 1. MOBILE FEED
function Y2kFeedMobile() {
  const { STORIES, FANDOMS } = window.HC_DATA;
  return (
    <div className="y2k" style={{ width:'100%', height:'100%',
      background: `radial-gradient(ellipse at 30% 0%, ${Y2K.bg2}, ${Y2K.bg} 70%)`,
      position:'relative', overflow:'hidden' }}>
      {/* twinkles */}
      {[...Array(18)].map((_, i) => (
        <Sparkle key={i} size={6 + (i%4)*2} color={i%3 ? '#fff' : Y2K.glitter}
          style={{ position:'absolute', top: `${(i*53)%95}%`, left: `${(i*37)%95}%` }}
          className="y2k-twinkle"/>
      ))}

      {/* status */}
      <div style={{ position:'relative', zIndex: 2, display:'flex', justifyContent:'space-between',
        padding:'10px 18px 4px', fontSize: 11, color: Y2K.inkDim, fontFamily: Y2K.mono }}>
        <span>1:42 AM ✦</span><span>♡♡♡ ✦</span>
      </div>

      {/* hero wordmark */}
      <div style={{ position:'relative', zIndex: 2, padding:'8px 18px 6px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div style={{ fontFamily: Y2K.display, fontStyle:'italic', fontSize: 26, fontWeight: 400, letterSpacing:'-.02em' }} className="y2k-glow-pink">
          ✦ headcanon
        </div>
        <div style={{ fontFamily: Y2K.mono, fontSize: 9, color: Y2K.cyan, letterSpacing:'.1em' }}>v.1.0 · ur ship</div>
      </div>

      {/* pink marquee strip */}
      <div className="y2k-grad-pink" style={{ overflow:'hidden', padding:'5px 0', borderTop:`1.5px solid ${Y2K.ink}`, borderBottom:`1.5px solid ${Y2K.ink}`, marginTop: 8 }}>
        <div className="y2k-marquee">
          {[...Array(2)].map((_, k) => (
            <div key={k} style={{ display:'flex', alignItems:'center', gap:18, padding:'0 18px', whiteSpace:'nowrap',
              fontFamily: Y2K.body, fontStyle:'italic', fontSize: 12, color: Y2K.bg }}>
              ✦ enemies-to-lovers ✧ slow burn ★ time travel ✦ soulmate marks ✧ fake dating ★ hurt/comfort ✦ modern AU ✧ —
            </div>
          ))}
        </div>
      </div>

      {/* fandom chips */}
      <div style={{ position:'relative', zIndex: 2, padding:'14px 18px 6px', display:'flex', gap:6, overflowX:'auto', flexWrap:'wrap' }}>
        {FANDOMS.map((f, i) => (
          <div key={f.id} style={{
            padding:'5px 10px', borderRadius: 999,
            border:`1.5px solid ${i === 0 ? Y2K.glitter : Y2K.pink}`,
            background: i === 0 ? Y2K.hotPink : 'transparent',
            color: i === 0 ? '#fff' : Y2K.pink,
            fontFamily: Y2K.body, fontStyle:'italic', fontSize: 12,
            transform: `rotate(${(i % 2 ? 1.4 : -1) * (i+1) * .4}deg)`,
            boxShadow: i === 0 ? `2px 2px 0 ${Y2K.glitter}` : 'none',
          }}>
            {i === 0 ? '★ ' : ''}{f.name}
          </div>
        ))}
      </div>

      {/* hero collage */}
      <div style={{ position:'relative', zIndex: 2, padding:'18px 18px 14px', height: 240 }}>
        <div style={{ position:'absolute', left: 18, top: 30, width: 90, transform:'rotate(-4deg)', zIndex: 1 }}>
          <Y2kPoster story={STORIES[1]}/>
        </div>
        <div style={{ position:'absolute', right: 18, top: 50, width: 78, transform:'rotate(5deg)', zIndex: 1 }}>
          <Y2kPoster story={STORIES[2]}/>
        </div>
        <div style={{ position:'absolute', left: '50%', top: 0, width: 132, transform:'translateX(-50%) rotate(-1deg)', zIndex: 2 }}>
          <Y2kPoster story={STORIES[0]}/>
        </div>
        {/* hand-drawn arrow scribble */}
        <svg style={{ position:'absolute', top: 0, right: 30, zIndex: 3 }} width="50" height="60" viewBox="0 0 50 60">
          <path d="M5 15 Q 25 5, 40 30 T 30 55" stroke={Y2K.glitter} strokeWidth="2" fill="none" strokeLinecap="round"/>
          <path d="M30 55 L 35 45 M30 55 L 22 50" stroke={Y2K.glitter} strokeWidth="2" fill="none" strokeLinecap="round"/>
        </svg>
        <div style={{ position:'absolute', top: -2, right: 80, zIndex: 4, fontFamily: Y2K.body, fontStyle:'italic', fontSize: 11, color: Y2K.glitter, transform:'rotate(-8deg)' }}>
          must read 4 ur soul!!
        </div>
      </div>

      {/* dymo style label */}
      <div style={{ position:'relative', zIndex: 2, margin:'0 18px 14px', display:'flex', alignItems:'center', gap:8 }}>
        <div style={{ background: Y2K.ink, color: Y2K.bg, padding:'3px 10px', fontFamily: Y2K.mono, fontSize:9, letterSpacing:'.18em', textTransform:'uppercase', borderRadius:2 }}>
          ★ ur ship today
        </div>
        <div style={{ flex:1, height: 1, background: Y2K.pink }}/>
      </div>

      {/* list */}
      <div style={{ position:'relative', zIndex: 2, padding:'0 18px 100px', display:'flex', flexDirection:'column', gap:14 }}>
        {STORIES.slice(3, 5).map((s, i) => {
          const f = FANDOMS.find(x => x.id === s.fandom);
          return (
            <div key={s.id} className="y2k-card" style={{
              padding:'10px', borderRadius: 6, background: 'rgba(29,0,40,.7)',
              backdropFilter:'blur(6px)', display:'flex', gap:10,
              transform: i % 2 ? 'rotate(.6deg)' : 'rotate(-.4deg)',
            }}>
              <div style={{ width: 56, flex:'0 0 56px' }}>
                <Y2kPoster story={s} tape={false}/>
              </div>
              <div style={{ flex:1, minWidth: 0 }}>
                <div style={{ display:'flex', gap: 4, marginBottom: 4, alignItems:'center' }}>
                  <span style={{ fontFamily: Y2K.mono, fontSize: 7.5, padding:'2px 5px', background: Y2K.glitter, color: Y2K.bg, letterSpacing:'.08em' }}>{f.name.toUpperCase()}</span>
                  <span style={{ fontFamily: Y2K.body, fontStyle:'italic', fontSize: 10.5, color: Y2K.lavender }}>{s.pair}</span>
                </div>
                <div style={{ fontFamily: Y2K.display, fontStyle:'italic', fontSize: 16, lineHeight: 1.05, color: Y2K.ink, marginBottom: 4 }}>
                  ✦ {s.title}
                </div>
                <div style={{ fontFamily: Y2K.body, fontStyle:'italic', fontSize: 10.5, color: Y2K.inkDim, lineHeight: 1.4, textWrap:'pretty', marginBottom: 6 }}>
                  «{s.tagline}»
                </div>
                <div style={{ display:'flex', gap:8, fontFamily: Y2K.mono, fontSize: 8.5, color: Y2K.pink, letterSpacing:'.05em' }}>
                  <span>♡ {s.likes}</span><span>·</span><span style={{ color: Y2K.cyan }}>{s.wm}</span><span>·</span><span style={{ color: Y2K.glitter }}>+remix</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* tab bar */}
      <div style={{ position:'absolute', bottom: 0, left:0, right:0, padding:'12px 18px 20px',
        background:'linear-gradient(to top, rgba(10,0,20,.95) 60%, transparent)',
        display:'flex', justifyContent:'space-around', fontFamily: Y2K.mono, fontSize: 9, letterSpacing:'.1em', textTransform:'uppercase' }}>
        {['lenta','★ make','♡ saved','me'].map((t, i) => (
          <div key={i} style={{ textAlign:'center', color: i === 0 ? Y2K.glitter : Y2K.pink }}>
            {t}
          </div>
        ))}
      </div>
    </div>
  );
}

// 2. MOBILE — CREATE
function Y2kCreateMobile() {
  const { TROPES } = window.HC_DATA;
  return (
    <div className="y2k" style={{ width:'100%', height:'100%',
      background: `radial-gradient(ellipse at 80% 100%, ${Y2K.bg2}, ${Y2K.bg} 70%)`,
      position:'relative', overflow:'hidden' }}>
      {[...Array(14)].map((_, i) => (
        <Sparkle key={i} size={5+(i%4)*2} color={['#fff', Y2K.glitter, Y2K.cyan][i%3]}
          style={{ position:'absolute', top:`${(i*43)%95}%`, left:`${(i*61)%95}%` }} className="y2k-twinkle"/>
      ))}

      {/* status */}
      <div style={{ position:'relative', zIndex: 2, display:'flex', justifyContent:'space-between',
        padding:'10px 18px 4px', fontSize: 11, color: Y2K.inkDim, fontFamily: Y2K.mono }}>
        <span>1:42 AM ✦</span><span>♡♡♡ ✦</span>
      </div>

      {/* nav */}
      <div style={{ position:'relative', zIndex: 2, padding:'10px 18px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div style={{ fontFamily: Y2K.body, fontStyle:'italic', fontSize: 22, color: Y2K.pink }}>×</div>
        <div style={{ fontFamily: Y2K.mono, fontSize: 8.5, letterSpacing:'.18em', textTransform:'uppercase', color: Y2K.lavender, padding:'4px 10px', border:`1px solid ${Y2K.lavender}`, borderRadius: 999 }}>
          ✶ act 1 / 5
        </div>
        <div style={{ fontFamily: Y2K.mono, fontSize: 9, color: Y2K.glitter }}>draft<span className="y2k-cursor"/></div>
      </div>

      {/* huge serif question */}
      <div style={{ position:'relative', zIndex: 2, padding:'12px 18px 18px' }}>
        <div className="y2k-glow-pink" style={{ fontFamily: Y2K.display, fontStyle:'italic', fontSize: 32, lineHeight: .96, color: Y2K.ink, textWrap:'balance' }}>
          who's <span style={{ color: Y2K.hotPink }}>kissing</span> who tonight?
        </div>
        <div style={{ fontFamily: Y2K.body, fontStyle:'italic', fontSize: 12, color: Y2K.inkDim, marginTop: 12, lineHeight: 1.4 }}>
          выбери пару — мы достанем все доступные тропы, заголовки и tone. ship is everything ♡
        </div>
      </div>

      {/* selected pair — sticker style */}
      <div style={{ position:'relative', zIndex: 2, margin:'0 18px 18px',
        padding: 0, transform:'rotate(-1.2deg)' }}>
        <div className="y2k-card" style={{ padding: 14, background:'linear-gradient(135deg, rgba(255,111,181,.18), rgba(196,160,255,.12))',
          borderRadius: 6, position:'relative' }}>
          <div className="y2k-tape" style={{ top: -8, right: 20, transform:'rotate(6deg)' }}/>
          <div style={{ position:'absolute', top: -10, left: -10 }}>
            <Sparkle size={22} color={Y2K.glitter}/>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap: 10 }}>
            <div style={{ width: 50, height: 50, borderRadius:'50%',
              background:'linear-gradient(135deg, #5B2A4F, #0E1A36)',
              border:`2px solid ${Y2K.glitter}` }}/>
            <div className="y2k-glow-pink" style={{ fontFamily: Y2K.display, fontStyle:'italic', fontSize: 26, color: Y2K.hotPink }}>♥</div>
            <div style={{ width: 50, height: 50, borderRadius:'50%',
              background:'linear-gradient(135deg, #2A4F5B, #1A1426)',
              border:`2px solid ${Y2K.cyan}` }}/>
            <div style={{ flex:1, marginLeft: 6 }}>
              <div style={{ fontFamily: Y2K.display, fontStyle:'italic', fontSize: 18, color: Y2K.ink }}>Drarry? Dramione?</div>
              <div style={{ fontFamily: Y2K.mono, fontSize: 8.5, color: Y2K.cyan, letterSpacing:'.06em', marginTop:2 }}>★ DRAMIONE · 7th year</div>
            </div>
          </div>
        </div>
      </div>

      {/* tropes — sticker pack */}
      <div style={{ position:'relative', zIndex: 2, padding:'0 18px' }}>
        <div style={{ display:'flex', alignItems:'center', gap: 8, marginBottom: 12 }}>
          <div style={{ background: Y2K.ink, color: Y2K.bg, padding:'3px 9px', fontFamily: Y2K.mono, fontSize: 9, letterSpacing:'.18em', textTransform:'uppercase' }}>★ tropes pack</div>
          <div style={{ flex:1, height: 1, background: Y2K.pink }}/>
          <div style={{ fontFamily: Y2K.mono, fontSize: 9, color: Y2K.glitter }}>2/3 ♥</div>
        </div>

        <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
          {TROPES.map((t, i) => {
            const sel = i === 0 || i === 1;
            const colors = [Y2K.hotPink, Y2K.lavender, Y2K.cyan, Y2K.glitter];
            const c = colors[i % 4];
            return (
              <div key={t.id} style={{
                padding:'6px 11px',
                fontFamily: Y2K.body, fontStyle:'italic', fontSize: 13,
                border: `1.5px solid ${sel ? c : 'rgba(255,228,244,.25)'}`,
                background: sel ? c : 'transparent',
                color: sel ? Y2K.bg : Y2K.ink,
                borderRadius: 999,
                transform: `rotate(${(i % 3 - 1) * 1.6}deg)`,
                boxShadow: sel ? `2px 2px 0 ${Y2K.bg}` : 'none',
              }}>
                {sel ? '★ ' : ''}{t.name}{sel ? ' ♥' : ''}
              </div>
            );
          })}
        </div>

        {/* hand-drawn note */}
        <div style={{ marginTop: 18, padding: '12px 14px', position:'relative',
          background: 'rgba(255,216,111,.08)', border:`1px dashed ${Y2K.glitter}`, borderRadius:4 }}>
          <div style={{ fontFamily: Y2K.body, fontStyle:'italic', fontSize: 12, color: Y2K.glitter, textWrap:'pretty', lineHeight: 1.4 }}>
            « enemies-to-lovers — 58% of all fics. AI auto-tunes pacing for slow burn (12+ chapters). do u trust me ♡ »
          </div>
          <div style={{ position:'absolute', bottom: -8, right: 14, fontFamily: Y2K.body, fontStyle:'italic', fontSize: 10, color: Y2K.cyan, transform:'rotate(-5deg)', background: Y2K.bg, padding:'0 6px' }}>
            — yr fav AI ♡
          </div>
        </div>
      </div>

      {/* CTA */}
      <div style={{ position:'absolute', bottom: 0, left:0, right:0, padding:'14px 18px 24px',
        background:'linear-gradient(to top, rgba(10,0,20,1) 60%, transparent)' }}>
        <div className="y2k-grad-pink" style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:10,
          padding:'14px', borderRadius: 999, color: Y2K.bg,
          fontFamily: Y2K.display, fontStyle:'italic', fontSize: 18,
          boxShadow:`4px 4px 0 ${Y2K.glitter}` }}>
          ★ next: setup ur premise ★
        </div>
        <div style={{ textAlign:'center', marginTop: 8, fontFamily: Y2K.mono, fontSize: 9, color: Y2K.lavender }}>
          or → <span style={{ color: Y2K.glitter, textDecoration:'underline' }}>let AI surprise me ♥</span>
        </div>
      </div>
    </div>
  );
}

// 3. MOBILE — STORY PAGE
function Y2kStoryMobile() {
  const { CHAPTER_LIST, STORIES } = window.HC_DATA;
  const story = STORIES[0];
  return (
    <div className="y2k" style={{ width:'100%', height:'100%',
      background: Y2K.bg, position:'relative', overflow:'hidden' }}>
      {/* hero */}
      <div style={{ position:'absolute', inset: 0, height: 320 }}>
        <div style={{ position:'absolute', inset:0,
          background:'linear-gradient(180deg, #5B2A4F, #2A0E36 50%, #0a0014)' }}/>
        <div style={{ position:'absolute', inset:0,
          background:`radial-gradient(circle at 50% 30%, rgba(255,111,181,.4), transparent 60%)` }}/>
        {[...Array(10)].map((_, i) => (
          <Sparkle key={i} size={6+(i%5)*2} color={['#fff', Y2K.glitter, Y2K.cyan, Y2K.hotPink][i%4]}
            style={{ position:'absolute', top: `${(i*23+10)%70}%`, left: `${(i*43+5)%95}%` }} className="y2k-twinkle"/>
        ))}
      </div>

      {/* status */}
      <div style={{ position:'relative', zIndex:5, display:'flex', justifyContent:'space-between',
        padding:'10px 18px 4px', fontSize: 11, color: Y2K.ink, fontFamily: Y2K.mono }}>
        <span>1:42 AM ✦</span><span>♡♡♡ ✦</span>
      </div>

      {/* nav */}
      <div style={{ position:'relative', zIndex:5, padding:'8px 18px', display:'flex', justifyContent:'space-between' }}>
        <div style={{ fontFamily: Y2K.body, fontStyle:'italic', fontSize: 16, color: Y2K.ink }}>← back</div>
        <div style={{ display:'flex', gap: 14, fontSize: 14, color: Y2K.ink }}>
          <span>♡</span><span>↗</span><span>★</span><span>⋯</span>
        </div>
      </div>

      {/* hero content */}
      <div style={{ position:'relative', zIndex:5, padding:'120px 18px 0' }}>
        <div style={{ display:'inline-flex', alignItems:'center', gap: 6, marginBottom: 12 }}>
          <Sparkle size={14} color={Y2K.glitter}/>
          <span className="y2k-grad-pink" style={{ fontFamily: Y2K.mono, fontSize: 8.5, letterSpacing:'.16em', textTransform:'uppercase', padding:'3px 8px', color: Y2K.bg, fontWeight: 700, borderRadius:2 }}>
            ★ watch · 4 ep
          </span>
          <span style={{ fontFamily: Y2K.mono, fontSize: 8.5, color: Y2K.cyan, letterSpacing:'.12em' }}>· dramione</span>
        </div>

        <div className="y2k-glow-pink" style={{ fontFamily: Y2K.display, fontStyle:'italic', fontWeight: 400,
          fontSize: 38, lineHeight: .94, color: Y2K.ink, marginBottom: 8, textWrap:'balance' }}>
          a winter that<br/>
          <span style={{ color: Y2K.hotPink }}>tastes like ✦</span><br/>
          fluorescent juniper
        </div>
        <div style={{ fontFamily: Y2K.body, fontStyle:'italic', fontSize: 12, color: Y2K.lavender, marginTop: 6 }}>
          (ru: «Зимний свет в подземельях»)
        </div>
      </div>

      {/* meta strip */}
      <div style={{ position:'relative', zIndex:5, margin:'18px 18px 0',
        padding:'10px 14px', borderRadius: 4, background:'rgba(29,0,40,.6)', backdropFilter:'blur(8px)',
        border:`1px solid ${Y2K.pink}`, boxShadow:`3px 3px 0 ${Y2K.hotPink}`,
        display:'flex', justifyContent:'space-between', alignItems:'center', fontFamily: Y2K.mono, fontSize: 10 }}>
        <span style={{ color: Y2K.pink }}>by <span style={{ color: Y2K.glitter }}>@lunaxhalf ♥</span></span>
        <span style={{ color: Y2K.pink }}>14 ch</span>
        <span style={{ color: Y2K.glitter }}>♡ 24.8k</span>
      </div>

      {/* synopsis blockquote */}
      <div style={{ position:'relative', zIndex:5, padding:'18px 18px 12px' }}>
        <div style={{ fontFamily: Y2K.body, fontStyle:'italic', fontSize: 14, color: Y2K.ink, lineHeight: 1.45, textWrap:'pretty' }}>
          <span style={{ fontSize: 26, color: Y2K.hotPink, lineHeight: 0 }}>"</span> {story.tagline} <span style={{ fontSize: 26, color: Y2K.hotPink, lineHeight: 0 }}>"</span>
        </div>
      </div>

      {/* watch banner */}
      <div className="y2k-grad-holo" style={{ position:'relative', zIndex:5, margin:'14px 18px',
        padding: 1, borderRadius: 6 }}>
        <div style={{ background: Y2K.bg, padding:'12px 14px', borderRadius: 5,
          display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div>
            <div style={{ fontFamily: Y2K.mono, fontSize: 8.5, letterSpacing:'.18em', color: Y2K.glitter }}>★ NEW</div>
            <div style={{ fontFamily: Y2K.display, fontStyle:'italic', fontSize: 17, color: Y2K.ink }}>watch as a mini-series</div>
          </div>
          <div style={{ width: 38, height: 38, borderRadius:'50%', background: Y2K.hotPink, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize: 16,
            boxShadow:`0 0 22px ${Y2K.hotPink}` }}>▶</div>
        </div>
      </div>

      {/* chapters */}
      <div style={{ position:'relative', zIndex:5, padding:'8px 18px 100px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom: 12 }}>
          <div style={{ background: Y2K.ink, color: Y2K.bg, padding:'3px 9px', fontFamily: Y2K.mono, fontSize: 9, letterSpacing:'.18em' }}>♥ CHAPTERS</div>
          <div style={{ flex:1, height:1, background: Y2K.pink }}/>
          <div style={{ fontFamily: Y2K.mono, fontSize: 9, color: Y2K.cyan }}>14 / ∞</div>
        </div>
        {CHAPTER_LIST.slice(0, 4).map((c) => {
          const reading = c.state === 'reading';
          return (
            <div key={c.n} style={{ display:'flex', alignItems:'baseline', gap: 10, padding:'10px 0',
              borderBottom:`1px dashed rgba(255,228,244,.15)`, opacity: c.state === 'lock' ? .35 : 1 }}>
              <div style={{ fontFamily: Y2K.mono, fontSize: 11, color: reading ? Y2K.glitter : Y2K.pink, letterSpacing:'.05em' }}>
                {c.n.toString().padStart(2,'0')}.
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontFamily: Y2K.body, fontStyle:'italic', fontSize: 14,
                  color: reading ? Y2K.glitter : Y2K.ink, lineHeight: 1.2 }}>
                  {reading && '✦ '}{c.t}{reading && ' ♥'}
                </div>
                <div style={{ fontFamily: Y2K.mono, fontSize: 8.5, color: Y2K.lavender, marginTop: 3, letterSpacing:'.05em' }}>
                  {c.m}min · {c.state === 'read' ? 'read ♡' : reading ? 'continue →' : 'next'}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* sticky CTA */}
      <div style={{ position:'absolute', zIndex:10, bottom:0, left:0, right:0, padding:'14px 18px 22px',
        background:'linear-gradient(to top, rgba(10,0,20,1) 60%, transparent)' }}>
        <div className="y2k-grad-pink" style={{ padding:'14px', textAlign:'center', borderRadius: 999, color: Y2K.bg,
          fontFamily: Y2K.display, fontStyle:'italic', fontSize: 18, boxShadow:`4px 4px 0 ${Y2K.glitter}` }}>
          ★ continue reading ★
        </div>
      </div>
    </div>
  );
}

// 4. DESKTOP FEED
function Y2kFeedDesktop() {
  const { STORIES, FANDOMS } = window.HC_DATA;
  return (
    <div className="y2k" style={{ width:'100%', height:'100%',
      background: `radial-gradient(ellipse at 20% 0%, ${Y2K.bg2}, ${Y2K.bg} 60%)`,
      position:'relative', overflow:'hidden' }}>
      {[...Array(28)].map((_, i) => (
        <Sparkle key={i} size={4+(i%5)*2} color={['#fff', Y2K.glitter, Y2K.cyan, Y2K.hotPink][i%4]}
          style={{ position:'absolute', top:`${(i*17)%95}%`, left:`${(i*31)%95}%` }} className="y2k-twinkle"/>
      ))}

      {/* top bar */}
      <div style={{ position:'relative', zIndex:5, padding:'14px 36px',
        display:'flex', justifyContent:'space-between', alignItems:'center',
        borderBottom:`1.5px solid ${Y2K.pink}` }}>
        <div className="y2k-glow-pink" style={{ fontFamily: Y2K.display, fontStyle:'italic', fontSize: 30 }}>
          ✦ headcanon
        </div>
        <div style={{ display:'flex', gap: 18, fontFamily: Y2K.mono, fontSize: 10, letterSpacing:'.12em', textTransform:'uppercase', color: Y2K.lavender }}>
          <span style={{ color: Y2K.glitter }}>★ feed</span>
          <span>fandoms</span>
          <span>tropes pack</span>
          <span>watch ▶</span>
          <span>my ships ♡</span>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap: 14 }}>
          <div style={{ padding:'4px 10px', border:`1px solid ${Y2K.pink}`, borderRadius: 999,
            fontFamily: Y2K.mono, fontSize: 9, color: Y2K.pink, letterSpacing:'.1em' }}>
            🔍 ship me up...
          </div>
          <div className="y2k-grad-pink" style={{ padding:'5px 12px', borderRadius: 999, color: Y2K.bg,
            fontFamily: Y2K.body, fontStyle:'italic', fontSize: 12 }}>+ new ★</div>
          <div style={{ width: 32, height: 32, borderRadius:'50%',
            background: 'linear-gradient(135deg,#FF2E93,#7CF1FF)', border:`2px solid ${Y2K.glitter}` }}/>
        </div>
      </div>

      {/* full-width holographic marquee */}
      <div className="y2k-grad-holo" style={{ overflow:'hidden', padding:'5px 0', borderBottom:`1.5px solid ${Y2K.ink}` }}>
        <div className="y2k-marquee">
          {[...Array(2)].map((_, k) => (
            <div key={k} style={{ display:'flex', alignItems:'center', gap:24, padding:'0 24px', whiteSpace:'nowrap',
              fontFamily: Y2K.body, fontStyle:'italic', fontSize: 14, color: Y2K.bg, fontWeight:600 }}>
              ✦ enemies-to-lovers · ✧ slow burn · ★ time travel · ♥ soulmate marks · ✦ fake dating · ✧ hurt/comfort · ★ modern AU · ♥ cross-fandom mashups · ✦ —
            </div>
          ))}
        </div>
      </div>

      {/* hero — broken collage layout */}
      <div style={{ position:'relative', zIndex:5, padding:'40px 36px 30px', display:'grid', gridTemplateColumns:'1.2fr 1fr', gap: 40 }}>
        <div>
          <div style={{ fontFamily: Y2K.mono, fontSize: 9, letterSpacing:'.22em', textTransform:'uppercase', color: Y2K.glitter, marginBottom: 14 }}>
            ★ ur main ship today · sat may 9
          </div>
          <div className="y2k-glow-pink" style={{ fontFamily: Y2K.display, fontStyle:'italic', fontSize: 76, lineHeight: 0.92, marginBottom: 18, textWrap:'balance' }}>
            «зимний свет в <span style={{ color: Y2K.hotPink }}>подзе-</span><br/>мельях»<span style={{ color: Y2K.cyan }}>✦</span>
          </div>
          <div style={{ fontFamily: Y2K.body, fontStyle:'italic', fontSize: 16, color: Y2K.ink, opacity:.9, lineHeight: 1.4, textWrap:'pretty', marginBottom: 24, maxWidth: 460 }}>
            «Год седьмой. Хогвартс под комендантским часом. Единственный, кто заметил её отсутствие в библиотеке — последний человек, которого она хотела бы видеть.»
          </div>
          <div style={{ display:'flex', gap: 14, alignItems:'center' }}>
            <div className="y2k-grad-pink" style={{ padding:'12px 24px', color: Y2K.bg, borderRadius: 999, fontFamily: Y2K.display, fontStyle:'italic', fontSize: 16, boxShadow: `4px 4px 0 ${Y2K.glitter}` }}>
              ★ start ch.7 ★
            </div>
            <div style={{ padding:'12px 24px', border:`1.5px solid ${Y2K.cyan}`, color: Y2K.cyan, borderRadius: 999, fontFamily: Y2K.body, fontStyle:'italic', fontSize: 14 }}>
              ▶ watch · 4 ep
            </div>
            <div style={{ fontFamily: Y2K.mono, fontSize: 10, color: Y2K.lavender, marginLeft: 10, letterSpacing:'.06em' }}>
              ♡ 24.8k · @lunaxhalf
            </div>
          </div>
        </div>
        <div style={{ position:'relative', height: 380 }}>
          <div style={{ position:'absolute', left: 30, top: 50, width: 140, transform:'rotate(-5deg)', zIndex:1 }}>
            <Y2kPoster story={STORIES[1]}/>
          </div>
          <div style={{ position:'absolute', right: 0, top: 90, width: 130, transform:'rotate(7deg)', zIndex:1 }}>
            <Y2kPoster story={STORIES[2]}/>
          </div>
          <div style={{ position:'absolute', left: '50%', top: 0, width: 200, transform:'translateX(-50%) rotate(-1.5deg)', zIndex:2 }}>
            <Y2kPoster story={STORIES[0]}/>
          </div>
          {/* ribbon */}
          <div style={{ position:'absolute', top: 14, right: 50, transform:'rotate(8deg)', zIndex:5,
            padding:'4px 12px', background: Y2K.glitter, color: Y2K.bg, fontFamily: Y2K.mono, fontSize: 10, letterSpacing:'.18em', textTransform:'uppercase', boxShadow: `3px 3px 0 ${Y2K.bg}` }}>
            ★ trending #1 ★
          </div>
        </div>
      </div>

      {/* dymo divider */}
      <div style={{ position:'relative', zIndex:5, margin:'10px 36px 14px', display:'flex', alignItems:'center', gap: 10 }}>
        <div style={{ background: Y2K.ink, color: Y2K.bg, padding:'4px 12px', fontFamily: Y2K.mono, fontSize: 11, letterSpacing:'.18em', textTransform:'uppercase' }}>
          ★ ur ships, your tropes, your 1AM
        </div>
        <div style={{ flex:1, height: 1, background: Y2K.pink }}/>
        <div style={{ fontFamily: Y2K.mono, fontSize: 10, color: Y2K.cyan }}>see all 1248 →</div>
      </div>

      {/* poster grid w/ rotation */}
      <div style={{ position:'relative', zIndex:5, padding:'4px 36px 36px', display:'grid', gridTemplateColumns:'repeat(5, 1fr)', gap: 18 }}>
        {STORIES.slice(1).map((s, i) => {
          const f = FANDOMS.find(x => x.id === s.fandom);
          return (
            <div key={s.id} style={{ transform: `rotate(${(i % 2 ? 1 : -1) * 1.4}deg)` }}>
              <Y2kPoster story={s} tape={i % 2 === 0}/>
              <div style={{ marginTop: 10 }}>
                <div style={{ fontFamily: Y2K.mono, fontSize: 8, letterSpacing:'.12em',
                  color: Y2K.bg, background: Y2K.glitter, display:'inline-block', padding:'2px 6px', textTransform:'uppercase', marginBottom: 6 }}>
                  ★ {f.name}
                </div>
                <div style={{ fontFamily: Y2K.body, fontStyle:'italic', fontSize: 13, lineHeight: 1.2, color: Y2K.ink, marginBottom: 4 }}>{s.title}</div>
                <div style={{ fontFamily: Y2K.mono, fontSize: 9, color: Y2K.pink }}>♡ {s.likes} · {s.minutes}m · {s.wm.toLowerCase()}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

window.Y2kFeedMobile = Y2kFeedMobile;
window.Y2kCreateMobile = Y2kCreateMobile;
window.Y2kStoryMobile = Y2kStoryMobile;
window.Y2kFeedDesktop = Y2kFeedDesktop;
