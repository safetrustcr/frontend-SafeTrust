import { SEED_HOTELS, useDemoHotelStore } from "./managed-hotels";

const draft = {
  name: "Harborview Inn",
  description: "Small inn by the harbor",
  address: "Calle 1, Puntarenas",
  locationArea: "Puntarenas",
  lat: 9.97,
  lng: -84.83,
  imageUrl: "https://example.com/harbor.jpg",
};

describe("useDemoHotelStore", () => {
  beforeEach(() => useDemoHotelStore.getState().reset());

  it("starts with the seed hotels", () => {
    expect(useDemoHotelStore.getState().hotels).toEqual(SEED_HOTELS);
  });

  it("adds a hotel with a new id", () => {
    const hotel = useDemoHotelStore.getState().add(draft);
    expect(hotel).toEqual({ ...draft, id: "4" });
    expect(useDemoHotelStore.getState().hotels).toHaveLength(4);
  });

  it("updates a hotel by id", () => {
    useDemoHotelStore.getState().update("2", draft);
    const hotels = useDemoHotelStore.getState().hotels;
    expect(hotels.find((h) => h.id === "2")).toEqual({ ...draft, id: "2" });
    expect(hotels).toHaveLength(3);
  });

  it("keeps imageUrl through add and update", () => {
    const added = useDemoHotelStore.getState().add(draft);
    expect(added.imageUrl).toBe(draft.imageUrl);
    useDemoHotelStore
      .getState()
      .update(added.id, { ...draft, imageUrl: "/img/hotel/hotel1.jpg" });
    const stored = useDemoHotelStore
      .getState()
      .hotels.find((h) => h.id === added.id);
    expect(stored?.imageUrl).toBe("/img/hotel/hotel1.jpg");
  });

  it("gives every seed hotel an image", () => {
    SEED_HOTELS.forEach((h) => expect(h.imageUrl).toBeTruthy());
  });

  it("removes a hotel by id", () => {
    useDemoHotelStore.getState().remove("1");
    expect(useDemoHotelStore.getState().hotels.map((h) => h.id)).toEqual([
      "2",
      "3",
    ]);
  });

  it("never reuses an id after a removal", () => {
    useDemoHotelStore.getState().remove("3");
    expect(useDemoHotelStore.getState().add(draft).id).toBe("4");
  });
});
