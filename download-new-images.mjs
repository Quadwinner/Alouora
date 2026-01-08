import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const IMAGES_DIR = path.join(__dirname, 'public/images/homepage');

// Ensure directory exists
if (!fs.existsSync(IMAGES_DIR)) {
  fs.mkdirSync(IMAGES_DIR, { recursive: true });
}

const images = [
  // Brand Deal Banners
  { url: 'https://www.figma.com/api/mcp/asset/f94a0337-1574-4115-ad3f-4a8e635ba0ee', name: 'brand-deal-1.png' },
  { url: 'https://www.figma.com/api/mcp/asset/484b9a90-6bb7-451f-9496-ddd417fd9a81', name: 'brand-deal-2.png' },
  { url: 'https://www.figma.com/api/mcp/asset/b70d84ba-c23a-4d67-bca9-581709effb92', name: 'brand-badge.png' },
  { url: 'https://www.figma.com/api/mcp/asset/6657f64d-5ba8-427c-ade2-a433ed57c085', name: 'brand-badge-2.png' },
  
  // Fragrance Category
  { url: 'https://www.figma.com/api/mcp/asset/6f8ba28b-52e3-41cb-9706-769b1dac2247', name: 'fragrance-everyday.png' },
  { url: 'https://www.figma.com/api/mcp/asset/c3cf8150-41d2-4c6a-a23c-78f68b71b391', name: 'fragrance-under-999.png' },
  { url: 'https://www.figma.com/api/mcp/asset/ef50c47a-c6cf-4799-9d5b-7ba3752375eb', name: 'fragrance-premium.png' },
  { url: 'https://www.figma.com/api/mcp/asset/cee2cbcf-a9bb-4b0b-a32a-d3deeca45165', name: 'fragrance-body-mists.png' },
  { url: 'https://www.figma.com/api/mcp/asset/e24cf7f5-9b73-4f8e-b543-f882d8279075', name: 'fragrance-festive.png' },
  
  // Popular This Season
  { url: 'https://www.figma.com/api/mcp/asset/6d3bea6b-e587-4372-9939-94e286560778', name: 'popular-1.png' },
  { url: 'https://www.figma.com/api/mcp/asset/1cc887f8-0884-4da5-8382-bd3127d60691', name: 'popular-2.png' },
  { url: 'https://www.figma.com/api/mcp/asset/9f20f918-29d0-4320-beac-0d65f6f7bed7', name: 'popular-3.png' },
  { url: 'https://www.figma.com/api/mcp/asset/a8cb421f-3617-41cd-8979-05bdca5e2b88', name: 'popular-4.png' },
  { url: 'https://www.figma.com/api/mcp/asset/9c503090-9780-4334-801c-b3a6d88eb4fb', name: 'popular-5.png' },
  { url: 'https://www.figma.com/api/mcp/asset/b0af01c2-dda7-46fa-9150-65f2b4780825', name: 'popular-6.png' },
  
  // Gifting Corner
  { url: 'https://www.figma.com/api/mcp/asset/b7f6e69d-c435-48b6-b137-83522f8567cf', name: 'gift-store.png' },
  { url: 'https://www.figma.com/api/mcp/asset/9f46c3d8-aa44-4365-9276-77aacfd56579', name: 'gift-cards.png' },
  
  // Luxury Brands
  { url: 'https://www.figma.com/api/mcp/asset/20e26acb-8b06-4178-b1c8-2789a7cb72ac', name: 'brand-mac.png' },
  { url: 'https://www.figma.com/api/mcp/asset/5871a0b2-6d38-49e9-9dab-418f78d1d193', name: 'brand-dior.png' },
  { url: 'https://www.figma.com/api/mcp/asset/2f9e8992-ef07-40b7-854b-65fd312284fe', name: 'brand-carolina-herrera.png' },
  { url: 'https://www.figma.com/api/mcp/asset/be2c1ed5-830a-413d-949a-9251a52f1ced', name: 'brand-eucerin-luxe.png' },
  { url: 'https://www.figma.com/api/mcp/asset/c81dcd02-9695-46c2-a5b0-4c459a1c209c', name: 'brand-caudalie.png' },
  
  // Nav Arrow
  { url: 'https://www.figma.com/api/mcp/asset/29204942-d5a6-45a0-9ac0-32dc6e37202a', name: 'nav-arrow.svg' },
];

function downloadImage(url, filename) {
  return new Promise((resolve, reject) => {
    const filepath = path.join(IMAGES_DIR, filename);
    
    // Skip if file already exists
    if (fs.existsSync(filepath)) {
      console.log(`✓ Already exists: ${filename}`);
      resolve(filepath);
      return;
    }

    console.log(`Downloading: ${filename}...`);
    
    const file = fs.createWriteStream(filepath);
    
    const request = https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    }, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        // Handle redirect
        https.get(response.headers.location, (redirectResponse) => {
          redirectResponse.pipe(file);
          file.on('finish', () => {
            file.close();
            console.log(`✓ Downloaded: ${filename}`);
            resolve(filepath);
          });
        }).on('error', reject);
        return;
      }
      
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log(`✓ Downloaded: ${filename}`);
        resolve(filepath);
      });
    }).on('error', (err) => {
      fs.unlink(filepath, () => {});
      reject(err);
    });
    
    request.setTimeout(30000, () => {
      request.destroy();
      reject(new Error(`Timeout downloading ${filename}`));
    });
  });
}

async function downloadAll() {
  console.log('Starting image downloads...\n');
  
  for (const image of images) {
    try {
      await downloadImage(image.url, image.name);
    } catch (error) {
      console.error(`✗ Failed: ${image.name} - ${error.message}`);
    }
  }
  
  console.log('\n✓ Download complete!');
}

downloadAll();
