import { useRef, useState } from "react";
import { Input, Tag } from "antd";
import { Search } from "lucide-react";
import { DataTable } from "../../../../components/common/Tables";
import FilterColumn from "../../../../components/common/FilterColumn/FilterColumn.tsx";
import { debounce } from "../../../../utils/debounce";

const OrderStatusReportTab = () => {
  const [selectedColumnKeys, setSelectedColumnKeys] = useState<string[]>([]);
  const [searchText, setSearchText] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const debounceSearch = useRef(
    debounce((value: string) => {
      setSearchText(value);
      setPage(1);
    }, 500),
  ).current;

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    debounceSearch(e.target.value);
  };

  const dummyData = [
    {
      id: 1,
      orderId: "ORD-2001",
      customer: "Kamal Ahmed",
      status: "PENDING",
      assignedTo: "Mehedi Hassan",
      lastUpdate: "10:30 AM",
    },
    {
      id: 2,
      orderId: "ORD-2002",
      customer: "Sultana Begum",
      status: "PROCESSING",
      assignedTo: "Nusrat Jahan",
      lastUpdate: "11:00 AM",
    },
    {
      id: 3,
      orderId: "ORD-2003",
      customer: "Rahat Kabir",
      status: "SHIPPED",
      assignedTo: "Asif 1",
      lastUpdate: "11:45 AM",
    },
    {
      id: 4,
      orderId: "ORD-2004",
      customer: "Mitu Akter",
      status: "DELIVERED",
      assignedTo: "Mesbah Uddin",
      lastUpdate: "12:30 PM",
    },
    {
      id: 5,
      orderId: "ORD-2005",
      customer: "Zayed Khan",
      status: "CANCELLED",
      assignedTo: "Fahim Ahmed",
      lastUpdate: "01:15 PM",
    },
    {
      id: 6,
      orderId: "ORD-2006",
      customer: "Lipi Mondol",
      status: "ON_HOLD",
      assignedTo: "Tanjil Hossain",
      lastUpdate: "02:00 PM",
    },
    {
      id: 7,
      orderId: "ORD-2007",
      customer: "Hasan Ali",
      status: "RETURNED",
      assignedTo: "Mehedi Hassan",
      lastUpdate: "02:30 PM",
    },
    {
      id: 8,
      orderId: "ORD-2008",
      customer: "Farhana Yeasmin",
      status: "REFUNDED",
      assignedTo: "System Admin",
      lastUpdate: "03:00 PM",
    },
    {
      id: 9,
      orderId: "ORD-2009",
      customer: "Jashim Uddin",
      status: "COMPLETED",
      assignedTo: "Nusrat Jahan",
      lastUpdate: "03:45 PM",
    },
    {
      id: 10,
      orderId: "ORD-2010",
      customer: "Sabbir Hossain",
      status: "PENDING",
      assignedTo: "Asif 1",
      lastUpdate: "04:15 PM",
    },
  ];

  const filteredData = dummyData.filter(
    (item) =>
      item.orderId.toLowerCase().includes(searchText.toLowerCase()) ||
      item.customer.toLowerCase().includes(searchText.toLowerCase()) ||
      item.assignedTo.toLowerCase().includes(searchText.toLowerCase()),
  );

  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const data = filteredData.slice(startIndex, endIndex);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "orange";
      case "PROCESSING":
        return "blue";
      case "SHIPPED":
        return "cyan";
      case "DELIVERED":
        return "green";
      case "CANCELLED":
        return "red";
      case "ON_HOLD":
        return "purple";
      case "RETURNED":
        return "volcano";
      case "REFUNDED":
        return "magenta";
      case "COMPLETED":
        return "gold";
      default:
        return "default";
    }
  };

  const allColumns = [
    {
      title: "Order ID",
      dataIndex: "orderId",
      key: "orderId",
      render: (text: string) => <span className="font-semibold">{text}</span>,
    },
    {
      title: "Customer",
      dataIndex: "customer",
      key: "customer",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>{status.replace("_", " ")}</Tag>
      ),
    },
    {
      title: "Assigned To",
      dataIndex: "assignedTo",
      key: "assignedTo",
    },
    {
      title: "Last Update",
      dataIndex: "lastUpdate",
      key: "lastUpdate",
    },
  ];

  const columns = allColumns.filter((col) =>
    selectedColumnKeys.includes(col.key),
  );

  return (
    <div className="">
      <div className="">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">
            Order Status Reports
          </h2>
          <div className="flex items-center gap-4">
            <FilterColumn
              tableName="order_status_reports"
              columns={allColumns.map((col) => ({
                key: col.key,
                title: col.title,
              }))}
              onChangeSelectedKeys={setSelectedColumnKeys}
            />
          </div>
        </div>

        <div className="flex flex-wrap justify-between items-center gap-4 mt-4">
          <Input
            prefix={<Search className="w-4 h-4 text-gray-400" />}
            placeholder="Search orders, customers or employees..."
            onChange={handleSearch}
            className="max-w-md rounded-md"
            allowClear
          />
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden mt-5">
        <DataTable
          loading={false}
          columns={columns}
          data={data}
          isPaginate={true}
          total={filteredData.length}
          limit={limit}
          currentPage={page}
          setCurrentPage={setPage}
          setLimit={setLimit}
          showSizeChanger={true}
        />
      </div>
    </div>
  );
};

export default OrderStatusReportTab;
