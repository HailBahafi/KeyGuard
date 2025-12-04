"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "PrismaService", {
    enumerable: true,
    get: function() {
        return PrismaService;
    }
});
const _isenvironmentutil = require("../../common/utils/is-environment.util");
const _common = require("@nestjs/common");
const _extensionaccelerate = require("@prisma/extension-accelerate");
const _extensionoptimize = require("@prisma/extension-optimize");
const _index = /*#__PURE__*/ _interop_require_default(require("../../common/config/index"));
const _client = require("../../generated/client");
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
let PrismaService = class PrismaService {
    static createPrismaClient() {
        const isDev = (0, _isenvironmentutil.isDevelopment)();
        let client = new _client.PrismaClient({
            log: isDev ? [
                'query',
                'info',
                'warn',
                'error'
            ] : [
                'warn',
                'error'
            ],
            errorFormat: 'pretty',
            accelerateUrl: _index.default.DATABASE_URL
        });
        const optimizeApiKey = _index.default.OPTIMIZE_API_KEY;
        if (isDev && optimizeApiKey) {
            client = client.$extends((0, _extensionoptimize.withOptimize)({
                apiKey: optimizeApiKey
            }));
        }
        return client.$extends((0, _extensionaccelerate.withAccelerate)());
    }
    async onModuleInit() {
        await this.prisma.$connect();
    }
    async onModuleDestroy() {
        await this.prisma.$disconnect();
    }
    constructor(){
        this.prisma = PrismaService.createPrismaClient();
    }
};
PrismaService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [])
], PrismaService);

//# sourceMappingURL=prisma.service.js.map