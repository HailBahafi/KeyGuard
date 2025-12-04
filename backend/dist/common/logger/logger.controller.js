"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "LoggerController", {
    enumerable: true,
    get: function() {
        return LoggerController;
    }
});
const _common = require("@nestjs/common");
const _paginationdto = require("../base/pagination.dto");
const _loggerservice = require("./logger.service");
const _rolesdecorator = require("../decorators/roles.decorator");
const _enums = require("../../generated/enums");
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
let LoggerController = class LoggerController {
    findAll(query) {
        return this.loggerService.findAll(query);
    }
    constructor(loggerService){
        this.loggerService = loggerService;
    }
};
_ts_decorate([
    (0, _common.Get)(),
    (0, _rolesdecorator.RequiredRoles)(_enums.UserRole.ADMIN),
    _ts_param(0, (0, _common.Query)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _paginationdto.PaginationDto === "undefined" ? Object : _paginationdto.PaginationDto
    ]),
    _ts_metadata("design:returntype", void 0)
], LoggerController.prototype, "findAll", null);
LoggerController = _ts_decorate([
    (0, _common.Controller)('logger'),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _loggerservice.LoggerService === "undefined" ? Object : _loggerservice.LoggerService
    ])
], LoggerController);

//# sourceMappingURL=logger.controller.js.map