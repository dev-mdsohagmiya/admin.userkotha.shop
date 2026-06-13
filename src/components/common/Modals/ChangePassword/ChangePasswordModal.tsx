import { LockOutlined } from "@ant-design/icons";
import { Button, Form, Input, Modal } from "antd";
import React from "react";
import { toast } from "react-toastify";
import { useChangePasswordMutation } from "../../../../redux/features/auth/authApi";


interface ChangePasswordModalProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

interface ChangePasswordForm {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  open,
  setOpen,
}) => {
  const [form] = Form.useForm<ChangePasswordForm>();
  const [changePassword, { isLoading }] = useChangePasswordMutation();

  const onFinish = async (values: ChangePasswordForm) => {
    const payload = {
      oldPassword: values.oldPassword,
      newPassword: values.newPassword,
      confirmPassword: values.confirmPassword,
    };


    try {
      const res = await changePassword(payload).unwrap();
      
      if (res.success) {
        toast.success(res.message || "Password updated successfully!");
        setOpen(false);
        form.resetFields();
      }
    } catch (err: any) {
      toast.error(err.message || "Something went wrong. Please try again.");
    }
  };

  const handleCancel = () => {
    setOpen(false);
    form.resetFields();
  };

  return (
    <Modal
      open={open}
      onCancel={handleCancel}
      footer={false}
      width={500}
      title={
        <div className="mb-6">
          <h1 className="mb-1 font-semibold text-gray-800 text-xl">
            Change Password
          </h1>
          <p className="text-sm text-gray-500">
            Update your account password securely.
          </p>
        </div>
      }
    >
      <Form
        form={form}
        name="change-password"
        onFinish={onFinish}
        layout="vertical"
        size="middle"
        className="space-y-4"
        validateTrigger="onBlur"
      >
        {/* Old Password */}
        <Form.Item
          label="Old Password"
          name="oldPassword"
          rules={[
            { required: true, message: "Please enter your old password!" },
          ]}
        >
          <Input.Password
            prefix={<LockOutlined className="text-gray-400" />}
            placeholder="Enter old password"
            className="w-full"
          />
        </Form.Item>

        {/* New Password */}
        <Form.Item
          label="New Password"
          name="newPassword"
          rules={[
            { required: true, message: "Please enter your new password!" },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value) {
                  return Promise.resolve();
                }
                if (getFieldValue("oldPassword") === value) {
                  return Promise.reject(
                    new Error("New password cannot be the same as old password!")
                  );
                }
                return Promise.resolve();
              },
            }),
          ]}
          hasFeedback
        >
          <Input.Password
            prefix={<LockOutlined className="text-gray-400" />}
            placeholder="Enter new password"
            className="w-full"
          />
        </Form.Item>

        {/* Confirm Password */}
        <Form.Item
          label="Confirm New Password"
          name="confirmPassword"
          dependencies={["newPassword"]}
          hasFeedback
          rules={[
            { required: true, message: "Please confirm your password!" },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value) {
                  return Promise.reject(new Error("Please confirm your password!"));
                }
                if (getFieldValue("newPassword") !== value) {
                  return Promise.reject(
                    new Error("The two passwords do not match!")
                  );
                }
                return Promise.resolve();
              },
            }),
          ]}
        >
          <Input.Password
            prefix={<LockOutlined className="text-gray-400" />}
            placeholder="Confirm new password"
            className="w-full"
          />
        </Form.Item>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <Button
            onClick={handleCancel}
            type="default"
            htmlType="button"
            className="px-6"
          >
            Cancel
          </Button>
          <Button
            loading={isLoading}
            type="primary"
            htmlType="submit"
            className="px-6"
          >
            Change Password
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default ChangePasswordModal;