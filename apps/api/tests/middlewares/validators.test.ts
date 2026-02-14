import { APIGatewayProxyEvent } from "aws-lambda";
import { requirePathParameters, requireBody } from "@/middlewares/validators";

describe("requirePathParameters middleware", () => {
  it("should return 400 when required path parameter is missing", async () => {
    const middleware = requirePathParameters(["slug"]);
    const request = {
      event: {
        pathParameters: {},
      } as APIGatewayProxyEvent,
    };

    const response = await middleware.before(request);

    expect(response?.statusCode).toBe(400);
    expect(JSON.parse(response?.body!).message).toContain("Missing required path parameter(s): slug");
  });

  it("should not return error when path parameter is present", async () => {
    const middleware = requirePathParameters(["slug"]);
    const request = {
      event: {
        pathParameters: { slug: "test-slug" },
      } as unknown as APIGatewayProxyEvent,
    };

    const response = await middleware.before(request);

    expect(response).toBeUndefined();
  });

  it("should return 400 when multiple required parameters are missing", async () => {
    const middleware = requirePathParameters(["slug", "id"]);
    const request = {
      event: {
        pathParameters: {},
      } as APIGatewayProxyEvent,
    };

    const response = await middleware.before(request);

    expect(response?.statusCode).toBe(400);
    expect(JSON.parse(response?.body!).message).toContain("Missing required path parameter(s): slug, id");
  });
});

describe("requireBody middleware", () => {
  it("should return 400 when body is missing", async () => {
    const middleware = requireBody();
    const request = {
      event: {
        body: null,
      } as APIGatewayProxyEvent,
    };

    const response = await middleware.before(request);

    expect(response?.statusCode).toBe(400);
    expect(JSON.parse(response?.body!).message).toBe("Request body is required");
  });

  it("should not return error when body is present", async () => {
    const middleware = requireBody();
    const request = {
      event: {
        body: JSON.stringify({ data: "test" }),
      } as APIGatewayProxyEvent,
    };

    const response = await middleware.before(request);

    expect(response).toBeUndefined();
  });
});
