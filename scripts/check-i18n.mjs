#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const rootDir = process.cwd();
const dictionariesDir = path.join(rootDir, "data", "dictionaries");
const baseLocale = "en";
const strictHardcoded = !process.argv.includes("--report-only");

const scanRoots = [
  path.join(rootDir, "app", "[lang]"),
  path.join(rootDir, "components"),
];

const ignoredScanParts = new Set([
  `${path.sep}components${path.sep}admin${path.sep}`,
  `${path.sep}components${path.sep}ui${path.sep}`,
]);

const visibleAttributeNames = [
  "alt",
  "aria-label",
  "label",
  "placeholder",
  "title",
];

const ignoredStringPatterns = [
  /^https?:\/\//i,
  /^mailto:/i,
  /^#[0-9a-f]{3,8}$/i,
  /^\/[a-z0-9/_-]+$/i,
  /^[A-Z0-9_]+$/,
  /^[a-z0-9_-]+$/,
  /^[a-z]+:[a-z-]+$/i,
  /^[a-z]+\/[a-z0-9.+-]+$/i,
  /^\[[A-Za-z0-9 _/-]+\]$/,
  /^\d+(\.\d+)?$/,
];

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function flattenLeaves(value, prefix = "") {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return Object.entries(value).flatMap(([key, child]) =>
      flattenLeaves(child, prefix ? `${prefix}.${key}` : key),
    );
  }

  return [{ path: prefix, value }];
}

function listFiles(dir, extensions) {
  if (!fs.existsSync(dir)) {
    return [];
  }

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const entryPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      return listFiles(entryPath, extensions);
    }

    if (!entry.isFile() || !extensions.some((ext) => entry.name.endsWith(ext))) {
      return [];
    }

    return [entryPath];
  });
}

function lineNumberForIndex(content, index) {
  let line = 1;
  for (let i = 0; i < index; i += 1) {
    if (content.charCodeAt(i) === 10) {
      line += 1;
    }
  }
  return line;
}

function stripComments(content) {
  return content
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/(^|[^:])\/\/.*$/gm, "$1");
}

function normalizeCandidate(value) {
  return value
    .replace(/\{[^}]*\}/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function shouldIgnoreString(value) {
  const normalized = normalizeCandidate(value);

  if (normalized.length < 3 || !/[A-Za-z]/.test(normalized)) {
    return true;
  }

  if (!/[a-z]/.test(normalized)) {
    return true;
  }

  if (ignoredStringPatterns.some((pattern) => pattern.test(normalized))) {
    return true;
  }

  return false;
}

function addCandidate(candidates, filePath, content, index, type, text) {
  const normalized = normalizeCandidate(text);

  if (shouldIgnoreString(normalized)) {
    return;
  }

  candidates.push({
    file: path.relative(rootDir, filePath),
    line: lineNumberForIndex(content, index),
    type,
    text: normalized,
  });
}

function findHardcodedText(filePath) {
  const content = fs.readFileSync(filePath, "utf8");
  const searchable = stripComments(content);
  const candidates = [];

  const jsxTextPattern = />\s*([^<>{}\n][^<>{}]*)\s*</g;
  for (const match of searchable.matchAll(jsxTextPattern)) {
    addCandidate(candidates, filePath, searchable, match.index + match[0].indexOf(match[1]), "jsx-text", match[1]);
  }

  const attrPattern = new RegExp(
    `\\b(${visibleAttributeNames.join("|")})=["']([^"']*[A-Za-z][^"']*)["']`,
    "g",
  );
  for (const match of searchable.matchAll(attrPattern)) {
    addCandidate(candidates, filePath, searchable, match.index, `attr:${match[1]}`, match[2]);
  }

  const expressionStringPattern = /\{\s*[^{}]*(?:\?|:|\|\|)\s*["`]([^"`{}]*[A-Za-z][^"`{}]*)["`][^{}]*\}/g;
  for (const match of searchable.matchAll(expressionStringPattern)) {
    addCandidate(candidates, filePath, searchable, match.index + match[0].indexOf(match[1]), "expression-string", match[1]);
  }

  return candidates;
}

function compareDictionaries() {
  const dictionaryFiles = fs
    .readdirSync(dictionariesDir)
    .filter((file) => file.endsWith(".json"))
    .sort();

  const basePath = path.join(dictionariesDir, `${baseLocale}.json`);
  const baseDictionary = readJson(basePath);
  const baseLeaves = flattenLeaves(baseDictionary);
  const baseKeys = new Set(baseLeaves.map((leaf) => leaf.path));
  const baseValues = new Map(baseLeaves.map((leaf) => [leaf.path, leaf.value]));

  const issues = [];
  const warnings = [];

  for (const file of dictionaryFiles) {
    const locale = path.basename(file, ".json");
    if (locale === baseLocale) {
      continue;
    }

    const dictionary = readJson(path.join(dictionariesDir, file));
    const leaves = flattenLeaves(dictionary);
    const keys = new Set(leaves.map((leaf) => leaf.path));
    const values = new Map(leaves.map((leaf) => [leaf.path, leaf.value]));

    for (const key of [...baseKeys].sort()) {
      if (!keys.has(key)) {
        issues.push(`[${locale}] missing key: ${key}`);
        continue;
      }

      const value = values.get(key);
      if (typeof value === "string" && value.trim() === "") {
        issues.push(`[${locale}] empty translation: ${key}`);
      }

      const baseValue = baseValues.get(key);
      if (
        typeof value === "string" &&
        typeof baseValue === "string" &&
        value === baseValue &&
        /[A-Za-z]{4,}/.test(value)
      ) {
        warnings.push(`[${locale}] same as ${baseLocale}: ${key} -> "${value}"`);
      }
    }

    for (const key of [...keys].sort()) {
      if (!baseKeys.has(key)) {
        issues.push(`[${locale}] extra key not in ${baseLocale}: ${key}`);
      }
    }
  }

  return { issues, warnings };
}

function scanHardcodedText() {
  return scanRoots
    .flatMap((scanRoot) => listFiles(scanRoot, [".tsx", ".ts"]))
    .filter((filePath) => ![...ignoredScanParts].some((part) => filePath.includes(part)))
    .flatMap(findHardcodedText)
    .sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line);
}

const dictionaryResult = compareDictionaries();
const hardcodedCandidates = scanHardcodedText();
const hasDictionaryIssues = dictionaryResult.issues.length > 0;
const hasHardcodedIssues = hardcodedCandidates.length > 0;

console.log("i18n dictionary check");
console.log("=====================");

if (hasDictionaryIssues) {
  console.log("\nDictionary issues:");
  for (const issue of dictionaryResult.issues) {
    console.log(`- ${issue}`);
  }
} else {
  console.log("\nDictionary keys: OK");
}

if (dictionaryResult.warnings.length > 0) {
  console.log("\nDictionary warnings:");
  for (const warning of dictionaryResult.warnings) {
    console.log(`- ${warning}`);
  }
}

console.log("\nHardcoded visible text candidates:");
if (hasHardcodedIssues) {
  for (const candidate of hardcodedCandidates) {
    console.log(`- ${candidate.file}:${candidate.line} [${candidate.type}] "${candidate.text}"`);
  }
} else {
  console.log("- none");
}

if (hasDictionaryIssues || (strictHardcoded && hasHardcodedIssues)) {
  console.log("\nResult: FAIL");
  process.exitCode = 1;
} else {
  console.log("\nResult: OK");
}
