export type SubMenuItem = {
  name: string;
  path?: string;
  new?: boolean;
  subItems?: SubMenuItem[];
};

export type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: SubMenuItem[];
  action?: string
};

export interface IPermission {
  module: string;
  actions: string[]; // ['view', 'create', 'update', 'delete']
}

export interface IDesignation {
  id: string;
  name: string;
  permissions?: IPermission[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  employeeCount?: number;
}

export interface IEmployee {
  id: string;
  name: string;
  email: string;
  phone: string;
  password?: string; // Added to support create/update operations
  designationId: string;
  designation?: IDesignation;

  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
