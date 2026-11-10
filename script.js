(function(){
  var WHATS="5514991777788"; // número com DDI+DDD, só dígitos
  var $=function(id){return document.getElementById(id)};
  var brl=new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL",maximumFractionDigits:0});
  var brl3=new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL",minimumFractionDigits:3,maximumFractionDigits:3});
  var num=new Intl.NumberFormat("pt-BR",{maximumFractionDigits:0});
  var brl2=new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL",minimumFractionDigits:2,maximumFractionDigits:2});
  var ids=["veic","pneus","km","pA","vA","pB","vB","comb","red","moA","moB"];
  var summary="";
  

  function v(id){var n=parseFloat($(id).value);return isNaN(n)?0:n}

  // ----- Fabricante e modelo -----
  var catalogo=window.CATALOGO||{};
  function esc(t){return String(t).replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;")}
  function fillBrands(sel){
    var html='<option value="">Selecione o fabricante</option>';
    Object.keys(catalogo).forEach(function(m){html+='<option value="'+esc(m)+'">'+esc(m)+'</option>'});
    html+='<option value="__outra">Outra marca</option>';
    sel.innerHTML=html;
  }
  function fillModels(side){
    var marca=$("m"+side).value, lista=catalogo[marca]||[];
    $("l"+side).innerHTML=lista.map(function(m){return '<option value="'+esc(m)+'">'}).join("");
    $("mo"+side).placeholder=marca==="__outra"?"Digite marca e modelo":(lista.length?"Escolha ou digite o modelo":"Digite o modelo");
  }
  function nome(side,padrao){
    var marca=$("m"+side).value, modelo=$("mo"+side).value.trim();
    if(marca==="__outra"||!marca)marca="";
    var n=(marca+" "+modelo).trim();
    return n||padrao;
  }
  ["A","B"].forEach(function(s){
    fillBrands($("m"+s));
    $("m"+s).addEventListener("change",function(){$("mo"+s).value="";fillModels(s);calc()});
    fillModels(s);
  });

  // ----- Cálculo -----
  function calc(){
    var veic=v("veic"),pn=v("pneus"),km=v("km"),pA=v("pA"),vA=v("vA"),pB=v("pB"),vB=v("vB"),comb=v("comb"),red=v("red");
    var bad=!(veic>0&&pn>0&&km>0&&vA>0&&vB>0);
    $("msg").hidden=!bad;$("out").hidden=bad;
    if(bad)return;

    var nA=nome("A","Pneu atual"), nB=nome("B","Pneu proposto");
    var kA=pA/vA,kB=pB/vB;
    var kmAno=veic*pn*km*12;            // km acumulados de todos os pneus no ano
    var anoA=kA*kmAno,anoB=kB*kmAno;
    var fuel=comb*veic*(red/100)*12;
    var saving=(anoA-anoB)+fuel;
    var pct=anoA>0?((anoA-anoB)/anoA)*100:0;
    var trocaA=kmAno/vA,trocaB=kmAno/vB;

    var neg=saving<0;
    $("res").className="card result"+(neg?" neg":"");
    $("big").textContent=(neg?"− ":"")+brl.format(Math.abs(saving));
    $("sub").textContent=neg?"a mais por ano com o pneu proposto":"de economia por ano"+(fuel>0?" (pneus + combustível)":"");

    var max=Math.max(anoA,anoB,1);
    $("fA").style.width=(anoA/max*100)+"%";
    $("fB").style.width=(anoB/max*100)+"%";
    $("nA").textContent=nA;$("nB").textContent=nB;
    $("cA").textContent=brl.format(anoA)+" / ano";
    $("cB").textContent=brl.format(anoB)+" / ano";
    $("kA").textContent=brl3.format(kA);
    $("kB").textContent=brl3.format(kB);
    $("pct").textContent=(pct>=0?"":"− ")+Math.abs(pct).toFixed(1).replace(".",",")+"%";
    $("troca").textContent=num.format(trocaA-trocaB);

    // Custo a cada 1.000 km: CPK x 1000, por pneu, por veículo e pela frota inteira
    var porMil=[kA*1000,kB*1000];
    var mult=[1,pn,pn*veic];
    var rot=["Por pneu","Por veículo ("+num.format(pn)+" pneus)","Frota ("+num.format(veic)+" veículos)"];
    for(var n=0;n<3;n++){
      var ca=porMil[0]*mult[n],cb=porMil[1]*mult[n],d=ca-cb;
      $("lb"+(n+1)).textContent=rot[n];
      $("ma"+(n+1)).textContent=brl2.format(ca);
      $("mb"+(n+1)).textContent=brl2.format(cb);
      var cel=$("md"+(n+1));
      cel.textContent=(d<0?"− ":"")+brl2.format(Math.abs(d)); // economia positiva; negativo só se o proposto custar mais
      cel.className=d>0?"gain":d<0?"loss":"";
    }

    summary="Simulação de economia de frota\n"+
      "Frota: "+num.format(veic)+" veículos, "+num.format(pn)+" pneus cada, "+num.format(km)+" km/mês\n"+
      "Atual: "+nA+" | CPK "+brl3.format(kA)+"\n"+
      "Proposto: "+nB+" | CPK "+brl3.format(kB)+"\n"+
      "Custo a cada 1.000 km (por pneu): "+brl2.format(kA*1000)+" → "+brl2.format(kB*1000)+"\n"+
      "Custo anual com pneus: "+brl.format(anoA)+" → "+brl.format(anoB)+"\n"+
      (neg?"Diferença anual: ":"Economia estimada por ano: ")+brl.format(Math.abs(saving));
    $("zap").href="https://wa.me/"+WHATS+"?text="+encodeURIComponent("Olá! Fiz a simulação de economia para minha frota e quero uma proposta.\n\n"+summary);
  }

  ids.forEach(function(id){$(id).addEventListener("input",calc)});
  $("copy").addEventListener("click",function(){
    var b=$("copy");
    function done(){b.textContent="Resumo copiado";setTimeout(function(){b.textContent="Copiar resumo"},1800)}
    try{navigator.clipboard.writeText(summary).then(done,function(){})}catch(e){}
  });
  calc();
})();
