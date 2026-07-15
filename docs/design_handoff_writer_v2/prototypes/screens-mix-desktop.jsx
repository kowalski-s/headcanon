// Mix · Editorial Y2K — desktop variants for Create / Story / Reader / Watch
// Relies on globals from screens-mix.jsx (MIX, MixSparkle, MixStar4, MixCandle, MixPoster)

// ─── shared desktop nav (top bar) ─────────────────────────────
function MixDeskNav({ active = 'feed' }) {
  return (
    <div style={{ position:'relative', zIndex:5, padding:'18px 36px',
      display:'flex', justifyContent:'space-between', alignItems:'center',
      borderBottom:`1px solid ${MIX.border}` }}>
      <div style={{ display:'flex', alignItems:'baseline', gap: 36 }}>
        <div style={{ display:'flex', alignItems:'baseline', gap: 4 }}>
          <span style={{ fontFamily: MIX.display, fontSize: 30, fontStyle:'italic', fontWeight: 400 }}>head</span>
          <span className="mix-chrome" style={{ fontFamily: MIX.display, fontSize: 30, fontWeight: 600 }}>canon</span>
          <MixStar4 size={11} color={MIX.amber} style={{ marginLeft: 3 }}/>
        </div>
        <div style={{ display:'flex', gap: 22, fontSize: 13 }}>
          {[['feed','лента'],['fandoms','фандомы'],['tropes','тропы'],['watch','watch ▸']].map(([k,t]) => {
            const on = active === k;
            return (
              <span key={k} style={{
                color: on ? MIX.amber : MIX.inkDim,
                fontFamily: on ? MIX.display : MIX.ui,
                fontStyle: on ? 'italic' : 'normal' }}>
                {on && '★ '}{t}
              </span>
            );
          })}
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
  );
}

// ─── 1. CREATE (stage 2/5 — ship & tropes) ────────────────────
function MixCreateDesktop() {
  const { TROPES, FANDOMS } = window.HC_DATA;
  return (
    <div className="mix" style={{ width:'100%', height:'100%', background: MIX.bg,
      position:'relative', overflow:'hidden' }}>
      <MixCandle x={-100} y={200} size={400} opacity={.4}/>
      <MixCandle x={900} y={500} size={400} opacity={.4}/>
      <MixDeskNav active="create"/>

      {/* progress strip */}
      <div style={{ position:'relative', zIndex:3, padding:'18px 36px 8px',
        display:'flex', alignItems:'center', gap: 22 }}>
        <span style={{ color: MIX.inkDim, fontSize: 22 }}>×</span>
        <div style={{ flex:1, display:'flex', alignItems:'center', gap: 14 }}>
          <div style={{ flex:1, height: 3, background: MIX.border, borderRadius: 2, overflow:'hidden' }}>
            <div style={{ width:'40%', height:'100%', background: MIX.amber }}/>
          </div>
          <span style={{ fontFamily: MIX.mono, fontSize: 11, color: MIX.inkDim, letterSpacing:'.12em' }}>STAGE 02 / 05 · 40%</span>
        </div>
        <span style={{ fontFamily: MIX.display, fontStyle:'italic', fontSize: 13, color: MIX.amber }}>draft saved ✓</span>
      </div>

      {/* split content */}
      <div style={{ position:'relative', zIndex:3, padding:'30px 36px 20px',
        display:'grid', gridTemplateColumns:'1.1fr 1fr', gap: 56, alignItems:'flex-start' }}>
        {/* LEFT — copy + tropes */}
        <div>
          <div style={{ fontFamily: MIX.mono, fontSize: 11, letterSpacing:'.2em',
            color: MIX.amber, marginBottom: 14 }}>★ STEP 02 — SHIP</div>
          <div style={{ fontFamily: MIX.display, fontSize: 64, lineHeight: 0.96, fontWeight: 500,
            textWrap:'balance' }}>
            Подбираем <em style={{ color: MIX.amber }}>пейринг</em>.
          </div>
          <div style={{ fontFamily: MIX.body, fontStyle:'italic', fontSize: 16,
            color: MIX.ink, opacity: .85, marginTop: 14, lineHeight: 1.55, maxWidth: 480 }}>
            Ship — главный хук. От него зависят доступные тропы и тон главы. Никакого спойлера, обещаем.
          </div>

          {/* tropes */}
          <div style={{ marginTop: 36 }}>
            <div style={{ display:'flex', alignItems:'baseline', justifyContent:'space-between', marginBottom: 14 }}>
              <div style={{ fontFamily: MIX.display, fontSize: 22, fontStyle:'italic' }}>
                ✦ тропы пакета
              </div>
              <div style={{ fontFamily: MIX.mono, fontSize: 11, color: MIX.inkDim, letterSpacing:'.1em' }}>2 / 3</div>
            </div>
            <div style={{ display:'flex', flexWrap:'wrap', gap: 10 }}>
              {TROPES.map((tr, i) => {
                const sel = i === 0 || i === 1;
                const tilt = (i % 2 ? 1 : -1) * (0.5 + (i % 3) * 0.3);
                return (
                  <div key={tr.id} style={{
                    padding:'8px 16px', borderRadius: 999,
                    fontFamily: sel ? MIX.display : MIX.ui,
                    fontStyle: sel ? 'italic' : 'normal',
                    fontSize: 14,
                    background: sel ? MIX.amber : 'transparent',
                    color: sel ? MIX.bg : MIX.inkDim,
                    border: sel ? `1px solid ${MIX.amber}` : `1px solid ${MIX.border}`,
                    fontWeight: sel ? 600 : 400,
                    transform: sel ? `rotate(${tilt}deg)` : 'none',
                    boxShadow: sel ? '0 4px 14px rgba(229,169,90,.35)' : 'none' }}>
                    {sel && '★ '}{tr.name}
                  </div>
                );
              })}
            </div>
          </div>

          {/* AI tip */}
          <div style={{ marginTop: 32, position:'relative',
            padding:'16px 20px 16px 24px',
            borderLeft:`2px solid ${MIX.amber}`,
            background: `${MIX.amber}10`,
            borderRadius:'0 6px 6px 0', maxWidth: 540 }}>
            <div style={{ fontFamily: MIX.mono, fontSize: 10, letterSpacing:'.18em',
              color: MIX.amber, marginBottom: 6 }}>AI · РЕДАКТОР</div>
            <div style={{ fontFamily: MIX.body, fontStyle:'italic', fontSize: 15,
              lineHeight: 1.5, color: MIX.ink, textWrap:'pretty' }}>
              «Enemies-to-lovers + slow burn — это 12+ глав. Я разгоню напряжение медленно. Готова <em style={{ color: MIX.amber }}>ждать</em>?»
            </div>
          </div>

          {/* CTA row */}
          <div style={{ marginTop: 36, display:'flex', gap: 14, alignItems:'center' }}>
            <div style={{ padding:'14px 24px', borderRadius: 999,
              border:`1px solid ${MIX.borderStrong}`, color: MIX.inkDim,
              fontFamily: MIX.display, fontStyle:'italic', fontSize: 15 }}>
              ← назад
            </div>
            <div style={{ display:'flex', alignItems:'center', gap: 16,
              padding:'14px 28px', borderRadius: 999, background: MIX.amber, color: MIX.bg,
              fontFamily: MIX.display, fontStyle:'italic', fontSize: 17, fontWeight: 600 }}>
              <span>дальше · завязка</span>
              <span style={{ fontSize: 20 }}>→</span>
            </div>
            <div style={{ fontFamily: MIX.mono, fontSize: 10, color: MIX.inkDim, marginLeft: 6, letterSpacing:'.1em' }}>
              ⏎ ENTER
            </div>
          </div>
        </div>

        {/* RIGHT — selected ship card + preview poster */}
        <div>
          {/* ship card with tape */}
          <div style={{ position:'relative' }}>
            <div style={{ position:'absolute', top: -8, left: 28, width: 60, height: 18,
              transform:'rotate(-4deg)', zIndex: 2 }} className="mix-tape"/>
            <div style={{ position:'absolute', top: -8, right: 28, width: 60, height: 18,
              transform:'rotate(5deg)', zIndex: 2 }} className="mix-tape"/>
            <div style={{ position:'relative', padding: 18,
              border:`1px solid ${MIX.borderStrong}`, borderRadius: 8,
              background: MIX.surface, boxShadow:'0 14px 40px rgba(0,0,0,.5)' }}>
              <div style={{ fontFamily: MIX.mono, fontSize: 10, letterSpacing:'.18em',
                color: MIX.amber, marginBottom: 14 }}>SHIP CONFIRMED</div>
              <div style={{ display:'flex', alignItems:'center', gap: 16 }}>
                <div className="mix-poster-grad-1" style={{ width: 76, height: 76, borderRadius: 8,
                  border:`1px solid ${MIX.border}`, position:'relative' }}>
                  <div className="mix-grain"/>
                </div>
                <div style={{ fontFamily: MIX.display, fontStyle:'italic', fontSize: 36, color: MIX.amber }}>×</div>
                <div className="mix-poster-grad-4" style={{ width: 76, height: 76, borderRadius: 8,
                  border:`1px solid ${MIX.border}`, position:'relative' }}>
                  <div className="mix-grain"/>
                </div>
                <div style={{ flex:1, marginLeft: 8 }}>
                  <div style={{ fontFamily: MIX.display, fontSize: 24, lineHeight: 1.05 }}>Драко × Гермиона</div>
                  <div style={{ fontFamily: MIX.mono, fontSize: 10, color: MIX.inkDim, letterSpacing:'.1em', marginTop: 4 }}>DRAMIONE · HOGWARTS · YEAR 7</div>
                </div>
              </div>
            </div>
          </div>

          {/* live preview poster */}
          <div style={{ marginTop: 28 }}>
            <div style={{ fontFamily: MIX.mono, fontSize: 10, letterSpacing:'.18em',
              color: MIX.inkDim, marginBottom: 12 }}>★ ПРЕДПРОСМОТР ОБЛОЖКИ</div>
            <div style={{ position:'relative', borderRadius: 8, overflow:'hidden',
              aspectRatio:'4/5', maxWidth: 360,
              border:`1px solid ${MIX.borderStrong}`,
              boxShadow:'0 20px 50px rgba(0,0,0,.55)' }}>
              <div className="mix-poster-grad-1" style={{ position:'absolute', inset:0 }}/>
              <div className="mix-grain"/>
              <div className="mix-vignette"/>
              <div style={{ position:'absolute', top:'-15%', right:'-10%', width:'70%', height:'60%',
                background:`radial-gradient(circle, ${MIX.amber}77, transparent 60%)`, mixBlendMode:'screen' }}/>
              <div className="mix-burst" style={{ position:'absolute', top: 14, right: 14,
                width: 50, height: 50, background: MIX.amber, color: MIX.bg,
                display:'flex', alignItems:'center', justifyContent:'center',
                fontSize: 22, transform:'rotate(-8deg)' }}>★</div>
              <div style={{ position:'absolute', top: 14, left: 16,
                fontFamily: MIX.mono, fontSize: 9, letterSpacing:'.18em', color: MIX.inkDim }}>
                HC—DRAFT · 1997
              </div>
              <div style={{ position:'absolute', left: 18, right: 18, bottom: 18 }}>
                <div style={{ fontFamily: MIX.mono, fontSize: 9, letterSpacing:'.2em',
                  color: MIX.amber, marginBottom: 6 }}>ENEMIES-TO-LOVERS</div>
                <div style={{ fontFamily: MIX.display, fontSize: 26, lineHeight: 0.96,
                  fontWeight: 500, textWrap:'balance' }}>
                  без названия<br/><em style={{ color: MIX.amber }}>пока</em>.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

window.MixCreateDesktop = MixCreateDesktop;
window.MixDeskNav = MixDeskNav;
