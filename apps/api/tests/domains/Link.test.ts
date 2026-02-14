import { Link } from "@/domains/Link";

describe("Link Domain", () => {
  describe("Link.create", () => {
    it("should create a valid link", () => {
      const result = Link.instanceForCreate({
        slug: "test-slug",
        url: "https://example.com",
      });

      expect(result.isSuccess).toBe(true);
      const link = result.getValue();
      expect(link.slug).toBe("test-slug");
      expect(link.url).toBe("https://example.com");
    });

    it("should transform slug to lowercase", () => {
      const result = Link.instanceForCreate({
        slug: "TEST-SLUG",
        url: "https://example.com",
      });

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().slug).toBe("test-slug");
    });

    it("should fail with slug less than 2 characters", () => {
      const result = Link.instanceForCreate({
        slug: "a",
        url: "https://example.com",
      });

      expect(result.isSuccess).toBe(false);
      const errors = result.getErrorValue().issues;
      expect(errors).toHaveLength(1);
      expect(errors[0].path).toEqual(["slug"]);
    });

    it("should fail with slug more than 50 characters", () => {
      const result = Link.instanceForCreate({
        slug: "a".repeat(51),
        url: "https://example.com",
      });

      expect(result.isSuccess).toBe(false);
    });

    it("should fail with invalid slug characters", () => {
      const result = Link.instanceForCreate({
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
      const result = Link.instanceForCreate({
        slug: "test-slug",
        url: "not-a-url",
      });

      expect(result.isSuccess).toBe(false);
      const errors = result.getErrorValue().issues;
      expect(errors).toHaveLength(1);
      expect(errors[0].path).toEqual(["url"]);
    });

    it("should accept valid slug with numbers and hyphens", () => {
      const result = Link.instanceForCreate({
        slug: "test-123-slug",
        url: "https://example.com",
      });

      expect(result.isSuccess).toBe(true);
    });
  });

  describe("Link.updateUrl", () => {
    it("should update URL correctly", () => {
      const link = new Link({
        slug: "test-slug",
        url: "https://example.com",
      });

      const result = link.updateUrl("https://new-url.com");

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().isNeedUpdate).toBe(true);
      expect(result.getValue().link.url).toBe("https://new-url.com");
    });

    it("should not update URL if it's the same", () => {
      const link = new Link({
        slug: "test-slug",
        url: "https://example.com",
      });

      const result = link.updateUrl("https://example.com");

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().isNeedUpdate).toBe(false);
      expect(result.getValue().link.url).toBe("https://example.com");
    });

    it("should fail with invalid URL", () => {
      const link = new Link({
        slug: "test-slug",
        url: "https://example.com",
      });

      const result = link.updateUrl("invalid-url");

      expect(result.isSuccess).toBe(false);
    });
  });

  describe("Link.incrementVisitCount", () => {
    it("should increment visit count", () => {
      const link = new Link({
        slug: "test-slug",
        url: "https://example.com",
        visitCount: 5,
      });

      link.incrementVisitCount();

      expect(link.visitCount).toBe(6);
    });

    it("should start from 0 and increment", () => {
      const link = new Link({
        slug: "test-slug",
        url: "https://example.com",
      });

      link.incrementVisitCount();
      link.incrementVisitCount();

      expect(link.visitCount).toBe(2);
    });
  });

  describe("toJSON", () => {
    it("should serialize link correctly", () => {
      const result = Link.instanceForCreate({
        slug: "test-slug",
        url: "https://example.com",
      });

      const json = result.getValue().toJSON();

      expect(json).toEqual({
        slug: "test-slug",
        url: "https://example.com",
      });
    });
  });
});
