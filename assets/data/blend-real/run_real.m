% RUN_REAL  The v1.1.1 persistence references (audited copy in ./code, unchanged) on a real PV series (25/10/2026).
% Same protocol as run_benchmark.m: every weight and statistic fitted on the first half (n_train), forecasts use only
% observations available at their origin, all operators scored on the same targets n_train + max(H) + 1 .. end.
% Data: palaiseau_hourly.csv (prep.py): hourly AC power (kW), clear-sky proxy cs (kW), day class (1 stable, 2 intermediate,
% 3 variable, 0 night). nRMSE = RMSE / mean observed power on the scored targets; reported for all hours, daytime (cs > 0)
% and each day class (daytime hours of those days). Output: results_real.csv.
addpath(fullfile(fileparts(mfilename('fullpath')), 'code'));
D = readtable(fullfile(fileparts(mfilename('fullpath')), 'palaiseau_hourly.csv'));
x = D.x_kW; cs = D.cs_kW; cls = D.cls; T = 24; N = numel(x); n_train = floor(N / 2); H = [1 2 3 6 9];
targets = (n_train + max(H) + 1:N)';
cs_min = 0.05 * max(cs(1:n_train));
names = {'P', 'Simple persistence'; 'P_cyc', 'Cyclic persistence'; 'P_smart_mult', 'Smart persistence, multiplicative'; ...
    'P_stoch', 'Stochastic persistence'; 'CLIPER_cs_mult', 'CLIPER on clear-sky index x/CS'; 'BLEND_cs_mult', 'BLEND on clear-sky index x/CS'; ...
    'CLIPER_one_anomaly', 'CLIPER on anomaly x - mu(phase), one weight'; 'CLIPER_phase', 'CLIPER, weight per phase'; ...
    'BLEND_statio', 'BLEND, one weight, raw signal'; 'BLEND_phase_ls', 'BLEND, weight per phase (least squares)'; ...
    'BLEND_tilde', 'BLEND, simplified weight per phase (1 + rho)/2'};
rows = {};
masks = {true(numel(targets), 1), cs(targets) > 0, cls(targets) == 1, cls(targets) == 2, cls(targets) == 3};
mnames = {'all', 'day', 'stable', 'intermediate', 'variable'};
for h = H
    fit_t = (2 * T + h + 1:n_train)'; best = inf; Nst = 1;
    for n = 1:24
        p = predict_P_stochastic(x, cs, h, n); e = sqrt(mean((x(fit_t) - p(fit_t)).^2));
        if e < best, best = e; Nst = n; end
    end
    [b2, ~] = predict_P_BLEND_LS(x, T, h, n_train);
    [b3, ~] = predict_P_BLEND_Tilde(x, T, h, n_train);
    P = {predict_P(x, h), predict_P_cyclic(x, h, T), predict_P_smart_mult(x, cs, h, cs_min), predict_P_stochastic(x, cs, h, Nst), ...
        predict_P_CLIPER_clearsky(x, cs, h, 'multiplicative', n_train, cs_min), predict_P_BLEND_clearsky(x, cs, T, h, 'multiplicative', n_train, cs_min), ...
        predict_P_CLIPER_Cyclo_OneWeight(x, h, T, 'anomaly', n_train), predict_P_CLIPER_Cyclo(x, h, T, n_train), ...
        predict_P_BLEND_Statio(x, T, h, n_train), b2, b3};
    for k = 1:size(names, 1)
        yh = max(0, P{k}(:)); y = x(targets); f = yh(targets);
        for j = 1:numel(masks)
            m = masks{j};
            rows(end + 1, :) = {names{k, 1}, names{k, 2}, h, mnames{j}, sqrt(mean((y(m) - f(m)).^2)) / mean(y(m)), nnz(m)}; %#ok<SAGROW>
        end
    end
    fprintf('h = %d done (stochastic window %d)\n', h, Nst);
end
R = cell2table(rows, 'VariableNames', {'model', 'label', 'h', 'subset', 'nrmse', 'n'});
writetable(R, fullfile(fileparts(mfilename('fullpath')), 'results_real.csv'));
disp(unstack(R(strcmp(R.subset, 'day'), {'label', 'h', 'nrmse'}), 'nrmse', 'h', 'VariableNamingRule', 'modify'));
