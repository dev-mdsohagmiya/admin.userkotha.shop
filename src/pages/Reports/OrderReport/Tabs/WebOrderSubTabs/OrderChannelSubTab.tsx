import { Table } from "antd";
import { DataTable } from "../../../../../components/common/Tables";
import { useGetWebOrderChannelQuery } from "../../../../../redux/features/report/reportApi";

interface OrderChannelSubTabProps {
  dateRange: [string | null, string | null];
}

const OrderChannelSubTab = ({ dateRange }: OrderChannelSubTabProps) => {
  const { data: orderChanelData, isLoading } = useGetWebOrderChannelQuery([
    { name: "startDate", value: dateRange[0] },
    { name: "endDate", value: dateRange[1] },
  ]);

  const orderChanel = orderChanelData?.data?.channels || [];
  const totalOrderChanel = orderChanelData?.data?.total || 0;

  const columns = [
    {
      title: "Source",
      dataIndex: "source",
      key: "source",
      width: 250,
      render: (source: string, record: any) => (
        <div className="flex items-center gap-3">
          <div>
            <p className="text-xs font-bold text-gray-800 dark:text-white leading-none">
              {source}
            </p>
            <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-tighter">
              {record.sub || source}
            </p>
          </div>
        </div>
      ),
    },
    {
      title: "Share",
      dataIndex: "share",
      key: "share",
      render: (share: number, record: any) => (
        <div className="flex items-center gap-3 max-w-[300px]">
          <div className="flex-1 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
            <div
              className={`h-full ${record.color || "bg-primary"} rounded-full transition-all duration-1000`}
              style={{ width: `${share}%` }}
            ></div>
          </div>
          <span className="text-[10px] font-bold text-gray-400 min-w-[35px]">
            {share}%
          </span>
        </div>
      ),
    },
    {
      title: "Orders",
      dataIndex: "orders",
      key: "orders",
      align: "right" as const,
      width: 120,
      className: "pr-0",
      render: (orders: number) => (
        <span className="text-sm font-bold text-gray-800 dark:text-white tabular-nums">
          {orders}
        </span>
      ),
    },
  ];

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 shadow-none overflow-hidden font-outfit">
      <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-gray-800 dark:text-white">
            Order Channel
          </h3>
          <p className="text-[10px] text-gray-400">
            Distribution of orders across different sales channels
          </p>
        </div>
      </div>

      <div className="p-0 border-none">
        <DataTable
          columns={columns}
          data={orderChanel}
          loading={isLoading}
          isPaginate={false}
          total={orderChanel.length}
          className="border-none shadow-none"
          summary={() => (
            <Table.Summary.Row className="bg-gray-50/30 dark:bg-gray-800/40 font-bold">
              <Table.Summary.Cell index={0}>
                <div className="flex items-center gap-3 py-1">
                  <div>
                    <p className="text-xs">Total</p>
                    <p className="text-[10px] text-gray-400 uppercase">
                      All Channels
                    </p>
                  </div>
                </div>
              </Table.Summary.Cell>

              <Table.Summary.Cell index={1}>
                {/* Empty cell to align total with Orders column */}
              </Table.Summary.Cell>
              <Table.Summary.Cell index={2} align="right" className="pr-0">
                <span className="text-sm font-black text-gray-900 dark:text-white">
                  {totalOrderChanel}
                </span>
              </Table.Summary.Cell>
            </Table.Summary.Row>
          )}
        />
      </div>
    </div>
  );
};

export default OrderChannelSubTab;
