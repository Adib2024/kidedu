// Shared vocabulary used by games, maps, worksheets and drawing activities.

export const FRUITS = [
  { e: "🍎", ms: "Epal", en: "Apple", warna: "Merah" },
  { e: "🍌", ms: "Pisang", en: "Banana", warna: "Kuning" },
  { e: "🍇", ms: "Anggur", en: "Grapes", warna: "Ungu" },
  { e: "🍉", ms: "Tembikai", en: "Watermelon", warna: "Hijau" },
  { e: "🍊", ms: "Oren", en: "Orange", warna: "Oren" },
  { e: "🍍", ms: "Nanas", en: "Pineapple", warna: "Kuning" },
  { e: "🍓", ms: "Strawberi", en: "Strawberry", warna: "Merah" },
  { e: "🥭", ms: "Mangga", en: "Mango", warna: "Kuning" },
  { e: "🍒", ms: "Ceri", en: "Cherry", warna: "Merah" },
  { e: "🍐", ms: "Pear", en: "Pear", warna: "Hijau" },
  { e: "🍑", ms: "Pic", en: "Peach", warna: "Merah Jambu" },
  { e: "🥥", ms: "Kelapa", en: "Coconut", warna: "Coklat" },
  { e: "🥝", ms: "Kiwi", en: "Kiwi", warna: "Hijau" },
  { e: "🍋", ms: "Lemon", en: "Lemon", warna: "Kuning" },
  { e: "🫐", ms: "Beri Biru", en: "Blueberry", warna: "Biru" },
  { e: "🍈", ms: "Tembikai Susu", en: "Melon", warna: "Hijau" },
];

export const COLORS = [
  { ms: "Merah", en: "Red", hex: "#ef4444" },
  { ms: "Biru", en: "Blue", hex: "#3b82f6" },
  { ms: "Kuning", en: "Yellow", hex: "#facc15" },
  { ms: "Hijau", en: "Green", hex: "#22c55e" },
  { ms: "Oren", en: "Orange", hex: "#fb923c" },
  { ms: "Ungu", en: "Purple", hex: "#a855f7" },
  { ms: "Merah Jambu", en: "Pink", hex: "#f472b6" },
  { ms: "Coklat", en: "Brown", hex: "#92400e" },
  { ms: "Hitam", en: "Black", hex: "#1f2937" },
  { ms: "Putih", en: "White", hex: "#ffffff" },
  { ms: "Kelabu", en: "Grey", hex: "#9ca3af" },
];
export const colorByMs = (ms) => COLORS.find((c) => c.ms === ms);

export const COLOR_OBJECTS = [
  ["🍌", "Kuning"], ["🍅", "Merah"], ["🐸", "Hijau"], ["🍆", "Ungu"], ["🥕", "Oren"], ["🐷", "Merah Jambu"],
  ["🐻", "Coklat"], ["☁️", "Putih"], ["🌻", "Kuning"], ["🍃", "Hijau"], ["🚒", "Merah"], ["🐘", "Kelabu"],
  ["🦩", "Merah Jambu"], ["🍫", "Coklat"], ["🐧", "Hitam"], ["🌊", "Biru"], ["🍊", "Oren"], ["🍇", "Ungu"],
  ["🐳", "Biru"], ["🥚", "Putih"], ["🍓", "Merah"], ["🥦", "Hijau"], ["🧀", "Kuning"], ["🐭", "Kelabu"],
];

export const ANIMALS = [
  { e: "🐱", ms: "Kucing", en: "Cat" }, { e: "🐶", ms: "Anjing", en: "Dog" }, { e: "🐮", ms: "Lembu", en: "Cow" },
  { e: "🐔", ms: "Ayam", en: "Chicken" }, { e: "🦆", ms: "Itik", en: "Duck" }, { e: "🐟", ms: "Ikan", en: "Fish" },
  { e: "🐘", ms: "Gajah", en: "Elephant" }, { e: "🐯", ms: "Harimau", en: "Tiger" }, { e: "🦁", ms: "Singa", en: "Lion" },
  { e: "🐒", ms: "Monyet", en: "Monkey" }, { e: "🐰", ms: "Arnab", en: "Rabbit" }, { e: "🐢", ms: "Kura-kura", en: "Turtle" },
  { e: "🐍", ms: "Ular", en: "Snake" }, { e: "🐸", ms: "Katak", en: "Frog" }, { e: "🦋", ms: "Rama-rama", en: "Butterfly" },
  { e: "🐝", ms: "Lebah", en: "Bee" }, { e: "🐐", ms: "Kambing", en: "Goat" }, { e: "🐴", ms: "Kuda", en: "Horse" },
  { e: "🐧", ms: "Penguin", en: "Penguin" }, { e: "🦒", ms: "Zirafah", en: "Giraffe" }, { e: "🐻", ms: "Beruang", en: "Bear" },
  { e: "🦉", ms: "Burung Hantu", en: "Owl" }, { e: "🐌", ms: "Siput", en: "Snail" }, { e: "🐊", ms: "Buaya", en: "Crocodile" },
];

export const BODY = [
  { e: "👁️", en: "Eye", ms: "Mata" }, { e: "👂", en: "Ear", ms: "Telinga" }, { e: "👃", en: "Nose", ms: "Hidung" },
  { e: "👄", en: "Mouth", ms: "Mulut" }, { e: "✋", en: "Hand", ms: "Tangan" }, { e: "🦶", en: "Foot", ms: "Kaki" },
  { e: "🦷", en: "Tooth", ms: "Gigi" }, { e: "👅", en: "Tongue", ms: "Lidah" }, { e: "💪", en: "Arm", ms: "Lengan" },
  { e: "🦵", en: "Leg", ms: "Kaki (Betis)" }, { e: "👆", en: "Finger", ms: "Jari" }, { e: "🧠", en: "Brain", ms: "Otak" },
];

export const HOME = [
  { e: "🛏️", en: "Bed", ms: "Katil" }, { e: "🪑", en: "Chair", ms: "Kerusi" }, { e: "🚪", en: "Door", ms: "Pintu" },
  { e: "🪟", en: "Window", ms: "Tingkap" }, { e: "📺", en: "Television", ms: "Televisyen" }, { e: "🛁", en: "Bathtub", ms: "Tab Mandi" },
  { e: "🧸", en: "Teddy Bear", ms: "Anak Patung" }, { e: "📚", en: "Books", ms: "Buku" }, { e: "🕰️", en: "Clock", ms: "Jam" },
  { e: "🍽️", en: "Plate", ms: "Pinggan" }, { e: "🥄", en: "Spoon", ms: "Sudu" }, { e: "🧹", en: "Broom", ms: "Penyapu" },
  { e: "💡", en: "Lamp", ms: "Lampu" }, { e: "🧺", en: "Basket", ms: "Bakul" }, { e: "🔑", en: "Key", ms: "Kunci" },
];

export const FOOD = [
  { e: "🍞", en: "Bread", ms: "Roti" }, { e: "🥛", en: "Milk", ms: "Susu" }, { e: "🍚", en: "Rice", ms: "Nasi" },
  { e: "🥚", en: "Egg", ms: "Telur" }, { e: "🍰", en: "Cake", ms: "Kek" }, { e: "🍦", en: "Ice Cream", ms: "Aiskrim" },
  { e: "🍪", en: "Cookie", ms: "Biskut" }, { e: "🧀", en: "Cheese", ms: "Keju" }, { e: "🥕", en: "Carrot", ms: "Lobak Merah" },
  { e: "🌽", en: "Corn", ms: "Jagung" }, { e: "🍕", en: "Pizza", ms: "Piza" }, { e: "🍯", en: "Honey", ms: "Madu" },
];

export const ACTIONS = [
  { e: "🏃", en: "Run", ms: "Lari" }, { e: "🏊", en: "Swim", ms: "Berenang" }, { e: "😴", en: "Sleep", ms: "Tidur" },
  { e: "🍽️", en: "Eat", ms: "Makan" }, { e: "📖", en: "Read", ms: "Membaca" }, { e: "✍️", en: "Write", ms: "Menulis" },
  { e: "🎤", en: "Sing", ms: "Menyanyi" }, { e: "💃", en: "Dance", ms: "Menari" }, { e: "🚴", en: "Cycle", ms: "Berbasikal" },
  { e: "🧗", en: "Climb", ms: "Memanjat" }, { e: "🎨", en: "Paint", ms: "Mewarna" }, { e: "🧹", en: "Sweep", ms: "Menyapu" },
];

export const NUMBER_WORDS = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen", "twenty"];
export const NOMBOR_BM = ["kosong", "satu", "dua", "tiga", "empat", "lima", "enam", "tujuh", "lapan", "sembilan", "sepuluh"];

export const OPPOSITES = [
  ["big", "small"], ["hot", "cold"], ["happy", "sad"], ["up", "down"], ["fast", "slow"], ["open", "close"],
  ["day", "night"], ["tall", "short"], ["full", "empty"], ["old", "new"], ["wet", "dry"], ["in", "out"],
  ["light", "heavy"], ["clean", "dirty"], ["loud", "quiet"],
];

// Malay words with syllables + emoji (for reading games & tracing)
export const KATA = [
  { w: "bola", s: ["bo", "la"], e: "⚽" }, { w: "buku", s: ["bu", "ku"], e: "📕" }, { w: "baju", s: ["ba", "ju"], e: "👕" },
  { w: "kuda", s: ["ku", "da"], e: "🐴" }, { w: "roti", s: ["ro", "ti"], e: "🍞" }, { w: "gigi", s: ["gi", "gi"], e: "🦷" },
  { w: "kaki", s: ["ka", "ki"], e: "🦶" }, { w: "batu", s: ["ba", "tu"], e: "🪨" }, { w: "topi", s: ["to", "pi"], e: "🧢" },
  { w: "susu", s: ["su", "su"], e: "🥛" }, { w: "madu", s: ["ma", "du"], e: "🍯" }, { w: "padi", s: ["pa", "di"], e: "🌾" },
  { w: "kunci", s: ["kun", "ci"], e: "🔑" }, { w: "rusa", s: ["ru", "sa"], e: "🦌" }, { w: "sapu", s: ["sa", "pu"], e: "🧹" },
  { w: "kereta", s: ["ke", "re", "ta"], e: "🚗" }, { w: "kelapa", s: ["ke", "la", "pa"], e: "🥥" }, { w: "pisang", s: ["pi", "sang"], e: "🍌" },
  { w: "kucing", s: ["ku", "cing"], e: "🐱" }, { w: "bunga", s: ["bu", "nga"], e: "🌸" }, { w: "rumah", s: ["ru", "mah"], e: "🏠" },
  { w: "ikan", s: ["i", "kan"], e: "🐟" }, { w: "ayam", s: ["a", "yam"], e: "🐔" }, { w: "epal", s: ["e", "pal"], e: "🍎" },
  { w: "bulan", s: ["bu", "lan"], e: "🌙" }, { w: "bintang", s: ["bin", "tang"], e: "⭐" }, { w: "payung", s: ["pa", "yung"], e: "☂️" },
  { w: "kasut", s: ["ka", "sut"], e: "👟" }, { w: "pensel", s: ["pen", "sel"], e: "✏️" }, { w: "kapal", s: ["ka", "pal"], e: "🚢" },
  { w: "gajah", s: ["ga", "jah"], e: "🐘" }, { w: "kek", s: ["kek"], e: "🍰" }, { w: "jam", s: ["jam"], e: "⏰" },
  { w: "matahari", s: ["ma", "ta", "ha", "ri"], e: "☀️" }, { w: "rama-rama", s: ["ra", "ma", "ra", "ma"], e: "🦋" },
];

// A–Z with words & emoji (English) and Malay
export const ABC = [
  ["A", "Apple", "🍎", "Ayam", "🐔"], ["B", "Ball", "⚽", "Bola", "⚽"], ["C", "Cat", "🐱", "Cawan", "☕"],
  ["D", "Dog", "🐶", "Dadu", "🎲"], ["E", "Egg", "🥚", "Epal", "🍎"], ["F", "Fish", "🐟", "Fon", "📱"],
  ["G", "Grapes", "🍇", "Gajah", "🐘"], ["H", "Hat", "🎩", "Harimau", "🐯"], ["I", "Ice cream", "🍦", "Ikan", "🐟"],
  ["J", "Juice", "🧃", "Jam", "⏰"], ["K", "Kite", "🪁", "Kucing", "🐱"], ["L", "Lion", "🦁", "Lebah", "🐝"],
  ["M", "Moon", "🌙", "Monyet", "🐒"], ["N", "Nest", "🪺", "Nanas", "🍍"], ["O", "Owl", "🦉", "Oren", "🍊"],
  ["P", "Pig", "🐷", "Pisang", "🍌"], ["Q", "Queen", "👑", "Quran", "📖"], ["R", "Rabbit", "🐰", "Rumah", "🏠"],
  ["S", "Sun", "☀️", "Siput", "🐌"], ["T", "Tree", "🌳", "Topi", "🧢"], ["U", "Umbrella", "☂️", "Ular", "🐍"],
  ["V", "Van", "🚐", "Van", "🚐"], ["W", "Whale", "🐳", "Wau", "🪁"], ["X", "Xylophone", "🎼", "X-ray", "🩻"],
  ["Y", "Yo-yo", "🪀", "Yu", "🦈"], ["Z", "Zebra", "🦓", "Zirafah", "🦒"],
];
