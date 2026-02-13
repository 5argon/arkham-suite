import { chromium, type Browser, type Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Screenshot automation script for Arkham Horror LCG setup reference cards.
 * 
 * Usage: npm run screenshot:setup dwl
 * 
 * This script:
 * 1. Launches a headless browser
 * 2. Navigates to localhost:5173/campaign/{campaignCode}
 * 3. Iterates through all scenarios using the dropdown
 * 4. Screenshots the setup-reference-card element (600x832px) at 2x DPI
 * 5. Saves to screenshots/{campaignCode}/scenario-{index}.png
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:5173';
const OUTPUT_DIR = process.env.OUTPUT_DIR || './screenshots';
const DEVICE_SCALE_FACTOR = 2; // Retina/high-DPI screenshots

interface ScriptOptions {
	campaignCode: string;
	baseUrl: string;
	outputDir: string;
}

async function screenshotSetupCards(options: ScriptOptions): Promise<void> {
	const { campaignCode, baseUrl, outputDir } = options;
	
	console.log(`🎮 Starting screenshot automation for campaign: ${campaignCode}`);
	console.log(`📍 Target URL: ${baseUrl}/campaign/${campaignCode}`);
	
	// Create output directory
	const campaignOutputDir = path.join(outputDir, campaignCode);
	if (!fs.existsSync(campaignOutputDir)) {
		fs.mkdirSync(campaignOutputDir, { recursive: true });
	}
	
	let browser: Browser | null = null;
	let page: Page | null = null;
	
	try {
		// Launch browser
		console.log('🌐 Launching browser...');
		browser = await chromium.launch({
			headless: true,
		});
		
		const context = await browser.newContext({
			viewport: { width: 1280, height: 1024 },
			deviceScaleFactor: DEVICE_SCALE_FACTOR,
			colorScheme: 'light', // Light theme only
		});
		
		page = await context.newPage();
		
		// Navigate to campaign page
		const url = `${baseUrl}/campaign/${campaignCode}`;
		console.log(`📄 Navigating to ${url}...`);
		await page.goto(url, { waitUntil: 'networkidle' });
		
		// Click on "Scenarios" tab (it's the second tab, index 1)
		console.log('🔘 Clicking on Scenarios tab...');
		const scenariosTab = page.locator('button[role="radio"]').nth(1);
		await scenariosTab.waitFor({ state: 'visible', timeout: 10000 });
		await scenariosTab.click();
		
		// Wait for setup reference card to be visible after tab switch
		console.log('⏳ Waiting for setup reference card to load...');
		await page.waitForSelector('.setup-reference-card', { timeout: 10000 });
		
		// Find the scenario dropdown
		const dropdown = page.locator('select[name="scenarios"]').first();
		if (!(await dropdown.count())) {
			throw new Error('Scenario dropdown not found on page');
		}
		
		// Get all scenario options
		const options = await dropdown.locator('option').all();
		const scenarioCount = options.length;
		console.log(`📚 Found ${scenarioCount} scenarios`);
		
		// Iterate through each scenario
		for (let i = 0; i < scenarioCount; i++) {
			console.log(`📸 Capturing scenario ${i + 1}/${scenarioCount}...`);
			
			// Select scenario by index
			await dropdown.selectOption({ index: i });
			
			// Wait for card to update (wait for any re-render to complete)
			await page.waitForTimeout(500);
			
			// Ensure card is visible
			const frontCard = page.locator('.setup-reference-card').first();
			await frontCard.waitFor({ state: 'visible' });
			
			// Take screenshot of front card
			const frontFilename = `scenario-${i}-a.png`;
			const frontFilepath = path.join(campaignOutputDir, frontFilename);
			
			await frontCard.screenshot({
				path: frontFilepath,
				type: 'png',
			});
			
			console.log(`  ✅ Saved front: ${frontFilepath}`);
			
			// Check if there's a back card
			const backCard = page.locator('.setup-reference-card-back');
			const backCardCount = await backCard.count();
			
			if (backCardCount > 0) {
				await backCard.waitFor({ state: 'visible' });
				
				// Take screenshot of back card
				const backFilename = `scenario-${i}-b.png`;
				const backFilepath = path.join(campaignOutputDir, backFilename);
				
				await backCard.screenshot({
					path: backFilepath,
					type: 'png',
				});
				
				console.log(`  ✅ Saved back: ${backFilepath}`);
			}
		}
		
		console.log(`\n🎉 Successfully captured ${scenarioCount} screenshots!`);
		console.log(`📁 Output directory: ${campaignOutputDir}`);
		
	} catch (error) {
		console.error('❌ Error during screenshot automation:', error);
		throw error;
	} finally {
		// Cleanup
		if (page) await page.close();
		if (browser) await browser.close();
	}
}

// Parse CLI arguments
async function main() {
	const args = process.argv.slice(2);
	
	if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
		console.log(`
Usage: npm run screenshot:setup <campaign-code> [options]

Arguments:
  campaign-code    Campaign code (e.g., dwl, ptc, tfa)

Environment Variables:
  BASE_URL         Base URL for the dev server (default: http://localhost:5173)
  OUTPUT_DIR       Output directory for screenshots (default: ./screenshots)

Examples:
  npm run screenshot:setup dwl
  BASE_URL=http://localhost:3000 npm run screenshot:setup ptc
  OUTPUT_DIR=./output npm run screenshot:setup tcu
		`);
		process.exit(args.length === 0 ? 1 : 0);
	}
	
	const campaignCode = args[0];
	
	await screenshotSetupCards({
		campaignCode,
		baseUrl: BASE_URL,
		outputDir: OUTPUT_DIR,
	});
}

main().catch((error) => {
	console.error('Fatal error:', error);
	process.exit(1);
});
