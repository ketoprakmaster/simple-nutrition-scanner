import { add } from "dexie";

const SOURCE_URL = "https://static.openfoodfacts.org/data/taxonomies/additives.json";
const OUTPUT_PATH = "./src/lib/data/additives-min.json";

interface Localization {
  [languageCode: string]: string;
}

interface AdditiveEntry {
    e_number: Localization;
    name: Localization;
    wikidata?: Localization;
    additives_classes?: Localization;
    parents: string[];
    efsa_evaluation_overexposure_risk?: Localization;
    efsa_evaluation?: Localization;
    anses_additives_of_interest?: Localization;
}

type AdditivesData = Record<string, AdditiveEntry>;


async function update() {
    console.log("🚀 Fetching latest additives taxonomy...");
    const response = await fetch(SOURCE_URL);
    if (!response.ok) throw new Error("Failed to fetch data");

    const data : AdditivesData = await response.json();
    const minified: Record<string, { r: number, n: string }> = {};


    for (const [key, entry] of Object.entries(data)) {
        if (!entry.name?.en) continue;

        const riskTag = entry.efsa_evaluation_overexposure_risk?.en || "";
        const isOfInterest = entry.anses_additives_of_interest?.en === "yes";
        const classes = entry.additives_classes?.en || "";

        let risk = 0;

        if (riskTag.includes("high")) {
            // Preservatives and specific colors with high exposure risk are the "Reds"
            if (classes.includes("preservative") || classes.includes("colour")) {
                risk = 3;
            } else {
                // High exposure risk but safer class (like flavor enhancers/MSG)
                risk = 2;
            }
        } else if (isOfInterest) {
            // If it's interesting but overexposure is "no", it's just a yellow flag
            if (riskTag.includes("no")) {
                risk = 1;
            } else {
                risk = 2;
            }
        }

        if (risk > 0) {
            minified[key] = {
                r: risk,
                n: entry.name.en.split(' - ').pop() || entry.name.en
            };
        }
    }


    await Bun.write(OUTPUT_PATH, JSON.stringify(minified));
    const size = (Bun.file(OUTPUT_PATH).size / 1024).toFixed(2);
    console.log(`total record of additives: ${Object.keys(minified).length} out of ${Object.keys(data).length}`)
    console.log(`✅ Update complete! New size: ${size} KB`);
}

update();
