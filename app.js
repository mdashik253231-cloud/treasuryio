
(function(){
 const main=document.getElementById('home'),notice=main.querySelector('.notice'),heading=main.querySelector('.heading'),metrics=main.querySelector('.grid4'),homePremium=document.getElementById('homePremium');
 const marketSnapshot=document.getElementById('marketSnapshot'),profitChart=document.getElementById('profitChart'),markets=document.getElementById('markets'),trade=document.getElementById('trade'),wallet=document.getElementById('wallet'),security=main.querySelector('aside .card:last-child');
 const layout=main.querySelector('.layout'),pages={};
 function page(id,title){const el=document.createElement('section');el.id='page-'+id;el.className='app-page';if(id!=='home')el.innerHTML='<div class="heading"><h1>'+title+'</h1></div>';main.appendChild(el);pages[id]=el;return el}
 const home=page('home','Home');home.append(notice,heading,metrics,homePremium);
 page('markets','Markets').append(markets);
  page('trade','Trade').append(trade);
  const buyLivePage=page('buy-live','Buy Live Trading');buyLivePage.dataset.liveSide='Buy';
  const sellLivePage=page('sell-live','Sell Live Trading');sellLivePage.dataset.liveSide='Sell';
  page('charts','Charts').append(marketSnapshot,profitChart);page('wallet','Assets').append(wallet,security);
 const successPage=page('trade-success','Order Successful');
 successPage.innerHTML='<div class="card" style="max-width:560px;margin:34px auto;text-align:center;padding:34px 22px"><div aria-hidden="true" style="width:76px;height:76px;margin:0 auto 18px;border-radius:50%;display:grid;place-items:center;background:#143c34;color:#62e3b8;font-size:42px;font-weight:900">✓</div><h2 style="font-size:25px;margin:0 0 10px;color:#62e3b8">Success</h2><p id="tradeSuccessMessage" class="muted" style="margin:0 0 22px">Your order has been completed successfully.</p><button type="button" class="btn-blue wide" onclick="openNavPanel(&quot;home&quot;)">Confirm</button></div>';
 layout.remove();
 const links=[...document.querySelectorAll('.mobile-bottom-nav a')];
 function openPage(id){
   if(!pages[id])id='home';
   if(id==='buy-live'){pages[id].append(trade);document.getElementById('tradeOrderButton').textContent='Buy Now';}
   else if(id==='sell-live'){pages[id].append(trade);document.getElementById('tradeOrderButton').textContent='Sell Now';}
   else if(id==='trade'){pages.trade.append(trade);document.getElementById('tradeOrderButton').textContent='Order';}
   Object.entries(pages).forEach(([k,v])=>v.classList.toggle('active-page',k===id));links.forEach(a=>a.classList.toggle('active',a.dataset.navTarget===id));history.replaceState(null,'',id==='home'?location.pathname+location.search:'#'+id);window.scrollTo(0,0);if(id==='markets')window.loadMarkets?.()}
 window.showTradeSuccess=function(message){const el=document.getElementById('tradeSuccessMessage');if(el)el.textContent=message;openPage('trade-success')};
 links.forEach(a=>a.addEventListener('click',e=>{e.preventDefault();openPage(a.dataset.navTarget)}));
 document.querySelectorAll('.top .nav a').forEach(a=>a.addEventListener('click',e=>{const id=(a.getAttribute('href')||'').slice(1);if(['markets','trade','wallet'].includes(id)){e.preventDefault();openPage(id)}}));
 window.openNavPanel=openPage;window.addEventListener('keydown',e=>{if(e.key==='Escape'){closeSupport();closeAccountPanel();closeCoinDetail();openPage('home')}});window.addEventListener('popstate',()=>openPage('home'));openPage('home');
})();



const coinList=[
 ['bitcoin','Bitcoin','BTC'],['ethereum','Ethereum','ETH'],['tether','Tether','USDT'],['binancecoin','BNB','BNB'],['solana','Solana','SOL'],['ripple','XRP','XRP'],['usd-coin','USDC','USDC'],['dogecoin','Dogecoin','DOGE'],['tron','TRON','TRX'],['the-open-network','Toncoin','TON'],
 ['cardano','Cardano','ADA'],['avalanche-2','Avalanche','AVAX'],['shiba-inu','Shiba Inu','SHIB'],['chainlink','Chainlink','LINK'],['polkadot','Polkadot','DOT'],['bitcoin-cash','Bitcoin Cash','BCH'],['litecoin','Litecoin','LTC'],['stellar','Stellar','XLM'],['near','NEAR Protocol','NEAR'],['uniswap','Uniswap','UNI'],
 ['internet-computer','Internet Computer','ICP'],['aptos','Aptos','APT'],['arbitrum','Arbitrum','ARB'],['optimism','Optimism','OP'],['cosmos','Cosmos','ATOM'],['filecoin','Filecoin','FIL'],['hedera-hashgraph','Hedera','HBAR'],['vechain','VeChain','VET'],['render-token','Render','RENDER'],['pepe','Pepe','PEPE'],['ethereum-classic','Ethereum Classic','ETC'],['algorand','Algorand','ALGO'],['aave','Aave','AAVE'],['maker','Maker','MKR'],['injective-protocol','Injective','INJ'],['the-graph','The Graph','GRT'],['fantom','Fantom','FTM'],['sui','Sui','SUI'],['sei-network','Sei','SEI'],['mantle','Mantle','MNT']
];
let prices={}, selectedCoin=coinList[0], side='Buy', authMode='login', currentUser=null, usdtBalance=0, coinBalances={}, coinBalancesFresh=false;
const tradeCoinSelect=document.getElementById('tradeCoin');tradeCoinSelect.innerHTML=coinList.map(c=>`<option value="${escAttr(c[0])}">${esc(c[1])} (${esc(c[2])})</option>`).join('');
const fmt=n=>Number.isFinite(Number(n))?Number(n).toLocaleString('en-US',{style:'currency',currency:'USD',maximumFractionDigits:Number(n)<1?6:2}):'—';
const shortMoney=n=>Number.isFinite(Number(n))?'$'+Intl.NumberFormat('en-US',{notation:'compact',maximumFractionDigits:2}).format(n):'—';
function selectedCoinBalance(){return Number(coinBalances[selectedCoin[2]]||0)}
function formatCoinHolding(symbol){const amount=Number(coinBalances[String(symbol||'').toUpperCase()]||0);return amount>0?amount.toLocaleString('en-US',{maximumFractionDigits:8})+' '+String(symbol||'').toUpperCase():'0 '+String(symbol||'').toUpperCase()}
function updateMarketHoldingLabels(){document.querySelectorAll('[data-user-coin-balance]').forEach(el=>{el.textContent='Your balance: '+formatCoinHolding(el.getAttribute('data-user-coin-balance'))})}
function updatePortfolioDisplay(){
 let total=Number(usdtBalance)||0;
 for(const [symbol,amountValue] of Object.entries(coinBalances)){
  const amount=Number(amountValue)||0;
  const coin=coinList.find(c=>c[2]===symbol);
  if(!coin||amount<=0)continue;
  const price=Number(prices[coin[0]]?.usd);
  if(Number.isFinite(price)&&price>0)total+=amount*price;
 }
 const formatted=total.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});
 document.getElementById('topBalance').innerHTML=formatted+' <span class="muted" style="font-size:13px">USDT</span>';
 document.getElementById('walletBalance').innerHTML=formatted+' <span class="muted" style="font-size:14px">USDT</span>';
 updateMarketHoldingLabels();
}
function updateAvailableAmount(){const el=document.getElementById('availableAmount');if(!currentUser){el.textContent='Available amount: Log in';return}if(side==='Buy'){el.textContent='Available amount: '+usdtBalance.toFixed(2)+' USDT'}else{el.textContent='Available amount: '+selectedCoinBalance().toFixed(8)+' '+selectedCoin[2]}}
function setSide(s){side=s;document.getElementById('buyTab').classList.toggle('active',s==='Buy');document.getElementById('sellTab').classList.toggle('active',s==='Sell');updateAvailableAmount();calcTrade();}
function setCoin(id){selectedCoin=coinList.find(c=>c[0]===id)||coinList[0];document.getElementById('tradeCoin').value=selectedCoin[0];document.getElementById('tradeSymbol').textContent=selectedCoin[2];updateAvailableAmount();calcTrade();}
function setMaxTradeAmount(){const p=Number(prices[selectedCoin[0]]?.usd);let amount=0;if(!currentUser){document.getElementById('tradeMsg').textContent='Please log in before using MAX.';return}if(side==='Buy'){if(p>0)amount=usdtBalance/p}else amount=selectedCoinBalance();document.getElementById('tradeAmount').value=amount>0?amount.toFixed(8).replace(/\.?0+$/,''):'';calcTrade()}
function calcTrade(){let amount=Number(document.getElementById('tradeAmount').value)||0;let p=prices[selectedCoin[0]]?.usd;let total=p&&amount>0?p*amount:0;document.getElementById('tradeTotal').value=total>0?total.toFixed(2):'';const orderButton=document.getElementById('tradeOrderButton');let enough=side==='Buy'?total<=usdtBalance+1e-8:amount<=selectedCoinBalance()+1e-10;orderButton.disabled=!(currentUser && total>0 && p>0 && enough);const msg=document.getElementById('tradeMsg');if(!currentUser){msg.textContent='Log in to convert using your balance.'}else if(total>0&&!enough){msg.textContent=side==='Buy'?'Your USDT balance is insufficient. Press MAX or enter a smaller amount.':'Your '+selectedCoin[2]+' balance is insufficient. Press MAX or enter a smaller amount.'}else if(total>0){msg.textContent=side==='Buy'?'Estimated cost: '+total.toFixed(2)+' USDT. Placing the order will deduct USDT and add coins.':'Estimated value: '+total.toFixed(2)+' USDT. Placing the order will deduct coins and add USDT.'}else{msg.textContent='Enter the coin amount.'}updateAvailableAmount()}
document.getElementById('tradeAmount').addEventListener('input',calcTrade);
async function loadMarkets(){
 const status=document.getElementById('marketStatus'), rows=document.getElementById('marketRows');
 status.textContent='Refreshing…';
 // Admin-controlled ETH price is the source of truth when a valid setting exists.
 let adminEthPrice=null;
 try{
  if(supabaseClient){
   const {data:ethSetting,error:ethSettingError}=await supabaseClient
    .from('eth_price_settings')
    .select('custom_price')
    .eq('setting_key','ETH')
    .maybeSingle();
   if(ethSettingError) console.warn('Could not read admin ETH price; using live quote:',ethSettingError.message);
   else if(ethSetting && Number.isFinite(Number(ethSetting.custom_price)) && Number(ethSetting.custom_price)>0)
    adminEthPrice=Number(ethSetting.custom_price);
  }
 }catch(settingErr){console.warn('Admin ETH price lookup failed:',settingErr);}
 try{
  const ids=coinList.map(c=>c[0]).join(',');
  const res=await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids='+encodeURIComponent(ids)+'&order=market_cap_desc&per_page=50&page=1&sparkline=false',{headers:{accept:'application/json'}});
  if(!res.ok)throw new Error('Market API unavailable');
  const data=await res.json();
  if(adminEthPrice!==null){const eth=data.find(d=>d.id==='ethereum');if(eth)eth.current_price=adminEthPrice;}
  prices={};data.forEach(d=>prices[d.id]={usd:d.current_price,change:d.price_change_percentage_24h,cap:d.market_cap});
  if(!data.length)throw new Error('No market data');
  rows.innerHTML=data.map(d=>{let c=coinList.find(x=>x[0]===d.id)||[d.id,d.name,d.symbol.toUpperCase()];let change=Number(d.price_change_percentage_24h);return `<tr><td><div class="coin" role="button" tabindex="0" style="cursor:pointer" onclick="showCoinDetail('${escAttr(d.id)}')" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();showCoinDetail('${escAttr(d.id)}')}"><span class="coin-icon">${esc(c[2].slice(0,1))}</span><span>${esc(c[1])}<small>${esc(c[2])}</small><small class="user-coin-balance" data-user-coin-balance="${escAttr(c[2])}">Your balance: ${esc(formatCoinHolding(c[2]))}</small></span></div></td><td class="price">${fmt(d.current_price)}</td><td class="${change>=0?'green':'red'}">${Number.isFinite(change)?(change>=0?'+':'')+change.toFixed(2)+'%':'—'}</td><td>${shortMoney(d.market_cap)}</td><td><div style="display:flex;gap:5px"><button class="btn-quiet small" onclick="showCoinDetail('${escAttr(d.id)}')">View</button><button class="btn-green small" onclick="marketTrade('${escAttr(d.id)}','Buy')">Buy</button><button class="btn-red small" onclick="marketTrade('${escAttr(d.id)}','Sell')">Sell</button></div></td></tr>`}).join('');
  document.getElementById('topBTC').textContent=fmt(prices.bitcoin?.usd);document.getElementById('topETH').textContent=fmt(prices.ethereum?.usd);
  setChange('btcChange',prices.bitcoin?.change);setChange('ethChange',prices.ethereum?.change);
  status.textContent='Updated '+new Date().toLocaleTimeString();
  updatePortfolioDisplay();calcTrade();renderProfitChart();renderHomeTrending();
 }catch(e){
   // Secondary live feed: Binance 24h ticker. Only fall back to demo quotes if both providers fail.
   try{
    const liveRes=await fetchWithTimeout('https://api.binance.com/api/v3/ticker/24hr',12000);
    if(!liveRes.ok)throw new Error('Binance ticker unavailable');
    const liveRows=await liveRes.json(),tickerMap=new Map(liveRows.map(x=>[x.symbol,x]));
    const liveAssets=coinList.map(c=>{const sym=binanceSymbolForCoin(c[0]),t=sym?tickerMap.get(sym):null;return t?{coin:c,ticker:t}:null}).filter(Boolean);
    if(!liveAssets.length)throw new Error('No supported live tickers');
    prices={};
    liveAssets.forEach(({coin,ticker})=>prices[coin[0]]={usd:Number(ticker.lastPrice),change:Number(ticker.priceChangePercent),cap:null});
    if(adminEthPrice!==null&&prices.ethereum)prices.ethereum.usd=adminEthPrice;
    rows.innerHTML=coinList.map(c=>{const p=prices[c[0]],change=Number(p?.change);return `<tr><td><div class="coin" role="button" tabindex="0" style="cursor:pointer" onclick="showCoinDetail('${escAttr(c[0])}')"><span class="coin-icon">${esc(c[2].slice(0,1))}</span><span>${esc(c[1])}<small>${esc(c[2])}</small><small class="user-coin-balance" data-user-coin-balance="${escAttr(c[2])}">Your balance: ${esc(formatCoinHolding(c[2]))}</small></span></div></td><td class="price">${p?fmt(p.usd):'—'}</td><td class="${p?(change>=0?'green':'red'):''}">${p?(change>=0?'+':'')+change.toFixed(2)+'%':'—'}</td><td>—</td><td><button class="btn-quiet small" onclick="showCoinDetail('${escAttr(c[0])}')">View</button></td></tr>`}).join('');
    document.getElementById('topBTC').textContent=fmt(prices.bitcoin?.usd);document.getElementById('topETH').textContent=fmt(prices.ethereum?.usd);
    setChange('btcChange',prices.bitcoin?.change);setChange('ethChange',prices.ethereum?.change);
    status.textContent='Live prices via Binance · '+new Date().toLocaleTimeString();
    updatePortfolioDisplay();calcTrade();renderProfitChart();renderHomeTrending();return;
   }catch(binanceErr){console.warn('Binance market feed unavailable; using demo fallback:',binanceErr)}
   status.textContent='Demo prices (all live feeds unavailable)';
   const demo=[['bitcoin','Bitcoin','BTC',67400,1.2,1330000000000],['ethereum','Ethereum','ETH',3500,0.8,420000000000],['tether','Tether','USDT',1,0.01,110000000000],['binancecoin','BNB','BNB',590,-0.4,86000000000],['solana','Solana','SOL',145,2.1,65000000000],['ripple','XRP','XRP',0.52,-0.6,29000000000],['usd-coin','USDC','USDC',1,0.0,32000000000],['dogecoin','Dogecoin','DOGE',0.15,1.4,21000000000],['tron','TRON','TRX',0.12,0.5,10500000000],['the-open-network','Toncoin','TON',6.2,-0.2,15000000000]];
   if(adminEthPrice!==null){const ethDemo=demo.find(d=>d[0]==='ethereum');if(ethDemo)ethDemo[3]=adminEthPrice;}
  demo.forEach(d=>prices[d[0]]={usd:d[3],change:d[4],cap:d[5]});
   rows.innerHTML=coinList.map(c=>{const d=demo.find(x=>x[0]===c[0]);return `<tr><td><div class="coin" role="button" tabindex="0" style="cursor:pointer" onclick="showCoinDetail('${c[0]}')"><span class="coin-icon">${esc(c[2].slice(0,1))}</span><span>${esc(c[1])}<small>${esc(c[2])}</small><small class="user-coin-balance" data-user-coin-balance="${escAttr(c[2])}">Your balance: ${esc(formatCoinHolding(c[2]))}</small></span></div></td><td class="price">${d?fmt(d[3]):'—'}</td><td class="${d?(d[4]>=0?'green':'red'):''}">${d?(d[4]>=0?'+':'')+d[4].toFixed(2)+'%':'—'}</td><td>${d?shortMoney(d[5]):'—'}</td><td><button class="btn-quiet small" onclick="showCoinDetail('${c[0]}')">View</button></td></tr>`}).join('');
   document.getElementById('topBTC').textContent=fmt(prices.bitcoin.usd);
   document.getElementById('topETH').textContent=fmt(prices.ethereum.usd);
   setChange('btcChange',prices.bitcoin.change);setChange('ethChange',prices.ethereum.change);
   updatePortfolioDisplay();calcTrade();renderProfitChart();renderHomeTrending();
}
}
function renderHomeTrending(){const host=document.getElementById('homeTrending');if(!host)return;const picks=['bitcoin','ethereum','solana','binancecoin'];host.innerHTML=picks.map(id=>{const c=coinList.find(x=>x[0]===id),p=prices[id]||{},chg=Number(p.change);return `<button class="trend-item" onclick="showCoinDetail('${id}')"><span class="trend-top"><span class="coin-icon">${c[2][0]}</span><span class="muted small">${c[2]}</span><span class="trend-arrow">↗</span></span><strong>${c[1]}</strong><b>${fmt(p.usd)}</b><small class="${chg>=0?'green':'red'}">${signedPercent(chg)} <span>24h</span></small></button>`}).join('')}
function setChange(id,v){let el=document.getElementById(id);if(!Number.isFinite(Number(v))){el.textContent='24h change unavailable';return}el.textContent=(v>=0?'+':'')+Number(v).toFixed(2)+'% in 24h';el.className=(v>=0?'green':'red')+' small'}
let detailCoinId=null,detailChartDays=1,detailWatchlist={};
function closeCoinDetail(){document.getElementById('coinDetailOverlay').classList.remove('show');if(detailRetryTimer)clearTimeout(detailRetryTimer)}
function toggleDetailWatch(){if(!detailCoinId)return;detailWatchlist[detailCoinId]=!detailWatchlist[detailCoinId];document.getElementById('detailWatch').textContent=detailWatchlist[detailCoinId]?'★':'☆'}
function compactNumber(n){n=Number(n);if(!Number.isFinite(n))return '—';if(n>=1e12)return '$'+(n/1e12).toFixed(2)+'T';if(n>=1e9)return '$'+(n/1e9).toFixed(2)+'B';if(n>=1e6)return '$'+(n/1e6).toFixed(2)+'M';return '$'+n.toLocaleString(undefined,{maximumFractionDigits:2})}
function signedPercent(v){return Number.isFinite(Number(v))?(Number(v)>=0?'+':'')+Number(v).toFixed(2)+'%':'—'}
async function showCoinDetail(id){const coin=coinList.find(c=>c[0]===id);if(!coin)return;detailCoinId=id;detailChartDays=1;const q=prices[id]||{};document.getElementById('coinDetailTitle').textContent=coin[2]+'/USDT';document.getElementById('coinDetailName').textContent=coin[1];document.getElementById('coinDetailPrice').textContent=fmt(q.usd);document.getElementById('coinDetailLocal').textContent='Indicative USD price';document.getElementById('coinDetailChange').textContent='24h '+signedPercent(q.change);document.getElementById('coinDetailChange').className='detail-price-change '+(Number(q.change)>=0?'green':'red');document.getElementById('detailCap').textContent=compactNumber(q.cap);document.getElementById('detailHigh').textContent='—';document.getElementById('detailLow').textContent='—';document.getElementById('detailVolume').textContent='—';document.getElementById('detailWatch').textContent=detailWatchlist[id]?'★':'☆';['perf1','perf7','perf30','perf90'].forEach(k=>document.getElementById(k).textContent='—');document.querySelectorAll('[data-detail-days]').forEach(b=>b.classList.toggle('active',b.dataset.detailDays==='1'));document.getElementById('coinDetailOverlay').classList.add('show');if(detailRetryTimer)clearTimeout(detailRetryTimer);await loadCoinChart(1)}
function binanceSymbolForCoin(id){
 const map={'bitcoin':'BTCUSDT','ethereum':'ETHUSDT','binancecoin':'BNBUSDT','solana':'SOLUSDT','ripple':'XRPUSDT','dogecoin':'DOGEUSDT','tron':'TRXUSDT','the-open-network':'TONUSDT','cardano':'ADAUSDT','avalanche-2':'AVAXUSDT','shiba-inu':'SHIBUSDT','chainlink':'LINKUSDT','polkadot':'DOTUSDT','bitcoin-cash':'BCHUSDT','litecoin':'LTCUSDT','stellar':'XLMUSDT','near':'NEARUSDT','uniswap':'UNIUSDT','internet-computer':'ICPUSDT','aptos':'APTUSDT','arbitrum':'ARBUSDT','optimism':'OPUSDT','cosmos':'ATOMUSDT','filecoin':'FILUSDT','hedera-hashgraph':'HBARUSDT','vechain':'VETUSDT','render-token':'RENDERUSDT','pepe':'PEPEUSDT','ethereum-classic':'ETCUSDT','algorand':'ALGOUSDT','aave':'AAVEUSDT','maker':'MKRUSDT','injective-protocol':'INJUSDT','the-graph':'GRTUSDT','sui':'SUIUSDT','sei-network':'SEIUSDT','mantle':'MNTUSDT'};
 return map[id]||null;
}
async function fetchWithTimeout(url,ms=10000){
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),ms);
 try{return await fetch(url,{signal:controller.signal,headers:{accept:'application/json'}})}
 finally{clearTimeout(timer)}
}
function drawDetailCandles(candles,source,days){
 const svg=document.getElementById('coinDetailChart');
 const vals=candles.flatMap(c=>[c.h,c.l]),lo=Math.min(...vals),hi=Math.max(...vals),span=hi-lo||Math.max(1,hi*.001);
 const y=n=>245-(n-lo)/span*205,xstep=780/Math.max(1,candles.length);
 let candleSvg='',volSvg='';const maxVol=Math.max(1,...candles.map(c=>c.v||0));
 candles.forEach((c,i)=>{const x=10+i*xstep+xstep/2,up=c.c>=c.o,color=up?'#20c997':'#ff647c',top=Math.min(y(c.o),y(c.c)),height=Math.max(2,Math.abs(y(c.o)-y(c.c)));candleSvg+=`<line x1="${x}" y1="${y(c.h)}" x2="${x}" y2="${y(c.l)}" stroke="${color}" stroke-width="2"/><rect x="${x-xstep*.29}" y="${top}" width="${Math.max(3,xstep*.58)}" height="${height}" fill="${color}" rx="1"/>`;const vh=((c.v||0)/maxVol)*45;volSvg+=`<rect x="${x-xstep*.29}" y="${315-vh}" width="${Math.max(3,xstep*.58)}" height="${vh}" fill="${color}" opacity=".8"/>`});
 const line=candles.map((c,i)=>(10+i/(candles.length-1)*780)+','+y(c.c)).join(' ');
 svg.innerHTML='<defs><linearGradient id="detailFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#20c997" stop-opacity=".18"/><stop offset="1" stop-color="#20c997" stop-opacity="0"/></linearGradient></defs><g stroke="#283650" stroke-width="1"><path d="M0 40H800M0 90H800M0 140H800M0 190H800M0 245H800M0 285H800"/></g><polygon points="'+line+' 790,245 10,245" fill="url(#detailFill)"/><g>'+candleSvg+'</g><g>'+volSvg+'</g><polyline points="'+line+'" fill="none" stroke="#e0c35c" stroke-width="1.5" opacity=".85"/>';
 const close=candles.map(c=>c.c),latest=close[close.length-1],first=close[0],pct=first?((latest-first)/first*100):NaN;
 document.getElementById('coinDetailPrice').textContent=fmt(latest);document.getElementById('detailChartRange').textContent='High '+fmt(hi)+'   Low '+fmt(lo);
 document.getElementById('detailHigh').textContent=fmt(hi);document.getElementById('detailLow').textContent=fmt(lo);
 document.getElementById('detailVolume').textContent=compactNumber(candles.reduce((a,c)=>a+(c.v||0),0));
 document.getElementById('coinDetailChange').textContent=(days===1?'24h ':'Period ')+signedPercent(pct);
 document.getElementById('coinDetailChange').className='detail-price-change '+(pct>=0?'green':'red');
 document.getElementById('perf'+(days===7?7:days===30?30:days===90?90:1)).textContent=signedPercent(pct);
 document.getElementById('coinDetailStatus').textContent=source+' live candlestick data · refreshes automatically';
}
async function loadCoinChart(days,button){
 if(!detailCoinId)return;detailChartDays=days;
 if(button){document.querySelectorAll('[data-detail-days]').forEach(b=>b.classList.remove('active'));button.classList.add('active')}
 const svg=document.getElementById('coinDetailChart'),status=document.getElementById('coinDetailStatus');
 document.getElementById('detailChartLabel').textContent='Price trend ('+(days===1?'24H':days+'D')+')';
 status.textContent='Connecting to live market providers…';svg.innerHTML='<text x="400" y="160" fill="#93a3bf" text-anchor="middle">Loading live candles…</text>';
 const symbol=binanceSymbolForCoin(detailCoinId),interval=days===1?'1h':days===7?'4h':'1d',limit=days===1?24:days===7?42:days===30?30:90;
 if(symbol){
  try{
   const r=await fetchWithTimeout('https://api.binance.com/api/v3/klines?symbol='+symbol+'&interval='+interval+'&limit='+limit,10000);
   if(!r.ok)throw new Error('Binance chart endpoint '+r.status);
   const rows=await r.json(),candles=rows.map(k=>({o:+k[1],h:+k[2],l:+k[3],c:+k[4],v:+k[5]})).filter(c=>[c.o,c.h,c.l,c.c].every(Number.isFinite));
   if(candles.length<3)throw new Error('Insufficient Binance candles');
   drawDetailCandles(candles,'Binance',days);return;
  }catch(err){console.warn('Binance chart unavailable; trying CoinGecko:',err)}
 }
 try{
  const r=await fetchWithTimeout('https://api.coingecko.com/api/v3/coins/'+encodeURIComponent(detailCoinId)+'/market_chart?vs_currency=usd&days='+days,12000);
  if(!r.ok)throw new Error('CoinGecko chart endpoint '+r.status);
  const j=await r.json(),raw=(j.prices||[]).filter(x=>Number.isFinite(Number(x[1]))),vol=j.total_volumes||[];
  if(raw.length<3)throw new Error('Not enough CoinGecko samples');
  const groups=Math.min(36,raw.length),bucket=Math.ceil(raw.length/groups),candles=[];
  for(let i=0;i<raw.length;i+=bucket){const chunk=raw.slice(i,i+bucket).map(x=>Number(x[1]));candles.push({o:chunk[0],c:chunk[chunk.length-1],h:Math.max(...chunk),l:Math.min(...chunk),v:Number(vol[Math.min(i,vol.length-1)]?.[1]||0)})}
  drawDetailCandles(candles,'CoinGecko',days);
 }catch(e){
  console.error('All live chart providers failed:',e);status.textContent='Live feeds are temporarily unreachable. Retrying automatically…';
  svg.innerHTML='<g stroke="#283650"><path d="M0 40H800M0 100H800M0 160H800M0 220H800M0 280H800"/></g><text x="400" y="160" fill="#93a3bf" text-anchor="middle">Live data connection interrupted · retrying…</text>';
  scheduleDetailRetry();
 }
}
function setDetailTab(tab){
 document.querySelectorAll('[data-detail-tab]').forEach(b=>b.classList.toggle('selected',b.dataset.detailTab===tab));
 const box=document.getElementById('detailTabInfo'),coin=coinList.find(c=>c[0]===detailCoinId);if(!coin)return;
 const q=prices[detailCoinId]||{};
 const copy={price:'Live price and candlestick chart for '+coin[1]+' ('+coin[2]+').',info:coin[1]+' ('+coin[2]+') · Indicative USD market price. Live prices depend on public exchange feeds.',data:'24h high: '+document.getElementById('detailHigh').textContent+' · 24h low: '+document.getElementById('detailLow').textContent+' · 24h volume: '+document.getElementById('detailVolume').textContent,overview:'24h change: '+signedPercent(q.change)+' · Market cap: '+compactNumber(q.cap)+'.'};
 box.textContent=copy[tab]||copy.price;box.hidden=tab==='price';
}

let detailRetryTimer=null;
function scheduleDetailRetry(){if(detailRetryTimer)clearTimeout(detailRetryTimer);if(document.getElementById('coinDetailOverlay')?.classList.contains('show'))detailRetryTimer=setTimeout(()=>loadCoinChart(detailChartDays),15000)}
function coinDetailTrade(which){
  if(!detailCoinId)return;
  closeCoinDetail();setCoin(detailCoinId);setSide(which);
  window.openNavPanel?.(which==='Buy'?'buy-live':'sell-live');
  document.getElementById('tradeMsg').textContent=which+' '+selectedCoin[1]+' selected. Enter quantity and review the order.';
}

function openAccountPanel(){
 const panel=document.getElementById('accountOverlay');
 if(!currentUser){closeAccountPanel();openAuth('login');return}
 document.getElementById('accountPanelUsername').textContent=currentUser;
 document.getElementById('accountPanelBalance').textContent=(Number(usdtBalance)||0).toFixed(2)+' USDT';
 document.getElementById('accountHistoryPanel').classList.add('hidden');
 document.getElementById('accountHistoryPanel').innerHTML='';
 panel.classList.add('show');
}
function closeAccountPanel(){document.getElementById('accountOverlay').classList.remove('show')}
function historyRow(title, detail, status, date){
 const safeStatus=escapeTradeText(status||'—');
 return '<div class="account-history-item"><b>'+escapeTradeText(title)+'</b><br>'+detail+'<br><span class="pill">'+safeStatus+'</span> <span class="muted">'+escapeTradeText(date||'')+'</span></div>';
}
async function loadAccountHistory(kind){
 if(!currentUser){closeAccountPanel();openAuth('login');return}
 const page=document.getElementById('historyPage'),content=document.getElementById('historyPageContent');
 const titles={'deposit-history':'Deposit History','withdraw-history':'Withdrawal History','all-history':'All Account History','trade-history':'Trade History'};
 document.getElementById('historyPageTitle').textContent=titles[kind]||'Account History';
 document.getElementById('historyDepositCount').textContent='—';
 document.getElementById('historyWithdrawCount').textContent='—';
 document.getElementById('historyCurrentBalance').textContent=(Number(usdtBalance)||0).toFixed(2)+' USDT';
 content.innerHTML='<div class="loading">Loading secure account history…</div>';
 closeAccountPanel();page.classList.add('show');page.setAttribute('aria-hidden','false');document.body.style.overflow='hidden';
 if(!supabaseClient){content.innerHTML='<div class="history-empty"><strong>Connection unavailable</strong>Please try again later.</div>';return}
 try{
  const [dep,wd]=await Promise.all([
   supabaseClient.from('deposit_requests').select('amount,tx_hash,status,created_at').order('created_at',{ascending:false}).limit(100),
   supabaseClient.from('withdrawal_requests').select('amount_usdt,destination_address,status,admin_note,created_at,updated_at').order('created_at',{ascending:false}).limit(100)
  ]);
  if(dep.error)throw dep.error;if(wd.error)throw wd.error;
  const deposits=dep.data||[],withdrawals=wd.data||[],trades=(typeof getTradeLog==='function'?getTradeLog():[]);
  document.getElementById('historyDepositCount').textContent=String(deposits.length);
  document.getElementById('historyWithdrawCount').textContent=String(withdrawals.length);
  document.getElementById('historyCurrentBalance').textContent=(Number(usdtBalance)||0).toFixed(2)+' USDT';
  const items=[];
  if(kind==='all-history'||kind==='deposit-history')deposits.forEach(r=>items.push({t:new Date(r.created_at).getTime()||0,h:historyRow('Deposit · '+fmtTradeNum(r.amount,4)+' USDT','Transaction Hash: '+escapeTradeText((r.tx_hash||'').slice(0,22))+(r.tx_hash&&r.tx_hash.length>22?'…':''),r.status,new Date(r.created_at).toLocaleString())}));
  if(kind==='all-history'||kind==='withdraw-history')withdrawals.forEach(r=>items.push({t:new Date(r.created_at).getTime()||0,h:historyRow('Withdrawal · '+fmtTradeNum(r.amount_usdt,4)+' USDT','Destination: '+escapeTradeText((r.destination_address||'').slice(0,20))+(r.destination_address&&r.destination_address.length>20?'…':'')+(r.admin_note?' · Note: '+escapeTradeText(r.admin_note):''),r.status,new Date(r.created_at).toLocaleString())}));
  if(kind==='all-history'||kind==='trade-history')trades.forEach(r=>items.push({t:new Date(r.createdAt).getTime()||0,h:historyRow(escapeTradeText(r.side)+' '+escapeTradeText(r.symbol),fmtTradeNum(r.quantity)+' '+escapeTradeText(r.symbol)+' · '+fmtTradeNum(r.bond,4)+' USDT','Completed',new Date(r.createdAt).toLocaleString())}));
  items.sort((a,b)=>b.t-a.t);
  content.innerHTML=items.length?items.map(x=>x.h).join(''):'<div class="history-empty"><strong>No transactions yet</strong>Your completed and pending records will appear here.</div>';
 }catch(e){content.innerHTML='<div class="history-empty"><strong>Unable to load history</strong>'+escapeTradeText(e.message||'Please try again later.')+'</div>'}
}
function closeHistoryPage(){const page=document.getElementById('historyPage');page.classList.remove('show');page.setAttribute('aria-hidden','true');document.body.style.overflow='';}
function accountAction(action){
 if(!currentUser){closeAccountPanel();openAuth('login');return}
 if(action==='deposit'||action==='withdraw'){closeAccountPanel();openSupport(action);return}
 if(action==='password'){closeAccountPanel();openPasswordChange();return}
 if(action==='customer-support'){closeAccountPanel();openTelegram();return}
 loadAccountHistory(action);
}

function marketTrade(id,which){
 const coin=coinList.find(c=>c[0]===id);
 if(!coin)return;
 setCoin(id);setSide(which);
 window.openNavPanel?.(which==='Buy'?'buy-live':'sell-live');
 document.getElementById('tradeMsg').textContent=which+' '+coin[1]+' at the displayed live market quote. Enter the amount and confirm to execute using your Treasury balance.';
 document.getElementById('tradeAmount').focus();
}
function chooseCoin(id){setCoin(id);document.getElementById('trade').scrollIntoView({behavior:'smooth'});document.getElementById('tradeMsg').textContent=selectedCoin[1]+' selected. Choose Buy or Sell, enter an amount, then click Order.'}
function esc(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function escAttr(s){return String(s).replace(/[^a-z0-9-]/gi,'')}
function openAuth(mode){setAuthMode(mode);document.getElementById('authOverlay').classList.add('show')}
function closeAuth(){document.getElementById('authOverlay').classList.remove('show')}
function setAuthMode(mode){authMode=mode;document.getElementById('authTitle').textContent=mode==='login'?'Welcome back':'Create account';document.getElementById('authSubmit').textContent=mode==='login'?'Login':'Register';document.getElementById('authForgotButton').classList.toggle('hidden',mode!=='login');document.getElementById('loginMode').classList.toggle('active',mode==='login');document.getElementById('registerMode').classList.toggle('active',mode==='register');document.getElementById('authMsg').textContent='';document.getElementById('password').autocomplete=mode==='login'?'current-password':'new-password'}
// Supabase backend configuration (phone + password, no OTP).
// In Supabase Dashboard, Authentication > Providers > Phone: enable Phone provider.
// In Authentication settings, turn OFF 'Confirm phone' to avoid OTP confirmation.
// This means phone ownership is NOT verified. Never put a service_role key in a browser file.
const SUPABASE_URL = 'https://aagsmafemvtmepoorfbd.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_e0xe_e6Jo181m4oAP7hkQA_aVwIYwJA';
let supabaseClient = null;
let backendReady = false;
try {
  if (window.supabase && SUPABASE_URL.startsWith('https://') && !SUPABASE_URL.includes('PASTE_') && !SUPABASE_ANON_KEY.includes('PASTE_')) {
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    backendReady = true;
  }
} catch (err) { console.error('Supabase initialization failed:', err); }

function normalizePhone(raw, code){
 const input=String(raw||'').trim().replace(/[\s().-]/g,'');
 let phone;
 if(input.startsWith('+')) phone='+'+input.slice(1).replace(/\D/g,'');
 else phone=code+input.replace(/\D/g,'').replace(/^0+/,'');
 return phone;
}
function isValidInternationalPhone(phone){
 if(!/^\+[1-9]\d{7,14}$/.test(phone)) return false;
 if(phone.startsWith('+880')) return /^\+8801\d{9}$/.test(phone);
 return true;
}
document.getElementById('authForm').addEventListener('submit', async e=>{
 e.preventDefault();
 const rawPhone=document.getElementById('phone').value;
 const code=document.getElementById('countryCode').value;
 const phone=normalizePhone(rawPhone,code);
 const password=document.getElementById('password').value;
 const msg=document.getElementById('authMsg');
 msg.style.color='#ffc2cb';
 if(!isValidInternationalPhone(phone)){
   msg.textContent='Enter your full mobile number with country code, for example +8801XXXXXXXXX.';
   return;
 }
 if(password.length<6){msg.textContent='Password must be at least 6 characters long.';return;}
 if(!backendReady || !supabaseClient){
   msg.textContent='Backend is not connected yet. Add your Supabase URL and anon key to the HTML, then try again.';
   return;
 }
 const submit=document.getElementById('authSubmit');
 submit.disabled=true;
 try {
   if(authMode==='register'){
     const {data,error}=await supabaseClient.auth.signUp({phone,password});
     if(error) throw error;
     if(data.session){
       currentUser=phone;
       msg.style.color='#70e3b6';
       msg.textContent='Account registered successfully.';
       await notifyTelegramEvent('registration',{phone});
       finishLogin();
     } else {
       msg.style.color='#70e3b6';
       msg.textContent='Registration request received. Check whether Confirm Phone is disabled in Supabase; if enabled, an OTP may be required.';
     }
   } else {
     const {data,error}=await supabaseClient.auth.signInWithPassword({phone,password});
     if(error) throw error;
     currentUser=data.user?.phone || phone;
     finishLogin();
   }
 } catch(err) {
   const raw=String(err?.message||'');
   if(/already registered|already exists|duplicate|unique/i.test(raw)) msg.textContent='An account already exists with this mobile number. Please log in.';
   else if(/invalid login credentials/i.test(raw)) msg.textContent='Incorrect mobile number or password.';
   else msg.textContent='Request failed: '+raw+' (Check your Supabase Phone Auth settings.)';
 } finally {submit.disabled=false;}
});
if(backendReady){
 supabaseClient.auth.getSession().then(({data})=>{
   if(data?.session?.user?.phone){currentUser=data.session.user.phone;finishLogin();}
 });
 supabaseClient.auth.onAuthStateChange((_event,session)=>{
   if(session?.user?.phone){currentUser=session.user.phone;}
 });
}
async function finishLogin(){document.getElementById('authButton').classList.add('hidden');document.getElementById('logoutButton').classList.remove('hidden');document.getElementById('settingsButton').classList.remove('hidden');document.getElementById('userBadge').classList.remove('hidden');document.getElementById('userBadge').textContent=currentUser;closeAuth();await refreshBalances();calcTrade();renderProfitChart()}
async function refreshBalances(options={}){
 if(!supabaseClient||!currentUser){if(options.strict)throw new Error('Please log in again before withdrawing.');return}
 try{
  // Do not leave the withdrawal screen waiting forever if Supabase does not respond.
  const balanceRequest=supabaseClient.rpc('get_my_balance');
  const timeout=new Promise((_,reject)=>setTimeout(()=>reject(new Error('Balance check timed out. Please check your connection and try again.')),12000));
  const {data,error}=await Promise.race([balanceRequest,timeout]);
  if(error)throw error;
  const rawBalance=(data&&typeof data==='object')?(data.balance??data.usdt_balance??data.amount??0):data;
  const parsedBalance=Number(rawBalance);
  if(!Number.isFinite(parsedBalance)||parsedBalance<0)throw new Error('Supabase returned an invalid USDT balance.');
  usdtBalance=parsedBalance;
  // Withdrawal only needs the verified USDT balance. Do not let the optional
  // coin-holdings RPC block a withdrawal if that separate RPC is slow or unavailable.
  if(!options.strict){
   const holdingsRequest=supabaseClient.rpc('get_my_coin_balances');
   const holdingsTimeout=new Promise((_,reject)=>setTimeout(()=>reject(new Error('Coin balance request timed out.')),8000));
   try{
    const {data:holdings,error:he}=await Promise.race([holdingsRequest,holdingsTimeout]);
    if(!he&&Array.isArray(holdings)){
     coinBalances={};holdings.forEach(x=>{coinBalances[String(x.symbol||'').toUpperCase()]=Number(x.amount)||0});coinBalancesFresh=true;
     document.getElementById('coinHoldings').textContent='Coin holdings: '+(holdings.filter(x=>Number(x.amount)>0).map(x=>Number(x.amount).toLocaleString('en-US',{maximumFractionDigits:8})+' '+String(x.symbol).toUpperCase()).join(', ')||'None');
    }else if(he){coinBalancesFresh=false;console.error('Coin balance load failed',he);document.getElementById('coinHoldings').textContent='Coin balances unavailable';}
   }catch(coinErr){coinBalancesFresh=false;console.error('Coin balance load failed',coinErr);document.getElementById('coinHoldings').textContent='Coin balances unavailable';}
  }
  updatePortfolioDisplay();updateAvailableAmount();calcTrade();updateWithdrawValidation();
  return usdtBalance;
 }catch(err){
  console.error('Balance load failed',err);
  document.getElementById('tradeMsg').textContent='Balance could not be loaded: '+(err.message||'Unknown error');
  if(options.strict)throw err;
  return null;
 }
}
async function logout(){
 // Clear this browser's session locally. This avoids a failed global-revoke
 // request leaving a stale session in the page when the access token is invalid.
 if(backendReady&&supabaseClient){try{await supabaseClient.auth.signOut({scope:'local'})}catch(e){console.warn('Local sign-out warning:',e?.message||e)}}
 currentUser=null;usdtBalance=0;coinBalances={};document.getElementById('authButton').classList.remove('hidden');document.getElementById('logoutButton').classList.add('hidden');document.getElementById('settingsButton').classList.add('hidden');document.getElementById('userBadge').classList.add('hidden');document.getElementById('coinHoldings').textContent='Coin holdings: —';updatePortfolioDisplay();updateAvailableAmount();calcTrade();updateWithdrawValidation();
}
async function previewTrade(){
 const amount=Number(document.getElementById('tradeAmount').value), price=Number(prices[selectedCoin[0]]?.usd), tradeMsg=document.getElementById('tradeMsg');
 if(!currentUser||!supabaseClient){tradeMsg.textContent='Please log in first.';return}
 if(!Number.isFinite(amount)||amount<=0||!Number.isFinite(price)||price<=0){tradeMsg.textContent='Invalid amount or market price.';return}
 const btn=document.getElementById('tradeOrderButton');btn.disabled=true;tradeMsg.style.color='';
 const completedSide=side, completedSymbol=selectedCoin[2], completedCoinName=selectedCoin[1];
 try{
  const {data,error}=await supabaseClient.rpc('convert_usdt_to_coin',{p_symbol:completedSymbol,p_side:completedSide,p_coin_amount:amount,p_usd_price:price});
  if(error)throw error;
  const tradeResult=data||{};
  if(tradeResult.success===false)throw new Error(tradeResult.message||'The order was not completed.');
  recordSuccessfulTrade(completedSide,selectedCoin[0],completedSymbol,amount,price);
  const tradeValue=amount*price;
  const realizedPL=completedSide==='Sell'?Number(tradeResult.realized_profit_loss):null;

  // Refresh the post-trade wallet first so Telegram reports the remaining holdings.
  // A refresh/notification failure must never turn a committed trade into a failed order.
  const refreshedUsdtBalance=await refreshBalances();
  const remainingCoinAmount=refreshedUsdtBalance===null||!coinBalancesFresh
   ? null
   : Number(coinBalances[completedSymbol]||0);
  const currentMarketPrice=Number(prices[selectedCoin[0]]?.usd);
  const remainingCoinValue=remainingCoinAmount!==null&&Number.isFinite(currentMarketPrice)&&currentMarketPrice>0
   ? remainingCoinAmount*currentMarketPrice
   : null;

  try{
   await notifyTelegramEvent(completedSide==='Buy'?'trade_buy':'trade_sell',{
    symbol:completedSymbol,
    coin_amount:amount,
    amount:tradeValue,
    buy_price:completedSide==='Buy'?price:Number.isFinite(Number(tradeResult.average_buy_price))?Number(tradeResult.average_buy_price):null,
    sell_price:completedSide==='Sell'?price:null,
    profit_loss:completedSide==='Sell'&&Number.isFinite(realizedPL)?realizedPL:null,
    profit_loss_basis:completedSide==='Sell'?'realized':'entry_price_at_execution',
    remaining_coin_amount:remainingCoinAmount,
    current_market_price:Number.isFinite(currentMarketPrice)&&currentMarketPrice>0?currentMarketPrice:null,
    remaining_coin_value:remainingCoinValue,
    remaining_usdt_balance:refreshedUsdtBalance,
    transaction_id:tradeResult.transaction_id||null
   });
  }catch(notificationError){console.warn('Trade completed, but Telegram notification failed:',notificationError?.message||notificationError)}
  if(typeof window.showTradeSuccess==='function'){
   window.showTradeSuccess(completedSide==='Buy'
    ? 'Your buy order for '+amount+' '+completedSymbol+' ('+completedCoinName+') was completed successfully.'
    : 'Your sell order for '+amount+' '+completedSymbol+' ('+completedCoinName+') was completed successfully.');
  }else{
   tradeMsg.style.color='#70e3b6';
   tradeMsg.textContent=completedSide==='Buy'?'Conversion successful: '+amount+' '+completedSymbol+' added.':'Conversion successful: '+amount+' '+completedSymbol+' sold.';
  }
 }catch(e){tradeMsg.style.color='#ff8ba0';tradeMsg.textContent='Conversion failed: '+(e.message||'Unknown error')}
 finally{calcTrade()}
}

const TELEGRAM_USERNAME='treasury9'; // Telegram username without @
function telegramUrl(){return 'https://t.me/'+TELEGRAM_USERNAME}
function openTelegram(){window.open(telegramUrl(),'_blank','noopener,noreferrer')}
// Obtain a current Supabase access token before calling authenticated Edge Functions.
// A stale or missing session is refreshed where possible; secrets remain server-side.
async function getFreshAccessToken(){
 if(!supabaseClient)throw new Error('Supabase is not connected.');
 let {data,error}=await supabaseClient.auth.getSession();
 if(error)throw new Error('Could not read login session: '+error.message);
 let session=data?.session||null;
 const expiresSoon=session?.expires_at && (Number(session.expires_at)*1000 < Date.now()+60000);
 if(!session?.access_token || expiresSoon){
  const refreshed=await supabaseClient.auth.refreshSession();
  if(refreshed.error)throw new Error('Your login session has expired. Please log out and log in again.');
  session=refreshed.data?.session||null;
 }
 if(!session?.access_token)throw new Error('Login session not found. Please log out and log in again.');
 return session.access_token;
}

// Call an Edge Function with the verified current user's access token explicitly.
async function invokeAuthenticatedFunction(functionName,body){
 const accessToken=await getFreshAccessToken();
 const {data,error}=await supabaseClient.functions.invoke(functionName,{
  body,
  headers:{Authorization:'Bearer '+accessToken}
 });
 if(error){
  let detail='';
  try{
   if(error.context && typeof error.context.clone==='function'){
    const response=error.context.clone();
    const parsed=await response.json();
    detail=String(parsed?.error||parsed?.message||'');
   }
  }catch(_){ }
  throw new Error(detail||error.message||('Edge Function '+functionName+' failed'));
 }
 return data;
}

// Send event notifications through the authenticated Supabase Edge Function.
// No Telegram token or internal secret is ever placed in this public HTML.
async function notifyTelegramEvent(event, details={}){
 if(!supabaseClient)return {ok:false,error:'Supabase is not connected'};
 try{
  const data=await invokeAuthenticatedFunction('quick-action',{event,...details});
  if(!data||data.success!==true)throw new Error(data?.error||'Notification was not accepted');
  return {ok:true};
 }catch(err){console.warn('Telegram notification failed:',err?.message||err);return {ok:false,error:err?.message||'Notification failed'};}
}

const depositAmountInput=document.getElementById('depositAmount');
depositAmountInput.addEventListener('input',()=>{
 const amount=Number(depositAmountInput.value);
 const valid=Number.isFinite(amount)&&amount>=100;
 document.getElementById('depositNextButton').disabled=!valid;
 document.getElementById('depositAmountMsg').textContent=depositAmountInput.value&&!valid?'Minimum deposit is 100 USDT.':'';
});
document.getElementById('depositTxHash').addEventListener('input',()=>{
 document.getElementById('depositCompleteButton').disabled=!document.getElementById('depositTxHash').value.trim();
});
function showDepositPayment(){
 const amount=Number(depositAmountInput.value);
 if(!Number.isFinite(amount)||amount<100){document.getElementById('depositAmountMsg').textContent='Minimum deposit is 100 USDT.';return}
 document.getElementById('depositSelectedAmount').value=amount.toString();
 document.getElementById('depositAmountStep').classList.add('hidden');
 document.getElementById('depositPaymentStep').classList.remove('hidden');
}
async function copyDepositAddress(){
 const address='T9yenz4CJX7qevWvQZxfmGPwNQdGoveF1a';
 document.getElementById('depositAddress').value=address;
 try{await navigator.clipboard.writeText(address);document.getElementById('depositPaymentMsg').textContent='Address copied.'}
 catch(e){document.getElementById('depositAddress').select();document.getElementById('depositPaymentMsg').textContent='Address selected. Copy it manually.'}
}
async function completeDeposit(){
 const hash=document.getElementById('depositTxHash').value.trim();
 const amount=Number(document.getElementById('depositSelectedAmount').value);
 const msg=document.getElementById('depositPaymentMsg'),btn=document.getElementById('depositCompleteButton');
 if(!currentUser||!supabaseClient){msg.textContent='Please log in before submitting a deposit request.';return}
 if(!hash||!Number.isFinite(amount)||amount<100){msg.textContent='Please enter a valid amount and transaction hash.';return}
 btn.disabled=true;msg.textContent='Submitting your deposit request…';
 try{
  const {data,error}=await supabaseClient.functions.invoke('submit-deposit-request',{
   body:{tx_hash:hash,amount}
  });
  if(error){
   // Read the server error message from the Supabase FunctionsHttpError response body.
   let serverMessage='';
   try{
    if(error.context && typeof error.context.clone==='function'){
     const errorBody=await error.context.clone().json();
     serverMessage=String(errorBody?.error||'');
    }
   }catch(_){}
   if(serverMessage==='') serverMessage=error.message||'Request submission failed';
   const duplicateMessage='This transaction has already been used. Please enter a new transaction hash.';
   if(serverMessage.toLowerCase().includes('duplicate') || serverMessage.toLowerCase().includes('already exists') || serverMessage.toLowerCase().includes('this transaction has already been used')){
    throw new Error(duplicateMessage);
   }
   throw new Error(serverMessage);
  }
  if(!data||data.success!==true)throw new Error(data?.error||'Request submission failed');
  // Telegram alert runs silently; it must not block or replace the customer confirmation page.
  if(data.telegram_sent!==true){
   notifyTelegramEvent('deposit',{amount,tx_hash:hash,network:'TRC20',transaction_id:data.request_id||data.id||null,status:'Pending'}).catch(()=>{});
  }
  showTransactionSuccessPage('deposit',{
   order:data.request_id||data.id||('DEP-'+Date.now()),
   amount:amount,
   reference:hash,
   status:'PENDING'
  });
  document.getElementById('depositTxHash').value='';
  loadAccountHistory('deposit-history').catch(()=>{});
 }catch(e){
  const message=e.message||'Unknown error';
  msg.textContent=message.toLowerCase().includes('this transaction has already been used')
   ? message
   : 'Deposit request was not submitted: '+message;
  msg.style.color=message.toLowerCase().includes('this transaction has already been used')?'#dc2626':'';
 }
 finally{btn.disabled=false;document.getElementById('depositCompleteButton').disabled=!document.getElementById('depositTxHash').value.trim()}
}
function openSupport(kind){
 document.getElementById('supportTitle').textContent=kind==='deposit'?'Deposit':kind==='withdraw'?'Withdraw':'Online Customer Support';
 document.getElementById('supportStandard').classList.toggle('hidden',kind!=='general');
 document.getElementById('depositPanel').classList.toggle('hidden',kind!=='deposit');
 document.getElementById('withdrawForm').classList.toggle('hidden',kind!=='withdraw');
 document.getElementById('withdrawMsg').textContent='';
 document.getElementById('withdrawMsg').style.color='';
 if(kind==='withdraw'){ 
  document.getElementById('withdrawForm').reset();
  updateWithdrawValidation();
 }
  if(kind==='deposit'){
   document.getElementById('depositAmountStep').classList.remove('hidden');
   document.getElementById('depositPaymentStep').classList.add('hidden');
   document.getElementById('depositAmount').value='';
   document.getElementById('depositNextButton').disabled=true;
   document.getElementById('depositAmountMsg').textContent='';
   document.getElementById('depositTxHash').value='';
   document.getElementById('depositCompleteButton').disabled=true;
   document.getElementById('depositPaymentMsg').textContent='';
  }
 document.getElementById('withdrawForm').reset();
 document.getElementById('contactTelegramLink').href=telegramUrl();
 document.querySelectorAll('#depositPanel a, #settingsOverlay a, #forgotOverlay a').forEach(a=>a.href=telegramUrl());
 document.getElementById('supportOverlay').classList.add('show');
 document.body.style.overflow='hidden';
}

function closeSupport(){document.getElementById('supportOverlay').classList.remove('show');document.body.style.overflow='';}
function setWithdrawMax(){
 const amountInput=document.getElementById('withdrawAmount');
 const available=Number(usdtBalance)||0;
 amountInput.value=available>0?String(available):'';
 updateWithdrawValidation();
}
function amountInputHasValue(){return document.getElementById('withdrawAmount').value.trim()!==''}
function updateWithdrawValidation(){
 const address=document.getElementById('withdrawAddress').value.trim();
 const amount=Number(document.getElementById('withdrawAmount').value);
 const button=document.getElementById('confirmWithdrawButton');
 const msg=document.getElementById('withdrawMsg');
 const available=document.getElementById('withdrawAvailable');
 available.textContent='Available USDT: '+(Number(usdtBalance)||0).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:8})+' USDT';
 const amountValid=Number.isFinite(amount)&&amount>=100;
 const overBalance=amountValid&&amount>Number(usdtBalance)+1e-8;
 // Hide the confirmation button when the requested USDT exceeds the actual USDT balance.
 button.style.display=overBalance?'none':'';
 button.disabled=!(currentUser&&address&&amountValid&&!overBalance);
 if(!currentUser){msg.textContent='Please log in before withdrawing.'}
 else if(amountInputHasValue()&&amount<100){msg.textContent='Minimum withdrawal is 100 USDT.';}
 else if(overBalance){msg.textContent='You cannot withdraw more than your available USDT balance.';}
 else if(amountInputHasValue()&&!amountValid){msg.textContent='Enter a valid amount.'}
 else{msg.textContent='';}
}
document.getElementById('withdrawAddress').addEventListener('input',updateWithdrawValidation);
document.getElementById('withdrawAmount').addEventListener('input',updateWithdrawValidation);
document.getElementById('withdrawForm').addEventListener('submit',async function(e){
 e.preventDefault();
 const address=document.getElementById('withdrawAddress').value.trim();
 const amount=Number(document.getElementById('withdrawAmount').value);
 const msg=document.getElementById('withdrawMsg'),btn=document.getElementById('confirmWithdrawButton');
 if(!currentUser||!supabaseClient||!address||!Number.isFinite(amount)||amount<100){msg.textContent=amount<100?'Minimum withdrawal is 100 USDT.':'A valid address, amount, and login session are required.';updateWithdrawValidation();return}
 btn.disabled=true;msg.style.color='';msg.textContent='';
 // Open the confirmation screen immediately; the request is still verified and saved by Supabase below.
 showTransactionSuccessPage('withdrawal',{order:'Preparing request…',amount:amount,reference:address,status:'PROCESSING'});
 try{
  // Refresh/validate the user's session before the balance RPC and withdrawal call.
  await getFreshAccessToken();
  msg.textContent='Checking your latest available balance…';
  await refreshBalances({strict:true});
  msg.textContent='Balance verified. Preparing your withdrawal request…';
  if(amount>Number(usdtBalance)+1e-8)throw new Error('Your latest available USDT balance is insufficient for this withdrawal.');
  msg.textContent=''; // Keep the withdrawal submission silent; errors and success remain visible.
  const data=await invokeAuthenticatedFunction('submit-withdrawal',{
   destination_address:address,
   amount_usdt:amount,
   network:'TRC20'
  });
  if(!data||(data.ok!==true&&data.success!==true))throw new Error(data?.error||data?.message||'The server did not confirm the withdrawal request.');
  const withdrawalRequestId=data.request_id||data.withdrawal_id||data.id||data.reference||null;
  if(!withdrawalRequestId){
   msg.style.color='#f5d58b';
   msg.textContent='The server responded, but did not return a request number. Please check Withdrawal History before submitting again.';
   showTransactionSuccessPage('withdrawal',{order:'Check Withdrawal History',amount:amount,reference:address,status:'PENDING'});
   document.getElementById('successPageNote').textContent='The server responded, but did not return a reference number. Check Withdrawal History before submitting again.';
   return;
  }
  // Notification is intentionally non-blocking; the request is already saved.
  if(data.telegram_sent!==true){
   notifyTelegramEvent('withdrawal',{amount,address,network:'TRC20',transaction_id:withdrawalRequestId,status:'Pending'}).catch(()=>{});
  }
  showTransactionSuccessPage('withdrawal',{
   order:withdrawalRequestId,
   amount:amount,
   reference:address,
   status:'PENDING'
  });
  document.getElementById('withdrawForm').reset();
  refreshBalances().catch(()=>{});
 }catch(err){
  console.error('Withdrawal submission failed:',err);
  msg.style.color='#ff8ba0';
  msg.textContent='Request was not submitted: '+(err?.message||'Unknown error');
  showTransactionSuccessPage('withdrawal',{order:'Not submitted',amount:amount,reference:address,status:'FAILED',error:err?.message||'Unknown error'});
 }
 finally{
  // Recalculate button validity without erasing the server error shown above.
  const finalMessage=msg.textContent;
  const finalColor=msg.style.color;
  btn.disabled=false;
  updateWithdrawValidation();
  if(finalMessage){msg.textContent=finalMessage;msg.style.color=finalColor;}
 }
});
function showTransactionSuccessPage(type, details){
 const isDeposit=type==='deposit';
 const state=details.status||'PENDING';
 const page=document.getElementById('transactionSuccessPage');
 document.getElementById('successBrandTitle').textContent='TREASURY';
 document.getElementById('successPageTitle').textContent=isDeposit?'DEPOSIT REQUEST SUCCESSFUL':state==='PROCESSING'?'WITHDRAWAL REQUEST':state==='FAILED'?'WITHDRAWAL REQUEST FAILED':'WITHDRAWAL REQUEST SUCCESSFUL';
 document.getElementById('successPageSubtitle').textContent=isDeposit?'Your deposit request has been received successfully.':state==='PROCESSING'?'Your request is being securely submitted. Please wait.':state==='FAILED'?'Your withdrawal request could not be submitted.':'Your withdrawal request has been received successfully.';
 document.getElementById('successDetailAmount').textContent=Number(details.amount||0).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:8})+' USDT';
 document.getElementById('successReferenceLabel').textContent=isDeposit?'TRANSACTION HASH':'WITHDRAWAL ADDRESS';
 document.getElementById('successReferenceValue').textContent=String(details.reference||'—');
 document.getElementById('successOrderValue').textContent=String(details.order||'—');
 document.getElementById('successPageNote').textContent=isDeposit
  ? 'Your request has been safely recorded.'
  : state==='PROCESSING'?'Please keep this page open while your request is being submitted.':state==='FAILED'?'Error: '+String(details.error||'Please try again or check Withdrawal History.'):'Your withdrawal request is recorded and is awaiting admin review. Funds are not marked as sent until processing is completed.';
 document.getElementById('successPageStatus').textContent=state==='PROCESSING'?'SUBMITTING':state==='FAILED'?'NOT SUBMITTED':'PENDING REVIEW';
 page.classList.add('show');
 document.body.style.overflow='hidden';
 try{history.pushState({treasuryConfirmation:true},'', '#'+(isDeposit?'deposit-success':'withdrawal-success'));}catch(_){}
}
function closeTransactionSuccessPage(){
 const page=document.getElementById('transactionSuccessPage');
 page.classList.remove('show');
 document.body.style.overflow='';
 try{if(location.hash==='\u0023deposit-success'||location.hash==='\u0023withdrawal-success')history.replaceState(null,'',location.pathname+location.search);}catch(_){}
}
window.addEventListener('popstate',()=>{
 const page=document.getElementById('transactionSuccessPage');
 if(page&&page.classList.contains('show'))closeTransactionSuccessPage();
});
function openSettings(){if(!currentUser){openAuth('login');return}document.getElementById('settingsUsername').textContent=currentUser;document.getElementById('settingsOverlay').classList.add('show')}
function closeSettings(){document.getElementById('settingsOverlay').classList.remove('show')}
function openPasswordChange(){
 if(!currentUser||!supabaseClient){closeForgotPassword();openAuth('login');return}
 closeSettings();document.getElementById('passwordChangeForm').reset();
 document.getElementById('passwordChangeMsg').textContent='';
 document.getElementById('passwordChangeMsg').style.color='#ffc2cb';
 document.getElementById('forgotTitle').textContent='Change Account Password';
 document.getElementById('forgotOverlay').classList.add('show');
}
function openForgotPassword(){openPasswordChange()}
function openForgotPasswordFromAuth(){closeAuth();openPasswordChange()}
function closeForgotPassword(){document.getElementById('forgotOverlay').classList.remove('show')}
document.getElementById('passwordChangeForm').addEventListener('submit',async e=>{
 e.preventDefault();
 const current=document.getElementById('currentAccountPassword').value;
 const next=document.getElementById('newAccountPassword').value;
 const confirm=document.getElementById('confirmAccountPassword').value;
 const msg=document.getElementById('passwordChangeMsg'),btn=document.getElementById('passwordChangeSubmit');
 msg.style.color='#ffc2cb';
 if(!currentUser||!supabaseClient){msg.textContent='Please log in again.';return}
 if(next.length<6){msg.textContent='New password must be at least 6 characters.';return}
 if(next!==confirm){msg.textContent='New password and confirmation do not match.';return}
 if(current===next){msg.textContent='Choose a password different from your current password.';return}
 btn.disabled=true;btn.textContent='Updating…';
 try{
  const {error:verifyError}=await supabaseClient.auth.signInWithPassword({phone:currentUser,password:current});
  if(verifyError)throw new Error('Current password is incorrect.');
  const {error:updateError}=await supabaseClient.auth.updateUser({password:next});
  if(updateError)throw updateError;
  msg.style.color='#70e3b6';msg.textContent='Password changed successfully.';
  document.getElementById('passwordChangeForm').reset();
 }catch(err){msg.textContent=err.message||'Could not update password. Please try again.'}
 finally{btn.disabled=false;btn.textContent='Update Password'}
});

// Automatic trade P/L journal. Local browser storage; this does not replace server-side accounting.
const TRADE_LOG_KEY='treasury_auto_trade_log_v2';
const TRADE_LOTS_KEY='treasury_auto_trade_lots_v2';
// Keep previously saved local trade history when upgrading the brand.
try{if(!localStorage.getItem(TRADE_LOG_KEY)&&localStorage.getItem('novax_auto_trade_log_v2'))localStorage.setItem(TRADE_LOG_KEY,localStorage.getItem('novax_auto_trade_log_v2'));if(!localStorage.getItem(TRADE_LOTS_KEY)&&localStorage.getItem('novax_auto_trade_lots_v2'))localStorage.setItem(TRADE_LOTS_KEY,localStorage.getItem('novax_auto_trade_lots_v2'));}catch(e){}
function tradeStorageKey(base){return base+'_'+String(currentUser||'guest').replace(/[^a-zA-Z0-9_-]/g,'_')}
function getTradeLog(){try{const v=JSON.parse(localStorage.getItem(tradeStorageKey(TRADE_LOG_KEY))||'[]');return Array.isArray(v)?v:[]}catch(e){return []}}
function getTradeLots(){try{const v=JSON.parse(localStorage.getItem(tradeStorageKey(TRADE_LOTS_KEY))||'{}');return v&&typeof v==='object'?v:{}}catch(e){return {}}}
function saveTradeData(rows,lots){localStorage.setItem(tradeStorageKey(TRADE_LOG_KEY),JSON.stringify(rows));localStorage.setItem(tradeStorageKey(TRADE_LOTS_KEY),JSON.stringify(lots));renderProfitChart()}
function recordSuccessfulTrade(side,coinId,symbol,qty,price){
 const rows=getTradeLog(),lots=getTradeLots(),quantity=Number(qty),opening=Number(price),now=new Date().toISOString();
 if(!Number.isFinite(quantity)||quantity<=0||!Number.isFinite(opening)||opening<=0)return;
 let realized=null,bond=quantity*opening;
 const lot=lots[symbol]||{quantity:0,cost:0};
 if(side==='Buy'){
   lot.quantity=Number(lot.quantity||0)+quantity;lot.cost=Number(lot.cost||0)+bond;lots[symbol]=lot;
 }else{
   const available=Number(lot.quantity||0),avg=available>0?Number(lot.cost||0)/available:opening;
   const knownQty=Math.min(quantity,available);bond=knownQty*avg+(quantity-knownQty)*opening;
   realized=quantity*opening-bond;
   lot.quantity=Math.max(0,available-quantity);lot.cost=Math.max(0,Number(lot.cost||0)-knownQty*avg);
   if(lot.quantity<1e-12){lot.quantity=0;lot.cost=0}lots[symbol]=lot;
 }
 const stopEarningPrice=side==='Buy'?opening*1.05:opening*0.95;const stopLossPrice=side==='Buy'?opening*0.98:opening*1.02;
 rows.push({id:Date.now().toString(36)+Math.random().toString(36).slice(2,7),side,coinId,symbol,quantity,openingPrice:opening,bond,realizedPL:realized,serviceCharge:0,overnightCharges:0,stopEarningPrice,stopLossPrice,createdAt:now});
 saveTradeData(rows,lots);
}
function escapeTradeText(v){return String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function fmtTradeNum(v,n=8){return Number(v||0).toLocaleString(undefined,{minimumFractionDigits:0,maximumFractionDigits:n})}
function currentCoinPrice(row){const v=Number(prices[row.coinId]?.usd);return Number.isFinite(v)&&v>0?v:Number(row.openingPrice||0)}
function renderProfitChart(){
 const rows=getTradeLog(),lots=getTradeLots();let realized=rows.reduce((sum,r)=>sum+(r.realizedPL==null?0:Number(r.realizedPL)||0),0),unrealized=0;
 Object.keys(lots).forEach(sym=>{const lot=lots[sym],q=Number(lot.quantity)||0,cost=Number(lot.cost)||0;if(q<=0)return;const c=coinList.find(x=>x[2]===sym),price=c?Number(prices[c[0]]?.usd):0;if(price>0)unrealized+=q*price-cost});
 const total=realized+unrealized,el=document.getElementById('profitTotal');if(!el)return;
 el.innerHTML=(total<0?'-':'')+Math.abs(total).toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:4})+' <span class="muted" style="font-size:13px">USDT</span>';el.className='metric '+(total<0?'red':total>0?'green':'');
 document.getElementById('profitCount').textContent=rows.length+' trade'+(rows.length===1?'':'s')+' · Realized '+(realized>=0?'+':'')+fmtTradeNum(realized,4)+' · Open P/L '+(unrealized>=0?'+':'')+fmtTradeNum(unrealized,4);
 const canvas=document.getElementById('profitChartCanvas');
 if(!rows.length){canvas.innerHTML='<svg viewBox="0 0 800 190" preserveAspectRatio="none" style="width:100%;height:100%"><text x="400" y="95" fill="#93a3bf" text-anchor="middle">Profit and loss will appear here after a successful buy or sell.</text></svg>'}
 else{let running=0;const vals=rows.map(r=>{running+=r.realizedPL==null?0:Number(r.realizedPL)||0;return running});const min=Math.min(0,...vals),max=Math.max(0,...vals),range=max-min||1;const pts=vals.map((v,i)=>({x:rows.length===1?400:40+i*720/(rows.length-1),y:160-(v-min)/range*125}));const path=pts.map((p,i)=>(i?'L':'M')+p.x.toFixed(1)+' '+p.y.toFixed(1)).join(' ');const grid=[35,75,115,155].map(y=>`<path d="M20 ${y}H780" stroke="#283650"/>`).join('');const circles=pts.map(p=>`<circle cx="${p.x}" cy="${p.y}" r="4" fill="#20c997"/>`).join('');canvas.innerHTML=`<svg viewBox="0 0 800 190" preserveAspectRatio="none" style="width:100%;height:100%">${grid}<path d="${path}" fill="none" stroke="#20c997" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>${circles}<text x="20" y="181" fill="#93a3bf" font-size="11">${escapeTradeText(new Date(rows[0].createdAt).toLocaleDateString())}</text><text x="780" y="181" fill="#93a3bf" font-size="11" text-anchor="end">${escapeTradeText(new Date(rows[rows.length-1].createdAt).toLocaleDateString())}</text></svg>`}
 const list=document.getElementById('profitRecords');
 list.innerHTML=rows.slice().reverse().map(r=>{const cp=currentCoinPrice(r),open=Number(r.openingPrice)||0,qty=Number(r.quantity)||0,stopEarn=r.stopEarningPrice==null?(r.side==='Buy'?open*1.05:open*0.95):Number(r.stopEarningPrice),stopLoss=r.stopLossPrice==null?(r.side==='Buy'?open*0.98:open*1.02):Number(r.stopLossPrice),unreal=r.side==='Buy'?qty*(cp-open)-Number(r.serviceCharge||0)-Number(r.overnightCharges||0):null,pl=r.realizedPL==null?unreal:Number(r.realizedPL)-Number(r.serviceCharge||0)-Number(r.overnightCharges||0),time=new Date(r.createdAt);return `<article style="padding:13px;margin-bottom:10px;border:1px solid var(--line);border-radius:11px;background:#0d1628"><div style="display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap"><strong>${escapeTradeText(r.side==='Buy'?'Long':'Sell')} ${escapeTradeText(r.symbol)}/USDT x100</strong><span class="small muted">${escapeTradeText(time.toLocaleString())}</span></div><div class="small ${pl<0?'red':'green'}" style="font-weight:800;margin:5px 0 10px">${pl>=0?'+':''}${fmtTradeNum(pl,4)} USDT ${r.realizedPL==null?'(Unrealized P/L)':'(Realized P/L)'}</div><div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:7px;font-size:11px;color:var(--muted)"><div>Opening Price: <b style="color:var(--text)">${fmtTradeNum(open,6)}</b></div><div>Current Price: <b style="color:var(--text)">${fmtTradeNum(cp,6)}</b></div><div>Stop Earning Price: <b style="color:var(--text)">${fmtTradeNum(stopEarn,6)}</b></div><div>Bond: <b style="color:var(--text)">${fmtTradeNum(r.bond,4)} USDT</b></div><div>Stop-Loss Price: <b style="color:var(--text)">${fmtTradeNum(stopLoss,6)}</b></div><div>Service Charge: <b style="color:var(--text)">${fmtTradeNum(r.serviceCharge,4)} USDT</b></div><div>Overnight Charges: <b style="color:var(--text)">${fmtTradeNum(r.overnightCharges,4)} USDT</b></div><div>Converted Quantity: <b style="color:var(--text)">${fmtTradeNum(qty)} ${escapeTradeText(r.symbol)}</b></div></div></article>`}).join('')||'<div class="muted small">No successful trade records yet. Completed buy/sell conversions will appear here automatically.</div>';
}
function exportTradeHistory(){const rows=getTradeLog();const blob=new Blob([JSON.stringify({trades:rows,lots:getTradeLots()},null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='treasury-trade-history.json';a.click();URL.revokeObjectURL(url)}
loadMarkets();setInterval(loadMarkets,60000);
