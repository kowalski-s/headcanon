// Pivot v3 — Дашборд «мой стол». Первый экран автора (край, выразительный).
// DESIGN-writer.md §1: обложки-черновики + типографские обложки, momentum на виду,
// guided-start пустое состояние. Тихая приборная панель, НЕ геймификация-слот.
// Использует pvT, PV_FONT, PvMono, PvSpark, PV_NIGHT_WORDS (screens-pivot*.jsx).

// обложка истории: gradient (с обложкой) или типографская (черновик без обложки)
function PvStoryCover({ T, s, w = '100%' }) {
  const asp = { width: w, aspectRatio:'2/3', borderRadius: 10, position:'relative',
    overflow:'hidden', border:`1px ${s.idle ? 'dashed' : 'solid'} ${T.borderStrong}` };
  if (s.typo) {
    return (
      <div style={{ ...asp, background: T.surface,
        display:'flex', flexDirection:'column', justifyContent:'space-between', padding: 14,
        opacity: s.idle ? 0.95 : 1 }}>
        <PvMono c={s.idle ? T.inkFaint : T.amber} size={8}>{s.kicker || 'черновик'}</PvMono>
        <div style={{ fontFamily: PV_FONT.display, fontSize: s.big ? 25 : 21, lineHeight: 1.04,
          fontStyle:'italic', color: s.idle ? T.inkDim : T.ink, textWrap:'balance' }}>{s.t}</div>
        <div>
          <div style={{ height: 1, background: `${T.amber}55`, margin:'0 0 8px' }}/>
          <PvMono c={T.inkFaint} size={7.5}>{s.status}</PvMono>
        </div>
      </div>
    );
  }
  return (
    <div className={s.grad} style={asp}>
      <div className="mix-grain"/>
      <div className="mix-vignette"/>
      <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column',
        justifyContent:'flex-end', padding: 13,
        background:'linear-gradient(180deg, transparent 45%, rgba(0,0,0,.6))' }}>
        {s.pub && <PvMono c="#F5EFE0" size={7.5} style={{ opacity:.85, marginBottom: 4 }}>{s.kicker}</PvMono>}
        <div style={{ fontFamily: PV_FONT.display, fontSize: 17, lineHeight: 1.05, fontStyle:'italic',
          color:'#F5EFE0', textWrap:'balance' }}>{s.t}</div>
        <PvMono c="rgba(245,239,224,.75)" size={7.5} style={{ marginTop: 5 }}>{s.status}</PvMono>
      </div>
    </div>
  );
}

const PV_DESK_STORIES = [
  { t:'Зимний свет в подземельях', grad:'mix-poster-grad-1', kicker:'в работе', status:'гл. 7 · 12 480 сл', hot: true },
  { t:'Виноград и пепел', grad:'mix-poster-grad-5', pub: true, kicker:'опубликовано', status:'18 глав · 24 803 ◉' },
  { t:'Сад камней и писем', typo: true, kicker:'черновик', status:'гл. 3 · 5 210 сл' },
  { t:'Без названия', typo: true, idle: true, kicker:'пустой лист', status:'0 слов · 6 дней' },
];

// ── DESKTOP — «мой стол» ──────────────────────────────────────
function PvDeskDesktop() {
  const T = pvT(false);
  return (
    <div className="mix" style={{ width:'100%', height:'100%', background: T.bg,
      position:'relative', overflow:'hidden' }}>
      <div style={{ position:'absolute', left:'18%', top:-150, width: 440, height: 440,
        background:`radial-gradient(circle, ${T.glow}, transparent 65%)`, pointerEvents:'none' }}/>

      {/* nav */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
        padding:'14px 28px', borderBottom:`1px solid ${T.border}`, position:'relative', zIndex: 5 }}>
        <div style={{ display:'flex', alignItems:'baseline', gap: 26 }}>
          <div style={{ display:'flex', alignItems:'baseline', gap: 3 }}>
            <span style={{ fontFamily: PV_FONT.display, fontStyle:'italic', fontSize: 22, color: T.ink }}>head</span>
            <span className="mix-chrome" style={{ fontFamily: PV_FONT.display, fontSize: 22, fontWeight: 600 }}>canon</span>
          </div>
          <div style={{ display:'flex', gap: 20, fontFamily: PV_FONT.ui, fontSize: 13, color: T.inkDim }}>
            <span style={{ color: T.amber, fontFamily: PV_FONT.display, fontStyle:'italic' }}>✎ мой стол</span>
            <span>лента</span>
            <span>кабинет</span>
          </div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap: 14 }}>
          <div style={{ padding:'5px 13px', borderRadius: 999, background: T.amber, color: T.bg,
            fontFamily: PV_FONT.display, fontStyle:'italic', fontSize: 12.5, fontWeight: 500 }}>+ новая история</div>
          <div style={{ width: 34, height: 34, borderRadius:'50%',
            background:`linear-gradient(135deg, ${T.amber}, ${T.rose})`, border:`1px solid ${T.borderStrong}` }}/>
        </div>
      </div>

      <div style={{ padding:'24px 28px 0', position:'relative', zIndex: 3,
        display:'grid', gridTemplateColumns:'1fr 300px', gap: 28 }}>
        {/* LEFT — стол */}
        <div>
          {/* momentum-подводка: анти-прокрастинация, тихо */}
          <div style={{ display:'flex', alignItems:'center', gap: 18, marginBottom: 22 }}>
            <div style={{ flex: 1 }}>
              <PvMono c={T.inkFaint} size={8.5}>вт · 1:42 ночи · свеча горит</PvMono>
              <div style={{ fontFamily: PV_FONT.display, fontSize: 33, fontWeight: 500, lineHeight: 1.05,
                marginTop: 8, textWrap:'balance' }}>
                Три ночи назад ты оставила <em style={{ color: T.amber }}>Драко у окна</em>.
              </div>
              <div style={{ fontFamily: PV_FONT.body, fontStyle:'italic', fontSize: 14, color: T.inkDim,
                marginTop: 8 }}>Гермиона всё ещё стоит на половице. Вернёмся к главе 7?</div>
              <div style={{ display:'flex', alignItems:'center', gap: 12, marginTop: 16 }}>
                <span style={{ padding:'7px 15px', borderRadius: 999, background: T.amber, color: T.bg,
                  fontFamily: PV_FONT.display, fontStyle:'italic', fontSize: 13.5, fontWeight: 500 }}>
                  продолжить гл. 7 →
                </span>
                <PvMono c={T.inkFaint} size={8.5}>откроется там, где ты остановилась</PvMono>
              </div>
            </div>
          </div>

          {/* полка */}
          <div style={{ display:'flex', alignItems:'baseline', gap: 12, marginBottom: 14 }}>
            <div style={{ fontFamily: PV_FONT.display, fontStyle:'italic', fontSize: 18 }}>✦ на столе</div>
            <PvMono c={T.inkFaint} size={8.5}>4 истории · 1 опубликована</PvMono>
            <div style={{ flex:1, height:1, background: T.border }}/>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap: 16 }}>
            {PV_DESK_STORIES.map((s, i) => (
              <div key={i} style={{ position:'relative' }}>
                {s.hot && <div style={{ position:'absolute', top: 8, left: 8, zIndex: 3,
                  padding:'3px 8px', borderRadius: 999, background: T.amber, color: T.bg,
                  fontFamily: PV_FONT.mono, fontSize: 7.5, letterSpacing:'.14em', textTransform:'uppercase' }}>● сейчас</div>}
                <PvStoryCover T={T} s={s}/>
              </div>
            ))}
          </div>
          {/* новый лист — guided, не blank */}
          <div style={{ display:'flex', alignItems:'center', gap: 12, marginTop: 14, padding:'13px 16px',
            borderRadius: 12, border:`1px dashed ${T.borderStrong}` }}>
            <span style={{ color: T.amber, fontSize: 16 }}>✎</span>
            <div style={{ flex: 1, fontFamily: PV_FONT.body, fontStyle:'italic', fontSize: 13, color: T.inkDim }}>
              новая история начинается с фандома и одной сцены — не с пустого листа
            </div>
            <PvMono c={T.amber} size={8.5}>выбрать фандом →</PvMono>
          </div>
        </div>

        {/* RIGHT — momentum-панель (тихая, mono-цифры) */}
        <div>
          <div style={{ fontFamily: PV_FONT.display, fontStyle:'italic', fontSize: 18, marginBottom: 12 }}>
            ◷ ритм письма
          </div>
          {/* streak */}
          <div style={{ padding:'14px 16px', borderRadius: 12, border:`1px solid ${T.amber}44`,
            background:`linear-gradient(150deg, ${T.amberSoft}, transparent 70%)`, marginBottom: 10 }}>
            <div style={{ display:'flex', alignItems:'baseline', gap: 8 }}>
              <span style={{ fontFamily: PV_FONT.display, fontSize: 30, color: T.amber, lineHeight: 1 }}>9</span>
              <span style={{ fontFamily: PV_FONT.display, fontStyle:'italic', fontSize: 15, color: T.ink }}>ночей письма подряд</span>
            </div>
            <PvMono c={T.inkFaint} size={8} style={{ marginTop: 6 }}>рекорд: 17 · не рви цепочку</PvMono>
          </div>
          {/* words sparkline */}
          <div style={{ padding:'13px 16px', borderRadius: 12, border:`1px solid ${T.border}`,
            background: T.surface, marginBottom: 10 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline' }}>
              <PvMono c={T.inkDim} size={8.5}>слов за 14 ночей</PvMono>
              <PvMono c={T.amber} size={8.5}>15 904</PvMono>
            </div>
            <div style={{ marginTop: 10 }}><PvSpark T={T} data={PV_NIGHT_WORDS} h={38}/></div>
            <div style={{ display:'flex', justifyContent:'space-between', marginTop: 8 }}>
              <PvMono c={T.inkFaint} size={7.5}>цель 1 500/ночь</PvMono>
              <PvMono c={T.inkFaint} size={7.5}>в среднем 1 136</PvMono>
            </div>
          </div>
          {/* series progress */}
          <div style={{ padding:'13px 16px', borderRadius: 12, border:`1px solid ${T.border}`,
            background: T.surface }}>
            <PvMono c={T.inkDim} size={8.5}>«зимний свет» — до финала</PvMono>
            <div style={{ display:'flex', alignItems:'baseline', gap: 6, margin:'6px 0 9px' }}>
              <span style={{ fontFamily: PV_FONT.display, fontSize: 20, color: T.ink }}>7</span>
              <PvMono c={T.inkFaint} size={9}>из ~10 глав</PvMono>
            </div>
            <div style={{ height: 5, borderRadius: 3, background:'rgba(0,0,0,.3)', overflow:'hidden' }}>
              <div style={{ width:'70%', height:'100%', borderRadius: 3,
                background:`linear-gradient(90deg, ${T.amber}, ${T.rose})` }}/>
            </div>
            <div style={{ fontFamily: PV_FONT.body, fontStyle:'italic', fontSize: 11, color: T.inkFaint,
              marginTop: 9, lineHeight: 1.4 }}>312 читателей ждут развязку письма</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── MOBILE — «мой стол» ───────────────────────────────────────
function PvDeskMobile() {
  const T = pvT(false);
  return (
    <div className="mix" style={{ width:'100%', height:'100%', background: T.bg,
      position:'relative', overflow:'hidden', display:'flex', flexDirection:'column' }}>
      <div style={{ position:'absolute', right:-70, top:-50, width: 250, height: 250,
        background:`radial-gradient(circle, ${T.glow}, transparent 65%)`, pointerEvents:'none' }}/>
      <div style={{ display:'flex', justifyContent:'space-between', padding:'10px 18px 4px',
        fontFamily: PV_FONT.mono, fontSize: 11, color: T.ink, opacity:.8, position:'relative', zIndex: 2 }}>
        <span>1:42</span><span>•••○ 5G 92%</span>
      </div>

      <div style={{ flex:1, overflow:'hidden', padding:'6px 18px 0', position:'relative', zIndex: 2 }}>
        {/* header */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: 14 }}>
          <div>
            <PvMono c={T.inkFaint} size={8}>мой стол · 1:42 ночи</PvMono>
            <div style={{ display:'flex', alignItems:'baseline', gap: 3, marginTop: 3 }}>
              <span style={{ fontFamily: PV_FONT.display, fontStyle:'italic', fontSize: 22, color: T.ink }}>head</span>
              <span className="mix-chrome" style={{ fontFamily: PV_FONT.display, fontSize: 22, fontWeight: 600 }}>canon</span>
            </div>
          </div>
          <div style={{ width: 38, height: 38, borderRadius:'50%',
            background:`linear-gradient(135deg, ${T.amber}, ${T.rose})`, border:`1px solid ${T.borderStrong}` }}/>
        </div>

        {/* momentum nudge */}
        <div style={{ padding:'14px 16px', borderRadius: 14, marginBottom: 14,
          border:`1px solid ${T.amber}55`, background:`linear-gradient(140deg, ${T.amberSoft}, transparent 70%)` }}>
          <PvMono c={T.amber} size={8}>◷ 9 ночей письма подряд</PvMono>
          <div style={{ fontFamily: PV_FONT.display, fontSize: 21, fontWeight: 500, lineHeight: 1.08,
            margin:'8px 0 6px', textWrap:'balance' }}>
            Драко всё ещё <em style={{ color: T.amber }}>у окна</em>.
          </div>
          <div style={{ fontFamily: PV_FONT.body, fontStyle:'italic', fontSize: 12.5, color: T.inkDim,
            lineHeight: 1.4 }}>три ночи назад ты оставила сцену на половице</div>
          <div style={{ display:'flex', alignItems:'center', gap: 10, marginTop: 12 }}>
            <span style={{ padding:'6px 13px', borderRadius: 999, background: T.amber, color: T.bg,
              fontFamily: PV_FONT.display, fontStyle:'italic', fontSize: 12.5, fontWeight: 500 }}>
              продолжить гл. 7 →
            </span>
            <PvMono c={T.inkFaint} size={8}>12 480 сл</PvMono>
          </div>
        </div>

        {/* полка 2 колонки */}
        <div style={{ display:'flex', alignItems:'baseline', gap: 10, marginBottom: 10 }}>
          <div style={{ fontFamily: PV_FONT.display, fontStyle:'italic', fontSize: 15 }}>✦ на столе</div>
          <div style={{ flex:1, height:1, background: T.border }}/>
          <PvMono c={T.inkFaint} size={7.5}>4 истории</PvMono>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap: 12 }}>
          {PV_DESK_STORIES.slice(0, 2).map((s, i) => (
            <div key={i} style={{ position:'relative' }}>
              {s.hot && <div style={{ position:'absolute', top: 7, left: 7, zIndex: 3,
                padding:'3px 7px', borderRadius: 999, background: T.amber, color: T.bg,
                fontFamily: PV_FONT.mono, fontSize: 7, letterSpacing:'.12em', textTransform:'uppercase' }}>● сейчас</div>}
              <PvStoryCover T={T} s={s}/>
            </div>
          ))}
        </div>
        <div style={{ display:'flex', alignItems:'center', gap: 10, marginTop: 12, padding:'11px 14px',
          borderRadius: 12, border:`1px dashed ${T.borderStrong}` }}>
          <span style={{ color: T.amber, fontSize: 14 }}>✎</span>
          <div style={{ flex: 1, fontFamily: PV_FONT.body, fontStyle:'italic', fontSize: 11.5, color: T.inkDim,
            lineHeight: 1.4 }}>новая история — с фандома и одной сцены, не с пустого листа</div>
          <PvMono c={T.amber} size={7.5}>фандом →</PvMono>
        </div>
      </div>

      {/* tab bar */}
      <div style={{ position:'relative', zIndex: 4, padding:'10px 14px 16px',
        borderTop:`1px solid ${T.border}`, background:`linear-gradient(180deg, transparent, ${T.bg} 45%)`,
        backdropFilter:'blur(12px)', display:'flex', justifyContent:'space-around', alignItems:'flex-end' }}>
        {[['✎','стол', T.amber],['☆','лента'],['✦','генерируй'],['◯','я']].map(([icon, t2, c]) => (
          <div key={t2} style={{ textAlign:'center', color: c || T.inkDim }}>
            <div style={{ fontSize: 16, lineHeight: 1 }} aria-hidden="true">{icon}</div>
            <div style={{ marginTop: 3, fontFamily: PV_FONT.display, fontStyle:'italic', fontSize: 12.5 }}>{t2}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── MOBILE — пустой стол (guided start, НЕ blank canvas) ──────
function PvDeskEmptyMobile() {
  const T = pvT(false);
  const fandoms = ['dramione','jujutsu kaisen','благие знамения','наруто','ведьмак','свой…'];
  return (
    <div className="mix" style={{ width:'100%', height:'100%', background: T.bg,
      position:'relative', overflow:'hidden', display:'flex', flexDirection:'column' }}>
      <div style={{ position:'absolute', left:'50%', top: 90, width: 320, height: 320, transform:'translateX(-50%)',
        background:`radial-gradient(circle, ${T.glow}, transparent 62%)`, pointerEvents:'none' }}/>
      <div style={{ display:'flex', justifyContent:'space-between', padding:'10px 18px 4px',
        fontFamily: PV_FONT.mono, fontSize: 11, color: T.ink, opacity:.8, position:'relative', zIndex: 2 }}>
        <span>1:42</span><span>•••○ 5G 92%</span>
      </div>

      <div style={{ flex:1, padding:'0 24px', position:'relative', zIndex: 2,
        display:'flex', flexDirection:'column', justifyContent:'center' }}>
        <div style={{ textAlign:'center', marginBottom: 26 }}>
          <div style={{ fontFamily: PV_FONT.display, fontSize: 15, color: T.amber, fontStyle:'italic' }}>✦</div>
          <div style={{ fontFamily: PV_FONT.display, fontSize: 34, fontWeight: 500, lineHeight: 1.05,
            marginTop: 12, textWrap:'balance', color: T.ink }}>
            Твой стол пока <em style={{ color: T.amber }}>пуст</em>.
          </div>
          <div style={{ fontFamily: PV_FONT.body, fontStyle:'italic', fontSize: 14, color: T.inkDim,
            marginTop: 12, lineHeight: 1.5, textWrap:'pretty' }}>
            Но пустой лист — плохое начало. Выбери фандом, а сцену найдём вместе.
          </div>
        </div>

        <PvMono c={T.inkDim} size={8.5} style={{ marginBottom: 12, textAlign:'center', display:'block' }}>
          с чего начнём этой ночью
        </PvMono>
        <div style={{ display:'flex', flexWrap:'wrap', gap: 8, justifyContent:'center', marginBottom: 26 }}>
          {fandoms.map((f, i) => (
            <span key={f} style={{ padding:'9px 15px', borderRadius: 999,
              fontFamily: PV_FONT.display, fontStyle:'italic', fontSize: 14,
              border:`1px solid ${i === 0 ? T.amber : T.border}`,
              background: i === 0 ? T.amberSoft : 'transparent',
              color: i === 0 ? T.amber : T.inkDim }}>{f}</span>
          ))}
        </div>

        <div style={{ textAlign:'center' }}>
          <span style={{ display:'inline-block', padding:'8px 22px', borderRadius: 999,
            background: T.amber, color: T.bg, fontFamily: PV_FONT.display, fontStyle:'italic',
            fontSize: 14, fontWeight: 500 }}>
            + начать →
          </span>
        </div>
      </div>

      <div style={{ padding:'16px 24px 26px', textAlign:'center', position:'relative', zIndex: 2 }}>
        <span style={{ fontFamily: PV_FONT.body, fontStyle:'italic', fontSize: 12, color: T.inkFaint }}>
          ★ полночное чтиво для тех, кто не спит ★
        </span>
      </div>
    </div>
  );
}

window.PvDeskDesktop = PvDeskDesktop;
window.PvDeskMobile = PvDeskMobile;
window.PvDeskEmptyMobile = PvDeskEmptyMobile;
window.PvStoryCover = PvStoryCover;
