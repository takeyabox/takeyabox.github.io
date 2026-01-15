/**
 * Main Game Logic
 * Handles game state, Firebase integration, and overall game flow
 */

// Initialize Firebase
if (typeof firebase !== 'undefined') {
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
} else {
    console.error("Firebase SDK not loaded.");
}
const db = (typeof firebase !== 'undefined') ? firebase.database() : null;


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
window.goToTeamSelect = goToTeamSelect;


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
    const leadRadio = card.querySelector('.lead-radio');

    if (event.target.checked) {
        card.classList.add('selected');
        leadRadio.disabled = false;
        // If no lead selected yet, select this one?
        if (!document.querySelector('input[name="team-lead"]:checked')) {
            leadRadio.checked = true;
        }
    } else {
        card.classList.remove('selected');
        leadRadio.disabled = true;
        leadRadio.checked = false;
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
    const team = buildTeamFromUI();
    if (!team) return; // Validation failed

    myTeam = team;




    // Save team to Firebase (linked to player name)
    db.ref(`players/${playerName}`).set({
        team: myTeam,
        lastUpdated: Date.now()
    });

    ui.showScreen('screen-lobby');
    ui.showScreen('screen-lobby');
    document.getElementById('display-name').textContent = playerName;
}
window.finalizeTeam = finalizeTeam;


/**
 * Build team array from UI selections
 * Returns null if validation fails
 */
function buildTeamFromUI() {
    const checkboxes = document.querySelectorAll('.pokemon-checkbox:checked');

    if (checkboxes.length !== 3) {
        alert('ポケモンを3体選択してください');
        return null;
    }

    const team = [];
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

        // Get selected ability
        const abilitySelect = card.querySelector('.ability-select');
        const selectedAbilityName = abilitySelect ? abilitySelect.value : pokemon.abilities[0].name;
        const selectedAbility = pokemon.abilities.find(a => a.name === selectedAbilityName) || pokemon.abilities[0];

        // Build Pokemon object
        const teamPokemon = {
            id: pokemonId,
            name: pokemon.name,
            types: [...pokemon.types],
            ability: { ...selectedAbility },
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
            status: selectedAbility.name === "ぜったいねむり" ? "sleep" : null,
            sleepTurns: selectedAbility.name === "ぜったいねむり" ? 999 : 0,
            statStages: { atk: 0, def: 0, spa: 0, spd: 0, spe: 0 },
            weaknessPolicyUsed: false,
            badPoisonCounter: 0,
            chargingTurn: false,
            invulnerableState: null,
            substituteHp: 0,
            protectSuccessCount: 0,
            mustRecharge: false
        };


        team.push(teamPokemon);
    });

    if (!isValid) {
        alert('各ポケモンに技を4つ選択してください');
        return null;
    }

    // Lead processing
    const leadRadio = document.querySelector('input[name="team-lead"]:checked');
    if (!leadRadio) {
        alert('先発のポケモンを選択してください');
        return null;
    }
    const leadId = parseInt(leadRadio.value);

    // Sort team: Lead first
    team.sort((a, b) => (a.id === leadId ? -1 : b.id === leadId ? 1 : 0));

    return team;
}


/**
 * Save current team to Firebase
 */
function saveTeam() {
    const team = buildTeamFromUI();
    if (!team) return;

    if (!playerName) {
        alert('プレイヤー名が設定されていません');
        return;
    }

    // Minify data for storage (store only necessary IDs/names)
    // Actually, storing the full object is easier for now to reload
    // But to be cleaner, we should trust the schema.
    // However, for loading back to UI, we need the moves and items.

    const saveDate = {
        team: team.map(p => ({
            id: p.id,
            moves: p.moves,
            item: p.item,
            ability: p.ability.name
        })),
        updatedAt: firebase.database.ServerValue.TIMESTAMP
    };

    db.ref(`players/${playerName}`).set(saveDate)
        .then(() => alert('チームを保存しました！'))
        .catch(err => alert('保存に失敗しました: ' + err.message));
}

window.saveTeam = saveTeam;


/**
 * Load team from Firebase
 */
function loadTeam() {
    if (!playerName) {
        alert('プレイヤー名が設定されていません');
        return;
    }

    db.ref(`players/${playerName}`).once('value')
        .then(snapshot => {
            if (!snapshot.exists()) {
                alert('保存されたチームが見つかりません');
                return;
            }
            const data = snapshot.val();
            if (data.team) {
                restoreTeamToUI(data.team);
                alert('チームを読み込みました！');
            }
        })
        .catch(err => alert('読み込みに失敗しました: ' + err.message));
}

window.loadTeam = loadTeam;


/**
 * Restore team data to UI
 */
function restoreTeamToUI(savedTeam) {
    // Reset all selections
    const allCheckboxes = document.querySelectorAll('.pokemon-checkbox');
    allCheckboxes.forEach(cb => {
        cb.checked = false;
        cb.closest('.pokemon-card').classList.remove('selected');
    });

    // Restore selections
    savedTeam.forEach(savedPoke => {
        const pokemonId = savedPoke.id;
        const checkbox = document.querySelector(`.pokemon-checkbox[value="${pokemonId}"]`);

        if (checkbox) {
            checkbox.checked = true;
            const card = checkbox.closest('.pokemon-card');
            card.classList.add('selected');

            // Restore Moves
            const moveSelects = card.querySelectorAll('.move-select');
            savedPoke.moves.forEach((moveName, index) => {
                if (moveSelects[index]) {
                    moveSelects[index].value = moveName;
                }
            });

            // Restore Item
            const itemSelect = card.querySelector('.item-select');
            if (itemSelect && savedPoke.item) {

                itemSelect.value = savedPoke.item;
            }

            // Restore Lead (if this is the first one in savedTeam, check it)
            // Ideally savedTeam order is preserved (Lead is index 0)
            const leadRadio = card.querySelector('.lead-radio');
            if (leadRadio) {
                leadRadio.disabled = false;
                if (savedPoke.id === savedTeam[0].id) {
                    leadRadio.checked = true;
                }
            }
        }
    });

    updateSelectedCount();
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
            action: null,
            tailwindTurns: 0,
            hazards: { stealthRock: false, spikes: 0, toxicSpikes: 0, stickyWeb: false }
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
                action: null,
                tailwindTurns: 0,
                hazards: { stealthRock: false, spikes: 0, toxicSpikes: 0, stickyWeb: false }
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
    ui.resetActionPanel();
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

    if (battleState.phase === 'switching') {
        const needsSwitch = myPokemon.currentHp <= 0 || myData.pendingSwitch;

        if (needsSwitch) {
            // Show switch menu
            ui.toggleSwitchMenu(true);
            ui.renderSwitchMenu(myData.team, myData.activeIndex, submitPhaseSwitch, true);
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
        // Calculate valid moves
        let validMoves = [...myPokemon.moves];

        // Choice Item Lock
        if (myPokemon.item && myPokemon.item.startsWith('choice-') && myPokemon.choiceMove) {
            validMoves = [myPokemon.choiceMove];
        }

        // Assault Vest (No Status Moves)
        if (myPokemon.item === 'assault-vest') {
            validMoves = validMoves.filter(mName => {
                const mData = pokemonMoves.find(m => m.name === mName);
                return mData && mData.category !== '変化';
            });
        }

        ui.renderMoveButtons(myPokemon.moves, selectMove, false, validMoves);
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
 * Submit switch during switching phase (KO or U-turn)
 */
function submitPhaseSwitch(index) {
    const roomRef = db.ref(`rooms/${roomId}`);
    const mySideData = battleState[mySide];
    const oldActiveIndex = mySideData.activeIndex; // Capture old index

    const updates = {};
    updates[`${mySide}/activeIndex`] = index;
    updates[`${mySide}/pendingSwitch`] = null;

    roomRef.update(updates).then(() => {
        // Check if both sides are ready
        return roomRef.once('value');
    }).then(snapshot => {
        const state = snapshot.val();

        // Check p1 status
        const p1Active = state.p1.team[state.p1.activeIndex];
        const p1NeedsSwitch = p1Active.currentHp <= 0 || state.p1.pendingSwitch;

        // Check p2 status
        const p2Active = state.p2.team[state.p2.activeIndex];
        const p2NeedsSwitch = p2Active.currentHp <= 0 || state.p2.pendingSwitch;

        const isBatonPass = state[mySide].batonPass;
        let passedStats = null;
        let passedSubstituteHp = 0;

        const updatedTeam = [...state[mySide].team];

        // Handle Old Pokemon (Reset)
        if (oldActiveIndex >= 0 && updatedTeam[oldActiveIndex]) {
            const oldPoke = updatedTeam[oldActiveIndex];

            // Capture stats if BP
            if (isBatonPass) {
                passedStats = { ...oldPoke.statStages };
                passedSubstituteHp = oldPoke.substituteHp;
            }

            // Reset volatile status
            oldPoke.statStages = { atk: 0, def: 0, spa: 0, spd: 0, spe: 0 };
            oldPoke.confusionTurns = 0;
            oldPoke.badPoisonCounter = 0;
            oldPoke.substituteHp = 0;
            oldPoke.status = oldPoke.status === 'confusion' ? null : oldPoke.status;
            oldPoke.choiceMove = null;
            oldPoke.perishCount = 0;
            oldPoke.drowsyTurn = 0;

            updatedTeam[oldActiveIndex] = oldPoke;
        }

        // Prepare New Pokemon
        const newPokemon = updatedTeam[index];
        const activeSide = state[mySide];

        // Apply Hazards
        const switchLogs = [];
        battleEngine.applyEntryHazards(newPokemon, activeSide, switchLogs);

        // Apply Baton Pass
        if (isBatonPass && passedStats) {
            newPokemon.statStages = passedStats;
            if (passedSubstituteHp > 0) {
                newPokemon.substituteHp = passedSubstituteHp;
                switchLogs.push(`${updatedTeam[oldActiveIndex].name}の みがわりを 引き継いだ！`);
            }
            switchLogs.push(`${updatedTeam[oldActiveIndex].name}の 能力変化を 引き継いだ！`);
        }

        updatedTeam[index] = newPokemon;

        // Prepare update object
        const logEntry = [`${state[mySide].name}は${newPokemon.name}を繰り出した！`, ...switchLogs];

        // If neither needs switch, proceed to next turn
        if (!p1NeedsSwitch && !p2NeedsSwitch) {
            roomRef.update({
                phase: 'battle',
                turn: state.turn + 1,
                log: [...state.log, ...logEntry],
                [`${mySide}/team`]: updatedTeam,
                [`${mySide}/batonPass`]: null, // Clear flag
                'p1/action': null,
                'p2/action': null
            });
        } else {
            // Still waiting for other player
            roomRef.update({
                log: [...state.log, ...logEntry],
                [`${mySide}/team`]: updatedTeam,
                [`${mySide}/batonPass`]: null // Clear flag
            });
        }
    });

}

/**
 * Resolve turn (Host only)
 */
function resolveTurn() {
    // Set phase to resolving
    db.ref(`rooms/${roomId}/phase`).set('resolving');

    try {
        const state = JSON.parse(JSON.stringify(battleState)); // Deep copy
        const logs = [];

        const p1Data = state.p1;
        const p2Data = state.p2;
        const p1Pokemon = p1Data.team[p1Data.activeIndex];
        const p2Pokemon = p2Data.team[p2Data.activeIndex];

        // Reset protection state at start of turn resolving
        p1Pokemon.isProtected = false;
        p2Pokemon.isProtected = false;

        // Lead Pokemon Weather Trigger (Turn 1 only)
        if (state.turn === 0) {
            // Determine order for weather activation (Speed based - faster first so slower overrides)
            let first = p1Pokemon;
            let second = p2Pokemon;
            if (p2Pokemon.stats.spe > p1Pokemon.stats.spe) {
                first = p2Pokemon; second = p1Pokemon;
            } else if (p2Pokemon.stats.spe === p1Pokemon.stats.spe) {
                if (Math.random() < 0.5) { first = p2Pokemon; second = p1Pokemon; }
            }

            battleEngine.checkEntryAbilities(first, second, logs);
            battleEngine.checkEntryAbilities(second, first, logs);
        }

        // Determine turn order
        const turnOrder = battleEngine.determineTurnOrder(
            p1Data.action,
            p2Data.action,
            p1Pokemon,
            p2Pokemon,
            p1Data.tailwindTurns > 0,
            p2Data.tailwindTurns > 0
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
                const isBatonPass = state[actorSide].batonPass;
                const passedStats = { ...actor.statStages };
                const passedSubstituteHp = actor.substituteHp;

                // Reset volatile status of current pokemon (the one switching OUT)
                actor.statStages = { atk: 0, def: 0, spa: 0, spd: 0, spe: 0 };
                actor.confusionTurns = 0;
                actor.badPoisonCounter = 0;
                actor.substituteHp = 0;
                actor.isProtected = false;
                actor.chargingTurn = false;
                actor.invulnerableState = null;
                if (actor.status === 'confusion') actor.status = null;
                actor.choiceMove = null;
                actor.truantSkipping = false; // Reset Truant
                actor.perishCount = 0;
                actor.drowsyTurn = 0;

                // Regenerator (さいせいりょく)
                if (actor.ability && actor.ability.name === 'さいせいりょく') {
                    const heal = Math.floor(actor.maxHp / 3);
                    actor.currentHp = Math.min(actor.maxHp, actor.currentHp + heal);
                    logs.push(`${actor.name}は さいせいりょくで 回復した！`);
                }

                // Perform switch
                state[actorSide].activeIndex = action.switchIndex;
                const newPokemon = state[actorSide].team[state[actorSide].activeIndex];
                logs.push(`${state[actorSide].name}は ${newPokemon.name}に 交代した！`);

                // Baton Pass Application
                if (isBatonPass) {
                    newPokemon.statStages = passedStats;
                    if (passedSubstituteHp > 0) {
                        newPokemon.substituteHp = passedSubstituteHp;
                        logs.push(`${actor.name}の みがわりを 引き継いだ！`);
                    }
                    logs.push(`${actor.name}の 能力変化を 引き継いだ！`);
                    state[actorSide].batonPass = false;
                }

                // Apply Entry Hazards
                battleEngine.applyEntryHazards(newPokemon, state[actorSide], logs);

                // Entry Ability Trigger (Intimidate, Weather, Trace)
                const opponent = state[targetSide].team[state[targetSide].activeIndex];
                battleEngine.checkEntryAbilities(newPokemon, opponent, logs);
                return;
            }

            // Handle move
            if (action.type === 'move') {
                // Double check for fainted state (defensive programming)
                if (actor.currentHp <= 0) return;

                if (actor.currentHp <= 0) return;

                // Recharge Check
                if (actor.mustRecharge) {
                    logs.push(`${actor.name}は 反動で 動けない！`);
                    actor.mustRecharge = false;
                    actor.protectSuccessCount = 0; // Reset protect count too? Yes, probably.
                    return;
                }

                let move = pokemonMoves.find(m => m.name === action.move);
                if (!move) return;

                // Sleep Talk (ねごと)
                if (move.name === 'ねごと') {
                    if (actor.status !== 'sleep' && (!actor.ability || actor.ability.name !== 'ぜったいねむり')) {
                        logs.push('しかし 失敗した！');
                        return;
                    }

                    const eligibleMoves = actor.moves.filter(m => m !== 'ねごと' && m !== 'ゆびをふる' && m !== 'オウムがえし');
                    if (eligibleMoves.length === 0) {
                        logs.push('しかし うまく 決まらなかった！');
                        return;
                    }
                    const randomMoveName = eligibleMoves[Math.floor(Math.random() * eligibleMoves.length)];
                    const randomMove = pokemonMoves.find(m => m.name === randomMoveName);
                    if (randomMove) {
                        logs.push(`${actor.name}は 寝言を 言っている！`);
                        logs.push(`${actor.name}の ${randomMove.name}！`);
                        move = randomMove;
                    } else {
                        return;
                    }
                }


                // Truant (なまけ) Check
                if (actor.ability && actor.ability.name === 'なまけ') {
                    if (actor.truantSkipping) {
                        logs.push(`${actor.name}は 怠けている！`);
                        actor.truantSkipping = false;
                        return;
                    } else {
                        actor.truantSkipping = true;
                    }
                }

                // Two-Turn Move Logic (Dig/Fly)
                if (move.effect && move.effect.semi_invulnerable) {
                    if (!actor.chargingTurn) {
                        actor.chargingTurn = true;
                        actor.invulnerableState = move.effect.semi_invulnerable;
                        if (move.name === 'あなをほる') logs.push(`${actor.name}は 穴を 掘った！`);
                        if (move.name === 'そらをとぶ') logs.push(`${actor.name}は 空 高く 飛び上がった！`);
                        return; // Skip rest of turn
                    } else {
                        // Execute attack
                        actor.chargingTurn = false;
                        actor.invulnerableState = null;
                    }
                } else {
                    // Reset any existing (shouldn't happen if logic is correct but good safety)
                    actor.chargingTurn = false;
                    actor.invulnerableState = null;
                }

                // Set Choice Lock
                if (actor.item && actor.item.startsWith('choice-') && !actor.choiceMove) {
                    actor.choiceMove = move.name;
                }

                // Check if can act (status conditions)
                const canActResult = battleEngine.canAct(actor);
                if (!canActResult.canAct) {
                    if (canActResult.message) logs.push(canActResult.message);
                    return;
                }


                let effectiveTarget = target;
                let moveReflected = false;

                // Magic Bounce (マジックミラー)
                if (move.category === '変化' && target.ability && target.ability.name === 'マジックミラー') {
                    // Verify move applies to opponent (not self)
                    // Most status moves target opponent. Some target self (e.g. Swords Dance).
                    // Magic Bounce only reflects moves targeting the user of Magic Bounce.
                    // How to distinguish? move.target?
                    // Currently move data doesn't have explicit target info for all moves.
                    // Assumption: If it's a status move and it's being used on 'target' (opponent), it reflects.
                    // But 'game.js' logic assumes actor targets target.
                    // We need to check if the move is "self" targeting.
                    // For now, let's assume all Status moves that reach here are targeting opponent unless specified.
                    // (Moves like Swords Dance usually handled by move.effect.stat_change.target === 'self')
                    // If move has NO effect on opponent, maybe skip reflection?
                    // But Prankster/Taunt/etc exists.
                    // Simplistic Magic Bounce: Reflects all status moves.
                    // Check if move is NOT self-targeting
                    const isSelfTarget = move.effect && move.effect.stat_change && move.effect.stat_change.every(sc => sc.target === 'self');

                    if (!isSelfTarget) {
                        effectiveTarget = actor;
                        moveReflected = true;
                        logs.push(`${target.name}の マジックミラーで 跳ね返した！`);
                    }
                }

                if (moveReflected) {
                    logs.push(`${actor.name}に ${move.name}！`);
                } else {
                    logs.push(`${actor.name}の${move.name}！`);
                }

                const finalTarget = moveReflected ? actor : target;


                // Protection Check
                // Block move if target is protected AND move is offensive
                // Offensive definition: Power > 0 OR Status Ailment OR Negative Stat Change on Opponent
                const isOffensive = (move.power > 0) ||
                    (move.effect && move.effect.status_ailment) ||
                    (move.effect && move.effect.stat_change && move.effect.stat_change.some(sc => sc.target === 'opponent'));

                // Exceptions: Moves that penetrate protect or self-targeting moves shouldn't check protection
                if (target.isProtected && isOffensive) {
                    // Check for Feint-like moves if any exist (none in current simple db but good practice)
                    // For now, simple block
                    logs.push(`${target.name}は 攻撃を 防いだ！`);
                    return;
                }

                // Accuracy & Invulnerability check
                if (!battleEngine.checkHit(actor, target, move)) {
                    if (target.invulnerableState) {
                        logs.push(`${target.name}には 当たらなかった！`); // Special message?
                    } else {
                        logs.push(`しかし ${target.name}には 当たらなかった！`);
                    }
                    return;
                }

                // Damage calculation
                if (move.category !== "変化") {
                    const damage = battleEngine.calculateDamage(actor, target, move, state);

                    // Type effectiveness messages
                    const typeEffect = battleEngine.getTypeEffectiveness(move.type, target.types);
                    if (typeEffect > 1) logs.push('効果はばつぐんだ！');
                    if (typeEffect < 1 && typeEffect > 0) logs.push('効果はいまひとつのようだ...');
                    if (typeEffect === 0) logs.push(`${target.name}には効果がないようだ...`);

                    // Focus Sash Logic
                    let finalDamage = damage;
                    if (target.item === 'focus-sash' && target.currentHp === target.maxHp && damage >= target.currentHp) {
                        // Only works if no substitute
                        if (!target.substituteHp || target.substituteHp <= 0) {
                            finalDamage = target.currentHp - 1;
                            target.item = null; // Consume item
                            logs.push(`${target.name}は きあいのタスキで 持ちこたえた！`);
                        }
                    }

                    // Apply Damage (Substitute check)
                    let executedDamage = finalDamage;
                    if (target.substituteHp > 0) {
                        target.substituteHp -= finalDamage;
                        logs.push(`みがわりが ダメージを 受けた！`);
                        if (target.substituteHp <= 0) {
                            target.substituteHp = 0;
                            logs.push(`${target.name}の みがわりは 壊れた！`);
                        }
                        // No overflow damage to actual HP
                        finalDamage = 0;
                    } else {
                        const previousHp = target.currentHp;
                        target.currentHp = Math.max(0, target.currentHp - finalDamage);
                        logs.push(`${target.name}に${finalDamage}ダメージ！`);
                        battleEngine.checkBerryConsumption(target, logs);

                        // Berserk (ぎゃくじょう)
                        if (target.ability && target.ability.name === 'ぎゃくじょう' && target.currentHp > 0 &&
                            previousHp > target.maxHp / 2 && target.currentHp <= target.maxHp / 2) {
                            target.statStages.spa = Math.min(6, target.statStages.spa + 1);
                            logs.push(`${target.name}の ぎゃくじょうが 発動！ 特攻が 上がった！`);
                        }
                    }


                    // Apply move effects
                    // (Note: Status effects might be blocked by substitute, handled in battle-engine)
                    battleEngine.applyMoveEffects(actor, target, move, executedDamage, logs, state[actorSide], state[targetSide]);


                    // Handle Weakness Policy consumption
                    if (target.weaknessPolicyUsed) {
                        target.item = null; // Consume item
                        target.weaknessPolicyUsed = false; // Reset flag
                    }

                    if (target.currentHp === 0) {
                        logs.push(`${target.name}は倒れた！`);

                        // Moxie (じしんかじょう)
                        if (actor.ability && actor.ability.name === 'じしんかじょう') {
                            actor.statStages.atk = Math.min(6, actor.statStages.atk + 1);
                            logs.push(`${actor.name}の じしんかじょうで 攻撃が 上がった！`);
                        }
                    }
                } else {
                    // Status move effects
                    battleEngine.applyMoveEffects(actor, target, move, 0, logs, state[actorSide], state[targetSide]);
                }

                // Check for Switch Self effect
                if (move.effect && move.effect.switch_self) {
                    state[actorSide].pendingSwitch = true;
                    if (move.effect.pass_stats) {
                        state[actorSide].batonPass = true;
                    }
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

        // Tailwind update
        if (state.p1.tailwindTurns > 0) {
            state.p1.tailwindTurns--;
            if (state.p1.tailwindTurns === 0) logs.push(`${state.p1.name}の 追い風が 止んだ！`);
        }
        if (state.p2.tailwindTurns > 0) {
            state.p2.tailwindTurns--;
            if (state.p2.tailwindTurns === 0) logs.push(`${state.p2.name}の 追い風が 止んだ！`);
        }


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
        } else if (p1Active.currentHp <= 0 || p2Active.currentHp <= 0 || state.p1.pendingSwitch || state.p2.pendingSwitch) {
            state.phase = 'switching';
        } else {
            state.phase = 'battle';
            state.turn = state.turn + 1;
        }

        // Update Firebase
        db.ref(`rooms/${roomId}`).set(state);

    } catch (error) {
        console.error("Error in resolveTurn:", error);

        // Recover from error state so game doesn't hang
        const errorState = {
            ...battleState,
            phase: 'battle', // Go back to battle phase
            log: [...(battleState.log || []), `エラーが発生しました: ${error.message}`],
            'p1/action': null,
            'p2/action': null
        };

        db.ref(`rooms/${roomId}`).update(errorState);
    }
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
    battleState = null;

    // Reset team HP and status
    myTeam.forEach(pokemon => {
        pokemon.currentHp = pokemon.maxHp;
        pokemon.status = pokemon.ability.name === "ぜったいねむり" ? "sleep" : null;
        pokemon.statStages = { atk: 0, def: 0, spa: 0, spd: 0, spe: 0 };
        pokemon.weaknessPolicyUsed = false;

        pokemon.badPoisonCounter = 0;
        pokemon.chargingTurn = false;
        pokemon.invulnerableState = null;
        pokemon.substituteHp = 0;
        pokemon.perishCount = 0;
        pokemon.drowsyTurn = 0;
    });

    ui.showScreen('screen-team');
    renderTeamBuilder();
}
