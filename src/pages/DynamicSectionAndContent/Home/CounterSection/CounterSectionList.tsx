import { Button, Tooltip } from "antd";
import { FilterDropdownProps } from "antd/es/table/interface";
import { RefreshCcw } from "lucide-react";
import { useState } from "react";
import { FiEdit } from "react-icons/fi";
import CustomActionButton from "../../../../components/common/Button/CustomActionButton";
import SwitchStatus2 from "../../../../components/common/Forms/SwitchStatus2";
import PageMeta from "../../../../components/common/Meta/PageMeta";
import UpdateHomeSectionModal from "../../../../components/common/Modals/Dynamic-section-or-page/UpdateHomeSectionModal";
import PageHeader from "../../../../components/common/Navigation/PageHeader";
import { DataTable } from "../../../../components/common/Tables";
import { useModulePermissions } from "../../../../hooks/usePermissions";
import {
  useHomepageSectionListQuery,
  useUpdateHomepageSectionStatusMutation,
} from "../../../../redux/features/home/homeApi";
import { IHomeSection } from "../../../../types/home";

const CounterSectionList = () => {
  const [openUpdateModal, setOpenUpdateModal] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [updateStatus] = useUpdateHomepageSectionStatusMutation();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [selectedSection, setSelectedSection] = useState<IHomeSection | null>(
    null,
  );

  const { data, isLoading, isFetching, refetch } =
    useHomepageSectionListQuery(undefined);

  // Get all homepages for tab counts

  // Filter only counter sections
  const counterSections = (data?.data || []).filter(
    (section: IHomeSection) => section.group === "counter",
  );

  const handleStatusChange = async (id: string) => {
    try {
      setLoadingId(id);
      await updateStatus(id).unwrap();
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingId(null);
    }
  };

  const { hasUpdate } = useModulePermissions("Content Management");

  const columns = [
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      width: "230px",
    },
    {
      title: "Sub Title",
      dataIndex: "subtitle",
      key: "subtitle",
      render: (subtitle: string) => (
        <Tooltip
          title={subtitle}
          overlayInnerStyle={{
            maxHeight: 200,
            maxWidth: 1050,
            overflowY: "auto",
            whiteSpace: "normal",
            wordBreak: "break-word",
          }}
        >
          <span className="line-clamp-2 cursor-pointer">{subtitle || "-"}</span>
        </Tooltip>
      ),
    },
    {
      title: "Status",
      dataIndex: "isActive",
      key: "isActive",
      filterDropdown: ({
        setSelectedKeys,
        selectedKeys,
        confirm,
        clearFilters,
      }: FilterDropdownProps) => (
        <div style={{ padding: 8 }}>
          {[
            { text: "All", value: "all" },
            { text: "Active", value: "true" },
            { text: "In Active", value: "false" },
          ].map((item) => (
            <label
              key={item.value}
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: 8,
                cursor: "pointer",
              }}
            >
              <input
                type="radio"
                name="statusFilter"
                value={item.value}
                checked={selectedKeys[0] === item.value}
                style={{
                  marginRight: 8,
                  accentColor: "green",
                  cursor: "pointer",
                }}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === "all") {
                    clearFilters?.();
                    confirm({ closeDropdown: true });
                  } else {
                    setSelectedKeys([value]);
                    confirm({ closeDropdown: true });
                  }
                }}
              />
              {item.text}
            </label>
          ))}
        </div>
      ),
      onFilter: (value: string, record: { isActive: boolean }) => {
        if (value === "true") return record.isActive === true;
        if (value === "false") return record.isActive === false;
        return true;
      },
      filterMultiple: false,
      render: (isActive: boolean, record: { id: string }) => (
        <SwitchStatus2
          disabled={!hasUpdate}
          checked={isActive}
          onChange={() => handleStatusChange(record.id)}
          loading={record?.id === loadingId}
        />
      ),
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) => {
        const d = new Date(date);
        const day = String(d.getDate()).padStart(2, "0");
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const year = d.getFullYear();
        return <span>{`${day}-${month}-${year}`}</span>;
      },
      sorter: (a: any, b: any) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      defaultSortOrder: "descend",
    },
    ...(hasUpdate
      ? [
          {
            title: "Action",
            key: "action",
            render: (record: IHomeSection) => (
              <div className="flex gap-2">
                <Tooltip title="Edit">
                  <Button
                    icon={<FiEdit />}
                    onClick={() => {
                      setOpenUpdateModal(true);
                      setSelectedSection(record);
                    }}
                  />
                </Tooltip>
              </div>
            ),
          },
        ]
      : []),
  ];

  return (
    <div>
      <PageMeta
        title="Counter Sections | Amzad Food ERP"
        description="Manage counter sections for homepage"
      />
      <div>
        <PageHeader
          title="Counter Sections 🔢"
          subtitle="View and manage counter sections for the homepage"
          breadcrumbs={[
            { title: "Dashboard", path: "/" },
            { title: "Home Sections", path: "/home" },
            { title: "Counter" },
          ]}
          extra={
            <CustomActionButton
              disabled={counterSections.length === 0}
              onClick={() => refetch()}
              text="Refresh"
              icon={<RefreshCcw />}
              type="default"
            />
          }
        />

        {/* Section Navigation Tabs */}

        <DataTable
          loading={isLoading || isFetching}
          data={counterSections}
          columns={columns}
          rowKey="id"
          isPaginate={counterSections.length > 10}
          currentPage={page}
          setCurrentPage={setPage}
          limit={limit}
          setLimit={setLimit}
          showSizeChanger={counterSections.length > 10}
          total={counterSections.length || 0}
        />
      </div>

      {openUpdateModal && selectedSection && (
        <UpdateHomeSectionModal
          open={openUpdateModal}
          setOpen={setOpenUpdateModal}
          data={selectedSection}
        />
      )}
    </div>
  );
};

export default CounterSectionList;
