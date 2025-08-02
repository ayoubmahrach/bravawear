const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

console.log('🚀 Starting Performance Optimization...\n');

// 1. Minify CSS
async function minifyCSS() {
    console.log('📝 Minifying CSS...');
    try {
        await exec('cleancss -o assets/css/style.min.css assets/css/style.css');
        console.log('✅ CSS minified successfully');
    } catch (error) {
        console.log('❌ CSS minification failed:', error.message);
    }
}

// 2. Minify JavaScript
async function minifyJS() {
    console.log('📝 Minifying JavaScript...');
    try {
        await exec('terser assets/js/script.js -o assets/js/script.min.js --compress --mangle');
        console.log('✅ JavaScript minified successfully');
    } catch (error) {
        console.log('❌ JavaScript minification failed:', error.message);
    }
}

// 3. Create WebP versions of images
async function createWebPImages() {
    console.log('🖼️ Creating WebP versions of images...');
    try {
        const imagesDir = path.join(__dirname, 'assets', 'images');
        if (fs.existsSync(imagesDir)) {
            await processImages(imagesDir);
            console.log('✅ WebP images created successfully');
        } else {
            console.log('⚠️ Images directory not found');
        }
    } catch (error) {
        console.log('❌ WebP conversion failed:', error.message);
    }
}

async function processImages(dirPath) {
    const files = fs.readdirSync(dirPath);
    
    for (const file of files) {
        const filePath = path.join(dirPath, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
            await processImages(filePath);
        } else if (isImageFile(file)) {
            const webpPath = filePath.replace(/\.(jpg|jpeg|png)$/i, '.webp');
            
            if (!fs.existsSync(webpPath)) {
                try {
                    await exec(`magick "${filePath}" -quality 85 "${webpPath}"`);
                    console.log(`  ✓ Converted ${file} to WebP`);
                } catch (error) {
                    console.log(`  ⚠️ Failed to convert ${file} (ImageMagick may not be installed)`);
                }
            }
        }
    }
}

function isImageFile(filename) {
    const imageExtensions = ['.jpg', '.jpeg', '.png'];
    const ext = path.extname(filename).toLowerCase();
    return imageExtensions.includes(ext);
}

// 4. Update HTML files to use optimized resources
async function updateHTMLFiles() {
    console.log('📄 Updating HTML files...');
    
    const htmlFiles = [
        'index.html',
        'products.html',
        'about.html',
        'contact.html',
        'faqs.html',
        'size-guide.html',
        'terms.html',
        'privacy-policy.html',
        'thank-you.html'
    ];
    
    for (const file of htmlFiles) {
        if (fs.existsSync(file)) {
            try {
                let content = fs.readFileSync(file, 'utf8');
                
                // Update CSS reference
                content = content.replace(
                    /href="assets\/css\/style\.css"/g,
                    'href="assets/css/style.min.css"'
                );
                
                // Update JS reference
                content = content.replace(
                    /src="assets\/js\/script\.js"/g,
                    'src="assets/js/script.min.js"'
                );
                
                // Add preload for critical resources
                if (!content.includes('rel="preload"')) {
                    content = content.replace(
                        /<link rel="stylesheet" href="assets\/css\/style\.min\.css">/,
                        `<link rel="stylesheet" href="assets/css/style.min.css">
    <link rel="preload" href="assets/css/style.min.css" as="style">
    <link rel="preload" href="assets/js/script.min.js" as="script">`
                    );
                }
                
                fs.writeFileSync(file, content);
                console.log(`  ✓ Updated ${file}`);
            } catch (error) {
                console.log(`  ❌ Failed to update ${file}:`, error.message);
            }
        }
    }
}

// 5. Create responsive image sizes
async function createResponsiveImages() {
    console.log('📱 Creating responsive image sizes...');
    try {
        const imagesDir = path.join(__dirname, 'assets', 'images');
        if (fs.existsSync(imagesDir)) {
            await createResponsiveSizes(imagesDir);
            console.log('✅ Responsive images created');
        }
    } catch (error) {
        console.log('❌ Responsive image creation failed:', error.message);
    }
}

async function createResponsiveSizes(dirPath) {
    const files = fs.readdirSync(dirPath);
    
    for (const file of files) {
        const filePath = path.join(dirPath, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
            await createResponsiveSizes(filePath);
        } else if (isImageFile(file)) {
            const baseName = path.basename(file, path.extname(file));
            const ext = path.extname(file);
            const dir = path.dirname(filePath);
            
            // Create different sizes
            const sizes = [
                { suffix: '-small', width: 300 },
                { suffix: '-medium', width: 600 },
                { suffix: '-large', width: 900 }
            ];
            
            for (const size of sizes) {
                const outputPath = path.join(dir, `${baseName}${size.suffix}${ext}`);
                if (!fs.existsSync(outputPath)) {
                    try {
                        await exec(`magick "${filePath}" -resize ${size.width}x "${outputPath}"`);
                        console.log(`  ✓ Created ${size.suffix} version of ${file}`);
                    } catch (error) {
                        // Ignore errors for responsive images
                    }
                }
            }
        }
    }
}

// 6. Generate performance report
async function generatePerformanceReport() {
    console.log('📊 Generating performance report...');
    
    const report = {
        timestamp: new Date().toISOString(),
        optimizations: {
            cssMinified: fs.existsSync('assets/css/style.min.css'),
            jsMinified: fs.existsSync('assets/js/script.min.js'),
            htaccessCreated: fs.existsSync('.htaccess'),
            webpImages: countWebPImages(),
            responsiveImages: countResponsiveImages()
        },
        recommendations: []
    };
    
    // Check for WebP support
    if (!report.optimizations.webpImages) {
        report.recommendations.push('Install ImageMagick to convert images to WebP format');
    }
    
    // Check for responsive images
    if (!report.optimizations.responsiveImages) {
        report.recommendations.push('Create responsive image sizes for better mobile performance');
    }
    
    // Save report
    fs.writeFileSync('performance-report.json', JSON.stringify(report, null, 2));
    console.log('✅ Performance report generated');
    
    return report;
}

function countWebPImages() {
    let count = 0;
    const imagesDir = path.join(__dirname, 'assets', 'images');
    
    if (fs.existsSync(imagesDir)) {
        const files = fs.readdirSync(imagesDir, { recursive: true });
        count = files.filter(file => file.endsWith('.webp')).length;
    }
    
    return count;
}

function countResponsiveImages() {
    let count = 0;
    const imagesDir = path.join(__dirname, 'assets', 'images');
    
    if (fs.existsSync(imagesDir)) {
        const files = fs.readdirSync(imagesDir, { recursive: true });
        count = files.filter(file => file.includes('-small') || file.includes('-medium') || file.includes('-large')).length;
    }
    
    return count;
}

// Main execution
async function main() {
    try {
        await minifyCSS();
        await minifyJS();
        await createWebPImages();
        await updateHTMLFiles();
        await createResponsiveImages();
        await generatePerformanceReport();
        
        console.log('\n🎉 Performance optimization completed!');
        console.log('\n📋 Next steps:');
        console.log('1. Test the website with Google PageSpeed Insights');
        console.log('2. Monitor Core Web Vitals');
        console.log('3. Consider implementing a CDN for better global performance');
        console.log('4. Enable HTTPS for better security and performance');
        
    } catch (error) {
        console.error('❌ Optimization failed:', error.message);
    }
}

main(); 