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
    get default () {
        return _default;
    },
    get settings () {
        return config;
    }
});
const _zod = require("zod");
const _schema = require("./schema");
const _env = require("./env");
const validateEnvironmentVariables = ()=>{
    try {
        return _schema.configurationSchema.parse(_env.environmentVariables);
    } catch (error) {
        if (error instanceof _zod.z.ZodError) {
            console.error('\n❌ Environment variables validation failed:');
            console.error('━'.repeat(50));
            error.issues.forEach((issue)=>{
                console.error(`\n🔸 Variable: ${issue.path.join('.')}`);
                console.error(`   Error: ${issue.message}`);
            });
            console.error('━'.repeat(50));
            process.exit(1);
        }
        throw error;
    }
};
const config = validateEnvironmentVariables();
const _default = config;

//# sourceMappingURL=index.js.map