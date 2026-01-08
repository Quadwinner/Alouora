import fs from 'fs';
import path from 'path';
import https from 'https';

const images = [
  { url: 'https://www.figma.com/api/mcp/asset/138f33b0-2209-4a97-8a20-b310fbaa7697', name: 'profile-avatar.png' },
  { url: 'https://www.figma.com/api/mcp/asset/2f8f1e91-d6f5-4294-b1d6-0ca36883be6d', name: 'order-product-1.png' },
  { url: 'https://www.figma.com/api/mcp/asset/2584b612-3fad-470c-aa71-991bdc92a226', name: 'order-product-2.png' },
  { url: 'https://www.figma.com/api/mcp/asset/4632eba5-7f3d-4184-be74-b67bee9af4d0', name: 'order-product-3.png' },
  { url: 'https://www.figma.com/api/mcp/asset/c728217a-bebf-4b0d-8f00-a4d919ab1238', name: 'icon-logout.svg' },
  { url: 'https://www.figma.com/api/mcp/asset/15d1ae91-16d7-4c92-887e-d9ae6c615a38', name: 'icon-wallet.svg' },
  { url: 'https://www.figma.com/api/mcp/asset/91c00413-7a65-4851-9f42-698e9881f06e', name: 'icon-profile.svg' },
  { url: 'https://www.figma.com/api/mcp/asset/d4d5aa11-eb06-4e0c-a5fe-9f2707731381', name: 'icon-orders.svg' },
  { url: 'https://www.figma.com/api/mcp/asset/77488a6e-bab3-4ce9-9ebe-3eb22ded98dc', name: 'icon-search.svg' },
  { url: 'https://www.figma.com/api/mcp/asset/d34fea26-b6b8-4554-a3db-3cf126307249', name: 'icon-heart.svg' },
  { url: 'https://www.figma.com/api/mcp/asset/a36f5704-de21-4871-a51c-6a8700f7af3f', name: 'icon-cart.svg' },
  { url: 'https://www.figma.com/api/mcp/asset/d8a0c229-009e-4ea4-b213-51e37d7d705a', name: 'icon-chevron-right.svg' },
  { url: 'https://www.figma.com/api/mcp/asset/0f908e8f-b738-4b52-8189-dd772bf7edda', name: 'icon-all-orders.svg' },
  { url: 'https://www.figma.com/api/mcp/asset/b2eb2155-1406-4105-b86e-c3a720306450', name: 'icon-on-the-way.svg' },
  { url: 'https://www.figma.com/api/mcp/asset/04f3c7ed-e390-46a6-a40e-b009998810cd', name: 'icon-delivered.svg' },
  { url: 'https://www.figma.com/api/mcp/asset/e583cb0f-0552-4bd7-8dfd-b6b434e985cb', name: 'icon-cancelled.svg' },
  { url: 'https://www.figma.com/api/mcp/asset/df0b8aae-c6e0-4274-bee9-9c2649b823d8', name: 'icon-returned.svg' },
  { url: 'https://www.figma.com/api/mcp/asset/b5383ecd-e984-43c6-bd19-ff0b0a400d28', name: 'icon-dropdown.svg' },
  { url: 'https://www.figma.com/api/mcp/asset/292fab5a-96ce-4089-9ecc-68b812632667', name: 'icon-arrow-right.svg' },
];

const outputDir = './public/images/account';

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

async function downloadImage(url, filename) {
  return new Promise((resolve, reject) => {
    const filePath = path.join(outputDir, filename);
    const file = fs.createWriteStream(filePath);
    
    https.get(url, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        https.get(response.headers.location, (redirectResponse) => {
          redirectResponse.pipe(file);
          file.on('finish', () => {
            file.close();
            console.log(`Downloaded: ${filename}`);
            resolve();
          });
        }).on('error', reject);
      } else {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          console.log(`Downloaded: ${filename}`);
          resolve();
        });
      }
    }).on('error', reject);
  });
}

async function downloadAll() {
  for (const img of images) {
    try {
      await downloadImage(img.url, img.name);
    } catch (err) {
      console.error(`Failed to download ${img.name}:`, err.message);
    }
  }
  console.log('All downloads complete!');
}

downloadAll();
