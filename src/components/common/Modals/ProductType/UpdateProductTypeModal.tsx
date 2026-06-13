import { Button, Form, Input, Modal } from "antd";
import React, { useEffect } from "react";
import { toast } from "react-toastify";
import { useUpdateProductTypeMutation } from "../../../../redux/features/ptoductType/proudctTypeApi";
import { IProductType } from "../../../../types/productType";
import SwitchStatus2 from "../../Forms/SwitchStatus2";

interface UpdateProductTypeModalProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  data: IProductType;
}

const UpdateProductTypeModal: React.FC<UpdateProductTypeModalProps> = ({
  open,
  setOpen,
  data,
}) => {
  const [form] = Form.useForm<IProductType>();
  const [updateProductType, { isLoading }] = useUpdateProductTypeMutation();

  // Populate form when modal opens
  useEffect(() => {
    if (data) {
      form.setFieldsValue(data);
    }
  }, [data, form]);

  const onFinish = async (values: IProductType) => {
    try {
      const res = await updateProductType({
        id: data.id,
        data: values,
      }).unwrap();

      if (res?.success) {
        toast.success("Product Type updated successfully!");
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
          Update Product Type
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Modify the details of the selected product type.
        </p>
      </div>

      <Form
        form={form}
        name="update-product-type"
        onFinish={onFinish}
        layout="vertical"
        size="middle"
        className="space-y-2 w-full"
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

export default UpdateProductTypeModal;
