/**
 * ポケモン技データベース
 * 指示に基づき公式パラメータ（第9世代準拠）で定義
 */
const pokemonMoves = [
    // --- ノーマル ---
    {
        name: "すてみタックル",
        type: "ノーマル",
        power: 120,
        category: "物理",
        accuracy: 100,
        priority: 0,
        effect: {
            recoil: "33" // 与えたダメージの1/3
        }
    },
    {
        name: "まもる",
        type: "ノーマル",
        power: null,
        category: "変化",
        accuracy: null, // 自分対象のため命中判定なし
        priority: 4,
        effect: {
            shield: true // 絶対防御
        }
    },
    {
        name: "みがわり",
        type: "ノーマル",
        power: null,
        category: "変化",
        accuracy: null,
        priority: 0,
        effect: {
            special_condition: "HPを1/4削って分身を作る"
        }
    },
    {
        name: "ハイパーボイス",
        type: "ノーマル",
        power: 90,
        category: "特殊",
        accuracy: 100,
        priority: 0,
        effect: {}
    },
    {
        name: "じこさいせい",
        type: "ノーマル",
        power: null,
        category: "変化",
        accuracy: null,
        priority: 0,
        effect: {
            recovery: "50"
        }
    },
    {
        name: "ねごと",
        type: "ノーマル",
        power: null,
        category: "変化",
        accuracy: null,
        priority: 0,
        effect: {
            special_condition: "睡眠時のみ使用可能。自分の技をランダムで使用"
        }
    },
    {
        name: "ギガインパクト",
        type: "ノーマル",
        power: 150,
        category: "物理",
        accuracy: 90,
        priority: 0,
        effect: {
            next_turn_immobile: true // 次ターン動けない
        }
    },
    {
        name: "いやなおと",
        type: "ノーマル",
        power: null,
        category: "変化",
        accuracy: 85,
        priority: 0,
        effect: {
            stat_change: [{ target: "opponent", stat: "def", stage: -2, chance: 100 }]
        }
    },
    {
        name: "ほろびのうた",
        type: "ノーマル",
        power: null,
        category: "変化",
        accuracy: null,
        priority: 0,
        effect: {
            special_condition: "3ターン後に互いにひんし"
        }
    },
    {
        name: "バトンタッチ",
        type: "ノーマル",
        power: null,
        category: "変化",
        accuracy: null,
        priority: 0,
        effect: {
            switch_self: true, // 交代
            pass_stats: true // 能力変化を引き継ぐ
        }
    },
    {
        name: "あくび",
        type: "ノーマル",
        power: null,
        category: "変化",
        accuracy: null, // 必中
        priority: 0,
        effect: {
            status_ailment: { name: "sleep", chance: 100, delayed: true } // 次のターン終了時に眠り
        }
    },

    // --- みず ---
    {
        name: "ハイドロポンプ",
        type: "みず",
        power: 110,
        category: "特殊",
        accuracy: 80,
        priority: 0,
        effect: {}
    },
    {
        name: "なみのり",
        type: "みず",
        power: 90,
        category: "特殊",
        accuracy: 100,
        priority: 0,
        effect: {}
    },
    {
        name: "クイックターン",
        type: "みず",
        power: 60,
        category: "物理",
        accuracy: 100,
        priority: 0,
        effect: {
            switch_self: true
        }
    },
    {
        name: "アクアブレイク",
        type: "みず",
        power: 85,
        category: "物理",
        accuracy: 100,
        priority: 0,
        effect: {
            stat_change: [{ target: "opponent", stat: "def", stage: -1, chance: 20 }]
        }
    },
    {
        name: "たきのぼり",
        type: "みず",
        power: 80,
        category: "物理",
        accuracy: 100,
        priority: 0,
        effect: {
            flinch: 20
        }
    },
    {
        name: "アクアジェット",
        type: "みず",
        power: 40,
        category: "物理",
        accuracy: 100,
        priority: 1,
        effect: {}
    },

    // --- でんき ---
    {
        name: "じゅうでん",
        type: "でんき",
        power: null,
        category: "変化",
        accuracy: null,
        priority: 0,
        effect: {
            stat_change: [{ target: "self", stat: "spd", stage: 1, chance: 100 }],
            special_condition: "次のでんき技の威力2倍"
        }
    },
    {
        name: "ほうでん",
        type: "でんき",
        power: 80,
        category: "特殊",
        accuracy: 100,
        priority: 0,
        effect: {
            status_ailment: { name: "paralysis", chance: 30 }
        }
    },
    {
        name: "ワイルドボルト",
        type: "でんき",
        power: 90,
        category: "物理",
        accuracy: 100,
        priority: 0,
        effect: {
            recoil: "20" // 1/5
        }
    },
    {
        name: "ボルトチェンジ",
        type: "でんき",
        power: 70,
        category: "特殊",
        accuracy: 100,
        priority: 0,
        effect: {
            switch_self: true
        }
    },
    {
        name: "でんじは",
        type: "でんき",
        power: null,
        category: "変化",
        accuracy: 90,
        priority: 0,
        effect: {
            status_ailment: { name: "paralysis", chance: 100 }
        }
    },
    {
        name: "10まんボルト",
        type: "でんき",
        power: 90,
        category: "特殊",
        accuracy: 100,
        priority: 0,
        effect: {
            status_ailment: { name: "paralysis", chance: 10 }
        }
    },

    // --- くさ ---
    {
        name: "ハードプラント",
        type: "くさ",
        power: 150,
        category: "特殊",
        accuracy: 90,
        priority: 0,
        effect: {
            next_turn_immobile: true
        }
    },
    {
        name: "リーフストーム",
        type: "くさ",
        power: 130,
        category: "特殊",
        accuracy: 90,
        priority: 0,
        effect: {
            stat_change: [{ target: "self", stat: "spa", stage: -2, chance: 100 }]
        }
    },
    {
        name: "やどりぎのタネ",
        type: "くさ",
        power: null,
        category: "変化",
        accuracy: 90,
        priority: 0,
        effect: {
            special_condition: "毎ターン相手のHPを吸収"
        }
    },
    {
        name: "はっぱカッター",
        type: "くさ",
        power: 55,
        category: "物理",
        accuracy: 95,
        priority: 0,
        effect: {
            crit_rate: 1 // 急所ランク+1
        }
    },
    {
        name: "ソーラービーム",
        type: "くさ",
        power: 120,
        category: "特殊",
        accuracy: 100,
        priority: 0,
        effect: {
            charge_turn: true // 1ターン溜め
        }
    },
    {
        name: "こうごうせい",
        type: "くさ",
        power: null,
        category: "変化",
        accuracy: null,
        priority: 0,
        effect: {
            recovery: "variable" // 天候依存
        }
    },

    // --- どく ---
    {
        name: "どくどく",
        type: "どく",
        power: null,
        category: "変化",
        accuracy: 90, // 毒タイプが使うと必中
        priority: 0,
        effect: {
            status_ailment: { name: "bad_poison", chance: 100 }
        }
    },
    {
        name: "ヘドロばくだん",
        type: "どく",
        power: 90,
        category: "特殊",
        accuracy: 100,
        priority: 0,
        effect: {
            status_ailment: { name: "poison", chance: 30 }
        }
    },
    {
        name: "どくづき",
        type: "どく",
        power: 80,
        category: "物理",
        accuracy: 100,
        priority: 0,
        effect: {
            status_ailment: { name: "poison", chance: 30 }
        }
    },
    {
        name: "ヘドロウェーブ",
        type: "どく",
        power: 95,
        category: "特殊",
        accuracy: 100,
        priority: 0,
        effect: {
            status_ailment: { name: "poison", chance: 10 }
        }
    },
    {
        name: "どくびし",
        type: "どく",
        power: null,
        category: "変化",
        accuracy: null,
        priority: 0,
        effect: {
            field_effect: "相手の場に毒の罠を設置"
        }
    },
    {
        name: "ダストシュート",
        type: "どく",
        power: 120,
        category: "物理",
        accuracy: 80,
        priority: 0,
        effect: {
            status_ailment: { name: "poison", chance: 30 }
        }
    },

    // --- じめん ---
    {
        name: "じしん",
        type: "じめん",
        power: 100,
        category: "物理",
        accuracy: 100,
        priority: 0,
        effect: {}
    },
    {
        name: "じならし",
        type: "じめん",
        power: 60,
        category: "物理",
        accuracy: 100,
        priority: 0,
        effect: {
            stat_change: [{ target: "opponent", stat: "spe", stage: -1, chance: 100 }]
        }
    },
    {
        name: "だいちのちから",
        type: "じめん",
        power: 90,
        category: "特殊",
        accuracy: 100,
        priority: 0,
        effect: {
            stat_change: [{ target: "opponent", stat: "spd", stage: -1, chance: 10 }]
        }
    },
    {
        name: "あなをほる",
        type: "じめん",
        power: 80,
        category: "物理",
        accuracy: 100,
        priority: 0,
        effect: {
            semi_invulnerable: "dig" // 1ターン目地中(防御)、2ターン目攻撃
        }
    },
    {
        name: "まきびし",
        type: "じめん",
        power: null,
        category: "変化",
        accuracy: null,
        priority: 0,
        effect: {
            field_effect: "相手の場にダメージ罠を設置"
        }
    },
    {
        name: "じわれ",
        type: "じめん",
        power: "OHKO",
        category: "物理",
        accuracy: 30,
        priority: 0,
        effect: {
            special_condition: "一撃必殺"
        }
    },

    // --- ひこう ---
    {
        name: "エアスラッシュ",
        type: "ひこう",
        power: 75,
        category: "特殊",
        accuracy: 95,
        priority: 0,
        effect: {
            flinch: 30
        }
    },
    {
        name: "おいかぜ",
        type: "ひこう",
        power: null,
        category: "変化",
        accuracy: null,
        priority: 0,
        effect: {
            field_effect: "4ターンの間、味方の素早さ2倍"
        }
    },
    {
        name: "ブレイブバード",
        type: "ひこう",
        power: 120,
        category: "物理",
        accuracy: 100,
        priority: 0,
        effect: {
            recoil: "33"
        }
    },
    {
        name: "そらをとぶ",
        type: "ひこう",
        power: 90,
        category: "物理",
        accuracy: 95,
        priority: 0,
        effect: {
            semi_invulnerable: "fly" // 1ターン目上空(防御)、2ターン目攻撃
        }
    },
    {
        name: "ぼうふう",
        type: "ひこう",
        power: 110,
        category: "特殊",
        accuracy: 70, // 雨で必中
        priority: 0,
        effect: {
            status_ailment: { name: "confusion", chance: 30 }
        }
    },
    {
        name: "はねやすめ",
        type: "ひこう",
        power: null,
        category: "変化",
        accuracy: null,
        priority: 0,
        effect: {
            recovery: "50",
            special_condition: "使用ターンはひこうタイプを失う"
        }
    },

    // --- エスパー ---
    {
        name: "サイコノイズ",
        type: "エスパー",
        power: 75,
        category: "特殊",
        accuracy: 100,
        priority: 0,
        effect: {
            special_condition: "2ターン相手は回復不能"
        }
    },
    {
        name: "サイコキネシス",
        type: "エスパー",
        power: 90,
        category: "特殊",
        accuracy: 100,
        priority: 0,
        effect: {
            stat_change: [{ target: "opponent", stat: "spd", stage: -1, chance: 10 }]
        }
    },
    {
        name: "ねむる",
        type: "エスパー",
        power: null,
        category: "変化",
        accuracy: null,
        priority: 0,
        effect: {
            recovery: "100",
            status_ailment: { target: "self", name: "sleep", chance: 100, duration: 2 }
        }
    },
    {
        name: "リフレクター",
        type: "エスパー",
        power: null,
        category: "変化",
        accuracy: null,
        priority: 0,
        effect: {
            field_effect: "5ターン味方の物理ダメージ軽減"
        }
    },
    {
        name: "さいみんじゅつ",
        type: "エスパー",
        power: null,
        category: "変化",
        accuracy: 60,
        priority: 0,
        effect: {
            status_ailment: { name: "sleep", chance: 100 }
        }
    },
    {
        name: "こうそくいどう",
        type: "エスパー",
        power: null,
        category: "変化",
        accuracy: null,
        priority: 0,
        effect: {
            stat_change: [{ target: "self", stat: "spe", stage: 2, chance: 100 }]
        }
    },

    // --- むし ---
    {
        name: "むしのていこう",
        type: "むし",
        power: 50,
        category: "特殊",
        accuracy: 100,
        priority: 0,
        effect: {
            stat_change: [{ target: "opponent", stat: "spa", stage: -1, chance: 100 }]
        }
    },
    {
        name: "メガホーン",
        type: "むし",
        power: 120,
        category: "物理",
        accuracy: 85,
        priority: 0,
        effect: {}
    },
    {
        name: "はいよるいちげき",
        type: "むし",
        power: 70,
        category: "物理",
        accuracy: 90,
        priority: 0,
        effect: {
            stat_change: [{ target: "opponent", stat: "spa", stage: -1, chance: 100 }]
        }
    },
    {
        name: "とびかかる",
        type: "むし",
        power: 80,
        category: "物理",
        accuracy: 100,
        priority: 0,
        effect: {
            stat_change: [{ target: "opponent", stat: "atk", stage: -1, chance: 100 }]
        }
    },
    {
        name: "とんぼがえり",
        type: "むし",
        power: 70,
        category: "物理",
        accuracy: 100,
        priority: 0,
        effect: {
            switch_self: true
        }
    },
    {
        name: "むしのさざめき",
        type: "むし",
        power: 90,
        category: "特殊",
        accuracy: 100,
        priority: 0,
        effect: {
            stat_change: [{ target: "opponent", stat: "spd", stage: -1, chance: 10 }]
        }
    },

    // --- いわ ---
    {
        name: "がんせきふうじ",
        type: "いわ",
        power: 60,
        category: "物理",
        accuracy: 95,
        priority: 0,
        effect: {
            stat_change: [{ target: "opponent", stat: "spe", stage: -1, chance: 100 }]
        }
    },
    {
        name: "いわなだれ",
        type: "いわ",
        power: 75,
        category: "物理",
        accuracy: 90,
        priority: 0,
        effect: {
            flinch: 30
        }
    },
    {
        name: "ストーンエッジ",
        type: "いわ",
        power: 100,
        category: "物理",
        accuracy: 80,
        priority: 0,
        effect: {
            crit_rate: 1
        }
    },
    {
        name: "ロックブラスト",
        type: "いわ",
        power: 25,
        category: "物理",
        accuracy: 90,
        priority: 0,
        effect: {
            hits: "2-5" // 連続攻撃
        }
    },
    {
        name: "うちおとす",
        type: "いわ",
        power: 50,
        category: "物理",
        accuracy: 100,
        priority: 0,
        effect: {
            special_condition: "浮いている相手を地面に落とす"
        }
    },
    {
        name: "ステルスロック",
        type: "いわ",
        power: null,
        category: "変化",
        accuracy: null,
        priority: 0,
        effect: {
            field_effect: "相手の場に岩の罠を設置"
        }
    },

    // --- あく ---
    {
        name: "ふいうち",
        type: "あく",
        power: 70,
        category: "物理",
        accuracy: 100,
        priority: 1, // 先制技
        effect: {
            special_condition: "相手が攻撃技を選択していないと失敗"
        }
    },
    {
        name: "あくのはどう",
        type: "あく",
        power: 80,
        category: "特殊",
        accuracy: 100,
        priority: 0,
        effect: {
            flinch: 20
        }
    },
    {
        name: "すりかえ",
        type: "あく",
        power: null,
        category: "変化",
        accuracy: 100,
        priority: 0,
        effect: {
            special_condition: "自分と相手の持ち物を入れ替える"
        }
    },
    {
        name: "ちょうはつ",
        type: "あく",
        power: null,
        category: "変化",
        accuracy: 100,
        priority: 0,
        effect: {
            special_condition: "3ターン相手は変化技を出せない"
        }
    },
    {
        name: "わるだくみ",
        type: "あく",
        power: null,
        category: "変化",
        accuracy: null,
        priority: 0,
        effect: {
            stat_change: [{ target: "self", stat: "spa", stage: 2, chance: 100 }]
        }
    },
    {
        name: "かみくだく",
        type: "あく",
        power: 80,
        category: "物理",
        accuracy: 100,
        priority: 0,
        effect: {
            stat_change: [{ target: "opponent", stat: "def", stage: -1, chance: 20 }]
        }
    },

    // --- フェアリー ---
    {
        name: "じゃれつく",
        type: "フェアリー",
        power: 90,
        category: "物理",
        accuracy: 90,
        priority: 0,
        effect: {
            stat_change: [{ target: "opponent", stat: "atk", stage: -1, chance: 10 }]
        }
    },
    {
        name: "ドレインキッス",
        type: "フェアリー",
        power: 50,
        category: "特殊",
        accuracy: 100,
        priority: 0,
        effect: {
            recovery: "75_of_damage" // 与ダメージの75回復
        }
    },
    {
        name: "マジカルシャイン",
        type: "フェアリー",
        power: 80,
        category: "特殊",
        accuracy: 100,
        priority: 0,
        effect: {}
    },
    {
        name: "ムーンフォース",
        type: "フェアリー",
        power: 95,
        category: "特殊",
        accuracy: 100,
        priority: 0,
        effect: {
            stat_change: [{ target: "opponent", stat: "spa", stage: -1, chance: 30 }]
        }
    },

    // --- ドラゴン ---
    {
        name: "りゅうせいぐん",
        type: "ドラゴン",
        power: 130,
        category: "特殊",
        accuracy: 90,
        priority: 0,
        effect: {
            stat_change: [{ target: "self", stat: "spa", stage: -2, chance: 100 }]
        }
    },
    {
        name: "ドラゴンクロー",
        type: "ドラゴン",
        power: 80,
        category: "物理",
        accuracy: 100,
        priority: 0,
        effect: {}
    },
    {
        name: "りゅうのはどう",
        type: "ドラゴン",
        power: 85,
        category: "特殊",
        accuracy: 100,
        priority: 0,
        effect: {}
    },
    {
        name: "ドラゴンダイブ",
        type: "ドラゴン",
        power: 100,
        category: "物理",
        accuracy: 75,
        priority: 0,
        effect: {
            flinch: 20
        }
    },
    {
        name: "りゅうのまい",
        type: "ドラゴン",
        power: null,
        category: "変化",
        accuracy: null,
        priority: 0,
        effect: {
            stat_change: [
                { target: "self", stat: "atk", stage: 1, chance: 100 },
                { target: "self", stat: "spe", stage: 1, chance: 100 }
            ]
        }
    },
    {
        name: "げきりん",
        type: "ドラゴン",
        power: 120,
        category: "物理",
        accuracy: 100,
        priority: 0,
        effect: {
            special_condition: "2-3ターン暴れた後、混乱する"
        }
    },

    // --- ほのお ---
    {
        name: "かえんほうしゃ",
        type: "ほのお",
        power: 90,
        category: "特殊",
        accuracy: 100,
        priority: 0,
        effect: {
            status_ailment: { name: "burn", chance: 10 }
        }
    },
    {
        name: "にほんばれ",
        type: "ほのお",
        power: null,
        category: "変化",
        accuracy: null,
        priority: 0,
        effect: {
            field_effect: "5ターン天候を晴れにする"
        }
    },
    {
        name: "だいもんじ",
        type: "ほのお",
        power: 110,
        category: "特殊",
        accuracy: 85,
        priority: 0,
        effect: {
            status_ailment: { name: "burn", chance: 10 }
        }
    },
    {
        name: "フレアドライブ",
        type: "ほのお",
        power: 120,
        category: "物理",
        accuracy: 100,
        priority: 0,
        effect: {
            recoil: "33",
            status_ailment: { name: "burn", chance: 10 }
        }
    },
    {
        name: "ニトロチャージ",
        type: "ほのお",
        power: 50,
        category: "物理",
        accuracy: 100,
        priority: 0,
        effect: {
            stat_change: [{ target: "self", stat: "spe", stage: 1, chance: 100 }]
        }
    },

    // --- はがね ---
    {
        name: "アイアンテール",
        type: "はがね",
        power: 100,
        category: "物理",
        accuracy: 75,
        priority: 0,
        effect: {
            stat_change: [{ target: "opponent", stat: "def", stage: -1, chance: 30 }]
        }
    },
    {
        name: "ヘビーボンバー",
        type: "はがね",
        power: "Variable", // 体重差依存
        category: "物理",
        accuracy: 100,
        priority: 0,
        effect: {}
    },
    {
        name: "ジャイロボール",
        type: "はがね",
        power: "Variable", // 素早さ差依存
        category: "物理",
        accuracy: 100,
        priority: 0,
        effect: {}
    },
    {
        name: "アイアンヘッド",
        type: "はがね",
        power: 80,
        category: "物理",
        accuracy: 100,
        priority: 0,
        effect: {
            flinch: 30
        }
    },
    {
        name: "きんぞくおん",
        type: "はがね",
        power: null,
        category: "変化",
        accuracy: 85,
        priority: 0,
        effect: {
            stat_change: [{ target: "opponent", stat: "spd", stage: -2, chance: 100 }]
        }
    },

    // --- ゴースト ---
    {
        name: "シャドーボール",
        type: "ゴースト",
        power: 80,
        category: "特殊",
        accuracy: 100,
        priority: 0,
        effect: {
            stat_change: [{ target: "opponent", stat: "spd", stage: -1, chance: 20 }]
        }
    },
    {
        name: "のろい",
        type: "ゴースト",
        power: null,
        category: "変化",
        accuracy: null,
        priority: 0,
        effect: {
            special_condition: "ゴースト:HP半分削り呪い付与, その他:素早さ↓攻撃↑"
        }
    },
    {
        name: "シャドークロー",
        type: "ゴースト",
        power: 70,
        category: "物理",
        accuracy: 100,
        priority: 0,
        effect: {
            crit_rate: 1
        }
    },
    {
        name: "ゴーストダイブ",
        type: "ゴースト",
        power: 90,
        category: "物理",
        accuracy: 100,
        priority: 0,
        flags: {
            breaks_protect: true // まもる貫通
        },
        effect: {
            semi_invulnerable: "ghost_dive" // 1ターン目消える、2ターン目攻撃
        }
    },
    {
        name: "あやしいひかり",
        type: "ゴースト",
        power: null,
        category: "変化",
        accuracy: 100,
        priority: 0,
        effect: {
            status_ailment: { name: "confusion", chance: 100 }
        }
    },

    // --- こおり ---
    {
        name: "れいとうビーム",
        type: "こおり",
        power: 90,
        category: "特殊",
        accuracy: 100,
        priority: 0,
        effect: {
            status_ailment: { name: "freeze", chance: 10 }
        }
    },
    {
        name: "ふぶき",
        type: "こおり",
        power: 110,
        category: "特殊",
        accuracy: 70, // 霰/雪で必中
        priority: 0,
        effect: {
            status_ailment: { name: "freeze", chance: 10 }
        }
    },
    {
        name: "つららおとし",
        type: "こおり",
        power: 85,
        category: "物理",
        accuracy: 90,
        priority: 0,
        effect: {
            flinch: 30
        }
    },
    {
        name: "くろいきり",
        type: "こおり",
        power: null,
        category: "変化",
        accuracy: null,
        priority: 0,
        effect: {
            special_condition: "全ポケモンの能力ランクをリセット"
        }
    },

    // --- かくとう ---
    {
        name: "インファイト",
        type: "かくとう",
        power: 120,
        category: "物理",
        accuracy: 100,
        priority: 0,
        effect: {
            stat_change: [
                { target: "self", stat: "def", stage: -1, chance: 100 },
                { target: "self", stat: "spd", stage: -1, chance: 100 }
            ]
        }
    },
    {
        name: "かわらわり",
        type: "かくとう",
        power: 75,
        category: "物理",
        accuracy: 100,
        priority: 0,
        effect: {
            special_condition: "壁（リフレクター等）を破壊"
        }
    },
    {
        name: "はどうだん",
        type: "かくとう",
        power: 80,
        category: "特殊",
        accuracy: Infinity, // 必中
        flags: {
            is_certain_hit: true
        },
        priority: 0,
        effect: {}
    },
    {
        name: "きあいだま",
        type: "かくとう",
        power: 120,
        category: "特殊",
        accuracy: 70,
        priority: 0,
        effect: {
            stat_change: [{ target: "opponent", stat: "spd", stage: -1, chance: 10 }]
        }
    },
    {
        name: "とびひざげり",
        type: "かくとう",
        power: 130,
        category: "物理",
        accuracy: 90,
        priority: 0,
        effect: {
            recoil: "50_of_max_hp_if_miss" // 外すと最大HPの1/2ダメージ
        }
    },
    {
        name: "つるぎのまい",
        type: "かくとう",
        power: null,
        category: "変化",
        accuracy: null,
        priority: 0,
        effect: {
            stat_change: [{ target: "self", stat: "atk", stage: 2, chance: 100 }]
        }
    },
    // --- 追加分 ---
    {
        name: "アシッドボム",
        type: "どく",
        power: 40,
        category: "特殊",
        accuracy: 100,
        priority: 0,
        effect: {
            stat_change: [{ target: "opponent", stat: "spd", stage: -2, chance: 100 }]
        }
    },
    {
        name: "だくりゅう",
        type: "みず",
        power: 90,
        category: "特殊",
        accuracy: 85,
        priority: 0,
        effect: {
            stat_change: [{ target: "opponent", stat: "accuracy", stage: -1, chance: 30 }]
        }
    },
    {
        name: "どろかけ",
        type: "じめん",
        power: 20,
        category: "特殊",
        accuracy: 100,
        priority: 0,
        effect: {
            stat_change: [{ target: "opponent", stat: "accuracy", stage: -1, chance: 100 }]
        }
    },
    {
        name: "アンコール",
        type: "ノーマル",
        power: null,
        category: "変化",
        accuracy: 100,
        priority: 0,
        effect: {
            special_condition: "3ターン同じ技を出させる",
            volatile_status: "encore"
        }
    },
    {
        name: "はらだいこ",
        type: "ノーマル",
        power: null,
        category: "変化",
        accuracy: null,
        priority: 0,
        effect: {
            special_condition: "HP半分削り攻撃最大",
            sets_stat: { stat: "atk", stage: 6 }
        }
    },
    {
        name: "ころがる",
        type: "いわ",
        power: 30,
        category: "物理",
        accuracy: 90,
        priority: 0,
        effect: {
            special_condition: "当たるたびに威力上昇"
        }
    },
    {
        name: "まるくなる",
        type: "ノーマル",
        power: null,
        category: "変化",
        accuracy: null,
        priority: 0,
        effect: {
            stat_change: [{ target: "self", stat: "def", stage: 1, chance: 100 }],
            special_condition: "ころがるの威力2倍"
        }
    },
    {
        name: "おいわい",
        type: "ノーマル",
        power: null,
        category: "変化",
        accuracy: null,
        priority: 0,
        effect: {
            special_condition: "特になし"
        }
    },
    {
        name: "ほおばる",
        type: "ノーマル",
        power: null,
        category: "変化",
        accuracy: null,
        priority: 0,
        effect: {
            special_condition: "きのみを食べて防御ぐぐーんと上昇",
            stat_change: [{ target: "self", stat: "def", stage: 2, chance: 100 }]
        }
    },
    {
        name: "たくわえる",
        type: "ノーマル",
        power: null,
        category: "変化",
        accuracy: null,
        priority: 0,
        effect: {
            stat_change: [
                { target: "self", stat: "def", stage: 1, chance: 100 },
                { target: "self", stat: "spd", stage: 1, chance: 100 }
            ],
            special_condition: "3回まで蓄える"
        }
    },
    {
        name: "のみこむ",
        type: "ノーマル",
        power: null,
        category: "変化",
        accuracy: null,
        priority: 0,
        effect: {
            recovery: "stockpile_dependent"
        }
    },
    {
        name: "とける",
        type: "どく",
        power: null,
        category: "変化",
        accuracy: null,
        priority: 0,
        effect: {
            stat_change: [{ target: "self", stat: "def", stage: 2, chance: 100 }]
        }
    },
    {
        name: "どわすれ",
        type: "エスパー",
        power: null,
        category: "変化",
        accuracy: null,
        priority: 0,
        effect: {
            stat_change: [{ target: "self", stat: "spd", stage: 2, chance: 100 }]
        }
    },
    {
        name: "スピードスワップ",
        type: "エスパー",
        power: null,
        category: "変化",
        accuracy: null,
        priority: 0,
        effect: {
            special_condition: "互いの素早さ実数値を入れ替える"
        }
    },
    {
        name: "こうそくスピン",
        type: "ノーマル",
        power: 50,
        category: "物理",
        accuracy: 100,
        priority: 0,
        effect: {
            stat_change: [{ target: "self", stat: "spe", stage: 1, chance: 100 }],
            special_condition: "設置技を除去"
        }
    },
    {
        name: "はたく",
        type: "ノーマル",
        power: 40,
        category: "物理",
        accuracy: 100,
        priority: 0,
        effect: {}
    },
    {
        name: "したでなめる",
        type: "ゴースト",
        power: 30,
        category: "物理",
        accuracy: 100,
        priority: 0,
        effect: {
            status_ailment: { name: "paralysis", chance: 30 }
        }
    },
    {
        name: "トーチカ",
        type: "どく",
        power: null,
        category: "変化",
        accuracy: null,
        priority: 4,
        effect: {
            shield: true,
            special_condition: "接触した相手を毒にする"
        }
    },
    {
        name: "ゲップ",
        type: "どく",
        power: 120,
        category: "特殊",
        accuracy: 90,
        priority: 0,
        effect: {
            special_condition: "きのみ消費後のみ使用可能"
        }
    },
    {
        name: "ひやみず",
        type: "みず",
        power: 50,
        category: "特殊",
        accuracy: 100,
        priority: 0,
        effect: {
            stat_change: [{ target: "opponent", stat: "atk", stage: -1, chance: 100 }]
        }
    },
    {
        name: "さむいギャグ",
        type: "こおり",
        power: null,
        category: "変化",
        accuracy: null,
        priority: 0,
        effect: {
            weather: "hail", // Snow in gen 9 but hail for now
            switch_self: true
        }
    },
    {
        name: "からげんき",
        type: "ノーマル",
        power: 70,
        category: "物理",
        accuracy: 100,
        priority: 0,
        effect: {
            special_condition: "状態異常で威力2倍"
        }
    },
    {
        name: "なげつける",
        type: "あく",
        power: "Variable",
        category: "物理",
        accuracy: 100,
        priority: 0,
        effect: {
            special_condition: "持ち物を投げる"
        }
    },
    {
        name: "のしかかり",
        type: "ノーマル",
        power: 85,
        category: "物理",
        accuracy: 100,
        priority: 0,
        effect: {
            status_ailment: { name: "paralysis", chance: 30 }
        }
    },
    {
        name: "であいがしら",
        type: "むし",
        power: 90,
        category: "物理",
        accuracy: 100,
        priority: 2,
        effect: {
            special_condition: "出た直後のみ成功"
        }
    },
    {
        name: "とどめばり",
        type: "むし",
        power: 50,
        category: "物理",
        accuracy: 100,
        priority: 0,
        effect: {
            special_condition: "倒すと攻撃3段階上昇",
            on_ko_stat_change: { stat: "atk", stage: 3 }
        }
    },
    {
        name: "アシストパワー",
        type: "エスパー",
        power: 20,
        category: "特殊",
        accuracy: 100,
        priority: 0,
        effect: {
            special_condition: "能力ランク分威力上昇"
        }
    },
    {
        name: "かふんだんご",
        type: "むし",
        power: 90,
        category: "特殊",
        accuracy: 100,
        priority: 0,
        effect: {
            special_condition: "味方は回復、敵は攻撃"
        }
    },
    {
        name: "ワイドブレーカー",
        type: "ドラゴン",
        power: 60,
        category: "物理",
        accuracy: 100,
        priority: 0,
        effect: {
            stat_change: [{ target: "opponent", stat: "atk", stage: -1, chance: 100 }]
        }
    },
    {
        name: "はいすいのじん",
        type: "かくとう",
        power: null,
        category: "変化",
        accuracy: null,
        priority: 0,
        effect: {
            stat_change: [
                { target: "self", stat: "atk", stage: 1, chance: 100 },
                { target: "self", stat: "def", stage: 1, chance: 100 },
                { target: "self", stat: "spa", stage: 1, chance: 100 },
                { target: "self", stat: "spd", stage: 1, chance: 100 },
                { target: "self", stat: "spe", stage: 1, chance: 100 }
            ],
            special_condition: "交代不可"
        }
    },
    {
        name: "てっぺき",
        type: "はがね",
        power: null,
        category: "変化",
        accuracy: null,
        priority: 0,
        effect: {
            stat_change: [{ target: "self", stat: "def", stage: 2, chance: 100 }]
        }
    },
    {
        name: "ねばねばネット",
        type: "むし",
        power: null,
        category: "変化",
        accuracy: null,
        priority: 0,
        effect: {
            field_effect: "交代先の素早さを下げる罠"
        }
    },
    {
        name: "おきみやげ",
        type: "あく",
        power: null,
        category: "変化",
        accuracy: 100,
        priority: 0,
        effect: {
            special_condition: "ひんしになり相手の攻撃特攻ダウン",
            stat_change: [
                { target: "opponent", stat: "atk", stage: -2, chance: 100 },
                { target: "opponent", stat: "spa", stage: -2, chance: 100 }
            ],
            self_ko: true
        }
    },
    {
        name: "すてぜりふ",
        type: "あく",
        power: null,
        category: "変化",
        accuracy: 100,
        priority: 0,
        effect: {
            switch_self: true,
            stat_change: [
                { target: "opponent", stat: "atk", stage: -1, chance: 100 },
                { target: "opponent", stat: "spa", stage: -1, chance: 100 }
            ]
        }
    },
    {
        name: "トリック",
        type: "エスパー",
        power: null,
        category: "変化",
        accuracy: 100,
        priority: 0,
        effect: {
            special_condition: "自分と相手の持ち物を入れ替える"
        }
    },
    {
        name: "みちづれ",
        type: "ゴースト",
        power: null,
        category: "変化",
        accuracy: null,
        priority: 0,
        effect: {
            special_condition: "攻撃を受けて倒れたら相手も倒す"
        }
    },
    {
        name: "エレキネット",
        type: "でんき",
        power: 55,
        category: "特殊",
        accuracy: 95,
        priority: 0,
        effect: {
            stat_change: [{ target: "opponent", stat: "spe", stage: -1, chance: 100 }]
        }
    },
    {
        name: "はねる",
        type: "ノーマル",
        power: null,
        category: "変化",
        accuracy: null,
        priority: 0,
        effect: {
            special_condition: "何も起こらない"
        }
    },
    {
        name: "エレキフィールド",
        type: "でんき",
        power: null,
        category: "変化",
        accuracy: null,
        priority: 0,
        effect: {
            field_effect: "5ターン電気威力上昇・眠り無効"
        }
    },
    {
        name: "はたきおとす",
        type: "あく",
        power: 65,
        category: "物理",
        accuracy: 100,
        priority: 0,
        effect: {
            special_condition: "持ち物がある相手に威力1.5倍し、持ち物を失わせる"
        }
    },
    {
        name: "ほたるび",
        type: "むし",
        power: null,
        category: "変化",
        accuracy: null,
        priority: 0,
        effect: {
            stat_change: [{ target: "self", stat: "spa", stage: 3, chance: 100 }]
        }
    },
    {
        name: "みをけずる",
        type: "ノーマル",
        power: null,
        category: "変化",
        accuracy: null,
        priority: 0,
        effect: {
            special_condition: "HP半分削り攻撃特攻素早さ2段階上昇",
            stat_change: [
                { target: "self", stat: "atk", stage: 2, chance: 100 },
                { target: "self", stat: "spa", stage: 2, chance: 100 },
                { target: "self", stat: "spe", stage: 2, chance: 100 }
            ]
        }
    },
    {
        name: "おかたづけ",
        type: "ノーマル",
        power: null,
        category: "変化",
        accuracy: null,
        priority: 0,
        effect: {
            stat_change: [
                { target: "self", stat: "atk", stage: 1, chance: 100 },
                { target: "self", stat: "spe", stage: 1, chance: 100 }
            ],
            special_condition: "設置技を除去"
        }
    },
    {
        name: "じたんだ",
        type: "じめん",
        power: 75,
        category: "物理",
        accuracy: 100,
        priority: 0,
        effect: {
            special_condition: "前のターンに技が失敗していると威力2倍"
        }
    },
    {
        name: "ウェーブタックル",
        type: "みず",
        power: 120,
        category: "物理",
        accuracy: 100,
        priority: 0,
        effect: {
            recoil: "33"
        }
    },
    {
        name: "からをやぶる",
        type: "ノーマル",
        power: null,
        category: "変化",
        accuracy: null,
        priority: 0,
        effect: {
            stat_change: [
                { target: "self", stat: "def", stage: -1, chance: 100 },
                { target: "self", stat: "spd", stage: -1, chance: 100 },
                { target: "self", stat: "atk", stage: 2, chance: 100 },
                { target: "self", stat: "spa", stage: 2, chance: 100 },
                { target: "self", stat: "spe", stage: 2, chance: 100 }
            ]
        }
    },
    {
        name: "マッドショット",
        type: "じめん",
        power: 55,
        category: "特殊",
        accuracy: 95,
        priority: 0,
        effect: {
            stat_change: [{ target: "opponent", stat: "spe", stage: -1, chance: 100 }]
        }
    },
    {
        name: "ほっぺすりすり",
        type: "でんき",
        power: 20,
        category: "物理",
        accuracy: 100,
        priority: 0,
        effect: {
            status_ailment: { name: "paralysis", chance: 100 }
        }
    },
    {
        name: "ねっとう",
        type: "みず",
        power: 80,
        category: "特殊",
        accuracy: 100,
        priority: 0,
        effect: {
            status_ailment: { name: "burn", chance: 30 }
        }
    },
    {
        name: "あまごい",
        type: "みず",
        power: null,
        category: "変化",
        accuracy: null,
        priority: 0,
        effect: {
            weather: "rain"
        }
    }
];
