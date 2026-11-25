import { auth } from "@/lib/firebase";
import { currentUid, gql, GraphQLError } from "./gql";

jest.mock("@/lib/firebase", () => ({
  auth: {
    currentUser: null,
    authStateReady: jest.fn(() => Promise.resolve()),
  },
}));

const mockAuth = auth as unknown as {
  currentUser: { uid?: string; getIdToken: () => Promise<string> } | null;
};

const jsonResponse = (body: unknown) =>
  Promise.resolve({ json: () => Promise.resolve(body) } as Response);

describe("gql", () => {
  const fetchMock = jest.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    global.fetch = fetchMock;
    mockAuth.currentUser = { getIdToken: () => Promise.resolve("id-token") };
  });

  it("posts the query with the user's ID token and returns data", async () => {
    fetchMock.mockReturnValue(jsonResponse({ data: { apartments: [] } }));

    await expect(
      gql("query Q { apartments { id } }", { a: 1 }),
    ).resolves.toEqual({ apartments: [] });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("http://localhost:8080/v1/graphql");
    expect(init.method).toBe("POST");
    expect(init.headers).toEqual({
      "Content-Type": "application/json",
      Authorization: "Bearer id-token",
    });
    expect(JSON.parse(init.body)).toEqual({
      query: "query Q { apartments { id } }",
      variables: { a: 1 },
    });
  });

  it("never sends an admin secret", async () => {
    fetchMock.mockReturnValue(jsonResponse({ data: {} }));
    await gql("query Q { x }");
    const headers = Object.keys(fetchMock.mock.calls[0][1].headers);
    expect(headers.map((name) => name.toLowerCase())).not.toContain(
      "x-hasura-admin-secret",
    );
  });

  it("throws UNAUTHENTICATED without a signed-in user", async () => {
    mockAuth.currentUser = null;
    const error = await gql("query Q { x }").catch((e: unknown) => e);
    expect(error).toBeInstanceOf(GraphQLError);
    expect(error).toMatchObject({
      message: "UNAUTHENTICATED",
      code: "UNAUTHENTICATED",
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("throws the first GraphQL error with its extensions code", async () => {
    fetchMock.mockReturnValue(
      jsonResponse({
        errors: [
          {
            message: "Check constraint violation",
            extensions: { code: "constraint-violation" },
          },
        ],
      }),
    );
    await expect(gql("mutation M { x }")).rejects.toMatchObject({
      name: "GraphQLError",
      message: "Check constraint violation",
      code: "constraint-violation",
    });
  });

  it("throws NETWORK when the request fails", async () => {
    fetchMock.mockRejectedValue(new TypeError("Failed to fetch"));
    await expect(gql("query Q { x }")).rejects.toMatchObject({
      message: "NETWORK",
      code: "NETWORK",
    });
  });

  it("throws NETWORK when the response is not JSON", async () => {
    fetchMock.mockReturnValue(
      Promise.resolve({
        json: () => Promise.reject(new SyntaxError("Unexpected token")),
      } as Response),
    );
    await expect(gql("query Q { x }")).rejects.toMatchObject({
      code: "NETWORK",
    });
  });

  it("currentUid returns the signed-in uid", async () => {
    mockAuth.currentUser = {
      uid: "host-1",
      getIdToken: () => Promise.resolve("t"),
    };
    await expect(currentUid()).resolves.toBe("host-1");
  });

  it("currentUid throws UNAUTHENTICATED without a user", async () => {
    mockAuth.currentUser = null;
    await expect(currentUid()).rejects.toMatchObject({
      code: "UNAUTHENTICATED",
    });
  });
});
