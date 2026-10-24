import { auth } from "@/lib/firebase";
import { liveApartments } from "../live";
import { sampleInput } from "../testing/fixtures";

jest.mock("@/lib/firebase", () => ({
  auth: {
    currentUser: null,
    authStateReady: jest.fn(() => Promise.resolve()),
  },
}));

const mockAuth = auth as unknown as {
  currentUser: { uid: string; getIdToken: () => Promise<string> } | null;
};

const ID = "6f1c2a7e-1111-4222-8333-944455556666";
const UID = "host-uid-1";

const row = {
  id: ID,
  name: "Escazú Loft",
  description: "Bright loft near the park.",
  price: 1100,
  warranty_deposit: 2200,
  address: sampleInput.address,
  coordinates: "(-84.06,9.93)",
  is_available: true,
  available_from: "2026-11-01T00:00:00+00:00",
  available_until: null,
  bedrooms: 2,
  bathrooms: 1,
  pet_friendly: false,
  created_at: "2026-10-21T12:00:00+00:00",
};

const images = (id = ID) => ({
  data: {
    safetrust_apartment_images: [
      { apartment_id: id, image_url: "https://example.com/a.jpg" },
      { apartment_id: "other", image_url: "https://example.com/x.jpg" },
      { apartment_id: id, image_url: "https://example.com/b.jpg" },
    ],
  },
});

const rows = (...items: object[]) => ({
  data: { safetrust_apartments: items },
});

type Call = { query: string; variables: Record<string, unknown> };

describe("liveApartments", () => {
  const fetchMock = jest.fn();
  const calls = (): Call[] =>
    fetchMock.mock.calls.map(([, init]) => JSON.parse(init.body));
  const respond = (...bodies: unknown[]) => {
    for (const body of bodies) {
      fetchMock.mockResolvedValueOnce({
        json: () => Promise.resolve(body),
      } as Response);
    }
  };
  const graphQLError = (message: string, code: string) => ({
    errors: [{ message, extensions: { code } }],
  });

  beforeEach(() => {
    fetchMock.mockReset();
    global.fetch = fetchMock;
    mockAuth.currentUser = {
      uid: UID,
      getIdToken: () => Promise.resolve("id-token"),
    };
  });

  it("is the live adapter", () => {
    expect(liveApartments.mode).toBe("live");
  });

  it("uses the backend's safetrust_ root fields and no nested images", async () => {
    respond(rows(row), images());
    await liveApartments.listMine();
    const [list, imageQuery] = calls();
    expect(list.query).toMatch(/\bsafetrust_apartments\(/);
    expect(list.query).not.toContain("apartment_images");
    expect(imageQuery.query).toMatch(/\bsafetrust_apartment_images\(/);
  });

  it("listMine filters by the signed-in owner and skips deleted rows", async () => {
    respond(rows(row), images());
    const list = await liveApartments.listMine();

    const [query, imageQuery] = calls();
    expect(query.query).toMatch(/owner_id:\s*\{\s*_eq:\s*\$ownerId\s*\}/);
    expect(query.query).toMatch(/deleted_at:\s*\{\s*_is_null:\s*true\s*\}/);
    expect(query.variables).toEqual({ ownerId: UID });
    expect(imageQuery.variables).toEqual({ ids: [ID] });
    expect(list).toHaveLength(1);
    expect(list[0]).toMatchObject({
      id: ID,
      imageUrls: ["https://example.com/a.jpg", "https://example.com/b.jpg"],
    });
  });

  it("listMine skips the image query when there are no apartments", async () => {
    respond(rows());
    await expect(liveApartments.listMine()).resolves.toEqual([]);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("listMine throws UNAUTHENTICATED without a user", async () => {
    mockAuth.currentUser = null;
    await expect(liveApartments.listMine()).rejects.toMatchObject({
      code: "UNAUTHENTICATED",
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("get filters by id and owner", async () => {
    respond(rows(row), images());
    const apartment = await liveApartments.get(ID);
    const [query] = calls();
    expect(query.query).toMatch(/owner_id:\s*\{\s*_eq:\s*\$ownerId\s*\}/);
    expect(query.variables).toEqual({ id: ID, ownerId: UID });
    expect(apartment?.coordinates).toEqual({ lat: 9.93, lng: -84.06 });
  });

  it("get returns null for another host's apartment", async () => {
    // Hasura lets hosts read published apartments; the owner filter hides them.
    respond(rows());
    await expect(liveApartments.get(ID)).resolves.toBeNull();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("get returns null for an id that is not a UUID, without a request", async () => {
    await expect(liveApartments.get("2")).resolves.toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("create inserts the apartment, then its images, then reads it back", async () => {
    respond(
      {
        data: {
          insert_safetrust_apartments_one: {
            id: ID,
            created_at: row.created_at,
          },
        },
      },
      { data: { insert_safetrust_apartment_images: { affected_rows: 2 } } },
      rows(row),
      images(),
    );

    const created = await liveApartments.create(sampleInput);

    expect(fetchMock).toHaveBeenCalledTimes(4);
    const [insert, imageInsert, read] = calls();
    expect(insert.query).toContain("insert_safetrust_apartments_one");
    expect(insert.query).toContain("safetrust_apartments_insert_input!");
    expect(insert.variables.object).toMatchObject({
      coordinates: "(-84.06,9.93)",
      warranty_deposit: 2200,
    });
    expect(insert.variables.object).not.toHaveProperty("owner_id");
    expect(imageInsert.query).toContain("insert_safetrust_apartment_images");
    expect(imageInsert.query).toContain(
      "safetrust_apartment_images_insert_input!",
    );
    expect(imageInsert.variables).toEqual({
      objects: [
        { apartment_id: ID, image_url: "https://example.com/a.jpg" },
        { apartment_id: ID, image_url: "https://example.com/b.jpg" },
      ],
    });
    expect(read.variables).toEqual({ id: ID, ownerId: UID });
    expect(created).toMatchObject({
      id: ID,
      coordinates: { lat: 9.93, lng: -84.06 },
      imageUrls: sampleInput.imageUrls,
    });

    for (const [, init] of fetchMock.mock.calls) {
      expect(init.headers.Authorization).toBe("Bearer id-token");
      expect(
        Object.keys(init.headers).map((name) => name.toLowerCase()),
      ).not.toContain("x-hasura-admin-secret");
    }
  });

  it("create soft-deletes the new apartment when the image insert fails", async () => {
    respond(
      {
        data: {
          insert_safetrust_apartments_one: {
            id: ID,
            created_at: row.created_at,
          },
        },
      },
      graphQLError("Images rejected", "permission-error"),
      { data: { update_safetrust_apartments: { affected_rows: 1 } } },
    );

    await expect(liveApartments.create(sampleInput)).rejects.toMatchObject({
      message: "Images rejected",
    });
    expect(fetchMock).toHaveBeenCalledTimes(3);
    const rollback = calls()[2];
    expect(rollback.query).toContain("update_safetrust_apartments");
    expect(rollback.query).toContain("deleted_at: $at");
    expect(rollback.variables.id).toBe(ID);
  });

  it("create skips the image insert when there are no images", async () => {
    respond(
      {
        data: {
          insert_safetrust_apartments_one: {
            id: ID,
            created_at: row.created_at,
          },
        },
      },
      rows(row),
      { data: { safetrust_apartment_images: [] } },
    );
    await liveApartments.create({ ...sampleInput, imageUrls: [] });
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(calls()[1].query).not.toContain("insert_safetrust_apartment_images");
  });

  it("update sets the fields, then replaces the images, then reads it back", async () => {
    respond(
      {
        data: {
          update_safetrust_apartments: {
            affected_rows: 1,
            returning: [{ created_at: row.created_at }],
          },
        },
      },
      {
        data: {
          delete_safetrust_apartment_images: { affected_rows: 2 },
          insert_safetrust_apartment_images: { affected_rows: 1 },
        },
      },
      rows(row),
      images(),
    );

    await liveApartments.update(ID, {
      ...sampleInput,
      imageUrls: ["https://example.com/c.jpg"],
    });

    const [update, replace, read] = calls();
    expect(update.query).toContain("update_safetrust_apartments");
    expect(update.query).toContain("safetrust_apartments_set_input!");
    expect(update.query).toMatch(/deleted_at:\s*\{\s*_is_null:\s*true\s*\}/);
    expect(update.query).not.toContain("apartment_images");
    expect(update.variables).toMatchObject({
      id: ID,
      set: { coordinates: "(-84.06,9.93)" },
    });
    expect(update.variables.set).not.toHaveProperty("owner_id");
    expect(replace.query).toContain("delete_safetrust_apartment_images");
    expect(replace.query).toContain("insert_safetrust_apartment_images");
    expect(replace.variables).toEqual({
      id: ID,
      images: [{ apartment_id: ID, image_url: "https://example.com/c.jpg" }],
    });
    expect(read.variables).toEqual({ id: ID, ownerId: UID });
  });

  it("update throws NOT_FOUND before touching images when no row matches", async () => {
    respond({
      data: {
        update_safetrust_apartments: { affected_rows: 0, returning: [] },
      },
    });
    await expect(liveApartments.update(ID, sampleInput)).rejects.toMatchObject({
      code: "NOT_FOUND",
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("update still succeeds when the read-back fails", async () => {
    respond(
      {
        data: {
          update_safetrust_apartments: {
            affected_rows: 1,
            returning: [{ created_at: row.created_at }],
          },
        },
      },
      {
        data: {
          delete_safetrust_apartment_images: { affected_rows: 0 },
          insert_safetrust_apartment_images: { affected_rows: 2 },
        },
      },
    );
    fetchMock.mockRejectedValueOnce(new TypeError("Failed to fetch"));

    await expect(liveApartments.update(ID, sampleInput)).resolves.toEqual({
      ...sampleInput,
      id: ID,
      createdAt: row.created_at,
      offers: 0,
    });
  });

  it("remove soft deletes with deleted_at", async () => {
    respond({ data: { update_safetrust_apartments: { affected_rows: 1 } } });
    await liveApartments.remove(ID);
    const [remove] = calls();
    expect(remove.query).toContain("deleted_at: $at");
    expect(remove.query).not.toMatch(/delete_safetrust_apartments/);
    expect(remove.variables.id).toBe(ID);
    expect(Number.isNaN(Date.parse(String(remove.variables.at)))).toBe(false);
  });

  it("remove throws NOT_FOUND when nothing was removed", async () => {
    respond({ data: { update_safetrust_apartments: { affected_rows: 0 } } });
    await expect(liveApartments.remove(ID)).rejects.toMatchObject({
      code: "NOT_FOUND",
    });
  });

  it("passes backend refusals through with their message", async () => {
    respond(graphQLError("Apartment has active reservations", "unexpected"));
    await expect(liveApartments.remove(ID)).rejects.toMatchObject({
      message: "Apartment has active reservations",
      code: "unexpected",
    });
  });

  it("maps constraint errors from create", async () => {
    respond(
      graphQLError(
        'violates check constraint "apartments_price_check"',
        "constraint-violation",
      ),
    );
    await expect(liveApartments.create(sampleInput)).rejects.toMatchObject({
      code: "constraint-violation",
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
