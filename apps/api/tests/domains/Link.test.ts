import { Link } from "@/domains/Link";

describe("Link Domain", () => {
  describe("Link.create", () => {
    it("should create a valid link", () => {
      const result = Link.create({
        slug: "test-slug",
        url: "https://example.com",
      });

      expect(result.isSuccess).toBe(true);
      const link = result.getValue();
      expect(link.slug).toBe("test-slug");
      expect(link.url).toBe("https://example.com");
    });

    it("should transform slug to lowercase", () => {
      const result = Link.create({
        slug: "TEST-SLUG",
        url: "https://example.com",
      });

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().slug).toBe("test-slug");
    });

    it("should fail with slug less than 2 characters", () => {
      const result = Link.create({
        slug: "a",
        url: "https://example.com",
      });

      expect(result.isSuccess).toBe(false);
      const errors = result.getErrorValue().issues;
      expect(errors).toHaveLength(1);
      expect(errors[0].path).toEqual(["slug"]);
    });

    it("should fail with slug more than 50 characters", () => {
      const result = Link.create({
        slug: "a".repeat(51),
        url: "https://example.com",
      });

      expect(result.isSuccess).toBe(false);
    });

    it("should fail with invalid slug characters", () => {
      const result = Link.create({
        slug: "test_slug!",
        url: "https://example.com",
      });

      expect(result.isSuccess).toBe(false);
      const errors = result.getErrorValue().issues;
      expect(errors[0].message).toContain(
        "Slug can only contain letters, numbers and hyphens",
      );
    });

    it("should fail with invalid URL", () => {
      const result = Link.create({
        slug: "test-slug",
        url: "not-a-url",
      });

      expect(result.isSuccess).toBe(false);
      const errors = result.getErrorValue().issues;
      expect(errors).toHaveLength(1);
      expect(errors[0].path).toEqual(["url"]);
    });

    it("should accept valid slug with numbers and hyphens", () => {
      const result = Link.create({
        slug: "test-123-slug",
        url: "https://example.com",
      });

      expect(result.isSuccess).toBe(true);
    });
  });

  describe("Link.update", () => {
    it("should validate new URL correctly", () => {
      const result = Link.update("https://new-url.com");

      expect(result.isSuccess).toBe(true);
      expect(result.getValue()).toBe("https://new-url.com");
    });

    it("should fail with invalid URL", () => {
      const result = Link.update("invalid-url");

      expect(result.isSuccess).toBe(false);
    });
  });

  describe("Link.reconstitute", () => {
    it("should reconstitute link from stored data", () => {
      const link = Link.reconstitute({
        slug: "test-slug",
        url: "https://example.com",
        creationDate: 1234567890,
        visitCount: 42,
      });

      expect(link.slug).toBe("test-slug");
      expect(link.url).toBe("https://example.com");
    });
  });

  describe("toJSON", () => {
    it("should serialize link correctly", () => {
      const result = Link.create({
        slug: "test-slug",
        url: "https://example.com",
      });

      const json = result.getValue().toJSON();

      expect(json).toEqual({
        slug: "test-slug",
        url: "https://example.com",
        creationDate: expect.any(Number),
        visitCount: 0,
      });
    });
  });
});
