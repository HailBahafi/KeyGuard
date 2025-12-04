"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "UsersController", {
    enumerable: true,
    get: function() {
        return UsersController;
    }
});
const _common = require("@nestjs/common");
const _currentuserdecorator = require("../../common/decorators/current-user.decorator");
const _rolesdecorator = require("../../common/decorators/roles.decorator");
const _enums = require("../../generated/enums");
const _queryuserdto = require("./dto/query-user.dto");
const _updateprofiledto = require("./dto/update-profile.dto");
const _usersservice = require("./users.service");
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
let UsersController = class UsersController {
    findAll(query) {
        return this.usersService.findAll(query);
    }
    findProfile(user) {
        return this.usersService.findProfile(user);
    }
    updateProfile(user, updateProfileDto) {
        return this.usersService.updateProfile(user, updateProfileDto);
    }
    constructor(usersService){
        this.usersService = usersService;
    }
};
_ts_decorate([
    (0, _common.Get)(),
    (0, _rolesdecorator.RequiredRoles)(_enums.UserRole.ADMIN),
    _ts_param(0, (0, _common.Query)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _queryuserdto.QueryUserDto === "undefined" ? Object : _queryuserdto.QueryUserDto
    ]),
    _ts_metadata("design:returntype", void 0)
], UsersController.prototype, "findAll", null);
_ts_decorate([
    (0, _common.Get)('profile'),
    _ts_param(0, (0, _currentuserdecorator.CurrentUser)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _currentuserdecorator.CurrentUserType === "undefined" ? Object : _currentuserdecorator.CurrentUserType
    ]),
    _ts_metadata("design:returntype", void 0)
], UsersController.prototype, "findProfile", null);
_ts_decorate([
    (0, _common.Patch)('profile'),
    _ts_param(0, (0, _currentuserdecorator.CurrentUser)()),
    _ts_param(1, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _currentuserdecorator.CurrentUserType === "undefined" ? Object : _currentuserdecorator.CurrentUserType,
        typeof _updateprofiledto.UpdateProfileDto === "undefined" ? Object : _updateprofiledto.UpdateProfileDto
    ]),
    _ts_metadata("design:returntype", void 0)
], UsersController.prototype, "updateProfile", null);
UsersController = _ts_decorate([
    (0, _common.Controller)('users'),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _usersservice.UsersService === "undefined" ? Object : _usersservice.UsersService
    ])
], UsersController);

//# sourceMappingURL=users.controller.js.map