"""Notify IndexNow after deployment; never resubmit the complete sitemap."""
import argparse,json,os,re,subprocess,urllib.request,urllib.parse
from pathlib import Path
from html.parser import HTMLParser

HOST='cyrilvoyant.github.io'
BASE='https://'+HOST
ROOT=Path(__file__).resolve().parents[2]
class Canonical(HTMLParser):
    def __init__(self):super().__init__();self.url=None;self.noindex=False
    def handle_starttag(self,tag,attrs):
        a=dict(attrs)
        if tag=='link' and 'canonical' in a.get('rel','').split():self.url=a.get('href')
        if tag=='meta' and a.get('name','').lower() in ('robots','bingbot') and 'noindex' in a.get('content','').lower():self.noindex=True

def candidates():
    explicit=os.environ.get('INDEXNOW_URLS','').strip()
    if explicit:return explicit.splitlines()
    names=subprocess.check_output(['git','diff','--name-only','--diff-filter=AM','HEAD^','HEAD'],cwd=ROOT,text=True).splitlines()
    urls=[]
    for name in names:
        if name.endswith('.html') and 'websemantic' not in name.lower():
            url=BASE+'/'+('' if name=='index.html' else name)
            p=Canonical();p.feed((ROOT/name).read_text(encoding='utf-8'))
            if not p.noindex and (p.url or url).rstrip('/')==url.rstrip('/'):urls.append(url)
    return urls

def main():
    parser=argparse.ArgumentParser();parser.add_argument('--dry-run',action='store_true');args=parser.parse_args()
    urls=sorted(set(x.strip() for x in candidates() if x.strip()))
    for u in urls:
        parsed=urllib.parse.urlsplit(u)
        if parsed.scheme!='https' or parsed.netloc!=HOST or parsed.query or parsed.fragment or 'websemantic' in u.lower():raise ValueError('Excluded or invalid URL')
    if args.dry_run:print(json.dumps({'dry_run':True,'urls':urls}));return
    if not urls:print('No changed canonical HTML pages to notify.');return
    for u in urls:
        with urllib.request.urlopen(u,timeout=30) as r:
            if r.status!=200:raise RuntimeError('Deployed page unavailable')
            p=Canonical();p.feed(r.read().decode('utf-8'))
            if p.noindex or (p.url and p.url.rstrip('/')!=u.rstrip('/')):raise RuntimeError('Public canonical/noindex check failed')
    keys=[p for p in ROOT.glob('*.txt') if re.fullmatch(r'[a-fA-F0-9]{32}\.txt',p.name)]
    if len(keys)!=1:raise RuntimeError('Expected one existing IndexNow key file')
    key=keys[0].read_text(encoding='utf-8').strip()
    with urllib.request.urlopen(BASE+'/'+keys[0].name,timeout=30) as r:
        if r.read().decode('utf-8').strip()!=key:raise RuntimeError('Public key file mismatch')
    payload={'host':HOST,'key':key,'keyLocation':BASE+'/'+keys[0].name,'urlList':urls}
    req=urllib.request.Request('https://api.indexnow.org/indexnow',data=json.dumps(payload).encode(),headers={'Content-Type':'application/json; charset=utf-8'})
    with urllib.request.urlopen(req,timeout=30) as r:status=r.status
    print(json.dumps({'status':status,'urls':urls,'meaning':'Acknowledgement only, not proof of indexing or AI citation.'}))
    if status not in (200,202):raise RuntimeError('IndexNow submission failed')

if __name__=='__main__':main()
