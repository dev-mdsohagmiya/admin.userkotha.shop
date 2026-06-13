import { Button, Dropdown, Modal } from "antd";
import {
  CheckCircleOutlined,
  DeleteOutlined,
  DownOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import CustomActionButton from "../Button/CustomActionButton";
import { GrTransaction } from "react-icons/gr";
import { toast } from "react-toastify";

interface MultipleDeleteAndStatusChangesProps {
  iDs: string[];
  deleteMutation: (id: string) => Promise<any>;
  statusChangeMutation: (id: string) => Promise<any>;
  text: string;
  setIDs: any;
  isDeleteButton?: boolean;
}

const MultipleDeleteAndStatusChanges: React.FC<
  MultipleDeleteAndStatusChangesProps
> = ({
  iDs,
  deleteMutation,
  statusChangeMutation,
  setIDs,
  text,
  isDeleteButton ,
}) => {
  // selected ids..............or.............deleteMutation
  // iDs

  // change  status modal........................................................
  const handleChangeStatusAndDelete = (value: string) => {
    if (value === "delete") {
      Modal.confirm({
        title: `Delete Selected ${text}`,
        content: `Are you sure you want to delete the selected ${text.toLowerCase()}? This action cannot be undone.`,
        icon: <ExclamationCircleOutlined style={{ color: "red" }} />,
        okText: "Yes, Delete",
        okType: "danger",
        cancelText: "Cancel",
        centered: true,
        onOk: async () => {
          try {
            if (iDs.length === 0) return;

            await Promise.all(
              iDs.map(async (id) => {
                try {
                  const res = await deleteMutation(id); // your API call
                  // Assuming API returns { success: boolean, message: string }
                  if (res?.success) {
                    toast.success(res.message);
                  }
                } catch (err: any) {
                  toast.success(err.message);
                }
              })
            );
          } catch (error) {
            console.error(error);
            toast.error(
              `Unexpected error while deleting ${text.toLowerCase()}.`
            );
          }
        },
      });
    }

    // ✅ Status Change Modal
    else if (value === "status") {
      const count = iDs.length;

      Modal.confirm({
        title: `Change Status of ${count} ${text}`,
        content: `Do you want to update the status of the selected ${text} to Status?`,
        icon: <CheckCircleOutlined style={{ color: "#16a34a" }} />, // Tailwind green-600
        okText: "Yes, Change",
        okType: "primary",
        okButtonProps: {
          style: {
            backgroundColor: "#16a34a", // Tailwind green-600
            borderColor: "#16a34a",
          },
        },
        cancelText: "Cancel",
        centered: true,
        onOk: async () => {
          try {
            await Promise.all(iDs.map((id) => statusChangeMutation(id)));
            setIDs([]);
          } catch (err) {
            console.error(err);
          }
        },
      });
    }
  };

  const actions = (
    <div className="!border p-2 bg-white rounded-sm !border-gray-200">
      <div className="flex flex-col gap-2 w-full">
        <CustomActionButton
          type="primary"
          icon={<CheckCircleOutlined />}
          text="Change Status"
          onClick={() => handleChangeStatusAndDelete("status")}
        />
        {isDeleteButton && (
          <Button
            onClick={() => handleChangeStatusAndDelete("delete")}
            type="dashed"
            danger
            icon={<DeleteOutlined />}
          >
            Delete
          </Button>
        )}

        {/* <CustomActionButton
          type="default"
          icon={<DeleteOutlined />}
          text="Delete"
          // onClick={() => handleChangeStatusAndDelete("delete")}
        /> */}
      </div>
    </div>
  );
  return (
    <div>
      {/* {selectedProductIds.length > 0 && ( */}
      <Dropdown overlay={actions} trigger={["click"]}>
        <CustomActionButton
          disabled={!iDs.length}
          icon={<GrTransaction />}
          type="default"
          text=" Actions"
          icon2={<DownOutlined />}
        ></CustomActionButton>
      </Dropdown>
      {/* )} */}
    </div>
  );
};

export default MultipleDeleteAndStatusChanges;
