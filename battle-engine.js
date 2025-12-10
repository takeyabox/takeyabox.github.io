/**
 * Battle Engine
 * Core battle mechanics including damage calculation, status effects, weather, abilities
 */

class BattleEngine {
    constructor() {
        this.weather = null;
        this.weatherTurns = 0;
    }

    /**
     * Calculate damage using Pokemon damage formula
     */
    calculateDamage(attacker, defender, move, battleState) {
        if (!move.power || move.category === "変化") {
            return 0;
        }

        const level = 50;
        const attackStat = move.category === "物理" ?
            this.getEffectiveStat(attacker, 'atk', attacker.statStages.atk) :
            this.getEffectiveStat(attacker, 'spa', attacker.statStages.spa);

        const defenseStat = move.category === "物理" ?
            this.getEffectiveStat(defender, 'def', defender.statStages.def, attacker.ability) :
            this.getEffectiveStat(defender, 'spd', defender.statStages.spd, attacker.ability);

        // Base damage calculation
        let damage = Math.floor(((2 * level / 5 + 2) * move.power * attackStat / defenseStat) / 50) + 2;

        // Apply modifiers
        const modifiers = this.calculateModifiers(attacker, defender, move, battleState);
        damage = Math.floor(damage * modifiers.total);

        // Random factor (85% - 100%)
        damage = Math.floor(damage * (0.85 + Math.random() * 0.15));

        return Math.max(1, damage);
    }

    /**
     * Calculate all damage modifiers
     */
    calculateModifiers(attacker, defender, move, battleState) {
        let total = 1.0;
        const details = {};

        // STAB (Same Type Attack Bonus)
        if (attacker.types.includes(move.type)) {
            total *= 1.5;
            details.stab = 1.5;
        }

        // Type Effectiveness
        const typeEffect = this.getTypeEffectiveness(move.type, defender.types);
        total *= typeEffect;
        details.typeEffectiveness = typeEffect;

        // Critical Hit
        const critRate = this.getCriticalHitRate(attacker, defender, move);
        const isCrit = Math.random() < critRate;
        if (isCrit) {
            total *= 1.5;
            details.critical = true;
        }

        // Burn halves physical attack
        if (attacker.status === 'burn' && move.category === "物理") {
            total *= 0.5;
            details.burn = true;
        }

        // Weather effects
        if (this.weather === 'sunny') {
            if (move.type === 'ほのお') total *= 1.5;
            if (move.type === 'みず') total *= 0.5;
        } else if (this.weather === 'rain') {
            if (move.type === 'みず') total *= 1.5;
            if (move.type === 'ほのお') total *= 0.5;
        }

        // Ability effects
        total *= this.getAbilityDamageModifier(attacker, defender, move);

        // Held item effects
        total *= this.getItemDamageModifier(attacker, defender, move, details);

        return { total, details };
    }

    /**
     * Get type effectiveness multiplier
     */
    getTypeEffectiveness(attackType, defenderTypes) {
        let effectiveness = 1.0;

        defenderTypes.forEach(defType => {
            if (typeChart[attackType] && typeChart[attackType][defType] !== undefined) {
                effectiveness *= typeChart[attackType][defType];
            }
        });

        return effectiveness;
    }

    /**
     * Get critical hit rate
     */
    getCriticalHitRate(attacker, defender, move) {
        // Shell Armor blocks crits
        if (defender.ability && defender.ability.name === "カブトアーマー") {
            return 0;
        }

        let critRate = 1 / 24; // Base rate

        // Super Luck ability
        if (attacker.ability && attacker.ability.name === "きょううん") {
            critRate = 1 / 8;
        }

        // Guaranteed crit for poisoned opponents (ひとでなし ability)
        if (attacker.ability && attacker.ability.name === "ひとでなし" &&
            (defender.status === 'poison' || defender.status === 'bad_poison')) {
            critRate = 1.0;
        }

        // High crit rate moves
        if (move.effect && move.effect.crit_rate) {
            critRate = move.effect.crit_rate === 1 ? 1 / 8 : 1 / 24;
        }

        return critRate;
    }

    /**
     * Get effective stat value with stage modifications
     */
    getEffectiveStat(pokemon, stat, stage, opponentAbility) {
        let baseStat = pokemon.stats[stat];

        // てんねん (Unaware) ignores opponent's stat changes
        if (opponentAbility && opponentAbility.name === "てんねん") {
            stage = 0;
        }

        // たんじゅん (Simple) doubles stat changes
        if (pokemon.ability && pokemon.ability.name === "たんじゅん") {
            stage = Math.max(-6, Math.min(6, stage * 2));
        }

        // Apply stat stage multiplier
        const multiplier = stage >= 0 ?
            (2 + stage) / 2 :
            2 / (2 - stage);

        baseStat = Math.floor(baseStat * multiplier);

        // Status effects on stats
        if (stat === 'spe' && pokemon.status === 'paralysis') {
            baseStat = Math.floor(baseStat * 0.5);
        }

        // Sandstorm boosts Rock-type Sp.Def
        if (this.weather === 'sandstorm' && stat === 'spd' && pokemon.types.includes('いわ')) {
            baseStat = Math.floor(baseStat * 1.5);
        }

        // Choice Scarf
        if (stat === 'spe' && pokemon.item === 'choice-scarf') {
            baseStat = Math.floor(baseStat * 1.5);
        }

        return baseStat;
    }

    /**
     * Get ability-based damage modifier
     */
    getAbilityDamageModifier(attacker, defender, move) {
        let modifier = 1.0;

        // あついしぼう (Thick Fat) - halves Fire/Ice damage
        if (defender.ability && defender.ability.name === "あついしぼう") {
            if (move.type === 'ほのお' || move.type === 'こおり') {
                modifier *= 0.5;
            }
        }

        // すいほう (Water Bubble)
        if (attacker.ability && attacker.ability.name === "すいほう" && move.type === 'みず') {
            modifier *= 2.0;
        }
        if (defender.ability && defender.ability.name === "すいほう" && move.type === 'ほのお') {
            modifier *= 0.5;
        }

        return modifier;
    }

    /**
     * Get held item damage modifier
     */
    getItemDamageModifier(attacker, defender, move, details) {
        let modifier = 1.0;

        if (!attacker.item) return modifier;

        // Life Orb
        if (attacker.item === 'life-orb') {
            modifier *= 1.3;
        }

        // Choice Band/Specs
        if (move.category === "物理" && attacker.item === 'choice-band') {
            modifier *= 1.5;
        }
        if (move.category === "特殊" && attacker.item === 'choice-specs') {
            modifier *= 1.5;
        }

        // Expert Belt (super effective moves)
        if (attacker.item === 'expert-belt' && details.typeEffectiveness > 1) {
            modifier *= 1.2;
        }

        return modifier;
    }

    /**
     * Apply status condition
     */
    applyStatus(pokemon, status, source) {
        // ぜったいねむり pokemon can't get other statuses
        if (pokemon.ability && pokemon.ability.name === "ぜったいねむり") {
            return { success: false, message: "しかし効果がなかった!" };
        }

        // Already has status
        if (pokemon.status && pokemon.status !== 'confusion') {
            return { success: false, message: `${pokemon.name}はすでに状態異常だ!` };
        }

        // Type immunities
        if (status === 'poison' || status === 'bad_poison') {
            if (pokemon.types.includes('どく') || pokemon.types.includes('はがね')) {
                // ふしょく ability bypasses immunity (not implemented yet)
                return { success: false, message: `${pokemon.name}には効果がない!` };
            }
        }
        if (status === 'burn' && pokemon.types.includes('ほのお')) {
            return { success: false, message: `${pokemon.name}には効果がない!` };
        }
        if (status === 'burn' && pokemon.ability && pokemon.ability.name === "すいほう") {
            return { success: false, message: `${pokemon.name}には効果がない!` };
        }
        if (status === 'paralysis' && pokemon.types.includes('でんき')) {
            return { success: false, message: `${pokemon.name}には効果がない!` };
        }
        if (status === 'freeze' && (pokemon.types.includes('こおり') || this.weather === 'sunny')) {
            return { success: false, message: `${pokemon.name}には効果がない!` };
        }

        // Apply status
        pokemon.status = status;

        if (status === 'sleep') {
            pokemon.sleepTurns = 2 + Math.floor(Math.random() * 3); // 2-4 turns
        }
        if (status === 'confusion') {
            pokemon.confusionTurns = 1 + Math.floor(Math.random() * 4); // 1-4 turns
        }

        const statusMessages = {
            'poison': `${pokemon.name}は毒状態になった!`,
            'bad_poison': `${pokemon.name}は猛毒状態になった!`,
            'burn': `${pokemon.name}はやけど状態になった!`,
            'paralysis': `${pokemon.name}はまひ状態になった!`,
            'sleep': `${pokemon.name}は眠ってしまった!`,
            'freeze': `${pokemon.name}は凍ってしまった!`,
            'confusion': `${pokemon.name}は混乱した!`
        };

        return { success: true, message: statusMessages[status] || "" };
    }

    /**
     * Check if Pokemon can act this turn (status check)
     */
    canAct(pokemon) {
        // ぜったいねむり can act while asleep
        if (pokemon.ability && pokemon.ability.name === "ぜったいねむり") {
            return { canAct: true };
        }

        // Sleep
        if (pokemon.status === 'sleep') {
            if (pokemon.sleepTurns > 0) {
                pokemon.sleepTurns--;
                if (pokemon.sleepTurns === 0) {
                    pokemon.status = null;
                    return { canAct: true, message: `${pokemon.name}は目を覚ました!` };
                }
                return { canAct: false, message: `${pokemon.name}はぐうぐう眠っている...` };
            }
        }

        // Freeze
        if (pokemon.status === 'freeze') {
            if (Math.random() < 0.25) {
                pokemon.status = null;
                return { canAct: true, message: `${pokemon.name}の氷が溶けた!` };
            }
            return { canAct: false, message: `${pokemon.name}は凍っている!` };
        }

        // Paralysis
        if (pokemon.status === 'paralysis') {
            if (Math.random() < 0.25) {
                return { canAct: false, message: `${pokemon.name}は体がしびれて動けない!` };
            }
        }

        // Confusion
        if (pokemon.status === 'confusion') {
            if (pokemon.confusionTurns > 0) {
                pokemon.confusionTurns--;
                if (pokemon.confusionTurns === 0) {
                    pokemon.status = null;
                    return { canAct: true, message: `${pokemon.name}の混乱が解けた!` };
                }

                if (Math.random() < 1 / 3) {
                    // Self-hit with 40 power
                    const damage = Math.floor(((2 * 50 / 5 + 2) * 40 * pokemon.stats.atk / pokemon.stats.def) / 50) + 2;
                    const finalDamage = Math.floor(damage * (0.85 + Math.random() * 0.15));
                    pokemon.currentHp = Math.max(0, pokemon.currentHp - finalDamage);
                    return { canAct: false, message: `${pokemon.name}は混乱している!\n${pokemon.name}は自分を攻撃した! ${finalDamage}ダメージ!` };
                }
            }
        }

        return { canAct: true };
    }

    /**
     * Apply end-of-turn effects (poison damage, weather damage, item effects, etc.)
     */
    applyEndOfTurnEffects(pokemon, logs) {
        // Poison damage
        if (pokemon.status === 'poison') {
            const damage = Math.floor(pokemon.maxHp / 8);
            pokemon.currentHp = Math.max(0, pokemon.currentHp - damage);
            logs.push(`${pokemon.name}は毒のダメージを受けた! (${damage}ダメージ)`);
        }

        // Bad poison damage (increases each turn)
        if (pokemon.status === 'bad_poison') {
            pokemon.badPoisonCounter = (pokemon.badPoisonCounter || 0) + 1;
            const damage = Math.floor(pokemon.maxHp / 16 * pokemon.badPoisonCounter);
            pokemon.currentHp = Math.max(0, pokemon.currentHp - damage);
            logs.push(`${pokemon.name}は猛毒のダメージを受けた! (${damage}ダメージ)`);
        }

        // Burn damage
        if (pokemon.status === 'burn') {
            const damage = Math.floor(pokemon.maxHp / 16);
            pokemon.currentHp = Math.max(0, pokemon.currentHp - damage);
            logs.push(`${pokemon.name}はやけどのダメージを受けた! (${damage}ダメージ)`);
        }

        // Weather damage
        if (this.weather === 'sandstorm') {
            if (!pokemon.types.includes('いわ') && !pokemon.types.includes('じめん') && !pokemon.types.includes('はがね')) {
                const damage = Math.floor(pokemon.maxHp / 16);
                pokemon.currentHp = Math.max(0, pokemon.currentHp - damage);
                logs.push(`${pokemon.name}は砂嵐のダメージを受けた! (${damage}ダメージ)`);
            }
        } else if (this.weather === 'hail') {
            if (!pokemon.types.includes('こおり')) {
                const damage = Math.floor(pokemon.maxHp / 16);
                pokemon.currentHp = Math.max(0, pokemon.currentHp - damage);
                logs.push(`${pokemon.name}は霰のダメージを受けた! (${damage}ダメージ)`);
            }
        }

        // Leftovers recovery
        if (pokemon.item === 'leftovers' && pokemon.currentHp > 0 && pokemon.currentHp < pokemon.maxHp) {
            const heal = Math.floor(pokemon.maxHp / 16);
            pokemon.currentHp = Math.min(pokemon.maxHp, pokemon.currentHp + heal);
            logs.push(`${pokemon.name}はたべのこしでHPを回復した! (${heal}回復)`);
        }

        // Black Sludge
        if (pokemon.item === 'black-sludge' && pokemon.currentHp > 0) {
            if (pokemon.types.includes('どく')) {
                const heal = Math.floor(pokemon.maxHp / 16);
                pokemon.currentHp = Math.min(pokemon.maxHp, pokemon.currentHp + heal);
                logs.push(`${pokemon.name}はくろいヘドロでHPを回復した! (${heal}回復)`);
            } else {
                const damage = Math.floor(pokemon.maxHp / 8);
                pokemon.currentHp = Math.max(0, pokemon.currentHp - damage);
                logs.push(`${pokemon.name}はくろいヘドロでダメージを受けた! (${damage}ダメージ)`);
            }
        }

        // Life Orb recoil is handled in move execution
    }

    /**
     * Apply move effects (stat changes, status, recoil, etc.)
     */
    applyMoveEffects(attacker, defender, move, damage, logs) {
        const effects = [];

        // Recoil damage
        if (move.effect && move.effect.recoil) {
            const recoilPercent = parseInt(move.effect.recoil);
            const recoilDamage = Math.floor(damage * recoilPercent / 100);
            attacker.currentHp = Math.max(0, attacker.currentHp - recoilDamage);
            logs.push(`${attacker.name}は反動ダメージを受けた! (${recoilDamage}ダメージ)`);
        }

        // Life Orb recoil
        if (attacker.item === 'life-orb' && damage > 0) {
            const recoilDamage = Math.floor(attacker.maxHp / 10);
            attacker.currentHp = Math.max(0, attacker.currentHp - recoilDamage);
            logs.push(`${attacker.name}はいのちのたまのダメージを受けた!`);
        }

        // Rocky Helmet counter
        if (defender.item === 'rocky-helmet' && move.flags && move.flags.is_contact && damage > 0) {
            const counterDamage = Math.floor(attacker.maxHp / 6);
            attacker.currentHp = Math.max(0, attacker.currentHp - counterDamage);
            logs.push(`${attacker.name}はゴツゴツメットのダメージを受けた!`);
        }

        // Status ailment effects
        if (move.effect && move.effect.status_ailment && defender.currentHp > 0) {
            const statusEffect = move.effect.status_ailment;
            if (Math.random() * 100 < statusEffect.chance) {
                const result = this.applyStatus(defender, statusEffect.name, attacker);
                if (result.message) logs.push(result.message);
            }
        }

        // Stat changes
        if (move.effect && move.effect.stat_change) {
            move.effect.stat_change.forEach(change => {
                if (Math.random() * 100 < change.chance) {
                    const target = change.target === 'self' ? attacker : defender;
                    const currentStage = target.statStages[change.stat];
                    let stageChange = change.stage;

                    // たんじゅん doubles stat changes
                    if (target.ability && target.ability.name === "たんじゅん") {
                        stageChange *= 2;
                    }

                    // まけんき triggers on stat drop
                    if (change.stage < 0 && target === defender &&
                        target.ability && target.ability.name === "まけんき") {
                        target.statStages.atk = Math.min(6, target.statStages.atk + 2);
                        logs.push(`${target.name}のまけんきが発動! 攻撃が2段階上がった!`);
                    }

                    target.statStages[change.stat] = Math.max(-6, Math.min(6, currentStage + stageChange));

                    const statNames = {
                        'atk': '攻撃', 'def': '防御', 'spa': '特攻',
                        'spd': '特防', 'spe': '素早さ'
                    };
                    const changeText = stageChange > 0 ? '上がった' : '下がった';
                    const levelText = Math.abs(stageChange) === 1 ? '' :
                        Math.abs(stageChange) === 2 ? 'ぐーんと' : 'ぐぐーんと';
                    logs.push(`${target.name}の${statNames[change.stat]}が${levelText}${changeText}!`);
                }
            });
        }

        // Flinch
        if (move.effect && move.effect.flinch) {
            // Flinch is handled in turn order (faster Pokemon can't flinch)
            effects.push('flinch');
        }

        // Weakness Policy activation
        if (defender.item === 'weakness-policy' && !defender.weaknessPolicyUsed) {
            const typeEffect = this.getTypeEffectiveness(move.type, defender.types);
            if (typeEffect > 1) {
                defender.statStages.atk = Math.min(6, defender.statStages.atk + 2);
                defender.statStages.spa = Math.min(6, defender.statStages.spa + 2);
                defender.weaknessPolicyUsed = true;
                logs.push(`${defender.name}のじゃくてんほけんが発動! 攻撃と特攻が上がった!`);
            }
        }

        return effects;
    }

    /**
     * Determine turn order
     */
    determineTurnOrder(p1Action, p2Action, p1Pokemon, p2Pokemon) {
        // Get priority
        const p1Priority = this.getMovePriority(p1Action);
        const p2Priority = this.getMovePriority(p2Action);

        // Higher priority goes first
        if (p1Priority !== p2Priority) {
            return p1Priority > p2Priority ? ['p1', 'p2'] : ['p2', 'p1'];
        }

        // Same priority - check speed
        const p1Speed = this.getEffectiveStat(p1Pokemon, 'spe', p1Pokemon.statStages.spe);
        const p2Speed = this.getEffectiveStat(p2Pokemon, 'spe', p2Pokemon.statStages.spe);

        if (p1Speed !== p2Speed) {
            return p1Speed > p2Speed ? ['p1', 'p2'] : ['p2', 'p1'];
        }

        // Speed tie - random
        return Math.random() < 0.5 ? ['p1', 'p2'] : ['p2', 'p1'];
    }

    /**
     * Get move priority
     */
    getMovePriority(action) {
        if (action.type === 'switch') return 6; // Switches go first
        if (action.type === 'move') {
            const move = pokemonMoves.find(m => m.name === action.move);
            return move ? (move.priority || 0) : 0;
        }
        return 0;
    }

    /**
     * Set weather
     */
    setWeather(weather, duration) {
        this.weather = weather;
        this.weatherTurns = duration || 5;
    }

    /**
     * Update weather turn counter
     */
    updateWeather() {
        if (this.weather && this.weatherTurns > 0) {
            this.weatherTurns--;
            if (this.weatherTurns === 0) {
                this.weather = null;
                return `天気が元に戻った!`;
            }
        }
        return null;
    }
}
