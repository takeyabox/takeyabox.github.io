/**
 * Main Game Logic
 * Handles game state, Firebase integration, and overall game flow
 */

// Initialize Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.database();

// Game state
let playerName = '';
let myTeam = [];
let roomId = '';
let mySide = ''; // 'p1' or 'p2'
let battleState = null;
let roomListener = null;

// Controllers
const ui = new UIController();
const battleEngine = new BattleEngine();

/**
 * Navigate to team selection screen
 */
function goToTeamSelect() {
    const input = document.getElementById('player-name-input');
    const name = input.value.trim();

    if (!name) {
        alert('プレイヤー名を入力してください');
        return;
    }

    playerName = name;
    ui.showScreen('screen-team');
    renderTeamBuilder();
}

/**
 * Render team builder interface
 */
function renderTeamBuilder() {
    const container = document.getElementById('team-builder-container');
    container.innerHTML = '';

    Object.values(pokemonData).forEach(pokemon => {
        const compatibleMoves = getCompatibleMoves(pokemon.id);
        const isSelected = myTeam.some(p => p.id === pokemon.id);

        const card = ui.createPokemonCard(
            pokemon,
            isSelected,
            handlePokemonCheckChange,
            compatibleMoves
        );

        container.appendChild(card);
    });

    updateSelectedCount();
}

/**
 * Handle Pokemon selection checkbox change
 */
function handlePokemonCheckChange(event) {
    updateSelectedCount();

    const card = event.target.closest('.pokemon-card');
    if (event.target.checked) {
        card.classList.add('selected');
    } else {
        card.classList.remove('selected');
    }
}

/**
 * Update selected Pokemon count display
 */
function updateSelectedCount() {
    const checkboxes = document.querySelectorAll('.pokemon-checkbox:checked');
    ui.updateSelectedCount(checkboxes.length);
}

/**
 * Finalize team selection and proceed to lobby
 */
function finalizeTeam() {
    const checkboxes = document.querySelectorAll('.pokemon-checkbox:checked');

    if (checkboxes.length !== 3) {
        alert('ポケモンを3体選択してください');
        return;
    }

    myTeam = [];
    let isValid = true;

    checkboxes.forEach(checkbox => {
        const pokemonId = parseInt(checkbox.value);
        const pokemon = pokemonData[pokemonId];
        const card = checkbox.closest('.pokemon-card');

        // Get selected moves
        const moveSelects = card.querySelectorAll('.move-select');
        const moves = Array.from(moveSelects)
            .map(select => select.value)
            .filter(value => value);

        if (moves.length !== 4) {
            isValid = false;
            return;
        }

        // Get selected item
        const itemSelect = card.querySelector('.item-select');
        const item = itemSelect ? itemSelect.value : 'none';

        // Build Pokemon object
        const teamPokemon = {
            id: pokemonId,
            name: pokemon.name,
            types: [...pokemon.types],
            ability: { ...pokemon.ability },
            stats: {
                hp: pokemon.stats.hp,
                atk: pokemon.stats.atk,
                def: pokemon.stats.def,
                spa: pokemon.stats.spa,
                spd: pokemon.stats.spd,
                spe: pokemon.stats.spe
            },
            maxHp: pokemon.stats.hp,
            currentHp: pokemon.stats.hp,
            moves: moves,
            item: item,
            status: pokemon.ability.name === "ぜったいねむり" ? "sleep" : null,
            sleepTurns: pokemon.ability.name === "ぜったいねむり" ? 999 : 0,
            statStages: { atk: 0, def: 0, spa: 0, spd: 0, spe: 0 },
            weaknessPolicyUsed: false,
            badPoisonCounter: 0
        };

        myTeam.push(teamPokemon);
    });

    if (!isValid) {
        alert('各ポケモンに技を4つ選択してください');
        return;
    }

    // Save team to Firebase (linked to player name)
    db.ref(`players/${playerName}`).set({
        team: myTeam,
        lastUpdated: Date.now()
    });

    ui.showScreen('screen-lobby');
    document.getElementById('display-name').textContent = playerName;
}

/**
 * Create a new battle room
 */
function createRoom() {
    const input = document.getElementById('create-room-pass');
    const password = input.value.trim();

    if (!password) {
        alert('パスワードを入力してください');
        return;
    }

    roomId = password;
    mySide = 'p1';

    // Initialize room data
    const roomData = {
        p1: {
            name: playerName,
            team: myTeam,
            activeIndex: 0,
            action: null
        },
        p2: null,
        turn: 0,
        weather: null,
        weatherTurns: 0,
        log: ['部屋が作成されました...', '対戦相手を待っています...'],
        phase: 'waiting'
    };

    db.ref(`rooms/${roomId}`).set(roomData).then(() => {
        startBattle();
    }).catch(err => {
        alert('部屋の作成に失敗しました: ' + err.message);
    });
}

/**
 * Join an existing battle room
 */
function joinRoom() {
    const input = document.getElementById('join-room-pass');
    const password = input.value.trim();

    if (!password) {
        alert('パスワードを入力してください');
        return;
    }

    roomId = password;
    mySide = 'p2';

    const roomRef = db.ref(`rooms/${roomId}`);

    roomRef.once('value').then(snapshot => {
        if (!snapshot.exists()) {
            alert('部屋が見つかりません');
            return;
        }

        const room = snapshot.val();
        if (room.p2) {
            alert('この部屋は満員です');
            return;
        }

        // Join room
        roomRef.update({
            p2: {
                name: playerName,
                team: myTeam,
                activeIndex: 0,
                action: null
            },
            phase: 'sendout',
            log: [...room.log, `${playerName}が参加しました!`, 'バトル開始！']
        }).then(() => {
            startBattle();
        });
    }).catch(err => {
        alert('部屋への参加に失敗しました: ' + err.message);
    });
}

/**
 * Start battle and set up Firebase listener
 */
function startBattle() {
    ui.showScreen('screen-battle');
    document.getElementById('room-info').textContent = `部屋: ${roomId}`;

    const roomRef = db.ref(`rooms/${roomId}`);

    // Listen for room updates
    roomListener = roomRef.on('value', snapshot => {
        if (!snapshot.exists()) {
            return;
        }

        battleState = snapshot.val();
        renderBattle();

        // Host (p1) resolves turn when both actions are submitted
        if (mySide === 'p1' &&
            battleState.phase === 'battle' &&
            battleState.p1.action &&
            battleState.p2.action) {
            resolveTurn();
        }
    });
}

/**
 * Render battle UI
 */
function renderBattle() {
    if (!battleState) return;

    const enemySide = mySide === 'p1' ? 'p2' : 'p1';

    // Wait for opponent
    if (!battleState[enemySide]) {
        ui.addBattleLog('対戦相手を待っています...');
        return;
    }

    const myData = battleState[mySide];
    const enemyData = battleState[enemySide];
    const myPokemon = myData.team[myData.activeIndex];
    const enemyPokemon = enemyData.team[enemyData.activeIndex];

    // Update Pokemon display
    document.getElementById('my-name').textContent = myPokemon.name;
    document.getElementById('enemy-name').textContent = enemyPokemon.name;

    ui.renderTypes(myPokemon.types, 'my-types');
    ui.renderTypes(enemyPokemon.types, 'enemy-types');

    ui.updateHpBar('my', myPokemon.currentHp, myPokemon.maxHp);
    ui.updateHpBar('enemy', enemyPokemon.currentHp, enemyPokemon.maxHp);

    ui.renderStatusBadges(myPokemon.status, 'my-status-badges');
    ui.renderStatusBadges(enemyPokemon.status, 'enemy-status-badges');

    ui.renderStatStages(myPokemon.statStages, 'my-stat-stages');

    ui.updateWeatherIndicator(battleState.weather);

    // Update battle log
    ui.setBattleLog(battleState.log);

    // Handle different phases
    if (battleState.phase === 'finished') {
        const isWinner = battleState.winner === mySide;
        ui.showBattleResult(isWinner, 'returnToTeamBuilder()');
        ui.toggleSwitchMenu(false);
        return;
    }

    if (battleState.phase === 'forced_switch') {
        if (myPokemon.currentHp <= 0) {
            // Show forced switch menu
            ui.toggleSwitchMenu(true);
            ui.renderSwitchMenu(myData.team, myData.activeIndex, submitForcedSwitch, true);
        } else {
            // Wait for opponent to switch
            ui.showWaitingMessage('相手がポケモンを選んでいます...');
            ui.setSwitchButtonEnabled(false);
        }
        return;
    }

    // Normal battle phase
    ui.setSwitchButtonEnabled(true);
    ui.toggleSwitchMenu(false);

    if (myData.action) {
        ui.showWaitingMessage('相手の行動を待っています...');
    } else {
        ui.renderMoveButtons(myPokemon.moves, selectMove, false);
    }
}

/**
 * Select a move
 */
function selectMove(moveName) {
    submitAction('move', moveName);
}

/**
 * Show switch menu
 */
function showSwitchMenu() {
    const myData = battleState[mySide];
    ui.toggleSwitchMenu(true);
    ui.renderSwitchMenu(myData.team, myData.activeIndex, selectSwitch, false);
}

/**
 * Cancel switch menu
 */
function cancelSwitch() {
    ui.toggleSwitchMenu(false);
}

/**
 * Select a Pokemon to switch to
 */
function selectSwitch(index) {
    submitAction('switch', null, index);
    cancelSwitch();
}

/**
 * Submit action (move or switch)
 */
function submitAction(type, move, switchIndex) {
    const action = { type };

    if (type === 'move') {
        action.move = move;
    } else if (type === 'switch') {
        action.switchIndex = switchIndex;
    }

    db.ref(`rooms/${roomId}/${mySide}/action`).set(action);

    // Change phase to battle if this is the first action after sendout
    if (battleState.phase === 'sendout') {
        db.ref(`rooms/${roomId}/phase`).set('battle');
    }
}

/**
 * Submit forced switch (after Pokemon faints)
 */
function submitForcedSwitch(index) {
    const roomRef = db.ref(`rooms/${roomId}`);

    roomRef.child(`${mySide}/activeIndex`).set(index).then(() => {
        // Check if both sides have active Pokemon
        roomRef.once('value').then(snapshot => {
            const state = snapshot.val();
            const p1Active = state.p1.team[state.p1.activeIndex];
            const p2Active = state.p2.team[state.p2.activeIndex];

            if (p1Active.currentHp > 0 && p2Active.currentHp > 0) {
                const newPokemon = state[mySide].team[index];
                const log = [...state.log, `${state[mySide].name}は${newPokemon.name}を繰り出した！`];

                roomRef.update({
                    phase: 'battle',
                    turn: state.turn + 1,
                    log: log,
                    'p1/action': null,
                    'p2/action': null
                });
            }
        });
    });
}

/**
 * Resolve turn (Host only)
 */
function resolveTurn() {
    // Set phase to resolving
    db.ref(`rooms/${roomId}/phase`).set('resolving');

    const state = JSON.parse(JSON.stringify(battleState)); // Deep copy
    const logs = [];

    const p1Data = state.p1;
    const p2Data = state.p2;
    const p1Pokemon = p1Data.team[p1Data.activeIndex];
    const p2Pokemon = p2Data.team[p2Data.activeIndex];

    // Determine turn order
    const turnOrder = battleEngine.determineTurnOrder(
        p1Data.action,
        p2Data.action,
        p1Pokemon,
        p2Pokemon
    );

    // Execute actions in order
    turnOrder.forEach((side, orderIndex) => {
        const actorSide = side;
        const targetSide = side === 'p1' ? 'p2' : 'p1';
        const actor = state[actorSide].team[state[actorSide].activeIndex];
        const target = state[targetSide].team[state[targetSide].activeIndex];

        if (actor.currentHp <= 0) return; // Skip if fainted

        const action = state[actorSide].action;

        // Handle switch
        if (action.type === 'switch') {
            state[actorSide].activeIndex = action.switchIndex;
            const newPokemon = state[actorSide].team[action.switchIndex];
            logs.push(`${state[actorSide].name}は${newPokemon.name}に交代した！`);
            return;
        }

        // Handle move
        if (action.type === 'move') {
            const move = pokemonMoves.find(m => m.name === action.move);
            if (!move) return;

            // Check if can act (status conditions)
            const canActResult = battleEngine.canAct(actor);
            if (!canActResult.canAct) {
                if (canActResult.message) logs.push(canActResult.message);
                return;
            }
            if (canActResult.message) logs.push(canActResult.message);

            logs.push(`${actor.name}の${move.name}！`);

            // Accuracy check
            if (move.accuracy && move.accuracy !== Infinity) {
                if (Math.random() * 100 > move.accuracy) {
                    logs.push(`しかし ${target.name}には 当たらなかった！`);
                    return;
                }
            }

            // Damage calculation
            if (move.category !== "変化") {
                const damage = battleEngine.calculateDamage(actor, target, move, state);
                target.currentHp = Math.max(0, target.currentHp - damage);

                // Type effectiveness messages
                const typeEffect = battleEngine.getTypeEffectiveness(move.type, target.types);
                if (typeEffect > 1) logs.push('効果はばつぐんだ！');
                if (typeEffect < 1 && typeEffect > 0) logs.push('効果はいまひとつのようだ...');
                if (typeEffect === 0) logs.push(`${target.name}には効果がないようだ...`);

                logs.push(`${target.name}に${damage}ダメージ！`);

                // Apply move effects
                battleEngine.applyMoveEffects(actor, target, move, damage, logs);

                if (target.currentHp === 0) {
                    logs.push(`${target.name}は倒れた！`);
                }
            } else {
                // Status move effects
                battleEngine.applyMoveEffects(actor, target, move, 0, logs);
            }
        }
    });

    // End of turn effects (if battle continues)
    const p1Active = state.p1.team[state.p1.activeIndex];
    const p2Active = state.p2.team[state.p2.activeIndex];

    if (p1Active.currentHp > 0) {
        battleEngine.applyEndOfTurnEffects(p1Active, logs);
    }
    if (p2Active.currentHp > 0) {
        battleEngine.applyEndOfTurnEffects(p2Active, logs);
    }

    // Weather update
    const weatherMsg = battleEngine.updateWeather();
    if (weatherMsg) logs.push(weatherMsg);

    // Check for battle end
    const p1Alive = state.p1.team.filter(p => p.currentHp > 0).length;
    const p2Alive = state.p2.team.filter(p => p.currentHp > 0).length;

    state.log = [...state.log, ...logs];
    state.p1.action = null;
    state.p2.action = null;
    state.weather = battleEngine.weather;
    state.weatherTurns = battleEngine.weatherTurns;

    if (p1Alive === 0 || p2Alive === 0) {
        state.phase = 'finished';
        state.winner = p1Alive > 0 ? 'p1' : 'p2';
        state.log.push(`バトル終了！ ${state[state.winner].name}の勝利！`);
    } else if (p1Active.currentHp <= 0 || p2Active.currentHp <= 0) {
        state.phase = 'forced_switch';
    } else {
        state.phase = 'battle';
        state.turn = state.turn + 1;
    }

    // Update Firebase
    db.ref(`rooms/${roomId}`).set(state);
}

/**
 * Return to team builder
 */
function returnToTeamBuilder() {
    // Stop listening to room
    if (roomListener) {
        db.ref(`rooms/${roomId}`).off('value', roomListener);
        roomListener = null;
    }

    // Reset team HP and status
    myTeam.forEach(pokemon => {
        pokemon.currentHp = pokemon.maxHp;
        pokemon.status = pokemon.ability.name === "ぜったいねむり" ? "sleep" : null;
        pokemon.statStages = { atk: 0, def: 0, spa: 0, spd: 0, spe: 0 };
        pokemon.weaknessPolicyUsed = false;
        pokemon.badPoisonCounter = 0;
    });

    ui.showScreen('screen-team');
    renderTeamBuilder();
}
