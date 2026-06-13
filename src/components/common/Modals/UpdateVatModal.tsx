import { Button, Form, Input, InputNumber, Modal } from "antd";
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useUpdateVatMutation } from "../../../redux/features/vat/vatApi";
import { IVat } from "../../../types/vat";
import SwitchStatus2 from "../Forms/SwitchStatus2";
import PageMeta from "../Meta/PageMeta";

interface UpdateVatModalProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  data: IVat;
}

const UpdateVatModal: React.FC<UpdateVatModalProps> = ({
  open,
  setOpen,
  data,
}) => {
  const [form] = Form.useForm<IVat>();

  useEffect(() => {
    if (open && data) {
      form.setFieldsValue(data);
    }
  }, [open, data, form]);

  const navigate = useNavigate();
  const [updateVat, { isLoading }] = useUpdateVatMutation();

  const onFinish = async (values: IVat) => {
    try {
      const updateData = {
        id: data.id,
        data: values,
      };

      const res = await updateVat(updateData).unwrap();

      if (res?.success) {
        toast.success(res?.message || "VAT updated successfully!");
        navigate("/vat-settings");
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
        title="Update VAT"
        description="Update the details of the VAT configuration."
      />

      <div className="mb-6">
        <h1 className="mb-1 font-semibold text-gray-800 dark:text-white/90 text-2xl">
          Update VAT
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Modify the details below and save changes.
        </p>
      </div>

      <Form
        form={form}
        name="update-vat"
        onFinish={onFinish}
        layout="vertical"
        size="middle"
        className="space-y-2 w-full"
      >
        <div className="md:flex gap-6 -mb-2">
          <Form.Item
            label="Tax Name"
            name="taxName"
            className="w-full"
            rules={[{ required: true, message: "Please enter the tax name!" }]}
          >
            <Input placeholder="e.g., VAT" />
          </Form.Item>

          <Form.Item
            label="Rate (%)"
            name="rate"
            className="w-full"
            rules={[
              { required: true, message: "Please enter the tax rate!" },
              {
                type: "number",
                min: 0,
                max: 100,
                message: "Rate must be between 0 and 100!",
              },
            ]}
          >
            <InputNumber
              type="number"
              placeholder="e.g., 15"
              min={0}
              max={100}
              step={0.01}
              className="w-full"
              style={{ width: "100%" }}
            />
          </Form.Item>
        </div>

        <Form.Item
          label="Tax Number"
          name="taxNumber"
          rules={[{ required: true, message: "Please enter the tax number!" }]}
        >
          <Input placeholder="e.g., VAT123456" />
        </Form.Item>

        <Form.Item label="Description" name="description">
          <Input.TextArea placeholder="Enter VAT description" rows={4} />
        </Form.Item>

        <Form.Item
          label="Status"
          name="isActive"
          rules={[{ required: true, message: "Please select status!" }]}
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

export default UpdateVatModal;
