const fs = require("fs");
const path = require("path");
const nunjucks = require("nunjucks");
const { minify } = require("html-minifier-terser");

const SRC_DIR = path.join(__dirname, "src");
const PUBLIC_DIR = path.join(__dirname, "public");

const pagesDir = path.join(SRC_DIR, "pages");

// Configure Nunjucks
nunjucks.configure(SRC_DIR, {
    autoescape: false
});

// Make sure public directory exists
if (!fs.existsSync(PUBLIC_DIR)) {
    fs.mkdirSync(PUBLIC_DIR, { recursive: true });
}

function copyAssets() {
    const srcJsDir = path.join(SRC_DIR, "js");
    const destJsDir = path.join(PUBLIC_DIR, "assets", "js");

    if (fs.existsSync(srcJsDir)) {
        if (!fs.existsSync(destJsDir)) {
            fs.mkdirSync(destJsDir, { recursive: true });
        }
        const files = fs.readdirSync(srcJsDir);
        for (const file of files) {
            fs.copyFileSync(path.join(srcJsDir, file), path.join(destJsDir, file));
            console.log(`✓ js/${file} → public/assets/js/${file}`);
        }
    }
}

async function buildHTML() {
    copyAssets();

    const files = fs.readdirSync(pagesDir);

    for (const file of files) {
        if (!file.endsWith(".html")) continue;

        const sourceFile = path.join(pagesDir, file);
        const outputFile = path.join(PUBLIC_DIR, file);

        console.log(`Building ${file}...`);

        // Render Nunjucks
        const rendered = nunjucks.render(`pages/${file}`);

        // Minify HTML
        const minified = await minify(rendered, {
            collapseWhitespace: true,
            removeComments: true,
            removeRedundantAttributes: true,
            removeScriptTypeAttributes: true,
            removeStyleLinkTypeAttributes: true,
            useShortDoctype: true
        });

        fs.writeFileSync(outputFile, minified);

        console.log(`✓ ${file} → public/${file}`);
    }
}

buildHTML().catch((error) => {
    console.error(error);
    process.exit(1);
});