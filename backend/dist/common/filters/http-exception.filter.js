"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "HttpExceptionFilter", {
    enumerable: true,
    get: function() {
        return HttpExceptionFilter;
    }
});
const _common = require("@nestjs/common");
const _dayjs = /*#__PURE__*/ _interop_require_default(require("dayjs"));
const _nestwinston = require("nest-winston");
const _winston = require("winston");
const _toomanyrequestsexception = require("../exceptions/too-many-requests.exception");
const _isenvironmentutil = require("../utils/is-environment.util");
const _prismaerrorcodes = require("./prisma-error-codes");
const _client = require("@prisma/client/runtime/client");
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
function _ts_param(paramIndex, decorator) {
    return function(target, key) {
        decorator(target, key, paramIndex);
    };
}
let HttpExceptionFilter = class HttpExceptionFilter {
    async catch(exception, host) {
        const ctx = host.switchToHttp();
        const request = ctx.getRequest();
        const reply = ctx.getResponse();
        const isProd = (0, _isenvironmentutil.isProduction)();
        let status = _common.HttpStatus.INTERNAL_SERVER_ERROR;
        let message = exception.message;
        let errors = {};
        let code;
        let details;
        // Handle different exception types with enhanced logic
        if (exception instanceof _client.PrismaClientKnownRequestError) {
            ({ status, message, errors, code, details } = this.handlePrismaKnownError(exception));
        } else if (exception instanceof _client.PrismaClientUnknownRequestError) {
            ({ status, message, errors, details } = this.handlePrismaUnknownError(exception));
        } else if (exception instanceof _client.PrismaClientRustPanicError) {
            ({ status, message, errors, details } = this.handlePrismaRustPanicError(exception));
        } else if (exception instanceof _client.PrismaClientInitializationError) {
            ({ status, message, errors, details } = this.handlePrismaInitializationError(exception));
        } else if (exception instanceof _client.PrismaClientValidationError) {
            ({ status, message, errors, details } = this.handlePrismaValidationError(exception));
        } else if (exception instanceof _common.BadRequestException) {
            ({ status, message, errors } = await this.handleBadRequestException(exception));
        } else if (exception instanceof _toomanyrequestsexception.TooManyRequestsException) {
            ({ status, message, errors } = this.handleTooManyRequestsException(exception));
        } else if (exception instanceof _common.HttpException) {
            ({ status, message, errors } = this.handleHttpException(exception));
        } else if (exception instanceof Error) {
            ({ status, message, errors } = this.handleGenericError(exception));
        }
        // Log the error with comprehensive context
        this.logError(exception, request, status, message, errors);
        // Build error response
        const errorResponse = {
            statusCode: status,
            timestamp: (0, _dayjs.default)().format(),
            message,
            path: request.url
        };
        // Add error code if available
        if (code) {
            errorResponse.code = code;
        }
        // Include detailed errors based on environment and error type
        if (!isProd) {
            errorResponse.errors = errors;
            errorResponse.details = details;
        }
        reply.status(status).send(errorResponse);
    }
    /**
   * Handle known Prisma errors with comprehensive error code coverage
   * and intelligent field extraction
   */ handlePrismaKnownError(exception) {
        let status = _common.HttpStatus.BAD_REQUEST;
        let message = exception.message;
        let errors = {};
        const code = exception.code;
        const details = {
            originalMessage: exception.message,
            meta: exception.meta
        };
        const prismaErrorHandler = _prismaerrorcodes.prismaErrorMap[code];
        if (prismaErrorHandler) {
            status = prismaErrorHandler.status;
            message = prismaErrorHandler.message;
            errors = prismaErrorHandler.buildErrors?.(exception) || {};
        }
        return {
            status,
            message,
            errors,
            code,
            details
        };
    }
    /**
   * Handle unknown Prisma runtime errors
   */ handlePrismaUnknownError(exception) {
        return {
            status: _common.HttpStatus.INTERNAL_SERVER_ERROR,
            message: 'Unknown database error occurred',
            errors: {
                database: [
                    'An unknown database error occurred'
                ]
            },
            details: {
                originalMessage: exception.message,
                type: 'PrismaClientUnknownRequestError'
            }
        };
    }
    /**
   * Handle Prisma engine panics
   */ handlePrismaRustPanicError(exception) {
        return {
            status: _common.HttpStatus.INTERNAL_SERVER_ERROR,
            message: 'Critical database engine error',
            errors: {
                engine: [
                    'A critical database engine error occurred. Please contact support.'
                ]
            },
            details: {
                type: 'PrismaClientRustPanicError',
                originalMessage: exception.message
            }
        };
    }
    /**
   * Handle Prisma client initialization errors
   */ handlePrismaInitializationError(exception) {
        return {
            status: _common.HttpStatus.SERVICE_UNAVAILABLE,
            message: 'Database service temporarily unavailable',
            errors: {
                initialization: [
                    'Database client initialization failed. Please try again later.'
                ]
            },
            details: {
                type: 'PrismaClientInitializationError',
                errorCode: exception.errorCode,
                originalMessage: exception.message
            }
        };
    }
    /**
   * Handle Prisma validation errors
   */ handlePrismaValidationError(exception) {
        return {
            status: _common.HttpStatus.BAD_REQUEST,
            message: 'Invalid request parameters',
            errors: {
                validation: [
                    this.sanitizeValidationMessage(exception.message)
                ]
            },
            details: {
                type: 'PrismaClientValidationError',
                originalMessage: exception.message
            }
        };
    }
    /**
   * Handle BadRequestException (typically validation errors)
   */ async handleBadRequestException(exception) {
        const status = exception.getStatus();
        const response = exception.getResponse();
        const rawErrors = Array.isArray(response.message) ? response.message : [
            response.message
        ];
        return {
            status,
            message: response.message || 'Validation failed',
            errors: Array.isArray(rawErrors) ? await this.formatValidationErrors(rawErrors) : {
                validation: rawErrors
            }
        };
    }
    /**
   * Handle TooManyRequestsException
   */ handleTooManyRequestsException(exception) {
        return {
            status: _common.HttpStatus.TOO_MANY_REQUESTS,
            message: 'Rate limit exceeded',
            errors: {
                rateLimit: [
                    exception.message || 'Too many requests'
                ]
            }
        };
    }
    /**
   * Handle generic HttpException
   */ handleHttpException(exception) {
        const status = exception.getStatus();
        const response = exception.getResponse();
        return {
            status,
            message: response.message || exception.message,
            errors: response.errors || null
        };
    }
    /**
   * Handle generic Error
   */ handleGenericError(exception) {
        return {
            status: _common.HttpStatus.INTERNAL_SERVER_ERROR,
            message: exception.message,
            errors: {
                server: [
                    exception.message
                ],
                stack: exception.stack?.split('\n') || []
            }
        };
    }
    /**
   * Format validation errors from class-validator
   */ async formatValidationErrors(errors) {
        const formatted = {};
        for (const error of errors){
            if (error.constraints) {
                formatted[error.property] = Object.values(error.constraints);
            }
            if (error.children && error.children.length > 0) {
                const childErrors = await this.formatValidationErrors(error.children);
                for (const [key, value] of Object.entries(childErrors)){
                    formatted[`${error.property}.${key}`] = value;
                }
            }
        }
        return formatted;
    }
    /**
   * Sanitize validation error messages to remove sensitive information
   */ sanitizeValidationMessage(message) {
        if (!message) return 'Validation error occurred';
        return message.replace(/Argument `.*?`:/g, 'Argument:').replace(/at `.*?`/g, 'at field').replace(/Type `.*?`/g, 'Type').replace(/Path `.*?`/g, 'Path').substring(0, 500); // Limit message length
    }
    /**
   * Sanitize request body to remove sensitive information
   */ sanitizeRequestBody(body) {
        if (!body || typeof body !== 'object') {
            return body;
        }
        const sensitiveFields = [
            'password',
            'token',
            'secret',
            'apiKey',
            'authorization',
            'auth',
            'key',
            'private',
            'confidential'
        ];
        const sanitized = {
            ...body
        };
        const sanitizeObject = (obj, prefix = '')=>{
            if (!obj || typeof obj !== 'object') return obj;
            const result = Array.isArray(obj) ? [] : {};
            for (const [key, value] of Object.entries(obj)){
                const fullKey = prefix ? `${prefix}.${key}` : key;
                const lowerKey = key.toLowerCase();
                if (sensitiveFields.some((field)=>lowerKey.includes(field))) {
                    result[key] = '[REDACTED]';
                } else if (typeof value === 'object' && value !== null) {
                    result[key] = sanitizeObject(value, fullKey);
                } else {
                    result[key] = value;
                }
            }
            return result;
        };
        return sanitizeObject(sanitized);
    }
    /**
   * Log error with comprehensive context and appropriate log levels
   */ logError(exception, request, status, message, errors) {
        // Determine log level based on status code and error type
        let logLevel;
        if (status >= 500) {
            logLevel = 'error';
        } else if (status >= 400) {
            logLevel = 'warn';
        } else {
            logLevel = 'info';
        }
        // Build comprehensive log data
        const logData = {
            timestamp: (0, _dayjs.default)().format(),
            level: logLevel,
            method: request.method,
            url: request.url,
            userAgent: request.headers['user-agent'],
            userId: request.user?.id || 'anonymous',
            ip: request.ip,
            status,
            message,
            errors,
            // Error context
            errorType: exception.constructor.name,
            errorCode: exception.code,
            // Request context (sanitized)
            requestId: request.id,
            correlationId: request.headers['x-correlation-id'],
            // Performance data
            responseTime: Date.now() - (request.startTime || Date.now()),
            // Include stack trace for server errors in non-prod
            ...status >= 500 && {
                stack: exception.stack,
                originalMessage: exception.message
            },
            // Include request body for client errors (sanitized)
            ...status >= 400 && status < 500 && {
                body: this.sanitizeRequestBody(request.body),
                query: request.query,
                params: request.params
            },
            // Additional Prisma-specific context
            ...exception.meta && {
                meta: exception.meta
            }
        };
        // Log using both NestJS logger and Winston
        switch(logLevel){
            case 'error':
                this.logger.error(message, logData);
                this.winstonLogger.error(message, logData);
                break;
            case 'warn':
                this.logger.warn(message, logData);
                this.winstonLogger.warn(message, logData);
                break;
            default:
                this.logger.log(message, logData);
                this.winstonLogger.info(message, logData);
        }
        // Additional monitoring/alerting for critical errors
        if (status >= 500) {
            this.handleCriticalError(exception, logData);
        }
    }
    /**
   * Handle critical errors that require immediate attention
   */ handleCriticalError(exception, logData) {
        // You can integrate with monitoring services here
        // Examples: Sentry, DataDog, New Relic, etc.
        // For now, log as critical
        this.logger.error(`CRITICAL ERROR: ${exception.message}`, {
            ...logData,
            critical: true,
            alertRequired: true
        });
    // You could also send alerts, create incidents, etc.
    // this.alertingService.sendCriticalAlert(exception, logData);
    // this.incidentService.createIncident(exception, logData);
    }
    constructor(winstonLogger){
        this.winstonLogger = winstonLogger;
        this.logger = new _common.Logger(HttpExceptionFilter.name);
    }
};
HttpExceptionFilter = _ts_decorate([
    (0, _common.Catch)(),
    _ts_param(0, (0, _common.Inject)(_nestwinston.WINSTON_MODULE_PROVIDER)),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _winston.Logger === "undefined" ? Object : _winston.Logger
    ])
], HttpExceptionFilter);

//# sourceMappingURL=http-exception.filter.js.map