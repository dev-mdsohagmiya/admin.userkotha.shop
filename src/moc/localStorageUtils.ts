import {
  IPurchase,
  IPurchaseNeed,
  IPurchasePayment,
  IPurchaseReturn,
} from "../types/purchase";

export interface BOMItem {
  id?: string;
  variantId?: string;
  materialId: string;
  percentage: number;
  wastage: number;
  materialName?: string;
  materialUnit?: string;
  type: "raw" | "packaging";
}

export interface ProductBOM {
  productId: string;
  productName: string;
  items: BOMItem[];
  totalCost?: number;
  createdAt: string;
  updatedAt: string;
}

export interface RequisitionItem {
  id: string;
  materialId: string;
  materialName: string;
  quantity: number;
  purpose: string;
  materialType: string;
}

export interface Requisition {
  id: string;
  requisitionNumber: string;
  productId: string;
  productName: string;
  type: "raw_material" | "packaging_material";
  purpose: string;
  batchSize: number;
  status: "pending" | "approved" | "rejected";
  items: RequisitionItem[];
  requestedBy: string;
  requisitionDate: string;
  createdAt: string;
}

// LocalStorage Keys
const STORAGE_KEYS = {
  PRODUCT_BOMS: "product_boms",
  REQUISITIONS: "requisitions",
  RAW_MATERIALS: "raw_materials",
};

// utils/localStorageUtils.ts - Add these interfaces and functions

export interface PurchaseOrderItem {
  id: string;
  materialId: string;
  materialName: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
  supplierId?: string;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  requisitionId: string;
  requisitionNumber: string;
  supplierId: string;
  supplierName: string;
  poDate: string;
  expectedDelivery: string;
  status: "draft" | "sent" | "confirmed" | "delivered" | "cancelled";
  subTotal: number;
  discount: number;
  totalAmount: number;
  notes?: string;
  items: PurchaseOrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface ReceivedItem {
  id: string;
  materialId: string;
  materialName: string;
  quantityOrdered: number;
  quantityReceived: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
  qualityStatus: "pending" | "passed" | "failed";
  notes?: string;
}

export interface MaterialReceiving {
  id: string;
  grnNumber: string; // Goods Received Note Number
  poId: string;
  poNumber: string;
  receivingDate: string;
  receivedBy: string;
  status: "draft" | "completed" | "cancelled";
  items: ReceivedItem[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StockTransaction {
  id: string;
  materialId: string;
  materialName: string;
  type: "in" | "out";
  quantity: number;
  unit: string;
  referenceType: "purchase" | "production" | "adjustment" | "requisition";
  referenceId: string;
  referenceNumber: string;
  previousStock: number;
  newStock: number;
  date: string;
  notes?: string;
}

// Material Receiving Storage Functions
export const materialReceivingStorage = {
  // Get all receiving records
  getAllReceivings: (): MaterialReceiving[] => {
    try {
      const receivings = localStorage.getItem("material_receivings");
      return receivings ? JSON.parse(receivings) : [];
    } catch (error) {
      console.error("Error reading receivings from localStorage:", error);
      return [];
    }
  },

  // Get receiving by ID
  getReceivingById: (receivingId: string): MaterialReceiving | null => {
    const receivings = materialReceivingStorage.getAllReceivings();
    return receivings.find((receiving) => receiving.id === receivingId) || null;
  },

  // Get receivings by PO ID
  getReceivingsByPOId: (poId: string): MaterialReceiving[] => {
    const receivings = materialReceivingStorage.getAllReceivings();
    return receivings.filter((receiving) => receiving.poId === poId);
  },

  // Create new receiving record
  createReceiving: (
    receivingData: Omit<
      MaterialReceiving,
      "id" | "grnNumber" | "createdAt" | "updatedAt"
    >
  ): MaterialReceiving => {
    const receivings = materialReceivingStorage.getAllReceivings();

    // Generate GRN number (GRN-0001, GRN-0002, ...)
    const nextNumber = receivings.length + 1;
    const grnNumber = `GRN-${nextNumber.toString().padStart(4, "0")}`;

    const receiving: MaterialReceiving = {
      ...receivingData,
      id: `grn_${Date.now()}`,
      grnNumber,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    receivings.push(receiving);
    localStorage.setItem("material_receivings", JSON.stringify(receivings));

    return receiving;
  },

  // Update receiving record
  updateReceiving: (
    receivingId: string,
    updates: Partial<MaterialReceiving>
  ): MaterialReceiving | null => {
    const receivings = materialReceivingStorage.getAllReceivings();
    const receivingIndex = receivings.findIndex(
      (receiving) => receiving.id === receivingId
    );

    if (receivingIndex >= 0) {
      receivings[receivingIndex] = {
        ...receivings[receivingIndex],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem("material_receivings", JSON.stringify(receivings));
      return receivings[receivingIndex];
    }

    return null;
  },
};

// Stock Management Storage Functions
export const stockStorage = {
  // Get all stock transactions
  getAllTransactions: (): StockTransaction[] => {
    try {
      const transactions = localStorage.getItem("stock_transactions");
      return transactions ? JSON.parse(transactions) : [];
    } catch (error) {
      console.error(
        "Error reading stock transactions from localStorage:",
        error
      );
      return [];
    }
  },

  // Get transactions by material ID
  getTransactionsByMaterialId: (materialId: string): StockTransaction[] => {
    const transactions = stockStorage.getAllTransactions();
    return transactions.filter(
      (transaction) => transaction.materialId === materialId
    );
  },

  // Add stock transaction
  addTransaction: (
    transaction: Omit<StockTransaction, "id">
  ): StockTransaction => {
    const transactions = stockStorage.getAllTransactions();
    const newTransaction: StockTransaction = {
      ...transaction,
      id: `stock_tx_${Date.now()}`,
    };

    transactions.push(newTransaction);
    localStorage.setItem("stock_transactions", JSON.stringify(transactions));

    return newTransaction;
  },

  // Update material stock levels
  updateMaterialStock: (
    materialId: string,
    quantity: number,
    type: "in" | "out"
  ) => {
    const materials = [...mockRawMaterials]; // Create a copy
    const materialIndex = materials.findIndex((m) => m.id === materialId);

    if (materialIndex >= 0) {
      const previousStock = materials[materialIndex].currentStock;
      let newStock = previousStock;

      if (type === "in") {
        newStock = previousStock + quantity;
      } else if (type === "out") {
        newStock = Math.max(0, previousStock - quantity); // Prevent negative stock
      }

      materials[materialIndex].currentStock = newStock;

      // Update localStorage
      localStorage.setItem("raw_materials", JSON.stringify(materials));

      return { previousStock, newStock };
    }

    return null;
  },

  // Receive materials and update stock
  receiveMaterials: (receiving: MaterialReceiving) => {
    const stockUpdates = [];

    for (const item of receiving.items) {
      if (item.qualityStatus === "passed" && item.quantityReceived > 0) {
        const stockUpdate = stockStorage.updateMaterialStock(
          item.materialId,
          item.quantityReceived,
          "in"
        );

        if (stockUpdate) {
          // Record transaction
          const transaction: Omit<StockTransaction, "id"> = {
            materialId: item.materialId,
            materialName: item.materialName,
            type: "in",
            quantity: item.quantityReceived,
            unit: item.unit,
            referenceType: "purchase",
            referenceId: receiving.poId,
            referenceNumber: receiving.poNumber,
            previousStock: stockUpdate.previousStock,
            newStock: stockUpdate.newStock,
            date: new Date().toISOString(),
            notes: `Received from ${receiving.poNumber}`,
          };

          stockStorage.addTransaction(transaction);
          stockUpdates.push({
            materialId: item.materialId,
            materialName: item.materialName,
            quantity: item.quantityReceived,
            previousStock: stockUpdate.previousStock,
            newStock: stockUpdate.newStock,
          });
        }
      }
    }

    return stockUpdates;
  },
};

// Get raw materials from localStorage (returns empty array if none exist)
export const getRawMaterials = () => {
  try {
    const stored = localStorage.getItem("raw_materials");
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error("Error reading materials from localStorage:", error);
  }

  // Return empty array if no materials exist (users will create their own)
  return [];
};

// Purchase Order Storage Functions
export const purchaseOrderStorage = {
  // Get all POs
  getAllPOs: (): PurchaseOrder[] => {
    try {
      const pos = localStorage.getItem("purchase_orders");
      return pos ? JSON.parse(pos) : [];
    } catch (error) {
      console.error("Error reading POs from localStorage:", error);
      return [];
    }
  },

  // Get PO by ID
  getPOById: (poId: string): PurchaseOrder | null => {
    const pos = purchaseOrderStorage.getAllPOs();
    return pos.find((po) => po.id === poId) || null;
  },

  // Get POs by requisition ID
  getPOsByRequisitionId: (requisitionId: string): PurchaseOrder[] => {
    const pos = purchaseOrderStorage.getAllPOs();
    return pos.filter((po) => po.requisitionId === requisitionId);
  },

  // Create new PO
  createPO: (
    poData: Omit<PurchaseOrder, "id" | "poNumber" | "createdAt" | "updatedAt">
  ): PurchaseOrder => {
    const pos = purchaseOrderStorage.getAllPOs();

    // Generate PO number (PO-0001, PO-0002, ...)
    const nextNumber = pos.length + 1;
    const poNumber = `PO-${nextNumber.toString().padStart(4, "0")}`;

    const po: PurchaseOrder = {
      ...poData,
      id: `po_${Date.now()}`,
      poNumber,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    pos.push(po);
    localStorage.setItem("purchase_orders", JSON.stringify(pos));

    return po;
  },

  // Update PO status
  updatePOStatus: (
    poId: string,
    status: PurchaseOrder["status"]
  ): PurchaseOrder | null => {
    const pos = purchaseOrderStorage.getAllPOs();
    const poIndex = pos.findIndex((po) => po.id === poId);

    if (poIndex >= 0) {
      pos[poIndex].status = status;
      pos[poIndex].updatedAt = new Date().toISOString();
      localStorage.setItem("purchase_orders", JSON.stringify(pos));
      return pos[poIndex];
    }

    return null;
  },

  // Update PO
  updatePO: (
    poId: string,
    updates: Partial<PurchaseOrder>
  ): PurchaseOrder | null => {
    const pos = purchaseOrderStorage.getAllPOs();
    const poIndex = pos.findIndex((po) => po.id === poId);

    if (poIndex >= 0) {
      pos[poIndex] = {
        ...pos[poIndex],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem("purchase_orders", JSON.stringify(pos));
      return pos[poIndex];
    }

    return null;
  },
};

export interface Supplier {
  [x: string]: any;
  id: string;
  supplierCode: string;
  name: string;
  contactPerson: string;
  phone: string;
  alternativePhone?: string;
  email: string;
  type: "raw_material" | "packaging";
  status: "active" | "inactive";

  // Address Information
  addressLine1: string;
  addressLine2?: string;
  city: string;
  district: string;
  country: string;
  postalCode: string;

  // Bank Information
  bankName?: string;
  accountName?: string;
  accountNumber?: string;
  branchName?: string;
  routingCode?: string;

  // Additional
  notes?: string;

  // Financials
  totalPurchases: number;
  totalPaid: number;
  totalDue: number;
  creditBalance: number; // Amount supplier owes us (negative balance) or we owe supplier (positive balance)

  createdAt: string;
  updatedAt: string;
}

export interface SupplierPayment {
  id: string;
  supplierId: string;
  supplierName: string;
  paymentDate: string;
  amount: number;
  bankName: string;
  transactionId?: string;
  slipNumber?: string;
  notes?: string;
  createdAt: string;
}

// Supplier Storage Functions
export const supplierStorage = {
  // Get all suppliers
  getAllSuppliers: (): Supplier[] => {
    try {
      const suppliers = localStorage.getItem("suppliers");
      return suppliers ? JSON.parse(suppliers) : [];
    } catch (error) {
      console.error("Error reading suppliers from localStorage:", error);
      return [];
    }
  },

  // Get supplier by ID
  getSupplierById: (supplierId: string): Supplier | null => {
    const suppliers = supplierStorage.getAllSuppliers();
    return suppliers.find((supplier) => supplier.id === supplierId) || null;
  },

  // Generate supplier code
  generateSupplierCode: (): string => {
    const suppliers = supplierStorage.getAllSuppliers();
    const nextNumber = suppliers.length + 1;
    return `SUP-${nextNumber.toString().padStart(4, "0")}`;
  },

  // Get supplier purchases (POs)
  getSupplierPurchases: (supplierId: string): any[] => {
    const purchases = purchaseOrderStorage.getAllPOs();
    return purchases.filter((po) => po.supplierId === supplierId);
  },

  getSupplierWithFinancials: (supplierId: string) => {
    const supplier = supplierStorage.getSupplierById(supplierId);
    if (!supplier) return null;

    const purchases = supplierStorage.getSupplierPurchases(supplierId);
    const payments = supplierPaymentStorage.getPaymentsBySupplierId(supplierId);

    const totalPurchase = purchases.reduce(
      (sum, po) => sum + po.totalAmount,
      0
    );
    const totalPayment = payments.reduce(
      (sum, payment) => sum + payment.amount,
      0
    );
    const totalDue = totalPurchase - totalPayment;

    return {
      ...supplier,
      totalPurchase,
      totalPayment,
      totalDue,
      purchases,
      payments,
    };
  },

  // Create new supplier
  createSupplier: (
    supplierData: Omit<
      Supplier,
      | "id"
      | "supplierCode"
      | "totalPurchases"
      | "totalPaid"
      | "totalDue"
      | "createdAt"
      | "updatedAt"
    >
  ): Supplier => {
    const suppliers = supplierStorage.getAllSuppliers();

    const supplierCode = supplierStorage.generateSupplierCode();

    const supplier: Supplier = {
      ...supplierData,
      id: `sup_${Date.now()}`,
      supplierCode,
      totalPurchases: 0,
      totalPaid: 0,
      totalDue: 0,
      creditBalance: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as Supplier;

    suppliers.push(supplier);
    localStorage.setItem("suppliers", JSON.stringify(suppliers));

    return supplier;
  },

  // Update supplier
  updateSupplier: (
    supplierId: string,
    updates: Partial<Supplier>
  ): Supplier | null => {
    const suppliers = supplierStorage.getAllSuppliers();
    const supplierIndex = suppliers.findIndex(
      (supplier) => supplier.id === supplierId
    );

    if (supplierIndex >= 0) {
      suppliers[supplierIndex] = {
        ...suppliers[supplierIndex],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem("suppliers", JSON.stringify(suppliers));
      return suppliers[supplierIndex];
    }

    return null;
  },

  // Delete supplier (only if no purchases exist)
  deleteSupplier: (
    supplierId: string
  ): { success: boolean; message: string } => {
    const purchases = purchaseOrderStorage.getAllPOs();
    const supplierPurchases = purchases.filter(
      (po) => po.supplierId === supplierId
    );

    if (supplierPurchases.length > 0) {
      return {
        success: false,
        message: `Cannot delete supplier. ${supplierPurchases.length} purchase order(s) exist.`,
      };
    }

    const suppliers = supplierStorage.getAllSuppliers();
    const filteredSuppliers = suppliers.filter(
      (supplier) => supplier.id !== supplierId
    );
    localStorage.setItem("suppliers", JSON.stringify(filteredSuppliers));

    return { success: true, message: "Supplier deleted successfully" };
  },

  // Update supplier financials
  updateSupplierFinancials: (
    supplierId: string,
    purchaseAmount: number,
    paymentAmount: number
  ) => {
    const suppliers = supplierStorage.getAllSuppliers();
    const supplierIndex = suppliers.findIndex(
      (supplier) => supplier.id === supplierId
    );

    if (supplierIndex >= 0) {
      suppliers[supplierIndex].totalPurchases += purchaseAmount;
      suppliers[supplierIndex].totalPaid += paymentAmount;
      suppliers[supplierIndex].totalDue =
        suppliers[supplierIndex].totalPurchases -
        suppliers[supplierIndex].totalPaid;
      suppliers[supplierIndex].updatedAt = new Date().toISOString();

      localStorage.setItem("suppliers", JSON.stringify(suppliers));
      return suppliers[supplierIndex];
    }

    return null;
  },
};

// Supplier Payment Storage Functions
export const supplierPaymentStorage = {
  // Get all payments
  getAllPayments: (): SupplierPayment[] => {
    try {
      const payments = localStorage.getItem("supplier_payments");
      return payments ? JSON.parse(payments) : [];
    } catch (error) {
      console.error(
        "Error reading supplier payments from localStorage:",
        error
      );
      return [];
    }
  },

  // Get payments by supplier ID
  getPaymentsBySupplierId: (supplierId: string): SupplierPayment[] => {
    const payments = supplierPaymentStorage.getAllPayments();
    return payments.filter((payment) => payment.supplierId === supplierId);
  },

  // Create new payment
  createPayment: (
    paymentData: Omit<SupplierPayment, "id" | "createdAt">
  ): SupplierPayment => {
    const payments = supplierPaymentStorage.getAllPayments();

    const payment: SupplierPayment = {
      ...paymentData,
      id: `pay_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    payments.push(payment);
    localStorage.setItem("supplier_payments", JSON.stringify(payments));

    // Update supplier financials
    supplierStorage.updateSupplierFinancials(
      paymentData.supplierId,
      0,
      paymentData.amount
    );

    return payment;
  },
};

// BOM Storage Functions
export const bomStorage = {
  // Get all BOMs
  getAllBOMs: (): ProductBOM[] => {
    try {
      const boms = localStorage.getItem(STORAGE_KEYS.PRODUCT_BOMS);
      return boms ? JSON.parse(boms) : [];
    } catch (error) {
      console.error("Error reading BOMs from localStorage:", error);
      return [];
    }
  },

  // Get BOM by product ID
  getBOMByProductId: (productId: string): ProductBOM | null => {
    const boms = bomStorage.getAllBOMs();
    return boms.find((bom) => bom.productId === productId) || null;
  },

  // Save or update BOM
  saveBOM: (
    bomData: Omit<ProductBOM, "createdAt" | "updatedAt">
  ): ProductBOM => {
    const boms = bomStorage.getAllBOMs();
    const existingIndex = boms.findIndex(
      (bom) => bom.productId === bomData.productId
    );

    const now = new Date().toISOString();
    const bom: ProductBOM = {
      ...bomData,
      createdAt: existingIndex >= 0 ? boms[existingIndex].createdAt : now,
      updatedAt: now,
    };

    if (existingIndex >= 0) {
      boms[existingIndex] = bom;
    } else {
      boms.push(bom);
    }

    localStorage.setItem(STORAGE_KEYS.PRODUCT_BOMS, JSON.stringify(boms));
    return bom;
  },

  // Delete BOM
  deleteBOM: (productId: string): boolean => {
    const boms = bomStorage.getAllBOMs();
    const filteredBoms = boms.filter((bom) => bom.productId !== productId);
    localStorage.setItem(
      STORAGE_KEYS.PRODUCT_BOMS,
      JSON.stringify(filteredBoms)
    );
    return filteredBoms.length < boms.length;
  },
};

// Requisition Storage Functions
export const requisitionStorage = {
  // Get all requisitions
  getAllRequisitions: (): Requisition[] => {
    try {
      const requisitions = localStorage.getItem(STORAGE_KEYS.REQUISITIONS);
      return requisitions ? JSON.parse(requisitions) : [];
    } catch (error) {
      console.error("Error reading requisitions from localStorage:", error);
      return [];
    }
  },

  // Get requisitions by product ID
  getRequisitionsByProductId: (productId: string): Requisition[] => {
    const requisitions = requisitionStorage.getAllRequisitions();
    return requisitions.filter((req) => req.productId === productId);
  },

  // Create new requisition
  createRequisition: (
    requisitionData: Omit<Requisition, "id" | "requisitionNumber" | "createdAt">
  ): Requisition => {
    const requisitions = requisitionStorage.getAllRequisitions();

    // Generate requisition number (REQ-0001, REQ-0002, ...)
    const nextNumber = requisitions.length + 1;
    const requisitionNumber = `REQ-${nextNumber.toString().padStart(4, "0")}`;

    const requisition: Requisition = {
      ...requisitionData,
      id: `req_${Date.now()}`,
      requisitionNumber,
      createdAt: new Date().toISOString(),
    };

    requisitions.push(requisition);
    localStorage.setItem(
      STORAGE_KEYS.REQUISITIONS,
      JSON.stringify(requisitions)
    );

    return requisition;
  },

  // Update requisition status
  updateRequisitionStatus: (
    requisitionId: string,
    status: Requisition["status"]
  ): Requisition | null => {
    const requisitions = requisitionStorage.getAllRequisitions();
    const requisitionIndex = requisitions.findIndex(
      (req) => req.id === requisitionId
    );

    if (requisitionIndex >= 0) {
      requisitions[requisitionIndex].status = status;
      localStorage.setItem(
        STORAGE_KEYS.REQUISITIONS,
        JSON.stringify(requisitions)
      );
      return requisitions[requisitionIndex];
    }

    return null;
  },
};

// Mock data for raw materials (you can replace this with actual data later)
export const mockRawMaterials = [
  {
    id: "rm_1",
    name: "Fresh Apples",
    unit: { symbol: "kg", name: "Kilogram" },
    currentStock: 200,
    minStock: 50,
    maxStock: 1000,
    supplierId: "sup_1",
    supplier: { id: "sup_1", name: "BD Agro Traders" },
    averageCost: 120,
  },
  {
    id: "rm_2",
    name: "Sugar",
    unit: { symbol: "kg", name: "Kilogram" },
    currentStock: 5, // Below min stock
    minStock: 10,
    maxStock: 500,
    supplierId: "sup_1",
    supplier: { id: "sup_1", name: "BD Agro Traders" },
    averageCost: 55,
  },
  {
    id: "rm_3",
    name: "Preservatives",
    unit: { symbol: "kg", name: "Kilogram" },
    currentStock: 8, // Below min stock
    minStock: 10,
    maxStock: 200,
    supplierId: "sup_2",
    supplier: { id: "sup_2", name: "ABC Flour Mill" },
    averageCost: 450,
  },
  {
    id: "rm_4",
    name: "Natural Flavoring",
    unit: { symbol: "kg", name: "Kilogram" },
    currentStock: 3, // Below min stock
    minStock: 5,
    maxStock: 100,
    supplierId: "sup_2",
    supplier: { id: "sup_2", name: "ABC Flour Mill" },
    averageCost: 280,
  },
  {
    id: "rm_5",
    name: "Bottles (500ml)",
    unit: { symbol: "pcs", name: "Pieces" },
    currentStock: 4800, // Below min stock
    minStock: 1000,
    maxStock: 20000,
    supplierId: "sup_3",
    supplier: { id: "sup_3", name: "PaperHouse Ltd." },
    averageCost: 12,
  },
];

// Mock suppliers data that corresponds to the suppliers referenced in mockRawMaterials
export const mockSuppliers: Supplier[] = [
  {
    id: "sup_1",
    supplierCode: "SUP-001",
    name: "BD Agro Traders",
    contactPerson: "Rahim Khan",
    phone: "01712345678",
    email: "rahim@bdagro.com",
    type: "raw_material",
    status: "active",
    addressLine1: "123 Market Road",
    city: "Dhaka",
    district: "Dhaka",
    country: "Bangladesh",
    postalCode: "1205",
    totalPurchases: 0,
    totalPaid: 0,
    totalDue: 0,
    creditBalance: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "sup_2",
    supplierCode: "SUP-002",
    name: "ABC Flour Mill",
    contactPerson: "Kamal Hossain",
    phone: "01712345679",
    email: "kamal@abcflour.com",
    type: "raw_material",
    status: "active",
    addressLine1: "456 Industrial Area",
    city: "Chittagong",
    district: "Chittagong",
    country: "Bangladesh",
    postalCode: "4000",
    totalPurchases: 0,
    totalPaid: 0,
    totalDue: 0,
    creditBalance: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "sup_3",
    supplierCode: "SUP-003",
    name: "PaperHouse Ltd.",
    contactPerson: "Sadia Ahmed",
    phone: "01712345680",
    email: "sadia@paperhouse.com",
    type: "packaging",
    status: "active",
    addressLine1: "789 Packaging Street",
    city: "Dhaka",
    district: "Dhaka",
    country: "Bangladesh",
    postalCode: "1212",
    totalPurchases: 0,
    totalPaid: 0,
    totalDue: 0,
    creditBalance: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// utils/localStorageUtils.ts - Add these interfaces and functions

export interface Warehouse {
  rooms: boolean;
  id: string;
  name: string;
  location?: string;
  manager?: string;
  capacity?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Room {
  [x: string]: any;
  id: string;
  name: string;
  warehouseId: string;
  warehouseName?: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Rack {
  id: string;
  name: string;
  roomId: string;
  roomName?: string;
  warehouseId?: string;
  warehouseName?: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Warehouse Storage Functions
export const warehouseStorage = {
  // Get all warehouses
  getAllWarehouses: (): Warehouse[] => {
    try {
      const warehouses = localStorage.getItem("warehouses");
      return warehouses ? JSON.parse(warehouses) : [];
    } catch (error) {
      console.error("Error reading warehouses from localStorage:", error);
      return [];
    }
  },

  // Get warehouse by ID
  getWarehouseById: (warehouseId: string): Warehouse | null => {
    const warehouses = warehouseStorage.getAllWarehouses();
    return warehouses.find((warehouse) => warehouse.id === warehouseId) || null;
  },

  // Create new warehouse
  createWarehouse: (
    warehouseData: Omit<Warehouse, "id" | "createdAt" | "updatedAt">
  ): Warehouse => {
    const warehouses = warehouseStorage.getAllWarehouses();

    const warehouse: Warehouse = {
      ...warehouseData,
      id: `wh_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    warehouses.push(warehouse);
    localStorage.setItem("warehouses", JSON.stringify(warehouses));

    return warehouse;
  },

  // Update warehouse
  updateWarehouse: (
    warehouseId: string,
    updates: Partial<Warehouse>
  ): Warehouse | null => {
    const warehouses = warehouseStorage.getAllWarehouses();
    const warehouseIndex = warehouses.findIndex(
      (warehouse) => warehouse.id === warehouseId
    );

    if (warehouseIndex >= 0) {
      warehouses[warehouseIndex] = {
        ...warehouses[warehouseIndex],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem("warehouses", JSON.stringify(warehouses));
      return warehouses[warehouseIndex];
    }

    return null;
  },

  // Delete warehouse (only if no rooms exist)
  deleteWarehouse: (
    warehouseId: string
  ): { success: boolean; message: string } => {
    const rooms = roomStorage.getRoomsByWarehouse(warehouseId);

    if (rooms.length > 0) {
      return {
        success: false,
        message: `Cannot delete warehouse. ${rooms.length} room(s) exist.`,
      };
    }

    const warehouses = warehouseStorage.getAllWarehouses();
    const filteredWarehouses = warehouses.filter(
      (warehouse) => warehouse.id !== warehouseId
    );
    localStorage.setItem("warehouses", JSON.stringify(filteredWarehouses));

    return { success: true, message: "Warehouse deleted successfully" };
  },
};

// Room Storage Functions
export const roomStorage = {
  // Get all rooms
  getAllRooms: (): Room[] => {
    try {
      const rooms = localStorage.getItem("rooms");
      return rooms ? JSON.parse(rooms) : [];
    } catch (error) {
      console.error("Error reading rooms from localStorage:", error);
      return [];
    }
  },

  // Get rooms by warehouse ID
  getRoomsByWarehouse: (warehouseId: string): Room[] => {
    const rooms = roomStorage.getAllRooms();
    return rooms.filter((room) => room.warehouseId === warehouseId);
  },

  // Get room by ID
  getRoomById: (roomId: string): Room | null => {
    const rooms = roomStorage.getAllRooms();
    return rooms.find((room) => room.id === roomId) || null;
  },

  // Create new room
  createRoom: (
    roomData: Omit<Room, "id" | "createdAt" | "updatedAt">
  ): Room => {
    const rooms = roomStorage.getAllRooms();

    const room: Room = {
      ...roomData,
      id: `room_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as Room;

    rooms.push(room);
    localStorage.setItem("rooms", JSON.stringify(rooms));

    return room;
  },

  // Update room
  updateRoom: (roomId: string, updates: Partial<Room>): Room | null => {
    const rooms = roomStorage.getAllRooms();
    const roomIndex = rooms.findIndex((room) => room.id === roomId);

    if (roomIndex >= 0) {
      rooms[roomIndex] = {
        ...rooms[roomIndex],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem("rooms", JSON.stringify(rooms));
      return rooms[roomIndex];
    }

    return null;
  },

  // Delete room (only if no racks exist)
  deleteRoom: (roomId: string): { success: boolean; message: string } => {
    const racks = rackStorage.getRacksByRoom(roomId);

    if (racks.length > 0) {
      return {
        success: false,
        message: `Cannot delete room. ${racks.length} rack(s) exist.`,
      };
    }

    const rooms = roomStorage.getAllRooms();
    const filteredRooms = rooms.filter((room) => room.id !== roomId);
    localStorage.setItem("rooms", JSON.stringify(filteredRooms));

    return { success: true, message: "Room deleted successfully" };
  },
};

// Rack Storage Functions
export const rackStorage = {
  // Get all racks
  getAllRacks: (): Rack[] => {
    try {
      const racks = localStorage.getItem("racks");
      return racks ? JSON.parse(racks) : [];
    } catch (error) {
      console.error("Error reading racks from localStorage:", error);
      return [];
    }
  },

  // Get racks by room ID
  getRacksByRoom: (roomId: string): Rack[] => {
    const racks = rackStorage.getAllRacks();
    return racks.filter((rack) => rack.roomId === roomId);
  },

  // Get rack by ID
  getRackById: (rackId: string): Rack | null => {
    const racks = rackStorage.getAllRacks();
    return racks.find((rack) => rack.id === rackId) || null;
  },

  // Create new rack
  createRack: (
    rackData: Omit<Rack, "id" | "createdAt" | "updatedAt">
  ): Rack => {
    const racks = rackStorage.getAllRacks();

    const rack: Rack = {
      ...rackData,
      id: `rack_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    racks.push(rack);
    localStorage.setItem("racks", JSON.stringify(racks));

    return rack;
  },

  // Update rack
  updateRack: (rackId: string, updates: Partial<Rack>): Rack | null => {
    const racks = rackStorage.getAllRacks();
    const rackIndex = racks.findIndex((rack) => rack.id === rackId);

    if (rackIndex >= 0) {
      racks[rackIndex] = {
        ...racks[rackIndex],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem("racks", JSON.stringify(racks));
      return racks[rackIndex];
    }

    return null;
  },

  // Delete rack
  deleteRack: (rackId: string): boolean => {
    const racks = rackStorage.getAllRacks();
    const filteredRacks = racks.filter((rack) => rack.id !== rackId);
    localStorage.setItem("racks", JSON.stringify(filteredRacks));
    return filteredRacks.length < racks.length;
  },
};

// Helper function to get complete warehouse structure
export const getWarehouseStructure = (warehouseId: string) => {
  const warehouse = warehouseStorage.getWarehouseById(warehouseId);
  if (!warehouse) return null;

  const rooms = roomStorage.getRoomsByWarehouse(warehouseId).map((room) => {
    const racks = rackStorage.getRacksByRoom(room.id);
    return {
      ...room,
      racks,
    };
  });

  return {
    ...warehouse,
    rooms,
  };
};

// Purchase Storage Functions
export const purchaseStorage = {
  // Get all purchases
  getAllPurchases: (): IPurchase[] => {
    try {
      const purchases = localStorage.getItem("purchases");
      return purchases ? JSON.parse(purchases) : [];
    } catch (error) {
      console.error("Error reading purchases from localStorage:", error);
      return [];
    }
  },

  // Get purchase by ID
  getPurchaseById: (purchaseId: string): IPurchase | null => {
    const purchases = purchaseStorage.getAllPurchases();
    return purchases.find((purchase) => purchase.id === purchaseId) || null;
  },

  // Generate purchase ID
  generatePurchaseId: (): string => {
    const purchases = purchaseStorage.getAllPurchases();
    const nextNumber = purchases.length + 1;
    return `PUR-${nextNumber.toString().padStart(4, "0")}`;
  },

  // Create new purchase
  createPurchase: (
    purchaseData: Omit<
      IPurchase,
      "id" | "purchaseId" | "createdAt" | "updatedAt"
    >
  ): IPurchase => {
    const purchases = purchaseStorage.getAllPurchases();

    const purchaseId = purchaseStorage.generatePurchaseId();

    const purchase: IPurchase = {
      ...purchaseData,
      id: `purchase_${Date.now()}`,
      purchaseId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    purchases.push(purchase);
    localStorage.setItem("purchases", JSON.stringify(purchases));

    return purchase;
  },

  // Update purchase
  updatePurchase: (
    purchaseId: string,
    updates: Partial<IPurchase>
  ): IPurchase | null => {
    const purchases = purchaseStorage.getAllPurchases();
    const purchaseIndex = purchases.findIndex(
      (purchase) => purchase.id === purchaseId
    );

    if (purchaseIndex >= 0) {
      purchases[purchaseIndex] = {
        ...purchases[purchaseIndex],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem("purchases", JSON.stringify(purchases));
      return purchases[purchaseIndex];
    }

    return null;
  },

  // Delete purchase
  deletePurchase: (purchaseId: string): boolean => {
    const purchases = purchaseStorage.getAllPurchases();
    const filteredPurchases = purchases.filter(
      (purchase) => purchase.id !== purchaseId
    );
    localStorage.setItem("purchases", JSON.stringify(filteredPurchases));
    return filteredPurchases.length < purchases.length;
  },

  // Get purchases by supplier
  getPurchasesBySupplier: (supplierId: string): IPurchase[] => {
    const purchases = purchaseStorage.getAllPurchases();
    return purchases.filter((purchase) => purchase.supplierId === supplierId);
  },

  // Get purchases by date range
  getPurchasesByDateRange: (
    startDate: string,
    endDate: string
  ): IPurchase[] => {
    const purchases = purchaseStorage.getAllPurchases();
    return purchases.filter((purchase) => {
      const purchaseDate = new Date(purchase.purchaseDate);
      return (
        purchaseDate >= new Date(startDate) && purchaseDate <= new Date(endDate)
      );
    });
  },

  // Get purchases by payment status
  getPurchasesByPaymentStatus: (
    status: IPurchase["paymentStatus"]
  ): IPurchase[] => {
    const purchases = purchaseStorage.getAllPurchases();
    return purchases.filter((purchase) => purchase.paymentStatus === status);
  },
};

// Purchase Return Storage Functions
export const purchaseReturnStorage = {
  // Get all returns
  getAllReturns: (): IPurchaseReturn[] => {
    try {
      const returns = localStorage.getItem("purchase_returns");
      return returns ? JSON.parse(returns) : [];
    } catch (error) {
      console.error("Error reading purchase returns from localStorage:", error);
      return [];
    }
  },

  // Get return by ID
  getReturnById: (returnId: string): IPurchaseReturn | null => {
    const returns = purchaseReturnStorage.getAllReturns();
    return returns.find((ret) => ret.id === returnId) || null;
  },

  // Generate return ID
  generateReturnId: (): string => {
    const returns = purchaseReturnStorage.getAllReturns();
    const nextNumber = returns.length + 1;
    return `RET-${nextNumber.toString().padStart(4, "0")}`;
  },

  // Create new return
  createReturn: (
    returnData: Omit<IPurchaseReturn, "id" | "returnId" | "createdAt">
  ): IPurchaseReturn => {
    const returns = purchaseReturnStorage.getAllReturns();

    const returnId = purchaseReturnStorage.generateReturnId();

    const purchaseReturn: IPurchaseReturn = {
      ...returnData,
      id: `return_${Date.now()}`,
      returnId,
      createdAt: new Date().toISOString(),
    };

    returns.push(purchaseReturn);
    localStorage.setItem("purchase_returns", JSON.stringify(returns));

    return purchaseReturn;
  },

  // Update return
  updateReturn: (
    returnId: string,
    updates: Partial<IPurchaseReturn>
  ): IPurchaseReturn | null => {
    const returns = purchaseReturnStorage.getAllReturns();
    const returnIndex = returns.findIndex((ret) => ret.id === returnId);

    if (returnIndex >= 0) {
      returns[returnIndex] = {
        ...returns[returnIndex],
        ...updates,
      };
      localStorage.setItem("purchase_returns", JSON.stringify(returns));
      return returns[returnIndex];
    }

    return null;
  },

  // Delete return
  deleteReturn: (returnId: string): boolean => {
    const returns = purchaseReturnStorage.getAllReturns();
    const filteredReturns = returns.filter((ret) => ret.id !== returnId);
    localStorage.setItem("purchase_returns", JSON.stringify(filteredReturns));
    return filteredReturns.length < returns.length;
  },

  // Get returns by purchase ID
  getReturnsByPurchaseId: (purchaseId: string): IPurchaseReturn[] => {
    const returns = purchaseReturnStorage.getAllReturns();
    return returns.filter((ret) => ret.purchaseId === purchaseId);
  },
};

// Purchase Payment Storage Functions
export const purchasePaymentStorage = {
  // Get all payments
  getAllPayments: (): IPurchasePayment[] => {
    try {
      const payments = localStorage.getItem("purchase_payments");
      return payments ? JSON.parse(payments) : [];
    } catch (error) {
      console.error(
        "Error reading purchase payments from localStorage:",
        error
      );
      return [];
    }
  },

  // Get payments by purchase ID
  getPaymentsByPurchaseId: (purchaseId: string): IPurchasePayment[] => {
    const payments = purchasePaymentStorage.getAllPayments();
    return payments.filter((payment) => payment.purchaseId === purchaseId);
  },

  // Create new payment
  createPayment: (
    paymentData: Omit<IPurchasePayment, "id" | "createdAt">
  ): IPurchasePayment => {
    const payments = purchasePaymentStorage.getAllPayments();

    const payment: IPurchasePayment = {
      ...paymentData,
      id: `payment_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    payments.push(payment);
    localStorage.setItem("purchase_payments", JSON.stringify(payments));

    return payment;
  },

  // Update payment
  updatePayment: (
    paymentId: string,
    updates: Partial<IPurchasePayment>
  ): IPurchasePayment | null => {
    const payments = purchasePaymentStorage.getAllPayments();
    const paymentIndex = payments.findIndex(
      (payment) => payment.id === paymentId
    );

    if (paymentIndex >= 0) {
      payments[paymentIndex] = {
        ...payments[paymentIndex],
        ...updates,
      };
      localStorage.setItem("purchase_payments", JSON.stringify(payments));
      return payments[paymentIndex];
    }

    return null;
  },
};

// Purchase Need Storage Functions
export const purchaseNeedStorage = {
  // Get all purchase needs
  getAllPurchaseNeeds: (): IPurchaseNeed[] => {
    try {
      const needs = localStorage.getItem("purchase_needs");
      return needs ? JSON.parse(needs) : [];
    } catch (error) {
      console.error("Error reading purchase needs from localStorage:", error);
      return [];
    }
  },

  // Get purchase need by ID
  getPurchaseNeedById: (needId: string): IPurchaseNeed | null => {
    const needs = purchaseNeedStorage.getAllPurchaseNeeds();
    return needs.find((need) => need.id === needId) || null;
  },

  // Generate purchase need ID
  generatePurchaseNeedId: (): string => {
    const needs = purchaseNeedStorage.getAllPurchaseNeeds();
    const nextNumber = needs.length + 1;
    return `PN-${nextNumber.toString().padStart(4, "0")}`;
  },

  // Create new purchase need
  createPurchaseNeed: (
    needData: Omit<IPurchaseNeed, "id" | "needId" | "createdAt" | "updatedAt">
  ): IPurchaseNeed => {
    const needs = purchaseNeedStorage.getAllPurchaseNeeds();

    const needId = purchaseNeedStorage.generatePurchaseNeedId();

    const need: IPurchaseNeed = {
      ...needData,
      id: `need_${Date.now()}`,
      needId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    needs.push(need);
    localStorage.setItem("purchase_needs", JSON.stringify(needs));

    return need;
  },

  // Update purchase need
  updatePurchaseNeed: (
    needId: string,
    updates: Partial<IPurchaseNeed>
  ): IPurchaseNeed | null => {
    const needs = purchaseNeedStorage.getAllPurchaseNeeds();
    const needIndex = needs.findIndex((need) => need.id === needId);

    if (needIndex >= 0) {
      needs[needIndex] = {
        ...needs[needIndex],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem("purchase_needs", JSON.stringify(needs));
      return needs[needIndex];
    }

    return null;
  },

  // Delete purchase need
  deletePurchaseNeed: (needId: string): boolean => {
    const needs = purchaseNeedStorage.getAllPurchaseNeeds();
    const filteredNeeds = needs.filter((need) => need.id !== needId);
    localStorage.setItem("purchase_needs", JSON.stringify(filteredNeeds));
    return filteredNeeds.length < needs.length;
  },

  // Get purchase needs by supplier
  getPurchaseNeedsBySupplier: (supplierId: string): IPurchaseNeed[] => {
    const needs = purchaseNeedStorage.getAllPurchaseNeeds();
    return needs.filter((need) => need.supplierId === supplierId);
  },

  // Get purchase needs by status
  getPurchaseNeedsByStatus: (
    status: IPurchaseNeed["status"]
  ): IPurchaseNeed[] => {
    const needs = purchaseNeedStorage.getAllPurchaseNeeds();
    return needs.filter((need) => need.status === status);
  },

  // Generate purchase needs from low stock materials
  generatePurchaseNeedsFromLowStock: () => {
    const materials = getRawMaterials();
    const suppliers = supplierStorage.getAllSuppliers();
    const existingNeeds = purchaseNeedStorage.getAllPurchaseNeeds();

    // Group materials by supplier that are below min stock
    const lowStockMaterials = materials.filter(
      (material: any) => material.currentStock <= material.minStock
    );

    const supplierGroups: { [supplierId: string]: any[] } = {};

    lowStockMaterials.forEach((material: any) => {
      if (material.supplierId) {
        if (!supplierGroups[material.supplierId]) {
          supplierGroups[material.supplierId] = [];
        }
        supplierGroups[material.supplierId].push(material);
      }
    });

    const createdNeeds: IPurchaseNeed[] = [];

    // Create purchase need for each supplier
    Object.entries(supplierGroups).forEach(([supplierId, materials]) => {
      const supplier = suppliers.find((s) => s.id === supplierId);
      if (!supplier) return;

      // Check if there's already a pending need for this supplier
      const existingNeed = existingNeeds.find(
        (need) => need.supplierId === supplierId && need.status === "pending"
      );

      if (existingNeed) {
        // Update existing need with new items
        const existingMaterialIds = existingNeed.items.map(
          (item) => item.materialId
        );
        const newItems = materials
          .filter((material) => !existingMaterialIds.includes(material.id))
          .map((material) => ({
            materialId: material.id,
            materialName: material.name,
            currentStock: material.currentStock,
            minStock: material.minStock,
            maxStock: material.maxStock,
            quantity: Math.max(0, material.maxStock - material.currentStock),
            unitPrice: material.averageCost || 0,
            totalPrice:
              Math.max(0, material.maxStock - material.currentStock) *
              (material.averageCost || 0),
            unit: material.unit?.symbol || "pcs",
            supplierId: supplier.id,
            supplierName: supplier.name,
          }));

        if (newItems.length > 0) {
          const updatedItems = [...existingNeed.items, ...newItems];
          const totalMaterials = updatedItems.length;
          const totalQty = updatedItems.reduce(
            (sum, item) => sum + item.quantity,
            0
          );
          const totalPrice = updatedItems.reduce(
            (sum, item) => sum + item.totalPrice,
            0
          );

          purchaseNeedStorage.updatePurchaseNeed(existingNeed.id, {
            items: updatedItems,
            totalMaterials,
            totalQty,
            totalPrice,
          });
        }
      } else {
        // Create new purchase need
        const items = materials.map((material) => ({
          materialId: material.id,
          materialName: material.name,
          currentStock: material.currentStock,
          minStock: material.minStock,
          maxStock: material.maxStock,
          quantity: Math.max(0, material.maxStock - material.currentStock),
          unitPrice: material.averageCost || 0,
          totalPrice:
            Math.max(0, material.maxStock - material.currentStock) *
            (material.averageCost || 0),
          unit: material.unit?.symbol || "pcs",
          supplierId: supplier.id,
          supplierName: supplier.name,
        }));

        const totalMaterials = items.length;
        const totalQty = items.reduce((sum, item) => sum + item.quantity, 0);
        const totalPrice = items.reduce(
          (sum, item) => sum + item.totalPrice,
          0
        );

        // Determine priority based on stock levels
        const criticalItems = items.filter((item) => item.currentStock <= 0);
        const lowItems = items.filter(
          (item) => item.currentStock > 0 && item.currentStock <= item.minStock
        );

        let priority: "low" | "medium" | "high" | "critical" = "low";
        if (criticalItems.length > 0) {
          priority = "critical";
        } else if (lowItems.length > totalMaterials * 0.5) {
          priority = "high";
        } else if (lowItems.length > 0) {
          priority = "medium";
        }

        const newNeed = purchaseNeedStorage.createPurchaseNeed({
          supplierId: supplier.id,
          supplierName: supplier.name,
          supplierContactPerson: supplier.contactPerson || "",
          supplierAddress: supplier.addressLine1 || "",
          items,
          totalMaterials,
          totalQty,
          totalPrice,
          status: "pending",
          priority,
          notes: `Auto-generated from low stock materials`,
          createdBy: "system",
        });

        createdNeeds.push(newNeed);
      }
    });

    return createdNeeds;
  },
};

// Initialize sample data function
export const initializeSampleData = () => {
  // Initialize raw materials with empty array (users will create their own)
  if (!localStorage.getItem("raw_materials")) {
    localStorage.setItem("raw_materials", JSON.stringify([]));
  }

  // Initialize suppliers with empty array (users will create their own)
  if (!localStorage.getItem("suppliers")) {
    localStorage.setItem("suppliers", JSON.stringify([]));
  }

  // Initialize other entities if needed
  if (!localStorage.getItem("warehouses")) {
    localStorage.setItem("warehouses", JSON.stringify([]));
  }

  if (!localStorage.getItem("rooms")) {
    localStorage.setItem("rooms", JSON.stringify([]));
  }

  if (!localStorage.getItem("racks")) {
    localStorage.setItem("racks", JSON.stringify([]));
  }

  if (!localStorage.getItem("purchase_orders")) {
    localStorage.setItem("purchase_orders", JSON.stringify([]));
  }

  if (!localStorage.getItem("purchase_needs")) {
    localStorage.setItem("purchase_needs", JSON.stringify([]));
  }

  if (!localStorage.getItem("purchases")) {
    localStorage.setItem("purchases", JSON.stringify([]));
  }

  if (!localStorage.getItem("purchase_returns")) {
    localStorage.setItem("purchase_returns", JSON.stringify([]));
  }

  if (!localStorage.getItem("purchase_payments")) {
    localStorage.setItem("purchase_payments", JSON.stringify([]));
  }

  if (!localStorage.getItem("supplier_payments")) {
    localStorage.setItem("supplier_payments", JSON.stringify([]));
  }

  if (!localStorage.getItem("material_receivings")) {
    localStorage.setItem("material_receivings", JSON.stringify([]));
  }

  if (!localStorage.getItem("stock_transactions")) {
    localStorage.setItem("stock_transactions", JSON.stringify([]));
  }

  if (!localStorage.getItem(STORAGE_KEYS.PRODUCT_BOMS)) {
    localStorage.setItem(STORAGE_KEYS.PRODUCT_BOMS, JSON.stringify([]));
  }

  if (!localStorage.getItem(STORAGE_KEYS.REQUISITIONS)) {
    localStorage.setItem(STORAGE_KEYS.REQUISITIONS, JSON.stringify([]));
  }
};
