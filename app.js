window.SITE={liveFeeds:[
  {name:"Google Football News",url:"https://news.google.com/rss/search?q=football%20OR%20soccer%20when:1d&hl=en&gl=US&ceid=US:en"},
  {name:"World Cup News",url:"https://news.google.com/rss/search?q=World%20Cup%202026%20football%20when:7d&hl=en&gl=US&ceid=US:en"},
  {name:"BBC Football",url:"https://feeds.bbci.co.uk/sport/football/rss.xml"},
  {name:"Sky Sports Football",url:"https://www.skysports.com/feeds/rss/football"},
  {name:"ESPN FC",url:"https://www.espn.com/espn/rss/soccer/news"}
]};

window.players=[{"name": "Lionel Messi", "country": "Argentina", "role": "Key Forward", "meter": 94, "strengths": ["Big-match impact", "National team importance", "Tactical value"], "weaknesses": ["Age and fitness recovery", "Peak years behind"]},{"name": "Kylian Mbappé", "country": "France", "role": "Elite Forward", "meter": 96, "strengths": ["Explosive pace", "Clinical finishing", "Proven tournament record"], "weaknesses": ["Defensive effort variable"]},{"name": "Vinícius Júnior", "country": "Brazil", "role": "Dynamic Winger", "meter": 93, "strengths": ["Elite pace and dribbling", "Takeon ability", "Big-game experience"], "weaknesses": ["Decision-making under pressure", "Defensive consistency"]},{"name": "Erling Haaland", "country": "Norway", "role": "Striker (WC Qualifier)", "meter": 97, "strengths": ["Lethal box presence", "Elite finishing", "Physical dominance"], "weaknesses": ["Norway did not qualify for 2026"]},{"name": "Harry Kane", "country": "England", "role": "Experienced Forward", "meter": 91, "strengths": ["Positioning and movement", "Penalty conversion", "Tactical intelligence"], "weaknesses": ["May age out of peak performance window"]}];

window.teams=[{"team": "Argentina", "confederation": "South America", "meter": 94, "strengths": ["Tournament mentality", "compact midfield", "elite creators"], "weaknesses": ["Aging core, defensive fragility"]},{"team": "France", "confederation": "Europe", "meter": 93, "strengths": ["Depth in every position", "Athletic midfield", "Tactical flexibility"], "weaknesses": ["Integration of new players, recent form"]},{"team": "Brazil", "confederation": "South America", "meter": 92, "strengths": ["Offensive talent", "Technical quality", "Fast transitions"], "weaknesses": ["Defensive inconsistency, tournament pressure history"]},{"team": "England", "confederation": "Europe", "meter": 90, "strengths": ["Young talent", "Attacking potency", "Set-piece danger"], "weaknesses": ["Defensive vulnerability, penalty shootout history"]},{"team": "Spain", "confederation": "Europe", "meter": 89, "strengths": ["Possession control", "Technical passing", "Youth emergence"], "weaknesses": ["Aging midfield core, physical intensity"]}];

window.goldenBoot=[{name:"Kylian Mbappé",country:"France",chance:94,reason:"Elite pace, penalty-box movement and proven tournament scoring record."},{name:"Vinícius Júnior",country:"Brazil",chance:89,reason:"Dynamic dribbler and direct finisher in high-pressure moments."},{name:"Erling Haaland",country:"Norway",chance:0,reason:"Norway did not qualify — would have dominated scoring."},{name:"Jude Bellingham",country:"England",chance:72,reason:"Rising star with finishing improvement and big-game temperament."},{name:"Rodrygo Goes",country:"Brazil",chance:68,reason:"Proven goal scorer with tactical flexibility."}];

window.blogs=[{title:"2026 World Cup Favorites: Teams to Watch",url:"world-cup-2026-favorites.html",desc:"Teams fans expect to challenge for the trophy."},{title:"World Cup 2026 Dark Horses: Underdogs to Watch",url:"world-cup-2026-dark-horses.html",desc:"Emerging nations with a real chance to surprise."},{title:"World Cup 2026 Host Cities Guide",url:"host-cities-fan-guide.html",desc:"Stadium tours, travel tips and fan guide for USA, Canada and Mexico venues."}];

window.fallbackNews=[{title:"World Cup 2026 build-up continues across USA, Canada and Mexico",source:"World Cup Desk",date:"Updated today",link:"world-cup-2026.html",desc:"Tournament preparation, infrastructure updates and host nation announcements this week."}];

document.addEventListener("DOMContentLoaded",()=>{
  const m=document.querySelector(".menu"),h=document.querySelector(".hamb");
  if(h&&m)h.onclick=()=>m.classList.toggle("open");
  document.querySelectorAll('[data-year]').forEach(el=>el.textContent=new Date().getFullYear());
  setActiveNav();
  loadLiveNews();
  loadMatchCenter();
  renderPlayers();
  renderTeams();
  renderGoldenBoot();
  renderBlogs();
  renderStoryDetail();
  renderAllPlayersPage();
});

function setActiveNav(){
  const current=(location.pathname.split('/').pop()||'index.html');
  document.querySelectorAll('.menu a, .bottom-nav a').forEach(a=>{
    const href=a.getAttribute('href');
    a.classList.toggle('active',href===current);
  });
}

async function loadLiveNews(){
  const el=document.querySelector("#liveNews");
  if(!el)return;

  const loadingCards=Array.from({length:3}).map(()=>`<article class="card loading-card"><span class="badge">Live RSS</span><h3>Loading fresh football news...</h3><p>Fetching newest stories now.</p></article>`).join("");
  el.innerHTML=loadingCards;

  const timeout=(ms)=>new Promise((_,rej)=>setTimeout(()=>rej(new Error('timeout')),ms));
  const clean=(html)=>String(html||'Latest football update.').replace(/<[^>]+>/g," ").replace(/&nbsp;/g,' ').replace(/\s+/g,' ').trim().slice(0,190);
  const addBust=(url)=>url+(url.includes('?')?'&':'?')+'_='+(Date.now());

  const parseXmlItems=(txt,source)=>{
    const xml=new DOMParser().parseFromString(txt,"text/xml");
    return [...xml.querySelectorAll("item, entry")].slice(0,8).map(item=>({
      title:(item.querySelector("title")?.textContent||"Football update").trim(),
      link:item.querySelector("link")?.textContent || item.querySelector("link")?.getAttribute('href') || "news.html",
      date:item.querySelector("pubDate")?.textContent || item.querySelector("updated")?.textContent || item.querySelector("published")?.textContent || new Date().toISOString(),
      source,
      desc:clean(item.querySelector("description")?.textContent || item.querySelector("summary")?.textContent || item.querySelector("content")?.textContent)
    })).filter(x=>x.title && !/removed|deleted/i.test(x.title));
  };

  const getText=async(url)=>{
    const controller=new AbortController();
    const timer=setTimeout(()=>controller.abort(),3000);
    try{
      const r=await fetch(url,{cache:"no-store",signal:controller.signal,headers:{'Pragma':'no-cache','Cache-Control':'no-cache'}});
      if(!r.ok) throw new Error('bad status');
      return await r.text();
    }finally{clearTimeout(timer);}
  };

  const fetchFeed=async(feed)=>{
    const freshUrl=addBust(feed.url);
    const endpoints=[
      `https://api.allorigins.win/raw?url=${encodeURIComponent(freshUrl)}`,
      `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(freshUrl)}`,
      `https://corsproxy.io/?${encodeURIComponent(freshUrl)}`
    ];
    const jobs=endpoints.map(async(endpoint)=>{
      const txt=await Promise.race([getText(endpoint),timeout(3200)]);
      if(!txt || txt.length<80) throw new Error('empty');
      const items=parseXmlItems(txt,feed.name);
      if(!items.length) throw new Error('no items');
      return items;
    });
    try{ return await Promise.any(jobs); }catch(e){ return []; }
  };

  let all=[];
  const results=await Promise.allSettled((SITE.liveFeeds||[]).map(fetchFeed));
  results.forEach(r=>{ if(r.status==='fulfilled') all.push(...r.value); });

  all=all.filter((n,i,arr)=>n.title && arr.findIndex(x=>x.title.toLowerCase()===n.title.toLowerCase())===i)
         .sort((a,b)=>(new Date(b.date||0).getTime()||0)-(new Date(a.date||0).getTime()||0));

  if(!all.length){
    el.innerHTML=`<article class="card"><span class="badge">Live RSS</span><h3>Fresh feed is temporarily slow</h3><p>Public RSS proxies are not responding right now. Click refresh or reload the page.</p></article>`;
    return;
  }

  el.innerHTML=all.slice(0,9).map(n=>{
    const localUrl = storyLocalUrl(n);
    return `<article class="card"><span class="badge">${esc(n.source)}</span><h3>${esc(n.title)}</h3><time>${esc(formatDate(n.date))}</time><p>${esc(n.desc)}</p><div class="actions"><a class="btn secondary" href="${esc(localUrl)}">Read More</a></div></article>`;
  }).join("");
}

function formatDate(d){
  const t=new Date(d);
  if(!isNaN(t)) return t.toLocaleString(undefined,{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'});
  return d||'Recent';
}

function storyLocalUrl(n){
  const p=new URLSearchParams();
  p.set('title', String(n.title||'Football Update').slice(0,140));
  p.set('source', String(n.source||'Football Desk').slice(0,60));
  p.set('date', String(n.date||'Recent').slice(0,80));
  p.set('desc', String(n.desc||'Latest football and World Cup 2026 update.').slice(0,900));
  if(n.link) p.set('original', String(n.link).slice(0,500));
  return 'rss-detail.html?'+p.toString();
}

function renderStoryDetail(){
  const el=document.querySelector('#rssDetail');
  if(!el)return;
  const p=new URLSearchParams(location.search);
  const title=p.get('title')||'Football Update';
  const source=p.get('source')||'Football Desk';
  const date=p.get('date')||'Recent';
  const desc=p.get('desc')||'Latest football and World Cup 2026 update.';
  el.innerHTML=`<span class="badge">${esc(source)} • Football Update</span><h1><span class="gradient">${esc(title)}</span></h1><time>${esc(date)}</time><p class="lead">${esc(desc)}</p><div class="actions"><a class="btn secondary" href="index.html">← Back</a></div>`;
}

async function loadMatchCenter(){
  const el=document.querySelector("#matchCenter");
  if(!el)return;

  const CACHE_KEY='ifu_match_center_cache_v5';
  const CACHE_MS=90*1000;
  const now=Date.now();
  const cached=readCache(CACHE_KEY);

  if(cached && cached.items && cached.items.length){
    renderMatchCenter(cached.items, true, cached.updated);
    if(now-(cached.updated||0)<CACHE_MS) return;
  }else{
    el.innerHTML=Array.from({length:4}).map(()=>`<article class="score-card loading-card"><div class="score-top"><span>Live Match Center</span></div><div class="score-center"><strong>Loading</strong><em class="score-big">Scores</em><strong>...</strong></div></article>`).join("");
  }

  try{
    const items=await fetchEspnSoccerScoreboard();
    const cleaned=items.filter(Boolean).slice(0,12);
    if(cleaned.length){
      writeCache(CACHE_KEY,{updated:Date.now(),items:cleaned});
      renderMatchCenter(cleaned,false,Date.now());
      return;
    }
    throw new Error('No fixtures returned');
  }catch(err){
    if(cached && cached.items && cached.items.length){
      renderMatchCenter(cached.items,true,cached.updated,'Public live source is slow right now. Showing last saved data.');
    }else{
      renderMatchCenter([],false,0,'Live scores could not load from the free public source. Refresh again in a few seconds.');
    }
  }
}

async function fetchEspnSoccerScoreboard(){
  const today=new Date();
  const tomorrow=new Date(Date.now()+24*60*60*1000);
  const dates=[yyyymmdd(today),yyyymmdd(tomorrow)];
  const leagues=['all','eng.1','esp.1','ita.1','ger.1','fra.1','uefa.champions','fifa.worldq.uefa','fifa.worldq.concacaf','fifa.worldq.afc','fifa.worldq.caf','fifa.worldq.conmebol','fifa.friendly.all'];
  const urls=[];
  dates.forEach(d=>leagues.forEach(l=>urls.push(`https://site.api.espn.com/apis/site/v2/sports/soccer/${l}/scoreboard?dates=${d}&limit=100`)));

  const batches=await Promise.allSettled(urls.map(u=>fetchJsonFast(u)));
  const seen=new Set();
  const matches=[];
  batches.forEach(res=>{
    if(res.status!=='fulfilled' || !res.value || !Array.isArray(res.value.events)) return;
    res.value.events.forEach(ev=>{
      const item=normalizeEspnEvent(ev);
      if(!item || seen.has(item.id)) return;
      seen.add(item.id);
      matches.push(item);
    });
  });

  const order={live:0,pre:1,post:2};
  return matches.sort((a,b)=>(order[a.state]??9)-(order[b.state]??9) || new Date(a.date)-new Date(b.date));
}

async function fetchJsonFast(url){
  const bust=url+(url.includes('?')?'&':'?')+'_='+(Date.now());
  const endpoints=[
    bust,
    `https://api.allorigins.win/raw?url=${encodeURIComponent(bust)}`,
    `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(bust)}`
  ];
  const controller=new AbortController();
  const timer=setTimeout(()=>controller.abort(),4200);
  try{
    const attempts=endpoints.map(async(endpoint)=>{
      const r=await fetch(endpoint,{cache:'no-store',signal:controller.signal});
      if(!r.ok) throw new Error('bad status');
      const data=await r.json();
      if(!data || !Array.isArray(data.events)) throw new Error('bad data');
      return data;
    });
    return await Promise.any(attempts);
  }finally{clearTimeout(timer);}
}

function normalizeEspnEvent(ev){
  const comp=ev.competitions && ev.competitions[0];
  const teams=(comp && comp.competitors) || [];
  const home=teams.find(t=>t.homeAway==='home') || teams[0];
  const away=teams.find(t=>t.homeAway==='away') || teams[1];
  if(!home || !away) return null;
  const state=(ev.status && ev.status.type && ev.status.type.state) || 'pre';
  const detail=(ev.status && ev.status.type && (ev.status.type.shortDetail || ev.status.type.detail || ev.status.type.description)) || '';
  const league=(ev.league && (ev.league.shortName || ev.league.name)) || (comp && comp.notes && comp.notes[0] && comp.notes[0].headline) || 'Football';
  const homeName=(home.team && (home.team.shortDisplayName || home.team.abbreviation || home.team.displayName || home.team.name)) || 'Home';
  const awayName=(away.team && (away.team.shortDisplayName || away.team.abbreviation || away.team.displayName || away.team.name)) || 'Away';
  const homeCode=teamCode(home.team, homeName);
  const awayCode=teamCode(away.team, awayName);
  const centerText=state==='pre' ? kickoffTimeCompact(ev.date) : `${home.score||0}-${away.score||0}`;
  const status=state==='in' ? liveMinute(detail) : state==='post' ? 'FT' : 'SCH';
  return {
    id:ev.id || `${homeName}-${awayName}-${ev.date}`,
    league, home:homeName, away:awayName, homeCode, awayCode, centerText, status, state: state==='in'?'live':state,
    date:ev.date || new Date().toISOString(),
    note: state==='in' ? (detail || 'Live score updates automatically every 90 seconds.') : state==='post' ? 'Finished match result from public scoreboard.' : `Kickoff: ${kickoffDate(ev.date)}`
  };
}

function renderMatchCenter(items,fromCache=false,updated=0,message=''){
  const el=document.querySelector("#matchCenter");
  if(!el)return;
  if(!items.length){
    el.innerHTML=`<article class="score-card"><div class="score-top"><span>Live Match Center</span></div><div class="score-center"><strong>No</strong><em class="score-big">Live</em><strong>Data</strong></div><div class="score-bottom"><em>${esc(message || 'No live matches right now.')}</em></div></article>`;
    return;
  }
  const cacheNote=fromCache?`<p class="feed-note">${esc(message || ('Fast cached view • Last updated '+formatTime(updated)))}</p>`:'';
  el.innerHTML=cacheNote+items.map(m=>`<article class="score-card compact-match ${m.state==='live'?'is-live':''}"><div class="score-top"><span>${esc(m.league)}</span><span class="status ${m.state==='live'?'live-now':''}"> ${esc(m.status)}</span></div><div class="score-center"><strong>${esc(m.homeCode)}</strong><em class="score-big">${esc(m.centerText)}</em><strong>${esc(m.awayCode)}</strong></div><div class="score-bottom"><em>${esc(m.note)}</em></div></article>`).join("");
}

const TEAM_CODES={
  'Argentina':'ARG','Brazil':'BRA','France':'FRA','England':'ENG','Spain':'ESP','Germany':'GER','Portugal':'POR','Italy':'ITA','Netherlands':'NED','Belgium':'BEL','Uruguay':'URU','Mexico':'MEX','USA':'USA','Canada':'CAN','Australia':'AUS','Japan':'JPN','South Korea':'KOR','Saudi Arabia':'KSA','Iran':'IRN','Poland':'POL','Senegal':'SEN','Morocco':'MAR','Ghana':'GHA','Ivory Coast':'CIV','Denmark':'DEN','Sweden':'SWE','Switzerland':'SUI','Austria':'AUT','Czech Republic':'CZE','Serbia':'SRB','Croatia':'CRO','Hungary':'HUN','Romania':'ROU','Bulgaria':'BUL','Greece':'GRE','Slovakia':'SVK','Slovenia':'SVN','Norway':'NOR','Finland':'FIN','Iceland':'ISL','Ireland':'IRL','Scotland':'SCO','Wales':'WAL','Northern Ireland':'NIR','Bosnia and Herzegovina':'BIH','Albania':'ALB','Kosovo':'KOS','Georgia':'GEO','Kazakhstan':'KAZ','Uzbekistan':'UZB','Tajikistan':'TJK','Kyrgyzstan':'KYR','Turkmenistan':'TKM','Afghanistan':'AFG','Pakistan':'PAK','India':'IND','Bangladesh':'BAN','Nepal':'NEP','Sri Lanka':'SRI','Thailand':'THA','Vietnam':'VIE','Indonesia':'IDN','Malaysia':'MAL','Singapore':'SGP','Philippines':'PHI','Myanmar':'MYA','Laos':'LAO','Cambodia':'CAM','Mongolia':'MNG','China':'CHN','Taiwan':'TPE','Hong Kong':'HKG','Macau':'MAC','New Zealand':'NZL','Fiji':'FIJ','Samoa':'SAM','Solomon Islands':'SOL','Papua New Guinea':'PNG','Vanuatu':'VAN','Kiribati':'KIR'
};
function teamCode(team,name){
  const raw=(team && (team.abbreviation || team.shortDisplayName || team.name || team.displayName)) || name || '';
  if(team && team.abbreviation && team.abbreviation.length<=4) return team.abbreviation.toUpperCase();
  if(TEAM_CODES[raw]) return TEAM_CODES[raw];
  if(TEAM_CODES[name]) return TEAM_CODES[name];
  return String(raw).replace(/[^A-Za-z]/g,'').slice(0,3).toUpperCase() || 'TBD';
}
function liveMinute(detail){
  const d=String(detail||'');
  const m=d.match(/(\d{1,3})['']/);
  return m ? `LIVE ${m[1]}'` : 'LIVE';
}
function yyyymmdd(d){return d.getFullYear()+String(d.getMonth()+1).padStart(2,'0')+String(d.getDate()).padStart(2,'0');}
function kickoffTime(d){const t=new Date(d);return isNaN(t)?'Soon':t.toLocaleTimeString(undefined,{hour:'2-digit',minute:'2-digit'});}
function kickoffTimeCompact(d){const t=new Date(d);return isNaN(t)?'TBD':t.toLocaleTimeString(undefined,{hour:'numeric',minute:'2-digit'}).replace(/:00(\s?)/,'$1').replace(/\s/g,'').toLowerCase();}
function kickoffDateShort(d){const t=new Date(d);return isNaN(t)?'Scheduled':t.toLocaleString(undefined,{weekday:'short',hour:'numeric',minute:'2-digit'}).replace(/:00(\s?)/,'$1').replace(/\s/g,'');}
function kickoffDate(d){const t=new Date(d);return isNaN(t)?'Scheduled':t.toLocaleString(undefined,{weekday:'short',month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'});}
function formatTime(ts){const t=new Date(ts);return isNaN(t)?'recently':t.toLocaleTimeString(undefined,{hour:'2-digit',minute:'2-digit'});}
function readCache(key){try{return JSON.parse(localStorage.getItem(key)||'null')}catch(e){return null}}
function writeCache(key,val){try{localStorage.setItem(key,JSON.stringify(val))}catch(e){}}
setInterval(()=>{ if(document.querySelector('#matchCenter')) loadMatchCenter(); },90000);

function renderPlayers(){
  const el=document.querySelector("#playerGrid"); if(!el)return;
  const params=new URLSearchParams(location.search);
  const team=params.get('team');
  const data=team ? players.filter(p=>p.country===team) : players.slice(0,60);
  el.innerHTML=data.map(p=>`<article class="card"><span class="badge">${esc(p.country)} • ${esc(p.role)}</span><h3>${esc(p.name)}</h3><div class="meter"><span style="width:${p.meter}%"></span><small>${p.meter}%</small></div></article>`).join("");
}

function renderTeams(){
  const el=document.querySelector("#teamGrid"); if(!el)return;
  el.innerHTML=teams.map(t=>`<article class="card team-card"><span class="badge">${esc(t.confederation)} • Power ${t.meter}%</span><h3>${esc(t.team)}</h3><div class="meter"><span style="width:${t.meter}%"></span><small>${t.meter}%</small></div></article>`).join("");
}

function renderAllPlayersPage(){
  const el=document.querySelector('#allPlayersPage'); if(!el)return;
  const params=new URLSearchParams(location.search); const team=params.get('team');
  const data=team ? teams.filter(t=>t.team===team) : teams;
  el.innerHTML=data.map(t=>`<section class="team-detail card"><span class="badge">${esc(t.confederation)} • Team Analysis</span><h2>${esc(t.team)}</h2><div class="meter"><span style="width:${t.meter}%"></span><small>${t.meter}%</small></div></section>`).join("");
}

function renderGoldenBoot(){
  const el=document.querySelector("#goldenBootGrid");
  if(!el)return;
  el.innerHTML=goldenBoot.map((p,i)=>`<article class="card"><span class="badge">#${i+1} • ${esc(p.country)}</span><h3>${esc(p.name)}</h3><p><strong style="font-size:1.8rem;color:#ffd166;">${p.chance}%</strong> chance</p><p style="font-size:0.95rem;color:#999;">${esc(p.reason)}</p></article>`).join("");
}

function renderBlogs(){
  const el=document.querySelector("#blogGrid");
  if(!el)return;
  el.innerHTML=blogs.map(b=>`<a class="card" href="${esc(b.url)}"><span class="badge">Feature</span><h3>${esc(b.title)}</h3><p>${esc(b.desc)}</p></a>`).join("");
}

function siteSearch(){
  const q=(document.querySelector("#siteSearchInput")?.value||"world cup").toLowerCase();
  const box=document.querySelector("#searchResults");
  if(!box)return;
  const items=[["Latest News","news.html"],["World Cup 2026","world-cup-2026.html"],["Golden Boot","golden-boot.html"],["Players","players.html"],["Teams","teams.html"]];
  const results=items.filter(([name])=>name.toLowerCase().includes(q));
  box.innerHTML=results.length?results.map(([name,url])=>`<a href="${url}">${esc(name)}</a>`).join(""):
    `<p style="color:#888;">No results for "${esc(q)}"</p>`;
}

function sharePage(text){
  const url=location.href;
  if(navigator.share)navigator.share({title:text,text,url});
  else if(navigator.clipboard){navigator.clipboard.writeText(url);alert("Link copied")}
}

function esc(s){
  return String(s||"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[m]))
}

function attr(s){
  return String(s||"").replace(/['"]/g,"")
}

// Mobile menu reliability and button click helpers
(function(){
  document.addEventListener('click', function(e){
    const menu=document.querySelector('.menu');
    const hamb=document.querySelector('.hamb');
    if(!menu||!hamb) return;
    if(e.target.closest('.hamb')){
      menu.classList.toggle('open');
      hamb.setAttribute('aria-expanded', menu.classList.contains('open') ? 'true':'false');
      e.stopPropagation();
      return;
    }
    if(e.target.closest('.menu a')){
      menu.classList.remove('open');
      hamb.setAttribute('aria-expanded','false');
      return;
    }
    if(menu.classList.contains('open') && !e.target.closest('.menu')){
      menu.classList.remove('open');
      hamb.setAttribute('aria-expanded','false');
    }
  }, true);
})();

function filterTeamCards(q){
  q=String(q||'').toLowerCase();
  document.querySelectorAll('#teamGrid .team-card').forEach(card=>{
    card.style.display=card.innerText.toLowerCase().includes(q)?'':'none';
  });
}
