import { useEffect } from "react";
import { Modal, Form, Input, Switch } from "antd";
import { toast } from "react-toastify";
import {
  useCreateShippingNoteMutation,
  useUpdateShippingNoteMutation,
} from "../../../../redux/features/shippingNote/shippingNoteApi";
import { IShippingNote } from "../../../../types/shippingNote";

const { TextArea } = Input;

interface IShippingNoteModalProps {
  open: boolean;
  onClose: () => void;
  initialValues?: IShippingNote | null;
}

const ShippingNoteModal: React.FC<IShippingNoteModalProps> = ({
  open,
  onClose,
  initialValues,
}) => {
  const [form] = Form.useForm();

  // API Mutations
  const [createNote, { isLoading: isCreating }] =
    useCreateShippingNoteMutation();
  const [updateNote, { isLoading: isUpdating }] =
    useUpdateShippingNoteMutation();

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
          toast.error("Invalid shipping note ID");
          return;
        }
        await updateNote({ id, data: values }).unwrap();
        toast.success("Shipping note updated successfully");
      } else {
        await createNote(values).unwrap();
        toast.success("Shipping note created successfully");
      }

      form.resetFields();
      onClose();
    } catch (error: any) {
      if (error?.errorFields) {
        return;
      }
      toast.error(error?.data?.message || "Failed to save shipping note");
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      title={isEditing ? "Edit Shipping Note" : "Create New Shipping Note"}
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
          label="Note Name"
          rules={[
            { required: true, message: "Please enter note name" },
            { min: 2, message: "Name must be at least 2 characters" },
          ]}
        >
          <Input placeholder="e.g., Fragile Item, Special Delivery" />
        </Form.Item>

        <Form.Item
          name="text"
          label="Note Text"
          rules={[
            { required: true, message: "Please enter note text" },
            { min: 10, message: "Text must be at least 10 characters" },
          ]}
        >
          <TextArea
            rows={4}
            placeholder="e.g., Please handle this package with extreme care..."
            showCount
            maxLength={500}
          />
        </Form.Item>

        <Form.Item name="isActive" label="Status" valuePropName="checked">
          <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ShippingNoteModal;
