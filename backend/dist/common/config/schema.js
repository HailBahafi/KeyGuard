"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "configurationSchema", {
    enumerable: true,
    get: function() {
        return configurationSchema;
    }
});
const _zod = require("zod");
const _nodeenv = require("./constants/node.env");
const configurationSchema = _zod.z.object({
    PORT: _zod.z.coerce.number().int().positive().min(1).max(65535).default(3000),
    NODE_ENV: _zod.z.enum([
        _nodeenv.NodeEnv.DEV,
        _nodeenv.NodeEnv.PROD,
        _nodeenv.NodeEnv.TEST,
        _nodeenv.NodeEnv.STAGING
    ]).default(_nodeenv.NodeEnv.DEV),
    DATABASE_URL: _zod.z.url({
        message: 'DATABASE_URL must be a valid URL'
    }).min(1),
    JWT_SECRET_KEY: _zod.z.string().min(32, 'JWT_SECRET_KEY must be at least 32 characters long').regex(/^[A-Za-z0-9+/=]+$/, 'Invalid JWT_SECRET_KEY'),
    OPTIMIZE_API_KEY: _zod.z.string().optional(),
    FRONTEND_URL: _zod.z.url({
        message: 'FRONTEND_URL must be a valid URL'
    }).optional().default('http://localhost:3000')
});

//# sourceMappingURL=schema.js.map