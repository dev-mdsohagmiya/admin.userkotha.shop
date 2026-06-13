import { Button, Form, Input, Modal } from "antd";
import React from "react";
import { toast } from "react-toastify";
import { useCreateProductTypeMutation } from "../../../../redux/features/ptoductType/proudctTypeApi";
import { IProductType } from "../../../../types/productType";
import SwitchStatus2 from "../../Forms/SwitchStatus2";

interface CreateProductTypeModalProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const CreateProductTypeModal: React.FC<CreateProductTypeModalProps> = ({
  open,
  setOpen,
}) => {
  const [form] = Form.useForm<IProductType>();
  const [createProductType, { isLoading }] = useCreateProductTypeMutation();

  const onFinish = async (values: IProductType) => {
    try {
      const res = await createProductType(values).unwrap();

      if (res?.success) {
        toast.success("Product Type created successfully!");
        setOpen(false);
        form.resetFields();
      }
    } catch (err: any) {
      toast.error(
        err.data?.message ||
          err.message ||
          "Something went wrong. Please try again.",
      );
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
        <h1 className="mb-1 font-semibold text-gray-800 dark:text-white/90 text-2xl">
          Create Product Type
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Fill out the details to create a new product type.
        </p>
      </div>

      <Form
        form={form}
        name="create-product-type"
        onFinish={onFinish}
        layout="vertical"
        size="middle"
        className="space-y-2 w-full"
        initialValues={{
          isActive: true,
        }}
      >
        <Form.Item
          label="Name"
          name="name"
          tooltip="Enter the product type name. This must be unique."
          rules={[
            { required: true, message: "Please enter the product type name!" },
          ]}
        >
          <Input placeholder="e.g., Regular, Seasonal, Popular" />
        </Form.Item>

        <Form.Item label="Description (Optional)" name="description">
          <Input.TextArea
            placeholder="Enter product type description"
            rows={6}
          />
        </Form.Item>

        <Form.Item
          label="Status"
          name="isActive"
          rules={[{ required: true, message: "Please select status!" }]}
          valuePropName="checked"
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

export default CreateProductTypeModal;
