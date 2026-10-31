(()=>{
const RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
/* starfield */
const cv=document.getElementById('stars'),cx=cv.getContext('2d');let W,H,S=[],DPR=Math.min(devicePixelRatio||1,2);
function rs(){W=cv.width=innerWidth*DPR;H=cv.height=innerHeight*DPR;const n=Math.min(220,Math.round(innerWidth*innerHeight/5200));S=[];for(let i=0;i<n;i++)S.push({x:Math.random()*W,y:Math.random()*H,z:Math.random()*.8+.2,r:Math.random()*1.3+.2,t:Math.random()*6.28,g:Math.random()<.18})}
rs();addEventListener('resize',rs);let sy=0,last=0;
function draw(ts){cx.clearRect(0,0,W,H);const dy=(scrollY-sy);sy+=dy*.08;for(const s of S){s.t+=.015;s.y-=.06*s.z*DPR;if(s.y<0){s.y=H;s.x=Math.random()*W}const y=((s.y-sy*s.z*.25*DPR)%H+H)%H,a=.35+.45*Math.sin(s.t)*.5+.3;cx.globalAlpha=Math.max(0,Math.min(1,a*s.z));cx.fillStyle=s.g?'#f4d292':'#e8e4ff';cx.beginPath();cx.arc(s.x,y,s.r*DPR,0,6.28);cx.fill()}if(!RM)requestAnimationFrame(draw)}
requestAnimationFrame(draw);
/* nav + parallax */
const nav=document.querySelector('nav'),halo=document.querySelector('.halo'),hw=document.querySelector('.hero .wrap');
addEventListener('scroll',()=>{const y=scrollY;nav.classList.toggle('solid',y>40);if(!RM&&y<innerHeight*1.2){halo.style.marginTop=(y*.35)+'px';hw.style.transform=`translateY(${y*.18}px)`;hw.style.opacity=Math.max(0,1-y/(innerHeight*.8))}},{passive:true});
/* reveal + active nav + formula */
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in','on');io.unobserve(e.target)}}),{threshold:.12,rootMargin:'0px 0px -6% 0px'});
document.querySelectorAll('.rv,.formula').forEach(el=>io.observe(el));
const links=[...document.querySelectorAll('nav a')];const so=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)links.forEach(a=>a.classList.toggle('act',a.getAttribute('href')=='#'+e.target.id))}),{rootMargin:'-45% 0px -50% 0px'});
document.querySelectorAll('section[id]').forEach(s=>so.observe(s));
/* lightbox with swipe */
const lb=document.getElementById('lb'),li=lb.querySelector('img'),lp=lb.querySelector('p'),lc=lb.querySelector('.ct');
const items=[...document.querySelectorAll('[data-lb]')];let cur=0;
function show(i){cur=(i+items.length)%items.length;const el=items[cur];li.style.opacity=0;const src=el.dataset.full||el.currentSrc||el.src;const im=new Image();im.onload=()=>{li.src=src;li.style.opacity=1};im.src=src;lp.textContent=el.dataset.cap||el.alt||'';lc.textContent=(cur+1)+' / '+items.length}
function open(i){show(i);lb.classList.add('on');document.documentElement.style.overflow='hidden'}
function close(){lb.classList.remove('on');document.documentElement.style.overflow=''}
items.forEach((el,i)=>el.addEventListener('click',()=>open(i)));
lb.querySelector('.x').onclick=close;lb.querySelector('.pv').onclick=e=>{e.stopPropagation();show(cur-1)};lb.querySelector('.nx').onclick=e=>{e.stopPropagation();show(cur+1)};
lb.addEventListener('click',e=>{if(e.target===lb)close()});
addEventListener('keydown',e=>{if(!lb.classList.contains('on'))return;if(e.key=='Escape')close();if(e.key=='ArrowRight')show(cur+1);if(e.key=='ArrowLeft')show(cur-1)});
let tx=0,ty=0;lb.addEventListener('touchstart',e=>{tx=e.touches[0].clientX;ty=e.touches[0].clientY},{passive:true});
lb.addEventListener('touchend',e=>{const dx=e.changedTouches[0].clientX-tx,dy=e.changedTouches[0].clientY-ty;if(Math.abs(dx)>50&&Math.abs(dx)>Math.abs(dy))show(cur+(dx<0?1:-1));else if(dy>90)close()},{passive:true});
/* only one video at a time */
document.querySelectorAll('video').forEach(v=>v.addEventListener('play',()=>document.querySelectorAll('video').forEach(o=>{if(o!==v)o.pause()})));
/* easter egg: tap 387 seven times */
const k=document.getElementById('k387'),egg=document.getElementById('egg');let n=0,tm;
k.addEventListener('click',()=>{n++;k.classList.add('tick');setTimeout(()=>k.classList.remove('tick'),150);clearTimeout(tm);tm=setTimeout(()=>n=0,2500);if(n>=7){n=0;egg.classList.add('on');if(navigator.vibrate)navigator.vibrate([30,60,30])}});
egg.addEventListener('click',()=>egg.classList.remove('on'));
})();
