import { Button, Form, Input, Modal } from "antd";
import React from "react";
import { toast } from "react-toastify";
import { useCreateProductCategoryMutation } from "../../../../redux/features/productCategories/productCategoriesApi";
import { ICategory } from "../../../../types/category";
import ImageUploader from "../../../shared/ImageUploader";
import SwitchStatus2 from "../../Forms/SwitchStatus2";

interface CreateCategoryModalProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const CreateProductCategoryModel: React.FC<CreateCategoryModalProps> = ({
  open,
  setOpen,
}) => {
  const [form] = Form.useForm<ICategory>();
  const [createCategory, { isLoading }] = useCreateProductCategoryMutation();

  const onFinish = async (values: ICategory) => {
    try {
      const res = await createCategory(values).unwrap();

      if (res?.success) {
        toast.success("Category created successfully!");
        setOpen(false);
        form.resetFields();
        // 👉 RTK Query invalidatesTags এর কারণে table/list auto reload হবে
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
        <h1 className="mb-1 font-semibold text-gray-800 text-2xl">
          Create Product Category
        </h1>
        <p className="text-sm text-gray-500">
          Fill out the details to create a new product category.
        </p>
      </div>

      <Form
        form={form}
        name="create-category"
        onFinish={onFinish}
        layout="vertical"
        size="middle"
        className="space-y-2 w-full"
      >
        <Form.Item
          name={"logoId"}
          label="Logo"
          rules={[
            { required: true, message: "Please enter the category image!" },
          ]}
        >
          <ImageUploader fieldPath="logoId" form={form} />
        </Form.Item>
        <Form.Item
          label="Name"
          name="name"
          tooltip="Enter the category name. Examples: Dessert Items, Daily Spices, Seeds, Jaggery, Honey, Dates, Dry Foods, Mango"
          rules={[
            { required: true, message: "Please enter the category name!" },
          ]}
        >
          <Input placeholder="e.g., Dessert Items, Honey, Dates, Dry Foods, Mango" />
        </Form.Item>

        <Form.Item label="Description (Optional)" name="description">
          <Input.TextArea placeholder="Enter category description" rows={6} />
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

export default CreateProductCategoryModel;
