"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  DEFAULT_FILE_NAME: () => DEFAULT_FILE_NAME,
  asConfig: () => asConfig,
  localeFileSchema: () => localeFileSchema
});
module.exports = __toCommonJS(src_exports);
var import_zod = require("zod");
var localeFileSchema = import_zod.z.object({
  projectId: import_zod.z.string(),
  locales: import_zod.z.array(import_zod.z.string()),
  defaultLocale: import_zod.z.string(),
  keys: import_zod.z.object({}).catchall(
    import_zod.z.object({
      description: import_zod.z.string().optional(),
      params: import_zod.z.object({}).catchall(import_zod.z.string()).optional()
    })
  )
});
var asConfig = (config) => config;
var DEFAULT_FILE_NAME = "loccy.config.mjs";
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  DEFAULT_FILE_NAME,
  asConfig,
  localeFileSchema
});
