#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const providerLogos = {
    openai: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142-.0852 4.783-2.7582a.7712.7712 0 0 0 .7806 0l5.8428 3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z" fill="#00A67E"/>
  </svg>`,
    anthropic: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="#FF6B35"/>
  </svg>`,
    google: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>`,
    deepseek: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="#6366F1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`,
    xai: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" fill="#000000"/>
  </svg>`,
    ollama: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="#FF6B35"/>
  </svg>`,
    bedrock: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="#FF9900" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`
};

function getProviderDisplayName(providerKey) {
    const names = {
        openai: 'OpenAI',
        anthropic: 'Anthropic',
        google: 'Google',
        deepseek: 'DeepSeek',
        xai: 'xAI',
        ollama: 'Ollama',
        bedrock: 'AWS Bedrock',
        amazon: 'AWS Bedrock'
    };
    return names[providerKey] || providerKey;
}

function extractModelsFromSourceFiles() {
    const providers = {};
    const configDirs = [
        'openai',
        'anthropic',
        'bedrock',
        'google',
        'deepseek',
        'x', // xAI
        'ollama'
    ];

    configDirs.forEach(dir => {
        let configKey;
        if (dir === 'x') {
            configKey = 'xai';
        } else if (dir === 'bedrock') {
            configKey = 'bedrock';
        } else {
            configKey = dir;
        }

        const indexPath = path.join(__dirname, '../../../src/llm/config', dir, 'index.ts');

        try {
            if (fs.existsSync(indexPath)) {
                const content = fs.readFileSync(indexPath, 'utf8');
                const modelRegex = /export const [a-zA-Z]+ = {\s*"([a-zA-Z\.0-9-:]+)\.([a-zA-Z0-9-]+)"/g;
                const bedrockModelsRegex = /const ([a-zA-Z0-9]+)[^{]*?{\s*key: "([a-zA-Z0-9:\.]+)",/g;
                const withDefaultModelRegex = /withDefaultModel\(\s*[a-zA-Z0-9]+,\s*"([^"]+)"\s*\)/g;

                const models = new Set();
                models.add('chat.v1'); // Add the generic chat.v1 option

                if (dir === 'bedrock') {
                    let bedrockMatch;
                    while ((bedrockMatch = bedrockModelsRegex.exec(content)) !== null) {
                        const providerKey = bedrockMatch[2]; // This gets "amazon:anthropic.chat.v1"
                        if (providerKey && !providerKey.includes('mock')) {
                            const parts = providerKey.split('.');
                            if (parts.length >= 2 && parts[parts.length - 1] === 'v1') {
                                const cleanProviderKey = providerKey.replace('amazon:', '');
                                models.add(cleanProviderKey);
                            }
                        }
                    }
                }

                let match;
                while ((match = modelRegex.exec(content)) !== null) {
                    const provider = match[1].split('.')[0];
                    const modelId = match[2];
                    if (modelId && !modelId.includes('mock')) {
                        if (!modelId.includes('chat') && modelId !== 'v1') {
                            models.add(modelId);
                        }
                    }
                }

                while ((match = withDefaultModelRegex.exec(content)) !== null) {
                    if (match[1]) {
                        models.add(match[1]);
                    }
                }

                if (models.size > 0) {
                    providers[configKey] = {
                        key: configKey,
                        name: getProviderDisplayName(configKey),
                        logo: providerLogos[configKey],
                        models: Array.from(models)
                    };
                }
            }
        } catch (error) {
            console.error(`Error processing ${dir} provider:`, error);
        }
    });

    return Object.values(providers);
}

function getHardcodedProviders() {
    return [
        {
            key: 'openai',
            name: 'OpenAI',
            logo: providerLogos.openai,
            models: [
                'gpt-3.5-turbo',
                'gpt-4',
                'gpt-4-turbo',
                'gpt-4o',
                'gpt-4-vision-preview'
            ]
        },
        {
            key: 'anthropic',
            name: 'Anthropic',
            logo: providerLogos.anthropic,
            models: [
                'claude-3-opus-20240229',
                'claude-3-sonnet-20240229',
                'claude-3-haiku-20240307'
            ]
        },
        {
            key: 'google',
            name: 'Google',
            logo: providerLogos.google,
            models: [
                'gemini-pro',
                'gemini-1.5-pro',
                'gemini-1.5-flash'
            ]
        },
        {
            key: 'bedrock',
            name: 'AWS Bedrock',
            logo: providerLogos.bedrock,
            models: [
                'chat.v1',
                'anthropic.chat.v1',
                'meta.chat.v1'
            ]
        },
        {
            key: 'deepseek',
            name: 'DeepSeek',
            logo: providerLogos.deepseek,
            models: [
                'deepseek-chat',
                'deepseek-coder'
            ]
        },
        {
            key: 'xai',
            name: 'xAI',
            logo: providerLogos.xai,
            models: [
                'grok-1'
            ]
        },
        {
            key: 'ollama',
            name: 'Ollama',
            logo: providerLogos.ollama,
            models: [
                'llama3',
                'mistral',
                'mixtral'
            ]
        }
    ];
}

async function updateProviders() {
    try {
        console.log('Extracting providers from TypeScript config files...');

        const extractedProviders = extractModelsFromSourceFiles();

        const providers = extractedProviders.length > 0
            ? extractedProviders
            : getHardcodedProviders();

        providers.forEach(provider => {
            if (provider.models.includes('chat.v1')) {
                provider.models = ['chat.v1', ...provider.models.filter(m => m !== 'chat.v1')];
            }
        });

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