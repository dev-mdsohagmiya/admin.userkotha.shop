export interface IHomeSection {
  id: string;
  title: string;
  subtitle?: string;
  isActive: boolean;
  group?: string;
  productType?: {
    name: string;
    slug: string;
  };
  createdAt?: string;
  bannerId?: string;
  link?: string;
  banner?: {
    id?: string;
    image?: string;
    link: string;
  };
 
}

export type IContent = {
  content: string;
  groupId: string;
  id: string;
  key: string;
  page: string;
  type: string;
  updatedAt: string; // ISO 8601 date string
  updatedBy: string;
};
