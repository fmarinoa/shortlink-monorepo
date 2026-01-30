import { Link } from "@/domains";
import { ILinksServices } from "./ILinksServices";
import { IRepository } from "@/repositories/IRepository";
import { LinksResponse, LinkType, Result } from "@shortlink/core";

export class LinksServicesImp implements ILinksServices {
  constructor(
    private readonly repository: IRepository,
    private readonly apiUrl: string,
  ) {}

  async createLink(link: Link): Promise<Result<{ shortUrl: string }, Error>> {
    const result = await this.repository.createLink(link);

    if (!result.isSuccess) {
      return Result.fail(result.getErrorValue());
    }

    return Result.ok({ shortUrl: `${this.apiUrl}/${link.slug}` });
  }

  async redirectLink(
    slug: string | undefined,
  ): Promise<Result<string, string>> {
    const portfolioUrl = `https://portfolio.${this.apiUrl?.split("://")[1]}`;

    if (!slug || slug.trim() === "") {
      return Result.fail(portfolioUrl);
    }

    const result = await this.repository.getLink(slug);

    if (!result.isSuccess) {
      console.error("Error retrieving link:", result.getErrorValue());
      return Result.fail(portfolioUrl);
    }

    const newVisitCount = await this.repository.incrementLinkVisitCount(slug);
    if (!newVisitCount.isSuccess) {
      console.error(
        "Error incrementing visit count:",
        newVisitCount.getErrorValue(),
      );
    }
    console.log("Updated visit count:", newVisitCount.getValue());

    return Result.ok(result.getValue().url);
  }

  async getAllLinks(): Promise<Result<LinksResponse, Error>> {
    const result = await this.repository.getAllLinks();
    if (!result.isSuccess) {
      return Result.fail(result.getErrorValue());
    }

    const total = result.getValue().length;
    const data = result.getValue().map((link: Link) => link.toJSON());

    return Result.ok({ total, data });
  }

  async deleteLink(slug: string): Promise<Result<void, Error>> {
    const result = await this.repository.deleteLink(slug);

    if (!result.isSuccess) {
      return Result.fail(result.getErrorValue());
    }

    return Result.ok();
  }

  async updateLink(
    slug: string,
    newUrl: string,
  ): Promise<
    Result<
      Omit<LinkType, "creationDate" | "visitCount"> & { shortUrl: string },
      Error
    >
  > {
    const result = await this.repository.updateLink(slug, newUrl);

    if (!result.isSuccess) {
      return Result.fail(result.getErrorValue());
    }

    return Result.ok({
      slug,
      url: newUrl,
      shortUrl: `${this.apiUrl}/${slug}`,
    });
  }
}
