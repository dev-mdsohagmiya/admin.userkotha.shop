import { Button, Form, InputNumber, Modal, Select } from "antd";
import { toast } from "react-toastify";
import { IProductVariant } from "../../../types/product";
import PageMeta from "../Meta/PageMeta";

const { Option } = Select;

interface CreateProductVariantModalProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onCreate?: (variant: IProductVariant) => void;
}

const CreateProductVariantModal: React.FC<CreateProductVariantModalProps> = ({
  open,
  setOpen,
  onCreate,
}) => {
  const [form] = Form.useForm<IProductVariant>();

  const onFinish = async (values: IProductVariant) => {
    try {
      if (onCreate) onCreate(values);
      toast.success("Product variant created successfully!");
      setOpen(false);
      form.resetFields();
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
        title="Create Product Variant"
        description="Create a new product variant with all details."
      />

      <div className="mb-2">
        <h1 className="mb-1 font-semibold text-gray-800 dark:text-white/90 text-2xl">
          Create Product Variant
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Fill out the details to create a new variant.
        </p>
      </div>

      <Form
        form={form}
        name="create-variant"
        onFinish={onFinish}
        layout="vertical"
        size="middle"
      >
        <Form.Item
          label="Unit"
          name="unitId"
          rules={[{ required: true, message: "Please select a unit!" }]}
        >
          <Select placeholder="Select unit">
            <Option value="kg">Kilogram</Option>
            <Option value="g">Gram</Option>
            <Option value="l">Litre</Option>
            <Option value="piece">Piece</Option>
          </Select>
        </Form.Item>

        <Form.Item
          label="Conversion Factor"
          name="conversionFactor"
          rules={[{ required: true, message: "Enter conversion factor!" }]}
        >
          <InputNumber placeholder="e.g., 1000" style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item
          label="Selling Price"
          name="sellingPrice"
          rules={[{ required: true, message: "Enter selling price!" }]}
        >
          <InputNumber placeholder="e.g., 120" style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item
          label="Minimum Stock"
          name="minStock"
          rules={[{ required: true, message: "Enter minimum stock!" }]}
        >
          <InputNumber placeholder="e.g., 10" style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item
          label="Maximum Stock"
          name="maxStock"
          rules={[{ required: true, message: "Enter maximum stock!" }]}
        >
          <InputNumber placeholder="e.g., 200" style={{ width: "100%" }} />
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
          <Button type="primary" htmlType="submit" className="px-5!">
            Create
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default CreateProductVariantModal;
