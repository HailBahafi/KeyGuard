import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';
import dayjs from 'dayjs';

interface ValidationError {
  field: string;
  message: string;
}

interface ErrorResponse {
  statusCode: number;
  message: string;
  error: string;
  timestamp: string;
  path: string;
  details?: ValidationError[];
}

/**
 * Global HTTP Exception Filter
 * Formats all HTTP exceptions according to API specification
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('HttpExceptionFilter');

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<FastifyReply>();
    const request = ctx.getRequest<FastifyRequest>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let error = 'Internal Server Error';
    let details: ValidationError[] | undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'object') {
        const responseObj = exceptionResponse as any;
        message = responseObj.message || exception.message;
        error = responseObj.error || exception.name;

        // Handle validation errors
        if (responseObj.errors && Array.isArray(responseObj.errors)) {
          details = this.formatValidationErrors(responseObj.errors);
        }
      } else {
        message = exceptionResponse;
        error = exception.name;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
      error = exception.name;
    }

    const errorResponse: ErrorResponse = {
      statusCode: status,
      message: Array.isArray(message) ? message.join(', ') : message,
      error,
      timestamp: dayjs().toISOString(),
      path: request.url,
    };

    if (details && details.length > 0) {
      errorResponse.details = details;
    }

    // Log error
    this.logger.error(
      `${request.method} ${request.url} - ${status} - ${errorResponse.message}`,
      exception instanceof Error ? exception.stack : undefined,
    );

    // Send response
    void response.status(status).send(errorResponse);
  }

  private formatValidationErrors(errors: any[]): ValidationError[] {
    return errors.map(err => ({
      field: err.field || 'unknown',
      message: Array.isArray(err.errors) ? err.errors.join(', ') : err.message || 'Validation failed',
    }));
  }
}
