// Pivot v3 — Редактор «тихий центр». Rework под DESIGN-writer.md:
// ragged-right при письме, минимальный chrome, свет свечи ТОЛЬКО амбер-виньеткой,
// без зерна/стикеров/дропкапа поверх текста. Живые режимы: письмо / фокус / печ.машинка.
// Использует pvT, PV_FONT, PvMono из screens-pivot.jsx.

const PV_MS = [
  { lead: true, t: 'Снег падал четвёртый час подряд, и в подземельях пахло влажными книгами и холодным камнем. Гермиона шла быстрее обычного — не от страха, от холода.' },
  { t: 'В руках было письмо, которое она не собиралась отправлять и которое теперь было поздно не написать. Бумага размякла по краям, чернила чуть поплыли на слове, которое она вычёркивала дважды.' },
  { active: true, t: 'Она вывернула из-за угла и в первую секунду не поняла, что видит. В окне — силуэт: голова прислонена к холодному стеклу, рука в кармане. Он стоял так, будто ждал кого-то, кто давно не придёт.' },
  { t: 'Гермиона хотела уйти обратно в темноту, но половица под ней сказала всё за неё.' },
];

// ── DESKTOP — тихий холст, 3 режима ───────────────────────────
function PvQuietEditorDesktop({ light = false, mode: initMode = 'write' }) {
  const T = pvT(light);
  const { useState } = React;
  const [mode, setMode] = useState(initMode);
  const focus = mode === 'focus';
  const typNew = mode === 'typewriter';
  const chromeVisible = mode === 'write';
  const activeIdx = PV_MS.findIndex(p => p.active);

  const para = (p, i) => {
    const dim = (focus || typNew) && !p.active;
    return (
      <p key={i} style={{
        fontFamily: PV_FONT.body, fontSize: 18, lineHeight: 1.62,
        color: dim ? T.inkFaint : T.ink,
        opacity: dim ? (typNew ? 0.28 : 0.32) : 1,
        margin: p.lead ? 0 : '0.9em 0 0', textAlign:'left',
        transition:'opacity .5s, color .5s', textWrap:'pretty',
        filter: dim && !typNew ? 'blur(0.4px)' : 'none' }}>
        {p.lead
          ? <><span style={{ fontFamily: PV_FONT.display, fontSize: 21, fontStyle:'italic',
              color: T.ink, marginRight: 2 }}>{p.t.slice(0,1)}</span>{p.t.slice(1)}</>
          : p.t}
        {p.active && (
          <span style={{ display:'inline-block', width: 2, height: '1.05em', verticalAlign:'-0.18em',
            marginLeft: 2, background: T.amber, animation:'pvCaret 1.1s steps(1) infinite' }}/>
        )}
      </p>
    );
  };

  return (
    <div className="mix" style={{ width:'100%', height:'100%', background: T.bg,
      position:'relative', overflow:'hidden', display:'flex', flexDirection:'column' }}>
      <style>{`@keyframes pvCaret{0%,50%{opacity:1}51%,100%{opacity:0}}@keyframes pvBreathe{0%,100%{opacity:.4;transform:scale(.85)}50%{opacity:1;transform:scale(1.15)}}`}</style>
      {/* свет свечи — ТОЛЬКО тонкая амбер-виньетка по краям */}
      <div style={{ position:'absolute', inset:0, pointerEvents:'none', zIndex: 1,
        boxShadow:`inset 0 0 220px ${light ? 'rgba(199,126,46,.10)' : 'rgba(229,169,90,.09)'}`,
        background: focus || typNew
          ? `radial-gradient(120% 70% at 50% ${typNew ? '46' : '40'}%, transparent 42%, ${light ? 'rgba(237,228,212,.72)' : 'rgba(22,11,34,.78)'} 100%)`
          : 'none', transition:'background .5s' }}/>

      {/* ── chrome (тает в фокусе/машинке) ── */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
        padding:'13px 22px', borderBottom:`1px solid ${chromeVisible ? T.border : 'transparent'}`,
        position:'relative', zIndex: 6,
        opacity: chromeVisible ? 1 : 0.16, transition:'opacity .45s' }}>
        <div style={{ display:'flex', alignItems:'center', gap: 12 }}>
          <span style={{ color: T.inkDim, fontSize: 15 }}>←</span>
          <span style={{ fontFamily: PV_FONT.display, fontStyle:'italic', fontSize: 14, color: T.inkDim }}>
            Зимний свет в подземельях
          </span>
          <span style={{ color: T.inkFaint }}>·</span>
          <PvMono c={T.inkFaint} size={9}>гл. 7 черновик</PvMono>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap: 16 }}>
          <PvMono c={T.inkDim} size={9} style={{ display:'flex', alignItems:'center', gap: 5 }}>
            <span style={{ width: 5, height: 5, borderRadius:'50%', background: T.amber }}/> сохранено
          </PvMono>
          <PvMono c={T.inkFaint} size={9}>1 124 слова</PvMono>
        </div>
      </div>

      {/* ── manuscript column ── */}
      <div style={{ flex:1, position:'relative', zIndex: 3, overflow:'hidden',
        display:'flex', justifyContent:'center' }}>
        <div style={{ width:'100%', maxWidth: 620, padding: typNew ? '0 44px' : '46px 44px 0',
          display:'flex', flexDirection:'column', justifyContent: typNew ? 'center' : 'flex-start' }}>

          {chromeVisible && (
            <div style={{ marginBottom: 26 }}>
              <PvMono c={T.amber} size={9}>глава седьмая</PvMono>
              <div style={{ fontFamily: PV_FONT.display, fontSize: 30, lineHeight: 1.05, fontWeight: 500,
                color: T.ink, marginTop: 8, textWrap:'balance' }}>
                Письмо, которое <em style={{ color: T.amber }}>нельзя</em> было писать.
              </div>
            </div>
          )}

          {/* печ. машинка: активный абзац строго по центру — контекст сверху/снизу в равных зонах */}
          {typNew ? (
            <>
              <div style={{ flex:'1 1 0', minHeight: 0, overflow:'hidden',
                display:'flex', flexDirection:'column', justifyContent:'flex-end' }}>
                {PV_MS.slice(0, activeIdx).map(para)}
              </div>
              {para(PV_MS[activeIdx], activeIdx)}
              <div style={{ flex:'1 1 0', minHeight: 0, overflow:'hidden' }}>
                {PV_MS.slice(activeIdx + 1).map((p, i) => para(p, activeIdx + 1 + i))}
              </div>
            </>
          ) : PV_MS.map(para)}
          {chromeVisible && (
            <p style={{ fontFamily: PV_FONT.body, fontStyle:'italic', fontSize: 18, lineHeight: 1.62,
              color: T.inkFaint, margin:'0.9em 0 0', textAlign:'left', opacity: .58 }}>
              Драко не обернулся, но она увидела, как напряглась его спина…
              <span style={{ fontFamily: PV_FONT.mono, fontSize: 8.5, letterSpacing:'.14em',
                color: T.inkFaint, marginLeft: 10, textTransform:'uppercase',
                border:`1px solid ${T.border}`, padding:'2px 6px', borderRadius: 5 }}>TAB — принять</span>
            </p>
          )}
        </div>

        {/* тихий индикатор режима фокуса */}
        {(focus || typNew) && (
          <div style={{ position:'absolute', top: 18, right: 22, zIndex: 8,
            display:'flex', alignItems:'center', gap: 7, padding:'6px 13px', borderRadius: 999,
            border:`1px solid ${T.amber}44`, background: light ? 'rgba(247,241,228,.7)' : 'rgba(31,18,48,.7)',
            backdropFilter:'blur(6px)' }}>
            <span style={{ width: 6, height: 6, borderRadius:'50%', background: T.amber,
              animation:'pvBreathe 3.4s ease-in-out infinite' }}/>
            <PvMono c={T.inkDim} size={8.5}>{typNew ? 'печ. машинка' : 'фокус'}</PvMono>
          </div>
        )}
      </div>

      {/* ── нижняя строка: режимы + счётчик сцены ── */}
      <div style={{ position:'relative', zIndex: 6, padding:'10px 22px',
        display:'flex', justifyContent:'space-between', alignItems:'center',
        background: light ? 'rgba(237,228,212,.86)' : 'rgba(22,11,34,.82)',
        backdropFilter:'blur(8px)', borderTop:`1px solid ${T.border}` }}>
        <PvMono c={T.inkFaint} size={8.5}>сцена 2 из 3 · ⌘K команды соавтора</PvMono>
        <div style={{ display:'inline-flex', borderRadius: 999, border:`1px solid ${T.border}`, padding: 3, gap: 2 }}>
          {[['write','✎ письмо'],['focus','◐ фокус'],['typewriter','⌶ машинка']].map(([m, l]) => (
            <span key={m} onClick={() => setMode(m)} style={{ cursor:'pointer',
              padding:'5px 12px', borderRadius: 999, fontFamily: PV_FONT.ui, fontSize: 11,
              background: mode === m ? T.amber : 'transparent',
              color: mode === m ? T.bg : T.inkDim, transition:'all .2s' }}>{l}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── MOBILE — тихий холст ──────────────────────────────────────
function PvQuietEditorMobile({ light = false, mode: initMode = 'write' }) {
  const T = pvT(light);
  const { useState } = React;
  const [mode, setMode] = useState(initMode);
  const focus = mode === 'focus';
  const typNew = mode === 'typewriter';
  const chromeVisible = mode === 'write';
  const activeIdx = PV_MS.findIndex(p => p.active);

  const para = (p, i) => {
    const dim = (focus || typNew) && !p.active;
    return (
      <p key={i} style={{
        fontFamily: PV_FONT.body, fontSize: 17, lineHeight: 1.6,
        color: dim ? T.inkFaint : T.ink, opacity: dim ? 0.3 : 1,
        margin: p.lead ? 0 : '0.85em 0 0', textAlign:'left', transition:'opacity .5s',
        textWrap:'pretty' }}>
        {p.t}
        {p.active && <span style={{ display:'inline-block', width: 2, height:'1em',
          verticalAlign:'-0.15em', marginLeft: 2, background: T.amber,
          animation:'pvCaret 1.1s steps(1) infinite' }}/>}
      </p>
    );
  };

  return (
    <div className="mix" style={{ width:'100%', height:'100%', background: T.bg,
      position:'relative', overflow:'hidden', display:'flex', flexDirection:'column' }}>
      <style>{`@keyframes pvCaret{0%,50%{opacity:1}51%,100%{opacity:0}}@keyframes pvBreathe{0%,100%{opacity:.4;transform:scale(.85)}50%{opacity:1;transform:scale(1.15)}}`}</style>
      <div style={{ position:'absolute', inset:0, pointerEvents:'none', zIndex: 1,
        boxShadow:`inset 0 0 140px ${light ? 'rgba(199,126,46,.10)' : 'rgba(229,169,90,.08)'}`,
        background: focus || typNew
          ? `radial-gradient(130% 60% at 50% 44%, transparent 40%, ${light ? 'rgba(237,228,212,.7)' : 'rgba(22,11,34,.8)'} 100%)`
          : 'none', transition:'background .5s' }}/>

      <div style={{ display:'flex', justifyContent:'space-between', padding:'10px 18px 4px',
        fontFamily: PV_FONT.mono, fontSize: 11, color: T.ink, opacity:.8, position:'relative', zIndex: 5 }}>
        <span>1:42</span><span>•••○ 5G 92%</span>
      </div>

      {/* chrome */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
        padding:'6px 16px 10px', borderBottom:`1px solid ${chromeVisible ? T.border : 'transparent'}`,
        position:'relative', zIndex: 5, opacity: chromeVisible ? 1 : 0.16, transition:'opacity .45s' }}>
        <span style={{ color: T.inkDim, fontSize: 16 }}>←</span>
        <div style={{ textAlign:'center' }}>
          <PvMono c={T.inkFaint} size={8}>гл. 7 · черновик</PvMono>
        </div>
        <PvMono c={T.inkDim} size={8} style={{ display:'flex', alignItems:'center', gap: 4 }}>
          <span style={{ width: 4, height: 4, borderRadius:'50%', background: T.amber }}/> сохр.
        </PvMono>
      </div>

      {/* manuscript */}
      <div style={{ flex:1, position:'relative', zIndex: 3, overflow:'hidden', padding:'0 22px',
        display:'flex', flexDirection:'column', justifyContent: typNew ? 'center' : 'flex-start' }}>
        {chromeVisible && (
          <div style={{ margin:'16px 0 20px' }}>
            <PvMono c={T.amber} size={8.5}>глава седьмая</PvMono>
            <div style={{ fontFamily: PV_FONT.display, fontSize: 23, lineHeight: 1.08, fontWeight: 500,
              color: T.ink, marginTop: 6, textWrap:'balance' }}>
              Письмо, которое <em style={{ color: T.amber }}>нельзя</em> было писать.
            </div>
          </div>
        )}
        {!chromeVisible && !typNew && <div style={{ height: 20 }}/>}
        {typNew ? (
          <>
            <div style={{ flex:'1 1 0', minHeight: 0, overflow:'hidden',
              display:'flex', flexDirection:'column', justifyContent:'flex-end' }}>
              {PV_MS.slice(0, activeIdx).map(para)}
            </div>
            {para(PV_MS[activeIdx], activeIdx)}
            <div style={{ flex:'1 1 0', minHeight: 0, overflow:'hidden' }}>
              {PV_MS.slice(activeIdx + 1).map((p, i) => para(p, activeIdx + 1 + i))}
            </div>
          </>
        ) : PV_MS.map(para)}
        {chromeVisible && (
          <p style={{ fontFamily: PV_FONT.body, fontStyle:'italic', fontSize: 17, lineHeight: 1.6,
            color: T.inkFaint, margin:'0.85em 0 0', textAlign:'left', opacity:.58 }}>
            Драко не обернулся, но она увидела, как напряглась его спина…
          </p>
        )}
        {(focus || typNew) && (
          <div style={{ position:'absolute', top: 8, right: 16, display:'flex', alignItems:'center', gap: 6,
            padding:'5px 11px', borderRadius: 999, border:`1px solid ${T.amber}44`,
            background: light ? 'rgba(247,241,228,.7)' : 'rgba(31,18,48,.7)', backdropFilter:'blur(6px)' }}>
            <span style={{ width: 5, height: 5, borderRadius:'50%', background: T.amber,
              animation:'pvBreathe 3.4s ease-in-out infinite' }}/>
            <PvMono c={T.inkDim} size={8}>{typNew ? 'печ. машинка' : 'фокус'}</PvMono>
          </div>
        )}
      </div>

      {/* slash-подсказка + переключатель режимов */}
      <div style={{ position:'relative', zIndex: 5, padding:'8px 14px 12px',
        borderTop:`1px solid ${T.border}`, background: light ? 'rgba(237,228,212,.9)' : 'rgba(22,11,34,.86)',
        backdropFilter:'blur(8px)' }}>
        {chromeVisible && (
          <div style={{ display:'flex', alignItems:'center', gap: 8, padding:'8px 12px', marginBottom: 9,
            borderRadius: 12, border:`1px solid ${T.borderStrong}`, background: light ? '#fff' : T.surface }}>
            <span style={{ color: T.amber, fontFamily: PV_FONT.mono, fontSize: 13 }}>/</span>
            <span style={{ flex:1, fontFamily: PV_FONT.body, fontStyle:'italic', fontSize: 12.5, color: T.inkFaint }}>
              впиши затравку — соавтор развернёт сцену
            </span>
          </div>
        )}
        <div style={{ display:'flex', borderRadius: 999, border:`1px solid ${T.border}`, padding: 3, gap: 2 }}>
          {[['write','✎ письмо'],['focus','◐ фокус'],['typewriter','⌶ машинка']].map(([m, l]) => (
            <span key={m} onClick={() => setMode(m)} style={{ flex:1, textAlign:'center', cursor:'pointer',
              padding:'7px 0', borderRadius: 999, fontFamily: PV_FONT.ui, fontSize: 11.5,
              background: mode === m ? T.amber : 'transparent',
              color: mode === m ? T.bg : T.inkDim, transition:'all .2s' }}>{l}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

window.PvQuietEditorDesktop = PvQuietEditorDesktop;
window.PvQuietEditorMobile = PvQuietEditorMobile;
