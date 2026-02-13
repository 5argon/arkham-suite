import path from 'path';
import fs from 'fs';

const csvName = 'AHLCG Divider Translations - Texts.csv';
const additionalName = 'Additional.csv';
const projectPath = path.join(__dirname, '..', 'project.inlang', 'settings.json');

class Csv {
  data: string[][];
  keyColumnIndex: number;
  languageToColumnIndex: Map<string, number>;

  constructor(
    data: string[][],
    keyColumnIndex: number,
    languageToColumnIndex: Map<string, number>
  ) {
    this.data = data;
    this.keyColumnIndex = keyColumnIndex;
    this.languageToColumnIndex = languageToColumnIndex;
  }

  static fromLanguages(csvPath: string, languages: string[]): Csv {
    const read = fs.readFileSync(csvPath, 'utf8');
    const lines = read.split('\r\n');
    const rows = lines.map((line) => line.split(','));
    const languageToColumnIndex = new Map<string, number>();
    languages.forEach((language) => {
      const index = rows[0].indexOf(language);
      if (index === -1) {
        throw new Error(`Language ${language} not found in CSV`);
      }
      languageToColumnIndex.set(language, index);
    });
    const keyColumnIndex = rows[0].indexOf('Key');
    const excludingFirstRow = rows.slice(1);
    return new Csv(excludingFirstRow, keyColumnIndex, languageToColumnIndex);
  }

  getLanguageTerms(language: string): Iterable<{ key: string; term: string }> {
    const columnIndex = this.languageToColumnIndex.get(language);
    if (columnIndex === undefined) {
      throw new Error(`Language ${language} not found in CSV`);
    }

    const self = this;
    return {
      [Symbol.iterator]() {
        let rowIndex = 0;
        return {
          next() {
            if (rowIndex < self.data.length) {
              const row = self.data[rowIndex++];
              return {
                value: {
                  key: row[self.keyColumnIndex],
                  term: row[columnIndex].replace(/;/g, ','),
                },
                done: false,
              };
            } else {
              return { done: true, value: undefined };
            }
          },
        };
      },
    };
  }
}

function readProjectSettings(): {
  languageTags: string[];
} {
  const settings = require(projectPath);
  return settings;
}

/**
 * Split by slash first, then clean up all symbols.
 */
function keyToCamelCaseJavascript(key: string): string {
  const pascalCase = key
    .split('/')
    .map((part) => {
      // So small "to" are converted to "To" when in camel case.
      const cleaned = part
        .split(' ')
        .map((part2) => {
          const cleanedUp = part2.replace(/[^a-zA-Z0-9]/g, '');
          const capitalized = cleanedUp.charAt(0).toUpperCase() + cleanedUp.slice(1);
          return capitalized;
        })
        .join('');
      return cleaned;
    })
    .join('');
  return pascalCase.charAt(0).toLowerCase() + pascalCase.slice(1);
}

const projectSettings = readProjectSettings();

const csvPath = path.join(__dirname, csvName);
const dividerCsv = Csv.fromLanguages(csvPath, projectSettings.languageTags);

const additionalPath = path.join(__dirname, additionalName);
const additionalCsv = fs.existsSync(additionalPath)
  ? Csv.fromLanguages(additionalPath, projectSettings.languageTags)
  : null;

for (const language of projectSettings.languageTags) {
  const writeJson: { [k: string]: string } = {};
  writeJson['$schema'] = 'https://inlang.com/schema/inlang-message-format';

  // From divider
  for (const { key, term } of dividerCsv.getLanguageTerms(language)) {
    const jsKey = keyToCamelCaseJavascript(key);
    writeJson[jsKey] = term;
  }

  // From additional (if available)
  if (additionalCsv) {
    for (const { key, term } of additionalCsv.getLanguageTerms(language)) {
      const jsKey = keyToCamelCaseJavascript(key);
      writeJson[jsKey] = term;
    }
  }

  const fileName = `${language}.json`;
  const filePath = path.join(__dirname, fileName);
  fs.writeFileSync(filePath, JSON.stringify(writeJson, null, 2));
}
