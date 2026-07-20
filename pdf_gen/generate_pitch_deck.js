const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
    try {
        console.log('Launching browser...');
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        
        // Define screen viewport for a 16:9 1080p presentation
        const width = 1920;
        const height = 1080;
        await page.setViewport({ width, height });
        
        // Use the absolute path to the compiled English pitch deck
        const filePath = path.resolve(__dirname, '../dist/en/press-kit/vem-exu/pitch-deck.html');
        // Construct a file URL
        const fileUrl = `file:///${filePath.replace(/\\/g, '/')}`;
        console.log(`Loading pitch deck: ${fileUrl}`);
        
        await page.goto(fileUrl, { waitUntil: 'networkidle0' });
        
        console.log('Page loaded. Emulating print media...');
        
        // Emulate print to trigger our specific @media print rules
        await page.emulateMediaType('print');
        
        // Wait a moment for layout to settle
        await new Promise(r => setTimeout(r, 1000));
        
        // Generate PDF
        const pdfPath = path.resolve(__dirname, '../src/static/docs/vem_exu_pitch_deck.pdf');
        console.log(`Generating Presentation PDF at ${pdfPath}...`);
        
        await page.pdf({
            path: pdfPath,
            width: `${width}px`,
            height: `${height}px`,
            printBackground: true, // Crucial for retaining brutalist backgrounds
            margin: { top: 0, right: 0, bottom: 0, left: 0 }
        });
        
        console.log('✅ Pitch Deck PDF generation complete! File saved to:', pdfPath);
        await browser.close();
    } catch (e) {
        console.error('❌ Error generating Pitch Deck PDF:', e);
        process.exit(1);
    }
})();
