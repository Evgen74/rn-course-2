"use strict";
const mobx = require("mobx");
function getAllPropertyDescriptors(obj) {
  const map = /* @__PURE__ */ new Map();
  let cur = obj;
  while (cur && cur !== Object.prototype) {
    for (const key of Reflect.ownKeys(cur)) {
      if (!map.has(key)) {
        const d = Object.getOwnPropertyDescriptor(cur, key);
        if (d) {
          map.set(key, d);
        }
      }
    }
    cur = Object.getPrototypeOf(cur);
  }
  return map;
}
const MAX_DEPTH = 3;
const MAX_ARRAY_LENGTH = 200;
const DANGEROUS_KEYS$1 = /* @__PURE__ */ new Set([
  "instance",
  "store",
  "raw",
  "original",
  "target",
  "root",
  "self"
]);
function toPlain(input, depth = MAX_DEPTH, seen = /* @__PURE__ */ new WeakSet(), isRoot = true) {
  var _a, _b;
  if (input === null || input === void 0) {
    return input;
  }
  if (typeof input === "function") {
    return "[fn]";
  }
  if (typeof input === "symbol") {
    return String(input);
  }
  if (typeof input === "bigint") {
    return `${String(input)}n`;
  }
  if (typeof input !== "object") {
    return input;
  }
  if (seen.has(input)) {
    return "[circular]";
  }
  seen.add(input);
  if ((_a = mobx.isObservable) == null ? void 0 : _a.call(mobx, input)) {
    try {
      return mobx.toJS(input, { detectCycles: true, exportMapsAsObjects: true });
    } catch {
    }
  }
  if (Array.isArray(input)) {
    return input.slice(0, MAX_ARRAY_LENGTH).map((v) => toPlain(v, depth - 1, seen, false));
  }
  if (depth <= 0) {
    return "[depth]";
  }
  if (input instanceof Date) {
    return input.toISOString();
  }
  if (input instanceof RegExp) {
    return String(input);
  }
  if (input instanceof Map) {
    const obj = {};
    for (const [k, v] of input.entries()) {
      obj[String(k)] = toPlain(v, depth - 1, seen, false);
    }
    return obj;
  }
  if (input instanceof Set) {
    return Array.from(input.values()).map((v) => toPlain(v, depth - 1, seen, false));
  }
  const ctorName = (_b = input == null ? void 0 : input.constructor) == null ? void 0 : _b.name;
  if (!isRoot && ctorName && /(Model|Store)$/i.test(ctorName)) {
    return `[ref:${ctorName}]`;
  }
  const out = {};
  const allDescriptors = getAllPropertyDescriptors(input);
  for (const [key, desc] of allDescriptors.entries()) {
    if (key === "constructor" || typeof desc.value === "function") {
      continue;
    }
    if (typeof key === "symbol") {
      continue;
    }
    const keyStr = String(key);
    if (DANGEROUS_KEYS$1.has(keyStr) || keyStr.startsWith("__") || keyStr.includes("Symbol") || keyStr.endsWith("_") || keyStr.startsWith("$")) {
      continue;
    }
    if (desc.get && !desc.set) {
      out[String(key)] = mobx.untracked(() => {
        try {
          return toPlain(
            input[key],
            depth - 1,
            seen,
            false
          );
        } catch {
          return "[error]";
        }
      });
    } else if (desc.value !== void 0) {
      try {
        out[String(key)] = toPlain(
          input[key],
          depth - 1,
          seen,
          false
        );
      } catch {
        out[String(key)] = "[error]";
      }
    } else if (desc.get && desc.set) {
      try {
        out[String(key)] = toPlain(
          input[key],
          depth - 1,
          seen,
          false
        );
      } catch {
        out[String(key)] = "[error]";
      }
    }
  }
  return out;
}
function detectFlow(fn) {
  if (typeof fn.isMobXFlow === "boolean") {
    return fn.isMobXFlow;
  }
  const s = Function.prototype.toString.call(fn);
  return /yield/.test(s) || /\[native code\].*flow/i.test(s) || /bound.*flow/i.test(fn.name);
}
function collectMethods(instance) {
  var _a;
  const prototypeMap = getAllPropertyDescriptors(Object.getPrototypeOf(instance));
  const instanceMap = getAllPropertyDescriptors(instance);
  const allDescriptors = new Map(prototypeMap);
  for (const [key, desc] of instanceMap.entries()) {
    if (!allDescriptors.has(key)) {
      allDescriptors.set(key, desc);
    }
  }
  const out = [];
  for (const [key, d] of allDescriptors.entries()) {
    if (key === "constructor") {
      continue;
    }
    const val = d.value;
    if (typeof val === "function") {
      const kind = ((_a = mobx.isAction) == null ? void 0 : _a.call(mobx, val)) ? "action" : detectFlow(val) ? "flow" : "method";
      out.push({ name: String(key), kind, arity: val.length });
    }
  }
  return out;
}
async function invokeMethod(instance, name, args = []) {
  var _a;
  const fn = instance[name];
  if (typeof fn !== "function") {
    throw new Error(`Method ${name} not found`);
  }
  const isAct = (_a = mobx.isAction) == null ? void 0 : _a.call(mobx, fn);
  const call = () => fn.apply(instance, args);
  const res = isAct ? mobx.runInAction(call) : call();
  return Promise.resolve(res);
}
function setNestedProperty(obj, path, value) {
  const keys = path.split(".");
  let current = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (!(key in current) || typeof current[key] !== "object" || current[key] === null) {
      current[key] = {};
    }
    current = current[key];
  }
  current[keys[keys.length - 1]] = value;
}
function patchState(instance, path, value) {
  const stateDesc = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(instance), "state") ?? Object.getOwnPropertyDescriptor(instance, "state");
  const hasStateGetter = !!(stateDesc == null ? void 0 : stateDesc.get);
  return mobx.runInAction(() => {
    if (hasStateGetter) {
      const st = instance.state;
      if (path === "state" && value && typeof value === "object") {
        for (const [k, v] of Object.entries(value)) {
          st[k] = v;
        }
        return;
      }
      const [head, ...rest] = path.split(".");
      const targetDesc = Object.getOwnPropertyDescriptor(st, head);
      if ((targetDesc == null ? void 0 : targetDesc.get) && !targetDesc.set && rest.length === 0) {
        throw new Error("read-only computed");
      }
      setNestedProperty(st, path.replace(/^state\./, ""), value);
    } else {
      const [head, ...rest] = path.split(".");
      const allDescriptors = getAllPropertyDescriptors(instance);
      const targetDesc = allDescriptors.get(head);
      if ((targetDesc == null ? void 0 : targetDesc.get) && !targetDesc.set && rest.length === 0) {
        throw new Error(`Cannot modify read-only computed property: ${head}`);
      }
      const cleanPath = path.replace(/^state\./, "");
      if (!cleanPath.includes(".")) {
        const propDesc = allDescriptors.get(cleanPath);
        if ((propDesc == null ? void 0 : propDesc.get) && !propDesc.set) {
          throw new Error(`Cannot modify read-only computed property: ${cleanPath}`);
        }
        instance[cleanPath] = value;
      } else {
        setNestedProperty(instance, cleanPath, value);
      }
    }
  });
}
const DANGEROUS_KEYS = /* @__PURE__ */ new Set([
  "instance",
  "store",
  "raw",
  "original",
  "target",
  "root",
  "self"
]);
function isPlainObject(v) {
  if (v === null || typeof v !== "object") {
    return false;
  }
  const proto = Object.getPrototypeOf(v);
  return proto === Object.prototype || proto === null;
}
function sanitizeForJson(input, options = {}) {
  var _a;
  const {
    depth = 3,
    seen = /* @__PURE__ */ new WeakSet(),
    trackComputed = true
  } = options;
  if (input === null || input === void 0) {
    return input;
  }
  const t = typeof input;
  if (t === "function") {
    return "[fn]";
  }
  if (t === "symbol") {
    return String(input);
  }
  if (t === "bigint") {
    return `${String(input)}n`;
  }
  if (t !== "object") {
    return input;
  }
  if (seen.has(input)) {
    return "[circular]";
  }
  seen.add(input);
  if (Array.isArray(input)) {
    if (depth <= 0) {
      return "[depth]";
    }
    return input.slice(0, 200).map((v) => sanitizeForJson(v, { depth: depth - 1, seen, trackComputed }));
  }
  const ctorName = (_a = input == null ? void 0 : input.constructor) == null ? void 0 : _a.name;
  if (!isPlainObject(input)) {
    if (input instanceof Date) {
      return input.toISOString();
    }
    if (input instanceof RegExp) {
      return String(input);
    }
    if (input instanceof Map) {
      const obj = {};
      for (const [k, v] of input.entries()) {
        obj[String(k)] = sanitizeForJson(v, {
          depth: depth - 1,
          seen,
          trackComputed
        });
      }
      return obj;
    }
    if (input instanceof Set) {
      return Array.from(input.values()).map(
        (v) => sanitizeForJson(v, { depth: depth - 1, seen, trackComputed })
      );
    }
    if (ctorName && /(Model|Store)$/i.test(ctorName)) {
      return `[ref:${ctorName}]`;
    }
  }
  if (depth <= 0) {
    return "[depth]";
  }
  const out = {};
  for (const k of Object.keys(input)) {
    if (DANGEROUS_KEYS.has(k) || k.startsWith("__")) {
      continue;
    }
    try {
      const desc = Object.getOwnPropertyDescriptor(input, k);
      const read = () => input[k];
      if ((desc == null ? void 0 : desc.get) && !desc.set) {
        if (trackComputed) {
          out[k] = sanitizeForJson(read(), {
            depth: depth - 1,
            seen,
            trackComputed
          });
        } else {
          const { untracked } = require("mobx");
          out[k] = untracked(
            () => sanitizeForJson(read(), { depth: depth - 1, seen, trackComputed })
          );
        }
      } else {
        out[k] = sanitizeForJson(read(), {
          depth: depth - 1,
          seen,
          trackComputed
        });
      }
    } catch {
      out[k] = "[error]";
    }
  }
  return out;
}
let disposeFocused = null;
let rafToken = null;
const enqueueSend = (send, event, payload) => {
  if (rafToken !== null) {
    return;
  }
  rafToken = requestAnimationFrame(() => {
    rafToken = null;
    send(event, payload);
  });
};
function watchFocusedStore(instance, storeId, send) {
  disposeFocused == null ? void 0 : disposeFocused();
  const stateDesc = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(instance), "state") ?? Object.getOwnPropertyDescriptor(instance, "state");
  const hasStateGetter = !!(stateDesc == null ? void 0 : stateDesc.get);
  disposeFocused = mobx.autorun(
    () => {
      const stateToWatch = hasStateGetter ? instance.state : instance;
      if (!hasStateGetter) {
        const descriptors = getAllPropertyDescriptors(stateToWatch);
        for (const [key, desc] of descriptors.entries()) {
          if (key === "constructor" || typeof desc.value === "function") {
            continue;
          }
          try {
            void stateToWatch[key];
          } catch {
          }
        }
      } else {
        const state = instance.state;
        if (state && typeof state === "object") {
          const descriptors = getAllPropertyDescriptors(state);
          for (const [key, desc] of descriptors.entries()) {
            if (key === "constructor" || typeof desc.value === "function") {
              continue;
            }
            try {
              void state[key];
            } catch {
            }
          }
        }
      }
      const snapshot = toPlain(stateToWatch, 3);
      enqueueSend(send, "STORE_DUMP", { storeId, state: snapshot });
    },
    { name: `mobx-debugger:watch:${storeId}` }
  );
}
function stopWatchingFocusedStore() {
  disposeFocused == null ? void 0 : disposeFocused();
  disposeFocused = null;
  if (rafToken !== null) {
    cancelAnimationFrame(rafToken);
    rafToken = null;
  }
}
class StoreRegistry {
  constructor() {
    this.stores = /* @__PURE__ */ new Map();
    this.listeners = /* @__PURE__ */ new Set();
    this.currentFocusedStoreId = null;
    this.sendFunction = null;
  }
  setSendFunction(sendFn) {
    this.sendFunction = sendFn;
  }
  extractMethods(store) {
    return collectMethods(store);
  }
  register(name, store) {
    const id = `${name}_${Date.now()}`;
    let state;
    const fields = {};
    const stateDesc = getAllPropertyDescriptors(store).get("state");
    if (stateDesc == null ? void 0 : stateDesc.get) {
      try {
        state = toPlain(store.state);
      } catch {
        state = "[error]";
      }
    } else {
      state = toPlain(store);
      const allProps = getAllPropertyDescriptors(store);
      for (const [key, desc] of allProps.entries()) {
        if (key !== "state" && typeof desc.value !== "function" && !desc.get) {
          fields[key] = desc.value;
        }
      }
    }
    const registered = {
      id,
      name,
      store,
      state,
      fields: Object.keys(fields).length > 0 ? fields : void 0,
      methods: this.extractMethods(store)
    };
    const disposer = mobx.autorun(
      () => {
        try {
          registered.state = (stateDesc == null ? void 0 : stateDesc.get) ? toPlain(store.state) : toPlain(store);
        } catch {
          registered.state = "[error]";
        }
        this.notifyListeners();
      },
      { name: `mobx-debugger:store:${id}` }
    );
    registered.disposer = disposer;
    this.stores.set(id, registered);
    this.notifyListeners();
    return () => {
      disposer();
      this.stores.delete(id);
      this.notifyListeners();
    };
  }
  getStores() {
    return Array.from(this.stores.values());
  }
  getStore(id) {
    return this.stores.get(id);
  }
  updateStoreValue(id, path, value) {
    const store = this.stores.get(id);
    if (!store) {
      return { ok: false, error: "Store not found" };
    }
    try {
      patchState(store.store, path, value);
      return { ok: true };
    } catch (error) {
      return { ok: false, error: error.message };
    }
  }
  focusStore(storeId) {
    if (this.currentFocusedStoreId === storeId) {
      return;
    }
    stopWatchingFocusedStore();
    const store = this.stores.get(storeId);
    if (!store || !this.sendFunction) {
      return;
    }
    this.currentFocusedStoreId = storeId;
    watchFocusedStore(store.store, storeId, this.sendFunction);
    this.sendFunction("STORE_METHODS", { storeId, methods: store.methods });
  }
  unfocusStore() {
    stopWatchingFocusedStore();
    this.currentFocusedStoreId = null;
  }
  getStoreDump(id) {
    const store = this.stores.get(id);
    if (!store) {
      return null;
    }
    return sanitizeForJson({
      id: store.id,
      meta: { name: store.name },
      state: store.state,
      fields: store.fields,
      methods: store.methods
    });
  }
  async callStoreMethod(id, methodName, parameters) {
    const store = this.stores.get(id);
    if (!store) {
      return { ok: false, error: "Store not found" };
    }
    try {
      const result = await invokeMethod(store.store, methodName, parameters);
      return { ok: true, result: sanitizeForJson(toPlain(result)) };
    } catch (error) {
      return { ok: false, error: error.message };
    }
  }
  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
  notifyListeners() {
    this.listeners.forEach((listener) => listener());
  }
  clear() {
    this.stores.forEach((store) => {
      var _a;
      return (_a = store.disposer) == null ? void 0 : _a.call(store);
    });
    this.stores.clear();
    this.notifyListeners();
  }
}
const storeRegistry = new StoreRegistry();
const connectStore = (name, store) => storeRegistry.register(name, store);
exports.useMobXDevTools = void 0;
exports.connectStore = void 0;
const isDev = process.env.NODE_ENV !== "production";
if (isDev) {
  exports.useMobXDevTools = require("./useMobXDevTools.cjs").useMobXDevTools;
  exports.connectStore = connectStore;
} else {
  exports.useMobXDevTools = () => null;
  exports.connectStore = () => () => {
  };
}
exports.sanitizeForJson = sanitizeForJson;
exports.storeRegistry = storeRegistry;
