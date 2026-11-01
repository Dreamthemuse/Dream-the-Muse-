(()=>{
const T=[
{id:'the-flame-that-remembers',en:'The Flame That Remembers',ru:'Пламя, которое помнит',cap:'It burns only what it once loved.',capru:'Оно сжигает лишь то, что когда-то любило.',meta:'117 BPM · B♭ minor'},
{id:'heartline-symphony',en:'Heartline Symphony',ru:'Симфония Линии Сердца',cap:'Every heartbeat is a bar line.',capru:'Каждый удар сердца — тактовая черта.',meta:'86 BPM · G major · AI co-created'},
{id:'shadow-pulse',en:'Shadow Pulse',ru:'Теневой Пульс',cap:'The shadow keeps time when the light forgets.',capru:'Тень держит ритм, когда свет забывает.',meta:'123 BPM · G minor'},
{id:'the-first-sound',en:'The First Sound',ru:'Первый Звук',cap:'Before the word — a breath that dared.',capru:'До слова было дыхание, которое осмелилось.',meta:'92 BPM · E♭ major'},
{id:'source-gate',en:'Source Gate',ru:'Врата Истока',cap:'The gate opens for those who stop knocking.',capru:'Врата открываются тем, кто перестал стучать.',meta:'81 BPM · G minor'}];
const RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
const $=s=>document.querySelector(s),au=$('#au'),list=$('#tracks'),wf=$('#wf'),viz=$('#viz'),pp=$('#pp'),tt=$('#ptitle'),tc=$('#pcap'),tm=$('#ptime'),pl=$('#player'),st=$('#pstatus'),fl=$('#pfile');
let cur=0,peaks={},raf,pendingSeek=null;
const fmt=s=>isFinite(s)&&s>=0?Math.floor(s/60)+':'+String(Math.floor(s%60)).padStart(2,'0'):'0:00';
const url=i=>'audio/'+T[i].id+'.mp3';
function status(t,err){st.textContent=t||'';st.classList.toggle('err',!!err)}
/* Track list: build synchronously; each row also has a plain link to the file */
T.forEach((t,i)=>{const li=document.createElement('li');li.innerHTML=`<button type="button"><span class="n">${String(i+1).padStart(2,'0')}</span><span class="t"><b>${t.en}</b><i>${t.ru}</i></span><span class="m">${t.meta}</span></button><a class="f" href="${url(i)}" target="_blank" rel="noopener">mp3 ↗</a>`;
li.querySelector('button').addEventListener('click',()=>{if(cur===i&&!au.paused){au.pause()}else{select(i);playNow()}});list.appendChild(li);
fetch('audio/'+t.id+'.json').then(r=>r.json()).then(j=>{peaks[t.id]=j;if(i===cur){drawWF();if(!au.duration)tm.textContent='0:00 / '+fmt(j.duration)}}).catch(()=>{})});
/* Select a track: sets src synchronously (no awaits), never routes through WebAudio */
function select(i){cur=(i+T.length)%T.length;const t=T[cur],u=url(cur);if(au.getAttribute('src')!==u){au.setAttribute('src',u);}
tt.innerHTML=`${t.en} <span>· ${t.ru}</span>`;tc.innerHTML=`${t.cap}<br><span class="en">${t.capru}</span>`;fl.href=u;
[...list.children].forEach((li,k)=>li.classList.toggle('on',k===cur));drawWF();setMeta();}
/* Must be called directly inside the tap handler: play() is the first async thing that happens */
function playNow(){if(!au.getAttribute('src'))select(cur);let p;try{p=au.play()}catch(e){fail(e);return}
status('Загрузка… · Loading…');
if(p&&p.then)p.then(()=>{status('');document.querySelectorAll('video').forEach(v=>{if(!v.paused)v.pause()})}).catch(fail);}
function fail(e){console.warn('play failed',e);status('Не играет? Нажмите ▶ ещё раз или откройте файл ↗ · Tap ▶ again or open the file ↗',true);au.controls=true;pl.classList.add('native')}
pp.addEventListener('click',()=>{au.paused?playNow():au.pause()});
$('#pprev').addEventListener('click',()=>{if(au.currentTime>3){au.currentTime=0;return}select(cur-1);playNow()});
$('#pnext').addEventListener('click',()=>{select(cur+1);playNow()});
au.addEventListener('ended',()=>{select(cur+1);playNow()});
au.addEventListener('playing',()=>{status('');pl.classList.add('playing');pp.setAttribute('aria-label','Пауза · Pause');cancelAnimationFrame(raf);loop()});
au.addEventListener('play',()=>pl.classList.add('playing'));
au.addEventListener('waiting',()=>status('Загрузка… · Loading…'));
au.addEventListener('pause',()=>{pl.classList.remove('playing');pp.setAttribute('aria-label','Играть · Play');cancelAnimationFrame(raf);drawViz(true)});
au.addEventListener('error',()=>{const c=au.error&&au.error.code;fail('media error '+c)});
au.addEventListener('loadedmetadata',()=>{if(pendingSeek!=null){try{au.currentTime=pendingSeek*au.duration}catch(e){}pendingSeek=null}});
au.addEventListener('timeupdate',()=>{tm.textContent=fmt(au.currentTime)+' / '+fmt(au.duration||(peaks[T[cur].id]||{}).duration);drawWF();
if('mediaSession'in navigator&&navigator.mediaSession.setPositionState&&isFinite(au.duration)&&au.duration>0)try{navigator.mediaSession.setPositionState({duration:au.duration,position:Math.min(au.currentTime,au.duration),playbackRate:1})}catch(e){}});
/* a video starting pauses the audio (videos never pause the audio element otherwise) */
document.querySelectorAll('video').forEach(v=>v.addEventListener('play',()=>{if(!au.paused)au.pause()}));
/* waveform drawn from static peaks */
function fit(c){const r=c.getBoundingClientRect(),d=Math.min(devicePixelRatio||1,2),w=Math.max(1,Math.round(r.width*d)),h=Math.max(1,Math.round(r.height*d));if(c.width!==w||c.height!==h){c.width=w;c.height=h}return c.getContext('2d')}
function drawWF(){const g=fit(wf),W=wf.width,H=wf.height,p=(peaks[T[cur].id]||{}).peaks;g.clearRect(0,0,W,H);if(!p)return;const n=p.length,bw=W/n,pr=au.duration?au.currentTime/au.duration:0;
const gold=g.createLinearGradient(0,0,0,H);gold.addColorStop(0,'#fff4dc');gold.addColorStop(.5,'#e9c27a');gold.addColorStop(1,'#9a6b25');
for(let i=0;i<n;i++){const h=Math.max(2,p[i]*H*.92);g.fillStyle=i/n<=pr?gold:'rgba(233,194,122,.22)';g.fillRect(i*bw+bw*.15,(H-h)/2,bw*.7,h)}}
/* seek: tap/drag; inside the gesture, start playback if needed */
function frac(e){const r=wf.getBoundingClientRect();return Math.max(0,Math.min(1,(e.clientX-r.left)/r.width))}
function seekTo(x){if(isFinite(au.duration)&&au.duration>0){try{au.currentTime=x*au.duration}catch(e){}}else pendingSeek=x;drawWF()}
let drag=false;
wf.addEventListener('pointerdown',e=>{drag=true;try{wf.setPointerCapture(e.pointerId)}catch(_){}const x=frac(e);if(au.paused)playNow();seekTo(x)});
wf.addEventListener('pointermove',e=>{if(drag)seekTo(frac(e))});
['pointerup','pointercancel'].forEach(ev=>wf.addEventListener(ev,()=>drag=false));
wf.addEventListener('keydown',e=>{if(!au.duration)return;if(e.key==='ArrowRight')au.currentTime+=5;if(e.key==='ArrowLeft')au.currentTime-=5});
addEventListener('resize',()=>{drawWF();drawViz(au.paused)});
/* visualizer: simulated from peaks + time (no WebAudio, so it can never mute playback) */
function drawViz(idle){const g=fit(viz),W=viz.width,H=viz.height;g.clearRect(0,0,W,H);const N=48,bw=W/N,p=(peaks[T[cur].id]||{}).peaks||[],pr=au.duration?au.currentTime/au.duration:0,base=p[Math.floor(pr*p.length)]||.35,t=performance.now()/1000;
for(let i=0;i<N;i++){const v=idle?.04+.03*Math.sin(i*.5):Math.max(.05,base*(.5+.5*Math.abs(Math.sin(t*6.6+i*.7)*Math.cos(t*2.1+i*.23)))*(1.05-Math.abs(i-N/2)/N));const h=Math.max(2,v*H);
const gr=g.createLinearGradient(0,H,0,H-h);gr.addColorStop(0,'rgba(154,107,37,.9)');gr.addColorStop(1,i%5==0?'rgba(185,139,255,.9)':'rgba(255,244,220,.95)');g.fillStyle=gr;g.fillRect(i*bw+bw*.2,H-h,bw*.6,h)}}
function loop(){drawViz(false);if(!RM&&!au.paused)raf=requestAnimationFrame(loop)}
/* Media Session: all wrapped, never blocks playback */
function setMeta(){try{if(!('mediaSession'in navigator)||!window.MediaMetadata)return;const t=T[cur];navigator.mediaSession.metadata=new MediaMetadata({title:t.en+' · '+t.ru,artist:'Dream the Muse',album:'387 → 1052 → ∞',artwork:[{src:new URL('img/master-vector-star.webp',location.href).href,sizes:'1080x1080',type:'image/webp'}]})}catch(e){}}
if('mediaSession'in navigator){const h=(a,f)=>{try{navigator.mediaSession.setActionHandler(a,f)}catch(e){}};h('play',()=>playNow());h('pause',()=>au.pause());h('previoustrack',()=>{select(cur-1);playNow()});h('nexttrack',()=>{select(cur+1);playNow()});h('seekto',d=>{try{au.currentTime=d.seekTime}catch(e){}})}
select(0);drawViz(true);
})();
