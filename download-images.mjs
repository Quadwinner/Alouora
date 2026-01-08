import fs from 'fs';
import https from 'https';
import path from 'path';

const images = {
  'extra20.png': 'https://www.figma.com/api/mcp/asset/14a7180b-8364-40b8-8006-c2255654a458',
  'eucerin-banner.png': 'https://www.figma.com/api/mcp/asset/c7f6ba51-e855-4855-a177-1072f91fd855',
  'eucerin-1.png': 'https://www.figma.com/api/mcp/asset/1626d33e-0c78-4cff-81fa-51f7d80a2bb4',
  'eucerin-2.png': 'https://www.figma.com/api/mcp/asset/6908faf0-c3ee-4c2d-bbee-0e526fd165d9',
  'eucerin-3.png': 'https://www.figma.com/api/mcp/asset/c11abcd9-5371-4e59-8ffd-48d97e256738',
  'eucerin-4.png': 'https://www.figma.com/api/mcp/asset/82974f82-c5f6-4a2b-b401-49155b6d6b3e',
  'eucerin-5.png': 'https://www.figma.com/api/mcp/asset/6fe6fe4c-37fa-4083-824b-e5459cfc64c4',
  'unwrap-header.png': 'https://www.figma.com/api/mcp/asset/273e5fde-12f5-48d1-b8e1-d61794c2b7ec',
  'ticker-mirror-sale.png': 'https://www.figma.com/api/mcp/asset/cd0f7a34-09fb-42d9-a12e-0c3c95bcf8d4',
  'unwrap-header-2.png': 'https://www.figma.com/api/mcp/asset/87370603-bcd3-4dd8-af38-c3b4bf854031',
  'hero-image.png': 'https://www.figma.com/api/mcp/asset/c33d955e-ad8e-491f-a233-b1366af7947b',
  'arrow-right.svg': 'https://www.figma.com/api/mcp/asset/24d772ee-c541-4b53-9115-d2df55bc4557',
};

const downloadDir = './public/images/homepage';

if (!fs.existsSync(downloadDir)) {
  fs.mkdirSync(downloadDir, { recursive: true });
}

async function downloadImage(filename, url) {
  return new Promise((resolve, reject) => {
    const filepath = path.join(downloadDir, filename);
    const file = fs.createWriteStream(filepath);

    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log(`✓ Downloaded: ${filename}`);
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(filepath, () => {}); // Delete the file if error
      reject(err);
    });
  });
}

async function downloadAll() {
  console.log('Starting image downloads...\n');
  try {
    for (const [filename, url] of Object.entries(images)) {
      await downloadImage(filename, url);
    }
    console.log('\n✓ All images downloaded successfully!');
  } catch (error) {
    console.error('Error downloading images:', error);
  }
}

downloadAll();
