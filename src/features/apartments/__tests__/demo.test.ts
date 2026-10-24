import { MOCK_APARTMENTS } from "@/lib/mockData/apartments";
import { demoApartments, resetDemoApartments } from "../demo";
import { sampleInput } from "../testing/fixtures";

describe("demoApartments", () => {
  beforeEach(() => resetDemoApartments());

  it("is the demo adapter", () => {
    expect(demoApartments.mode).toBe("demo");
  });

  it("is seeded from the mock apartments with string ids", async () => {
    const list = await demoApartments.listMine();
    expect(list.map((apartment) => apartment.id).sort()).toEqual(
      MOCK_APARTMENTS.map((apartment) => apartment.id).sort(),
    );
    const first = list.find((apartment) => apartment.id === "1");
    expect(first).toMatchObject({
      name: "La Sabana Sur Studio",
      warrantyDeposit: 2400,
      petFriendly: true,
      imageUrls: ["/img/room1.png"],
    });
  });

  it("seeds coordinates so seeded apartments can be edited", async () => {
    const list = await demoApartments.listMine();
    expect(list.every((apartment) => apartment.coordinates !== null)).toBe(
      true,
    );
  });

  it("lists an apartment after it is created", async () => {
    const created = await demoApartments.create(sampleInput);
    expect(typeof created.id).toBe("string");
    expect(created).toMatchObject({ ...sampleInput, offers: 0 });
    const list = await demoApartments.listMine();
    expect(list[0]).toEqual(created);
    await expect(demoApartments.get(created.id)).resolves.toEqual(created);
  });

  it("updates an apartment", async () => {
    const updated = await demoApartments.update("2", {
      ...sampleInput,
      name: "Renamed",
    });
    expect(updated).toMatchObject({ id: "2", name: "Renamed" });
    await expect(demoApartments.get("2")).resolves.toMatchObject({
      name: "Renamed",
    });
  });

  it("does not list an apartment after it is removed", async () => {
    await demoApartments.remove("3");
    const list = await demoApartments.listMine();
    expect(list.map((apartment) => apartment.id)).not.toContain("3");
    await expect(demoApartments.get("3")).resolves.toBeNull();
  });

  it("returns null for an unknown id", async () => {
    await expect(demoApartments.get("does-not-exist")).resolves.toBeNull();
  });

  it("rejects updates and removals of unknown ids", async () => {
    await expect(
      demoApartments.update("does-not-exist", sampleInput),
    ).rejects.toThrow("Apartment not found");
    await expect(demoApartments.remove("does-not-exist")).rejects.toThrow(
      "Apartment not found",
    );
  });

  it("returns copies, so callers can't change the store", async () => {
    const first = await demoApartments.get("1");
    first!.imageUrls.push("https://example.com/mutated.jpg");
    first!.address.city = "Mutated";
    await expect(demoApartments.get("1")).resolves.toMatchObject({
      imageUrls: ["/img/room1.png"],
      address: { city: "San José" },
    });
  });
});
