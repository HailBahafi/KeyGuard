"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "winstonLoggerConfig", {
    enumerable: true,
    get: function() {
        return winstonLoggerConfig;
    }
});
const _nestwinston = require("nest-winston");
const _winston = /*#__PURE__*/ _interop_require_wildcard(require("winston"));
function _getRequireWildcardCache(nodeInterop) {
    if (typeof WeakMap !== "function") return null;
    var cacheBabelInterop = new WeakMap();
    var cacheNodeInterop = new WeakMap();
    return (_getRequireWildcardCache = function(nodeInterop) {
        return nodeInterop ? cacheNodeInterop : cacheBabelInterop;
    })(nodeInterop);
}
function _interop_require_wildcard(obj, nodeInterop) {
    if (!nodeInterop && obj && obj.__esModule) {
        return obj;
    }
    if (obj === null || typeof obj !== "object" && typeof obj !== "function") {
        return {
            default: obj
        };
    }
    var cache = _getRequireWildcardCache(nodeInterop);
    if (cache && cache.has(obj)) {
        return cache.get(obj);
    }
    var newObj = {
        __proto__: null
    };
    var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor;
    for(var key in obj){
        if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) {
            var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null;
            if (desc && (desc.get || desc.set)) {
                Object.defineProperty(newObj, key, desc);
            } else {
                newObj[key] = obj[key];
            }
        }
    }
    newObj.default = obj;
    if (cache) {
        cache.set(obj, newObj);
    }
    return newObj;
}
const winstonLoggerConfig = {
    transports: [
        new _winston.transports.Console({
            format: _winston.format.combine(_winston.format.timestamp(), _winston.format.colorize(), _nestwinston.utilities.format.nestLike('MyApp', {
                prettyPrint: true
            }))
        }),
        new _winston.transports.File({
            filename: 'logs/error.log',
            level: 'error',
            format: _winston.format.combine(_winston.format.timestamp(), _winston.format.json())
        }),
        new _winston.transports.File({
            filename: 'logs/error.log',
            level: 'warn',
            format: _winston.format.combine(_winston.format.timestamp(), _winston.format.json())
        })
    ]
};

//# sourceMappingURL=winston.config.js.map