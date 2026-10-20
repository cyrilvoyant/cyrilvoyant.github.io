"""Teaching benchmark on an already-public Palaiseau example, not manuscript results."""
from pathlib import Path
import numpy as np, pandas as pd, json, hashlib
root=Path.cwd(); base=root; (root/'reports').mkdir(exist_ok=True); (root/'work').mkdir(exist_ok=True)
import requests, zipfile, io
source=root/'work/PV_AC_30min_2ans.csv'
z=zipfile.ZipFile(io.BytesIO(requests.get('https://raw.githubusercontent.com/cyrilvoyant/PV_ELM_pred/main/data.zip',timeout=60).content))
source.write_bytes(z.read('data/Palaiseau/PV_AC_30min_2ans.csv'))
df=pd.read_csv(source)
time=pd.to_datetime(df.datetime,utc=True); y=df.PAC.to_numpy(float)
assert time.diff().dropna().eq(pd.Timedelta(minutes=30)).all()
n=len(y); a=int(n*.6); b=int(n*.8); lag=6
X=np.column_stack([np.roll(y,k) for k in range(lag)])
mean=X[lag:a-6].mean(axis=0); sd=X[lag:a-6].std(axis=0); sd[sd==0]=1
Z=(X-mean)/sd; ym=y[:a].mean(); ys=y[:a].std()
results={}; summary={}; targets={}
for h in [1,2,6]:
    tr=np.arange(lag,a-h); va=np.arange(a,b-h); te=np.arange(b,n-h)
    # Only history available at origin enters each prediction. Targets stay within their split.
    def score(p,idx):return float(np.sqrt(np.mean((np.maximum(0,p)-y[idx+h])**2)))
    predictions={'Persistence':y[te]}; models={}
    for name,L in [('AR(6)',0),('ELM 10',10),('ELM 30',30)]:
        seeds=[0] if not L else [0,1,2]
        seedpred=[]; vals=[]; penalties=[]
        for seed in seeds:
            if L:
                rng=np.random.default_rng(seed); W=rng.normal(size=(lag,L)); bias=rng.normal(size=L)
                H=np.column_stack([np.ones(n),np.tanh(Z@W+bias)])
            else:H=np.column_stack([np.ones(n),Z])
            train=H[tr]; target=(y[tr+h]-ym)/ys
            fits=[]
            for penalty in [1e-6,.001,.1,1,10]:
                beta=np.linalg.solve(train.T@train+penalty*np.eye(H.shape[1]),train.T@target)
                fits.append((score((H[va]@beta)*ys+ym,va),penalty,beta))
            value,penalty,beta=min(fits,key=lambda z:z[0]); vals.append(value);penalties.append(penalty)
            seedpred.append(np.maximum(0,(H[te]@beta)*ys+ym))
        predictions[name]=seedpred[0]
        models[name]={'seed_rmse_W':[score(p,te) for p in seedpred],'validation_rmse_W':vals,'ridge':penalties,'stored_coefficients':7 if not L else lag*L+L+L+1,'fitted_coefficients':7 if not L else L+1}
    summary[str(h)]={'models':models,'test_RMSE_W':{name:score(p,te) for name,p in predictions.items()},'n_test':len(te)}
    results[str(h)]={name:np.round(p,3).tolist() for name,p in predictions.items()}
    targets[str(h)]={'time':df.datetime.iloc[te+h].tolist(),'observed_W':np.round(y[te+h],3).tolist()}
artifact={'provenance':{'source':'https://github.com/cyrilvoyant/PV_ELM_pred','file':'data.zip/data/Palaiseau/PV_AC_30min_2ans.csv','sha256':hashlib.sha256(source.read_bytes()).hexdigest(),'split':'chronological 60% train, 20% validation, 20% test','train_end':str(time.iloc[a-1]),'validation_end':str(time.iloc[b-1]),'test_end':str(time.iloc[-1]),'units':'W','lags':6,'clip':'nonnegative; no future-observation day filter','seed_displayed':0,'elm_seeds_scored':[0,1,2]},'summary':summary,'targets':targets,'predictions':results}
assets=base/'assets/data';assets.mkdir(parents=True,exist_ok=True)
(assets/'palaiseau-reference-demo.json').write_text(json.dumps(artifact,separators=(',',':')),encoding='utf-8')
(root/'reports/public-model-demo-20261020.json').write_text(json.dumps({'provenance':artifact['provenance'],'summary':summary},indent=2),encoding='utf-8')
