"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "AuthModule", {
    enumerable: true,
    get: function() {
        return AuthModule;
    }
});
const _common = require("@nestjs/common");
const _passport = require("@nestjs/passport");
const _jwt = require("@nestjs/jwt");
const _authservice = require("./auth.service");
const _authcontroller = require("./auth.controller");
const _usersmodule = require("../../modules/users/users.module");
const _core = require("@nestjs/core");
const _jwtstrategy = require("./jwt.strategy");
const _jwtauthguard = require("./jwt-auth.guard");
const _permissionguard = require("./permissions/permission.guard");
const _index = /*#__PURE__*/ _interop_require_default(require("../../common/config/index"));
const _config = require("@nestjs/config");
const _roleguard = require("./roles/role.guard");
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
let AuthModule = class AuthModule {
};
AuthModule = _ts_decorate([
    (0, _common.Module)({
        providers: [
            _authservice.AuthService,
            _jwtstrategy.JwtStrategy,
            {
                provide: _core.APP_GUARD,
                useClass: _jwtauthguard.JwtAuthGuard
            },
            {
                provide: _core.APP_GUARD,
                useClass: _permissionguard.PermissionsGuard
            },
            {
                provide: _core.APP_GUARD,
                useClass: _roleguard.RolesGuard
            }
        ],
        imports: [
            _passport.PassportModule,
            _usersmodule.UsersModule,
            _config.ConfigModule.forRoot({
                isGlobal: true
            }),
            _jwt.JwtModule.register({
                secret: _index.default.JWT_SECRET_KEY,
                signOptions: {
                    expiresIn: '7d'
                }
            })
        ],
        controllers: [
            _authcontroller.AuthController
        ],
        exports: [
            _authservice.AuthService
        ]
    })
], AuthModule);

//# sourceMappingURL=auth.module.js.map