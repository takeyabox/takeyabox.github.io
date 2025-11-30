/* -------------------- CONFIG: Firebase --------------------
 * デフォルトはオフライン（FIREBASE_CONFIG = null）。
 * Firebase を使う場合、次のオブジェクトを貼り付けてください：
 * const FIREBASE_CONFIG = {
 *   apiKey: "...",
 *   authDomain: "...",
 *   databaseURL: "https://<project>.firebaseio.com",
 *   projectId: "...",
 *   storageBucket: "...",
 *   messagingSenderId: "...",
 *   appId: "..."
 * };
 * Realtime Database のルールはテスト時に読み書きを許可してください（本番では要認証）。
 */
const FIREBASE_CONFIG = null; // <-- ここを置き換えてオンライン同期を有効化

/* ---------------- Data (プロトタイプをベースに実装) ----------------
   いただいたプロトタイプを参考にして実装・改良しました。参照元: アップロードされたプロトタイプ。 :contentReference[oaicite:1]{index=1}
*/
const TYPE_CHART = {
  'ノーマル':{'いわ':0.5,'ゴースト':0,'はがね':0.5,'フェアリー':1},
  'ほのお':{'くさ':2,'こおり':2,'むし':2,'はがね':2,'ほのお':0.5,'みず':0.5,'いわ':0.5,'ドラゴン':0.5},
  'みず':{'ほのお':2,'じめん':2,'いわ':2,'みず':0.5,'くさ':0.5,'ドラゴン':0.5},
  'でんき':{'みず':2,'ひこう':2,'でんき':0.5,'くさ':0.5,'じめん':0,'ドラゴン':0.5},
  'くさ':{'みず':2,'じめん':2,'いわ':2,'ほのお':0.5,'くさ':0.5,'どく':0.5,'ひこう':0.5,'むし':0.5,'ドラゴン':0.5,'はがね':0.5},
  'じめん':{'ほのお':2,'でんき':2,'どく':2,'いわ':2,'くさ':0.5,'ひこう':0,'むし':0.5},
  'ひこう':{'くさ':2,'かくとう':2,'むし':2,'でんき':0.5,'いわ':0.5,'はがね':0.5},
  'エスパー':{'かくとう':2,'どく':2,'エスパー':0.5,'あく':0,'はがね':0.5},
  'むし':{'くさ':2,'エスパー':2,'あく':2,'ほのお':0.5,'かくとう':0.5,'どく':0.5,'ひこう':0.5,'フェアリー':0.5},
  'いわ':{'ほのお':2,'こおり':2,'ひこう':2,'むし':2,'かくとう':0.5,'じめん':0.5,'はがね':0.5},
  'あく':{'エスパー':2,'ゴースト':2,'かくとう':0.5,'あく':0.5,'フェアリー':0.5},
  'フェアリー':{'かくとう':2,'ドラゴン':2,'あく':2,'ほのお':0.5,'どく':0.5,'はがね':0.5},
  'どく':{'くさ':2,'フェアリー':2,'どく':0.5,'じめん':0.5,'いわ':0.5,'ゴースト':0.5}
};

const POKEMON_DB = {
  'たかす':{types:['みず','どく'], ability:'ひとでなし', stats:{hp:78,atk:100,def:85,spa:93,spd:90,spe:85}},
  'じゅん':{types:['ノーマル','フェアリー'], ability:'きょううん', stats:{hp:108,atk:120,def:110,spa:80,spd:95,spe:115}},
  'たけしげ':{types:['でんき','いわ'], ability:'てんねん', stats:{hp:90,atk:135,def:105,spa:30,spd:75,spe:70}},
  'しょうき':{types:['ひこう','エスパー'], ability:'たんじゅん', stats:{hp:95,atk:95,def:95,spa:105,spd:100,spe:80}},
  'なつうみ':{types:['あく','エスパー'], ability:'ぜったいねむり', stats:{hp:70,atk:60,def:65,spa:113,spd:70,spe:108}},
  'そうじ':{types:['むし','じめん'], ability:'カブトアーマー', stats:{hp:65,atk:55,def:58,spa:75,spd:60,spe:90}},
};

const MOVE_DB = {
  'すてみタックル':{type:'ノーマル',cat:'physical',power:120,acc:100,pp:15,desc:'反動あり'},
  'まもる':{type:'ノーマル',cat:'status',power:0,acc:100,pp:10,desc:'1ターン防ぐ'},
  'ハイパーボイス':{type:'ノーマル',cat:'special',power:90,acc:100,pp:15},
  'じこさいせい':{type:'ノーマル',cat:'status',power:0,acc:100,pp:10,desc:'HP回復'},
  'ねごと':{type:'ノーマル',cat:'status',power:0,acc:100,pp:10,desc:'眠り中にランダム'},
  'ギガインパクト':{type:'ノーマル',cat:'physical',power:150,acc:90,pp:5,desc:'反動'},
  'ハイドロポンプ':{type:'みず',cat:'special',power:110,acc:80,pp:5},
  'なみのり':{type:'みず',cat:'special',power:90,acc:100,pp:15},
  'クイックターン':{type:'みず',cat:'physical',power:70,acc:100,pp:20,desc:'攻撃後交代'},
  'アクアブレイク':{type:'みず',cat:'physical',power:85,acc:100,pp:10},
  'たきのぼり':{type:'みず',cat:'physical',power:80,acc:100,pp:15},
  'じゅうでん':{type:'でんき',cat:'status',power:0,acc:100,pp:20,desc:'充電'},
  'ほうでん':{type:'でんき',cat:'special',power:80,acc:100,pp:10,desc:'麻痺付与'},
  'ワイルドボルト':{type:'でんき',cat:'physical',power:90,acc:100,pp:15,desc:'反動'},
  'ボルトチェンジ':{type:'でんき',cat:'special',power:70,acc:100,pp:20,desc:'攻撃後交代'},
  'でんじは':{type:'でんき',cat:'status',power:0,acc:100,pp:20,desc:'麻痺付与'},
  'エレキネット':{type:'でんき',cat:'special',power:55,acc:95,pp:15},
  'でんじほう':{type:'でんき',cat:'special',power:110,acc:70,pp:5},
  '10万ボルト':{type:'でんき',cat:'special',power:90,acc:100,pp:15,desc:'麻痺'},
  'エレキボール':{type:'でんき',cat:'special',power:0,acc:100,pp:10,desc:'速さ依存'},
  'ハードプラント':{type:'くさ',cat:'special',power:150,acc:90,pp:5},
  'リーフストーム':{type:'くさ',cat:'special',power:130,acc:90,pp:5,desc:'特攻低下'},
  'やどりぎのタネ':{type:'くさ',cat:'status',power:0,acc:90,pp:10,desc:'吸収'},
  'ソーラービーム':{type:'くさ',cat:'special',power:120,acc:100,pp:10},
  'どくどく':{type:'どく',cat:'status',power:0,acc:90,pp:10,desc:'毒付与'},
  'ヘドロばくだん':{type:'どく',cat:'special',power:90,acc:100,pp:10},
  'じしん':{type:'じめん',cat:'physical',power:100,acc:100,pp:10},
  'エアスラッシュ':{type:'ひこう',cat:'special',power:75,acc:95,pp:15,desc:'ひるみ'},
  'おいかぜ':{type:'ひこう',cat:'status',power:0,acc:100,pp:15,desc:'味方の素早さ上昇(4ターン)'},
  'ブレイブバード':{type:'ひこう',cat:'physical',power:120,acc:100,pp:15,desc:'反動'},
  'サイコキネシス':{type:'エスパー',cat:'special',power:90,acc:100,pp:10},
  'ねむる':{type:'エスパー',cat:'status',power:0,acc:100,pp:10,desc:'HP回復して眠る'},
  'むしのていこう':{type:'むし',cat:'status',power:0,acc:100,pp:20,desc:'攻撃低下'},
  'メガホーン':{type:'むし',cat:'physical',power:120,acc:85,pp:10},
  'とんぼがえり':{type:'むし',cat:'physical',power:70,acc:100,pp:20,desc:'攻撃後交代'},
  'むしのさざめき':{type:'むし',cat:'special',power:90,acc:100,pp:15},
  'がんせきふうじ':{type:'いわ',cat:'physical',power:60,acc:95,pp:15,desc:'素早さ下降'},
  'ストーンエッジ':{type:'いわ',cat:'physical',power:100,acc:80,pp:5,desc:'急所率高め'},
  'じゃれつく':{type:'フェアリー',cat:'physical',power:90,acc:100,pp:15},
  'ドレインキッス':{type:'フェアリー',cat:'special',power:70,acc:100,pp:10,desc:'吸収'},
  'すてぜりふ':{type:'あく',cat:'status',power:0,acc:100,pp:10,desc:'退場'},
  'ふいうち':{type:'あく',cat:'physical',power:70,acc:100,pp:15,desc:'優先度+1'},
  'あくのはどう':{type:'あく',cat:'special',power:80,acc:100,pp:15},
  'わるだくみ':{type:'あく',cat:'status',power:0,acc:100,pp:20,desc:'特攻+2'},
  'かえんほうしゃ':{type:'ほのお',cat:'special',power:90,acc:100,pp:15},
  'にほんばれ':{type:'ほのお',cat:'status',power:0,acc:100,pp:5,desc:'晴れにする'},
  'だいもんじ':{type:'ほのお',cat:'special',power:110,acc:85,pp:5},
  'アイアンテール':{type:'はがね',cat:'physical',power:100,acc:75,pp:15},
  'ジャイロボール':{type:'はがね',cat:'physical',power:0,acc:100,pp:5,desc:'速度差で威力増'},
  'シャドーボール':{type:'ゴースト',cat:'special',power:80,acc:100,pp:15},
  'れいとうビーム':{type:'こおり',cat:'special',power:90,acc:100,pp:10},
  'ふぶき':{type:'こおり',cat:'special',power:110,acc:70,pp:5},
  'インファイト':{type:'かくとう',cat:'physical',power:120,acc:100,pp:10},
  'つるぎのまい':{type:'かくとう',cat:'status',power:0,acc:100,pp:20,desc:'攻撃/防御UP'},
};

/* ------------------ ユーティリティ ------------------ */
function deepClone(o){return JSON.parse(JSON.stringify(o));}
function randint(a,b){return Math.floor(Math.random()*(b-a+1))+a}
function clamp(v,a,b){return Math.max(a,Math.min(b,v))}

/* ダメージ計算（簡易：Gen8に近い） */
function calcDamage(attacker, move, defender, field){
  if(move.cat === 'status') return 0;
  const atk = (move.cat==='physical')? attacker.calcAtk() : attacker.calcSpA();
  const def = (move.cat==='physical')? defender.calcDef() : defender.calcSpD();
  const level = 50;
  let basePower = move.power || 0;
  if(move.name === 'エレキボール' || move.name === 'エレキボール') {
    const ratio = clamp(Math.floor(attacker.stats.spe / Math.max(1, defender.stats.spe)),1,100);
    basePower = Math.min(150, 20*ratio);
  }
  if(move.name === 'ジャイロボール'){
    const ratio = Math.min(150, Math.floor(defender.stats.spe/Math.max(1,attacker.stats.spe))*25);
    basePower = ratio;
  }
  let mod = 1.0;
  // STAB
  if(attacker.pokemon.types.includes(move.type)) mod *= 1.5;
  // 効果抜群判定（簡易）
  let eff = 1;
  for(const t of defender.pokemon.types){
    const row = TYPE_CHART[move.type] || {};
    const e = row[t];
    if(e!==undefined) eff *= e; else eff *= 1;
  }
  mod *= eff;
  // ランダム
  const rand = (Math.random()*(1-0.85))+0.85;
  // 急所（簡易）
  const crit = (Math.random()<0.0625)?1.5:1;
  mod *= rand*crit;
  const damage = Math.floor(Math.floor(Math.floor(2*level/5+2)*basePower*atk/def)/50+2) * mod;
  return Math.max(1,Math.floor(damage||1));
}

/* ---------------- PokemonInstance ------------------ */
class PokemonInstance{
  constructor(name){
    this.name = name;
    const data = POKEMON_DB[name];
    this.pokemon = deepClone(data);
    this.maxHP = data.stats.hp;
    this.curHP = data.stats.hp;
    this.stats = deepClone(data.stats);
    this.status = null; // 'sleep','poison','paralysis' etc
    this.stages = {atk:0,def:0,spa:0,spd:0,spe:0,acc:0,evasion:0};
    this.ability = data.ability;
    this.types = data.types;
    this.moves = []; // assigned move objects
    this.fainted = false;
    this.owner = null; // 所有プレイヤー名（表示用）
  }
  calcAtk(){return Math.max(1, Math.floor(this.stats.atk*(1+this.stages.atk*0.5)))}
  calcDef(){return Math.max(1, Math.floor(this.stats.def*(1+this.stages.def*0.5)))}
  calcSpA(){return Math.max(1, Math.floor(this.stats.spa*(1+this.stages.spa*0.5)))}
  calcSpD(){return Math.max(1, Math.floor(this.stats.spd*(1+this.stages.spd*0.5)))}
  calcSpe(){return Math.max(1, Math.floor(this.stats.spe*(1+this.stages.spe*0.5)))}
}

/* ------------------ UI Elements ------------------ */
const pokemonSelectionDiv = document.getElementById('pokemonSelection');
const moveSelectionDiv = document.getElementById('moveSelection');
const chosenInfo = document.getElementById('chosenInfo');
const roomInfo = document.getElementById('roomInfo');

let chosenTeam = [];
let chosenMoves = [];
let localState = {
  playerName: 'Player', room: null, isHost:false, roomKey:null,
  team:[], teamMoves:{}, party:[], opponent: null,
  battle:null, myIndex:0
};

function renderPokemonOptions(){
  pokemonSelectionDiv.innerHTML = '';
  for(const name of Object.keys(POKEMON_DB)){
    const d = document.createElement('div');
    d.className = 'pokechip';
    d.textContent = name + ' ('+POKEMON_DB[name].types.join('/') + ')';
    d.onclick = ()=>{
      if(chosenTeam.includes(name)) chosenTeam = chosenTeam.filter(x=>x!==name);
      else if(chosenTeam.length<3) chosenTeam.push(name);
      renderSelections();
    }
    // show selection state style
    pokemonSelectionDiv.appendChild(d);
  }
}
function renderMoveOptions(){
  moveSelectionDiv.innerHTML = '';
  for(const mv of Object.keys(MOVE_DB)){
    const d = document.createElement('div');
    d.className = 'pokechip';
    const left = document.createElement('div'); left.textContent = mv;
    const right = document.createElement('div'); right.className='small-muted'; right.textContent = MOVE_DB[mv].type + ' ' + (MOVE_DB[mv].cat||'');
    d.appendChild(left); d.appendChild(right);
    d.onclick = ()=>{
      if(chosenMoves.includes(mv)) chosenMoves = chosenMoves.filter(x=>x!==mv);
      else if(chosenMoves.length<4) chosenMoves.push(mv);
      renderSelections();
    }
    moveSelectionDiv.appendChild(d);
  }
}
function renderSelections(){
  chosenInfo.innerHTML = '選択済み：チーム(' + chosenTeam.join(',') + ')<br>技('+chosenMoves.join(',')+')';
}

renderPokemonOptions(); renderMoveOptions(); renderSelections();

/* -------------------- Firebase handling (簡易) -------------------- */
let firebaseApp = null, db = null;
async function initFirebase(){
  if(firebaseApp) return;
  await loadScript('https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js');
  await loadScript('https://www.gstatic.com/firebasejs/8.10.0/firebase-database.js');
  firebaseApp = firebase.initializeApp(FIREBASE_CONFIG);
  db = firebase.database();
}
function loadScript(src){return new Promise(res=>{const s=document.createElement('script');s.src=src;s.onload=res;document.head.appendChild(s);});}

/* ------------------ 部屋作成 / 参加 ------------------ */
document.getElementById('createRoom').onclick = async ()=>{
  const pwd = document.getElementById('roomPwd').value || ('r'+randint(1000,9999));
  const name = document.getElementById('playerName').value || 'Player';
  localState.playerName = name;
  const roomKey = 'room_'+pwd;
  localState.roomKey = roomKey; localState.isHost = true;
  if(chosenTeam.length!==3){ alert('まずチームを3体選んでください'); return; }
  if(chosenMoves.length===0){ chosenMoves = Object.keys(MOVE_DB).slice(0,4); }
  localState.team = chosenTeam.map(n=>({name:n,moves:chosenMoves.slice(0,4)}));
  roomInfo.textContent = '部屋作成: ' + pwd + ' — このパスワードを相手に教えてください。';
  if(FIREBASE_CONFIG){
    await initFirebase();
    const r = {host:name,roomKey:roomKey,players:{[name]:{team:localState.team}},battle:null};
    await db.ref(roomKey).set(r);
    db.ref(roomKey+'/players').on('value',snap=>{
      const val = snap.val();
      if(!val) return;
      const keys = Object.keys(val||{});
      // 自分以外のプレイヤーがいたら開始
      if(keys.length>=2 && !localState.battle) startBattleOnline();
    });
  } else {
    roomInfo.textContent += ' (オフライン待機中)';
  }
}

document.getElementById('joinRoom').onclick = async ()=>{
  const pwd = document.getElementById('roomPwd').value;
  if(!pwd){ alert('パスワードを入力してください'); return; }
  const name = document.getElementById('playerName').value || 'Player';
  localState.playerName = name;
  localState.roomKey = 'room_'+pwd; localState.isHost=false;
  roomInfo.textContent = '部屋に参加: ' + pwd;
  if(chosenTeam.length!==3){ alert('チームを3体選んでください'); return; }
  if(chosenMoves.length===0){ chosenMoves = Object.keys(MOVE_DB).slice(0,4); }
  localState.team = chosenTeam.map(n=>({name:n,moves:chosenMoves.slice(0,4)}));
  if(FIREBASE_CONFIG){
    await initFirebase();
    const rref = db.ref(localState.roomKey+'/players/'+name);
    await rref.set({team:localState.team});
    db.ref(localState.roomKey+'/players').on('value',snap=>{
      const val = snap.val();
      if(!val) return;
      const keys = Object.keys(val||{});
      if(keys.length>=2 && !localState.battle) startBattleOnline();
    });
  } else {
    roomInfo.textContent += ' (オフライン参加)';
  }
}

/* finalize チーム確定（ロビー待機用） */
document.getElementById('finalize').onclick = ()=>{
  if(chosenTeam.length!==3){ alert('チームを3体選んでください'); return; }
  if(chosenMoves.length===0) chosenMoves = Object.keys(MOVE_DB).slice(0,4);
  localState.team = chosenTeam.map(n=>({name:n,moves:chosenMoves.slice(0,4)}));
  roomInfo.textContent = '手持ち確定。部屋を作るか参加してください。ローカルで試す場合は「ローカル対戦開始」。';
}

/* ローカル対戦開始（CPU戦） */
document.getElementById('localStart').onclick = startLocalBattle;

/* ------------------ バトル開始処理 ------------------ */
async function startBattleOnline(){
  if(!db) return;
  const playersSnap = await db.ref(localState.roomKey+'/players').once('value');
  const players = playersSnap.val();
  if(!players) return;
  const names = Object.keys(players||{});
  if(names.length<2) return;
  const host = names[0];
  const other = names[1];
  const hostPlayer = players[host];
  const otherPlayer = players[other];
  const localIsHost = (localState.playerName === host);
  const my = localIsHost? hostPlayer : otherPlayer;
  const op = localIsHost? otherPlayer : hostPlayer;
  initBattle(host, other, my.team, op.team);
}

/* バトル初期化 */
function initBattle(nameA, nameB, teamA, teamB){
  const partyA = teamA.map(t=>{const p=new PokemonInstance(t.name); p.moves = t.moves.map(m=>Object.assign({name:m}, MOVE_DB[m] || {})); p.owner=nameA; return p});
  const partyB = teamB.map(t=>{const p=new PokemonInstance(t.name); p.moves = t.moves.map(m=>Object.assign({name:m}, MOVE_DB[m] || {})); p.owner=nameB; return p});
  localState.battle = {
    playerA:{name:nameA, party:partyA, active:0,left:partyA.length},
    playerB:{name:nameB, party:partyB, active:0,left:partyB.length},
    turn:1,weather:'なし'
  };
  localState.myIndex = (localState.playerName===nameA)?'A':'B';
  document.getElementById('battleArea').style.display='grid';
  document.getElementById('myNameUI').textContent = localState.playerName;
  document.getElementById('opNameUI').textContent = (localState.playerName===nameA)? nameB : nameA;
  enqueueMessage('バトル開始！ ' + nameA + ' vs ' + nameB);
  // show initial send-out messages
  const me = getLocalSide(); const op = getOppSide();
  const myActive = me.party[me.active]; const opActive = op.party[op.active];
  enqueueMessage(`${me.name} の ${myActive.name}（${me.name}）が くりだされた！`);
  enqueueMessage(`${op.name} の ${opActive.name}（${op.name}）が くりだされた！`);
  renderBattleUI();
}

/* get side helpers */
function getLocalSide(){ return localState.myIndex==='A'? localState.battle.playerA : localState.battle.playerB; }
function getOppSide(){ return localState.myIndex==='A'? localState.battle.playerB : localState.battle.playerA; }

/* ------------------ 表示・ログキュー（短い間隔で順次表示） ------------------ */
const logDiv = document.getElementById('log');
let messageQueue = [];
let messageTimer = null;
function enqueueMessage(msg){
  messageQueue.push(msg);
  if(!messageTimer){
    messageTimer = setInterval(()=>{ if(messageQueue.length===0){ clearInterval(messageTimer); messageTimer=null; return;} const m = messageQueue.shift(); const p=document.createElement('div'); p.textContent=m; logDiv.prepend(p); }, 800); // 800ms 間隔で順次表示
}

/* render battle UI */
function renderBattleUI(){
  if(!localState.battle) return;
  const me = getLocalSide(); const op = getOppSide();
  const myActive = me.party[me.active]; const opActive = op.party[op.active];
  document.getElementById('myPokeName').textContent = myActive.name;
  document.getElementById('opPokeName').textContent = opActive.name;
  document.getElementById('myHPText').textContent = myActive.curHP + '/' + myActive.maxHP;
  document.getElementById('opHPText').textContent = opActive.curHP + '/' + opActive.maxHP;
  document.getElementById('myHPBar').style.width = (myActive.curHP/myActive.maxHP*100)+'%';
  document.getElementById('opHPBar').style.width = (opActive.curHP/opActive.maxHP*100)+'%';
  document.getElementById('myStatus').textContent = '状態: ' + (myActive.status||'-');
  document.getElementById('opStatus').textContent = '状態: ' + (opActive.status||'-');
  document.getElementById('myStages').textContent = '能力変化: '+JSON.stringify(myActive.stages);
  document.getElementById('opStages').textContent = '能力変化: '+JSON.stringify(opActive.stages);
  document.getElementById('myLeft').textContent = me.left;
  document.getElementById('opLeft').textContent = op.left;
  document.getElementById('weatherUI').textContent = '天気: '+(localState.battle.weather||'なし');

  // party area
  const myPartyArea = document.getElementById('myPartyArea'); myPartyArea.innerHTML='';
  me.party.forEach((p,i)=>{
    const d = document.createElement('div');
    d.className='party-chip';
    d.textContent = p.name + (p.fainted? ' (戦闘不能)':'');
    d.onclick = ()=>{ if(i!==me.active) switchTo(i); };
    myPartyArea.appendChild(d);
  });
  const opPartyArea = document.getElementById('opPartyArea'); opPartyArea.innerHTML='';
  op.party.forEach((p,i)=>{
    const d = document.createElement('div'); d.className='party-chip';
    d.textContent = p.name + (p.fainted? ' (戦闘不能)':'');
    opPartyArea.appendChild(d);
  });

  // moves
  const movesDiv = document.getElementById('moveButtons'); movesDiv.innerHTML='';
  myActive.moves.forEach((m,i)=>{
    const b = document.createElement('button'); b.className='move-btn'; b.textContent = (i+1)+'. '+m.name;
    b.onclick=()=>{ playerChooseMove(i); };
    movesDiv.appendChild(b);
  });
}

/* ------------------ 行動選択・実行 ------------------ */
let pendingAction = null;
function playerChooseMove(moveIndex){
  const me = getLocalSide();
  pendingAction = {type:'move',moveIndex};
  enqueueMessage(`${localState.playerName} の ${me.party[me.active].name}（${localState.playerName}）は ${me.party[me.active].moves[moveIndex].name} を選択した！`);
  if(!FIREBASE_CONFIG){
    // ローカル（CPU）戦は即実行
    executeTurn(pendingAction);
  } else {
    // オンライン時は Firebase に action を書く実装が必要（省略→拡張可能）
    // 現在はオンライン開始を検出するとローカルで同期開始する簡易実装
    executeTurn(pendingAction);
  }
}

function switchTo(index){
  const me = getLocalSide();
  if(me.party[index].fainted){ alert('そのポケモンは戦闘不能です'); return; }
  enqueueMessage(`${localState.playerName} は ${me.party[index].name} に交代した！`);
  me.active = index; renderBattleUI();
}

function executeTurn(myAction){
  if(!localState.battle) return;
  const me = getLocalSide(); const op = getOppSide();
  const myActive = me.party[me.active]; const opActive = op.party[op.active];

  // CPU の行動を決定（乱数）
  const oppMoveIndex = randint(0, opActive.moves.length-1);
  const oppAction = {type:'move',moveIndex:oppMoveIndex};

  const myMove = myActive.moves[myAction.moveIndex]; const oppMove = opActive.moves[oppAction.moveIndex];
  const myPrio = myMove.priority||0; const oppPrio = oppMove.priority||0;
  let first = 'me';
  if(myPrio !== oppPrio) first = (myPrio>oppPrio)?'me':'op';
  else {
    if(myActive.calcSpe()>=opActive.calcSpe()) first='me'; else first='op';
  }

  if(first==='me'){
    performMove(me,myActive,myMove,op,opActive);
    // 相手がまだ生存していれば反撃
    if(opActive.curHP>0) performMove(op,opActive,oppMove,me,myActive);
  } else {
    performMove(op,opActive,oppMove,me,myActive);
    if(myActive.curHP>0) performMove(me,myActive,myMove,op,opActive);
  }

  // faint handling + 自動交代（CPU側）
  if(myActive.curHP<=0){ myActive.fainted=true; me.left--; enqueueMessage(`${me.name} の ${myActive.name}（${me.name}）は 戦闘不能になった！`); }
  if(opActive.curHP<=0){ opActive.fainted=true; op.left--; enqueueMessage(`${op.name} の ${opActive.name}（${op.name}）は 戦闘不能になった！`); }

  // CPU（相手）の自動交代
  if(op.party[op.active].fainted){
    const idx = op.party.findIndex(p=>!p.fainted);
    if(idx>=0){
      op.active = idx;
      enqueueMessage(`${op.name} は ${op.party[idx].name} を くりだした！`);
    } else {
      enqueueMessage(`${op.name} の ポケモンが全員戦闘不能！ ${me.name} の勝利！`);
      // 終了
    }
  }

  // プレイヤー側が戦闘不能の場合は自動交代（ローカル・CPUの自動交代機能）
  if(me.party[me.active].fainted){
    const idx = me.party.findIndex(p=>!p.fainted);
    if(idx>=0){
      me.active = idx;
      enqueueMessage(`${me.name} は ${me.party[idx].name} を くりだした！`);
    } else {
      enqueueMessage(`${me.name} の ポケモンが全員戦闘不能。対戦終了。`);
    }
  }

  renderBattleUI();
  localState.battle.turn++;
}

/* performMove: 単純化した副次効果を含む実行 */
function performMove(side,user,move,targetSide,target){
  enqueueMessage(`${side.name} の ${user.name}（${side.name}）が ${move.name} を くりだした！`);
  // 命中判定
  if(move.acc && Math.random()*100 > move.acc){ enqueueMessage(move.name + ' は はずれた！'); return; }
  const damage = calcDamage(user, Object.assign({name:move.name}, move), target, localState.battle);
  if(damage>0){
    target.curHP = Math.max(0, target.curHP - damage);
    enqueueMessage(`${move.name} は ${damage} ダメージ！ (${target.owner} の ${target.name})`);
  }
  // 反動系
  if(move.desc && move.desc.includes('反動')){
    const recoil = Math.floor(damage/3);
    user.curHP = Math.max(0, user.curHP - recoil);
    enqueueMessage(`${user.name} は 反動で ${recoil} ダメージを受けた`);
  }
  // 回復系
  if(move.name === 'じこさいせい'){ user.curHP = Math.min(user.maxHP, user.curHP + Math.floor(user.maxHP*0.5)); enqueueMessage(`${user.name} のHPが回復した`); }
  if(move.name === 'どくどく'){ target.status = 'どく'; enqueueMessage(`${target.name} は どく を負った`); }
  if(move.name === 'でんじは' || move.name === 'ほうでん'){ if(Math.random()<0.3){ target.status='まひ'; enqueueMessage(`${target.name} は まひした！`); } }
  if(move.name === 'ねむる'){ user.status='sleep'; user.curHP=Math.min(user.maxHP, user.curHP + Math.floor(user.maxHP*0.5)); enqueueMessage(`${user.name} は 眠りについた`); }
  if(move.name === 'やどりぎのタネ'){ target.status='やどりぎ'; enqueueMessage(`${target.name} は やどりぎを仕込まれた`); }
}

/* UI コントロール */
document.getElementById('forfeitBtn').onclick = ()=>{ enqueueMessage(`${localState.playerName} は 降参した。`); setTimeout(()=>location.reload(),800); };
document.getElementById('switchBtn').onclick = ()=>{ alert('パーティのアイコンをクリックして交代してください'); };

/* デバッグ / ローカル開始ボタンを別途追加（すである） */
const dbgBtn = document.createElement('button'); dbgBtn.textContent='デバッグ: ローカル対戦開始'; dbgBtn.style.marginTop='12px'; dbgBtn.onclick = startLocalBattle;
document.querySelector('.container').appendChild(dbgBtn);

/* ローカル対戦を構築 */
function startLocalBattle(){
  if(chosenTeam.length!==3){ alert('チームを3体選んでください'); return; }
  if(chosenMoves.length===0) chosenMoves = Object.keys(MOVE_DB).slice(0,4);
  const pName = document.getElementById('playerName').value || 'You';
  const oppName = pName + '_CPU';
  localState.playerName = pName;
  localState.opponent = {name:oppName, team: chosenTeam.map(n=>({name:n,moves:chosenMoves.slice(0,4)}))};
  initBattle(pName, oppName, localState.team, localState.opponent.team);
}