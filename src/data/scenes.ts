export interface Choice {
  text: string;
  lightPoints: number;
  shadowPoints: number;
  reflectionText: string;
}

export interface Scene {
  id: number;
  title: string;
  narrative: string;
  choices: Choice[];
}

export const scenes: Scene[] = [
  {
    id: 1,
    title: "The Threshold of Solstice",
    narrative:
      "You awaken at the longest twilight of the year. Before you, a path splits — one trail glows with golden dawn, the other shimmers with quiet moonlight. A voice within whispers: 'Which self will you become?'",
    choices: [
      {
        text: "Step toward the warm sunrise",
        lightPoints: 2,
        shadowPoints: 0,
        reflectionText: "Your light grows stronger.",
      },
      {
        text: "Walk into the silver moonlight",
        lightPoints: 0,
        shadowPoints: 2,
        reflectionText: "The shadow remembers.",
      },
      {
        text: "Stand still and listen to the wind",
        lightPoints: 1,
        shadowPoints: 1,
        reflectionText: "Balance begins to form.",
      },
    ],
  },
  {
    id: 2,
    title: "The Mirror Lake",
    narrative:
      "A still lake reflects a face that is yours — and yet, not. The reflection raises a hand before you do. It asks you to name a truth you've hidden, even from yourself.",
    choices: [
      {
        text: "Speak the truth aloud to the sky",
        lightPoints: 2,
        shadowPoints: 0,
        reflectionText: "Your light grows stronger.",
      },
      {
        text: "Whisper it to the dark water",
        lightPoints: 0,
        shadowPoints: 2,
        reflectionText: "The shadow remembers.",
      },
      {
        text: "Write it in the sand, let the tide decide",
        lightPoints: 1,
        shadowPoints: 1,
        reflectionText: "Balance begins to form.",
      },
    ],
  },
  {
    id: 3,
    title: "The Wandering Stranger",
    narrative:
      "A traveler stumbles from the forest, hollow-eyed and trembling. They carry a lantern with a dying flame and beg you for a portion of your own light.",
    choices: [
      {
        text: "Give them half of your flame",
        lightPoints: 3,
        shadowPoints: 0,
        reflectionText: "Your light grows stronger.",
      },
      {
        text: "Take their lantern for yourself",
        lightPoints: 0,
        shadowPoints: 3,
        reflectionText: "The shadow remembers.",
      },
      {
        text: "Walk beside them, sharing the path",
        lightPoints: 1,
        shadowPoints: 1,
        reflectionText: "Balance begins to form.",
      },
    ],
  },
  {
    id: 4,
    title: "The Hour That Forgot Itself",
    narrative:
      "Time slips. You stand in a memory you swore you'd left behind — a moment you wish you could rewrite. The choice from that day stands again before you.",
    choices: [
      {
        text: "Forgive the version of you who chose poorly",
        lightPoints: 2,
        shadowPoints: 1,
        reflectionText: "Your light grows stronger.",
      },
      {
        text: "Hold the grudge — let it sharpen you",
        lightPoints: 0,
        shadowPoints: 3,
        reflectionText: "The shadow remembers.",
      },
      {
        text: "Sit with the memory, neither fighting nor fleeing",
        lightPoints: 1,
        shadowPoints: 1,
        reflectionText: "Balance begins to form.",
      },
    ],
  },
  {
    id: 5,
    title: "The Garden of Two Suns",
    narrative:
      "A garden blooms under twin suns — one golden, one black. Flowers turn toward whichever you approach. A gardener offers you a single seed to plant in soil of your choosing.",
    choices: [
      {
        text: "Plant the seed beneath the golden sun",
        lightPoints: 2,
        shadowPoints: 0,
        reflectionText: "Your light grows stronger.",
      },
      {
        text: "Bury it in the soil of the black sun",
        lightPoints: 0,
        shadowPoints: 2,
        reflectionText: "The shadow remembers.",
      },
      {
        text: "Plant it on the line where the two soils meet",
        lightPoints: 1,
        shadowPoints: 1,
        reflectionText: "Balance begins to form.",
      },
    ],
  },
  {
    id: 6,
    title: "The Throne of Echoes",
    narrative:
      "An empty throne stands at the heart of a marble hall. Voices of those you've loved and lost gather around it, asking what you would do with the power to decide their fate.",
    choices: [
      {
        text: "Leave the throne empty — power belongs to no one",
        lightPoints: 3,
        shadowPoints: 0,
        reflectionText: "Your light grows stronger.",
      },
      {
        text: "Sit, and rewrite their stories as you wish",
        lightPoints: 0,
        shadowPoints: 3,
        reflectionText: "The shadow remembers.",
      },
      {
        text: "Place a single candle on the seat instead",
        lightPoints: 1,
        shadowPoints: 1,
        reflectionText: "Balance begins to form.",
      },
    ],
  },
  {
    id: 7,
    title: "The Final Solstice",
    narrative:
      "Dawn and dusk meet on the horizon, indistinguishable. The path behind you glows with every choice you've made. Before you, a door waits — and asks who you are now.",
    choices: [
      {
        text: "Declare yourself a bringer of light",
        lightPoints: 3,
        shadowPoints: 0,
        reflectionText: "Your light grows stronger.",
      },
      {
        text: "Embrace the shadow as your truest self",
        lightPoints: 0,
        shadowPoints: 3,
        reflectionText: "The shadow remembers.",
      },
      {
        text: "Step through as both — and neither",
        lightPoints: 2,
        shadowPoints: 2,
        reflectionText: "Balance begins to form.",
      },
    ],
  },
];

export type EndingType =
  | "The Dawn Bringer"
  | "The Keeper of Shadows"
  | "The Balance Walker";

export function calculateEnding(
  lightScore: number,
  shadowScore: number,
): EndingType {
  if (lightScore - shadowScore >= 4) return "The Dawn Bringer";
  if (shadowScore - lightScore >= 4) return "The Keeper of Shadows";
  return "The Balance Walker";
}

export const endingPoetry: Record<EndingType, string> = {
  "The Dawn Bringer":
    "You walked toward warmth when warmth was hard. Where you passed, mornings learned to break gentler. The solstice carries your name softly, like a candle that refuses to go out.",
  "The Keeper of Shadows":
    "You did not flinch from the dark. You learned its language, kept its secrets, and made the unknown a home. The solstice remembers you in the long, quiet hours — the keeper of what others dared not see.",
  "The Balance Walker":
    "You did not choose dawn over dusk, nor dusk over dawn. You walked the seam where both meet, and the world steadied beneath your feet. The solstice belongs to you because you belonged to all of it.",
};
