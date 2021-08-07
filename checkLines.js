// Check for lines that are too long for Twitter, or that are duplicates too near to each other for Twitter, and log the results.

function checkLines (charLimit = 280, dupeLimit = 8) {

    if (!Array.isArray(lines) || lines.length < 1) {
        console.error('Invalid lines. Expected an array of strings. Received:', lines);
        return;
    }

    console.log(`Checking ${work} for lines longer than ${charLimit} characters, and for duplicate lines within ${dupeLimit} indices of each other.`);

    const longs = [];
    const dupes = [];
    let i, j, k;

    for (i = 0; i < lines.length; i++) {

        if (lines[i].length > charLimit) {
            longs.push({ index: i, line: lines[i] });
        }

        for (j = 1; j <= dupeLimit; j++) {
            k = i + j < lines.length ? i + j : -1 + j;
            if (lines[i] === lines[k]) {
                dupes.push({ index: i, line: lines[i] });
            }
        }
    }

    console.log('Longs:', longs);
    console.log('Dupes:', dupes);
}

const works = require('./works');
const work = process.argv[2];

if (!works.includes(work)) {
    throw new Error(`Invalid work: ${work}`);
}

const lines = require(`./lines/${work}`);
checkLines();
