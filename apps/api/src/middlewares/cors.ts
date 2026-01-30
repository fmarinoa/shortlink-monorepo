import middy from "@middy/core";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

const ALLOWED_ORIGINS = {
  dev: ["*"],
  prod: [
    "https://links.francomarino.dev",
    "https://www.links.francomarino.dev",
    "https://main.d20gpq2599pdhb.amplifyapp.com",
  ],
};

export const corsMiddleware = (): middy.MiddlewareObj<
  APIGatewayProxyEvent,
  APIGatewayProxyResult
> => {
  const addCorsHeaders = (request: any): void => {
    const stage = process.env.AWS_STAGE || "dev";
    const origin =
      request.event.headers?.origin || request.event.headers?.Origin || "";
    const allowedOrigins =
      ALLOWED_ORIGINS[stage as keyof typeof ALLOWED_ORIGINS] ||
      ALLOWED_ORIGINS.dev;

    let corsHeaders: Record<string, string>;

    if (allowedOrigins.includes("*")) {
      corsHeaders = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": "false",
      };
    } else if (allowedOrigins.includes(origin)) {
      corsHeaders = {
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Credentials": "false",
      };
    } else {
      corsHeaders = {
        "Access-Control-Allow-Origin": allowedOrigins[0],
        "Access-Control-Allow-Credentials": "false",
      };
    }

    if (request.response) {
      request.response.headers = {
        ...request.response.headers,
        ...corsHeaders,
      };
    }
  };

  return {
    after: async (request) => {
      addCorsHeaders(request);
    },
    onError: async (request) => {
      addCorsHeaders(request);
      return;
    },
  };
};
