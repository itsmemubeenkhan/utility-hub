'use client';
/* Password Generator: crypto.getRandomValues passwords plus passphrase mode.
   Differentiator: privacy-first (nothing leaves the browser), passphrase mode,
   and a live entropy-based strength meter. */
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';

const WORDS_EN_SRC = `
able about above actor after again agent agree ahead alarm album alert alien align
alive allow alone along aloud alpha amber among angel angle angry animal ankle answer
apple apply arena argue army around arrow aside ask asleep atlas atom audio audit
autumn awake aware away baby bacon badge baker ball band bank bar basic basil basin
basket bat bath beach bean beard beast beauty become before begin behind being bell
belt bench berry best better beyond bicycle big bike bill bird birth black blade blame
blank blast blend bless blind blink block blood bloom blue board boast boat body bold
bolt bone bonus book boost booth border born boss bottle bounce bound box boy brain
brand brave bread break brick bridge brief bright bring broad broke brook brown brush
build bulb bunch bundle burger burst bus busy buyer cabin cable cake calm camel camp
canal candy canyon cape car card care carry cart case cash cast cat catch cause chain
chair chalk champ change charge chase cheap check cheer cheese chest chicken chief
child chill chip choir choose chunk church cider city civil claim class clean clear
clerk clever cliff climb clock close cloth cloud coach coast cocoa code coffee coin
cold color comet comic coral couch count court cover crack craft crash crazy cream
creek crime crisp cross crowd crown cruel crush crust crystal curve cycle daily dairy
dance dark dash data dawn deal dear death debate debit decade decay decide deep deer
delay deliver delta demand deny depth diary dinner direct dirty ditch dive dizzy
doctor dodge doll donor door doubt dough dozen draft drain drama dream dress drink
drive drone drop drum dry duck dummy during dust duty eager eagle early earn earth
easy echo edge eight elbow elder elect empty enemy energy engage engine enjoy enter
entry equal equip error essay even event every exact exist extra fabric face fact
factor faint fairy faith false fame family fancy farm fashion fast fatal fault favor
fear feast fence fever fiber field fifth fifty fight final first fish five flame flash
fleet flesh flight fling float flock flood floor flour flow flower fluid flush flute
focus fog fold follow food fool foot force forest forget fork form forty forum found
frame fresh friend fringe front frost fruit fuel fully funny giant give glass globe
glory glove glow glue goal goat gold golden goose grade grain grand grant grape grass
grave great green greet grid grief grill grin grind grove guard guess guest guide guild
habit half hall hand happy harbor hard harsh haste hatch heart heat heavy hedge hello
helmet help hero hidden high hike hill hint hippo hobby hold hole home honey honor
horse hotel house hover human humid humor hurry husky ice icing ideal image inbox
index inner input issue ivory jacket jaguar jazz jelly jewel join joint joke joker
judge juice jumbo jump jungle junior jury keen keep kettle kid kind king kiss kitchen
kitten knife knock known label labor ladder lady lake lamb lamp land large laser last
laugh launch layer lead leaf learn least leave legal lemon level light like limit linen
liver local lock lodge logic lonely look loom loop loose loud lounge love lovely lower
loyal lucky lunch lunar lyric magic magnet major maker mango maple march mark market
marry match matter mayor meadow mean medal media melon melt member memory merry metal
meter method metro micro might mighty minor minus minute mirror mist mix model modern
money month moral morning motel motor mount mouse mouth movie music nail napkin
narrow nation nature near neat neck need neighbor never news next nice night noble
noise noon north notch novel nurse nut oak oasis ocean odd offer office often olive
onion open opera orbit order organ other otter ounce outer owner oxen pace pack paddle
page paint pair palace palm panel paper parade parent park parrot party pasta patch
path patio patrol pattern pause peace peach pearl pedal pencil penny people pepper
perfect perform period permit person petal phase phone photo piano pick picnic piece
pilot pinch pink pioneer pirate pistol pitch pizza place plaid plain plane planet plank
plant plate plaza pleasant please pluck plug plum pocket poem poet point polar police
pond pony pool poor porch port possible post potato pouch pound powder power praise
press price pride prime print prior prism prize proof proud prove public pudding puff
pulse punch pupil puppy purchase purple purse push quail queen query quest quick quiet
quilt quirk quite quiz quota quote rabbit race rack radar radio raise rally ranch
random range rapid rare razor reach react ready real realm rebel recall receipt recipe
red refer reflect reform refresh refuge regal region relax relay release relief relish
remain remark remedy remote remove render renew rent repair repeat reply report rescue
reserve reset resolve resort rest result return reveal revel review reward rhino rhythm
ribbon rice rich rider ridge right rigid rifle rinse ripen ripple river roar roast
robot robust rocket rodent rogue roller roof room root rose rotate rough round route
royal rubber ruby rudder ruler rumble runner rural rust saddle safe sail salad salon
salsa salt salute sample sand sane satin sauce sauna scale scalp scarf scene scent
school science scout scrap screen screw script scrub sea search season second secret
sector sedan seed seek seem segment select self sell sense serene series serve set
settle seven shade shadow shake shall shame shape share shark sharp shave sheep sheet
shelf shell shelter shift shine shiny ship shirt shock shore short should shout shower
shrimp shrink shrub shuffle shy side siege sight signal silent silly silver simple
since singer single sink siren sister six sixty skate sketch skill skin skirt sleep
slice slide slight slim slip slope slot slow small smart smell smile smoke smooth snack
snail snake snap sneak snore snow snowy snug soak soap sober soccer social socket soda
sofa soft solar soldier solid solve sonic soothe sorry sort soul sound soup source
south space spare spark speak spear special speech speed spell spend spice spider spike
spill spin spirit splash split spoil spoke sponge spoon sport spray spring sprout spur
square squash stable stack stadium staff stage stagger stain stair stake stale stall
stamp stand staple star starch stare start stash state static station statue status
stay steak steal steam steel steep steer stellar step stern stick sticky stiff still
sting stock stone stood stool story stove strap straw stray streak stream street stress
stretch stride strike string stripe strive stroke strong stuck student study stuff
stumble stump style subject submit subtle suburb such sudden sugar suit suite summit
summon sunny sunset super supply support suppose sure surface surge surprise survey
sushi suspect swamp swan swap swarm sway swear sweat sweep sweet swell swift swim
swing swirl switch swoop sword syrup system table tablet tack tactic tailor talent talk
tall tally tame tango tank tap tape target tariff tart task taste tasty teach team tear
tease tech tempo tempt ten tenet tenor tense tent term test text thank theater theft
theme theory therapy there thick thief thigh thing think third thorn those though
thought thousand thread threat three threw throat throne throw thumb thunder tick
ticket tidal tiger tight timber time timid tiny tip tire title toast today token told
toll tomato tongue tonight took tool tooth top topic torch total touch tough tour
tower town trace track trade tragic trail train trait tramp travel tray tread treat
tree trek trend trial tribe trick trickle trim trio trip triumph troop trophy truck
true trumpet trunk trust truth try tuba tumble tuna tunnel turbo turn turtle tutor
twelve twenty twice twin twist type ugly ulcer ultra uncle under union unique unit
unite unity until upper upset urban urge urgent usage usual utility utter valley vapor
vault vector velvet vendor venue verge verse version vessel vest veto victory video
view village vinegar vinyl violet violin viral virus visit visitor vital vivid vocal
voice void volcano volt voyage vowel wafer waffle wagon waist wait wake walk wall
walnut wander want warm warn warp wash wasp waste watch water wave wax way wealth
weapon wear weary weather weave web wedge weekly weigh weird welcome weld well west
whale wheat wheel where which while whisper white whole whose widen widow width wife
wild willow win wind window wine wing winner winter wipe wire wisdom wish witch with
witness wizard wobble woman wonder wood wool word work world worry worth would wound
woven wrap wreck wrench wrestle wrist write writer wrong wrote yacht yard yarn year
yeast yellow yield yoga yogurt young youth zebra zero zest zigzag zipper zone zoo
`;

const WORDS_ES_SRC = `
casa hogar perro gato pajaro pez agua fuego tierra aire sol luna estrella cielo nube
lluvia nieve viento mar rio lago monte campo bosque selva desierto oasis jardin flor
arbol hoja fruta manzana naranja platano uva limon fresa sandia melon pan leche queso
huevo arroz frijol maiz papa tomate cebolla ajo sal azucar miel cafe chocolate galleta
pastel helado carne pollo pescado mesa silla sofa cama almohada manta espejo lampara
vela puerta ventana pared techo piso escalera llave candado caja bolsa mochila cartera
reloj telefono radio libro lapiz pluma papel carta foto mapa juego juguete pelota
muneca carro tren avion barco bicicleta moto calle puente plaza parque escuela maestro
alumno medico tienda mercado banco iglesia fiesta musica cancion baile arte color rojo
azul verde amarillo negro blanco rosa morado gris marron dia noche manana tarde semana
mes ano tiempo hora minuto segundo primavera verano otono invierno amigo amiga familia
padre madre hijo hija hermano hermana abuelo abuela tio tia primo prima nino nina
bebe joven viejo hombre mujer gente pueblo ciudad pais mundo vida amor paz alegria
tristeza miedo valor suerte sueno deseo trabajo dinero moneda billete precio compra
venta regalo premio castillo rey reina principe princesa caballero dragon mago bruja
pirata tesoro brujula isla playa ola arena concha perla coral tiburon ballena delfin
pulpo cangrejo tortuga rana serpiente arana abeja mariposa hormiga mosquito mosca
gusano caracol aguila paloma cuervo buho loro pato gallina gallo pavo conejo ardilla
raton zorro lobo oso ciervo caballo burro vaca toro oveja cabra cerdo jabali venado
mono tigre leon elefante jirafa cebra hipopotamo rinoceronte canguro koala panda
camello valle colina cueva roca piedra cristal diamante oro plata cobre hierro madera
tela seda lana algodon cuero vidrio plastico metal trueno relampago arcoiris niebla
rocio escarcha marea corriente remolino cascada manantial pozo charco barro polvo
ceniza humo vapor sombra luz oscuridad brillo destello chispa llama brasa carbon
andar correr saltar volar nadar cantar bailar reir llorar dormir despertar comer beber
cocinar leer escribir dibujar pintar hablar escuchar mirar tocar oler pensar sonar
querer amar odiar ayudar jugar ganar perder buscar encontrar abrir cerrar subir bajar
entrar salir llegar partir volver quedar poner quitar dar tomar traer llevar pagar
deber tener hacer decir saber conocer creer bueno malo grande pequeno alto bajo largo
corto ancho nuevo rapido lento fuerte debil duro blando caliente frio dulce salado
amargo agrio claro oscuro limpio sucio lleno vacio facil dificil feliz triste enojado
cansado sano enfermo rico pobre caro barato bonito feo listo tonto valiente cobarde
honesto justo libre preso vivo muerto cabeza cara ojo nariz boca diente lengua oreja
pelo mano dedo brazo pierna pie rodilla codo hombro cuello espalda pecho corazon
sangre hueso piel una
`;

const WORDS_EN = [...new Set(WORDS_EN_SRC.trim().split(/\s+/))];
const WORDS_ES = [...new Set(WORDS_ES_SRC.trim().split(/\s+/))];

const STR = {
  en: {
    tabPassword: 'Password',
    tabPassphrase: 'Passphrase',
    length: 'Length',
    characters: 'characters',
    uppercase: 'Uppercase (A-Z)',
    lowercase: 'Lowercase (a-z)',
    numbers: 'Numbers (0-9)',
    symbols: 'Symbols',
    excludeSimilar: 'Exclude similar characters (i, l, 1, L, o, 0, O)',
    needOneSet: 'Keep at least one character set selected.',
    words: 'Words',
    separator: 'Separator',
    separators: [
      { value: '-', label: 'Hyphen (-)' },
      { value: '_', label: 'Underscore (_)' },
      { value: ' ', label: 'Space' },
      { value: '.', label: 'Dot (.)' },
    ],
    capitalize: 'Capitalize each word',
    addNumber: 'Append a random number',
    generate: 'Generate new',
    copy: 'Copy',
    copied: 'Copied!',
    strength: 'Strength',
    bits: 'bits of entropy',
    weak: 'Weak',
    fair: 'Fair',
    strong: 'Strong',
    veryStrong: 'Very strong',
    privacy:
      'Privacy: passwords are generated locally in your browser with crypto.getRandomValues, a cryptographically secure random source. Nothing is sent to any server and nothing is stored.',
    seeAlso: 'More security tools',
    siblings: [
      { href: '/tools/qr-code-generator', label: 'QR Code Generator' },
      { href: '/tools/character-counter', label: 'Character Counter' },
    ],
    empty: 'Select at least one character set to generate a password.',
  },
  es: {
    tabPassword: 'Contraseña',
    tabPassphrase: 'Frase de paso',
    length: 'Longitud',
    characters: 'caracteres',
    uppercase: 'Mayúsculas (A-Z)',
    lowercase: 'Minúsculas (a-z)',
    numbers: 'Números (0-9)',
    symbols: 'Símbolos',
    excludeSimilar: 'Excluir caracteres similares (i, l, 1, L, o, 0, O)',
    needOneSet: 'Mantén al menos un grupo de caracteres seleccionado.',
    words: 'Palabras',
    separator: 'Separador',
    separators: [
      { value: '-', label: 'Guion (-)' },
      { value: '_', label: 'Guion bajo (_)' },
      { value: ' ', label: 'Espacio' },
      { value: '.', label: 'Punto (.)' },
    ],
    capitalize: 'Mayúscula inicial en cada palabra',
    addNumber: 'Agregar un número aleatorio',
    generate: 'Generar nueva',
    copy: 'Copiar',
    copied: '¡Copiado!',
    strength: 'Fortaleza',
    bits: 'bits de entropía',
    weak: 'Débil',
    fair: 'Aceptable',
    strong: 'Fuerte',
    veryStrong: 'Muy fuerte',
    privacy:
      'Privacidad: las contraseñas se generan localmente en tu navegador con crypto.getRandomValues, una fuente aleatoria criptográficamente segura. Nada se envía a ningún servidor ni se almacena.',
    seeAlso: 'Más herramientas de seguridad',
    siblings: [
      { href: '/es/tools/generador-de-codigos-qr', label: 'Generador de códigos QR' },
      { href: '/es/tools/contador-de-caracteres', label: 'Contador de caracteres' },
    ],
    empty: 'Selecciona al menos un grupo de caracteres para generar una contraseña.',
  },
};

const SET_DEFS = [
  { key: 'upper', chars: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' },
  { key: 'lower', chars: 'abcdefghijklmnopqrstuvwxyz' },
  { key: 'digits', chars: '0123456789' },
  { key: 'symbols', chars: '!@#$%^&*()-_=+[]{};:,.<>?/' },
];
const SIMILAR_RE = /[il1Lo0O]/g;

function randInt(n) {
  const buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  return buf[0] % n;
}

function poolFor(key, excludeSimilar) {
  const def = SET_DEFS.find((d) => d.key === key);
  return excludeSimilar ? def.chars.replace(SIMILAR_RE, '') : def.chars;
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = randInt(i + 1);
    const tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
  }
  return arr;
}

function buildPassword({ length, sets, excludeSimilar }) {
  const pools = sets.map((k) => poolFor(k, excludeSimilar)).filter((p) => p.length > 0);
  if (pools.length === 0) return { text: '', charset: 0 };
  const out = pools.map((p) => p[randInt(p.length)]);
  const all = pools.join('');
  while (out.length < length) out.push(all[randInt(all.length)]);
  return { text: shuffle(out).slice(0, length).join(''), charset: all.length };
}

function buildPassphrase({ count, separator, capitalize, addNumber }, words) {
  const picked = [];
  for (let i = 0; i < count; i += 1) {
    let w = words[randInt(words.length)];
    if (capitalize) w = w.charAt(0).toUpperCase() + w.slice(1);
    picked.push(w);
  }
  let text = picked.join(separator);
  if (addNumber) text += separator + String(randInt(10));
  return { text, perWord: Math.log2(words.length) };
}

function strengthFor(bits) {
  if (bits < 50) return { key: 'weak', color: '#dc2626' };
  if (bits < 80) return { key: 'fair', color: '#d97706' };
  if (bits < 128) return { key: 'strong', color: '#16a34a' };
  return { key: 'veryStrong', color: '#2563eb' };
}

function CheckRow({ checked, onChange, label }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', cursor: 'pointer', fontSize: '0.95rem' }}>
      <input type="checkbox" checked={checked} onChange={onChange} style={{ width: 18, height: 18, accentColor: '#2563eb' }} />
      <span>{label}</span>
    </label>
  );
}

export default function PasswordTool({ lang = 'en' }) {
  const t = STR[lang] || STR.en;
  const [mode, setMode] = useState('password');
  const [length, setLength] = useState(20);
  const [sets, setSets] = useState(['upper', 'lower', 'digits', 'symbols']);
  const [excludeSimilar, setExcludeSimilar] = useState(false);
  const [wordCount, setWordCount] = useState(4);
  const [separator, setSeparator] = useState('-');
  const [capitalize, setCapitalize] = useState(false);
  const [addNumber, setAddNumber] = useState(false);
  const [value, setValue] = useState('');
  const [bits, setBits] = useState(0);
  const [copied, setCopied] = useState(false);

  const regenerate = useCallback(() => {
    if (mode === 'password') {
      const { text, charset } = buildPassword({ length, sets, excludeSimilar });
      setValue(text);
      setBits(text ? length * Math.log2(charset) : 0);
    } else {
      const words = lang === 'es' ? WORDS_ES : WORDS_EN;
      const { text, perWord } = buildPassphrase({ count: wordCount, separator, capitalize, addNumber }, words);
      setValue(text);
      setBits(wordCount * perWord + (addNumber ? Math.log2(10) : 0));
    }
    setCopied(false);
  }, [mode, length, sets, excludeSimilar, wordCount, separator, capitalize, addNumber, lang]);

  useEffect(() => {
    regenerate();
  }, [regenerate]);

  const toggleSet = (key) => {
    setSets((prev) => {
      if (prev.includes(key)) {
        const next = prev.filter((k) => k !== key);
        return next.length === 0 ? prev : next;
      }
      return [...prev, key];
    });
  };

  const copy = async () => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
    } catch (e) {
      const ta = document.createElement('textarea');
      ta.value = value;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  const strength = strengthFor(bits);
  const barWidth = Math.min(100, (bits / 128) * 100);

  const setLabel = { upper: t.uppercase, lower: t.lowercase, digits: t.numbers, symbols: t.symbols };

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }} role="tablist" aria-label="Generator mode">
        {['password', 'passphrase'].map((m) => (
          <button
            key={m}
            type="button"
            role="tab"
            aria-selected={mode === m}
            onClick={() => setMode(m)}
            className={mode === m ? 'btn btn-primary' : 'btn btn-ghost-light'}
            style={{ flex: 1, padding: '11px 16px' }}
          >
            {m === 'password' ? t.tabPassword : t.tabPassphrase}
          </button>
        ))}
      </div>

      <div className="card" style={{ marginBottom: 18 }}>
        {mode === 'password' ? (
          <div>
            <div className="field">
              <label htmlFor="pw-length">
                {t.length}: <strong>{length}</strong> {t.characters}
              </label>
              <input
                id="pw-length"
                type="range"
                min={8}
                max={64}
                value={length}
                onChange={(e) => setLength(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#2563eb' }}
              />
            </div>
            {SET_DEFS.map((d) => (
              <CheckRow key={d.key} checked={sets.includes(d.key)} onChange={() => toggleSet(d.key)} label={setLabel[d.key]} />
            ))}
            <CheckRow checked={excludeSimilar} onChange={(e) => setExcludeSimilar(e.target.checked)} label={t.excludeSimilar} />
            {sets.length === 1 && <div className="hint" style={{ fontSize: '0.82rem', color: '#6b7280' }}>{t.needOneSet}</div>}
          </div>
        ) : (
          <div>
            <div className="field">
              <label htmlFor="pp-words">
                {t.words}: <strong>{wordCount}</strong>
              </label>
              <input
                id="pp-words"
                type="range"
                min={3}
                max={8}
                value={wordCount}
                onChange={(e) => setWordCount(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#2563eb' }}
              />
            </div>
            <div className="field">
              <label htmlFor="pp-sep">{t.separator}</label>
              <select id="pp-sep" value={separator} onChange={(e) => setSeparator(e.target.value)}>
                {t.separators.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
            <CheckRow checked={capitalize} onChange={(e) => setCapitalize(e.target.checked)} label={t.capitalize} />
            <CheckRow checked={addNumber} onChange={(e) => setAddNumber(e.target.checked)} label={t.addNumber} />
          </div>
        )}
      </div>

      <div className="card" style={{ marginBottom: 18 }}>
        <div
          aria-live="polite"
          style={{
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
            fontSize: '1.15rem',
            wordBreak: 'break-all',
            lineHeight: 1.7,
            padding: '14px 16px',
            background: '#f8fafc',
            border: '1px solid var(--line)',
            borderRadius: 10,
            minHeight: 64,
          }}
        >
          {value || <span style={{ color: '#9ca3af' }}>{t.empty}</span>}
        </div>

        <div style={{ marginTop: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: 6 }}>
            <span style={{ fontWeight: 600 }}>{t.strength}</span>
            <span style={{ color: strength.color, fontWeight: 700 }}>
              {t[strength.key]} · {bits.toFixed(0)} {t.bits}
            </span>
          </div>
          <div
            role="progressbar"
            aria-valuenow={Math.round(bits)}
            aria-valuemin={0}
            aria-valuemax={128}
            aria-label={t.strength}
            style={{ height: 10, borderRadius: 999, background: '#e5e7eb', overflow: 'hidden' }}
          >
            <div style={{ height: '100%', width: barWidth + '%', background: strength.color, borderRadius: 999, transition: 'width .2s ease' }} />
          </div>
        </div>

        <div style={{ marginTop: 18, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button type="button" className="btn btn-primary" onClick={regenerate}>
            {t.generate}
          </button>
          <button type="button" className="btn btn-ghost-light" onClick={copy} disabled={!value}>
            {copied ? t.copied : t.copy}
          </button>
        </div>
      </div>

      <div className="note-box" style={{ marginTop: 4 }}>
        {t.privacy}
      </div>

      <div className="note-box" style={{ marginTop: 14 }}>
        <strong>{t.seeAlso}:</strong>{' '}
        {t.siblings.map((l, i) => (
          <span key={l.href}>
            {i > 0 && ' · '}
            <Link href={l.href}>{l.label}</Link>
          </span>
        ))}
      </div>
    </div>
  );
}
