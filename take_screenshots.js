const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

(async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage();

    // Set viewport to 16:9 (1280x720)
    await page.setViewportSize({ width: 1280, height: 720 });

    const screenshotDir = 'C:\\Users\\jason\\.gemini\\antigravity\\brain\\555653a2-dd18-4c3f-adc4-363f1ec71568\\screenshots';
    if (!fs.existsSync(screenshotDir)) {
        fs.mkdirSync(screenshotDir, { recursive: true });
    }

    console.log('Navigating to http://localhost:5173...');
    try {
        await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });

        // Screenshot 1: Home
        await page.screenshot({ path: path.join(screenshotDir, '01_home.png') });
        console.log('Saved 01_home.png');

        // Screenshot 2: Features (scroll down)
        await page.evaluate(() => window.scrollBy(0, 500));
        await page.waitForTimeout(1000);
        await page.screenshot({ path: path.join(screenshotDir, '02_features.png') });
        console.log('Saved 02_features.png');

        // Screenshot 3: Search (optional interaction)
        // Try to find a search input and type something if it exists
        const searchInput = await page.$('input[type="text"], input[placeholder*="search" i]');
        if (searchInput) {
            await searchInput.fill('Coffee Shops');
            await searchInput.press('Enter');
            await page.waitForTimeout(3000);
            await page.screenshot({ path: path.join(screenshotDir, '03_search_results.png') });
            console.log('Saved 03_search_results.png');
        }

    } catch (error) {
        console.error('Error during screenshot capture:', error);
    }

    await browser.close();
})();
