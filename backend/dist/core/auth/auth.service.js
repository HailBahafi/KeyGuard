"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "AuthService", {
    enumerable: true,
    get: function() {
        return AuthService;
    }
});
const _common = require("@nestjs/common");
const _jwt = require("@nestjs/jwt");
const _dayjs = /*#__PURE__*/ _interop_require_default(require("dayjs"));
const _hashingutil = require("../../common/utils/hashing.util");
const _prismaservice = require("../database/prisma.service");
const _enums = require("../../generated/enums");
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
let AuthService = class AuthService {
    async login(loginDto) {
        const user = await this.prismaService.prisma.user.findFirst({
            where: {
                OR: [
                    {
                        email: loginDto.email
                    },
                    {
                        username: loginDto.username
                    }
                ]
            },
            select: {
                id: true,
                username: true,
                password: true
            }
        });
        if (!user) throw new _common.BadRequestException('username or email is incorrect');
        await _hashingutil.Hashing.compareOrFail(loginDto.password, user.password);
        const payload = {
            id: user.id,
            username: user.username
        };
        await this.prismaService.prisma.user.update({
            where: {
                id: user.id
            },
            data: {
                lastLogin: (0, _dayjs.default)().toDate()
            }
        });
        return {
            id: user.id,
            token: await this.jwtService.signAsync(payload, {
                expiresIn: '7d'
            })
        };
    }
    async signup(signupDto) {
        const user = await this.prismaService.prisma.user.findFirst({
            where: {
                OR: [
                    {
                        email: signupDto.email
                    },
                    {
                        username: signupDto.username
                    }
                ]
            },
            select: {
                id: true
            }
        });
        if (user) throw new _common.ConflictException('User already exists');
        const hashedPassword = await _hashingutil.Hashing.hash(signupDto.password);
        const newUser = await this.prismaService.prisma.user.create({
            data: {
                ...signupDto,
                password: hashedPassword,
                role: _enums.UserRole.SELLER,
                lastLogin: (0, _dayjs.default)().toDate()
            },
            select: {
                id: true,
                username: true
            }
        });
        const userPayload = {
            id: newUser.id,
            username: newUser.username
        };
        return {
            id: newUser.id,
            token: this.jwtService.sign(userPayload, {
                expiresIn: '7d'
            })
        };
    }
    constructor(jwtService, prismaService){
        this.jwtService = jwtService;
        this.prismaService = prismaService;
    }
};
AuthService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _jwt.JwtService === "undefined" ? Object : _jwt.JwtService,
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService
    ])
], AuthService);

//# sourceMappingURL=auth.service.js.map