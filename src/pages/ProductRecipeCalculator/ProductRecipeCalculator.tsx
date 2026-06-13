import {
  Button,
  Space,
  Tooltip,
  Input,
  Modal,
} from "antd";
import {
  FiEdit,
  FiTrash2,
} from "react-icons/fi";
import { Search, Plus, RefreshCcw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import PageMeta from "../../components/common/Meta/PageMeta";
import PageHeader from "../../components/common/Navigation/PageHeader";
import {
  useGetAllRecipesQuery,
  useDeleteRecipeMutation,
} from "../../redux/features/productRecipeCalculator/productRecipeCalculatorApi";
import CurrencyIcon from "../../components/common/CurrencyIcon";
import { DataTable } from "../../components/common/Tables";
import CustomActionButton from "../../components/common/Button/CustomActionButton";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import { useState, useRef } from "react";
import { debounce } from "../../utils/debounce";

const ProductRecipeCalculator = () => {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const debounceSearch = useRef(
    debounce((value: string) => {
      setSearchText(value);
      setPage(1);
    }, 500)
  ).current;

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    debounceSearch(value);
  };

  // Queries
  const { data: recipesData, isLoading: recipesLoading, isFetching, refetch } = useGetAllRecipesQuery([
    { name: "page", value: page.toString() },
    { name: "limit", value: limit.toString() },
    searchText ? { name: "search", value: searchText } : null,
  ].filter(Boolean));

  // Mutations
  const [deleteRecipe] = useDeleteRecipeMutation();

  const recipes = recipesData?.data || [];
  const meta = recipesData?.meta;

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: "Are you sure you want to delete this recipe?",
      icon: <ExclamationCircleOutlined />,
      content: "This action cannot be undone.",
      okText: "Yes, Delete",
      okType: "danger",
      onOk: async () => {
        try {
          await deleteRecipe(id).unwrap();
          toast.success("Recipe deleted successfully");
        } catch (error: any) {
          toast.error(error?.data?.message || "Failed to delete");
        }
      },
    });
  };

  const columns = [
    {
      title: "Product",
      dataIndex: "product",
      key: "product",
      render: (product: any) => product?.name || "General Recipe",
    },
    {
      title: "Base Qty",
      dataIndex: "baseQuantity",
      key: "baseQuantity",
      render: (qty: number) => `${qty} Units`,
    },
    {
      title: "Materials",
      dataIndex: "materials",
      key: "materials",
      align: "center" as const,
      render: (mats: any[]) => (
        <span className="bg-gray-100 px-2 py-0.5 rounded text-xs font-semibold">
          {mats?.length || 0} items
        </span>
      ),
    },
    {
      title: "Total Cost",
      dataIndex: "totalBaseCost",
      key: "totalBaseCost",
      render: (cost: number) => (
        <span className="font-semibold text-gray-900">
          <CurrencyIcon size={12} className="inline-block mr-1" />
          {cost.toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      title: "Cost / Unit",
      key: "perUnit",
      render: (record: any) => (
        <span className="text-primary font-bold">
          <CurrencyIcon size={12} className="inline-block mr-1" />
          {(record.totalBaseCost / record.baseQuantity).toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      align: "center" as const,
      fixed: "right",
      render: (record: any) => (
        <Space size="middle">
          <Tooltip title="Edit">
            <Button
              className="flex items-center justify-center h-8 w-8 rounded-lg border-gray-200 hover:border-primary hover:text-primary transition-all shadow-none"
              icon={<FiEdit />}
              onClick={() => navigate(`/product-recipe-calculator/update/${record.id}`)}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Button
              danger
              className="flex items-center justify-center h-8 w-8 rounded-lg border-red-200 hover:bg-red-50 hover:border-red-400 transition-all text-red-500 shadow-none"
              icon={<FiTrash2 />}
              onClick={() => handleDelete(record.id)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <>
      <PageMeta title="Product Recipe Calculator - UserKotha.Shop" description="Manage and view saved product recipes and costs." />
      <PageHeader
        title="Product Recipe Calculator"
        subtitle="Calculate and manage production costs for your recipes."
        breadcrumbs={[
          { title: "Dashboard", path: "/" },
          { title: "Recipe Calculator" },
        ]}
        extra={
          <>
            <CustomActionButton
              onClick={() => refetch()}
              text="Refresh"
              icon={<RefreshCcw size={16} />}
              type="default"
            />
            <CustomActionButton
              onClick={() => navigate("/product-recipe-calculator/create")}
              text="New Calculation"
              icon={<Plus size={16} />}
              type="primary"
            />
          </>
        }
      />

      <div className="pt-0">
        <div className="mb-4 flex justify-between items-center gap-4">
          <Input
            placeholder="Search recipes..."
            prefix={<Search className="w-4 h-4 text-gray-400" />}
            value={inputValue}
            onChange={handleSearch}
            allowClear
            className="max-w-md  rounded-lg"
          />
        </div>

        <DataTable
          loading={recipesLoading || isFetching}
          data={recipes}
          columns={columns}
          rowKey="id"
          isPaginate={meta?.total > limit}
          currentPage={page}
          setCurrentPage={setPage}
          limit={limit}
          setLimit={setLimit}
          total={meta?.total || 0}
          showSizeChanger={true}
        />
      </div>
    </>
  );
};

export default ProductRecipeCalculator;
