import { DataTable } from "../../../components/common/Tables";
import { DisplayCurrency } from "../../../utils/currency";

interface CategoryPerformance {
  categoryId: string;
  categoryName: string;
  totalQuantity: number;
  totalAmount: number;
  salesCount: number;
}

interface ApiResponse {
  success: boolean;
  status: number;
  message: string;
  data: CategoryPerformance[];
}

interface CategoryTableProps {
  data: ApiResponse | CategoryPerformance[];
  loading?: boolean;
  fetching?: boolean;
}

const CategoryPerformanceTable: React.FC<CategoryTableProps> = ({
  data,
  loading = false,
  fetching = false,
}) => {
  const categoryData: CategoryPerformance[] = "data" in data ? data.data : data;

  // No longer needed, using DisplayCurrency instead

  const CategoryColumns = [
    {
      title: "Category Name",
      dataIndex: "categoryName",
      key: "categoryName",
      render: (categoryName: string) => (
        <span className="font-medium text-black">{categoryName}</span>
      ),
    },
    {
      title: "Total Amount",
      dataIndex: "totalAmount",
      key: "totalAmount",
      render: (totalAmount: number) => (
        <span className="font-semibold text-primary">
          <DisplayCurrency amount={totalAmount} />
        </span>
      ),
    },
    {
      title: "Total Quantity",
      dataIndex: "totalQuantity",
      key: "totalQuantity",
      render: (totalQuantity: number) => (
        <span className="text-black">{totalQuantity} pcs</span>
      ),
    },
    {
      title: "Sales Count",
      dataIndex: "salesCount",
      key: "salesCount",
      render: (salesCount: number) => (
        <span className="text-black">{salesCount}</span>
      ),
    },
  ];

  return (
    <div>
      <div className=" mt-7 mb-4">
        <div className="flex justify-between items-center mb-5">
          <h3 className="font-semibold text-[16px] text-gray-800">
            Category Wise Sales
          </h3>
          <div className="bg-primary bg-opacity-20 px-3 py-1 rounded-full">
            <span className="text-white font-semibold text-sm">
              {categoryData.length} Categories
            </span>
          </div>
        </div>

        <div className="overflow-x-auto max-h-[1000px] overflow-y-auto">
          <DataTable
            columns={CategoryColumns}
            loading={loading || fetching}
            data={categoryData || []}
            scroll={{ x: true }}
            className="rounded-lg shadow-sm"
          />
        </div>

        {/* Summary Stats */}
        {categoryData.length > 0 && (
          <div className="grid grid-cols-3 gap-4 mt-6 p-4 bg-gray-50 rounded-lg">
            <div className="text-center">
              <div className="text-lg font-bold text-primary">
                <DisplayCurrency
                  amount={categoryData.reduce(
                    (sum, item) => sum + item.totalAmount,
                    0,
                  )}
                />
              </div>
              <div className="text-xs text-gray-600">Total Revenue</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-black">
                {categoryData.reduce(
                  (sum, item) => sum + item.totalQuantity,
                  0,
                )}
              </div>
              <div className="text-xs text-gray-600">Total Quantity</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-black">
                {categoryData.reduce((sum, item) => sum + item.salesCount, 0)}
              </div>
              <div className="text-xs text-gray-600">Total Sales</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryPerformanceTable;
