export const wrapResourcePayload = (
  singularName: string,
  data: Record<string, unknown>,
): Record<string, unknown> => {
  if (singularName in data) {
    return data;
  }

  return { [singularName]: data };
};

export const serializeJsonBody = (
  body: Record<string, unknown> | string | undefined,
): string | undefined => {
  if (body === undefined) {
    return undefined;
  }

  if (typeof body === "string") {
    return body;
  }

  return JSON.stringify(body);
};

export const parseJsonBody = (raw: string): unknown => {
  if (!raw.trim()) {
    return null;
  }

  return JSON.parse(raw) as unknown;
};
