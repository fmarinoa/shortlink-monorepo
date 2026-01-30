export type Link = {
  slug: string;
  url: string;
  creationDate: string;
  visitCount: number;
};

export type ErrorType = {
  response?: {
    status?: number;
  };
};
