import { ExclamationCircleOutlined, SearchOutlined } from "@ant-design/icons";
import { Button, Input, Modal, Tag, Tooltip } from "antd";
import { useState } from "react";
import { FiCheckCircle, FiEye, FiTrash2, FiXCircle } from "react-icons/fi";
import { toast } from "react-toastify";
import PageMeta from "../../components/common/Meta/PageMeta";
import CreateRequisitionApprovalModal from "../../components/common/Modals/RequisitionApproval/CreateRequisitionApprovalModel";
import PageHeader from "../../components/common/Navigation/PageHeader";
import { DataTable } from "../../components/common/Tables";
import {
  useApproveRequisitionMutation,
  useDeleteRequisitionMutation,
  useRejectRequisitionMutation,
  useRequisitionListQuery,
} from "../../redux/features/requisitionApproval/requisitionApprovalApi";

const { Search } = Input;

const RequisitionApprovalList = () => {
  // 🔹 States
  const [searchText, setSearchText] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const [openCreateRequisition, setOpenCreateRequisition] = useState(false);
  // const [openUpdateRequisition, setOpenUpdateRequisition] = useState(false);
  // const [openDetailsRequisition, setOpenDetailsRequisition] = useState(false);
  // const [selectedRequisition, setSelectedRequisition] = useState<any>(null);

  const { data: requisitionsData, isLoading } = useRequisitionListQuery([
    { name: "page", value: page },
    { name: "limit", value: limit },
    searchText && { name: "search", value: searchText },
  ]);

  const [approveRequisition] = useApproveRequisitionMutation();
  const [rejectRequisition] = useRejectRequisitionMutation();
  const [deleteRequisition] = useDeleteRequisitionMutation();

  const requisitions = requisitionsData?.data || [];
  const meta = requisitionsData?.meta || {};

  // ✅ Approve
  const handleApprove = (id: string) => {
    Modal.confirm({
      title: "Approve this requisition?",
      icon: <ExclamationCircleOutlined />,
      okText: "Yes, Approve",
      onOk: async () => {
        try {
          const res = await approveRequisition(id).unwrap();
          if (res.success) toast.success("Requisition approved successfully!");
        } catch (err: any) {
          toast.error(err?.data?.message || "Failed to approve requisition.");
         
        }
      },
    });
  };

  // ✅ Reject
  const handleReject = (id: string) => {
    Modal.confirm({
      title: "Reject this requisition?",
      icon: <ExclamationCircleOutlined />,
      okText: "Yes, Reject",
      onOk: async () => {
        try {
          const res = await rejectRequisition(id).unwrap();
          if (res.success) toast.success("Requisition rejected successfully!");
        } catch (err: any) {
          toast.error(err?.data?.message || "Failed to reject requisition.");
        
        }
      },
    });
  };

  // ✅ Delete
  const handleDelete = (id: string) => {
    Modal.confirm({
      title: "Are you sure you want to delete this requisition?",
      icon: <ExclamationCircleOutlined />,
      okText: "Yes, Delete",
      okType: "danger",
      onOk: async () => {
        try {
          const res = await deleteRequisition(id).unwrap();
          if (res.success) toast.success("Requisition deleted successfully!");
        } catch (err: any) {
          toast.error(err?.data?.message || "Failed to delete requisition.");
        
        }
      },
    });
  };

  // ✅ Table Columns
  const columns = [
    {
      title: "ID",
      key: "index",
      render: (_: any, __: any, index: number) => <>#{index + 1}</>,
    },
    {
      title: "Requester",
      dataIndex: ["requestedBy", "name"],
      key: "requestedBy",
      render: (name: string) => <>{name || "N/A"}</>,
    },
    {
      title: "Department",
      dataIndex: ["department", "name"],
      key: "department",
    },
    {
      title: "Total Items",
      dataIndex: "totalItems",
      key: "totalItems",
      render: (val: number) => <>{val || 0}</>,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        const color =
          status === "Approved"
            ? "green"
            : status === "Rejected"
              ? "red"
              : "blue";
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: "Action",
      key: "action",
      fixed: "right",
      render: (_: any, record: any) => (
        <div className="flex gap-2">
          <Tooltip title="View Details">
            <Button
              icon={<FiEye />}
              onClick={() => {
                // setSelectedRequisition(record);
                // setOpenDetailsRequisition(true);
              }}
            />
          </Tooltip>
          <Tooltip title="Approve">
            <Button
              type="primary"
              icon={<FiCheckCircle />}
              onClick={() => handleApprove(record.id)}
            />
          </Tooltip>
          <Tooltip title="Reject">
            <Button
              danger
              icon={<FiXCircle />}
              onClick={() => handleReject(record.id)}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Button
              danger
              icon={<FiTrash2 />}
              onClick={() => handleDelete(record.id)}
            />
          </Tooltip>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageMeta
        title="Requisition Approvals | ERP"
        description="Manage all requisition approvals"
      />

      <PageHeader
        title="Requisition Approvals"
        subtitle="Review, approve, or reject requisitions"
        breadcrumbs={[
          { title: "Dashboard", path: "/" },
          { title: "Requisitions" },
        ]}
        extra={
          <Button type="primary" onClick={() => setOpenCreateRequisition(true)}>
            + Add Requisition
          </Button>
        }
      />

      <div className="w-96 mb-4">
        <Search
          placeholder="Search by requester name or department"
          allowClear
          enterButton={<SearchOutlined />}
          onChange={(e) => setSearchText(e.target.value)}
        />
      </div>

      <DataTable
        loading={isLoading}
        data={requisitions}
        columns={columns}
        rowKey="id"
        isPaginate={true}
        currentPage={page}
        setCurrentPage={setPage}
        limit={limit}
        setLimit={setLimit}
        total={meta?.total || 0}
      />

      {/* 🔹 Modals */}
      {openCreateRequisition && (
        <CreateRequisitionApprovalModal
          open={openCreateRequisition}
          setOpen={setOpenCreateRequisition}
        />
      )}

      {/* {openUpdateRequisition && selectedRequisition && (
        <UpdateRequisitionModal
          open={openUpdateRequisition}
          setOpen={setOpenUpdateRequisition}
          data={selectedRequisition}
        />
      )} */}

      {/* {openDetailsRequisition && selectedRequisition && (
        <DetailsRequisitionModal
          open={openDetailsRequisition}
          setOpen={setOpenDetailsRequisition}
          data={selectedRequisition}
        />
      )} */}
    </div>
  );
};

export default RequisitionApprovalList;
