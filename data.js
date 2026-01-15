/**
 * Pokemon Data Definitions
 */
const pokemonData = {
    1: {
        id: 1,
        name: "そうじ",
        types: ["むし", "じめん"],
        abilities: [
            { name: "カブトアーマー", description: "相手の技が急所に当たらなくなる。" },
            { name: "ふくがん", description: "技の命中率が1.3倍になる。" },
            { name: "すなおこし", description: "場に出ると5ターン砂嵐になる。" }
        ],
        stats: { hp: 80, atk: 84, def: 70, spa: 77, spd: 64, spe: 96 },
    },
    2: {
        id: 2,
        name: "しょうき",
        types: ["ひこう", "エスパー"],
        abilities: [
            { name: "たんじゅん", description: "能力変化が通常の2倍になる。" },
            { name: "マイペース", description: "混乱状態にならず、いかくを受けない。" },
            { name: "マジックミラー", description: "相手の変化技を跳ね返す。" }
        ],
        stats: { hp: 98, atk: 92, def: 95, spa: 110, spd: 100, spe: 75 },
    },
    3: {
        id: 3,
        name: "たかす",
        types: ["みず", "どく"],
        abilities: [
            { name: "ひとでなし", description: "どく状態の相手を攻撃するとかならず急所に当たる。" },
            { name: "どくくぐつ", description: "どく状態にした相手を交代できなくする。" },
            { name: "トレース", description: "相手の特性をコピーする。" }
        ],
        stats: { hp: 93, atk: 95, def: 85, spa: 95, spd: 95, spe: 85 },
    },
    4: {
        id: 4,
        name: "じゅん",
        types: ["ノーマル", "フェアリー"],
        abilities: [
            { name: "きょううん", description: "自身の技が急所に当たりやすくなる。" },
            { name: "さいせいりょく", description: "引っ込むとHPが最大HPの1/3回復する。" }
        ],
        stats: { hp: 108, atk: 112, def: 100, spa: 78, spd: 90, spe: 112 },
    },
    5: {
        id: 5,
        name: "しげ",
        types: ["でんき", "いわ"],
        abilities: [
            { name: "どんかん", description: "メロメロ・ちょうはつ状態にならない。" },
            { name: "てんねん", description: "相手の能力の変化を無効化する。" },
            { name: "テクニシャン", description: "威力60以下の技の威力が1.5倍になる。" }
        ],
        stats: { hp: 95, atk: 115, def: 115, spa: 40, spd: 88, spe: 67 },
    },
    6: {
        id: 6,
        name: "なつうみ",
        types: ["あく", "エスパー"],
        abilities: [
            { name: "ぜったいねむり", description: "常にねむり状態で目覚めず、他の状態異常にならない。眠ったまま技が出せる。" },
            { name: "ぎゃくじょう", description: "HPが半分以下になると特攻が1段階上がる。" },
            { name: "ねんちゃく", description: "相手に道具を奪われない。" }
        ],
        stats: { hp: 70, atk: 62, def: 73, spa: 102, spd: 60, spe: 103 },
    },
    7: {
        id: 7,
        name: "きっぺー",
        types: ["ノーマル"],
        abilities: [
            { name: "あついしぼう", description: "ほのおタイプとこおりタイプの技のダメージが半減する。" },
            { name: "こんがりボディ", description: "ほのお技を受けると防御が2段階上がる。" }
        ],
        stats: { hp: 140, atk: 70, def: 90, spa: 40, spd: 70, spe: 40 },
    },
    8: {
        id: 8,
        name: "まつりだ",
        types: ["みず", "フェアリー"],
        abilities: [
            { name: "メロメロボディ", description: "接触技を受けると30%でメロメロにする。" },
            { name: "すいほう", description: "ほのおタイプの技のダメージが半減し、みずタイプの技で攻撃するときに威力が2倍になる。やけど状態にならない。" },
            { name: "すいすい", description: "雨のとき素早さが2倍になる。" }
        ],
        stats: { hp: 105, atk: 40, def: 85, spa: 65, spd: 95, spe: 95 },
    },
    9: {
        id: 9,
        name: "なち",
        types: ["むし", "ゴースト"],
        abilities: [
            { name: "まけんき", description: "敵から自分の能力を下げられたとき、こうげきの能力変化が2段階上昇する。" },
            { name: "じしんかじょう", description: "相手を倒すと攻撃が1段階上がる。" }
        ],
        stats: { hp: 70, atk: 65, def: 50, spa: 50, spd: 58, spe: 107 },
    },
    10: {
        id: 10,
        name: "いけがや",
        types: ["かくとう", "ドラゴン"],
        abilities: [
            { name: "ごりむちゅう", description: "こうげきが1.5倍になるが、最初に選んだ技しか出せない。" },
            { name: "てつのこぶし", description: "パンチ技の威力が1.2倍になる。" },
            { name: "いろめがね", description: "効果いまひとつの技が等倍になる。" }
        ],
        stats: { hp: 95, atk: 120, def: 95, spa: 90, spd: 85, spe: 100 },
    },
    11: {
        id: 11,
        name: "あんどぅ",
        types: ["いわ", "あく"],
        abilities: [
            { name: "なまけ", description: "2ターンに1回しか動けない。" },
            { name: "いかく", description: "場に出ると相手の攻撃を1段階下げる。" }
        ],
        stats: { hp: 90, atk: 110, def: 70, spa: 50, spd: 60, spe: 60 },
    },
    12: {
        id: 12,
        name: "もりた",
        types: ["みず", "ひこう"],
        abilities: [
            { name: "あめうけざら", description: "雨のとき毎ターンHPが1/16回復する。" },
            { name: "あめふらし", description: "場に出ると5ターン雨にする。" }
        ],
        stats: { hp: 90, atk: 105, def: 75, spa: 60, spd: 85, spe: 80 },
    },
    13: {
        id: 13,
        name: "おかだ",
        types: ["みず", "じめん"],
        abilities: [
            { name: "すなかき", description: "砂嵐のとき素早さが2倍になる。" },
            { name: "すいすい", description: "雨のとき素早さが2倍になる。" },
            { name: "ゆきかき", description: "霰のとき素早さが2倍になる。" }
        ],
        stats: { hp: 80, atk: 110, def: 80, spa: 90, spd: 80, spe: 85 },
    },
    14: {
        id: 14,
        name: "いなば",
        types: ["こおり", "ゴースト"],
        abilities: [
            { name: "ノーガード", description: "お互いの技が必中になる。" },
            { name: "ゆきがくれ", description: "霰のとき回避率が1.25倍になる。" },
            { name: "ぎゃくじょう", description: "HPが半分以下になると特攻が1段階上がる。" }
        ],
        stats: { hp: 50, atk: 100, def: 35, spa: 100, spd: 75, spe: 100 },
    }
};
