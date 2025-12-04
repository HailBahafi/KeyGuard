"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
const _testing = require("@nestjs/testing");
const _keyguardcontroller = require("./keyguard.controller");
const _keyguardservice = require("./services/keyguard.service");
const _common = require("@nestjs/common");
describe('KeyGuardController', ()=>{
    let controller;
    let service;
    const mockKeyGuardService = {
        enrollDevice: jest.fn(),
        verifyRequest: jest.fn(),
        getDevice: jest.fn(),
        listDevices: jest.fn(),
        revokeDevice: jest.fn()
    };
    beforeEach(async ()=>{
        const module = await _testing.Test.createTestingModule({
            controllers: [
                _keyguardcontroller.KeyGuardController
            ],
            providers: [
                {
                    provide: _keyguardservice.KeyGuardService,
                    useValue: mockKeyGuardService
                }
            ]
        }).compile();
        controller = module.get(_keyguardcontroller.KeyGuardController);
        service = module.get(_keyguardservice.KeyGuardService);
        jest.clearAllMocks();
    });
    it('should be defined', ()=>{
        expect(controller).toBeDefined();
    });
    describe('enroll', ()=>{
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
        it('should successfully enroll a device', async ()=>{
            const expectedResponse = {
                id: 'device-uuid',
                status: 'ACTIVE',
                createdAt: new Date()
            };
            mockKeyGuardService.enrollDevice.mockResolvedValue(expectedResponse);
            const result = await controller.enroll(apiKey, enrollDto);
            expect(result).toEqual(expectedResponse);
            expect(mockKeyGuardService.enrollDevice).toHaveBeenCalledWith(apiKey, enrollDto);
        });
        it('should throw error if API key header is missing', async ()=>{
            await expect(controller.enroll('', enrollDto)).rejects.toThrow(_common.BadRequestException);
            expect(mockKeyGuardService.enrollDevice).not.toHaveBeenCalled();
        });
    });
    describe('verifyTest', ()=>{
        const apiKey = 'kg_prod_123';
        const keyId = 'key_abc123';
        const timestamp = '2025-12-02T10:30:00.000Z';
        const nonce = 'nonce123';
        const bodySha256 = 'hash123';
        const algorithm = 'ECDSA_P256_SHA256_P1363';
        const signature = 'signature_base64';
        const mockRequest = {
            method: 'POST',
            url: '/api/v1/keyguard/verify-test',
            rawBody: Buffer.from('{}')
        };
        it('should successfully verify request', async ()=>{
            const expectedResponse = {
                valid: true,
                deviceId: 'device-uuid',
                keyId: 'key_abc123'
            };
            mockKeyGuardService.verifyRequest.mockResolvedValue(expectedResponse);
            const result = await controller.verifyTest(mockRequest, apiKey, keyId, timestamp, nonce, bodySha256, algorithm, signature, {});
            expect(result).toEqual(expectedResponse);
            expect(mockKeyGuardService.verifyRequest).toHaveBeenCalledWith({
                apiKey,
                keyId,
                timestamp,
                nonce,
                bodySha256,
                algorithm,
                signature
            }, 'POST', '/api/v1/keyguard/verify-test', mockRequest.rawBody);
        });
        it('should throw error if required headers are missing', async ()=>{
            await expect(controller.verifyTest(mockRequest, '', keyId, timestamp, nonce, bodySha256, algorithm, signature)).rejects.toThrow(_common.BadRequestException);
            expect(mockKeyGuardService.verifyRequest).not.toHaveBeenCalled();
        });
        it('should handle request without raw body', async ()=>{
            const requestWithoutBody = {
                method: 'POST',
                url: '/api/v1/keyguard/verify-test'
            };
            const expectedResponse = {
                valid: true,
                deviceId: 'device-uuid',
                keyId: 'key_abc123'
            };
            mockKeyGuardService.verifyRequest.mockResolvedValue(expectedResponse);
            const result = await controller.verifyTest(requestWithoutBody, apiKey, keyId, timestamp, nonce, bodySha256, algorithm, signature);
            expect(result).toEqual(expectedResponse);
            expect(mockKeyGuardService.verifyRequest).toHaveBeenCalledWith(expect.any(Object), 'POST', '/api/v1/keyguard/verify-test', null);
        });
        it('should validate all required headers', async ()=>{
            const testCases = [
                {
                    apiKey: '',
                    label: 'x-keyguard-api-key'
                },
                {
                    keyId: '',
                    label: 'x-keyguard-key-id'
                },
                {
                    timestamp: '',
                    label: 'x-keyguard-timestamp'
                },
                {
                    nonce: '',
                    label: 'x-keyguard-nonce'
                },
                {
                    bodySha256: '',
                    label: 'x-keyguard-body-sha256'
                },
                {
                    algorithm: '',
                    label: 'x-keyguard-alg'
                },
                {
                    signature: '',
                    label: 'x-keyguard-signature'
                }
            ];
            for (const testCase of testCases){
                const headers = {
                    apiKey: testCase.apiKey ?? apiKey,
                    keyId: testCase.keyId ?? keyId,
                    timestamp: testCase.timestamp ?? timestamp,
                    nonce: testCase.nonce ?? nonce,
                    bodySha256: testCase.bodySha256 ?? bodySha256,
                    algorithm: testCase.algorithm ?? algorithm,
                    signature: testCase.signature ?? signature
                };
                try {
                    await controller.verifyTest(mockRequest, headers.apiKey, headers.keyId, headers.timestamp, headers.nonce, headers.bodySha256, headers.algorithm, headers.signature);
                    fail(`Should have thrown error for missing ${testCase.label}`);
                } catch (error) {
                    expect(error).toBeInstanceOf(_common.BadRequestException);
                    expect(error.message).toContain(testCase.label);
                }
            }
        });
    });
    describe('getDevice', ()=>{
        const apiKey = 'kg_prod_123';
        const deviceId = 'device-uuid';
        it('should return device by ID', async ()=>{
            const expectedDevice = {
                id: deviceId,
                keyId: 'key_abc',
                status: 'ACTIVE',
                label: 'Test Device'
            };
            mockKeyGuardService.getDevice.mockResolvedValue(expectedDevice);
            const result = await controller.getDevice(apiKey, deviceId);
            expect(result).toEqual(expectedDevice);
            expect(mockKeyGuardService.getDevice).toHaveBeenCalledWith(deviceId);
        });
        it('should throw error if API key header is missing', async ()=>{
            await expect(controller.getDevice('', deviceId)).rejects.toThrow(_common.BadRequestException);
            expect(mockKeyGuardService.getDevice).not.toHaveBeenCalled();
        });
    });
    describe('listDevices', ()=>{
        const apiKey = 'kg_prod_123';
        it('should list all devices', async ()=>{
            const expectedDevices = [
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
            mockKeyGuardService.listDevices.mockResolvedValue(expectedDevices);
            const result = await controller.listDevices(apiKey);
            expect(result).toEqual(expectedDevices);
            expect(mockKeyGuardService.listDevices).toHaveBeenCalledWith(apiKey);
        });
        it('should throw error if API key header is missing', async ()=>{
            await expect(controller.listDevices('')).rejects.toThrow(_common.BadRequestException);
            expect(mockKeyGuardService.listDevices).not.toHaveBeenCalled();
        });
    });
    describe('revokeDevice', ()=>{
        const apiKey = 'kg_prod_123';
        const deviceId = 'device-uuid';
        it('should revoke a device', async ()=>{
            const expectedDevice = {
                id: deviceId,
                keyId: 'key_abc',
                status: 'REVOKED'
            };
            mockKeyGuardService.revokeDevice.mockResolvedValue(expectedDevice);
            const result = await controller.revokeDevice(apiKey, deviceId);
            expect(result).toEqual(expectedDevice);
            expect(mockKeyGuardService.revokeDevice).toHaveBeenCalledWith(apiKey, deviceId);
        });
        it('should throw error if API key header is missing', async ()=>{
            await expect(controller.revokeDevice('', deviceId)).rejects.toThrow(_common.BadRequestException);
            expect(mockKeyGuardService.revokeDevice).not.toHaveBeenCalled();
        });
    });
});

//# sourceMappingURL=keyguard.controller.spec.js.map