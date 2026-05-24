import type { InfaktJsonEnvelope, InfaktMetaInfo } from "../types/common.types.js";

export const extractMetaInfo = (
  payload: InfaktJsonEnvelope,
): InfaktMetaInfo | undefined => payload.metainfo;

export const extractApiPayload = (payload: InfaktJsonEnvelope): unknown => {
  if (payload.entities !== undefined) {
    return payload.entities;
  }

  const { metainfo: _metainfo, error: _error, errors: _errors, ...rest } =
    payload;

  const keys = Object.keys(rest);
  if (keys.length === 1) {
    return rest[keys[0]!];
  }

  if (keys.length === 0) {
    return null;
  }

  return rest;
};

export const extractErrorMessage = (
  payload: InfaktJsonEnvelope,
  statusCode: number,
): string => {
  if (typeof payload.error === "string" && payload.error) {
    return payload.error;
  }

  if (typeof payload.errors === "string" && payload.errors) {
    return payload.errors;
  }

  if (payload.errors && typeof payload.errors === "object") {
    return JSON.stringify(payload.errors);
  }

  return `HTTP ${statusCode}`;
};

export type { InfaktJsonEnvelope };
