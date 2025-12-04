"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "LoggerService", {
    enumerable: true,
    get: function() {
        return LoggerService;
    }
});
const _common = require("@nestjs/common");
const _dayjs = /*#__PURE__*/ _interop_require_default(require("dayjs"));
const _fs = require("fs");
const _path = require("path");
const _winston = /*#__PURE__*/ _interop_require_wildcard(require("winston"));
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
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
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let LoggerService = class LoggerService {
    async findAll(query) {
        // Read the log file
        const data = await _fs.promises.readFile(this.logFilePath, 'utf-8');
        const entries = data.split('\n').filter(Boolean).map((line)=>JSON.parse(line)).sort((a, b)=>(0, _dayjs.default)(b.timestamp).diff((0, _dayjs.default)(a.timestamp)));
        const totalEntries = entries.length;
        const totalPages = Math.ceil(totalEntries / query.limit);
        const startIndex = (query.offset - 1) * query.limit;
        const paginatedData = entries.slice(startIndex, startIndex + query.limit);
        return {
            data: paginatedData,
            total: totalEntries,
            page: query.offset,
            pageSize: query.limit,
            totalPages
        };
    }
    log(message) {
        this.logger.info(message);
    }
    constructor(){
        this.logFilePath = (0, _path.join)(__dirname, '../../../logs/error.log');
        this.logger = _winston.createLogger({
            transports: [
                new _winston.transports.Console()
            ]
        });
    }
};
LoggerService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [])
], LoggerService);

//# sourceMappingURL=logger.service.js.map