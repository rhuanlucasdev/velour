import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

function parseEnvFile(fileName) {
  const filePath = path.join(rootDir, fileName);

  if (!fs.existsSync(filePath)) {
    return {};
  }

  const fileContents = fs.readFileSync(filePath, "utf8");
  const entries = {};

  for (const rawLine of fileContents.split(/\r?\n/)) {
    const line = rawLine.trim();

    if (!line || line.startsWith("#")) {
      continue;
    }

    const separatorIndex = line.indexOf("=");
    if (separatorIndex === -1) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    const value = line
      .slice(separatorIndex + 1)
      .trim()
      .replace(/^['"]|['"]$/g, "");
    entries[key] = value;
  }

  return entries;
}

const fileEnv = {
  ...parseEnvFile(".env"),
  ...parseEnvFile(".env.local"),
};

const mergedEnv = {
  ...fileEnv,
  ...process.env,
};

export function getEnv(name, fallback) {
  const value = mergedEnv[name];

  if (value === undefined || value === "") {
    if (fallback !== undefined) {
      return fallback;
    }

    throw new Error(`Missing environment variable: ${name}`);
  }

  return value;
}

export function maybeGetEnv(name, fallback = null) {
  const value = mergedEnv[name];

  if (value === undefined || value === "") {
    return fallback;
  }

  return value;
}
