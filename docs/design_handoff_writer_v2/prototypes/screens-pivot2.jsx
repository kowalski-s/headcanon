// Pivot v2 — Bible, Dashboard (ЛК), Onboarding, New Home (2 blocks).
// Dark app theme (MIX-aligned), uses pvT(false) + helpers from screens-pivot.jsx.

// ── 3. CHARACTER BIBLE (desktop) ──────────────────────────────
function PvBibleDesktop() {
  const T = pvT(false);
  const chars = [
    { name:'Драко Малфой', role:'второй главный', grad:'mix-poster-grad-1',
      traits:['сдержанный сарказм','бессонница','левша?'],
      facts: 14, ch:'гл. 1–7' },
    { name:'Гермиона Грейнджер', role:'главная героиня', grad:'mix-poster-grad-4',
      traits:['списки на всё','не выносит ложь','письма'],
      facts: 19, ch:'гл. 1–7' },
    { name:'Гораций Слизнорт', role:'второстепенный', grad:'mix-poster-grad-3',
      traits:['делает вид','коллекционер связей'],
      facts: 6, ch:'гл. 2, 5' },
    { name:'Лаванда Браун', role:'эпизодический', grad:'mix-poster-grad-5',
      traits:['знает больше, чем говорит'],
      facts: 4, ch:'гл. 6' },
  ];
  return (
    <div className="mix" style={{ width:'100%', height:'100%', background: T.bg,
      position:'relative', overflow:'hidden', display:'flex', flexDirection:'column' }}>
      <div style={{ position:'absolute', right:-120, top:-120, width: 400, height: 400,
        background:`radial-gradient(circle, ${T.glow}, transparent 65%)`, pointerEvents:'none' }}/>

      {/* top bar */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
        padding:'12px 20px', borderBottom:`1px solid ${T.border}`, zIndex: 5, position:'relative' }}>
        <div style={{ display:'flex', alignItems:'center', gap: 14 }}>
          <div style={{ display:'flex', alignItems:'baseline', gap: 3 }}>
            <span style={{ fontFamily: PV_FONT.display, fontStyle:'italic', fontSize: 19, color: T.ink }}>head</span>
            <span className="mix-chrome" style={{ fontFamily: PV_FONT.display, fontSize: 19, fontWeight: 600 }}>canon</span>
          </div>
          <span style={{ color: T.inkFaint }}>/</span>
          <span style={{ fontFamily: PV_FONT.display, fontStyle:'italic', fontSize: 14, color: T.ink }}>Зимний свет в подземельях</span>
          <span style={{ color: T.inkFaint }}>/</span>
          <PvMono c={T.amber}>✦ библия персонажей</PvMono>
        </div>
        <div style={{ padding:'5px 13px', borderRadius: 999, border:`1px solid ${T.amber}66`, color: T.amber,
          fontFamily: PV_FONT.display, fontStyle:'italic', fontSize: 12.5 }}>+ персонаж</div>
      </div>

      <div style={{ flex:1, display:'grid', gridTemplateColumns:'1fr 320px', minHeight: 0 }}>
        {/* cards grid */}
        <div style={{ padding:'24px 28px', overflow:'hidden' }}>
          <div style={{ display:'flex', alignItems:'baseline', gap: 14, marginBottom: 18 }}>
            <div style={{ fontFamily: PV_FONT.display, fontSize: 28, fontWeight: 500 }}>
              Персонажи<em style={{ color: T.amber }}>.</em>
            </div>
            <PvMono c={T.inkFaint}>6 в этой истории</PvMono>
            <div style={{ flex:1, height:1, background: T.border }}/>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap: 16 }}>
            {chars.map((c, i) => (
              <div key={c.name} style={{ borderRadius: 12, border:`1px solid ${T.border}`,
                background: T.surface, overflow:'hidden', boxShadow: T.shadow }}>
                <div style={{ display:'flex', gap: 14, padding: 14 }}>
                  <div className={c.grad} style={{ width: 64, height: 64, borderRadius: 10,
                    border:`1px solid ${T.borderStrong}`, position:'relative', flex:'0 0 64px' }}>
                    <div className="mix-grain"/>
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline' }}>
                      <div style={{ fontFamily: PV_FONT.display, fontSize: 17, fontStyle:'italic', color: T.ink }}>{c.name}</div>
                      <PvMono c={T.inkFaint} size={8}>{c.ch}</PvMono>
                    </div>
                    <PvMono c={T.amber} size={8.5}>{c.role}</PvMono>
                    <div style={{ display:'flex', flexWrap:'wrap', gap: 5, marginTop: 8 }}>
                      {c.traits.map(t2 => (
                        <span key={t2} style={{ padding:'3px 9px', borderRadius: 999,
                          fontFamily: PV_FONT.body, fontStyle:'italic', fontSize: 11,
                          border:`1px solid ${T.border}`, color: T.inkDim }}>{t2}</span>
                      ))}
                    </div>
                  </div>
                </div>
                <div style={{ display:'flex', justifyContent:'space-between', padding:'9px 14px',
                  borderTop:`1px solid ${T.border}`, background:'rgba(0,0,0,.16)' }}>
                  <PvMono c={T.inkDim} size={8.5}>✦ {c.facts} фактов из текста</PvMono>
                  <PvMono c={T.amber} size={8.5}>открыть →</PvMono>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI extraction feed */}
        <div style={{ borderLeft:`1px solid ${T.border}`, display:'flex', flexDirection:'column',
          background:'rgba(0,0,0,.22)' }}>
          <div style={{ padding:'16px 16px 10px', borderBottom:`1px solid ${T.border}` }}>
            <span className="mix-chrome" style={{ fontFamily: PV_FONT.display, fontStyle:'italic',
              fontSize: 15, fontWeight: 600 }}>✦ найдено в тексте</span>
            <div style={{ fontFamily: PV_FONT.body, fontStyle:'italic', fontSize: 11.5,
              color: T.inkDim, marginTop: 4, lineHeight: 1.45 }}>
              соавтор читает главы и собирает факты — подтверди или отклони
            </div>
          </div>
          <div style={{ flex:1, padding: 14, display:'flex', flexDirection:'column', gap: 10, overflow:'hidden' }}>
            {[
              { who:'Драко', fact:'не выносит запах гари — отворачивается у каминов', src:'гл. 6' },
              { who:'Гермиона', fact:'пишет письма, которые не отправляет (3-й раз в тексте)', src:'гл. 7' },
              { who:'Драко', fact:'играет на рояле? — «пальцы помнили клавиши»', src:'гл. 5', warn: true },
            ].map((f, i) => (
              <div key={i} style={{ padding:'10px 12px', borderRadius: 10,
                background: T.surface, border:`1px solid ${f.warn ? T.amber + '55' : T.border}` }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom: 5 }}>
                  <PvMono c={T.amber} size={8.5}>{f.who}</PvMono>
                  <PvMono c={T.inkFaint} size={8}>{f.src}</PvMono>
                </div>
                <div style={{ fontFamily: PV_FONT.body, fontSize: 12, fontStyle:'italic',
                  lineHeight: 1.5, color: T.ink }}>{f.fact}</div>
                <div style={{ display:'flex', gap: 6, marginTop: 8 }}>
                  <span style={{ padding:'3px 10px', borderRadius: 999, fontSize: 10,
                    background: T.amberSoft, border:`1px solid ${T.amber}55`, color: T.amber }}>в библию ✓</span>
                  <span style={{ padding:'3px 10px', borderRadius: 999, fontSize: 10,
                    border:`1px solid ${T.border}`, color: T.inkFaint }}>мимо</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── 4. DASHBOARD / ЛК автора (desktop) ────────────────────────
function PvDashboardDesktop() {
  const T = pvT(false);
  const stories = [
    { t:'Зимний свет в подземельях', state:'в работе · гл. 7 черновик', pub: true,  reads:'8 412', saves:'1 204', grad:'mix-poster-grad-1' },
    { t:'Виноград и пепел',           state:'опубликовано · 18 глав',    pub: true,  reads:'24 803', saves:'3 911', grad:'mix-poster-grad-5' },
    { t:'Без названия (новая)',       state:'черновик · 0 слов',          pub: false, reads:'—', saves:'—', grad:'mix-poster-grad-3' },
  ];
  return (
    <div className="mix" style={{ width:'100%', height:'100%', background: T.bg,
      position:'relative', overflow:'hidden' }}>
      <div style={{ position:'absolute', left:'40%', top:-140, width: 420, height: 420,
        background:`radial-gradient(circle, ${T.glow}, transparent 65%)`, pointerEvents:'none' }}/>

      {/* nav */}
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
          <div style={{ padding:'7px 16px', borderRadius: 999, background: T.amber, color: T.bg,
            fontFamily: PV_FONT.display, fontStyle:'italic', fontSize: 13, fontWeight: 600 }}>+ новая история</div>
          <div style={{ width: 34, height: 34, borderRadius:'50%',
            background:`linear-gradient(135deg, ${T.amber}, ${T.rose})`, border:`1px solid ${T.borderStrong}` }}/>
        </div>
      </div>

      <div style={{ padding:'26px 28px 0', position:'relative', zIndex: 3 }}>
        {/* greeting + plan */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginBottom: 22 }}>
          <div>
            <PvMono c={T.inkDim}>вт · 9 июня · 1:42 ночи — самое время</PvMono>
            <div style={{ fontFamily: PV_FONT.display, fontSize: 40, fontWeight: 500, marginTop: 6 }}>
              Привет, <em style={{ color: T.amber }}>@lunaxhalf</em>.
            </div>
          </div>
          {/* generation balance */}
          <div style={{ display:'flex', gap: 12 }}>
            <div style={{ padding:'12px 18px', borderRadius: 12, border:`1px solid ${T.border}`, background: T.surface }}>
              <PvMono c={T.inkDim} size={8.5}>ai-генерации</PvMono>
              <div style={{ display:'flex', alignItems:'baseline', gap: 6, marginTop: 4 }}>
                <span style={{ fontFamily: PV_FONT.display, fontSize: 22, color: T.ink }}>2 <span style={{ color: T.inkFaint, fontSize: 15 }}>/ 5</span></span>
                <PvMono c={T.amber} size={8.5}>free</PvMono>
              </div>
            </div>
            <div style={{ padding:'12px 18px', borderRadius: 12,
              border:`1px solid ${T.amber}55`,
              background:`linear-gradient(135deg, ${T.amberSoft}, transparent)` }}>
              <PvMono c={T.amber} size={8.5}>★ PRO — 30 генераций + аудио</PvMono>
              <div style={{ fontFamily: PV_FONT.display, fontStyle:'italic', fontSize: 14, color: T.ink, marginTop: 4 }}>
                от 990 ₽/мес →
              </div>
            </div>
          </div>
        </div>

        {/* stats row */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
          {[['дочитывания','33 215','+18% за нед.'],['сохранения','5 115','самая честная метрика'],['подписчики','1 892','+41'],['слов написано','64 280','цель: 1 500/день']].map(([l, v, s]) => (
            <div key={l} style={{ padding:'14px 16px', borderRadius: 12, border:`1px solid ${T.border}`,
              background: T.surface }}>
              <PvMono c={T.inkDim} size={8.5}>{l}</PvMono>
              <div style={{ fontFamily: PV_FONT.display, fontSize: 26, color: T.ink, margin:'4px 0 2px' }}>{v}</div>
              <div style={{ fontFamily: PV_FONT.body, fontStyle:'italic', fontSize: 10.5, color: T.inkFaint }}>{s}</div>
            </div>
          ))}
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
              <div style={{ flex:1, height:1, background: T.border }}/>
            </div>
            {stories.map((s, i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap: 14,
                padding:'12px 14px', marginBottom: 8, borderRadius: 12,
                border:`1px solid ${T.border}`, background: T.surface }}>
                <div className={s.grad} style={{ width: 44, height: 60, borderRadius: 6,
                  border:`1px solid ${T.borderStrong}`, position:'relative', flex:'0 0 44px' }}>
                  <div className="mix-grain"/>
                </div>
                <div style={{ flex:1, minWidth: 0 }}>
                  <div style={{ fontFamily: PV_FONT.display, fontStyle:'italic', fontSize: 16, color: T.ink }}>{s.t}</div>
                  <PvMono c={T.inkFaint} size={8.5}>{s.state}</PvMono>
                </div>
                <div style={{ textAlign:'right' }}>
                  <PvMono c={T.inkDim} size={9}>◉ {s.reads}</PvMono>
                </div>
                <div style={{ textAlign:'right' }}>
                  <PvMono c={T.rose} size={9}>♡ {s.saves}</PvMono>
                </div>
                <span style={{ padding:'7px 14px', borderRadius: 999,
                  border:`1px solid ${T.amber}66`, color: T.amber,
                  fontFamily: PV_FONT.display, fontStyle:'italic', fontSize: 12 }}>
                  {s.pub && i === 0 ? 'писать →' : i === 2 ? 'начать →' : 'открыть'}
                </span>
              </div>
            ))}
          </div>

          {/* badges + tops */}
          <div>
            <div style={{ fontFamily: PV_FONT.display, fontStyle:'italic', fontSize: 18, marginBottom: 12 }}>
              ★ награды
            </div>
            <div style={{ padding: 16, borderRadius: 12, border:`1px solid ${T.amber}44`,
              background:`linear-gradient(150deg, ${T.amberSoft}, transparent 70%)`, marginBottom: 12 }}>
              <div style={{ display:'flex', alignItems:'center', gap: 10 }}>
                <div className="mix-burst" style={{ width: 44, height: 44, background: T.amber,
                  color: T.bg, display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize: 20, transform:'rotate(-8deg)', flex:'0 0 44px' }}>★</div>
                <div>
                  <div style={{ fontFamily: PV_FONT.display, fontStyle:'italic', fontSize: 14, color: T.ink }}>
                    топ-3 недели · dramione
                  </div>
                  <PvMono c={T.amber} size={8.5}>+10 генераций · бейдж в профиль</PvMono>
                </div>
              </div>
            </div>
            <div style={{ display:'flex', gap: 8, marginBottom: 16 }}>
              {['🕯 слоубёрнер','✉ эпистолярщик','☾ найт-райтер'].map(b => (
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
                <div style={{ width:'68%', height:'100%', background:`linear-gradient(90deg, ${T.amber}, ${T.rose})` }}/>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── 5. ONBOARDING (mobile) — 3-way fork ───────────────────────
function PvOnboardingMobile() {
  const T = pvT(false);
  const paths = [
    { ic:'✎', t:'пишу сама', d:'редактор + ИИ-соавтор: правки, идеи, библия персонажей', tag:'для авторов', hot: true },
    { ic:'✦', t:'сгенерируй мне', d:'фандом → пейринг → тропы — готовая глава за минуту', tag:'быстрый результат' },
    { ic:'☾', t:'просто читать', d:'лента историй по твоим фандомам, аудио на ночь', tag:'для читателей' },
  ];
  return (
    <div className="mix" style={{ width:'100%', height:'100%', background: T.bg,
      position:'relative', overflow:'hidden', display:'flex', flexDirection:'column' }}>
      <div style={{ position:'absolute', left:-60, top:80, width: 260, height: 260,
        background:`radial-gradient(circle, ${T.glow}, transparent 65%)`, pointerEvents:'none' }}/>
      <div style={{ display:'flex', justifyContent:'space-between', padding:'10px 18px 4px',
        fontFamily: PV_FONT.mono, fontSize: 11, color: T.ink, opacity:.8 }}>
        <span>1:42</span><span>•••○ 5G 92%</span>
      </div>

      <div style={{ padding:'26px 24px 18px' }}>
        <div style={{ display:'flex', alignItems:'baseline', gap: 3 }}>
          <span style={{ fontFamily: PV_FONT.display, fontStyle:'italic', fontSize: 24, color: T.ink }}>head</span>
          <span className="mix-chrome" style={{ fontFamily: PV_FONT.display, fontSize: 24, fontWeight: 600 }}>canon</span>
        </div>
        <div style={{ fontFamily: PV_FONT.display, fontSize: 34, lineHeight: 1.0, fontWeight: 500,
          marginTop: 22, textWrap:'balance', color: T.ink }}>
          Как тебе <em style={{ color: T.amber }}>удобнее</em> сегодня?
        </div>
        <div style={{ fontFamily: PV_FONT.body, fontStyle:'italic', fontSize: 13, color: T.inkDim,
          marginTop: 10, lineHeight: 1.5 }}>
          можно менять в любой момент — это просто старт
        </div>
      </div>

      <div style={{ flex:1, padding:'0 20px', display:'flex', flexDirection:'column', gap: 12 }}>
        {paths.map((p) => (
          <div key={p.t} style={{ position:'relative', padding:'16px 18px', borderRadius: 14,
            border:`1px solid ${p.hot ? T.amber + '88' : T.border}`,
            background: p.hot ? `linear-gradient(150deg, ${T.amberSoft}, transparent 70%)` : T.surface,
            boxShadow: p.hot ? `0 8px 30px ${T.amber}22` : 'none' }}>
            {p.hot && (
              <div className="mix-burst" style={{ position:'absolute', top: -10, right: 10,
                width: 40, height: 40, background: T.amber, color: T.bg,
                display:'flex', alignItems:'center', justifyContent:'center',
                fontSize: 17, transform:'rotate(8deg)' }}>★</div>
            )}
            <div style={{ display:'flex', alignItems:'center', gap: 14 }}>
              <div style={{ width: 46, height: 46, borderRadius: 12, flex:'0 0 46px',
                border:`1px solid ${p.hot ? T.amber + '66' : T.borderStrong}`,
                display:'flex', alignItems:'center', justifyContent:'center',
                fontSize: 20, color: p.hot ? T.amber : T.inkDim }}>{p.ic}</div>
              <div style={{ flex:1 }}>
                <div style={{ display:'flex', alignItems:'baseline', gap: 8 }}>
                  <span style={{ fontFamily: PV_FONT.display, fontStyle:'italic', fontSize: 19,
                    color: T.ink, fontWeight: 500 }}>{p.t}</span>
                </div>
                <div style={{ fontFamily: PV_FONT.body, fontSize: 11.5, color: T.inkDim,
                  marginTop: 3, lineHeight: 1.45, textWrap:'pretty' }}>{p.d}</div>
                <PvMono c={p.hot ? T.amber : T.inkFaint} size={8} style={{ marginTop: 6, display:'inline-block' }}>{p.tag}</PvMono>
              </div>
              <span style={{ color: p.hot ? T.amber : T.inkFaint, fontSize: 16 }}>→</span>
            </div>
          </div>
        ))}
      </div>

      <div style={{ padding:'16px 24px 26px', textAlign:'center' }}>
        <span style={{ fontFamily: PV_FONT.body, fontStyle:'italic', fontSize: 12, color: T.inkFaint }}>
          ★ полночное чтиво для тех, кто не спит ★
        </span>
      </div>
    </div>
  );
}

// ── 6. NEW HOME (mobile) — two blocks ─────────────────────────
function PvHomeMobile() {
  const T = pvT(false);
  return (
    <div className="mix" style={{ width:'100%', height:'100%', background: T.bg,
      position:'relative', overflow:'hidden' }}>
      <div style={{ position:'absolute', right:-70, top:120, width: 260, height: 260,
        background:`radial-gradient(circle, ${T.glow}, transparent 65%)`, pointerEvents:'none' }}/>

      <div style={{ display:'flex', justifyContent:'space-between', padding:'10px 18px 4px',
        fontFamily: PV_FONT.mono, fontSize: 11, color: T.ink, opacity:.8 }}>
        <span>1:42</span><span>•••○ 5G 92%</span>
      </div>

      {/* header */}
      <div style={{ padding:'10px 18px 4px', display:'flex', justifyContent:'space-between', alignItems:'flex-end' }}>
        <div style={{ display:'flex', alignItems:'baseline', gap: 3 }}>
          <span style={{ fontFamily: PV_FONT.display, fontStyle:'italic', fontSize: 26, color: T.ink }}>head</span>
          <span className="mix-chrome" style={{ fontFamily: PV_FONT.display, fontSize: 26, fontWeight: 600 }}>canon</span>
        </div>
        <div style={{ display:'flex', gap: 12, color: T.inkDim, fontSize: 15 }}>
          <span>⌕</span><span style={{ color: T.amber }}>♡</span>
        </div>
      </div>
      <div style={{ padding:'2px 18px 14px', fontFamily: PV_FONT.body, fontStyle:'italic',
        fontSize: 12.5, color: T.inkDim }}>
        ★ полночное чтиво для тех, кто не спит ★
      </div>

      {/* TWO BLOCKS */}
      <div style={{ padding:'0 18px', display:'flex', flexDirection:'column', gap: 12 }}>
        {/* writer block */}
        <div style={{ position:'relative', borderRadius: 16, overflow:'hidden',
          border:`1px solid ${T.amber}55`, background:`linear-gradient(140deg, ${T.amberSoft}, transparent 60%)`,
          padding:'16px 18px', boxShadow:`0 10px 36px ${T.amber}1A` }}>
          <div className="mix-burst" style={{ position:'absolute', top: -12, right: 12,
            width: 44, height: 44, background: T.amber, color: T.bg,
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize: 19, transform:'rotate(8deg)' }}>★</div>
          <PvMono c={T.amber} size={8.5}>writer mode · с ИИ-соавтором</PvMono>
          <div style={{ fontFamily: PV_FONT.display, fontSize: 26, fontWeight: 500, lineHeight: 1.0,
            margin:'8px 0 6px', color: T.ink }}>
            Пишу <em style={{ color: T.amber }}>сама</em>.
          </div>
          <div style={{ fontFamily: PV_FONT.body, fontSize: 12, color: T.inkDim, lineHeight: 1.5, textWrap:'pretty' }}>
            Редактор с соавтором: подскажет ход, заметит противоречие, соберёт библию персонажей.
          </div>
          <div style={{ display:'flex', alignItems:'center', gap: 10, marginTop: 12 }}>
            <span style={{ padding:'7px 14px', borderRadius: 999, background: T.amber, color: T.bg,
              fontFamily: PV_FONT.display, fontStyle:'italic', fontSize: 12.5, fontWeight: 500 }}>
              продолжить гл. 7 →
            </span>
            <PvMono c={T.inkFaint} size={8.5}>1 124 / 1 500 слов</PvMono>
          </div>
        </div>

        {/* generator block */}
        <div style={{ position:'relative', borderRadius: 16, border:`1px solid ${T.border}`,
          background: T.surface, padding:'16px 18px' }}>
          <PvMono c={T.inkDim} size={8.5}>generator · быстрый результат</PvMono>
          <div style={{ fontFamily: PV_FONT.display, fontSize: 22, fontWeight: 500, lineHeight: 1.0,
            margin:'8px 0 6px', color: T.ink }}>
            Сгенерируй <em style={{ color: T.rose }}>мне</em>.
          </div>
          <div style={{ fontFamily: PV_FONT.body, fontSize: 12, color: T.inkDim, lineHeight: 1.5, textWrap:'pretty' }}>
            Фандом → пейринг → тропы. Готовая глава по твоей задумке за минуту.
          </div>
          <div style={{ display:'flex', alignItems:'center', gap: 10, marginTop: 12 }}>
            <span style={{ padding:'6px 13px', borderRadius: 999, border:`1px solid ${T.rose}77`,
              color: T.rose, fontFamily: PV_FONT.display, fontStyle:'italic', fontSize: 12.5 }}>
              начать с пейринга →
            </span>
            <PvMono c={T.inkFaint} size={8.5}>2 / 5 генераций</PvMono>
          </div>
        </div>
      </div>

      {/* feed teaser */}
      <div style={{ padding:'18px 18px 0' }}>
        <div style={{ display:'flex', alignItems:'center', gap: 10, marginBottom: 12 }}>
          <div style={{ flex:1, height:1, background: T.border }}/>
          <span style={{ fontFamily: PV_FONT.display, fontStyle:'italic', fontSize: 13, color: T.amber }}>
            ✦ сейчас читают
          </span>
          <div style={{ flex:1, height:1, background: T.border }}/>
        </div>
        <div style={{ display:'flex', gap: 10 }}>
          {[['mix-poster-grad-1','Зимний свет…','♡ 24.8k'],['mix-poster-grad-4','Шесть глаз…','♡ 54.1k'],['mix-poster-grad-5','Виноград и…','♡ 32.6k']].map(([g, t2, l]) => (
            <div key={t2} style={{ flex:1 }}>
              <div className={g} style={{ aspectRatio:'2/3', borderRadius: 8,
                border:`1px solid ${T.borderStrong}`, position:'relative', overflow:'hidden' }}>
                <div className="mix-grain"/>
                <div className="mix-vignette"/>
              </div>
              <div style={{ fontFamily: PV_FONT.display, fontStyle:'italic', fontSize: 11.5,
                color: T.ink, marginTop: 6, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{t2}</div>
              <PvMono c={T.inkFaint} size={8}>{l}</PvMono>
            </div>
          ))}
        </div>
      </div>

      {/* tab bar */}
      <div style={{ position:'absolute', bottom: 0, left:0, right:0, padding:'10px 14px 16px',
        background:`linear-gradient(180deg, transparent, ${T.bg} 45%)`,
        borderTop:`1px solid ${T.border}`, backdropFilter:'blur(12px)',
        display:'flex', justifyContent:'space-around', alignItems:'flex-end' }}>
        {[['☆','лента', T.amber],['✎','пишу'],['✦','генерируй'],['◯','я']].map(([icon, t2, c]) => (
          <div key={t2} style={{ textAlign:'center', color: c || T.inkDim }}>
            <div style={{ fontSize: 16, lineHeight: 1 }}>{icon}</div>
            <div style={{ marginTop: 3, fontFamily: PV_FONT.display, fontStyle:'italic', fontSize: 12.5 }}>{t2}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

window.PvBibleDesktop = PvBibleDesktop;
window.PvDashboardDesktop = PvDashboardDesktop;
window.PvOnboardingMobile = PvOnboardingMobile;
window.PvHomeMobile = PvHomeMobile;
