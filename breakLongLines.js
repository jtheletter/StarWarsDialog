// WARNING: This functions overwrites the work's "lines" file.
// Break lines that are too long for Twitter using a breaker that is input on the command line.
// Breaker can contain any characters (such as letters or punctuation).
// Breaker must be either one or two "words", as delineated by a space character.
// If breaker is one "word", then overly long lines will be split by the breaker, with the breaker appended to the end of each fragment except the last.
// If breaker is two "words", then long lines are split by the breaker phrase, with the first word appended to the end of each fragment but the last, and the second word prepended to start of each fragment except the first.

function breakLongLines (charLimit = 280) {

    if (!Array.isArray(lines) || lines.length < 1) {
        console.error('Invalid lines. Expected an array of strings. Received:', lines);
        return;
    }

    let i, j, splitLineArr;

    for (i = 0; i < lines.length; i++) {

        if (lines[i].length > charLimit) { // If line exceeds limit.
            if (lines[i].includes(breaker)) { // And if line includes breaker.
                splitLineArr = lines[i].split(breaker); // Create temporary array of line fragments, split by breaker.
                for (j = 0; j < splitLineArr.length - 1; j++) { // For every fragment but last...
                    if (breaker.split(' ').length > 1) { // If breaker has a space...
                        splitLineArr[j] += breaker.split(' ')[0]; // Concat first half of breaker back onto end of fragment.
                        splitLineArr[j + 1] = breaker.split(' ')[1] + splitLineArr[j + 1]; // Concat second half of breaker onto start of fragment.
                    } else {
                        splitLineArr[j] += breaker; // Concat breaker onto end of fragment.
                    }
                }
                lines.splice(...[i, 1].concat(splitLineArr)); // Splice fragments back into lines.
            }
        }

    }
    return lines;
}

const worksObject = require('./works');
const works = Object.keys(worksObject);
const work = process.argv[2];
const breaker = process.argv[3];
const fs = require('fs');

if (!works.includes(work)) {
    throw new Error(`Invalid work: ${work}`);
}
if (typeof breaker !== 'string') {
    throw new Error(`Breaker should be a string. Received type: ${typeof breaker}`);
}
if (breaker.length < 1) {
    throw new Error(`Breaker is too short. Received length: ${breaker.length}`);
}
if (breaker.split(' ').length > 2) {
    throw new Error(`Breaker can have up to only one space character. Found: ${breaker.split(' ').length - 1}`);
}

console.log('process.argv:', process.argv);
console.log('breaker:', breaker);
console.log('breaker.length:', breaker.length);

let lines = require(`./lines/${work}`);
lines = breakLongLines();

lines.forEach(function (line, ind) {
    lines[ind] = line.replace(/\n/g, '\\n'); // Preserve in-string newlines.
});

let data = `module.exports = [\n\'${lines.join('\',\n\'')}\',\n];\n`; // Create data string to write file.

fs.writeFile(`./lines/${work}.js`, data, function (error) {
    if (error) {
        throw error;
    }
    console.log('File saved.');
});
