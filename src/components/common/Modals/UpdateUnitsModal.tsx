import { Button, Form, Input, Modal } from "antd";
import React, { useEffect } from "react";
import { toast } from "react-toastify";
import { useUpdateUnitMutation } from "../../../redux/features/units/unitsApi";
import { IUnit, IUpdateUnit } from "../../../types/units";
import SwitchStatus2 from "../Forms/SwitchStatus2";
import PageMeta from "../Meta/PageMeta";

interface UpdateUnitsModalProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  data: IUnit; // 👈 to pass data for editing
}

const UpdateUnitsModal: React.FC<UpdateUnitsModalProps> = ({
  open,
  setOpen,
  data,
}) => {
  const [form] = Form.useForm<IUnit>();

  // 👇 Pre-fill form fields when editing
  useEffect(() => {
    if (open && data) {
      form.setFieldsValue(data);
    }
  }, [open, data, form]);
  const [updateUnits, { isLoading }] = useUpdateUnitMutation();
  const onFinish = async (values: IUpdateUnit) => {
    try {
      const updateData = {
        id: data.id,
        data: values,
      };

      const res = await updateUnits(updateData).unwrap();

      if (res?.success) {
        toast.success("Unit created successfully!");
        setOpen(false);
        form.resetFields();
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
      width={800}
    >
      <PageMeta
        title="Update Unit"
        description="Update the details of the measurement unit."
      />

      <div className="mb-6">
        <h1 className="mb-1 font-semibold text-gray-800 dark:text-white/90 text-2xl">
          Update Unit
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Modify the details below and save changes.
        </p>
      </div>

      <Form
        form={form}
        name="update-unit"
        onFinish={onFinish}
        layout="vertical"
        size="middle"
        className="space-y-2 w-full"
      >
        <div className="md:flex gap-6 -mb-2">
          <Form.Item
            label="Name"
            name="name"
            className="w-full"
            tooltip="Unit name (e.g., Kg, Litre)"
            rules={[{ required: true, message: "Please enter the unit name!" }]}
          >
            <Input placeholder="e.g., Kilogram" />
          </Form.Item>

          <Form.Item
            label="Symbol"
            name="symbol"
            className="w-full"
            tooltip="Unit symbol (e.g., kg, l)"
            rules={[
              { required: true, message: "Please enter the unit symbol!" },
            ]}
          >
            <Input placeholder="e.g., kg" />
          </Form.Item>
        </div>

        <Form.Item label="Description (optional)" name="description">
          <Input.TextArea placeholder="Enter unit description" rows={6} />
        </Form.Item>

        <Form.Item
          label="Status"
          name="isActive"
          rules={[{ required: true, message: "Please select status!" }]}
          initialValue={true}
        >
          <SwitchStatus2 defaultChecked={data?.isActive} size="default" />
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
            loading={isLoading}
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

export default UpdateUnitsModal;
