import { IDesignation } from "../types/interfaces";

export interface IEmployee {
  id: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  designationId: string;
  designation?: IDesignation;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const localStorageService = new (class LocalStorageService {
  private readonly DESIGNATIONS_KEY = "designations";
  private readonly EMPLOYEES_KEY = "employees";

  // Designation Methods
  getDesignations(): IDesignation[] {
    if (typeof window === "undefined") return [];
    const data = localStorage.getItem(this.DESIGNATIONS_KEY);
    return data ? JSON.parse(data) : [];
  }

  saveDesignations(designations: IDesignation[]): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(this.DESIGNATIONS_KEY, JSON.stringify(designations));
  }

  // Employee Methods
  getEmployees(): IEmployee[] {
    if (typeof window === "undefined") return [];
    const data = localStorage.getItem(this.EMPLOYEES_KEY);
    return data ? JSON.parse(data) : [];
  }

  saveEmployees(employees: IEmployee[]): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(this.EMPLOYEES_KEY, JSON.stringify(employees));
  }

  // Initialize with sample data
  initializeSampleData(): void {
    const existingDesignations = this.getDesignations();
    const existingEmployees = this.getEmployees();

    if (existingDesignations.length === 0) {
      const sampleDesignations: IDesignation[] = [
        {
          id: "1",
          name: "Manager",
          permissions: [
            { module: "Dashboard", actions: ["view"] },
            {
              module: "Raw Materials",
              actions: ["view", "create", "update", "delete"],
            },
            {
              module: "Packaging Materials",
              actions: ["view", "create", "update", "delete"],
            },
            {
              module: "Products",
              actions: ["view", "create", "update", "delete"],
            },
            {
              module: "Categories",
              actions: ["view", "create", "update", "delete"],
            },
            {
              module: "Units",
              actions: ["view", "create", "update", "delete"],
            },
            {
              module: "Brands",
              actions: ["view", "create", "update", "delete"],
            },
            {
              module: "Purchases",
              actions: ["view", "create", "update", "delete"],
            },
            {
              module: "Designations",
              actions: ["view", "create", "update", "delete"],
            },
            {
              module: "Employees",
              actions: ["view", "create", "update", "delete"],
            },
            {
              module: "Stock",
              actions: ["view", "create", "update", "delete"],
            },
            {
              module: "Production",
              actions: ["view", "create", "update", "delete", "approve"],
            },
            {
              module: "Reports",
              actions: ["view", "export"],
            },
          ],
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "2",
          name: "Sales Executive",
          permissions: [
            { module: "Dashboard", actions: ["view"] },
            { module: "Products", actions: ["view"] },
            { module: "Sales", actions: ["view", "create", "update"] },
            { module: "Reports", actions: ["view"] },
          ],
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "3",
          name: "Accountant",
          permissions: [
            { module: "Dashboard", actions: ["view"] },
            { module: "Purchases", actions: ["view", "create", "update"] },
            { module: "Sales", actions: ["view"] },
            { module: "Reports", actions: ["view", "export"] },
          ],
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
      this.saveDesignations(sampleDesignations);
    }

    if (existingEmployees.length === 0) {
      const sampleEmployees: IEmployee[] = [
        {
          id: "1",
          name: "John Doe",
          email: "john.doe@amzadfood.com",
          phone: "01712345678",
          password: "12345678",
          designationId: "1",
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "2",
          name: "Jane Smith",
          email: "jane.smith@amzadfood.com",
          phone: "01712345679",
          password: "12345678",
          designationId: "2",
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
      this.saveEmployees(sampleEmployees);
    }
  }
})();
