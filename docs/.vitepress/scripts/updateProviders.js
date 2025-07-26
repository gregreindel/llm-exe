#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

async function updateProviders() {
    try {
        console.log('Generating providers from configs...');

        const result = execSync('npx tsx .vitepress/utils/generateProviders.ts', {
            encoding: 'utf8',
            cwd: path.join(__dirname, '../../')
        });

        const providers = JSON.parse(result);

        const outputPath = path.join(__dirname, '../utils/providers.json');
        fs.writeFileSync(outputPath, JSON.stringify(providers, null, 2));

        console.log(`✅ Updated providers.json with ${providers.length} providers:`);
        providers.forEach(provider => {
            console.log(`  - ${provider.name}: ${provider.models.length} models`);
        });
    } catch (error) {
        console.error('❌ Failed to update providers:', error);
        process.exit(1);
    }
}

updateProviders(); 