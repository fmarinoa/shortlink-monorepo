import { SlugAlreadyExistsError, SlugNotFoundError } from "@/domains";
import { Link } from "@/domains/Link";
import { ILinksServices } from "@/services/ILinksServices";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

export class LinksController {
  constructor(private readonly linksService: ILinksServices) {}

  async createLink(
    event: APIGatewayProxyEvent,
  ): Promise<APIGatewayProxyResult> {
    try {
      const { slug, url } = event.body as unknown as {
        slug: string;
        url: string;
      };

      const linkResult = Link.create({ slug, url });

      if (!linkResult.isSuccess) {
        return {
          statusCode: 400,
          body: JSON.stringify({
            message: "Invalid link data",
            errors: linkResult.getErrorValue().issues,
          }),
        };
      }

      const result = await this.linksService.createLink(linkResult.getValue());
      if (!result.isSuccess) {
        const error = result.getErrorValue();
        const message = error.message;

        if (error instanceof SlugAlreadyExistsError) {
          return {
            statusCode: 409,
            body: JSON.stringify({ message }),
          };
        }

        return {
          statusCode: 500,
          body: JSON.stringify({ message }),
        };
      }

      return {
        statusCode: 201,
        body: JSON.stringify(result.getValue()),
      };
    } catch (error) {
      return {
        statusCode: 500,
        body: JSON.stringify({ message: `Internal server error: ${error}` }),
      };
    }
  }

  async redirectLink(
    event: APIGatewayProxyEvent,
  ): Promise<APIGatewayProxyResult> {
    const { slug } = event.pathParameters || {};
    const body = "";

    const result = await this.linksService.redirectLink(slug);

    if (!result.isSuccess) {
      return {
        statusCode: 302,
        headers: { Location: result.getErrorValue() },
        body,
      };
    }

    return {
      statusCode: 301,
      headers: { Location: result.getValue() },
      body,
    };
  }

  async getAllLinks(
    _event: APIGatewayProxyEvent,
  ): Promise<APIGatewayProxyResult> {
    const result = await this.linksService.getAllLinks();

    if (!result.isSuccess) {
      return {
        statusCode: 500,
        body: JSON.stringify({ message: result.getErrorValue().message }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify(result.getValue()),
    };
  }

  async deleteLink(
    event: APIGatewayProxyEvent,
  ): Promise<APIGatewayProxyResult> {
    const { slug } = event.pathParameters || {};

    if (!slug) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: "Slug is required in path parameters",
        }),
      };
    }

    const result = await this.linksService.deleteLink(slug);

    if (!result.isSuccess) {
      const error = result.getErrorValue();
      const message = error.message;

      if (error instanceof SlugNotFoundError) {
        return {
          statusCode: 404,
          body: JSON.stringify({ message }),
        };
      }

      return {
        statusCode: 500,
        body: JSON.stringify({ message }),
      };
    }
    return {
      statusCode: 204,
      body: "",
    };
  }

  async updateLink(
    event: APIGatewayProxyEvent,
  ): Promise<APIGatewayProxyResult> {
    try {
      const { slug } = event.pathParameters || {};

      if (!slug) {
        return {
          statusCode: 400,
          body: JSON.stringify({
            message: "Slug is required in path parameters",
          }),
        };
      }

      const { url } = event.body as unknown as {
        url: string;
      };

      const updatedLink = Link.update(url);

      if (!updatedLink.isSuccess) {
        return {
          statusCode: 400,
          body: JSON.stringify({
            message: "Invalid new link data",
            errors: updatedLink.getErrorValue().issues,
          }),
        };
      }

      const result = await this.linksService.updateLink(
        slug,
        updatedLink.getValue(),
      );

      if (!result.isSuccess) {
        const error = result.getErrorValue();
        const message = error.message;

        if (error instanceof SlugNotFoundError) {
          return {
            statusCode: 404,
            body: JSON.stringify({ message }),
          };
        }

        return {
          statusCode: 500,
          body: JSON.stringify({ message }),
        };
      }
      return {
        statusCode: 200,
        body: JSON.stringify(result.getValue()),
      };
    } catch (error) {
      return {
        statusCode: 500,
        body: JSON.stringify({ message: `Internal server error: ${error}` }),
      };
    }
  }
}
