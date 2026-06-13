import { Button, Form, Input, Modal } from "antd";
import React from "react";
import { toast } from "react-toastify";
import { useCreateCustomerMutation } from "../../../../redux/features/customers/customersApi"; // adjust hook path
import { ICustomer } from "../../../../types/customer";
import SwitchStatus2 from "../../Forms/SwitchStatus2";

interface CreateCustomerModalProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const CreateCustomerModal: React.FC<CreateCustomerModalProps> = ({
  open,
  setOpen,
}) => {
  const [form] = Form.useForm<ICustomer>();
  const [createCustomer, { isLoading }] = useCreateCustomerMutation();

  const onFinish = async (values: ICustomer) => {
    try {
      const res = await createCustomer(values).unwrap();

      if (res?.success) {
        toast.success("Customer created successfully!");
        setOpen(false);
        form.resetFields();
        // -👉 invalidatesTags on customers API should refresh list
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
          Create Customer
        </h1>
        <p className="text-sm text-gray-500">
          Fill out the details to create a new customer.
        </p>
      </div>

      <Form
        form={form}
        name="create-customer"
        onFinish={onFinish}
        layout="vertical"
        size="middle"
        className="space-y-2 w-full"
        initialValues={{ isActive: true }}
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
          tooltip="Activate or deactivate this customer"
          valuePropName="checked"
          rules={[{ required: true, message: "Please select status!" }]}
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

export default CreateCustomerModal;
