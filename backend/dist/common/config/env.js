"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "environmentVariables", {
    enumerable: true,
    get: function() {
        return environmentVariables;
    }
});
require("dotenv/config");
const environmentVariables = {
    PORT: process.env.PORT,
    NODE_ENV: process.env.NODE_ENV,
    DATABASE_URL: process.env.DATABASE_URL,
    JWT_SECRET_KEY: process.env.JWT_SECRET_KEY,
    OPTIMIZE_API_KEY: process.env.OPTIMIZE_API_KEY,
    FRONTEND_URL: process.env.FRONTEND_URL
};

//# sourceMappingURL=env.js.map