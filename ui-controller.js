/**
 * UI Controller
 * Handles all UI rendering and updates
 */

class UIController {
    constructor() {
        this.typeColorMap = {
            'ノーマル': 'normal', 'ほのお': 'fire', 'みず': 'water', 'でんき': 'electric',
            'くさ': 'grass', 'こおり': 'ice', 'かくとう': 'fighting', 'どく': 'poison',
            'じめん': 'ground', 'ひこう': 'flying', 'エスパー': 'psychic', 'むし': 'bug',
            'いわ': 'rock', 'ゴースト': 'ghost', 'ドラゴン': 'dragon', 'あく': 'dark',
            'はがね': 'steel', 'フェアリー': 'fairy'
        };
    }

    /**
     * Show a specific screen
     */
    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.add('hidden');
        });
        document.getElementById(screenId).classList.remove('hidden');
    }

    /**
     * Update HP bar
     */
    updateHpBar(side, current, max) {
        const bar = document.getElementById(`${side}-hp-bar`);
        const text = document.getElementById(`${side}-hp-text`);

        const percentage = Math.max(0, Math.floor((current / max) * 100));
        bar.style.width = percentage + '%';

        // Update bar color based on HP percentage
        bar.classList.remove('medium', 'low');
        if (percentage <= 20) {
            bar.classList.add('low');
        } else if (percentage <= 50) {
            bar.classList.add('medium');
        }

        text.textContent = `${current}/${max} (${percentage}%)`;
    }

    /**
     * Render Pokemon types
     */
    renderTypes(types, containerId) {
        const container = document.getElementById(containerId);
        container.innerHTML = '';

        types.forEach(type => {
            const badge = document.createElement('span');
            badge.className = `type-badge type-${this.typeColorMap[type] || type}`;
            badge.textContent = type;
            container.appendChild(badge);
        });
    }

    /**
     * Render status badges
     */
    renderStatusBadges(status, containerId) {
        const container = document.getElementById(containerId);
        container.innerHTML = '';

        if (!status || status === 'none') return;

        const statusMap = {
            'poison': 'どく',
            'bad_poison': '猛毒',
            'burn': 'やけど',
            'paralysis': 'まひ',
            'sleep': 'ねむり',
            'freeze': 'こおり',
            'confusion': '混乱'
        };

        const badge = document.createElement('span');
        badge.className = `status-badge status-${status.replace('_', '-')}`;
        badge.textContent = statusMap[status] || status;
        container.appendChild(badge);
    }

    /**
     * Render stat stages
     */
    renderStatStages(statStages, containerId) {
        const container = document.getElementById(containerId);
        container.innerHTML = '';

        const statNames = {
            'atk': '攻', 'def': '防', 'spa': '特攻', 'spd': '特防', 'spe': '速'
        };

        Object.entries(statStages).forEach(([stat, stage]) => {
            if (stage !== 0 && statNames[stat]) {
                const badge = document.createElement('span');
                badge.className = `stat-stage ${stage > 0 ? 'positive' : 'negative'}`;
                badge.textContent = `${statNames[stat]}${stage > 0 ? '+' : ''}${stage}`;
                container.appendChild(badge);
            }
        });
    }

    /**
     * Update weather indicator
     */
    updateWeatherIndicator(weather) {
        const indicator = document.getElementById('weather-indicator');

        const weatherNames = {
            'sunny': '晴れ ☀️',
            'rain': '雨 🌧️',
            'sandstorm': '砂嵐 🌪️',
            'hail': '霰 ❄️'
        };

        if (weather && weatherNames[weather]) {
            indicator.textContent = weatherNames[weather];
            indicator.style.display = 'block';
        } else {
            indicator.style.display = 'none';
        }
    }

    /**
     * Add battle log entry
     */
    addBattleLog(message) {
        const logContainer = document.getElementById('battle-log');
        const entry = document.createElement('div');
        entry.className = 'log-entry';
        entry.textContent = message;
        logContainer.appendChild(entry);

        // Auto scroll to bottom
        logContainer.scrollTop = logContainer.scrollHeight;
    }

    /**
     * Clear battle log
     */
    clearBattleLog() {
        document.getElementById('battle-log').innerHTML = '';
    }

    /**
     * Set battle log content
     */
    setBattleLog(messages) {
        const logContainer = document.getElementById('battle-log');
        logContainer.innerHTML = '';
        messages.forEach(msg => this.addBattleLog(msg));
    }

    /**
     * Render move buttons
     */
    renderMoveButtons(moves, onMoveClick, disabled = false, validMoves = null) {
        const container = document.getElementById('move-buttons');
        container.innerHTML = '';

        if (disabled) {
            container.innerHTML = '<p style="grid-column: 1/-1; text-align: center;">相手の行動を待っています...</p>';
            return;
        }

        moves.forEach(moveName => {
            const moveData = pokemonMoves.find(m => m.name === moveName);
            if (!moveData) return;

            const button = document.createElement('button');
            button.className = 'move-btn';

            // Check if move is valid
            if (validMoves && !validMoves.includes(moveName)) {
                button.disabled = true;
                button.style.opacity = '0.5';
                button.style.cursor = 'not-allowed';
            } else {
                button.onclick = () => onMoveClick(moveName);
            }

            const nameSpan = document.createElement('div');
            nameSpan.className = 'move-name';
            nameSpan.textContent = moveName;

            const detailsSpan = document.createElement('div');
            detailsSpan.className = 'move-details';
            const categorySymbol = moveData.category === '物理' ? '物' :
                moveData.category === '特殊' ? '特' : '変';
            const powerText = moveData.power ? `威力${moveData.power}` : '—';
            detailsSpan.textContent = `${moveData.type} [${categorySymbol}] ${powerText}`;

            button.appendChild(nameSpan);
            button.appendChild(detailsSpan);
            container.appendChild(button);
        });
    }

    /**
     * Render switch menu
     */
    renderSwitchMenu(team, currentIndex, onSwitchClick, forced = false) {
        const container = document.getElementById('switch-options');
        container.innerHTML = '';

        team.forEach((pokemon, index) => {
            if (index === currentIndex) return; // Can't switch to current Pokemon

            const button = document.createElement('button');
            button.className = 'switch-option';

            const nameSpan = document.createElement('span');
            nameSpan.textContent = pokemon.name;

            const hpSpan = document.createElement('span');
            hpSpan.textContent = `HP: ${pokemon.currentHp}/${pokemon.maxHp}`;

            button.appendChild(nameSpan);
            button.appendChild(hpSpan);

            if (pokemon.currentHp <= 0) {
                button.disabled = true;
                button.style.opacity = '0.3';
            } else {
                button.onclick = () => onSwitchClick(index);
            }

            container.appendChild(button);
        });

        // Hide back button if forced switch
        if (forced) {
            const backButton = document.querySelector('.switch-menu .btn-cancel');
            if (backButton) backButton.style.display = 'none';
        }
    }

    /**
     * Show/hide action panel
     */
    toggleActionPanel(show) {
        const panel = document.getElementById('action-panel');
        if (show) {
            panel.classList.remove('hidden');
        } else {
            panel.classList.add('hidden');
        }
    }

    /**
     * Show/hide switch menu
     */
    toggleSwitchMenu(show) {
        const menu = document.getElementById('switch-menu');
        if (show) {
            menu.classList.remove('hidden');
            this.toggleActionPanel(false);
        } else {
            menu.classList.add('hidden');
            this.toggleActionPanel(true);
        }
    }

    /**
     * Show battle result screen
     */
    showBattleResult(isWinner, onReturnClick) {
        const actionPanel = document.getElementById('action-panel');
        actionPanel.innerHTML = `
            <div style="text-align: center; padding: 30px;">
                <h2 style="font-size: 3rem; color: ${isWinner ? '#4ade80' : '#f87171'}; 
                           text-shadow: 0 0 20px ${isWinner ? '#4ade80' : '#f87171'}; 
                           margin-bottom: 20px; animation: pulse 1.5s ease-in-out infinite;">
                    ${isWinner ? '🎉 勝利! 🎉' : '😢 敗北... 😢'}
                </h2>
                <p style="font-size: 1.3rem; margin-bottom: 30px;">
                    対戦ありがとうございました!
                </p>
                <button class="btn-primary" onclick="${onReturnClick}" style="max-width: 400px; margin: 0 auto;">
                    チーム編成に戻る
                    <span class="btn-arrow">→</span>
                </button>
            </div>
        `;
    }

    /**
     * Show waiting message in action panel
     */
    showWaitingMessage(message) {
        const container = document.getElementById('move-buttons');
        container.innerHTML = `<p style="grid-column: 1/-1; text-align: center;">${message}</p>`;
    }

    /**
     * Enable/disable switch button
     */
    setSwitchButtonEnabled(enabled) {
        const button = document.getElementById('switch-btn');
        if (button) {
            button.disabled = !enabled;
        }
    }

    /**
     * Create Pokemon selection card for team builder
     */
    createPokemonCard(pokemon, isSelected, onCheckChange, compatibleMoves) {
        const card = document.createElement('div');
        card.className = `pokemon-card ${isSelected ? 'selected' : ''}`;
        card.dataset.pokemonId = pokemon.id;

        const header = document.createElement('div');
        header.className = 'pokemon-card-header';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'pokemon-checkbox';
        checkbox.checked = isSelected;
        checkbox.value = pokemon.id;
        checkbox.onchange = onCheckChange;

        const nameSpan = document.createElement('span');
        nameSpan.className = 'pokemon-name-header';
        nameSpan.textContent = pokemon.name;

        header.appendChild(checkbox);
        header.appendChild(nameSpan);

        // Types
        const typesDiv = document.createElement('div');
        typesDiv.className = 'pokemon-types-inline';
        pokemon.types.forEach(type => {
            const typeBadge = document.createElement('span');
            typeBadge.className = `type-badge type-${this.typeColorMap[type] || type}`;
            typeBadge.textContent = type;
            typesDiv.appendChild(typeBadge);
        });

        // Ability
        const abilityDiv = document.createElement('div');
        abilityDiv.className = 'ability-display';
        abilityDiv.innerHTML = `<strong>特性:</strong> ${pokemon.ability.name}<br><small>${pokemon.ability.description}</small>`;

        // Move selects
        const moveSelectsDiv = document.createElement('div');
        moveSelectsDiv.className = 'move-selects';

        for (let i = 0; i < 4; i++) {
            const select = document.createElement('select');
            select.className = 'move-select';
            select.dataset.pokemonId = pokemon.id;
            select.dataset.moveIndex = i;

            const defaultOption = document.createElement('option');
            defaultOption.value = '';
            defaultOption.textContent = `技 ${i + 1} を選択`;
            select.appendChild(defaultOption);

            compatibleMoves.forEach(moveName => {
                const moveData = pokemonMoves.find(m => m.name === moveName);
                if (moveData) {
                    const option = document.createElement('option');
                    option.value = moveName;
                    option.textContent = `${moveName} (${moveData.type})`;
                    select.appendChild(option);
                }
            });

            moveSelectsDiv.appendChild(select);
        }

        // Item select
        const itemSelectDiv = document.createElement('div');
        itemSelectDiv.className = 'item-select-container';

        const itemLabel = document.createElement('label');
        itemLabel.textContent = '持ち物:';
        itemLabel.style.display = 'block';
        itemLabel.style.marginBottom = '4px';
        itemLabel.style.fontSize = '0.85rem';

        const itemSelect = document.createElement('select');
        itemSelect.className = 'item-select';
        itemSelect.dataset.pokemonId = pokemon.id;

        heldItems.forEach(item => {
            const option = document.createElement('option');
            option.value = item.id;
            option.textContent = `${item.name}${item.id !== 'none' ? ' - ' + item.description : ''}`;
            itemSelect.appendChild(option);
        });

        itemSelectDiv.appendChild(itemLabel);
        itemSelectDiv.appendChild(itemSelect);

        card.appendChild(header);
        card.appendChild(typesDiv);
        card.appendChild(abilityDiv);
        card.appendChild(moveSelectsDiv);
        card.appendChild(itemSelectDiv);

        return card;
    }

    /**
     * Update selected Pokemon count
     */
    updateSelectedCount(count) {
        const countSpan = document.getElementById('selected-count');
        if (countSpan) {
            countSpan.textContent = count;
        }
    }
}
