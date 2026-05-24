import { describe, expect, it, mock } from "bun:test";
import { InfaktClient } from "../src/client.js";

const credentials = {
  apiKey: "test-api-key",
};

describe("InfaktClient", () => {
  it("sends X-inFakt-ApiKey header and JSON accept header", async () => {
    const fetchMock = mock(
      async (_url: string, _init?: RequestInit): Promise<Response> => {
        return new Response(
          JSON.stringify({
            metainfo: { count: 0, total_count: 0 },
            entities: [],
          }),
          { status: 200 },
        );
      },
    );

    const client = new InfaktClient({
      credentials,
      fetch: fetchMock as unknown as typeof fetch,
    });

    await client.request("GET", "clients.json");

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const firstCall = fetchMock.mock.calls[0];
    if (!firstCall) {
      throw new Error("Expected fetch mock to be called");
    }
    const [url, init] = firstCall;
    expect(url).toContain("clients.json");
    expect(init).toBeDefined();
    expect(init?.headers).toBeInstanceOf(Headers);
    const headers = init!.headers as Headers;
    expect(headers.get("X-inFakt-ApiKey")).toBe("test-api-key");
    expect(headers.get("Accept")).toBe("application/json");
  });

  it("throws InfaktApiError on HTTP error responses", async () => {
    const fetchMock = mock(
      async (_url: string, _init?: RequestInit): Promise<Response> => {
        return new Response(
          JSON.stringify({ error: "Unauthorized" }),
          { status: 401 },
        );
      },
    );

    const client = new InfaktClient({
      credentials,
      fetch: fetchMock as unknown as typeof fetch,
    });

    await expect(client.request("GET", "clients.json")).rejects.toMatchObject({
      name: "InfaktApiError",
      statusCode: 401,
    });
  });

  it("extracts entities from list responses", async () => {
    const fetchMock = mock(
      async (_url: string, _init?: RequestInit): Promise<Response> => {
        return new Response(
          JSON.stringify({
            metainfo: { count: 1, total_count: 1 },
            entities: [{ id: 1, company_name: "Acme" }],
          }),
          { status: 200 },
        );
      },
    );

    const client = new InfaktClient({
      credentials,
      fetch: fetchMock as unknown as typeof fetch,
    });

    const response = await client.request("GET", "clients.json");
    expect(response.data).toEqual([{ id: 1, company_name: "Acme" }]);
    expect(response.metainfo?.count).toBe(1);
  });
});
