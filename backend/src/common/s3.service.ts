import { Injectable, Logger } from '@nestjs/common';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class S3Service {
    private readonly logger = new Logger(S3Service.name);
    private s3Client?: S3Client;
    private bucketName: string;
    private isLocal: boolean = false;
    private uploadDir: string;

    constructor(private configService: ConfigService) {
        const region = this.configService.get<string>('AWS_REGION') || 'ap-south-1';
        this.bucketName = this.configService.get<string>('AWS_S3_BUCKET_NAME') || '';
        const accessKeyId = this.configService.get<string>('AWS_ACCESS_KEY_ID');
        const secretAccessKey = this.configService.get<string>('AWS_SECRET_ACCESS_KEY');
        const nodeEnv = this.configService.get<string>('NODE_ENV') || 'development';

        this.uploadDir = path.join(process.cwd(), 'uploads');
        fs.mkdirSync(this.uploadDir, { recursive: true });

        // In local development, NEVER upload to or delete from live production S3
        if (nodeEnv !== 'production' || !accessKeyId || !secretAccessKey || !this.bucketName) {
            this.isLocal = true;
            this.logger.log(`Local development storage active (uploads saved to: ${this.uploadDir})`);
        } else {
            this.s3Client = new S3Client({
                region,
                credentials: {
                    accessKeyId,
                    secretAccessKey,
                },
            });
            this.logger.log(`AWS S3 storage active with bucket: ${this.bucketName}`);
        }
    }

    async uploadFile(file: Express.Multer.File, folder: string = 'general'): Promise<{ url: string; key: string }> {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = file.originalname.split('.').pop();
        const filename = `${folder}/${uniqueSuffix}.${ext}`;

        if (this.isLocal || !this.s3Client) {
            const folderPath = path.join(this.uploadDir, folder);
            fs.mkdirSync(folderPath, { recursive: true });
            const filePath = path.join(this.uploadDir, filename);
            fs.writeFileSync(filePath, file.buffer);
            return { url: `/uploads/${filename}`, key: filename };
        }

        const command = new PutObjectCommand({
            Bucket: this.bucketName,
            Key: filename,
            Body: file.buffer,
            ContentType: file.mimetype,
        });

        await this.s3Client.send(command);

        const region = this.configService.get<string>('AWS_REGION') || 'ap-south-1';
        const url = `https://${this.bucketName}.s3.${region}.amazonaws.com/${filename}`;

        return { url, key: filename };
    }

    async deleteFile(fileUrlOrKey: string): Promise<void> {
        try {
            if (this.isLocal || !this.s3Client) {
                let localRel = fileUrlOrKey;
                if (localRel.startsWith('/uploads/')) {
                    localRel = localRel.replace('/uploads/', '');
                } else if (localRel.startsWith('uploads/')) {
                    localRel = localRel.replace('uploads/', '');
                }
                const localPath = path.join(this.uploadDir, localRel);
                if (fs.existsSync(localPath)) {
                    fs.unlinkSync(localPath);
                }
                return;
            }

            let key = fileUrlOrKey;
            if (fileUrlOrKey.startsWith('http')) {
                const urlObj = new URL(fileUrlOrKey);
                key = urlObj.pathname.startsWith('/') ? urlObj.pathname.substring(1) : urlObj.pathname;
            }

            const command = new DeleteObjectCommand({
                Bucket: this.bucketName,
                Key: key,
            });

            await this.s3Client.send(command);
        } catch (error) {
            this.logger.error('Error deleting file:', error);
        }
    }
}