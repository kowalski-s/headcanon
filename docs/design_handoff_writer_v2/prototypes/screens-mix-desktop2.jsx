// Mix · Editorial Y2K — desktop Story / Reader / Watch
// Relies on MIX, MixStar4, MixCandle, MixSparkle, MixPoster from screens-mix.jsx
// and MixDeskNav from screens-mix-desktop.jsx

const MIX_CHAPTERS = [
  { n:1,  t:'Совы летят на север',                m:7,  state:'read' },
  { n:2,  t:'Чай у мадам Помфри',                  m:6,  state:'read' },
  { n:3,  t:'Список запретов',                     m:8,  state:'read' },
  { n:4,  t:'Нумерология и грозы',                 m:9,  state:'read' },
  { n:5,  t:'Снег на четвёртом этаже',             m:7,  state:'read' },
  { n:6,  t:'Что не сказала Лаванда',              m:8,  state:'read' },
  { n:7,  t:'Письмо, которое нельзя было писать',  m:11, state:'reading' },
  { n:8,  t:'Зеркало, которое лгало бы',           m:10, state:'next' },
  { n:9,  t:'Тёплое стекло, холодные руки',         m:9,  state:'lock' },
  { n:10, t:'Уроки молчания',                       m:9,  state:'lock' },
];

// ─── 2. STORY (desktop) ──────────────────────────────────────
function MixStoryDesktop() {
  return (
    <div className="mix" style={{ width:'100%', height:'100%', background: MIX.bg,
      position:'relative', overflow:'hidden' }}>
      <MixCandle x={-100} y={300} size={400} opacity={.4}/>
      <MixCandle x={1000} y={600} size={380} opacity={.35}/>
      <MixDeskNav active="feed"/>

      {/* breadcrumb */}
      <div style={{ position:'relative', zIndex:3, padding:'14px 36px',
        fontFamily: MIX.mono, fontSize: 10.5, color: MIX.inkDim, letterSpacing:'.14em' }}>
        ← ЛЕНТА  /  HOGWARTS  /  DRAMIONE  /  ЭТА ИСТОРИЯ
      </div>

      {/* hero — split */}
      <div style={{ position:'relative', zIndex:3, padding:'18px 36px 24px',
        display:'grid', gridTemplateColumns:'1fr 1.05fr', gap: 56, alignItems:'flex-start' }}>
        {/* LEFT — cover */}
        <div style={{ position:'relative' }}>
          <div style={{ position:'absolute', top: -10, left: 50, width: 80, height: 22,
            transform:'rotate(-4deg)', zIndex: 4 }} className="mix-tape"/>
          <div style={{ position:'absolute', top: -10, right: 50, width: 80, height: 22,
            transform:'rotate(5deg)', zIndex: 4 }} className="mix-tape"/>
          <div className="mix-burst" style={{ position:'absolute', top: -16, right: -16,
            width: 76, height: 76, background: MIX.amber, color: MIX.bg, zIndex: 5,
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize: 36, transform:'rotate(8deg)' }}>★</div>
          <div style={{ position:'relative', borderRadius: 10, overflow:'hidden',
            aspectRatio:'4/5', border:`1px solid ${MIX.borderStrong}`,
            boxShadow:'0 30px 80px rgba(0,0,0,.65)' }}>
            <div className="mix-poster-grad-1" style={{ position:'absolute', inset:0 }}/>
            <div className="mix-grain"/>
            <div className="mix-vignette"/>
            <div style={{ position:'absolute', top:'-15%', right:'-10%', width:'70%', height:'60%',
              background:`radial-gradient(circle, ${MIX.amber}77, transparent 60%)`, mixBlendMode:'screen' }}/>
            <div style={{ position:'absolute', top: 18, left: 22, right: 22,
              display:'flex', justifyContent:'space-between',
              fontFamily: MIX.mono, fontSize: 10, letterSpacing:'.2em', color: MIX.inkDim }}>
              <span>VOL.1 · CH.07</span>
              <span style={{ color: MIX.amber }}>◆ HC—S1</span>
            </div>
            <div style={{ position:'absolute', bottom: 28, left: 22, right: 22 }}>
              <div style={{ fontFamily: MIX.mono, fontSize: 10, letterSpacing:'.2em',
                color: MIX.amber, marginBottom: 8 }}>ENEMIES-TO-LOVERS</div>
              <div style={{ fontFamily: MIX.display, fontSize: 36, lineHeight: 0.94,
                fontWeight: 500, textWrap:'balance' }}>
                Зимний свет в <em style={{ color: MIX.amber }}>подземельях</em>.
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT — meta + chapters */}
        <div>
          <div style={{ fontFamily: MIX.mono, fontSize: 11, letterSpacing:'.2em',
            color: MIX.amber, marginBottom: 14 }}>VOL.1 · DRAMIONE · 14 CH</div>
          <div style={{ fontFamily: MIX.display, fontSize: 56, lineHeight: 0.95,
            textWrap:'balance', fontWeight: 500 }}>
            Зимний свет<br/>в <em style={{ color: MIX.amber }}>подземельях</em>.
          </div>
          <div style={{ fontFamily: MIX.body, fontStyle:'italic', fontSize: 16,
            color: MIX.ink, opacity: .88, marginTop: 16, lineHeight: 1.55, maxWidth: 540 }}>
            Год седьмой, Хогвартс под комендантским часом — единственный, кто заметил её отсутствие в библиотеке, последний, кого она хотела бы видеть.
          </div>

          {/* meta row */}
          <div style={{ marginTop: 22, padding:'14px 0',
            borderTop:`1px solid ${MIX.border}`, borderBottom:`1px solid ${MIX.border}`,
            display:'flex', justifyContent:'space-between',
            fontFamily: MIX.mono, fontSize: 11, color: MIX.inkDim, letterSpacing:'.06em' }}>
            <div><span style={{ opacity:.6 }}>by </span><span style={{ color: MIX.amber }}>@lunaxhalf</span></div>
            <div>14 / ∞ глав · 9 мин/гл</div>
            <div style={{ color: MIX.rose }}>♡ 24,827</div>
            <div>★★★★★ 4.92</div>
          </div>

          {/* CTA pair */}
          <div style={{ marginTop: 24, display:'flex', gap: 14 }}>
            <div style={{ flex:1, padding:'16px 26px', borderRadius: 999,
              background: MIX.amber, color: MIX.bg, textAlign:'center',
              fontFamily: MIX.display, fontStyle:'italic', fontSize: 17, fontWeight: 600 }}>
              ★ продолжить главу 7
            </div>
            <div style={{ padding:'16px 22px', borderRadius: 999,
              background: `linear-gradient(110deg, ${MIX.chrome1}, ${MIX.chrome2} 50%, ${MIX.chrome3})`,
              color: MIX.bg,
              fontFamily: MIX.display, fontStyle:'italic', fontSize: 15, fontWeight: 700,
              boxShadow:`0 6px 20px ${MIX.chrome2}55` }}>
              ▸ watch · 4 эп
            </div>
          </div>
        </div>
      </div>

      {/* chapters list — two cols */}
      <div style={{ position:'relative', zIndex:3, padding:'24px 36px 36px' }}>
        <div style={{ display:'flex', alignItems:'baseline', gap: 14, marginBottom: 16 }}>
          <div style={{ fontFamily: MIX.display, fontSize: 22, fontStyle:'italic' }}>✦ главы</div>
          <div style={{ fontFamily: MIX.mono, fontSize: 10.5, color: MIX.inkDim, letterSpacing:'.14em' }}>6 ИЗ 14 ПРОЧИТАНО</div>
          <div style={{ flex:1, height:1, background: MIX.border }}/>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'2px 56px' }}>
          {MIX_CHAPTERS.map(c => {
            const reading = c.state === 'reading';
            const read = c.state === 'read';
            const lock = c.state === 'lock';
            return (
              <div key={c.n} style={{
                display:'flex', alignItems:'center', gap: 16,
                padding:'12px 0', borderBottom:`1px solid ${MIX.border}`,
                opacity: lock ? .35 : 1 }}>
                <div style={{ width: 32, fontFamily: MIX.mono, fontSize: 12,
                  color: reading ? MIX.amber : MIX.inkFaint, letterSpacing:'.1em' }}>
                  {c.n.toString().padStart(2,'0')}
                </div>
                <div style={{ flex:1, fontFamily: MIX.display, fontSize: 16, lineHeight: 1.2,
                  color: reading ? MIX.amber : MIX.ink, fontWeight: reading ? 500 : 400,
                  fontStyle: reading ? 'italic' : 'normal',
                  textDecoration: read ? 'line-through' : 'none', textDecorationColor: MIX.inkFaint }}>
                  {c.t}
                </div>
                <div style={{ fontFamily: MIX.mono, fontSize: 10, color: MIX.inkFaint, letterSpacing:'.06em' }}>
                  {c.m}m
                </div>
                {reading && <span style={{ color: MIX.amber, fontSize: 14 }}>▸</span>}
                {read && <span style={{ color: MIX.inkFaint, fontSize: 12 }}>✓</span>}
                {lock && <span style={{ color: MIX.inkFaint, fontSize: 12 }}>◌</span>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── 3. READER (desktop, two-page magazine) ──────────────────
function MixReaderDesktop() {
  const PAR_A = 'НЕГ падал четвёртый час подряд, и в подземельях пахло влажными книгами и холодным камнем. Гермиона шла быстрее, чем обычно — не от страха, от холода. В руках было письмо, которое она не собиралась отправлять, и которое теперь было поздно не написать. Час назад она ещё могла бы порвать его. Полчаса назад — сжечь. Сейчас оставалось только донести его до окна, где, по слухам, никогда никого не было.';
  const PAR_B = 'Она вывернула из-за угла и в первую секунду не поняла, что видит. В окне — силуэт. Голова прислонена к стеклу. Один из тех немногих вечеров, когда в подземельях светятся все свечи. Он стоял без мантии, в одной рубашке, рука в кармане — похож не на себя, а на кого-то, кого она никогда здесь не ждала встретить. И, кажется, именно поэтому не отступила.';
  const PAR_C = '«Грейнджер», — сказал он, не оборачиваясь. «Если ты пришла ругаться, я очень устал». Гермиона остановилась посреди коридора. Письмо в руке вдруг стало очень тяжёлым.';
  return (
    <div className="mix" style={{ width:'100%', height:'100%', background: MIX.bg,
      position:'relative', overflow:'hidden' }}>
      <MixCandle x={-80} y={200} size={360} opacity={.4}/>
      <MixCandle x={1000} y={500} size={360} opacity={.35}/>

      {/* slim reader bar */}
      <div style={{ position:'relative', zIndex:5, padding:'14px 36px',
        display:'flex', alignItems:'center', justifyContent:'space-between',
        borderBottom:`1px solid ${MIX.border}`, backdropFilter:'blur(10px)' }}>
        <div style={{ display:'flex', alignItems:'center', gap: 18 }}>
          <span style={{ color: MIX.inkDim, fontSize: 18 }}>←</span>
          <div>
            <div style={{ fontFamily: MIX.mono, fontSize: 10, letterSpacing:'.18em', color: MIX.inkDim }}>VOL.1 · CH.07</div>
            <div style={{ fontFamily: MIX.display, fontStyle:'italic', fontSize: 14, color: MIX.amber, marginTop: 1 }}>
              зимний свет в подземельях
            </div>
          </div>
        </div>
        <div style={{ flex:1, padding:'0 32px', maxWidth: 460 }}>
          <div style={{ height: 2, background: MIX.border, borderRadius: 1, overflow:'hidden' }}>
            <div style={{ width:'34%', height:'100%', background: MIX.amber }}/>
          </div>
          <div style={{ display:'flex', justifyContent:'space-between', marginTop: 4,
            fontFamily: MIX.mono, fontSize: 9, color: MIX.inkDim, letterSpacing:'.1em' }}>
            <span>стр 3 / 9</span><span>~5 мин до конца</span>
          </div>
        </div>
        <div style={{ display:'flex', gap: 18, fontFamily: MIX.ui, fontSize: 13, color: MIX.inkDim }}>
          <span>Aa</span><span>♡</span><span>⌘+S</span><span>⚙</span>
        </div>
      </div>

      {/* magazine spread */}
      <div style={{ position:'relative', zIndex:3, padding:'48px 60px 24px',
        display:'grid', gridTemplateColumns:'1fr 1px 1fr', gap: 44, alignItems:'flex-start' }}>
        {/* LEFT page — title + body */}
        <div>
          <div style={{ fontFamily: MIX.display, fontStyle:'italic', fontSize: 14,
            color: MIX.amber, letterSpacing:'.04em' }}>глава седьмая</div>
          <div style={{ fontFamily: MIX.display, fontSize: 36, lineHeight: 1.0,
            marginTop: 8, fontWeight: 500, textWrap:'balance' }}>
            Письмо, которое <em style={{ color: MIX.amber }}>нельзя</em> было писать.
          </div>
          <div style={{ display:'flex', alignItems:'center', gap: 12, margin:'18px 0' }}>
            <div style={{ flex:1, height: 1, background: MIX.borderStrong }}/>
            <span style={{ color: MIX.amber, fontSize: 13 }}>✦</span>
            <div style={{ flex:1, height: 1, background: MIX.borderStrong }}/>
          </div>
          <p style={{ fontFamily: MIX.body, fontSize: 17, lineHeight: 1.65,
            color: MIX.ink, margin: 0, textAlign:'justify', textWrap:'pretty', hyphens:'auto' }}>
            <span style={{ fontFamily: MIX.display, fontStyle:'italic', fontWeight: 500,
              float:'left', fontSize: 84, lineHeight: 0.85, marginRight: 10, marginTop: 6,
              color: MIX.amber }}>С</span>
            {PAR_A.slice(1)}
          </p>
          <p style={{ fontFamily: MIX.body, fontSize: 17, lineHeight: 1.65,
            color: MIX.ink, marginTop: 18, textAlign:'justify', textWrap:'pretty', hyphens:'auto' }}>
            {PAR_B}
          </p>
        </div>

        {/* gutter */}
        <div style={{ width: 1, background: `linear-gradient(180deg, transparent, ${MIX.borderStrong}, transparent)`, alignSelf:'stretch' }}/>

        {/* RIGHT page — body continuation */}
        <div>
          <div style={{ fontFamily: MIX.mono, fontSize: 9.5, letterSpacing:'.2em',
            color: MIX.inkDim, textAlign:'right', marginBottom: 28 }}>HEADCANON · ★ · CH.07</div>
          <p style={{ fontFamily: MIX.body, fontSize: 17, lineHeight: 1.65,
            color: MIX.ink, margin: 0, textAlign:'justify', textWrap:'pretty', hyphens:'auto' }}>
            {PAR_C}
          </p>

          <div style={{ display:'flex', alignItems:'center', gap: 12, margin:'24px 0' }}>
            <div style={{ flex:1, height: 1, background: MIX.border }}/>
            <span style={{ fontFamily: MIX.display, fontStyle:'italic', fontSize: 14, color: MIX.amber }}>✦</span>
            <div style={{ flex:1, height: 1, background: MIX.border }}/>
          </div>

          <div style={{ fontFamily: MIX.body, fontStyle:'italic', fontSize: 14,
            color: MIX.inkDim, lineHeight: 1.6, textWrap:'pretty' }}>
            Минуту они смотрели друг на друга, и Гермиона впервые подумала, что молчание — это тоже разговор. Просто на языке, который она ещё не выучила.
          </div>

          {/* footer of chapter — chapter nav + watch */}
          <div style={{ marginTop: 36, padding: 16, borderRadius: 12,
            background: MIX.surface, border:`1px solid ${MIX.border}`,
            display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <div>
              <div style={{ fontFamily: MIX.mono, fontSize: 9.5, letterSpacing:'.18em', color: MIX.inkDim }}>NEXT</div>
              <div style={{ fontFamily: MIX.display, fontStyle:'italic', fontSize: 16, color: MIX.ink, marginTop: 4 }}>
                гл. 8 · зеркало, которое лгало бы.
              </div>
            </div>
            <div style={{ display:'flex', gap: 10 }}>
              <div style={{ padding:'10px 18px', borderRadius: 999,
                background: `linear-gradient(110deg, ${MIX.chrome1}, ${MIX.chrome2} 50%, ${MIX.chrome3})`,
                color: MIX.bg, fontFamily: MIX.display, fontStyle:'italic', fontSize: 13, fontWeight: 700 }}>
                ▸ watch
              </div>
              <div style={{ padding:'10px 18px', borderRadius: 999, background: MIX.amber, color: MIX.bg,
                fontFamily: MIX.display, fontStyle:'italic', fontSize: 13, fontWeight: 600 }}>
                читать гл. 8 →
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* page footer */}
      <div style={{ position:'absolute', bottom: 14, left: 0, right: 0,
        display:'flex', justifyContent:'space-between', padding:'0 60px',
        fontFamily: MIX.mono, fontSize: 10, color: MIX.inkFaint, letterSpacing:'.14em' }}>
        <span>3</span><span>★</span><span>4</span>
      </div>
    </div>
  );
}

// ─── 4. WATCH MODE (desktop, theatre) ─────────────────────────
function MixWatchDesktop() {
  return (
    <div className="mix" style={{ width:'100%', height:'100%', background:'#06030C',
      position:'relative', overflow:'hidden' }}>
      {/* top bar */}
      <div style={{ position:'relative', zIndex:5, padding:'14px 28px',
        display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ display:'flex', alignItems:'center', gap: 14 }}>
          <span style={{ color: MIX.inkDim, fontSize: 22 }}>×</span>
          <div>
            <div style={{ fontFamily: MIX.mono, fontSize: 10, letterSpacing:'.2em', color: MIX.inkDim }}>WATCH MODE · EP 02 / 04</div>
            <div style={{ fontFamily: MIX.display, fontStyle:'italic', fontSize: 14, color: MIX.amber, marginTop: 1 }}>
              зимний свет в подземельях
            </div>
          </div>
        </div>
        <div style={{ display:'flex', gap: 22, fontFamily: MIX.ui, fontSize: 12, color: MIX.inkDim }}>
          <span>CC · RU</span><span>HD</span><span>⤢</span>
        </div>
      </div>

      {/* theatre + side panel */}
      <div style={{ position:'relative', zIndex:3, padding:'8px 28px 18px',
        display:'grid', gridTemplateColumns:'1fr 320px', gap: 22, alignItems:'flex-start' }}>
        {/* video */}
        <div>
          <div style={{ position:'relative', borderRadius: 12, overflow:'hidden',
            aspectRatio:'16/9', boxShadow:'0 30px 80px rgba(0,0,0,.7), inset 0 1px 0 rgba(255,255,255,.05)',
            border:`1px solid ${MIX.borderStrong}` }}>
            <div className="mix-poster-grad-1" style={{ position:'absolute', inset:0 }}/>
            <div className="mix-grain"/>
            <div style={{ position:'absolute', left:'12%', top:'30%', width:'45%', height:'80%',
              background:`radial-gradient(circle, ${MIX.amber}88, transparent 60%)`, mixBlendMode:'screen', filter:'blur(2px)' }}/>
            <div style={{ position:'absolute', left:'25%', top:'48%', width: 5, height: 18, borderRadius: 3,
              background:`linear-gradient(180deg, ${MIX.amber}, transparent)`, boxShadow:`0 0 18px ${MIX.amber}`, transform:'translate(-50%,-50%)' }}/>
            <div className="mix-vignette"/>

            {/* timecode */}
            <div style={{ position:'absolute', top: 16, right: 18,
              fontFamily: MIX.mono, fontSize: 11, letterSpacing:'.18em', color: MIX.ink, opacity:.7 }}>
              03:42 / 04:21
            </div>
            {/* episode badge */}
            <div style={{ position:'absolute', top: 16, left: 18,
              padding:'4px 10px', borderRadius: 4,
              background:'rgba(10,5,18,.62)', backdropFilter:'blur(8px)',
              border:`1px solid ${MIX.amber}40`,
              fontFamily: MIX.mono, fontSize: 9.5, letterSpacing:'.18em', color: MIX.amber }}>
              ★ EP 02 · ДРАКО У ОКНА
            </div>
            {/* subtitle card */}
            <div style={{ position:'absolute', left:'10%', right:'10%', bottom: 32,
              padding:'14px 20px', borderRadius: 8,
              background:'rgba(10,5,18,.62)', backdropFilter:'blur(10px)',
              border:`1px solid rgba(229,169,90,.25)`, textAlign:'center' }}>
              <div style={{ fontFamily: MIX.mono, fontSize: 9.5, letterSpacing:'.2em',
                color: MIX.amber, marginBottom: 6 }}>ДРАКО</div>
              <div style={{ fontFamily: MIX.display, fontStyle:'italic', fontSize: 22, lineHeight: 1.25,
                color: MIX.ink, textWrap:'balance' }}>
                «Грейнджер, если ты пришла ругаться, я очень <em style={{ color: MIX.amber }}>устал</em>».
              </div>
            </div>
          </div>

          {/* scrubber */}
          <div style={{ marginTop: 18 }}>
            <div style={{ position:'relative', height: 5, background: MIX.border, borderRadius: 3 }}>
              <div style={{ position:'absolute', inset:'0 14% 0 0', background: MIX.amber, borderRadius: 3 }}/>
              {/* chapter markers */}
              {[0.18, 0.42, 0.65, 0.86].map((pct, i) => (
                <div key={i} style={{ position:'absolute', left:`${pct*100}%`, top:-2,
                  width: 2, height: 9, background: MIX.inkFaint, transform:'translateX(-50%)' }}/>
              ))}
              <div style={{ position:'absolute', left:'86%', top:'50%', transform:'translate(-50%,-50%)',
                width: 14, height: 14, background: MIX.amber, borderRadius:'50%',
                boxShadow:`0 0 0 4px ${MIX.amber}30, 0 0 18px ${MIX.amber}` }}/>
            </div>
            <div style={{ display:'flex', justifyContent:'space-between', marginTop: 8,
              fontFamily: MIX.mono, fontSize: 10.5, color: MIX.inkDim, letterSpacing:'.08em' }}>
              <span>03:42</span><span>−00:39</span>
            </div>
          </div>

          {/* transport */}
          <div style={{ marginTop: 14, display:'flex', alignItems:'center', justifyContent:'center', gap: 36 }}>
            <span style={{ color: MIX.inkDim, fontSize: 14 }}>« 10s</span>
            <span style={{ color: MIX.inkDim, fontSize: 18 }}>◂◂</span>
            <div style={{ width: 64, height: 64, borderRadius:'50%',
              background: MIX.amber, color: MIX.bg,
              display:'flex', alignItems:'center', justifyContent:'center', fontSize: 24,
              boxShadow:`0 6px 24px ${MIX.amber}66` }}>‖</div>
            <span style={{ color: MIX.inkDim, fontSize: 18 }}>▸▸</span>
            <span style={{ color: MIX.inkDim, fontSize: 14 }}>10s »</span>
          </div>
        </div>

        {/* RIGHT — episodes panel + read instead */}
        <div>
          <div style={{ padding: 16, borderRadius: 12,
            background: MIX.surface, border:`1px solid ${MIX.border}` }}>
            <div style={{ fontFamily: MIX.mono, fontSize: 10, letterSpacing:'.18em',
              color: MIX.inkDim, marginBottom: 14 }}>★ ЭПИЗОДЫ ГЛАВЫ 7</div>
            <div style={{ display:'flex', flexDirection:'column', gap: 10 }}>
              {[
                { n:'01', t:'Снег, четвёртый час', m:'4:08', state:'done' },
                { n:'02', t:'Драко у окна',         m:'4:21', state:'now' },
                { n:'03', t:'Запах одеколона',      m:'4:55', state:'next' },
                { n:'04', t:'Письмо',                m:'4:42', state:'next' },
              ].map(ep => {
                const now = ep.state === 'now';
                const done = ep.state === 'done';
                return (
                  <div key={ep.n} style={{
                    padding:'12px 14px', borderRadius: 8,
                    background: now ? `${MIX.amber}1A` : 'transparent',
                    border: now ? `1px solid ${MIX.amber}` : `1px solid ${MIX.border}`,
                    display:'flex', alignItems:'center', gap: 12 }}>
                    <div style={{ fontFamily: MIX.mono, fontSize: 10,
                      color: now ? MIX.amber : MIX.inkDim, letterSpacing:'.14em', minWidth: 30 }}>
                      EP {ep.n}{done && ' ✓'}{now && ' ●'}
                    </div>
                    <div style={{ flex:1, fontFamily: MIX.display, fontStyle:'italic', fontSize: 14,
                      color: now ? MIX.ink : MIX.inkDim, lineHeight: 1.2 }}>
                      {ep.t}
                    </div>
                    <div style={{ fontFamily: MIX.mono, fontSize: 10, color: MIX.inkFaint }}>{ep.m}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* read instead */}
          <div style={{ marginTop: 16, padding: 14, borderRadius: 12,
            border:`1px dashed ${MIX.borderStrong}`, textAlign:'center' }}>
            <div style={{ fontFamily: MIX.body, fontStyle:'italic', fontSize: 13,
              color: MIX.inkDim, lineHeight: 1.5 }}>
              предпочитаешь буквы?
            </div>
            <div style={{ marginTop: 8, fontFamily: MIX.display, fontStyle:'italic',
              fontSize: 14, color: MIX.amber }}>
              ★ читать главу 7 →
            </div>
          </div>

          {/* up next */}
          <div style={{ marginTop: 16, padding: 14, borderRadius: 12,
            background:`linear-gradient(135deg, ${MIX.surface}, ${MIX.bg2})`,
            border:`1px solid ${MIX.border}` }}>
            <div style={{ fontFamily: MIX.mono, fontSize: 9.5, letterSpacing:'.18em', color: MIX.inkDim }}>UP NEXT</div>
            <div style={{ fontFamily: MIX.display, fontStyle:'italic', fontSize: 16, color: MIX.ink, marginTop: 6 }}>
              гл. 8 · зеркало, которое лгало бы.
            </div>
            <div style={{ fontFamily: MIX.mono, fontSize: 10, color: MIX.inkDim, marginTop: 8, letterSpacing:'.06em' }}>
              авто-плей через 00:08 · отменить
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

window.MixStoryDesktop = MixStoryDesktop;
window.MixReaderDesktop = MixReaderDesktop;
window.MixWatchDesktop = MixWatchDesktop;
