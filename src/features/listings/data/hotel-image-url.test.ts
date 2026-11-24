import { validateImageUrl } from "./hotel-image-url";

describe("validateImageUrl", () => {
  it("requires a value", () => {
    expect(validateImageUrl("")).toBe("Image URL is required");
    expect(validateImageUrl("   ")).toBe("Image URL is required");
  });

  it("accepts https and site-relative urls", () => {
    expect(validateImageUrl("https://example.com/a.jpg")).toBeNull();
    expect(validateImageUrl(" /img/hotel/hotel1.jpg ")).toBeNull();
  });

  it("rejects other schemes and malformed values", () => {
    const msg = "Enter a valid https:// image URL";
    expect(validateImageUrl("http://example.com/a.jpg")).toBe(msg);
    expect(validateImageUrl("javascript:alert(1)")).toBe(msg);
    expect(validateImageUrl("//example.com/a.jpg")).toBe(msg);
    expect(validateImageUrl("example.com/a.jpg")).toBe(msg);
    expect(validateImageUrl("https://")).toBe(msg);
    expect(validateImageUrl("https://a b.com")).toBe(msg);
  });
});
