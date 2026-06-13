import {
  Modal,
  Form,
  Input,
  Select,
  Button,
  InputNumber,
  Divider,
  Card,
  Spin,
} from "antd";
import { PlusOutlined, MinusCircleOutlined } from "@ant-design/icons";
import { toast } from "react-toastify";
import PageMeta from "../../Meta/PageMeta";
import { useUnitListQuery } from "../../../../redux/features/units/unitsApi";
import { useNavigate } from "react-router-dom";
import { useCreateRequisitionMutation } from "../../../../redux/features/requisitionApproval/requisitionApprovalApi";

const { Option } = Select;

interface CreateRequisitionApprovalModalProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const CreateRequisitionApprovalModal: React.FC<
  CreateRequisitionApprovalModalProps
> = ({ open, setOpen }) => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { data: unitsData, isLoading: unitLoading } =
    useUnitListQuery(undefined);
  const [createRequisition, { isLoading }] = useCreateRequisitionMutation();

  const units = unitsData?.data || [];

  const onFinish = async (values: any) => {
    try {
      const res = await createRequisition(values).unwrap();
      if (res.success) {
        toast.success("Requisition created successfully!");
        setOpen(false);
        form.resetFields();
        navigate("/requisitions");
      }
    } catch (err: any) {
      toast.error(err.message || "Something went wrong!");
    }
  };

  return (
    <Modal
      open={open}
      onCancel={() => setOpen(false)}
      footer={false}
      width={950}
    >
      <PageMeta
        title="Create Requisition"
        description="Create a new material requisition."
      />

      <div className="mb-3">
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
          Create Requisition
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Fill out the details to create a new requisition request.
        </p>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{
          type: "raw_material",
          items: [
            {
              materialType: "raw",
              quantity: 1,
              unitId: "",
              purpose: "",
            },
          ],
        }}
      >
        {/* Basic Info */}
        <div className="flex gap-5 w-full">
          <Form.Item
            label="Requisition Number"
            name="requisitionNumber"
            className="w-full"
            rules={[
              { required: true, message: "Please enter requisition number" },
            ]}
          >
            <Input placeholder="e.g., REQ-2024-001"  style={{width:"100%"}}/>
          </Form.Item>

          <Form.Item
            label="Requested By"
            name="requestedBy"
            className="w-full"
            rules={[{ required: true, message: "Please enter requester name" }]}
          >
            <Input placeholder="Enter requested by user ID or name" style={{width:"100%"}}/>
          </Form.Item>
        </div>

        <Form.Item label="Requisition Type" name="type">
          <Select>
            <Option value="raw_material">Raw Material</Option>
            <Option value="finished_goods">Finished Goods</Option>
          </Select>
        </Form.Item>

        <Divider orientation="left">Items</Divider>

        {/* Dynamic Item List */}
        <Form.List name="items">
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, ...restField }) => (
                <Card
                  key={key}
                  size="small"
                  title={`Item ${name + 1}`}
                  className="shadow-sm rounded-lg border mb-4"
                  extra={
                    fields.length > 1 && (
                      <Button
                        danger
                        type="text"
                        size="small"
                        icon={<MinusCircleOutlined />}
                        onClick={() => remove(name)}
                      />
                    )
                  }
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    <Form.Item
                      {...restField}
                      label="Material ID"
                      name={[name, "materialId"]}
                      rules={[{ required: true, message: "Enter Material ID" }]}
                    >
                      <Input placeholder="Enter material ID" />
                    </Form.Item>

                    <Form.Item
                      {...restField}
                      label="Quantity"
                      name={[name, "quantity"]}
                      rules={[{ required: true, message: "Enter quantity" }]}
                    >
                      <InputNumber min={1} className="w-full" />
                    </Form.Item>

                    <Form.Item
                      {...restField}
                      label="Unit"
                      name={[name, "unitId"]}
                      rules={[{ required: true, message: "Select unit" }]}
                    >
                      <Select placeholder="Select Unit">
                        {unitLoading ? (
                          <Option value="" disabled>
                            <Spin size="small" /> Loading...
                          </Option>
                        ) : (
                          units.map((unit: any) => (
                            <Option key={unit.id} value={unit.id}>
                              {unit.name}
                            </Option>
                          ))
                        )}
                      </Select>
                    </Form.Item>

                    <Form.Item
                      {...restField}
                      label="Purpose"
                      name={[name, "purpose"]}
                    >
                      <Input placeholder="Enter purpose" />
                    </Form.Item>
                  </div>
                </Card>
              ))}

              <Form.Item>
                <Button
                  type="dashed"
                  onClick={() =>
                    add({
                      materialId: "",
                      quantity: 1,
                      unitId: "",
                      purpose: "",
                    })
                  }
                  block
                  icon={<PlusOutlined />}
                >
                  Add Item
                </Button>
              </Form.Item>
            </>
          )}
        </Form.List>

        <Form.Item label="Overall Purpose" name="purpose">
          <Input placeholder="e.g., Monthly production batch" />
        </Form.Item>

        <Form.Item label="Notes" name="notes">
          <Input.TextArea placeholder="Add additional notes" rows={3} />
        </Form.Item>

        <div className="flex justify-end gap-2 mt-5">
          <Button
            onClick={() => {
              setOpen(false);
              form.resetFields();
            }}
          >
            Cancel
          </Button>
          <Button loading={isLoading} type="primary" htmlType="submit">
            Create
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default CreateRequisitionApprovalModal;
