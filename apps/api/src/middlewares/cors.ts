import middy from "@middy/core";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
const { AWS_STAGE: stage, CORS_ALLOWED_ORIGINS: corsEnv } = process.env;

const getAllowedOrigins = () => {
  if (stage === "dev") {
    return ["*"];
  }

  if (corsEnv) {
    return corsEnv.split(",").map((url) => url.trim());
  }

  throw new Error(
    "CORS_ALLOWED_ORIGINS environment variable is required for production",
  );
};

export const corsMiddleware = (): middy.MiddlewareObj<
  APIGatewayProxyEvent,
  APIGatewayProxyResult
> => {
  const addCorsHeaders = (request: any): void => {
    const origin =
      request.event.headers?.origin || request.event.headers?.Origin || "";
    const allowedOrigins = getAllowedOrigins();

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
