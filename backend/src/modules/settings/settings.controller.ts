import {
  Controller,
  Get,
  Patch,
  Post,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/core/auth/jwt-auth.guard';
import { SettingsService } from './settings.service';
import {
  UpdateGeneralSettingsDto,
  UpdateSecuritySettingsDto,
  UpdateNotificationSettingsDto,
  GenerateApiKeyDto,
} from './dto/update-settings.dto';
import {
  SettingsStateDto,
  UpdateSettingsResponseDto,
  TestSMTPResponseDto,
  GenerateApiKeyResponseDto,
  RevokeApiKeyResponseDto,
  DownloadBackupResponseDto,
} from './dto/settings-response.dto';

@ApiTags('Settings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all settings' })
  @ApiResponse({
    status: 200,
    description: 'Settings retrieved successfully',
    type: SettingsStateDto,
  })
  async getAllSettings(): Promise<SettingsStateDto> {
    return this.settingsService.getAllSettings();
  }

  @Patch('general')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update general settings' })
  @ApiResponse({
    status: 200,
    description: 'General settings updated successfully',
    type: UpdateSettingsResponseDto,
  })
  async updateGeneralSettings(
    @Body() dto: UpdateGeneralSettingsDto,
  ): Promise<UpdateSettingsResponseDto> {
    const data = await this.settingsService.updateGeneralSettings(dto);
    return { success: true, data };
  }

  @Patch('security')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update security settings' })
  @ApiResponse({
    status: 200,
    description: 'Security settings updated successfully',
    type: UpdateSettingsResponseDto,
  })
  async updateSecuritySettings(
    @Body() dto: UpdateSecuritySettingsDto,
  ): Promise<UpdateSettingsResponseDto> {
    const data = await this.settingsService.updateSecuritySettings(dto);
    return { success: true, data };
  }

  @Patch('notifications')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update notification settings' })
  @ApiResponse({
    status: 200,
    description: 'Notification settings updated successfully',
    type: UpdateSettingsResponseDto,
  })
  async updateNotificationSettings(
    @Body() dto: UpdateNotificationSettingsDto,
  ): Promise<UpdateSettingsResponseDto> {
    const data = await this.settingsService.updateNotificationSettings(dto);
    return { success: true, data };
  }

  @Post('notifications/test')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Test SMTP connection' })
  @ApiResponse({
    status: 200,
    description: 'SMTP test result',
    type: TestSMTPResponseDto,
  })
  async testSMTPConnection(): Promise<TestSMTPResponseDto> {
    return this.settingsService.testSMTPConnection();
  }

  @Post('api-keys')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Generate admin API key' })
  @ApiResponse({
    status: 201,
    description: 'API key generated successfully',
    type: GenerateApiKeyResponseDto,
  })
  async generateApiKey(@Body() dto: GenerateApiKeyDto): Promise<GenerateApiKeyResponseDto> {
    return this.settingsService.generateApiKey(dto);
  }

  @Delete('api-keys/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Revoke admin API key' })
  @ApiResponse({
    status: 200,
    description: 'API key revoked successfully',
    type: RevokeApiKeyResponseDto,
  })
  @ApiResponse({ status: 404, description: 'API key not found' })
  async revokeApiKey(@Param('id') id: string): Promise<RevokeApiKeyResponseDto> {
    return this.settingsService.revokeApiKey(id);
  }

  @Post('backup/download')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Download backup' })
  @ApiResponse({
    status: 200,
    description: 'Backup download URL generated',
    type: DownloadBackupResponseDto,
  })
  async downloadBackup(): Promise<DownloadBackupResponseDto> {
    return this.settingsService.downloadBackup();
  }
}
