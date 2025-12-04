"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "PermissionsGuard", {
    enumerable: true,
    get: function() {
        return PermissionsGuard;
    }
});
const _common = require("@nestjs/common");
const _core = require("@nestjs/core");
const _permissiondecorator = require("../../../common/decorators/permission.decorator");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let PermissionsGuard = class PermissionsGuard {
    canActivate(context) {
        const requiredPermissions = this.reflector.getAllAndOverride(_permissiondecorator.PERMISSIONS_KEY, [
            context.getHandler(),
            context.getClass()
        ]);
        if (!requiredPermissions) {
            return true;
        }
        const { user } = context.switchToHttp().getRequest();
        return requiredPermissions.some((permission)=>user?.permissions?.some((p)=>p?.name === permission));
    }
    constructor(reflector){
        this.reflector = reflector;
    }
};
PermissionsGuard = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _core.Reflector === "undefined" ? Object : _core.Reflector
    ])
], PermissionsGuard);

//# sourceMappingURL=permission.guard.js.map