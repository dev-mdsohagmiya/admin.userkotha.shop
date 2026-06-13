import { Button, Form, Input, Modal, Tooltip } from "antd";
import { toast } from "react-toastify";
import {
  useMyProfileQuery,
  useUpdateProfileMutation,
} from "../../../../redux/features/user/userApi";
import { useEffect } from "react";

interface UpdateProfileModalProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

interface UpdateProfileForm {
  name: string;
  phone?: string;
  profileImage?: string;
}

const UpdateProfileModal: React.FC<UpdateProfileModalProps> = ({
  open,
  setOpen,
}) => {
  const [form] = Form.useForm<UpdateProfileForm>();
  const { data: profileData } = useMyProfileQuery(undefined);
  const [updateProfile, { isLoading }] = useUpdateProfileMutation();


  // Set initial form values when modal opens
  useEffect(() => {
    if (open && profileData?.data) {
      const user = profileData.data;
      form.setFieldsValue({
        name: user.name,
        phone: user.phone || "", // Handle case where phone might not exist
      });
    }
  }, [open, profileData, form]);

  const onFinish = async (values: UpdateProfileForm) => {
    try {
      const payload = {
        name: values.name,
        phone: values.phone || "",
      };

      const res = await updateProfile(payload).unwrap();

      if (res?.success) {
        toast.success("Profile updated successfully!");
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

  const user = profileData?.data;

  return (
    <Modal
      open={open}
      onCancel={handleCancel}
      footer={false}
      width={600}
      title={
        <div className="mb-2">
          <h1 className="mb-1 font-semibold text-gray-800 text-xl">
            Update Profile
          </h1>
          <p className="text-sm text-gray-500">
            Update your profile information.
          </p>
        </div>
      }
    >
      <Form
        form={form}
        name="update-profile"
        onFinish={onFinish}
        layout="vertical"
        size="middle"
        className="space-y-4"
      >
        {/* Profile Photo Upload */}
        {/* <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full border-4 border-white shadow-lg bg-gray-100 flex items-center justify-center overflow-hidden">
              {profileImage ? (
                <img 
                  src={profileImage} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              ) : user?.profileImage ? (
                <img 
                  src={user.profileImage} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl font-semibold text-green-600">
                    {user?.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            <Upload {...uploadProps}>
              <Button 
                icon={<CameraOutlined />} 
                className="absolute -bottom-2 -right-2 bg-green-600 text-white border-none rounded-full w-10 h-10 flex items-center justify-center shadow-lg hover:bg-green-700"
              >
              </Button>
            </Upload>
          </div>
        </div> */}

        {/* Name Field */}
        <Form.Item
          label="Full Name"
          name="name"
          rules={[
            { required: true, message: "Please enter your name!" },
            { min: 2, message: "Name must be at least 2 characters!" },
          ]}
        >
          <Input placeholder="Enter your full name" className="w-full" />
        </Form.Item>

        {/* Email Field - Read Only */}
        <Form.Item label="Email Address">
          <Tooltip title="Email cannot be changed" placement="topLeft">
            <Input
              value={user?.email}
              readOnly
              disabled
              className="w-full bg-gray-100 cursor-not-allowed"
            />
          </Tooltip>
          <div className="text-xs text-gray-500 mt-1">
            Email address cannot be changed for security reasons
          </div>
        </Form.Item>

        {/* Phone Field - Only show for employees (not super admin) */}
        {user?.role !== "SUPER_ADMIN" && (
          <Form.Item
            label="Phone Number"
            name="phone"
            rules={[
              { required: false },
              {
                pattern: /^[+]?[0-9\s\-()]{10,}$/,
                message: "Please enter a valid phone number!",
              },
            ]}
          >
            <Input placeholder="Enter your phone number" className="w-full" />
          </Form.Item>
        )}

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
            className="px-6 bg-green-600 hover:bg-green-700 border-green-600"
          >
            Update Profile
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default UpdateProfileModal;
