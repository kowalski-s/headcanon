// Pivot v2 — Writer platform. Editor screens (desktop 3-pane + mobile).
// Light/dark theme via prop. Reuses .mix font vars + helper classes.

function pvT(light) {
  return light ? {
    light: true,
    bg: '#EDE4D4', surface: '#F7F1E4', panel: '#F2EADA',
    ink: '#241830', inkDim: '#6E5F7E', inkFaint: '#9C8FA8',
    amber: '#A8691F', amberBright: '#C77E2E', amberSoft: 'rgba(168,105,31,.12)',
    rose: '#B25068',
    border: 'rgba(36,24,48,.10)', borderStrong: 'rgba(36,24,48,.20)',
    chrome: 'linear-gradient(110deg,#8FA3C4,#C77E2E 50%,#B25068)',
    glow: 'rgba(199,126,46,.18)',
    shadow: '0 10px 30px rgba(36,24,48,.12)',
  } : {
    light: false,
    bg: '#160B22', surface: '#1F1230', panel: '#1A0E29',
    ink: '#F5EFE0', inkDim: '#A89BB5', inkFaint: '#6E6478',
    amber: '#E5A95A', amberBright: '#E5A95A', amberSoft: 'rgba(229,169,90,.14)',
    rose: '#D67890',
    border: 'rgba(245,239,224,.10)', borderStrong: 'rgba(245,239,224,.20)',
    chrome: 'linear-gradient(110deg,#C9D4E8,#E5A95A 50%,#D67890)',
    glow: 'rgba(229,169,90,.22)',
    shadow: '0 10px 30px rgba(0,0,0,.5)',
  };
}

const PV_FONT = {
  display: 'var(--mix-display)', body: 'var(--mix-body)',
  ui: 'var(--mix-ui)', mono: '"JetBrains Mono", monospace',
};

// ── small bits ────────────────────────────────────────────────
function PvMono({ children, c, size = 9.5, ls = '.18em', style = {} }) {
  return <span style={{ fontFamily: PV_FONT.mono, fontSize: size, letterSpacing: ls,
    textTransform:'uppercase', color: c, ...style }}>{children}</span>;
}

const PV_CHAPTERS = [
  { n: '01', t: 'Совы летят на север',     w: '2 140' },
  { n: '02', t: 'Чай у мадам Помфри',      w: '1 870' },
  { n: '03', t: 'Список запретов',          w: '2 412' },
  { n: '04', t: 'Нумерология и грозы',     w: '2 056' },
  { n: '05', t: 'Снег на четвёртом этаже', w: '1 633' },
  { n: '06', t: 'Что не сказала Лаванда',  w: '2 208' },
  { n: '07', t: 'Письмо, которое нельзя…', w: '1 124', active: true },
];

// ── 1. DESKTOP EDITOR — 3 panes ───────────────────────────────
function PvEditorDesktop({ light = false }) {
  const T = pvT(light);
  return (
    <div className="mix" style={{ width:'100%', height:'100%', background: T.bg,
      position:'relative', overflow:'hidden', display:'flex', flexDirection:'column' }}>
      {!light && <div style={{ position:'absolute', left:'30%', top:-120, width: 380, height: 380,
        background:`radial-gradient(circle, ${T.glow}, transparent 65%)`, pointerEvents:'none' }}/>}

      {/* ── top bar ── */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
        padding:'12px 20px', borderBottom:`1px solid ${T.border}`, position:'relative', zIndex: 10 }}>
        <div style={{ display:'flex', alignItems:'center', gap: 16 }}>
          <div style={{ display:'flex', alignItems:'baseline', gap: 3 }}>
            <span style={{ fontFamily: PV_FONT.display, fontStyle:'italic', fontSize: 19, color: T.ink }}>head</span>
            <span className="mix-chrome" style={{ fontFamily: PV_FONT.display, fontSize: 19, fontWeight: 600 }}>canon</span>
          </div>
          <span style={{ color: T.inkFaint }}>/</span>
          <div style={{ display:'flex', alignItems:'center', gap: 8 }}>
            <span style={{ fontFamily: PV_FONT.display, fontStyle:'italic', fontSize: 14, color: T.ink }}>
              Зимний свет в подземельях
            </span>
            <PvMono c={T.inkFaint} size={9}>draft</PvMono>
          </div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap: 14 }}>
          <PvMono c={T.inkDim} size={9.5} style={{ display:'flex', alignItems:'center', gap: 5 }}>
            <span style={{ width: 5, height: 5, borderRadius:'50%', background: T.amber, display:'inline-block' }}/>
            сохранено · 1:42
          </PvMono>
          {/* theme toggle */}
          <div style={{ display:'flex', borderRadius: 999, border:`1px solid ${T.border}`, overflow:'hidden' }}>
            <span style={{ padding:'4px 10px', fontSize: 11, background: light ? 'transparent' : T.amber,
              color: light ? T.inkDim : T.bg }}>☾</span>
            <span style={{ padding:'4px 10px', fontSize: 11, background: light ? T.amber : 'transparent',
              color: light ? '#fff' : T.inkDim }}>☀</span>
          </div>
          <span style={{ fontFamily: PV_FONT.ui, fontSize: 12, color: T.inkDim }}>фокус ⤢</span>
          <div style={{ padding:'7px 16px', borderRadius: 999, background: T.amberBright, color: light ? '#fff' : T.bg,
            fontFamily: PV_FONT.display, fontStyle:'italic', fontSize: 13, fontWeight: 600 }}>
            опубликовать гл. 7
          </div>
        </div>
      </div>

      {/* ── 3 panes ── */}
      <div style={{ flex:1, display:'grid', gridTemplateColumns:'232px 1fr 304px', minHeight: 0 }}>

        {/* LEFT — structure */}
        <div style={{ borderRight:`1px solid ${T.border}`, padding:'16px 0', overflow:'hidden',
          display:'flex', flexDirection:'column', background: light ? 'rgba(36,24,48,.025)' : 'rgba(0,0,0,.18)' }}>
          <div style={{ padding:'0 16px 12px', display:'flex', justifyContent:'space-between', alignItems:'baseline' }}>
            <PvMono c={T.inkDim}>главы</PvMono>
            <span style={{ color: T.amber, fontSize: 14 }}>+</span>
          </div>
          <div style={{ flex:1, overflow:'hidden' }}>
            {PV_CHAPTERS.map(c => (
              <div key={c.n} style={{ display:'flex', alignItems:'baseline', gap: 9,
                padding:'7px 16px',
                background: c.active ? T.amberSoft : 'transparent',
                borderLeft: c.active ? `2px solid ${T.amber}` : '2px solid transparent' }}>
                <span style={{ fontFamily: PV_FONT.mono, fontSize: 9.5, color: c.active ? T.amber : T.inkFaint }}>{c.n}</span>
                <span style={{ flex:1, fontFamily: PV_FONT.display, fontStyle: c.active ? 'italic' : 'normal',
                  fontSize: 12.5, lineHeight: 1.25, color: c.active ? T.ink : T.inkDim,
                  whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{c.t}</span>
                <span style={{ fontFamily: PV_FONT.mono, fontSize: 8, color: T.inkFaint }}>{c.w}</span>
              </div>
            ))}
          </div>

          {/* assets */}
          <div style={{ borderTop:`1px solid ${T.border}`, padding:'12px 16px 4px' }}>
            <PvMono c={T.inkDim}>материалы</PvMono>
            {[['✦','библия персонажей','6'],['◈','мир и правила','12'],['❖','заметки','3']].map(([ic, t2, n]) => (
              <div key={t2} style={{ display:'flex', alignItems:'center', gap: 8, padding:'7px 0' }}>
                <span style={{ color: T.amber, fontSize: 11 }}>{ic}</span>
                <span style={{ flex:1, fontFamily: PV_FONT.ui, fontSize: 12, color: T.inkDim }}>{t2}</span>
                <span style={{ fontFamily: PV_FONT.mono, fontSize: 9, color: T.inkFaint }}>{n}</span>
              </div>
            ))}
          </div>

          {/* goal */}
          <div style={{ margin:'10px 16px 0', padding:'10px 12px', borderRadius: 10,
            border:`1px dashed ${T.borderStrong}` }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom: 6 }}>
              <PvMono c={T.inkDim} size={8.5}>цель дня</PvMono>
              <PvMono c={T.amber} size={8.5}>1 124 / 1 500</PvMono>
            </div>
            <div style={{ height: 3, background: T.border, borderRadius: 2, overflow:'hidden' }}>
              <div style={{ width:'75%', height:'100%', background: T.amber }}/>
            </div>
          </div>
        </div>

        {/* CENTER — manuscript */}
        <div style={{ position:'relative', overflow:'hidden', display:'flex', justifyContent:'center' }}>
          <div style={{ width:'100%', maxWidth: 600, padding:'36px 40px 0' }}>
            <div style={{ fontFamily: PV_FONT.display, fontStyle:'italic', fontSize: 12, color: T.amber }}>глава седьмая</div>
            <div style={{ fontFamily: PV_FONT.display, fontSize: 27, lineHeight: 1.05, fontWeight: 500,
              color: T.ink, marginTop: 6, textWrap:'balance' }}>
              Письмо, которое <em style={{ color: T.amber }}>нельзя</em> было писать.
            </div>
            <div style={{ display:'flex', alignItems:'center', gap: 10, margin:'16px 0 20px' }}>
              <div style={{ flex:1, height:1, background: T.borderStrong }}/>
              <span style={{ color: T.amber, fontSize: 11 }}>✦</span>
              <div style={{ flex:1, height:1, background: T.borderStrong }}/>
            </div>

            <p style={{ fontFamily: PV_FONT.body, fontSize: 15.5, lineHeight: 1.65, color: T.ink,
              margin: 0, textAlign:'justify', hyphens:'auto' }}>
              Снег падал четвёртый час подряд, и в подземельях пахло влажными книгами и холодным камнем. Гермиона шла быстрее, чем обычно — не от страха, от холода.
            </p>

            {/* selected sentence + inline AI toolbar */}
            <p style={{ fontFamily: PV_FONT.body, fontSize: 15.5, lineHeight: 1.65, color: T.ink,
              marginTop: 12, textAlign:'justify', hyphens:'auto', position:'relative' }}>
              <span style={{ background: T.amberSoft, boxShadow:`0 0 0 1px ${T.amber}55`, borderRadius: 2 }}>
                В руках было письмо, которое она не собиралась отправлять, и которое теперь было поздно не написать.
              </span>
            </p>
            {/* floating toolbar */}
            <div style={{ display:'inline-flex', alignItems:'center', gap: 2, marginTop: 8,
              padding: 4, borderRadius: 10, background: light ? '#fff' : T.surface,
              border:`1px solid ${T.borderStrong}`, boxShadow: T.shadow }}>
              {[['✦ переписать', true],['продолжить', false],['сжать', false],['спросить ИИ', false]].map(([t2, hot]) => (
                <span key={t2} style={{ padding:'6px 11px', borderRadius: 7,
                  fontFamily: PV_FONT.ui, fontSize: 11.5, whiteSpace:'nowrap',
                  background: hot ? T.amberBright : 'transparent',
                  color: hot ? (light ? '#fff' : T.bg) : T.inkDim }}>{t2}</span>
              ))}
            </div>

            <p style={{ fontFamily: PV_FONT.body, fontSize: 15.5, lineHeight: 1.65, color: T.ink,
              marginTop: 12, textAlign:'justify', hyphens:'auto' }}>
              Она вывернула из-за угла и в первую секунду не поняла, что видит. В окне — силуэт.
              <span style={{ borderRight:`2px solid ${T.amber}`, marginLeft: 1 }}/>
            </p>

            {/* ghost suggestion */}
            <p style={{ fontFamily: PV_FONT.body, fontStyle:'italic', fontSize: 15.5, lineHeight: 1.65,
              color: T.inkFaint, marginTop: 12, textAlign:'justify' }}>
              Голова прислонена к стеклу, рука в кармане — он стоял так, будто ждал кого-то, кто давно не придёт…
              <span style={{ fontFamily: PV_FONT.mono, fontSize: 8.5, letterSpacing:'.14em',
                color: T.inkFaint, marginLeft: 8, textTransform:'uppercase' }}>TAB — принять</span>
            </p>
          </div>

          {/* bottom counter strip */}
          <div style={{ position:'absolute', bottom: 0, left: 0, right: 0, padding:'8px 40px',
            display:'flex', justifyContent:'space-between',
            background: light ? 'rgba(237,228,212,.92)' : 'rgba(22,11,34,.9)', backdropFilter:'blur(8px)',
            borderTop:`1px solid ${T.border}` }}>
            <PvMono c={T.inkFaint} size={8.5}>1 124 слова · сцена 2 из 3</PvMono>
            <PvMono c={T.inkFaint} size={8.5}>⌘K — команды · ⌘J — соавтор</PvMono>
          </div>
        </div>

        {/* RIGHT — AI co-author chat */}
        <div style={{ borderLeft:`1px solid ${T.border}`, display:'flex', flexDirection:'column',
          background: light ? 'rgba(36,24,48,.03)' : 'rgba(0,0,0,.22)' }}>
          <div style={{ padding:'14px 16px 10px', borderBottom:`1px solid ${T.border}`,
            display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <div style={{ display:'flex', alignItems:'center', gap: 8 }}>
              <span className="mix-chrome" style={{ fontFamily: PV_FONT.display, fontStyle:'italic',
                fontSize: 15, fontWeight: 600 }}>✦ соавтор</span>
            </div>
            <PvMono c={T.inkFaint} size={8.5}>видит гл. 1–7</PvMono>
          </div>

          {/* chat scroll */}
          <div style={{ flex:1, padding:'14px 14px 0', display:'flex', flexDirection:'column', gap: 10, overflow:'hidden' }}>
            {/* AI message */}
            <div style={{ padding:'10px 12px', borderRadius:'12px 12px 12px 4px',
              background: light ? '#fff' : T.surface, border:`1px solid ${T.border}` }}>
              <div style={{ fontFamily: PV_FONT.body, fontSize: 12.5, lineHeight: 1.55, color: T.ink }}>
                Заметила: в гл. 4 Драко <em style={{ color: T.amber }}>прячет правую руку</em>, а здесь письмо у него в левой. Так задумано?
              </div>
              <div style={{ display:'flex', gap: 6, marginTop: 8 }}>
                <span style={{ padding:'4px 9px', borderRadius: 999, fontSize: 10.5, fontFamily: PV_FONT.ui,
                  border:`1px solid ${T.amber}66`, color: T.amber }}>да, исправь</span>
                <span style={{ padding:'4px 9px', borderRadius: 999, fontSize: 10.5, fontFamily: PV_FONT.ui,
                  border:`1px solid ${T.border}`, color: T.inkDim }}>так задумано</span>
              </div>
            </div>

            {/* user message */}
            <div style={{ alignSelf:'flex-end', maxWidth:'85%', padding:'9px 12px',
              borderRadius:'12px 12px 4px 12px', background: T.amberSoft,
              border:`1px solid ${T.amber}40` }}>
              <div style={{ fontFamily: PV_FONT.body, fontSize: 12.5, lineHeight: 1.5, color: T.ink }}>
                как закончить сцену, чтобы не раскрывать письмо до гл. 9?
              </div>
            </div>

            {/* AI answer with variants */}
            <div style={{ padding:'10px 12px', borderRadius:'12px 12px 12px 4px',
              background: light ? '#fff' : T.surface, border:`1px solid ${T.border}` }}>
              <div style={{ fontFamily: PV_FONT.body, fontSize: 12.5, lineHeight: 1.55, color: T.ink, marginBottom: 8 }}>
                Три хода — все держат интригу:
              </div>
              {[ 'Прервать сцену появлением Слизнорта', 'Гермиона прячет письмо, но Драко замечает жест', 'Закончить на полуслове — обрыв главы' ].map((v, i) => (
                <div key={i} style={{ display:'flex', gap: 8, padding:'7px 9px', marginBottom: 4,
                  borderRadius: 8, border:`1px solid ${i === 1 ? T.amber + '66' : T.border}`,
                  background: i === 1 ? T.amberSoft : 'transparent' }}>
                  <span style={{ fontFamily: PV_FONT.mono, fontSize: 9, color: i === 1 ? T.amber : T.inkFaint }}>0{i+1}</span>
                  <span style={{ flex:1, fontFamily: PV_FONT.body, fontStyle:'italic', fontSize: 11.5,
                    lineHeight: 1.4, color: i === 1 ? T.ink : T.inkDim }}>{v}</span>
                  {i === 1 && <span style={{ fontSize: 10, color: T.amber }}>→ в текст</span>}
                </div>
              ))}
            </div>
          </div>

          {/* quick actions + input */}
          <div style={{ padding:'10px 14px 14px', borderTop:`1px solid ${T.border}` }}>
            <div style={{ display:'flex', gap: 5, flexWrap:'wrap', marginBottom: 9 }}>
              {['что дальше?','задай мне вопрос','проверь мир','найди повторы'].map(q => (
                <span key={q} style={{ padding:'4px 9px', borderRadius: 999,
                  fontFamily: PV_FONT.ui, fontSize: 10, color: T.inkDim,
                  border:`1px solid ${T.border}` }}>{q}</span>
              ))}
            </div>
            <div style={{ display:'flex', alignItems:'center', gap: 8, padding:'9px 12px',
              borderRadius: 12, border:`1px solid ${T.borderStrong}`,
              background: light ? '#fff' : T.panel }}>
              <span style={{ flex:1, fontFamily: PV_FONT.body, fontStyle:'italic', fontSize: 12, color: T.inkFaint }}>
                спроси соавтора…
              </span>
              <span style={{ width: 24, height: 24, borderRadius: 7, background: T.amberBright,
                color: light ? '#fff' : T.bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize: 12 }}>↑</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── 2. MOBILE EDITOR ──────────────────────────────────────────
function PvEditorMobile({ light = false }) {
  const T = pvT(light);
  return (
    <div className="mix" style={{ width:'100%', height:'100%', background: T.bg,
      position:'relative', overflow:'hidden', display:'flex', flexDirection:'column' }}>

      {/* status */}
      <div style={{ display:'flex', justifyContent:'space-between', padding:'10px 18px 4px',
        fontFamily: PV_FONT.mono, fontSize: 11, color: T.ink, opacity:.8 }}>
        <span>1:42</span><span>•••○ 5G 92%</span>
      </div>

      {/* top bar: chapter switcher */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
        padding:'6px 16px 10px', borderBottom:`1px solid ${T.border}` }}>
        <span style={{ color: T.inkDim, fontSize: 17 }}>←</span>
        <div style={{ textAlign:'center' }}>
          <PvMono c={T.inkFaint} size={8.5}>гл. 7 / 7 · черновик</PvMono>
          <div style={{ fontFamily: PV_FONT.display, fontStyle:'italic', fontSize: 13,
            color: T.ink, marginTop: 1, display:'flex', alignItems:'center', gap: 5 }}>
            Письмо, которое нельзя… <span style={{ fontSize: 9, color: T.inkFaint }}>⌄</span>
          </div>
        </div>
        <div style={{ display:'flex', gap: 12, alignItems:'center' }}>
          <span style={{ fontSize: 12, color: T.inkDim }}>{light ? '☾' : '☀'}</span>
          <span style={{ fontSize: 12, color: T.inkDim }}>⋯</span>
        </div>
      </div>

      {/* manuscript */}
      <div style={{ flex:1, padding:'18px 22px 0', overflow:'hidden', position:'relative' }}>
        <p style={{ fontFamily: PV_FONT.body, fontSize: 16, lineHeight: 1.62, color: T.ink,
          margin: 0, textAlign:'justify', hyphens:'auto' }}>
          Снег падал четвёртый час подряд, и в подземельях пахло влажными книгами и холодным камнем.
        </p>
        <p style={{ fontFamily: PV_FONT.body, fontSize: 16, lineHeight: 1.62, color: T.ink,
          marginTop: 12, textAlign:'justify', hyphens:'auto' }}>
          <span style={{ background: T.amberSoft, boxShadow:`0 0 0 1px ${T.amber}55`, borderRadius: 2 }}>
            В руках было письмо, которое она не собиралась отправлять.
          </span>
        </p>
        {/* selection toolbar */}
        <div style={{ display:'inline-flex', gap: 2, marginTop: 10, padding: 4, borderRadius: 10,
          background: light ? '#fff' : T.surface, border:`1px solid ${T.borderStrong}`, boxShadow: T.shadow }}>
          {[['✦ переписать', true],['продолжить', false],['спросить', false]].map(([t2, hot]) => (
            <span key={t2} style={{ padding:'7px 12px', borderRadius: 7, fontFamily: PV_FONT.ui,
              fontSize: 12, background: hot ? T.amberBright : 'transparent',
              color: hot ? (light ? '#fff' : T.bg) : T.inkDim }}>{t2}</span>
          ))}
        </div>
        <p style={{ fontFamily: PV_FONT.body, fontSize: 16, lineHeight: 1.62, color: T.ink,
          marginTop: 12, textAlign:'justify' }}>
          Она вывернула из-за угла<span style={{ borderRight:`2px solid ${T.amber}` }}/>
        </p>
      </div>

      {/* AI co-author bottom sheet (peeking) */}
      <div style={{ borderRadius:'18px 18px 0 0', background: light ? '#fff' : T.surface,
        border:`1px solid ${T.borderStrong}`, borderBottom:'none',
        boxShadow:'0 -12px 40px rgba(0,0,0,.25)', padding:'10px 16px 14px' }}>
        <div style={{ width: 36, height: 4, borderRadius: 2, background: T.borderStrong, margin:'0 auto 10px' }}/>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom: 10 }}>
          <span className="mix-chrome" style={{ fontFamily: PV_FONT.display, fontStyle:'italic',
            fontSize: 15, fontWeight: 600 }}>✦ соавтор</span>
          <PvMono c={T.inkFaint} size={8.5}>видит гл. 1–7</PvMono>
        </div>
        <div style={{ padding:'9px 11px', borderRadius:'10px 10px 10px 3px',
          background: light ? T.panel : T.bg, border:`1px solid ${T.border}`, marginBottom: 10 }}>
          <div style={{ fontFamily: PV_FONT.body, fontSize: 12.5, lineHeight: 1.5, color: T.ink }}>
            В гл. 4 Драко <em style={{ color: T.amber }}>прячет правую руку</em> — а тут письмо в левой. Так задумано?
          </div>
          <div style={{ display:'flex', gap: 6, marginTop: 8 }}>
            <span style={{ padding:'5px 10px', borderRadius: 999, fontSize: 10.5,
              border:`1px solid ${T.amber}66`, color: T.amber }}>да, исправь</span>
            <span style={{ padding:'5px 10px', borderRadius: 999, fontSize: 10.5,
              border:`1px solid ${T.border}`, color: T.inkDim }}>так задумано</span>
          </div>
        </div>
        <div style={{ display:'flex', gap: 5, overflowX:'auto', marginBottom: 10 }}>
          {['что дальше?','задай вопрос','проверь мир'].map(q => (
            <span key={q} style={{ padding:'5px 10px', borderRadius: 999, whiteSpace:'nowrap',
              fontFamily: PV_FONT.ui, fontSize: 10.5, color: T.inkDim, border:`1px solid ${T.border}` }}>{q}</span>
          ))}
        </div>
        <div style={{ display:'flex', alignItems:'center', gap: 8, padding:'10px 12px',
          borderRadius: 12, border:`1px solid ${T.borderStrong}`, background: light ? T.panel : T.bg }}>
          <span style={{ flex:1, fontFamily: PV_FONT.body, fontStyle:'italic', fontSize: 12.5, color: T.inkFaint }}>
            спроси соавтора…
          </span>
          <span style={{ width: 26, height: 26, borderRadius: 8, background: T.amberBright,
            color: light ? '#fff' : T.bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize: 13 }}>↑</span>
        </div>
      </div>
    </div>
  );
}

window.PvEditorDesktop = PvEditorDesktop;
window.PvEditorMobile = PvEditorMobile;
window.pvT = pvT;
window.PV_FONT = PV_FONT;
window.PvMono = PvMono;
