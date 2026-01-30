export class LinkNotFoundError extends Error {
  constructor(slug: string) {
    super(`Link with slug '${slug}' not found`);
    this.name = "LinkNotFoundError";
  }
}

export class SlugAlreadyExistsError extends Error {
  constructor(slug: string) {
    super(`Slug '${slug}' already exists`);
    this.name = "SlugAlreadyExistsError";
  }
}

export class SlugNotFoundError extends Error {
  constructor(slug: string) {
    super(`Slug '${slug}' not found`);
    this.name = "SlugNotFoundError";
  }
}
