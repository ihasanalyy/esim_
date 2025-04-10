import { join, normalize } from 'path';
import { readFile } from 'fs/promises';
import Fuse from 'fuse.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
// To get the equivalent of __dirname in ES Modules:
// const __dirname = new URL(import.meta.url).pathname;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const baseDir = join(__dirname, '..'); 

// const correctedDirname = __dirname.slice(0, __dirname.lastIndexOf('/'));

export async function getAvailableCountries(userInput, lang) {
    console.log('User Input:', userInput);  // Debugging user input
    console.log('Language:', lang);  // Debugging language input
    // Dummy list1 - from DB
    const list1 = [
        { country_iso_code: 'FRA', country_name: 'France' },
        { country_iso_code: 'DEU', country_name: 'Germany' },
        { country_iso_code: 'ESP', country_name: 'Spain' },
        { country_iso_code: 'ITA', country_name: 'Italy' },
        { country_iso_code: 'GBR', country_name: 'United Kingdom' },
        { country_iso_code: 'USA', country_name: 'United States' },
        { country_iso_code: 'IND', country_name: 'India' },
        { country_iso_code: 'AUS', country_name: 'Australia' },
        { country_iso_code: 'CAN', country_name: 'Canada' },
        { country_iso_code: 'JPN', country_name: 'Japan' },
        { country_iso_code: 'CHN', country_name: 'China' },
        { country_iso_code: 'BRA', country_name: 'Brazil' },
        { country_iso_code: 'ZAF', country_name: 'South Africa' },
        { country_iso_code: 'RUS', country_name: 'Russia' },
        { country_iso_code: 'MEX', country_name: 'Mexico' },
        { country_iso_code: 'ARG', country_name: 'Argentina' },
    ];

    // Dummy list2 - from Thunes API
    const list2 = [
        { iso_code: 'FRA', name: 'France' },
        { iso_code: 'DEU', name: 'Germany' },
        { iso_code: 'ESP', name: 'Spain' },
        { iso_code: 'ITA', name: 'Italy' },
        { iso_code: 'GBR', name: 'United Kingdom' },
        { iso_code: 'USA', name: 'United States' },
        { iso_code: 'IND', name: 'India' },
        { iso_code: 'AUS', name: 'Australia' },
        { iso_code: 'CAN', name: 'Canada' },
        { iso_code: 'JPN', name: 'Japan' },
        { iso_code: 'CHN', name: 'China' },
        { iso_code: 'BRA', name: 'Brazil' },
        { iso_code: 'ZAF', name: 'South Africa' },
        { iso_code: 'RUS', name: 'Russia' },
        { iso_code: 'MEX', name: 'Mexico' },
        { iso_code: 'ARG', name: 'Argentina' },
    ];

    let combinedResults = [];

    const pushIfValidAndUnique = (isoCode, name) => {
        const existsInList1 = list1.some(c => c.country_iso_code === isoCode);
        const existsInList2 = list2.some(c => c.iso_code === isoCode);
        const alreadyAdded = combinedResults.some(c => c.country_iso_code === isoCode);

        if (existsInList1 && existsInList2 && !alreadyAdded) {
            combinedResults.push({ country_name: name, country_iso_code: isoCode });
        }
    };

    try {
        // Corrected path construction: Direct resolve without additional manipulation
        // const langFilePath = resolve(correctedDirname, `../countries/${lang}.json`);
        const langFilePath = normalize(join(baseDir, 'utils/countries', `${lang}.json`));
        console.log('Resolved Path (using baseDir):', langFilePath);
        // const langFilePath = normalize(join(correctedDirname, '../countries', `${lang}.json`));
        // console.log('Resolved Path:', langFilePath);  // Debugging path construction

        const langJsonData = await readFile(langFilePath, 'utf-8');
        console.log('Language JSON Data:', langJsonData);  // Debugging JSON data
        const langCountries = JSON.parse(langJsonData);
        console.log('Parsed Language Countries:', langCountries);  // Debugging parsed data

        const normalizedInput = userInput.toLowerCase();
        console.log('Normalized Input:', normalizedInput);  // Debugging normalized input

        // Step 1: Match from language file
        const langMatches = langCountries.filter(c =>
            c.name.toLowerCase().includes(normalizedInput)
        );
        console.log('Language Matches:', langMatches);  // Debugging language matches

        langMatches.forEach(c => pushIfValidAndUnique(c.alpha3, c.name));

        if (combinedResults.length > 0) return combinedResults;

        // Step 2: Match from list1 and list2
        const list1Matches = list1.filter(c =>
            c.country_name.toLowerCase().includes(normalizedInput)
        );
        const list2Matches = list2.filter(c =>
            c.name.toLowerCase().includes(normalizedInput)
        );

        list1Matches.forEach(c1 => {
            const match2 = list2.find(c2 => c2.iso_code === c1.country_iso_code);
            if (match2) pushIfValidAndUnique(c1.country_iso_code, c1.country_name);
        });

        list2Matches.forEach(c2 => {
            const match1 = list1.find(c1 => c1.country_iso_code === c2.iso_code);
            if (match1) pushIfValidAndUnique(c2.iso_code, c2.name);
        });

        if (combinedResults.length > 0) return combinedResults;

        // Step 3: Fuzzy match
        const fuseData = [
            ...langCountries.map(c => ({ name: c.name, iso: c.alpha3 })),
            ...list1.map(c => ({ name: c.country_name, iso: c.country_iso_code })),
            ...list2.map(c => ({ name: c.name, iso: c.iso_code })),
        ];

        const fuse = new Fuse(fuseData, {
            keys: ['name'],
            threshold: 0.4,
        });

        const fuzzyResults = fuse.search(userInput);

        fuzzyResults.forEach(({ item }) => {
            pushIfValidAndUnique(item.iso, item.name);
        });

    } catch (error) {
        console.error(`Error reading ${lang}.json file:`, error);
    }

    return combinedResults.length > 0 ? combinedResults : null;
}

const pushIfValidAndUnique = (isoCode, name) => {
    const existsInList1 = list1.some(c => c.country_iso_code === isoCode);
    const existsInList2 = list2.some(c => c.iso_code === isoCode);
    const alreadyAdded = combinedResults.some(c => c.country_iso_code === isoCode);

    if (existsInList1 && existsInList2 && !alreadyAdded) {
        combinedResults.push({ country_name: name, country_iso_code: isoCode });
    }
};