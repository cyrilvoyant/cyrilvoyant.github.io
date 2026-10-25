"""Real-data test of the persistence references (25/10/2026). Cyril: « montrer un cas où BLEND donne de meilleurs résultats, sur une
vraie série ... très variable de PV ... à tester ... expliquer pourquoi il faut étudier la variabilité et la forecastabilité ».
Data: public Palaiseau example of PV_ELM_pred (AC power, 15 min, UTC, 2020-08-01 to 2025-09-21), hourly means, T = 24.
Clear-sky reference: pvlib Ineichen clear-sky GHI at the site (48.7128 N, 2.2188 E, PV_ELM_pred dataset_config), scaled to power by
the 99th percentile of P/GHI_cs on the training half (GHI_cs > 300 W/m²). This scaling is an assumption of the test, stated as such.
Day classes (test half only): daily variability v = std of the hourly changes of the clear-sky index k = P/P_cs during the day
(P_cs > 10 % of its maximum); terciles of v computed on the TRAINING days, applied to the test days.
Writes work/blend_real/palaiseau_hourly.csv (x, cs, class per hour: 0 night/unclassified, 1 stable, 2 intermediate, 3 variable)."""
from pathlib import Path

import numpy as np
import pandas as pd
import pvlib

W = Path(__file__).parent
SRC = Path(r"C:\Users\cvoyant\Documents\SEO-GEO\work\proba_anim\data\Palaiseau\PV_AC_20200801_20250706_Palaiseau.csv")
LAT, LON = 48.7128, 2.2188
d = pd.read_csv(SRC, parse_dates=["datetime"]).set_index("datetime")
x = d["PAC"].clip(lower=0).resample("1h").mean() / 1000.0          # kW
x = x.loc["2020-08-01":"2025-09-20"]                                 # whole days
idx = x.index
site = pvlib.location.Location(LAT, LON, tz="UTC")
times_mid = idx + pd.Timedelta(minutes=30)                           # hourly mean centred on the half hour
ghi_cs = site.get_clearsky(times_mid, model="ineichen")["ghi"].to_numpy()
N = len(x); n_train = N // 2
r = x.to_numpy() / np.where(ghi_cs > 300, ghi_cs, np.nan)
scale = np.nanpercentile(r[:n_train], 99)
cs = ghi_cs * scale
k = np.where(cs > 0.1 * cs.max(), x.to_numpy() / np.maximum(cs, 1e-9), np.nan)
day = np.arange(N) // 24
v = pd.Series(k).groupby(day).apply(lambda s: np.nanstd(np.diff(s.dropna().to_numpy())) if s.notna().sum() >= 6 else np.nan).to_numpy()
train_days = np.arange(len(v)) < (n_train // 24)
q1, q2 = np.nanpercentile(v[train_days], [100 / 3, 200 / 3])
cls_day = np.where(np.isnan(v), 0, np.where(v <= q1, 1, np.where(v <= q2, 2, 3)))
cls = cls_day[day] * (cs > 0)
out = pd.DataFrame({"time_utc": idx.strftime("%Y-%m-%dT%H:%MZ"), "x_kW": x.round(4).to_numpy(), "cs_kW": cs.round(4), "cls": cls.astype(int)})
out.to_csv(W / "palaiseau_hourly.csv", index=False)
print(f"N={N} n_train={n_train} scale={scale:.4f} kW per W/m2  terciles v: {q1:.3f} {q2:.3f}")
print("test days per class:", {c: int(((cls_day == c) & ~train_days).sum()) for c in (1, 2, 3)})
print("share of k>1.1 on test daytime:", float(np.nanmean(k[n_train:] > 1.1)))
