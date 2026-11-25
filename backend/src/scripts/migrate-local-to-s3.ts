import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import * as fs from 'fs';
import * as path from 'path';

// Manual .env loader so the script works independently
function loadEnv() {
  const envPath = path.join(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    content.split('\n').forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx !== -1) {
        const key = trimmed.slice(0, eqIdx).trim();
        const val = trimmed.slice(eqIdx + 1).trim().replace(/^['"]|['"]$/g, '');
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    });
  }
}

loadEnv();

const MIME_TYPES: Record<string, string> = {
  '.pdf': 'application/pdf',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.doc': 'application/msword',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  '.xls': 'application/vnd.ms-excel',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.mov': 'video/quicktime',
  '.mkv': 'video/x-matroska',
  '.avi': 'video/x-msvideo',
  '.json': 'application/json',
  '.txt': 'text/plain',
};

function getMimeType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  return MIME_TYPES[ext] || 'application/octet-stream';
}

function getAllFiles(dir: string, baseDir: string = dir): { absolute: string; relative: string }[] {
  let results: { absolute: string; relative: string }[] = [];
  if (!fs.existsSync(dir)) return results;

  const list = fs.readdirSync(dir);
  for (const file of list) {
    if (file === '.gitkeep') continue;
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getAllFiles(fullPath, baseDir));
    } else {
      const rel = path.relative(baseDir, fullPath).replace(/\\/g, '/');
      results.push({ absolute: fullPath, relative: rel });
    }
  }
  return results;
}

async function migrate() {
  const bucketName = process.env.AWS_S3_BUCKET_NAME || 'gramguru';
  const region = process.env.AWS_REGION || 'ap-south-1';
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

  console.log('====================================================');
  console.log('🚀 GramGuru AWS S3 Migration Script');
  console.log(`Bucket : ${bucketName}`);
  console.log(`Region : ${region}`);
  console.log('====================================================\n');

  if (
    !accessKeyId ||
    !secretAccessKey ||
    accessKeyId === 'your_access_key_id_here' ||
    secretAccessKey === 'your_secret_access_key_here'
  ) {
    console.error('❌ ERROR: Missing real AWS credentials in backend/.env!');
    console.error('Please configure valid AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY in backend/.env before running this script.\n');
    process.exit(1);
  }

  const clientConfig: any = { region };
  if (accessKeyId && secretAccessKey) {
    clientConfig.credentials = {
      accessKeyId,
      secretAccessKey,
    };
  }

  const s3 = new S3Client(clientConfig);
  const uploadsDir = path.join(process.cwd(), 'uploads');

  if (!fs.existsSync(uploadsDir)) {
    console.log(`No uploads folder found at: ${uploadsDir}`);
    return;
  }

  const files = getAllFiles(uploadsDir);
  console.log(`Found ${files.length} file(s) in local uploads directory to migrate:\n`);

  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < files.length; i++) {
    const { absolute, relative } = files[i];
    const mimeType = getMimeType(absolute);
    const fileBuffer = fs.readFileSync(absolute);
    const fileSizeMB = (fileBuffer.length / (1024 * 1024)).toFixed(2);

    // Primary S3 Key (e.g., notes/note_xyz.pdf, courses/abc.xlsx, or root filename)
    const s3Key = relative;

    console.log(`[${i + 1}/${files.length}] Uploading: ${relative} (${fileSizeMB} MB, ${mimeType})`);

    try {
      const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: s3Key,
        Body: fileBuffer,
        ContentType: mimeType,
      });

      await s3.send(command);
      console.log(`  ✓ Uploaded -> s3://${bucketName}/${s3Key}`);

      // If the file is in root uploads and starts with attachment_, also ensure it exists under attachments/
      if (!relative.includes('/') && relative.startsWith('attachment_')) {
        const attachKey = `attachments/${relative}`;
        await s3.send(new PutObjectCommand({
          Bucket: bucketName,
          Key: attachKey,
          Body: fileBuffer,
          ContentType: mimeType,
        }));
        console.log(`  ✓ Also mirrored -> s3://${bucketName}/${attachKey}`);
      }

      // If the file is a root image/thumbnail, mirror under thumbnails/ as well for complete fallback safety
      if (!relative.includes('/') && (relative.startsWith('thumb_') || mimeType.startsWith('image/'))) {
        const thumbKey = `thumbnails/${relative}`;
        await s3.send(new PutObjectCommand({
          Bucket: bucketName,
          Key: thumbKey,
          Body: fileBuffer,
          ContentType: mimeType,
        }));
        console.log(`  ✓ Also mirrored -> s3://${bucketName}/${thumbKey}`);
      }

      successCount++;
    } catch (err: any) {
      failCount++;
      console.error(`  ✗ Failed to upload ${relative}: ${err?.message || err}`);
    }
  }

  console.log('\n====================================================');
  console.log(`✅ Migration Summary:`);
  console.log(`   Total files processed: ${files.length}`);
  console.log(`   Successfully uploaded: ${successCount}`);
  console.log(`   Failed               : ${failCount}`);
  console.log('====================================================\n');
}

migrate().catch((err) => {
  console.error('Migration error:', err);
  process.exit(1);
});
