import { Injectable, BadRequestException, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Service } from './s3.service';
import { DATABASE_CONNECTION } from '@/database/database.module';
import { mediaUploads } from '@/database/schema';
import * as sharp from 'sharp';

@Injectable()
export class UploadService {
  private readonly maxFileSize: number;
  private readonly allowedImageTypes: string[];
  private readonly allowedVideoTypes: string[];
  private readonly allowedDocumentTypes: string[];

  constructor(
    @Inject(DATABASE_CONNECTION) private db: any,
    private s3Service: S3Service,
    private configService: ConfigService,
  ) {
    this.maxFileSize = parseInt(this.configService.get<string>('MAX_FILE_SIZE') || '10485760'); // 10MB
    this.allowedImageTypes = this.configService
      .get<string>('ALLOWED_IMAGE_TYPES')
      ?.split(',') || ['image/jpeg', 'image/png', 'image/webp'];
    this.allowedVideoTypes = this.configService
      .get<string>('ALLOWED_VIDEO_TYPES')
      ?.split(',') || ['video/mp4', 'video/webm'];
    this.allowedDocumentTypes = this.configService
      .get<string>('ALLOWED_DOCUMENT_TYPES')
      ?.split(',') || ['application/pdf'];
  }

  /**
   * Upload profile photo
   */
  async uploadProfilePhoto(file: Express.Multer.File, profileId: string) {
    // Validate
    this.validateImage(file);

    // Optimize image
    const optimizedBuffer = await this.optimizeImage(file.buffer, 800, 800);
    const optimizedFile = { ...file, buffer: optimizedBuffer };

    // Upload to S3
    const result = await this.s3Service.uploadFile(optimizedFile, 'profiles/photos', profileId);

    // Save to database
    const [upload] = await this.db
      .insert(mediaUploads)
      .values({
        uploaderId: profileId,
        fileName: file.originalname,
        fileSize: optimizedBuffer.length,
        mimeType: file.mimetype,
        fileUrl: result.url,
        cdnUrl: result.cdnUrl,
        s3Bucket: this.configService.get<string>('AWS_S3_BUCKET'),
        s3Key: result.key,
        entityType: 'profile_photo',
        entityId: profileId,
      })
      .returning();

    return {
      id: upload.id,
      url: result.cdnUrl,
      key: result.key,
    };
  }

  /**
   * Upload cover photo
   */
  async uploadCoverPhoto(file: Express.Multer.File, profileId: string) {
    this.validateImage(file);

    const optimizedBuffer = await this.optimizeImage(file.buffer, 1920, 1080);
    const optimizedFile = { ...file, buffer: optimizedBuffer };

    const result = await this.s3Service.uploadFile(optimizedFile, 'profiles/covers', profileId);

    const [upload] = await this.db
      .insert(mediaUploads)
      .values({
        uploaderId: profileId,
        fileName: file.originalname,
        fileSize: optimizedBuffer.length,
        mimeType: file.mimetype,
        fileUrl: result.url,
        cdnUrl: result.cdnUrl,
        s3Bucket: this.configService.get<string>('AWS_S3_BUCKET'),
        s3Key: result.key,
        entityType: 'cover_photo',
        entityId: profileId,
      })
      .returning();

    return {
      id: upload.id,
      url: result.cdnUrl,
      key: result.key,
    };
  }

  /**
   * Upload post media (images/videos)
   */
  async uploadPostMedia(files: Express.Multer.File[], profileId: string, postId?: string) {
    const uploadedFiles = [];

    for (const file of files) {
      if (this.allowedImageTypes.includes(file.mimetype)) {
        const optimizedBuffer = await this.optimizeImage(file.buffer, 1200, 1200);
        const optimizedFile = { ...file, buffer: optimizedBuffer };
        const result = await this.s3Service.uploadFile(optimizedFile, 'posts/media', profileId);

        const [upload] = await this.db
          .insert(mediaUploads)
          .values({
            uploaderId: profileId,
            fileName: file.originalname,
            fileSize: optimizedBuffer.length,
            mimeType: file.mimetype,
            fileUrl: result.url,
            cdnUrl: result.cdnUrl,
            s3Bucket: this.configService.get<string>('AWS_S3_BUCKET'),
            s3Key: result.key,
            entityType: 'post_media',
            entityId: postId,
          })
          .returning();

        uploadedFiles.push({
          id: upload.id,
          url: result.cdnUrl,
          type: 'image',
        });
      } else if (this.allowedVideoTypes.includes(file.mimetype)) {
        this.validateVideo(file);
        const result = await this.s3Service.uploadFile(file, 'posts/media', profileId);

        const [upload] = await this.db
          .insert(mediaUploads)
          .values({
            uploaderId: profileId,
            fileName: file.originalname,
            fileSize: file.size,
            mimeType: file.mimetype,
            fileUrl: result.url,
            cdnUrl: result.cdnUrl,
            s3Bucket: this.configService.get<string>('AWS_S3_BUCKET'),
            s3Key: result.key,
            entityType: 'post_media',
            entityId: postId,
          })
          .returning();

        uploadedFiles.push({
          id: upload.id,
          url: result.cdnUrl,
          type: 'video',
        });
      }
    }

    return uploadedFiles;
  }

  /**
   * Upload document
   */
  async uploadDocument(file: Express.Multer.File, profileId: string, entityType?: string) {
    this.validateDocument(file);

    const result = await this.s3Service.uploadFile(file, 'documents', profileId);

    const [upload] = await this.db
      .insert(mediaUploads)
      .values({
        uploaderId: profileId,
        fileName: file.originalname,
        fileSize: file.size,
        mimeType: file.mimetype,
        fileUrl: result.url,
        cdnUrl: result.cdnUrl,
        s3Bucket: this.configService.get<string>('AWS_S3_BUCKET'),
        s3Key: result.key,
        entityType: entityType || 'document',
      })
      .returning();

    return {
      id: upload.id,
      url: result.cdnUrl,
      fileName: file.originalname,
    };
  }

  /**
   * Delete file
   */
  async deleteFile(uploadId: string, profileId: string) {
    const upload = await this.db.query.mediaUploads.findFirst({
      where: (mediaUploads, { eq, and }) =>
        and(eq(mediaUploads.id, uploadId), eq(mediaUploads.uploaderId, profileId)),
    });

    if (!upload) {
      throw new BadRequestException('File not found');
    }

    await this.s3Service.deleteFile(upload.s3Key);

    await this.db
      .update(mediaUploads)
      .set({ deletedAt: new Date() })
      .where((mediaUploads, { eq }) => eq(mediaUploads.id, uploadId));

    return { success: true };
  }

  /**
   * Optimize image using Sharp
   */
  private async optimizeImage(
    buffer: Buffer,
    maxWidth: number,
    maxHeight: number,
  ): Promise<Buffer> {
    return sharp(buffer)
      .resize(maxWidth, maxHeight, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({ quality: 85 })
      .toBuffer();
  }

  /**
   * Validate image file
   */
  private validateImage(file: Express.Multer.File) {
    if (!this.s3Service.validateFileType(file, this.allowedImageTypes)) {
      throw new BadRequestException(
        `Invalid image type. Allowed types: ${this.allowedImageTypes.join(', ')}`,
      );
    }

    if (!this.s3Service.validateFileSize(file, this.maxFileSize)) {
      throw new BadRequestException(
        `File size exceeds maximum allowed size of ${this.maxFileSize / 1024 / 1024}MB`,
      );
    }
  }

  /**
   * Validate video file
   */
  private validateVideo(file: Express.Multer.File) {
    if (!this.s3Service.validateFileType(file, this.allowedVideoTypes)) {
      throw new BadRequestException(
        `Invalid video type. Allowed types: ${this.allowedVideoTypes.join(', ')}`,
      );
    }

    const maxVideoSize = this.maxFileSize * 5; // 50MB for videos
    if (!this.s3Service.validateFileSize(file, maxVideoSize)) {
      throw new BadRequestException(
        `Video size exceeds maximum allowed size of ${maxVideoSize / 1024 / 1024}MB`,
      );
    }
  }

  /**
   * Validate document file
   */
  private validateDocument(file: Express.Multer.File) {
    if (!this.s3Service.validateFileType(file, this.allowedDocumentTypes)) {
      throw new BadRequestException(
        `Invalid document type. Allowed types: ${this.allowedDocumentTypes.join(', ')}`,
      );
    }

    if (!this.s3Service.validateFileSize(file, this.maxFileSize)) {
      throw new BadRequestException(
        `File size exceeds maximum allowed size of ${this.maxFileSize / 1024 / 1024}MB`,
      );
    }
  }
}

