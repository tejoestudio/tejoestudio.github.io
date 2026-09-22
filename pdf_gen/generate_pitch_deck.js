const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const LANGUAGES = [
    { lang: 'en', htmlPath: '../dist/en/press-kit/vem-exu/pitch-deck.html', pdfName: 'vem_exu_pitch_deck_en.pdf' },
    { lang: 'pt', htmlPath: '../dist/press-kit/vem-exu/pitch-deck.html', pdfName: 'vem_exu_pitch_deck_pt.pdf' }
];

(async () => {
    let browser;
    try {
        console.log('Launching browser...');
        browser = await puppeteer.launch();

        const width = 1920;
        const height = 1080;

        for (const { lang, htmlPath, pdfName } of LANGUAGES) {
            const filePath = path.resolve(__dirname, htmlPath);
            if (!fs.existsSync(filePath)) {
                throw new Error(`[${lang}] Pitch deck HTML not found at ${filePath}. Run 'npm run build' first.`);
            }

            const page = await browser.newPage();
            await page.setViewport({ width, height });

            const fileUrl = `file:///${filePath.replace(/\\/g, '/')}`;
            console.log(`[${lang}] Loading: ${fileUrl}`);

            await page.goto(fileUrl, { waitUntil: 'networkidle0' });
            await page.emulateMediaType('print');
            await new Promise(r => setTimeout(r, 1000));

            const pdfPath = path.resolve(__dirname, `../src/static/docs/${pdfName}`);
            console.log(`[${lang}] Generating PDF at ${pdfPath}...`);

            await page.pdf({
                path: pdfPath,
                width: `${width}px`,
                height: `${height}px`,
                printBackground: true,
                margin: { top: 0, right: 0, bottom: 0, left: 0 }
            });

            console.log(`[${lang}] ✅ Saved: ${pdfPath}`);
            await page.close();
        }

        console.log('✅ All Pitch Deck PDFs generated!');
        await browser.close();
    } catch (e) {
        console.error('❌ Error generating Pitch Deck PDF:', e);
        if (browser) await browser.close();
        process.exit(1);
    }
})();
