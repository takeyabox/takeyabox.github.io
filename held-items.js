/**
 * Held Items Database
 * Basic held items that provide various battle benefits
 */

const heldItems = [
    {
        id: "none",
        name: "なし",
        description: "持ち物なし"
    },
    {
        id: "leftovers",
        name: "たべのこし",
        description: "毎ターン最大HPの1/16回復"
    },
    {
        id: "choice-band",
        name: "こだわりハチマキ",
        description: "攻撃1.5倍、同じ技しか出せない"
    },
    {
        id: "choice-specs",
        name: "こだわりメガネ",
        description: "特攻1.5倍、同じ技しか出せない"
    },
    {
        id: "choice-scarf",
        name: "こだわりスカーフ",
        description: "素早さ1.5倍、同じ技しか出せない"
    },
    {
        id: "life-orb",
        name: "いのちのたま",
        description: "技の威力1.3倍、攻撃時に最大HPの1/10ダメージ"
    },
    {
        id: "focus-sash",
        name: "きあいのタスキ",
        description: "HP満タン時、瀕死になるダメージでHP1で耐える(1回)"
    },
    {
        id: "assault-vest",
        name: "とつげきチョッキ",
        description: "特防1.5倍、変化技が使えない"
    },
    {
        id: "weakness-policy",
        name: "じゃくてんほけん",
        description: "弱点を突かれると攻撃・特攻2段階上昇(1回)"
    },
    {
        id: "expert-belt",
        name: "たつじんのおび",
        description: "効果抜群の技の威力1.2倍"
    },
    {
        id: "rocky-helmet",
        name: "ゴツゴツメット",
        description: "直接攻撃を受けると相手に最大HPの1/6ダメージ"
    },
    {
        id: "black-sludge",
        name: "くろいヘドロ",
        description: "どくタイプは毎ターン最大HPの1/16回復、それ以外は1/8ダメージ"
    },
    {
        id: "mirror-herb",
        name: "ものまねハーブ",
        description: "相手の能力が上がった時、自分も同じだけ能力を上げる(1回)"
    },
    {
        id: "ability-shield",
        name: "とくせいガード",
        description: "相手の技や特性の効果で、自分の特性が無効化・変更されない"
    },
    {
        id: "loaded-dice",
        name: "いかさまダイス",
        description: "連続技が当たりやすくなる(4回以上)"
    },
    {
        id: "sitrus-berry",
        name: "オボンのみ",
        description: "HPが半分以下になった時、最大HPの1/4回復する(1回)"
    },
    {
        id: "wide-lens",
        name: "こうかくレンズ",
        description: "技の命中率が1.1倍になる"
    },
    {
        id: "clear-amulet",
        name: "クリアチャーム",
        description: "相手の技や特性で能力を下げられない"
    },
    {
        id: "covert-cloak",
        name: "おんみつマント",
        description: "相手の技の追加効果を受けない"
    },
    {
        id: "heavy-duty-boots",
        name: "あつぞこブーツ",
        description: "ステルスロック等の設置技の効果を受けない"
    }

];
