"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "KeyGuardController", {
    enumerable: true,
    get: function() {
        return KeyGuardController;
    }
});
const _publicdecorator = require("../../common/decorators/public.decorator");
const _common = require("@nestjs/common");
const _dto = require("./dto");
const _keyguardservice = require("./services/keyguard.service");
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
let KeyGuardController = class KeyGuardController {
    /**
   * Enroll a new device by storing its public key
   *
   * POST /api/v1/keyguard/enroll
   */ async enroll(apiKey, enrollDto) {
        if (!apiKey) {
            throw new _common.BadRequestException('x-keyguard-api-key header is required');
        }
        this.logger.log(`Enrollment request for keyId: ${enrollDto.keyId}`);
        return this.keyguardService.enrollDevice(apiKey, enrollDto);
    }
    /**
   * Verify a signed request (test endpoint for Phase 1)
   *
   * POST /api/v1/keyguard/verify-test
   */ async verifyTest(request, apiKey, keyId, timestamp, nonce, bodySha256, algorithm, signature, body) {
        // Validate required headers
        const missingHeaders = [];
        if (!apiKey) missingHeaders.push('x-keyguard-api-key');
        if (!keyId) missingHeaders.push('x-keyguard-key-id');
        if (!timestamp) missingHeaders.push('x-keyguard-timestamp');
        if (!nonce) missingHeaders.push('x-keyguard-nonce');
        if (!bodySha256) missingHeaders.push('x-keyguard-body-sha256');
        if (!algorithm) missingHeaders.push('x-keyguard-alg');
        if (!signature) missingHeaders.push('x-keyguard-signature');
        if (missingHeaders.length > 0) {
            throw new _common.BadRequestException(`Missing required headers: ${missingHeaders.join(', ')}`);
        }
        const headers = {
            apiKey,
            keyId,
            timestamp,
            nonce,
            bodySha256,
            algorithm,
            signature
        };
        // Get raw body from request
        const rawBody = request.rawBody ?? null;
        // Get method and URL
        const method = request.method;
        const url = request.url;
        this.logger.log(`Verification test request: ${method} ${url}`);
        return this.keyguardService.verifyRequest(headers, method, url, rawBody);
    }
    /**
   * Get device by ID
   *
   * GET /api/v1/keyguard/devices/:id
   */ async getDevice(apiKey, id) {
        if (!apiKey) {
            throw new _common.BadRequestException('x-keyguard-api-key header is required');
        }
        return this.keyguardService.getDevice(id);
    }
    /**
   * List all devices for an API key
   *
   * GET /api/v1/keyguard/devices
   */ async listDevices(apiKey) {
        if (!apiKey) {
            throw new _common.BadRequestException('x-keyguard-api-key header is required');
        }
        return this.keyguardService.listDevices(apiKey);
    }
    /**
   * Revoke a device
   *
   * DELETE /api/v1/keyguard/devices/:id
   */ async revokeDevice(apiKey, id) {
        if (!apiKey) {
            throw new _common.BadRequestException('x-keyguard-api-key header is required');
        }
        return this.keyguardService.revokeDevice(apiKey, id);
    }
    constructor(keyguardService){
        this.keyguardService = keyguardService;
        this.logger = new _common.Logger(KeyGuardController.name);
    }
};
_ts_decorate([
    (0, _common.Post)('enroll'),
    (0, _common.HttpCode)(_common.HttpStatus.CREATED),
    _ts_param(0, (0, _common.Headers)('x-keyguard-api-key')),
    _ts_param(1, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        typeof _dto.EnrollDeviceDto === "undefined" ? Object : _dto.EnrollDeviceDto
    ]),
    _ts_metadata("design:returntype", Promise)
], KeyGuardController.prototype, "enroll", null);
_ts_decorate([
    (0, _common.Post)('verify-test'),
    (0, _common.HttpCode)(_common.HttpStatus.OK),
    _ts_param(0, (0, _common.Req)()),
    _ts_param(1, (0, _common.Headers)('x-keyguard-api-key')),
    _ts_param(2, (0, _common.Headers)('x-keyguard-key-id')),
    _ts_param(3, (0, _common.Headers)('x-keyguard-timestamp')),
    _ts_param(4, (0, _common.Headers)('x-keyguard-nonce')),
    _ts_param(5, (0, _common.Headers)('x-keyguard-body-sha256')),
    _ts_param(6, (0, _common.Headers)('x-keyguard-alg')),
    _ts_param(7, (0, _common.Headers)('x-keyguard-signature')),
    _ts_param(8, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Object,
        String,
        String,
        String,
        String,
        String,
        String,
        String,
        Object
    ]),
    _ts_metadata("design:returntype", Promise)
], KeyGuardController.prototype, "verifyTest", null);
_ts_decorate([
    (0, _common.Get)('devices/:id'),
    _ts_param(0, (0, _common.Headers)('x-keyguard-api-key')),
    _ts_param(1, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        String
    ]),
    _ts_metadata("design:returntype", Promise)
], KeyGuardController.prototype, "getDevice", null);
_ts_decorate([
    (0, _common.Get)('devices'),
    _ts_param(0, (0, _common.Headers)('x-keyguard-api-key')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", Promise)
], KeyGuardController.prototype, "listDevices", null);
_ts_decorate([
    (0, _common.Delete)('devices/:id'),
    (0, _common.HttpCode)(_common.HttpStatus.OK),
    _ts_param(0, (0, _common.Headers)('x-keyguard-api-key')),
    _ts_param(1, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        String
    ]),
    _ts_metadata("design:returntype", Promise)
], KeyGuardController.prototype, "revokeDevice", null);
KeyGuardController = _ts_decorate([
    (0, _publicdecorator.Public)(),
    (0, _common.Controller)('keyguard'),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _keyguardservice.KeyGuardService === "undefined" ? Object : _keyguardservice.KeyGuardService
    ])
], KeyGuardController);

//# sourceMappingURL=keyguard.controller.js.map