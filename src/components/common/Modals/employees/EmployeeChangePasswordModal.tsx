import { Button, Form, Input, Modal } from "antd";
import React from "react";
import { toast } from "react-toastify";
import { useEmployees } from "../../../../hooks/useEmployees";
import { IEmployee } from "../../../../types/interfaces";
import PageMeta from "../../Meta/PageMeta";

interface EmployeeChangePasswordModalProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  data: IEmployee | null;
}

const EmployeeChangePasswordModal: React.FC<EmployeeChangePasswordModalProps> = ({
  open,
  setOpen,
  data,
}) => {
  const [form] = Form.useForm();
  const { updateEmployee, updateEmployeesLoading } = useEmployees();

  const onFinish = async (values: any) => {
    if (!data) return;
    try {
      const res = await updateEmployee(data.id, {
        password: values.password,
      });

      if (res?.success) {
        toast.success("Password updated successfully!");
        setOpen(false);
        form.resetFields();
      } else {
        toast.error(res?.error || "Failed to update password.");
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
      width={500}
    >
      <PageMeta
        title="Employee Change Password"
        description="Update employee password"
      />

      <div className="mb-6">
        <h1 className="mb-1 font-semibold text-gray-800 dark:text-white/90 text-2xl">
          Change Password
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Securely update the password for{" "}
          <span className="font-semibold text-gray-700 dark:text-gray-200">
            {data?.name}
          </span>
          .
        </p>
      </div>

      <Form
        form={form}
        name="change-password"
        onFinish={onFinish}
        layout="vertical"
        size="middle"
        className="space-y-2 w-full"
      >
        <div className=" -mb-2">
          <Form.Item
            label="New Password"
            name="password"
            className="w-full"
            rules={[
              { required: true, message: "Please enter new password!" },
              { min: 6, message: "Password must be at least 6 characters!" },
            ]}
          >
            <Input.Password placeholder="Enter new password" />
          </Form.Item>

          <Form.Item
            label="Confirm New Password"
            name="confirmPassword"
            className="w-full"
            dependencies={["password"]}
            rules={[
              { required: true, message: "Please confirm your new password!" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    new Error("The two passwords do not match!")
                  );
                },
              }),
            ]}
          >
            <Input.Password placeholder="Confirm new password" />
          </Form.Item>
        </div>

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
            Update Password
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default EmployeeChangePasswordModal;
