const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// Check if ImageMagick is installed
function checkImageMagick() {
    return new Promise((resolve) => {
        exec('magick --version', (error) => {
            if (error) {
                console.log('ImageMagick not found. Please install ImageMagick to convert images to WebP.');
                console.log('Download from: https://imagemagick.org/script/download.php');
                resolve(false);
            } else {
                resolve(true);
            }
        });
    });
}

// Convert image to WebP
function convertToWebP(inputPath, outputPath) {
    return new Promise((resolve, reject) => {
        exec(`magick "${inputPath}" -quality 85 "${outputPath}"`, (error) => {
            if (error) {
                reject(error);
            } else {
                resolve();
            }
        });
    });
}

// Process all images in a directory
async function processDirectory(dirPath) {
    const files = fs.readdirSync(dirPath);
    
    for (const file of files) {
        const filePath = path.join(dirPath, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
            await processDirectory(filePath);
        } else if (isImageFile(file)) {
            const webpPath = filePath.replace(/\.(jpg|jpeg|png)$/i, '.webp');
            
            if (!fs.existsSync(webpPath)) {
                try {
                    console.log(`Converting ${file} to WebP...`);
                    await convertToWebP(filePath, webpPath);
                    console.log(`✓ Converted ${file} to WebP`);
                } catch (error) {
                    console.error(`✗ Failed to convert ${file}:`, error.message);
                }
            } else {
                console.log(`WebP version already exists for ${file}`);
            }
        }
    }
}

function isImageFile(filename) {
    const imageExtensions = ['.jpg', '.jpeg', '.png'];
    const ext = path.extname(filename).toLowerCase();
    return imageExtensions.includes(ext);
}

// Main function
async function main() {
    const hasImageMagick = await checkImageMagick();
    
    if (!hasImageMagick) {
        return;
    }
    
    const imagesDir = path.join(__dirname, 'assets', 'images');
    
    if (fs.existsSync(imagesDir)) {
        console.log('Starting WebP conversion...');
        await processDirectory(imagesDir);
        console.log('WebP conversion completed!');
    } else {
        console.log('Images directory not found.');
    }
}

main().catch(console.error); 