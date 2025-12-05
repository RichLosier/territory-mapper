#!/usr/bin/env node

/**
 * Script de configuration automatique Google Cloud API
 * Configure les restrictions HTTP referrers pour votre clé API
 */

const https = require('https');
const readline = require('readline');

const API_KEY = 'AIzaSyA21ef6cszYLyn22AiihKOkLa9ss0EIEDQ';
const VERCEL_URL = 'https://wx-interactive-reps-mapping-r8ja86k6e-richard-losiers-projects.vercel.app';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function question(prompt) {
    return new Promise((resolve) => {
        rl.question(prompt, resolve);
    });
}

async function getAccessToken() {
    console.log('\n🔐 Authentification Google Cloud requise\n');
    console.log('Pour obtenir un access token:');
    console.log('1. Allez sur: https://console.cloud.google.com/apis/credentials');
    console.log('2. Cliquez sur "CREATE CREDENTIALS" → "OAuth client ID"');
    console.log('3. Type: "Desktop app"');
    console.log('4. Ou utilisez gcloud CLI:\n');
    console.log('   gcloud auth application-default login\n');
    
    const token = await question('Collez votre access token (ou appuyez sur Entrée pour configuration manuelle): ');
    
    if (!token.trim()) {
        return null;
    }
    
    return token.trim();
}

async function updateApiKeyRestrictions(accessToken, projectId) {
    const restrictions = [
        'http://localhost:*',
        'http://127.0.0.1:*',
        'https://*.vercel.app/*',
        `${VERCEL_URL}/*`
    ];
    
    const url = `https://apikeys.googleapis.com/v2/projects/${projectId}/locations/global/keys/${API_KEY}`;
    
    const payload = JSON.stringify({
        restrictions: {
            browserKeyRestrictions: {
                allowedReferrers: restrictions
            }
        },
        updateMask: 'restrictions.browserKeyRestrictions.allowedReferrers'
    });
    
    return new Promise((resolve, reject) => {
        const options = {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        };
        
        const req = https.request(url, options, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                if (res.statusCode === 200) {
                    resolve(JSON.parse(data));
                } else {
                    reject(new Error(`HTTP ${res.statusCode}: ${data}`));
                }
            });
        });
        
        req.on('error', reject);
        req.write(payload);
        req.end();
    });
}

async function main() {
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('🔧 Configuration Automatique Google Cloud API');
    console.log('═══════════════════════════════════════════════════════════════\n');
    
    console.log(`📋 Clé API: ${API_KEY.substring(0, 20)}...`);
    console.log(`🌐 URL Vercel: ${VERCEL_URL}\n`);
    
    // Méthode 1: Utiliser gcloud si disponible
    const { execSync } = require('child_process');
    let projectId = null;
    
    try {
        projectId = execSync('gcloud config get-value project', { encoding: 'utf-8' }).trim();
        console.log(`✅ Projet Google Cloud détecté: ${projectId}\n`);
        
        console.log('🔐 Authentification avec gcloud...');
        try {
            execSync('gcloud auth application-default login', { stdio: 'inherit' });
            console.log('✅ Authentification réussie!\n');
        } catch (e) {
            console.log('⚠️  Authentification annulée ou échouée\n');
        }
    } catch (e) {
        console.log('⚠️  gcloud non disponible, utilisation de la méthode manuelle\n');
    }
    
    if (!projectId) {
        projectId = await question('Entrez votre Project ID Google Cloud: ');
        if (!projectId.trim()) {
            console.log('\n❌ Project ID requis');
            console.log('\n📖 Configuration manuelle requise:');
            console.log('1. Allez sur: https://console.cloud.google.com/apis/credentials');
            console.log(`2. Cliquez sur votre clé API: ${API_KEY.substring(0, 20)}...`);
            console.log('3. Application restrictions → HTTP referrers');
            console.log('4. Ajoutez:');
            restrictions.forEach(r => console.log(`   • ${r}`));
            console.log('5. Save\n');
            process.exit(0);
        }
    }
    
    const accessToken = await getAccessToken();
    
    if (!accessToken) {
        console.log('\n📖 Configuration manuelle:');
        console.log('1. https://console.cloud.google.com/apis/credentials');
        console.log(`2. Cliquez sur: ${API_KEY.substring(0, 20)}...`);
        console.log('3. Application restrictions → HTTP referrers');
        console.log('4. Ajoutez ces URLs:');
        [
            'http://localhost:*',
            'http://127.0.0.1:*',
            'https://*.vercel.app/*',
            `${VERCEL_URL}/*`
        ].forEach(url => console.log(`   • ${url}`));
        console.log('5. Save\n');
        process.exit(0);
    }
    
    try {
        console.log('\n🔄 Mise à jour des restrictions...');
        const result = await updateApiKeyRestrictions(accessToken, projectId);
        console.log('✅ Restrictions configurées avec succès!\n');
        console.log('📋 Restrictions appliquées:');
        result.restrictions?.browserKeyRestrictions?.allowedReferrers?.forEach(url => {
            console.log(`   ✅ ${url}`);
        });
        console.log('\n⏳ Attendez 2-5 minutes pour que les changements prennent effet\n');
    } catch (error) {
        console.error('\n❌ Erreur:', error.message);
        console.log('\n📖 Configuration manuelle requise (voir instructions ci-dessus)\n');
    }
    
    rl.close();
}

main().catch(console.error);

