import { useEffect } from "react";
import { Modal, Form, Input, Switch, Tooltip } from "antd";
import { toast } from "react-toastify";
import {
  useCreateOrderSourceMutation,
  useUpdateOrderSourceMutation,
} from "../../../../redux/features/orderSource/orderSourceApi";
import { IOrderSource } from "../../../../types/orderSource";

interface IOrderSourceModalProps {
  open: boolean;
  onClose: () => void;
  initialValues?: IOrderSource | null;
}

const OrderSourceModal: React.FC<IOrderSourceModalProps> = ({
  open,
  onClose,
  initialValues,
}) => {
  const [form] = Form.useForm();

  // API Mutations
  const [createSource, { isLoading: isCreating }] =
    useCreateOrderSourceMutation();
  const [updateSource, { isLoading: isUpdating }] =
    useUpdateOrderSourceMutation();

  const isEditing = !!initialValues;
  const isLoading = isCreating || isUpdating;

  useEffect(() => {
    if (open) {
      if (initialValues) {
        form.setFieldsValue(initialValues);
      } else {
        form.resetFields();
      }
    }
  }, [open, initialValues, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (isEditing) {
        const id = initialValues?.id;
        if (!id) {
          toast.error("Invalid order source ID");
          return;
        }
        await updateSource({ id, data: values }).unwrap();
        toast.success("Order source updated successfully");
      } else {
        await createSource(values).unwrap();
        toast.success("Order source created successfully");
      }

      form.resetFields();
      onClose();
    } catch (error: any) {
      if (error?.errorFields) {
        // Form validation error - already shown by antd
        return;
      }
      toast.error(error?.data?.message || "Failed to save order source");
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      title={isEditing ? "Edit Order Source" : "Create New Order Source"}
      open={open}
      onCancel={handleCancel}
      onOk={handleSubmit}
      confirmLoading={isLoading}
      width={600}
      okText={isEditing ? "Update" : "Create"}
      cancelText="Cancel"
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          isActive: true,
        }}
      >
        <Form.Item
          name="name"
          label="Source Name"
          rules={[
            { required: true, message: "Please enter source name" },
            { min: 2, message: "Name must be at least 2 characters" },
          ]}
        >
          <Input placeholder="e.g., Facebook, Instagram" />
        </Form.Item>

        <Form.Item
          name="icon"
          label={
            <span>
              Icon Class (FontAwesome){" "}
              <Tooltip title="Click to browse Font Awesome icons">
                <a
                  href="https://fontawesome.com/icons"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:text-blue-600"
                >
                  <i
                    className="fa-solid fa-external-link"
                    style={{ fontSize: "12px" }}
                  ></i>{" "}
                  Browse Icons
                </a>
              </Tooltip>
            </span>
          }
          rules={[{ required: true, message: "Please enter icon class" }]}
        >
          <Input placeholder="e.g., fa-brands fa-facebook" />
        </Form.Item>

        <Form.Item name="isActive" label="Status" valuePropName="checked">
          <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default OrderSourceModal;
