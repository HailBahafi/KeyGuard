"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
const _testing = require("@nestjs/testing");
const _keyguardservice = require("./keyguard.service");
const _signatureverificationservice = require("./signature-verification.service");
const _prismaservice = require("../../../core/database/prisma.service");
const _common = require("@nestjs/common");
describe('KeyGuardService', ()=>{
    let service;
    let prismaService;
    let signatureService;
    const mockPrismaService = {
        prisma: {
            apiKey: {
                findFirst: jest.fn()
            },
            device: {
                findUnique: jest.fn(),
                findFirst: jest.fn(),
                findMany: jest.fn(),
                create: jest.fn(),
                update: jest.fn()
            },
            nonce: {
                findUnique: jest.fn(),
                create: jest.fn(),
                deleteMany: jest.fn()
            }
        }
    };
    const mockSignatureService = {
        validateAlgorithm: jest.fn(),
        validateTimestamp: jest.fn(),
        computeBodyHash: jest.fn(),
        extractPathAndQuery: jest.fn(),
        buildCanonicalPayload: jest.fn(),
        verifySignature: jest.fn()
    };
    beforeEach(async ()=>{
        const module = await _testing.Test.createTestingModule({
            providers: [
                _keyguardservice.KeyGuardService,
                {
                    provide: _prismaservice.PrismaService,
                    useValue: mockPrismaService
                },
                {
                    provide: _signatureverificationservice.SignatureVerificationService,
                    useValue: mockSignatureService
                }
            ]
        }).compile();
        service = module.get(_keyguardservice.KeyGuardService);
        prismaService = module.get(_prismaservice.PrismaService);
        signatureService = module.get(_signatureverificationservice.SignatureVerificationService);
        // Reset mocks
        jest.clearAllMocks();
    });
    it('should be defined', ()=>{
        expect(service).toBeDefined();
    });
    describe('enrollDevice', ()=>{
        const apiKey = 'kg_prod_123';
        const enrollDto = {
            publicKey: 'MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE...',
            keyId: 'key_abc123',
            deviceFingerprint: 'fingerprint123',
            label: "Ahmed's MacBook",
            userAgent: 'Mozilla/5.0...',
            metadata: {
                browser: 'Chrome'
            }
        };
        const mockProject = {
            id: 'project-uuid',
            keyPrefix: 'kg_prod',
            name: 'Test Project',
            status: 'ACTIVE',
            createdAt: new Date(),
            updatedAt: new Date()
        };
        it('should successfully enroll a device', async ()=>{
            mockPrismaService.prisma.apiKey.findFirst.mockResolvedValue(mockProject);
            mockPrismaService.prisma.device.findUnique.mockResolvedValue(null);
            mockPrismaService.prisma.device.create.mockResolvedValue({
                id: 'device-uuid',
                status: 'ACTIVE',
                createdAt: new Date(),
                ...enrollDto,
                apiKeyId: mockProject.id
            });
            const result = await service.enrollDevice(apiKey, enrollDto);
            expect(result).toEqual({
                id: 'device-uuid',
                status: 'ACTIVE',
                createdAt: expect.any(Date)
            });
            expect(mockPrismaService.prisma.apiKey.findFirst).toHaveBeenCalledWith({
                where: {
                    keyPrefix: 'kg_prod'
                }
            });
            expect(mockPrismaService.prisma.device.create).toHaveBeenCalled();
        });
        it('should throw error if API key is missing', async ()=>{
            await expect(service.enrollDevice('', enrollDto)).rejects.toThrow(_common.BadRequestException);
        });
        it('should throw error if API key is invalid', async ()=>{
            mockPrismaService.prisma.apiKey.findFirst.mockResolvedValue(null);
            await expect(service.enrollDevice(apiKey, enrollDto)).rejects.toThrow(_common.UnauthorizedException);
        });
        it('should throw error if API key is not active', async ()=>{
            mockPrismaService.prisma.apiKey.findFirst.mockResolvedValue({
                ...mockProject,
                status: 'INACTIVE'
            });
            await expect(service.enrollDevice(apiKey, enrollDto)).rejects.toThrow(_common.UnauthorizedException);
        });
        it('should throw error if device already enrolled', async ()=>{
            mockPrismaService.prisma.apiKey.findFirst.mockResolvedValue(mockProject);
            mockPrismaService.prisma.device.findUnique.mockResolvedValue({
                id: 'existing-device',
                keyId: enrollDto.keyId
            });
            await expect(service.enrollDevice(apiKey, enrollDto)).rejects.toThrow(_common.BadRequestException);
        });
        it('should throw error for invalid public key format', async ()=>{
            mockPrismaService.prisma.apiKey.findFirst.mockResolvedValue(mockProject);
            mockPrismaService.prisma.device.findUnique.mockResolvedValue(null);
            const invalidDto = {
                ...enrollDto,
                publicKey: 'invalid-key!!!'
            };
            await expect(service.enrollDevice(apiKey, invalidDto)).rejects.toThrow(_common.BadRequestException);
        });
        it('should throw error for public key that is too short', async ()=>{
            mockPrismaService.prisma.apiKey.findFirst.mockResolvedValue(mockProject);
            mockPrismaService.prisma.device.findUnique.mockResolvedValue(null);
            const invalidDto = {
                ...enrollDto,
                publicKey: 'ABC123'
            };
            await expect(service.enrollDevice(apiKey, invalidDto)).rejects.toThrow(_common.BadRequestException);
        });
    });
    describe('verifyRequest', ()=>{
        const headers = {
            apiKey: 'kg_prod_123',
            keyId: 'key_abc123',
            timestamp: '2025-12-02T10:30:00.000Z',
            nonce: 'nonce123',
            bodySha256: 'hash123',
            algorithm: 'ECDSA_P256_SHA256_P1363',
            signature: 'signature_base64'
        };
        const method = 'POST';
        const url = '/api/v1/verify-test';
        const rawBody = Buffer.from('{}');
        const mockProject = {
            id: 'project-uuid',
            keyPrefix: 'kg_prod',
            status: 'ACTIVE'
        };
        const mockDevice = {
            id: 'device-uuid',
            keyId: headers.keyId,
            publicKeySpkiBase64: 'public_key_base64',
            status: 'ACTIVE',
            apiKeyId: mockProject.id
        };
        beforeEach(()=>{
            mockSignatureService.validateAlgorithm.mockReturnValue(true);
            mockSignatureService.validateTimestamp.mockReturnValue(true);
            mockSignatureService.computeBodyHash.mockReturnValue(headers.bodySha256);
            mockSignatureService.extractPathAndQuery.mockReturnValue(url);
            mockSignatureService.buildCanonicalPayload.mockReturnValue('canonical_payload');
            mockSignatureService.verifySignature.mockResolvedValue(true);
        });
        it('should successfully verify request', async ()=>{
            mockPrismaService.prisma.apiKey.findFirst.mockResolvedValue(mockProject);
            mockPrismaService.prisma.device.findUnique.mockResolvedValue(mockDevice);
            mockPrismaService.prisma.nonce.findUnique.mockResolvedValue(null);
            mockPrismaService.prisma.nonce.create.mockResolvedValue({});
            mockPrismaService.prisma.device.update.mockResolvedValue(mockDevice);
            const result = await service.verifyRequest(headers, method, url, rawBody);
            expect(result).toEqual({
                valid: true,
                deviceId: mockDevice.id,
                keyId: mockDevice.keyId
            });
        });
        it('should reject invalid algorithm', async ()=>{
            mockSignatureService.validateAlgorithm.mockReturnValue(false);
            const result = await service.verifyRequest(headers, method, url, rawBody);
            expect(result).toEqual({
                valid: false,
                error: expect.stringContaining('algorithm')
            });
        });
        it('should reject invalid timestamp', async ()=>{
            mockSignatureService.validateTimestamp.mockReturnValue(false);
            const result = await service.verifyRequest(headers, method, url, rawBody);
            expect(result).toEqual({
                valid: false,
                error: expect.stringContaining('timestamp')
            });
        });
        it('should reject if device not found', async ()=>{
            mockPrismaService.prisma.apiKey.findFirst.mockResolvedValue(mockProject);
            mockPrismaService.prisma.device.findUnique.mockResolvedValue(null);
            const result = await service.verifyRequest(headers, method, url, rawBody);
            expect(result).toEqual({
                valid: false,
                error: expect.stringContaining('not found')
            });
        });
        it('should reject if device is not active', async ()=>{
            mockPrismaService.prisma.apiKey.findFirst.mockResolvedValue(mockProject);
            mockPrismaService.prisma.device.findUnique.mockResolvedValue({
                ...mockDevice,
                status: 'REVOKED'
            });
            const result = await service.verifyRequest(headers, method, url, rawBody);
            expect(result).toEqual({
                valid: false,
                error: expect.stringContaining('REVOKED')
            });
        });
        it('should reject replay attack (nonce reuse)', async ()=>{
            mockPrismaService.prisma.apiKey.findFirst.mockResolvedValue(mockProject);
            mockPrismaService.prisma.device.findUnique.mockResolvedValue(mockDevice);
            mockPrismaService.prisma.nonce.findUnique.mockResolvedValue({
                id: 'nonce-uuid',
                nonce: headers.nonce
            });
            const result = await service.verifyRequest(headers, method, url, rawBody);
            expect(result).toEqual({
                valid: false,
                error: expect.stringContaining('replay')
            });
        });
        it('should reject body hash mismatch', async ()=>{
            mockPrismaService.prisma.apiKey.findFirst.mockResolvedValue(mockProject);
            mockPrismaService.prisma.device.findUnique.mockResolvedValue(mockDevice);
            mockPrismaService.prisma.nonce.findUnique.mockResolvedValue(null);
            mockSignatureService.computeBodyHash.mockReturnValue('different_hash');
            const result = await service.verifyRequest(headers, method, url, rawBody);
            expect(result).toEqual({
                valid: false,
                error: expect.stringContaining('Body hash')
            });
        });
        it('should reject invalid signature', async ()=>{
            mockPrismaService.prisma.apiKey.findFirst.mockResolvedValue(mockProject);
            mockPrismaService.prisma.device.findUnique.mockResolvedValue(mockDevice);
            mockPrismaService.prisma.nonce.findUnique.mockResolvedValue(null);
            mockSignatureService.verifySignature.mockResolvedValue(false);
            const result = await service.verifyRequest(headers, method, url, rawBody);
            expect(result).toEqual({
                valid: false,
                error: expect.stringContaining('Invalid signature')
            });
        });
        it('should update lastSeenAt on successful verification', async ()=>{
            mockPrismaService.prisma.apiKey.findFirst.mockResolvedValue(mockProject);
            mockPrismaService.prisma.device.findUnique.mockResolvedValue(mockDevice);
            mockPrismaService.prisma.nonce.findUnique.mockResolvedValue(null);
            mockPrismaService.prisma.nonce.create.mockResolvedValue({});
            mockPrismaService.prisma.device.update.mockResolvedValue(mockDevice);
            await service.verifyRequest(headers, method, url, rawBody);
            expect(mockPrismaService.prisma.device.update).toHaveBeenCalledWith({
                where: {
                    id: mockDevice.id
                },
                data: {
                    lastSeenAt: expect.any(Date)
                }
            });
        });
    });
    describe('getDevice', ()=>{
        it('should return device by ID', async ()=>{
            const mockDevice = {
                id: 'device-uuid',
                keyId: 'key_abc',
                status: 'ACTIVE',
                apiKey: {
                    id: 'project-uuid',
                    name: 'Test Project'
                }
            };
            mockPrismaService.prisma.device.findUnique.mockResolvedValue(mockDevice);
            const result = await service.getDevice('device-uuid');
            expect(result).toEqual(mockDevice);
        });
        it('should throw error if device not found', async ()=>{
            mockPrismaService.prisma.device.findUnique.mockResolvedValue(null);
            await expect(service.getDevice('device-uuid')).rejects.toThrow(_common.NotFoundException);
        });
    });
    describe('listDevices', ()=>{
        it('should list all devices for an API key', async ()=>{
            const mockProject = {
                id: 'project-uuid',
                keyPrefix: 'kg_prod',
                status: 'ACTIVE'
            };
            const mockDevices = [
                {
                    id: 'device-1',
                    keyId: 'key_1',
                    status: 'ACTIVE'
                },
                {
                    id: 'device-2',
                    keyId: 'key_2',
                    status: 'REVOKED'
                }
            ];
            mockPrismaService.prisma.apiKey.findFirst.mockResolvedValue(mockProject);
            mockPrismaService.prisma.device.findMany.mockResolvedValue(mockDevices);
            const result = await service.listDevices('kg_prod_123');
            expect(result).toEqual(mockDevices);
            expect(mockPrismaService.prisma.device.findMany).toHaveBeenCalledWith({
                where: {
                    apiKeyId: mockProject.id
                },
                orderBy: {
                    createdAt: 'desc'
                }
            });
        });
    });
    describe('revokeDevice', ()=>{
        it('should revoke a device', async ()=>{
            const mockProject = {
                id: 'project-uuid',
                keyPrefix: 'kg_prod',
                status: 'ACTIVE'
            };
            const mockDevice = {
                id: 'device-uuid',
                keyId: 'key_abc',
                status: 'ACTIVE',
                apiKeyId: mockProject.id
            };
            mockPrismaService.prisma.apiKey.findFirst.mockResolvedValue(mockProject);
            mockPrismaService.prisma.device.findFirst.mockResolvedValue(mockDevice);
            mockPrismaService.prisma.device.update.mockResolvedValue({
                ...mockDevice,
                status: 'REVOKED'
            });
            const result = await service.revokeDevice('kg_prod_123', 'device-uuid');
            expect(result.status).toBe('REVOKED');
            expect(mockPrismaService.prisma.device.update).toHaveBeenCalledWith({
                where: {
                    id: 'device-uuid'
                },
                data: {
                    status: 'REVOKED'
                }
            });
        });
        it('should throw error if device not found', async ()=>{
            const mockProject = {
                id: 'project-uuid',
                keyPrefix: 'kg_prod',
                status: 'ACTIVE'
            };
            mockPrismaService.prisma.apiKey.findFirst.mockResolvedValue(mockProject);
            mockPrismaService.prisma.device.findFirst.mockResolvedValue(null);
            await expect(service.revokeDevice('kg_prod_123', 'device-uuid')).rejects.toThrow(_common.NotFoundException);
        });
    });
    describe('cleanupExpiredNonces', ()=>{
        it('should delete expired nonces', async ()=>{
            mockPrismaService.prisma.nonce.deleteMany.mockResolvedValue({
                count: 5
            });
            const count = await service.cleanupExpiredNonces();
            expect(count).toBe(5);
            expect(mockPrismaService.prisma.nonce.deleteMany).toHaveBeenCalledWith({
                where: {
                    expiresAt: {
                        lt: expect.any(Date)
                    }
                }
            });
        });
    });
});

//# sourceMappingURL=keyguard.service.spec.js.map