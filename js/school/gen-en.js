// English Year 1–6 (aligned with the KSSR CEFR-based syllabus): vocabulary, grammar, sentences, reading.
import { mcq, tfEn, order, match, fill, blend, pick, sample } from "./qkit.js";

const E = (o = {}) => ({ lang: "en", ...o });
/** Correct third-person and -ing forms, so distractors never teach a misspelling. */
const third = (v) => (/(s|sh|ch|x|o)$/.test(v) ? v + "es" : /[^aeiou]y$/.test(v) ? v.slice(0, -1) + "ies" : v + "s");
const ing = (v) => (v === "lie" ? "lying" : /ie$/.test(v) ? v.slice(0, -2) + "ying" : /[^e]e$/.test(v) ? v.slice(0, -1) + "ing" : ["swim", "run", "stop", "sit", "get", "put", "cut", "shop", "plan"].includes(v) ? v + v.slice(-1) + "ing" : v + "ing");
// ---------------------------------------------------------------- banks
const VOCAB = {
  animals: [["🐱", "cat"], ["🐶", "dog"], ["🐘", "elephant"], ["🐟", "fish"], ["🐦", "bird"], ["🐰", "rabbit"], ["🐄", "cow"], ["🐵", "monkey"], ["🦁", "lion"], ["🐢", "turtle"]],
  food: [["🍎", "apple"], ["🍌", "banana"], ["🍞", "bread"], ["🥚", "egg"], ["🍚", "rice"], ["🥛", "milk"], ["🍉", "watermelon"], ["🍪", "cookie"], ["🥕", "carrot"], ["🧀", "cheese"]],
  school: [["✏️", "pencil"], ["📚", "book"], ["🎒", "bag"], ["📏", "ruler"], ["🪑", "chair"], ["✂️", "scissors"], ["🖍️", "crayon"], ["⏰", "clock"]],
  body: [["👁️", "eye"], ["👂", "ear"], ["👃", "nose"], ["👄", "mouth"], ["✋", "hand"], ["🦶", "foot"], ["🦷", "tooth"], ["🦵", "leg"], ["💪", "arm"], ["👅", "tongue"], ["🧠", "brain"], ["💇", "hair"]],
  home: [["🛏️", "bed"], ["🚪", "door"], ["🪟", "window"], ["🛁", "bathtub"], ["📺", "television"], ["🍳", "pan"], ["🧹", "broom"]],
};
const ALL_WORDS = Object.values(VOCAB).flat();
const COLOURS = [["🔴", "red"], ["🔵", "blue"], ["🟢", "green"], ["🟡", "yellow"], ["🟠", "orange"], ["🟣", "purple"], ["⚫", "black"], ["⚪", "white"], ["🟤", "brown"]];
const NUMBERS = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen", "twenty"];
const AN_WORDS = ["apple", "egg", "orange", "umbrella", "elephant", "ice cream", "owl", "ant", "octopus", "insect"];
const A_WORDS = ["cat", "ball", "dog", "banana", "pencil", "car", "house", "book", "rabbit", "table", "uniform", "horse"];
const PLURAL_IRR = [["child", "children"], ["mouse", "mice"], ["foot", "feet"], ["tooth", "teeth"], ["man", "men"], ["woman", "women"], ["sheep", "sheep"], ["fish", "fish"], ["person", "people"], ["goose", "geese"]];
const PLURAL_REG = [["box", "boxes"], ["bus", "buses"], ["dish", "dishes"], ["baby", "babies"], ["leaf", "leaves"], ["toy", "toys"], ["watch", "watches"], ["knife", "knives"], ["cup", "cups"], ["city", "cities"]];
const PAST_IRR = [["go", "went"], ["eat", "ate"], ["see", "saw"], ["buy", "bought"], ["run", "ran"], ["swim", "swam"], ["write", "wrote"], ["take", "took"], ["make", "made"], ["come", "came"],
  ["have", "had"], ["sleep", "slept"], ["drink", "drank"], ["sing", "sang"], ["give", "gave"], ["find", "found"], ["catch", "caught"], ["teach", "taught"], ["think", "thought"], ["fly", "flew"]];
const PAST_REG = [["play", "played"], ["walk", "walked"], ["jump", "jumped"], ["cook", "cooked"], ["clean", "cleaned"], ["watch", "watched"], ["dance", "danced"], ["study", "studied"], ["cry", "cried"], ["stop", "stopped"]];
const PARTICIPLE = [["eat", "eaten"], ["go", "gone"], ["see", "seen"], ["write", "written"], ["do", "done"], ["take", "taken"], ["give", "given"], ["drink", "drunk"], ["swim", "swum"], ["finish", "finished"], ["visit", "visited"], ["read", "read"]];
const COMPARE = [["big", "bigger", "biggest"], ["small", "smaller", "smallest"], ["tall", "taller", "tallest"], ["fast", "faster", "fastest"], ["happy", "happier", "happiest"],
  ["hot", "hotter", "hottest"], ["good", "better", "best"], ["bad", "worse", "worst"], ["beautiful", "more beautiful", "most beautiful"], ["heavy", "heavier", "heaviest"], ["long", "longer", "longest"]];
const OPP = [["big", "small"], ["hot", "cold"], ["happy", "sad"], ["fast", "slow"], ["tall", "short"], ["open", "close"], ["old", "new"], ["clean", "dirty"], ["full", "empty"], ["early", "late"], ["light", "heavy"], ["day", "night"]];
const SYN = [["big", "large"], ["small", "tiny"], ["happy", "glad"], ["fast", "quick"], ["begin", "start"], ["shout", "yell"], ["look", "see"], ["angry", "mad"], ["smart", "clever"], ["beautiful", "pretty"]];
const PREP = [["The cat is ___ the box. (📦 inside)", "in"], ["The book is ___ the table. (on top)", "on"], ["The ball is ___ the chair. (below)", "under"], ["The school is ___ the bank and the shop.", "between"],
  ["Ali sits ___ Siti. (beside)", "next to"], ["The bird flies ___ the tree. (higher than)", "above"], ["The shoes are ___ the bed. (below)", "under"], ["The milk is ___ the fridge. (inside)", "in"],
  ["The clock is ___ the wall.", "on"], ["The car is ___ the house. (at the back)", "behind"], ["The teacher stands ___ the class. (at the front)", "in front of"], ["My house is ___ the mosque and the school.", "between"]];
const TIME_PREP = [["My birthday is ___ May.", "in"], ["We have art class ___ Monday.", "on"], ["School starts ___ 7.30 a.m.", "at"], ["I sleep ___ night.", "at"], ["It is hot ___ the afternoon.", "in"], ["Hari Raya is ___ 31st March.", "on"],
  ["I was born ___ 2016.", "in"], ["We go swimming ___ Saturdays.", "on"], ["The movie starts ___ 8 p.m.", "at"], ["It often rains ___ December.", "in"], ["I brush my teeth ___ the morning.", "in"], ["See you ___ lunchtime!", "at"]];
const CONJ = [["I like cats ___ dogs.", "and"], ["I want to play, ___ it is raining.", "but"], ["She was absent ___ she was sick.", "because"], ["Do you want tea ___ milk?", "or"], ["Study hard ___ you will pass.", "so"],
  ["He is tired ___ he worked all day.", "because"], ["The shirt is cheap ___ nice.", "and"], ["The bag is nice, ___ it is expensive.", "but"], ["Would you like rice ___ noodles?", "or"], ["It was raining, ___ we stayed at home.", "so"],
  ["I brought my umbrella ___ it was cloudy.", "because"], ["She can sing ___ dance.", "and"]];
const QWORD = [["___ is your name? — My name is Ali.", "What"], ["___ do you live? — I live in Ipoh.", "Where"], ["___ is your teacher? — Puan Lim.", "Who"], ["___ is your birthday? — In June.", "When"],
  ["___ many pencils do you have? — Three.", "How"], ["___ are you sad? — Because I lost my pen.", "Why"], ["___ colour is your bag? — It is blue.", "What"],
  ["___ is the library? — It is next to the canteen.", "Where"], ["___ is that boy? — He is my cousin.", "Who"], ["___ do you go to school? — At seven o'clock.", "When"], ["___ old are you? — I am nine.", "How"], ["___ did you cry? — Because I fell down.", "Why"]];
const SENTENCES = [["I", "like", "to", "eat", "apples"], ["She", "is", "my", "best", "friend"], ["We", "go", "to", "school", "by", "bus"], ["The", "cat", "is", "sleeping", "on", "the", "mat"],
  ["My", "father", "reads", "the", "newspaper"], ["They", "played", "football", "yesterday"], ["Ali", "can", "swim", "very", "fast"], ["It", "is", "raining", "today"], ["Please", "close", "the", "door"],
  ["I", "have", "a", "red", "bag"], ["He", "is", "my", "brother"], ["The", "sun", "is", "hot"], ["I", "can", "read", "a", "book"], ["We", "love", "our", "teacher"], ["This", "is", "my", "cat"], ["Open", "your", "books", "please"]];
const SPELL = [["beautiful", "beatiful"], ["friend", "freind"], ["because", "becuase"], ["school", "shcool"], ["Wednesday", "Wensday"], ["February", "Febuary"], ["library", "libary"], ["tomorrow", "tommorow"],
  ["elephant", "elefant"], ["breakfast", "brekfast"], ["family", "famly"], ["different", "diffrent"], ["receive", "recieve"], ["knife", "nife"]];
const READING = [
  ["Tom has a dog. Its name is Max. Max is brown and very playful. Every evening, Tom and Max play in the park. Max likes to chase the ball.",
    [["What is the name of Tom's dog?", "Max", ["Tom", "Rex", "Buddy"]], ["What colour is Max?", "brown", ["black", "white", "grey"]], ["When do they play in the park?", "every evening", ["every morning", "on Sunday", "at night"]], ["What does Max like to chase?", "the ball", ["a cat", "birds", "a stick"]]]],
  ["Aina wakes up at six o'clock. She brushes her teeth and takes a bath. Then she eats bread and drinks milk for breakfast. Her father drives her to school at seven.",
    [["What time does Aina wake up?", "six o'clock", ["seven o'clock", "five o'clock", "eight o'clock"]], ["What does Aina drink for breakfast?", "milk", ["tea", "juice", "coffee"]], ["Who drives Aina to school?", "her father", ["her mother", "her brother", "the bus driver"]], ["What does she eat for breakfast?", "bread", ["rice", "noodles", "eggs"]]]],
  ["Last Saturday, the pupils of Year Five visited the National Zoo. They saw elephants, tigers and orangutans. Ravi took many photos. Mei Ling fed the deer. Everyone was tired but happy when they returned to school.",
    [["Where did the pupils go?", "the National Zoo", ["the museum", "the beach", "the park"]], ["Who took many photos?", "Ravi", ["Mei Ling", "the teacher", "Aina"]], ["What did Mei Ling feed?", "the deer", ["the tigers", "the elephants", "the birds"]], ["How did the pupils feel?", "tired but happy", ["sad", "angry", "bored"]]]],
  ["Plastic bags are harmful to the environment. They take hundreds of years to break down. Many sea animals, such as turtles, mistake them for food. We should bring our own bags when we go shopping.",
    [["Why are plastic bags harmful?", "They take hundreds of years to break down.", ["They are too expensive.", "They are too heavy.", "They are colourful."]], ["Which animal mistakes plastic bags for food?", "turtles", ["cats", "birds", "cows"]], ["What should we do when we go shopping?", "bring our own bags", ["buy more plastic bags", "throw bags into the sea", "stay at home"]], ["The word 'harmful' means…", "causing damage", ["very helpful", "very cheap", "easy to carry"]]]],
];

// ---------------------------------------------------------------- generators
const picWord = (group) => () => { const pool = group ? VOCAB[group] : ALL_WORDS; const [e, w] = pick(pool); return mcq("What is this?", w, pool.map((x) => x[1]), E({ visual: `<span class="qbig">${e}</span>`, say: "What is this?" })); };
const firstLetter = () => { const [e, w] = pick(ALL_WORDS.filter(([, w]) => w.length <= 8)); return mcq(`Which letter does it start with? ${"_" + w.slice(1)}`, w[0], "abcdefghijklmnoprstw".split(""), E({ visual: `<span class="qbig">${e}</span>` })); };
const colours = blend([2, () => { const [e, c] = pick(COLOURS); return mcq("What colour is this?", c, COLOURS.map((x) => x[1]), E({ visual: `<span class="qbig">${e}</span>` })); }], [1, () => match("Match the colour to its name.", sample(COLOURS, 4), E())]);
const numbers = blend([2, () => { const n = pick([3, 7, 11, 12, 13, 15, 18, 20, 8, 9]); return mcq(`How do you spell ${n}?`, NUMBERS[n], [NUMBERS[n + 1] || "twenty-one", NUMBERS[n - 1], NUMBERS[n].replace("e", "a"), NUMBERS[(n + 5) % 21]], E()); }],
  [1, () => match("Match the number to the word.", sample([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 4).map((n) => [String(n), NUMBERS[n]]), E())]);
const article = () => { const an = Math.random() < 0.5; const w = an ? pick(AN_WORDS) : pick(A_WORDS); return fill(`I have ___ ${w}.`, an ? "an" : "a", ["a", "an", "the"].filter((x) => x !== (an ? "an" : "a")), E({ explain: an || w === "uniform" ? (w === "uniform" ? "'uniform' starts with a 'you' sound → a." : `Use 'an' before a vowel sound: an ${w}.`) : `Use 'a' before a consonant sound: a ${w}.` })); };
const plurals = (irregular) => blend(
  [3, () => { const pool = irregular ? [...PLURAL_IRR, ...PLURAL_REG.slice(0, 4)] : PLURAL_REG.concat([["cat", "cats"], ["pen", "pens"], ["apple", "apples"]]); const [s, p] = pick(pool); return mcq(`The plural of "${s}" is…`, p, [`${s}s`, `${s}es`, `${s}ies`, p.replace(/e?s$/, "")].filter((x) => x !== p), E()); }],
  [1, () => match("Match the singular to the plural.", sample(irregular ? PLURAL_IRR : PLURAL_REG, 4), E())],
);
const PRON = [["Siti is my sister. ___ is nine years old.", "She", ["He", "It", "They"]], ["Ali and Abu are friends. ___ play together.", "They", ["He", "She", "We"]], ["My father is a doctor. ___ works at a hospital.", "He", ["She", "It", "They"]],
  ["I have a cat. ___ is black.", "It", ["He", "She", "They"]], ["This is my book. It is ___.", "mine", ["my", "me", "I"]], ["This bag belongs to Mei Ling. It is ___ bag.", "her", ["his", "she", "hers"]],
  ["Aina and I are in Year 2. ___ are classmates.", "We", ["They", "Us", "She"]], ["Look at the birds! ___ are flying.", "They", ["It", "He", "We"]], ["Please give the ball to ___. (me)", "me", ["I", "my", "mine"]],
  ["Ravi has a new bicycle. ___ bicycle is blue.", "His", ["He", "Her", "Him"]], ["Mrs Wong is kind. Everybody likes ___.", "her", ["she", "hers", "he"]], ["The dog wags ___ tail.", "its", ["it's", "his", "it"]]];
const pronouns = () => { const [s, a, ds] = pick(PRON); return fill(s, a, ds, E()); };
const BE = [["I ___ a pupil.", "am"], ["She ___ my teacher.", "is"], ["They ___ in the canteen.", "are"], ["The cats ___ hungry.", "are"], ["My brother ___ tall.", "is"], ["We ___ happy today.", "are"],
  ["You ___ my best friend.", "are"], ["It ___ a sunny day.", "is"], ["I ___ eight years old.", "am"], ["The apples ___ red.", "are"], ["Ali ___ in Year 2.", "is"], ["My parents ___ at home.", "are"]];
const toBe = () => { const [s, a] = pick(BE); return fill(s, a, ["am", "is", "are"].filter((x) => x !== a), E({ n: 3 })); };
const HAVE = [["I ___ two pencils.", "have"], ["Ali ___ a red bicycle.", "has"], ["We ___ English on Monday.", "have"], ["The rabbit ___ long ears.", "has"], ["They ___ a big garden.", "have"],
  ["My sister ___ long hair.", "has"], ["You ___ a nice smile.", "have"], ["The car ___ four wheels.", "has"], ["Cats ___ sharp claws.", "have"], ["Mr Tan ___ three children.", "has"], ["I ___ a cold today.", "have"], ["The school ___ a big field.", "has"]];
const haveHas = () => { const [s, a] = pick(HAVE); return fill(s, a, ["have", "has", "having", "is", "are"].filter((x) => x !== a), E()); };
const SIMPLE = [["She ___ to school every day.", "walks", ["walk", "walking", "walked"]], ["My mother ___ breakfast every morning.", "cooks", ["cook", "cooking", "cooked"]], ["They ___ football after school.", "play", ["plays", "playing", "is play"]],
  ["The baby ___ a lot.", "cries", ["cry", "crys", "crying"]], ["Ravi ___ his homework at night.", "does", ["do", "doing", "dos"]], ["I ___ milk every day.", "drink", ["drinks", "drinking", "drank"]],
  ["The sun ___ in the east.", "rises", ["rise", "rising", "rised"]], ["My father ___ to work by train.", "goes", ["go", "gos", "going"]], ["We ___ our teeth twice a day.", "brush", ["brushes", "brushing", "brushs"]],
  ["Ali ___ the guitar well.", "plays", ["play", "plaies", "playing"]], ["Cats ___ fish.", "like", ["likes", "liking", "is like"]], ["My sister ___ TV in the evening.", "watches", ["watch", "watchs", "watching"]]];
const presentSimple = () => { const [s, a, ds] = pick(SIMPLE); return fill(s, a, ds, E()); };
const CONT = [["Look! The children ___ in the rain.", "are playing", "play"], ["Listen! Siti ___ a song.", "is singing", "sing"], ["I ___ my homework now.", "am doing", "do"], ["The dog ___ under the table.", "is sleeping", "sleep"],
  ["Mother ___ dinner in the kitchen.", "is cooking", "cook"], ["We ___ for the bus now.", "are waiting", "wait"], ["Be quiet! The baby ___.", "is sleeping", "sleep"], ["Ali and Abu ___ football now.", "are playing", "play"],
  ["I ___ a letter to my grandmother.", "am writing", "write"], ["Look! The birds ___ in the sky.", "are flying", "fly"], ["My father ___ the car at the moment.", "is washing", "wash"], ["The pupils ___ to the teacher.", "are listening", "listen"]];
const presentCont = () => { const [s, a, base] = pick(CONT); const be = a.split(" ")[0]; const ing = a.split(" ")[1]; return fill(s, a, [`${be === "is" ? "are" : "is"} ${ing}`, base, third(base), `${be} ${base}`].filter((x) => x !== a), E()); };
const CAN = [["A fish ___ swim.", "can"], ["A cat ___ fly.", "can't"], ["Birds ___ fly.", "can"], ["An elephant ___ climb a tree.", "can't"], ["A monkey ___ climb trees.", "can"], ["A snake ___ walk.", "can't"],
  ["A penguin ___ fly.", "can't"], ["A kangaroo ___ jump high.", "can"], ["A baby ___ drive a car.", "can't"], ["A frog ___ jump.", "can"], ["A dog ___ bark.", "can"], ["A turtle ___ run fast.", "can't"]];
const canCant = () => { const [s, a] = pick(CAN); return fill(s, a, ["can", "can't", "is", "are"].filter((x) => x !== a), E()); };
const preps = () => { const [s, a] = pick(PREP); return fill(s, a, ["in", "on", "under", "between", "next to", "above"].filter((x) => x !== a), E()); };
const timePreps = () => { const [s, a] = pick(TIME_PREP); return fill(s, a, ["in", "on", "at"].filter((x) => x !== a), E({ n: 3, explain: "in + months/years/parts of the day · on + days/dates · at + clock times/night" })); };
const conj = () => { const [s, a] = pick(CONJ); return fill(s, a, ["and", "but", "because", "or", "so"].filter((x) => x !== a), E()); };
const qwords = () => { const [s, a] = pick(QWORD); return fill(s, a, ["What", "Where", "Who", "When", "How", "Why"].filter((x) => x !== a), E()); };
const pastSimple = (irr) => blend(
  [3, () => { const [v, p] = pick(irr ? PAST_IRR : PAST_REG); return mcq(`The past tense of "${v}" is…`, p, irr ? [`${v}ed`, third(v), ing(v)] : [third(v), ing(v), v], E()); }],
  [2, () => { const [v, p] = pick(irr ? PAST_IRR.slice(0, 12) : PAST_REG); return fill(`Yesterday, I ___ ${{ go: "to the market", eat: "nasi lemak", see: "a rainbow", buy: "a new book", run: "in the park", swim: "in the pool", write: "a letter", take: "a photo", make: "a kite", come: "home early", have: "a cold", sleep: "early", play: "badminton", walk: "to school", jump: "over the drain", cook: "fried rice", clean: "my room", watch: "a movie", dance: "at the concert", study: "for the test", cry: "at the sad movie", stop: "at the red light" }[v] || "it"}.`, p, [v, third(v), ing(v)], E()); }],
  [1, () => match("Match the verb to its past tense.", sample(irr ? PAST_IRR : PAST_REG, 4), E())],
);
const CMP_CTX = {
  big: ["An elephant is ___ than a cat.", "The blue whale is the ___ animal in the world."], small: ["A mouse is ___ than a dog.", "This is the ___ ant I have ever seen."],
  tall: ["A giraffe is ___ than a horse.", "The giraffe is the ___ animal in the zoo."], fast: ["A cheetah is ___ than a turtle.", "The cheetah is the ___ land animal."],
  happy: ["Siti is ___ today than yesterday.", "Today is the ___ day of my life!"], hot: ["Today is ___ than yesterday.", "April is the ___ month of the year."],
  good: ["Your drawing is ___ than mine.", "Ali is the ___ footballer in our school."], bad: ["The traffic today is ___ than yesterday.", "That was the ___ storm this year."],
  beautiful: ["This flower is ___ than that one.", "Langkawi is the ___ island I have visited."], heavy: ["A watermelon is ___ than an apple.", "The elephant is the ___ animal in the zoo."],
  long: ["A snake is ___ than a worm.", "The Rajang River is the ___ river in Malaysia."],
};
const comparatives = (superl) => blend(
  [3, () => { const [a, c, sp] = pick(COMPARE); const right = superl ? sp : c; return fill(`${CMP_CTX[a][superl ? 1 : 0]} (${a})`, right, [c, sp, a, `more ${a}`, `${a}er`, `most ${a}`].filter((x) => x !== right), E()); }],
  [1, () => { const [a, c, sp] = pick(COMPARE); return order("Put in order: adjective → comparative → superlative", [a, c, sp], E({ joiner: " → " })); }],
);
const opposites = blend([3, () => { const [a, b] = pick(OPP); return mcq(`The opposite of "${a}" is…`, b, OPP.map((x) => x[1]), E()); }], [1, () => match("Match the opposites.", sample(OPP, 4), E())]);
const synonyms = blend([3, () => { const [a, b] = pick(SYN); return mcq(`Which word means the same as "${a}"?`, b, SYN.map((x) => x[1]).concat(OPP.filter((x) => x[0] === a).map((x) => x[1])), E()); }], [1, () => match("Match the words with the same meaning.", sample(SYN, 4), E())]);
const sentenceOrder = (long) => () => { const w = pick(long ? SENTENCES : SENTENCES.filter((s) => s.length <= 5)); return order("Arrange the words to make a sentence.", w, E()); };
const spelling = () => { const [r, w] = pick(SPELL); return mcq("Choose the correct spelling.", r, [w, r.replace(/(.)\1/, "$1"), r + "e"].filter((x) => x !== r), E()); };
const reading = () => { const [text, qs] = pick(READING); const [q, a, ds] = pick(qs); return mcq(q, a, ds, E({ visual: `<div class="passage" lang="en">${text}</div>` })); };
const FUT = [["Tomorrow, we ___ visit our grandmother.", "will"], ["Look at the clouds! It is ___ to rain.", "going"], ["I ___ help you with your homework later.", "will"], ["Next year, my sister ___ be ten years old.", "will"],
  ["We are ___ to have a picnic on Sunday.", "going"], ["I think it ___ be sunny tomorrow.", "will"], ["Ali is ___ to visit Sabah next month.", "going"], ["The shop ___ open at nine tomorrow.", "will"],
  ["She is ___ to bake a cake tonight.", "going"], ["Don't worry, I ___ call you later.", "will"], ["They are ___ to watch the match.", "going"], ["Our teacher ___ give us a test next week.", "will"]];
const future = () => { const [s, a] = pick(FUT); return fill(s, a, ["will", "going", "did", "was", "went"].filter((x) => x !== a), E()); };
const ADV = [["quick", "quickly", "Please finish your work ___."], ["slow", "slowly", "The old man walked ___ across the road."], ["careful", "carefully", "Walk ___ on the wet floor."],
  ["happy", "happily", "The children sang ___."], ["loud", "loudly", "Do not talk ___ in the library."], ["easy", "easily", "She solved the puzzle ___."], ["neat", "neatly", "Write your name ___."],
  ["quiet", "quietly", "The cat walked ___ into the room."], ["bad", "badly", "He played ___ in the match."], ["polite", "politely", "Ask your teacher ___."], ["safe", "safely", "Cross the road ___."], ["brave", "bravely", "The firefighter fought the fire ___."]];
const adverbs = () => { const [a, adv, sen] = pick(ADV); return fill(`${sen} (${a})`, adv, [a, `${a}er`, `more ${a}`].filter((x) => x !== adv), E()); };
const MUCH = [["How ___ apples do you have?", "many"], ["How ___ water do you drink?", "much"], ["There isn't ___ sugar left.", "much"], ["There are ___ books on the shelf.", "many"], ["Can I have ___ biscuits, please?", "some"],
  ["How ___ money do you have?", "much"], ["How ___ pupils are in your class?", "many"], ["Is there ___ milk in the fridge?", "any"], ["We don't have ___ time.", "much"], ["I bought ___ oranges at the market.", "some"],
  ["Are there ___ eggs left?", "any"], ["How ___ rice do you need?", "much"]];
const muchMany = () => { const [s, a] = pick(MUCH); return fill(s, a, ["much", "many", "some", "any"].filter((x) => x !== a), E({ n: 4 })); };
const presentPerfect = blend(
  [3, () => { const [v, p] = pick(PARTICIPLE); return fill(`I have already ___ ${{ eat: "my lunch", go: "there before", see: "that movie", write: "the letter", do: "my homework", take: "my medicine", give: "her the book", drink: "my milk", swim: "in that river", finish: "my work", visit: "Penang", read: "this book" }[v]}.`, p, PAST_IRR.find((x) => x[0] === v)?.[1] && PAST_IRR.find((x) => x[0] === v)[1] !== p ? [PAST_IRR.find((x) => x[0] === v)[1], v, ing(v)] : [ing(v), third(v), "has"], E()); }],
  [1, () => fill("She ___ lived here since 2020.", "has", ["have", "is", "was"], E())],
);
const COND = [["If it rains, we ___ stay at home.", "will", ["would", "did", "are"]], ["If you heat ice, it ___.", "melts", ["melt", "melted", "will melted"]], ["If I study hard, I ___ pass the exam.", "will", ["would", "was", "did"]],
  ["If you don't water the plants, they ___ die.", "will", ["did", "was", "are"]], ["If you mix red and yellow, you ___ orange.", "get", ["got", "gets", "getting"]], ["If she ___ early, she will catch the bus.", "leaves", ["leave", "left", "will leave"]],
  ["If we recycle, we ___ help the Earth.", "will", ["did", "was", "were"]], ["If you drop the glass, it ___ break.", "will", ["did", "is", "was"]], ["If it ___ sunny tomorrow, we will go to the beach.", "is", ["was", "will", "be"]],
  ["Plants die if they ___ get water.", "don't", ["doesn't", "didn't", "won't"]], ["If you eat too many sweets, you ___ get a toothache.", "will", ["would", "did", "are"]], ["If he ___ hard, he will win.", "trains", ["train", "trained", "will train"]]];
const conditionals = () => { const [s, a, ds] = pick(COND); return fill(s, a, ds, E()); };
const PUNC = [["My name is Aina.", ["my name is aina.", "My name is aina", "my Name is Aina."]], ["Where do you live?", ["Where do you live.", "where do you live?", "Where do you live!"]], ["It's Ali's bag.", ["Its Alis bag.", "It's Alis' bag.", "Its' Ali's bag."]],
  ["We visited Kuala Lumpur in May.", ["we visited kuala lumpur in may.", "We visited kuala lumpur in May.", "We visited Kuala Lumpur in may"]], ["What a beautiful day!", ["What a beautiful day?", "what a beautiful day!", "What a beautiful day"]],
  ["I bought eggs, milk and bread.", ["I bought eggs milk and bread.", "I bought, eggs, milk, and, bread.", "i bought eggs, milk and bread."]], ["Mrs Tan said, \"Sit down, please.\"", ["Mrs Tan said \"sit down please\"", "mrs Tan said, \"Sit down, please.\"", "Mrs Tan said, Sit down please."]],
  ["The children's toys are new.", ["The childrens toys are new.", "The childrens' toys are new.", "the children's toys are new."]], ["Do you like durian?", ["Do you like durian.", "do you like durian?", "Do you like Durian?"]],
  ["On Monday, we have a test.", ["on monday, we have a test.", "On monday we have a test.", "On Monday, we have a test?"]]];
const punctuation = () => { const [r, ws] = pick(PUNC); return mcq("Which sentence is written correctly?", r, ws, E()); };
const PASS = [["Ali wrote the letter.", "The letter was written by Ali.", "written", "wrote"], ["The cat ate the fish.", "The fish was eaten by the cat.", "eaten", "ate"], ["Siti cleaned the room.", "The room was cleaned by Siti.", "cleaned", "clean"],
  ["The boys painted the wall.", "The wall was painted by the boys.", "painted", "paint"], ["My mother baked the cake.", "The cake was baked by my mother.", "baked", "bake"], ["Mr Lim drove the bus.", "The bus was driven by Mr Lim.", "driven", "drove"],
  ["The dog chased the ball.", "The ball was chased by the dog.", "chased", "chase"], ["Ravi broke the window.", "The window was broken by Ravi.", "broken", "broke"], ["The pupils planted the trees.", "The trees were planted by the pupils.", "planted", "plant"],
  ["The teacher marked our books.", "Our books were marked by the teacher.", "marked", "mark"]];
const passive = () => { const [act, pas, pp, wrong] = pick(PASS); const [subj, rest] = pas.split(/ (?:was|were) /); const be = /\bwere\b/.test(pas) ? "were" : "was"; return pick([
  () => mcq(`Choose the passive sentence: "${act}"`, pas, [pas.replace(pp, wrong), act.replace(/\.$/, "") + " by them.", pas.replace(be, be === "was" ? "were" : "was")].filter((x) => x !== pas), E()),
  () => fill(`${subj} ___ ${rest}`, be, ["was", "were", "is", "be"].filter((x) => x !== be), E()),
])(); };

// ---------------------------------------------------------------- curriculum
export const EN = {
  1: [
    ["animals", "Animals", "🐾", picWord("animals")],
    ["food", "Food & Drinks", "🍎", picWord("food")],
    ["colours", "Colours", "🎨", colours],
    ["numbers", "Numbers 1–20", "🔢", numbers],
    ["phonics", "Letters & Sounds", "🔤", firstLetter],
    ["a-an", "A or An", "🅰️", article],
    ["sentences-1", "Make a Sentence", "🧱", sentenceOrder(false)],
  ],
  2: [
    ["school-things", "Things in School", "🎒", picWord("school")],
    ["body", "My Body", "🖐️", picWord("body")],
    ["plurals", "Plurals", "👯", plurals(false)],
    ["pronouns", "Pronouns", "🙋", pronouns],
    ["to-be", "Am, Is, Are", "🟰", toBe],
    ["have-has", "Have or Has", "🤲", haveHas],
    ["prepositions", "Where Is It?", "📦", preps],
  ],
  3: [
    ["present-simple", "Present Simple", "🔁", presentSimple],
    ["present-cont", "Present Continuous", "🏃", presentCont],
    ["can-cant", "Can & Can't", "💪", canCant],
    ["question-words", "Question Words", "❓", qwords],
    ["plurals-irr", "Irregular Plurals", "🐑", plurals(true)],
    ["opposites", "Opposites", "↔️", opposites],
    ["reading-1", "Reading", "📖", reading],
  ],
  4: [
    ["past-regular", "Past Tense (-ed)", "⏪", pastSimple(false)],
    ["past-irregular", "Irregular Past Tense", "⏮️", pastSimple(true)],
    ["comparatives", "Comparing (-er, more)", "📏", comparatives(false)],
    ["time-prep", "In, On, At", "🗓️", timePreps],
    ["conjunctions", "And, But, Because", "🔗", conj],
    ["spelling", "Spelling", "✍️", spelling],
    ["reading-2", "Reading", "📖", reading],
  ],
  5: [
    ["superlatives", "Superlatives (-est, most)", "🏆", comparatives(true)],
    ["future", "Future: Will & Going To", "🔮", future],
    ["adverbs", "Adverbs (-ly)", "🐢", adverbs],
    ["much-many", "Much, Many, Some", "🧺", muchMany],
    ["synonyms", "Synonyms", "🟰", synonyms],
    ["sentences-2", "Sentence Building", "🧱", sentenceOrder(true)],
    ["reading-3", "Reading", "📖", reading],
  ],
  6: [
    ["present-perfect", "Present Perfect", "✅", presentPerfect],
    ["conditionals", "If… (Conditionals)", "🌧️", conditionals],
    ["passive", "Passive Voice", "🔄", passive],
    ["punctuation", "Punctuation", "❗", punctuation],
    ["past-review", "Past Tense Review", "⏮️", blend([1, pastSimple(true)], [1, pastSimple(false)])],
    ["vocab-review", "Opposites & Synonyms", "↔️", blend([1, opposites], [1, synonyms])],
    ["reading-4", "Reading", "📖", reading],
  ],
};
