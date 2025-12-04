"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "TooManyRequestsException", {
    enumerable: true,
    get: function() {
        return TooManyRequestsException;
    }
});
const _common = require("@nestjs/common");
let TooManyRequestsException = class TooManyRequestsException extends _common.HttpException {
    constructor(remainingTime){
        super(remainingTime.toString(), _common.HttpStatus.TOO_MANY_REQUESTS); // Pass the custom status code
    }
};

//# sourceMappingURL=too-many-requests.exception.js.map