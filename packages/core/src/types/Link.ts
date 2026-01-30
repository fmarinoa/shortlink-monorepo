export type LinkType = {
  slug: string;
  url: string;
  creationDate: number;
  visitCount: number;
};

export type LinksResponse = {
  total: number;
  data: LinkType[];
}
