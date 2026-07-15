// Pivot v3.1 — Путь пользователя: лендинг → первый вход после реги → главная.
// Лендинг и главная — «край, выразительный»: свет свечи, Bodoni-крупно, обложки.
// Использует pvT, PV_FONT, PvMono (screens-pivot.jsx).

const PV_LAND_POSTERS = [
  { t:'Шесть глаз не лгут', by:'@kasumi_dr', grad:'mix-poster-grad-4', l:'♡ 54.1k' },
  { t:'Зимний свет в подземельях', by:'@lunaxhalf', grad:'mix-poster-grad-1', l:'♡ 24.8k' },
  { t:'Полночь у Боргина', by:'@hex.tape', grad:'mix-poster-grad-5', l:'♡ 18.2k' },
];

function PvLandPoster({ T, p, w, tilt = 0, z = 1 }) {
  return (
    <div style={{ width: w, transform:`rotate(${tilt}deg)`, zIndex: z, position:'relative' }}>
      <div className={p.grad} style={{ aspectRatio:'2/3', borderRadius: 10, position:'relative',
        overflow:'hidden', border:`1px solid ${T.borderStrong}`,
        boxShadow:'0 24px 60px rgba(0,0,0,.55)' }}>
        <div className="mix-grain"></div>
        <div className="mix-vignette"></div>
        <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column',
          justifyContent:'flex-end', padding: 14,
          background:'linear-gradient(180deg, transparent 45%, rgba(0,0,0,.62))' }}>
          <div style={{ fontFamily: PV_FONT.display, fontSize: 16, lineHeight: 1.05, fontStyle:'italic',
            color:'#F5EFE0', textWrap:'balance' }}>{p.t}</div>
          <div style={{ display:'flex', justifyContent:'space-between', marginTop: 5 }}>
            <PvMono c="rgba(245,239,224,.7)" size={7.5}>{p.by}</PvMono>
            <PvMono c="rgba(245,239,224,.7)" size={7.5}>{p.l}</PvMono>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── 1. ЛЕНДИНГ (desktop) — не залогинен ───────────────────────
function PvLandingDesktop() {
  const T = pvT(false);
  const props3 = [
    { ic:'✎', t:'тихий редактор', d:'фокус-режим, печатная машинка, автосейв. К тексту — как к литературе.' },
    { ic:'✦', t:'соавтор-чат', d:'читал все твои главы: заметит противоречие, подскажет ход. Пишешь — ты.' },
    { ic:'❋', t:'граф связей', d:'персонажи и их отношения — живой картой, как в заметках безумца.' },
  ];
  return (
    <div className="mix" style={{ width:'100%', height:'100%', background: T.bg,
      position:'relative', overflow:'hidden', display:'flex', flexDirection:'column' }}>
      <div style={{ position:'absolute', left:'22%', top:-160, width: 520, height: 520,
        background:`radial-gradient(circle, ${T.glow}, transparent 62%)`, pointerEvents:'none' }}></div>
      <div style={{ position:'absolute', right:-120, bottom:-160, width: 420, height: 420,
        background:`radial-gradient(circle, ${T.rose}22, transparent 62%)`, pointerEvents:'none' }}></div>

      {/* nav */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
        padding:'16px 32px', position:'relative', zIndex: 5 }}>
        <div style={{ display:'flex', alignItems:'baseline', gap: 3 }}>
          <span style={{ fontFamily: PV_FONT.display, fontStyle:'italic', fontSize: 23, color: T.ink }}>head</span>
          <span className="mix-chrome" style={{ fontFamily: PV_FONT.display, fontSize: 23, fontWeight: 600 }}>canon</span>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap: 18 }}>
          <span style={{ fontFamily: PV_FONT.ui, fontSize: 13, color: T.inkDim }}>читать</span>
          <span style={{ fontFamily: PV_FONT.ui, fontSize: 13, color: T.inkDim }}>войти</span>
          <span style={{ padding:'5px 14px', borderRadius: 999, background: T.amber, color: T.bg,
            fontFamily: PV_FONT.display, fontStyle:'italic', fontSize: 12.5, fontWeight: 500 }}>
            начать писать →
          </span>
        </div>
      </div>

      {/* hero */}
      <div style={{ flex:1, display:'grid', gridTemplateColumns:'1.15fr 1fr', gap: 20,
        padding:'10px 32px 0 44px', position:'relative', zIndex: 3, minHeight: 0 }}>
        <div style={{ display:'flex', flexDirection:'column', justifyContent:'center', paddingBottom: 30 }}>
          <PvMono c={T.amber} size={9}>фанфики · соавтор-ии · для тех, кто не спит</PvMono>
          <div style={{ fontFamily: PV_FONT.display, fontSize: 58, lineHeight: 0.98, fontWeight: 500,
            color: T.ink, margin:'16px 0 0', textWrap:'balance' }}>
            Полночное чтиво, которое <em style={{ color: T.amber }}>пишешь ты</em>.
          </div>
          <div style={{ fontFamily: PV_FONT.body, fontStyle:'italic', fontSize: 16.5, color: T.inkDim,
            margin:'18px 0 0', lineHeight: 1.55, maxWidth: 470, textWrap:'pretty' }}>
            Редактор со соавтором, который помнит все твои главы. Библия персонажей,
            граф связей — и лента историй по твоим фандомам.
          </div>
          <div style={{ display:'flex', alignItems:'center', gap: 14, marginTop: 26 }}>
            <span style={{ padding:'9px 20px', borderRadius: 999, background: T.amber, color: T.bg,
              fontFamily: PV_FONT.display, fontStyle:'italic', fontSize: 14.5, fontWeight: 500 }}>начать писать — бесплатно</span>
            <span style={{ padding:'8px 17px', borderRadius: 999, border:`1px solid ${T.border}`,
              color: T.inkDim, fontFamily: PV_FONT.display, fontStyle:'italic', fontSize: 13.5 }}>
              ☾ просто читать
            </span>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap: 8, marginTop: 20 }}>
            <span style={{ color: T.amber, fontSize: 11 }}>✦</span>
            <span style={{ fontFamily: PV_FONT.body, fontStyle:'italic', fontSize: 12, color: T.inkFaint }}>
              каждая история честно помечена: «человек · AI-ассистировано»
            </span>
          </div>
        </div>

        {/* posters fan */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap: -30,
          position:'relative', paddingBottom: 20 }}>
          <div style={{ position:'absolute', left:'50%', top:'46%', width: 340, height: 340,
            transform:'translate(-50%,-50%)',
            background:`radial-gradient(circle, ${T.glow}, transparent 62%)`, pointerEvents:'none' }}></div>
          <div style={{ display:'flex', alignItems:'center' }}>
            <div style={{ marginRight: -34 }}><PvLandPoster T={T} p={PV_LAND_POSTERS[0]} w={168} tilt={-7}/></div>
            <PvLandPoster T={T} p={PV_LAND_POSTERS[1]} w={196} tilt={0} z={3}/>
            <div style={{ marginLeft: -34 }}><PvLandPoster T={T} p={PV_LAND_POSTERS[2]} w={168} tilt={7}/></div>
          </div>
        </div>
      </div>

      {/* 3 props */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap: 16,
        padding:'0 32px 24px', position:'relative', zIndex: 3 }}>
        {props3.map(p => (
          <div key={p.t} style={{ display:'flex', gap: 12, padding:'14px 16px', borderRadius: 12,
            border:`1px solid ${T.border}`, background:'rgba(0,0,0,.18)' }}>
            <span style={{ color: T.amber, fontSize: 16, lineHeight: 1.2 }} aria-hidden="true">{p.ic}</span>
            <div>
              <div style={{ fontFamily: PV_FONT.display, fontStyle:'italic', fontSize: 15.5, color: T.ink }}>{p.t}</div>
              <div style={{ fontFamily: PV_FONT.body, fontSize: 11.5, color: T.inkFaint,
                marginTop: 3, lineHeight: 1.45, textWrap:'pretty' }}>{p.d}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── 2. ЛЕНДИНГ (mobile) ───────────────────────────────────────
function PvLandingMobile() {
  const T = pvT(false);
  return (
    <div className="mix" style={{ width:'100%', height:'100%', background: T.bg,
      position:'relative', overflow:'hidden', display:'flex', flexDirection:'column' }}>
      <div style={{ position:'absolute', left:'50%', top: 60, width: 340, height: 340, transform:'translateX(-50%)',
        background:`radial-gradient(circle, ${T.glow}, transparent 62%)`, pointerEvents:'none' }}></div>
      <div style={{ display:'flex', justifyContent:'space-between', padding:'10px 18px 4px',
        fontFamily: PV_FONT.mono, fontSize: 11, color: T.ink, opacity:.8, position:'relative', zIndex: 2 }}>
        <span>1:42</span><span>•••○ 5G 92%</span>
      </div>

      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
        padding:'8px 20px', position:'relative', zIndex: 3 }}>
        <div style={{ display:'flex', alignItems:'baseline', gap: 3 }}>
          <span style={{ fontFamily: PV_FONT.display, fontStyle:'italic', fontSize: 20, color: T.ink }}>head</span>
          <span className="mix-chrome" style={{ fontFamily: PV_FONT.display, fontSize: 20, fontWeight: 600 }}>canon</span>
        </div>
        <span style={{ fontFamily: PV_FONT.ui, fontSize: 12.5, color: T.inkDim }}>войти</span>
      </div>

      <div style={{ padding:'14px 24px 0', position:'relative', zIndex: 3 }}>
        <PvMono c={T.amber} size={8}>фанфики · соавтор-ии · 1:42 ночи</PvMono>
        <div style={{ fontFamily: PV_FONT.display, fontSize: 37, lineHeight: 1.0, fontWeight: 500,
          color: T.ink, margin:'12px 0 0', textWrap:'balance' }}>
          Полночное чтиво, которое <em style={{ color: T.amber }}>пишешь ты</em>.
        </div>
        <div style={{ fontFamily: PV_FONT.body, fontStyle:'italic', fontSize: 13.5, color: T.inkDim,
          margin:'12px 0 0', lineHeight: 1.5, textWrap:'pretty' }}>
          Редактор со соавтором, который помнит все твои главы. И лента — по твоим фандомам.
        </div>
      </div>

      {/* posters */}
      <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center',
        position:'relative', zIndex: 3, minHeight: 0, padding:'8px 0' }}>
        <div style={{ display:'flex', alignItems:'center' }}>
          <div style={{ marginRight: -26 }}><PvLandPoster T={T} p={PV_LAND_POSTERS[0]} w={110} tilt={-7}/></div>
          <PvLandPoster T={T} p={PV_LAND_POSTERS[1]} w={132} tilt={0} z={3}/>
          <div style={{ marginLeft: -26 }}><PvLandPoster T={T} p={PV_LAND_POSTERS[2]} w={110} tilt={7}/></div>
        </div>
      </div>

      <div style={{ padding:'0 24px 24px', position:'relative', zIndex: 3 }}>
        <div style={{ textAlign:'center', marginBottom: 10 }}>
          <span style={{ display:'inline-block', padding:'9px 22px', borderRadius: 999,
            background: T.amber, color: T.bg, fontFamily: PV_FONT.display, fontStyle:'italic',
            fontSize: 13.5, fontWeight: 500 }}>
            начать писать — бесплатно
          </span>
        </div>
        <div style={{ textAlign:'center' }}>
          <span style={{ fontFamily: PV_FONT.display, fontStyle:'italic', fontSize: 13, color: T.inkDim,
            borderBottom:`1px solid ${T.border}` }}>☾ просто читать</span>
        </div>
        <div style={{ textAlign:'center', marginTop: 14 }}>
          <span style={{ fontFamily: PV_FONT.body, fontStyle:'italic', fontSize: 10.5, color: T.inkFaint }}>
            ✦ каждая история помечена: «человек · AI-ассистировано»
          </span>
        </div>
      </div>
    </div>
  );
}

// ── 3. ПЕРВЫЙ ВХОД после реги (desktop) — guided start ────────
function PvFirstRunDesktop() {
  const T = pvT(false);
  const paths = [
    { ic:'✎', t:'пишу сама', d:'тихий редактор + соавтор-чат: правки, идеи, библия персонажей', tag:'для авторов', hot: true },
    { ic:'✦', t:'сгенерируй мне', d:'фандом → пейринг → тропы. Глава по твоей задумке за минуту', tag:'быстрый результат' },
    { ic:'☾', t:'просто читать', d:'лента по твоим фандомам, аудио-режим на ночь', tag:'для читателей' },
  ];
  const fandoms = ['dramione','jujutsu kaisen','благие знамения','наруто','ведьмак','marauders','свой…'];
  return (
    <div className="mix" style={{ width:'100%', height:'100%', background: T.bg,
      position:'relative', overflow:'hidden', display:'flex', flexDirection:'column' }}>
      <div style={{ position:'absolute', left:'50%', top:'30%', width: 560, height: 560,
        transform:'translate(-50%,-50%)', background:`radial-gradient(circle, ${T.glow}, transparent 62%)`,
        pointerEvents:'none' }}></div>

      <div style={{ display:'flex', justifyContent:'center', padding:'20px 0 0', position:'relative', zIndex: 3 }}>
        <div style={{ display:'flex', alignItems:'baseline', gap: 3 }}>
          <span style={{ fontFamily: PV_FONT.display, fontStyle:'italic', fontSize: 21, color: T.ink }}>head</span>
          <span className="mix-chrome" style={{ fontFamily: PV_FONT.display, fontSize: 21, fontWeight: 600 }}>canon</span>
        </div>
      </div>

      <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center',
        justifyContent:'center', position:'relative', zIndex: 3, padding:'0 60px' }}>
        <PvMono c={T.inkFaint} size={8.5}>шаг 1 из 2 · можно поменять в любой момент</PvMono>
        <div style={{ fontFamily: PV_FONT.display, fontSize: 42, fontWeight: 500, lineHeight: 1.02,
          color: T.ink, margin:'14px 0 0', textAlign:'center', textWrap:'balance' }}>
          С возвращением из реальности, <em style={{ color: T.amber }}>@lunaxhalf</em>.
        </div>
        <div style={{ fontFamily: PV_FONT.body, fontStyle:'italic', fontSize: 15, color: T.inkDim,
          margin:'12px 0 26px' }}>Как тебе удобнее этой ночью?</div>

        {/* 3 пути */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 264px)', gap: 16, marginBottom: 26 }}>
          {paths.map(p => (
            <div key={p.t} style={{ position:'relative', padding:'18px 18px 16px', borderRadius: 14,
              border:`1px solid ${p.hot ? T.amber + '88' : T.border}`,
              background: p.hot ? `linear-gradient(150deg, ${T.amberSoft}, transparent 70%)` : T.surface,
              boxShadow: p.hot ? `0 10px 34px ${T.amber}22` : 'none' }}>
              {p.hot && (
                <div className="mix-burst" style={{ position:'absolute', top: -11, right: 12,
                  width: 40, height: 40, background: T.amber, color: T.bg,
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize: 17, transform:'rotate(8deg)' }}>★</div>
              )}
              <div style={{ width: 42, height: 42, borderRadius: 11, marginBottom: 12,
                border:`1px solid ${p.hot ? T.amber + '66' : T.borderStrong}`,
                display:'flex', alignItems:'center', justifyContent:'center',
                fontSize: 18, color: p.hot ? T.amber : T.inkDim }} aria-hidden="true">{p.ic}</div>
              <div style={{ fontFamily: PV_FONT.display, fontStyle:'italic', fontSize: 19,
                color: T.ink, fontWeight: 500 }}>{p.t}</div>
              <div style={{ fontFamily: PV_FONT.body, fontSize: 11.5, color: T.inkDim,
                margin:'6px 0 10px', lineHeight: 1.45, textWrap:'pretty' }}>{p.d}</div>
              <PvMono c={p.hot ? T.amber : T.inkFaint} size={7.5}>{p.tag}</PvMono>
            </div>
          ))}
        </div>

        {/* шаг 2 — фандомы */}
        <PvMono c={T.inkDim} size={8.5} style={{ marginBottom: 12 }}>шаг 2 · твои фандомы — соберём ленту и словарь тропов</PvMono>
        <div style={{ display:'flex', flexWrap:'wrap', gap: 8, justifyContent:'center', maxWidth: 620 }}>
          {fandoms.map((f, i) => (
            <span key={f} style={{ padding:'8px 16px', borderRadius: 999,
              fontFamily: PV_FONT.display, fontStyle:'italic', fontSize: 14,
              border:`1px solid ${i === 0 ? T.amber : T.border}`,
              background: i === 0 ? T.amberSoft : 'transparent',
              color: i === 0 ? T.amber : T.inkDim }}>{f}</span>
          ))}
        </div>
      </div>

      <div style={{ display:'flex', justifyContent:'center', alignItems:'center', gap: 16,
        padding:'0 0 26px', position:'relative', zIndex: 3 }}>
        <span style={{ padding:'8px 20px', borderRadius: 999, background: T.amber, color: T.bg,
          fontFamily: PV_FONT.display, fontStyle:'italic', fontSize: 13.5, fontWeight: 500 }}>
          за стол →
        </span>
        <span style={{ fontFamily: PV_FONT.body, fontStyle:'italic', fontSize: 12, color: T.inkFaint }}>
          пропустить — осмотрюсь сама
        </span>
      </div>
    </div>
  );
}

// ── 4. ГЛАВНАЯ (desktop) — залогинена ─────────────────────────
function PvHomeDesktop() {
  const T = pvT(false);
  const feed = [
    { t:'Шесть глаз не лгут', by:'@kasumi_dr', grad:'mix-poster-grad-4', l:'♡ 54.1k', tag:'новая гл. 12' },
    { t:'Полночь у Боргина', by:'@hex.tape', grad:'mix-poster-grad-5', l:'♡ 18.2k' },
    { t:'Сад камней и писем', by:'@verlibre', grad:'mix-poster-grad-3', l:'♡ 9.4k', tag:'ты на гл. 3' },
    { t:'Виноград и пепел', by:'@lunaxhalf', grad:'mix-poster-grad-2', l:'♡ 32.6k' },
    { t:'Зимний свет в подземельях', by:'@lunaxhalf', grad:'mix-poster-grad-1', l:'♡ 24.8k', tag:'твоя' },
  ];
  return (
    <div className="mix" style={{ width:'100%', height:'100%', background: T.bg,
      position:'relative', overflow:'hidden', display:'flex', flexDirection:'column' }}>
      <div style={{ position:'absolute', left:'14%', top:-140, width: 440, height: 440,
        background:`radial-gradient(circle, ${T.glow}, transparent 65%)`, pointerEvents:'none' }}></div>

      {/* nav */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
        padding:'14px 28px', borderBottom:`1px solid ${T.border}`, position:'relative', zIndex: 5 }}>
        <div style={{ display:'flex', alignItems:'baseline', gap: 26 }}>
          <div style={{ display:'flex', alignItems:'baseline', gap: 3 }}>
            <span style={{ fontFamily: PV_FONT.display, fontStyle:'italic', fontSize: 22, color: T.ink }}>head</span>
            <span className="mix-chrome" style={{ fontFamily: PV_FONT.display, fontSize: 22, fontWeight: 600 }}>canon</span>
          </div>
          <div style={{ display:'flex', gap: 20, fontFamily: PV_FONT.ui, fontSize: 13, color: T.inkDim }}>
            <span style={{ color: T.amber, fontFamily: PV_FONT.display, fontStyle:'italic' }}>★ главная</span>
            <span>мой стол</span>
            <span>лента</span>
            <span>кабинет</span>
          </div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap: 14 }}>
          <span style={{ color: T.inkDim, fontSize: 14 }}>⌕</span>
          <div style={{ width: 34, height: 34, borderRadius:'50%',
            background:`linear-gradient(135deg, ${T.amber}, ${T.rose})`, border:`1px solid ${T.borderStrong}` }}></div>
        </div>
      </div>

      <div style={{ flex:1, padding:'22px 28px 0', position:'relative', zIndex: 3, minHeight: 0 }}>
        {/* два блока: писатель (primary) + генератор (secondary) */}
        <div style={{ display:'grid', gridTemplateColumns:'1.5fr 1fr', gap: 16, marginBottom: 22 }}>
          <div style={{ position:'relative', borderRadius: 16, overflow:'hidden', padding:'20px 24px',
            border:`1px solid ${T.amber}55`, background:`linear-gradient(140deg, ${T.amberSoft}, transparent 60%)`,
            boxShadow:`0 10px 36px ${T.amber}1A` }}>
            <div className="mix-burst" style={{ position:'absolute', top: -12, right: 14,
              width: 44, height: 44, background: T.amber, color: T.bg,
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize: 19, transform:'rotate(8deg)' }}>★</div>
            <PvMono c={T.amber} size={8.5}>writer mode · 9 ночей подряд · свеча горит</PvMono>
            <div style={{ fontFamily: PV_FONT.display, fontSize: 30, fontWeight: 500, lineHeight: 1.02,
              margin:'10px 0 6px', color: T.ink, textWrap:'balance' }}>
              Драко всё ещё <em style={{ color: T.amber }}>у окна</em>, гл. 7 ждёт.
            </div>
            <div style={{ fontFamily: PV_FONT.body, fontStyle:'italic', fontSize: 13, color: T.inkDim,
              lineHeight: 1.5 }}>312 читателей подписаны на развязку письма</div>
            <div style={{ display:'flex', alignItems:'center', gap: 12, marginTop: 16 }}>
              <span style={{ padding:'7px 16px', borderRadius: 999, background: T.amber, color: T.bg,
                fontFamily: PV_FONT.display, fontStyle:'italic', fontSize: 13, fontWeight: 500 }}>
                продолжить гл. 7 →
              </span>
              <PvMono c={T.inkFaint} size={8.5}>1 124 / 1 500 слов этой ночью</PvMono>
            </div>
          </div>

          <div style={{ borderRadius: 16, border:`1px solid ${T.border}`, background: T.surface,
            padding:'20px 22px', display:'flex', flexDirection:'column' }}>
            <PvMono c={T.inkDim} size={8.5}>generator · быстрый результат</PvMono>
            <div style={{ fontFamily: PV_FONT.display, fontSize: 23, fontWeight: 500, lineHeight: 1.02,
              margin:'10px 0 6px', color: T.ink }}>
              Сгенерируй <em style={{ color: T.rose }}>мне</em>.
            </div>
            <div style={{ fontFamily: PV_FONT.body, fontSize: 12, color: T.inkDim, lineHeight: 1.5,
              textWrap:'pretty', flex: 1 }}>
              Фандом → пейринг → тропы. Готовая глава по твоей задумке.
            </div>
            <div style={{ display:'flex', alignItems:'center', gap: 10, marginTop: 12 }}>
              <span style={{ padding:'6px 13px', borderRadius: 999, border:`1px solid ${T.rose}77`,
                color: T.rose, fontFamily: PV_FONT.display, fontStyle:'italic', fontSize: 12.5 }}>
                начать с пейринга →
              </span>
              <PvMono c={T.inkFaint} size={8}>2 / 5</PvMono>
            </div>
          </div>
        </div>

        {/* лента: сейчас читают */}
        <div style={{ display:'flex', alignItems:'center', gap: 12, marginBottom: 14 }}>
          <span style={{ fontFamily: PV_FONT.display, fontStyle:'italic', fontSize: 17, color: T.amber }}>
            ✦ этой ночью читают
          </span>
          <div style={{ flex:1, height:1, background: T.border }}></div>
          <PvMono c={T.inkFaint} size={8.5}>твои фандомы: dramione · jjk · благие знамения</PvMono>
          <PvMono c={T.amber} size={8.5}>вся лента →</PvMono>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(5, 1fr)', gap: 14 }}>
          {feed.map(p => (
            <div key={p.t} style={{ position:'relative' }}>
              {p.tag && <div style={{ position:'absolute', top: 8, left: 8, zIndex: 3,
                padding:'3px 8px', borderRadius: 999, background: p.tag === 'твоя' ? T.rose : T.amber,
                color: T.bg, fontFamily: PV_FONT.mono, fontSize: 7.5, letterSpacing:'.12em',
                textTransform:'uppercase' }}>{p.tag}</div>}
              <div className={p.grad} style={{ aspectRatio:'2/3', borderRadius: 10, position:'relative',
                overflow:'hidden', border:`1px solid ${T.borderStrong}` }}>
                <div className="mix-grain"></div>
                <div className="mix-vignette"></div>
                <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column',
                  justifyContent:'flex-end', padding: 12,
                  background:'linear-gradient(180deg, transparent 48%, rgba(0,0,0,.6))' }}>
                  <div style={{ fontFamily: PV_FONT.display, fontSize: 14.5, lineHeight: 1.05,
                    fontStyle:'italic', color:'#F5EFE0', textWrap:'balance' }}>{p.t}</div>
                  <div style={{ display:'flex', justifyContent:'space-between', marginTop: 4 }}>
                    <PvMono c="rgba(245,239,224,.7)" size={7}>{p.by}</PvMono>
                    <PvMono c="rgba(245,239,224,.7)" size={7}>{p.l}</PvMono>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

window.PvLandingDesktop = PvLandingDesktop;
window.PvLandingMobile = PvLandingMobile;
window.PvFirstRunDesktop = PvFirstRunDesktop;
window.PvHomeDesktop = PvHomeDesktop;
