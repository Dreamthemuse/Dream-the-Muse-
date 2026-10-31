(()=>{
const T=[
{id:'the-flame-that-remembers',en:'The Flame That Remembers',ru:'Пламя, которое помнит',cap:'It burns only what it once loved.',capru:'Оно сжигает лишь то, что когда-то любило.',meta:'117 BPM · B♭ minor'},
{id:'heartline-symphony',en:'Heartline Symphony',ru:'Симфония Линии Сердца',cap:'Every heartbeat is a bar line.',capru:'Каждый удар сердца — тактовая черта.',meta:'86 BPM · G major · AI co-created'},
{id:'shadow-pulse',en:'Shadow Pulse',ru:'Теневой Пульс',cap:'The shadow keeps time when the light forgets.',capru:'Тень держит ритм, когда свет забывает.',meta:'123 BPM · G minor'},
{id:'the-first-sound',en:'The First Sound',ru:'Первый Звук',cap:'Before the word — a breath that dared.',capru:'До слова было дыхание, которое осмелилось.',meta:'92 BPM · E♭ major'},
{id:'source-gate',en:'Source Gate',ru:'Врата Истока',cap:'The gate opens for those who stop knocking.',capru:'Врата открываются тем, кто перестал стучать.',meta:'81 BPM · G minor'}];
const RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
const iOS=/iP(hone|ad|od)/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
const $=s=>document.querySelector(s),au=$('#au'),list=$('#tracks'),wf=$('#wf'),viz=$('#viz'),pp=$('#pp'),tt=$('#ptitle'),tc=$('#pcap'),tm=$('#ptime'),pl=$('#player');
let cur=0,peaks={},ctx,an,data,connected=false,raf;
const fmt=s=>isFinite(s)?Math.floor(s/60)+':'+String(Math.floor(s%60)).padStart(2,'0'):'0:00';
T.forEach((t,i)=>{const li=document.createElement('li');li.innerHTML=`<button><span class="n">${String(i+1).padStart(2,'0')}</span><span class="t"><b>${t.en}</b><i>${t.ru}</i></span><span class="m">${t.meta}</span></button>`;li.querySelector('button').onclick=()=>{if(cur===i&&!au.paused){au.pause()}else{load(i);play()}};list.appendChild(li);
fetch('audio/'+t.id+'.json').then(r=>r.json()).then(j=>{peaks[t.id]=j;if(i===cur){drawWF();if(!au.duration)tm.textContent='0:00 / '+fmt(j.duration)}}).catch(()=>{})});
function load(i){if(i===cur&&au.src)return;cur=(i+T.length)%T.length;const t=T[cur];au.src='audio/'+t.id+'.mp3';tt.innerHTML=`${t.en} <span>· ${t.ru}</span>`;tc.innerHTML=`${t.cap}<br><span class="en">${t.capru}</span>`;[...list.children].forEach((li,k)=>li.classList.toggle('on',k===cur));drawWF();ms()}
function setup(){if(connected||iOS)return;try{ctx=ctx||new (window.AudioContext||window.webkitAudioContext)();const src=ctx.createMediaElementSource(au);an=ctx.createAnalyser();an.fftSize=512;an.smoothingTimeConstant=.82;src.connect(an);an.connect(ctx.destination);data=new Uint8Array(an.frequencyBinCount);connected=true}catch(e){an=null}}
function play(){if(!au.src)load(cur);setup();if(ctx&&ctx.state==='suspended')ctx.resume();document.querySelectorAll('video').forEach(v=>v.pause());au.play().catch(()=>{})}
pp.onclick=()=>au.paused?play():au.pause();
$('#pprev').onclick=()=>{if(au.currentTime>3){au.currentTime=0;return}load(cur-1);play()};
$('#pnext').onclick=()=>{load(cur+1);play()};
au.addEventListener('ended',()=>{load(cur+1);play()});
au.addEventListener('play',()=>{pl.classList.add('playing');pp.setAttribute('aria-label','Пауза · Pause');loop()});
au.addEventListener('pause',()=>{pl.classList.remove('playing');pp.setAttribute('aria-label','Играть · Play');cancelAnimationFrame(raf);drawViz(true)});
au.addEventListener('timeupdate',()=>{tm.textContent=fmt(au.currentTime)+' / '+fmt(au.duration||(peaks[T[cur].id]||{}).duration);drawWF();if('mediaSession'in navigator&&au.duration&&navigator.mediaSession.setPositionState)try{navigator.mediaSession.setPositionState({duration:au.duration,position:au.currentTime,playbackRate:1})}catch(e){}});
document.querySelectorAll('video').forEach(v=>v.addEventListener('play',()=>au.pause()));
/* waveform */
function fit(c){const r=c.getBoundingClientRect(),d=Math.min(devicePixelRatio||1,2);if(c.width!==Math.round(r.width*d)){c.width=Math.round(r.width*d);c.height=Math.round(r.height*d)}return c.getContext('2d')}
function drawWF(){const g=fit(wf),W=wf.width,H=wf.height,p=(peaks[T[cur].id]||{}).peaks;g.clearRect(0,0,W,H);if(!p)return;const n=p.length,bw=W/n,pr=au.duration?au.currentTime/au.duration:0;
const gold=g.createLinearGradient(0,0,0,H);gold.addColorStop(0,'#fff4dc');gold.addColorStop(.5,'#e9c27a');gold.addColorStop(1,'#9a6b25');
for(let i=0;i<n;i++){const h=Math.max(2,p[i]*H*.92);g.fillStyle=i/n<=pr?gold:'rgba(233,194,122,.22)';g.fillRect(i*bw+bw*.15,(H-h)/2,bw*.7,h)}}
function seek(e){const r=wf.getBoundingClientRect(),x=((e.touches?e.touches[0].clientX:e.clientX)-r.left)/r.width;if(!au.src)load(cur);const d=au.duration||(peaks[T[cur].id]||{}).duration;if(!d)return;const go=()=>{au.currentTime=Math.max(0,Math.min(1,x))*au.duration;drawWF()};if(au.duration)go();else{au.addEventListener('loadedmetadata',go,{once:true});play()}}
let drag=false;wf.addEventListener('pointerdown',e=>{drag=true;wf.setPointerCapture(e.pointerId);seek(e)});wf.addEventListener('pointermove',e=>{if(drag)seek(e)});wf.addEventListener('pointerup',()=>drag=false);
wf.addEventListener('keydown',e=>{if(!au.duration)return;if(e.key==='ArrowRight')au.currentTime+=5;if(e.key==='ArrowLeft')au.currentTime-=5});
addEventListener('resize',()=>{drawWF();drawViz(true)});
/* visualizer */
function drawViz(idle){const g=fit(viz),W=viz.width,H=viz.height;g.clearRect(0,0,W,H);const N=48,bw=W/N;let vals=[];
if(an&&!idle){an.getByteFrequencyData(data);const L=data.length*.7;for(let i=0;i<N;i++){const a=Math.floor(Math.pow(i/N,1.8)*L)+1,b2=Math.max(a+1,Math.floor(Math.pow((i+1)/N,1.8)*L)+1);let m=0;for(let k=a;k<b2;k++)m=Math.max(m,data[k]);vals.push(Math.pow(m/255,1.4)*(0.75+i/N*.6))}}
else{const p=(peaks[T[cur].id]||{}).peaks||[],pr=au.duration?au.currentTime/au.duration:0,base=p[Math.floor(pr*p.length)]||.3,t=performance.now()/1000;for(let i=0;i<N;i++)vals.push(idle?.04+.03*Math.sin(i*.5):Math.max(.05,base*(.55+.45*Math.sin(t*6.6+i*.7)*Math.cos(t*2.1+i*.23))*(1-Math.abs(i-N/2)/N)))}
for(let i=0;i<N;i++){const h=Math.max(2,vals[i]*H);const gr=g.createLinearGradient(0,H,0,H-h);gr.addColorStop(0,'rgba(154,107,37,.9)');gr.addColorStop(1,i%5==0?'rgba(185,139,255,.9)':'rgba(255,244,220,.95)');g.fillStyle=gr;g.fillRect(i*bw+bw*.2,H-h,bw*.6,h)}}
function loop(){drawViz(false);if(!RM)raf=requestAnimationFrame(loop)}
/* media session */
function ms(){if(!('mediaSession'in navigator))return;const t=T[cur];navigator.mediaSession.metadata=new MediaMetadata({title:t.en+' · '+t.ru,artist:'Dream the Muse',album:'387 → 1052 → ∞',artwork:[{src:'img/vector-spiral.webp',sizes:'933x1400',type:'image/webp'},{src:'img/master-vector-star.webp',sizes:'1080x1080',type:'image/webp'}]})}
if('mediaSession'in navigator){const h=(a,f)=>{try{navigator.mediaSession.setActionHandler(a,f)}catch(e){}};h('play',play);h('pause',()=>au.pause());h('previoustrack',()=>{load(cur-1);play()});h('nexttrack',()=>{load(cur+1);play()});h('seekto',d=>{au.currentTime=d.seekTime})}
load(0);drawViz(true);
})();
