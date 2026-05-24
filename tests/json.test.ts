import { describe, expect, it } from "bun:test";
import { extractApiPayload, extractErrorMessage } from "../src/json/parser.js";
import { wrapResourcePayload } from "../src/json/serializer.js";

describe("JSON serialization", () => {
  it("wraps resource payload in singular key", () => {
    expect(
      wrapResourcePayload("client", { company_name: "Acme Sp. z o.o." }),
    ).toEqual({
      client: { company_name: "Acme Sp. z o.o." },
    });
  });

  it("does not double-wrap when singular key already present", () => {
    const payload = { client: { company_name: "Acme" } };
    expect(wrapResourcePayload("client", payload)).toEqual(payload);
  });
});

describe("JSON parsing", () => {
  it("extracts entities from list envelope", () => {
    expect(
      extractApiPayload({
        metainfo: { count: 2, total_count: 2 },
        entities: [{ id: 1 }, { id: 2 }],
      }),
    ).toEqual([{ id: 1 }, { id: 2 }]);
  });

  it("extracts single resource from envelope", () => {
    expect(
      extractApiPayload({
        client: { id: 1, company_name: "Acme" },
      }),
    ).toEqual({ id: 1, company_name: "Acme" });
  });

  it("extracts error message from error field", () => {
    expect(
      extractErrorMessage({ error: "Invalid API key" }, 401),
    ).toBe("Invalid API key");
  });
});
