import { Button, Form, Input, Modal } from "antd";
import React, { useEffect } from "react";
import { toast } from "react-toastify";
import { useUpdateCustomerMutation } from "../../../../redux/features/customers/customersApi"; // adjust hook path
import { ICustomer } from "../../../../types/customer";
import SwitchStatus2 from "../../Forms/SwitchStatus2";

interface UpdateCustomerModalProps {
  open: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  data?: ICustomer; // old pattern
  customer?: ICustomer; // new pattern
  onCancel?: () => void;
  onSuccess?: () => void;
}

const UpdateCustomerModal: React.FC<UpdateCustomerModalProps> = ({
  open,
  setOpen,
  data,
  customer,
  onCancel,
  onSuccess,
}) => {
  const [form] = Form.useForm<ICustomer>();
  const [updateCustomer, { isLoading }] = useUpdateCustomerMutation();

  const actualData = customer || data;

  const handleClose = () => {
    if (onCancel) {
      onCancel();
    } else if (setOpen) {
      setOpen(false);
    }
  };

  // when modal opens and data is provided, set form fields
  useEffect(() => {
    if (actualData) {
      form.setFieldsValue(actualData);
    }
  }, [actualData, form]);

  const onFinish = async (values: ICustomer) => {
    try {
      const res = await updateCustomer({
        id: actualData?.id as string,
        data: values,
      }).unwrap();

      if (res?.success) {
        toast.success("Customer updated successfully!");
        if (onSuccess) {
          onSuccess();
        } else if (setOpen) {
          setOpen(false);
        }
        form.resetFields();
      }
    } catch (err: any) {
      toast.error(err.message || "Something went wrong. Please try again.");
    }
  };

  return (
    <Modal open={open} onCancel={handleClose} footer={false} width={800}>
      <div className="mb-6">
        <h1 className="mb-1 font-semibold text-gray-800 text-2xl">
          Update Customer
        </h1>
        <p className="text-sm text-gray-500">
          Modify the details of the selected customer.
        </p>
      </div>

      <Form
        form={form}
        name="update-customer"
        onFinish={onFinish}
        layout="vertical"
        size="middle"
        className="space-y-2 w-full"
      >
        <Form.Item
          label="Name"
          name="name"
          tooltip="Enter the full name of the customer"
          rules={[
            { required: true, message: "Please enter the customer name!" },
          ]}
        >
          <Input placeholder="e.g., John Smith" />
        </Form.Item>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Form.Item
            label="Phone"
            name="phone"
            tooltip="Enter the contact number (11 digits, starting with 01)"
            rules={[
              { required: true, message: "Please enter the phone number!" },
              {
                pattern: /^01[0-9]{9}$/,
                message: "Phone number must be 11 digits and start with 01!",
              },
            ]}
          >
            <Input
              maxLength={11}
              placeholder="e.g., 01712345678"
              onChange={(e) => {
                // শুধু Digit allow + 11 digit limit
                e.target.value = e.target.value.replace(/\D/g, "").slice(0, 11);
              }}
            />
          </Form.Item>

          <Form.Item
            label="Email (Optional)"
            name="email"
            tooltip="Enter the email address"
          >
            <Input placeholder="e.g., john@example.com" />
          </Form.Item>
        </div>

        <Form.Item
          label="Address"
          name="address"
          tooltip="Enter the full postal address"
        >
          <Input.TextArea placeholder="e.g., 123 Main Street, City" rows={4} />
        </Form.Item>

        <Form.Item
          label="Status"
          name="isActive"
          valuePropName="checked"
          tooltip="Activate or deactivate this customer"
          rules={[{ required: true, message: "Please select status!" }]}
        >
          <SwitchStatus2 defaultChecked={actualData?.isActive} size="default" />
        </Form.Item>

        <div className="flex justify-start gap-2 w-full mt-5">
          <Button
            onClick={() => {
              handleClose();
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

export default UpdateCustomerModal;
