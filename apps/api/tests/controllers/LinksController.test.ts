import { LinksController } from "@/controllers/LinksController";
import { ILinksServices } from "@/services/ILinksServices";
import { SlugAlreadyExistsError, SlugNotFoundError, Link } from "@/domains";
import { LinkType, Result } from "@shortlink/core";
import { APIGatewayProxyEvent } from "aws-lambda";

describe("LinksController", () => {
  let controller: LinksController;
  let mockService: jest.Mocked<ILinksServices>;

  beforeEach(() => {
    mockService = {
      createLink: jest.fn(),
      redirectLink: jest.fn(),
      getAllLinks: jest.fn(),
      deleteLink: jest.fn(),
      updateLink: jest.fn(),
    } as jest.Mocked<ILinksServices>;

    controller = new LinksController(mockService);
  });

  describe("createLink", () => {
    it("should create link successfully", async () => {
      const event = {
        body: { slug: "test", url: "https://example.com" },
      } as unknown as APIGatewayProxyEvent;

      mockService.createLink.mockResolvedValue(
        Result.ok({ shortUrl: "https://short.url/test" }),
      );

      const response = await controller.createLink(event);

      expect(response.statusCode).toBe(201);
      expect(JSON.parse(response.body)).toEqual({
        shortUrl: "https://short.url/test",
      });
    });

    it("should return 400 for invalid slug", async () => {
      const event = {
        body: JSON.stringify({ slug: "a", url: "https://example.com" }),
      } as APIGatewayProxyEvent;

      const response = await controller.createLink(event);

      expect(response.statusCode).toBe(400);
      expect(JSON.parse(response.body).message).toBe("Invalid link data");
    });

    it("should return 409 when slug already exists", async () => {
      const event = {
        body: { slug: "test", url: "https://example.com" },
      } as unknown as APIGatewayProxyEvent;

      mockService.createLink.mockResolvedValue(
        Result.fail(new SlugAlreadyExistsError("test")),
      );

      const response = await controller.createLink(event);

      expect(response.statusCode).toBe(409);
      expect(JSON.parse(response.body).message).toContain("already exists");
    });
  });

  describe("getAllLinks", () => {
    it("should get all links successfully", async () => {
      const links = [
        Link.reconstitute({
          slug: "test1",
          url: "https://example1.com",
          creationDate: Date.now(),
          visitCount: 5,
        }).toJSON(),
      ];

      mockService.getAllLinks.mockResolvedValue(
        Result.ok({ total: 1, data: links }),
      );

      const response = await controller.getAllLinks(
        {} as APIGatewayProxyEvent,
      );

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.total).toBe(1);
      expect(body.data).toHaveLength(1);
    });
  });

  describe("deleteLink", () => {
    it("should delete link successfully", async () => {
      const event = {
        pathParameters: { slug: "test" },
      } as unknown as APIGatewayProxyEvent;

      mockService.deleteLink.mockResolvedValue(Result.ok());

      const response = await controller.deleteLink(event);

      expect(response.statusCode).toBe(204);
      expect(response.body).toBe("");
    });

    it("should return 400 when slug is missing", async () => {
      const event = {
        pathParameters: {},
      } as unknown as APIGatewayProxyEvent;

      const response = await controller.deleteLink(event);

      expect(response.statusCode).toBe(400);
    });

    it("should return 404 when slug not found", async () => {
      const event = {
        pathParameters: { slug: "test" },
      } as unknown as APIGatewayProxyEvent;

      mockService.deleteLink.mockResolvedValue(
        Result.fail(new SlugNotFoundError("test")),
      );

      const response = await controller.deleteLink(event);

      expect(response.statusCode).toBe(404);
    });
  });

  describe("updateLink", () => {
    it("should update link successfully", async () => {
      const event = {
        pathParameters: { slug: "test" },
        body: { url: "https://new-url.com" },
      } as unknown as APIGatewayProxyEvent;

      mockService.updateLink.mockResolvedValue(
        Result.ok({
          slug: "test",
          url: "https://new-url.com",
          shortUrl: "https://short.url/test",
        }),
      );

      const response = await controller.updateLink(event);

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.url).toBe("https://new-url.com");
    });

    it("should return 400 when slug is missing", async () => {
      const event = {
        pathParameters: {},
        body: JSON.stringify({ url: "https://new-url.com" }),
      } as unknown as APIGatewayProxyEvent;

      const response = await controller.updateLink(event);

      expect(response.statusCode).toBe(400);
    });

    it("should return 404 when slug not found", async () => {
      const event = {
        pathParameters: { slug: "test" },
        body: { url: "https://new-url.com" },
      } as unknown as APIGatewayProxyEvent;

      mockService.updateLink.mockResolvedValue(
        Result.fail(new SlugNotFoundError("test")),
      );

      const response = await controller.updateLink(event);

      expect(response.statusCode).toBe(404);
    });
  });

  describe("redirectLink", () => {
    it("should redirect to URL when link exists", async () => {
      const event = {
        pathParameters: { slug: "test" },
      } as unknown as APIGatewayProxyEvent;

      mockService.redirectLink.mockResolvedValue(
        Result.ok("https://example.com"),
      );

      const response = await controller.redirectLink(event);

      expect(response.statusCode).toBe(301);
      expect(response.headers?.Location).toBe("https://example.com");
    });

    it("should redirect to portfolio when link not found", async () => {
      const event = {
        pathParameters: { slug: "test" },
      } as unknown as APIGatewayProxyEvent;

      mockService.redirectLink.mockResolvedValue(
        Result.fail("https://portfolio.example.com"),
      );

      const response = await controller.redirectLink(event);

      expect(response.statusCode).toBe(302);
      expect(response.headers?.Location).toBe("https://portfolio.example.com");
    });
  });
});
