import { Button, Form, Input, Modal, Select } from "antd";
import React, { useEffect } from "react";
import { toast } from "react-toastify";
import { useDesignations } from "../../../../hooks/useDesignations";
import { useEmployees } from "../../../../hooks/useEmployees";
import { IEmployee } from "../../../../types/interfaces";
import FormToggle from "../../Forms/SwitchStatus2";
import PageMeta from "../../Meta/PageMeta";

const { Option } = Select;

interface UpdateEmployeeModalProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  data: IEmployee;
}

const UpdateEmployeeModal: React.FC<UpdateEmployeeModalProps> = ({
  open,
  setOpen,
  data,
}) => {
  const [form] = Form.useForm<IEmployee>();
  const { updateEmployee, updateEmployeesLoading } = useEmployees();
  const { designations } = useDesignations();

  console.log("data", data);

  useEffect(() => {
    if (open && data) {
      form.setFieldsValue({
        ...data,
        designationId: data.designationId,
      });
    }
  }, [open, data, form]);

  const onFinish = async (values: any) => {
    try {
      const res = await updateEmployee(data.id, values);

      if (res?.success) {
        toast.success("Employee updated successfully!");
        setOpen(false);
        form.resetFields();
      } else {
        toast.error(res?.error || "Failed to update employee.");
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
      <PageMeta title="Update Employee" description="Update employee details" />

      <div className="mb-6">
        <h1 className="mb-1 font-semibold text-gray-800 dark:text-white/90 text-2xl">
          Update Employee
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Modify the details below and save changes.
        </p>
      </div>

      <Form
        form={form}
        name="update-employee"
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
            <Input
              placeholder="e.g., john.doe@company.com"
              disabled={data.email === "admin@userkotha.shop"}
            />
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


        <Form.Item
          label="Status"
          name="isActive"
          rules={[{ required: true, message: "Please select status!" }]}
        >
          <FormToggle defaultChecked={data?.isActive} size="default" />
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
            loading={updateEmployeesLoading}
            type="primary"
            htmlType="submit"
            className="px-5!"
          >
            Update Employee
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default UpdateEmployeeModal;
