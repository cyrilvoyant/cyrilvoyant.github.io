(()=>{
const tree=document.getElementById('site-tree'),trigger=document.querySelector('.site-tree-trigger'),backdrop=document.querySelector('.site-tree-backdrop'),close=tree?.querySelector('.tree-close');
if(!tree||!trigger)return;
function setOpen(open){tree.classList.toggle('is-open',open);trigger.setAttribute('aria-expanded',String(open));document.body.classList.toggle('site-tree-open',open);if(backdrop)backdrop.hidden=!open;if(open)setTimeout(()=>close?.focus(),60);else trigger.focus()}
trigger.addEventListener('click',()=>setOpen(!tree.classList.contains('is-open')));close?.addEventListener('click',()=>setOpen(false));backdrop?.addEventListener('click',()=>setOpen(false));
document.addEventListener('keydown',e=>{if(!tree.classList.contains('is-open'))return;if(e.key==='Escape'){setOpen(false);return}
if(e.key!=='Tab')return;const items=[...tree.querySelectorAll('a[href],button,summary')].filter(x=>x.checkVisibility?x.checkVisibility():x.offsetParent!==null);if(!items.length)return;const first=items[0],last=items[items.length-1],cur=document.activeElement;
if(!tree.contains(cur)){e.preventDefault();first.focus()}else if(e.shiftKey&&cur===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&cur===last){e.preventDefault();first.focus()}});
tree.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{if(matchMedia('(max-width:1549px)').matches)setOpen(false)}));
})();