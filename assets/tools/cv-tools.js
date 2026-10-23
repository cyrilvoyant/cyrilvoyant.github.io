/* Interactive tools of cyrilvoyant.github.io (L6, 23 October 2026). No dependency, no data sent anywhere.
   Each function reproduces a reference code and is checked against values that code produced: /tools/js-tests.html.
     bedLQ, bedLQL        LQL-Equiv-web, lqlequiv.model._lql_dose_term (one fraction a day, before proliferation)
     thyroidTg            CTD_SIMU_RAI, Demonstrateur98f.m / Demonstrateur666f.m (RAIR-Sim demonstrators)
     nice                 nice-metrics, nice_metrics.m
     blendLS              cyclostationary-forecasting-matlab, predict_P_BLEND_LS.m
     scv, forecastability solar-variability-scv, scv.m and forecastability.m
   Widgets: <div class="cvt" data-tool="lql|thyroid|nice|blend|scv"></div>, mounted on load. */
(function () {
  "use strict";
  var CVT = {};

  // ---------------------------------------------------------------- radiobiology: BED under LQ and LQL
  CVT.bedLQ = function (n, d, ab) { return n * d * (1 + d / ab); };
  CVT.bedLQL = function (n, d, ab, dt, g) {      // Astrahan's linear tail above the transition dose dt; g = gamma/alpha
    return n * (d >= dt ? dt * (1 + dt / ab) + g * (d - dt) : d * (1 + d / ab));
  };

  // ---------------------------------------------------------------- thyroid: A, N, Tg over successive RAI sessions
  // dA/dt = -a ln2 A ; dN/dt = N (ln2/Td - r0 A) ; dTg/dt = lambda N - ke Tg   (time in months)
  // A and N have closed forms within a session; Tg is integrated with RK4 (step h months).
  CVT.thyroidTg = function (o) {
    var Td = o.Td, n = o.sessions, lag = o.lag, D = o.activity, tEnd = o.tEnd || 80, h = o.h || 0.002;
    var r0 = 0.00407, a = 0.0169, lam = 3.86e-9, ke = 0.319, k = a * Math.LN2;
    var N0 = 1.12e9, Tg0 = 100, A0 = 0, out = [], grid = o.grid || null;
    function Aof(A, t) { return A * Math.exp(-k * t); }
    function Nof(Ni, Ai, t) { return Ni * Math.exp(t * Math.LN2 / Td - r0 * Ai * (1 - Math.exp(-k * t)) / k); }
    var tAbs = 0;
    for (var i = 1; i <= n; i++) {
      var Ai = D + A0, Ni = N0, tg = Tg0, len = (i === n) ? tEnd - (i - 1) * lag : lag, steps = Math.round(len / h), hh = len / steps;
      var f = function (t, y) { return lam * Nof(Ni, Ai, t) - ke * y; };
      out.push([tAbs, tg]);
      for (var s = 0; s < steps; s++) {
        var t = s * hh;
        var k1 = f(t, tg), k2 = f(t + hh / 2, tg + hh * k1 / 2), k3 = f(t + hh / 2, tg + hh * k2 / 2), k4 = f(t + hh, tg + hh * k3);
        tg += hh * (k1 + 2 * k2 + 2 * k3 + k4) / 6;
        out.push([tAbs + t + hh, tg]);
      }
      if (i < n) { N0 = Nof(Ni, Ai, lag); A0 = Aof(Ai, lag); Tg0 = tg; tAbs += lag; }
    }
    if (!grid) return out;
    return grid.map(function (g) {           // value at each requested time (first point at or after g)
      for (var j = 0; j < out.length; j++) if (out[j][0] >= g - 1e-9) return out[j][1];
      return out[out.length - 1][1];
    });
  };
  CVT.thyroidThreshold = function (Td) { return Math.LN2 / (0.00407 * Td); };   // A* = ln2 / (r0 Td), GBq

  // ---------------------------------------------------------------- NICE^k against a reference forecast
  CVT.nice = function (y, yhat, yref, w) {
    w = w || [1 / 3, 1 / 3, 1 / 3];
    if (!yref) { yref = [NaN].concat(y.slice(0, -1)); }
    var e = [], r = [];
    for (var i = 0; i < y.length; i++) {
      if (isFinite(y[i]) && isFinite(yhat[i]) && isFinite(yref[i])) { e.push(y[i] - yhat[i]); r.push(y[i] - yref[i]); }
    }
    var m = { n: e.length };
    for (var k = 1; k <= 3; k++) {
      var se = 0, sr = 0;
      for (var j = 0; j < e.length; j++) { se += Math.pow(Math.abs(e[j]), k); sr += Math.pow(Math.abs(r[j]), k); }
      m["E" + k + "_model"] = Math.pow(se / e.length, 1 / k);
      m["E" + k + "_ref"] = Math.pow(sr / r.length, 1 / k);
      m["NICE" + k] = m["E" + k + "_model"] / m["E" + k + "_ref"];
    }
    m.NICE_Sigma = w[0] * m.NICE1 + w[1] * m.NICE2 + w[2] * m.NICE3;
    return m;
  };

  // ---------------------------------------------------------------- BLEND, one least-squares weight per phase
  // x_hat(t+h) = (1 - lambda) x(t+h-T) + lambda x(t), lambda clipped to [0,1], fitted on the whole series (1-based phases)
  CVT.blendLS = function (x, T, h) {
    var N = x.length, num = new Array(T).fill(0), den = new Array(T).fill(0), lam = new Array(T).fill(0);
    for (var t = T + 1; t <= N - h; t++) {                 // 1-based origins, as in the MATLAB code
      var ph = (t - 1) % T, y = x[t + h - 1], r = x[t - 1], c = x[t + h - T - 1];
      num[ph] += (y - c) * (r - c); den[ph] += (r - c) * (r - c);
    }
    for (var p = 0; p < T; p++) lam[p] = den[p] > 0 ? Math.max(0, Math.min(1, num[p] / den[p])) : 0;
    var pred = [], obs = [], se = 0;
    for (t = T + 1; t <= N - h; t++) {
      var l = lam[(t - 1) % T], v = (1 - l) * x[t + h - T - 1] + l * x[t - 1];
      pred.push(v); obs.push(x[t + h - 1]); se += Math.pow(x[t + h - 1] - v, 2);
    }
    return { lambda: lam, pred: pred, obs: obs, rmse: Math.sqrt(se / pred.length) };
  };

  // ---------------------------------------------------------------- sCV and forecastability F
  CVT.scv = function (I, Ic, d) {
    d = (d === undefined) ? 0.2 : d;
    var s2 = 0, c2 = 0, n = 0;
    for (var i = 0; i < I.length; i++) if (isFinite(I[i]) && isFinite(Ic[i])) { s2 += Math.pow(I[i] - Ic[i], 2); c2 += Ic[i] * Ic[i]; n++; }
    return Math.SQRT2 / Math.abs(d - 1) * Math.sqrt(s2 / n) / Math.sqrt(c2 / n);
  };
  function pearson(a, b) {
    if (a.length < 3) return NaN;
    var ma = 0, mb = 0, i;
    for (i = 0; i < a.length; i++) { ma += a[i]; mb += b[i]; }
    ma /= a.length; mb /= b.length;
    var sab = 0, saa = 0, sbb = 0;
    for (i = 0; i < a.length; i++) { sab += (a[i] - ma) * (b[i] - mb); saa += (a[i] - ma) * (a[i] - ma); sbb += (b[i] - mb) * (b[i] - mb); }
    var den = Math.sqrt(saa * sbb);
    return den === 0 ? NaN : sab / den;
  }
  CVT.forecastability = function (I, Ic, T, n, d) {
    var s = CVT.scv(I, Ic, d), e = I.map(function (v, i) { return v - Ic[i]; });
    if (s === 0) return { F: 1, scv: 0, rho_max: NaN, lag: NaN };
    var best = -1, lagBest = NaN;
    for (var L = n; L <= Math.floor(T / 2); L++) {
      var a = [], b = [];
      for (var i = 0; i + L < e.length; i++) if (isFinite(e[i]) && isFinite(e[i + L])) { a.push(e[i]); b.push(e[i + L]); }
      var r = Math.abs(pearson(a, b));
      if (isFinite(r) && r > best) { best = r; lagBest = L; }
    }
    return { F: 1 + s * (best - 1), scv: s, rho_max: best, lag: lagBest };
  };

  // ---------------------------------------------------------------- small helpers for the widgets
  function el(tag, attrs, html) {
    var e = document.createElement(tag);
    for (var k in (attrs || {})) e.setAttribute(k, attrs[k]);
    if (html !== undefined) e.innerHTML = html;
    return e;
  }
  function fmt(v, p) { return (isFinite(v) ? v.toFixed(p === undefined ? 3 : p) : "n/a"); }
  function parseCols(text) {            // one row per line, columns separated by spaces, tabs, commas or semicolons
    var rows = text.trim().split(/\r?\n/).map(function (l) { return l.trim().split(/[\s,;]+/).map(Number); });
    return rows.filter(function (r) { return r.length && r.every(function (v) { return !isNaN(v); }); });
  }
  function slider(label, id, min, max, step, val, unit) {
    return '<label class="cvt-row" for="' + id + '"><span>' + label + '</span><input type="range" id="' + id + '" min="' + min + '" max="' + max +
      '" step="' + step + '" value="' + val + '"><output for="' + id + '" id="' + id + '-o">' + val + '</output> ' + (unit || "") + "</label>";
  }
  function num(label, id, val, step) {
    return '<label class="cvt-num" for="' + id + '"><span>' + label + '</span><input type="number" id="' + id + '" value="' + val + '" step="' + (step || "any") + '"></label>';
  }
  function niceStep(span) {             // 1, 2 or 5 times a power of ten, about 4 steps over the span
    var raw = span / 4, p = Math.pow(10, Math.floor(Math.log10(raw))), m = raw / p;
    return (m < 1.5 ? 1 : m < 3.5 ? 2 : m < 7.5 ? 5 : 10) * p;
  }
  function lineChart(series, opt) {     // series: [{pts:[[x,y]], color, label, dash}]
    var W = 640, H = 300, L = 70, R = 14, Tm = 14, B = 42, xs = [], ys = [];
    series.forEach(function (s) { s.pts.forEach(function (p) { xs.push(p[0]); ys.push(p[1]); }); });
    var x0 = opt.xmin !== undefined ? opt.xmin : Math.min.apply(null, xs), x1 = opt.xmax !== undefined ? opt.xmax : Math.max.apply(null, xs);
    var y0 = opt.ymin !== undefined ? opt.ymin : Math.min(0, Math.min.apply(null, ys)), y1 = Math.max.apply(null, ys) * 1.05 || 1;
    if (opt.ymax !== undefined) y1 = opt.ymax;
    function X(v) { return L + (v - x0) / (x1 - x0) * (W - L - R); }
    function Y(v) { return H - B - (Math.min(v, y1) - y0) / (y1 - y0) * (H - Tm - B); }
    var g = '<svg viewBox="0 0 ' + W + " " + H + '" class="cvt-chart" role="img" aria-label="' + (opt.aria || "") + '">';
    var sy = niceStep(y1 - y0), sx = niceStep(x1 - x0), v;
    for (v = Math.ceil(y0 / sy) * sy; v <= y1 + 1e-9; v += sy) {
      g += '<line x1="' + L + '" x2="' + (W - R) + '" y1="' + Y(v) + '" y2="' + Y(v) + '" class="grid"/>';
      g += '<text x="' + (L - 8) + '" y="' + (Y(v) + 4) + '" text-anchor="end">' + (+v.toPrecision(6)) + "</text>";
    }
    for (v = Math.ceil(x0 / sx) * sx; v <= x1 + 1e-9; v += sx) {
      g += '<text x="' + X(v) + '" y="' + (H - B + 17) + '" text-anchor="middle">' + (+v.toPrecision(6)) + "</text>";
    }
    g += '<line x1="' + L + '" x2="' + (W - R) + '" y1="' + (H - B) + '" y2="' + (H - B) + '" stroke="#9fb0c0"/>';
    g += '<text x="' + ((L + W - R) / 2) + '" y="' + (H - 6) + '" text-anchor="middle" class="ax">' + opt.xlabel + "</text>";
    g += '<text transform="translate(14 ' + ((Tm + H - B) / 2) + ') rotate(-90)" text-anchor="middle" class="ax">' + opt.ylabel + "</text>";
    series.forEach(function (s) {
      if (s.marker) { g += '<circle cx="' + X(s.pts[0][0]) + '" cy="' + Y(s.pts[0][1]) + '" r="5" fill="' + s.color + '"/>'; return; }
      var d = s.pts.map(function (p, j) { return (j ? "L" : "M") + X(p[0]).toFixed(1) + " " + Y(p[1]).toFixed(1); }).join(" ");
      g += '<path d="' + d + '" fill="none" stroke="' + s.color + '" stroke-width="2"' + (s.dash ? ' stroke-dasharray="5 4"' : "") + "/>";
    });
    g += "</svg>";
    var leg = '<p class="cvt-legend">' + series.filter(function (s) { return s.label; }).map(function (s) {
      return '<span><i style="background:' + s.color + '"></i>' + s.label + "</span>"; }).join("") + "</p>";
    return leg + g;
  }
  var TESTS = '<p class="cvt-note">Checked against the reference code: <a href="/tools/js-tests.html">test page</a>. Everything runs in your browser; nothing is sent.</p>';

  // ---------------------------------------------------------------- widget: LQ / LQL dose slider
  function mountLQL(box) {
    box.innerHTML = '<div class="cvt-grid">' + slider("Dose per fraction d", "lq-d", 0.5, 25, 0.1, 15, "Gy") + slider("Number of fractions n", "lq-n", 1, 40, 1, 1) +
      '</div><div class="cvt-grid">' + num("α/β (Gy)", "lq-ab", 3.9) + num("Transition dose d<sub>T</sub> (Gy)", "lq-dt", 7.8) + num("γ/α (Gy)", "lq-g", 5) +
      '</div><p class="cvt-hint">Defaults: rectum in LQL-Equiv (α/β = 3.9 Gy, d<sub>T</sub> = 7.8 Gy, γ/α = 5 Gy). BED before proliferation, one fraction a day.</p>' +
      '<div class="cvt-out" aria-live="polite"></div><div class="cvt-plot"></div>' + TESTS;
    function upd() {
      var d = +box.querySelector("#lq-d").value, n = +box.querySelector("#lq-n").value, ab = +box.querySelector("#lq-ab").value,
          dt = +box.querySelector("#lq-dt").value, g = +box.querySelector("#lq-g").value;
      box.querySelector("#lq-d-o").textContent = d.toFixed(1); box.querySelector("#lq-n-o").textContent = n;
      var lq = CVT.bedLQ(n, d, ab), lql = CVT.bedLQL(n, d, ab, dt, g);
      box.querySelector(".cvt-out").innerHTML = "<p><strong>" + n + " × " + d.toFixed(1) + " Gy</strong>: BED<sub>LQ</sub> = <strong>" + fmt(lq, 1) +
        " Gy</strong>, BED<sub>LQL</sub> = <strong>" + fmt(lql, 1) + " Gy</strong>" + (d > dt ? " (LQ overestimates by " + fmt(100 * (lq / lql - 1), 0) + " %)" : " (identical below d<sub>T</sub>)") + ".</p>";
      var a = [], b = [];
      for (var x = 0.5; x <= 25.001; x += 0.25) { a.push([x, CVT.bedLQ(n, x, ab)]); b.push([x, CVT.bedLQL(n, x, ab, dt, g)]); }
      box.querySelector(".cvt-plot").innerHTML = lineChart([{ pts: a, color: "#b4513a", label: "LQ" }, { pts: b, color: "#07569a", label: "LQL" },
        { pts: [[d, lql]], color: "#07569a", marker: true }], { xlabel: "dose per fraction (Gy)", ylabel: "BED (Gy)", xmin: 0, xmax: 25, aria: "BED against dose per fraction, LQ and LQL" });
    }
    box.addEventListener("input", upd); upd();
  }

  // ---------------------------------------------------------------- widget: thyroid protocol explorer
  function mountThyroid(box) {
    box.innerHTML = '<div class="cvt-grid"><label class="cvt-row" for="th-p"><span>Patient profile</span><select id="th-p"><option value="9.8">refractory (T<sub>d</sub> = 9.8 months)</option>' +
      '<option value="66.6">responding (T<sub>d</sub> = 66.6 months)</option></select></label>' + slider("Sessions", "th-n", 1, 8, 1, 4) +
      slider("Months between sessions", "th-l", 1, 8, 1, 3) + slider("Activity per session", "th-a", 1, 8, 0.1, 3.7, "GBq") +
      '</div><div class="cvt-out" aria-live="polite"></div><div class="cvt-plot"></div>' +
      '<p class="cvt-hint">Parameters of the public RAIR-Sim demonstrators (Fusella Giuntini et al.). Model outputs for two archetypes, not predictions for a patient.</p>' + TESTS;
    function upd() {
      var Td = +box.querySelector("#th-p").value, n = +box.querySelector("#th-n").value, l = +box.querySelector("#th-l").value, A = +box.querySelector("#th-a").value;
      box.querySelector("#th-n-o").textContent = n; box.querySelector("#th-l-o").textContent = l; box.querySelector("#th-a-o").textContent = A.toFixed(1);
      var pts = CVT.thyroidTg({ Td: Td, sessions: n, lag: l, activity: A, h: 0.01 }), last = pts[pts.length - 1][1], thr = CVT.thyroidThreshold(Td);
      var peak = Math.max.apply(null, pts.map(function (p) { return p[1]; }));
      box.querySelector(".cvt-out").innerHTML = "<p>Thyroglobulin after 80 months: <strong>" + fmt(last, 1) + " ng/mL</strong> (start 100). Activity threshold A* = ln2/(r<sub>0</sub>T<sub>d</sub>) = <strong>" +
        fmt(thr, 1) + " GBq</strong>: " + (A > thr ? "each session is above it." : "each session is below it; only accumulated activity can reach it.") + "</p>";
      var thin = pts.filter(function (p, i) { return i % 20 === 0; });
      box.querySelector(".cvt-plot").innerHTML = lineChart([{ pts: thin, color: "#b4513a", label: "Tg (ng/mL)" }],
        { xlabel: "months", ylabel: "thyroglobulin (ng/mL)", xmin: 0, xmax: 80, ymin: 0, ymax: Math.max(110, peak * 1.05), aria: "Thyroglobulin over 80 months" });
    }
    box.addEventListener("input", upd); upd();
  }

  // ---------------------------------------------------------------- data widgets (NICE, BLEND, sCV/F): demo data or pasted columns
  function demo() {                  // 20 synthetic days, hourly: clear sky, cloudy signal, a forecast (deterministic generator)
    var T = 24, N = 20 * T, s = 7, cs = [], x = [], f = [];
    function rnd() { s = (s * 16807) % 2147483647; return s / 2147483647; }
    var c = 1;
    for (var t = 1; t <= N; t++) {
      var k = Math.max(0, 1000 * Math.sin(2 * Math.PI * t / T)); c = 0.8 * c + 0.2 * (0.25 + 0.85 * rnd());
      cs.push(+k.toFixed(1)); x.push(+(k * Math.min(1, c)).toFixed(1));
    }
    for (t = 0; t < N; t++) f.push(+Math.max(0, 0.6 * (t ? x[t - 1] : x[0]) + 0.4 * cs[t] * 0.8).toFixed(1));
    return { T: T, cs: cs, x: x, f: f };
  }
  function dataBox(id, cols, hint) {
    var d = demo(), rows = d.x.map(function (v, i) { return cols.map(function (c) { return d[c][i]; }).join("\t"); }).join("\n");
    return '<label class="cvt-data" for="' + id + '"><span>' + hint + '</span><textarea id="' + id + '" rows="6" spellcheck="false">' + rows + "</textarea></label>";
  }
  function mountNICE(box) {
    box.innerHTML = dataBox("ni-d", ["x", "f"], "Two columns: observation, forecast (one row per time step). Demo data loaded; paste your own.") +
      '<div class="cvt-grid"><label class="cvt-row" for="ni-r"><span>Reference</span><select id="ni-r"><option value="1">persistence (previous step)</option><option value="24">persistence 24 steps earlier</option></select></label></div>' +
      '<div class="cvt-out" aria-live="polite"></div>' + TESTS;
    function upd() {
      var rows = parseCols(box.querySelector("#ni-d").value), y = rows.map(function (r) { return r[0]; }), f = rows.map(function (r) { return r[1]; });
      var lag = +box.querySelector("#ni-r").value, ref = lag === 1 ? null : y.map(function (v, i) { return i >= lag ? y[i - lag] : NaN; });
      if (y.length < 3) { box.querySelector(".cvt-out").innerHTML = "<p>Paste at least three rows.</p>"; return; }
      var m = CVT.nice(y, f, ref);
      box.querySelector(".cvt-out").innerHTML = '<table class="cvt-table"><tr><th></th><th>k = 1 (MAE)</th><th>k = 2 (RMSE)</th><th>k = 3</th></tr>' +
        "<tr><th>model error E<sub>k</sub></th><td>" + fmt(m.E1_model, 2) + "</td><td>" + fmt(m.E2_model, 2) + "</td><td>" + fmt(m.E3_model, 2) + "</td></tr>" +
        "<tr><th>reference error</th><td>" + fmt(m.E1_ref, 2) + "</td><td>" + fmt(m.E2_ref, 2) + "</td><td>" + fmt(m.E3_ref, 2) + "</td></tr>" +
        "<tr><th>NICE<sup>k</sup></th><td>" + fmt(m.NICE1) + "</td><td>" + fmt(m.NICE2) + "</td><td>" + fmt(m.NICE3) + "</td></tr></table>" +
        "<p>NICE<sup>Σ</sup> = <strong>" + fmt(m.NICE_Sigma) + "</strong> on " + m.n + " samples: " + (m.NICE_Sigma < 1 ? "the forecast beats the reference." : "the forecast does not beat the reference.") + "</p>";
    }
    box.addEventListener("input", upd); upd();
  }
  function mountBLEND(box) {
    box.innerHTML = dataBox("bl-d", ["x"], "One column: the signal, regularly sampled (one row per time step). Demo data loaded (hourly); paste your own.") +
      '<div class="cvt-grid">' + num("Period T (steps)", "bl-T", 24, 1) + slider("Horizon h", "bl-h", 1, 24, 1, 1, "steps") + "</div>" +
      '<div class="cvt-out" aria-live="polite"></div><div class="cvt-plot"></div>' +
      '<p class="cvt-hint">Weights fitted on the whole series (an in-sample diagnostic, as the default of the reference code); to evaluate, fit on a training period and test on the rest.</p>' + TESTS;
    function upd() {
      var x = parseCols(box.querySelector("#bl-d").value).map(function (r) { return r[0]; }), T = Math.round(+box.querySelector("#bl-T").value), h = +box.querySelector("#bl-h").value;
      box.querySelector("#bl-h-o").textContent = h;
      if (!(T >= 2) || x.length < 3 * T || h > T) { box.querySelector(".cvt-out").innerHTML = "<p>Need at least three periods of data and h ≤ T.</p>"; return; }
      var b = CVT.blendLS(x, T, h), sp = 0, sc = 0, k = 0;
      for (var t = T + 1; t <= x.length - h; t++, k++) { sp += Math.pow(x[t + h - 1] - x[t - 1], 2); sc += Math.pow(x[t + h - 1] - x[t + h - T - 1], 2); }
      box.querySelector(".cvt-out").innerHTML = "<p>RMSE on the same targets: BLEND <strong>" + fmt(b.rmse, 1) + "</strong> · persistence " + fmt(Math.sqrt(sp / k), 1) +
        " · cyclic persistence " + fmt(Math.sqrt(sc / k), 1) + ".</p>";
      box.querySelector(".cvt-plot").innerHTML = lineChart([{ pts: b.lambda.map(function (l, i) { return [i + 1, l]; }), color: "#3c8d5a", label: "λ by phase of the origin (weight of the latest value)" }],
        { xlabel: "phase of the origin", ylabel: "λ", xmin: 1, xmax: T, ymin: 0, ymax: 1, aria: "BLEND weight by phase" });
    }
    box.addEventListener("input", upd); upd();
  }
  function mountSCV(box) {
    box.innerHTML = dataBox("sc-d", ["x", "cs"], "Two columns: measured irradiance, clear-sky irradiance (one row per time step). Demo data loaded (hourly); paste your own.") +
      '<div class="cvt-grid">' + num("Steps per day T", "sc-T", 24, 1) + slider("Horizon n", "sc-n", 1, 12, 1, 1, "steps") + num("Diffuse floor d", "sc-dd", 0.2, 0.05) + "</div>" +
      '<div class="cvt-out" aria-live="polite"></div>' + TESTS;
    function upd() {
      var rows = parseCols(box.querySelector("#sc-d").value), I = rows.map(function (r) { return r[0]; }), C = rows.map(function (r) { return r[1]; });
      var T = Math.round(+box.querySelector("#sc-T").value), n = +box.querySelector("#sc-n").value, d = +box.querySelector("#sc-dd").value;
      box.querySelector("#sc-n-o").textContent = n;
      if (I.length <= T / 2 + 2 || n > T / 2 || !(d >= 0 && d < 1)) { box.querySelector(".cvt-out").innerHTML = "<p>Need more rows than T/2 + 2, n ≤ T/2 and 0 ≤ d &lt; 1.</p>"; return; }
      var r = CVT.forecastability(I, C, T, n, d);
      box.querySelector(".cvt-out").innerHTML = "<p>sCV = <strong>" + fmt(r.scv) + "</strong> (0: clear sky; 1: a sky switching at random between clear and overcast) · " +
        "ρ<sub>max</sub> = " + fmt(r.rho_max) + " at lag " + r.lag + " · F = <strong>" + fmt(r.F) + "</strong> (higher: easier to forecast " + n + " step" + (n > 1 ? "s" : "") + " ahead).</p>";
    }
    box.addEventListener("input", upd); upd();
  }

  var MOUNT = { lql: mountLQL, thyroid: mountThyroid, nice: mountNICE, blend: mountBLEND, scv: mountSCV };
  function init() {
    [].forEach.call(document.querySelectorAll(".cvt[data-tool]"), function (box) {
      var f = MOUNT[box.getAttribute("data-tool")];
      if (f && !box.dataset.ready) { box.dataset.ready = "1"; f(box); }
    });
  }
  window.CVT = CVT;
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
