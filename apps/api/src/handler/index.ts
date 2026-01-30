import middy from "@middy/core";
import jsonBodyParser from "@middy/http-json-body-parser";
import httpErrorHandler from "@middy/http-error-handler";
import { linksController } from "@/controllers";
import { APIGatewayProxyEvent } from "aws-lambda";
import { requireBody, corsMiddleware } from "@/middlewares";

module.exports = {
  create: middy((event: APIGatewayProxyEvent) =>
    linksController.createLink(event),
  )
    .use(requireBody())
    .use(jsonBodyParser())
    .use(corsMiddleware())
    .use(httpErrorHandler()),
  delete: middy((event: APIGatewayProxyEvent) =>
    linksController.deleteLink(event),
  )
    .use(corsMiddleware())
    .use(httpErrorHandler()),
  update: middy((event: APIGatewayProxyEvent) =>
    linksController.updateLink(event),
  )
    .use(requireBody())
    .use(jsonBodyParser())
    .use(corsMiddleware())
    .use(httpErrorHandler()),
  redirect: (event: APIGatewayProxyEvent) =>
    linksController.redirectLink(event),
  getAll: middy((event: APIGatewayProxyEvent) =>
    linksController.getAllLinks(event),
  )
    .use(corsMiddleware())
    .use(httpErrorHandler()),
};
