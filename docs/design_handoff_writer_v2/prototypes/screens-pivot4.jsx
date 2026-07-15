// Pivot v3 — Личный кабинет, мобильные версии (360×740): автор + читатель.
// Использует pvT, PV_FONT, PvMono (screens-pivot.jsx) и PvRoleTabs/PvStatCard/… (screens-pivot3.jsx).

// общий каркас мобильного кабинета
function PvCabMobShell({ T, children }) {
  return (
    <div className="mix" style={{ width:'100%', height:'100%', background: T.bg,
      position:'relative', overflow:'hidden', display:'flex', flexDirection:'column' }}>
      <div style={{ position:'absolute', right:-70, top:-60, width: 260, height: 260,
        background:`radial-gradient(circle, ${T.glow}, transparent 65%)`, pointerEvents:'none' }}></div>
      <div style={{ display:'flex', justifyContent:'space-between', padding:'10px 18px 4px',
        fontFamily: PV_FONT.mono, fontSize: 11, color: T.ink, opacity:.8, position:'relative', zIndex: 2 }}>
        <span>1:42</span><span>•••○ 5G 92%</span>
      </div>
      {children}
      {/* tab bar — «я» активна */}
      <div style={{ position:'absolute', bottom: 0, left:0, right:0, padding:'10px 14px 16px',
        background:`linear-gradient(180deg, transparent, ${T.bg} 45%)`,
        borderTop:`1px solid ${T.border}`, backdropFilter:'blur(12px)',
        display:'flex', justifyContent:'space-around', alignItems:'flex-end', zIndex: 6 }}>
        {[['☆','лента'],['✎','пишу'],['✦','генерируй'],['◯','я', T.amber]].map(([icon, t2, c]) => (
          <div key={t2} style={{ textAlign:'center', color: c || T.inkDim }}>
            <div style={{ fontSize: 16, lineHeight: 1 }} aria-hidden="true">{icon}</div>
            <div style={{ marginTop: 3, fontFamily: PV_FONT.display, fontStyle:'italic', fontSize: 12.5 }}>{t2}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// шапка кабинета: имя + аватар + табы ролей
function PvCabMobHeader({ T, active }) {
  return (
    <div style={{ padding:'8px 18px 14px', position:'relative', zIndex: 2 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: 12 }}>
        <div>
          <PvMono c={T.inkFaint} size={8}>кабинет · 1:42 ночи</PvMono>
          <div style={{ fontFamily: PV_FONT.display, fontSize: 26, fontWeight: 500, lineHeight: 1.05, marginTop: 4 }}>
            <em style={{ color: T.amber }}>@lunaxhalf</em>
          </div>
        </div>
        <div style={{ width: 40, height: 40, borderRadius:'50%',
          background:`linear-gradient(135deg, ${T.amber}, ${T.rose})`, border:`1px solid ${T.borderStrong}` }}></div>
      </div>
      <PvRoleTabs T={T} active={active} compact={true}/>
    </div>
  );
}

// компактная стат-плитка для mobile
function PvCabMobStat({ T, label, value, sub, accent }) {
  return (
    <div style={{ padding:'11px 13px', borderRadius: 12, border:`1px solid ${T.border}`,
      background: T.surface, minWidth: 0 }}>
      <PvMono c={T.inkDim} size={7.5}>{label}</PvMono>
      <div style={{ fontFamily: PV_FONT.display, fontSize: 21, color: accent || T.ink,
        margin:'3px 0 1px', lineHeight: 1.05 }}>{value}</div>
      {sub && <div style={{ fontFamily: PV_FONT.body, fontStyle:'italic', fontSize: 10,
        color: T.inkFaint, lineHeight: 1.3, textWrap:'pretty' }}>{sub}</div>}
    </div>
  );
}

// ── 3. ЛК АВТОРА (mobile) ─────────────────────────────────────
function PvCabinetAuthorMobile() {
  const T = pvT(false);
  const stories = [
    { t:'Зимний свет в подземельях', state:'черновик гл. 7', reads:'8 412',  grad:'mix-poster-grad-1', hot: true },
    { t:'Виноград и пепел',          state:'18 глав',        reads:'24 803', grad:'mix-poster-grad-5' },
  ];
  return (
    <PvCabMobShell T={T}>
      <PvCabMobHeader T={T} active="author"/>
      <div style={{ flex:1, overflow:'hidden', padding:'0 18px', position:'relative', zIndex: 2 }}>

        {/* баланс генераций — одна строка */}
        <div style={{ display:'flex', alignItems:'center', gap: 10, padding:'10px 14px',
          borderRadius: 12, border:`1px solid ${T.amber}44`,
          background:`linear-gradient(135deg, ${T.amberSoft}, transparent 70%)`, marginBottom: 12 }}>
          <span style={{ fontFamily: PV_FONT.display, fontSize: 18, color: T.ink }}>
            2 <span style={{ color: T.inkFaint, fontSize: 13 }}>/ 5</span>
          </span>
          <PvMono c={T.inkDim} size={7.5} style={{ flex: 1 }}>ai-генераций · free</PvMono>
          <PvMono c={T.amber} size={8}>★ pro →</PvMono>
        </div>

        {/* слова за 14 ночей */}
        <div style={{ padding:'11px 13px', borderRadius: 12, border:`1px solid ${T.border}`,
          background: T.surface, marginBottom: 10 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline' }}>
            <PvMono c={T.inkDim} size={7.5}>слов за 14 ночей</PvMono>
            <PvMono c={T.amber} size={7.5}>сегодня 1 124</PvMono>
          </div>
          <div style={{ display:'flex', alignItems:'flex-end', gap: 12, marginTop: 7 }}>
            <div style={{ fontFamily: PV_FONT.display, fontSize: 22, color: T.ink, lineHeight: 1 }}>15 904</div>
            <div style={{ flex: 1 }}><PvSpark T={T} data={PV_NIGHT_WORDS} h={26}/></div>
          </div>
        </div>

        {/* 3 метрики */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap: 8, marginBottom: 16 }}>
          <PvCabMobStat T={T} label="дочитыв." value="33 215" sub="+18%"/>
          <PvCabMobStat T={T} label="сохран." value="5 115" accent={T.rose} sub="♡"/>
          <PvCabMobStat T={T} label="подписч." value="1 892" sub="+41"/>
        </div>

        {/* мои истории */}
        <div style={{ display:'flex', alignItems:'baseline', gap: 10, marginBottom: 10 }}>
          <div style={{ fontFamily: PV_FONT.display, fontStyle:'italic', fontSize: 16 }}>✦ мои истории</div>
          <div style={{ flex:1, height:1, background: T.border }}></div>
          <PvMono c={T.inkFaint} size={7.5}>все 3 →</PvMono>
        </div>
        {stories.map((s, i) => (
          <div key={i} style={{ display:'flex', alignItems:'center', gap: 12,
            padding:'10px 12px', marginBottom: 8, borderRadius: 12,
            border:`1px solid ${s.hot ? T.amber + '44' : T.border}`,
            background: s.hot ? `linear-gradient(140deg, ${T.amberSoft}, ${T.surface} 60%)` : T.surface }}>
            <div className={s.grad} style={{ width: 38, height: 52, borderRadius: 6,
              border:`1px solid ${T.borderStrong}`, position:'relative', flex:'0 0 38px' }}>
              <div className="mix-grain"></div>
            </div>
            <div style={{ flex:1, minWidth: 0 }}>
              <div style={{ fontFamily: PV_FONT.display, fontStyle:'italic', fontSize: 14, color: T.ink,
                whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{s.t}</div>
              <div style={{ display:'flex', gap: 10, marginTop: 3 }}>
                <PvMono c={T.inkFaint} size={7.5}>{s.state}</PvMono>
                <PvMono c={T.inkDim} size={7.5}>◉ {s.reads}</PvMono>
              </div>
            </div>
            <span style={{ padding:'4px 10px', borderRadius: 999, whiteSpace:'nowrap',
              border:`1px solid ${T.amber}66`,
              background: s.hot ? T.amber : 'transparent',
              color: s.hot ? T.bg : T.amber,
              fontFamily: PV_FONT.display, fontStyle:'italic', fontSize: 11.5,
              fontWeight: s.hot ? 500 : 400 }}>{s.hot ? 'писать →' : 'открыть'}</span>
          </div>
        ))}

        {/* читатели ждут */}
        <div style={{ display:'flex', alignItems:'center', gap: 10, padding:'10px 12px',
          borderRadius: 12, border:`1px dashed ${T.borderStrong}` }}>
          <span aria-hidden="true" style={{ color: T.rose, fontSize: 13 }}>♡</span>
          <div style={{ flex: 1, fontFamily: PV_FONT.body, fontStyle:'italic', fontSize: 11.5,
            color: T.inkDim, lineHeight: 1.4 }}>
            312 читателей ждут гл. 8 «Зимнего света»
          </div>
          <PvMono c={T.amber} size={7.5}>гл. 8 →</PvMono>
        </div>
      </div>
    </PvCabMobShell>
  );
}

// ── 4. ЛК ЧИТАТЕЛЯ (mobile) ───────────────────────────────────
function PvCabinetReaderMobile() {
  const T = pvT(false);
  const reads = PV_READS_NOW.slice(0, 2);
  return (
    <PvCabMobShell T={T}>
      <PvCabMobHeader T={T} active="reader"/>
      <div style={{ flex:1, overflow:'hidden', padding:'0 18px', position:'relative', zIndex: 2 }}>

        {/* streak hero */}
        <div style={{ display:'flex', alignItems:'center', gap: 12, padding:'10px 14px',
          borderRadius: 12, border:`1px solid ${T.amber}55`,
          background:`linear-gradient(135deg, ${T.amberSoft}, transparent 70%)`, marginBottom: 8 }}>
          <div style={{ width: 36, height: 36, borderRadius:'50%', flex:'0 0 36px',
            background:`radial-gradient(circle, ${T.amber}66, transparent 70%)`,
            display:'flex', alignItems:'center', justifyContent:'center',
            color: T.amber, fontSize: 16 }} aria-hidden="true">✶</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: PV_FONT.display, fontSize: 17, color: T.ink, lineHeight: 1 }}>
              12-я ночь подряд
            </div>
            <div style={{ fontFamily: PV_FONT.body, fontStyle:'italic', fontSize: 10.5,
              color: T.inkDim, marginTop: 3 }}>свеча не гаснет · рекорд: 23</div>
          </div>
        </div>

        {/* reader stats 2×2 */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap: 8, marginBottom: 10 }}>
          <PvCabMobStat T={T} label="историй дочитано" value="47" sub="ещё 3 в процессе"/>
          <PvCabMobStat T={T} label="слов прочитано" value="1,28 млн" sub="2,5 «войны и мира»" accent={T.amber}/>
          <PvCabMobStat T={T} label="ночных часов" value="86" sub="31 — с аудио ☾"/>
          <PvCabMobStat T={T} label="на полке" value="129" sub="♡ сохранено" accent={T.rose}/>
        </div>

        {/* continue reading */}
        <div style={{ display:'flex', alignItems:'baseline', gap: 10, marginBottom: 8 }}>
          <div style={{ fontFamily: PV_FONT.display, fontStyle:'italic', fontSize: 16 }}>☾ продолжить</div>
          <div style={{ flex:1, height:1, background: T.border }}></div>
          <PvMono c={T.inkFaint} size={7.5}>полка →</PvMono>
        </div>
        {reads.map((s, i) => (
          <div key={i} style={{ display:'flex', alignItems:'center', gap: 12,
            padding:'8px 12px', marginBottom: 6, borderRadius: 12,
            border:`1px solid ${T.border}`, background: T.surface }}>
            <div className={s.grad} style={{ width: 38, height: 52, borderRadius: 6,
              border:`1px solid ${T.borderStrong}`, position:'relative', flex:'0 0 38px' }}>
              <div className="mix-grain"></div>
            </div>
            <div style={{ flex:1, minWidth: 0 }}>
              <div style={{ fontFamily: PV_FONT.display, fontStyle:'italic', fontSize: 14, color: T.ink,
                whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{s.t}</div>
              <div style={{ display:'flex', alignItems:'center', gap: 8, marginTop: 6 }}>
                <div style={{ flex:1, height: 4, borderRadius: 2,
                  background:'rgba(0,0,0,.3)', overflow:'hidden' }}>
                  <div style={{ width: s.pct + '%', height:'100%',
                    background:`linear-gradient(90deg, ${T.amber}, ${T.rose})` }}></div>
                </div>
                <PvMono c={T.inkDim} size={7} style={{ whiteSpace:'nowrap' }}>{s.ch}</PvMono>
              </div>
            </div>
            <span style={{ color: T.amber, fontSize: 15 }} aria-hidden="true">→</span>
          </div>
        ))}

        {/* бейджи + мостик в авторство */}
        <div style={{ display:'flex', flexWrap:'wrap', gap: 6, margin:'2px 0 8px' }}>
          {['☾ найт-ридер','✶ запойное чтение','♡ верная полка'].map(b => (
            <span key={b} style={{ padding:'4px 9px', borderRadius: 10, fontSize: 10,
              fontFamily: PV_FONT.body, fontStyle:'italic', whiteSpace:'nowrap',
              border:`1px solid ${T.border}`, color: T.inkDim }}>{b}</span>
          ))}
        </div>
        <div style={{ display:'flex', alignItems:'center', gap: 10, padding:'9px 12px',
          borderRadius: 12, border:`1px dashed ${T.borderStrong}` }}>
          <span aria-hidden="true" style={{ color: T.amber, fontSize: 13 }}>✎</span>
          <div style={{ flex: 1, fontFamily: PV_FONT.body, fontStyle:'italic', fontSize: 11.5,
            color: T.inkDim, lineHeight: 1.4 }}>
            47 историй прочитано — где-то в них прячется твоя первая
          </div>
          <PvMono c={T.amber} size={7.5}>писать →</PvMono>
        </div>
      </div>
    </PvCabMobShell>
  );
}

window.PvCabinetAuthorMobile = PvCabinetAuthorMobile;
window.PvCabinetReaderMobile = PvCabinetReaderMobile;
