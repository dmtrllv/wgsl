#!/usr/bin/env node

process.setSourceMapsEnabled?.(true);

await import("./cli.js");