import { Button, Card, Col, Form, Input, Modal, Row, Select } from "antd";

import SwitchStatus2 from "../../Forms/SwitchStatus2";
import { useCreateSupplierMutation } from "../../../../redux/features/suppliers/suppliersApi";
import { toast } from "react-toastify";

const { Option } = Select;
const { TextArea } = Input;

interface CreateSupplierModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const CreateSupplierModal: React.FC<CreateSupplierModalProps> = ({
  open,
  setOpen,
}) => {

  const [form] = Form.useForm();
  const [createSupplier, { isLoading: createSupplierLoading }] =
    useCreateSupplierMutation();
  // Countries list (you can expand this)
  const countries = [
    { value: "bangladesh", label: "Bangladesh" },
    { value: "india", label: "India" },
    { value: "china", label: "China" },
    { value: "usa", label: "United States" },
    { value: "uk", label: "United Kingdom" },
  ];

  const onFinish = async (values: any) => {

    try {
      const res = await createSupplier(values).unwrap();

      if (res?.success) {
        toast.success(res?.message ||"Supplier created successfully!");
        setOpen(false); // modal close
        form.resetFields(); // form reset
      } else {
        toast.error(res?.message || "Failed to create supplier.");
      }
    } catch (err: any) {
      // Prisma / API error handling
      const errorMessage =
        err?.data?.message ||
        err?.message ||
        "Something went wrong. Please try again.";
      toast.error(errorMessage);
    }
  };

  return (
    <Modal
      open={open}
      onCancel={() => setOpen(false)}
      footer={null}
      width={800}
      title={
        <div className="mb-6">
          {/* Page Title */}
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90 mb-1">
          Create New Supplier
          </h1>

          {/* Description */}
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Fill out the details below to{" "}
         update this supplier
          </p>
        </div>
      }
    >
      <Form form={form} layout="vertical" onFinish={onFinish} className="mt-4">
        {/* Basic Information */}
        <Card title="Basic Information" size="small" className="mb-4">
          <Row gutter={[16, 0]}>
            <Col span={12}>
              <Form.Item
                label="Supplier Name"
                name="name"
                rules={[
                  { required: true, message: "Please enter supplier name" },
                ]}
              >
                <Input placeholder="Full name or company name of the supplier" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Contact Person"
                name="contactPerson"
                rules={[
                  { required: true, message: "Please enter contact person" },
                ]}
              >
                <Input placeholder="Primary contact person name" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 0]}>
            <Col span={12}>
              <Form.Item
                label="Phone Number"
                name="phone1"
                rules={[
                  { required: true, message: "Please enter phone number" },
                  {
                    pattern: /^[0-9+\-\s()]+$/,
                    message: "Please enter valid phone number",
                  },
                ]}
              >
                <Input placeholder="Main contact number" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Alternative Phone" name="phone2">
                <Input placeholder="Secondary number (Optional)" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 0]}>
            <Col span={12}>
              <Form.Item
                label="Email"
                name="email"
                rules={[
                  { required: true, message: "Please enter email" },
                  { type: "email", message: "Please enter valid email" },
                ]}
              >
                <Input placeholder="Supplier's business email address" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Supplier Type"
                name="type"
                rules={[
                  { required: true, message: "Please select supplier type" },
                ]}
              >
                <Select placeholder="Select supplier type">
                  <Option value="raw">Raw Material</Option>
                  <Option value="packaging">Packaging</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 0]}>
            <Col span={12}>
              <Form.Item label="Status" name="status">
                <SwitchStatus2 defaultChecked />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* Address Information */}
        <Card title=" Address Information" size="small" className="!my-4">
          <Row gutter={[16, 0]}>
            <Col span={24}>
              <Form.Item
                label="Address Line 1"
                name="addressLine1"
                rules={[
                  { required: true, message: "Please enter address line 1" },
                ]}
              >
                <Input placeholder="Main address line" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 0]}>
            <Col span={24}>
              <Form.Item label="Address Line 2" name="addressLine2">
                <Input placeholder="Additional address line (Optional)" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 0]}>
            <Col span={8}>
              <Form.Item
                label="City"
                name="city"
                rules={[{ required: true, message: "Please enter city" }]}
              >
                <Input placeholder="City name" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="District / State"
                name="district"
                rules={[
                  { required: true, message: "Please enter district/state" },
                ]}
              >
                <Input placeholder="District or State" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="Country"
                name="country"
                rules={[{ required: true, message: "Please select country" }]}
              >
                <Select placeholder="Select country">
                  {countries.map((country) => (
                    <Option key={country.value} value={country.value}>
                      {country.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 0]}>
            <Col span={12}>
              <Form.Item
                label="Postal Code"
                name="postalCode"
                rules={[
                  { required: true, message: "Please enter postal code" },
                ]}
              >
                <Input placeholder="ZIP or Postal code" />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* Bank Information */}
        <Card title="Bank Information" size="small" className="mb-4">
          <Row gutter={[16, 0]}>
            <Col span={12}>
              <Form.Item label="Bank Name" name="bankName">
                <Input placeholder="Supplier's bank name" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Account Name" name="accountName">
                <Input placeholder="Account holder's name" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 0]}>
            <Col span={12}>
              <Form.Item label="Account Number" name="accountNumber">
                <Input placeholder="Supplier's bank account number" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Branch Name" name="branchName">
                <Input placeholder="Branch name or location" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 0]}>
            <Col span={12}>
              <Form.Item label="Routing / Swift Code" name="routingCode">
                <Input placeholder="Routing or Swift code (Optional)" />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* Additional Information */}
        <Card title="Additional Information" size="small" className="!my-4">
          <Form.Item label="Notes" name="notes">
            <TextArea
              placeholder="Add any additional information about the supplier..."
              rows={4}
            />
          </Form.Item>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button
            loading={createSupplierLoading}
            type="primary"
            htmlType="submit"
          >
           Create Supplier
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default CreateSupplierModal;
