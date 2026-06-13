import { Modal, Form, Input, InputNumber, Button, Switch } from "antd";
import { useEffect } from "react";
import {
  useCreateDeliveryChargeMutation,
  useUpdateDeliveryChargeMutation,
} from "../../../redux/features/deliveryCharge/deliveryChargeApi";
import { toast } from "react-toastify";
import { IDeliveryOption } from "../../../types/deliveryCharge";

interface CreateDeliveryChargeModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  itemToEdit?: IDeliveryOption | null;
  setItemToEdit: (item: IDeliveryOption | null) => void;
}

const CreateDeliveryChargeModal = ({
  open,
  setOpen,
  itemToEdit,
  setItemToEdit,
}: CreateDeliveryChargeModalProps) => {
  const [form] = Form.useForm();
  const [createDeliveryCharge, { isLoading: createLoading }] =
    useCreateDeliveryChargeMutation();
  const [updateDeliveryCharge, { isLoading: updateLoading }] =
    useUpdateDeliveryChargeMutation();

  useEffect(() => {
    if (itemToEdit) {
      form.setFieldsValue(itemToEdit);
    } else {
      form.resetFields();
      form.setFieldValue("isActive", true);
    }
  }, [itemToEdit, form, open]);

  const onFinish = async (values: any) => {
    try {
      const formattedValues = {
        ...values,
        fee: Number(values.fee),
      };

      if (itemToEdit) {
        const res = await updateDeliveryCharge({
          id: itemToEdit.id,
          data: formattedValues,
        }).unwrap();
        if (res.success) {
          toast.success("Delivery charge updated successfully");
          setOpen(false);
          setItemToEdit(null);
          form.resetFields();
        }
      } else {
        const res = await createDeliveryCharge(formattedValues).unwrap();
        if (res.success) {
          toast.success("Delivery charge created successfully");
          setOpen(false);
          form.resetFields();
        }
      }
    } catch (error: any) {
      toast.error(error?.data?.message || "Something went wrong");
    }
  };

  const handleCancel = () => {
    setOpen(false);
    setItemToEdit(null);
    form.resetFields();
  };

  return (
    <Modal
      title={itemToEdit ? "Update Delivery Charge" : "Create Delivery Charge"}
      open={open}
      onCancel={handleCancel}
      footer={null}
    >
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item
          name="name"
          label="Name"
          rules={[{ required: true, message: "Please enter name" }]}
        >
          <Input placeholder="e.g. Inside Dhaka" />
        </Form.Item>

        <Form.Item
          name="fee"
          label="Fee"
          rules={[
            { required: true, message: "Please enter fee" },
            { type: "number", min: 0, message: "Please enter a valid fee" },
          ]}
        >
          <InputNumber
            style={{ width: "100%" }}
            placeholder="e.g. 60"
            min={0}
          />
        </Form.Item>

        <Form.Item name="description" label="Description">
          <Input.TextArea placeholder="Enter description" rows={3} />
        </Form.Item>

        <Form.Item name="isActive" label="Status" valuePropName="checked">
          <Switch />
        </Form.Item>

        <div className="flex justify-end gap-2">
          <Button onClick={handleCancel}>Cancel</Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={createLoading || updateLoading}
          >
            {itemToEdit ? "Update" : "Create"}
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default CreateDeliveryChargeModal;
