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
            // No Guard (ignores invulnerability? - In main games, yes for some moves, but general No Guard hits through Fly/Dig)
            if ((attacker.ability && attacker.ability.name === "ノーガード") || (defender.ability && defender.ability.name === "ノーガード")) {
                return true;
            }

            // Specific counters can skip this (e.g. Earthquake hits Dig), but for now simple block
            // Allow self-targeting moves
            if (attacker === defender) return true;
            return false;
        }

        // Prankster (いたずらごころ) Immunity - Dark types are immune to Prankster status moves
        if (attacker.ability && attacker.ability.name === 'いたずらごころ' && move.category === '変化') {
            if (defender.types.includes('あく')) {
                return false;
            }
        }

        // Accuracy check
        if (!move.accuracy || move.accuracy === Infinity) return true;

        // No Guard - Always hit
        if ((attacker.ability && attacker.ability.name === "ノーガード") || (defender.ability && defender.ability.name === "ノーガード")) {
            return true;
        }

        let modifiedAccuracy = move.accuracy;
        // Wide Lens
        if (attacker.item === 'wide-lens') {
            modifiedAccuracy *= 1.1;
        }

        // ふくがん (Compound Eyes)
        if (attacker.ability && attacker.ability.name === "ふくがん") {
            modifiedAccuracy *= 1.3;
        }

        // ゆきがくれ (Snow Cloak)
        if (this.weather === 'hail' && defender.ability && defender.ability.name === "ゆきがくれ") {
            modifiedAccuracy *= 0.8;
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
        // こんがりボディ (Well-Baked Body) - Fire immunity
        if (move.type === 'ほのお' && defender.ability && defender.ability.name === 'こんがりボディ') {
            return { total: 0, details: { ...details, typeEffectiveness: 0 } };
        }

        const typeEffect = this.getTypeEffectiveness(move.type, defender.types);
        total *= typeEffect;
        details.typeEffectiveness = typeEffect;

        // いろめがね (Tinted Lens) - Double damage if not very effective
        if (typeEffect < 1 && attacker.ability && attacker.ability.name === "いろめがね") {
            total *= 2;
        }

        // Critical Hit
        const critRate = this.getCriticalHitRate(attacker, defender, move);
        const isCrit = Math.random() < critRate;
        if (isCrit) {
            total *= 1.5;
            details.critical = true;
        }

        // Burn halves physical attack (Facade ignores this)
        if (attacker.status === 'burn' && move.category === "物理" && move.name !== 'からげんき') {
            total *= 0.5;
            details.burn = true;
        }

        // Facade (からげんき) - Double power if status is present
        if (move.name === 'からげんき' && (attacker.status === 'poison' || attacker.status === 'bad_poison' || attacker.status === 'burn' || attacker.status === 'paralysis')) {
            total *= 2.0;
            details.facade = true;
        }

        // Weather effects
        if (this.weather === 'sunny') {
            if (move.type === 'ほのお') {
                total *= 1.5;
                details.weather = 1.5;
            } else if (move.type === 'みず') {
                total *= 0.5;
                details.weather = 0.5;
            }
        } else if (this.weather === 'rain') {
            if (move.type === 'みず') {
                total *= 1.5;
                details.weather = 1.5;
            } else if (move.type === 'ほのお') {
                total *= 0.5;
                details.weather = 0.5;
            }
        }

        // Ability effects
        total *= this.getAbilityDamageModifier(attacker, defender, move);

        // Held item effects
        total *= this.getItemDamageModifier(attacker, defender, move, details);

        // Knock Off (はたきおとす)
        if (move.name === 'はたきおとす' && defender.item) {
            if (defender.ability && defender.ability.name === 'ねんちゃく') {
                // No boost
            } else {
                total *= 1.5;
                details.knockOff = true;
            }
        }

        // Screens (Reflect / Light Screen / Aurora Veil)
        if (!details.critical && move.name !== 'かわらわり' && move.name !== 'サイコファング' && battleState) {
            let defenderSide = null;
            const p1Active = battleState.p1.team[battleState.p1.activeIndex];
            const p2Active = battleState.p2.team[battleState.p2.activeIndex];

            if (defender.id === p1Active.id) defenderSide = battleState.p1;
            else if (defender.id === p2Active.id) defenderSide = battleState.p2;

            if (defenderSide) {
                // Reflect (Physical)
                if (move.category === '物理' && (defenderSide.reflect > 0 || defenderSide.auroraVeil > 0)) {
                    total *= 0.5;
                    details.screen = true;
                }
                // Light Screen (Special)
                if (move.category === '特殊' && (defenderSide.lightScreen > 0 || defenderSide.auroraVeil > 0)) {
                    total *= 0.5;
                    details.screen = true;
                }
            }
        }

        // Charge (じゅうでん)
        if (move.type === 'でんき' && attacker.volatileStatus && attacker.volatileStatus.charge) {
            total *= 2.0;
        }

        // Electric Terrain
        if (battleState && battleState.field && battleState.field.terrain === 'electric' && battleState.field.terrainTurns > 0) {
            const isGrounded = !attacker.types.includes('ひこう') && (!attacker.ability || attacker.ability.name !== 'ふゆう');
            if (isGrounded && move.type === 'でんき') {
                total *= 1.3;
            }
        }

        // Defense Curl + Rollout/Ice Ball
        if ((move.name === 'ころがる' || move.name === 'アイスボール') && attacker.volatileStatus && attacker.volatileStatus.defenseCurl) {
            total *= 2.0;
        }

        // Stomping Tantrum (じたんだ)
        if (move.name === 'じたんだ' && attacker.lastMoveFailed) {
            total *= 2.0;
        }

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
     * Get effective stat value (considering Unaware)
     */
    getEffectiveStat(pokemon, stat, stage, opponentAbility = null, isTailwind = false) {
        let effectiveStage = stage;

        if (opponentAbility && opponentAbility.name === "てんねん") {
            effectiveStage = 0;
        }

        return this.calculateStat(pokemon, stat, effectiveStage, isTailwind);
    }

    /**
     * Calculate stat value with modifiers
     */
    calculateStat(pokemon, stat, stage, isTailwind = false) {
        let baseStat = pokemon.stats[stat];

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

        // Weather Speed Abilities
        if (stat === 'spe') {
            const abilityName = pokemon.ability ? pokemon.ability.name : '';
            if (this.weather === 'rain' && abilityName === 'すいすい') {
                baseStat = Math.floor(baseStat * 2);
            } else if (this.weather === 'sunny' && abilityName === 'ようりょくそ') {
                baseStat = Math.floor(baseStat * 2);
            } else if (this.weather === 'sandstorm' && abilityName === 'すなかき') {
                baseStat = Math.floor(baseStat * 2);
            } else if (this.weather === 'hail' && abilityName === 'ゆきかき') {
                baseStat = Math.floor(baseStat * 2);
            }
        }

        // Choice Scarf
        if (stat === 'spe' && pokemon.item === 'choice-scarf') {
            baseStat = Math.floor(baseStat * 1.5);
        }

        // Assault Vest
        if (stat === 'spd' && pokemon.item === 'assault-vest') {
            baseStat = Math.floor(baseStat * 1.5);
        }

        // Gorilla Tactics (Atk boost)
        if (stat === 'atk' && pokemon.ability && pokemon.ability.name === 'ごりむちゅう') {
            baseStat = Math.floor(baseStat * 1.5);
        }

        return baseStat;
    }

    /**
     * Get ability-based damage modifier
     */
    getAbilityDamageModifier(attacker, defender, move) {
        let modifier = 1.0;

        // あついしぼう (Thick Fat)
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

        // テクニシャン (Technician)
        if (attacker.ability && attacker.ability.name === "テクニシャン" && move.power && move.power <= 60) {
            modifier *= 1.5;
        }

        // てつのこぶし (Iron Fist)
        if (attacker.ability && attacker.ability.name === "てつのこぶし") {
            // Simply trusting damage calculation or explicit list in future
        }

        // ごりむちゅう (Gorilla Tactics)
        if (attacker.ability && attacker.ability.name === "ごりむちゅう" && move.category === "物理") {
            modifier *= 1.5;
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

        // Expert Belt
        if (attacker.item === 'expert-belt' && details.typeEffectiveness > 1) {
            modifier *= 1.2;
        }

        return modifier;
    }

    /**
     * Apply status condition
     */
    applyStatus(pokemon, status, source) {
        if (pokemon.ability && pokemon.ability.name === "ぜったいねむり") {
            return { success: false, message: "しかし効果がなかった!" };
        }

        if (pokemon.status && pokemon.status !== 'confusion') {
            return { success: false, message: `${pokemon.name}はすでに状態異常だ!` };
        }

        // Type immunities
        if (status === 'poison' || status === 'bad_poison') {
            if (pokemon.types.includes('どく') || pokemon.types.includes('はがね')) {
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
        if (status === 'confusion' && pokemon.ability && pokemon.ability.name === 'マイペース') {
            return { success: false, message: `${pokemon.name}の マイペースで 混乱しない!` };
        }

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

        let message = statusMessages[status] || "";

        // Poison Puppeteer (どくくぐつ)
        if ((status === 'poison' || status === 'bad_poison') && source && source.ability && source.ability.name === 'どくくぐつ') {
            const confResult = this.applyStatus(pokemon, 'confusion', source);
            if (confResult.success) {
                message += `\n${source.name}の どくくぐつで 混乱した！`;
            }
        }

        return { success: true, message: message };
    }

    /**
     * Check if Pokemon can act this turn (status check)
     */
    canAct(pokemon) {
        if (pokemon.ability && pokemon.ability.name === "ぜったいねむり") {
            return { canAct: true };
        }

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

        if (pokemon.status === 'freeze') {
            if (Math.random() < 0.25) {
                pokemon.status = null;
                return { canAct: true, message: `${pokemon.name}の氷が溶けた!` };
            }
            return { canAct: false, message: `${pokemon.name}は凍っている!` };
        }

        if (pokemon.status === 'paralysis') {
            if (Math.random() < 0.25) {
                return { canAct: false, message: `${pokemon.name}は体がしびれて動けない!` };
            }
        }

        if (pokemon.status === 'confusion') {
            if (pokemon.confusionTurns > 0) {
                pokemon.confusionTurns--;
                if (pokemon.confusionTurns === 0) {
                    pokemon.status = null;
                    return { canAct: true, message: `${pokemon.name}の混乱が解けた!` };
                }

                if (Math.random() < 1 / 3) {
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
        // Perish Song
        if (pokemon.perishCount) {
            pokemon.perishCount--;
            if (pokemon.perishCount === 0) {
                pokemon.currentHp = 0;
                logs.push(`${pokemon.name}の 滅びのカウントが 0になった！`);
                logs.push(`${pokemon.name}は 倒れた！`);
            } else {
                logs.push(`${pokemon.name}の 滅びのカウントが ${pokemon.perishCount}！`);
            }
        }

        if (pokemon.currentHp === 0) return;

        // Yawn
        if (pokemon.drowsyTurn) {
            pokemon.drowsyTurn--;
            if (pokemon.drowsyTurn === 0) {
                if (!pokemon.status && (!pokemon.ability || (pokemon.ability.name !== 'やるき' && pokemon.ability.name !== 'ふみん'))) {
                    const result = this.applyStatus(pokemon, 'sleep', null);
                    if (result.success) logs.push(`${pokemon.name}は 眠気に 耐えきれず 眠ってしまった！`);
                }
            }
        }

        // Poison damage
        if (pokemon.status === 'poison') {
            const damage = Math.floor(pokemon.maxHp / 8);
            pokemon.currentHp = Math.max(0, pokemon.currentHp - damage);
            logs.push(`${pokemon.name}は毒のダメージを受けた! (${damage}ダメージ)`);
        }

        // Bad poison damage
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
        this.applyWeatherDamage(pokemon, logs);

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

        // Leech Seed
        if (pokemon.volatileStatus && pokemon.volatileStatus.leechSeed && pokemon.currentHp > 0) {
            const damage = Math.floor(pokemon.maxHp / 8);
            if (damage > 0) {
                pokemon.currentHp = Math.max(0, pokemon.currentHp - damage);
                logs.push(`${pokemon.name}は やどりぎで 体力を 奪われた！`);
            }
        }

        // Taunt decrement
        if (pokemon.volatileStatus && pokemon.volatileStatus.taunt) {
            pokemon.volatileStatus.taunt--;
            if (pokemon.volatileStatus.taunt <= 0) {
                delete pokemon.volatileStatus.taunt;
                logs.push(`${pokemon.name}の 挑発が 解けた！`);
            }
        }

        // Encore decrement
        if (pokemon.volatileStatus && pokemon.volatileStatus.encore) {
            pokemon.volatileStatus.encore.turns--;
            if (pokemon.volatileStatus.encore.turns <= 0) {
                delete pokemon.volatileStatus.encore;
                logs.push(`${pokemon.name}の アンコールが 解けた！`);
            }
        }

        // Destiny Bond reset
        if (pokemon.volatileStatus && pokemon.volatileStatus.destinyBond) {
            delete pokemon.volatileStatus.destinyBond;
        }

        // Roost (restore Flying type)
        if (pokemon.volatileStatus && pokemon.volatileStatus.roost) {
            delete pokemon.volatileStatus.roost;
            if (pokemon.originalTypes) {
                pokemon.types = [...pokemon.originalTypes];
                delete pokemon.originalTypes;
            }
        }

        // Heal Block decrement
        if (pokemon.volatileStatus && pokemon.volatileStatus.healBlock) {
            pokemon.volatileStatus.healBlock--;
            if (pokemon.volatileStatus.healBlock <= 0) {
                delete pokemon.volatileStatus.healBlock;
                logs.push(`${pokemon.name}の 回復封じが 解けた！`);
            }
        }

        this.checkBerryConsumption(pokemon, logs);
    }

    /**
     * Check and consume berries
     */
    checkBerryConsumption(pokemon, logs, force = false) {
        if (!pokemon.item) return;

        // Sitrus Berry
        if (pokemon.item === 'sitrus-berry' || (force && pokemon.item === 'sitrus-berry')) {
            if (force || pokemon.currentHp <= pokemon.maxHp / 2) {
                const heal = Math.floor(pokemon.maxHp / 4);
                pokemon.currentHp = Math.min(pokemon.maxHp, pokemon.currentHp + heal);
                pokemon.item = null;
                logs.push(`${pokemon.name}は オボンのみで 体力を 回復した！`);
            }
        }
    }

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

        // Weather setting
        if (move.effect && move.effect.weather) {
            this.setWeather(move.effect.weather, 5);
            const weatherNames = {
                'rain': '雨',
                'sunny': '日差しが強い状態',
                'sandstorm': '砂嵐',
                'hail': '霰'
            };
            logs.push(`天候が ${weatherNames[move.effect.weather]}になった！`);
        }

        // Life Orb recoil
        if (attacker.item === 'life-orb' && damage > 0) {
            const recoilDamage = Math.floor(attacker.maxHp / 10);
            attacker.currentHp = Math.max(0, attacker.currentHp - recoilDamage);
            logs.push(`${attacker.name}はいのちのたまのダメージを受けた!`);
            this.checkBerryConsumption(attacker, logs);
        }

        // Rocky Helmet
        if (defender.item === 'rocky-helmet' && move.flags && move.flags.is_contact && damage > 0) {
            const counterDamage = Math.floor(attacker.maxHp / 6);
            attacker.currentHp = Math.max(0, attacker.currentHp - counterDamage);
            logs.push(`${attacker.name}はゴツゴツメットのダメージを受けた!`);
        }

        // Stat changes
        if (move.effect && move.effect.stat_change) {
            move.effect.stat_change.forEach(change => {
                if (Math.random() * 100 < change.chance) {
                    const target = change.target === 'self' ? attacker : defender;
                    const currentStage = target.statStages[change.stat];
                    let stageChange = change.stage;

                    if (target.ability && target.ability.name === "たんじゅん") {
                        stageChange *= 2;
                    }
                    if (change.stage < 0 && target === defender && target.ability && target.ability.name === "まけんき") {
                        target.statStages.atk = Math.min(6, target.statStages.atk + 2);
                        logs.push(`${target.name}のまけんきが発動! 攻撃が2段階上がった!`);
                    }

                    target.statStages[change.stat] = Math.max(-6, Math.min(6, currentStage + stageChange));
                    const statNames = { 'atk': '攻撃', 'def': '防御', 'spa': '特攻', 'spd': '特防', 'spe': '素早さ' };
                    const changeText = stageChange > 0 ? '上がった' : '下がった';
                    logs.push(`${target.name}の${statNames[change.stat]}が${changeText}!`);
                }
            });
        }

        // Flinch
        if (move.effect && move.effect.flinch) {
            effects.push('flinch');
        }

        return effects;
    }

    /**
     * Determine turn order
     */
    determineTurnOrder(p1Action, p2Action, p1Pokemon, p2Pokemon, p1Tailwind = false, p2Tailwind = false) {
        let p1Priority = this.getMovePriority(p1Action);
        let p2Priority = this.getMovePriority(p2Action);

        if (p1Action.type === 'move' && p1Pokemon.ability && p1Pokemon.ability.name === 'いたずらごころ') {
            const move = pokemonMoves.find(m => m.name === p1Action.move);
            if (move && move.category === '変化') p1Priority += 1;
        }
        if (p2Action.type === 'move' && p2Pokemon.ability && p2Pokemon.ability.name === 'いたずらごころ') {
            const move = pokemonMoves.find(m => m.name === p2Action.move);
            if (move && move.category === '変化') p2Priority += 1;
        }

        if (p1Priority !== p2Priority) {
            return p1Priority > p2Priority ? ['p1', 'p2'] : ['p2', 'p1'];
        }

        const p1Speed = this.getEffectiveStat(p1Pokemon, 'spe', p1Pokemon.statStages.spe, null, p1Tailwind);
        const p2Speed = this.getEffectiveStat(p2Pokemon, 'spe', p2Pokemon.statStages.spe, null, p2Tailwind);

        if (p1Speed !== p2Speed) {
            return p1Speed > p2Speed ? ['p1', 'p2'] : ['p2', 'p1'];
        }

        return Math.random() < 0.5 ? ['p1', 'p2'] : ['p2', 'p1'];
    }

    /**
     * Get move priority
     */
    getMovePriority(action) {
        if (action.type === 'switch') return 6;
        if (action.type === 'move') {
            const move = pokemonMoves.find(m => m.name === action.move);
            return move ? (move.priority || 0) : 0;
        }
        return 0;
    }

    /**
     * Apply weather damage at end of turn
     */
    applyWeatherDamage(pokemon, logs) {
        if (pokemon.currentHp <= 0) return;

        if (this.weather === 'sandstorm') {
            const isImmune = pokemon.types.includes('いわ') || pokemon.types.includes('じめん') || pokemon.types.includes('はがね');
            if (!isImmune) {
                const damage = Math.floor(pokemon.maxHp / 16);
                pokemon.currentHp = Math.max(0, pokemon.currentHp - damage);
                logs.push(`${pokemon.name}は 砂嵐の ダメージを 受けた！`);
            }
        }

        if (this.weather === 'hail') {
            const isImmune = pokemon.types.includes('こおり');
            if (!isImmune) {
                const damage = Math.floor(pokemon.maxHp / 16);
                pokemon.currentHp = Math.max(0, pokemon.currentHp - damage);
                logs.push(`${pokemon.name}は 霰の ダメージを 受けた！`);
            }
        }
    }

    /**
     * Apply entry hazards
     */
    applyEntryHazards(pokemon, sideState, logs) {
        if (!sideState.hazards) return;

        if (pokemon.item === 'heavy-duty-boots') {
            logs.push(`${pokemon.name}の あつぞこブーツが 罠を 防いだ！`);
            return;
        }

        if (sideState.hazards.stealthRock) {
            let factor = 1 / 8;
            let effectiveness = 1;
            pokemon.types.forEach(type => {
                const rockEffectiveness = typeChart['いわ'][type];
                if (rockEffectiveness !== undefined) effectiveness *= rockEffectiveness;
            });

            const damage = Math.floor(pokemon.maxHp * factor * effectiveness);
            if (damage > 0) {
                pokemon.currentHp = Math.max(0, pokemon.currentHp - damage);
                logs.push(`${pokemon.name}に とがった岩が 食い込んだ！`);
            }
        }
    }

    /**
     * Check for abilities triggers on entry
     */
    checkEntryAbilities(pokemon, opponent, logs) {
        if (!pokemon.ability) return;
        const ability = pokemon.ability.name;

        if (ability === 'あめふらし') {
            this.setWeather('rain', 5);
            logs.push(`${pokemon.name}の あめふらしで 雨が 降り出した！`);
        } else if (ability === 'ひでり') {
            this.setWeather('sunny', 5);
            logs.push(`${pokemon.name}の ひでりで 日差しが 強くなった！`);
        } else if (ability === 'すなおこし') {
            this.setWeather('sandstorm', 5);
            logs.push(`${pokemon.name}の すなおこしで 砂嵐が 吹き荒れた！`);
        } else if (ability === 'ゆきふらし') {
            this.setWeather('hail', 5);
            logs.push(`${pokemon.name}の ゆきふらしで 霰が 降り始めた！`);
        }

        if (ability === 'いかく' && opponent && opponent.currentHp > 0) {
            const opAbility = opponent.ability ? opponent.ability.name : '';
            if (['マイペース', 'どんかん', 'せいしんりょく', 'クリアボディ'].includes(opAbility)) {
                logs.push(`${opponent.name}には 効果がないようだ！`);
            } else {
                const currentStage = opponent.statStages.atk;
                opponent.statStages.atk = Math.max(-6, currentStage - 1);
                logs.push(`${pokemon.name}の いかくで ${opponent.name}の 攻撃が 下がった！`);

                if (opAbility === 'まけんき') {
                    opponent.statStages.atk = Math.min(6, opponent.statStages.atk + 2);
                    logs.push(`${opponent.name}の まけんきが 発動！ 攻撃が ぐーんと 上がった！`);
                }
            }
        }
    }

    setWeather(weather, duration) {
        this.weather = weather;
        this.weatherTurns = duration || 5;
    }
}
