import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const REVIEW = "One star. Air is everywhere, which means it can see all my other reviews.";
const OUTPUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
const ENTRY_PATH = join(OUTPUT_DIR, "entry.txt");

function fail(message: string): never {
  process.stderr.write(`${message}\n`);
  process.exit(1);
}

type ReviewFacts = {
  review: string;
  characters: number;
  bytes: number;
  lines: number;
};

function reviewFacts(text: string): ReviewFacts {
  return {
    review: text,
    characters: [...text].length,
    bytes: Buffer.byteLength(text, "utf8"),
    lines: text.split(/\r\n|\r|\n/).length,
  };
}

function validate(text: string): ReviewFacts {
  const facts = reviewFacts(text);

  if (text.trim().length === 0) {
    fail("Review must not be empty or only whitespace.");
  }
  if (text !== text.trim()) {
    fail("Review must not have leading or trailing whitespace.");
  }
  if (facts.characters < 1 || facts.characters > 200) {
    fail(`Review must be 1 to 200 characters; got ${facts.characters}.`);
  }
  if (facts.bytes < 1 || facts.bytes > 200) {
    fail(`Review must be 1 to 200 bytes; got ${facts.bytes}.`);
  }
  if (facts.lines !== 1 || /[\r\n]/.test(text)) {
    fail("Review must be a single line with no newline characters.");
  }

  return facts;
}

const facts = validate(REVIEW);

mkdirSync(OUTPUT_DIR, { recursive: true });
const payload = `${facts.review}\n`;
writeFileSync(ENTRY_PATH, payload, "utf8");

const written = readFileSync(ENTRY_PATH);
if (!written.equals(Buffer.from(payload, "utf8"))) {
  fail(`Read-back mismatch at ${ENTRY_PATH}.`);
}

console.log(ENTRY_PATH);
console.log(`Characters: ${facts.characters}`);
console.log(`Bytes: ${facts.bytes}`);
