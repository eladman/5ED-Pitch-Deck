(function(){
"use strict";
var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
var LOGO_SRC = document.querySelector('.nav-brand img').src;
// every deck is Hebrew/RTL except /US (English, dir="ltr") — mirror the few
// direction-dependent behaviours (hero logo side, arrow keys) off this flag
var LTR = document.documentElement.dir === 'ltr';

/* ================= HERO: particle logo (three.js) ================= */
// three.js only logs (doesn't throw) when it can't get a WebGL context, so
// probe for one first — otherwise the hero silently renders nothing on
// machines without GPU acceleration. Matters most on the public landing page.
function webglAvailable(){
  try{
    var c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext &&
      (c.getContext('webgl') || c.getContext('experimental-webgl')));
  }catch(e){ return false; }
}

function initHero(){
  var container = document.getElementById('hero-canvas');
  if(!container) return;
  if(!window.THREE || !webglAvailable()){
    var im = document.createElement('img');
    im.src = LOGO_SRC; im.alt = '';
    im.style.cssText = 'position:absolute;'+(LTR?'right':'left')+':8%;top:50%;transform:translateY(-50%);height:min(60vh,480px);opacity:.16;filter:drop-shadow(0 0 40px rgba(239,125,0,.6))';
    container.appendChild(im);
    return;
  }

  var W = container.clientWidth, H = container.clientHeight;
  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(50, W/H, 1, 2000);
  camera.position.z = 420;
  var renderer = new THREE.WebGLRenderer({alpha:true, antialias:false});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
  renderer.setSize(W,H);
  container.appendChild(renderer.domElement);

  var img = new Image();
  img.src = LOGO_SRC;
  img.onload = function(){
    var isMobile = W < 760;
    var sw = 100, sh = Math.round(sw * img.height / img.width);
    var cv = document.createElement('canvas');
    cv.width = sw; cv.height = sh;
    var cx = cv.getContext('2d');
    cx.drawImage(img,0,0,sw,sh);
    var data = cx.getImageData(0,0,sw,sh).data;

    var targets = [];
    var step = isMobile ? 2 : 1;
    for(var y=0;y<sh;y+=step){
      for(var x=0;x<sw;x+=step){
        if(data[(y*sw+x)*4+3] > 120){
          targets.push({x:x, y:y});
        }
      }
    }
    var count = targets.length;
    var scale = (isMobile ? 2.0 : 3.1);
    // position logo: desktop -> the side opposite the text (left in RTL, right in LTR), mobile -> faint centered behind
    var worldW = 2*Math.tan(camera.fov*Math.PI/360)*camera.position.z*camera.aspect;
    var offsetX = isMobile ? 0 : (LTR ? 1 : -1)*worldW*0.26;
    var offsetY = isMobile ? 30 : 0;

    var positions = new Float32Array(count*3);
    var colors = new Float32Array(count*3);
    var homes = new Float32Array(count*3);
    var seeds = new Float32Array(count);
    var col = new THREE.Color();

    for(var i=0;i<count;i++){
      var t = targets[i];
      var hx = (t.x - sw/2)*scale + offsetX;
      var hy = -(t.y - sh/2)*scale + offsetY;
      var hz = 0;
      homes[i*3]=hx; homes[i*3+1]=hy; homes[i*3+2]=hz;
      // start scattered
      positions[i*3]   = (Math.random()-0.5)*worldW*1.4;
      positions[i*3+1] = (Math.random()-0.5)*900;
      positions[i*3+2] = (Math.random()-0.5)*600;
      seeds[i] = Math.random()*Math.PI*2;
      // orange with variation
      var l = 0.5 + Math.random()*0.16;
      col.setHSL(0.087, 1.0, l);
      colors[i*3]=col.r; colors[i*3+1]=col.g; colors[i*3+2]=col.b;
    }

    var geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions,3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors,3));
    var mat = new THREE.PointsMaterial({
      size: isMobile ? 3.2 : 2.6,
      vertexColors: true,
      transparent: true,
      opacity: isMobile ? 0.5 : 0.9,
      depthWrite:false,
      blending: THREE.AdditiveBlending
    });
    var points = new THREE.Points(geo, mat);
    scene.add(points);

    // ambient background dust
    var dustCount = isMobile? 60 : 140;
    var dpos = new Float32Array(dustCount*3);
    for(var d=0; d<dustCount; d++){
      dpos[d*3]=(Math.random()-0.5)*worldW*1.3;
      dpos[d*3+1]=(Math.random()-0.5)*800;
      dpos[d*3+2]=(Math.random()-0.5)*400-100;
    }
    var dgeo = new THREE.BufferGeometry();
    dgeo.setAttribute('position', new THREE.BufferAttribute(dpos,3));
    var dust = new THREE.Points(dgeo, new THREE.PointsMaterial({size:1.6,color:0x3a4356,transparent:true,opacity:.6,depthWrite:false}));
    scene.add(dust);

    var mouse = {x:9999,y:9999}, assembled = {t:0};
    var raycastPlane = new THREE.Vector2();

    container.parentElement.addEventListener('pointermove', function(e){
      var r = renderer.domElement.getBoundingClientRect();
      var nx = ((e.clientX - r.left)/r.width)*2-1;
      var ny = -((e.clientY - r.top)/r.height)*2+1;
      var worldH = 2*Math.tan(camera.fov*Math.PI/360)*camera.position.z;
      mouse.x = nx * worldH * camera.aspect / 2;
      mouse.y = ny * worldH / 2;
      raycastPlane.set(nx,ny);
    });
    container.parentElement.addEventListener('pointerleave', function(){ mouse.x=9999; mouse.y=9999; });

    if(prefersReduced){ assembled.t = 1; }
    else {
      gsap.to(assembled, {t:1, duration:2.6, ease:'power3.inOut', delay:.3});
    }

    var clock = new THREE.Clock();
    function tick(){
      var time = clock.getElapsedTime();
      var pos = geo.attributes.position.array;
      var tt = assembled.t;
      for(var i=0;i<count;i++){
        var ix=i*3;
        var hx=homes[ix], hy=homes[ix+1];
        // gentle breathing when formed
        var s = seeds[i];
        var bx = Math.sin(time*0.7 + s)*1.6;
        var by = Math.cos(time*0.9 + s*1.3)*1.6;
        var txp = hx + bx, typ = hy + by, tzp = Math.sin(time*.5+s)*4;
        // mouse repulsion
        var dx = txp - mouse.x, dy = typ - mouse.y;
        var dist2 = dx*dx+dy*dy;
        var R = 5200;
        if(dist2 < R){
          var f = (1 - dist2/R);
          var d = Math.sqrt(dist2)||1;
          txp += (dx/d)*f*46;
          typ += (dy/d)*f*46;
        }
        // lerp: from scattered start to target as tt grows, then keep chasing target
        pos[ix]   += ((txp - pos[ix]) * (0.02 + 0.09*tt));
        pos[ix+1] += ((typ - pos[ix+1]) * (0.02 + 0.09*tt));
        pos[ix+2] += ((tzp - pos[ix+2]) * (0.02 + 0.09*tt));
      }
      geo.attributes.position.needsUpdate = true;
      dust.rotation.y = time*0.02;
      points.rotation.y = Math.sin(time*0.12)*0.04;
      renderer.render(scene,camera);
      requestAnimationFrame(tick);
    }
    tick();

    window.addEventListener('resize', function(){
      W = container.clientWidth; H = container.clientHeight;
      camera.aspect = W/H; camera.updateProjectionMatrix();
      renderer.setSize(W,H);
    });

    // scroll parallax fade of hero canvas
    if(window.gsap && window.ScrollTrigger){
      gsap.to(container, {opacity:.12, y:120, ease:'none',
        scrollTrigger:{trigger:container.closest('section'), start:'top top', end:'bottom top', scrub:true}});
    }
  };
}
try{ initHero(); }catch(e){ /* WebGL unavailable — hero degrades, rest of deck continues */ }

/* ================= reach field (direction A) ================= */
(function(){
  var field = document.getElementById('reach-field');
  if(!field) return;
  var TOTAL = 48;                 // 12 x 4 grid
  var seeds = {5:1, 6:1, 17:1, 18:1}; // the few already reached (dim)
  for(var i=0;i<TOTAL;i++){
    var d = document.createElement('span');
    d.className = 'rf-dot' + (seeds[i] ? ' seed' : '');
    field.appendChild(d);
  }
})();

/* ================= no-GSAP fallback ================= */
if(!(window.gsap && window.ScrollTrigger)){
  document.querySelectorAll('.reveal').forEach(function(el){el.style.opacity=1;el.style.transform='none';});
  document.querySelectorAll('.chain-line i').forEach(function(el){el.style.transform='none';});
  document.querySelectorAll('.cost-bars .bar').forEach(function(el){el.style.transform='none';});
  document.querySelectorAll('.f-bar').forEach(function(el){el.style.width=el.dataset.w+'%';});
  document.querySelectorAll('.count').forEach(function(el){el.textContent=(+el.dataset.to).toLocaleString('en-US');});
  document.querySelectorAll('.rf-dot').forEach(function(el){el.classList.add('on');});
  document.querySelectorAll('.dose-base,.dose-boost').forEach(function(el){el.style.width=el.dataset.w+'%';});
  document.querySelectorAll('.dnum').forEach(function(el){el.textContent=el.dataset.to;});
  var nv=document.getElementById('nav');
  window.addEventListener('scroll',function(){nv.classList.toggle('scrolled',window.scrollY>60);},{passive:true});
}

/* ================= GSAP scroll ================= */
if(window.gsap && window.ScrollTrigger){
  gsap.registerPlugin(ScrollTrigger);

  // progress bar
  gsap.to('#progress',{width:'100%',ease:'none',
    scrollTrigger:{trigger:document.body,start:'top top',end:'bottom bottom',scrub:.3}});

  // nav bg
  ScrollTrigger.create({start:60, onUpdate:function(self){
    document.getElementById('nav').classList.toggle('scrolled', self.scroll()>60);
  }});

  // hero intro
  if(!prefersReduced){
    gsap.from('.hero-title .fade-line',{y:60,opacity:0,duration:1.1,stagger:.14,ease:'power3.out',delay:.2});
  } else {
    gsap.set('.hero-title .fade-line',{opacity:1});
  }

  // generic reveals
  gsap.utils.toArray('.reveal').forEach(function(el){
    gsap.to(el,{opacity:1,y:0,duration:prefersReduced?0.01:0.9,ease:'power3.out',
      scrollTrigger:{trigger:el,start:'top 86%'}});
  });

  // chain lines
  gsap.utils.toArray('.chain-line i').forEach(function(el){
    gsap.to(el,{scaleX:1,scaleY:1,duration:.8,ease:'power2.out',
      scrollTrigger:{trigger:el.closest('.chain-step'),start:'top 82%'}});
  });

  // cost bars
  gsap.utils.toArray('.cost-bars .bar').forEach(function(el,i){
    gsap.to(el,{scaleY:1,duration:1.2,delay:i*.25,ease:'power3.out',
      scrollTrigger:{trigger:'.cost-chart',start:'top 75%'}});
  });

  // market funnel bars
  gsap.utils.toArray('.f-bar').forEach(function(el){
    gsap.to(el,{width:el.dataset.w+'%',duration:1.3,ease:'power3.out',
      scrollTrigger:{trigger:el,start:'top 85%'}});
  });

  // counters
  gsap.utils.toArray('.count').forEach(function(el){
    var to = parseFloat(el.dataset.to);
    var obj = {v:0};
    gsap.to(obj,{v:to,duration:1.8,ease:'power2.out',
      scrollTrigger:{trigger:el,start:'top 88%'},
      onUpdate:function(){ el.textContent = Math.round(obj.v).toLocaleString('en-US'); }});
  });

  // strategy · direction A — reach field lights up (scale to many)
  document.querySelectorAll('.reach-field').forEach(function(field){
    var dots = Array.prototype.slice.call(field.querySelectorAll('.rf-dot'));
    ScrollTrigger.create({trigger:field,start:'top 80%',once:true,onEnter:function(){
      dots.forEach(function(d,i){ setTimeout(function(){ d.classList.add('on'); }, i*(prefersReduced?0:20)); });
    }});
  });

  // strategy · direction B — dose bar fills 80% -> 90%
  gsap.utils.toArray('.dose-base,.dose-boost').forEach(function(el,i){
    gsap.to(el,{width:el.dataset.w+'%',duration:1.1,delay:i*.35,ease:'power3.out',
      scrollTrigger:{trigger:'.dose',start:'top 82%'}});
  });

  // strategy · delta counters (0->10, 80->90)
  gsap.utils.toArray('.dnum').forEach(function(el){
    var from = parseFloat(el.dataset.from), to = parseFloat(el.dataset.to);
    var obj = {v:from};
    gsap.to(obj,{v:to,duration:1.4,ease:'power2.out',
      scrollTrigger:{trigger:el,start:'top 88%'},
      onUpdate:function(){ el.textContent = Math.round(obj.v); }});
  });


  // convergence lines draw
  document.querySelectorAll('#conv-svg .c-line').forEach(function(l,i){
    var len=l.getTotalLength();
    l.style.strokeDasharray=len; l.style.strokeDashoffset=len;
    gsap.to(l,{strokeDashoffset:0,duration:1.1,delay:i*.25,ease:'power2.out',
      scrollTrigger:{trigger:'#s4',start:'top 60%'}});
  });
  // card tilt micro-interaction (desktop only)
  if(matchMedia('(pointer:fine)').matches && !prefersReduced){
    gsap.utils.toArray('.card,.layer').forEach(function(card){
      card.addEventListener('pointermove', function(e){
        var r = card.getBoundingClientRect();
        var rx = ((e.clientY-r.top)/r.height - .5)*-5;
        var ry = ((e.clientX-r.left)/r.width - .5)*5;
        gsap.to(card,{rotateX:rx,rotateY:ry,transformPerspective:800,duration:.4,ease:'power2.out'});
      });
      card.addEventListener('pointerleave', function(){
        gsap.to(card,{rotateX:0,rotateY:0,duration:.6,ease:'power3.out'});
      });
    });
  }
}

/* ================= light / dark theme toggle ================= */
(function(){
  var btn = document.getElementById('theme-toggle');
  if(!btn) return;
  function sync(){
    btn.setAttribute('aria-pressed', document.documentElement.classList.contains('light') ? 'true' : 'false');
  }
  btn.addEventListener('click', function(){
    var light = document.documentElement.classList.toggle('light');
    try{ localStorage.setItem('deck-theme', light ? 'light' : 'dark'); }catch(e){}
    sync();
  });
  sync();
})();

/* ================= deck navigation =================
   Skipped entirely on the landing page (`/`), which reuses this file for the
   hero particles, reveals and counters but has no slides / rail / counter. */
var slides = Array.prototype.slice.call(document.querySelectorAll('section.slide'));
var rail = document.getElementById('rail');
var countEl = document.getElementById('slide-count');
var current = 0;
if(slides.length && rail && countEl){
slides.forEach(function(s,i){
  var b=document.createElement('button');
  b.setAttribute('aria-label',(LTR?'Slide ':'שקף ')+(i+1));
  b.addEventListener('click',function(){go(i)});
  rail.appendChild(b);
});
function pad2(n){return (n<10?'0':'')+n}
function setCurrent(i){
  current=i;
  countEl.innerHTML='<b>'+pad2(i+1)+'</b> / '+pad2(slides.length);
  var bs=rail.querySelectorAll('button');
  for(var j=0;j<bs.length;j++) bs[j].classList.toggle('active',j===i);
}
function go(i){
  i=Math.max(0,Math.min(slides.length-1,i));
  setCurrent(i);
  slides[i].scrollIntoView({behavior: prefersReduced?'auto':'smooth'});
}
setCurrent(0);
var io = new IntersectionObserver(function(es){
  es.forEach(function(e){ if(e.isIntersecting) setCurrent(slides.indexOf(e.target)); });
},{threshold:0.5});
slides.forEach(function(s){io.observe(s)});
document.addEventListener('keydown',function(e){
  if(e.target && e.target.matches && e.target.matches('input,textarea')) return;
  var k=e.key;
  // reading direction decides which horizontal arrow means "next"
  var fwd = LTR ? 'ArrowRight' : 'ArrowLeft', back = LTR ? 'ArrowLeft' : 'ArrowRight';
  if(k===fwd||k==='ArrowDown'||k===' '||k==='PageDown'){ e.preventDefault(); go(current+1); }
  else if(k===back||k==='ArrowUp'||k==='PageUp'){ e.preventDefault(); go(current-1); }
  else if(k==='Home'){ e.preventDefault(); go(0); }
  else if(k==='End'){ e.preventDefault(); go(slides.length-1); }
});
var hint=document.getElementById('kbd-hint');
setTimeout(function(){ if(hint) hint.style.opacity=0; },8000);
}

/* ================= product loop <-> cards sync ================= */
function syncLoop(sel, other){
  document.querySelectorAll(sel).forEach(function(el){
    el.addEventListener('mouseenter',function(){
      document.querySelectorAll(other).forEach(function(o){o.classList.toggle('hi',o.dataset.l===el.dataset.l)});
    });
    el.addEventListener('mouseleave',function(){
      document.querySelectorAll(other).forEach(function(o){o.classList.remove('hi')});
    });
  });
}
syncLoop('#loop-svg g.lg','.layer-mini .lm');
syncLoop('.layer-mini .lm','#loop-svg g.lg');

})();
