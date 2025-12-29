import {
  Controller,
  Post,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  Param,
  Body,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { UploadService } from './upload.service';
import { S3Service } from './s3.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Upload')
@Controller('upload')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT')
export class UploadController {
  constructor(
    private uploadService: UploadService,
    private s3Service: S3Service,
  ) {}

  @Post('profile-photo')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload profile photo' })
  @ApiResponse({ status: 201, description: 'Profile photo uploaded' })
  async uploadProfilePhoto(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser('profileId') profileId: string,
  ) {
    return this.uploadService.uploadProfilePhoto(file, profileId);
  }

  @Post('cover-photo')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload cover photo' })
  @ApiResponse({ status: 201, description: 'Cover photo uploaded' })
  async uploadCoverPhoto(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser('profileId') profileId: string,
  ) {
    return this.uploadService.uploadCoverPhoto(file, profileId);
  }

  @Post('post-media')
  @UseInterceptors(FilesInterceptor('files', 5))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload post media (up to 5 files)' })
  @ApiResponse({ status: 201, description: 'Media uploaded' })
  async uploadPostMedia(
    @UploadedFiles() files: Express.Multer.File[],
    @CurrentUser('profileId') profileId: string,
    @Body('postId') postId?: string,
  ) {
    return this.uploadService.uploadPostMedia(files, profileId, postId);
  }

  @Post('document')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload document (PDF, DOC, etc.)' })
  @ApiResponse({ status: 201, description: 'Document uploaded' })
  async uploadDocument(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser('profileId') profileId: string,
    @Body('entityType') entityType?: string,
  ) {
    return this.uploadService.uploadDocument(file, profileId, entityType);
  }

  @Post('presigned-url')
  @ApiOperation({ summary: 'Get presigned URL for client-side upload' })
  @ApiResponse({ status: 200, description: 'Presigned URL generated' })
  async getPresignedUploadUrl(
    @Body() body: { fileName: string; contentType: string; folder?: string },
    @CurrentUser('profileId') profileId: string,
  ) {
    return this.s3Service.getPresignedUploadUrl(
      body.fileName,
      body.contentType,
      body.folder || 'uploads',
      profileId,
    );
  }

  @Delete(':uploadId')
  @ApiOperation({ summary: 'Delete uploaded file' })
  @ApiResponse({ status: 200, description: 'File deleted' })
  async deleteFile(
    @Param('uploadId') uploadId: string,
    @CurrentUser('profileId') profileId: string,
  ) {
    return this.uploadService.deleteFile(uploadId, profileId);
  }
}

