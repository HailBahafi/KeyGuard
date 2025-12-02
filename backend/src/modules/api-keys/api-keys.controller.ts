import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/core/auth/jwt-auth.guard';
import { ApiKeysService } from './api-keys.service';
import { CreateKeyDto } from './dto/create-key.dto';
import { QueryKeysDto } from './dto/query-keys.dto';
import {
  KeysPaginationResponseDto,
  CreateKeyResponseDto,
  RevokeKeyResponseDto,
} from './dto/key-response.dto';

@ApiTags('API Keys')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('keys')
export class ApiKeysController {
  constructor(private readonly apiKeysService: ApiKeysService) {}

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
    description: 'API key created successfully',
    type: CreateKeyResponseDto,
  })
  @ApiResponse({ status: 409, description: 'API key with this name already exists' })
  async createKey(@Body() createKeyDto: CreateKeyDto): Promise<CreateKeyResponseDto> {
    const key = await this.apiKeysService.createKey(createKeyDto);
    return { key };
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
}
