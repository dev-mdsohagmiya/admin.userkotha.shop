import React from "react";
import { DataTable } from "../../../components/common/Tables";
import { useGetSalesTopCustomersQuery } from "../../../redux/features/sales/salesApi";
import { DisplayCurrency } from "../../../utils/currency";

const TopCustomer = () => {
  const {
    data: topCustomerData,
    isLoading: topCustomerLoading,
    isFetching: topCustomerFetching,
  } = useGetSalesTopCustomersQuery(undefined);

  const topCustomer = topCustomerData?.data || [];

  const TopCustomerColumn = [
    {
      title: "Customer Name",
      dataIndex: "customerName",
      key: "customerName",
    },
    {
      title: "Customer Phone",
      dataIndex: "customerPhone",
      key: "customerPhone",
    },
    {
      title: "Total Amount",
      dataIndex: "totalAmount",
      key: "totalAmount",
      render: (totalAmount: number) => <DisplayCurrency amount={totalAmount} />,
    },
    {
      title: "Total Paid",
      dataIndex: "totalPaid",
      key: "totalPaid",
      render: (totalPaid: number) => <DisplayCurrency amount={totalPaid} />,
    },
    {
      title: "Total Due",
      dataIndex: "totalDue",
      key: "totalDue",
      render: (totalDue: number) => (
        <span className="font-semibold text-red-700">
          <DisplayCurrency amount={totalDue} />
        </span>
      ),
    },
  ];
  return (
    <div>
      <div className=" mt-7 mb-4">
        <div className="flex justify-between items-center mb-5">
          <h3 className="font-semibold text-[16px] text-gray-800">
            Top Customer
          </h3>
        </div>

        <div className="overflow-x-auto max-h-[1000px] overflow-y-auto">
          <DataTable
            columns={TopCustomerColumn}
            loading={topCustomerLoading || topCustomerFetching}
            data={topCustomer || []}
            scroll={{ x: true }}
            className="rounded-lg shadow-sm"
          />
        </div>
      </div>
    </div>
  );
};

export default TopCustomer;
