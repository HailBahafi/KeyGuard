import { Controller, Get, Query } from '@nestjs/common';
import { UserRole } from '../../generated/enums';
import { PaginationDto } from '../base/pagination.dto';
import { RequiredRoles } from '../decorators/roles.decorator';
import { LoggerService } from './logger.service';

interface LogEntry {
  level: string;
  timestamp: string;
  message: string;
  context?: string;
}

interface PaginatedLogResponse {
  data: LogEntry[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

@Controller('logger')
export class LoggerController {
  private readonly loggerService: LoggerService;

  constructor(loggerService: LoggerService) {
    this.loggerService = loggerService;
  }

  @Get()
  @RequiredRoles(UserRole.ADMIN)
  findAll(@Query() query: PaginationDto): Promise<PaginatedLogResponse> {
    return this.loggerService.findAll(query);
  }
}
