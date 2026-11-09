export const ENEMY_CATALOG = [
  {
    "id": "walker",
    "name": "Vijand",
    "kind": "walker",
    "tileIds": [
      6
    ],
    "variant": "normal",
    "size": [
      26,
      26
    ],
    "movement": {
      "type": "walk",
      "speed": 48,
      "turnAtEdges": true,
      "amplitude": 18,
      "frequency": 2.4
    },
    "combat": {
      "health": 1,
      "contactDamage": true,
      "lethalContact": false,
      "stompable": true,
      "stompResponse": "damage",
      "fireResponse": "damage",
      "freezeable": true,
      "bubbleable": true,
      "hitCooldown": 0
    },
    "shooting": {
      "enabled": false,
      "projectile": "fire",
      "interval": 2,
      "speed": 0,
      "verticalSpeed": 70,
      "life": 6,
      "aim": "down"
    },
    "settings": {
      "chargeSeconds": 5,
      "jumpSpeed": 550,
      "tongueSeconds": 3,
      "tongueReach": 88,
      "reviveSeconds": 5,
      "fuseSeconds": 3,
      "triggerRange": 110,
      "angrySpeed": 190,
      "lookSeconds": 0.8,
      "restSeconds": 5,
      "riseSpeed": 90
    },
    "animations": {},
    "group": "game",
    "key": "game/walker"
  },
  {
    "id": "robot",
    "name": "Robot",
    "kind": "robot",
    "tileIds": [
      17
    ],
    "variant": "normal",
    "size": [
      26,
      26
    ],
    "movement": {
      "type": "walk",
      "speed": 150,
      "turnAtEdges": true,
      "amplitude": 18,
      "frequency": 2.4
    },
    "combat": {
      "health": 1,
      "contactDamage": true,
      "lethalContact": false,
      "stompable": true,
      "stompResponse": "damage",
      "fireResponse": "damage",
      "freezeable": true,
      "bubbleable": true,
      "hitCooldown": 0
    },
    "shooting": {
      "enabled": false,
      "projectile": "fire",
      "interval": 2,
      "speed": 0,
      "verticalSpeed": 70,
      "life": 6,
      "aim": "down"
    },
    "settings": {
      "chargeSeconds": 5,
      "jumpSpeed": 550,
      "tongueSeconds": 3,
      "tongueReach": 88,
      "reviveSeconds": 5,
      "fuseSeconds": 3,
      "triggerRange": 110,
      "angrySpeed": 190,
      "lookSeconds": 0.8,
      "restSeconds": 5,
      "riseSpeed": 90
    },
    "animations": {},
    "group": "game",
    "key": "game/robot"
  },
  {
    "id": "frog",
    "name": "Kikker",
    "kind": "frog",
    "tileIds": [
      18
    ],
    "variant": "normal",
    "size": [
      26,
      26
    ],
    "movement": {
      "type": "walk",
      "speed": 22,
      "turnAtEdges": true,
      "amplitude": 18,
      "frequency": 2.4
    },
    "combat": {
      "health": 1,
      "contactDamage": true,
      "lethalContact": false,
      "stompable": true,
      "stompResponse": "damage",
      "fireResponse": "damage",
      "freezeable": true,
      "bubbleable": true,
      "hitCooldown": 0
    },
    "shooting": {
      "enabled": false,
      "projectile": "fire",
      "interval": 2,
      "speed": 0,
      "verticalSpeed": 70,
      "life": 6,
      "aim": "down"
    },
    "settings": {
      "chargeSeconds": 5,
      "jumpSpeed": 550,
      "tongueSeconds": 3,
      "tongueReach": 88,
      "reviveSeconds": 5,
      "fuseSeconds": 3,
      "triggerRange": 110,
      "angrySpeed": 190,
      "lookSeconds": 0.8,
      "restSeconds": 5,
      "riseSpeed": 90
    },
    "animations": {},
    "group": "game",
    "key": "game/frog"
  },
  {
    "id": "red-frog",
    "name": "Rode kikker",
    "kind": "frog",
    "tileIds": [
      20
    ],
    "variant": "red",
    "size": [
      26,
      26
    ],
    "movement": {
      "type": "walk",
      "speed": 22,
      "turnAtEdges": true,
      "amplitude": 18,
      "frequency": 2.4
    },
    "combat": {
      "health": 1,
      "contactDamage": true,
      "lethalContact": false,
      "stompable": true,
      "stompResponse": "damage",
      "fireResponse": "damage",
      "freezeable": true,
      "bubbleable": true,
      "hitCooldown": 0
    },
    "shooting": {
      "enabled": false,
      "projectile": "fire",
      "interval": 2,
      "speed": 0,
      "verticalSpeed": 70,
      "life": 6,
      "aim": "down"
    },
    "settings": {
      "chargeSeconds": 5,
      "jumpSpeed": 550,
      "tongueSeconds": 3,
      "tongueReach": 88,
      "reviveSeconds": 5,
      "fuseSeconds": 3,
      "triggerRange": 110,
      "angrySpeed": 190,
      "lookSeconds": 0.8,
      "restSeconds": 5,
      "riseSpeed": 90
    },
    "animations": {},
    "group": "game",
    "key": "game/red-frog"
  },
  {
    "id": "angry-robot",
    "name": "Boze robot",
    "kind": "robot",
    "tileIds": [
      21
    ],
    "variant": "angry",
    "size": [
      26,
      26
    ],
    "movement": {
      "type": "walk",
      "speed": 150,
      "turnAtEdges": true,
      "amplitude": 18,
      "frequency": 2.4
    },
    "combat": {
      "health": 1,
      "contactDamage": true,
      "lethalContact": false,
      "stompable": true,
      "stompResponse": "damage",
      "fireResponse": "damage",
      "freezeable": true,
      "bubbleable": true,
      "hitCooldown": 0
    },
    "shooting": {
      "enabled": false,
      "projectile": "fire",
      "interval": 2,
      "speed": 0,
      "verticalSpeed": 70,
      "life": 6,
      "aim": "down"
    },
    "settings": {
      "chargeSeconds": 5,
      "jumpSpeed": 550,
      "tongueSeconds": 3,
      "tongueReach": 88,
      "reviveSeconds": 5,
      "fuseSeconds": 3,
      "triggerRange": 110,
      "angrySpeed": 190,
      "lookSeconds": 0.8,
      "restSeconds": 5,
      "riseSpeed": 90
    },
    "animations": {},
    "group": "game",
    "key": "game/angry-robot"
  },
  {
    "id": "turtle",
    "name": "Schildpad",
    "kind": "turtle",
    "tileIds": [
      22
    ],
    "variant": "normal",
    "size": [
      26,
      26
    ],
    "movement": {
      "type": "walk",
      "speed": 40,
      "turnAtEdges": true,
      "amplitude": 18,
      "frequency": 2.4
    },
    "combat": {
      "health": 1,
      "contactDamage": true,
      "lethalContact": false,
      "stompable": true,
      "stompResponse": "shell",
      "fireResponse": "damage",
      "freezeable": true,
      "bubbleable": true,
      "hitCooldown": 0
    },
    "shooting": {
      "enabled": false,
      "projectile": "fire",
      "interval": 2,
      "speed": 0,
      "verticalSpeed": 70,
      "life": 6,
      "aim": "down"
    },
    "settings": {
      "chargeSeconds": 5,
      "jumpSpeed": 550,
      "tongueSeconds": 3,
      "tongueReach": 88,
      "reviveSeconds": 5,
      "fuseSeconds": 3,
      "triggerRange": 110,
      "angrySpeed": 190,
      "lookSeconds": 0.8,
      "restSeconds": 5,
      "riseSpeed": 90
    },
    "animations": {},
    "group": "game",
    "key": "game/turtle"
  },
  {
    "id": "dragon",
    "name": "Vliegende draak",
    "kind": "dragon",
    "tileIds": [
      23
    ],
    "variant": "normal",
    "size": [
      26,
      26
    ],
    "movement": {
      "type": "fly",
      "speed": 60,
      "turnAtEdges": true,
      "amplitude": 18,
      "frequency": 2.4
    },
    "combat": {
      "health": 1,
      "contactDamage": true,
      "lethalContact": false,
      "stompable": true,
      "stompResponse": "damage",
      "fireResponse": "damage",
      "freezeable": true,
      "bubbleable": true,
      "hitCooldown": 0
    },
    "shooting": {
      "enabled": false,
      "projectile": "fire",
      "interval": 2,
      "speed": 0,
      "verticalSpeed": 70,
      "life": 6,
      "aim": "down"
    },
    "settings": {
      "chargeSeconds": 5,
      "jumpSpeed": 550,
      "tongueSeconds": 3,
      "tongueReach": 88,
      "reviveSeconds": 5,
      "fuseSeconds": 3,
      "triggerRange": 110,
      "angrySpeed": 190,
      "lookSeconds": 0.8,
      "restSeconds": 5,
      "riseSpeed": 90
    },
    "animations": {},
    "group": "game",
    "key": "game/dragon"
  },
  {
    "id": "plant",
    "name": "Tweekoppige plant",
    "kind": "plant",
    "tileIds": [
      24
    ],
    "variant": "normal",
    "size": [
      32,
      48
    ],
    "movement": {
      "type": "stationary",
      "speed": 0,
      "turnAtEdges": true,
      "amplitude": 18,
      "frequency": 2.4
    },
    "combat": {
      "health": 1,
      "contactDamage": true,
      "lethalContact": false,
      "stompable": false,
      "stompResponse": "hurt",
      "fireResponse": "damage",
      "freezeable": true,
      "bubbleable": true,
      "hitCooldown": 0
    },
    "shooting": {
      "enabled": false,
      "projectile": "fire",
      "interval": 2,
      "speed": 0,
      "verticalSpeed": 70,
      "life": 6,
      "aim": "down"
    },
    "settings": {
      "chargeSeconds": 5,
      "jumpSpeed": 550,
      "tongueSeconds": 3,
      "tongueReach": 88,
      "reviveSeconds": 5,
      "fuseSeconds": 3,
      "triggerRange": 110,
      "angrySpeed": 190,
      "lookSeconds": 0.8,
      "restSeconds": 5,
      "riseSpeed": 90
    },
    "animations": {},
    "group": "game",
    "key": "game/plant"
  },
  {
    "id": "skeleton",
    "name": "Skeletschildpad",
    "kind": "skeleton",
    "tileIds": [
      25
    ],
    "variant": "normal",
    "size": [
      26,
      26
    ],
    "movement": {
      "type": "walk",
      "speed": 40,
      "turnAtEdges": true,
      "amplitude": 18,
      "frequency": 2.4
    },
    "combat": {
      "health": 1,
      "contactDamage": true,
      "lethalContact": false,
      "stompable": true,
      "stompResponse": "collapse",
      "fireResponse": "ignore",
      "freezeable": true,
      "bubbleable": true,
      "hitCooldown": 0
    },
    "shooting": {
      "enabled": false,
      "projectile": "fire",
      "interval": 2,
      "speed": 0,
      "verticalSpeed": 70,
      "life": 6,
      "aim": "down"
    },
    "settings": {
      "chargeSeconds": 5,
      "jumpSpeed": 550,
      "tongueSeconds": 3,
      "tongueReach": 88,
      "reviveSeconds": 5,
      "fuseSeconds": 3,
      "triggerRange": 110,
      "angrySpeed": 190,
      "lookSeconds": 0.8,
      "restSeconds": 5,
      "riseSpeed": 90
    },
    "animations": {},
    "group": "game",
    "key": "game/skeleton"
  },
  {
    "id": "spiky",
    "name": "Dikke stekelschildpad",
    "kind": "spiky",
    "tileIds": [
      27
    ],
    "variant": "normal",
    "size": [
      38,
      32
    ],
    "movement": {
      "type": "walk",
      "speed": 26,
      "turnAtEdges": true,
      "amplitude": 18,
      "frequency": 2.4
    },
    "combat": {
      "health": 3,
      "contactDamage": true,
      "lethalContact": false,
      "stompable": false,
      "stompResponse": "hurt",
      "fireResponse": "damage",
      "freezeable": true,
      "bubbleable": true,
      "hitCooldown": 0.15
    },
    "shooting": {
      "enabled": false,
      "projectile": "fire",
      "interval": 2,
      "speed": 0,
      "verticalSpeed": 70,
      "life": 6,
      "aim": "down"
    },
    "settings": {
      "chargeSeconds": 5,
      "jumpSpeed": 550,
      "tongueSeconds": 3,
      "tongueReach": 88,
      "reviveSeconds": 5,
      "fuseSeconds": 3,
      "triggerRange": 110,
      "angrySpeed": 190,
      "lookSeconds": 0.8,
      "restSeconds": 5,
      "riseSpeed": 90
    },
    "animations": {},
    "group": "game",
    "key": "game/spiky"
  },
  {
    "id": "hammer",
    "name": "Hamerschildpad",
    "kind": "hammer",
    "tileIds": [
      28
    ],
    "variant": "normal",
    "size": [
      26,
      26
    ],
    "movement": {
      "type": "walk",
      "speed": 40,
      "turnAtEdges": true,
      "amplitude": 18,
      "frequency": 2.4
    },
    "combat": {
      "health": 1,
      "contactDamage": true,
      "lethalContact": false,
      "stompable": true,
      "stompResponse": "damage",
      "fireResponse": "damage",
      "freezeable": true,
      "bubbleable": true,
      "hitCooldown": 0
    },
    "shooting": {
      "enabled": true,
      "projectile": "hammer",
      "interval": 2,
      "speed": 160,
      "verticalSpeed": -380,
      "life": 3,
      "aim": "player"
    },
    "settings": {
      "chargeSeconds": 5,
      "jumpSpeed": 550,
      "tongueSeconds": 3,
      "tongueReach": 88,
      "reviveSeconds": 5,
      "fuseSeconds": 3,
      "triggerRange": 110,
      "angrySpeed": 190,
      "lookSeconds": 0.8,
      "restSeconds": 5,
      "riseSpeed": 90
    },
    "animations": {},
    "group": "game",
    "key": "game/hammer"
  },
  {
    "id": "bomb",
    "name": "Lopende bom",
    "kind": "bomb",
    "tileIds": [
      29
    ],
    "variant": "normal",
    "size": [
      26,
      26
    ],
    "movement": {
      "type": "walk",
      "speed": 40,
      "turnAtEdges": true,
      "amplitude": 18,
      "frequency": 2.4
    },
    "combat": {
      "health": 1,
      "contactDamage": true,
      "lethalContact": false,
      "stompable": true,
      "stompResponse": "ignite",
      "fireResponse": "ignite",
      "freezeable": true,
      "bubbleable": true,
      "hitCooldown": 0
    },
    "shooting": {
      "enabled": false,
      "projectile": "fire",
      "interval": 2,
      "speed": 0,
      "verticalSpeed": 70,
      "life": 6,
      "aim": "down"
    },
    "settings": {
      "chargeSeconds": 5,
      "jumpSpeed": 550,
      "tongueSeconds": 3,
      "tongueReach": 88,
      "reviveSeconds": 5,
      "fuseSeconds": 3,
      "triggerRange": 110,
      "angrySpeed": 190,
      "lookSeconds": 0.8,
      "restSeconds": 5,
      "riseSpeed": 90
    },
    "animations": {},
    "group": "game",
    "key": "game/bomb"
  },
  {
    "id": "crusher",
    "name": "Boos stekelrotsblok",
    "kind": "crusher",
    "tileIds": [
      61
    ],
    "variant": "normal",
    "size": [
      32,
      32
    ],
    "movement": {
      "type": "stationary",
      "speed": 0,
      "turnAtEdges": true,
      "amplitude": 18,
      "frequency": 2.4
    },
    "combat": {
      "health": 1,
      "contactDamage": true,
      "lethalContact": true,
      "stompable": false,
      "stompResponse": "hurt",
      "fireResponse": "ignore",
      "freezeable": true,
      "bubbleable": true,
      "hitCooldown": 0
    },
    "shooting": {
      "enabled": false,
      "projectile": "fire",
      "interval": 2,
      "speed": 0,
      "verticalSpeed": 70,
      "life": 6,
      "aim": "down"
    },
    "settings": {
      "chargeSeconds": 5,
      "jumpSpeed": 550,
      "tongueSeconds": 3,
      "tongueReach": 88,
      "reviveSeconds": 5,
      "fuseSeconds": 3,
      "triggerRange": 110,
      "angrySpeed": 190,
      "lookSeconds": 0.8,
      "restSeconds": 5,
      "riseSpeed": 90
    },
    "animations": {},
    "group": "game",
    "key": "game/crusher"
  },
  {
    "id": "plane",
    "name": "Vliegtuigje met piloot",
    "kind": "plane",
    "tileIds": [
      77
    ],
    "variant": "normal",
    "size": [
      26,
      26
    ],
    "movement": {
      "type": "fly",
      "speed": 100,
      "turnAtEdges": true,
      "amplitude": 18,
      "frequency": 2.4
    },
    "combat": {
      "health": 1,
      "contactDamage": true,
      "lethalContact": false,
      "stompable": true,
      "stompResponse": "damage",
      "fireResponse": "damage",
      "freezeable": true,
      "bubbleable": true,
      "hitCooldown": 0
    },
    "shooting": {
      "enabled": true,
      "projectile": "fire",
      "interval": 1.6,
      "speed": 0,
      "verticalSpeed": 70,
      "life": 6,
      "aim": "down"
    },
    "settings": {
      "chargeSeconds": 5,
      "jumpSpeed": 550,
      "tongueSeconds": 3,
      "tongueReach": 88,
      "reviveSeconds": 5,
      "fuseSeconds": 3,
      "triggerRange": 110,
      "angrySpeed": 190,
      "lookSeconds": 0.8,
      "restSeconds": 5,
      "riseSpeed": 90
    },
    "animations": {},
    "group": "game",
    "key": "game/plane"
  },
  {
    "id": "cloud",
    "name": "Stekeleiwolkje",
    "kind": "cloud",
    "tileIds": [
      82
    ],
    "variant": "normal",
    "size": [
      26,
      26
    ],
    "movement": {
      "type": "fly",
      "speed": 34,
      "turnAtEdges": true,
      "amplitude": 7,
      "frequency": 2
    },
    "combat": {
      "health": 1,
      "contactDamage": true,
      "lethalContact": false,
      "stompable": true,
      "stompResponse": "damage",
      "fireResponse": "damage",
      "freezeable": true,
      "bubbleable": true,
      "hitCooldown": 0
    },
    "shooting": {
      "enabled": true,
      "projectile": "spikeegg",
      "interval": 2,
      "speed": 0,
      "verticalSpeed": 70,
      "life": 12,
      "aim": "down"
    },
    "settings": {
      "chargeSeconds": 5,
      "jumpSpeed": 550,
      "tongueSeconds": 3,
      "tongueReach": 88,
      "reviveSeconds": 5,
      "fuseSeconds": 3,
      "triggerRange": 110,
      "angrySpeed": 190,
      "lookSeconds": 0.8,
      "restSeconds": 5,
      "riseSpeed": 90
    },
    "animations": {},
    "group": "game",
    "key": "game/cloud"
  },
  {
    "id": "centipede",
    "name": "Duizendpoot",
    "kind": "centipede",
    "tileIds": [
      83
    ],
    "variant": "normal",
    "size": [
      96,
      22
    ],
    "movement": {
      "type": "walk",
      "speed": 32,
      "turnAtEdges": true,
      "amplitude": 18,
      "frequency": 2.4
    },
    "combat": {
      "health": 1,
      "contactDamage": true,
      "lethalContact": false,
      "stompable": false,
      "stompResponse": "ride",
      "fireResponse": "damage",
      "freezeable": true,
      "bubbleable": true,
      "hitCooldown": 0
    },
    "shooting": {
      "enabled": false,
      "projectile": "fire",
      "interval": 2,
      "speed": 0,
      "verticalSpeed": 70,
      "life": 6,
      "aim": "down"
    },
    "settings": {
      "chargeSeconds": 5,
      "jumpSpeed": 550,
      "tongueSeconds": 3,
      "tongueReach": 88,
      "reviveSeconds": 5,
      "fuseSeconds": 3,
      "triggerRange": 110,
      "angrySpeed": 190,
      "lookSeconds": 0.8,
      "restSeconds": 5,
      "riseSpeed": 90
    },
    "animations": {},
    "group": "game",
    "key": "game/centipede"
  },
  {
    "id": "whale",
    "name": "Walvis",
    "kind": "whale",
    "tileIds": [
      85
    ],
    "variant": "normal",
    "size": [
      96,
      48
    ],
    "movement": {
      "type": "swim",
      "speed": 0,
      "turnAtEdges": true,
      "amplitude": 18,
      "frequency": 2.4
    },
    "combat": {
      "health": 1,
      "contactDamage": true,
      "lethalContact": false,
      "stompable": false,
      "stompResponse": "hurt",
      "fireResponse": "damage",
      "freezeable": true,
      "bubbleable": true,
      "hitCooldown": 0
    },
    "shooting": {
      "enabled": false,
      "projectile": "fire",
      "interval": 2,
      "speed": 0,
      "verticalSpeed": 70,
      "life": 6,
      "aim": "down"
    },
    "settings": {
      "chargeSeconds": 5,
      "jumpSpeed": 550,
      "tongueSeconds": 3,
      "tongueReach": 88,
      "reviveSeconds": 5,
      "fuseSeconds": 3,
      "triggerRange": 110,
      "angrySpeed": 190,
      "lookSeconds": 0.8,
      "restSeconds": 5,
      "riseSpeed": 90
    },
    "animations": {},
    "group": "game",
    "key": "game/whale"
  },
  {
    "id": "jellyfish",
    "name": "Kwalletje",
    "kind": "jellyfish",
    "tileIds": [
      86
    ],
    "variant": "normal",
    "size": [
      28,
      28
    ],
    "movement": {
      "type": "swim",
      "speed": 12,
      "turnAtEdges": true,
      "amplitude": 18,
      "frequency": 2.4
    },
    "combat": {
      "health": 1,
      "contactDamage": true,
      "lethalContact": false,
      "stompable": false,
      "stompResponse": "hurt",
      "fireResponse": "damage",
      "freezeable": true,
      "bubbleable": true,
      "hitCooldown": 0
    },
    "shooting": {
      "enabled": false,
      "projectile": "fire",
      "interval": 2,
      "speed": 0,
      "verticalSpeed": 70,
      "life": 6,
      "aim": "down"
    },
    "settings": {
      "chargeSeconds": 5,
      "jumpSpeed": 550,
      "tongueSeconds": 3,
      "tongueReach": 88,
      "reviveSeconds": 5,
      "fuseSeconds": 3,
      "triggerRange": 110,
      "angrySpeed": 190,
      "lookSeconds": 0.8,
      "restSeconds": 5,
      "riseSpeed": 90
    },
    "animations": {},
    "group": "game",
    "key": "game/jellyfish"
  },
  {
    "id": "bonefish",
    "name": "Skeletvis",
    "kind": "bonefish",
    "tileIds": [
      87
    ],
    "variant": "normal",
    "size": [
      28,
      28
    ],
    "movement": {
      "type": "swim",
      "speed": 24,
      "turnAtEdges": true,
      "amplitude": 18,
      "frequency": 2.4
    },
    "combat": {
      "health": 1,
      "contactDamage": true,
      "lethalContact": false,
      "stompable": false,
      "stompResponse": "hurt",
      "fireResponse": "damage",
      "freezeable": true,
      "bubbleable": true,
      "hitCooldown": 0
    },
    "shooting": {
      "enabled": false,
      "projectile": "fire",
      "interval": 2,
      "speed": 0,
      "verticalSpeed": 70,
      "life": 6,
      "aim": "down"
    },
    "settings": {
      "chargeSeconds": 5,
      "jumpSpeed": 550,
      "tongueSeconds": 3,
      "tongueReach": 88,
      "reviveSeconds": 5,
      "fuseSeconds": 3,
      "triggerRange": 110,
      "angrySpeed": 190,
      "lookSeconds": 0.8,
      "restSeconds": 5,
      "riseSpeed": 90
    },
    "animations": {},
    "group": "game",
    "key": "game/bonefish"
  },
  {
    "id": "squid",
    "name": "Inktvis",
    "kind": "squid",
    "tileIds": [
      88
    ],
    "variant": "normal",
    "size": [
      28,
      28
    ],
    "movement": {
      "type": "swim",
      "speed": 8,
      "turnAtEdges": true,
      "amplitude": 18,
      "frequency": 2.4
    },
    "combat": {
      "health": 1,
      "contactDamage": true,
      "lethalContact": false,
      "stompable": false,
      "stompResponse": "hurt",
      "fireResponse": "damage",
      "freezeable": true,
      "bubbleable": true,
      "hitCooldown": 0
    },
    "shooting": {
      "enabled": false,
      "projectile": "fire",
      "interval": 2,
      "speed": 0,
      "verticalSpeed": 70,
      "life": 6,
      "aim": "down"
    },
    "settings": {
      "chargeSeconds": 5,
      "jumpSpeed": 550,
      "tongueSeconds": 3,
      "tongueReach": 88,
      "reviveSeconds": 5,
      "fuseSeconds": 3,
      "triggerRange": 110,
      "angrySpeed": 190,
      "lookSeconds": 0.8,
      "restSeconds": 5,
      "riseSpeed": 90
    },
    "animations": {},
    "group": "game",
    "key": "game/squid"
  },
  {
    "id": "seaweed",
    "name": "Giftige waterplant",
    "kind": "seaweed",
    "tileIds": [
      91
    ],
    "variant": "normal",
    "size": [
      28,
      80
    ],
    "movement": {
      "type": "swim",
      "speed": 0,
      "turnAtEdges": true,
      "amplitude": 18,
      "frequency": 2.4
    },
    "combat": {
      "health": 1,
      "contactDamage": true,
      "lethalContact": false,
      "stompable": false,
      "stompResponse": "hurt",
      "fireResponse": "damage",
      "freezeable": true,
      "bubbleable": true,
      "hitCooldown": 0
    },
    "shooting": {
      "enabled": false,
      "projectile": "fire",
      "interval": 2,
      "speed": 0,
      "verticalSpeed": 70,
      "life": 6,
      "aim": "down"
    },
    "settings": {
      "chargeSeconds": 5,
      "jumpSpeed": 550,
      "tongueSeconds": 3,
      "tongueReach": 88,
      "reviveSeconds": 5,
      "fuseSeconds": 3,
      "triggerRange": 110,
      "angrySpeed": 190,
      "lookSeconds": 0.8,
      "restSeconds": 5,
      "riseSpeed": 90
    },
    "animations": {},
    "group": "game",
    "key": "game/seaweed"
  },
  {
    "id": "geyser",
    "name": "Onderwatergeiser",
    "kind": "geyser",
    "tileIds": [
      92
    ],
    "variant": "normal",
    "size": [
      32,
      24
    ],
    "movement": {
      "type": "swim",
      "speed": 0,
      "turnAtEdges": true,
      "amplitude": 18,
      "frequency": 2.4
    },
    "combat": {
      "health": 1,
      "contactDamage": false,
      "lethalContact": false,
      "stompable": false,
      "stompResponse": "hurt",
      "fireResponse": "damage",
      "freezeable": true,
      "bubbleable": true,
      "hitCooldown": 0
    },
    "shooting": {
      "enabled": false,
      "projectile": "fire",
      "interval": 2,
      "speed": 0,
      "verticalSpeed": 70,
      "life": 6,
      "aim": "down"
    },
    "settings": {
      "chargeSeconds": 5,
      "jumpSpeed": 550,
      "tongueSeconds": 3,
      "tongueReach": 88,
      "reviveSeconds": 5,
      "fuseSeconds": 3,
      "triggerRange": 110,
      "angrySpeed": 190,
      "lookSeconds": 0.8,
      "restSeconds": 5,
      "riseSpeed": 90
    },
    "animations": {},
    "group": "game",
    "key": "game/geyser"
  },
  {
    "id": "flatfish",
    "name": "Platvis",
    "kind": "flatfish",
    "tileIds": [
      93
    ],
    "variant": "normal",
    "size": [
      32,
      12
    ],
    "movement": {
      "type": "swim",
      "speed": 0,
      "turnAtEdges": true,
      "amplitude": 18,
      "frequency": 2.4
    },
    "combat": {
      "health": 1,
      "contactDamage": true,
      "lethalContact": false,
      "stompable": false,
      "stompResponse": "hurt",
      "fireResponse": "damage",
      "freezeable": true,
      "bubbleable": true,
      "hitCooldown": 0
    },
    "shooting": {
      "enabled": false,
      "projectile": "fire",
      "interval": 2,
      "speed": 0,
      "verticalSpeed": 70,
      "life": 6,
      "aim": "down"
    },
    "settings": {
      "chargeSeconds": 5,
      "jumpSpeed": 550,
      "tongueSeconds": 3,
      "tongueReach": 88,
      "reviveSeconds": 5,
      "fuseSeconds": 3,
      "triggerRange": 110,
      "angrySpeed": 190,
      "lookSeconds": 0.8,
      "restSeconds": 5,
      "riseSpeed": 90
    },
    "animations": {},
    "group": "game",
    "key": "game/flatfish"
  },
  {
    "id": "moray",
    "name": "Murene in kruik",
    "kind": "moray",
    "tileIds": [
      94
    ],
    "variant": "normal",
    "size": [
      32,
      32
    ],
    "movement": {
      "type": "swim",
      "speed": 0,
      "turnAtEdges": true,
      "amplitude": 18,
      "frequency": 2.4
    },
    "combat": {
      "health": 1,
      "contactDamage": true,
      "lethalContact": false,
      "stompable": false,
      "stompResponse": "hurt",
      "fireResponse": "damage",
      "freezeable": true,
      "bubbleable": true,
      "hitCooldown": 0
    },
    "shooting": {
      "enabled": false,
      "projectile": "fire",
      "interval": 2,
      "speed": 0,
      "verticalSpeed": 70,
      "life": 6,
      "aim": "down"
    },
    "settings": {
      "chargeSeconds": 5,
      "jumpSpeed": 550,
      "tongueSeconds": 3,
      "tongueReach": 88,
      "reviveSeconds": 5,
      "fuseSeconds": 3,
      "triggerRange": 110,
      "angrySpeed": 190,
      "lookSeconds": 0.8,
      "restSeconds": 5,
      "riseSpeed": 90
    },
    "animations": {},
    "group": "game",
    "key": "game/moray"
  },
  {
    "id": "seastar",
    "name": "Boze zeester",
    "kind": "seastar",
    "tileIds": [
      95
    ],
    "variant": "normal",
    "size": [
      28,
      28
    ],
    "movement": {
      "type": "swim",
      "speed": 23,
      "turnAtEdges": true,
      "amplitude": 18,
      "frequency": 2.4
    },
    "combat": {
      "health": 1,
      "contactDamage": true,
      "lethalContact": false,
      "stompable": false,
      "stompResponse": "hurt",
      "fireResponse": "damage",
      "freezeable": true,
      "bubbleable": true,
      "hitCooldown": 0
    },
    "shooting": {
      "enabled": false,
      "projectile": "fire",
      "interval": 2,
      "speed": 0,
      "verticalSpeed": 70,
      "life": 6,
      "aim": "down"
    },
    "settings": {
      "chargeSeconds": 5,
      "jumpSpeed": 550,
      "tongueSeconds": 3,
      "tongueReach": 88,
      "reviveSeconds": 5,
      "fuseSeconds": 3,
      "triggerRange": 110,
      "angrySpeed": 190,
      "lookSeconds": 0.8,
      "restSeconds": 5,
      "riseSpeed": 90
    },
    "animations": {},
    "group": "game",
    "key": "game/seastar"
  },
  {
    "id": "crab",
    "name": "Krab",
    "kind": "crab",
    "tileIds": [
      96
    ],
    "variant": "normal",
    "size": [
      32,
      20
    ],
    "movement": {
      "type": "swim",
      "speed": 28,
      "turnAtEdges": true,
      "amplitude": 18,
      "frequency": 2.4
    },
    "combat": {
      "health": 1,
      "contactDamage": true,
      "lethalContact": false,
      "stompable": false,
      "stompResponse": "hurt",
      "fireResponse": "damage",
      "freezeable": true,
      "bubbleable": true,
      "hitCooldown": 0
    },
    "shooting": {
      "enabled": false,
      "projectile": "fire",
      "interval": 2,
      "speed": 0,
      "verticalSpeed": 70,
      "life": 6,
      "aim": "down"
    },
    "settings": {
      "chargeSeconds": 5,
      "jumpSpeed": 550,
      "tongueSeconds": 3,
      "tongueReach": 88,
      "reviveSeconds": 5,
      "fuseSeconds": 3,
      "triggerRange": 110,
      "angrySpeed": 190,
      "lookSeconds": 0.8,
      "restSeconds": 5,
      "riseSpeed": 90
    },
    "animations": {},
    "group": "game",
    "key": "game/crab"
  },
  {
    "id": "beetle",
    "name": "Helmtor",
    "kind": "beetle",
    "tileIds": [
      97
    ],
    "variant": "normal",
    "size": [
      26,
      26
    ],
    "movement": {
      "type": "walk",
      "speed": 40,
      "turnAtEdges": true,
      "amplitude": 18,
      "frequency": 2.4
    },
    "combat": {
      "health": 1,
      "contactDamage": true,
      "lethalContact": false,
      "stompable": true,
      "stompResponse": "fold",
      "fireResponse": "damage",
      "freezeable": true,
      "bubbleable": true,
      "hitCooldown": 0
    },
    "shooting": {
      "enabled": false,
      "projectile": "fire",
      "interval": 2,
      "speed": 0,
      "verticalSpeed": 70,
      "life": 6,
      "aim": "down"
    },
    "settings": {
      "chargeSeconds": 5,
      "jumpSpeed": 550,
      "tongueSeconds": 3,
      "tongueReach": 88,
      "reviveSeconds": 3,
      "fuseSeconds": 3,
      "triggerRange": 110,
      "angrySpeed": 190,
      "lookSeconds": 0.8,
      "restSeconds": 5,
      "riseSpeed": 90
    },
    "animations": {},
    "group": "game",
    "key": "game/beetle"
  },
  {
    "id": "spikedbeetle",
    "name": "Helmtor met punt",
    "kind": "spikedbeetle",
    "tileIds": [
      98
    ],
    "variant": "normal",
    "size": [
      26,
      26
    ],
    "movement": {
      "type": "walk",
      "speed": 40,
      "turnAtEdges": true,
      "amplitude": 18,
      "frequency": 2.4
    },
    "combat": {
      "health": 1,
      "contactDamage": true,
      "lethalContact": false,
      "stompable": false,
      "stompResponse": "hurt",
      "fireResponse": "damage",
      "freezeable": true,
      "bubbleable": true,
      "hitCooldown": 0
    },
    "shooting": {
      "enabled": false,
      "projectile": "fire",
      "interval": 2,
      "speed": 0,
      "verticalSpeed": 70,
      "life": 6,
      "aim": "down"
    },
    "settings": {
      "chargeSeconds": 5,
      "jumpSpeed": 550,
      "tongueSeconds": 3,
      "tongueReach": 88,
      "reviveSeconds": 5,
      "fuseSeconds": 3,
      "triggerRange": 110,
      "angrySpeed": 190,
      "lookSeconds": 0.8,
      "restSeconds": 5,
      "riseSpeed": 90
    },
    "animations": {},
    "group": "game",
    "key": "game/spikedbeetle"
  },
  {
    "id": "blubberus",
    "name": "Blubberus the Slime King",
    "kind": "wonder",
    "wonderType": 0,
    "tileIds": [],
    "size": [
      36,
      25
    ],
    "movement": {
      "type": "walk",
      "speed": 36,
      "turnAtEdges": true,
      "amplitude": 8,
      "frequency": 1.8
    },
    "combat": {
      "health": 1,
      "contactDamage": true,
      "lethalContact": false,
      "stompable": true,
      "stompResponse": "damage",
      "fireResponse": "damage",
      "freezeable": true,
      "bubbleable": true,
      "hitCooldown": 0.15
    },
    "shooting": {
      "enabled": false,
      "projectile": "wonder",
      "interval": 1.5,
      "speed": 0,
      "verticalSpeed": 0,
      "life": 2.5,
      "aim": "player"
    },
    "settings": {
      "jumpInterval": 1.8,
      "jumpSpeed": 210
    },
    "animations": {},
    "group": "game",
    "key": "game/blubberus"
  },
  {
    "id": "wafzilla",
    "name": "Wafzilla the Terrible",
    "kind": "wonder",
    "wonderType": 1,
    "tileIds": [],
    "size": [
      24,
      34
    ],
    "movement": {
      "type": "walk",
      "speed": 45,
      "turnAtEdges": true,
      "amplitude": 8,
      "frequency": 1.8
    },
    "combat": {
      "health": 1,
      "contactDamage": true,
      "lethalContact": false,
      "stompable": true,
      "stompResponse": "damage",
      "fireResponse": "damage",
      "freezeable": true,
      "bubbleable": true,
      "hitCooldown": 0.15
    },
    "shooting": {
      "enabled": false,
      "projectile": "wonder",
      "interval": 1.5,
      "speed": 0,
      "verticalSpeed": 0,
      "life": 2.5,
      "aim": "player"
    },
    "settings": {
      "jumpInterval": 1.8,
      "jumpSpeed": 210
    },
    "animations": {},
    "group": "game",
    "key": "game/wafzilla"
  },
  {
    "id": "sockstein",
    "name": "Sockstein",
    "kind": "wonder",
    "wonderType": 2,
    "tileIds": [],
    "size": [
      28,
      34
    ],
    "movement": {
      "type": "walk",
      "speed": 36,
      "turnAtEdges": true,
      "amplitude": 8,
      "frequency": 1.8
    },
    "combat": {
      "health": 1,
      "contactDamage": true,
      "lethalContact": false,
      "stompable": true,
      "stompResponse": "damage",
      "fireResponse": "damage",
      "freezeable": true,
      "bubbleable": true,
      "hitCooldown": 0.15
    },
    "shooting": {
      "enabled": false,
      "projectile": "wonder",
      "interval": 1.5,
      "speed": 0,
      "verticalSpeed": 0,
      "life": 2.5,
      "aim": "player"
    },
    "settings": {
      "jumpInterval": 1.8,
      "jumpSpeed": 210
    },
    "animations": {},
    "group": "game",
    "key": "game/sockstein"
  },
  {
    "id": "tick-tock",
    "name": "Tick-Tock the Time Eater",
    "kind": "wonder",
    "wonderType": 3,
    "tileIds": [],
    "size": [
      23,
      34
    ],
    "movement": {
      "type": "walk",
      "speed": 28,
      "turnAtEdges": true,
      "amplitude": 8,
      "frequency": 1.8
    },
    "combat": {
      "health": 1,
      "contactDamage": true,
      "lethalContact": false,
      "stompable": true,
      "stompResponse": "damage",
      "fireResponse": "damage",
      "freezeable": true,
      "bubbleable": true,
      "hitCooldown": 0.15
    },
    "shooting": {
      "enabled": false,
      "projectile": "wonder",
      "interval": 1.5,
      "speed": 0,
      "verticalSpeed": 0,
      "life": 2.5,
      "aim": "player"
    },
    "settings": {
      "jumpInterval": 1.8,
      "jumpSpeed": 210
    },
    "animations": {},
    "group": "game",
    "key": "game/tick-tock"
  },
  {
    "id": "dj-thunderfluff",
    "name": "DJ Thunderfluff",
    "kind": "wonder",
    "wonderType": 4,
    "tileIds": [],
    "size": [
      36,
      25
    ],
    "movement": {
      "type": "fly",
      "speed": 36,
      "turnAtEdges": true,
      "amplitude": 8,
      "frequency": 3
    },
    "combat": {
      "health": 1,
      "contactDamage": true,
      "lethalContact": false,
      "stompable": true,
      "stompResponse": "damage",
      "fireResponse": "damage",
      "freezeable": true,
      "bubbleable": true,
      "hitCooldown": 0.15
    },
    "shooting": {
      "enabled": false,
      "projectile": "wonder",
      "interval": 1.5,
      "speed": 0,
      "verticalSpeed": 0,
      "life": 2.5,
      "aim": "player"
    },
    "settings": {
      "jumpInterval": 1.8,
      "jumpSpeed": 210
    },
    "animations": {},
    "group": "game",
    "key": "game/dj-thunderfluff"
  },
  {
    "id": "crumblecastle",
    "name": "Crumblecastle the Walking Fortress",
    "kind": "wonder",
    "wonderType": 5,
    "tileIds": [],
    "size": [
      32,
      34
    ],
    "movement": {
      "type": "walk",
      "speed": 36,
      "turnAtEdges": true,
      "amplitude": 8,
      "frequency": 1.8
    },
    "combat": {
      "health": 1,
      "contactDamage": true,
      "lethalContact": false,
      "stompable": true,
      "stompResponse": "damage",
      "fireResponse": "damage",
      "freezeable": true,
      "bubbleable": true,
      "hitCooldown": 0.15
    },
    "shooting": {
      "enabled": false,
      "projectile": "wonder",
      "interval": 1.5,
      "speed": 0,
      "verticalSpeed": 0,
      "life": 2.5,
      "aim": "player"
    },
    "settings": {
      "jumpInterval": 1.8,
      "jumpSpeed": 210
    },
    "animations": {},
    "group": "game",
    "key": "game/crumblecastle"
  },
  {
    "id": "princess-mirrorphantom",
    "name": "Princess Mirrorphantom",
    "kind": "wonder",
    "wonderType": 6,
    "tileIds": [],
    "size": [
      38,
      26
    ],
    "movement": {
      "type": "fly",
      "speed": 36,
      "turnAtEdges": true,
      "amplitude": 8,
      "frequency": 1.8
    },
    "combat": {
      "health": 1,
      "contactDamage": true,
      "lethalContact": false,
      "stompable": true,
      "stompResponse": "damage",
      "fireResponse": "damage",
      "freezeable": true,
      "bubbleable": true,
      "hitCooldown": 0.15
    },
    "shooting": {
      "enabled": false,
      "projectile": "wonder",
      "interval": 1.5,
      "speed": 0,
      "verticalSpeed": 0,
      "life": 2.5,
      "aim": "player"
    },
    "settings": {
      "jumpInterval": 1.8,
      "jumpSpeed": 210
    },
    "animations": {},
    "group": "game",
    "key": "game/princess-mirrorphantom"
  },
  {
    "id": "emperor-wobbleflap",
    "name": "Emperor Wobbleflap the Everything-Eater",
    "kind": "wonder",
    "wonderType": 7,
    "tileIds": [],
    "size": [
      36,
      34
    ],
    "movement": {
      "type": "walk",
      "speed": 36,
      "turnAtEdges": true,
      "amplitude": 8,
      "frequency": 1.8
    },
    "combat": {
      "health": 1,
      "contactDamage": true,
      "lethalContact": false,
      "stompable": true,
      "stompResponse": "damage",
      "fireResponse": "damage",
      "freezeable": true,
      "bubbleable": true,
      "hitCooldown": 0.15
    },
    "shooting": {
      "enabled": false,
      "projectile": "wonder",
      "interval": 1.5,
      "speed": 0,
      "verticalSpeed": 0,
      "life": 2.5,
      "aim": "player"
    },
    "settings": {
      "jumpInterval": 1.8,
      "jumpSpeed": 210
    },
    "animations": {},
    "group": "game",
    "key": "game/emperor-wobbleflap"
  },
  {
    "id": "blubberus",
    "name": "Blubberus the Slime King",
    "kind": "wonder",
    "wonderType": 0,
    "tileIds": [],
    "size": [
      86,
      60
    ],
    "movement": {
      "type": "walk",
      "speed": 75,
      "turnAtEdges": true,
      "amplitude": 8,
      "frequency": 1.8
    },
    "combat": {
      "health": 3,
      "contactDamage": true,
      "lethalContact": false,
      "stompable": true,
      "stompResponse": "damage",
      "fireResponse": "damage",
      "freezeable": false,
      "bubbleable": false,
      "hitCooldown": 0.7
    },
    "shooting": {
      "enabled": true,
      "projectile": "wonder",
      "interval": 1.5,
      "speed": 0,
      "verticalSpeed": 0,
      "life": 2.5,
      "aim": "player"
    },
    "settings": {
      "jumpInterval": 1.8,
      "jumpSpeed": 210
    },
    "boss": {
      "restSeconds": 1.4,
      "warningSeconds": 1.5,
      "attackSeconds": 1.2,
      "exposedSeconds": 5
    },
    "metadata": {
      "id": "blubberus",
      "number": 1,
      "name": "Blubberus the Slime King",
      "realm": "The Slime Kingdom",
      "primary_color": "#8D42EF",
      "secondary_color": "#B99AFF",
      "accent_color": "#F7C746",
      "silhouette": "wide seven-eyed jelly blob with golden crown",
      "materials": [
        "translucent jelly",
        "polished crown metal"
      ],
      "signature_animation": "wobble and bounce",
      "arena_feature": "wobbling jelly tiles",
      "attacks": [
        "Royal Belly Flop",
        "Mini-Me Mayhem",
        "Super Sneeze"
      ],
      "weakness": "Hit the crown when it flies off during a sneeze.",
      "hit_windows": 3,
      "reward_ability": "Slime Bounce",
      "defeat_form": "a giggling jelly mound",
      "boss_file": "bosses/01-blubberus-the-slime-king.md"
    },
    "animations": {},
    "group": "bosses",
    "key": "bosses/blubberus"
  },
  {
    "id": "wafzilla",
    "name": "Wafzilla the Terrible",
    "kind": "wonder",
    "wonderType": 1,
    "tileIds": [],
    "size": [
      58,
      82
    ],
    "movement": {
      "type": "walk",
      "speed": 75,
      "turnAtEdges": true,
      "amplitude": 8,
      "frequency": 1.8
    },
    "combat": {
      "health": 3,
      "contactDamage": true,
      "lethalContact": false,
      "stompable": true,
      "stompResponse": "damage",
      "fireResponse": "damage",
      "freezeable": false,
      "bubbleable": false,
      "hitCooldown": 0.7
    },
    "shooting": {
      "enabled": true,
      "projectile": "wonder",
      "interval": 1.5,
      "speed": 0,
      "verticalSpeed": 0,
      "life": 2.5,
      "aim": "player"
    },
    "settings": {
      "jumpInterval": 1.8,
      "jumpSpeed": 210
    },
    "boss": {
      "restSeconds": 1.4,
      "warningSeconds": 1.5,
      "attackSeconds": 1.2,
      "exposedSeconds": 5
    },
    "metadata": {
      "id": "wafzilla",
      "number": 2,
      "name": "Wafzilla the Terrible",
      "realm": "The Candy Castle",
      "primary_color": "#DF9F39",
      "secondary_color": "#FFF0D9",
      "accent_color": "#E8425A",
      "silhouette": "tall rectangular waffle with syrup cannons and butter feet",
      "materials": [
        "crisp waffle",
        "whipped cream",
        "sticky syrup"
      ],
      "signature_animation": "slip and skate",
      "arena_feature": "swinging spoon bridges and pancake platforms",
      "attacks": [
        "Syrup Splash",
        "Flying Pancake",
        "Breakfast Rush"
      ],
      "weakness": "Knock butter beneath his feet to make him slip, then hit the waffle emblem.",
      "hit_windows": 3,
      "reward_ability": "Syrup Swing",
      "defeat_form": "a stack of smiling tiny waffles",
      "boss_file": "bosses/02-wafzilla-the-terrible.md"
    },
    "animations": {},
    "group": "bosses",
    "key": "bosses/wafzilla"
  },
  {
    "id": "sockstein",
    "name": "Sockstein",
    "kind": "wonder",
    "wonderType": 2,
    "tileIds": [],
    "size": [
      67,
      82
    ],
    "movement": {
      "type": "walk",
      "speed": 75,
      "turnAtEdges": true,
      "amplitude": 8,
      "frequency": 1.8
    },
    "combat": {
      "health": 3,
      "contactDamage": true,
      "lethalContact": false,
      "stompable": true,
      "stompResponse": "damage",
      "fireResponse": "damage",
      "freezeable": false,
      "bubbleable": false,
      "hitCooldown": 0.7
    },
    "shooting": {
      "enabled": true,
      "projectile": "wonder",
      "interval": 1.5,
      "speed": 0,
      "verticalSpeed": 0,
      "life": 2.5,
      "aim": "player"
    },
    "settings": {
      "jumpInterval": 1.8,
      "jumpSpeed": 210
    },
    "boss": {
      "restSeconds": 1.4,
      "warningSeconds": 1.5,
      "attackSeconds": 1.2,
      "exposedSeconds": 5
    },
    "metadata": {
      "id": "sockstein",
      "number": 3,
      "name": "Sockstein",
      "realm": "Lost Sock Island",
      "primary_color": "#1FA9A2",
      "secondary_color": "#4D6CB5",
      "accent_color": "#F68D43",
      "silhouette": "gangly patchwork figure with eight knitted arms",
      "materials": [
        "knitted sock fabric",
        "stitched seams"
      ],
      "signature_animation": "flail and spiral",
      "arena_feature": "rotating clothesline bridges and giant washing machine",
      "attacks": [
        "Stinky Sock Toss",
        "Vacuum Vortex",
        "Eight-Arm Whirl"
      ],
      "weakness": "Activate the washing machine to make him dizzy and remove his sock helmet.",
      "hit_windows": 3,
      "reward_ability": "Sock Cyclone",
      "defeat_form": "a friendly conga line of paired socks",
      "boss_file": "bosses/03-sockstein.md"
    },
    "animations": {},
    "group": "bosses",
    "key": "bosses/sockstein"
  },
  {
    "id": "tick-tock",
    "name": "Tick-Tock the Time Eater",
    "kind": "wonder",
    "wonderType": 3,
    "tileIds": [],
    "size": [
      55,
      82
    ],
    "movement": {
      "type": "walk",
      "speed": 75,
      "turnAtEdges": true,
      "amplitude": 8,
      "frequency": 1.8
    },
    "combat": {
      "health": 3,
      "contactDamage": true,
      "lethalContact": false,
      "stompable": true,
      "stompResponse": "damage",
      "fireResponse": "damage",
      "freezeable": false,
      "bubbleable": false,
      "hitCooldown": 0.7
    },
    "shooting": {
      "enabled": true,
      "projectile": "wonder",
      "interval": 1.5,
      "speed": 0,
      "verticalSpeed": 0,
      "life": 2.5,
      "aim": "player"
    },
    "settings": {
      "jumpInterval": 1.8,
      "jumpSpeed": 210
    },
    "boss": {
      "restSeconds": 1.4,
      "warningSeconds": 1.5,
      "attackSeconds": 1.2,
      "exposedSeconds": 5
    },
    "metadata": {
      "id": "tick_tock",
      "number": 4,
      "name": "Tick-Tock the Time Eater",
      "realm": "The Backwards Clockwork",
      "primary_color": "#B48A41",
      "secondary_color": "#41C3C0",
      "accent_color": "#FF6D5A",
      "silhouette": "tall alarm clock with twelve clock-hand arms and spring legs",
      "materials": [
        "antique brass",
        "glass",
        "painted gears"
      ],
      "signature_animation": "tick, stretch and spring",
      "arena_feature": "swinging pendulum tiles on a giant clock face",
      "attacks": [
        "Minute-Hand Sweep",
        "Tick-Tock Freeze",
        "Backwards Hour"
      ],
      "weakness": "Press the red alarm button when both clock hands point to twelve.",
      "hit_windows": 3,
      "reward_ability": "Time Pause",
      "defeat_form": "a polite little pocket watch",
      "boss_file": "bosses/04-tick-tock-the-time-eater.md"
    },
    "animations": {},
    "group": "bosses",
    "key": "bosses/tick-tock"
  },
  {
    "id": "dj-thunderfluff",
    "name": "DJ Thunderfluff",
    "kind": "wonder",
    "wonderType": 4,
    "tileIds": [],
    "size": [
      86,
      60
    ],
    "movement": {
      "type": "fly",
      "speed": 75,
      "turnAtEdges": true,
      "amplitude": 8,
      "frequency": 3
    },
    "combat": {
      "health": 3,
      "contactDamage": true,
      "lethalContact": false,
      "stompable": true,
      "stompResponse": "damage",
      "fireResponse": "damage",
      "freezeable": false,
      "bubbleable": false,
      "hitCooldown": 0.7
    },
    "shooting": {
      "enabled": true,
      "projectile": "wonder",
      "interval": 1.5,
      "speed": 0,
      "verticalSpeed": 0,
      "life": 2.5,
      "aim": "player"
    },
    "settings": {
      "jumpInterval": 1.8,
      "jumpSpeed": 210
    },
    "boss": {
      "restSeconds": 1.4,
      "warningSeconds": 1.5,
      "attackSeconds": 1.2,
      "exposedSeconds": 5
    },
    "metadata": {
      "id": "dj_thunderfluff",
      "number": 5,
      "name": "DJ Thunderfluff",
      "realm": "Thunder Disco",
      "primary_color": "#F76FB9",
      "secondary_color": "#3ADCF3",
      "accent_color": "#31304C",
      "silhouette": "round floating pink thundercloud with sunglasses and speaker mittens",
      "materials": [
        "soft cloud fluff",
        "glossy sunglasses",
        "electric lightning"
      ],
      "signature_animation": "pulse and bob to a beat",
      "arena_feature": "swaying dance-floor tiles",
      "attacks": [
        "Lightning Beat",
        "Bass Blast",
        "Dance-Off"
      ],
      "weakness": "Repeat a visible four-step dance sequence to trigger confetti.",
      "hit_windows": 3,
      "reward_ability": "Beat Dash",
      "defeat_form": "a friendly DJ cloud",
      "boss_file": "bosses/05-dj-thunderfluff.md"
    },
    "animations": {},
    "group": "bosses",
    "key": "bosses/dj-thunderfluff"
  },
  {
    "id": "crumblecastle",
    "name": "Crumblecastle the Walking Fortress",
    "kind": "wonder",
    "wonderType": 5,
    "tileIds": [],
    "size": [
      77,
      82
    ],
    "movement": {
      "type": "walk",
      "speed": 75,
      "turnAtEdges": true,
      "amplitude": 8,
      "frequency": 1.8
    },
    "combat": {
      "health": 3,
      "contactDamage": true,
      "lethalContact": false,
      "stompable": true,
      "stompResponse": "damage",
      "fireResponse": "damage",
      "freezeable": false,
      "bubbleable": false,
      "hitCooldown": 0.7
    },
    "shooting": {
      "enabled": true,
      "projectile": "wonder",
      "interval": 1.5,
      "speed": 0,
      "verticalSpeed": 0,
      "life": 2.5,
      "aim": "player"
    },
    "settings": {
      "jumpInterval": 1.8,
      "jumpSpeed": 210
    },
    "boss": {
      "restSeconds": 1.4,
      "warningSeconds": 1.5,
      "attackSeconds": 1.2,
      "exposedSeconds": 5
    },
    "metadata": {
      "id": "crumblecastle",
      "number": 6,
      "name": "Crumblecastle the Walking Fortress",
      "realm": "The Wandering Castle",
      "primary_color": "#5F9660",
      "secondary_color": "#C2AE80",
      "accent_color": "#AA3B48",
      "silhouette": "asymmetric castle with towers, drawbridge mouth and four chicken legs",
      "materials": [
        "moss-covered masonry",
        "wooden drawbridge",
        "fabric flag"
      ],
      "signature_animation": "cluck and stomp",
      "arena_feature": "wobbling flagstones and changing bridges",
      "attacks": [
        "Furniture Cannon",
        "Chicken-Leg Stomp",
        "Drawbridge Chomp"
      ],
      "weakness": "Climb his lowered leg and pull the red flag from the tallest tower.",
      "hit_windows": 3,
      "reward_ability": "Castle Stomp",
      "defeat_form": "a cozy small playhouse",
      "boss_file": "bosses/06-crumblecastle-the-walking-fortress.md"
    },
    "animations": {},
    "group": "bosses",
    "key": "bosses/crumblecastle"
  },
  {
    "id": "princess-mirrorphantom",
    "name": "Princess Mirrorphantom",
    "kind": "wonder",
    "wonderType": 6,
    "tileIds": [],
    "size": [
      91,
      62
    ],
    "movement": {
      "type": "fly",
      "speed": 75,
      "turnAtEdges": true,
      "amplitude": 8,
      "frequency": 1.8
    },
    "combat": {
      "health": 3,
      "contactDamage": true,
      "lethalContact": false,
      "stompable": true,
      "stompResponse": "damage",
      "fireResponse": "damage",
      "freezeable": false,
      "bubbleable": false,
      "hitCooldown": 0.7
    },
    "shooting": {
      "enabled": true,
      "projectile": "wonder",
      "interval": 1.5,
      "speed": 0,
      "verticalSpeed": 0,
      "life": 2.5,
      "aim": "player"
    },
    "settings": {
      "jumpInterval": 1.8,
      "jumpSpeed": 210
    },
    "boss": {
      "restSeconds": 1.4,
      "warningSeconds": 1.5,
      "attackSeconds": 1.2,
      "exposedSeconds": 5
    },
    "metadata": {
      "id": "princess_mirrorphantom",
      "number": 7,
      "name": "Princess Mirrorphantom",
      "realm": "The Mirror Palace",
      "primary_color": "#BDC6DE",
      "secondary_color": "#A28CDF",
      "accent_color": "#265FD1",
      "silhouette": "long chameleon with three faces, faceted mirror wings and coiled tail",
      "materials": [
        "shimmering scales",
        "faceted mirrors"
      ],
      "signature_animation": "glide and shimmer",
      "arena_feature": "swinging mirror tiles and rotating reflection panels",
      "attacks": [
        "Mirror Multiplication",
        "Invisible Spin",
        "Reflection Shuffle"
      ],
      "weakness": "Find the one reflection with a red nose, then activate the mirror button.",
      "hit_windows": 3,
      "reward_ability": "Mirror Twin",
      "defeat_form": "a friendly princess with silly mirror faces",
      "boss_file": "bosses/07-princess-mirrorphantom.md"
    },
    "animations": {},
    "group": "bosses",
    "key": "bosses/princess-mirrorphantom"
  },
  {
    "id": "emperor-wobbleflap",
    "name": "Emperor Wobbleflap the Everything-Eater",
    "kind": "wonder",
    "wonderType": 7,
    "tileIds": [],
    "size": [
      86,
      82
    ],
    "movement": {
      "type": "walk",
      "speed": 75,
      "turnAtEdges": true,
      "amplitude": 8,
      "frequency": 1.8
    },
    "combat": {
      "health": 7,
      "contactDamage": true,
      "lethalContact": false,
      "stompable": true,
      "stompResponse": "damage",
      "fireResponse": "damage",
      "freezeable": false,
      "bubbleable": false,
      "hitCooldown": 0.7
    },
    "shooting": {
      "enabled": true,
      "projectile": "wonder",
      "interval": 1.5,
      "speed": 0,
      "verticalSpeed": 0,
      "life": 2.5,
      "aim": "player"
    },
    "settings": {
      "jumpInterval": 1.8,
      "jumpSpeed": 210
    },
    "boss": {
      "restSeconds": 1.4,
      "warningSeconds": 1.5,
      "attackSeconds": 1.2,
      "exposedSeconds": 5
    },
    "metadata": {
      "id": "emperor_wobbleflap",
      "number": 8,
      "name": "Emperor Wobbleflap the Everything-Eater",
      "realm": "The Edge of Wonderland",
      "primary_color": "#24235F",
      "secondary_color": "#5E378A",
      "accent_color": "seven distinct rainbow gemstones",
      "silhouette": "huge three-headed six-armed figure with a starry belly and floating crown",
      "materials": [
        "soft indigo hide",
        "star-field belly",
        "glowing gemstones"
      ],
      "signature_animation": "transform and wobble",
      "arena_feature": "patchwork platform with seven previous-realm mechanics",
      "attacks": [
        "Slime and Syrup Remix",
        "Clock and Thunder Remix",
        "Castle and Mirror Remix"
      ],
      "weakness": "Use the seven unlocked abilities to remove the seven crown gems, then cooperate on two switches.",
      "hit_windows": 7,
      "reward_ability": "Wonderland Restored",
      "defeat_form": "a tiny white bunny",
      "boss_file": "bosses/08-emperor-wobbleflap.md"
    },
    "animations": {},
    "group": "bosses",
    "key": "bosses/emperor-wobbleflap"
  },
  {
    "id": "castle-king",
    "name": "Kasteelkoning",
    "kind": "spiky",
    "tileIds": [],
    "size": [
      52,
      48
    ],
    "movement": {
      "type": "walk",
      "speed": 26,
      "turnAtEdges": true,
      "amplitude": 18,
      "frequency": 2.4
    },
    "combat": {
      "health": 5,
      "contactDamage": true,
      "lethalContact": false,
      "stompable": false,
      "stompResponse": "hurt",
      "fireResponse": "damage",
      "freezeable": true,
      "bubbleable": true,
      "hitCooldown": 0.15
    },
    "shooting": {
      "enabled": false,
      "projectile": "fire",
      "interval": 2,
      "speed": 160,
      "verticalSpeed": 0,
      "life": 3,
      "aim": "player"
    },
    "settings": {},
    "animations": {},
    "group": "bosses",
    "key": "bosses/castle-king"
  },
  {
    "id": "lava-king",
    "name": "Lavakoning",
    "kind": "spiky",
    "tileIds": [],
    "size": [
      52,
      48
    ],
    "movement": {
      "type": "walk",
      "speed": 26,
      "turnAtEdges": true,
      "amplitude": 18,
      "frequency": 2.4
    },
    "combat": {
      "health": 9,
      "contactDamage": true,
      "lethalContact": false,
      "stompable": false,
      "stompResponse": "hurt",
      "fireResponse": "damage",
      "freezeable": true,
      "bubbleable": true,
      "hitCooldown": 0.15
    },
    "shooting": {
      "enabled": false,
      "projectile": "fire",
      "interval": 2,
      "speed": 160,
      "verticalSpeed": 0,
      "life": 3,
      "aim": "player"
    },
    "settings": {},
    "animations": {},
    "group": "bosses",
    "key": "bosses/lava-king"
  }
];
