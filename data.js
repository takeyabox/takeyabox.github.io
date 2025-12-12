/**
 * Pokemon Data Definitions
 */
const pokemonData = {
    1: {
        id: 1,
        name: "そうじ", // 元: そうじ
        types: ["むし", "じめん"],
        ability: { name: "カブトアーマー", description: "相手の技が急所に当たらなくなる。" },
        stats: { hp: 80, atk: 84, def: 70, spa: 77, spd: 64, spe: 96 },
    },
    2: {
        id: 2,
        name: "しょうき", // 元: しょき
        types: ["ひこう", "エスパー"],
        ability: { name: "たんじゅん", description: "能力変化が通常の2倍になる。" },
        stats: { hp: 98, atk: 92, def: 95, spa: 110, spd: 100, spe: 75 },
    },
    3: {
        id: 3,
        name: "たかす", // 元: たかす
        types: ["みず", "どく"],
        ability: { name: "ひとでなし", description: "どく状態の相手を攻撃するとかならず急所に当たる。" },
        stats: { hp: 93, atk: 95, def: 85, spa: 95, spd: 95, spe: 85 },
    },
    4: {
        id: 4,
        name: "じゅん", // 元: じゅん
        types: ["ノーマル", "フェアリー"],
        ability: { name: "きょううん", description: "自身の技が急所に当たりやすくなる。" },
        stats: { hp: 108, atk: 112, def: 100, spa: 78, spd: 90, spe: 112 },
    },
    5: {
        id: 5,
        name: "しげ", // 元: たけしげ
        types: ["でんき", "いわ"],
        ability: { name: "てんねん", description: "相手の能力の変化を無効化する。" },
        stats: { hp: 95, atk: 115, def: 115, spa: 40, spd: 88, spe: 67 },
    },
    6: {
        id: 6,
        name: "なつうみ", // 元: なつうみ
        types: ["あく", "エスパー"],
        ability: { name: "ぜったいねむり", description: "常にねむり状態で目覚めず、他の状態異常にならない。眠ったまま技が出せる。" },
        stats: { hp: 70, atk: 62, def: 73, spa: 102, spd: 60, spe: 103 },
    },
    7: {
        id: 7,
        name: "きっぺー", // 元: きっぺー
        types: ["ノーマル"],
        ability: { name: "あついしぼう", description: "ほのおタイプとこおりタイプの技のダメージが半減する。" },
        stats: { hp: 140, atk: 70, def: 90, spa: 40, spd: 70, spe: 40 },
    },
    8: {
        id: 8,
        name: "まつりだ", // 元: まつりだ
        types: ["みず", "フェアリー"],
        ability: { name: "すいほう", description: "ほのおタイプの技のダメージが半減し、みずタイプの技で攻撃するときに威力が2倍になる。やけど状態にならない。" },
        stats: { hp: 105, atk: 40, def: 85, spa: 65, spd: 95, spe: 95 },
    },
    9: {
        id: 9,
        name: "なち", // 元: なち
        types: ["むし", "ゴースト"],
        ability: { name: "まけんき", description: "敵から自分の能力を下げられたとき、こうげきの能力変化が2段階上昇する。" },
        stats: { hp: 70, atk: 65, def: 50, spa: 50, spd: 58, spe: 107 },
    }
};
