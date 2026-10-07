import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

import openapiTS, { astToString } from 'openapi-typescript';

const DEFAULT_SCHEMA_URL = 'http://localhost:3000/docs-json';
const OUTPUT_FILE = new URL('../src/lib/api-schema.d.ts', import.meta.url);

const source = process.env.API_SCHEMA_URL ?? DEFAULT_SCHEMA_URL;
const input = /^https?:\/\//.test(source) ? new URL(source) : pathToFileURL(resolve(source));

const ast = await openapiTS(input);
await writeFile(OUTPUT_FILE, astToString(ast));

console.log(`API schema generated from ${source}`);
