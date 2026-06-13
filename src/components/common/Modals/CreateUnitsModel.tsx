import { Button, Form, Input, Modal } from "antd";
import React from "react";
import { toast } from "react-toastify";
import { useCreateUnitMutation } from "../../../redux/features/units/unitsApi";
import { IUnit } from "../../../types/units";

import SwitchStatus2 from "../Forms/SwitchStatus2";

interface CreateUnitsModalProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const CreateUnitsModal: React.FC<CreateUnitsModalProps> = ({
  open,
  setOpen,
}) => {
  const [form] = Form.useForm<IUnit>();
  const [createUnits, { isLoading }] = useCreateUnitMutation();
  const onFinish = async (values: IUnit) => {
    try {
      const res = await createUnits(values).unwrap();

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
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-1 text-gray-800 dark:text-white/90">
          Create Unit
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Fill out the details to create a new measurement unit.
        </p>
      </div>

      <Form
        form={form}
        name="create-unit"
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

        <Form.Item label="Description (Optional)" name="description">
          <Input.TextArea placeholder="Enter unit description" rows={6} />
        </Form.Item>

        <Form.Item
          label="Status"
          name="isActive"
          rules={[{ required: true, message: "Please select status!" }]}
          initialValue={true}
        >
          <SwitchStatus2 defaultChecked size="default" />
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
            Create
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default CreateUnitsModal;
