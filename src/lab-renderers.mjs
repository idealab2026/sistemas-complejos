// Public visualizations of research concepts using only synthetic, in-memory inputs.
import {renderVerifiedGeometry} from "./markov-svg.mjs";
import {mountScientificNetwork} from "./neural.mjs";

const escape=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const TRACK=["V1","V2","V3","V4"];
export const TRANSITIONS=Object.freeze([
 Object.freeze([0.91,0.09,0,0]),
 Object.freeze([0,0,0.27,0.73]),
 Object.freeze([0.86,0.14,0,0]),
 Object.freeze([0,0,0.19,0.81])
]);
const STATE_LABELS=["00 · Bajo → bajo","01 · Entrada","10 · Salida","11 · Persistencia"];

export function scientificNeuralPanel(programs,selectedId) {
 if(!Array.isArray(programs)||programs.length!==4)throw new Error("FOUR_TRACKS_REQUIRED");
 return '<section class="panel science-neural-panel" aria-label="Mapa neuronal animado de investigación">'+
 '<div class="viz-heading"><div><div class="eyebrow">LABORATORIO / CUATRO VERTIENTES</div><h3>Red neuronal de investigación</h3></div>'+
 '<span class="viz-label">GEOMETRÍA CONCEPTUAL · NO DATOS CLÍNICOS NI RED ENTRENADA</span></div>'+
 '<div class="neural-stage" data-science-neural>'+
 '<canvas class="neural-canvas" aria-hidden="true"></canvas><div class="neural-grid" aria-hidden="true"></div>'+
 '<span class="neural-crosshair" aria-hidden="true">+</span>'+
 programs.map((p,i)=>'<button class="neural-orb" type="button" data-action="program" data-value="'+escape(p.id)+
 '" data-track="'+TRACK[i]+'" aria-pressed="'+String(selectedId===p.id)+'">'+
 '<span class="orb-sphere" aria-hidden="true"><span>'+TRACK[i]+'</span></span>'+
 '<strong>'+escape(p.name)+'</strong></button>').join("")+
 '<div class="neural-signature"><span>IDEA LAB</span><small>INVESTIGACIÓN · SISTEMAS COMPLEJOS</small></div>'+
 '<button type="button" data-motion-toggle class="motion-toggle" aria-pressed="false">Pausar movimiento</button></div>'+
 '<p class="viz-foot">Visualización conceptual de cuatro líneas de investigación. No representa una red neuronal entrenada ni resultados predictivos.</p></section>';
}

export function enableScientificNeural(root,programs,selectedId){
 const stage=root?.querySelector("[data-science-neural]");
 if(!stage)return ()=>{};
 const selected=Math.max(0,programs.findIndex(p=>p.id===selectedId));
 return mountScientificNetwork(stage,{activeTrack:TRACK[selected]});
}

export function syntheticFourStateModel(periods=6){
 if(!Number.isInteger(periods)||periods<1||periods>10)throw new Error("INVALID_HORIZON");
 let distribution=[1,0,0,0];const levels=[{year:"T0",distribution:[...distribution],flows:[]}];
 for(let step=1;step<=periods+1;step++){
  const flows=[],next=[0,0,0,0];
  for(let from=0;from<4;from++)for(let to=0;to<4;to++){
   const conditional=TRANSITIONS[from][to],mass=distribution[from]*conditional;
   if(mass>0)flows.push({from,to,conditional,mass});
   next[to]+=mass;
  }
  distribution=next;levels.push({year:"T+"+step,distribution:[...distribution],flows});
 }
 return {origin:1,cutoff:-1,maxHorizon:periods,country:{name:"Ejemplo sintético"},initial:0,
  levels,states:STATE_LABELS,observedStates:[],snapshots:Array.from({length:periods},(_,i)=>({
   endYear:"T+"+(i+2),distribution:levels[i+2].distribution,
   paths:[],interval95:null
  }))};
}

export function scientificMarkovPanel({horizon=4,selection=null}={}){
 const data=syntheticFourStateModel(6);
 if(!Number.isInteger(horizon)||horizon<1||horizon>6)throw new Error("INVALID_SELECTION");
 const graph=renderVerifiedGeometry(data,horizon,selection,false,true);
 const inspection=selection?.kind==="node"?
  "Nodo T+"+selection.level+": "+(STATE_LABELS[selection.state]||"No válido")+" · "+
   new Intl.NumberFormat("es-ES",{style:"percent",maximumFractionDigits:2}).format(data.levels[selection.level]?.distribution[selection.state]??0):
  selection?.kind==="edge"?"Transición seleccionada en el período T+"+selection.level:
  "Inspecciona un nodo o una conexión. Se muestran todos los períodos del mismo origen.";
 return '<section class="panel science-markov-panel" aria-label="Árbol temporal ilustrativo de cuatro estados">'+
 '<div class="viz-heading"><div><div class="eyebrow">ESTRUCTURA GRÁFICA · DEMOSTRACIÓN</div>'+
 '<h3>Árbol temporal de cuatro estados</h3></div><span class="viz-label">MALLA SINTÉTICA · NINGÚN PAÍS REAL</span></div>'+
 '<p>Renderizador SVG: cuatro filas de estados, aristas con probabilidad condicional y flujo, y selección de cada nodo. Las probabilidades se generan aquí exclusivamente para ilustrar la interfaz.</p>'+
 '<div class="future-year-strip">'+Array.from({length:8},(_,i)=>
  '<button type="button" class="future-year-select '+(i===horizon+1?"active":"")+'" data-action="markov-year" data-value="'+(i<=1?1:i-1)+'" aria-pressed="'+String(i===horizon+1)+'">'+
  '<strong>'+ (i?"T+"+i:"T0")+'</strong><small>'+(i===0?"origen":i===1?"puente":i===horizon+1?"inspeccionado":"proyección")+'</small></button>').join("")+'</div>'+
 '<div class="future-graph-scroll" data-science-markov>'+graph+'</div>'+
 '<div class="future-selection-note" role="status">'+escape(inspection)+'</div>'+
 '<div class="science-state-legend">'+STATE_LABELS.map((n,i)=>'<span data-state="'+i+'">'+escape(n)+'</span>').join("")+'</div>'+
 '<p class="viz-foot">Demostración con estados y probabilidades sintéticos. No representa información observada ni un pronóstico.</p></section>';
}
