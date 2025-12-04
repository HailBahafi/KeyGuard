"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "SignatureGuard", {
    enumerable: true,
    get: function() {
        return SignatureGuard;
    }
});
const _common = require("@nestjs/common");
const _cryptoservice = require("../../modules/keyguard/services/crypto.service");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let SignatureGuard = class SignatureGuard {
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        // Extract KeyGuard headers
        const signature = this.getHeader(request, 'x-keyguard-signature');
        const timestamp = this.getHeader(request, 'x-keyguard-timestamp');
        const nonce = this.getHeader(request, 'x-keyguard-nonce');
        const bodySha256 = this.getHeader(request, 'x-keyguard-body-sha256');
        const keyId = this.getHeader(request, 'x-keyguard-key-id');
        const apiKey = this.getHeader(request, 'x-keyguard-api-key');
        // Validate all required headers are present
        if (!signature || !timestamp || !nonce || !bodySha256 || !keyId || !apiKey) {
            throw new _common.UnauthorizedException('Missing required KeyGuard headers');
        }
        // Validate timestamp is within acceptable time window
        this.validateTimestamp(timestamp);
        // Reconstruct the canonical payload
        const method = request.method;
        const url = request.url;
        // Extract path and query from URL
        const pathAndQuery = this.extractPathAndQuery(url);
        const payload = this.cryptoService.reconstructPayload({
            timestamp,
            method,
            pathAndQuery,
            bodySha256,
            nonce,
            apiKey,
            keyId
        });
        // Verify the signature
        const isValid = await this.cryptoService.verifySignature(this.HARDCODED_PUBLIC_KEY, signature, payload);
        if (!isValid) {
            throw new _common.UnauthorizedException('Invalid signature');
        }
        return true;
    }
    /**
     * Get header value from request (case-insensitive)
     */ getHeader(request, headerName) {
        const value = request.headers[headerName.toLowerCase()];
        return Array.isArray(value) ? value[0] : value;
    }
    /**
     * Validate timestamp is within acceptable time window
     */ validateTimestamp(timestamp) {
        try {
            const requestTime = new Date(timestamp).getTime();
            const currentTime = Date.now();
            const diffSeconds = Math.abs(currentTime - requestTime) / 1000;
            if (diffSeconds > this.TIME_WINDOW_SECONDS) {
                throw new _common.UnauthorizedException(`Request timestamp outside acceptable window (${this.TIME_WINDOW_SECONDS}s)`);
            }
        } catch (error) {
            if (error instanceof _common.UnauthorizedException) {
                throw error;
            }
            throw new _common.UnauthorizedException('Invalid timestamp format');
        }
    }
    /**
     * Extract path and query from URL
     */ extractPathAndQuery(url) {
        // URL already includes path and query (e.g., "/api/v1/verify-test?foo=bar")
        // If it starts with full URL, parse it
        if (url.startsWith('http://') || url.startsWith('https://')) {
            try {
                const urlObj = new URL(url);
                return urlObj.pathname + urlObj.search;
            } catch  {
                return url;
            }
        }
        return url;
    }
    constructor(cryptoService){
        this.cryptoService = cryptoService;
        // TODO: Replace with database lookup once device enrollment is implemented
        // For now, using hardcoded public key for testing
        // You can generate a test key pair by running: node test.js
        this.HARDCODED_PUBLIC_KEY = 'MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEyw2fLJBv+YxDdd8ZTK795LX11MTcvhC0YZ2pTO84lsR+IllKguWHJ8ZxCF3a9VA3iw4LE1cGtElypNhWF2bFmA==';
        this.TIME_WINDOW_SECONDS = 10;
    }
};
SignatureGuard = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _cryptoservice.CryptoService === "undefined" ? Object : _cryptoservice.CryptoService
    ])
], SignatureGuard);

//# sourceMappingURL=signature.guard.js.map