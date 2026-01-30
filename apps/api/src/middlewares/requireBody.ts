import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

export const requireBody = () => ({
  before: async (request: {
    event: APIGatewayProxyEvent;
    response?: APIGatewayProxyResult;
  }) => {
    if (!request.event.body) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Request body is required" }),
      };
    }
  },
});
