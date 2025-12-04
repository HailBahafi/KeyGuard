"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "CryptoService", {
    enumerable: true,
    get: function() {
        return CryptoService;
    }
});
const _common = require("@nestjs/common");
const _crypto = require("crypto");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
let CryptoService = class CryptoService {
    /**
     * Verify ECDSA P-256 signature
     * 
     * @param publicKeyBase64 - Base64-encoded SPKI public key
     * @param signatureBase64 - Base64-encoded signature (IEEE-P1363 format)
     * @param payload - Canonical payload string that was signed
     * @returns true if signature is valid, false otherwise
     */ async verifySignature(publicKeyBase64, signatureBase64, payload) {
        try {
            // Import public key from Base64 SPKI format
            const publicKeyPEM = this.base64ToPEM(publicKeyBase64, 'PUBLIC KEY');
            // Convert signature from Base64 to Buffer
            const signatureBuffer = Buffer.from(signatureBase64, 'base64');
            // Convert IEEE-P1363 format (raw 64 bytes) to DER format
            const derSignature = this.p1363ToDER(signatureBuffer);
            // Create verifier for ECDSA with P-256 curve and SHA-256
            const verifier = (0, _crypto.createVerify)('SHA256');
            verifier.update(payload);
            verifier.end();
            // Verify the signature
            const isValid = verifier.verify({
                key: publicKeyPEM,
                format: 'pem',
                type: 'spki'
            }, derSignature);
            return isValid;
        } catch (error) {
            console.error('Signature verification failed:', error);
            return false;
        }
    }
    /**
     * Reconstruct the canonical payload that was signed by the client
     * 
     * Format: kg-v1|{timestamp}|{METHOD}|{pathAndQuery}|{bodySha256}|{nonce}|{apiKey}|{keyId}
     * 
     * @param params - Request parameters
     * @returns Canonical payload string
     */ reconstructPayload(params) {
        const normalizedMethod = params.method.toUpperCase();
        return `kg-v1|${params.timestamp}|${normalizedMethod}|${params.pathAndQuery}|${params.bodySha256}|${params.nonce}|${params.apiKey}|${params.keyId}`;
    }
    /**
     * Hash request body with SHA-256 and return Base64
     * 
     * @param body - Request body string
     * @returns Base64-encoded SHA-256 hash
     */ hashSha256(body) {
        const hash = (0, _crypto.createHash)('sha256');
        hash.update(body);
        return hash.digest('base64');
    }
    /**
     * Convert Base64-encoded key to PEM format
     * 
     * @param base64Key - Base64-encoded key
     * @param type - Key type (e.g., 'PUBLIC KEY', 'PRIVATE KEY')
     * @returns PEM-formatted key
     */ base64ToPEM(base64Key, type) {
        const pemHeader = `-----BEGIN ${type}-----`;
        const pemFooter = `-----END ${type}-----`;
        // Split into 64-character lines as per PEM standard
        const lines = [];
        for(let i = 0; i < base64Key.length; i += 64){
            lines.push(base64Key.substring(i, i + 64));
        }
        return `${pemHeader}\n${lines.join('\n')}\n${pemFooter}`;
    }
    /**
     * Convert IEEE-P1363 signature format to DER format
     * 
     * IEEE-P1363 is the raw format (r || s, each 32 bytes for P-256)
     * DER is the ASN.1 format required by Node.js crypto.verify
     * 
     * @param p1363Signature - IEEE-P1363 format signature (64 bytes)
     * @returns DER-encoded signature
     */ p1363ToDER(p1363Signature) {
        if (p1363Signature.length !== 64) {
            throw new Error('Invalid P-256 signature length (expected 64 bytes)');
        }
        // Extract r and s values (each 32 bytes)
        const r = p1363Signature.subarray(0, 32);
        const s = p1363Signature.subarray(32, 64);
        // Encode r and s as DER integers
        const rDER = this.encodeInteger(r);
        const sDER = this.encodeInteger(s);
        // Combine into DER sequence
        const sequenceLength = rDER.length + sDER.length;
        const der = Buffer.concat([
            Buffer.from([
                0x30,
                sequenceLength
            ]),
            rDER,
            sDER
        ]);
        return der;
    }
    /**
     * Encode a big-endian integer as DER
     * 
     * @param value - Integer value as Buffer
     * @returns DER-encoded integer
     */ encodeInteger(value) {
        // Remove leading zeros
        let trimmed = value;
        while(trimmed.length > 1 && trimmed[0] === 0x00){
            trimmed = trimmed.subarray(1);
        }
        // If the high bit is set, prepend 0x00 to indicate positive number
        const firstByte = trimmed[0];
        if (firstByte !== undefined && (firstByte & 0x80) !== 0) {
            trimmed = Buffer.concat([
                Buffer.from([
                    0x00
                ]),
                trimmed
            ]);
        }
        // INTEGER tag (0x02) followed by length and value
        return Buffer.concat([
            Buffer.from([
                0x02,
                trimmed.length
            ]),
            trimmed
        ]);
    }
};
CryptoService = _ts_decorate([
    (0, _common.Injectable)()
], CryptoService);

//# sourceMappingURL=crypto.service.js.map