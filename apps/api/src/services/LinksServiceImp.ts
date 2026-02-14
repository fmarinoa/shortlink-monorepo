import { Link } from "@/domains";
import { LinksService } from "./LinksService";
import { Repository } from "@/repositories/Repository";
import { Result } from "@shortlink/core";

interface LinksServiceImpProps {
  readonly repository: Repository;
  readonly apiUrl?: string;
}

export class LinksServiceImp implements LinksService {
  constructor(private readonly props: LinksServiceImpProps) {
    if (!this.props.apiUrl) {
      throw new Error("API URL is required for " + this.constructor.name);
    }
  }

  async createLink(link: Link): Promise<Result<{ shortUrl: string }, Error>> {
    const result = await this.props.repository.create(link);

    if (!result.isSuccess) {
      return Result.fail(result.getErrorValue());
    }

    return Result.ok({
      shortUrl: `${this.props.apiUrl}/${result.getValue().slug}`,
    });
  }

  async redirectLink(link: Link): Promise<Result<string, string>> {
    const portfolioUrl = `https://portfolio.${this.props.apiUrl?.split("://")[1]}`;

    if (!link.slug || link.slug.trim() === "") {
      return Result.fail(portfolioUrl);
    }

    const result = await this.props.repository.getBySlug(link.slug);

    if (!result.isSuccess) {
      console.error(
        `Error retrieving link with slug ${link.slug}:`,
        result.getErrorValue(),
      );
      return Result.fail(portfolioUrl);
    }

    let linkToIncrementVisitCount = result.getValue();

    linkToIncrementVisitCount.incrementVisitCount();

    await this.props.repository.update(linkToIncrementVisitCount, {
      lastUpdateDate: false,
      lastVisitDate: true,
    });

    console.log(
      `Link with slug ${linkToIncrementVisitCount.slug} updated visit count: ${linkToIncrementVisitCount.visitCount}`,
    );

    return Result.ok(linkToIncrementVisitCount.url);
  }

  async getAllLinks(): Promise<Result<{ total: number; data: Link[] }, Error>> {
    const result = await this.props.repository.getAll();
    if (!result.isSuccess) {
      return Result.fail(result.getErrorValue());
    }

    const total = result.getValue().length;
    const data = result.getValue().map((link: Link) => new Link({ ...link }));

    return Result.ok({ total, data });
  }

  async deleteLink(link: Link): Promise<Result<void, Error>> {
    const result = await this.props.repository.delete(link);

    if (!result.isSuccess) {
      return Result.fail(result.getErrorValue());
    }

    return Result.ok();
  }

  async updateLink({
    link,
    newUrl,
  }: {
    link: Link;
    newUrl: unknown;
  }): Promise<Result<{ slug: string; url: string; shortUrl: string }, Error>> {
    let result = await this.props.repository.getBySlug(link.slug);

    if (!result.isSuccess) {
      return Result.fail(result.getErrorValue());
    }

    const oldLink = result.getValue();
    const updateResult = oldLink.updateUrl(newUrl);
    if (!updateResult.isSuccess) {
      return Result.fail(updateResult.getErrorValue());
    }

    if (!updateResult.getValue().isNeedUpdate) {
      return Result.ok({
        slug: oldLink.slug,
        url: oldLink.url,
        shortUrl: `${this.props.apiUrl}/${oldLink.slug}`,
      });
    }

    result = await this.props.repository.update(updateResult.getValue().link);
    if (!result.isSuccess) {
      return Result.fail(result.getErrorValue());
    }

    const newLink = result.getValue();
    return Result.ok({
      slug: newLink.slug,
      url: newLink.url,
      shortUrl: `${this.props.apiUrl}/${newLink.slug}`,
    });
  }
}
