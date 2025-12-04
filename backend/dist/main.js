"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
const _compress = /*#__PURE__*/ _interop_require_default(require("@fastify/compress"));
const _helmet = /*#__PURE__*/ _interop_require_default(require("@fastify/helmet"));
const _common = require("@nestjs/common");
const _core = require("@nestjs/core");
const _platformfastify = require("@nestjs/platform-fastify");
const _classvalidator = require("class-validator");
const _dayjs = /*#__PURE__*/ _interop_require_default(require("dayjs"));
const _nestwinston = require("nest-winston");
const _perf_hooks = require("perf_hooks");
const _appmodule = require("./app.module");
const _index = /*#__PURE__*/ _interop_require_default(require("./common/config/index"));
const _httpexceptionfilter = require("./common/filters/http-exception.filter");
const _isenvironmentutil = require("./common/utils/is-environment.util");
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
async function bootstrap() {
    const logger = new _common.Logger('Bootstrap');
    const startTime = _perf_hooks.performance.now();
    const isProd = (0, _isenvironmentutil.isProduction)();
    try {
        const fastifyAdapter = createOptimizedFastifyAdapter(isProd);
        const app = await _core.NestFactory.create(_appmodule.AppModule, fastifyAdapter, {
            logger: isProd ? [
                'error',
                'warn'
            ] : [
                'log',
                'debug',
                'error',
                'verbose',
                'warn'
            ],
            abortOnError: isProd,
            forceCloseConnections: true,
            rawBody: true
        });
        (0, _classvalidator.useContainer)(app.select(_appmodule.AppModule), {
            fallbackOnErrors: true
        });
        setupGlobalPipes(app, isProd);
        setupGlobalFilters(app);
        setupCors(app, isProd);
        setupVersioning(app);
        await Promise.all([
            setupSecurity(app, isProd),
            setupCompression(app, isProd)
        ]);
        setupGracefulShutdown(app, logger);
        const port = Number(_index.default.PORT) || 3000;
        const host = '0.0.0.0';
        await app.listen(port, host);
        const bootTime = Math.round(_perf_hooks.performance.now() - startTime);
        logger.log(`🚀 Application started successfully!`);
        logger.log(`📍 Server running on: http://${host}:${port}`);
        logger.log(`🌍 Environment: ${_index.default.NODE_ENV}`);
        logger.log(`⚡ Boot time: ${bootTime}ms`);
        logger.log(`💾 Memory usage: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`);
    } catch (error) {
        logger.error('❌ Failed to start application:', error);
        process.exit(1);
    }
}
function createOptimizedFastifyAdapter(isProd) {
    return new _platformfastify.FastifyAdapter({
        trustProxy: true,
        logger: isProd ? false : {
            level: 'info'
        },
        caseSensitive: false,
        ignoreTrailingSlash: true,
        maxParamLength: 100,
        keepAliveTimeout: 72000,
        requestTimeout: 30000,
        bodyLimit: 10 * 1024 * 1024,
        connectionTimeout: 0,
        pluginTimeout: 30000,
        serializerOpts: {
            schema: {}
        },
        clientErrorHandler: (error, socket)=>{
            const logger = new _common.Logger('ClientError');
            logger.error('Client connection error:', error.message);
            socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
        }
    });
}
function setupGlobalPipes(app, isProd) {
    app.useGlobalPipes(new _common.ValidationPipe({
        transform: true,
        transformOptions: {
            enableImplicitConversion: true,
            exposeDefaultValues: true
        },
        whitelist: true,
        forbidNonWhitelisted: true,
        disableErrorMessages: isProd,
        exceptionFactory: (validationErrors = [])=>{
            const formattedErrors = formatValidationErrors(validationErrors);
            return new _common.BadRequestException({
                message: 'Validation failed',
                errors: formattedErrors,
                timestamp: (0, _dayjs.default)().format()
            });
        },
        stopAtFirstError: isProd
    }));
}
function setupGlobalFilters(app) {
    const winstonLogger = app.get(_nestwinston.WINSTON_MODULE_PROVIDER);
    app.useGlobalFilters(new _httpexceptionfilter.HttpExceptionFilter(winstonLogger));
}
async function setupSecurity(app, isProd) {
    await app.register(_helmet.default, {
        contentSecurityPolicy: {
            directives: {
                defaultSrc: [
                    "'self'"
                ],
                styleSrc: [
                    "'self'",
                    "'unsafe-inline'",
                    'fonts.googleapis.com'
                ],
                fontSrc: [
                    "'self'",
                    'fonts.gstatic.com'
                ],
                imgSrc: [
                    "'self'",
                    'data:',
                    'https:'
                ],
                scriptSrc: isProd ? [
                    "'self'"
                ] : [
                    "'self'",
                    "'unsafe-inline'",
                    "'unsafe-eval'"
                ]
            }
        },
        crossOriginEmbedderPolicy: isProd,
        hsts: {
            maxAge: 31536000,
            includeSubDomains: true,
            preload: true
        },
        noSniff: true,
        frameguard: {
            action: 'deny'
        },
        xssFilter: true
    });
}
async function setupCompression(app, isProd) {
    await app.register(_compress.default, {
        global: true,
        threshold: 1024,
        encodings: [
            'gzip',
            'deflate',
            'br'
        ],
        zlibOptions: {
            level: isProd ? 6 : 1
        }
    });
}
function setupCors(app, isProd) {
    const allowedOrigins = isProd ? [
        _index.default.FRONTEND_URL
    ].filter(Boolean) : [
        'http://localhost:3000',
        'http://localhost:3001',
        _index.default.FRONTEND_URL
    ].filter(Boolean);
    app.enableCors({
        origin: (origin, callback)=>{
            // Allow requests with no origin (like mobile apps or curl requests)
            if (!origin) return callback(null, true);
            if (allowedOrigins.includes(origin)) return callback(null, true);
            // In development, allow all localhost origins for testing
            if (!isProd && /localhost|127\.0\.0\.1/.test(origin)) return callback(null, true);
            return callback(new Error('Not allowed by CORS'), false);
        },
        credentials: true,
        methods: [
            'GET',
            'POST',
            'PUT',
            'DELETE',
            'PATCH',
            'OPTIONS',
            'HEAD'
        ],
        allowedHeaders: [
            'Content-Type',
            'Authorization',
            'x-keyguard-signature',
            'x-keyguard-timestamp',
            'x-keyguard-nonce',
            'x-keyguard-body-sha256',
            'x-keyguard-key-id',
            'x-keyguard-api-key',
            'x-keyguard-alg'
        ]
    });
}
function setupVersioning(app) {
    app.enableVersioning({
        type: _common.VersioningType.URI,
        defaultVersion: '1',
        prefix: 'v'
    });
    app.setGlobalPrefix('api');
}
function setupGracefulShutdown(app, logger) {
    const signals = [
        'SIGINT',
        'SIGTERM'
    ];
    signals.forEach((signal)=>{
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        process.on(signal, async ()=>{
            logger.warn(`Received ${signal}, shutting down gracefully...`);
            await app.close();
            logger.log('Application shutdown complete');
            process.exit(0);
        });
    });
}
function formatValidationErrors(errors) {
    return errors.map((err)=>({
            field: err.property,
            errors: Object.values(err.constraints ?? {})
        }));
}
void bootstrap();

//# sourceMappingURL=main.js.map