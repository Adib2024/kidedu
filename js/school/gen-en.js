// English Year 1–6 (aligned with the KSSR CEFR-based syllabus): vocabulary, grammar, sentences, reading.
import { mcq, tfEn, order, match, fill, blend, pick, sample } from "./qkit.js";

const E = (o = {}) => ({ lang: "en", ...o });
/** Correct third-person and -ing forms, so distractors never teach a misspelling. */
const third = (v) => (/(s|sh|ch|x|o)$/.test(v) ? v + "es" : /[^aeiou]y$/.test(v) ? v.slice(0, -1) + "ies" : v + "s");
const ing = (v) => (v === "lie" ? "lying" : /ie$/.test(v) ? v.slice(0, -2) + "ying" : /[^e]e$/.test(v) ? v.slice(0, -1) + "ing" : ["swim", "run", "stop", "sit", "get", "put", "cut", "shop", "plan"].includes(v) ? v + v.slice(-1) + "ing" : v + "ing");
// ---------------------------------------------------------------- banks
const VOCAB = {
  animals: [["🐱", "cat"], ["🐶", "dog"], ["🐘", "elephant"], ["🐟", "fish"], ["🐦", "bird"], ["🐰", "rabbit"], ["🐄", "cow"], ["🐵", "monkey"], ["🦁", "lion"], ["🐢", "turtle"], ["🐔", "chicken"], ["🦆", "duck"], ["🐷", "pig"], ["🐻", "bear"], ["🦒", "giraffe"], ["🐯", "tiger"], ["🐑", "sheep"], ["🐸", "frog"]],
  food: [["🍎", "apple"], ["🍌", "banana"], ["🍞", "bread"], ["🥚", "egg"], ["🍚", "rice"], ["🥛", "milk"], ["🍉", "watermelon"], ["🍪", "cookie"], ["🥕", "carrot"], ["🧀", "cheese"], ["🍇", "grapes"], ["🍓", "strawberry"], ["🍰", "cake"], ["🥭", "mango"], ["🌽", "corn"], ["🍕", "pizza"], ["🥔", "potato"]],
  school: [["✏️", "pencil"], ["📚", "book"], ["🎒", "bag"], ["📏", "ruler"], ["🪑", "chair"], ["✂️", "scissors"], ["🖍️", "crayon"], ["⏰", "clock"], ["🖊️", "pen"], ["📒", "notebook"], ["🗑️", "dustbin"], ["🖥️", "computer"], ["🎨", "paint"], ["🧽", "sponge"]],
  body: [["👁️", "eye"], ["👂", "ear"], ["👃", "nose"], ["👄", "mouth"], ["✋", "hand"], ["🦶", "foot"], ["🦷", "tooth"], ["🦵", "leg"], ["💪", "arm"], ["👅", "tongue"], ["🧠", "brain"], ["💇", "hair"], ["🫀", "heart"], ["🦴", "bone"], ["💅", "nails"], ["🫁", "lungs"]],
  home: [["🛏️", "bed"], ["🚪", "door"], ["🪟", "window"], ["🛁", "bathtub"], ["📺", "television"], ["🍳", "pan"], ["🧹", "broom"]],
};
const ALL_WORDS = Object.values(VOCAB).flat();
const COLOURS = [["🔴", "red"], ["🔵", "blue"], ["🟢", "green"], ["🟡", "yellow"], ["🟠", "orange"], ["🟣", "purple"], ["⚫", "black"], ["⚪", "white"], ["🟤", "brown"]];
const NUMBERS = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen", "twenty"];
const AN_WORDS = ["apple", "egg", "orange", "umbrella", "elephant", "ice cream", "owl", "ant", "octopus", "insect"];
const A_WORDS = ["cat", "ball", "dog", "banana", "pencil", "car", "house", "book", "rabbit", "table", "uniform", "horse"];
const PLURAL_IRR = [["child", "children"], ["mouse", "mice"], ["foot", "feet"], ["tooth", "teeth"], ["man", "men"], ["woman", "women"], ["sheep", "sheep"], ["fish", "fish"], ["person", "people"], ["goose", "geese"],
  ["ox", "oxen"],
  ["deer", "deer"]];
const PLURAL_REG = [["box", "boxes"], ["bus", "buses"], ["dish", "dishes"], ["baby", "babies"], ["leaf", "leaves"], ["toy", "toys"], ["watch", "watches"], ["knife", "knives"], ["cup", "cups"], ["city", "cities"],
  ["fox", "foxes"],
  ["lady", "ladies"],
  ["key", "keys"],
  ["wolf", "wolves"],
  ["glass", "glasses"],
  ["story", "stories"],
  ["boy", "boys"],
  ["brush", "brushes"]];
const PAST_IRR = [["go", "went"], ["eat", "ate"], ["see", "saw"], ["buy", "bought"], ["run", "ran"], ["swim", "swam"], ["write", "wrote"], ["take", "took"], ["make", "made"], ["come", "came"],
  ["have", "had"], ["sleep", "slept"], ["drink", "drank"], ["sing", "sang"], ["give", "gave"], ["find", "found"], ["catch", "caught"], ["teach", "taught"], ["think", "thought"], ["fly", "flew"]];
const PAST_REG = [["play", "played"], ["walk", "walked"], ["jump", "jumped"], ["cook", "cooked"], ["clean", "cleaned"], ["watch", "watched"], ["dance", "danced"], ["study", "studied"], ["cry", "cried"], ["stop", "stopped"]];
const PARTICIPLE = [["eat", "eaten"], ["go", "gone"], ["see", "seen"], ["write", "written"], ["do", "done"], ["take", "taken"], ["give", "given"], ["drink", "drunk"], ["swim", "swum"], ["finish", "finished"], ["visit", "visited"], ["read", "read"]];
const COMPARE = [["big", "bigger", "biggest"], ["small", "smaller", "smallest"], ["tall", "taller", "tallest"], ["fast", "faster", "fastest"], ["happy", "happier", "happiest"],
  ["hot", "hotter", "hottest"], ["good", "better", "best"], ["bad", "worse", "worst"], ["beautiful", "more beautiful", "most beautiful"], ["heavy", "heavier", "heaviest"], ["long", "longer", "longest"]];
const OPP = [["big", "small"], ["hot", "cold"], ["happy", "sad"], ["fast", "slow"], ["tall", "short"], ["open", "close"], ["old", "new"], ["clean", "dirty"], ["full", "empty"], ["early", "late"], ["light", "heavy"], ["day", "night"],
  ["up", "down"],
  ["loud", "quiet"],
  ["strong", "weak"],
  ["wet", "dry"],
  ["hard", "soft"],
  ["push", "pull"],
  ["give", "take"],
  ["rich", "poor"],
  ["thick", "thin"],
  ["remember", "forget"]];
const SYN = [["big", "large"], ["small", "tiny"], ["happy", "glad"], ["fast", "quick"], ["begin", "start"], ["shout", "yell"], ["look", "see"], ["angry", "mad"], ["smart", "clever"], ["beautiful", "pretty"],
  ["sad", "unhappy"],
  ["easy", "simple"],
  ["finish", "end"],
  ["quiet", "silent"],
  ["rich", "wealthy"],
  ["gift", "present"],
  ["scared", "afraid"],
  ["sick", "ill"],
  ["correct", "right"]];
const PREP = [["The cat is ___ the box. (📦 inside)", "in"], ["The book is ___ the table. (on top)", "on"], ["The ball is ___ the chair. (below)", "under"], ["The school is ___ the bank and the shop.", "between"],
  ["Ali sits ___ Siti. (beside)", "next to"], ["The bird flies ___ the tree. (higher than)", "above"], ["The shoes are ___ the bed. (below)", "under"], ["The milk is ___ the fridge. (inside)", "in"],
  ["The clock is ___ the wall.", "on"], ["The car is ___ the house. (at the back)", "behind"], ["The teacher stands ___ the class. (at the front)", "in front of"], ["My house is ___ the mosque and the school.", "between"],
  ["The cat sleeps ___ the bed. (below)", "under"],
  ["The picture is ___ the wall.", "on"],
  ["The fish are ___ the pond. (inside)", "in"],
  ["The bank is ___ the post office. (beside)", "next to"],
  ["The plane flies ___ the clouds. (higher than)", "above"],
  ["The ball is ___ the two chairs.", "between"],
  ["My shoes are ___ the box. (inside)", "in"],
  ["The lamp is ___ the table. (on top)", "on"]];
const TIME_PREP = [["My birthday is ___ May.", "in"], ["We have art class ___ Monday.", "on"], ["School starts ___ 7.30 a.m.", "at"], ["I sleep ___ night.", "at"], ["It is hot ___ the afternoon.", "in"], ["Hari Raya is ___ 31st March.", "on"],
  ["I was born ___ 2016.", "in"], ["We go swimming ___ Saturdays.", "on"], ["The movie starts ___ 8 p.m.", "at"], ["It often rains ___ December.", "in"], ["I brush my teeth ___ the morning.", "in"], ["See you ___ lunchtime!", "at"],
  ["We go back to the village ___ December.", "in"],
  ["The shop closes ___ 9 p.m.", "at"],
  ["My piano lesson is ___ Tuesday.", "on"],
  ["The flowers bloom ___ spring.", "in"],
  ["I wake up ___ 6 o'clock.", "at"],
  ["Merdeka Day is ___ 31st August.", "on"],
  ["We have dinner ___ the evening.", "in"],
  ["The party is ___ Saturday night.", "on"],
  ["My grandfather was born ___ 1960.", "in"],
  ["The bell rings ___ noon.", "at"]];
const CONJ = [["I like cats ___ dogs.", "and"], ["I want to play, ___ it is raining.", "but"], ["She was absent ___ she was sick.", "because"], ["Do you want tea ___ milk?", "or"], ["Study hard ___ you will pass.", "so"],
  ["He is tired ___ he worked all day.", "because"], ["The shirt is cheap ___ nice.", "and"], ["The bag is nice, ___ it is expensive.", "but"], ["Would you like rice ___ noodles?", "or"], ["It was raining, ___ we stayed at home.", "so"],
  ["I brought my umbrella ___ it was cloudy.", "because"], ["She can sing ___ dance.", "and"],
  ["I went to bed early ___ I was tired.", "because"],
  ["Is the answer true ___ false?", "or"],
  ["Ali likes rice ___ chicken.", "and"],
  ["She cried ___ she lost her doll.", "because"],
  ["The cake looks nice, ___ it tastes bad.", "but"],
  ["Hurry up, ___ you will miss the bus.", "or"],
  ["We stayed indoors ___ it was very hot.", "because"],
  ["He is small ___ very strong.", "but"],
  ["It started to rain, ___ we opened our umbrellas.", "so"],
  ["Mum bought apples ___ oranges.", "and"]];
const QWORD = [["___ is your name? — My name is Ali.", "What"], ["___ do you live? — I live in Ipoh.", "Where"], ["___ is your teacher? — Puan Lim.", "Who"], ["___ is your birthday? — In June.", "When"],
  ["___ many pencils do you have? — Three.", "How"], ["___ are you sad? — Because I lost my pen.", "Why"], ["___ colour is your bag? — It is blue.", "What"],
  ["___ is the library? — It is next to the canteen.", "Where"], ["___ is that boy? — He is my cousin.", "Who"], ["___ do you go to school? — At seven o'clock.", "When"], ["___ old are you? — I am nine.", "How"], ["___ did you cry? — Because I fell down.", "Why"],
  ["___ is your favourite colour? — Blue.", "What"],
  ["___ is the toilet? — Over there.", "Where"],
  ["___ is singing? — It is Mei Ling.", "Who"],
  ["___ does the movie start? — At eight.", "When"],
  ["___ much is this pen? — Two ringgit.", "How"],
  ["___ are you late? — Because the bus broke down.", "Why"],
  ["___ do you go to school? — By bus.", "How"],
  ["___ did you put my keys? — On the table.", "Where"],
  ["___ wrote this story? — Puan Aminah.", "Who"],
  ["___ is Hari Raya this year? — In March.", "When"]];
const SENTENCES = [["I", "like", "to", "eat", "apples"], ["She", "is", "my", "best", "friend"], ["We", "go", "to", "school", "by", "bus"], ["The", "cat", "is", "sleeping", "on", "the", "mat"],
  ["My", "father", "reads", "the", "newspaper"], ["They", "played", "football", "yesterday"], ["Ali", "can", "swim", "very", "fast"], ["It", "is", "raining", "today"], ["Please", "close", "the", "door"],
  ["I", "have", "a", "red", "bag"], ["He", "is", "my", "brother"], ["The", "sun", "is", "hot"], ["I", "can", "read", "a", "book"], ["We", "love", "our", "teacher"], ["This", "is", "my", "cat"], ["Open", "your", "books", "please"],
  ["I", "love", "my", "mother"],
  ["The", "dog", "is", "big"],
  ["We", "like", "to", "swim"],
  ["He", "has", "a", "kite"],
  ["It", "is", "a", "red", "apple"],
  ["She", "can", "sing", "well"],
  ["My", "cat", "is", "white"],
  ["They", "are", "my", "friends"],
  ["I", "go", "to", "school"],
  ["The", "baby", "is", "sleeping"]];
const SPELL = [["beautiful", "beatiful"], ["friend", "freind"], ["because", "becuase"], ["school", "shcool"], ["Wednesday", "Wensday"], ["February", "Febuary"], ["library", "libary"], ["tomorrow", "tommorow"],
  ["elephant", "elefant"], ["breakfast", "brekfast"], ["family", "famly"], ["different", "diffrent"], ["receive", "recieve"], ["knife", "nife"],
  ["giraffe", "girafe"],
  ["umbrella", "umbrela"],
  ["holiday", "holliday"],
  ["vegetable", "vegtable"],
  ["Thursday", "Thurday"],
  ["necessary", "neccessary"],
  ["address", "adress"],
  ["beginning", "begining"],
  ["calendar", "calender"],
  ["separate", "seperate"]];
// [level, passage, questions] — level 0: Year 2 (very short), 1: Year 3, 2: Year 4–5, 3: Year 5–6
const READING = [
  [0, "This is my kite. It is red and yellow. I fly it at the beach with my father.",
    [["What colour is the kite?", "red and yellow", ["blue and green", "black", "pink"]], ["Where do they fly the kite?", "at the beach", ["in the house", "at school", "in the shop"]], ["Who flies the kite with the writer?", "the father", ["the mother", "the teacher", "the sister"]]]],
  [0, "Ben has a small fish. Its name is Goldie. Ben feeds Goldie every morning.",
    [["What pet does Ben have?", "a fish", ["a cat", "a bird", "a dog"]], ["What is the fish's name?", "Goldie", ["Ben", "Nemo", "Max"]], ["When does Ben feed Goldie?", "every morning", ["every night", "on Sunday", "at lunch"]]]],
  [0, "It is raining. Mia wears her yellow raincoat. She jumps in the puddles and laughs.",
    [["What is the weather like?", "It is raining.", ["It is sunny.", "It is windy.", "It is snowing."]], ["What colour is Mia's raincoat?", "yellow", ["red", "blue", "green"]], ["What does Mia jump in?", "the puddles", ["the pool", "the sand", "the leaves"]]]],
  [0, "Sam has a red ball. He plays with his cat. The cat is white.",
    [["What colour is the ball?", "red", ["blue", "white", "green"]], ["Who plays with the cat?", "Sam", ["Tom", "Ali", "Mia"]], ["What colour is the cat?", "white", ["red", "black", "brown"]]]],
  [0, "I am Lina. I am eight years old. I like bananas. My brother likes apples.",
    [["How old is Lina?", "eight", ["seven", "nine", "six"]], ["What does Lina like?", "bananas", ["apples", "oranges", "grapes"]], ["Who likes apples?", "her brother", ["Lina", "her sister", "her mother"]]]],
  [0, "It is Monday. Dan goes to school by bus. He sits next to his friend, Ben.",
    [["What day is it?", "Monday", ["Sunday", "Friday", "Tuesday"]], ["How does Dan go to school?", "by bus", ["by car", "on foot", "by bicycle"]], ["Who is Dan's friend?", "Ben", ["Sam", "Tom", "Lina"]]]],
  [0, "Look at the farm. There are three cows and two goats. The farmer gives them grass.",
    [["How many cows are there?", "three", ["two", "four", "five"]], ["How many goats are there?", "two", ["three", "one", "four"]], ["What does the farmer give them?", "grass", ["milk", "rice", "bread"]]]],
  [1, "Tom has a dog. Its name is Max. Max is brown and very playful. Every evening, Tom and Max play in the park. Max likes to chase the ball.",
    [["What is the name of Tom's dog?", "Max", ["Tom", "Rex", "Buddy"]], ["What colour is Max?", "brown", ["black", "white", "grey"]], ["When do they play in the park?", "every evening", ["every morning", "on Sunday", "at night"]], ["What does Max like to chase?", "the ball", ["a cat", "birds", "a stick"]]]],
  [1, "Aina wakes up at six o'clock. She brushes her teeth and takes a bath. Then she eats bread and drinks milk for breakfast. Her father drives her to school at seven.",
    [["What time does Aina wake up?", "six o'clock", ["seven o'clock", "five o'clock", "eight o'clock"]], ["What does Aina drink for breakfast?", "milk", ["tea", "juice", "coffee"]], ["Who drives Aina to school?", "her father", ["her mother", "her brother", "the bus driver"]], ["What does she eat for breakfast?", "bread", ["rice", "noodles", "eggs"]]]],
  [2, "Last Saturday, the pupils of Year Five visited the National Zoo. They saw elephants, tigers and orangutans. Ravi took many photos. Mei Ling fed the deer. Everyone was tired but happy when they returned to school.",
    [["Where did the pupils go?", "the National Zoo", ["the museum", "the beach", "the park"]], ["Who took many photos?", "Ravi", ["Mei Ling", "the teacher", "Aina"]], ["What did Mei Ling feed?", "the deer", ["the tigers", "the elephants", "the birds"]], ["How did the pupils feel?", "tired but happy", ["sad", "angry", "bored"]]]],
  [3, "Plastic bags are harmful to the environment. They take hundreds of years to break down. Many sea animals, such as turtles, mistake them for food. We should bring our own bags when we go shopping.",
    [["Why are plastic bags harmful?", "They take hundreds of years to break down.", ["They are too expensive.", "They are too heavy.", "They are colourful."]], ["Which animal mistakes plastic bags for food?", "turtles", ["cats", "birds", "cows"]], ["What should we do when we go shopping?", "bring our own bags", ["buy more plastic bags", "throw bags into the sea", "stay at home"]], ["The word 'harmful' means…", "causing damage", ["very helpful", "very cheap", "easy to carry"]]]],
  [1, "My grandmother lives in a village in Kedah. Her house is near a paddy field. During the school holidays, I help her feed the chickens. In the evening, we sit on the porch and eat pisang goreng.",
    [["Where does the grandmother live?", "in a village in Kedah", ["in a city in Kedah", "in Kuala Lumpur", "near the sea"]], ["What is near her house?", "a paddy field", ["a river", "a school", "a shop"]], ["What does the writer help to feed?", "the chickens", ["the cows", "the cats", "the ducks"]], ["What do they eat in the evening?", "pisang goreng", ["nasi lemak", "roti canai", "cake"]]]],
  [1, "Mia's class has a new pet. It is a small green turtle. The pupils call it Speedy. Every day, one pupil feeds Speedy and cleans its tank. Today, it is Mia's turn.",
    [["What is the class pet?", "a turtle", ["a fish", "a rabbit", "a hamster"]], ["What colour is the pet?", "green", ["brown", "yellow", "grey"]], ["What is the pet's name?", "Speedy", ["Mia", "Shelly", "Tiny"]], ["Whose turn is it today?", "Mia's", ["the teacher's", "Speedy's", "nobody's"]]]],
  [2, "Kumar wanted to buy a birthday present for his mother. He saved some of his pocket money every day for two months. Finally, he bought her a beautiful scarf. His mother hugged him and said it was the best present ever.",
    [["Why did Kumar save money?", "to buy a present for his mother", ["to buy a new bicycle", "to go on holiday", "to buy a toy"]], ["How long did he save?", "two months", ["two weeks", "two years", "two days"]], ["What did he buy?", "a scarf", ["a bag", "a watch", "flowers"]], ["How did his mother feel?", "very happy", ["angry", "worried", "bored"]]]],
  [2, "On Sunday, there was a gotong-royong at Taman Bunga. The residents cleaned the drains and cut the grass. The children picked up rubbish around the playground. After that, everyone enjoyed nasi lemak together.",
    [["When was the gotong-royong?", "on Sunday", ["on Saturday", "on Monday", "on Friday"]], ["What did the children do?", "picked up rubbish", ["cut the grass", "cleaned the drains", "cooked food"]], ["Where did the children work?", "around the playground", ["in the school", "at the market", "near the river"]], ["What did everyone eat after that?", "nasi lemak", ["roti canai", "satay", "mee goreng"]]]],
  [3, "The Malayan tiger is our national animal, but fewer than two hundred are left in the wild. Forests are being cleared for farms and roads, so tigers lose their homes. Some people also hunt them illegally. Rangers patrol the forests to protect these beautiful animals.",
    [["How many Malayan tigers are left in the wild?", "fewer than two hundred", ["more than two thousand", "about five hundred", "none"]], ["Why are tigers losing their homes?", "Forests are cleared for farms and roads.", ["They move to cities.", "There is too much rain.", "They like to travel."]], ["Who patrols the forests?", "rangers", ["farmers", "tourists", "teachers"]], ["The word 'illegally' means…", "against the law", ["very quickly", "with permission", "at night"]]]],
  [3, "Lee Chong Wei began playing badminton when he was a young boy in Penang. He trained for many hours every day, even when he was tired. He became the world number one player and won three Olympic silver medals. He shows us that hard work brings success.",
    [["Where did Lee Chong Wei grow up?", "Penang", ["Johor", "Sabah", "Perak"]], ["What sport does he play?", "badminton", ["football", "tennis", "squash"]], ["How many Olympic silver medals did he win?", "three", ["two", "one", "four"]], ["What is the main message of the passage?", "Hard work brings success.", ["Sport is easy.", "Penang is beautiful.", "Medals are expensive."]]]],
];

// ---------------------------------------------------------------- generators
const picWord = (group) => () => {
  const pool = group ? VOCAB[group] : ALL_WORDS;
  const [e, w] = pick(pool);
  if (Math.random() < 0.4) return mcq(`Which picture shows <b>${w}</b>?`, e, pool.map((x) => x[0]), E()); // word → picture
  return mcq("What is this?", w, pool.map((x) => x[1]), E({ visual: `<span class="qbig">${e}</span>`, say: "What is this?" }));
};
const firstLetter = () => { const [e, w] = pick(ALL_WORDS.filter(([, w]) => w.length <= 8)); return mcq(`Which letter does it start with? ${"_" + w.slice(1)}`, w[0], "abcdefghijklmnoprstw".split(""), E({ visual: `<span class="qbig">${e}</span>` })); };
const THING_COLOUR = [["🍌", "a banana", "yellow"], ["🍅", "a tomato", "red"], ["🥒", "a cucumber", "green"], ["🫐", "a blueberry", "blue"], ["🐘", "an elephant", "grey"], ["🍆", "an eggplant", "purple"],
  ["🥕", "a carrot", "orange"], ["🐼", "a panda", "black and white"], ["🥛", "milk", "white"], ["🍫", "chocolate", "brown"], ["🍋", "a lemon", "yellow"], ["🍓", "a strawberry", "red"]];
const MIX = [["red", "yellow", "orange"], ["blue", "yellow", "green"], ["red", "blue", "purple"], ["red", "white", "pink"], ["black", "white", "grey"]];
const COLOUR_NAMES = [...COLOURS.map((x) => x[1]), "grey", "pink", "black and white"];
const colours = blend([2, () => { const [e, c] = pick(COLOURS); return mcq("What colour is this?", c, COLOURS.map((x) => x[1]), E({ visual: `<span class="qbig">${e}</span>` })); }], [1, () => match("Match the colour to its name.", sample(COLOURS, 4), E())],
  [2, () => { const [e, t, c] = pick(THING_COLOUR); return mcq(`What colour is ${t}?`, c, COLOUR_NAMES, E({ visual: `<span class="qbig">${e}</span>` })); }],
  [1, () => { const [a, b, c] = pick(MIX); return mcq(`${a} + ${b} = ?`, c, COLOUR_NAMES.filter((x) => x !== a && x !== b), E({ say: `What colour do we get when we mix ${a} and ${b}?` })); }]);
const numbers = blend([1, () => { const n = Math.floor(Math.random() * 19) + 1; return mcq(`What comes after <b>${NUMBERS[n]}</b>?`, NUMBERS[n + 1], [NUMBERS[n - 1], NUMBERS[(n + 2) % 21], NUMBERS[(n + 10) % 21]], E()); }],
  [2, () => { const n = pick([3, 7, 11, 12, 13, 15, 18, 20, 8, 9, 4, 5, 6, 14, 16, 17, 19]); return mcq(`How do you spell ${n}?`, NUMBERS[n], [NUMBERS[n + 1] || "twenty-one", NUMBERS[n - 1], NUMBERS[n].replace("e", "a"), NUMBERS[(n + 5) % 21]], E()); }],
  [1, () => match("Match the number to the word.", sample([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 4).map((n) => [String(n), NUMBERS[n]]), E())]);
const article = () => { const an = Math.random() < 0.5; const w = an ? pick(AN_WORDS) : pick(A_WORDS); return fill(`I have ___ ${w}.`, an ? "an" : "a", ["a", "an", "the"].filter((x) => x !== (an ? "an" : "a")), E({ explain: an || w === "uniform" ? (w === "uniform" ? "'uniform' starts with a 'you' sound → a." : `Use 'an' before a vowel sound: an ${w}.`) : `Use 'a' before a consonant sound: a ${w}.` })); };
const plurals = (irregular) => blend(
  [3, () => { const pool = irregular ? [...PLURAL_IRR, ...PLURAL_REG.slice(0, 4)] : PLURAL_REG.concat([["cat", "cats"], ["pen", "pens"], ["apple", "apples"]]); const [s, p] = pick(pool); return mcq(`The plural of "${s}" is…`, p, [`${s}s`, `${s}es`, `${s}ies`, p.replace(/e?s$/, "")].filter((x) => x !== p), E()); }],
  [1, () => match("Match the singular to the plural.", sample(irregular ? PLURAL_IRR : PLURAL_REG, 4), E())],
);
const PRON = [["Siti is my sister. ___ is nine years old.", "She", ["He", "It", "They"]], ["Ali and Abu are friends. ___ play together.", "They", ["He", "She", "We"]], ["My father is a doctor. ___ works at a hospital.", "He", ["She", "It", "They"]],
  ["I have a cat. ___ is black.", "It", ["He", "She", "They"]], ["This is my book. It is ___.", "mine", ["my", "me", "I"]], ["This bag belongs to Mei Ling. It is ___ bag.", "her", ["his", "she", "hers"]],
  ["Aina and I are in Year 2. ___ are classmates.", "We", ["They", "Us", "She"]], ["Look at the birds! ___ are flying.", "They", ["It", "He", "We"]], ["Please give the ball to ___. (me)", "me", ["I", "my", "mine"]],
  ["Ravi has a new bicycle. ___ bicycle is blue.", "His", ["He", "Her", "Him"]], ["Mrs Wong is kind. Everybody likes ___.", "her", ["she", "hers", "he"]], ["The dog wags ___ tail.", "its", ["it's", "his", "it"]],
  ["My grandmother lives in Ipoh. ___ is seventy years old.", "She", ["He", "It", "They"]],
  ["The boys are hungry. ___ want to eat.", "They", ["He", "It", "She"]],
  ["This is Uncle Raju. ___ is a farmer.", "He", ["She", "It", "They"]],
  ["My bag is heavy. ___ has many books.", "It", ["He", "She", "They"]],
  ["These shoes belong to me. They are ___.", "mine", ["my", "me", "I"]],
  ["Tom and I like football. ___ play every Saturday.", "We", ["They", "Us", "Our"]],
  ["That pencil belongs to Ali. It is ___ pencil.", "his", ["he", "him", "her"]],
  ["Our teacher is funny. We like ___ very much.", "him", ["he", "his", "she"]],
  ["The children lost ___ ball.", "their", ["they", "them", "theirs"]],
  ["Can you help ___? I am lost.", "me", ["I", "my", "mine"]]];
const pronouns = () => { const [s, a, ds] = pick(PRON); return fill(s, a, ds, E()); };
const BE = [["I ___ a pupil.", "am"], ["She ___ my teacher.", "is"], ["They ___ in the canteen.", "are"], ["The cats ___ hungry.", "are"], ["My brother ___ tall.", "is"], ["We ___ happy today.", "are"],
  ["You ___ my best friend.", "are"], ["It ___ a sunny day.", "is"], ["I ___ eight years old.", "am"], ["The apples ___ red.", "are"], ["Ali ___ in Year 2.", "is"], ["My parents ___ at home.", "are"],
  ["The sky ___ blue.", "is"],
  ["I ___ ready for school.", "am"],
  ["Ali and Siti ___ cousins.", "are"],
  ["The water ___ cold.", "is"],
  ["We ___ in the library.", "are"],
  ["My cat ___ fat.", "is"],
  ["I ___ very hungry.", "am"],
  ["These books ___ new.", "are"],
  ["The shop ___ closed.", "is"],
  ["You ___ very kind.", "are"]];
const toBe = () => { const [s, a] = pick(BE); return fill(s, a, ["am", "is", "are"].filter((x) => x !== a), E({ n: 3 })); };
const HAVE = [["I ___ two pencils.", "have"], ["Ali ___ a red bicycle.", "has"], ["We ___ English on Monday.", "have"], ["The rabbit ___ long ears.", "has"], ["They ___ a big garden.", "have"],
  ["My sister ___ long hair.", "has"], ["You ___ a nice smile.", "have"], ["The car ___ four wheels.", "has"], ["Cats ___ sharp claws.", "have"], ["Mr Tan ___ three children.", "has"], ["I ___ a cold today.", "have"], ["The school ___ a big field.", "has"],
  ["She ___ a pet rabbit.", "has"],
  ["We ___ a test tomorrow.", "have"],
  ["An elephant ___ a long trunk.", "has"],
  ["My friends ___ new bicycles.", "have"],
  ["Our class ___ thirty pupils.", "has"],
  ["I ___ breakfast at seven.", "have"],
  ["Spiders ___ eight legs.", "have"],
  ["The house ___ two doors.", "has"],
  ["You ___ a beautiful voice.", "have"],
  ["My uncle ___ a farm.", "has"]];
const haveHas = () => { const [s, a] = pick(HAVE); return fill(s, a, ["have", "has", "having", "is", "are"].filter((x) => x !== a), E()); };
const SIMPLE = [["She ___ to school every day.", "walks", ["walk", "walking", "walked"]], ["My mother ___ breakfast every morning.", "cooks", ["cook", "cooking", "cooked"]], ["They ___ football after school.", "play", ["plays", "playing", "is play"]],
  ["The baby ___ a lot.", "cries", ["cry", "crys", "crying"]], ["Ravi ___ his homework at night.", "does", ["do", "doing", "dos"]], ["I ___ milk every day.", "drink", ["drinks", "drinking", "drank"]],
  ["The sun ___ in the east.", "rises", ["rise", "rising", "rised"]], ["My father ___ to work by train.", "goes", ["go", "gos", "going"]], ["We ___ our teeth twice a day.", "brush", ["brushes", "brushing", "brushs"]],
  ["Ali ___ the guitar well.", "plays", ["play", "plaies", "playing"]], ["Cats ___ fish.", "like", ["likes", "liking", "is like"]], ["My sister ___ TV in the evening.", "watches", ["watch", "watchs", "watching"]],
  ["The bus ___ at eight o'clock.", "leaves", ["leave", "leaving", "left"]],
  ["My grandfather ___ the newspaper every morning.", "reads", ["read", "reading", "readed"]],
  ["Birds ___ nests in trees.", "build", ["builds", "building", "builded"]],
  ["Mei Ling ___ English very well.", "speaks", ["speak", "speaking", "spoke"]],
  ["We ___ to the mosque on Fridays.", "go", ["goes", "going", "gone"]],
  ["The shop ___ at ten every day.", "opens", ["open", "opening", "opened"]],
  ["Water ___ at 100 degrees Celsius.", "boils", ["boil", "boiling", "boiled"]],
  ["My brothers ___ their room on Sundays.", "clean", ["cleans", "cleaning", "cleaned"]],
  ["A cow ___ grass.", "eats", ["eat", "eating", "ate"]],
  ["He ___ his bicycle to school.", "rides", ["ride", "riding", "rode"]]];
const presentSimple = () => { const [s, a, ds] = pick(SIMPLE); return fill(s, a, ds, E()); };
const CONT = [["Look! The children ___ in the rain.", "are playing", "play"], ["Listen! Siti ___ a song.", "is singing", "sing"], ["I ___ my homework now.", "am doing", "do"], ["The dog ___ under the table.", "is sleeping", "sleep"],
  ["Mother ___ dinner in the kitchen.", "is cooking", "cook"], ["We ___ for the bus now.", "are waiting", "wait"], ["Be quiet! The baby ___.", "is sleeping", "sleep"], ["Ali and Abu ___ football now.", "are playing", "play"],
  ["I ___ a letter to my grandmother.", "am writing", "write"], ["Look! The birds ___ in the sky.", "are flying", "fly"], ["My father ___ the car at the moment.", "is washing", "wash"], ["The pupils ___ to the teacher.", "are listening", "listen"],
  ["Shh! Grandpa ___ a nap.", "is taking", "take"],
  ["Look! The cat ___ the mouse.", "is chasing", "chase"],
  ["We ___ a cake for Mum now.", "are baking", "bake"],
  ["I ___ my shoes right now.", "am cleaning", "clean"],
  ["The farmers ___ the padi today.", "are harvesting", "harvest"],
  ["Listen! The phone ___.", "is ringing", "ring"],
  ["Mira ___ a picture at the moment.", "is drawing", "draw"],
  ["The boys ___ in the pool now.", "are swimming", "swim"],
  ["It ___ heavily outside.", "is raining", "rain"],
  ["You ___ too fast! Slow down.", "are walking", "walk"]];
const presentCont = () => { const [s, a, base] = pick(CONT); const be = a.split(" ")[0]; const ing = a.split(" ")[1]; return fill(s, a, [`${be === "is" ? "are" : "is"} ${ing}`, base, third(base), `${be} ${base}`].filter((x) => x !== a), E()); };
const CAN = [["A fish ___ swim.", "can"], ["A cat ___ fly.", "can't"], ["Birds ___ fly.", "can"], ["An elephant ___ climb a tree.", "can't"], ["A monkey ___ climb trees.", "can"], ["A snake ___ walk.", "can't"],
  ["A penguin ___ fly.", "can't"], ["A kangaroo ___ jump high.", "can"], ["A baby ___ drive a car.", "can't"], ["A frog ___ jump.", "can"], ["A dog ___ bark.", "can"], ["A turtle ___ run fast.", "can't"],
  ["A bird ___ fly.", "can"],
  ["A fish ___ climb a tree.", "can't"],
  ["A horse ___ run fast.", "can"],
  ["A cow ___ fly.", "can't"],
  ["A duck ___ swim.", "can"],
  ["A snail ___ run fast.", "can't"],
  ["A parrot ___ talk.", "can"],
  ["A chair ___ walk.", "can't"],
  ["An owl ___ see at night.", "can"],
  ["A rabbit ___ hop.", "can"]];
const canCant = () => { const [s, a] = pick(CAN); return fill(s, a, ["can", "can't", "is", "are"].filter((x) => x !== a), E()); };
const preps = () => { const [s, a] = pick(PREP); return fill(s, a, ["in", "on", "under", "between", "next to", "above"].filter((x) => x !== a), E()); };
const timePreps = () => { const [s, a] = pick(TIME_PREP); return fill(s, a, ["in", "on", "at"].filter((x) => x !== a), E({ n: 3, explain: "in + months/years/parts of the day · on + days/dates · at + clock times/night" })); };
// "and" can grammatically replace "so"/"but" (and vice versa), so it is never offered as the wrong choice there
const CONJ_CLASH = { so: ["and"], but: ["and"], and: ["but", "so"] };
const conj = () => { const [s, a] = pick(CONJ); return fill(s, a, ["and", "but", "because", "or", "so"].filter((x) => x !== a && !(CONJ_CLASH[a] || []).includes(x)), E({ n: 3 })); };
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
const reading = (...levels) => () => { const [, text, qs] = pick(READING.filter((r) => levels.includes(r[0]))); const [q, a, ds] = pick(qs); return mcq(q, a, ds, E({ visual: `<div class="passage" lang="en">${text}</div>` })); };

// ---------------------------------------------------------------- listening (read aloud by the device)
const listenPic = (...groups) => () => {
  const pool = groups.flatMap((g) => (g === "colours" ? COLOURS : VOCAB[g]));
  const [e, w] = pick(pool);
  return mcq("🎧 Listen and choose the picture.", e, pool.map((x) => x[0]), E({ listen: w, alt: `Which picture is <b>${w}</b>?` }));
};
const listenNumber = () => { const n = Math.floor(Math.random() * 21); return mcq("🎧 Listen and choose the number.", String(n), [n + 1, n - 1, n + 10, n - 10, 20 - n, (n * 2) % 21].filter((x) => x >= 0 && x <= 30).map(String), E({ listen: NUMBERS[n], alt: `Which number is <b>${NUMBERS[n]}</b>?` })); };
const LSPELL = [["apple", ["aple", "appel"]], ["school", ["scool", "skool"]], ["happy", ["hapy", "happi"]], ["water", ["watter", "woter"]], ["green", ["grean", "gren"]], ["house", ["hause", "hous"]],
  ["chair", ["chare", "cheir"]], ["teacher", ["teecher", "techer"]], ["friend", ["frend", "freind"]], ["yellow", ["yelow", "yello"]], ["rabbit", ["rabit", "rabbet"]], ["banana", ["bananna", "banan"]],
  ["mouth", ["mouf", "mauth"]], ["purple", ["purpel", "perple"]], ["monkey", ["monky", "mongkey"]], ["window", ["windo", "windaw"]]];
const listenSpell = () => { const [w, bad] = pick(LSPELL); return mcq("🎧 Listen and choose the correct spelling.", w, bad, E({ listen: w, alt: "Choose the correct spelling.", n: 3 })); };
const LSENT = [["The cat is under the table.", ["The cat is on the table.", "The hat is under the table.", "The cat is under the chair."]],
  ["Ali has two red balls.", ["Ali has three red balls.", "Ali has two blue balls.", "Ali had two red bells."]],
  ["She is reading a book in the library.", ["She is reading a book in the kitchen.", "She is cooking in the library.", "He is reading a book in the library."]],
  ["We play football every Sunday.", ["We play football every Saturday.", "We watch football every Sunday.", "We play badminton every Sunday."]],
  ["My mother buys fish at the market.", ["My mother buys fish at the shop.", "My father buys fish at the market.", "My mother sells fish at the market."]],
  ["The bus leaves at eight o'clock.", ["The bus leaves at nine o'clock.", "The bus arrives at eight o'clock.", "The van leaves at eight o'clock."]],
  ["There are five birds in the tree.", ["There are four birds in the tree.", "There are five birds on the roof.", "There are five bees in the tree."]],
  ["Please close the window.", ["Please open the window.", "Please close the door.", "Please clean the window."]],
  ["I drink a glass of milk every morning.", ["I drink a glass of water every morning.", "I drink a glass of milk every night.", "I drink a cup of tea every morning."]],
  ["The baby is sleeping in the room.", ["The baby is crying in the room.", "The baby is sleeping in the car.", "The lady is sleeping in the room."]],
  ["Siti wears a blue dress.", ["Siti wears a red dress.", "Siti wears a blue hat.", "Siti washes a blue dress."]],
  ["The shop opens on Monday.", ["The shop closes on Monday.", "The shop opens on Sunday.", "The shop opens in May."]]];
const listenSentence = () => { const [s0, ds] = pick(LSENT); return mcq("🎧 Listen. Which sentence did you hear?", s0, ds, E({ listen: s0, alt: `Find the same sentence: <b>${s0}</b>` })); };
const FUT = [["Tomorrow, we ___ visit our grandmother.", "will"], ["Look at the clouds! It is ___ to rain.", "going"], ["I ___ help you with your homework later.", "will"], ["Next year, my sister ___ be ten years old.", "will"],
  ["We are ___ to have a picnic on Sunday.", "going"], ["I think it ___ be sunny tomorrow.", "will"], ["Ali is ___ to visit Sabah next month.", "going"], ["The shop ___ open at nine tomorrow.", "will"],
  ["She is ___ to bake a cake tonight.", "going"], ["Don't worry, I ___ call you later.", "will"], ["They are ___ to watch the match.", "going"], ["Our teacher ___ give us a test next week.", "will"],
  ["I think it ___ rain later.", "will"],
  ["We are ___ to visit the zoo on Saturday.", "going"],
  ["Don't worry, I ___ help you.", "will"],
  ["Look! The glass is ___ to fall!", "going"],
  ["Next week, my aunt ___ arrive from Sabah.", "will"],
  ["They are ___ to paint the house tomorrow.", "going"],
  ["Maybe we ___ win the match.", "will"],
  ["Siti is ___ to sing at the concert tonight.", "going"]];
const future = () => { const [s, a] = pick(FUT); return fill(s, a, ["will", "going", "did", "was", "went"].filter((x) => x !== a), E()); };
const ADV = [["quick", "quickly", "Please finish your work ___."], ["slow", "slowly", "The old man walked ___ across the road."], ["careful", "carefully", "Walk ___ on the wet floor."],
  ["happy", "happily", "The children sang ___."], ["loud", "loudly", "Do not talk ___ in the library."], ["easy", "easily", "She solved the puzzle ___."], ["neat", "neatly", "Write your name ___."],
  ["quiet", "quietly", "The cat walked ___ into the room."], ["bad", "badly", "He played ___ in the match."], ["polite", "politely", "Ask your teacher ___."], ["safe", "safely", "Cross the road ___."], ["brave", "bravely", "The firefighter fought the fire ___."],
  ["soft", "softly", "The mother spoke ___ to her baby."],
  ["clear", "clearly", "Please speak ___."],
  ["kind", "kindly", "She ___ helped the old man."],
  ["proud", "proudly", "He ___ showed us his medal."],
  ["sad", "sadly", "The boy looked ___ at his broken toy."],
  ["loud", "loudly", "The lion roared ___."],
  ["gentle", "gently", "Hold the kitten ___."],
  ["fast", "fast", "The cheetah runs very ___."]];
const adverbs = () => { const [a, adv, sen] = pick(ADV); return fill(`${sen} (${a})`, adv, [a, `${a}er`, `more ${a}`].filter((x) => x !== adv), E()); };
const MUCH = [["How ___ apples do you have?", "many"], ["How ___ water do you drink?", "much"], ["We have too ___ homework today.", "much"], ["There are ___ books on the shelf.", "many"], ["Can I have ___ biscuits, please?", "some"],
  ["How ___ money do you have?", "much"], ["How ___ pupils are in your class?", "many"], ["Is there ___ milk in the fridge?", "any"], ["How ___ rice is left in the pot?", "much"], ["I bought ___ oranges at the market.", "some"],
  ["Are there ___ eggs left?", "any"], ["How ___ rice do you need?", "much"],
  ["How ___ sugar do you want?", "much"],
  ["How ___ cats do you have?", "many"],
  ["There are too ___ cars on the road.", "many"],
  ["I drank too ___ coffee.", "much"],
  ["How ___ time do we have?", "much"],
  ["How ___ brothers do you have?", "many"],
  ["Don't drink too ___ cold water.", "much"],
  ["How ___ chairs are in the hall?", "many"]];
const muchMany = () => { const [s, a] = pick(MUCH); return fill(s, a, ["much", "many", "some", "any"].filter((x) => x !== a), E({ n: 4 })); };
const PERFECT_MORE = [["We ___ finished our project.", "have", ["has", "are", "did"]], ["Ali ___ visited Langkawi twice.", "has", ["have", "is", "was"]], ["They have ___ the room.", "cleaned", ["clean", "cleaning", "cleans"]],
  ["I have never ___ a dinosaur.", "seen", ["saw", "see", "seeing"]], ["My parents ___ bought a new car.", "have", ["has", "is", "was"]], ["She has ___ a letter to her friend.", "written", ["wrote", "write", "writing"]],
  ["Have you ___ your lunch?", "eaten", ["ate", "eat", "eating"]], ["The train has just ___.", "arrived", ["arrive", "arriving", "arrives"]], ["He has ___ his keys.", "lost", ["lose", "losing", "loses"]],
  ["We have ___ here for three years.", "lived", ["live", "living", "lives"]]];
const presentPerfect = blend(
  [3, () => { const [v, p] = pick(PARTICIPLE); return fill(`I have already ___ ${{ eat: "my lunch", go: "there before", see: "that movie", write: "the letter", do: "my homework", take: "my medicine", give: "her the book", drink: "my milk", swim: "in that river", finish: "my work", visit: "Penang", read: "this book" }[v]}.`, p, PAST_IRR.find((x) => x[0] === v)?.[1] && PAST_IRR.find((x) => x[0] === v)[1] !== p ? [PAST_IRR.find((x) => x[0] === v)[1], v, ing(v)] : [ing(v), third(v), "has"], E()); }],
  [1, () => fill("She ___ lived here since 2020.", "has", ["have", "is", "was"], E())],
  [2, () => { const [t, a, ds] = pick(PERFECT_MORE); return fill(t, a, ds, E()); }],
);
const COND = [["If it rains, we ___ stay at home.", "will", ["would", "did", "are"]], ["If you heat ice, it ___.", "melts", ["melt", "melted", "will melted"]], ["If I study hard, I ___ pass the exam.", "will", ["would", "was", "did"]],
  ["If you don't water the plants, they ___ die.", "will", ["did", "was", "are"]], ["If you mix red and yellow, you ___ orange.", "get", ["got", "gets", "getting"]], ["If she ___ early, she will catch the bus.", "leaves", ["leave", "left", "will leave"]],
  ["If we recycle, we ___ help the Earth.", "will", ["did", "was", "were"]], ["If you drop the glass, it ___ break.", "will", ["did", "is", "was"]], ["If it ___ sunny tomorrow, we will go to the beach.", "is", ["was", "will", "be"]],
  ["Plants die if they ___ get water.", "don't", ["doesn't", "didn't", "won't"]], ["If you eat too many sweets, you ___ get a toothache.", "will", ["would", "did", "are"]], ["If he ___ hard, he will win.", "trains", ["train", "trained", "will train"]],
  ["If you press this button, the light ___ on.", "comes", ["come", "came", "coming"]],
  ["If you study every day, you ___ do well.", "will", ["would", "did", "were"]],
  ["If we plant trees, the air ___ cleaner.", "will be", ["was", "were", "be"]],
  ["If you heat water to 100 °C, it ___.", "boils", ["boil", "boiled", "will boiled"]],
  ["If it ___ tomorrow, we will not go out.", "rains", ["rain", "rained", "will rain"]],
  ["If you touch fire, you ___ get burnt.", "will", ["did", "was", "are"]]];
const conditionals = () => { const [s, a, ds] = pick(COND); return fill(s, a, ds, E()); };
const PUNC = [["My name is Aina.", ["my name is aina.", "My name is aina", "my Name is Aina."]], ["Where do you live?", ["Where do you live.", "where do you live?", "Where do you live!"]], ["It's Ali's bag.", ["Its Alis bag.", "It's Alis' bag.", "Its' Ali's bag."]],
  ["We visited Kuala Lumpur in May.", ["we visited kuala lumpur in may.", "We visited kuala lumpur in May.", "We visited Kuala Lumpur in may"]], ["What a beautiful day!", ["What a beautiful day?", "what a beautiful day!", "What a beautiful day"]],
  ["I bought eggs, milk and bread.", ["I bought eggs milk and bread.", "I bought, eggs, milk, and, bread.", "i bought eggs, milk and bread."]], ["Mrs Tan said, \"Sit down, please.\"", ["Mrs Tan said \"sit down please\"", "mrs Tan said, \"Sit down, please.\"", "Mrs Tan said, Sit down please."]],
  ["The children's toys are new.", ["The childrens toys are new.", "The childrens' toys are new.", "the children's toys are new."]], ["Do you like durian?", ["Do you like durian.", "do you like durian?", "Do you like Durian?"]],
  ["On Monday, we have a test.", ["on monday, we have a test.", "On monday we have a test.", "On Monday, we have a test?"]],
  ["Ali, Abu and Ah Meng are friends.", ["Ali Abu and Ah Meng are friends.", "ali, abu and ah meng are friends.", "Ali, Abu, and, Ah Meng are friends."]],
  ["How old are you?", ["How old are you.", "how old are you?", "How old are you!"]],
  ["Ouch! That hurts!", ["Ouch? That hurts?", "ouch! that hurts!", "Ouch. That hurts?"]],
  ["I live in Johor Bahru.", ["I live in johor bahru.", "i live in Johor Bahru.", "I live in Johor bahru"]],
  ["My brother's bicycle is blue.", ["My brothers bicycle is blue.", "My brother's Bicycle is blue.", "my brother's bicycle is blue."]],
  ["We're going to the zoo on Sunday.", ["Were going to the zoo on Sunday.", "We're going to the zoo on sunday.", "we're going to the zoo on Sunday."]],
  ["Can I borrow your pencil, please?", ["Can I borrow your pencil, please.", "can I borrow your pencil, please?", "Can i borrow your pencil, please?"]],
  ["Puan Lim teaches us English.", ["puan lim teaches us English.", "Puan Lim teaches us english.", "Puan lim teaches us English."]]];
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
    ["listen-1", "Listen & Choose", "🎧", blend([3, listenPic("animals", "food", "colours")], [2, listenNumber])],
  ],
  2: [
    ["school-things", "Things in School", "🎒", picWord("school")],
    ["body", "My Body", "🖐️", picWord("body")],
    ["plurals", "Plurals", "👯", plurals(false)],
    ["pronouns", "Pronouns", "🙋", pronouns],
    ["to-be", "Am, Is, Are", "🟰", toBe],
    ["have-has", "Have or Has", "🤲", haveHas],
    ["prepositions", "Where Is It?", "📦", preps],
    ["listen-2", "Listen & Spell", "🎧", blend([2, listenSpell], [1, listenPic("school", "body", "home")])],
    ["read-short", "Short Reading", "📗", reading(0)],
  ],
  3: [
    ["present-simple", "Present Simple", "🔁", presentSimple],
    ["present-cont", "Present Continuous", "🏃", presentCont],
    ["can-cant", "Can & Can't", "💪", canCant],
    ["question-words", "Question Words", "❓", qwords],
    ["plurals-irr", "Irregular Plurals", "🐑", plurals(true)],
    ["opposites", "Opposites", "↔️", opposites],
    ["reading-1", "Reading", "📖", reading(0, 1)],
    ["listen-3", "Listen to Sentences", "🎧", blend([2, listenSentence], [1, listenSpell])],
  ],
  4: [
    ["past-regular", "Past Tense (-ed)", "⏪", pastSimple(false)],
    ["past-irregular", "Irregular Past Tense", "⏮️", pastSimple(true)],
    ["comparatives", "Comparing (-er, more)", "📏", comparatives(false)],
    ["time-prep", "In, On, At", "🗓️", timePreps],
    ["conjunctions", "And, But, Because", "🔗", conj],
    ["spelling", "Spelling", "✍️", spelling],
    ["reading-2", "Reading", "📖", reading(1, 2)],
  ],
  5: [
    ["superlatives", "Superlatives (-est, most)", "🏆", comparatives(true)],
    ["future", "Future: Will & Going To", "🔮", future],
    ["adverbs", "Adverbs (-ly)", "🐢", adverbs],
    ["much-many", "Much, Many, Some", "🧺", muchMany],
    ["synonyms", "Synonyms", "🟰", synonyms],
    ["sentences-2", "Sentence Building", "🧱", sentenceOrder(true)],
    ["reading-3", "Reading", "📖", reading(2, 3)],
  ],
  6: [
    ["present-perfect", "Present Perfect", "✅", presentPerfect],
    ["conditionals", "If… (Conditionals)", "🌧️", conditionals],
    ["passive", "Passive Voice", "🔄", passive],
    ["punctuation", "Punctuation", "❗", punctuation],
    ["past-review", "Past Tense Review", "⏮️", blend([1, pastSimple(true)], [1, pastSimple(false)])],
    ["vocab-review", "Opposites & Synonyms", "↔️", blend([1, opposites], [1, synonyms])],
    ["reading-4", "Reading", "📖", reading(3, 2)],
  ],
};
