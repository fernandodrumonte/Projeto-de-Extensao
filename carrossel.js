(function(){
  var box=document.getElementById("carrossel");
  if(!box)return;
  var slides=box.querySelectorAll(".slide");
  var dots=box.querySelector(".dots");
  var TEMPO=5000;   // tempo de cada imagem, em milissegundos
  var i=0,timer=null,x0=null;
  var reduz=window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  slides.forEach(function(_,n){
    var b=document.createElement("button");
    b.type="button";
    b.setAttribute("aria-label","Ir para a imagem "+(n+1));
    b.addEventListener("click",function(){ir(n);auto()});
    dots.appendChild(b);
  });

  function ir(n){
    i=(n+slides.length)%slides.length;
    slides.forEach(function(s,k){s.classList.toggle("ativo",k===i)});
    Array.prototype.forEach.call(dots.children,function(d,k){
      if(k===i)d.setAttribute("aria-current","true");else d.removeAttribute("aria-current");
    });
  }
  function parar(){clearInterval(timer)}
  function auto(){
    parar();
    if(reduz||slides.length<2)return;
    timer=setInterval(function(){ir(i+1)},TEMPO);
  }

  box.querySelector(".prev").addEventListener("click",function(){ir(i-1);auto()});
  box.querySelector(".next").addEventListener("click",function(){ir(i+1);auto()});
  box.addEventListener("mouseenter",parar);
  box.addEventListener("mouseleave",auto);
  box.addEventListener("focusin",parar);
  box.addEventListener("focusout",auto);
  box.addEventListener("touchstart",function(e){x0=e.touches[0].clientX},{passive:true});
  box.addEventListener("touchend",function(e){
    if(x0===null)return;
    var dx=e.changedTouches[0].clientX-x0;
    if(Math.abs(dx)>40){ir(dx<0?i+1:i-1);auto()}
    x0=null;
  });

  ir(0);auto();
})();
