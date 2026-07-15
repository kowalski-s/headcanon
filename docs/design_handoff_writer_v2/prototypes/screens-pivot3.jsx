// Pivot v3 — Личный кабинет v2: панель автора + панель читателя, desktop + mobile.
// Использует pvT(false), PV_FONT, PvMono из screens-pivot.jsx и .mix классы.

// ── shared bits ───────────────────────────────────────────────

// Переключатель ролей кабинета. Читатель — у всех; автор — только если есть истории.
function PvRoleTabs({ T, active, compact = false }) {
  const tabs = [
    { id:'reader', ic:'☾', t:'читатель' },
    { id:'author', ic:'✎', t:'автор' },
  ];
  return (
    <div style={{ display:'inline-flex', borderRadius: 999, border:`1px solid ${T.border}`,
      padding: 3, gap: 2, background:'rgba(0,0,0,.2)' }}>
      {tabs.map(tab => {
        const on = tab.id === active;
        return (
          <span key={tab.id} style={{ display:'inline-flex', alignItems:'center', gap: 6,
            padding: compact ? '6px 13px' : '7px 16px', borderRadius: 999,
            background: on ? T.amber : 'transparent',
            color: on ? T.bg : T.inkDim,
            fontFamily: PV_FONT.display, fontStyle:'italic',
            fontSize: compact ? 12.5 : 13.5, fontWeight: on ? 600 : 400 }}>
            <span aria-hidden="true" style={{ fontStyle:'normal', fontSize: compact ? 11 : 12 }}>{tab.ic}</span>
            {tab.t}
          </span>
        );
      })}
    </div>
  );
}

function PvStatCard({ T, label, value, sub, accent, pad = '14px 16px', valueSize = 26 }) {
  return (
    <div style={{ padding: pad, borderRadius: 12, border:`1px solid ${T.border}`,
      background: T.surface, minWidth: 0 }}>
      <PvMono c={T.inkDim} size={8.5}>{label}</PvMono>
      <div style={{ fontFamily: PV_FONT.display, fontSize: valueSize, color: accent || T.ink,
        margin:'4px 0 2px', lineHeight: 1.05 }}>{value}</div>
      {sub && <div style={{ fontFamily: PV_FONT.body, fontStyle:'italic', fontSize: 10.5,
        color: T.inkFaint, lineHeight: 1.35, textWrap:'pretty' }}>{sub}</div>}
    </div>
  );
}

// мини-бары «слов за 14 ночей»
function PvSpark({ T, data, h = 34 }) {
  const max = Math.max(...data);
  return (
    <div style={{ display:'flex', alignItems:'flex-end', gap: 3, height: h }}>
      {data.map((v, i) => (
        <div key={i} style={{ flex: 1, borderRadius: 2,
          height: Math.max(3, (v / max) * h),
          background: i === data.length - 1 ? T.amber : `${T.amber}${v ? '55' : '22'}` }}></div>
      ))}
    </div>
  );
}

// горизонтальная полоса доли фандома
function PvFandomBar({ T, name, pct, grad }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom: 4 }}>
        <span style={{ fontFamily: PV_FONT.display, fontStyle:'italic', fontSize: 12.5, color: T.ink }}>{name}</span>
        <PvMono c={T.inkFaint} size={8}>{pct}%</PvMono>
      </div>
      <div style={{ height: 5, borderRadius: 3, background:'rgba(0,0,0,.3)', overflow:'hidden' }}>
        <div className={grad} style={{ width: pct + '%', height:'100%', borderRadius: 3 }}></div>
      </div>
    </div>
  );
}

const PV_NIGHT_WORDS = [820, 1240, 0, 1480, 960, 1820, 1310, 0, 740, 1520, 1190, 2040, 1660, 1124];

const PV_READS_NOW = [
  { t:'Шесть глаз не лгут',     by:'@kasumi_dr', grad:'mix-poster-grad-4', ch:'гл. 11 / 14', pct: 78 },
  { t:'Сад камней и писем',     by:'@verlibre',  grad:'mix-poster-grad-3', ch:'гл. 3 / 9',  pct: 31 },
  { t:'Полночь у Боргина',      by:'@hex.tape',  grad:'mix-poster-grad-5', ch:'гл. 6 / 6',  pct: 100, done: true },
];

// ── NAV (desktop, общий для обеих панелей) ────────────────────
function PvCabinetNav({ T }) {
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
      padding:'14px 28px', borderBottom:`1px solid ${T.border}`, position:'relative', zIndex: 5 }}>
      <div style={{ display:'flex', alignItems:'baseline', gap: 28 }}>
        <div style={{ display:'flex', alignItems:'baseline', gap: 3 }}>
          <span style={{ fontFamily: PV_FONT.display, fontStyle:'italic', fontSize: 22, color: T.ink }}>head</span>
          <span className="mix-chrome" style={{ fontFamily: PV_FONT.display, fontSize: 22, fontWeight: 600 }}>canon</span>
        </div>
        <div style={{ display:'flex', gap: 20, fontFamily: PV_FONT.ui, fontSize: 13, color: T.inkDim }}>
          <span>лента</span>
          <span style={{ color: T.amber, fontFamily: PV_FONT.display, fontStyle:'italic' }}>★ кабинет</span>
          <span>топы</span>
        </div>
      </div>
      <div style={{ display:'flex', alignItems:'center', gap: 14 }}>
        <div style={{ padding:'5px 13px', borderRadius: 999, background: T.amber, color: T.bg,
          fontFamily: PV_FONT.display, fontStyle:'italic', fontSize: 12.5, fontWeight: 500 }}>+ новая история</div>
        <div style={{ width: 34, height: 34, borderRadius:'50%',
          background:`linear-gradient(135deg, ${T.amber}, ${T.rose})`, border:`1px solid ${T.borderStrong}` }}></div>
      </div>
    </div>
  );
}

// ── 1. ЛК АВТОРА v2 (desktop) ─────────────────────────────────
function PvCabinetAuthorDesktop() {
  const T = pvT(false);
  const stories = [
    { t:'Зимний свет в подземельях', state:'в работе · черновик гл. 7', pub: true,  reads:'8 412',  saves:'1 204', grad:'mix-poster-grad-1', cta:'писать →', hot: true },
    { t:'Виноград и пепел',          state:'опубликовано · 18 глав',    pub: true,  reads:'24 803', saves:'3 911', grad:'mix-poster-grad-5', cta:'открыть' },
    { t:'Без названия (новая)',      state:'черновик · 0 слов',         pub: false, reads:'—',      saves:'—',     grad:'mix-poster-grad-3', cta:'начать →' },
  ];
  return (
    <div className="mix" style={{ width:'100%', height:'100%', background: T.bg,
      position:'relative', overflow:'hidden' }}>
      <div style={{ position:'absolute', left:'40%', top:-140, width: 420, height: 420,
        background:`radial-gradient(circle, ${T.glow}, transparent 65%)`, pointerEvents:'none' }}></div>

      <PvCabinetNav T={T}/>

      <div style={{ padding:'22px 28px 0', position:'relative', zIndex: 3 }}>
        {/* greeting + role tabs + balance */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginBottom: 18 }}>
          <div>
            <div style={{ display:'flex', alignItems:'center', gap: 16, marginBottom: 10 }}>
              <PvRoleTabs T={T} active="author"/>
              <PvMono c={T.inkFaint} size={8.5}>вт · 9 июня · 1:42 ночи</PvMono>
            </div>
            <div style={{ fontFamily: PV_FONT.display, fontSize: 36, fontWeight: 500, lineHeight: 1 }}>
              За работу, <em style={{ color: T.amber }}>@lunaxhalf</em>.
            </div>
          </div>
          <div style={{ display:'flex', gap: 12 }}>
            <div style={{ padding:'11px 16px', borderRadius: 12, border:`1px solid ${T.border}`, background: T.surface }}>
              <PvMono c={T.inkDim} size={8.5}>ai-генерации</PvMono>
              <div style={{ display:'flex', alignItems:'baseline', gap: 6, marginTop: 3 }}>
                <span style={{ fontFamily: PV_FONT.display, fontSize: 21, color: T.ink }}>2 <span style={{ color: T.inkFaint, fontSize: 14 }}>/ 5</span></span>
                <PvMono c={T.amber} size={8.5}>free</PvMono>
              </div>
            </div>
            <div style={{ padding:'11px 16px', borderRadius: 12, border:`1px solid ${T.amber}55`,
              background:`linear-gradient(135deg, ${T.amberSoft}, transparent)` }}>
              <PvMono c={T.amber} size={8.5}>★ PRO — 30 генераций + аудио</PvMono>
              <div style={{ fontFamily: PV_FONT.display, fontStyle:'italic', fontSize: 14, color: T.ink, marginTop: 3 }}>
                от 990 ₽/мес →
              </div>
            </div>
          </div>
        </div>

        {/* stats: спарклайн + 3 карточки */}
        <div style={{ display:'grid', gridTemplateColumns:'1.6fr 1fr 1fr 1fr', gap: 14, marginBottom: 20 }}>
          <div style={{ padding:'14px 16px', borderRadius: 12, border:`1px solid ${T.border}`, background: T.surface }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline' }}>
              <PvMono c={T.inkDim} size={8.5}>слов за 14 ночей</PvMono>
              <PvMono c={T.amber} size={8.5}>сегодня 1 124</PvMono>
            </div>
            <div style={{ display:'flex', alignItems:'flex-end', gap: 14, marginTop: 8 }}>
              <div style={{ fontFamily: PV_FONT.display, fontSize: 26, color: T.ink, lineHeight: 1 }}>15 904</div>
              <div style={{ flex: 1 }}><PvSpark T={T} data={PV_NIGHT_WORDS}/></div>
            </div>
          </div>
          <PvStatCard T={T} label="дочитывания" value="33 215" sub="+18% за неделю"/>
          <PvStatCard T={T} label="сохранения" value="5 115" sub="самая честная метрика" accent={T.rose}/>
          <PvStatCard T={T} label="подписчики" value="1 892" sub="+41 за неделю"/>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 300px', gap: 24 }}>
          {/* my stories */}
          <div>
            <div style={{ display:'flex', alignItems:'baseline', gap: 12, marginBottom: 12 }}>
              <div style={{ fontFamily: PV_FONT.display, fontStyle:'italic', fontSize: 18 }}>✦ мои истории</div>
              <div style={{ display:'flex', gap: 4 }}>
                {['все','черновики','опубликованные'].map((f, i) => (
                  <span key={f} style={{ padding:'3px 10px', borderRadius: 999, fontSize: 10.5,
                    fontFamily: PV_FONT.ui,
                    background: i === 0 ? T.amberSoft : 'transparent',
                    border:`1px solid ${i === 0 ? T.amber + '55' : T.border}`,
                    color: i === 0 ? T.amber : T.inkFaint }}>{f}</span>
                ))}
              </div>
              <div style={{ flex:1, height:1, background: T.border }}></div>
            </div>
            {stories.map((s, i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap: 14,
                padding:'11px 14px', marginBottom: 8, borderRadius: 12,
                border:`1px solid ${s.hot ? T.amber + '44' : T.border}`,
                background: s.hot ? `linear-gradient(140deg, ${T.amberSoft}, ${T.surface} 60%)` : T.surface }}>
                <div className={s.grad} style={{ width: 42, height: 58, borderRadius: 6,
                  border:`1px solid ${T.borderStrong}`, position:'relative', flex:'0 0 42px' }}>
                  <div className="mix-grain"></div>
                </div>
                <div style={{ flex:1, minWidth: 0 }}>
                  <div style={{ fontFamily: PV_FONT.display, fontStyle:'italic', fontSize: 16, color: T.ink }}>{s.t}</div>
                  <PvMono c={T.inkFaint} size={8.5}>{s.state}</PvMono>
                </div>
                <div style={{ width: 70, textAlign:'right' }}>
                  <PvMono c={T.inkDim} size={9}>◉ {s.reads}</PvMono>
                </div>
                <div style={{ width: 64, textAlign:'right' }}>
                  <PvMono c={T.rose} size={9}>♡ {s.saves}</PvMono>
                </div>
                <span style={{ padding:'5px 12px', borderRadius: 999,
                  border:`1px solid ${T.amber}66`,
                  background: s.hot ? T.amber : 'transparent',
                  color: s.hot ? T.bg : T.amber,
                  fontFamily: PV_FONT.display, fontStyle:'italic', fontSize: 12,
                  fontWeight: s.hot ? 500 : 400, whiteSpace:'nowrap' }}>{s.cta}</span>
              </div>
            ))}
            {/* читатели ждут */}
            <div style={{ display:'flex', alignItems:'center', gap: 12, padding:'11px 14px',
              borderRadius: 12, border:`1px dashed ${T.borderStrong}` }}>
              <span aria-hidden="true" style={{ color: T.rose, fontSize: 15 }}>♡</span>
              <div style={{ flex: 1, fontFamily: PV_FONT.body, fontStyle:'italic', fontSize: 12.5,
                color: T.inkDim, lineHeight: 1.45 }}>
                312 читателей подписаны на «Зимний свет» — гл. 8 ждут уже 6 дней
              </div>
              <PvMono c={T.amber} size={8.5}>написать гл. 8 →</PvMono>
            </div>
          </div>

          {/* awards + до топа */}
          <div>
            <div style={{ fontFamily: PV_FONT.display, fontStyle:'italic', fontSize: 18, marginBottom: 12 }}>
              ★ награды
            </div>
            <div style={{ padding: 14, borderRadius: 12, border:`1px solid ${T.amber}44`,
              background:`linear-gradient(150deg, ${T.amberSoft}, transparent 70%)`, marginBottom: 10 }}>
              <div style={{ display:'flex', alignItems:'center', gap: 10 }}>
                <div className="mix-burst" style={{ width: 42, height: 42, background: T.amber,
                  color: T.bg, display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize: 19, transform:'rotate(-8deg)', flex:'0 0 42px' }}>★</div>
                <div>
                  <div style={{ fontFamily: PV_FONT.display, fontStyle:'italic', fontSize: 14, color: T.ink }}>
                    топ-3 недели · dramione
                  </div>
                  <PvMono c={T.amber} size={8.5}>+10 генераций · бейдж в профиль</PvMono>
                </div>
              </div>
            </div>
            <div style={{ display:'flex', flexWrap:'wrap', gap: 6, marginBottom: 14 }}>
              {['☾ найт-райтер','✉ эпистолярщик','✶ слоубёрнер'].map(b => (
                <span key={b} style={{ padding:'6px 10px', borderRadius: 10, fontSize: 10.5,
                  fontFamily: PV_FONT.body, fontStyle:'italic',
                  border:`1px solid ${T.border}`, color: T.inkDim }}>{b}</span>
              ))}
            </div>
            <div style={{ padding: 14, borderRadius: 12, border:`1px dashed ${T.borderStrong}` }}>
              <PvMono c={T.inkDim} size={8.5}>до топа месяца</PvMono>
              <div style={{ fontFamily: PV_FONT.body, fontStyle:'italic', fontSize: 12,
                color: T.ink, margin:'6px 0 8px', lineHeight: 1.45 }}>
                ещё ~840 дочитываний — продолжи «Зимний свет», читатели ждут гл. 8
              </div>
              <div style={{ height: 4, borderRadius: 2, background: T.border, overflow:'hidden' }}>
                <div style={{ width:'68%', height:'100%', background:`linear-gradient(90deg, ${T.amber}, ${T.rose})` }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── 2. ЛК ЧИТАТЕЛЯ (desktop) ──────────────────────────────────
function PvCabinetReaderDesktop() {
  const T = pvT(false);
  return (
    <div className="mix" style={{ width:'100%', height:'100%', background: T.bg,
      position:'relative', overflow:'hidden' }}>
      <div style={{ position:'absolute', left:'12%', top:-140, width: 420, height: 420,
        background:`radial-gradient(circle, ${T.glow}, transparent 65%)`, pointerEvents:'none' }}></div>

      <PvCabinetNav T={T}/>

      <div style={{ padding:'22px 28px 0', position:'relative', zIndex: 3 }}>
        {/* greeting + streak */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginBottom: 18 }}>
          <div>
            <div style={{ display:'flex', alignItems:'center', gap: 16, marginBottom: 10 }}>
              <PvRoleTabs T={T} active="reader"/>
              <PvMono c={T.inkFaint} size={8.5}>вт · 9 июня · 1:42 ночи</PvMono>
            </div>
            <div style={{ fontFamily: PV_FONT.display, fontSize: 36, fontWeight: 500, lineHeight: 1 }}>
              С возвращением, <em style={{ color: T.amber }}>@lunaxhalf</em>.
            </div>
          </div>
          {/* streak — свеча не гаснет */}
          <div style={{ display:'flex', alignItems:'center', gap: 14, padding:'12px 18px',
            borderRadius: 12, border:`1px solid ${T.amber}55`,
            background:`linear-gradient(135deg, ${T.amberSoft}, transparent)` }}>
            <div style={{ width: 38, height: 38, borderRadius:'50%', flex:'0 0 38px',
              background:`radial-gradient(circle, ${T.amber}66, transparent 70%)`,
              display:'flex', alignItems:'center', justifyContent:'center',
              color: T.amber, fontSize: 17 }} aria-hidden="true">✶</div>
            <div>
              <div style={{ fontFamily: PV_FONT.display, fontSize: 20, color: T.ink, lineHeight: 1 }}>
                12-я ночь подряд
              </div>
              <div style={{ fontFamily: PV_FONT.body, fontStyle:'italic', fontSize: 11,
                color: T.inkDim, marginTop: 3 }}>свеча не гаснет — рекорд: 23</div>
            </div>
          </div>
        </div>

        {/* reader stats */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap: 14, marginBottom: 20 }}>
          <PvStatCard T={T} label="историй дочитано" value="47" sub="ещё 3 — в процессе"/>
          <PvStatCard T={T} label="слов прочитано" value="1 284 600" sub="≈ 2,5 «Войны и мира»" accent={T.amber}/>
          <PvStatCard T={T} label="ночных часов" value="86" sub="из них 31 — с аудио ☾"/>
          <PvStatCard T={T} label="на полке" value="129" sub="♡ сохранённых историй" accent={T.rose}/>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 300px', gap: 24 }}>
          {/* continue reading */}
          <div>
            <div style={{ display:'flex', alignItems:'baseline', gap: 12, marginBottom: 12 }}>
              <div style={{ fontFamily: PV_FONT.display, fontStyle:'italic', fontSize: 18 }}>☾ продолжить чтение</div>
              <div style={{ flex:1, height:1, background: T.border }}></div>
              <PvMono c={T.inkFaint} size={8.5}>полка →</PvMono>
            </div>
            {PV_READS_NOW.map((s, i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap: 14,
                padding:'11px 14px', marginBottom: 8, borderRadius: 12,
                border:`1px solid ${T.border}`, background: T.surface }}>
                <div className={s.grad} style={{ width: 42, height: 58, borderRadius: 6,
                  border:`1px solid ${T.borderStrong}`, position:'relative', flex:'0 0 42px' }}>
                  <div className="mix-grain"></div>
                </div>
                <div style={{ flex:1, minWidth: 0 }}>
                  <div style={{ display:'flex', alignItems:'baseline', gap: 8 }}>
                    <span style={{ fontFamily: PV_FONT.display, fontStyle:'italic', fontSize: 16, color: T.ink }}>{s.t}</span>
                    <PvMono c={T.inkFaint} size={8}>{s.by}</PvMono>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap: 10, marginTop: 7 }}>
                    <div style={{ flex:1, maxWidth: 220, height: 4, borderRadius: 2,
                      background:'rgba(0,0,0,.3)', overflow:'hidden' }}>
                      <div style={{ width: s.pct + '%', height:'100%',
                        background: s.done ? T.inkFaint : `linear-gradient(90deg, ${T.amber}, ${T.rose})` }}></div>
                    </div>
                    <PvMono c={T.inkDim} size={8} style={{ whiteSpace:'nowrap' }}>{s.ch}</PvMono>
                  </div>
                </div>
                <span style={{ padding:'5px 12px', borderRadius: 999,
                  border:`1px solid ${s.done ? T.border : T.amber + '66'}`,
                  color: s.done ? T.inkFaint : T.amber,
                  fontFamily: PV_FONT.display, fontStyle:'italic', fontSize: 12, whiteSpace:'nowrap' }}>
                  {s.done ? 'перечитать' : 'читать →'}
                </span>
              </div>
            ))}
            {/* новая глава у подписки */}
            <div style={{ display:'flex', alignItems:'center', gap: 12, padding:'11px 14px',
              borderRadius: 12, border:`1px dashed ${T.borderStrong}` }}>
              <span aria-hidden="true" style={{ color: T.amber, fontSize: 14 }}>✦</span>
              <div style={{ flex: 1, fontFamily: PV_FONT.body, fontStyle:'italic', fontSize: 12.5,
                color: T.inkDim, lineHeight: 1.45 }}>
                у «Шесть глаз не лгут» вышла гл. 12 — этой ночью, пока ты спала… или нет
              </div>
              <PvMono c={T.amber} size={8.5}>к главе →</PvMono>
            </div>
          </div>

          {/* fandoms + reader badges */}
          <div>
            <div style={{ fontFamily: PV_FONT.display, fontStyle:'italic', fontSize: 18, marginBottom: 12 }}>
              ✦ твои фандомы
            </div>
            <div style={{ padding: 14, borderRadius: 12, border:`1px solid ${T.border}`,
              background: T.surface, marginBottom: 14 }}>
              <PvFandomBar T={T} name="dramione"        pct={62} grad="mix-poster-grad-1"/>
              <PvFandomBar T={T} name="jujutsu kaisen"  pct={24} grad="mix-poster-grad-4"/>
              <PvFandomBar T={T} name="благие знамения" pct={14} grad="mix-poster-grad-3"/>
              <div style={{ fontFamily: PV_FONT.body, fontStyle:'italic', fontSize: 11,
                color: T.inkFaint, marginTop: 10, lineHeight: 1.45 }}>
                за месяц: dramione вырос на 12% — кто-то залип в подземельях
              </div>
            </div>
            <div style={{ display:'flex', flexWrap:'wrap', gap: 6, marginBottom: 14 }}>
              {['☾ найт-ридер','✶ запойное чтение','♡ верная полка'].map(b => (
                <span key={b} style={{ padding:'6px 10px', borderRadius: 10, fontSize: 10.5,
                  fontFamily: PV_FONT.body, fontStyle:'italic',
                  border:`1px solid ${T.border}`, color: T.inkDim }}>{b}</span>
              ))}
            </div>
            {/* мостик в авторство */}
            <div style={{ padding: 14, borderRadius: 12, border:`1px dashed ${T.borderStrong}` }}>
              <PvMono c={T.inkDim} size={8.5}>а если попробовать?</PvMono>
              <div style={{ fontFamily: PV_FONT.body, fontStyle:'italic', fontSize: 12,
                color: T.ink, margin:'6px 0 8px', lineHeight: 1.45 }}>
                ты прочитала 47 историй — где-то в них прячется твоя первая
              </div>
              <PvMono c={T.amber} size={8.5}>✎ написать свою →</PvMono>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

window.PvCabinetAuthorDesktop = PvCabinetAuthorDesktop;
window.PvCabinetReaderDesktop = PvCabinetReaderDesktop;
window.PvRoleTabs = PvRoleTabs;
window.PvStatCard = PvStatCard;
window.PvSpark = PvSpark;
window.PvFandomBar = PvFandomBar;
window.PV_READS_NOW = PV_READS_NOW;
window.PV_NIGHT_WORDS = PV_NIGHT_WORDS;
