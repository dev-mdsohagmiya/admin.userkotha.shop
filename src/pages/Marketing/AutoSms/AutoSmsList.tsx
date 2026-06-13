import { ExclamationCircleOutlined } from "@ant-design/icons";
import { Button, Modal, Tag, Tooltip } from "antd";
import { Plus } from "lucide-react";
import { useState } from "react";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import { toast } from "react-toastify";
import SwitchStatus2 from "../../../components/common/Forms/SwitchStatus2";
import PageMeta from "../../../components/common/Meta/PageMeta";
import PageHeader from "../../../components/common/Navigation/PageHeader";
import { DataTable } from "../../../components/common/Tables";
import { useModulePermissions } from "../../../hooks/usePermissions";
import {
  useDeleteSmsRuleMutation,
  useGetSmsRulesQuery,
  useUpdateSmsRuleMutation,
} from "../../../redux/features/autoSms/autoSmsApi";
import { ISmsRule } from "../../../types/autoSms";
import SmsRuleModal from "./SmsRuleModal";

const AutoSmsList = () => {
  const [openModal, setOpenModal] = useState(false);
  const [selectedRule, setSelectedRule] = useState<ISmsRule | null>(null);

  const { data: rulesData, isLoading, isFetching } = useGetSmsRulesQuery();
  const [deleteRule] = useDeleteSmsRuleMutation();
  const [updateRule] = useUpdateSmsRuleMutation();

  const rules = rulesData?.data || [];

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: "Are you sure you want to delete this rule?",
      icon: <ExclamationCircleOutlined />,
      okText: "Yes, Delete",
      okType: "danger",
      onOk: async () => {
        try {
          await deleteRule(id).unwrap();
          toast.success("Rule deleted successfully.");
        } catch (err: any) {
          toast.error(err?.data?.message || "Failed to delete rule.");
        }
      },
    });
  };

  const handleStatusChange = async (id: string, currentStatus: boolean) => {
    try {
      await updateRule({ id, data: { isActive: !currentStatus } }).unwrap();
      toast.success("Status updated successfully.");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update status.");
    }
  };

  const { allActions } = useModulePermissions("Auto SMS");

  const columns = [
    {
      title: "Rule Name",
      dataIndex: "name",
      key: "name",
      render: (name: string) => (
        <span className="font-medium">{name || "N/A"}</span>
      ),
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      render: (type: string) => (
        <Tag color={type === "after_purchase" ? "blue" : "orange"}>
          {type === "after_purchase" ? "After Purchase" : "Before Expiry"}
        </Tag>
      ),
    },
    {
      title: "Apply To",
      dataIndex: "applyTo",
      key: "applyTo",
      render: (applyTo: string) => (
        <Tag color={applyTo === "all" ? "green" : "purple"}>
          {applyTo === "all" ? "All Products" : "Selected Products"}
        </Tag>
      ),
    },
    {
      title: "Status",
      dataIndex: "isActive",
      key: "isActive",
      render: (isActive: boolean, record: ISmsRule) => (
        <SwitchStatus2
          checked={isActive}
          onChange={() => handleStatusChange(record.id, isActive)}
        />
      ),
    },
    {
      title: "Action",
      key: "action",
      width: 120,
      render: (_: any, record: ISmsRule) => (
        <div className="flex gap-2">
          {allActions.includes("update") && (
            <Tooltip title="Edit">
              <Button
                icon={<FiEdit />}
                onClick={() => {
                  setSelectedRule(record);
                  setOpenModal(true);
                }}
              />
            </Tooltip>
          )}

          {allActions.includes("delete") && (
            <Tooltip title="Delete">
              <Button
                danger
                icon={<FiTrash2 />}
                onClick={() => handleDelete(record.id)}
              />
            </Tooltip>
          )}
        </div>
      ),
    },
  ];

  return (
    <>
      <PageMeta
        title="Auto SMS Rules | UserKotha.Shop"
        description="Manage automatic SMS rules for UserKotha.Shop"
      />
      <PageHeader
        title="Auto SMS Rules"
        breadcrumbs={[
          { title: "Dashboard", path: "/" },
          { title: "Marketing" },
          { title: "Auto SMS Rules" },
        ]}
        subtitle="Manage automatic SMS rules for UserKotha.Shop"
        extra={
          allActions.includes("create") && (
            <Button
              type="primary"
              icon={<Plus size={16} />}
              onClick={() => {
                setSelectedRule(null);
                setOpenModal(true);
              }}
              className="flex items-center gap-2"
            >
              Create Rule
            </Button>
          )
        }
      />

      <div className="mt-6">
        <DataTable
          columns={columns}
          data={rules}
          loading={isLoading || isFetching}
        />
      </div>

      <SmsRuleModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        selectedRule={selectedRule}
      />
    </>
  );
};

export default AutoSmsList;
