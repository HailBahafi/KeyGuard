"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "UpdateProfileDto", {
    enumerable: true,
    get: function() {
        return UpdateProfileDto;
    }
});
const _classvalidator = require("class-validator");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let UpdateProfileDto = class UpdateProfileDto {
};
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    (0, _classvalidator.IsEmail)(),
    _ts_metadata("design:type", String)
], UpdateProfileDto.prototype, "email", void 0);
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], UpdateProfileDto.prototype, "username", void 0);
_ts_decorate([
    (0, _classvalidator.ValidateIf)((o)=>o.newPassword),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], UpdateProfileDto.prototype, "oldPassword", void 0);
_ts_decorate([
    (0, _classvalidator.ValidateIf)((o)=>o.oldPassword),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsStrongPassword)(),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], UpdateProfileDto.prototype, "newPassword", void 0);
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsPhoneNumber)(),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], UpdateProfileDto.prototype, "phone", void 0);
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], UpdateProfileDto.prototype, "avatar", void 0);

//# sourceMappingURL=update-profile.dto.js.map