"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: Object.getOwnPropertyDescriptor(all, name).get
    });
}
_export(exports, {
    get PERMISSIONS_KEY () {
        return PERMISSIONS_KEY;
    },
    get RequirePermissions () {
        return RequirePermissions;
    }
});
const _common = require("@nestjs/common");
const PERMISSIONS_KEY = 'permissions';
const RequirePermissions = (...permissions)=>(0, _common.SetMetadata)(PERMISSIONS_KEY, permissions);

//# sourceMappingURL=permission.decorator.js.map