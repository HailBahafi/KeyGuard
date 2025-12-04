"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "UsersService", {
    enumerable: true,
    get: function() {
        return UsersService;
    }
});
const _common = require("@nestjs/common");
const _hashingutil = require("../../common/utils/hashing.util");
const _prismaservice = require("../../core/database/prisma.service");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let UsersService = class UsersService {
    async findAll(query) {
        return await this.prismaService.prisma.user.findMany({
            skip: (query.offset - 1) * query.limit,
            take: query.limit
        });
    }
    findProfile(user) {
        const { password, ...data } = user;
        return data;
    }
    async updateProfile(user, updateProfileDto) {
        const { oldPassword, newPassword, ...rest } = updateProfileDto;
        const userExist = await this.prismaService.prisma.user.findFirst({
            where: {
                OR: [
                    {
                        email: updateProfileDto.email
                    },
                    {
                        username: updateProfileDto.username
                    }
                ]
            }
        });
        if (userExist && userExist.id !== user.id) throw new _common.BadRequestException('email or username already exists');
        const data = {
            ...rest
        };
        if (oldPassword && newPassword) {
            await _hashingutil.Hashing.compareOrFail(oldPassword, user.password, 'password is not correct');
            const hashedPassword = await _hashingutil.Hashing.hash(newPassword);
            data.password = hashedPassword;
        }
        const updatedUser = await this.prismaService.prisma.user.update({
            where: {
                id: user.id
            },
            data: {
                ...data
            }
        });
        return updatedUser;
    }
    constructor(prismaService){
        this.prismaService = prismaService;
    }
};
UsersService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService
    ])
], UsersService);

//# sourceMappingURL=users.service.js.map