"""
seed_data.py — Complete seed for the Duolingo clone.

Re-creates all tables on every run (drop_all then create_all).
Guards against double-seeding with the User count check.

Exercise count: 10 per lesson (2× multiple_choice, 2× translate/word-bank,
                               2× fill_blank, 2× type_answer, 2× match_pairs)
Guidebooks:     1 per skill (9 total), 3-4 sections each, real Spanish content.
"""

from datetime import datetime, timedelta

from app.core.database import SessionLocal, Base, engine
from app.models.user import User, Streak, Settings, Achievement, UserAchievement, CriteriaType
from app.models.course import Language, Unit, Skill
from app.models.lesson import Lesson, Exercise, ExerciseOption, ExerciseType
from app.models.progress import SkillStatus, UserSkillProgress, XPHistory, XPSource, Quest, QuestType, ShopItem, ShopItemType
from app.models.guidebook import Guidebook, GuidebookSection

# Re-create database tables
Base.metadata.drop_all(bind=engine)
Base.metadata.create_all(bind=engine)


# ---------------------------------------------------------------------------
# Per-skill content bank
# Each skill has:
#   "vocab"     : list of (english, spanish, [wrong1, wrong2, wrong3])
#   "sentences" : list of (english, spanish_sentence, [distractor1, distractor2, distractor3])
#   "pairs"     : list of (english, spanish) — used for match_pairs
# ---------------------------------------------------------------------------
CONTENT = {
    "Intro": {
        "vocab": [
            ("Apple",   "Manzana",  ["Naranja", "Pera", "Uva"]),
            ("Bread",   "Pan",      ["Agua", "Leche", "Sal"]),
            ("Water",   "Agua",     ["Vino", "Jugo", "Té"]),
            ("Milk",    "Leche",    ["Pan", "Queso", "Mantequilla"]),
            ("Boy",     "Niño",     ["Niña", "Hombre", "Mujer"]),
            ("Girl",    "Niña",     ["Niño", "Mujer", "Hombre"]),
        ],
        "sentences": [
            ("I drink water",       "Yo bebo agua",       ["leche", "el", "pan", "comes"]),
            ("The boy drinks milk", "El niño bebe leche", ["niña", "come", "yo", "agua"]),
            ("She eats bread",      "Ella come pan",      ["bebe", "niño", "yo", "leche"]),
            ("I eat an apple",      "Yo como una manzana",["bebo", "el", "agua", "niño"]),
        ],
        "pairs": [
            ("Hello",   "Hola"),
            ("Goodbye", "Adiós"),
            ("Yes",     "Sí"),
            ("No",      "No"),
            ("And",     "Y"),
            ("Or",      "O"),
        ],
    },
    "Greetings": {
        "vocab": [
            ("Morning",   "Mañana",   ["Noche", "Tarde", "Día"]),
            ("Night",     "Noche",    ["Día", "Sol", "Mañana"]),
            ("Hello",     "Hola",     ["Adiós", "Sí", "Gracias"]),
            ("Goodbye",   "Adiós",    ["Hola", "Sí", "Por favor"]),
            ("Please",    "Por favor",["Gracias", "Lo siento", "De nada"]),
            ("Thank you", "Gracias",  ["Por favor", "Lo siento", "Hola"]),
        ],
        "sentences": [
            ("Good morning",         "Buenos días",         ["noches", "tardes", "mal", "hola"]),
            ("Good night",           "Buenas noches",       ["días", "tardes", "bien", "mal"]),
            ("How are you",          "Cómo estás",          ["qué", "bien", "yo", "dónde"]),
            ("I am fine thank you",  "Estoy bien gracias",  ["mal", "yo", "hola", "cómo"]),
        ],
        "pairs": [
            ("Please",  "Por favor"),
            ("Thanks",  "Gracias"),
            ("Sorry",   "Lo siento"),
            ("Welcome", "De nada"),
            ("Good",    "Bueno"),
            ("Bad",     "Malo"),
        ],
    },
    "Travel": {
        "vocab": [
            ("Airport",  "Aeropuerto", ["Tren", "Hotel", "Puerto"]),
            ("Ticket",   "Boleto",     ["Pasaporte", "Maleta", "Visa"]),
            ("Hotel",    "Hotel",      ["Casa", "Cama", "Tienda"]),
            ("Passport", "Pasaporte",  ["Boleto", "Maleta", "Mapa"]),
            ("Suitcase", "Maleta",     ["Boleto", "Pasaporte", "Ropa"]),
            ("Map",      "Mapa",       ["Maleta", "Pasaporte", "Guía"]),
        ],
        "sentences": [
            ("Where is the airport",   "Dónde está el aeropuerto",   ["tren", "hotel", "yo", "quiero"]),
            ("I need a ticket",        "Necesito un boleto",          ["quiero", "hotel", "el", "dónde"]),
            ("The hotel is far",       "El hotel está lejos",         ["cerca", "aquí", "yo", "tren"]),
            ("I have my passport",     "Tengo mi pasaporte",          ["maleta", "boleto", "yo", "dónde"]),
        ],
        "pairs": [
            ("Train",   "Tren"),
            ("Bus",     "Autobús"),
            ("Car",     "Coche"),
            ("Plane",   "Avión"),
            ("Boat",    "Barco"),
            ("Taxi",    "Taxi"),
        ],
    },
    "Restaurant": {
        "vocab": [
            ("Menu",    "Menú",   ["Mesa", "Silla", "Plato"]),
            ("Water",   "Agua",   ["Vino", "Cerveza", "Jugo"]),
            ("Food",    "Comida", ["Bebida", "Pan", "Plato"]),
            ("Wine",    "Vino",   ["Agua", "Cerveza", "Jugo"]),
            ("Waiter",  "Mesero", ["Chef", "Cocinero", "Cajero"]),
            ("Bill",    "Cuenta", ["Mesa", "Menú", "Pago"]),
        ],
        "sentences": [
            ("The bill please",    "La cuenta por favor",  ["mesa", "agua", "yo", "menú"]),
            ("I want water",       "Quiero agua",           ["necesito", "vino", "el", "menú"]),
            ("The menu please",    "El menú por favor",     ["cuenta", "agua", "mesa", "yo"]),
            ("I want red wine",    "Quiero vino tinto",     ["blanco", "agua", "necesito", "mesa"]),
        ],
        "pairs": [
            ("Table",   "Mesa"),
            ("Chair",   "Silla"),
            ("Fork",    "Tenedor"),
            ("Spoon",   "Cuchara"),
            ("Knife",   "Cuchillo"),
            ("Plate",   "Plato"),
        ],
    },
    "Family": {
        "vocab": [
            ("Mother",  "Madre",   ["Padre", "Hermano", "Abuelo"]),
            ("Father",  "Padre",   ["Abuelo", "Tío", "Madre"]),
            ("Brother", "Hermano", ["Hermana", "Primo", "Madre"]),
            ("Sister",  "Hermana", ["Hermano", "Prima", "Madre"]),
            ("Son",     "Hijo",    ["Hija", "Padre", "Abuelo"]),
            ("Daughter","Hija",    ["Hijo", "Madre", "Abuela"]),
        ],
        "sentences": [
            ("He is my brother",    "Él es mi hermano",    ["ella", "padre", "yo", "prima"]),
            ("My mother is here",   "Mi madre está aquí",  ["padre", "allí", "el", "hermano"]),
            ("She is my sister",    "Ella es mi hermana",  ["él", "hermano", "yo", "padre"]),
            ("My father is tall",   "Mi padre es alto",    ["madre", "bajo", "yo", "hermano"]),
        ],
        "pairs": [
            ("Sister",  "Hermana"),
            ("Aunt",    "Tía"),
            ("Uncle",   "Tío"),
            ("Cousin",  "Primo"),
            ("Son",     "Hijo"),
            ("Daughter","Hija"),
        ],
    },
    "Shopping": {
        "vocab": [
            ("Store",  "Tienda",  ["Mercado", "Banco", "Plaza"]),
            ("Money",  "Dinero",  ["Tarjeta", "Banco", "Precio"]),
            ("Shirt",  "Camisa",  ["Pantalón", "Zapato", "Sombrero"]),
            ("Price",  "Precio",  ["Dinero", "Tienda", "Descuento"]),
            ("Sale",   "Oferta",  ["Precio", "Tienda", "Banco"]),
            ("Card",   "Tarjeta", ["Dinero", "Efectivo", "Banco"]),
        ],
        "sentences": [
            ("How much does it cost",  "Cuánto cuesta",       ["qué", "dinero", "yo", "dónde"]),
            ("I buy a shirt",          "Compro una camisa",   ["vendo", "pantalón", "el", "precio"]),
            ("Do you accept cards",    "Acepta tarjetas",     ["dinero", "efectivo", "yo", "cuánto"]),
            ("It is on sale",          "Está en oferta",      ["precio", "tienda", "cuesta", "yo"]),
        ],
        "pairs": [
            ("Pants",  "Pantalones"),
            ("Shoes",  "Zapatos"),
            ("Hat",    "Sombrero"),
            ("Dress",  "Vestido"),
            ("Jacket", "Chaqueta"),
            ("Bag",    "Bolsa"),
        ],
    },
    "School": {
        "vocab": [
            ("Book",     "Libro",      ["Cuaderno", "Lápiz", "Bolígrafo"]),
            ("Pen",      "Bolígrafo",  ["Lápiz", "Papel", "Libro"]),
            ("Teacher",  "Profesor",   ["Estudiante", "Libro", "Clase"]),
            ("Student",  "Estudiante", ["Profesor", "Clase", "Tarea"]),
            ("Class",    "Clase",      ["Escuela", "Libro", "Tarea"]),
            ("Homework", "Tarea",      ["Clase", "Libro", "Examen"]),
        ],
        "sentences": [
            ("I have a book",         "Tengo un libro",           ["quiero", "cuaderno", "yo", "ella"]),
            ("The teacher is here",   "El profesor está aquí",    ["estudiante", "allí", "el", "clase"]),
            ("I do my homework",      "Hago mi tarea",            ["libro", "clase", "yo", "tengo"]),
            ("The class is fun",      "La clase es divertida",    ["aburrida", "libro", "yo", "el"]),
        ],
        "pairs": [
            ("Student",  "Estudiante"),
            ("Class",    "Clase"),
            ("Homework", "Tarea"),
            ("Desk",     "Escritorio"),
            ("Pencil",   "Lápiz"),
            ("Notebook", "Cuaderno"),
        ],
    },
    "People": {
        "vocab": [
            ("Man",    "Hombre",  ["Mujer", "Niño", "Chico"]),
            ("Woman",  "Mujer",   ["Hombre", "Niña", "Chica"]),
            ("Boy",    "Niño",    ["Niña", "Hombre", "Chico"]),
            ("Girl",   "Niña",    ["Niño", "Mujer", "Chica"]),
            ("Friend", "Amigo",   ["Enemigo", "Conocido", "Vecino"]),
            ("Person", "Persona", ["Gente", "Hombre", "Individuo"]),
        ],
        "sentences": [
            ("The man is tall",    "El hombre es alto",    ["mujer", "bajo", "yo", "ella"]),
            ("She is a woman",     "Ella es una mujer",    ["él", "niña", "el", "hombre"]),
            ("He is my friend",    "Él es mi amigo",       ["ella", "enemigo", "yo", "mujer"]),
            ("The girl is smart",  "La niña es inteligente",["tonto", "niño", "yo", "el"]),
        ],
        "pairs": [
            ("Girl",   "Niña"),
            ("Friend", "Amigo"),
            ("Person", "Persona"),
            ("Child",  "Niño"),
            ("Adult",  "Adulto"),
            ("Baby",   "Bebé"),
        ],
    },
    "Time": {
        "vocab": [
            ("Today",    "Hoy",     ["Mañana", "Ayer", "Ahora"]),
            ("Tomorrow", "Mañana",  ["Hoy", "Noche", "Tarde"]),
            ("Hour",     "Hora",    ["Minuto", "Segundo", "Día"]),
            ("Minute",   "Minuto",  ["Hora", "Segundo", "Semana"]),
            ("Week",     "Semana",  ["Mes", "Día", "Año"]),
            ("Year",     "Año",     ["Mes", "Semana", "Siglo"]),
        ],
        "sentences": [
            ("What time is it",  "Qué hora es",    ["cómo", "minuto", "yo", "dónde"]),
            ("It is late",       "Es tarde",       ["temprano", "hora", "el", "yo"]),
            ("See you tomorrow", "Hasta mañana",   ["hoy", "ayer", "luego", "yo"]),
            ("Today is Monday",  "Hoy es lunes",   ["mañana", "martes", "ayer", "yo"]),
        ],
        "pairs": [
            ("Minute", "Minuto"),
            ("Second", "Segundo"),
            ("Week",   "Semana"),
            ("Month",  "Mes"),
            ("Year",   "Año"),
            ("Day",    "Día"),
        ],
    },
}


# ---------------------------------------------------------------------------
# Guidebook content — 1 per UNIT (3 units: Basics, Phrases, Food)
# Each unit guidebook covers ALL skills in that unit with rich sections.
# ---------------------------------------------------------------------------
UNIT_GUIDEBOOKS = {
    "Basics": {
        "title": "Unit 1 — Spanish Basics",
        "summary": (
            "Welcome to Spanish! This unit covers your very first Spanish words, essential greetings, "
            "and travel vocabulary. You'll learn how nouns have gender, how verbs change for different "
            "subjects, and how to navigate real-world situations in Spanish-speaking countries."
        ),
        "sections": [
            {
                "heading": "🧠 Skill 1 — Intro: Masculine & Feminine Nouns",
                "body_text": (
                    "Every Spanish noun is either masculine (el) or feminine (la). "
                    "Most nouns ending in -o are masculine (el niño, el pan), while most ending in -a are feminine "
                    "(la manzana, la niña). However, there are exceptions — el día (the day) is masculine "
                    "despite ending in -a! Always learn the gender with each new word."
                ),
                "example_sentence": "el pan, el niño / la manzana, la niña",
                "example_translation": "the bread, the boy / the apple, the girl",
            },
            {
                "heading": "🔤 Skill 1 — Intro: Simple Present Tense",
                "body_text": (
                    "Spanish verbs change based on who's performing the action. For -er verbs like 'beber' (to drink) "
                    "and 'comer' (to eat): Yo bebo (I drink), Tú bebes (You drink), Él/Ella bebe (He/She drinks). "
                    "Spanish often DROPS the subject pronoun — context and verb endings make it clear. "
                    "'Bebo agua' alone means 'I drink water'."
                ),
                "example_sentence": "Yo bebo agua. Ella come pan.",
                "example_translation": "I drink water. She eats bread.",
            },
            {
                "heading": "📖 Skill 1 — Intro: Definite Articles el / la",
                "body_text": (
                    "Use 'el' before masculine singular nouns and 'la' before feminine singular nouns. "
                    "Plural forms are 'los' (masculine) and 'las' (feminine). Unlike English, the article "
                    "must always agree in gender and number with the noun it accompanies. "
                    "Example: el libro → los libros / la mesa → las mesas."
                ),
                "example_sentence": "el niño bebe leche / la niña come manzana",
                "example_translation": "the boy drinks milk / the girl eats apple",
            },
            {
                "heading": "☀️ Skill 2 — Greetings: Time-Based Greetings",
                "body_text": (
                    "Spanish greetings change based on the time of day. "
                    "'Buenos días' is used in the morning (until noon). "
                    "'Buenas tardes' is used in the afternoon (noon to sunset). "
                    "'Buenas noches' is used in the evening and at night. "
                    "'Hola' is casual and works at any time of day."
                ),
                "example_sentence": "Buenos días, ¿cómo estás?",
                "example_translation": "Good morning, how are you?",
            },
            {
                "heading": "🙏 Skill 2 — Greetings: Courtesy Phrases",
                "body_text": (
                    "Por favor = Please. Gracias = Thank you. De nada = You're welcome. "
                    "Lo siento = I'm sorry. Perdón / Con permiso = Excuse me. "
                    "For 'How are you?': ¿Cómo estás? (informal, for friends & peers) vs "
                    "¿Cómo está usted? (formal, for strangers or elders). "
                    "Reply: 'Muy bien, gracias' (Very well, thank you) or 'Más o menos' (So-so)."
                ),
                "example_sentence": "Estoy bien, gracias. ¿Y tú?",
                "example_translation": "I am well, thank you. And you?",
            },
            {
                "heading": "✈️ Skill 3 — Travel: Airport & Transport Vocabulary",
                "body_text": (
                    "Key airport words: aeropuerto (airport), boleto/pasaje (ticket), pasaporte (passport), "
                    "maleta (suitcase), vuelo (flight), puerta de embarque (boarding gate). "
                    "Transport: tren (train), autobús (bus), taxi (taxi), coche (car), avión (plane). "
                    "To ask where something is, use '¿Dónde está...?' (Where is...?)."
                ),
                "example_sentence": "¿Dónde está la puerta de embarque?",
                "example_translation": "Where is the boarding gate?",
            },
            {
                "heading": "🗺️ Skill 3 — Travel: Asking for Directions",
                "body_text": (
                    "Directions vocabulary: A la derecha = to the right. A la izquierda = to the left. "
                    "Todo recto / Derecho = straight ahead. Cerca = near. Lejos = far. "
                    "Aquí = here. Allí/Allá = there. Al lado de = next to. Enfrente de = opposite. "
                    "Use 'Necesito...' (I need) or 'Quiero...' (I want) to make requests."
                ),
                "example_sentence": "El hotel está a la derecha, cerca del aeropuerto.",
                "example_translation": "The hotel is to the right, near the airport.",
            },
        ],
    },
    "Phrases": {
        "title": "Unit 2 — Everyday Spanish Phrases",
        "summary": (
            "In this unit you'll tackle real-life social situations: dining at restaurants, "
            "talking about your family, and going shopping. You'll master key verbs like querer and tener, "
            "learn possessive adjectives, and understand how adjectives agree with nouns in Spanish."
        ),
        "sections": [
            {
                "heading": "🍽️ Skill 4 — Restaurant: Ordering Food & Drinks",
                "body_text": (
                    "Use 'Quisiera...' (I would like) for a polite order — preferred in restaurants. "
                    "'Quiero...' (I want) is more direct but acceptable. "
                    "'Para mí...' (For me...) is also very common. "
                    "Key vocabulary: agua (water), vino (wine), cerveza (beer), comida (food), bebida (drink), "
                    "menú (menu), la cuenta (the bill)."
                ),
                "example_sentence": "Quisiera una botella de agua, por favor.",
                "example_translation": "I would like a bottle of water, please.",
            },
            {
                "heading": "🍷 Skill 4 — Restaurant: At the Table",
                "body_text": (
                    "Table settings: mesa (table), silla (chair), tenedor (fork), cuchara (spoon), "
                    "cuchillo (knife), plato (plate), vaso (glass), servilleta (napkin). "
                    "Ask for the menu: '¿Me puede traer el menú?' "
                    "Ask for the bill: '¿Nos trae la cuenta, por favor?' "
                    "Tip: In Spain/Latin America, you must ASK for the bill — it won't come automatically!"
                ),
                "example_sentence": "¿Nos trae la cuenta, por favor?",
                "example_translation": "Can you bring us the bill, please?",
            },
            {
                "heading": "👨‍👩‍👧‍👦 Skill 5 — Family: Family Members",
                "body_text": (
                    "Immediate family: madre (mother), padre (father), hermano (brother), hermana (sister), "
                    "hijo (son), hija (daughter). Extended family: abuelo/abuela (grandpa/grandma), "
                    "tío/tía (uncle/aunt), primo/prima (cousin m/f), sobrino/sobrina (nephew/niece). "
                    "Important: 'mis padres' (my parents) uses masculine plural for mixed groups!"
                ),
                "example_sentence": "Mis padres se llaman Juan y María.",
                "example_translation": "My parents are named Juan and María.",
            },
            {
                "heading": "💛 Skill 5 — Family: Possessive Adjectives",
                "body_text": (
                    "Mi = my. Tu = your (informal). Su = his/her/your (formal). "
                    "Nuestro/Nuestra = our. Vuestro/Vuestra = your (plural, Spain). "
                    "These possessives do NOT change for gender, but add -s for plural: "
                    "mi libro → mis libros / tu hermana → tus hermanas. "
                    "Note: 'tu' (your) has no accent; 'tú' (you) has an accent."
                ),
                "example_sentence": "Mi hermano es médico y mi hermana es profesora.",
                "example_translation": "My brother is a doctor and my sister is a teacher.",
            },
            {
                "heading": "🛍️ Skill 6 — Shopping: Asking for Prices",
                "body_text": (
                    "¿Cuánto cuesta? = How much does it cost? (singular item) "
                    "¿Cuánto cuestan? = How much do they cost? (multiple items) "
                    "Es/Son + price: 'Son veinte euros' (It's twenty euros). "
                    "¿Hay descuento? = Is there a discount? "
                    "Oferta = sale. Precio = price. Rebaja = markdown/reduction."
                ),
                "example_sentence": "¿Cuánto cuesta esta camisa?",
                "example_translation": "How much does this shirt cost?",
            },
            {
                "heading": "💳 Skill 6 — Shopping: Paying & Clothes",
                "body_text": (
                    "Payment: ¿Aceptan tarjeta? (Do you accept cards?), Pago en efectivo (I pay with cash). "
                    "Clothes: camisa (shirt), pantalón (pants), zapatos (shoes), vestido (dress), "
                    "sombrero (hat), chaqueta (jacket). Sizes: talla pequeña/mediana/grande (S/M/L). "
                    "Colors agree in gender: rojo/roja, azul (same both), verde (same both)."
                ),
                "example_sentence": "¿Aceptan tarjeta de crédito?",
                "example_translation": "Do you accept credit cards?",
            },
        ],
    },
    "Food": {
        "title": "Unit 3 — School, People & Time",
        "summary": (
            "This unit takes you into the world of education, describing people, and talking about time. "
            "You'll learn the all-important SER vs ESTAR distinction, how adjectives agree with nouns, "
            "how to tell time, and essential time expressions for daily conversation."
        ),
        "sections": [
            {
                "heading": "📚 Skill 7 — School: Classroom Objects & People",
                "body_text": (
                    "Classroom objects: libro (book), cuaderno (notebook), lápiz (pencil), bolígrafo (pen), "
                    "escritorio (desk), pizarrón (blackboard), mochila (backpack). "
                    "People: profesor/profesora (teacher m/f), estudiante (student — same for both genders!), "
                    "director/directora (principal), compañero/compañera (classmate). "
                    "Subjects: matemáticas, historia, ciencias, inglés, arte, música."
                ),
                "example_sentence": "Necesito mi cuaderno y mi bolígrafo para la clase.",
                "example_translation": "I need my notebook and my pen for class.",
            },
            {
                "heading": "❤️ Skill 7 — School: Expressing Likes with Gustar",
                "body_text": (
                    "'Me gusta' literally means 'it pleases me' — use it to say you LIKE something. "
                    "Me gusta = I like (singular). Me gustan = I like (plural). "
                    "'No me gusta' = I don't like. "
                    "Other forms: Te gusta (you like), Le gusta (he/she likes), Nos gusta (we like). "
                    "This verb works BACKWARDS from English — the thing liked is the subject!"
                ),
                "example_sentence": "Me gustan las matemáticas pero no me gusta la historia.",
                "example_translation": "I like math but I don't like history.",
            },
            {
                "heading": "👥 Skill 8 — People: Adjective Agreement",
                "body_text": (
                    "In Spanish, adjectives MUST agree in gender AND number with the noun they describe. "
                    "Alto (tall): el hombre alto / la mujer alta / los hombres altos / las mujeres altas. "
                    "Adjectives ending in -e or consonants often DON'T change for gender: "
                    "el estudiante inteligente / la estudiante inteligente. "
                    "Adjectives usually come AFTER the noun in Spanish."
                ),
                "example_sentence": "El niño inteligente y la niña simpática son amigos.",
                "example_translation": "The smart boy and the nice girl are friends.",
            },
            {
                "heading": "⚖️ Skill 8 — People: SER vs. ESTAR (Both Mean 'To Be'!)",
                "body_text": (
                    "SER is for PERMANENT characteristics: origin, profession, identity, inherent traits. "
                    "Ella es alta. (She IS tall.) / Soy médico. (I AM a doctor.) "
                    "ESTAR is for TEMPORARY states, locations, and conditions. "
                    "Él está cansado. (He IS tired — right now.) / Estoy en casa. (I AM at home.) "
                    "Memory trick: SER = what something IS, ESTAR = how something feels/where it is."
                ),
                "example_sentence": "Mi amigo es alto pero hoy está cansado.",
                "example_translation": "My friend is tall but today he is tired.",
            },
            {
                "heading": "🕐 Skill 9 — Time: Telling the Time",
                "body_text": (
                    "¿Qué hora es? = What time is it? "
                    "Es la una = It's 1 o'clock (use 'es' ONLY for 1 o'clock). "
                    "Son las dos/tres... = It's 2/3... o'clock (use 'son' for all other hours). "
                    "y cuarto = quarter past. y media = half past. menos cuarto = quarter to. "
                    "de la mañana = AM. de la tarde = PM (noon–dusk). de la noche = PM (evening)."
                ),
                "example_sentence": "Son las tres y media de la tarde.",
                "example_translation": "It is three-thirty in the afternoon.",
            },
            {
                "heading": "📅 Skill 9 — Time: Days, Months & Time Expressions",
                "body_text": (
                    "Days (lowercase in Spanish): lunes, martes, miércoles, jueves, viernes, sábado, domingo. "
                    "Months (also lowercase): enero, febrero, marzo, abril, mayo, junio, julio, agosto, "
                    "septiembre, octubre, noviembre, diciembre. "
                    "Useful expressions: Hoy (today), Mañana (tomorrow/morning), Ayer (yesterday), "
                    "Ahora (now), Después (later), Antes (before). "
                    "Note: 'Mañana' means BOTH 'tomorrow' AND 'morning' — context tells you which!"
                ),
                "example_sentence": "El lunes tengo clase de español por la mañana.",
                "example_translation": "On Monday I have Spanish class in the morning.",
            },
        ],
    },
}

# Keep old per-skill GUIDEBOOKS for backward compatibility
GUIDEBOOKS = {
    "Intro": {
        "title": "Spanish Basics — Your First Words",
        "summary": (
            "In this skill you will learn your very first Spanish nouns and simple present-tense "
            "sentences. Spanish nouns always carry a gender (masculine or feminine) which affects "
            "the article used with them."
        ),
        "sections": [
            {
                "heading": "Masculine & Feminine Nouns",
                "body_text": (
                    "Every Spanish noun is either masculine (el) or feminine (la). "
                    "Most nouns ending in -o are masculine; most ending in -a are feminine. "
                    "You need to learn the gender of each word — there are exceptions!"
                ),
                "example_sentence": "el pan, el niño / la manzana, la niña",
                "example_translation": "the bread, the boy / the apple, the girl",
            },
            {
                "heading": "Simple Present Tense (yo / él / ella)",
                "body_text": (
                    "The verb beber (to drink) and comer (to eat) follow regular -er conjugation. "
                    "Yo bebo = I drink. Él bebe = He drinks. Ella come = She eats. "
                    "Notice that Spanish drops the subject pronoun often — context makes it clear."
                ),
                "example_sentence": "Yo bebo agua. Ella come pan.",
                "example_translation": "I drink water. She eats bread.",
            },
            {
                "heading": "Definite Articles: el / la",
                "body_text": (
                    "Use 'el' before masculine nouns and 'la' before feminine nouns. "
                    "Unlike English, the article must always agree with the gender of the noun."
                ),
                "example_sentence": "el niño bebe leche / la niña come manzana",
                "example_translation": "the boy drinks milk / the girl eats apple",
            },
        ],
    },
    "Greetings": {
        "title": "Greetings & Polite Expressions",
        "summary": (
            "Learn how to say hello, goodbye, and common courtesy phrases in Spanish. "
            "Spanish greetings change based on time of day and the level of formality."
        ),
        "sections": [
            {
                "heading": "Greetings by Time of Day",
                "body_text": (
                    "Use 'Buenos días' in the morning, 'Buenas tardes' in the afternoon, "
                    "and 'Buenas noches' in the evening/night. 'Hola' is casual and works any time. "
                    "When meeting someone formally, prefer the time-based greetings."
                ),
                "example_sentence": "Buenos días, ¿cómo estás?",
                "example_translation": "Good morning, how are you?",
            },
            {
                "heading": "Asking How Someone Is",
                "body_text": (
                    "¿Cómo estás? (tú — informal) vs ¿Cómo está usted? (formal). "
                    "Common replies: 'Muy bien, gracias' (Very well, thank you), "
                    "'Más o menos' (So-so), 'Mal' (Bad)."
                ),
                "example_sentence": "Estoy bien, gracias. ¿Y tú?",
                "example_translation": "I am well, thank you. And you?",
            },
            {
                "heading": "Courtesy Phrases",
                "body_text": (
                    "Por favor = Please. Gracias = Thank you. De nada = You're welcome. "
                    "Lo siento = I'm sorry. Perdón = Excuse me. "
                    "These are essential in every Spanish conversation."
                ),
                "example_sentence": "Gracias por tu ayuda. De nada.",
                "example_translation": "Thank you for your help. You're welcome.",
            },
            {
                "heading": "Saying Goodbye",
                "body_text": (
                    "Adiós is the standard goodbye. 'Hasta luego' means 'See you later'. "
                    "'Hasta mañana' means 'See you tomorrow'. "
                    "'Hasta pronto' means 'See you soon'."
                ),
                "example_sentence": "Hasta luego, que tengas un buen día.",
                "example_translation": "See you later, have a good day.",
            },
        ],
    },
    "Travel": {
        "title": "Travel Spanish — Getting Around",
        "summary": (
            "Essential vocabulary and phrases for navigating airports, hotels, and transport "
            "in Spanish-speaking countries."
        ),
        "sections": [
            {
                "heading": "At the Airport",
                "body_text": (
                    "Key words: aeropuerto (airport), boleto/pasaje (ticket), pasaporte (passport), "
                    "maleta (suitcase), vuelo (flight). "
                    "Use '¿Dónde está...?' to ask where something is."
                ),
                "example_sentence": "¿Dónde está la puerta de embarque?",
                "example_translation": "Where is the boarding gate?",
            },
            {
                "heading": "Asking for Directions",
                "body_text": (
                    "¿Dónde está...? = Where is...? "
                    "A la derecha = to the right. A la izquierda = to the left. "
                    "Recto/Derecho = straight ahead. Cerca = near. Lejos = far."
                ),
                "example_sentence": "El hotel está a la derecha, cerca del aeropuerto.",
                "example_translation": "The hotel is to the right, near the airport.",
            },
            {
                "heading": "Transport Vocabulary",
                "body_text": (
                    "Tren = train. Autobús = bus. Taxi = taxi. Coche = car. Avión = plane. "
                    "To say 'I need', use 'Necesito'. To say 'I want', use 'Quiero'. "
                    "Both are followed by a noun or infinitive verb."
                ),
                "example_sentence": "Necesito un taxi al aeropuerto, por favor.",
                "example_translation": "I need a taxi to the airport, please.",
            },
        ],
    },
    "Restaurant": {
        "title": "Eating Out — Restaurant Spanish",
        "summary": (
            "Order food and drinks, ask for the bill, and be polite at a Spanish-speaking "
            "restaurant with this essential vocabulary."
        ),
        "sections": [
            {
                "heading": "Ordering Food & Drinks",
                "body_text": (
                    "Use 'Quisiera...' (I would like) for a polite order, or 'Quiero...' (I want) "
                    "for a direct order. 'Para mí...' (For me...) is also common. "
                    "Key vocab: agua (water), vino (wine), comida (food), bebida (drink)."
                ),
                "example_sentence": "Quisiera una botella de agua, por favor.",
                "example_translation": "I would like a bottle of water, please.",
            },
            {
                "heading": "Asking for the Menu & Bill",
                "body_text": (
                    "El menú = the menu. La cuenta = the bill/check. "
                    "Say '¿Me puede traer el menú?' (Can you bring me the menu?) "
                    "or '¿La cuenta, por favor?' when you are ready to pay."
                ),
                "example_sentence": "¿Nos trae la cuenta, por favor?",
                "example_translation": "Can you bring us the bill, please?",
            },
            {
                "heading": "Table Settings & Utensils",
                "body_text": (
                    "Mesa = table. Silla = chair. Tenedor = fork. Cuchara = spoon. "
                    "Cuchillo = knife. Plato = plate. Vaso = glass. Servilleta = napkin."
                ),
                "example_sentence": "¿Me puede traer un tenedor limpio, por favor?",
                "example_translation": "Can you bring me a clean fork, please?",
            },
        ],
    },
    "Family": {
        "title": "Family Members in Spanish",
        "summary": (
            "Learn how to talk about your family in Spanish, including immediate and extended "
            "family members, and how to express possession."
        ),
        "sections": [
            {
                "heading": "Immediate Family",
                "body_text": (
                    "Madre = mother. Padre = father. Hermano = brother. Hermana = sister. "
                    "Hijo = son. Hija = daughter. "
                    "In Spanish, a mixed-gender group uses the masculine plural: "
                    "'mis padres' can mean 'my parents' (father + mother)."
                ),
                "example_sentence": "Mis padres se llaman Juan y María.",
                "example_translation": "My parents are named Juan and María.",
            },
            {
                "heading": "Extended Family",
                "body_text": (
                    "Abuelo/Abuela = grandfather/grandmother. Tío/Tía = uncle/aunt. "
                    "Primo/Prima = cousin (male/female). Sobrino/Sobrina = nephew/niece."
                ),
                "example_sentence": "Mi abuela hace la mejor comida del mundo.",
                "example_translation": "My grandmother makes the best food in the world.",
            },
            {
                "heading": "Expressing Possession: Mi / Tu / Su",
                "body_text": (
                    "Mi = my. Tu = your (informal). Su = his/her/your (formal). "
                    "These possessive adjectives do NOT change for gender — but do add -s for plural: "
                    "mis hermanos, tus padres, sus hijos."
                ),
                "example_sentence": "Mi hermano es médico y mi hermana es profesora.",
                "example_translation": "My brother is a doctor and my sister is a teacher.",
            },
        ],
    },
    "Shopping": {
        "title": "Shopping in Spanish",
        "summary": (
            "Navigate markets, stores, and boutiques in Spanish — ask for prices, "
            "sizes, and complete purchases confidently."
        ),
        "sections": [
            {
                "heading": "Asking for Prices",
                "body_text": (
                    "¿Cuánto cuesta? = How much does it cost? (singular) "
                    "¿Cuánto cuestan? = How much do they cost? (plural) "
                    "Es/Son + price. For example: 'Son veinte euros' = It's twenty euros."
                ),
                "example_sentence": "¿Cuánto cuesta esta camisa?",
                "example_translation": "How much does this shirt cost?",
            },
            {
                "heading": "Clothes Vocabulary",
                "body_text": (
                    "Camisa = shirt. Pantalón = pants/trousers. Zapatos = shoes. "
                    "Vestido = dress. Sombrero = hat. Chaqueta = jacket. Talla = size. "
                    "Colors agree in gender: rojo/roja (red), azul (blue, same for both genders)."
                ),
                "example_sentence": "Busco una chaqueta azul en talla mediana.",
                "example_translation": "I'm looking for a blue jacket in medium size.",
            },
            {
                "heading": "Paying & Discounts",
                "body_text": (
                    "¿Aceptan tarjeta? = Do you accept cards? "
                    "Pago en efectivo = I pay with cash. "
                    "¿Hay descuento? = Is there a discount? "
                    "Oferta = sale/offer. Precio = price. Cambio = change (money back)."
                ),
                "example_sentence": "¿Aceptan tarjeta de crédito?",
                "example_translation": "Do you accept credit cards?",
            },
        ],
    },
    "School": {
        "title": "School & Education in Spanish",
        "summary": (
            "Talk about school life, classroom objects, subjects, and academic activities "
            "in Spanish."
        ),
        "sections": [
            {
                "heading": "Classroom Objects",
                "body_text": (
                    "Libro = book. Cuaderno = notebook. Lápiz = pencil. Bolígrafo = pen. "
                    "Escritorio = desk. Pizarrón/Pizarra = blackboard/whiteboard. Mochila = backpack."
                ),
                "example_sentence": "Necesito mi cuaderno y mi bolígrafo para la clase.",
                "example_translation": "I need my notebook and my pen for class.",
            },
            {
                "heading": "People in School",
                "body_text": (
                    "Profesor/Profesora = male/female teacher. Estudiante = student (same for both). "
                    "Director/Directora = principal. Compañero/Compañera = classmate."
                ),
                "example_sentence": "La profesora explica la lección muy bien.",
                "example_translation": "The teacher explains the lesson very well.",
            },
            {
                "heading": "Talking About Subjects",
                "body_text": (
                    "Matemáticas = math. Historia = history. Ciencias = science. "
                    "Inglés = English. Español = Spanish. Arte = art. Música = music. "
                    "To say you like a subject: 'Me gusta(n)...' = I like..."
                ),
                "example_sentence": "Me gustan las matemáticas pero no me gusta la historia.",
                "example_translation": "I like math but I don't like history.",
            },
        ],
    },
    "People": {
        "title": "Describing People in Spanish",
        "summary": (
            "Learn vocabulary for people, their appearances, and personality traits — "
            "plus how adjective agreement works in Spanish."
        ),
        "sections": [
            {
                "heading": "Basic People Vocabulary",
                "body_text": (
                    "Hombre = man. Mujer = woman. Niño = boy/child. Niña = girl. "
                    "Amigo/Amiga = friend (male/female). Persona = person. "
                    "Gente = people (singular noun in Spanish — 'la gente es' not 'son')."
                ),
                "example_sentence": "La gente en este parque es muy amigable.",
                "example_translation": "The people in this park are very friendly.",
            },
            {
                "heading": "Adjective Agreement",
                "body_text": (
                    "In Spanish, adjectives must agree in gender AND number with the noun. "
                    "Alto (tall) → el hombre alto / la mujer alta / los hombres altos / las mujeres altas. "
                    "Adjectives usually come AFTER the noun in Spanish."
                ),
                "example_sentence": "El niño inteligente y la niña simpática son amigos.",
                "example_translation": "The smart boy and the nice girl are friends.",
            },
            {
                "heading": "Ser vs. Estar for Descriptions",
                "body_text": (
                    "Use SER for permanent/inherent traits: 'Ella es alta' (She is tall). "
                    "Use ESTAR for temporary states: 'Él está cansado' (He is tired). "
                    "Both translate as 'to be' in English, but they are NOT interchangeable."
                ),
                "example_sentence": "Mi amigo es alto pero hoy está cansado.",
                "example_translation": "My friend is tall but today he is tired.",
            },
        ],
    },
    "Time": {
        "title": "Telling Time & Talking About Time in Spanish",
        "summary": (
            "Learn how to tell time, talk about days, weeks, and months, and use "
            "time expressions naturally in Spanish conversation."
        ),
        "sections": [
            {
                "heading": "Telling the Time",
                "body_text": (
                    "¿Qué hora es? = What time is it? "
                    "Es la una = It's one o'clock. Son las dos = It's two o'clock. "
                    "Use 'es' for 1 o'clock and 'son' for all other hours. "
                    "Add 'y media' (half past) or 'y cuarto' (quarter past)."
                ),
                "example_sentence": "Son las tres y media de la tarde.",
                "example_translation": "It is three-thirty in the afternoon.",
            },
            {
                "heading": "Days of the Week",
                "body_text": (
                    "Lunes, Martes, Miércoles, Jueves, Viernes, Sábado, Domingo. "
                    "Days of the week are lowercase in Spanish. Use 'el lunes' (on Monday) "
                    "or 'los lunes' (on Mondays / every Monday)."
                ),
                "example_sentence": "El lunes tengo clase de español.",
                "example_translation": "On Monday I have Spanish class.",
            },
            {
                "heading": "Time Adverbs & Expressions",
                "body_text": (
                    "Hoy = today. Mañana = tomorrow / morning. Ayer = yesterday. "
                    "Ahora = now. Después = later/after. Antes = before. "
                    "Note: 'Mañana' means BOTH 'tomorrow' and 'morning' — context clarifies which."
                ),
                "example_sentence": "Ayer fui al mercado; hoy estoy en casa.",
                "example_translation": "Yesterday I went to the market; today I'm at home.",
            },
            {
                "heading": "Months & Seasons",
                "body_text": (
                    "Months are lowercase in Spanish: enero, febrero, marzo, abril, mayo, junio, "
                    "julio, agosto, septiembre, octubre, noviembre, diciembre. "
                    "Seasons: primavera (spring), verano (summer), otoño (autumn), invierno (winter)."
                ),
                "example_sentence": "Mi cumpleaños es en julio, en verano.",
                "example_translation": "My birthday is in July, in summer.",
            },
        ],
    },
}


def add_exercises_for_lesson(db, lesson, skill_title, lesson_index):
    """
    Generate 10 exercises for a lesson:
    order 1,2  → multiple_choice   (different vocab items)
    order 3,4  → translate         (word bank — different sentences)
    order 5,6  → fill_blank        (different sentences)
    order 7,8  → type_answer       (different vocab items)
    order 9,10 → match_pairs       (different pair subsets)
    """
    c = CONTENT.get(skill_title, CONTENT["Intro"])
    vocab = c["vocab"]
    sentences = c["sentences"]
    pairs = c["pairs"]
    n_vocab = len(vocab)
    n_sent = len(sentences)
    n_pairs = len(pairs)

    # Rotate indices so lesson 0 and lesson 1 of the same skill pick different items
    base = lesson_index  # 0 for first lesson, 1 for second lesson

    # ---- 1. Multiple Choice A ----
    vi = base % n_vocab
    v = vocab[vi]
    e = Exercise(lesson_id=lesson.id, type=ExerciseType.multiple_choice,
                 prompt=f"What is the Spanish word for '{v[0]}'?", order_index=1)
    db.add(e); db.flush()
    db.add(ExerciseOption(exercise_id=e.id, content=v[1], is_correct=True, order_index=1))
    db.add(ExerciseOption(exercise_id=e.id, content=v[2][0], is_correct=False, order_index=2))
    db.add(ExerciseOption(exercise_id=e.id, content=v[2][1], is_correct=False, order_index=3))
    db.add(ExerciseOption(exercise_id=e.id, content=v[2][2], is_correct=False, order_index=4))

    # ---- 2. Multiple Choice B ----
    vi2 = (base + 2) % n_vocab
    v2 = vocab[vi2]
    e = Exercise(lesson_id=lesson.id, type=ExerciseType.multiple_choice,
                 prompt=f"Select the correct translation for '{v2[0]}'", order_index=2)
    db.add(e); db.flush()
    db.add(ExerciseOption(exercise_id=e.id, content=v2[1], is_correct=True, order_index=1))
    db.add(ExerciseOption(exercise_id=e.id, content=v2[2][0], is_correct=False, order_index=2))
    db.add(ExerciseOption(exercise_id=e.id, content=v2[2][1], is_correct=False, order_index=3))
    db.add(ExerciseOption(exercise_id=e.id, content=v2[2][2], is_correct=False, order_index=4))

    # ---- 3. Translate (Word Bank) A ----
    si = base % n_sent
    s = sentences[si]
    e = Exercise(lesson_id=lesson.id, type=ExerciseType.translate,
                 prompt=f"Translate: \"{s[0]}\"", order_index=3)
    db.add(e); db.flush()
    words = s[1].split()
    for i, w in enumerate(words):
        db.add(ExerciseOption(exercise_id=e.id, content=w, is_correct=True, order_index=i + 1))
    for i, d in enumerate(s[2]):
        db.add(ExerciseOption(exercise_id=e.id, content=d, is_correct=False, order_index=len(words) + i + 1))

    # ---- 4. Translate (Word Bank) B ----
    si2 = (base + 2) % n_sent
    s2 = sentences[si2]
    e = Exercise(lesson_id=lesson.id, type=ExerciseType.translate,
                 prompt=f"Translate: \"{s2[0]}\"", order_index=4)
    db.add(e); db.flush()
    words2 = s2[1].split()
    for i, w in enumerate(words2):
        db.add(ExerciseOption(exercise_id=e.id, content=w, is_correct=True, order_index=i + 1))
    for i, d in enumerate(s2[2]):
        db.add(ExerciseOption(exercise_id=e.id, content=d, is_correct=False, order_index=len(words2) + i + 1))

    # ---- 5. Fill Blank A ----
    fb_words = sentences[si][1].split()
    fb_target = fb_words[-1]
    fb_prompt = " ".join(fb_words[:-1]) + " ___"
    e = Exercise(lesson_id=lesson.id, type=ExerciseType.fill_blank,
                 prompt=fb_prompt, order_index=5)
    db.add(e); db.flush()
    db.add(ExerciseOption(exercise_id=e.id, content=fb_target, is_correct=True))

    # ---- 6. Fill Blank B ----
    fb2_words = sentences[si2][1].split()
    # blank out the second-to-last word for variety vs exercise 5
    blank_idx = max(0, len(fb2_words) - 2)
    fb2_target = fb2_words[blank_idx]
    fb2_parts = fb2_words[:blank_idx] + ["___"] + fb2_words[blank_idx + 1:]
    fb2_prompt = " ".join(fb2_parts)
    e = Exercise(lesson_id=lesson.id, type=ExerciseType.fill_blank,
                 prompt=fb2_prompt, order_index=6)
    db.add(e); db.flush()
    db.add(ExerciseOption(exercise_id=e.id, content=fb2_target, is_correct=True))

    # ---- 7. Type Answer A ----
    ta_vi = (base + 1) % n_vocab
    ta_v = vocab[ta_vi]
    e = Exercise(lesson_id=lesson.id, type=ExerciseType.type_answer,
                 prompt=f"Type the Spanish word for '{ta_v[0]}'", order_index=7)
    db.add(e); db.flush()
    db.add(ExerciseOption(exercise_id=e.id, content=ta_v[1].lower(), is_correct=True))

    # ---- 8. Type Answer B ----
    ta_vi2 = (base + 3) % n_vocab
    ta_v2 = vocab[ta_vi2]
    e = Exercise(lesson_id=lesson.id, type=ExerciseType.type_answer,
                 prompt=f"Write the Spanish translation of '{ta_v2[0]}'", order_index=8)
    db.add(e); db.flush()
    db.add(ExerciseOption(exercise_id=e.id, content=ta_v2[1].lower(), is_correct=True))

    # ---- 9. Match Pairs A (first 3 pairs) ----
    pair_offset_a = (base * 2) % n_pairs
    pairs_a = [pairs[(pair_offset_a + i) % n_pairs] for i in range(3)]
    e = Exercise(lesson_id=lesson.id, type=ExerciseType.match_pairs,
                 prompt=f"Match the {skill_title} words to their translations", order_index=9)
    db.add(e); db.flush()
    for p in pairs_a:
        pk = p[0].lower().replace(" ", "_")
        db.add(ExerciseOption(exercise_id=e.id, content=p[0], is_correct=True, pair_key=pk))
        db.add(ExerciseOption(exercise_id=e.id, content=p[1], is_correct=True, pair_key=pk))

    # ---- 10. Match Pairs B (next 3 pairs) ----
    pair_offset_b = (pair_offset_a + 3) % n_pairs
    pairs_b = [pairs[(pair_offset_b + i) % n_pairs] for i in range(3)]
    e = Exercise(lesson_id=lesson.id, type=ExerciseType.match_pairs,
                 prompt=f"Match these {skill_title} expressions", order_index=10)
    db.add(e); db.flush()
    for p in pairs_b:
        pk = p[0].lower().replace(" ", "_")
        db.add(ExerciseOption(exercise_id=e.id, content=p[0], is_correct=True, pair_key=pk))
        db.add(ExerciseOption(exercise_id=e.id, content=p[1], is_correct=True, pair_key=pk))

    db.commit()


def seed_guidebook(db, unit, gb_data):
    """Seed a guidebook for a unit (1 guidebook per unit)."""
    gb = Guidebook(
        unit_id=unit.id,
        title=gb_data["title"],
        summary=gb_data["summary"],
    )
    db.add(gb)
    db.flush()
    for idx, sec in enumerate(gb_data["sections"], start=1):
        db.add(GuidebookSection(
            guidebook_id=gb.id,
            order_index=idx,
            heading=sec["heading"],
            body_text=sec["body_text"],
            example_sentence=sec.get("example_sentence"),
            example_translation=sec.get("example_translation"),
        ))
    db.commit()


def seed():
    db = SessionLocal()

    if db.query(User).count() > 0:
        db.close()
        return

    from app.core.security import get_password_hash
    default_password_hash = get_password_hash("password123")

    # Achievements
    achievements = [
        Achievement(title="First Steps", description="Complete 1 lesson", icon="🔥",
                    criteria_type=CriteriaType.lessons_completed, criteria_value=1),
        Achievement(title="Scholar", description="Earn 100 XP", icon="🧠",
                    criteria_type=CriteriaType.xp_total, criteria_value=100),
        Achievement(title="Champion", description="Earn 500 XP", icon="🏆",
                    criteria_type=CriteriaType.xp_total, criteria_value=500),
        Achievement(title="Weekend Warrior", description="Reach a 3 day streak", icon="⚔️",
                    criteria_type=CriteriaType.streak, criteria_value=3),
        Achievement(title="Unstoppable", description="Reach a 7 day streak", icon="🚀",
                    criteria_type=CriteriaType.streak, criteria_value=7),
    ]
    db.add_all(achievements)
    db.commit()

    # Users
    primary_user = User(
        id=1, username="learner_one", email="learner@test.com",
        password_hash=default_password_hash, display_name="Learner One",
        hearts_current=5, hearts_max=5, xp_total=450, gems=120,
        streak_current=4, streak_longest=4, last_active_date=datetime.utcnow()
    )
    mock_users = [
        User(id=2, username="duo_fan", email="duofan@test.com", password_hash=default_password_hash,
             display_name="Duo Fan", xp_total=1250, streak_current=15, gems=300),
        User(id=3, username="polyglot", email="poly@test.com", password_hash=default_password_hash,
             display_name="Polyglot", xp_total=3400, streak_current=42, gems=1000),
        User(id=4, username="newbie", email="newb@test.com", password_hash=default_password_hash,
             display_name="Newbie", xp_total=50, streak_current=1, gems=0),
        User(id=5, username="streak_master", email="streak@test.com", password_hash=default_password_hash,
             display_name="Streak Master", xp_total=890, streak_current=100, gems=450),
        User(id=6, username="casual_learner", email="casual@test.com", password_hash=default_password_hash,
             display_name="Casual", xp_total=230, streak_current=0, gems=50),
        User(id=7, username="language_lover", email="lover@test.com", password_hash=default_password_hash,
             display_name="Language Lover", xp_total=1780, streak_current=21, gems=600),
        User(id=8, username="fast_learner", email="fast@test.com", password_hash=default_password_hash,
             display_name="Fast Learner", xp_total=640, streak_current=5, gems=100),
    ]
    db.add_all([primary_user] + mock_users)
    db.commit()

    db.add(Settings(user_id=1, sound_enabled=True, dark_mode=False, daily_goal_xp=50,
                    notifications_enabled=True))
    db.add(Streak(user_id=1, current_streak=4, longest_streak=4,
                  last_activity_date=datetime.utcnow(), freeze_used=False))
    db.commit()

    # Quests
    quests = [
        Quest(title="Earn 50 XP", description="Earn 50 XP today", type=QuestType.earn_xp,
              target_value=50, xp_reward=10, gem_reward=5, icon="⚡"),
        Quest(title="Complete 3 Lessons", description="Complete 3 lessons today",
              type=QuestType.complete_lessons, target_value=3, xp_reward=15, gem_reward=10, icon="📚"),
        Quest(title="Perfect Lesson", description="Get 100% accuracy in a lesson",
              type=QuestType.perfect_lesson, target_value=1, xp_reward=20, gem_reward=15, icon="🎯"),
        Quest(title="Practice", description="Complete 1 practice lesson",
              type=QuestType.practice_lesson, target_value=1, xp_reward=10, gem_reward=5, icon="🏋️"),
    ]
    db.add_all(quests)
    db.commit()

    from app.services.quest_service import assign_daily_quests
    assign_daily_quests(db, 1)

    # Shop Items
    shop_items = [
        ShopItem(name="Refill Hearts", description="Get full hearts to keep learning",
                 type=ShopItemType.refill_hearts, cost_gems=350, icon="❤️"),
        ShopItem(name="Streak Freeze", description="Protect your streak if you miss a day",
                 type=ShopItemType.streak_freeze, cost_gems=200, icon="❄️"),
        ShopItem(name="Double XP", description="Double your XP for 15 minutes",
                 type=ShopItemType.double_xp, cost_gems=100, icon="⚡"),
    ]
    db.add_all(shop_items)
    db.commit()

    # Course structure
    spanish = Language(name="Spanish", code="es", flag_icon="🇪🇸")
    db.add(spanish)
    db.commit()

    units = [
        Unit(language_id=spanish.id, title="Basics",  order_index=1, color_theme="#58CC02"),
        Unit(language_id=spanish.id, title="Phrases", order_index=2, color_theme="#CE82FF"),
        Unit(language_id=spanish.id, title="Food",    order_index=3, color_theme="#FFC800"),
    ]
    db.add_all(units)
    db.commit()

    s1 = Skill(unit_id=units[0].id, title="Intro",      icon="star",          order_index=1, required_skill_id=None)
    db.add(s1); db.commit()
    s2 = Skill(unit_id=units[0].id, title="Greetings",  icon="hand",          order_index=2, required_skill_id=s1.id)
    s3 = Skill(unit_id=units[0].id, title="Travel",     icon="plane",         order_index=3, required_skill_id=s2.id)
    db.add_all([s2, s3]); db.commit()

    s4 = Skill(unit_id=units[1].id, title="Restaurant", icon="coffee",        order_index=1, required_skill_id=s3.id)
    s5 = Skill(unit_id=units[1].id, title="Family",     icon="users",         order_index=2, required_skill_id=s4.id)
    s6 = Skill(unit_id=units[1].id, title="Shopping",   icon="shopping-bag",  order_index=3, required_skill_id=s5.id)
    db.add_all([s4, s5, s6]); db.commit()

    s7 = Skill(unit_id=units[2].id, title="School",     icon="book",          order_index=1, required_skill_id=s6.id)
    s8 = Skill(unit_id=units[2].id, title="People",     icon="user",          order_index=2, required_skill_id=s7.id)
    s9 = Skill(unit_id=units[2].id, title="Time",       icon="clock",         order_index=3, required_skill_id=s8.id)
    db.add_all([s7, s8, s9]); db.commit()

    skills = [s1, s2, s3, s4, s5, s6, s7, s8, s9]

    # Lessons + Exercises — 10 exercises per lesson
    for skill in skills:
        num_lessons = 2 if skill.order_index == 1 else 1
        for l_idx in range(num_lessons):
            lesson = Lesson(skill_id=skill.id, order_index=l_idx + 1, xp_reward=20, difficulty=1)
            db.add(lesson)
            db.commit()
            add_exercises_for_lesson(db, lesson, skill.title, l_idx)

    # Guidebooks — 1 per unit (unit-level, covering all skills in the unit)
    for unit in units:
        gb_data = UNIT_GUIDEBOOKS.get(unit.title)
        if gb_data:
            seed_guidebook(db, unit, gb_data)

    # Progress for user 1
    p1 = UserSkillProgress(user_id=1, skill_id=s1.id, crown_level=1, progress_percent=100,
                            status=SkillStatus.completed, last_practiced_at=datetime.utcnow())
    p2 = UserSkillProgress(user_id=1, skill_id=s2.id, crown_level=1, progress_percent=100,
                            status=SkillStatus.completed, last_practiced_at=datetime.utcnow())
    p3 = UserSkillProgress(user_id=1, skill_id=s3.id, crown_level=0, progress_percent=0,
                            status=SkillStatus.available)
    db.add_all([p1, p2, p3])
    db.commit()

    db.add(XPHistory(user_id=1, amount=450, source=XPSource.lesson_complete,
                     created_at=datetime.utcnow()))

    db.add_all([
        UserAchievement(user_id=1, achievement_id=1,
                        unlocked_at=datetime.utcnow() - timedelta(days=2)),
        UserAchievement(user_id=1, achievement_id=2,
                        unlocked_at=datetime.utcnow() - timedelta(days=1)),
    ])
    db.commit()
    num_lessons_total = sum(2 if skill.order_index == 1 else 1 for skill in skills)
    db.close()
    print("Database seeded successfully.")
    print(f"  Skills: {len(skills)}")
    print(f"  Lessons: {num_lessons_total}")
    print(f"  Exercises: {num_lessons_total * 10} (10 per lesson)")
    print(f"  Guidebooks: {len(UNIT_GUIDEBOOKS)} (one per unit, covering all skills)")


if __name__ == "__main__":
    seed()
