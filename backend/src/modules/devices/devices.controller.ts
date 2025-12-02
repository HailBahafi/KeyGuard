import {
  Controller,
  Get,
  Post,
  Delete,
  Patch,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/core/auth/jwt-auth.guard';
import { DevicesService } from './devices.service';
import { QueryDevicesDto } from './dto/query-devices.dto';
import {
  DevicesPaginationResponseDto,
  EnrollmentCodeDto,
  DeviceActionResponseDto,
} from './dto/device-response.dto';

@ApiTags('Devices')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('devices')
export class DevicesController {
  constructor(private readonly devicesService: DevicesService) {}

  @Get()
  @ApiOperation({ summary: 'List all devices with filtering, sorting, and pagination' })
  @ApiResponse({
    status: 200,
    description: 'Devices retrieved successfully',
    type: DevicesPaginationResponseDto,
  })
  async listDevices(@Query() query: QueryDevicesDto): Promise<DevicesPaginationResponseDto> {
    return this.devicesService.listDevices(query);
  }

  @Post('enrollment-code')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Generate enrollment code for new device' })
  @ApiResponse({
    status: 201,
    description: 'Enrollment code generated successfully',
    type: EnrollmentCodeDto,
  })
  async generateEnrollmentCode(): Promise<EnrollmentCodeDto> {
    return this.devicesService.generateEnrollmentCode();
  }

  @Patch(':id/approve')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Approve pending device' })
  @ApiResponse({
    status: 200,
    description: 'Device approved successfully',
    type: DeviceActionResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Device not found' })
  @ApiResponse({ status: 400, description: 'Device is not pending' })
  async approveDevice(@Param('id') id: string): Promise<DeviceActionResponseDto> {
    return this.devicesService.approveDevice(id);
  }

  @Patch(':id/suspend')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Suspend active device' })
  @ApiResponse({
    status: 200,
    description: 'Device suspended successfully',
    type: DeviceActionResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Device not found' })
  @ApiResponse({ status: 400, description: 'Device is not active' })
  async suspendDevice(@Param('id') id: string): Promise<DeviceActionResponseDto> {
    return this.devicesService.suspendDevice(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Revoke device' })
  @ApiResponse({
    status: 200,
    description: 'Device revoked successfully',
    type: DeviceActionResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Device not found' })
  async revokeDevice(@Param('id') id: string): Promise<DeviceActionResponseDto> {
    return this.devicesService.revokeDevice(id);
  }
}
