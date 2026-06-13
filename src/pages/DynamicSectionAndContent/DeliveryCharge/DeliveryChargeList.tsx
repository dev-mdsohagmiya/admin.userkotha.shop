import { ExclamationCircleOutlined } from "@ant-design/icons";
import { Alert, Button, Modal, Tag, Tooltip } from "antd";
import { Plus, RefreshCcw } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import { toast } from "react-toastify";
import CustomActionButton from "../../../components/common/Button/CustomActionButton";
import PageMeta from "../../../components/common/Meta/PageMeta";
import CreateDeliveryChargeModal from "../../../components/common/Modals/CreateDeliveryChargeModal";
import PageHeader from "../../../components/common/Navigation/PageHeader";
import { DataTable } from "../../../components/common/Tables";
import { useModulePermissions } from "../../../hooks/usePermissions";
import {
  useDeleteDeliveryChargeMutation,
  useGetDeliveryChargeListQuery,
} from "../../../redux/features/deliveryCharge/deliveryChargeApi";
import { IDeliveryOption } from "../../../types/deliveryCharge";
import { DisplayCurrency } from "../../../utils/currency";

const DeliveryChargeList = () => {
  const [open, setOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<IDeliveryOption | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const { hasView, hasCreate, hasUpdate, hasDelete } =
    useModulePermissions("Delivery Charge");

  const { data, isLoading, isFetching, refetch } = useGetDeliveryChargeListQuery(
    { page, limit },
    { skip: !hasView },
  );

  const [deleteDeliveryCharge] = useDeleteDeliveryChargeMutation();

  const deliveryCharges = data?.data || [];
  const meta = data?.meta || { total: 0 };

  const handleDelete = useCallback(
    (record: IDeliveryOption) => {
      Modal.confirm({
        title: `Delete "${record.name}"?`,
        icon: <ExclamationCircleOutlined />,
        okText: "Yes, delete",
        okType: "danger",
        onOk: async () => {
          try {
            await deleteDeliveryCharge(record.id).unwrap();
            toast.success("Delivery charge deleted successfully");
          } catch (err: unknown) {
            const message =
              err &&
              typeof err === "object" &&
              "data" in err &&
              err.data &&
              typeof err.data === "object" &&
              "message" in err.data
                ? String((err.data as { message?: string }).message)
                : "Failed to delete";
            toast.error(message);
          }
        },
      });
    },
    [deleteDeliveryCharge],
  );

  const columns = useMemo(() => {
    const base = [
      {
        title: "Name",
        dataIndex: "name",
        key: "name",
      },
      {
        title: "Fee",
        dataIndex: "fee",
        key: "fee",
        render: (fee: number) => <DisplayCurrency amount={fee} />,
      },
      {
        title: "Description",
        dataIndex: "description",
        key: "description",
      },
      {
        title: "Status",
        dataIndex: "isActive",
        key: "isActive",
        render: (isActive: boolean) => (
          <Tag color={isActive ? "green" : "red"}>
            {isActive ? "Active" : "Inactive"}
          </Tag>
        ),
      },
    ];

    if (!hasUpdate && !hasDelete) {
      return base;
    }

    return [
      ...base,
      {
        title: "Action",
        key: "action",
        render: (_: unknown, record: IDeliveryOption) => (
          <div className="flex gap-2">
            {hasUpdate ? (
              <Tooltip title="Edit">
                <Button
                  icon={<FiEdit />}
                  onClick={() => {
                    setItemToEdit(record);
                    setOpen(true);
                  }}
                />
              </Tooltip>
            ) : null}
            {hasDelete ? (
              <Tooltip title="Delete">
                <Button
                  danger
                  icon={<FiTrash2 />}
                  onClick={() => handleDelete(record)}
                />
              </Tooltip>
            ) : null}
          </div>
        ),
      },
    ];
  }, [hasUpdate, hasDelete, handleDelete]);

  const showList = hasView;

  return (
    <div>
      <PageMeta
        title="Delivery Charges | UserKotha.Shop ERP"
        description="Manage Delivery Charges"
      />

      <PageHeader
        title="Delivery Charges"
        subtitle="Manage delivery charges and fees"
        breadcrumbs={[
          { title: "Dashboard", path: "/" },
          { title: "Delivery Charges" },
        ]}
        extra={
          <>
            {showList ? (
              <CustomActionButton
                disabled={meta?.total === 0}
                onClick={() => refetch()}
                text="Refresh"
                icon={<RefreshCcw />}
                type="default"
              />
            ) : null}
            {hasCreate ? (
              <CustomActionButton
                onClick={() => {
                  setItemToEdit(null);
                  setOpen(true);
                }}
                text="Add New"
                icon={<Plus />}
                type="primary"
              />
            ) : null}
          </>
        }
      />

      {!showList ? (
        <Alert
          className="mb-4"
          type="warning"
          showIcon
          message="No access"
          description="You do not have permission to view delivery charges."
        />
      ) : (
        <DataTable
          loading={isLoading || isFetching}
          data={deliveryCharges}
          columns={columns}
          rowKey="id"
          currentPage={page}
          isPaginate={meta?.total > 10}
          setCurrentPage={setPage}
          limit={limit}
          setLimit={setLimit}
          showSizeChanger={meta?.total > 10}
          total={meta?.total || 0}
        />
      )}

      {(hasCreate || hasUpdate) && (
        <CreateDeliveryChargeModal
          open={open}
          setOpen={setOpen}
          itemToEdit={itemToEdit}
          setItemToEdit={setItemToEdit}
        />
      )}
    </div>
  );
};

export default DeliveryChargeList;
