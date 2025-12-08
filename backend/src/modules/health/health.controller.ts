import { Public } from '@/src/common/decorators/public.decorator';
import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

/**
 * Health Controller - Provides health check endpoint
 */
@ApiTags('Health')
@Public()
@Controller('health')
export class HealthController {
    @Get()
    @ApiOperation({ summary: 'Health check endpoint' })
    @ApiResponse({
        status: 200,
        description: 'Service is healthy',
        schema: {
            type: 'object',
            properties: {
                status: { type: 'string', example: 'ok' },
            },
        },
    })
    getHealth(): { status: string } {
        return { status: 'ok' };
    }
}
