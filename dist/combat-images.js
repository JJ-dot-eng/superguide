import { expandedCombatImages } from './combat-images-expanded.js';
// Wiki-rendered anatomy images, served as WebP (quality 90) encodings of the Wiki PNGs whose hashes are recorded in sha256. thumbnailCrop is only the CSS viewing window; the enlarged view shows the full image.
import { predatorHunterAnatomy } from './predator-hunter-images.js';
import { additionalCombatImages } from './enemy-images-additional.js';
export const combatImages = {
  ...additionalCombatImages,
  'predator-hunter': predatorHunterAnatomy,
  ...expandedCombatImages,
  "charger": {
    "head": [
      {
        "src": "./assets/anatomy/charger-head.webp",
        "thumbnail": "./assets/anatomy/charger-head-thumb.webp",
        "title": "Charger Head Front.png",
        "stage": "initial",
        "source": "https://helldivers.wiki.gg/wiki/File:Charger_Head_Front.png",
        "originalUrl": "https://helldivers.wiki.gg/images/Charger_Head_Front.png?c7bf9f",
        "renderedUrl": "https://helldivers.wiki.gg/images/thumb/Charger_Head_Front.png/800px-Charger_Head_Front.png?c7bf9f",
        "thumbnailUrl": "https://helldivers.wiki.gg/images/thumb/Charger_Head_Front.png/320px-Charger_Head_Front.png?c7bf9f",
        "width": 800,
        "height": 533,
        "sha256": "726bee9c8f12288879c93870a6e97d9d0afd6d769217b884a685a36a69f6ba6b",
        "thumbnailSha256": "3336a8f7b5eb76db00ef481345abdc5c113086440fd01b456e0c3a34e7ce0903",
        "retrievedAt": "2026-09-16",
        "thumbnailCrop": [
          66,
          4,
          186,
          124
        ]
      }
    ],
    "butt": [
      {
        "src": "./assets/anatomy/charger-butt.webp",
        "thumbnail": "./assets/anatomy/charger-butt-thumb.webp",
        "title": "Charger Butt Rear.png",
        "stage": "initial",
        "source": "https://helldivers.wiki.gg/wiki/File:Charger_Butt_Rear.png",
        "originalUrl": "https://helldivers.wiki.gg/images/Charger_Butt_Rear.png?4426da",
        "renderedUrl": "https://helldivers.wiki.gg/images/thumb/Charger_Butt_Rear.png/800px-Charger_Butt_Rear.png?4426da",
        "thumbnailUrl": "https://helldivers.wiki.gg/images/thumb/Charger_Butt_Rear.png/320px-Charger_Butt_Rear.png?4426da",
        "width": 800,
        "height": 533,
        "sha256": "798fdc46343d2701e29458074b9e748b14dbf34f3ae73902c973b87204a705c6",
        "thumbnailSha256": "8f1b2f0e09907446bbb9728c381c53ae474d7f1d284ef3de29e9542a302d6ab3",
        "retrievedAt": "2026-09-16",
        "thumbnailCrop": [
          62,
          9,
          198,
          132
        ]
      }
    ],
    "front-leg": [
      {
        "src": "./assets/anatomy/charger-front-leg.webp",
        "thumbnail": "./assets/anatomy/charger-front-leg-thumb.webp",
        "title": "Charger Front Leg Armor Front.png",
        "stage": "initial",
        "source": "https://helldivers.wiki.gg/wiki/File:Charger_Front_Leg_Armor_Front.png",
        "originalUrl": "https://helldivers.wiki.gg/images/Charger_Front_Leg_Armor_Front.png?f1fd93",
        "renderedUrl": "https://helldivers.wiki.gg/images/thumb/Charger_Front_Leg_Armor_Front.png/800px-Charger_Front_Leg_Armor_Front.png?f1fd93",
        "thumbnailUrl": "https://helldivers.wiki.gg/images/thumb/Charger_Front_Leg_Armor_Front.png/320px-Charger_Front_Leg_Armor_Front.png?f1fd93",
        "width": 800,
        "height": 533,
        "sha256": "e4788509eaa251376069e81c19ed58703164e36daf575b234ab657ab01811892",
        "thumbnailSha256": "ce8f7b7ae8ef4c4d7c0391df8a667f43788e706e5601d64ec4c4fc1d25108cca",
        "retrievedAt": "2026-09-16"
      },
      {
        "src": "./assets/anatomy/charger-front-leg-exposed.webp",
        "thumbnail": "./assets/anatomy/charger-front-leg-exposed-thumb.webp",
        "title": "Charger Leg Flesh Front.png",
        "stage": "exposed",
        "source": "https://helldivers.wiki.gg/wiki/File:Charger_Leg_Flesh_Front.png",
        "originalUrl": "https://helldivers.wiki.gg/images/Charger_Leg_Flesh_Front.png?48722b",
        "renderedUrl": "https://helldivers.wiki.gg/images/thumb/Charger_Leg_Flesh_Front.png/800px-Charger_Leg_Flesh_Front.png?48722b",
        "thumbnailUrl": "https://helldivers.wiki.gg/images/thumb/Charger_Leg_Flesh_Front.png/320px-Charger_Leg_Flesh_Front.png?48722b",
        "width": 800,
        "height": 533,
        "sha256": "9b55be70a7f5ccbec2bafbf73846a54f1710f49cbd182d632ae7126e968b44c8",
        "thumbnailSha256": "b10ca63f1fb94b5049e3fb0d80781dd7b96281042115511f9d93d7abfe230c62",
        "retrievedAt": "2026-09-16"
      }
    ]
  },
  "behemoth": {
    "head": [
      {
        "src": "./assets/anatomy/behemoth-head.webp",
        "thumbnail": "./assets/anatomy/behemoth-head-thumb.webp",
        "title": "Charger Behemoth Head Front.png",
        "stage": "initial",
        "source": "https://helldivers.wiki.gg/wiki/File:Charger_Behemoth_Head_Front.png",
        "originalUrl": "https://helldivers.wiki.gg/images/Charger_Behemoth_Head_Front.png?db0bba",
        "renderedUrl": "https://helldivers.wiki.gg/images/thumb/Charger_Behemoth_Head_Front.png/800px-Charger_Behemoth_Head_Front.png?db0bba",
        "thumbnailUrl": "https://helldivers.wiki.gg/images/thumb/Charger_Behemoth_Head_Front.png/320px-Charger_Behemoth_Head_Front.png?db0bba",
        "width": 800,
        "height": 533,
        "sha256": "99f094ed4b448c17a022c63be46fe37d0903bb60cad9f9b5800803b57f677b97",
        "thumbnailSha256": "3defbe78d136a8138587be96fb90afbecf7e280d0ca0081eccef99bc610eca66",
        "retrievedAt": "2026-09-16",
        "thumbnailCrop": [
          64,
          6,
          192,
          128
        ]
      }
    ],
    "butt": [
      {
        "src": "./assets/anatomy/behemoth-butt.webp",
        "thumbnail": "./assets/anatomy/behemoth-butt-thumb.webp",
        "title": "Charger Behemoth Butt Rear.png",
        "stage": "initial",
        "source": "https://helldivers.wiki.gg/wiki/File:Charger_Behemoth_Butt_Rear.png",
        "originalUrl": "https://helldivers.wiki.gg/images/Charger_Behemoth_Butt_Rear.png?1b831d",
        "renderedUrl": "https://helldivers.wiki.gg/images/thumb/Charger_Behemoth_Butt_Rear.png/800px-Charger_Behemoth_Butt_Rear.png?1b831d",
        "thumbnailUrl": "https://helldivers.wiki.gg/images/thumb/Charger_Behemoth_Butt_Rear.png/320px-Charger_Behemoth_Butt_Rear.png?1b831d",
        "width": 800,
        "height": 533,
        "sha256": "02c47d673ec2a5f7add47d1e524166e5d6e9ea96a7b03ab6ba3574777db3c3b9",
        "thumbnailSha256": "7a5c68b35d2d1a4ba14f04d5f0d406e2ddbe8122c863943a62a9bde2ad9ec00e",
        "retrievedAt": "2026-09-16",
        "thumbnailCrop": [
          61,
          4,
          198,
          132
        ]
      }
    ],
    "front-leg": [
      {
        "src": "./assets/anatomy/behemoth-front-leg.webp",
        "thumbnail": "./assets/anatomy/behemoth-front-leg-thumb.webp",
        "title": "Charger Behemoth Front Leg Armor Front.png",
        "stage": "initial",
        "source": "https://helldivers.wiki.gg/wiki/File:Charger_Behemoth_Front_Leg_Armor_Front.png",
        "originalUrl": "https://helldivers.wiki.gg/images/Charger_Behemoth_Front_Leg_Armor_Front.png?855bd6",
        "renderedUrl": "https://helldivers.wiki.gg/images/thumb/Charger_Behemoth_Front_Leg_Armor_Front.png/800px-Charger_Behemoth_Front_Leg_Armor_Front.png?855bd6",
        "thumbnailUrl": "https://helldivers.wiki.gg/images/thumb/Charger_Behemoth_Front_Leg_Armor_Front.png/320px-Charger_Behemoth_Front_Leg_Armor_Front.png?855bd6",
        "width": 800,
        "height": 533,
        "sha256": "d0294871dd44913db1cbafa9d9379d3c37a8c686923d63e35a1df03c60078b07",
        "thumbnailSha256": "84daa1990d4f7a3a52a64bb50567dc5bc8a7c92c2b41cede1050cd363ed84f38",
        "retrievedAt": "2026-09-16"
      },
      {
        "src": "./assets/anatomy/behemoth-front-leg-exposed.webp",
        "thumbnail": "./assets/anatomy/behemoth-front-leg-exposed-thumb.webp",
        "title": "Charger Behemoth Leg Flesh Front.png",
        "stage": "exposed",
        "source": "https://helldivers.wiki.gg/wiki/File:Charger_Behemoth_Leg_Flesh_Front.png",
        "originalUrl": "https://helldivers.wiki.gg/images/Charger_Behemoth_Leg_Flesh_Front.png?576354",
        "renderedUrl": "https://helldivers.wiki.gg/images/thumb/Charger_Behemoth_Leg_Flesh_Front.png/800px-Charger_Behemoth_Leg_Flesh_Front.png?576354",
        "thumbnailUrl": "https://helldivers.wiki.gg/images/thumb/Charger_Behemoth_Leg_Flesh_Front.png/320px-Charger_Behemoth_Leg_Flesh_Front.png?576354",
        "width": 800,
        "height": 533,
        "sha256": "572ec5548a7d917c092e74863e78f1b0368c95aae2f733e13ef04a7740ebf525",
        "thumbnailSha256": "171cde9f7d7570b67a5c92905bad3ab3d5ce59f0b0518daa4b532fbf8d403fd7",
        "retrievedAt": "2026-09-16"
      }
    ]
  },
  "bile-titan": {
    "head": [
      {
        "src": "./assets/anatomy/bile-titan-head.webp",
        "thumbnail": "./assets/anatomy/bile-titan-head-thumb.webp",
        "title": "Bile Titan Head Front.png",
        "stage": "initial",
        "source": "https://helldivers.wiki.gg/wiki/File:Bile_Titan_Head_Front.png",
        "originalUrl": "https://helldivers.wiki.gg/images/Bile_Titan_Head_Front.png?f20fd8",
        "renderedUrl": "https://helldivers.wiki.gg/images/thumb/Bile_Titan_Head_Front.png/800px-Bile_Titan_Head_Front.png?f20fd8",
        "thumbnailUrl": "https://helldivers.wiki.gg/images/thumb/Bile_Titan_Head_Front.png/320px-Bile_Titan_Head_Front.png?f20fd8",
        "width": 800,
        "height": 533,
        "sha256": "2952ec8a897e4a92ced82143e1c59dc1a5989265d8ebde5ceac130594f9e42e0",
        "thumbnailSha256": "52bfb224c7ca2703d2ccbbe6769a9027ca04b649dd68e079e18c3bc1b36ce134",
        "retrievedAt": "2026-09-16",
        "thumbnailCrop": [
          98,
          6,
          132,
          88
        ]
      }
    ],
    "sac": [
      {
        "src": "./assets/anatomy/bile-titan-sac.webp",
        "thumbnail": "./assets/anatomy/bile-titan-sac-thumb.webp",
        "title": "Bile Titan Upper Bile Sac Side.png",
        "stage": "initial",
        "source": "https://helldivers.wiki.gg/wiki/File:Bile_Titan_Upper_Bile_Sac_Side.png",
        "originalUrl": "https://helldivers.wiki.gg/images/Bile_Titan_Upper_Bile_Sac_Side.png?7fd8a8",
        "renderedUrl": "https://helldivers.wiki.gg/images/thumb/Bile_Titan_Upper_Bile_Sac_Side.png/800px-Bile_Titan_Upper_Bile_Sac_Side.png?7fd8a8",
        "thumbnailUrl": "https://helldivers.wiki.gg/images/thumb/Bile_Titan_Upper_Bile_Sac_Side.png/320px-Bile_Titan_Upper_Bile_Sac_Side.png?7fd8a8",
        "width": 800,
        "height": 533,
        "sha256": "741cfd6b607cf2b2f6db9268f1b21badd82b61a0ef7130874591e48fa9e3c662",
        "thumbnailSha256": "75693981a8cba0c6fa02e27e09011e22acc0bf9858701170bb3e138c0fa367b5",
        "retrievedAt": "2026-09-16",
        "thumbnailCrop": [
          101,
          55,
          186,
          124
        ]
      }
    ],
    "underside": [
      {
        "src": "./assets/anatomy/bile-titan-underside.webp",
        "thumbnail": "./assets/anatomy/bile-titan-underside-thumb.webp",
        "title": "Bile Titan Underside Side.png",
        "stage": "initial",
        "source": "https://helldivers.wiki.gg/wiki/File:Bile_Titan_Underside_Side.png",
        "originalUrl": "https://helldivers.wiki.gg/images/Bile_Titan_Underside_Side.png?9aaa4e",
        "renderedUrl": "https://helldivers.wiki.gg/images/thumb/Bile_Titan_Underside_Side.png/800px-Bile_Titan_Underside_Side.png?9aaa4e",
        "thumbnailUrl": "https://helldivers.wiki.gg/images/thumb/Bile_Titan_Underside_Side.png/320px-Bile_Titan_Underside_Side.png?9aaa4e",
        "width": 800,
        "height": 533,
        "sha256": "6661cc623c68ff2db7640e5c866b69878e4480c8eb8a8ed89beb16a1c9ea5956",
        "thumbnailSha256": "93b526aacbb18b9edb97f789cee0bd8ed5b7fdb435896bc9fe8d9d822dc987ee",
        "retrievedAt": "2026-09-16",
        "thumbnailCrop": [
          58,
          46,
          246,
          164
        ]
      }
    ]
  },
  "hulk": {
    "head": [
      {
        "src": "./assets/anatomy/hulk-head.webp",
        "thumbnail": "./assets/anatomy/hulk-head-thumb.webp",
        "title": "Hulk Scorcher Head Front.png",
        "stage": "initial",
        "source": "https://helldivers.wiki.gg/wiki/File:Hulk_Scorcher_Head_Front.png",
        "originalUrl": "https://helldivers.wiki.gg/images/Hulk_Scorcher_Head_Front.png?352b50",
        "renderedUrl": "https://helldivers.wiki.gg/images/thumb/Hulk_Scorcher_Head_Front.png/800px-Hulk_Scorcher_Head_Front.png?352b50",
        "thumbnailUrl": "https://helldivers.wiki.gg/images/thumb/Hulk_Scorcher_Head_Front.png/320px-Hulk_Scorcher_Head_Front.png?352b50",
        "width": 800,
        "height": 533,
        "sha256": "b2fa1f3ee1bbfad92256f8366ff77a5cb7b1a1ac104ff0766df8eab6468eda38",
        "thumbnailSha256": "70c9249017616b4632c973abfc5ede6079ccd4cc39ed293cd03ba45962abed2b",
        "retrievedAt": "2026-09-16",
        "thumbnailCrop": [
          112,
          18,
          96,
          64
        ]
      }
    ],
    "heatsink": [
      {
        "src": "./assets/anatomy/hulk-heatsink.webp",
        "thumbnail": "./assets/anatomy/hulk-heatsink-thumb.webp",
        "title": "Hulk Scorcher Vent Rear.png",
        "stage": "initial",
        "source": "https://helldivers.wiki.gg/wiki/File:Hulk_Scorcher_Vent_Rear.png",
        "originalUrl": "https://helldivers.wiki.gg/images/Hulk_Scorcher_Vent_Rear.png?545a25",
        "renderedUrl": "https://helldivers.wiki.gg/images/thumb/Hulk_Scorcher_Vent_Rear.png/800px-Hulk_Scorcher_Vent_Rear.png?545a25",
        "thumbnailUrl": "https://helldivers.wiki.gg/images/thumb/Hulk_Scorcher_Vent_Rear.png/320px-Hulk_Scorcher_Vent_Rear.png?545a25",
        "width": 800,
        "height": 533,
        "sha256": "d3f674cbeed54940814df1b0372ccf7eb271d8e96be161738b730febed1b6fd9",
        "thumbnailSha256": "c7227d5a7175970c3334213cd019018cabcce2251c3f207c73ff891edc8e8d07",
        "retrievedAt": "2026-09-16",
        "thumbnailCrop": [
          101,
          8,
          120,
          80
        ]
      }
    ]
  },
  "devastator": {
    "head": [
      {
        "src": "./assets/anatomy/devastator-head.webp",
        "thumbnail": "./assets/anatomy/devastator-head-thumb.webp",
        "title": "Devastator Head Front.png",
        "stage": "initial",
        "source": "https://helldivers.wiki.gg/wiki/File:Devastator_Head_Front.png",
        "originalUrl": "https://helldivers.wiki.gg/images/Devastator_Head_Front.png?ec11f9",
        "renderedUrl": "https://helldivers.wiki.gg/images/thumb/Devastator_Head_Front.png/800px-Devastator_Head_Front.png?ec11f9",
        "thumbnailUrl": "https://helldivers.wiki.gg/images/thumb/Devastator_Head_Front.png/320px-Devastator_Head_Front.png?ec11f9",
        "width": 800,
        "height": 533,
        "sha256": "71fd57527947169361b2604c092b6c60b0fe699483a984a1a360397cd1960215",
        "thumbnailSha256": "de66966b5efd62a0bfd83b58d2afb658b9c2e31d1e48f08245600d3354a1a246",
        "retrievedAt": "2026-09-16",
        "thumbnailCrop": [
          119,
          18,
          90,
          60
        ]
      }
    ],
    "stomach": [
      {
        "src": "./assets/anatomy/devastator-stomach.webp",
        "thumbnail": "./assets/anatomy/devastator-stomach-thumb.webp",
        "title": "Devastator Stomach Front.png",
        "stage": "initial",
        "source": "https://helldivers.wiki.gg/wiki/File:Devastator_Stomach_Front.png",
        "originalUrl": "https://helldivers.wiki.gg/images/Devastator_Stomach_Front.png?8025d8",
        "renderedUrl": "https://helldivers.wiki.gg/images/thumb/Devastator_Stomach_Front.png/800px-Devastator_Stomach_Front.png?8025d8",
        "thumbnailUrl": "https://helldivers.wiki.gg/images/thumb/Devastator_Stomach_Front.png/320px-Devastator_Stomach_Front.png?8025d8",
        "width": 800,
        "height": 533,
        "sha256": "a8c0ac9152851f9ad6acb21a2b60cdf74d35da8a778ad6b37e3a45472dfeeee3",
        "thumbnailSha256": "6a6a6bd5a8888efafee12017ef6ff211feb1f27ad878971d284a8f72e152eb4e",
        "retrievedAt": "2026-09-16",
        "thumbnailCrop": [
          113,
          60,
          99,
          66
        ]
      }
    ],
    "torso": [
      {
        "src": "./assets/anatomy/devastator-torso.webp",
        "thumbnail": "./assets/anatomy/devastator-torso-thumb.webp",
        "title": "Devastator Torso Front.png",
        "stage": "initial",
        "source": "https://helldivers.wiki.gg/wiki/File:Devastator_Torso_Front.png",
        "originalUrl": "https://helldivers.wiki.gg/images/Devastator_Torso_Front.png?535346",
        "renderedUrl": "https://helldivers.wiki.gg/images/thumb/Devastator_Torso_Front.png/800px-Devastator_Torso_Front.png?535346",
        "thumbnailUrl": "https://helldivers.wiki.gg/images/thumb/Devastator_Torso_Front.png/320px-Devastator_Torso_Front.png?535346",
        "width": 800,
        "height": 533,
        "sha256": "1730b4a343d7b374755e65be54561ef51ed6790268129d1764df30f94dfa8b81",
        "thumbnailSha256": "a7c247133eb29f7bc663c8bab8b6c87ba7bfe88cde63f0c41600a9293fa9d3fe",
        "retrievedAt": "2026-09-16",
        "thumbnailCrop": [
          92,
          0,
          144,
          96
        ]
      }
    ]
  },
  "berserker": {
    "head": [
      {
        "src": "./assets/anatomy/berserker-head.webp",
        "thumbnail": "./assets/anatomy/berserker-head-thumb.webp",
        "title": "Berserker Head.png",
        "stage": "initial",
        "source": "https://helldivers.wiki.gg/wiki/File:Berserker_Head.png",
        "originalUrl": "https://helldivers.wiki.gg/images/Berserker_Head.png?657edb",
        "renderedUrl": "https://helldivers.wiki.gg/images/thumb/Berserker_Head.png/800px-Berserker_Head.png?657edb",
        "thumbnailUrl": "https://helldivers.wiki.gg/images/thumb/Berserker_Head.png/320px-Berserker_Head.png?657edb",
        "width": 800,
        "height": 533,
        "sha256": "9df30ceb072d9c314b624ded97868994e7e6d3b4b9f9996191f7e7762a4b6ed2",
        "thumbnailSha256": "0ecf296ec783378e8f2b04555a1ff925f7e2fe643ad54ea54a0013ccfb01f1ab",
        "retrievedAt": "2026-09-16",
        "thumbnailCrop": [
          121,
          23,
          81,
          54
        ]
      }
    ],
    "stomach": [
      {
        "src": "./assets/anatomy/berserker-stomach.webp",
        "thumbnail": "./assets/anatomy/berserker-stomach-thumb.webp",
        "title": "Berserker Boss.png",
        "stage": "initial",
        "source": "https://helldivers.wiki.gg/wiki/File:Berserker_Boss.png",
        "originalUrl": "https://helldivers.wiki.gg/images/Berserker_Boss.png?718b2a",
        "renderedUrl": "https://helldivers.wiki.gg/images/thumb/Berserker_Boss.png/800px-Berserker_Boss.png?718b2a",
        "thumbnailUrl": "https://helldivers.wiki.gg/images/thumb/Berserker_Boss.png/320px-Berserker_Boss.png?718b2a",
        "width": 800,
        "height": 533,
        "sha256": "46c58541d29d9b0776c8e0e359241159b769919907ed85cddfb0991d25f36081",
        "thumbnailSha256": "86593009c8e82ac311f2cf7efd9dcf1b69a122c894c2a010ba814d3c023ddd35",
        "retrievedAt": "2026-09-16",
        "thumbnailCrop": [
          111,
          76,
          99,
          66
        ]
      }
    ],
    "chest": [
      {
        "src": "./assets/anatomy/berserker-chest.webp",
        "thumbnail": "./assets/anatomy/berserker-chest-thumb.webp",
        "title": "Berserker Chest.png",
        "stage": "initial",
        "source": "https://helldivers.wiki.gg/wiki/File:Berserker_Chest.png",
        "originalUrl": "https://helldivers.wiki.gg/images/Berserker_Chest.png?82eb32",
        "renderedUrl": "https://helldivers.wiki.gg/images/thumb/Berserker_Chest.png/800px-Berserker_Chest.png?82eb32",
        "thumbnailUrl": "https://helldivers.wiki.gg/images/thumb/Berserker_Chest.png/320px-Berserker_Chest.png?82eb32",
        "width": 800,
        "height": 533,
        "sha256": "882bee087e71eeba421297a929ab0bb4c4cb5ff117285e85685e94907c177e5b",
        "thumbnailSha256": "7685952cd0d119defc0ed275e831dbfd2dec31b06e4220b8672d38359e1d2ba3",
        "retrievedAt": "2026-09-16",
        "thumbnailCrop": [
          105,
          49,
          114,
          76
        ]
      }
    ]
  },
  "overseer": {
    "head": [
      {
        "src": "./assets/anatomy/overseer-head.webp",
        "thumbnail": "./assets/anatomy/overseer-head-thumb.webp",
        "title": "Overseer Head Front.png",
        "stage": "initial",
        "source": "https://helldivers.wiki.gg/wiki/File:Overseer_Head_Front.png",
        "originalUrl": "https://helldivers.wiki.gg/images/Overseer_Head_Front.png?78d69c",
        "renderedUrl": "https://helldivers.wiki.gg/images/thumb/Overseer_Head_Front.png/800px-Overseer_Head_Front.png?78d69c",
        "thumbnailUrl": "https://helldivers.wiki.gg/images/thumb/Overseer_Head_Front.png/320px-Overseer_Head_Front.png?78d69c",
        "width": 800,
        "height": 533,
        "sha256": "f2b66585710e694d8a9ae30935d87fdd30c0c4ce05ccb7afca79d084d1828e57",
        "thumbnailSha256": "c16e3bccd31146057181432a6ee27b47732caa67f1b263fa46d35c7cf2bf20de",
        "retrievedAt": "2026-09-16",
        "thumbnailCrop": [
          119,
          0,
          84,
          56
        ]
      }
    ],
    "chest-armor": [
      {
        "src": "./assets/anatomy/overseer-chest-armor.webp",
        "thumbnail": "./assets/anatomy/overseer-chest-armor-thumb.webp",
        "title": "Overseer Chest Armor Front.png",
        "stage": "initial",
        "source": "https://helldivers.wiki.gg/wiki/File:Overseer_Chest_Armor_Front.png",
        "originalUrl": "https://helldivers.wiki.gg/images/Overseer_Chest_Armor_Front.png?34250a",
        "renderedUrl": "https://helldivers.wiki.gg/images/thumb/Overseer_Chest_Armor_Front.png/800px-Overseer_Chest_Armor_Front.png?34250a",
        "thumbnailUrl": "https://helldivers.wiki.gg/images/thumb/Overseer_Chest_Armor_Front.png/320px-Overseer_Chest_Armor_Front.png?34250a",
        "width": 800,
        "height": 533,
        "sha256": "ee707214e8fc0f5b50a9b77d67c83feb92d05c7497feb4f177fea848278d90d5",
        "thumbnailSha256": "a01c8b975b36c83aa83698c8aef228416bcd1c382e8e77f68f57b71520dbcb49",
        "retrievedAt": "2026-09-16",
        "thumbnailCrop": [
          106,
          14,
          111,
          74
        ]
      },
      {
        "src": "./assets/anatomy/overseer-chest-armor-exposed.webp",
        "thumbnail": "./assets/anatomy/overseer-chest-armor-exposed-thumb.webp",
        "title": "Overseer Half Bare Torso.png",
        "stage": "exposed",
        "source": "https://helldivers.wiki.gg/wiki/File:Overseer_Half_Bare_Torso.png",
        "originalUrl": "https://helldivers.wiki.gg/images/Overseer_Half_Bare_Torso.png?30386f",
        "renderedUrl": "https://helldivers.wiki.gg/images/thumb/Overseer_Half_Bare_Torso.png/800px-Overseer_Half_Bare_Torso.png?30386f",
        "thumbnailUrl": "https://helldivers.wiki.gg/images/thumb/Overseer_Half_Bare_Torso.png/320px-Overseer_Half_Bare_Torso.png?30386f",
        "width": 800,
        "height": 533,
        "sha256": "0b119a915326692df109318c7872bdb00acbe91e68b20651ee8334a2a05cc034",
        "thumbnailSha256": "38cf63bf944c5ec8049df86fc0aeb7fd3e937d5e699c5144b63a377e98531859",
        "retrievedAt": "2026-09-16"
      }
    ]
  },
  "harvester": {
    "joint": [
      {
        "src": "./assets/anatomy/harvester-joint.webp",
        "thumbnail": "./assets/anatomy/harvester-joint-thumb.webp",
        "title": "Harvester Right and Middle Hip Joints Front.png",
        "stage": "initial",
        "source": "https://helldivers.wiki.gg/wiki/File:Harvester_Right_and_Middle_Hip_Joints_Front.png",
        "originalUrl": "https://helldivers.wiki.gg/images/Harvester_Right_and_Middle_Hip_Joints_Front.png?d214a8",
        "renderedUrl": "https://helldivers.wiki.gg/images/thumb/Harvester_Right_and_Middle_Hip_Joints_Front.png/800px-Harvester_Right_and_Middle_Hip_Joints_Front.png?d214a8",
        "thumbnailUrl": "https://helldivers.wiki.gg/images/thumb/Harvester_Right_and_Middle_Hip_Joints_Front.png/320px-Harvester_Right_and_Middle_Hip_Joints_Front.png?d214a8",
        "width": 800,
        "height": 533,
        "sha256": "e42ca401559088773e84cdf192b6b64d1a09ff81b5397b01d1b0be6e1c07d6d4",
        "thumbnailSha256": "494a2356821e3bbcdb90b37569ffcfe7d34c96f6e2b8a1588ed19927e0735ff8",
        "retrievedAt": "2026-09-16",
        "thumbnailCrop": [
          63,
          44,
          123,
          82
        ]
      }
    ],
    "left-joint": [
      {
        "src": "./assets/anatomy/harvester-left-joint.webp",
        "thumbnail": "./assets/anatomy/harvester-left-joint-thumb.webp",
        "title": "Harvester Left Hip Joint Front.png",
        "stage": "initial",
        "source": "https://helldivers.wiki.gg/wiki/File:Harvester_Left_Hip_Joint_Front.png",
        "originalUrl": "https://helldivers.wiki.gg/images/Harvester_Left_Hip_Joint_Front.png?1e549b",
        "renderedUrl": "https://helldivers.wiki.gg/images/thumb/Harvester_Left_Hip_Joint_Front.png/800px-Harvester_Left_Hip_Joint_Front.png?1e549b",
        "thumbnailUrl": "https://helldivers.wiki.gg/images/thumb/Harvester_Left_Hip_Joint_Front.png/320px-Harvester_Left_Hip_Joint_Front.png?1e549b",
        "width": 800,
        "height": 533,
        "sha256": "9cd09a617403ec224fde07748c08d6fbcfdb4d58ca656aa42302bc970e5d53d2",
        "thumbnailSha256": "ef7d9de562b942a8b8b274b7163952d1f9a70dc0ab32c450f3eaae7f8441ea96",
        "retrievedAt": "2026-09-16",
        "thumbnailCrop": [
          153,
          48,
          102,
          68
        ]
      }
    ],
    "eye": [
      {
        "src": "./assets/anatomy/harvester-eye.webp",
        "thumbnail": "./assets/anatomy/harvester-eye-thumb.webp",
        "title": "Harvester Eye.png",
        "stage": "initial",
        "source": "https://helldivers.wiki.gg/wiki/File:Harvester_Eye.png",
        "originalUrl": "https://helldivers.wiki.gg/images/Harvester_Eye.png?8fdcc3",
        "renderedUrl": "https://helldivers.wiki.gg/images/thumb/Harvester_Eye.png/800px-Harvester_Eye.png?8fdcc3",
        "thumbnailUrl": "https://helldivers.wiki.gg/images/thumb/Harvester_Eye.png/320px-Harvester_Eye.png?8fdcc3",
        "width": 800,
        "height": 533,
        "sha256": "3a4bef4372c3b1ed003ee6d612a6c35b3c24824eaa6331abf4d60468ac24569c",
        "thumbnailSha256": "82b29d0df80633ca56ad6eeaac685bd8931ea24e641ac53afa458b6538bd0f2b",
        "retrievedAt": "2026-09-16",
        "thumbnailCrop": [
          128,
          48,
          66,
          44
        ]
      }
    ],
    "generator": [
      {
        "src": "./assets/anatomy/harvester-generator.webp",
        "thumbnail": "./assets/anatomy/harvester-generator-thumb.webp",
        "title": "Harvester Shield Generators Front.png",
        "stage": "initial",
        "source": "https://helldivers.wiki.gg/wiki/File:Harvester_Shield_Generators_Front.png",
        "originalUrl": "https://helldivers.wiki.gg/images/Harvester_Shield_Generators_Front.png?b242bd",
        "renderedUrl": "https://helldivers.wiki.gg/images/thumb/Harvester_Shield_Generators_Front.png/800px-Harvester_Shield_Generators_Front.png?b242bd",
        "thumbnailUrl": "https://helldivers.wiki.gg/images/thumb/Harvester_Shield_Generators_Front.png/320px-Harvester_Shield_Generators_Front.png?b242bd",
        "width": 800,
        "height": 533,
        "sha256": "0b0751c876f5ba557d3bc257fd8e2a1e12649b197a077ecff905360d3dfdc243",
        "thumbnailSha256": "ee2aa51a80a4d4d769741fd644e8752749458e33b93183fbf1e15f2ff628b2f4",
        "retrievedAt": "2026-09-16",
        "thumbnailCrop": [
          67,
          10,
          192,
          128
        ]
      }
    ]
  },
  "hive-guard": {
    "head": [
      {
        "src": "./assets/anatomy/hive-guard-head.webp",
        "thumbnail": "./assets/anatomy/hive-guard-head-thumb.webp",
        "title": "Hive Guard Head Front.png",
        "stage": "initial",
        "source": "https://helldivers.wiki.gg/wiki/File:Hive_Guard_Head_Front.png",
        "originalUrl": "https://helldivers.wiki.gg/images/Hive_Guard_Head_Front.png?3ee291",
        "renderedUrl": "https://helldivers.wiki.gg/images/thumb/Hive_Guard_Head_Front.png/800px-Hive_Guard_Head_Front.png?3ee291",
        "thumbnailUrl": "https://helldivers.wiki.gg/images/thumb/Hive_Guard_Head_Front.png/320px-Hive_Guard_Head_Front.png?3ee291",
        "width": 800,
        "height": 533,
        "sha256": "0f31a21ee1219310216736af78cfb2825f16dbd399b5edafa9ec59d95a759602",
        "thumbnailSha256": "9484ff74dfd0df050d7853a847488a68fc9134dc5c8550449b3dc390cc5bd8dc",
        "retrievedAt": "2026-09-16",
        "thumbnailCrop": [
          58,
          0,
          204,
          136
        ]
      }
    ],
    "claw": [
      {
        "src": "./assets/anatomy/hive-guard-claw.webp",
        "thumbnail": "./assets/anatomy/hive-guard-claw-thumb.webp",
        "title": "Hive Guard Claws Front.png",
        "stage": "initial",
        "source": "https://helldivers.wiki.gg/wiki/File:Hive_Guard_Claws_Front.png",
        "originalUrl": "https://helldivers.wiki.gg/images/Hive_Guard_Claws_Front.png?95ea81",
        "renderedUrl": "https://helldivers.wiki.gg/images/thumb/Hive_Guard_Claws_Front.png/800px-Hive_Guard_Claws_Front.png?95ea81",
        "thumbnailUrl": "https://helldivers.wiki.gg/images/thumb/Hive_Guard_Claws_Front.png/320px-Hive_Guard_Claws_Front.png?95ea81",
        "width": 800,
        "height": 533,
        "sha256": "705d5602df8d0b7a25d23440ac6ecd24c1c67efce41bb5954aa93c774af6c931",
        "thumbnailSha256": "849b5372a67e30269a169aa035669c7dc064967497c3545307691ee7e82d107d",
        "retrievedAt": "2026-09-16",
        "thumbnailCrop": [
          76,
          46,
          167,
          111
        ]
      }
    ],
    "rear-leg": [
      {
        "src": "./assets/anatomy/hive-guard-rear-leg.webp",
        "thumbnail": "./assets/anatomy/hive-guard-rear-leg-thumb.webp",
        "title": "Hive Guard Hind Legs Side.png",
        "stage": "initial",
        "source": "https://helldivers.wiki.gg/wiki/File:Hive_Guard_Hind_Legs_Side.png",
        "originalUrl": "https://helldivers.wiki.gg/images/Hive_Guard_Hind_Legs_Side.png?be62d8",
        "renderedUrl": "https://helldivers.wiki.gg/images/thumb/Hive_Guard_Hind_Legs_Side.png/800px-Hive_Guard_Hind_Legs_Side.png?be62d8",
        "thumbnailUrl": "https://helldivers.wiki.gg/images/thumb/Hive_Guard_Hind_Legs_Side.png/320px-Hive_Guard_Hind_Legs_Side.png?be62d8",
        "width": 800,
        "height": 533,
        "sha256": "11d4e09a63849629da674958b5848c379c3a01647cedc4c0d71fd9faa95b342d",
        "thumbnailSha256": "62be649af21c1fe22815eea0a62ac13d0050e89fd53537ccccf5c49260d78208",
        "retrievedAt": "2026-09-16",
        "thumbnailCrop": [
          17,
          74,
          207,
          138
        ]
      }
    ]
  },
  "brood-commander": {
    "head": [
      {
        "src": "./assets/anatomy/brood-commander-head.webp",
        "thumbnail": "./assets/anatomy/brood-commander-head-thumb.webp",
        "title": "Brood Commander Head Front.png",
        "stage": "initial",
        "source": "https://helldivers.wiki.gg/wiki/File:Brood_Commander_Head_Front.png",
        "originalUrl": "https://helldivers.wiki.gg/images/Brood_Commander_Head_Front.png?35e293",
        "renderedUrl": "https://helldivers.wiki.gg/images/thumb/Brood_Commander_Head_Front.png/800px-Brood_Commander_Head_Front.png?35e293",
        "thumbnailUrl": "https://helldivers.wiki.gg/images/thumb/Brood_Commander_Head_Front.png/320px-Brood_Commander_Head_Front.png?35e293",
        "width": 800,
        "height": 533,
        "sha256": "8b9f5d66fb15e6b7f33a407e2e3e74f58f7fdb04d0365bf1bf96b03ff5b08060",
        "thumbnailSha256": "1939e8edc6b9178f2b27dda3134c3eac84227cdfd45e89c9d953fef0eba51919",
        "retrievedAt": "2026-09-16",
        "thumbnailCrop": [
          79,
          0,
          162,
          108
        ]
      }
    ],
    "claw": [
      {
        "src": "./assets/anatomy/brood-commander-claw.webp",
        "thumbnail": "./assets/anatomy/brood-commander-claw-thumb.webp",
        "title": "Brood Commander Claws Front.png",
        "stage": "initial",
        "source": "https://helldivers.wiki.gg/wiki/File:Brood_Commander_Claws_Front.png",
        "originalUrl": "https://helldivers.wiki.gg/images/Brood_Commander_Claws_Front.png?880fc2",
        "renderedUrl": "https://helldivers.wiki.gg/images/thumb/Brood_Commander_Claws_Front.png/800px-Brood_Commander_Claws_Front.png?880fc2",
        "thumbnailUrl": "https://helldivers.wiki.gg/images/thumb/Brood_Commander_Claws_Front.png/320px-Brood_Commander_Claws_Front.png?880fc2",
        "width": 800,
        "height": 533,
        "sha256": "7c85eddadce10563c1b4a3c9e61b88498e8826f987200b811debe3eb9d107dc8",
        "thumbnailSha256": "fce6d6b9f7617b45ddfcbda0fe6f53895bd8b61d81542d83fd282b9935760c60",
        "retrievedAt": "2026-09-16",
        "thumbnailCrop": [
          68,
          27,
          184,
          123
        ]
      }
    ],
    "leg": [
      {
        "src": "./assets/anatomy/brood-commander-leg.webp",
        "thumbnail": "./assets/anatomy/brood-commander-leg-thumb.webp",
        "title": "Brood Commander Legs Side.png",
        "stage": "initial",
        "source": "https://helldivers.wiki.gg/wiki/File:Brood_Commander_Legs_Side.png",
        "originalUrl": "https://helldivers.wiki.gg/images/Brood_Commander_Legs_Side.png?e83b80",
        "renderedUrl": "https://helldivers.wiki.gg/images/thumb/Brood_Commander_Legs_Side.png/800px-Brood_Commander_Legs_Side.png?e83b80",
        "thumbnailUrl": "https://helldivers.wiki.gg/images/thumb/Brood_Commander_Legs_Side.png/320px-Brood_Commander_Legs_Side.png?e83b80",
        "width": 800,
        "height": 533,
        "sha256": "17e5430d2462203bc4b216008778f12fe4326663e4cf8bb087f06dc10be17882",
        "thumbnailSha256": "e7c41b87b8727d92b364a63142833b8d5f5535e4a861b3029ade724180cdc5b8",
        "retrievedAt": "2026-09-16",
        "thumbnailCrop": [
          41,
          59,
          210,
          140
        ]
      }
    ]
  },
  "nursing-spewer": {
    "head": [
      {
        "src": "./assets/anatomy/nursing-spewer-head.webp",
        "thumbnail": "./assets/anatomy/nursing-spewer-head-thumb.webp",
        "title": "Nursing Spewer Head Front.png",
        "stage": "initial",
        "source": "https://helldivers.wiki.gg/wiki/File:Nursing_Spewer_Head_Front.png",
        "originalUrl": "https://helldivers.wiki.gg/images/Nursing_Spewer_Head_Front.png?55a8e7",
        "renderedUrl": "https://helldivers.wiki.gg/images/thumb/Nursing_Spewer_Head_Front.png/800px-Nursing_Spewer_Head_Front.png?55a8e7",
        "thumbnailUrl": "https://helldivers.wiki.gg/images/thumb/Nursing_Spewer_Head_Front.png/320px-Nursing_Spewer_Head_Front.png?55a8e7",
        "width": 800,
        "height": 533,
        "sha256": "795acf2047355d86c0a043acc3ea5e75e8a2198c728271d88d05a5c2d613df47",
        "thumbnailSha256": "045468b5c799889221dedbb4bded2ebc1cbdf25a458e766bc1f95a981add8da7",
        "retrievedAt": "2026-09-16",
        "thumbnailCrop": [
          92,
          66,
          135,
          90
        ]
      }
    ],
    "mouth": [
      {
        "src": "./assets/anatomy/nursing-spewer-mouth.webp",
        "thumbnail": "./assets/anatomy/nursing-spewer-mouth-thumb.webp",
        "title": "Nursing Spewer Mouth.png",
        "stage": "initial",
        "source": "https://helldivers.wiki.gg/wiki/File:Nursing_Spewer_Mouth.png",
        "originalUrl": "https://helldivers.wiki.gg/images/Nursing_Spewer_Mouth.png?2889b0",
        "renderedUrl": "https://helldivers.wiki.gg/images/thumb/Nursing_Spewer_Mouth.png/800px-Nursing_Spewer_Mouth.png?2889b0",
        "thumbnailUrl": "https://helldivers.wiki.gg/images/thumb/Nursing_Spewer_Mouth.png/320px-Nursing_Spewer_Mouth.png?2889b0",
        "width": 800,
        "height": 533,
        "sha256": "27fe9bffa2a5f5c18145050b7f31fc5cfc4934bd7b4a42eb7197580ce7794892",
        "thumbnailSha256": "1e60f840ad3e02b16d3290e6682ff64f1f26afb452c44446954826712eecb1a1",
        "retrievedAt": "2026-09-16",
        "thumbnailCrop": [
          106,
          102,
          108,
          72
        ]
      }
    ],
    "butt": [
      {
        "src": "./assets/anatomy/nursing-spewer-butt.webp",
        "thumbnail": "./assets/anatomy/nursing-spewer-butt-thumb.webp",
        "title": "Nursing Spewer Butt Rear.png",
        "stage": "initial",
        "source": "https://helldivers.wiki.gg/wiki/File:Nursing_Spewer_Butt_Rear.png",
        "originalUrl": "https://helldivers.wiki.gg/images/Nursing_Spewer_Butt_Rear.png?bc818a",
        "renderedUrl": "https://helldivers.wiki.gg/images/thumb/Nursing_Spewer_Butt_Rear.png/800px-Nursing_Spewer_Butt_Rear.png?bc818a",
        "thumbnailUrl": "https://helldivers.wiki.gg/images/thumb/Nursing_Spewer_Butt_Rear.png/320px-Nursing_Spewer_Butt_Rear.png?bc818a",
        "width": 800,
        "height": 533,
        "sha256": "f91fe4688e709bcd4e64498d0009e696c47ba651fd9b9731f7455754cfe6edb7",
        "thumbnailSha256": "82b774b4757ffd5c0809a6b921b5bc92a13c748043f5dddbead710925c7cb3d7",
        "retrievedAt": "2026-09-16",
        "thumbnailCrop": [
          41,
          31,
          239,
          159
        ]
      }
    ]
  },
  "stalker": {
    "head": [
      {
        "src": "./assets/anatomy/stalker-head.webp",
        "thumbnail": "./assets/anatomy/stalker-head-thumb.webp",
        "title": "Stalker Head Front.png",
        "stage": "initial",
        "source": "https://helldivers.wiki.gg/wiki/File:Stalker_Head_Front.png",
        "originalUrl": "https://helldivers.wiki.gg/images/Stalker_Head_Front.png?9233d9",
        "renderedUrl": "https://helldivers.wiki.gg/images/thumb/Stalker_Head_Front.png/800px-Stalker_Head_Front.png?9233d9",
        "thumbnailUrl": "https://helldivers.wiki.gg/images/thumb/Stalker_Head_Front.png/320px-Stalker_Head_Front.png?9233d9",
        "width": 800,
        "height": 533,
        "sha256": "73d65f0ce3c2a6a86808fca41cec0e6759df5704e19a183d163f5893f2026d43",
        "thumbnailSha256": "96412b7987ba88b7dc66a9824177ea4555a298bc1214e4565f61fd6443f212f5",
        "retrievedAt": "2026-09-16",
        "thumbnailCrop": [
          99,
          30,
          122,
          81
        ]
      }
    ],
    "body-armor": [
      {
        "src": "./assets/anatomy/stalker-body-armor.webp",
        "thumbnail": "./assets/anatomy/stalker-body-armor-thumb.webp",
        "title": "Stalker Body Armor Rear.png",
        "stage": "initial",
        "source": "https://helldivers.wiki.gg/wiki/File:Stalker_Body_Armor_Rear.png",
        "originalUrl": "https://helldivers.wiki.gg/images/Stalker_Body_Armor_Rear.png?1bfa5f",
        "renderedUrl": "https://helldivers.wiki.gg/images/thumb/Stalker_Body_Armor_Rear.png/800px-Stalker_Body_Armor_Rear.png?1bfa5f",
        "thumbnailUrl": "https://helldivers.wiki.gg/images/thumb/Stalker_Body_Armor_Rear.png/320px-Stalker_Body_Armor_Rear.png?1bfa5f",
        "width": 800,
        "height": 533,
        "sha256": "e6b6b4a30fae201d9ac8ab30a367a3adf3b0cf4708beb133d336fa78b4b3da5d",
        "thumbnailSha256": "1f9bcd7771f83ab25fde68e4bc8f45bed199fe4e6fb1ed3a5c435b5bb259f404",
        "retrievedAt": "2026-09-16",
        "thumbnailCrop": [
          64,
          13,
          191,
          127
        ]
      }
    ],
    "underbelly": [
      {
        "src": "./assets/anatomy/stalker-underbelly.webp",
        "thumbnail": "./assets/anatomy/stalker-underbelly-thumb.webp",
        "title": "Stalker Belly Side.png",
        "stage": "initial",
        "source": "https://helldivers.wiki.gg/wiki/File:Stalker_Belly_Side.png",
        "originalUrl": "https://helldivers.wiki.gg/images/Stalker_Belly_Side.png?91a9b7",
        "renderedUrl": "https://helldivers.wiki.gg/images/thumb/Stalker_Belly_Side.png/800px-Stalker_Belly_Side.png?91a9b7",
        "thumbnailUrl": "https://helldivers.wiki.gg/images/thumb/Stalker_Belly_Side.png/320px-Stalker_Belly_Side.png?91a9b7",
        "width": 800,
        "height": 533,
        "sha256": "c736a9047b348db41d2acfb76bbef758750f20853a3269f9f3b793f8044ffe7d",
        "thumbnailSha256": "3d085af44f9285ac40ac7119b2c3d291ae961625c34d0649fae7f0bf52d20b62",
        "retrievedAt": "2026-09-16",
        "thumbnailCrop": [
          79,
          38,
          185,
          123
        ]
      }
    ]
  },
  "impaler": {
    "head": [
      {
        "src": "./assets/anatomy/impaler-head.webp",
        "thumbnail": "./assets/anatomy/impaler-head-thumb.webp",
        "title": "Impaler Head Front.png",
        "stage": "initial",
        "source": "https://helldivers.wiki.gg/wiki/File:Impaler_Head_Front.png",
        "originalUrl": "https://helldivers.wiki.gg/images/Impaler_Head_Front.png?76ebc3",
        "renderedUrl": "https://helldivers.wiki.gg/images/thumb/Impaler_Head_Front.png/800px-Impaler_Head_Front.png?76ebc3",
        "thumbnailUrl": "https://helldivers.wiki.gg/images/thumb/Impaler_Head_Front.png/320px-Impaler_Head_Front.png?76ebc3",
        "width": 800,
        "height": 533,
        "sha256": "cb0dc129d27f14b4c6aff1699ffe5de56de052c0e655c4de9c55140973dab8a4",
        "thumbnailSha256": "3d888ed524041d5efbca4566af135027aeae03524f2700b797b6b82daf85fa39",
        "retrievedAt": "2026-09-16",
        "thumbnailCrop": [
          89,
          62,
          144,
          96
        ]
      }
    ],
    "leg-armor": [
      {
        "src": "./assets/anatomy/impaler-leg-armor.webp",
        "thumbnail": "./assets/anatomy/impaler-leg-armor-thumb.webp",
        "title": "Impaler Leg Armor Front.png",
        "stage": "initial",
        "source": "https://helldivers.wiki.gg/wiki/File:Impaler_Leg_Armor_Front.png",
        "originalUrl": "https://helldivers.wiki.gg/images/Impaler_Leg_Armor_Front.png?7208d4",
        "renderedUrl": "https://helldivers.wiki.gg/images/thumb/Impaler_Leg_Armor_Front.png/800px-Impaler_Leg_Armor_Front.png?7208d4",
        "thumbnailUrl": "https://helldivers.wiki.gg/images/thumb/Impaler_Leg_Armor_Front.png/320px-Impaler_Leg_Armor_Front.png?7208d4",
        "width": 800,
        "height": 533,
        "sha256": "34ff09bd9330e6497d1a8296de24d9716cbf79603c690b7d88a44ad0a18429ba",
        "thumbnailSha256": "a6a024173129ff117717b7077efe7312809c963420beb9625f2497fd9c234fc5",
        "retrievedAt": "2026-09-16",
        "thumbnailCrop": [
          31,
          42,
          257,
          171
        ]
      },
      {
        "src": "./assets/anatomy/impaler-leg-armor-exposed.webp",
        "thumbnail": "./assets/anatomy/impaler-leg-armor-exposed-thumb.webp",
        "title": "Impaler Leg Flesh Front.png",
        "stage": "exposed",
        "source": "https://helldivers.wiki.gg/wiki/File:Impaler_Leg_Flesh_Front.png",
        "originalUrl": "https://helldivers.wiki.gg/images/Impaler_Leg_Flesh_Front.png?319484",
        "renderedUrl": "https://helldivers.wiki.gg/images/thumb/Impaler_Leg_Flesh_Front.png/800px-Impaler_Leg_Flesh_Front.png?319484",
        "thumbnailUrl": "https://helldivers.wiki.gg/images/thumb/Impaler_Leg_Flesh_Front.png/320px-Impaler_Leg_Flesh_Front.png?319484",
        "width": 800,
        "height": 533,
        "sha256": "03842208c683474d85580f40adb3777d4ba5b5ac949a58d2172769d2481bd736",
        "thumbnailSha256": "10ee4923585ae55554988ed38ffad2381b3ea81282acaecbb7def8493e8596cf",
        "retrievedAt": "2026-09-16",
        "thumbnailCrop": [
          30,
          40,
          259,
          173
        ]
      }
    ],
    "tentacle": [
      {
        "src": "./assets/anatomy/impaler-tentacle.webp",
        "thumbnail": "./assets/anatomy/impaler-tentacle-thumb.webp",
        "title": "Impaler Tentacles Front.png",
        "stage": "initial",
        "source": "https://helldivers.wiki.gg/wiki/File:Impaler_Tentacles_Front.png",
        "originalUrl": "https://helldivers.wiki.gg/images/Impaler_Tentacles_Front.png?8e0398",
        "renderedUrl": "https://helldivers.wiki.gg/images/thumb/Impaler_Tentacles_Front.png/800px-Impaler_Tentacles_Front.png?8e0398",
        "thumbnailUrl": "https://helldivers.wiki.gg/images/thumb/Impaler_Tentacles_Front.png/320px-Impaler_Tentacles_Front.png?8e0398",
        "width": 800,
        "height": 533,
        "sha256": "920e0b5e016a0afe3e0ec56c965b348d204af1f14842b647f6a38fa92e37d276",
        "thumbnailSha256": "1a267830705426d98aafcb2f5ec24b5138ebc61291af54161fa2a2cd4589c321",
        "retrievedAt": "2026-09-16",
        "thumbnailCrop": [
          52,
          70,
          215,
          143
        ]
      }
    ]
  },
  "shrieker": {
    "head": [
      {
        "src": "./assets/anatomy/shrieker-head.webp",
        "thumbnail": "./assets/anatomy/shrieker-head-thumb.webp",
        "title": "Shrieker Head Front.png",
        "stage": "initial",
        "source": "https://helldivers.wiki.gg/wiki/File:Shrieker_Head_Front.png",
        "originalUrl": "https://helldivers.wiki.gg/images/Shrieker_Head_Front.png?5614eb",
        "renderedUrl": "https://helldivers.wiki.gg/images/thumb/Shrieker_Head_Front.png/800px-Shrieker_Head_Front.png?5614eb",
        "thumbnailUrl": "https://helldivers.wiki.gg/images/thumb/Shrieker_Head_Front.png/320px-Shrieker_Head_Front.png?5614eb",
        "width": 800,
        "height": 533,
        "sha256": "c1c521ad77a3bf85360eb9463abf75aa4c7077ec95e92d0ec3f5343700a8467d",
        "thumbnailSha256": "1276351281280eb6a8c8ea957560f2332ffe0f89adf01e456f24fb49d6396835",
        "retrievedAt": "2026-09-16",
        "thumbnailCrop": [
          106,
          38,
          108,
          72
        ]
      }
    ],
    "wing": [
      {
        "src": "./assets/anatomy/shrieker-wing.webp",
        "thumbnail": "./assets/anatomy/shrieker-wing-thumb.webp",
        "title": "Shrieker Wings Side.png",
        "stage": "initial",
        "source": "https://helldivers.wiki.gg/wiki/File:Shrieker_Wings_Side.png",
        "originalUrl": "https://helldivers.wiki.gg/images/Shrieker_Wings_Side.png?c605fa",
        "renderedUrl": "https://helldivers.wiki.gg/images/thumb/Shrieker_Wings_Side.png/800px-Shrieker_Wings_Side.png?c605fa",
        "thumbnailUrl": "https://helldivers.wiki.gg/images/thumb/Shrieker_Wings_Side.png/320px-Shrieker_Wings_Side.png?c605fa",
        "width": 800,
        "height": 533,
        "sha256": "f822195842543a9827819255a447c42358a46792f9a5e4698f96093066b8443a",
        "thumbnailSha256": "e8970c7be9a135d002192d2c5e7a587f15fe7442925d9d6e90d8fb800143e65d",
        "retrievedAt": "2026-09-16",
        "thumbnailCrop": [
          92,
          0,
          210,
          140
        ]
      }
    ]
  },
  "rocket-devastator": {
    "head": [
      {
        "src": "./assets/anatomy/rocket-devastator-head.webp",
        "thumbnail": "./assets/anatomy/rocket-devastator-head-thumb.webp",
        "title": "Rocket Devastator Head Front.png",
        "stage": "initial",
        "source": "https://helldivers.wiki.gg/wiki/File:Rocket_Devastator_Head_Front.png",
        "originalUrl": "https://helldivers.wiki.gg/images/Rocket_Devastator_Head_Front.png?504daf",
        "renderedUrl": "https://helldivers.wiki.gg/images/thumb/Rocket_Devastator_Head_Front.png/800px-Rocket_Devastator_Head_Front.png?504daf",
        "thumbnailUrl": "https://helldivers.wiki.gg/images/thumb/Rocket_Devastator_Head_Front.png/320px-Rocket_Devastator_Head_Front.png?504daf",
        "width": 800,
        "height": 533,
        "sha256": "3ee7344fb0ad4964affbe687b432b27600bbf9bd3e5734290fc60645e1dbe62e",
        "thumbnailSha256": "d0e78d29aa6c793e3fbfafe5c1e59378d0e777089316e53de87403dbad6cbd81",
        "retrievedAt": "2026-09-16",
        "thumbnailCrop": [
          103,
          17,
          108,
          72
        ]
      }
    ],
    "stomach": [
      {
        "src": "./assets/anatomy/rocket-devastator-stomach.webp",
        "thumbnail": "./assets/anatomy/rocket-devastator-stomach-thumb.webp",
        "title": "Rocket Devastator Stomach Front.png",
        "stage": "initial",
        "source": "https://helldivers.wiki.gg/wiki/File:Rocket_Devastator_Stomach_Front.png",
        "originalUrl": "https://helldivers.wiki.gg/images/Rocket_Devastator_Stomach_Front.png?be49b0",
        "renderedUrl": "https://helldivers.wiki.gg/images/thumb/Rocket_Devastator_Stomach_Front.png/800px-Rocket_Devastator_Stomach_Front.png?be49b0",
        "thumbnailUrl": "https://helldivers.wiki.gg/images/thumb/Rocket_Devastator_Stomach_Front.png/320px-Rocket_Devastator_Stomach_Front.png?be49b0",
        "width": 800,
        "height": 533,
        "sha256": "efab49a669265846cb4ac7b908deab5f0beec67b291bbe29053f3e6bbbcbda0b",
        "thumbnailSha256": "74b7f64742d28524022321ff861a7236df5fd71b43a97e741e08e3614556e430",
        "retrievedAt": "2026-09-16",
        "thumbnailCrop": [
          104,
          61,
          108,
          72
        ]
      }
    ],
    "rocket-pod": [
      {
        "src": "./assets/anatomy/rocket-devastator-rocket-pod.webp",
        "thumbnail": "./assets/anatomy/rocket-devastator-rocket-pod-thumb.webp",
        "title": "Rocket Devastator Rocket Pods Rear.png",
        "stage": "initial",
        "source": "https://helldivers.wiki.gg/wiki/File:Rocket_Devastator_Rocket_Pods_Rear.png",
        "originalUrl": "https://helldivers.wiki.gg/images/Rocket_Devastator_Rocket_Pods_Rear.png?db2c1e",
        "renderedUrl": "https://helldivers.wiki.gg/images/thumb/Rocket_Devastator_Rocket_Pods_Rear.png/800px-Rocket_Devastator_Rocket_Pods_Rear.png?db2c1e",
        "thumbnailUrl": "https://helldivers.wiki.gg/images/thumb/Rocket_Devastator_Rocket_Pods_Rear.png/320px-Rocket_Devastator_Rocket_Pods_Rear.png?db2c1e",
        "width": 800,
        "height": 533,
        "sha256": "b5e639b291fffa0880c210f944cc6b979588c5210c5633efee719eedab512744",
        "thumbnailSha256": "01c19e15a931e6e8449798a85f458bfb3ad06cf7146b2330731c01ded84d99cf",
        "retrievedAt": "2026-09-16",
        "thumbnailCrop": [
          59,
          0,
          198,
          132
        ]
      }
    ]
  },
  "heavy-devastator": {
    "head": [
      {
        "src": "./assets/anatomy/heavy-devastator-head.webp",
        "thumbnail": "./assets/anatomy/heavy-devastator-head-thumb.webp",
        "title": "Heavy Devastator Head Front.png",
        "stage": "initial",
        "source": "https://helldivers.wiki.gg/wiki/File:Heavy_Devastator_Head_Front.png",
        "originalUrl": "https://helldivers.wiki.gg/images/Heavy_Devastator_Head_Front.png?5d171b",
        "renderedUrl": "https://helldivers.wiki.gg/images/thumb/Heavy_Devastator_Head_Front.png/800px-Heavy_Devastator_Head_Front.png?5d171b",
        "thumbnailUrl": "https://helldivers.wiki.gg/images/thumb/Heavy_Devastator_Head_Front.png/320px-Heavy_Devastator_Head_Front.png?5d171b",
        "width": 800,
        "height": 533,
        "sha256": "f5c98d6cd85e985f06bee4039969b25e4b337048b8c3eb472c2d5eb91549a085",
        "thumbnailSha256": "307fa8b4e73ea40f10ff2aaad644eaac8de43c2e4c737efe73f673387c5f9de3",
        "retrievedAt": "2026-09-16",
        "thumbnailCrop": [
          108,
          7,
          108,
          72
        ]
      }
    ],
    "stomach": [
      {
        "src": "./assets/anatomy/heavy-devastator-stomach.webp",
        "thumbnail": "./assets/anatomy/heavy-devastator-stomach-thumb.webp",
        "title": "Heavy Devastator Stomach Front.png",
        "stage": "initial",
        "source": "https://helldivers.wiki.gg/wiki/File:Heavy_Devastator_Stomach_Front.png",
        "originalUrl": "https://helldivers.wiki.gg/images/Heavy_Devastator_Stomach_Front.png?488393",
        "renderedUrl": "https://helldivers.wiki.gg/images/thumb/Heavy_Devastator_Stomach_Front.png/800px-Heavy_Devastator_Stomach_Front.png?488393",
        "thumbnailUrl": "https://helldivers.wiki.gg/images/thumb/Heavy_Devastator_Stomach_Front.png/320px-Heavy_Devastator_Stomach_Front.png?488393",
        "width": 800,
        "height": 533,
        "sha256": "38a566d11ba1ea60985edf2c99cf2b0b72785616671efdc4db0e56f58c9e8ab3",
        "thumbnailSha256": "1b226e915f629c874a0b10b92c47281230fcc827ac32b2bffe81d23acb99f32b",
        "retrievedAt": "2026-09-16",
        "thumbnailCrop": [
          109,
          55,
          108,
          72
        ]
      }
    ],
    "backpack": [
      {
        "src": "./assets/anatomy/heavy-devastator-backpack.webp",
        "thumbnail": "./assets/anatomy/heavy-devastator-backpack-thumb.webp",
        "title": "Heavy Devastator Backpack Rear.png",
        "stage": "initial",
        "source": "https://helldivers.wiki.gg/wiki/File:Heavy_Devastator_Backpack_Rear.png",
        "originalUrl": "https://helldivers.wiki.gg/images/Heavy_Devastator_Backpack_Rear.png?923607",
        "renderedUrl": "https://helldivers.wiki.gg/images/thumb/Heavy_Devastator_Backpack_Rear.png/800px-Heavy_Devastator_Backpack_Rear.png?923607",
        "thumbnailUrl": "https://helldivers.wiki.gg/images/thumb/Heavy_Devastator_Backpack_Rear.png/320px-Heavy_Devastator_Backpack_Rear.png?923607",
        "width": 800,
        "height": 533,
        "sha256": "7073cdc49615e5728cee0fe7f526d117e9ead0b9ecc62b72b9afaef1eee537b9",
        "thumbnailSha256": "2cdb416918b9e55c6ee36cba97b2343a8312bf3fedb0402c51f7cfce8fdd78a8",
        "retrievedAt": "2026-09-16",
        "thumbnailCrop": [
          73,
          0,
          182,
          121
        ]
      }
    ]
  },
  "scout-strider": {
    "pilot-head": [
      {
        "src": "./assets/anatomy/scout-strider-pilot-head.webp",
        "thumbnail": "./assets/anatomy/scout-strider-pilot-head-thumb.webp",
        "title": "Trooper Head Front.png",
        "stage": "initial",
        "source": "https://helldivers.wiki.gg/wiki/File:Trooper_Head_Front.png",
        "originalUrl": "https://helldivers.wiki.gg/images/Trooper_Head_Front.png?e16ef8",
        "renderedUrl": "https://helldivers.wiki.gg/images/thumb/Trooper_Head_Front.png/800px-Trooper_Head_Front.png?e16ef8",
        "thumbnailUrl": "https://helldivers.wiki.gg/images/thumb/Trooper_Head_Front.png/320px-Trooper_Head_Front.png?e16ef8",
        "width": 800,
        "height": 533,
        "sha256": "07fd379dc4efc60e557008fc0845d6b95e15409bbe7119685680e47ad60f2e11",
        "thumbnailSha256": "f940fdcdc27e7950788349a3438b024c87d010ba778c6c2a0c8ab7780a4e1964",
        "retrievedAt": "2026-09-16",
        "thumbnailCrop": [
          106,
          0,
          108,
          72
        ]
      }
    ],
    "waist": [
      {
        "src": "./assets/anatomy/scout-strider-waist.webp",
        "thumbnail": "./assets/anatomy/scout-strider-waist-thumb.webp",
        "title": "Scout Strider Waist Front.png",
        "stage": "initial",
        "source": "https://helldivers.wiki.gg/wiki/File:Scout_Strider_Waist_Front.png",
        "originalUrl": "https://helldivers.wiki.gg/images/Scout_Strider_Waist_Front.png?e32ac7",
        "renderedUrl": "https://helldivers.wiki.gg/images/thumb/Scout_Strider_Waist_Front.png/800px-Scout_Strider_Waist_Front.png?e32ac7",
        "thumbnailUrl": "https://helldivers.wiki.gg/images/thumb/Scout_Strider_Waist_Front.png/320px-Scout_Strider_Waist_Front.png?e32ac7",
        "width": 800,
        "height": 533,
        "sha256": "c69d88add57d4b3a3d2ce33e59de39937bebdcfc6b5272e23559e9dfbf51f499",
        "thumbnailSha256": "eaee5806157a3af9a63cae7763890c621a9ffcc6c2247ffec79185c22f8d0ba1",
        "retrievedAt": "2026-09-16",
        "thumbnailCrop": [
          106,
          65,
          108,
          72
        ]
      }
    ],
    "leg": [
      {
        "src": "./assets/anatomy/scout-strider-leg.webp",
        "thumbnail": "./assets/anatomy/scout-strider-leg-thumb.webp",
        "title": "Scout Strider Legs Side.png",
        "stage": "initial",
        "source": "https://helldivers.wiki.gg/wiki/File:Scout_Strider_Legs_Side.png",
        "originalUrl": "https://helldivers.wiki.gg/images/Scout_Strider_Legs_Side.png?70f3fe",
        "renderedUrl": "https://helldivers.wiki.gg/images/thumb/Scout_Strider_Legs_Side.png/800px-Scout_Strider_Legs_Side.png?70f3fe",
        "thumbnailUrl": "https://helldivers.wiki.gg/images/thumb/Scout_Strider_Legs_Side.png/320px-Scout_Strider_Legs_Side.png?70f3fe",
        "width": 800,
        "height": 533,
        "sha256": "8eb0c8bd2771794ac3ec69f284dd78c75b81d95812972b159d045e351acfe43f",
        "thumbnailSha256": "8dc4e42f0ccd343d68219e1836d34f309a2b7618865821c9831a1e34ca224487",
        "retrievedAt": "2026-09-16",
        "thumbnailCrop": [
          45,
          74,
          203,
          135
        ]
      }
    ]
  },
  "reinforced-strider": {
    "turret-system": [
      {
        "src": "./assets/anatomy/reinforced-strider-turret-system.webp",
        "thumbnail": "./assets/anatomy/reinforced-strider-turret-system-thumb.webp",
        "title": "Reinforced Scout Strider Turret System Front.png",
        "stage": "initial",
        "source": "https://helldivers.wiki.gg/wiki/File:Reinforced_Scout_Strider_Turret_System_Front.png",
        "originalUrl": "https://helldivers.wiki.gg/images/Reinforced_Scout_Strider_Turret_System_Front.png?c73635",
        "renderedUrl": "https://helldivers.wiki.gg/images/thumb/Reinforced_Scout_Strider_Turret_System_Front.png/800px-Reinforced_Scout_Strider_Turret_System_Front.png?c73635",
        "thumbnailUrl": "https://helldivers.wiki.gg/images/thumb/Reinforced_Scout_Strider_Turret_System_Front.png/320px-Reinforced_Scout_Strider_Turret_System_Front.png?c73635",
        "width": 800,
        "height": 533,
        "sha256": "2d158979a9006714750c42a921cc995ab49fb5b5f2236019cf83bca7a9dcaf5a",
        "thumbnailSha256": "02fb828691030bba891f884762e6de8cc286b91e30d6b6c3dad90a0d46dbaa9d",
        "retrievedAt": "2026-09-16",
        "thumbnailCrop": [
          106,
          39,
          108,
          72
        ]
      }
    ],
    "waist": [
      {
        "src": "./assets/anatomy/reinforced-strider-waist.webp",
        "thumbnail": "./assets/anatomy/reinforced-strider-waist-thumb.webp",
        "title": "Reinforced Scout Strider Waist Front.png",
        "stage": "initial",
        "source": "https://helldivers.wiki.gg/wiki/File:Reinforced_Scout_Strider_Waist_Front.png",
        "originalUrl": "https://helldivers.wiki.gg/images/Reinforced_Scout_Strider_Waist_Front.png?c36a05",
        "renderedUrl": "https://helldivers.wiki.gg/images/thumb/Reinforced_Scout_Strider_Waist_Front.png/800px-Reinforced_Scout_Strider_Waist_Front.png?c36a05",
        "thumbnailUrl": "https://helldivers.wiki.gg/images/thumb/Reinforced_Scout_Strider_Waist_Front.png/320px-Reinforced_Scout_Strider_Waist_Front.png?c36a05",
        "width": 800,
        "height": 533,
        "sha256": "9e1106a44c5d696e4eab2419103b89da6a9c4337061a5007cd053eef5b24bccb",
        "thumbnailSha256": "cdb7bd653d9bd6397fd60b9709c0f5009743c7571d2bd07b0fdff5a9f09338d4",
        "retrievedAt": "2026-09-16",
        "thumbnailCrop": [
          106,
          65,
          108,
          72
        ]
      }
    ],
    "leg": [
      {
        "src": "./assets/anatomy/reinforced-strider-leg.webp",
        "thumbnail": "./assets/anatomy/reinforced-strider-leg-thumb.webp",
        "title": "Reinforced Scout Strider Legs Side.png",
        "stage": "initial",
        "source": "https://helldivers.wiki.gg/wiki/File:Reinforced_Scout_Strider_Legs_Side.png",
        "originalUrl": "https://helldivers.wiki.gg/images/Reinforced_Scout_Strider_Legs_Side.png?5f3a06",
        "renderedUrl": "https://helldivers.wiki.gg/images/thumb/Reinforced_Scout_Strider_Legs_Side.png/800px-Reinforced_Scout_Strider_Legs_Side.png?5f3a06",
        "thumbnailUrl": "https://helldivers.wiki.gg/images/thumb/Reinforced_Scout_Strider_Legs_Side.png/320px-Reinforced_Scout_Strider_Legs_Side.png?5f3a06",
        "width": 800,
        "height": 533,
        "sha256": "64d1fa6c2c7670fda784504d880cddbd310abf6d6a5b3968444cbbd2ddc15573",
        "thumbnailSha256": "dc6840d026385e08b6beaddd7c57c7cf56d908e22b171b429017351baffee390",
        "retrievedAt": "2026-09-16",
        "thumbnailCrop": [
          44,
          73,
          203,
          135
        ]
      }
    ]
  },
  "gunship": {
    "front-thruster": [
      {
        "src": "./assets/anatomy/gunship-front-thruster.webp",
        "thumbnail": "./assets/anatomy/gunship-front-thruster-thumb.webp",
        "title": "Gunship Front Engines 1.png",
        "stage": "initial",
        "source": "https://helldivers.wiki.gg/wiki/File:Gunship_Front_Engines_1.png",
        "originalUrl": "https://helldivers.wiki.gg/images/Gunship_Front_Engines_1.png?4ebd7d",
        "renderedUrl": "https://helldivers.wiki.gg/images/thumb/Gunship_Front_Engines_1.png/800px-Gunship_Front_Engines_1.png?4ebd7d",
        "thumbnailUrl": "https://helldivers.wiki.gg/images/thumb/Gunship_Front_Engines_1.png/320px-Gunship_Front_Engines_1.png?4ebd7d",
        "width": 800,
        "height": 533,
        "sha256": "8459ff09c7cee275cbcd592b4559637cce5e9b0d11ccaec0d927c71077d4f327",
        "thumbnailSha256": "a97658ea80cd87d1503ebcef28bcc7e308736dda07f39050178186ea37ad3ef6",
        "retrievedAt": "2026-09-16",
        "thumbnailCrop": [
          1,
          1,
          318,
          212
        ]
      }
    ],
    "rear-thruster": [
      {
        "src": "./assets/anatomy/gunship-rear-thruster.webp",
        "thumbnail": "./assets/anatomy/gunship-rear-thruster-thumb.webp",
        "title": "Gunship Rear Engines 2.png",
        "stage": "initial",
        "source": "https://helldivers.wiki.gg/wiki/File:Gunship_Rear_Engines_2.png",
        "originalUrl": "https://helldivers.wiki.gg/images/Gunship_Rear_Engines_2.png?f1816b",
        "renderedUrl": "https://helldivers.wiki.gg/images/thumb/Gunship_Rear_Engines_2.png/800px-Gunship_Rear_Engines_2.png?f1816b",
        "thumbnailUrl": "https://helldivers.wiki.gg/images/thumb/Gunship_Rear_Engines_2.png/320px-Gunship_Rear_Engines_2.png?f1816b",
        "width": 800,
        "height": 533,
        "sha256": "fbd3929a12d8b9c3352b08a4b236c23d48344b0ea6b9535642c03f5aa28c70be",
        "thumbnailSha256": "840015af52a887335d4ecd6b9566d7a45839025ed611d45110b0c495ecf2cde0",
        "retrievedAt": "2026-09-16",
        "thumbnailCrop": [
          0,
          47,
          158,
          105
        ]
      }
    ],
    "fuselage": [
      {
        "src": "./assets/anatomy/gunship-fuselage.webp",
        "thumbnail": "./assets/anatomy/gunship-fuselage-thumb.webp",
        "title": "Gunship Fuselage Front.png",
        "stage": "initial",
        "source": "https://helldivers.wiki.gg/wiki/File:Gunship_Fuselage_Front.png",
        "originalUrl": "https://helldivers.wiki.gg/images/Gunship_Fuselage_Front.png?7d8ab4",
        "renderedUrl": "https://helldivers.wiki.gg/images/thumb/Gunship_Fuselage_Front.png/800px-Gunship_Fuselage_Front.png?7d8ab4",
        "thumbnailUrl": "https://helldivers.wiki.gg/images/thumb/Gunship_Fuselage_Front.png/320px-Gunship_Fuselage_Front.png?7d8ab4",
        "width": 800,
        "height": 533,
        "sha256": "42afa8539057fedd2a0d2a4c789257c89a5e5e01b5aec0bf58ee9814ba18424b",
        "thumbnailSha256": "4d2c8ce8b0d5a84cd7aa305f802ccddd6dc8233273379e3243180efdf3bf901e",
        "retrievedAt": "2026-09-16",
        "thumbnailCrop": [
          1,
          0,
          318,
          212
        ]
      }
    ]
  },
  "annihilator-tank": {
    "turret-front": [
      {
        "src": "./assets/anatomy/annihilator-tank-turret-front.webp",
        "thumbnail": "./assets/anatomy/annihilator-tank-turret-front-thumb.webp",
        "title": "Annihilator Turret Front.png",
        "stage": "initial",
        "source": "https://helldivers.wiki.gg/wiki/File:Annihilator_Turret_Front.png",
        "originalUrl": "https://helldivers.wiki.gg/images/Annihilator_Turret_Front.png?febf93",
        "renderedUrl": "https://helldivers.wiki.gg/images/thumb/Annihilator_Turret_Front.png/800px-Annihilator_Turret_Front.png?febf93",
        "thumbnailUrl": "https://helldivers.wiki.gg/images/thumb/Annihilator_Turret_Front.png/320px-Annihilator_Turret_Front.png?febf93",
        "width": 800,
        "height": 533,
        "sha256": "476386e71a51b121e40ce677c0364549f542ab01322cbb331f77460995d97bdc",
        "thumbnailSha256": "d0b2efc2aff644ad8b58d1c937920a91d0ce0eb11efbfc5e322e0664111111c2",
        "retrievedAt": "2026-09-16",
        "thumbnailCrop": [
          44,
          0,
          231,
          154
        ]
      }
    ],
    "heatsink": [
      {
        "src": "./assets/anatomy/annihilator-tank-heatsink.webp",
        "thumbnail": "./assets/anatomy/annihilator-tank-heatsink-thumb.webp",
        "title": "Annihilator Turret Vent Rear.png",
        "stage": "initial",
        "source": "https://helldivers.wiki.gg/wiki/File:Annihilator_Turret_Vent_Rear.png",
        "originalUrl": "https://helldivers.wiki.gg/images/Annihilator_Turret_Vent_Rear.png?766277",
        "renderedUrl": "https://helldivers.wiki.gg/images/thumb/Annihilator_Turret_Vent_Rear.png/800px-Annihilator_Turret_Vent_Rear.png?766277",
        "thumbnailUrl": "https://helldivers.wiki.gg/images/thumb/Annihilator_Turret_Vent_Rear.png/320px-Annihilator_Turret_Vent_Rear.png?766277",
        "width": 800,
        "height": 533,
        "sha256": "1796b191c57e85f608faed013707449af70a6b3febc97102844a70ab7f9ab065",
        "thumbnailSha256": "14806f33251bf1122ba8b1476bd9f0b28f491b8bbcc45cdb98fce88881d9d745",
        "retrievedAt": "2026-09-16",
        "thumbnailCrop": [
          44,
          0,
          231,
          154
        ]
      }
    ],
    "hull-front": [
      {
        "src": "./assets/anatomy/annihilator-tank-hull-front.webp",
        "thumbnail": "./assets/anatomy/annihilator-tank-hull-front-thumb.webp",
        "title": "Annihilator Hull Front.png",
        "stage": "initial",
        "source": "https://helldivers.wiki.gg/wiki/File:Annihilator_Hull_Front.png",
        "originalUrl": "https://helldivers.wiki.gg/images/Annihilator_Hull_Front.png?4ebd18",
        "renderedUrl": "https://helldivers.wiki.gg/images/thumb/Annihilator_Hull_Front.png/800px-Annihilator_Hull_Front.png?4ebd18",
        "thumbnailUrl": "https://helldivers.wiki.gg/images/thumb/Annihilator_Hull_Front.png/320px-Annihilator_Hull_Front.png?4ebd18",
        "width": 800,
        "height": 533,
        "sha256": "1569b7116efa33121499ead649366589498e5a4f3986ea3f8ced891a3bc2a658",
        "thumbnailSha256": "3a74deed8165a9069528e6fbe15ec5d0ea885956920cbcbc441b5242bd250190",
        "retrievedAt": "2026-09-16",
        "thumbnailCrop": [
          28,
          38,
          263,
          175
        ]
      }
    ],
    "engine": [
      {
        "src": "./assets/anatomy/annihilator-tank-engine.webp",
        "thumbnail": "./assets/anatomy/annihilator-tank-engine-thumb.webp",
        "title": "Annihilator Engine Bay Rear.png",
        "stage": "initial",
        "source": "https://helldivers.wiki.gg/wiki/File:Annihilator_Engine_Bay_Rear.png",
        "originalUrl": "https://helldivers.wiki.gg/images/Annihilator_Engine_Bay_Rear.png?77a69c",
        "renderedUrl": "https://helldivers.wiki.gg/images/thumb/Annihilator_Engine_Bay_Rear.png/800px-Annihilator_Engine_Bay_Rear.png?77a69c",
        "thumbnailUrl": "https://helldivers.wiki.gg/images/thumb/Annihilator_Engine_Bay_Rear.png/320px-Annihilator_Engine_Bay_Rear.png?77a69c",
        "width": 800,
        "height": 533,
        "sha256": "d26d97ea98a1d7e12d8c2c610c4e0250ab222530759183914cd5cbdf54d28fae",
        "thumbnailSha256": "c1a2a2649cc11ae844109603f058955c7104fe2c318a7fe49897f9a5d098a2e6",
        "retrievedAt": "2026-09-16",
        "thumbnailCrop": [
          71,
          75,
          177,
          118
        ]
      }
    ]
  },
  "voteless-light": {
    "head": [
      {
        "src": "./assets/anatomy/voteless-light-head.webp",
        "thumbnail": "./assets/anatomy/voteless-light-head-thumb.webp",
        "title": "Light Voteless Head Front.png",
        "stage": "initial",
        "source": "https://helldivers.wiki.gg/wiki/File:Light_Voteless_Head_Front.png",
        "originalUrl": "https://helldivers.wiki.gg/images/Light_Voteless_Head_Front.png?1b4875",
        "renderedUrl": "https://helldivers.wiki.gg/images/thumb/Light_Voteless_Head_Front.png/800px-Light_Voteless_Head_Front.png?1b4875",
        "thumbnailUrl": "https://helldivers.wiki.gg/images/thumb/Light_Voteless_Head_Front.png/320px-Light_Voteless_Head_Front.png?1b4875",
        "width": 800,
        "height": 533,
        "sha256": "39dfe4570e9cc20cc67dcdb3755239cd6baebe905c5123c7bb45d084e86d9dca",
        "thumbnailSha256": "2b393acc2c1aa171668c3bbb9ce3444a8ea48b0124581139367691a1dda56464",
        "retrievedAt": "2026-09-16",
        "thumbnailCrop": [
          106,
          0,
          108,
          72
        ]
      }
    ],
    "forearm": [
      {
        "src": "./assets/anatomy/voteless-light-forearm.webp",
        "thumbnail": "./assets/anatomy/voteless-light-forearm-thumb.webp",
        "title": "Light Voteless Forearms Front.png",
        "stage": "initial",
        "source": "https://helldivers.wiki.gg/wiki/File:Light_Voteless_Forearms_Front.png",
        "originalUrl": "https://helldivers.wiki.gg/images/Light_Voteless_Forearms_Front.png?191e77",
        "renderedUrl": "https://helldivers.wiki.gg/images/thumb/Light_Voteless_Forearms_Front.png/800px-Light_Voteless_Forearms_Front.png?191e77",
        "thumbnailUrl": "https://helldivers.wiki.gg/images/thumb/Light_Voteless_Forearms_Front.png/320px-Light_Voteless_Forearms_Front.png?191e77",
        "width": 800,
        "height": 533,
        "sha256": "b562e7d1e725c9f7981057f76f3ffa565e1cdac9780db5fdab06e60569290f2c",
        "thumbnailSha256": "276718370ec3eb969bbc35794bc01b8699fdc473bef016849c569121ff287594",
        "retrievedAt": "2026-09-16",
        "thumbnailCrop": [
          60,
          15,
          199,
          133
        ]
      }
    ],
    "leg": [
      {
        "src": "./assets/anatomy/voteless-light-leg.webp",
        "thumbnail": "./assets/anatomy/voteless-light-leg-thumb.webp",
        "title": "Light Voteless Legs Side.png",
        "stage": "initial",
        "source": "https://helldivers.wiki.gg/wiki/File:Light_Voteless_Legs_Side.png",
        "originalUrl": "https://helldivers.wiki.gg/images/Light_Voteless_Legs_Side.png?dc2e17",
        "renderedUrl": "https://helldivers.wiki.gg/images/thumb/Light_Voteless_Legs_Side.png/800px-Light_Voteless_Legs_Side.png?dc2e17",
        "thumbnailUrl": "https://helldivers.wiki.gg/images/thumb/Light_Voteless_Legs_Side.png/320px-Light_Voteless_Legs_Side.png?dc2e17",
        "width": 800,
        "height": 533,
        "sha256": "1545a599c1b1914ecede345e5f4456e153b17482a484c63d3d61d164e872878e",
        "thumbnailSha256": "077a5efc214e856ae6c29171de980e1eea0ecdc231643feee138981c51a43ae1",
        "retrievedAt": "2026-09-16",
        "thumbnailCrop": [
          56,
          79,
          201,
          134
        ]
      }
    ]
  },
  "voteless-medium": {
    "head": [
      {
        "src": "./assets/anatomy/voteless-medium-head.webp",
        "thumbnail": "./assets/anatomy/voteless-medium-head-thumb.webp",
        "title": "Medium Voteless Head Front.png",
        "stage": "initial",
        "source": "https://helldivers.wiki.gg/wiki/File:Medium_Voteless_Head_Front.png",
        "originalUrl": "https://helldivers.wiki.gg/images/Medium_Voteless_Head_Front.png?a47402",
        "renderedUrl": "https://helldivers.wiki.gg/images/thumb/Medium_Voteless_Head_Front.png/800px-Medium_Voteless_Head_Front.png?a47402",
        "thumbnailUrl": "https://helldivers.wiki.gg/images/thumb/Medium_Voteless_Head_Front.png/320px-Medium_Voteless_Head_Front.png?a47402",
        "width": 800,
        "height": 533,
        "sha256": "e093f0708852b71c80a431f51f75c89b7994594d14e072500d7c91332c38cfe5",
        "thumbnailSha256": "69503c90cf97b2c0d29cc4d1dadeb3cad69ce4b8d6f3be3045bd8915ceffc601",
        "retrievedAt": "2026-09-16",
        "thumbnailCrop": [
          106,
          0,
          108,
          72
        ]
      }
    ],
    "forearm": [
      {
        "src": "./assets/anatomy/voteless-medium-forearm.webp",
        "thumbnail": "./assets/anatomy/voteless-medium-forearm-thumb.webp",
        "title": "Medium Voteless Forearms Front.png",
        "stage": "initial",
        "source": "https://helldivers.wiki.gg/wiki/File:Medium_Voteless_Forearms_Front.png",
        "originalUrl": "https://helldivers.wiki.gg/images/Medium_Voteless_Forearms_Front.png?c21530",
        "renderedUrl": "https://helldivers.wiki.gg/images/thumb/Medium_Voteless_Forearms_Front.png/800px-Medium_Voteless_Forearms_Front.png?c21530",
        "thumbnailUrl": "https://helldivers.wiki.gg/images/thumb/Medium_Voteless_Forearms_Front.png/320px-Medium_Voteless_Forearms_Front.png?c21530",
        "width": 800,
        "height": 533,
        "sha256": "c779e6f40621af6633bd8073053634e91d8af25f9c0d8ad5c8f627273c0aaa42",
        "thumbnailSha256": "819a9a3fee1f2b867cdbfe58f304a41102cb18d2b1e186183056d17db0617a59",
        "retrievedAt": "2026-09-16",
        "thumbnailCrop": [
          51,
          17,
          217,
          145
        ]
      }
    ],
    "leg": [
      {
        "src": "./assets/anatomy/voteless-medium-leg.webp",
        "thumbnail": "./assets/anatomy/voteless-medium-leg-thumb.webp",
        "title": "Medium Voteless Legs Side.png",
        "stage": "initial",
        "source": "https://helldivers.wiki.gg/wiki/File:Medium_Voteless_Legs_Side.png",
        "originalUrl": "https://helldivers.wiki.gg/images/Medium_Voteless_Legs_Side.png?fbeb86",
        "renderedUrl": "https://helldivers.wiki.gg/images/thumb/Medium_Voteless_Legs_Side.png/800px-Medium_Voteless_Legs_Side.png?fbeb86",
        "thumbnailUrl": "https://helldivers.wiki.gg/images/thumb/Medium_Voteless_Legs_Side.png/320px-Medium_Voteless_Legs_Side.png?fbeb86",
        "width": 800,
        "height": 533,
        "sha256": "b556f7fd746f8917591f6e5fcc63ee496a72ee24067b152ff5931306acda191a",
        "thumbnailSha256": "1a4eb5cf86b1164e5b7110d15774aa5b3a6914086678102d20f0feecdb798bdf",
        "retrievedAt": "2026-09-16",
        "thumbnailCrop": [
          57,
          80,
          200,
          133
        ]
      }
    ]
  },
  "voteless-heavy": {
    "head": [
      {
        "src": "./assets/anatomy/voteless-heavy-head.webp",
        "thumbnail": "./assets/anatomy/voteless-heavy-head-thumb.webp",
        "title": "Heavy Voteless Head Front.png",
        "stage": "initial",
        "source": "https://helldivers.wiki.gg/wiki/File:Heavy_Voteless_Head_Front.png",
        "originalUrl": "https://helldivers.wiki.gg/images/Heavy_Voteless_Head_Front.png?4656db",
        "renderedUrl": "https://helldivers.wiki.gg/images/thumb/Heavy_Voteless_Head_Front.png/800px-Heavy_Voteless_Head_Front.png?4656db",
        "thumbnailUrl": "https://helldivers.wiki.gg/images/thumb/Heavy_Voteless_Head_Front.png/320px-Heavy_Voteless_Head_Front.png?4656db",
        "width": 800,
        "height": 533,
        "sha256": "14f3ec7bf0a7475c9e7c4ecc7771db5fbc93451edb6d5672a070c7fd8ca29207",
        "thumbnailSha256": "374616d70e6431093217a75f71b03d793fe2b2ce5760637fd792a1f29385ccf2",
        "retrievedAt": "2026-09-16",
        "thumbnailCrop": [
          106,
          0,
          108,
          72
        ]
      }
    ],
    "forearm": [
      {
        "src": "./assets/anatomy/voteless-heavy-forearm.webp",
        "thumbnail": "./assets/anatomy/voteless-heavy-forearm-thumb.webp",
        "title": "Heavy Voteless Forearms Front.png",
        "stage": "initial",
        "source": "https://helldivers.wiki.gg/wiki/File:Heavy_Voteless_Forearms_Front.png",
        "originalUrl": "https://helldivers.wiki.gg/images/Heavy_Voteless_Forearms_Front.png?386bbd",
        "renderedUrl": "https://helldivers.wiki.gg/images/thumb/Heavy_Voteless_Forearms_Front.png/800px-Heavy_Voteless_Forearms_Front.png?386bbd",
        "thumbnailUrl": "https://helldivers.wiki.gg/images/thumb/Heavy_Voteless_Forearms_Front.png/320px-Heavy_Voteless_Forearms_Front.png?386bbd",
        "width": 800,
        "height": 533,
        "sha256": "ff3837a6f74ea4dd73a600948cc7ccb2a2168f670175d056d3de8ccb6ae71dfe",
        "thumbnailSha256": "772282fcb0f88bda0ab493a0ff4dbe1687f3c71a1ecf87b8ce47c33856519ebd",
        "retrievedAt": "2026-09-16",
        "thumbnailCrop": [
          51,
          22,
          207,
          138
        ]
      }
    ],
    "leg": [
      {
        "src": "./assets/anatomy/voteless-heavy-leg.webp",
        "thumbnail": "./assets/anatomy/voteless-heavy-leg-thumb.webp",
        "title": "Heavy Voteless Legs Side.png",
        "stage": "initial",
        "source": "https://helldivers.wiki.gg/wiki/File:Heavy_Voteless_Legs_Side.png",
        "originalUrl": "https://helldivers.wiki.gg/images/Heavy_Voteless_Legs_Side.png?d27b9a",
        "renderedUrl": "https://helldivers.wiki.gg/images/thumb/Heavy_Voteless_Legs_Side.png/800px-Heavy_Voteless_Legs_Side.png?d27b9a",
        "thumbnailUrl": "https://helldivers.wiki.gg/images/thumb/Heavy_Voteless_Legs_Side.png/320px-Heavy_Voteless_Legs_Side.png?d27b9a",
        "width": 800,
        "height": 533,
        "sha256": "542ba1bda626365a2e740b890f5d8eb4feab3d2420d3820eb5a0c018364d8edf",
        "thumbnailSha256": "e7fb3e99f66e6e8ae6901a99dd69699e38bc64e379d7b768be52c05fcd52aad0",
        "retrievedAt": "2026-09-16",
        "thumbnailCrop": [
          60,
          79,
          201,
          134
        ]
      }
    ]
  },
  "watcher": {
    "body": [
      {
        "src": "./assets/anatomy/watcher-body.webp",
        "thumbnail": "./assets/anatomy/watcher-body-thumb.webp",
        "title": "Watcher Body Side.png",
        "stage": "initial",
        "source": "https://helldivers.wiki.gg/wiki/File:Watcher_Body_Side.png",
        "originalUrl": "https://helldivers.wiki.gg/images/Watcher_Body_Side.png?266312",
        "renderedUrl": "https://helldivers.wiki.gg/images/thumb/Watcher_Body_Side.png/800px-Watcher_Body_Side.png?266312",
        "thumbnailUrl": "https://helldivers.wiki.gg/images/thumb/Watcher_Body_Side.png/320px-Watcher_Body_Side.png?266312",
        "width": 800,
        "height": 533,
        "sha256": "61423395654383fbe9fab9bf7d08869554e151f280fa945ca3a10e216e40568d",
        "thumbnailSha256": "759d343cf472ed9a631cf2cc8cc7193b8d7f624b73e21cd418501095ed31ae5d",
        "retrievedAt": "2026-09-16",
        "thumbnailCrop": [
          105,
          48,
          137,
          91
        ]
      }
    ],
    "eye": [
      {
        "src": "./assets/anatomy/watcher-eye.webp",
        "thumbnail": "./assets/anatomy/watcher-eye-thumb.webp",
        "title": "Watcher Eye Front.png",
        "stage": "initial",
        "source": "https://helldivers.wiki.gg/wiki/File:Watcher_Eye_Front.png",
        "originalUrl": "https://helldivers.wiki.gg/images/Watcher_Eye_Front.png?3cdc0a",
        "renderedUrl": "https://helldivers.wiki.gg/images/thumb/Watcher_Eye_Front.png/800px-Watcher_Eye_Front.png?3cdc0a",
        "thumbnailUrl": "https://helldivers.wiki.gg/images/thumb/Watcher_Eye_Front.png/320px-Watcher_Eye_Front.png?3cdc0a",
        "width": 800,
        "height": 533,
        "sha256": "f2f96cdccdad066c2c9255388ea20846ea728b0439ed59416d01acb397498c2e",
        "thumbnailSha256": "1cffd27ca29fc6afb477b266e5331cce502d4eae4b6641dcb03bf3f2b30099b2",
        "retrievedAt": "2026-09-16",
        "thumbnailCrop": [
          106,
          57,
          108,
          72
        ]
      }
    ],
    "upper-fin": [
      {
        "src": "./assets/anatomy/watcher-upper-fin.webp",
        "thumbnail": "./assets/anatomy/watcher-upper-fin-thumb.webp",
        "title": "Watcher Upper Fin Front.png",
        "stage": "initial",
        "source": "https://helldivers.wiki.gg/wiki/File:Watcher_Upper_Fin_Front.png",
        "originalUrl": "https://helldivers.wiki.gg/images/Watcher_Upper_Fin_Front.png?cde5cd",
        "renderedUrl": "https://helldivers.wiki.gg/images/thumb/Watcher_Upper_Fin_Front.png/800px-Watcher_Upper_Fin_Front.png?cde5cd",
        "thumbnailUrl": "https://helldivers.wiki.gg/images/thumb/Watcher_Upper_Fin_Front.png/320px-Watcher_Upper_Fin_Front.png?cde5cd",
        "width": 800,
        "height": 533,
        "sha256": "3ebfe398b20b5ff95249ee280b567f47937b1b4320609d72f541722572beff60",
        "thumbnailSha256": "19f13c3b7d83574c7c889a9fcd5e5996018bbb74f36ed6e7bd3139cbd78bc63c",
        "retrievedAt": "2026-09-16",
        "thumbnailCrop": [
          98,
          0,
          122,
          81
        ]
      }
    ]
  },
  "elevated-overseer": {
    "head": [
      {
        "src": "./assets/anatomy/elevated-overseer-head.webp",
        "thumbnail": "./assets/anatomy/elevated-overseer-head-thumb.webp",
        "title": "Elevated Overseer Head Front.png",
        "stage": "initial",
        "source": "https://helldivers.wiki.gg/wiki/File:Elevated_Overseer_Head_Front.png",
        "originalUrl": "https://helldivers.wiki.gg/images/Elevated_Overseer_Head_Front.png?e3058d",
        "renderedUrl": "https://helldivers.wiki.gg/images/thumb/Elevated_Overseer_Head_Front.png/800px-Elevated_Overseer_Head_Front.png?e3058d",
        "thumbnailUrl": "https://helldivers.wiki.gg/images/thumb/Elevated_Overseer_Head_Front.png/320px-Elevated_Overseer_Head_Front.png?e3058d",
        "width": 800,
        "height": 533,
        "sha256": "9ed30f272bade6b93f8790fb0ab51ac808e8431070b29cb0dbf0941563dfbfc9",
        "thumbnailSha256": "a2e742f6c53d512cd0a6943333ef31e67616fb56c247334eae8e516543eeea63",
        "retrievedAt": "2026-09-16",
        "thumbnailCrop": [
          106,
          0,
          108,
          72
        ]
      }
    ],
    "jetpack": [
      {
        "src": "./assets/anatomy/elevated-overseer-jetpack.webp",
        "thumbnail": "./assets/anatomy/elevated-overseer-jetpack-thumb.webp",
        "title": "Elevated Overseer Jetpack Rear.png",
        "stage": "initial",
        "source": "https://helldivers.wiki.gg/wiki/File:Elevated_Overseer_Jetpack_Rear.png",
        "originalUrl": "https://helldivers.wiki.gg/images/Elevated_Overseer_Jetpack_Rear.png?a30b85",
        "renderedUrl": "https://helldivers.wiki.gg/images/thumb/Elevated_Overseer_Jetpack_Rear.png/800px-Elevated_Overseer_Jetpack_Rear.png?a30b85",
        "thumbnailUrl": "https://helldivers.wiki.gg/images/thumb/Elevated_Overseer_Jetpack_Rear.png/320px-Elevated_Overseer_Jetpack_Rear.png?a30b85",
        "width": 800,
        "height": 533,
        "sha256": "8e6c30645e90d1c3595df86ace6591b04d11c4fead5b4083dfd8e0e2ec4012d6",
        "thumbnailSha256": "e0bf5b3dcffa4a25710db9e11e7f43040d6d41f6a4dca86dcd5d6e08ac2ddad1",
        "retrievedAt": "2026-09-16",
        "thumbnailCrop": [
          96,
          7,
          128,
          85
        ]
      }
    ],
    "chest-armor": [
      {
        "src": "./assets/anatomy/elevated-overseer-chest-armor.webp",
        "thumbnail": "./assets/anatomy/elevated-overseer-chest-armor-thumb.webp",
        "title": "Elevated Overseer Torso Armor Front.png",
        "stage": "initial",
        "source": "https://helldivers.wiki.gg/wiki/File:Elevated_Overseer_Torso_Armor_Front.png",
        "originalUrl": "https://helldivers.wiki.gg/images/Elevated_Overseer_Torso_Armor_Front.png?e312a5",
        "renderedUrl": "https://helldivers.wiki.gg/images/thumb/Elevated_Overseer_Torso_Armor_Front.png/800px-Elevated_Overseer_Torso_Armor_Front.png?e312a5",
        "thumbnailUrl": "https://helldivers.wiki.gg/images/thumb/Elevated_Overseer_Torso_Armor_Front.png/320px-Elevated_Overseer_Torso_Armor_Front.png?e312a5",
        "width": 800,
        "height": 533,
        "sha256": "fad8a02f2cf81e8e7911aae90654d41b0fce0fd953dcf4137ce2979869bf7ea0",
        "thumbnailSha256": "84d042c890b60e30edb3a37d24c50ee59966a5539a5601d8fd7a6a183ad3ae30",
        "retrievedAt": "2026-09-16",
        "thumbnailCrop": [
          92,
          8,
          135,
          90
        ]
      },
      {
        "src": "./assets/anatomy/overseer-chest-armor-exposed.webp",
        "thumbnail": "./assets/anatomy/overseer-chest-armor-exposed-thumb.webp",
        "title": "Overseer Half Bare Torso.png",
        "stage": "exposed",
        "source": "https://helldivers.wiki.gg/wiki/File:Overseer_Half_Bare_Torso.png",
        "originalUrl": "https://helldivers.wiki.gg/images/Overseer_Half_Bare_Torso.png?30386f",
        "renderedUrl": "https://helldivers.wiki.gg/images/thumb/Overseer_Half_Bare_Torso.png/800px-Overseer_Half_Bare_Torso.png?30386f",
        "thumbnailUrl": "https://helldivers.wiki.gg/images/thumb/Overseer_Half_Bare_Torso.png/320px-Overseer_Half_Bare_Torso.png?30386f",
        "width": 800,
        "height": 533,
        "sha256": "0b119a915326692df109318c7872bdb00acbe91e68b20651ee8334a2a05cc034",
        "thumbnailSha256": "38cf63bf944c5ec8049df86fc0aeb7fd3e937d5e699c5144b63a377e98531859",
        "retrievedAt": "2026-09-16",
        "thumbnailCrop": [
          76,
          8,
          171,
          114
        ],
        "caption": "2. 장갑 제거 후 몸통 위치 · 위키 공용 도해"
      }
    ]
  },
  "hunter-hardened": {
    "head": [
      {
        "src": "./assets/anatomy/hunter-head.webp",
        "thumbnail": "./assets/anatomy/hunter-head-thumb.webp",
        "title": "Hunter Head Front.png",
        "stage": "initial",
        "source": "https://helldivers.wiki.gg/wiki/File:Hunter_Head_Front.png",
        "originalUrl": "https://helldivers.wiki.gg/images/Hunter_Head_Front.png?8ffd57",
        "renderedUrl": "https://helldivers.wiki.gg/images/thumb/Hunter_Head_Front.png/800px-Hunter_Head_Front.png?8ffd57",
        "thumbnailUrl": "https://helldivers.wiki.gg/images/thumb/Hunter_Head_Front.png/320px-Hunter_Head_Front.png?8ffd57",
        "width": 800,
        "height": 533,
        "sha256": "811f1b69b80734f21a996c008bfd6f85eb4a02d3bfd104a51085dc212f535cd1",
        "thumbnailSha256": "9624fa372059bc24137d17ee148d0985fc569b56e747c0d343d6c99f283947dc",
        "retrievedAt": "2026-09-16",
        "thumbnailCrop": [
          94,
          25,
          131,
          87
        ]
      }
    ],
    "claw": [
      {
        "src": "./assets/anatomy/hunter-claw.webp",
        "thumbnail": "./assets/anatomy/hunter-claw-thumb.webp",
        "title": "Hunter Claws Front.png",
        "stage": "initial",
        "source": "https://helldivers.wiki.gg/wiki/File:Hunter_Claws_Front.png",
        "originalUrl": "https://helldivers.wiki.gg/images/Hunter_Claws_Front.png?476b72",
        "renderedUrl": "https://helldivers.wiki.gg/images/thumb/Hunter_Claws_Front.png/800px-Hunter_Claws_Front.png?476b72",
        "thumbnailUrl": "https://helldivers.wiki.gg/images/thumb/Hunter_Claws_Front.png/320px-Hunter_Claws_Front.png?476b72",
        "width": 800,
        "height": 533,
        "sha256": "691aa8a159e31ac83ad1e01c88fb88c4bfb24ea370ff03404aaf0f03ee702c63",
        "thumbnailSha256": "29cb8c26ef002aee4334bb3b9cdd547c32d37512c22698109a02cd885046569d",
        "retrievedAt": "2026-09-16",
        "thumbnailCrop": [
          77,
          18,
          165,
          110
        ]
      }
    ],
    "leg": [
      {
        "src": "./assets/anatomy/hunter-leg.webp",
        "thumbnail": "./assets/anatomy/hunter-leg-thumb.webp",
        "title": "Hunter Legs Side.png",
        "stage": "initial",
        "source": "https://helldivers.wiki.gg/wiki/File:Hunter_Legs_Side.png",
        "originalUrl": "https://helldivers.wiki.gg/images/Hunter_Legs_Side.png?af19f0",
        "renderedUrl": "https://helldivers.wiki.gg/images/thumb/Hunter_Legs_Side.png/800px-Hunter_Legs_Side.png?af19f0",
        "thumbnailUrl": "https://helldivers.wiki.gg/images/thumb/Hunter_Legs_Side.png/320px-Hunter_Legs_Side.png?af19f0",
        "width": 800,
        "height": 533,
        "sha256": "a451bb1f7cc0363885f235687b2c2ce80a15276c0721a0fd4dc92c2b22db6a85",
        "thumbnailSha256": "3d2e1baacfcaf1ebe2c8972381166aa27ead230a91bf9a4c2a440ca31a424138",
        "retrievedAt": "2026-09-16",
        "thumbnailCrop": [
          51,
          58,
          226,
          151
        ]
      }
    ]
  },
  "warrior-hardened": {
    "head": [
      {
        "src": "./assets/anatomy/warrior-head.webp",
        "thumbnail": "./assets/anatomy/warrior-head-thumb.webp",
        "title": "Warrior Head Front.png",
        "stage": "initial",
        "source": "https://helldivers.wiki.gg/wiki/File:Warrior_Head_Front.png",
        "originalUrl": "https://helldivers.wiki.gg/images/Warrior_Head_Front.png?f4268a",
        "renderedUrl": "https://helldivers.wiki.gg/images/thumb/Warrior_Head_Front.png/800px-Warrior_Head_Front.png?f4268a",
        "thumbnailUrl": "https://helldivers.wiki.gg/images/thumb/Warrior_Head_Front.png/320px-Warrior_Head_Front.png?f4268a",
        "width": 800,
        "height": 533,
        "sha256": "32db2e3cd1703fbb327d4c90c6891584ad3f58f44454ffe0237bb559fc2aa9e0",
        "thumbnailSha256": "f86d2f0310c2ba4153cf31d43d272dee9fdebc95e77f371969b2f6a5943d2e68",
        "retrievedAt": "2026-09-16",
        "thumbnailCrop": [
          81,
          0,
          159,
          106
        ]
      }
    ],
    "claw": [
      {
        "src": "./assets/anatomy/warrior-claw.webp",
        "thumbnail": "./assets/anatomy/warrior-claw-thumb.webp",
        "title": "Warrior Claws Front.png",
        "stage": "initial",
        "source": "https://helldivers.wiki.gg/wiki/File:Warrior_Claws_Front.png",
        "originalUrl": "https://helldivers.wiki.gg/images/Warrior_Claws_Front.png?65e98a",
        "renderedUrl": "https://helldivers.wiki.gg/images/thumb/Warrior_Claws_Front.png/800px-Warrior_Claws_Front.png?65e98a",
        "thumbnailUrl": "https://helldivers.wiki.gg/images/thumb/Warrior_Claws_Front.png/320px-Warrior_Claws_Front.png?65e98a",
        "width": 800,
        "height": 533,
        "sha256": "6f2a605efe9d2db179be339f1f6bb987eddff5874db3c08b4e307c4ef89e8272",
        "thumbnailSha256": "9d3f8e3652d0ae924c06561b9e40d96306370be9df125c3ec1917c12c97e68a5",
        "retrievedAt": "2026-09-16",
        "thumbnailCrop": [
          58,
          10,
          203,
          135
        ]
      }
    ],
    "leg": [
      {
        "src": "./assets/anatomy/warrior-leg.webp",
        "thumbnail": "./assets/anatomy/warrior-leg-thumb.webp",
        "title": "Warrior Legs Side.png",
        "stage": "initial",
        "source": "https://helldivers.wiki.gg/wiki/File:Warrior_Legs_Side.png",
        "originalUrl": "https://helldivers.wiki.gg/images/Warrior_Legs_Side.png?90b5b7",
        "renderedUrl": "https://helldivers.wiki.gg/images/thumb/Warrior_Legs_Side.png/800px-Warrior_Legs_Side.png?90b5b7",
        "thumbnailUrl": "https://helldivers.wiki.gg/images/thumb/Warrior_Legs_Side.png/320px-Warrior_Legs_Side.png?90b5b7",
        "width": 800,
        "height": 533,
        "sha256": "defa4dade0a4068c6b4c23e597fcf5badafbd11b1172b6d670b08e4c6855182d",
        "thumbnailSha256": "50a375fab67949f5904e8ba3d8bdddaec41cb0ee4aaeb19d255c364c891d0ba9",
        "retrievedAt": "2026-09-16",
        "thumbnailCrop": [
          40,
          54,
          209,
          139
        ]
      }
    ]
  },
  "bile-spewer-armored": {
    "head": [
      {
        "src": "./assets/anatomy/bile-spewer-head.webp",
        "thumbnail": "./assets/anatomy/bile-spewer-head-thumb.webp",
        "title": "Bile Spewer Head Front.png",
        "stage": "initial",
        "source": "https://helldivers.wiki.gg/wiki/File:Bile_Spewer_Head_Front.png",
        "originalUrl": "https://helldivers.wiki.gg/images/Bile_Spewer_Head_Front.png?64dce1",
        "renderedUrl": "https://helldivers.wiki.gg/images/thumb/Bile_Spewer_Head_Front.png/800px-Bile_Spewer_Head_Front.png?64dce1",
        "thumbnailUrl": "https://helldivers.wiki.gg/images/thumb/Bile_Spewer_Head_Front.png/320px-Bile_Spewer_Head_Front.png?64dce1",
        "width": 800,
        "height": 533,
        "sha256": "2f8cb56e739e90ff436c39050a65b7bf033e7b7765507dc98b8d865382c613fd",
        "thumbnailSha256": "0d696898ff1733d442c38fd338a8f08292d26b0a98c239968165d7e3ab310617",
        "retrievedAt": "2026-09-16",
        "thumbnailCrop": [
          96,
          74,
          128,
          85
        ]
      }
    ],
    "mouth": [
      {
        "src": "./assets/anatomy/bile-spewer-mouth.webp",
        "thumbnail": "./assets/anatomy/bile-spewer-mouth-thumb.webp",
        "title": "Bile Spewer Mouth.png",
        "stage": "initial",
        "source": "https://helldivers.wiki.gg/wiki/File:Bile_Spewer_Mouth.png",
        "originalUrl": "https://helldivers.wiki.gg/images/Bile_Spewer_Mouth.png?11124c",
        "renderedUrl": "https://helldivers.wiki.gg/images/thumb/Bile_Spewer_Mouth.png/800px-Bile_Spewer_Mouth.png?11124c",
        "thumbnailUrl": "https://helldivers.wiki.gg/images/thumb/Bile_Spewer_Mouth.png/320px-Bile_Spewer_Mouth.png?11124c",
        "width": 800,
        "height": 533,
        "sha256": "d704e43640a46141d6551d08da9bcaaf570c5b6a048adbb8cb70ceaedadea86c",
        "thumbnailSha256": "cf1c823a06e8740134724a0225c62cb68d16bb9354bed645c972ad0bc0db2a9f",
        "retrievedAt": "2026-09-16",
        "thumbnailCrop": [
          105,
          104,
          110,
          73
        ]
      }
    ],
    "butt": [
      {
        "src": "./assets/anatomy/bile-spewer-butt.webp",
        "thumbnail": "./assets/anatomy/bile-spewer-butt-thumb.webp",
        "title": "Bile Spewer Butt Rear.png",
        "stage": "initial",
        "source": "https://helldivers.wiki.gg/wiki/File:Bile_Spewer_Butt_Rear.png",
        "originalUrl": "https://helldivers.wiki.gg/images/Bile_Spewer_Butt_Rear.png?808320",
        "renderedUrl": "https://helldivers.wiki.gg/images/thumb/Bile_Spewer_Butt_Rear.png/800px-Bile_Spewer_Butt_Rear.png?808320",
        "thumbnailUrl": "https://helldivers.wiki.gg/images/thumb/Bile_Spewer_Butt_Rear.png/320px-Bile_Spewer_Butt_Rear.png?808320",
        "width": 800,
        "height": 533,
        "sha256": "5bf8da0ca704d179dc0256a2c53ecbf4707fe1de23cc8d9b491528c16e6d1250",
        "thumbnailSha256": "c90d57127cb769e9aa2fba926872fac278f9eb8cf6a7c674289e1af80dd189d6",
        "retrievedAt": "2026-09-16",
        "thumbnailCrop": [
          45,
          40,
          230,
          153
        ]
      }
    ]
  }
};
