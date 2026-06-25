import {
  createWriteStream,
  createReadStream,
  writeFileSync,
  rmSync,
  mkdirSync,
  existsSync,
} from "fs";
import { pipeline } from "stream/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import streamJson from "stream-json";
import streamJsonArray from "stream-json/streamers/StreamArray.js";
import { tmpdir } from "os";

const { parser } = streamJson;
const { streamArray } = streamJsonArray;
const __dirname = dirname(fileURLToPath(import.meta.url));

const DEFAULT_CARDS_META_URL =
  "https://api.scryfall.com/bulk-data/default_cards";
const TMP_FILE = join(tmpdir(), "default-cards.json");
const FETCH_HEADERS = {
  Accept: "application/json",
  "User-Agent": "mtga-brawl-deck-builder-update-script/0.0.0",
};
const MAX_CHUNK_BYTES = 90 * 1024 * 1024; // 90MB — comfortable margin under GitHub's 100MB limit

const ARENA_CARDS_DIR = join(__dirname, "../public/arena-cards");
const LEGENDS_DIR = join(__dirname, "../public/legends");

// ── Exclusion lists (mirrored from Parser.tsx) ────────────────────────────────

const excludeCards = ["Ponder"];

const excludeLegends = new Set([
  "Albiorix, Goose Tyrant",
  "Arek, False Goldwarden",
  "Arvad, Weatherlight Smuggler",
  "Brisela, Voice of Nightmares",
  "Buxton, Decorated Host",
  "Calim, Djinn Emperor",
  "Captain Eberhart",
  "Cerise, Slayer of Fear",
  "Crucias, Titan of the Waves",
  "Grenzo, Crooked Jailer",
  "Darigaaz, Shivan Champion",
  "Euru, Acorn Scrounger",
  "Emperor Apatzec Intli IV",
  "Emmara, Voice of the Conclave",
  "Hanweir, the Writhing Township",
  "Furgul, Quag Nurturer",
  "Ghalma the Shaper",
  "Gutmorn, Pactbound Servant",
  "Gitrog, Horror of Zhava",
  "Gyox, Brutal Carnivora",
  "Hex, Kellan's Companion",
  "High Marshal Arguel",
  "Ishkanah, Broodmother",
  "Jessie Zane, Fangbringer",
  "Jarsyl, Dark Age Scion",
  "Indris, the Hydrostatic Surge",
  "Jon Irenicus, the Exile",
  "Kamachal, Ship's Mascot",
  "Kardum, Patron of Flames",
  "Klement, Novice Acolyte",
  "Liara of the Flaming Fist",
  "Niambi, Beloved Protector",
  "Oglor, Devoted Assistant",
  "Raddic, Tal Zealot",
  "Reezug, the Bonecobbler",
  "Lukamina, Moon Druid",
  "Mythweaver Poq",
  "Minthara of the Absolute",
  "Rankle, Pitiless Trickster",
  "Nashi, Illusion Gadgeteer",
  "Oyaminartok, Polar Werebear",
  "Richlau, Headmaster",
  "Rahilda, Wanted Cutthroat",
  "The Hourglass Coven",
  "Saint Elenda",
  "Roalesk, Prime Specimen",
  "Rusko, Clockmaker",
  "Slimefoot, Thallid Transplant",
  "Rothga, Bonded Engulfer",
  "Tan Jolom, the Worldwalker",
  "Tajic, Legion's Valor",
  "Teysa of the Ghost Council",
  "Syr Joshua and Syr Saxon",
  "Veko, Death's Doorkeeper",
  "Vladimir and Godfrey",
  "Tiana, Angelic Mechanic",
  "Throne of the Grim Captain",
  "Westvale Abbey",
  "Vexyr, Ich-Tekik's Heir",
  "Vona de Iedo, the Antifex",
]);

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Mirrors cleanName() from util.ts — strips the back half of split card names */
function cleanName(name) {
  const split = name.split(" // ")[0].trim();
  let newName = split;
  if (name.includes("A-")) newName = name.replaceAll("A-", "");
  return newName;
}

/** Replicates moment(released_at).subtract(3, 'days') — card is "available" if now >= release - 3d */
function isReleased(releasedAt, now) {
  const d = new Date(releasedAt);
  d.setDate(d.getDate() - 3);
  return now >= d;
}

/** Clears a directory and recreates it fresh */
function resetDir(dir) {
  if (existsSync(dir)) rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
}

/**
 * Writes items[] into ≤90MB chunk files inside outputDir.
 * Returns the number of chunks written.
 * Also writes a manifest.json: { chunks: number, total: number, updatedAt: string }
 */
function writeChunks(items, outputDir, updatedAt) {
  resetDir(outputDir);

  let chunkIndex = 0;
  let chunkItems = [];
  let chunkBytes = 2; // '[]' wrapper

  for (const item of items) {
    const serialized = JSON.stringify(item);
    // +1 for the comma separator between elements
    const itemBytes = Buffer.byteLength(serialized, "utf8") + 1;

    if (chunkBytes + itemBytes > MAX_CHUNK_BYTES && chunkItems.length > 0) {
      const chunkPath = join(outputDir, `chunk-${chunkIndex}.json`);
      writeFileSync(chunkPath, JSON.stringify(chunkItems));
      console.log(
        `  📄 chunk-${chunkIndex}.json  (${chunkItems.length} items, ~${(chunkBytes / 1024 / 1024).toFixed(1)} MB)`,
      );
      chunkIndex++;
      chunkItems = [];
      chunkBytes = 2;
    }

    chunkItems.push(item);
    chunkBytes += itemBytes;
  }

  // flush last chunk
  if (chunkItems.length > 0) {
    const chunkPath = join(outputDir, `chunk-${chunkIndex}.json`);
    writeFileSync(chunkPath, JSON.stringify(chunkItems));
    console.log(
      `  📄 chunk-${chunkIndex}.json  (${chunkItems.length} items, ~${(chunkBytes / 1024 / 1024).toFixed(1)} MB)`,
    );
    chunkIndex++;
  }

  // manifest so the React app knows how many chunks to fetch
  writeFileSync(
    join(outputDir, "manifest.json"),
    JSON.stringify(
      { chunks: chunkIndex, total: items.length, updatedAt },
      null,
      2,
    ),
  );

  return chunkIndex;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

async function fetchJson(url) {
  const res = await fetch(url, { headers: FETCH_HEADERS });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(
      `Fetch failed: ${url} ${res.status} ${res.statusText}\n${body}`,
    );
  }
  return await res.json();
}

// ── Main ──────────────────────────────────────────────────────────────────────

// 1. Resolve download URI
console.log("🔍 Fetching bulk-data metadata...");
const meta = await fetchJson(DEFAULT_CARDS_META_URL);
console.log(`   Updated at : ${meta.updated_at}`);
console.log(`   Download   : ${meta.download_uri}`);
console.log(
  `   Size       : ${(meta.size / 1024 / 1024).toFixed(1)} MB (compressed)`,
);

// 2. Stream download to /tmp
// Node fetch auto-decompresses Content-Encoding: gzip, so the body stream is plain JSON
console.log("\n⬇️  Downloading default cards...");
const dlRes = await fetch(meta.download_uri, { headers: FETCH_HEADERS });
if (!dlRes.ok)
  throw new Error(`Download failed: ${dlRes.status} ${dlRes.statusText}`);
await pipeline(dlRes.body, createWriteStream(TMP_FILE));
console.log("✅ Download complete");

// 3. Stream-parse, filter, and deduplicate (all in one pass — low memory)
console.log("\n🔍 Parsing cards...");
const now = new Date();
const seenNames = new Set();
const arenaCards = [];

await new Promise((resolve, reject) => {
  createReadStream(TMP_FILE)
    .pipe(parser())
    .pipe(streamArray())
    .on("data", ({ value: card }) => {
      const name = cleanName(card.name);

      // Dedup by cleaned name (mirrors uniqBy(..., 'name'))
      if (seenNames.has(name)) return;

      if (
        card.games?.includes("arena") &&
        card.legalities?.brawl === "legal" &&
        isReleased(card.released_at, now) &&
        !excludeCards.includes(card.name)
      ) {
        seenNames.add(name);
        arenaCards.push({
          name,
          id: name,
          images: {
            normal:
              card.image_uris?.normal ??
              card.card_faces?.[0]?.image_uris?.normal ??
              null,
          },
          cmc: card.cmc,
          type: card.type_line,
          colors: card.color_identity,
          set: card.set,
          digital: card.digital,
          rarity: card.rarity,
          layout: card.layout,
          prices: {
            regular: card.prices?.usd ?? null,
            foil: card.prices?.usd_foil ?? null,
            etched: card.prices?.etched ?? null,
          },
          edhRank: card.edhrec_rank ?? null,
        });
      }
    })
    .on("end", resolve)
    .on("error", reject);
});

console.log(`✅ ${arenaCards.length} arena/brawl cards collected`);

// 4. Sort by edhRank (mirrors sortBy(arenaCards, 'edhRank'))
arenaCards.sort((a, b) => (a.edhRank ?? Infinity) - (b.edhRank ?? Infinity));

// 5. Derive legends (mirrors the console.log('legends', ...) output)
const legends = arenaCards
  .filter(
    (card) =>
      card.type.includes("Legendary") &&
      card.type.includes("Creature") &&
      !card.type.includes("Battle") &&
      !excludeLegends.has(card.name),
  )
  .map((card) => card.name.split("//")[0].trim())
  .sort();

console.log(`✅ ${legends.length} legends derived`);

// 6. Write chunked output
const updatedAt = meta.updated_at;

console.log("\n💾 Writing arena-cards...");
const arenaChunks = writeChunks(arenaCards, ARENA_CARDS_DIR, updatedAt);

console.log("\n💾 Writing legends...");
const legendChunks = writeChunks(legends, LEGENDS_DIR, updatedAt);

console.log(
  `\n🎉 Done — ${arenaChunks} arena chunk(s), ${legendChunks} legend chunk(s)`,
);
