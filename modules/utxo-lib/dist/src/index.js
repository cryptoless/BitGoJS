"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.networks = exports.address = exports.coins = exports.bitgo = exports.classify = void 0;
__exportStar(require("bitcoinjs-lib"), exports);
exports.classify = require("bitcoinjs-lib/src/classify");
exports.bitgo = require("./bitgo");
exports.coins = require("./coins");
exports.address = require("./address");
exports.networks = require('./networks');
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OztBQUFBLGdEQUE4QjtBQUM5Qix5REFBdUQ7QUFFdkQsbUNBQWlDO0FBQ2pDLG1DQUFpQztBQUVqQyx1Q0FBcUM7QUFFeEIsUUFBQSxRQUFRLEdBQUcsT0FBTyxDQUFDLFlBQVksQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0ICogZnJvbSAnYml0Y29pbmpzLWxpYic7XG5leHBvcnQgKiBhcyBjbGFzc2lmeSBmcm9tICdiaXRjb2luanMtbGliL3NyYy9jbGFzc2lmeSc7XG5cbmV4cG9ydCAqIGFzIGJpdGdvIGZyb20gJy4vYml0Z28nO1xuZXhwb3J0ICogYXMgY29pbnMgZnJvbSAnLi9jb2lucyc7XG5cbmV4cG9ydCAqIGFzIGFkZHJlc3MgZnJvbSAnLi9hZGRyZXNzJztcblxuZXhwb3J0IGNvbnN0IG5ldHdvcmtzID0gcmVxdWlyZSgnLi9uZXR3b3JrcycpO1xuXG5leHBvcnQgeyBOZXR3b3JrLCBaY2FzaE5ldHdvcmssIEJpdGNvaW5DYXNoTmV0d29yayB9IGZyb20gJy4vbmV0d29ya1R5cGVzJztcbmV4cG9ydCB7IE5ldHdvcmsgYXMgQml0Y29pbkpTTmV0d29yayB9IGZyb20gJ2JpdGNvaW5qcy1saWInO1xuIl19