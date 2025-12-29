import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class S3Service {
  private s3Client: S3Client;
  private bucket: string;
  private region: string;
  private cloudFrontUrl: string;
  private logger: Logger = new Logger('S3Service');

  constructor(private configService: ConfigService) {
    this.region = this.configService.get<string>('AWS_S3_REGION') || 'us-east-1';
    this.bucket = this.configService.get<string>('AWS_S3_BUCKET') || '';
    this.cloudFrontUrl = this.configService.get<string>('CLOUDFRONT_URL') || '';

    this.s3Client = new S3Client({
      region: this.region,
      credentials: {
        accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID') || '',
        secretAccessKey: this.configService.get<string>('AWS_SECRET_ACCESS_KEY') || '',
      },
    });
  }

  /**
   * Upload file to S3
   */
  async uploadFile(
    file: Express.Multer.File,
    folder: string = 'uploads',
    profileId?: string,
  ): Promise<{ key: string; url: string; cdnUrl: string }> {
    try {
      const fileExtension = file.originalname.split('.').pop();
      const fileName = `${uuidv4()}.${fileExtension}`;
      const key = profileId ? `${folder}/${profileId}/${fileName}` : `${folder}/${fileName}`;

      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: 'public-read',
        Metadata: {
          originalName: file.originalname,
          uploadedAt: new Date().toISOString(),
        },
      });

      await this.s3Client.send(command);

      const url = `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`;
      const cdnUrl = this.cloudFrontUrl ? `${this.cloudFrontUrl}/${key}` : url;

      this.logger.log(`File uploaded successfully: ${key}`);

      return { key, url, cdnUrl };
    } catch (error) {
      this.logger.error(`Failed to upload file: ${error.message}`);
      throw new Error(`File upload failed: ${error.message}`);
    }
  }

  /**
   * Upload multiple files to S3
   */
  async uploadMultipleFiles(
    files: Express.Multer.File[],
    folder: string = 'uploads',
    profileId?: string,
  ): Promise<Array<{ key: string; url: string; cdnUrl: string }>> {
    const uploadPromises = files.map((file) => this.uploadFile(file, folder, profileId));
    return Promise.all(uploadPromises);
  }

  /**
   * Delete file from S3
   */
  async deleteFile(key: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      await this.s3Client.send(command);
      this.logger.log(`File deleted successfully: ${key}`);
    } catch (error) {
      this.logger.error(`Failed to delete file: ${error.message}`);
      throw new Error(`File deletion failed: ${error.message}`);
    }
  }

  /**
   * Generate presigned URL for secure file access
   */
  async getPresignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      const url = await getSignedUrl(this.s3Client, command, { expiresIn });
      return url;
    } catch (error) {
      this.logger.error(`Failed to generate presigned URL: ${error.message}`);
      throw new Error(`Presigned URL generation failed: ${error.message}`);
    }
  }

  /**
   * Generate presigned URL for upload (client-side upload)
   */
  async getPresignedUploadUrl(
    fileName: string,
    contentType: string,
    folder: string = 'uploads',
    profileId?: string,
  ): Promise<{ uploadUrl: string; key: string; cdnUrl: string }> {
    try {
      const fileExtension = fileName.split('.').pop();
      const uniqueFileName = `${uuidv4()}.${fileExtension}`;
      const key = profileId
        ? `${folder}/${profileId}/${uniqueFileName}`
        : `${folder}/${uniqueFileName}`;

      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        ContentType: contentType,
        ACL: 'public-read',
      });

      const uploadUrl = await getSignedUrl(this.s3Client, command, { expiresIn: 3600 });
      const cdnUrl = this.cloudFrontUrl
        ? `${this.cloudFrontUrl}/${key}`
        : `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`;

      return { uploadUrl, key, cdnUrl };
    } catch (error) {
      this.logger.error(`Failed to generate presigned upload URL: ${error.message}`);
      throw new Error(`Presigned upload URL generation failed: ${error.message}`);
    }
  }

  /**
   * Get file metadata
   */
  getFileMetadata(file: Express.Multer.File) {
    return {
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      encoding: file.encoding,
    };
  }

  /**
   * Validate file type
   */
  validateFileType(file: Express.Multer.File, allowedTypes: string[]): boolean {
    return allowedTypes.includes(file.mimetype);
  }

  /**
   * Validate file size
   */
  validateFileSize(file: Express.Multer.File, maxSize: number): boolean {
    return file.size <= maxSize;
  }
}

