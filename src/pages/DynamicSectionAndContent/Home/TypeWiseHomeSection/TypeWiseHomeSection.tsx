import { useState } from "react";
import { DataTable } from "../../../../components/common/Tables";
import { useModulePermissions } from "../../../../hooks/usePermissions";
import SwitchStatus2 from "../../../../components/common/Forms/SwitchStatus2";
import { FilterDropdownProps } from "antd/es/table/interface";
import UpdateHomeSectionModal from "../../../../components/common/Modals/Dynamic-section-or-page/UpdateHomeSectionModal";
import { IHomeSection } from "../../../../types/home";
import { Button, Image, Tooltip } from "antd";
import { FiEdit } from "react-icons/fi";
import { config } from "../../../../config";
import { MediaImage } from "../../../../types/media";
import { ImageOff } from "lucide-react";
import {
  useHomepageSectionListQuery,
  useUpdateHomepageSectionStatusMutation,
} from "../../../../redux/features/home/homeApi";

const TypeWiseHomeSection = () => {
  const [openUpdateCategoryModal, setOpenUpdateCategoryModal] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [updateStatus] = useUpdateHomepageSectionStatusMutation();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const { data, isLoading, isFetching } =
    useHomepageSectionListQuery(undefined);

  const homepages = data?.data || [];
  const meta = data?.meta;
  const [selectedCategory, setSelectedCategory] = useState<IHomeSection | null>(
    null
  );

  console.log("homepages", data?.data);

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

  const { hasUpdate, hasDelete } =
    useModulePermissions("Content Management");

  const columns = [
    {
      title: "Image",
      dataIndex: "banner",
      key: "banner",
      render: (banner: MediaImage) =>
        banner?.url ? (
          <Image
            src={`${config.image_access_url}${banner.url}`}
            alt="Brand Logo"
            width={48}
            height={48}
            style={{
              objectFit: "contain",
              borderRadius: "4px",
              cursor: "pointer",
            }}
            preview={{
              mask: "Preview",
              maskClassName: "bg-black bg-opacity-50 text-white text-xs",
            }}
            fallback="/default-logo.png"
          />
        ) : (
          <div
            style={{
              width: 35,
              height: 35,
              borderRadius: "8px",
              background: "linear-gradient(135deg, #fafafa, #e9e9e9)",
              border: "1px dashed green",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              color: "green",
              fontSize: "5px",
              fontWeight: 500,
            }}
          >
            <ImageOff className="!h-[20px] !w-[20px]" />
          </div>
        ),
    },
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
                    // ✅ Clear filters and instantly show all records
                    clearFilters?.();
                    confirm({ closeDropdown: true });
                  } else {
                    // ✅ Apply filter immediately
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
        return true; // ✅ “All” or undefined returns all records
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
      title: "Product Type",
      dataIndex: "productType",
      key: "productType",
      render: (productType: any) => (
        <div className="w-[100px]">
          <div className="font-medium text-gray-900">{productType?.name}</div>
          <div className="text-xs text-gray-500">{productType?.slug}</div>
        </div>
      ),
    },
    {
      title: "Created At",
      dataIndex: "createdAt", // API থেকে আসা date field
      key: "createdAt",
      render: (date: string) => {
        const d = new Date(date);
        // DD-MM-YYYY format
        const day = String(d.getDate()).padStart(2, "0");
        const month = String(d.getMonth() + 1).padStart(2, "0"); // Month index 0-11
        const year = d.getFullYear();
        return <span>{`${day}-${month}-${year}`}</span>;
      },
      sorter: (a: any, b: any) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      defaultSortOrder: "descend",
    },
    ...(hasUpdate || hasDelete
      ? [
          {
            title: "Action",
            key: "action",
            render: (record: IHomeSection) => (
              <div className="flex gap-2">
                {hasUpdate && (
                  <Tooltip title="Edit">
                    <Button
                      icon={<FiEdit />}
                      onClick={() => {
                        setOpenUpdateCategoryModal(true);
                        setSelectedCategory(record);
                      }}
                    />
                  </Tooltip>
                )}
                {/* {hasDelete && (
                  <Tooltip title="Delete">
                    <Button
                      type="text"
                      danger
                      icon={<FiTrash2 />}
                      onClick={() => handleDelete(record.id)}
                      style={{
                        color: "#dc2626",
                        border: "1px solid #dc2626",
                        padding: "4px",
                      }}
                    />
                  </Tooltip>
                )} */}
              </div>
            ),
          },
        ]
      : []),
  ];

  return (
    <div>
      <div>
        {/* Section Navigation Tabs */}

        <DataTable
          loading={isLoading || isFetching}
          data={homepages}
          columns={columns}
          rowKey="id"
          isPaginate={meta?.total > 10 && true}
          currentPage={page}
          setCurrentPage={setPage}
          limit={limit}
          setLimit={setLimit}
          showSizeChanger={meta?.total > 10 && true}
          total={meta?.total || 0}
          // selectRow={true}
          // clearSelectionTrigger={selectedProductIds.length === 0 && true}
        />
      </div>

      {openUpdateCategoryModal && selectedCategory && (
        <UpdateHomeSectionModal
          open={openUpdateCategoryModal}
          setOpen={setOpenUpdateCategoryModal}
          data={selectedCategory}
        />
      )}
    </div>
  );
};

export default TypeWiseHomeSection;
