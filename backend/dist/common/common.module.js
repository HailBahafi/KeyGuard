"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "CommonModule", {
    enumerable: true,
    get: function() {
        return CommonModule;
    }
});
const _common = require("@nestjs/common");
const _httpexceptionfilter = require("./filters/http-exception.filter");
const _loggermodule = require("./logger/logger.module");
const _keyguardmodule = require("../modules/keyguard/keyguard.module");
const _signatureguard = require("./guards/signature.guard");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
let CommonModule = class CommonModule {
};
CommonModule = _ts_decorate([
    (0, _common.Module)({
        imports: [
            _loggermodule.LoggerModule,
            _keyguardmodule.KeyGuardModule
        ],
        providers: [
            _httpexceptionfilter.HttpExceptionFilter,
            _signatureguard.SignatureGuard
        ],
        exports: [
            _httpexceptionfilter.HttpExceptionFilter,
            _signatureguard.SignatureGuard
        ]
    })
], CommonModule);

//# sourceMappingURL=common.module.js.map