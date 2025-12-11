
// Mock Data
const pokemonMoves = [
    { name: "Thunderbolt", power: 90, type: "Electric", category: "Special" },
    { name: "Tackle", power: 40, type: "Normal", category: "Physical" }
];

const battleState = {
    p1: {
        name: "Ash",
        team: [{
            name: "Pikachu",
            currentHp: 100,
            maxHp: 100,
            stats: { speed: 100 },
            types: ["Electric"],
            moves: ["Thunderbolt"],
            statStages: { atk: 0, def: 0, spa: 0, spd: 0, spe: 0 }
        }],
        activeIndex: 0,
        action: { type: 'move', move: 'Thunderbolt' }
    },
    p2: {
        name: "Gary",
        team: [{
            name: "Rattata",
            currentHp: 10,  // Low HP, will faint
            maxHp: 50,
            stats: { speed: 50 },
            types: ["Normal"],
            moves: ["Tackle"],
            statStages: { atk: 0, def: 0, spa: 0, spd: 0, spe: 0 }
        }],
        activeIndex: 0,
        action: { type: 'move', move: 'Tackle' }
    }
};

const battleEngine = {
    determineTurnOrder: () => ['p1', 'p2'],
    canAct: () => ({ canAct: true }),
    calculateDamage: () => 50, // Enough to kill Rattata
    getTypeEffectiveness: () => 1,
    applyMoveEffects: () => [],
    applyEndOfTurnEffects: () => { },
    updateWeather: () => null
};

// Simulation of resolveTurn
function resolveTurn() {
    const state = JSON.parse(JSON.stringify(battleState));
    const logs = [];

    const turnOrder = battleEngine.determineTurnOrder();

    turnOrder.forEach((side, orderIndex) => {
        const actorSide = side;
        const targetSide = side === 'p1' ? 'p2' : 'p1';
        const actor = state[actorSide].team[state[actorSide].activeIndex];
        const target = state[targetSide].team[state[targetSide].activeIndex];

        console.log(`Turn ${orderIndex}: ${actorSide} acting. HP: ${actor.currentHp}`);

        if (actor.currentHp <= 0) {
            console.log("Actor fainted, skipping.");
            return;
        }

        const action = state[actorSide].action;

        if (action.type === 'move') {
            console.log(`${actorSide} uses move against ${targetSide} (HP: ${target.currentHp})`);

            // Damage
            const damage = battleEngine.calculateDamage();
            target.currentHp = Math.max(0, target.currentHp - damage);

            console.log(`${targetSide} takes ${damage} damage. Remaining HP: ${target.currentHp}`);

            if (target.currentHp === 0) {
                console.log(`${targetSide} fainted!`);
            }
        }
    });
}

resolveTurn();
