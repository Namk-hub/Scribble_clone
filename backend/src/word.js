const words = {
  easy: [
    "cat","dog","lion","tiger","elephant","monkey",
    "apple","banana","pizza","burger","ice cream",
    "sun","moon","rainbow","cloud","fire",
    "car","bus","train","bicycle","airplane",
    "house","chair","table","bed","door",
    "book","pen","bag","clock","phone",
    "tree","flower","grass","leaf",
    "ball","kite","balloon","gift",
    "shoe","hat","shirt",
    "cake","chocolate","bread",
    "fish","bird","cow","pig"
  ],

  medium: [
    "skateboard","traffic light","headphones","keyboard",
    "doctor","teacher","police","chef","artist",
    "hospital","school","beach","airport",
    "bridge","castle","tower","temple",
    "sandwich","noodles","popcorn",
    "guitar","piano","drum",
    "robot","alien","rocket","spaceship",
    "ghost","vampire","zombie",
    "superhero","pirate","ninja","magician",
    "football","cricket","basketball","tennis",
    "trophy","medal","crown",
    "map","compass","globe",
    "mirror","umbrella","ladder",
    "toothbrush","soap","towel",
    "explosion","tornado","volcano",
    "running","swimming","jumping"
  ],

  hard: [
    "microscope","telescope","satellite","drone",
    "earthquake","tsunami","avalanche",
    "galaxy","black hole","constellation",
    "time machine","portal","dimension",
    "brain","skeleton","DNA",
    "gravity","magnet","electricity",
    "democracy","election","protest",
    "detective","mystery","investigation",
    "illusion","shadow","reflection",
    "memory","dream","nightmare",
    "experiment","laboratory","invention",
    "virus","vaccine","pandemic",
    "mutation","evolution","cloning",
    "treasure hunt","secret code","puzzle",
    "maze","labyrinth","escape room",
    "cybersecurity","hacker","password",
    "artificial intelligence","robot army",
    "space station","mars mission",
    "future city","flying car","TikTok", "selfie", "influencer", "meme",
    "Netflix", "YouTube", "gaming",
    "homework", "exam", "result",
    "crush", "love letter", "heartbreak",
    "wifi", "password", "charger"
  ]
};

function getRandomWords(round) {
  let list;

  if (round ===1) list = words.easy;
  else if (round <3) list = words.medium;
  else list = words.hard;

  const shuffled = [...list].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, 3)
}

export default { getRandomWords}