import { SlugAlreadyExistsError, SlugNotFoundError } from "@/domains";
import { Link } from "@/domains/Link";
import { LinksService } from "@/services/LinksService";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

interface LinksControllerProps {
  readonly linksService: LinksService;
}

export class LinksController {
  constructor(private readonly props: LinksControllerProps) {}

  async createLink(
    event: APIGatewayProxyEvent,
  ): Promise<APIGatewayProxyResult> {
    try {
      const { slug, url } = event.body as unknown as {
        slug: string;
        url: string;
      };

      const link = Link.instanceForCreate({ slug, url });

      if (!link.isSuccess) {
        return {
          statusCode: 400,
          body: JSON.stringify({
            message: "Invalid link data",
            errors: link.getErrorValue().issues,
          }),
        };
      }

      const result = await this.props.linksService.createLink(link.getValue());
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
    const buildRedirectResponse = (location: string) => {
      return {
        statusCode: 302,
        headers: {
          Location: location,
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
        body: "",
      };
    };

    const result = await this.props.linksService.redirectLink(
      new Link({ slug: slug }),
    );

    if (!result.isSuccess) {
      return buildRedirectResponse(result.getErrorValue());
    }

    return buildRedirectResponse(result.getValue());
  }

  async getAllLinks(
    _event: APIGatewayProxyEvent,
  ): Promise<APIGatewayProxyResult> {
    const result = await this.props.linksService.getAllLinks();

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

    const result = await this.props.linksService.deleteLink(new Link({ slug }));

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
      const { url } = event.body as unknown as { url: unknown };

      const result = await this.props.linksService.updateLink({
        link: new Link({ slug }),
        newUrl: url,
      });

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
