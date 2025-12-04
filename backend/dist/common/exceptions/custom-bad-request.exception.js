"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "CustomBadRequestException", {
    enumerable: true,
    get: function() {
        return CustomBadRequestException;
    }
});
const _common = require("@nestjs/common");
let CustomBadRequestException = class CustomBadRequestException extends _common.BadRequestException {
    constructor(property, constraint){
        super({
            message: [
                {
                    property,
                    constraints: {
                        [constraint]: constraint
                    }
                }
            ]
        });
    }
};

//# sourceMappingURL=custom-bad-request.exception.js.map