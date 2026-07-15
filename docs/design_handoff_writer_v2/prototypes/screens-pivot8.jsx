// Pivot v3.1 — AI-соавтор: ЧАТ-ПЕРВЫЙ. Правая панель — живой чат о твоём тексте:
// можно напечатать что угодно, соавтор отвечает про рукопись (canned-ответы в макете).
// Inline-механика (slash → прогресс-повествование → amber-pending accept/reject) остаётся в центре.
// Использует pvT, PV_FONT, PvMono.

const PV_NARR = [
  'перечитываю твою сцену…',
  'держу в уме: письмо ещё не раскрыто…',
  'предлагаю продолжение — ты решаешь.',
];
const PV_PASSAGES = [
  'Драко обернулся медленно, будто это стоило ему усилия. «Ты всегда приходишь, когда не надо», — сказал он, но не двинулся с места. В голосе не было злости — только усталость человека, который слишком долго молчал.',
  'Он не обернулся. «Я слышал половицу ещё минуту назад», — сказал он стеклу, и его дыхание осело на нём туманом. «Просто не думал, что ты решишься подойти».',
];
const PV_BEAT = 'Драко оборачивается и впервые заговаривает первым';

// canned-ответы чата — всегда ПРО ТЕКСТ автора
const PV_CHAT_REPLIES = [
  'Смотрю по главам: письмо упоминается шесть раз, и трижды Гермиона держит его в правой руке. Если Драко видел его в гл. 5 — он узнает почерк. Хочешь, найду это место?',
  'В гл. 2 Слизнорт дежурит по четвергам, а эта сцена — в четверг. Он может войти в любую секунду: хочешь использовать это как обрыв главы?',
  'У тебя Драко ни разу не говорит первым за все семь глав. Если он заговорит сейчас — это событие. Может, поэтому сцена и буксует: она слишком важная, чтобы писаться легко.',
];

const PV_CHAT_INITIAL = [
  { who:'ai', t:'Заметила: в гл. 4 Драко прячет правую руку, а здесь письмо у него в левой. Так задумано?', chips:['да, исправь','так задумано'] },
  { who:'me', t:'как закончить сцену, чтобы не раскрывать письмо до гл. 9?' },
  { who:'ai', t:'Три хода — все держат интригу:', variants:[
    'Прервать сцену появлением Слизнорта',
    'Гермиона прячет письмо, но Драко замечает жест',
    'Закончить на полуслове — обрыв главы',
  ]},
];

// ── живой чат ─────────────────────────────────────────────────
function usePvChat() {
  const { useState } = React;
  const [msgs, setMsgs] = useState(PV_CHAT_INITIAL);
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);
  const send = () => {
    const text = draft.trim();
    if (!text || busy) return;
    setMsgs(m => [...m, { who:'me', t:text }]);
    setDraft(''); setBusy(true);
    setTimeout(() => {
      setMsgs(m => {
        const aiCount = m.filter(x => x.who === 'ai').length;
        return [...m, { who:'ai', t: PV_CHAT_REPLIES[(aiCount - 2 + PV_CHAT_REPLIES.length * 9) % PV_CHAT_REPLIES.length] }];
      });
      setBusy(false);
    }, 1500);
  };
  return { msgs, draft, setDraft, busy, send };
}

function PvChatThread({ T, chat, compact = false }) {
  const endRef = React.useRef(null);
  React.useEffect(() => {
    if (endRef.current && endRef.current.parentNode)
      endRef.current.parentNode.scrollTop = endRef.current.parentNode.scrollHeight;
  }, [chat.msgs.length, chat.busy]);
  const fs = compact ? 12 : 12.5;
  return (
    <div style={{ flex:1, minHeight: 0, overflow:'auto', scrollbarWidth:'none',
      padding: compact ? '10px 0 4px' : '14px 14px 6px',
      display:'flex', flexDirection:'column', gap: 10 }}>
      {chat.msgs.map((m, i) => m.who === 'me' ? (
        <div key={i} style={{ alignSelf:'flex-end', maxWidth:'85%', padding:'9px 12px',
          borderRadius:'12px 12px 4px 12px', background: T.amberSoft,
          border:`1px solid ${T.amber}40` }}>
          <div style={{ fontFamily: PV_FONT.body, fontSize: fs, lineHeight: 1.5, color: T.ink }}>{m.t}</div>
        </div>
      ) : (
        <div key={i} style={{ maxWidth:'92%', padding:'10px 12px',
          borderRadius:'12px 12px 12px 4px', background: T.surface, border:`1px solid ${T.border}` }}>
          <div style={{ fontFamily: PV_FONT.body, fontSize: fs, lineHeight: 1.55, color: T.ink }}>{m.t}</div>
          {m.chips && (
            <div style={{ display:'flex', gap: 6, marginTop: 8 }}>
              {m.chips.map((c, j) => (
                <span key={c} style={{ padding:'4px 10px', borderRadius: 999, fontSize: 10.5,
                  fontFamily: PV_FONT.ui, cursor:'pointer',
                  border:`1px solid ${j === 0 ? T.amber + '66' : T.border}`,
                  color: j === 0 ? T.amber : T.inkDim }}>{c}</span>
              ))}
            </div>
          )}
          {m.variants && (
            <div style={{ marginTop: 8 }}>
              {m.variants.map((v, j) => (
                <div key={j} style={{ display:'flex', alignItems:'baseline', gap: 8, padding:'7px 9px',
                  marginBottom: 4, borderRadius: 8,
                  border:`1px solid ${j === 1 ? T.amber + '66' : T.border}`,
                  background: j === 1 ? T.amberSoft : 'transparent' }}>
                  <span style={{ fontFamily: PV_FONT.mono, fontSize: 9, color: j === 1 ? T.amber : T.inkFaint }}>0{j+1}</span>
                  <span style={{ flex:1, fontFamily: PV_FONT.body, fontStyle:'italic', fontSize: fs - 1,
                    lineHeight: 1.4, color: j === 1 ? T.ink : T.inkDim }}>{v}</span>
                  <span style={{ fontSize: 10, color: T.rose, cursor:'pointer' }} title="оставить">♡</span>
                  {j === 1 && <span style={{ fontSize: 10, color: T.amber, whiteSpace:'nowrap', cursor:'pointer' }}>→ в текст</span>}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
      {chat.busy && (
        <div style={{ display:'flex', alignItems:'center', gap: 8, padding:'4px 2px' }}>
          <span style={{ width: 6, height: 6, borderRadius:'50%', background: T.amber,
            animation:'pvBreathe 2.2s ease-in-out infinite' }}/>
          <span style={{ fontFamily: PV_FONT.display, fontStyle:'italic', fontSize: fs + 1,
            color: T.inkDim }}>перечитываю твою сцену…</span>
        </div>
      )}
      <div ref={endRef}/>
    </div>
  );
}

function PvChatInput({ T, chat, compact = false }) {
  return (
    <div>
      <div style={{ display:'flex', gap: 5, flexWrap:'wrap', marginBottom: 9 }}>
        {['что дальше?','вычитай сцену','проверь мир','найди повторы'].map(q => (
          <span key={q} onClick={() => { chat.setDraft(q); }} style={{ padding:'4px 10px', borderRadius: 999,
            fontFamily: PV_FONT.ui, fontSize: compact ? 10 : 10.5, color: T.inkDim, cursor:'pointer',
            border:`1px solid ${T.border}` }}>{q}</span>
        ))}
      </div>
      <div style={{ display:'flex', alignItems:'center', gap: 8, padding:'9px 12px',
        borderRadius: 12, border:`1px solid ${T.borderStrong}`, background: T.panel }}>
        <input value={chat.draft} onChange={(e) => chat.setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') chat.send(); }}
          placeholder="спроси что угодно о своём тексте…"
          style={{ flex:1, background:'transparent', border:'none', outline:'none',
            fontFamily: PV_FONT.body, fontStyle:'italic', fontSize: compact ? 12.5 : 12.5,
            color: T.ink, caretColor: T.amber, minWidth: 0 }}/>
        <span onClick={chat.send} style={{ width: 26, height: 26, borderRadius: 8, cursor:'pointer',
          background: T.amberBright, color: T.bg, display:'flex', alignItems:'center',
          justifyContent:'center', fontSize: 13, flex:'0 0 26px' }}>↑</span>
      </div>
    </div>
  );
}

// ── inline-механика в рукописи (slash → повествование → pending) ──
function usePvAssist() {
  const { useState, useEffect } = React;
  const [phase, setPhase] = useState('beat');
  const [narr, setNarr] = useState(0);
  const [typed, setTyped] = useState('');
  const [variant, setVariant] = useState(0);
  useEffect(() => {
    if (phase === 'thinking') {
      setNarr(0); setTyped('');
      let n = 0;
      const iv = setInterval(() => {
        n++; setNarr(n);
        if (n >= PV_NARR.length) { clearInterval(iv); setTimeout(() => setPhase('result'), 650); }
      }, 820);
      return () => clearInterval(iv);
    }
    if (phase === 'result') {
      const full = PV_PASSAGES[variant % PV_PASSAGES.length];
      let i = 0;
      const iv = setInterval(() => {
        i += 2; setTyped(full.slice(0, i));
        if (i >= full.length) clearInterval(iv);
      }, 20);
      return () => clearInterval(iv);
    }
  }, [phase, variant]);
  return {
    phase, narr, typed, variant,
    run: () => setPhase('thinking'),
    accept: () => setPhase('accepted'),
    reject: () => { setPhase('beat'); setTyped(''); },
    refine: () => { setVariant(v => v + 1); setPhase('thinking'); },
    reset: () => { setPhase('beat'); setTyped(''); setVariant(0); },
  };
}

function PvPendingCard({ T, a, compact }) {
  return (
    <div style={{ marginTop: 12, borderRadius: 12, overflow:'hidden',
      border:`1px solid ${T.amber}66`, background:`linear-gradient(160deg, ${T.amberSoft}, transparent 80%)` }}>
      <div style={{ padding: compact ? '12px 14px' : '14px 18px', borderLeft:`2px solid ${T.amber}` }}>
        <PvMono c={T.amber} size={8} style={{ display:'block', marginBottom: 7 }}>◐ предложение · ещё не в тексте</PvMono>
        <div style={{ fontFamily: PV_FONT.body, fontSize: compact ? 14 : 15.5, lineHeight: 1.6,
          color: T.ink, fontStyle:'italic' }}>
          {a.typed}
          {a.typed.length < PV_PASSAGES[a.variant % PV_PASSAGES.length].length &&
            <span style={{ display:'inline-block', width: 2, height:'1em', verticalAlign:'-0.15em',
              marginLeft: 1, background: T.amber, animation:'pvCaret 1s steps(1) infinite' }}/>}
        </div>
      </div>
      <div style={{ display:'flex', alignItems:'center', gap: 8, padding:'10px 14px',
        borderTop:`1px solid ${T.amber}33`, background:'rgba(0,0,0,.16)' }}>
        <span onClick={a.accept} style={{ cursor:'pointer', padding:'5px 12px', borderRadius: 999,
          background: T.amber, color: T.bg, fontFamily: PV_FONT.display, fontStyle:'italic',
          fontSize: 12, fontWeight: 500 }}>в текст ✓</span>
        <span onClick={a.refine} style={{ cursor:'pointer', padding:'5px 11px', borderRadius: 999,
          border:`1px solid ${T.amber}66`, color: T.amber, fontFamily: PV_FONT.ui, fontSize: 11.5 }}>иначе ↻</span>
        <span onClick={a.reject} style={{ cursor:'pointer', padding:'5px 11px', borderRadius: 999,
          border:`1px solid ${T.border}`, color: T.inkFaint, fontFamily: PV_FONT.ui, fontSize: 11.5 }}>мимо</span>
        <span style={{ flex: 1 }}/>
        <PvMono c={T.inkFaint} size={7.5}>человек · AI-ассистировано</PvMono>
      </div>
    </div>
  );
}

function PvNarration({ T, narr }) {
  return (
    <div style={{ marginTop: 12, padding:'14px 18px', borderRadius: 12,
      border:`1px dashed ${T.amber}55`, background:'rgba(0,0,0,.14)' }}>
      <div style={{ display:'flex', alignItems:'center', gap: 8, marginBottom: 8 }}>
        <span style={{ width: 7, height: 7, borderRadius:'50%', background: T.amber,
          animation:'pvBreathe 2.4s ease-in-out infinite' }}/>
        <PvMono c={T.amber} size={8}>соавтор думает</PvMono>
      </div>
      {PV_NARR.map((line, i) => (
        <div key={i} style={{ fontFamily: PV_FONT.display, fontStyle:'italic',
          fontSize: 15, lineHeight: 1.5, color: i < narr ? T.ink : T.inkFaint,
          opacity: i < narr ? 1 : 0.35, transition:'opacity .4s, color .4s',
          margin:'2px 0' }}>{line}</div>
      ))}
    </div>
  );
}

// ── DESKTOP ───────────────────────────────────────────────────
function PvAssistDesktop() {
  const T = pvT(false);
  const a = usePvAssist();
  const chat = usePvChat();
  return (
    <div className="mix" style={{ width:'100%', height:'100%', background: T.bg,
      position:'relative', overflow:'hidden', display:'flex', flexDirection:'column' }}>
      <style>{`@keyframes pvCaret{0%,50%{opacity:1}51%,100%{opacity:0}}@keyframes pvBreathe{0%,100%{opacity:.35;transform:scale(.82)}50%{opacity:.95;transform:scale(1.14)}}`}</style>
      <div style={{ position:'absolute', right:'22%', top:-120, width: 380, height: 380,
        background:`radial-gradient(circle, ${T.glow}, transparent 65%)`, pointerEvents:'none' }}/>

      {/* chrome */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
        padding:'13px 22px', borderBottom:`1px solid ${T.border}`, position:'relative', zIndex: 6 }}>
        <div style={{ display:'flex', alignItems:'center', gap: 12 }}>
          <span style={{ color: T.inkDim, fontSize: 15 }}>←</span>
          <span style={{ fontFamily: PV_FONT.display, fontStyle:'italic', fontSize: 14, color: T.inkDim }}>Зимний свет в подземельях</span>
          <span style={{ color: T.inkFaint }}>·</span>
          <PvMono c={T.inkFaint} size={9}>гл. 7</PvMono>
        </div>
        <PvMono c={T.inkDim} size={9} style={{ display:'flex', alignItems:'center', gap: 5 }}>
          <span style={{ width: 5, height: 5, borderRadius:'50%', background: T.amber }}/> сохранено
        </PvMono>
      </div>

      <div style={{ flex:1, display:'grid', gridTemplateColumns:'1fr 340px', minHeight: 0, position:'relative', zIndex: 3 }}>
        {/* центр — рукопись + inline-механика */}
        <div style={{ overflow:'hidden', display:'flex', justifyContent:'center', position:'relative' }}>
          <div style={{ width:'100%', maxWidth: 600, padding:'40px 40px 0' }}>
            <PvMono c={T.amber} size={9}>глава седьмая</PvMono>
            <div style={{ fontFamily: PV_FONT.display, fontSize: 26, lineHeight: 1.05, fontWeight: 500,
              color: T.ink, margin:'8px 0 22px', textWrap:'balance' }}>
              Письмо, которое <em style={{ color: T.amber }}>нельзя</em> было писать.
            </div>
            <p style={{ fontFamily: PV_FONT.body, fontSize: 17, lineHeight: 1.62, color: T.ink,
              margin: 0, textAlign:'left', textWrap:'pretty' }}>
              Снег падал четвёртый час подряд, и в подземельях пахло влажными книгами и
              холодным камнем. Гермиона шла быстрее обычного — не от страха, от холода.
            </p>
            <p style={{ fontFamily: PV_FONT.body, fontSize: 17, lineHeight: 1.62, color: T.ink,
              margin:'0.9em 0 0', textAlign:'left', textWrap:'pretty' }}>
              Она вывернула из-за угла и в первую секунду не поняла, что видит. В окне — силуэт:
              голова прислонена к холодному стеклу, рука в кармане.
            </p>

            {a.phase === 'accepted' && (
              <p style={{ fontFamily: PV_FONT.body, fontSize: 17, lineHeight: 1.62, color: T.ink,
                margin:'0.9em 0 0', textAlign:'left', textWrap:'pretty' }}>{PV_PASSAGES[a.variant % PV_PASSAGES.length]}</p>
            )}

            {a.phase === 'beat' && (
              <div style={{ marginTop: 14, padding:'12px 16px', borderRadius: 12,
                border:`1px solid ${T.borderStrong}`, background: T.surface,
                display:'flex', alignItems:'center', gap: 10 }}>
                <span style={{ color: T.amber, fontFamily: PV_FONT.mono, fontSize: 14 }}>/</span>
                <span style={{ flex: 1, fontFamily: PV_FONT.body, fontStyle:'italic', fontSize: 14, color: T.ink }}>
                  {PV_BEAT}<span style={{ display:'inline-block', width: 2, height:'1em',
                    verticalAlign:'-0.15em', marginLeft: 2, background: T.amber,
                    animation:'pvCaret 1s steps(1) infinite' }}/>
                </span>
                <span onClick={a.run} style={{ cursor:'pointer', padding:'5px 12px', borderRadius: 999,
                  background: T.amber, color: T.bg, fontFamily: PV_FONT.display, fontStyle:'italic',
                  fontSize: 12, fontWeight: 500, whiteSpace:'nowrap' }}>развернуть →</span>
              </div>
            )}
            {a.phase === 'thinking' && <PvNarration T={T} narr={a.narr}/>}
            {a.phase === 'result' && <PvPendingCard T={T} a={a}/>}
            {a.phase === 'accepted' && (
              <div style={{ marginTop: 14, display:'flex', alignItems:'center', gap: 10 }}>
                <PvMono c={T.amber} size={8.5}>✓ вставлено · продолжай своей рукой</PvMono>
                <span onClick={a.reset} style={{ cursor:'pointer', fontFamily: PV_FONT.ui, fontSize: 11,
                  color: T.inkFaint, borderBottom:`1px solid ${T.border}` }}>↺ показать заново</span>
              </div>
            )}
          </div>

          <div style={{ position:'absolute', bottom: 0, left: 0, right: 0, padding:'9px 40px',
            display:'flex', justifyContent:'space-between', borderTop:`1px solid ${T.border}`,
            background:'rgba(22,11,34,.82)', backdropFilter:'blur(8px)' }}>
            <PvMono c={T.inkFaint} size={8.5}>сцена 2 из 3 · 1 124 слова</PvMono>
            <PvMono c={T.inkFaint} size={8.5}>⌘J — соавтор</PvMono>
          </div>
        </div>

        {/* правый край — ЧАТ о твоём тексте */}
        <div style={{ borderLeft:`1px solid ${T.border}`, background:'rgba(0,0,0,.22)',
          display:'flex', flexDirection:'column', minHeight: 0 }}>
          <div style={{ padding:'14px 16px 10px', borderBottom:`1px solid ${T.border}` }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <span className="mix-chrome" style={{ fontFamily: PV_FONT.display, fontStyle:'italic',
                fontSize: 15, fontWeight: 600 }}>✦ соавтор</span>
              <PvMono c={T.inkFaint} size={8.5}>видит гл. 1–7 · библию</PvMono>
            </div>
          </div>

          <PvChatThread T={T} chat={chat}/>

          <div style={{ padding:'10px 14px 14px', borderTop:`1px solid ${T.border}` }}>
            <PvChatInput T={T} chat={chat}/>
            <div style={{ display:'flex', justifyContent:'space-between', marginTop: 9 }}>
              <PvMono c={T.inkFaint} size={7.5}>2 / 5 разворотов сегодня</PvMono>
              <PvMono c={T.amber} size={7.5}>★ pro — 30</PvMono>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── MOBILE — чат-sheet ────────────────────────────────────────
function PvAssistMobile() {
  const T = pvT(false);
  const chat = usePvChat();
  return (
    <div className="mix" style={{ width:'100%', height:'100%', background: T.bg,
      position:'relative', overflow:'hidden', display:'flex', flexDirection:'column' }}>
      <style>{`@keyframes pvCaret{0%,50%{opacity:1}51%,100%{opacity:0}}@keyframes pvBreathe{0%,100%{opacity:.35;transform:scale(.82)}50%{opacity:.95;transform:scale(1.14)}}`}</style>
      <div style={{ display:'flex', justifyContent:'space-between', padding:'10px 18px 4px',
        fontFamily: PV_FONT.mono, fontSize: 11, color: T.ink, opacity:.8 }}>
        <span>1:42</span><span>•••○ 5G 92%</span>
      </div>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
        padding:'6px 16px 10px', borderBottom:`1px solid ${T.border}` }}>
        <span style={{ color: T.inkDim, fontSize: 16 }}>←</span>
        <PvMono c={T.inkFaint} size={8}>гл. 7 · черновик</PvMono>
        <PvMono c={T.inkDim} size={8}>2/5 ✦</PvMono>
      </div>

      {/* рукопись — верхний контекст */}
      <div style={{ padding:'14px 22px 10px' }}>
        <p style={{ fontFamily: PV_FONT.body, fontSize: 15, lineHeight: 1.55, color: T.inkDim,
          margin: 0, textAlign:'left', textWrap:'pretty' }}>
          …В окне — силуэт: голова прислонена к холодному стеклу, рука в кармане.
        </p>
      </div>

      {/* чат-sheet — основная поверхность */}
      <div style={{ flex:1, minHeight: 0, borderRadius:'18px 18px 0 0', background:'rgba(0,0,0,.24)',
        border:`1px solid ${T.borderStrong}`, borderBottom:'none',
        boxShadow:'0 -12px 40px rgba(0,0,0,.3)', padding:'10px 16px 14px',
        display:'flex', flexDirection:'column' }}>
        <div style={{ width: 36, height: 4, borderRadius: 2, background: T.borderStrong, margin:'0 auto 10px', flex:'0 0 auto' }}/>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom: 4, flex:'0 0 auto' }}>
          <span className="mix-chrome" style={{ fontFamily: PV_FONT.display, fontStyle:'italic',
            fontSize: 15, fontWeight: 600 }}>✦ соавтор</span>
          <PvMono c={T.inkFaint} size={8}>видит гл. 1–7</PvMono>
        </div>

        <PvChatThread T={T} chat={chat} compact={true}/>

        <div style={{ flex:'0 0 auto', paddingTop: 8 }}>
          <PvChatInput T={T} chat={chat} compact={true}/>
        </div>
      </div>
    </div>
  );
}

window.PvAssistDesktop = PvAssistDesktop;
window.PvAssistMobile = PvAssistMobile;
