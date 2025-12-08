import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { Public } from './common/decorators/public.decorator';
import { SignatureGuard } from './common/guards/signature.guard';

@Controller()
@Public()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  getHealth(): { status: string; timestamp: string } {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
    };
  }

  @Post('verify-test')
  @UseGuards(SignatureGuard)
  verifyTest(): { status: string; message: string } {
    return {
      status: 'success',
      message: 'Signature Verified!',
    };
  }
}
