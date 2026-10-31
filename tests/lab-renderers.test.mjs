import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {buildScientificNetwork,createResearchFrameLoop} from "../src/neural.mjs";
import {renderVerifiedGeometry} from "../src/markov-svg.mjs";
import {scientificNeuralPanel,syntheticFourStateModel,scientificMarkovPanel,TRANSITIONS} from "../src/lab-renderers.mjs";
const demo=JSON.parse(readFileSync(new URL("../data/demo.json",import.meta.url),"utf8"));
test("Research network geometry has two lobes and all four conceptual tracks",()=>{
 const g=buildScientificNetwork(16);
 assert.equal(g.nodes.length,32);
 assert.ok(g.edges.length>32);
 assert.deepEqual(new Set(g.nodes.map(x=>x.track)),new Set([0,1,2,3]));
 const html=scientificNeuralPanel(demo.programs,"P1");
 assert.equal((html.match(/class="neural-orb"/g)||[]).length,4);
 assert.match(html,/data-science-neural/);
 assert.match(html,/data-motion-toggle/);
 assert.doesNotMatch(html,/mamg97|Segundo Cerebro|cloudflare/i);
});
test("Scientific animation loop has bounded lifecycle and respects dispose",()=>{
 let current=null,canceled=0,draws=0;
 const loop=createResearchFrameLoop({request:cb=>(current=cb,1),cancel:()=>{canceled++},draw:()=>{draws++}});
 loop.setEnabled(true);
 assert.ok(current);
 current(40);
 loop.setEnabled(false);
 loop.dispose();
 assert.ok(canceled>=1);
 assert.ok(draws>=0);
});
test("Synthetic Markov transitions are stochastic and obey 00/01/10/11 paths",()=>{
 for(const row of TRANSITIONS)assert.ok(Math.abs(row.reduce((a,b)=>a+b,0)-1)<1e-12);
 assert.deepEqual(TRANSITIONS.map(r=>r.map((v,i)=>v>0?i:null).filter(x=>x!==null)),[[0,1],[2,3],[0,1],[2,3]]);
 const d=syntheticFourStateModel();
 assert.equal(d.levels.length,8);
 assert.equal(d.snapshots.length,6);
 for(let t=1;t<d.levels.length;t++){
  const l=d.levels[t];
  assert.ok(Math.abs(l.distribution.reduce((a,b)=>a+b,0)-1)<1e-12);
  assert.ok(Math.abs(l.flows.reduce((a,b)=>a+b.mass,0)-1)<1e-12);
  for(const e of l.flows)assert.ok(e.mass>=0 && TRANSITIONS[e.from][e.to]>0);
 }
 assert.equal(d.observedStates.length,0);
 assert.deepEqual(d.country,{name:"Ejemplo sintético"});
});
test("Scientific SVG renderer displays the complete eight-column time tree and scientific interactions",()=>{
 const d=syntheticFourStateModel();
 const svg=renderVerifiedGeometry(d,4,null,false,true);
 assert.match(svg,/class="future-graph"/);
 assert.match(svg,/data-fnode="7:3"/);
 assert.match(svg,/data-fedge="7:/);
 assert.match(svg,/future-core-glow/);
 assert.match(svg,/T\+7/);
 assert.doesNotMatch(svg,/future-observed-halo|REAL · FINAL/);
 const selected=renderVerifiedGeometry(d,4,{kind:"node",level:3,state:1},false,true);
 assert.match(selected,/class="future-node selected"/);
 const html=scientificMarkovPanel({horizon:3});
 assert.equal((html.match(/data-action="markov-year"/g)||[]).length,8);
 assert.match(html,/NINGÚN PAÍS REAL/);
 assert.throws(()=>syntheticFourStateModel(22));
 assert.throws(()=>scientificMarkovPanel({horizon:7}));
});
test("Public release uses the source-based canvas, not the substitute orbit/tree diagrams",()=>{
 const site=readFileSync(new URL("../src/site.mjs",import.meta.url),"utf8");
 assert.match(site,/scientificNeuralPanel\(d\.programs,state\.program\)/);
 assert.match(site,/enableScientificNeural/);
 assert.match(site,/scientificMarkovPanel/);
 assert.doesNotMatch(site,/scenarioBranches\(d\.branches/);
 assert.doesNotMatch(site,/stateTransitionDiagram\(state\.flowState/);
 const index=readFileSync(new URL("../index.html",import.meta.url),"utf8");
 assert.match(index,/src\/site\.mjs/);
});
