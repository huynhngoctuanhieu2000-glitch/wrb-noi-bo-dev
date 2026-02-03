import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { extract } from 'tar'; // Not needed, just standard imports

// Mapping of External URL -> Internal Path (relative to public/)
const IMAGE_MAP = [
    // Payment
    { url: "https://i.ibb.co/TBwg0YzD/hinhtien-500.jpg", dest: "assets/payment/vnd-500k.webp" },
    { url: "https://i.ibb.co/XrfsFGHN/anh-tien-200.jpg", dest: "assets/payment/vnd-200k.webp" },
    { url: "https://i.postimg.cc/4KZtCLNR/to-tien-100.webp", dest: "assets/payment/vnd-100k.webp" },
    { url: "https://i.ibb.co/pjD5WCXq/anh-tien-50k.jpg", dest: "assets/payment/vnd-50k.webp" },
    { url: "https://i.ibb.co/C5Sf0tVH/anh-tien-20k-scaled.jpg", dest: "assets/payment/vnd-20k.webp" },
    { url: "https://i.ibb.co/BHKnkNc4/anh-tien-10k.jpg", dest: "assets/payment/vnd-10k.webp" },
    { url: "https://i.ibb.co/7JgHCSNj/ng-b-c-5000-ng.webp", dest: "assets/payment/vnd-5k.webp" },
    { url: "https://i.ibb.co/1JrQhVF5/he.webp", dest: "assets/payment/usd-info.webp" },
    { url: "https://i.ibb.co/60xFhR8f/visa.webp", dest: "assets/payment/visa.webp" },
    { url: "https://i.ibb.co/9kc9jrDQ/martercard.webp", dest: "assets/payment/mastercard.webp" },
    { url: "https://i.ibb.co/Vb8Nt0X/1200px-Union-Pay-logo-svg.png", dest: "assets/payment/unionpay.webp" },
    { url: "https://i.ibb.co/BHbLqLdr/apple-pay.png", dest: "assets/payment/apple-pay.webp" },
    { url: "https://i.ibb.co/Xkxv6kH6/JCB-logo-svg.webp", dest: "assets/payment/jcb.webp" },
    { url: "https://i.ibb.co/21QSXKtS/Google-Pay-Logo-svg.webp", dest: "assets/payment/google-pay.webp" },
    { url: "https://i.ibb.co/rK4Pm8gG/samsungpay.webp", dest: "assets/payment/samsung-pay.webp" },

    // Icons
    { url: "https://i.ibb.co/3yZbCj1Z/icon-body-150x150px.webp", dest: "assets/icons/body.webp" },
    { url: "https://i.ibb.co/bRKN60Tv/icon-foot-150x150-px.webp", dest: "assets/icons/foot.webp" },
    { url: "https://i.ibb.co/d47f0CxD/icon-hairwash-150x150px.webp", dest: "assets/icons/hairwash.webp" },
    { url: "https://i.ibb.co/xxjHXk7/icon-facial-150x150px.webp", dest: "assets/icons/facial.webp" },
    { url: "https://i.ibb.co/W4sc6ngT/icon-heelskinshave-150x150px.webp", dest: "assets/icons/heelskinshave.webp" },
    { url: "https://i.ibb.co/dwnwS8Jz/icon-nails-150x150px.webp", dest: "assets/icons/nails.webp" },
    { url: "https://i.ibb.co/fVpNcJFG/icon-earclean-150x150px.webp", dest: "assets/icons/earclean.webp" },
    { url: "https://i.ibb.co/Q3GPkbtr/icon-haircut-150x150px.webp", dest: "assets/icons/haircut.webp" },
    { url: "https://i.ibb.co/9kDZJ072/icon-cbking-150-x-150-px.webp", dest: "assets/icons/combo-king.webp" },
    { url: "https://i.ibb.co/ynvbRJBM/addd.png", dest: "assets/icons/add-more.webp" },
    { url: "https://i.ibb.co/p6bqd0Zg/icon-hi-nh-ng-i.webp", dest: "assets/icons/body-map.webp" },

    // Logos
    { url: "https://i.postimg.cc/3J8zBRVz/logo-500x500px-(maltic-gold)-1.png", dest: "assets/logos/logo-gold.webp" },
    { url: "https://i.postimg.cc/g0CM57Zz/sach-standard-500x500px.png", dest: "assets/logos/menu-standard.webp" },
    { url: "https://i.postimg.cc/MKQCpyzy/sach-premium-500x500px.png", dest: "assets/logos/menu-premium.webp" },
    { url: "https://i.postimg.cc/4xDZ4cxg/only-logo-500x500px-(maltic-gold).png", dest: "assets/logos/logo-only-gold.webp" },

    // Backgrounds
    { url: "https://i.postimg.cc/K8mxt9QM/galaxy2.png", dest: "assets/backgrounds/galaxy.webp" },
    { url: "https://i.postimg.cc/hPx71PLs/Gemini-Generated-Image-psjknhpsjknhpsjk.png", dest: "assets/backgrounds/bg-blur.webp" },

    // Flags
    { url: "https://flagcdn.com/w80/gb.png", dest: "assets/flags/gb.webp" },
    { url: "https://flagcdn.com/w80/vn.png", dest: "assets/flags/vn.webp" },
    { url: "https://flagcdn.com/w80/jp.png", dest: "assets/flags/jp.webp" },
    { url: "https://flagcdn.com/w80/kr.png", dest: "assets/flags/kr.webp" },
    { url: "https://flagcdn.com/w80/cn.png", dest: "assets/flags/cn.webp" },
];

const PUBLIC_DIR = path.join(process.cwd(), 'public');

async function migrate() {
    console.log('🚀 Starting Image Migration to WebP...');

    // Ensure all directories exist
    const dirs = new Set(IMAGE_MAP.map(item => path.dirname(path.join(PUBLIC_DIR, item.dest))));
    dirs.forEach(dir => {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
            console.log(`📁 Created directory: ${dir}`);
        }
    });

    let successCount = 0;
    let failCount = 0;

    for (const item of IMAGE_MAP) {
        try {
            console.log(`⬇️  Downloading: ${item.url}`);

            const response = await fetch(item.url);
            if (!response.ok) throw new Error(`Failed to fetch ${item.url}: ${response.statusText}`);

            const arrayBuffer = await response.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

            const destPath = path.join(PUBLIC_DIR, item.dest);

            // Convert to WebP and save
            await sharp(buffer)
                .webp({ quality: 90 })
                .toFile(destPath);

            console.log(`✅ Saved to: ${item.dest}`);
            successCount++;
        } catch (error) {
            console.error(`❌ Error processing ${item.url}:`, error.message);
            failCount++;
        }
    }

    console.log(`\n🎉 Migration Complete! Success: ${successCount}, Failed: ${failCount}`);
}

migrate();
