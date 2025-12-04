"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "PagedList", {
    enumerable: true,
    get: function() {
        return PagedList;
    }
});
let PagedList = class PagedList {
    static async create(queryFn, countFn, page, pageSize) {
        const [items, totalItems] = await Promise.all([
            queryFn,
            countFn
        ]);
        return new PagedList(items, page, pageSize, totalItems);
    }
    constructor(items, page, pageSize, totalItems){
        this.items = items;
        this.page = page;
        this.pageSize = pageSize;
        this.totalItems = totalItems;
        this.hasNextPage = page * pageSize < totalItems;
        this.hasPreviousPage = page > 1 && totalItems > 0;
    }
};

//# sourceMappingURL=paged-list.js.map