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
     * Check if attack hits (handling invulnerability and accuracy)
     */
    checkHit(attacker, defender, move) {
        // Invulnerability Check (Dig/Fly)
        if (defender.invulnerableState) {
            // Specific counters can skip this (e.g. Earthquake hits Dig), but for now simple block
            // Allow self-targeting moves
            if (attacker === defender) return true;
            return false;
        }

        // Accuracy check
        if (!move.accuracy || move.accuracy === Infinity) return true;

        let modifiedAccuracy = move.accuracy;
        // Wide Lens
        if (attacker.item === 'wide-lens') {
            modifiedAccuracy *= 1.1;
        }

        return Math.random() * 100 <= modifiedAccuracy;
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
    /**
     * Get effective stat value with stage modifications
     */
    getEffectiveStat(pokemon, stat, stage, opponentAbility, isTailwind = false) {
        let baseStat = pokemon.stats[stat];

        // てんねん (Unaware) ignores opponent's stat changes
        // Ability Shield protects against this
        if (opponentAbility && opponentAbility.name === "てんねん" && pokemon.item !== 'ability-shield') {
            stage = 0;
        }


        // たんじゅん (Simple) doubles stat changes
        if (pokemon.ability && pokemon.ability.name === "たんじゅん") {
            stage = Math.max(-6, Math.min(6, stage * 2));
        }

        // Apply stat stage multiplier
        const multiplier = stage >= 0 ?
            (2 + stage) / 2 :
            2 / (2 + Math.abs(stage));

        baseStat = Math.floor(baseStat * multiplier);

        // Status effects on stats
        if (stat === 'spe' && pokemon.status === 'paralysis') {
            baseStat = Math.floor(baseStat * 0.5);
        }

        // Tailwind
        if (stat === 'spe' && isTailwind) {
            baseStat = Math.floor(baseStat * 2);
        }

        // Sandstorm boosts Rock-type Sp.Def
        if (this.weather === 'sandstorm' && stat === 'spd' && pokemon.types.includes('いわ')) {
            baseStat = Math.floor(baseStat * 1.5);
        }

        // Choice Scarf
        if (stat === 'spe' && pokemon.item === 'choice-scarf') {
            baseStat = Math.floor(baseStat * 1.5);
        }

        // Assault Vest
        if (stat === 'spd' && pokemon.item === 'assault-vest') {
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

        // Cannot status a Substitute
        if (pokemon.substituteHp > 0) {
            return { success: false, message: "みがわりが防いだ!" };
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

        // Consume Berries
        this.checkBerryConsumption(pokemon, logs);
    }

    /**
     * Check and consume berries
     */
    checkBerryConsumption(pokemon, logs) {
        if (!pokemon.item) return;

        // Sitrus Berry
        if (pokemon.item === 'sitrus-berry') {
            if (pokemon.currentHp <= pokemon.maxHp / 2) {
                const heal = Math.floor(pokemon.maxHp / 4);
                pokemon.currentHp = Math.min(pokemon.maxHp, pokemon.currentHp + heal);
                pokemon.item = null;
                logs.push(`${pokemon.name}は オボンのみで 体力を 回復した！`);
            }
        }
    }

    /**
     * Apply Entry Hazards (Stealth Rock, Spikes, Toxic Spikes, Sticky Web)
     */
    applyEntryHazards(pokemon, sideState, logs) {
        if (!sideState || !sideState.hazards) return;
        const hazards = sideState.hazards;

        // Flying / Levitate (for Spikes/Toxic Spikes/Web) check
        const isAirborne = pokemon.types.includes('ひこう') || (pokemon.ability && pokemon.ability.name === 'ふゆう') || pokemon.item === 'air-balloon';
        const isHeavyDutyBoots = pokemon.item === 'heavy-duty-boots'; // Atsuzoko Boots (if implemented)

        if (isHeavyDutyBoots) return; // Boots ignore all hazards

        // Stealth Rock
        if (hazards.stealthRock) {
            let damageFactor = 1 / 8;
            // Type effectiveness calculation for Rock
            const effectiveness = this.getTypeEffectiveness('いわ', pokemon.types);
            damageFactor *= effectiveness;

            const damage = Math.floor(pokemon.maxHp * damageFactor);
            if (damage > 0) {
                pokemon.currentHp = Math.max(0, pokemon.currentHp - damage);
                logs.push(`${pokemon.name}に とがった岩が 食い込んだ！`);
                this.checkBerryConsumption(pokemon, logs); // Check berries (e.g. Sitrus)
            }
        }

        // Spikes (Ground based)
        if (hazards.spikes > 0 && !isAirborne) {
            const damageFactors = [0, 1 / 8, 1 / 6, 1 / 4];
            const layers = Math.min(3, hazards.spikes);
            const damage = Math.floor(pokemon.maxHp * damageFactors[layers]);
            if (damage > 0) {
                pokemon.currentHp = Math.max(0, pokemon.currentHp - damage);
                logs.push(`${pokemon.name}は まきびしの ダメージを 受けた！`);
                this.checkBerryConsumption(pokemon, logs);
            }
        }

        // Toxic Spikes (Ground based)
        if (hazards.toxicSpikes > 0 && !isAirborne) {
            // Poison types remove Toxic Spikes upon entry (if grounded)
            if (pokemon.types.includes('どく')) {
                hazards.toxicSpikes = 0;
                logs.push(`${pokemon.name}は 毒びしを 回収した！`);
            } else if (!pokemon.types.includes('はがね') && pokemon.status === null) {
                // Steel types are immune to poisoning (except Salazzle which we don't have logic for yet)
                const layers = Math.min(2, hazards.toxicSpikes);
                if (layers === 1) {
                    this.applyStatus(pokemon, 'poison', null);
                    if (pokemon.status === 'poison') logs.push(`${pokemon.name}は 毒びしを 踏んで 毒になった！`);
                } else {
                    this.applyStatus(pokemon, 'bad_poison', null);
                    if (pokemon.status === 'bad_poison') logs.push(`${pokemon.name}は 毒びしを 踏んで 猛毒になった！`);
                }
            }
        }

        // Sticky Web (Ground based)
        if (hazards.stickyWeb && !isAirborne) {
            pokemon.statStages.spe = Math.max(-6, pokemon.statStages.spe - 1);
            logs.push(`${pokemon.name}は ねばねばネットに 引っかかった！`);
        }
    }



    /**
     * Apply move effects (stat changes, status, recoil, etc.)
     */
    /**
     * Apply move effects (stat changes, status, recoil, etc.)
     */
    applyMoveEffects(attacker, defender, move, damage, logs, attackerSideState = null, defenderSideState = null) {

        const effects = [];


        // Recoil damage
        if (move.effect && move.effect.recoil) {
            const recoilPercent = parseInt(move.effect.recoil);
            const recoilDamage = Math.floor(damage * recoilPercent / 100);
            attacker.currentHp = Math.max(0, attacker.currentHp - recoilDamage);
            logs.push(`${attacker.name}は反動ダメージを受けた! (${recoilDamage}ダメージ)`);
            this.checkBerryConsumption(attacker, logs);
        }

        // Life Orb recoil
        if (attacker.item === 'life-orb' && damage > 0) {
            const recoilDamage = Math.floor(attacker.maxHp / 10);
            attacker.currentHp = Math.max(0, attacker.currentHp - recoilDamage);
            logs.push(`${attacker.name}はいのちのたまのダメージを受けた!`);
            this.checkBerryConsumption(attacker, logs);
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

                    // Mirror Herb
                    if (stageChange > 0) {
                        const opponent = target === attacker ? defender : attacker;
                        if (opponent.item === 'mirror-herb') {
                            opponent.statStages[change.stat] = Math.min(6, opponent.statStages[change.stat] + stageChange);
                            opponent.item = null; // Consume
                            logs.push(`${opponent.name}は ものまねハーブで ${statNames[change.stat]}も 上がった！`);
                        }
                    }
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

        // Shield (Protect)
        if (move.effect && move.effect.shield) {
            let successChance = 100;
            // Decay: 100 -> 50 -> 25 -> 12.5
            for (let i = 0; i < attacker.protectSuccessCount; i++) {
                successChance /= 2; // Or use 3 for X/3 decay
            }

            if (Math.random() * 100 < successChance) {
                attacker.isProtected = true;
                attacker.protectSuccessCount++;
                logs.push(`${attacker.name}は 守りの 体勢に 入った！`);
            } else {
                logs.push(`しかし うまく 決まらなかった！`);
                // Failed, but does counter reset? Usually yes if it fails.
                // But typically counter resets ONLY if a different move is selected.
                // However, failure often doesn't reset if you keep spamming it (it keeps getting harder or stays low).
                // Actually, if you fail, the streak is broken? No, spamming checks counter.
                // Let's keep counter incrementing or stay high? 
                // Standard: Consecutive execution (including failure) increases the counter.
                // But for simplicity, let's just increment count on attempt?
                // Actually, let's stick to simple: Success increments count. Failure?
                // If I fail, next turn chance is 100? No, if I used it last turn.
            }
        } else {
            // Not a protect move -> Reset counter
            attacker.protectSuccessCount = 0;
        }

        // Recharge Moves (Hyper Beam / Giga Impact)
        // Check by name for now as we don't have 'recharge' effect in DB yet unless I add it
        if (move.name === "ギガインパクト" || move.name === "はかいこうせん" || (move.effect && move.effect.recharge)) {
            attacker.mustRecharge = true;
        }


        // Field Effects (Hazards etc)
        if (move.effect && move.effect.field_effect) {
            const effectName = move.effect.field_effect;
            if (defenderSideState && defenderSideState.hazards) {
                if (effectName === "相手の場に岩の罠を設置") {
                    if (defenderSideState.hazards.stealthRock) {
                        logs.push(`しかし うまく 決まらなかった！`);
                    } else {
                        defenderSideState.hazards.stealthRock = true;
                        logs.push(`相手の場に とがった岩が 漂い始めた！`);
                    }
                } else if (effectName === "相手の場に毒の罠を設置") { // Toxic Spikes
                    if (defenderSideState.hazards.toxicSpikes >= 2) {
                        logs.push(`しかし うまく 決まらなかった！`);
                    } else {
                        defenderSideState.hazards.toxicSpikes++;
                        logs.push(`相手の足元に 毒びしが 散らばった！`);
                    }
                } else if (effectName === "相手の場にダメージ罠を設置") { // Spikes
                    if (defenderSideState.hazards.spikes >= 3) {
                        logs.push(`しかし うまく 決まらなかった！`);
                    } else {
                        defenderSideState.hazards.spikes++;
                        logs.push(`相手の足元に まきびしが 散らばった！`);
                    }
                } else if (effectName === "交代先の素早さを下げる罠") { // Sticky Web
                    if (defenderSideState.hazards.stickyWeb) {
                        logs.push(`しかし うまく 決まらなかった！`);
                    } else {
                        defenderSideState.hazards.stickyWeb = true;
                        logs.push(`相手の足元に 粘着質のネットが 広がった！`);
                    }
                }
            }

            // Remover (Defog / Rapid Spin / Tidy Up)
            if (effectName === "設置技を除去") {
                // Rapid Spin clears OWN side hazards
                if (attackerSideState && attackerSideState.hazards) {
                    attackerSideState.hazards.stealthRock = false;
                    attackerSideState.hazards.spikes = 0;
                    attackerSideState.hazards.toxicSpikes = 0;
                    attackerSideState.hazards.stickyWeb = false;
                    logs.push(`${attacker.name}は 足元の 罠を 消し去った！`);
                }
            }
        }


        // Recovery

        if (move.effect && move.effect.recovery) {
            let healAmount = 0;
            if (move.effect.recovery === "50") {
                healAmount = Math.floor(attacker.maxHp / 2);
            } else if (move.effect.recovery === "100") {
                healAmount = attacker.maxHp;
            } else if (move.effect.recovery === "variable") {
                // Synthesis / Moonlight
                if (this.weather === 'sunny') healAmount = Math.floor(attacker.maxHp * 2 / 3);
                else if (this.weather === 'rain' || this.weather === 'sandstorm' || this.weather === 'hail') healAmount = Math.floor(attacker.maxHp / 4);
                else healAmount = Math.floor(attacker.maxHp / 2);
            }

            attacker.currentHp = Math.min(attacker.maxHp, attacker.currentHp + healAmount);
            logs.push(`${attacker.name}の 体力が 回復した！`);

            // Rest specific
            if (move.name === "ねむる") {
                attacker.status = "sleep";
                attacker.sleepTurns = 2;
                logs.push(`${attacker.name}は 眠って 元気に なった！`);
            }
        }

        // Substitute
        if (move.name === "みがわり") {
            const cost = Math.floor(attacker.maxHp / 4);
            if (attacker.currentHp > cost) {
                attacker.currentHp -= cost;
                attacker.substituteHp = cost;
                logs.push(`${attacker.name}は 自分の 体力を 削って 分身を 作った！`);
                this.checkBerryConsumption(attacker, logs);
            } else {
                logs.push(`しかし うまく 決まらなかった！`);
            }
        }

        // Belly Drum (Hara Daiko)
        if (move.name === "はらだいこ") {
            const cost = Math.floor(attacker.maxHp / 2);
            if (attacker.currentHp > cost) {
                attacker.currentHp -= cost;
                attacker.statStages.atk = 6;
                logs.push(`${attacker.name}は 体力を 削って パワー全開！`);
                this.checkBerryConsumption(attacker, logs);
            } else {
                logs.push(`しかし うまく 決まらなかった！`);
            }
        }

        // Weather Setting
        if (move.effect && move.effect.weather) {
            this.setWeather(move.effect.weather, 5);
            const wNames = { 'sunny': '日差しが 強くなった', 'rain': '雨が 降り始めた', 'sandstorm': '砂嵐が 吹き始めた', 'hail': '雪が 降り始めた' };
            logs.push(wNames[move.effect.weather] + '！');
        }


        // Tailwind
        if (move.name === "おいかぜ") {
            if (attackerSideState) {
                attackerSideState.tailwindTurns = 4;
                logs.push(`${attacker.name}の 後ろに 追い風が 吹いた！`);
            }
        }

        return effects;
    }



    /**
     * Determine turn order
     */
    determineTurnOrder(p1Action, p2Action, p1Pokemon, p2Pokemon, p1Tailwind = false, p2Tailwind = false) {

        // Get priority
        const p1Priority = this.getMovePriority(p1Action);
        const p2Priority = this.getMovePriority(p2Action);

        // Higher priority goes first
        if (p1Priority !== p2Priority) {
            return p1Priority > p2Priority ? ['p1', 'p2'] : ['p2', 'p1'];
        }

        // Same priority - check speed
        const p1Speed = this.getEffectiveStat(p1Pokemon, 'spe', p1Pokemon.statStages.spe, null, p1Tailwind);
        const p2Speed = this.getEffectiveStat(p2Pokemon, 'spe', p2Pokemon.statStages.spe, null, p2Tailwind);

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
