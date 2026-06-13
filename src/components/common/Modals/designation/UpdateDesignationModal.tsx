import { Button, Form, Input, Modal } from "antd";
import React, { useEffect } from "react";
import { toast } from "react-toastify";
import { useDesignations } from "../../../../hooks/useDesignations";
import { IDesignation } from "../../../../types/interfaces";
import FormToggle from "../../Forms/SwitchStatus2";
import PageMeta from "../../Meta/PageMeta";

interface UpdateDesignationModalProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  data: IDesignation;
}

const UpdateDesignationModal: React.FC<UpdateDesignationModalProps> = ({
  open,
  setOpen,
  data,
}) => {
  const [form] = Form.useForm<IDesignation>();
  const { updateDesignation, loading } = useDesignations();

  useEffect(() => {
    if (open && data) {
      form.setFieldsValue(data);
    }
  }, [open, data, form]);

  const onFinish = async (values: any) => {
    try {
      const res = await updateDesignation(data.id, values);

      if (res?.success) {
        toast.success("Designation updated successfully!");
        setOpen(false);
        form.resetFields();
      } else {
        toast.error(res?.error || "Failed to update designation.");
      }
    } catch (err: any) {
      toast.error(err.message || "Something went wrong. Please try again.");
    }
  };

  return (
    <Modal
      open={open}
      onCancel={() => setOpen(false)}
      footer={false}
      width={600}
    >
      <PageMeta
        title="Update Designation"
        description="Update designation details"
      />

      <div className="mb-6">
        <h1 className="mb-1 font-semibold text-gray-800 dark:text-white/90 text-2xl">
          Update Designation
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Modify the details below and save changes.
        </p>
      </div>

      <Form
        form={form}
        name="update-designation"
        onFinish={onFinish}
        layout="vertical"
        size="middle"
        className="space-y-2 w-full"
      >
        <Form.Item
          label="Designation Name"
          name="name"
          rules={[
            { required: true, message: "Please enter designation name!" },
          ]}
        >
          <Input placeholder="e.g., Manager, Sales Executive" />
        </Form.Item>

        <Form.Item
          label="Status"
          name="isActive"
          rules={[{ required: true, message: "Please select status!" }]}
        >
          <FormToggle defaultChecked={data?.isActive} size="default" />
        </Form.Item>

        <div className="flex justify-start gap-2 w-full mt-5">
          <Button
            onClick={() => {
              setOpen(false);
              form.resetFields();
            }}
            type="default"
            htmlType="button"
            className="px-5!"
          >
            Cancel
          </Button>

          <Button
            loading={loading}
            type="primary"
            htmlType="submit"
            className="px-5!"
          >
            Update
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default UpdateDesignationModal;
