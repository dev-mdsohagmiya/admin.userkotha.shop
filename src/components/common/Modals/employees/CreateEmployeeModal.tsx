import { Button, Form, Input, Modal, Select } from "antd";
import React from "react";
import { toast } from "react-toastify";
import { useDesignations } from "../../../../hooks/useDesignations";
import { useEmployees } from "../../../../hooks/useEmployees";
import { IEmployee } from "../../../../types/interfaces";
import FormToggle from "../../Forms/SwitchStatus2";
import PageMeta from "../../Meta/PageMeta";

const { Option } = Select;

interface CreateEmployeeModalProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const CreateEmployeeModal: React.FC<CreateEmployeeModalProps> = ({
  open,
  setOpen,
}) => {
  const [form] = Form.useForm<IEmployee>();
  const { createEmployee, createEmployeesLoading } = useEmployees();
  const { designations } = useDesignations();

  const onFinish = async (values: any) => {
    try {
      const employeeData = { ...values };
      delete employeeData.confirmPassword;

      const res = await createEmployee(employeeData);

      if (res?.success) {
        toast.success("Employee created successfully!");
        setOpen(false);
        form.resetFields();
      } else {
        toast.error(res?.error || "Failed to create employee.");
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
      <PageMeta
        title="Create Employee"
        description="Create a new employee account"
      />

      <div className="mb-6">
        <h1 className="mb-1 font-semibold text-gray-800 dark:text-white/90 text-2xl">
          Create Employee
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Fill out the details to create a new employee with designation-based
          permissions.
        </p>
      </div>

      <Form
        form={form}
        name="create-employee"
        onFinish={onFinish}
        layout="vertical"
        size="middle"
        className="space-y-2 w-full"
      >
        <div className="md:flex gap-6 -mb-2">
          <Form.Item
            label="Full Name"
            name="name"
            className="w-full"
            rules={[{ required: true, message: "Please enter employee name!" }]}
          >
            <Input placeholder="e.g., John Doe" />
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
            className="w-full"
            rules={[
              { required: true, message: "Please enter email!" },
              { type: "email", message: "Please enter a valid email!" },
            ]}
          >
            <Input placeholder="e.g., john.doe@company.com" />
          </Form.Item>
        </div>

        <div className="md:flex gap-6 -mb-2">
          <Form.Item
            label="Phone Number"
            name="phone"
            className="w-full"
            rules={[{ required: true, message: "Please enter phone number!" }]}
          >
            <Input placeholder="e.g., 01712345678" />
          </Form.Item>

          <Form.Item
            label="Designation"
            name="designationId"
            className="w-full"
            rules={[{ required: true, message: "Please select designation!" }]}
          >
            <Select placeholder="Select designation">
              {designations
                .filter((d: { isActive: boolean }) => d.isActive)
                .map((designation: { id: string | number; name: string }) => (
                  <Option key={designation.id} value={designation.id}>
                    {designation.name}
                  </Option>
                ))}
            </Select>
          </Form.Item>
        </div>

        <div className="md:flex gap-6 -mb-2">
          <Form.Item
            label="Password"
            name="password"
            className="w-full"
            rules={[
              { required: true, message: "Please enter password!" },
              { min: 6, message: "Password must be at least 6 characters!" },
            ]}
          >
            <Input.Password placeholder="Enter password" />
          </Form.Item>

          <Form.Item
            label="Confirm Password"
            name="confirmPassword"
            className="w-full"
            dependencies={["password"]}
            rules={[
              { required: true, message: "Please confirm password!" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    new Error("Passwords do not match!")
                  );
                },
              }),
            ]}
          >
            <Input.Password placeholder="Confirm password" />
          </Form.Item>
        </div>

        <Form.Item
          label="Status"
          name="isActive"
          rules={[{ required: true, message: "Please select status!" }]}
          initialValue={true}
        >
          <FormToggle defaultChecked size="default" />
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
            loading={createEmployeesLoading}
            type="primary"
            htmlType="submit"
            className="px-5!"
          >
            Create Employee
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default CreateEmployeeModal;
