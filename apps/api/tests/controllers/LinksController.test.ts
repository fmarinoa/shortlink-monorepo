import { LinksController } from "@/controllers/LinksController";
import { LinksService } from "@/services/LinksService";
import { Link, SlugAlreadyExistsError, SlugNotFoundError } from "@/domains";
import { Result } from "@shortlink/core";
import { APIGatewayProxyEvent } from "aws-lambda";
import { LinksControllerStub } from "./index";


describe("LinksController", () => {
  describe("createLink", () => {
    it("should create link successfully", async () => {
      const mockService = {
        createLink: jest.fn().mockResolvedValue(
          Promise.resolve(Result.ok({ shortUrl: "https://short.url/test" })),
        ),
      } as unknown as jest.Mocked<LinksService>;

      const controller = new LinksControllerStub({ linksService: mockService });

      const event = {
        body: { slug: "test", url: "https://example.com" },
      } as unknown as APIGatewayProxyEvent;

      const response = await controller.createLink(event);

      expect(response.statusCode).toBe(201);
      expect(JSON.parse(response.body)).toEqual({
        shortUrl: "https://short.url/test",
      });
    });

    it("should return 400 for invalid slug", async () => {
      const mockService = {
        createLink: jest.fn(),
      } as unknown as jest.Mocked<LinksService>;

      const controller = new LinksControllerStub({ linksService: mockService });

      const event = {
        body: JSON.stringify({ slug: "a", url: "https://example.com" }),
      } as APIGatewayProxyEvent;

      const response = await controller.createLink(event);

      expect(response.statusCode).toBe(400);
      expect(JSON.parse(response.body).message).toBe("Invalid link data");
    });

    it("should return 409 when slug already exists", async () => {
      const mockService = {
        createLink: jest.fn().mockResolvedValue(
          Promise.resolve(Result.fail(new SlugAlreadyExistsError("test"))),
        ),
      } as unknown as jest.Mocked<LinksService>;

      const controller = new LinksControllerStub({ linksService: mockService });

      const event = {
        body: { slug: "test", url: "https://example.com" },
      } as unknown as APIGatewayProxyEvent;

      const response = await controller.createLink(event);

      expect(response.statusCode).toBe(409);
      expect(JSON.parse(response.body).message).toContain("Slug 'test' already exists");
    });
  });

  describe("getAllLinks", () => {
    it("should get all links successfully", async () => {
      const mockService = {
        getAllLinks: jest.fn().mockResolvedValue(
          Promise.resolve(Result.ok({
            total: 1,
            data: [
              new Link({
                slug: "test1",
                url: "https://example1.com",
                creationDate: Date.now(),
                visitCount: 5,
              }),
            ]
          })),
        ),
      } as unknown as jest.Mocked<LinksService>;

      const controller = new LinksControllerStub({ linksService: mockService })

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
      const mockService = {
        deleteLink: jest.fn().mockResolvedValue(
          Promise.resolve(Result.ok()),
        ),
      } as unknown as jest.Mocked<LinksService>;

      const controller = new LinksControllerStub({ linksService: mockService })

      const event = {
        pathParameters: { slug: "test" },
      } as unknown as APIGatewayProxyEvent;

      const response = await controller.deleteLink(event);

      expect(response.statusCode).toBe(204);
      expect(response.body).toBe("");
    });

    it("should return 404 when slug not found", async () => {
      const mockService = {
        deleteLink: jest.fn().mockResolvedValue(
          Promise.resolve(
            Result.fail(new SlugNotFoundError("test")),
          ),
        ),
      } as unknown as jest.Mocked<LinksService>;

      const controller = new LinksControllerStub({ linksService: mockService })

      const event = {
        pathParameters: { slug: "test" },
      } as unknown as APIGatewayProxyEvent;

      const response = await controller.deleteLink(event);

      expect(response.statusCode).toBe(404);
      expect(JSON.parse(response.body).message).toContain("Slug 'test' not found");
    });
  });

  describe("updateLink", () => {
    it("should update link successfully", async () => {
      const mockService = {
        updateLink: jest.fn().mockResolvedValue(
          Promise.resolve(
            Result.ok({
              slug: "test",
              url: "https://new-url.com",
              shortUrl: "https://short.url/test",
            }),
          ),
        ),
      } as unknown as jest.Mocked<LinksService>;

      const controller = new LinksControllerStub({ linksService: mockService })

      const event = {
        pathParameters: { slug: "test" },
        body: { url: "https://new-url.com" },
      } as unknown as APIGatewayProxyEvent;

      const response = await controller.updateLink(event);

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.url).toBe("https://new-url.com");
    });


    it("should return 404 when slug not found", async () => {
      const mockService = {
        updateLink: jest.fn().mockResolvedValue(
          Promise.resolve(
            Result.fail(new SlugNotFoundError("test")),
          ),
        ),
      } as unknown as jest.Mocked<LinksService>;

      const controller = new LinksControllerStub({ linksService: mockService })

      const event = {
        pathParameters: { slug: "test" },
        body: { url: "https://new-url.com" },
      } as unknown as APIGatewayProxyEvent;

      const response = await controller.updateLink(event);

      expect(response.statusCode).toBe(404);
      expect(JSON.parse(response.body).message).toContain("Slug 'test' not found");
    });

    describe("redirectLink", () => {
      it("should redirect to URL when link exists", async () => {
        const mockService = {
          redirectLink: jest.fn().mockResolvedValue(
            Promise.resolve(
              Result.ok("https://example.com"),
            ),
          ),
        } as unknown as jest.Mocked<LinksService>;

        const controller = new LinksControllerStub({ linksService: mockService })

        const event = {
          pathParameters: { slug: "test" },
        } as unknown as APIGatewayProxyEvent;

        const response = await controller.redirectLink(event);

        expect(response.statusCode).toBe(302);
        expect(response.headers?.Location).toBe("https://example.com");
      });

      it("should redirect to portfolio when link not found", async () => {
        const mockService = {
          redirectLink: jest.fn().mockResolvedValue(
            Result.fail("https://portfolio.example.com"),
          ),
        } as unknown as jest.Mocked<LinksService>;

        const controller = new LinksControllerStub({ linksService: mockService })

        const event = {
          pathParameters: { slug: "test" },
        } as unknown as APIGatewayProxyEvent;

        const response = await controller.redirectLink(event);

        expect(response.statusCode).toBe(302);
        expect(response.headers?.Location).toBe("https://portfolio.example.com");
      });
    });
  });
});