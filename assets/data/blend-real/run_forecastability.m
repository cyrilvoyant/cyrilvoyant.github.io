% RUN_FORECASTABILITY  Variability sCV and forecastability F (reference code scv.m and forecastability.m of
% solar-variability-scv, commit 601df6c, cloned unchanged in ./scv_ref) on the test half of palaiseau_hourly.csv,
% for all test days and for each day class. Hours outside the class are set to NaN, so lags keep their meaning and the
% pairs that cross into another class are excluded. Also the day-to-day memory of the clear-sky index: correlation of
% k(t) and k(t - 24) over daytime pairs whose target day is in the class (the memory BLEND relies on).
% Output: forecastability_real.csv.
here = fileparts(mfilename('fullpath')); addpath(fullfile(here, 'scv_ref'));
D = readtable(fullfile(here, 'palaiseau_hourly.csv'));
x = D.x_kW; cs = D.cs_kW; cls = D.cls; T = 24; N = numel(x); n_train = floor(N / 2);
test = (1:N)' > n_train; dayh = cs > 0.1 * max(cs);
k = nan(N, 1); k(dayh) = x(dayh) ./ cs(dayh);
names = {'all test days', 'stable', 'intermediate', 'variable'};
sel = {test & cls > 0, test & cls == 1, test & cls == 2, test & cls == 3};
rows = {};
for j = 1:numel(sel)
    I = x; Ic = cs; I(~sel{j}) = NaN; Ic(~sel{j}) = NaN;
    s = scv(I, Ic);
    F = arrayfun(@(n) forecastability(I, Ic, T, n), [1 3 6 9]);
    t = find(sel{j} & dayh); t = t(t > 24); ok = ~isnan(k(t)) & ~isnan(k(t - 24));
    r24 = corr(k(t(ok)), k(t(ok) - 24));
    t1 = t(~isnan(k(t)) & ~isnan(k(t - 1))); r1 = corr(k(t1), k(t1 - 1));
    rows(end + 1, :) = {names{j}, s, F(1), F(2), F(3), F(4), r1, r24, nnz(sel{j})}; %#ok<SAGROW>
end
R = cell2table(rows, 'VariableNames', {'subset', 'sCV', 'F_h1', 'F_h3', 'F_h6', 'F_h9', 'rho_k_1h', 'rho_k_24h', 'n_hours'});
writetable(R, fullfile(here, 'forecastability_real.csv'));
disp(R);
