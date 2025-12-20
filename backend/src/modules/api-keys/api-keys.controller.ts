import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Headers,
  Query,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/core/auth/jwt-auth.guard';
import { ApiKeysService } from './api-keys.service';
import { CreateKeyDto } from './dto/create-key.dto';
import {
  CreateKeyResponseDto,
  KeysPaginationResponseDto,
  RevokeKeyResponseDto,
} from './dto/key-response.dto';
import { QueryKeysDto } from './dto/query-keys.dto';

@ApiTags('API Keys')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('keys')
export class ApiKeysController {
  constructor(private readonly apiKeysService: ApiKeysService) { }

  @Get()
  @ApiOperation({ summary: 'List all API keys with filtering and pagination' })
  @ApiResponse({
    status: 200,
    description: 'API keys retrieved successfully',
    type: KeysPaginationResponseDto,
  })
  async listKeys(@Query() query: QueryKeysDto): Promise<KeysPaginationResponseDto> {
    return this.apiKeysService.listKeys(query);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new API key' })
  @ApiResponse({
    status: 201,
    description: 'API key created successfully. The rawKey is only returned ONCE in this response.',
    type: CreateKeyResponseDto,
  })
  @ApiResponse({ status: 409, description: 'API key with this name already exists' })
  async createKey(@Body() createKeyDto: CreateKeyDto, @Headers('x-api-key') apiKey: string): Promise<CreateKeyResponseDto> {
    // Service returns { key, rawKey } - rawKey is ONLY available here
    if (!apiKey) throw new UnauthorizedException('API key is required');
    const result = await this.apiKeysService.createKey(createKeyDto, apiKey);
    return result;
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Revoke an API key' })
  @ApiResponse({
    status: 200,
    description: 'API key revoked successfully',
    type: RevokeKeyResponseDto,
  })
  @ApiResponse({ status: 404, description: 'API key not found' })
  async revokeKey(@Param('id') id: string): Promise<RevokeKeyResponseDto> {
    return this.apiKeysService.revokeKey(id);
  }

  @Post(':id/rotate')
  @HttpCode(HttpStatus.NOT_IMPLEMENTED)
  @ApiOperation({ summary: 'Rotate an API key (coming soon)' })
  @ApiResponse({
    status: 501,
    description: 'Feature not yet implemented',
  })
  @ApiResponse({ status: 404, description: 'API key not found' })
  async rotateKey(@Param('id') id: string): Promise<{ message: string }> {
    // Stub implementation - to be completed in future
    return {
      message: 'Key rotation feature is not yet implemented',
    };
  }
}
