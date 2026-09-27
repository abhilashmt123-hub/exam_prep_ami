// Run with: node scripts/generate-question-bank.js
// This creates a readable practice bank from the source questions below.
const fs = require('fs');
const path = require('path');
const sections = {};
const optionAssets = new Map();
const textOnlySections = new Set(['letters', 'numbers', 'shapes-colours', 'general-knowledge']);
const optionAssetsDir = path.join(__dirname, '..', 'assets', 'questions', 'options');
const customOptionImages = new Map([
  ['peacock', 'peacock.png'],
  ['mahatma gandhi', 'gandhiji.jpeg'],
  ['jawaharlal nehru', 'nehru.jpg'],
  ['dr. b. r. ambedkar', 'ambedkar.jpg'],
  ['indira gandhi', 'Indira-Gandhi-ili-50-img-5.jpg'],
  ['v d satheesan', 'V.D. Satheesan.jpg'],
  ['raveendranath tagore', 'tagore.jpg'],
  ['cricket', 'cricket.svg'],
  ['football', 'football.svg'],
  ['hockey', 'hockey.svg']
]);
const optionIcons = {
  apple: '🍎', banana: '🍌', mango: '🥭', orange: '🍊', tomato: '🍅', carrot: '🥕',
  tiger: '🐯', lion: '🦁', elephant: '🐘', cat: '🐱', dog: '🐶', frog: '🐸',
  fish: '🐟', bird: '🐦', parrot: '🦜', cow: '🐄', goat: '🐐', sheep: '🐑',
  horse: '🐴', rabbit: '🐰', ant: '🐜', bee: '🐝', butterfly: '🦋', spider: '🕷️',
  snail: '🐌', snake: '🐍', tortoise: '🐢', dolphin: '🐬', whale: '🐳', duck: '🦆',
  zebra: '🦓', giraffe: '🦒', puppy: '🐶', kitten: '🐱', calf: '🐄', chick: '🐣',
  flower: '🌸', rose: '🌹', lotus: '🪷', sunflower: '🌻', lily: '🌷', daisy: '🌼',
  doctor: '🩺', nurse: '👩‍⚕️', teacher: '👩‍🏫', farmer: '👩‍🌾', firefighter: '👨‍🚒',
  pilot: '👨‍✈️', postman: '📮', police: '👮', chef: '👨‍🍳', driver: '🚗',
  train: '🚆', boat: '🚤', aeroplane: '✈️', bicycle: '🚲', car: '🚗', bus: '🚌',
  truck: '🚚', ship: '🚢', eye: '👁️', nose: '👃', ear: '👂', hand: '✋',
  foot: '🦶', legs: '🦵', teeth: '🦷', tongue: '👅', square: '🟧', circle: '🔵',
  triangle: '🔺', rectangle: '▭', oval: '⬭', star: '⭐', heart: '💗', red: '🔴',
  blue: '🔵', green: '🟢', yellow: '🟡', purple: '🟣', pink: '🩷', black: '⚫',
  white: '⚪', orange: '🟠', brown: '🟤', violet: '🟣', gold: '🟨', silver: '⬜',
  raincoat: '🧥', umbrella: '☂️', pencil: '✏️', book: '📚', chair: '🪑', bed: '🛏️',
  clock: '🕐', soap: '🧼', shoes: '👟', shoe: '👟', key: '🔑', broom: '🧹',
  helmet: '⛑️', mirror: '🪞', phone: '📱', torch: '🔦', scissors: '✂️',
  spoon: '🥄', cup: '🥤', 'school bag': '🎒', 'lunch box': '🍱',
  'toy box': '🧸', sweater: '🧥', 'watering can': '🪴', 'hold an adult’s hand': '🤝',
  gandhi: '👴', 'mahatma gandhi': '👴', 'jawaharlal nehru': '👨🏻',
  'dr. b. r. ambedkar': '👨🏽', tricolour: '🇮🇳', 'red flag': '🚩',
  india: '🇮🇳', milk: '🥛', juice: '🧃', ink: '🖋️', paint: '🎨',
  puppy: '🐶', kitten: '🐱', kangaroo: '🦘', octopus: '🐙', pig: '🐷',
  crocodile: '🐊', mouse: '🐭', sparrow: '🐦', hen: '🐔', turtle: '🐢',
  plate: '🍽️', ball: '⚽', kite: '🪁', sock: '🧦', pillow: '🛏️',
  crayon: '🖍️', eraser: '🧽', bag: '🎒', door: '🚪', leaf: '🍃',
  drum: '🥁', bathtub: '🛁', rainbow: '🌈', sun: '☀️', moon: '🌙',
  shoe: '👟', van: '🚐', shirt: '👕', socks: '🧦', puppy: '🐶',
  day: '☀️', night: '🌙', morning: '🌅', evening: '🌆', hot: '🌞',
  cold: '❄️', warm: '🧣', wet: '💧', big: '🐘', small: '🐜', tall: '🦒',
  fast: '🐆', slow: '🐌', up: '⬆️', down: '⬇️', left: '⬅️', right: '➡️',
  happy: '😊', sad: '😢', angry: '😠', sleepy: '😴', full: '🫃',
  empty: '🫙', heavy: '🏋️', light: '💡', open: '📖', closed: '📕',
  clean: '✨', loud: '📢', soft: '🧸', 'red flag': '🚩'
};
const xml = value => String(value).replace(/[&<>'"]/g, character => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&apos;', '"': '&quot;'
}[character]));
const imageFor = text => {
  const label = String(text).trim();
  const key = label.toLowerCase();
  const customImage = customOptionImages.get(key);
  if (customImage) {
    const customImagePath = path.join(optionAssetsDir, customImage);
    if (!fs.existsSync(customImagePath)) {
      throw new Error(`Missing custom option image for "${label}": ${customImagePath}`);
    }
    return `/assets/questions/options/${encodeURIComponent(customImage)}`;
  }
  let hash = 0;
  for (const character of key) hash = (Math.imul(hash, 31) + character.charCodeAt(0)) >>> 0;
  const slug = key.normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'option';
  const fileName = `${slug}-${hash.toString(36)}.svg`;
  if (!optionAssets.has(fileName)) {
    const icon = optionIcons[key] || optionIcons[key.split(/[\s’-]/)[0]] || '🖼️';
    optionAssets.set(fileName, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 220" role="img" aria-labelledby="title">
  <title id="title">${xml(label)}</title>
  <defs><linearGradient id="bg" x2="1" y2="1"><stop stop-color="#e7f8f1"/><stop offset="1" stop-color="#fff0c2"/></linearGradient></defs>
  <rect width="320" height="220" rx="24" fill="url(#bg)"/>
  <circle cx="160" cy="91" r="64" fill="#fff" opacity=".88"/>
  <text x="160" y="112" text-anchor="middle" font-size="76" font-family="Arial, sans-serif">${xml(icon)}</text>
  <text x="160" y="192" text-anchor="middle" font-size="22" font-weight="700" fill="#183153" font-family="Arial, sans-serif">${xml(label)}</text>
</svg>\n`);
  }
  return `/assets/questions/options/${fileName}`;
};
const add = (section, prompt, options, correctIndex, type = 'text-options') => {
  (sections[section] ||= []).push({
    id: `${section}-${sections[section].length + 1}`,
    type, prompt,
    options: options.map(text => ({
      text,
      ...(textOnlySections.has(section) ? {} : { image: imageFor(text) })
    })), correctIndex
  });
};
const pickOptions = (correct, wrongs) => {
  const options = [correct, ...wrongs.slice(0, 2)];
  // A deterministic shuffle keeps the JSON stable while moving the answer around.
  const shift = (correct.length + wrongs.join('').length) % 3;
  return [...options.slice(shift), ...options.slice(0, shift)];
};
const addChoice = (section, prompt, correct, wrongs, type = 'text-options') => {
  const options = pickOptions(correct, wrongs);
  add(section, prompt, options, options.indexOf(correct), type);
};

// 40 alphabet and phonics questions
const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
letters.forEach((letter, i) => {
  const before = letters[(i + 25) % 26], after = letters[(i + 1) % 26];
  addChoice('letters', `Which letter comes after ${letter}?`, after, [before, letters[(i + 2) % 26]]);
});
['A','B','C','D','E','F','G','H','I','J','K','L','M','N'].forEach((letter, i) => {
  const next = letters[letters.indexOf(letter) + 1];
  addChoice('letters', `Complete the letters: ${letter}, ${next}, __`, letters[letters.indexOf(next) + 1], [letter, letters[letters.indexOf(next) + 2]]);
});

// 45 numbers and counting questions
for (let n = 1; n <= 20; n++) {
  const next = n === 20 ? 19 : n + 1;
  addChoice('numbers', `Which number comes after ${n}?`, String(next), [String(Math.max(0, n - 1)), String(Math.min(21, n + 2))]);
}
for (let n = 1; n <= 15; n++) {
  addChoice('numbers', `Which number comes before ${n}?`, String(n - 1), [String(n + 1), String(Math.min(20, n + 2))]);
}
for (let n = 1; n <= 10; n++) {
  const dots = '● '.repeat(n).trim();
  addChoice('numbers', `Count the dots: ${dots}`, String(n), [String(Math.max(0, n - 1)), String(n + 1)], n === 4 ? 'picture-question' : 'text-options');
}

// 35 shapes and colours questions
const shapes = ['square', 'circle', 'triangle', 'rectangle', 'star', 'oval', 'heart'];
shapes.forEach(shape => addChoice('shapes-colours', `What shape is this: ${shape === 'square' ? '▣' : shape === 'circle' ? '●' : shape === 'triangle' ? '▲' : shape === 'rectangle' ? '▭' : shape === 'star' ? '★' : shape === 'oval' ? '⬭' : '♥'}?`, shape[0].toUpperCase() + shape.slice(1), shapes.filter(option => option !== shape).slice(0, 2).map(option => option[0].toUpperCase() + option.slice(1)), 'picture-question'));
const colours = ['red','blue','green','yellow','orange','purple','pink','black','white','brown','grey','violet','gold','silver'];
colours.forEach((colour, i) => addChoice('shapes-colours', `Which word names the colour ${colour}?`, colour[0].toUpperCase() + colour.slice(1), [colours[(i + 1) % colours.length][0].toUpperCase() + colours[(i + 1) % colours.length].slice(1), colours[(i + 2) % colours.length][0].toUpperCase() + colours[(i + 2) % colours.length].slice(1)]));
for (let i = 0; i < 14; i++) {
  const shape = shapes[i % shapes.length];
  addChoice('shapes-colours', `Find the ${shape}.`, shape[0].toUpperCase() + shape.slice(1), ['Car', 'Apple']);
}

// 35 body, home, and everyday-life questions
const body = [
  ['smell','Nose','Eye','Ear'], ['see','Eye','Nose','Hand'],
  ['hear','Ear','Foot','Nose'], ['taste','Tongue','Knee','Ear'], ['walk','Legs','Ears','Hair'],
  ['hold a pencil','Hand','Nose','Toe'], ['chew food','Teeth','Fingers','Eyes'], ['kick a ball','Foot','Ear','Elbow'],
  ['clap','Hands','Eyes','Knees'], ['blink','Eyes','Feet','Nose']
];
body.forEach(([action, correct, one, two], index) => addChoice('body-life', `Which body part do you use to ${action}?`, correct, [one, two], index < 3 ? 'picture-question' : 'text-options'));
const life = [
  ['sleep','Bed','Plate','Shoe'], ['brush your teeth','Toothbrush','Pillow','Ball'], ['drink water','Cup','Book','Crayon'],
  ['cut paper safely','Scissors','Spoon','Sock'], ['keep dry in rain','Umbrella','Comb','Pencil'], ['tell time','Clock','Door','Bag'],
  ['write','Pencil','Plate','Soap'], ['wear on your feet','Shoes','Gloves','Hat'], ['carry books','School bag','Cup','Pillow'],
  ['wash your hands','Soap','Crayon','Toy'], ['sit at a table','Chair','Ball','Spoon'], ['eat soup','Spoon','Shoe','Book'],
  ['comb your hair','Comb','Eraser','Plate'], ['open a lock','Key','Leaf','Drum'], ['keep toys','Toy box','Bathtub','Clock'],
  ['draw a picture','Crayon','Pillow','Shoe'], ['cross a road safely','Hold an adult’s hand','Run fast','Close your eyes'],
  ['see in the dark','Torch','Spoon','Sock'], ['call someone','Phone','Pencil','Cup'], ['clean the floor','Broom','Ball','Hat'],
  ['protect your head on a bike','Helmet','Gloves','Socks'], ['carry lunch','Lunch box','Pillow','Clock'], ['look in your hair','Mirror','Spoon','Book'],
  ['water a plant','Watering can','Shoe','Drum'], ['keep warm in winter','Sweater','Spoon','Ball']
];
life.forEach(([action, correct, one, two]) => addChoice('body-life', `What do you use to ${action}?`, correct, [one, two]));

// 40 animals, birds, and nature questions
const animals = [
  ['national animal of India','Tiger','Elephant','Giraffe'], ['gives us milk','Cow','Lion','Parrot'], ['lives in water and on land','Frog','Flower','Fish'],
  ['can fly','Bird','Dog','Fish'], ['has a long trunk','Elephant','Cat','Rabbit'], ['says “meow”','Cat','Cow','Duck'],
  ['says “moo”','Cow','Lion','Frog'], ['says “quack”','Duck','Dog','Cat'], ['says “roar”','Lion','Mouse','Goat'],
  ['has black and white stripes','Zebra','Tiger','Cow'], ['has a very long neck','Giraffe','Rabbit','Fish'], ['carries a shell','Tortoise','Dog','Parrot'],
  ['makes honey','Bee','Ant','Butterfly'], ['spins a web','Spider','Bee','Cat'], ['jumps and has long ears','Rabbit','Snake','Elephant'],
  ['is a baby dog','Puppy','Kitten','Calf'], ['is a baby cat','Kitten','Chick','Foal'], ['is a baby cow','Calf','Puppy','Chick'],
  ['lives in a nest','Bird','Fish','Lion'], ['lives in a pond','Fish','Cow','Sparrow'], ['has fins','Fish','Cat','Ant'],
  ['is a pet animal','Dog','Tiger','Crocodile'], ['is a wild animal','Lion','Cow','Goat'], ['is an insect','Ant','Dog','Fish'],
  ['has feathers','Parrot','Cat','Turtle'], ['has wings','Butterfly','Elephant','Fish'], ['gives us wool','Sheep','Duck','Lion'],
  ['pulls a cart','Horse','Fish','Cat'], ['lives on a farm','Hen','Tiger','Whale'], ['has a pouch for its baby','Kangaroo','Cow','Dog'],
  ['can swim in the sea','Dolphin','Rabbit','Hen'], ['is very slow','Snail','Horse','Bird'], ['has eight legs','Octopus','Cat','Bird'],
  ['is a large sea animal','Whale','Ant','Hen'], ['makes a “baa” sound','Goat','Duck','Cat'], ['is pink and likes mud','Pig','Tiger','Parrot'],
  ['has a mane','Lion','Cow','Fish'], ['has scales','Snake','Dog','Cow'], ['is known for hopping','Kangaroo','Turtle','Fish'], ['is a colourful bird','Peacock','Rabbit','Cat']
];
animals.forEach(([clue, correct, one, two]) => addChoice('animals-nature', `Which animal ${clue}?`, correct, [one, two]));

// 25 foods, transport, and community-helper questions
const world = [
  ['is a fruit','Apple','Chair','Shoe'], ['is yellow and is a fruit','Banana','Tomato','Ball'], ['is a vegetable','Carrot','Kite','Book'],
  ['is healthy to drink','Milk','Ink','Paint'], ['is used to travel on water','Boat','Bus','Bicycle'], ['runs on railway tracks','Train','Car','Boat'],
  ['flies in the sky','Aeroplane','Truck','Bicycle'], ['has two wheels','Bicycle','Bus','Train'],
  ['helps us when we are sick','Doctor','Farmer','Postman'], ['puts out fires','Firefighter','Teacher','Chef'], ['teaches children','Teacher','Pilot','Driver'],
  ['grows food for us','Farmer','Doctor','Police officer'], ['keeps us safe','Police officer','Chef','Painter'], ['delivers letters','Postman','Farmer','Teacher'],
  ['makes tasty food','Chef','Pilot','Firefighter'], ['flies an aeroplane','Pilot','Doctor','Farmer'], ['works in a hospital','Nurse','Driver','Postman'],
  ['is a flower','Rose','Carrot','Spoon'], ['is our national flower','Lotus','Rose','Sunflower'],
  ['has thorns','Rose','Lily','Daisy'], ['turns its face towards the sun','Sunflower','Lotus','Tulip'],
  ['is India’s national fruit','Mango','Apple','Orange'], ['is India’s national animal','Tiger','Elephant','Lion'],
  ['is India’s national flag','Tricolour','Rainbow','Red flag'], ['was the first Prime Minister of India','Jawaharlal Nehru','Mahatma Gandhi','Dr. B. R. Ambedkar']
];
world.forEach(([clue, correct, one, two]) => {
  const prompt = clue === 'was the first Prime Minister of India'
    ? 'Who was the first Prime Minister of India?'
    : `Which one ${clue}?`;
  addChoice('world-around-us', prompt, correct, [one, two]);
});
[
  ['Who is the current Prime Minister of India?', 'Narendra Modi', 'Jawaharlal Nehru', 'Mahatma Gandhi'],
  ['Who is the President of India?', 'Droupadi Murmu', 'Pratibha Patil', 'Indira Gandhi'],
  ['Who was the first President of India?', 'Dr. Rajendra Prasad', 'Dr. A. P. J. Abdul Kalam', 'Jawaharlal Nehru'],
  ['Who is the Chief Minister of Kerala?', 'V. D. Satheesan', 'Pinarayi Vijayan', 'K. K. Shailaja'],
  ['Who was the first Chief Minister of Kerala?', 'E. M. S. Namboodiripad', 'Oommen Chandy', 'V. D. Satheesan'],
  ['Who was the first woman Prime Minister of India?', 'Indira Gandhi', 'Pratibha Patil', 'Droupadi Murmu'],
  ['Who was the first woman President of India?', 'Pratibha Patil', 'Indira Gandhi', 'Droupadi Murmu'],
  ['Which leader was called Chacha Nehru?', 'Jawaharlal Nehru', 'Mahatma Gandhi', 'Subhas Chandra Bose'],
  ['Which leader was called Netaji?', 'Subhas Chandra Bose', 'Jawaharlal Nehru', 'Sardar Patel'],
  ['Who is known as the Missile Man of India?', 'A. P. J. Abdul Kalam', 'Jawaharlal Nehru', 'Sardar Patel'],
  ['Which leader was called the Iron Man of India?', 'Sardar Vallabhbhai Patel', 'Subhas Chandra Bose', 'Rajendra Prasad'],
  ['Who was the second Prime Minister of India?', 'Lal Bahadur Shastri', 'Jawaharlal Nehru', 'Indira Gandhi'],
  ['Who wrote the Indian national anthem?', 'Rabindranath Tagore', 'Mahatma Gandhi', 'Jawaharlal Nehru'],
  ['What is the name of India\'s national anthem?', 'Jana Gana Mana', 'Vande Mataram', 'Saare Jahan Se Achha'],
  ['What is the capital of India?', 'New Delhi', 'Mumbai', 'Chennai'],
  ['What is the capital of Kerala?', 'Thiruvananthapuram', 'Kochi', 'Kozhikode'],
  ['Which country do we live in?', 'India', 'Nepal', 'Japan'],
  ['What is the money used in India called?', 'Rupee', 'Dollar', 'Pound'],
  ['In which city is the Taj Mahal?', 'Agra', 'Delhi', 'Mumbai'],
  ['In which city is the Red Fort?', 'Delhi', 'Kochi', 'Chennai'],
  ['In which city can you see the Gateway of India?', 'Mumbai', 'Agra', 'Thiruvananthapuram'],
  ['What are the three main colours on the Indian flag?', 'Saffron, white and green', 'Red, blue and yellow', 'Green, pink and black'],
  ['What is the national river of India?', 'Ganga', 'Yamuna', 'Godavari'],
  ['What is the national song of India?', 'Vande Mataram', 'Jana Gana Mana', 'Saare Jahan Se Achha'],
  ['Which sport is played with a hockey stick?', 'Hockey', 'Cricket', 'Football'],
  ['Which game does Sachin Tendulkar play?', 'Cricket', 'Football', 'Hockey'],
  ['Which festival is known as the festival of lights?', 'Diwali', 'Holi', 'Onam'],
  ['Which festival is known as the festival of colours?', 'Holi', 'Diwali', 'Vishu'],
  ['When does India celebrate Independence Day?', '15 August', '26 January', '14 November'],
  ['When does India celebrate Republic Day?', '26 January', '15 August', '2 October'],
  ['Which language is mainly spoken in Kerala?', 'Malayalam', 'Tamil', 'Hindi'],
  ['Which festival is celebrated in Kerala?', 'Onam', 'Diwali', 'Holi'],
  ['What is the special Onam feast called?', 'Onam Sadya', 'Biryani', 'Puttu'],
  ['What is the flower carpet made for Onam called?', 'Pookkalam', 'Rangoli', 'Kolam'],
  ['Which Kerala dance is famous for its painted faces?', 'Kathakali', 'Garba', 'Bhangra'],
  ['What is the state animal of Kerala?', 'Elephant', 'Tiger', 'Lion'],
  ['Which sea is beside Kerala?', 'Arabian Sea', 'Red Sea', 'Black Sea'],
  ['Which Kerala hill station is famous for tea gardens?', 'Munnar', 'Alappuzha', 'Kochi'],
  ['Which Kerala town is famous for houseboat trips?', 'Alappuzha', 'Munnar', 'Palakkad'],
  ['Where do Kerala houseboats travel?', 'Backwaters', 'Deserts', 'Snowfields'],
  ['Which state has many backwaters and houseboats?', 'Kerala', 'Punjab', 'Rajasthan'],
  ['What is a common tree in Kerala?', 'Coconut palm', 'Pine tree', 'Apple tree'],
  ['Which yellow flower is used during Vishu?', 'Kanikonna', 'Rose', 'Jasmine'],
  ['What kind of boats race during Kerala festivals?', 'Snake boats', 'Sail planes', 'Fishing carts']
].forEach(([prompt, correct, one, two]) => addChoice('general-knowledge', prompt, correct, [one, two]));
// Replaces a broad generic question with a book-aligned India general-knowledge question.
const nationalQuestion = sections['animals-nature'].findIndex(question => question.prompt.includes('national animal of India'));
sections['animals-nature'][nationalQuestion] = {
  id: 'animals-nature-1', type: 'text-options',
  prompt: 'Who is known as the Father of our Nation?',
  options: ['Mahatma Gandhi', 'Jawaharlal Nehru', 'Dr. B. R. Ambedkar'].map(text => ({ text, image: imageFor(text) })),
  correctIndex: 0
};

// 30 patterns, opposites, and odd-one-out questions
for (let n = 2; n <= 20; n += 2) addChoice('patterns-logic', `Complete the number pattern: ${n - 2}, ${n}, __`, String(n + 2), [String(n + 1), String(n + 3)]);
[['day','night','morning','evening'],['hot','cold','warm','wet'],['big','small','tall','fast'],['up','down','left','right'],['happy','sad','angry','sleepy'],['full','empty','heavy','light'],['open','closed','clean','wet'],['fast','slow','loud','soft']].forEach(([word, correct, one, two]) => addChoice('patterns-logic', `What is the opposite of ${word}?`, correct, [one, two]));
[['Apple','Mango','Car'],['Cat','Dog','Table'],['Bus','Train','Banana'],['Red','Blue','Spoon'],['Sun','Moon','Shoe'],['Fish','Bird','Pencil'],['Cow','Goat','Book'],['Circle','Square','Tiger'],['Shirt','Socks','Apple'],['Lion','Tiger','Chair'],['Car','Van','Ball'],['Milk','Juice','Shoe']].forEach(([a,b,c]) => addChoice('patterns-logic', 'Find the odd one out.', c, [a,b]));

const sourceTests = Object.entries(sections).map(([id, questions]) => ({ id, title: id.replace(/-/g, ' '), questions }));
const sourceTotal = sourceTests.reduce((sum, test) => sum + test.questions.length, 0);
if (sourceTotal !== 294) throw new Error(`Expected 294 source questions, got ${sourceTotal}`);
const groups = [
  ['general-knowledge', 'gk'],
  ['alphabets', 'alphabets'],
  ['numbers', 'numbers'],
  ['shapes-colours', 'shapes-colours'],
  ['body-parts', 'body-parts'],
  ['animals-nature', 'animals-nature'],
  ['everyday-world', 'everyday-world'],
  ['logic-reasoning', 'logic-reasoning']
].map(([id, prefix]) => ({ id, title: id.replace(/-/g, ' '), prefix, questions: [] }));
const groupById = new Map(groups.map(group => [group.id, group]));
const isGeneralKnowledge = question =>
  /national (?:flower|fruit|animal|flag)|father of our nation|prime minister of india/i.test(question.prompt)
  || question.options.some(option => /mahatma gandhi|jawaharlal nehru|dr\. b\. r\. ambedkar/i.test(option.text));
const isPlantOrFlower = prompt => /\b(?:flower|fruit|vegetable|thorns|sun)\b/i.test(prompt);
const isLetterQuestion = prompt => /\bletter\b/i.test(prompt);

for (const test of sourceTests) {
  for (const question of test.questions) {
    let groupId;
    if (test.id === 'general-knowledge') {
      groupId = 'general-knowledge';
    } else if (test.id === 'letters' || (test.id === 'shapes-colours' && isLetterQuestion(question.prompt))) {
      groupId = 'alphabets';
    } else if (test.id === 'numbers') {
      groupId = 'numbers';
    } else if (test.id === 'shapes-colours') {
      groupId = 'shapes-colours';
    } else if (test.id === 'patterns-logic') {
      groupId = 'logic-reasoning';
    } else if (test.id === 'body-life' && question.prompt.startsWith('Which body part')) {
      groupId = 'body-parts';
    } else if (test.id === 'body-life') {
      groupId = 'everyday-world';
    } else if (isGeneralKnowledge(question)) {
      groupId = 'general-knowledge';
    } else if (test.id === 'animals-nature' || (test.id === 'world-around-us' && isPlantOrFlower(question.prompt))) {
      groupId = 'animals-nature';
    } else if (test.id === 'world-around-us') {
      groupId = 'everyday-world';
    }
    if (!groupId) throw new Error(`Could not categorize question ${question.id}: ${question.prompt}`);
    groupById.get(groupId).questions.push(question);
  }
}
const shuffle = list => {
  const result = [...list];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};
const questionsPerGroup = 5;
const tests = groups.map(({ id, title, prefix, questions }) => {
  if (questions.length < questionsPerGroup) {
    throw new Error(`Expected at least ${questionsPerGroup} questions for ${id}, got ${questions.length}`);
  }
  const selectedQuestions = shuffle(questions);
  return {
    id, title,
    questions: selectedQuestions.map((question, index) => ({
      ...question,
      id: `${prefix}-${index + 1}`,
      options: ['alphabets', 'general-knowledge'].includes(id)
        ? question.options.map(({ text }) => ({ text }))
        : question.options
    }))
  };
});
const rootDir = path.join(__dirname, '..');
fs.mkdirSync(optionAssetsDir, { recursive: true });
const referencedAssets = new Set(tests.flatMap(test =>
  test.questions.flatMap(question => question.options)
    .map(option => option.image && path.basename(decodeURIComponent(option.image)))
    .filter(Boolean)
));
for (const fileName of referencedAssets) {
  const svg = optionAssets.get(fileName);
  const assetPath = path.join(optionAssetsDir, fileName);
  if (svg) fs.writeFileSync(assetPath, svg);
  else if (!fs.existsSync(assetPath)) throw new Error(`Missing option image: ${assetPath}`);
}
fs.writeFileSync(path.join(rootDir, 'data', 'questions.json'), JSON.stringify({ tests }, null, 2) + '\n');
const questionCount = tests.reduce((sum, test) => sum + test.questions.length, 0);
console.log(`Wrote ${questionCount} questions across ${tests.length} groups and ${referencedAssets.size} local option images.`);
