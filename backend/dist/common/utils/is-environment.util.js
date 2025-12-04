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
    get isDevelopment () {
        return isDevelopment;
    },
    get isProduction () {
        return isProduction;
    },
    get isStaging () {
        return isStaging;
    },
    get isTest () {
        return isTest;
    }
});
const _index = /*#__PURE__*/ _interop_require_default(require("../config/index"));
const _nodeenv = require("../config/constants/node.env");
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
const isDevelopment = ()=>_index.default.NODE_ENV === _nodeenv.NodeEnv.DEV;
const isProduction = ()=>_index.default.NODE_ENV === _nodeenv.NodeEnv.PROD;
const isTest = ()=>_index.default.NODE_ENV === _nodeenv.NodeEnv.TEST;
const isStaging = ()=>_index.default.NODE_ENV === _nodeenv.NodeEnv.STAGING;

//# sourceMappingURL=is-environment.util.js.map