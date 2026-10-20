'use strict';
(async () => {
  const status = document.getElementById('loading');
  try {
    const response = await fetch('/assets/data/palaiseau-reference-demo.json');
    if (!response.ok) throw new Error('Data unavailable');
    const data = await response.json();
    const horizon = document.getElementById('horizon');
    const model = document.getElementById('model');
    const week = document.getElementById('week');
    const svg = document.getElementById('plot');
    function update() {
      const h = horizon.value, target = data.targets[h], preds = data.predictions[h];
      week.max = Math.max(0, Math.ceil(target.time.length / 336) - 1);
      week.value = Math.min(Number(week.value), Number(week.max));
      const start = Number(week.value) * 336, stop = Math.min(start + 336, target.time.length);
      const series = [target.observed_W, preds.Persistence, preds[model.value]];
      const max = Math.max(1, ...series.flatMap(s => s.slice(start, stop))) * 1.05;
      svg.replaceChildren();
      function element(tag, attributes, text) {
        const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
        Object.entries(attributes).forEach(([key, value]) => el.setAttribute(key, String(value)));
        if (text !== undefined) el.textContent = text;
        svg.append(el); return el;
      }
      element('title', {}, 'Observed PV power, persistence and ' + model.value + ', timestamps in UTC');
      for (let j = 0; j <= 4; j++) {
        const y = 260 - j * 52;
        element('line', {x1:60, x2:875, y1:y, y2:y, stroke:'#c4d2df'});
        element('text', {x:54,y:y+5,'text-anchor':'end','font-size':12}, Math.round(max*j/4));
      }
      const colors = ['#172536', '#a44b00', '#0969a5'];
      series.forEach((s, index) => {
        const points = s.slice(start,stop).map((v,i) => `${60+i*815/Math.max(1,stop-start-1)},${260-v/max*208}`).join(' ');
        element('polyline', {points,fill:'none',stroke:colors[index],'stroke-width':index===0?2:1.5});
        element('text', {x:65+index*265,y:25,fill:colors[index],'font-size':14}, ['Observed W','Persistence W',model.value+' W'][index]);
      });
      const first = target.time[start], last = target.time[stop-1];
      element('text', {x:60,y:290,'font-size':12},first.slice(0,16)+' UTC');
      element('text', {x:875,y:290,'font-size':12,'text-anchor':'end'},last.slice(0,16)+' UTC');
      document.getElementById('period').textContent = ` ${first.slice(0,10)} — ${last.slice(0,10)} (UTC)`;
      const summary = data.summary[h];
      const table = document.getElementById('scores');
      table.replaceChildren();
      const caption=document.createElement('caption');caption.textContent=`Entire test: ${summary.n_test} targets, horizon ${Number(h)/2} h, ELM seed 0`;table.append(caption);
      const head=document.createElement('tr');
      ['Model','RMSE W'].forEach(t=>{const th=document.createElement('th');th.scope='col';th.textContent=t;head.append(th);});table.append(head);
      Object.entries(summary.test_RMSE_W).forEach(([name,value])=>{
        const row=document.createElement('tr');
        [name,value.toFixed(1)].forEach(t=>{const cell=document.createElement('td');cell.textContent=t;row.append(cell);});table.append(row);
      });
      const selected=summary.models[model.value];
      const errors=selected.seed_rmse_W;
      document.getElementById('metrics').textContent = `${model.value}: ${selected.stored_coefficients} stored coefficients, ${selected.fitted_coefficients} fitted. Test RMSE across ${errors.length} seed(s): ${Math.min(...errors).toFixed(1)}–${Math.max(...errors).toFixed(1)} W. Plot: one week; scores: entire test.`;
    }
    [horizon,model,week].forEach(el=>el.addEventListener('input',update));
    update(); document.getElementById('controls').hidden=false;status.textContent='Comparison loaded. All controls run locally; no data is uploaded.';
  } catch (error) { status.textContent='Interactive data could not load. The static results and downloadable calculation remain available.'; }
})();
