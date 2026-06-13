import { Modal, Form, Input, Button } from "antd";
import { toast } from "react-toastify";
import { useCreateBrandMutation } from "../../../redux/features/brand/brandApi";
import { MediaImage } from "../../../types/media";
import ImageUploader from "../../shared/ImageUploader";
import SwitchStatus2 from "../Forms/SwitchStatus2";

interface IBrand {
  name: string;
  logoId?: string;
  description?: string;
  is_active: boolean;
  logo?: MediaImage;
}

interface CreateBrandModalProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const CreateBrandModal: React.FC<CreateBrandModalProps> = ({
  open,
  setOpen,
}) => {
  const [form] = Form.useForm<IBrand>();

  const [createBrand, { isLoading }] = useCreateBrandMutation();

  const onFinish = async (values: IBrand) => {
    try {
      const res = await createBrand(values).unwrap();

      if (res?.success) {
        toast.success(res.message || "Brand created successfully!");
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
        <h1 className="mb-1 font-semibold text-gray-800 dark:text-white/90 text-2xl">
          Create Brand
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Fill out the details to create a new brand.
        </p>
      </div>

      <Form
        form={form}
        name="create-brand"
        onFinish={onFinish}
        layout="vertical"
        size="middle"
        className="space-y-2 w-full"
      >
        <Form.Item
          label="Brand Name"
          tooltip="Type the brand name"
          name="name"
          rules={[{ required: true, message: "Please enter the brand name!" }]}
        >
          <Input placeholder="e.g., Brand A" />
        </Form.Item>

        <Form.Item name={"logoId"} label="Logo (Optional)">
          <ImageUploader fieldPath="logoId" form={form} />
        </Form.Item>

        <Form.Item label="Description (Optional)" name="description">
          <Input.TextArea placeholder="Enter brand description" rows={6} />
        </Form.Item>

        <Form.Item
          label="Status"
          name="isActive"
          rules={[{ required: true, message: "Please select status!" }]}
          initialValue={true}
        >
          <SwitchStatus2 defaultChecked />
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

export default CreateBrandModal;
