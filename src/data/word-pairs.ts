import { WordPair } from "@/lib/types";

// Original list of similar-but-different pairs.
// Categories: food, animals, objects, places, tech, sports, nature, arts, home, school, jobs, travel
export const WORD_PAIRS: WordPair[] = [
  // food
  { a: "butter", b: "margarine", category: "food", difficulty: "easy" },
  { a: "sushi", b: "sashimi", category: "food", difficulty: "easy" },
  { a: "pancake", b: "crepe", category: "food", difficulty: "easy" },
  { a: "baguette", b: "ciabatta", category: "food", difficulty: "easy" },
  { a: "brownie", b: "fudge", category: "food", difficulty: "easy" },
  { a: "ketchup", b: "tomato sauce", category: "food", difficulty: "easy" },
  { a: "chickpea", b: "soybean", category: "food", difficulty: "medium" },
  { a: "mozzarella", b: "burrata", category: "food", difficulty: "medium" },
  { a: "risotto", b: "paella", category: "food", difficulty: "medium" },
  { a: "tortilla", b: "flatbread", category: "food", difficulty: "easy" },
  { a: "croissant", b: "brioche", category: "food", difficulty: "easy" },
  { a: "quinoa", b: "couscous", category: "food", difficulty: "medium" },
  { a: "udon", b: "ramen", category: "food", difficulty: "easy" },
  { a: "sherbet", b: "sorbet", category: "food", difficulty: "medium" },
  { a: "nectarine", b: "peach", category: "food", difficulty: "easy" },
  { a: "grapefruit", b: "pomelo", category: "food", difficulty: "hard" },
  { a: "cappuccino", b: "latte", category: "food", difficulty: "easy" },
  { a: "macaron", b: "meringue", category: "food", difficulty: "medium" },
  { a: "kimchi", b: "sauerkraut", category: "food", difficulty: "medium" },
  { a: "tamarind", b: "date", category: "food", difficulty: "medium" },
  { a: "barbecue", b: "grill", category: "food", difficulty: "easy" },
  { a: "popsicle", b: "ice pop", category: "food", difficulty: "easy" },
  { a: "spinach", b: "kale", category: "food", difficulty: "easy" },
  { a: "basil", b: "mint", category: "food", difficulty: "easy" },
  { a: "tapioca", b: "sago", category: "food", difficulty: "hard" },
  { a: "pesto", b: "chimichurri", category: "food", difficulty: "medium" },
  { a: "dumpling", b: "gnocchi", category: "food", difficulty: "medium" },
  { a: "oatmeal", b: "porridge", category: "food", difficulty: "easy" },
  { a: "waffle", b: "pizzelle", category: "food", difficulty: "hard" },
  { a: "espresso", b: "ristretto", category: "food", difficulty: "hard" },
  // animals
  { a: "tortoise", b: "turtle", category: "animals", difficulty: "easy" },
  { a: "leopard", b: "cheetah", category: "animals", difficulty: "easy" },
  { a: "dolphin", b: "porpoise", category: "animals", difficulty: "medium" },
  { a: "crow", b: "raven", category: "animals", difficulty: "easy" },
  { a: "moth", b: "butterfly", category: "animals", difficulty: "easy" },
  { a: "lizard", b: "gecko", category: "animals", difficulty: "easy" },
  { a: "alpaca", b: "llama", category: "animals", difficulty: "easy" },
  { a: "otter", b: "beaver", category: "animals", difficulty: "easy" },
  { a: "seal", b: "sea lion", category: "animals", difficulty: "easy" },
  { a: "goose", b: "swan", category: "animals", difficulty: "easy" },
  { a: "yak", b: "bison", category: "animals", difficulty: "medium" },
  { a: "walrus", b: "manatee", category: "animals", difficulty: "hard" },
  { a: "badger", b: "wolverine", category: "animals", difficulty: "hard" },
  { a: "jellyfish", b: "anemone", category: "animals", difficulty: "hard" },
  // objects
  { a: "piano", b: "keyboard", category: "objects", difficulty: "easy" },
  { a: "violin", b: "viola", category: "objects", difficulty: "easy" },
  { a: "mug", b: "cup", category: "objects", difficulty: "easy" },
  { a: "sofa", b: "couch", category: "objects", difficulty: "easy" },
  { a: "blanket", b: "quilt", category: "objects", difficulty: "easy" },
  { a: "mirror", b: "looking glass", category: "objects", difficulty: "easy" },
  { a: "notebook", b: "journal", category: "objects", difficulty: "easy" },
  { a: "eraser", b: "rubber", category: "objects", difficulty: "easy" },
  { a: "flashlight", b: "torch", category: "objects", difficulty: "easy" },
  { a: "marker", b: "highlighter", category: "objects", difficulty: "easy" },
  { a: "screwdriver", b: "hex key", category: "objects", difficulty: "medium" },
  { a: "spatula", b: "turner", category: "objects", difficulty: "easy" },
  { a: "thermos", b: "flask", category: "objects", difficulty: "easy" },
  { a: "frying pan", b: "wok", category: "objects", difficulty: "easy" },
  { a: "bucket", b: "pail", category: "objects", difficulty: "easy" },
  { a: "headphones", b: "earbuds", category: "objects", difficulty: "easy" },
  { a: "printer", b: "copier", category: "objects", difficulty: "easy" },
  { a: "tripod", b: "easel", category: "objects", difficulty: "medium" },
  { a: "compass", b: "protractor", category: "objects", difficulty: "medium" },
  { a: "tweezers", b: "forceps", category: "objects", difficulty: "hard" },
  // places
  { a: "subway", b: "metro", category: "places", difficulty: "easy" },
  { a: "alley", b: "lane", category: "places", difficulty: "easy" },
  { a: "cabin", b: "cottage", category: "places", difficulty: "easy" },
  { a: "hostel", b: "dormitory", category: "places", difficulty: "medium" },
  { a: "harbor", b: "port", category: "places", difficulty: "easy" },
  { a: "canyon", b: "gorge", category: "places", difficulty: "medium" },
  { a: "islet", b: "atoll", category: "places", difficulty: "hard" },
  { a: "prairie", b: "savanna", category: "places", difficulty: "hard" },
  { a: "oasis", b: "lagoon", category: "places", difficulty: "hard" },
  { a: "clinic", b: "infirmary", category: "places", difficulty: "medium" },
  // tech
  { a: "laptop", b: "ultrabook", category: "tech", difficulty: "easy" },
  { a: "router", b: "modem", category: "tech", difficulty: "easy" },
  { a: "SSD", b: "NVMe", category: "tech", difficulty: "medium" },
  { a: "bluetooth", b: "airdrop", category: "tech", difficulty: "easy" },
  { a: "captcha", b: "2FA", category: "tech", difficulty: "medium" },
  { a: "firmware", b: "driver", category: "tech", difficulty: "medium" },
  { a: "cookie", b: "cache", category: "tech", difficulty: "easy" },
  { a: "emoji", b: "sticker", category: "tech", difficulty: "easy" },
  { a: "avatar", b: "profile picture", category: "tech", difficulty: "easy" },
  { a: "compiler", b: "interpreter", category: "tech", difficulty: "medium" },
  { a: "QR code", b: "barcode", category: "tech", difficulty: "easy" },
  // sports
  { a: "soccer", b: "futsal", category: "sports", difficulty: "easy" },
  { a: "baseball", b: "softball", category: "sports", difficulty: "easy" },
  { a: "badminton", b: "tennis", category: "sports", difficulty: "easy" },
  { a: "surfing", b: "windsurfing", category: "sports", difficulty: "medium" },
  { a: "snowboard", b: "skateboard", category: "sports", difficulty: "easy" },
  { a: "hiking", b: "trekking", category: "sports", difficulty: "easy" },
  { a: "kayak", b: "canoe", category: "sports", difficulty: "easy" },
  { a: "archery", b: "crossbow", category: "sports", difficulty: "medium" },
  { a: "sprint", b: "marathon", category: "sports", difficulty: "easy" },
  // nature
  { a: "typhoon", b: "hurricane", category: "nature", difficulty: "easy" },
  { a: "moss", b: "lichen", category: "nature", difficulty: "medium" },
  { a: "stalactite", b: "stalagmite", category: "nature", difficulty: "medium" },
  { a: "granite", b: "basalt", category: "nature", difficulty: "hard" },
  { a: "delta", b: "estuary", category: "nature", difficulty: "hard" },
  { a: "geyser", b: "hot spring", category: "nature", difficulty: "easy" },
  { a: "glacier", b: "iceberg", category: "nature", difficulty: "easy" },
  { a: "reef", b: "shoal", category: "nature", difficulty: "hard" },
  { a: "swamp", b: "bog", category: "nature", difficulty: "medium" },
  // arts
  { a: "watercolor", b: "gouache", category: "arts", difficulty: "hard" },
  { a: "symphony", b: "concerto", category: "arts", difficulty: "hard" },
  { a: "ballet", b: "modern dance", category: "arts", difficulty: "medium" },
  { a: "portrait", b: "self-portrait", category: "arts", difficulty: "easy" },
  { a: "engraving", b: "etching", category: "arts", difficulty: "hard" },
  { a: "origami", b: "kirigami", category: "arts", difficulty: "medium" },
  { a: "haiku", b: "tanka", category: "arts", difficulty: "hard" },
  // home
  { a: "duvet", b: "comforter", category: "home", difficulty: "easy" },
  { a: "closet", b: "wardrobe", category: "home", difficulty: "easy" },
  { a: "balcony", b: "terrace", category: "home", difficulty: "easy" },
  { a: "attic", b: "loft", category: "home", difficulty: "easy" },
  { a: "dresser", b: "chest", category: "home", difficulty: "easy" },
  { a: "blender", b: "food processor", category: "home", difficulty: "easy" },
  { a: "toaster", b: "broiler", category: "home", difficulty: "easy" },
  { a: "mattress", b: "futon", category: "home", difficulty: "easy" },
  { a: "linen", b: "cotton", category: "home", difficulty: "easy" },
  // school
  { a: "lecture", b: "seminar", category: "school", difficulty: "easy" },
  { a: "thesis", b: "dissertation", category: "school", difficulty: "medium" },
  { a: "algebra", b: "calculus", category: "school", difficulty: "medium" },
  { a: "geometry", b: "trigonometry", category: "school", difficulty: "medium" },
  { a: "dictionary", b: "thesaurus", category: "school", difficulty: "easy" },
  { a: "locker", b: "cubby", category: "school", difficulty: "easy" },
  // jobs
  { a: "barber", b: "hairdresser", category: "jobs", difficulty: "easy" },
  { a: "attorney", b: "prosecutor", category: "jobs", difficulty: "medium" },
  { a: "painter", b: "plasterer", category: "jobs", difficulty: "medium" },
  { a: "gardener", b: "landscaper", category: "jobs", difficulty: "easy" },
  { a: "paramedic", b: "nurse", category: "jobs", difficulty: "easy" },
  { a: "journalist", b: "blogger", category: "jobs", difficulty: "easy" },
  { a: "cashier", b: "teller", category: "jobs", difficulty: "easy" },
  // travel
  { a: "visa", b: "passport", category: "travel", difficulty: "easy" },
  { a: "souvenir", b: "postcard", category: "travel", difficulty: "easy" },
  { a: "itinerary", b: "schedule", category: "travel", difficulty: "easy" },
  { a: "cabin baggage", b: "carry-on", category: "travel", difficulty: "easy" },
  { a: "stopover", b: "layover", category: "travel", difficulty: "easy" },
  { a: "host", b: "guide", category: "travel", difficulty: "easy" },
  // more general
  { a: "novel", b: "novella", category: "arts", difficulty: "medium" },
  { a: "myth", b: "legend", category: "arts", difficulty: "easy" },
  { a: "anthem", b: "hymn", category: "arts", difficulty: "medium" },
  { a: "festival", b: "carnival", category: "places", difficulty: "easy" },
  { a: "stadium", b: "arena", category: "places", difficulty: "easy" },
  { a: "freeway", b: "expressway", category: "places", difficulty: "easy" },
  { a: "raincoat", b: "poncho", category: "objects", difficulty: "easy" },
  { a: "wallet", b: "billfold", category: "objects", difficulty: "medium" },
  { a: "lipstick", b: "lip balm", category: "objects", difficulty: "easy" },
  { a: "tripod", b: "monopod", category: "objects", difficulty: "medium" },
  { a: "skillet", b: "griddle", category: "objects", difficulty: "medium" },
  { a: "broth", b: "stock", category: "food", difficulty: "medium" },
  { a: "scone", b: "biscuit", category: "food", difficulty: "easy" },
  { a: "bruschetta", b: "crostini", category: "food", difficulty: "hard" },
  { a: "cannoli", b: "eclair", category: "food", difficulty: "medium" },
  { a: "espresso", b: "lungo", category: "food", difficulty: "hard" },
  { a: "taco", b: "quesadilla", category: "food", difficulty: "easy" },
  { a: "gopher", b: "groundhog", category: "animals", difficulty: "hard" },
  { a: "caterpillar", b: "larva", category: "animals", difficulty: "medium" },
  { a: "squid", b: "cuttlefish", category: "animals", difficulty: "hard" },
  { a: "owl", b: "hawk", category: "animals", difficulty: "easy" },
  { a: "ferret", b: "weasel", category: "animals", difficulty: "easy" },
];

// Expanded dataset (adds 350+ more pairs across categories)
function addTuples(target: WordPair[], tuples: [string, string][], category: string, difficulty: WordPair["difficulty"] = "easy", spicy = false) {
  for (const [a, b] of tuples) target.push({ a, b, category, difficulty, spicy });
}

const EXTRA_WORDS: WordPair[] = [];

addTuples(EXTRA_WORDS, [
  ["coriander", "cilantro"], ["zucchini", "cucumber"], ["parmesan", "pecorino"], ["ham", "prosciutto"], ["salami", "chorizo"],
  ["yogurt", "kefir"], ["gelato", "ice cream"], ["pita", "naan"], ["tortellini", "ravioli"], ["brown sugar", "molasses"],
  ["lima bean", "edamame"], ["blackberry", "mulberry"], ["raspberry", "boysenberry"], ["pistachio", "almond"], ["walnut", "pecan"],
  ["cider", "juice"], ["scone", "shortbread"], ["curry", "stew"], ["okra", "eggplant"], ["salsa", "pico de gallo"],
  ["gazpacho", "minestrone"], ["tiramisu", "trifle"], ["panna cotta", "flan"], ["scone", "crumpet"], ["hash brown", "rosti"],
  ["oyster", "clam"], ["shrimp", "prawn"], ["sardine", "anchovy"], ["cod", "haddock"], ["trout", "salmon"], ["bagel", "bublik"],
  ["cannellini", "navy bean"], ["cabbage", "lettuce"], ["honeydew", "cantaloupe"], ["cocoa", "carob"], ["saffron", "turmeric"],
  ["plum", "prune"], ["marmalade", "jam"], ["muffin", "cupcake"], ["coleslaw", "kimchi"]
], "food", "easy");

addTuples(EXTRA_WORDS, [
  ["hare", "rabbit"], ["donkey", "mule"], ["antelope", "gazelle"], ["alligator", "crocodile"], ["eel", "lamprey"],
  ["sparrow", "finch"], ["pigeon", "dove"], ["chimpanzee", "gorilla"], ["moose", "elk"], ["reindeer", "caribou"],
  ["carp", "koi"], ["octopus", "squid"], ["owl", "eagle"], ["caterpillar", "grub"], ["boar", "hog"],
  ["ant", "termite"], ["crab", "lobster"], ["scorpion", "spider"], ["falcon", "hawk"], ["tuna", "mackerel"],
  ["panther", "jaguar"], ["cougar", "puma"], ["buffalo", "water buffalo"], ["camel", "dromedary"], ["salamander", "newt"],
  ["orca", "beluga"], ["goat", "sheep"], ["koala", "wombat"], ["otter", "mink"], ["python", "boa"], ["ibis", "heron"],
  ["flamingo", "stork"], ["ostrich", "emu"], ["dingo", "coyote"], ["lynx", "bobcat"], ["weasel", "stoat"]
], "animals", "easy");

addTuples(EXTRA_WORDS, [
  ["teapot", "kettle"], ["plate", "platter"], ["ladle", "scoop"], ["saucepan", "pot"], ["mortar", "pestle"],
  ["towel", "napkin"], ["curtain", "drape"], ["sheet", "blanket"], ["mattress", "topper"], ["pillow", "cushion"],
  ["cabinet", "cupboard"], ["sofa", "settee"], ["armchair", "recliner"], ["stool", "ottoman"], ["painting", "print"],
  ["statue", "sculpture"], ["vase", "urn"], ["bottle", "carafe"], ["glass", "goblet"], ["tumbler", "mug"],
  ["thermometer", "barometer"], ["microscope", "telescope"], ["calculator", "abacus"], ["wallet", "purse"], ["briefcase", "satchel"],
  ["backpack", "duffel"], ["suitcase", "valise"], ["sneaker", "trainer"], ["boot", "loafer"], ["sandal", "flip-flop"],
  ["umbrella", "parasol"], ["glasses", "spectacles"], ["sunglasses", "shades"], ["helmet", "hard hat"], ["belt", "sash"],
  ["scarf", "shawl"], ["apron", "smock"], ["notebook", "sketchbook"], ["crayon", "pastel"], ["marker", "felt-tip"]
], "objects", "easy");

addTuples(EXTRA_WORDS, [
  ["village", "hamlet"], ["town", "city"], ["capital", "metropolis"], ["harbor", "marina"], ["pier", "jetty"],
  ["desert", "dune"], ["jungle", "rainforest"], ["field", "meadow"], ["grove", "orchard"], ["hill", "knoll"],
  ["mountain", "peak"], ["valley", "dale"], ["coast", "shore"], ["beach", "shoreline"], ["bay", "gulf"],
  ["strait", "channel"], ["peninsula", "isthmus"], ["plateau", "mesa"], ["cave", "cavern"], ["mine", "quarry"],
  ["library", "archives"], ["museum", "gallery"], ["theater", "cinema"], ["plaza", "square"], ["park", "garden"],
  ["fort", "citadel"], ["castle", "palace"], ["temple", "shrine"], ["cathedral", "basilica"], ["market", "bazaar"]
], "places", "easy");

addTuples(EXTRA_WORDS, [
  ["USB-C", "Lightning"], ["wifi", "ethernet"], ["hotspot", "tethering"], ["pixel", "vector"], ["server", "gateway"],
  ["backup", "snapshot"], ["restore", "rollback"], ["container", "virtual machine"], ["webhook", "polling"], ["avatar", "emoji"],
  ["streaming", "downloading"], ["upload", "sync"], ["playlist", "queue"], ["bookmark", "favorite"], ["clipboard", "notepad"],
  ["monitor", "display"], ["laptop", "tablet"], ["smartwatch", "fitness band"], ["headset", "earphone"], ["charger", "power bank"],
  ["battery", "cell"], ["firmware", "bios"], ["kernel", "driver"], ["database", "spreadsheet"], ["proxy", "vpn"],
  ["captcha", "passkey"], ["dark mode", "light mode"], ["keyboard", "keypad"], ["shortcut", "macro"], ["patch", "update"]
], "tech", "medium");

addTuples(EXTRA_WORDS, [
  ["rugby", "football"], ["cricket", "baseball"], ["snooker", "billiards"], ["golf", "mini golf"], ["sailing", "rowing"],
  ["kayaking", "rafting"], ["skiing", "snowboarding"], ["skating", "blading"], ["boxing", "wrestling"], ["judo", "karate"],
  ["yoga", "pilates"], ["jogging", "running"], ["sprint", "dash"], ["relay", "hurdles"], ["shot put", "discus"],
  ["long jump", "triple jump"], ["volleyball", "handball"], ["water polo", "synchronized swimming"], ["climbing", "bouldering"], ["fencing", "kendo"],
  ["lacrosse", "field hockey"], ["pickleball", "paddle tennis"], ["taekwondo", "aikido"], ["parkour", "freerunning"], ["ultimate", "frisbee"]
], "sports", "easy");

addTuples(EXTRA_WORDS, [
  ["hail", "sleet"], ["fog", "mist"], ["dew", "frost"], ["tide", "current"], ["cliff", "bluff"],
  ["boulder", "rock"], ["pebble", "gravel"], ["sand", "silt"], ["soil", "loam"], ["vine", "ivy"],
  ["bush", "shrub"], ["flower", "blossom"], ["leaf", "petal"], ["pine", "fir"], ["oak", "maple"],
  ["birch", "aspen"], ["willow", "poplar"], ["cactus", "succulent"], ["aurora", "meteor"], ["rainbow", "halo"],
  ["dune", "drift"], ["marsh", "fen"], ["tundra", "taiga"], ["delta", "estuary"], ["geyser", "hot spring"]
], "nature", "medium");

addTuples(EXTRA_WORDS, [
  ["opera", "musical"], ["rap", "hip-hop"], ["blues", "jazz"], ["rock", "metal"], ["folk", "country"],
  ["sonnet", "ode"], ["epic", "saga"], ["novel", "romance"], ["sketch", "study"], ["charcoal", "graphite"],
  ["oil paint", "acrylic"], ["fresco", "mural"], ["calligraphy", "lettering"], ["monologue", "soliloquy"], ["duet", "duo"],
  ["trio", "quartet"], ["chorus", "choir"], ["bridge", "refrain"], ["hook", "riff"], ["palette", "easel"],
  ["stencil", "template"], ["origami", "tessellation"], ["limerick", "couplet"], ["haiku", "senryu"], ["harmony", "melody"]
], "arts", "medium");

addTuples(EXTRA_WORDS, [
  ["dishwasher", "washer"], ["dryer", "dehumidifier"], ["heater", "radiator"], ["air purifier", "humidifier"], ["broom", "mop"],
  ["vacuum", "sweeper"], ["trash can", "recycling bin"], ["spoon", "fork"], ["knife", "peeler"], ["grater", "zester"],
  ["colander", "sieve"], ["tongs", "chopsticks"], ["coaster", "trivet"], ["placemat", "tablecloth"], ["bedsheet", "bedspread"],
  ["duvet", "coverlet"], ["closet", "pantry"], ["vanity", "dresser"], ["lamp", "sconce"], ["bulb", "tube light"],
  ["switch", "dimmer"], ["socket", "outlet"], ["hinge", "latch"], ["doorknob", "handle"], ["mirror", "vanity mirror"]
], "home", "easy");

addTuples(EXTRA_WORDS, [
  ["notebook", "binder"], ["worksheet", "handout"], ["lecture", "lab"], ["exam", "quiz"], ["homework", "assignment"],
  ["recess", "break"], ["principal", "dean"], ["teacher", "tutor"], ["student", "pupil"], ["essay", "report"],
  ["graph", "chart"], ["map", "globe"], ["atlas", "almanac"], ["ruler", "meter stick"], ["eraser", "white-out"],
  ["stapler", "paperclip"], ["glue", "tape"], ["pen", "pencil"], ["marker", "chalk"], ["calculator", "slide rule"],
  ["hallway", "corridor"], ["auditorium", "gymnasium"], ["cafeteria", "canteen"], ["campus", "quad"], ["locker", "cubby"]
], "school", "easy");

addTuples(EXTRA_WORDS, [
  ["chef", "cook"], ["actor", "performer"], ["singer", "vocalist"], ["driver", "chauffeur"], ["pilot", "captain"],
  ["sailor", "seafarer"], ["miner", "prospector"], ["farmer", "rancher"], ["baker", "pastry chef"], ["butcher", "fishmonger"],
  ["carpenter", "joiner"], ["plumber", "pipefitter"], ["electrician", "lineman"], ["mechanic", "technician"], ["tailor", "seamstress"],
  ["designer", "stylist"], ["analyst", "consultant"], ["banker", "financier"], ["broker", "trader"], ["chemist", "biologist"],
  ["physicist", "astronomer"], ["doctor", "surgeon"], ["nurse", "midwife"], ["paramedic", "EMT"], ["dentist", "orthodontist"]
], "jobs", "easy");

addTuples(EXTRA_WORDS, [
  ["ticket", "boarding pass"], ["gate", "terminal"], ["platform", "station"], ["hostel", "guesthouse"], ["hotel", "motel"],
  ["resort", "villa"], ["taxi", "rideshare"], ["bus", "shuttle"], ["subway", "tram"], ["ferry", "cruise"],
  ["compass", "map"], ["guidebook", "itinerary"], ["backpack", "daypack"], ["souvenir", "keepsake"], ["passport", "visa"],
  ["customs", "immigration"], ["duty-free", "tax-free"], ["tour", "excursion"], ["trek", "hike"], ["cruise", "voyage"],
  ["sunrise", "sunset"], ["north", "south"], ["east", "west"], ["peak", "summit"], ["trail", "path"]
], "travel", "easy");

addTuples(EXTRA_WORDS, [
  ["crimson", "scarlet"], ["navy", "indigo"], ["teal", "turquoise"], ["ivory", "cream"], ["beige", "tan"],
  ["charcoal", "slate"], ["emerald", "jade"], ["amber", "gold"], ["maroon", "burgundy"], ["lavender", "lilac"],
  ["pearl", "opal"], ["copper", "bronze"], ["cyan", "aqua"], ["magenta", "fuchsia"], ["olive", "moss"],
  ["peach", "apricot"], ["azure", "cerulean"], ["silver", "steel"], ["black", "ebony"], ["white", "alabaster"]
], "colors", "easy");

addTuples(EXTRA_WORDS, [
  ["jacket", "blazer"], ["coat", "parka"], ["jeans", "chinos"], ["shirt", "blouse"], ["dress", "gown"],
  ["skirt", "kilt"], ["sweater", "cardigan"], ["hoodie", "pullover"], ["tie", "bow tie"], ["cap", "beanie"],
  ["hat", "fedora"], ["gloves", "mittens"], ["socks", "stockings"], ["boots", "waders"], ["sneakers", "runners"],
  ["sandals", "slides"], ["flip-flops", "thongs"], ["leggings", "tights"], ["belt", "sash"], ["robe", "kimono"]
], "clothing", "easy");

addTuples(EXTRA_WORDS, [
  ["piano", "harpsichord"], ["trumpet", "cornet"], ["trombone", "euphonium"], ["oboe", "english horn"], ["clarinet", "bass clarinet"],
  ["flute", "piccolo"], ["cello", "double bass"], ["guitar", "ukulele"], ["banjo", "mandolin"], ["drum", "timpani"],
  ["synth", "sampler"], ["microphone", "mic"], ["amplifier", "preamp"], ["speaker", "monitor"], ["mixer", "console"],
  ["metronome", "click track"], ["scale", "mode"], ["beat", "groove"], ["verse", "stanza"], ["chorus", "refrain"]
], "music", "medium");

addTuples(EXTRA_WORDS, [
  ["hammer", "mallet"], ["saw", "hacksaw"], ["drill", "auger"], ["file", "rasp"], ["wrench", "spanner"],
  ["pliers", "nippers"], ["chisel", "gouge"], ["level", "plumb line"], ["square", "bevel"], ["ruler", "tape measure"],
  ["sander", "polisher"], ["staple gun", "nail gun"], ["ladder", "step stool"], ["wheelbarrow", "hand truck"], ["axe", "hatchet"],
  ["hoe", "rake"], ["shovel", "spade"], ["pruner", "shears"], ["trowel", "dibber"], ["awl", "punch"]
], "tools", "medium");

addTuples(EXTRA_WORDS, [
  ["sedan", "hatchback"], ["coupe", "convertible"], ["SUV", "crossover"], ["minivan", "microvan"], ["pickup", "ute"],
  ["motorcycle", "scooter"], ["bicycle", "unicycle"], ["tram", "trolley"], ["subway", "metro"], ["train", "monorail"],
  ["helicopter", "gyrocopter"], ["airplane", "glider"], ["sailboat", "yacht"], ["canoe", "kayak"], ["barge", "ferry"],
  ["truck", "lorry"], ["bulldozer", "excavator"], ["forklift", "pallet jack"], ["rocket", "shuttle"], ["hoverboard", "segway"]
], "vehicles", "easy");

addTuples(EXTRA_WORDS, [
  ["tea", "chai"], ["coffee", "mocha"], ["soda", "cola"], ["lemonade", "limeade"], ["smoothie", "milkshake"],
  ["espresso", "americano"], ["cappuccino", "flat white"], ["latte", "macchiato"], ["herbal tea", "tisane"], ["sparkling water", "seltzer"],
  ["cocoa", "hot chocolate"], ["juice", "nectar"], ["cider", "perry"], ["kombucha", "water kefir"], ["tonic", "ginger ale"],
  ["iced tea", "sweet tea"], ["matcha", "sencha"], ["oolong", "pu-erh"], ["ginger beer", "root beer"], ["syrup", "cordial"]
], "beverages", "easy");

// Optional spicy/adult (off by default)
addTuples(EXTRA_WORDS, [
  ["flirting", "complimenting"], ["daydream", "fantasy"], ["wink", "nod"], ["scandal", "rumor"], ["tabloid", "gossip"],
  ["blush", "flush"], ["silk", "satin"], ["boudoir", "bedroom"], ["masquerade", "costume party"], ["tease", "taunt"],
  ["dare", "bet"], ["limerick", "innuendo"], ["sizzle", "spark"], ["secret", "whisper"], ["chemistry", "spark"],
  ["flame", "ember"], ["jealousy", "envy"], ["crush", "infatuation"], ["mystery", "thriller"], ["midnight", "afterhours"]
], "spicy", "medium", true);

// Merge extras
export const WORD_PAIRS_ALL: WordPair[] = [...WORD_PAIRS, ...EXTRA_WORDS];
