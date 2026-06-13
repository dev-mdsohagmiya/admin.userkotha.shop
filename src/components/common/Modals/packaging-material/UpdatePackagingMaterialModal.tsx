import {
  Button,
  Col,
  Form,
  Input,
  InputNumber,
  Modal,
  Row,
  Select,
} from "antd";
import { TbCoinTakaFilled } from "react-icons/tb";
import { toast } from "react-toastify";
import { useUpdatePackagingMaterialMutation } from "../../../../redux/features/packaging-material/packagingMaterialApi";
import { useUnitListQuery } from "../../../../redux/features/units/unitsApi";
import { IPackagingMaterial } from "../../../../types/packagingMaterial";
import { IUnit } from "../../../../types/units";
import { useEffect, useMemo } from "react";

const { Option } = Select;

interface UpdatePackagingMaterialModalProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  data: IPackagingMaterial | null; // Data to update
}

const UpdatePackagingMaterialModal: React.FC<
  UpdatePackagingMaterialModalProps
> = ({ open, setOpen, data }) => {
  const [form] = Form.useForm<IPackagingMaterial>();

  // Redux API calls
  const [updatePackagingMaterial, { isLoading }] =
    useUpdatePackagingMaterialMutation();
  const { data: unitsData, isLoading: unitsLoading } = useUnitListQuery([
    { name: "limit", value: "500" },
  ]);

  const units = useMemo(() => unitsData?.data || [], [unitsData]);

  // Reset form on cancel
  const handleCancel = () => {
    form.resetFields();
    setOpen(false);
  };

  // Load initial values when modal opens
  useEffect(() => {
    if (data && units.length > 0) {
      form.setFieldsValue({
        ...data,
        unitId: data?.unit?.id, // ensure unitId is correctly set
      });
    }
  }, [data, units, form]);

  const onFinish = async (values: IPackagingMaterial) => {
    if (!data?.id) return;

    try {
      const payload = {
        ...values,
        minStock: Number(values.minStock),
        maxStock: Number(values.maxStock),
        currentStock: Number(values.currentStock),
        costPerUnit: Number(values.costPerUnit),
      };

      const res = await updatePackagingMaterial({
        id: data.id,
        data: payload,
      }).unwrap();

      if (res.success) {
        toast.success("✅ Packaging material updated successfully!");
        form.resetFields();
        setOpen(false);
      }
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update packaging material");
    }
  };

  return (
    <Modal
      open={open}
      onCancel={handleCancel}
      footer={null}
      width={800}
      title={
        <div className="mb-2">
          <h1 className="text-2xl font-semibold mb-1 text-gray-800 dark:text-white/90">
            Update Packaging Material
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Update the details of the packaging material.
          </p>
        </div>
      }
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{ isActive: true }}
      >
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              label="Material Name"
              name="name"
              rules={[
                { required: true, message: "Please enter material name!" },
              ]}
            >
              <Input placeholder="e.g., Food Grade Plastic Bag" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Type"
              name="type"
              rules={[{ required: true, message: "Please select a type!" }]}
            >
              <Select placeholder="Select type">
                <Option value="primary">Primary</Option>
                <Option value="secondary">Secondary</Option>
                <Option value="tertiary">Tertiary</Option>
              </Select>
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="Unit"
              name="unitId"
              rules={[{ required: true, message: "Please select a unit!" }]}
            >
              <Select placeholder="Select unit" loading={unitsLoading}>
                {units.map((unit: IUnit) => (
                  <Option key={unit.id} value={unit.id}>
                    {unit.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          {/* Minimum Stock */}
          <Col span={6}>
            <Form.Item
              label="Minimum Stock"
              name="minStock"
              dependencies={["maxStock"]}
              rules={[
                { required: true, message: "Please enter minimum stock!" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    const max = getFieldValue("maxStock");
                    if (value && max && value >= max) {
                      return Promise.reject(
                        new Error(
                          "Minimum stock must be smaller than maximum stock!",
                        ),
                      );
                    }
                    return Promise.resolve();
                  },
                }),
              ]}
            >
              <InputNumber
                style={{ width: "100%" }}
                type="number"
                placeholder="200"
              />
            </Form.Item>
          </Col>

          {/* Maximum Stock */}
          <Col span={6}>
            <Form.Item
              label="Maximum Stock"
              name="maxStock"
              dependencies={["minStock"]}
              rules={[
                { required: true, message: "Please enter maximum stock!" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    const min = getFieldValue("minStock");
                    if (value && min && value <= min) {
                      return Promise.reject(
                        new Error(
                          "Maximum stock must be greater than minimum stock!",
                        ),
                      );
                    }
                    return Promise.resolve();
                  },
                }),
              ]}
            >
              <InputNumber
                style={{ width: "100%" }}
                type="number"
                placeholder="2000"
              />
            </Form.Item>
          </Col>

          {/* Current Stock */}
          <Col span={6}>
            <Form.Item
              label="Current Stock"
              name="currentStock"
              dependencies={["minStock", "maxStock"]}
              rules={[
                { required: true, message: "Please enter current stock!" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    const min = getFieldValue("minStock");
                    const max = getFieldValue("maxStock");

                    if (value && min && value <= min) {
                      return Promise.reject(
                        new Error(
                          "Current stock must be greater than minimum stock!",
                        ),
                      );
                    }

                    if (value && max && value >= max) {
                      return Promise.reject(
                        new Error(
                          "Current stock must be less than maximum stock!",
                        ),
                      );
                    }

                    return Promise.resolve();
                  },
                }),
              ]}
            >
              <InputNumber
                style={{ width: "100%" }}
                type="number"
                placeholder="800"
              />
            </Form.Item>
          </Col>

          <Col span={6}>
            <Form.Item
              label="Cost Per Unit"
              name="costPerUnit"
              rules={[
                { required: true, message: "Please enter cost per unit!" },
                {
                  validator: (_, value) =>
                    value < 0
                      ? Promise.reject("Cost must be positive")
                      : Promise.resolve(),
                },
              ]}
            >
              <InputNumber
                style={{ width: "100%" }}
                type="number"
                step="0.01"
                placeholder="2.50"
                prefix={<TbCoinTakaFilled />}
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item label="Description (Optional)" name="description">
          <Input.TextArea placeholder="Enter description..." rows={3} />
        </Form.Item>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
          <Button onClick={handleCancel}>Cancel</Button>
          <Button type="primary" htmlType="submit" loading={isLoading}>
            Update Packaging Material
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default UpdatePackagingMaterialModal;
