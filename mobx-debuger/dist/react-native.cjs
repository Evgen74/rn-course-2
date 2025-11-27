"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const reactNative = require("./react-native2.cjs");
Object.defineProperty(exports, "connectStore", {
  enumerable: true,
  get: () => reactNative.connectStore
});
exports.storeRegistry = reactNative.storeRegistry;
Object.defineProperty(exports, "useMobXDevTools", {
  enumerable: true,
  get: () => reactNative.useMobXDevTools
});
