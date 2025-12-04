"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "KeyGuardModule", {
    enumerable: true,
    get: function() {
        return KeyGuardModule;
    }
});
const _common = require("@nestjs/common");
const _keyguardcontroller = require("./keyguard.controller");
const _keyguardservice = require("./services/keyguard.service");
const _signatureverificationservice = require("./services/signature-verification.service");
const _cryptoservice = require("./services/crypto.service");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
let KeyGuardModule = class KeyGuardModule {
};
KeyGuardModule = _ts_decorate([
    (0, _common.Module)({
        controllers: [
            _keyguardcontroller.KeyGuardController
        ],
        providers: [
            _keyguardservice.KeyGuardService,
            _signatureverificationservice.SignatureVerificationService,
            _cryptoservice.CryptoService
        ],
        exports: [
            _keyguardservice.KeyGuardService,
            _signatureverificationservice.SignatureVerificationService,
            _cryptoservice.CryptoService
        ]
    })
], KeyGuardModule);

//# sourceMappingURL=keyguard.module.js.map