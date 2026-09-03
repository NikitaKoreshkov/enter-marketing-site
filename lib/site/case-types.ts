export type CaseResult = {
  value: string;
  label: string;
};

export type SiteCase = {
  id: string;
  title: string;
  service: string;
  description: string;
  work: string[];
  result: string;
  results: CaseResult[];
  cover: string;
  images: string[];
  videos: string[];
  instagram?: string;
  website?: string;
  sortOrder: number;
};

export type SiteCaseInput = {
  id?: string;
  title: string;
  service: string;
  description: string;
  work: string[];
  result: string;
  results: CaseResult[];
  cover: string;
  images: string[];
  videos: string[];
  instagram?: string | null;
  website?: string | null;
  sortOrder?: number;
};
