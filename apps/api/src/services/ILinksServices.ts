import { Result } from "@shortlink/core";
import { Link } from "@/domains/Link";
import { LinksResponse, LinkType } from "@shortlink/core";

export interface ILinksServices {
  createLink(link: Link): Promise<Result<{ shortUrl: string }, Error>>;
  redirectLink(id: string | undefined): Promise<Result<string, string>>;
  getAllLinks(): Promise<Result<LinksResponse, Error>>;
  deleteLink(slug: string): Promise<Result<void, Error>>;
  updateLink(
    slug: string,
    newUrl: string,
  ): Promise<
    Result<
      Omit<LinkType, "creationDate" | "visitCount"> & { shortUrl: string },
      Error
    >
  >;
}
