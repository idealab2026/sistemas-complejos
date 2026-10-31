import {verify,score,calibration} from "./metrics.mjs";
const $=id=>document.getElementById(id),NS="http://www.w3.org/2000/svg";
function textNode(tag,content,cls){const el=document.createElement(tag);if(content!==undefined)el.textContent=content;if(cls)el.className=cls;return el;}
function svgNode(tag,attrs={},value){const el=document.createElementNS(NS,tag);for(const [k,v] of Object.entries(attrs))el.setAttribute(k,v);if(value!==undefined)el.textContent=value;return el;}
function studies(data){
 const grid=$("studies-grid");grid.replaceChildren();
 for(const s of data.studies){
  const box=textNode("article",undefined,"panel"),top=textNode("div",undefined,"panel-top");
  top.append(textNode("span",s.domain,"label"),textNode("span",s.status,"chip"));box.append(top,textNode("h3",s.title),textNode("p",s.question));
  box.append(textNode("span","Horizonte: "+s.horizon,"label"));
  const p=textNode("p");p.append(textNode("strong","Método: "),document.createTextNode(s.method));box.append(p);
  const caution=textNode("p");caution.append(textNode("strong","Límite: "),document.createTextNode(s.limits));box.append(caution);grid.append(box);
 }
}
function branches(data){
 const grid=$("branches-grid");grid.replaceChildren();
 for(const b of data.branches){
  const card=textNode("article",undefined,"panel"),head=textNode("div",undefined,"panel-top");
  head.append(textNode("h3",b.name),textNode("span",Math.round(b.weight*100)+" % supuesto","chip"));card.append(head);
  const bar=document.createElement("div");bar.style.cssText="height:9px;background:#e6ebef;border-radius:8px;margin:1rem 0;overflow:hidden";
  const fill=document.createElement("div");fill.style.cssText="height:100%;background:#19376d;border-radius:8px;width:"+Math.round(b.weight*100)+"%";bar.append(fill);card.append(bar);
  const m=textNode("p");m.append(textNode("strong","Mecanismo: "),document.createTextNode(b.mechanism));card.append(m);
  const w=textNode("p");w.append(textNode("strong","Señal a vigilar: "),document.createTextNode(b.watch));card.append(w);grid.append(card);
 }
}
function chart(s){
 const svg=$("prob-chart");svg.replaceChildren();
 const p=s.probabilities,n=p.length,x=i=>65+i*130/(n-1)*5,y=v=>240-190*v;
 [0,.25,.5,.75,1].forEach(v=>{svg.append(svgNode("line",{x1:65,x2:735,y1:y(v),y2:y(v),stroke:"#e1e7ee"}),svgNode("text",{x:13,y:y(v)+4,"font-size":12,fill:"#6c7e94"},Math.round(v*100)+"%"));});
 svg.append(svgNode("line",{x1:65,x2:735,y1:y(s.baseline),y2:y(s.baseline),stroke:"#bc9850","stroke-dasharray":"5 5","stroke-width":2}));
 svg.append(svgNode("polyline",{points:p.map((v,i)=>x(i)+","+y(v)).join(" "),fill:"none",stroke:"#19376d","stroke-width":3,"stroke-linecap":"round","stroke-linejoin":"round"}));
 p.forEach((v,i)=>{
  svg.append(svgNode("circle",{cx:x(i),cy:y(v),r:5,fill:"#19376d"}));
  svg.append(svgNode("circle",{cx:x(i),cy:y(s.outcomes[i]),r:5,fill:"#2f8c78",stroke:"white","stroke-width":2}));
  svg.append(svgNode("text",{x:x(i),y:265,"text-anchor":"middle","font-size":12,fill:"#63758c"},s.issued[i]));
 });
 $("figure-title").textContent=s.title;
 $("figure-note").textContent="Azul: probabilidades ficticias. Verde: desenlaces inventados (0 o 1). Línea discontinua: referencia fija.";
}
function evaluation(s){
 const m=score(s);$("detail-title").textContent=s.title;$("detail-question").textContent=s.question;
 $("detail-brier").textContent=m.brier.toFixed(3);$("detail-baseline").textContent=m.baselineBrier.toFixed(3);
 $("detail-skill").textContent=m.skill===null?"N/D":(100*m.skill).toFixed(1)+" %";chart(s);
 const body=$("eval-rows");body.replaceChildren();
 for(const r of calibration(s)){const tr=textNode("tr");for(const [val,cls] of [[r.issued,""],[(100*r.p).toFixed(0)+" %","number"],[(100*s.baseline).toFixed(0)+" %","number"],[String(r.y),"number"]])tr.append(textNode("td",val,cls));body.append(tr);}
}
async function main(){
 const res=await fetch("./data/demo.json",{cache:"no-store"});if(!res.ok)throw Error("Data unavailable");
 const data=await res.json();verify(data);
 $("stat-studies").textContent=data.studies.length;$("stat-obs").textContent=data.studies.reduce((a,s)=>a+s.outcomes.length,0);$("stat-branches").textContent=data.branches.length;
 studies(data);branches(data);const select=$("study-select");for(const s of data.studies){const op=textNode("option",s.title);op.value=s.id;select.append(op);}
 evaluation(data.studies[0]);select.addEventListener("change",()=>evaluation(data.studies.find(s=>s.id===select.value)||data.studies[0]));
}
main().catch(()=>{$("figure-note").textContent="La muestra sintética no está disponible o ha fallado la validación.";});
