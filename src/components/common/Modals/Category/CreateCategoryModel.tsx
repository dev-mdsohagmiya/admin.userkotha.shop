import { Button, Form, Input, Modal, Select } from "antd";
import React from "react";
import { toast } from "react-toastify";
import { useCreateCategoryMutation } from "../../../../redux/features/categories/categoriesApi";
import { ICategory } from "../../../../types/category";
import SwitchStatus2 from "../../Forms/SwitchStatus2";

interface CreateCategoryModalProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const CreateCategoryModal: React.FC<CreateCategoryModalProps> = ({
  open,
  setOpen,
}) => {
  const [form] = Form.useForm<ICategory>();
  const [createCategory, { isLoading }] = useCreateCategoryMutation();

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
          Create Category
        </h1>
        <p className="text-sm text-gray-500">
          Fill out the details to create a new category.
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
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
        <Form.Item name="type" label="Type" rules={[{ required: true, message: "Please select the category type!" }]}>
          <Select options={[
            { label: "Raw", value: "RAW" },
            { label: "Packaging", value: "PACKAGING" },
          ]} placeholder="Select the category type" />
        </Form.Item>
      </div>

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

export default CreateCategoryModal;
