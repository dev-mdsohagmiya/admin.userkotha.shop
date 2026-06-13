import { DeleteOutlined, HomeOutlined, PlusOutlined } from "@ant-design/icons";
import {
  Button,
  Card,
  Divider,
  Form,
  Input,
  InputNumber,
  List,
  Modal,
  Select,
  Space,
  Steps,
  Tooltip,
} from "antd";
import { useEffect, useState, useMemo } from "react";
import { toast } from "react-toastify";
import {
  useCreateWarehouseMutation,
  useUpdateWarehouseMutation,
} from "../../../redux/features/warehouses/warehousesApi";
import { useGetAllUserQuery } from "../../../redux/features/user/userApi";
import SwitchStatus2 from "../Forms/SwitchStatus2";

const { Step } = Steps;
const { TextArea } = Input;

interface CreateWarehouseModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  editData?: any | null;
}

interface RackData {
  name: string;
  description?: string;
}

interface RoomFormData {
  name: string;
  description?: string;
  racks: RackData[];
}

const CreateOrUpdateWarehouseModal: React.FC<CreateWarehouseModalProps> = ({
  open,
  setOpen,
  editData,
}) => {
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);
  const [rooms, setRooms] = useState<RoomFormData[]>([]);
  const [warehouseData, setWarehouseData] = useState<any>(null);
  const [createWarehouse, { isLoading: createLoading }] =
    useCreateWarehouseMutation();
  const [updateWarehouse, { isLoading: updateLoading }] =
    useUpdateWarehouseMutation();

  // Fetch ADMIN users for manager selection
  const { data: usersData, isLoading: usersLoading } = useGetAllUserQuery([
    { name: "limit", value: "1000" },
    { name: "role", value: "ADMIN" },
  ]);

  const isLoading = createLoading || updateLoading;
  const adminUsers = usersData?.data || [];

  // ✅ Default Room & Rack
  const defaultRack: RackData = useMemo(
    () => ({ name: "", description: "" }),
    [],
  );
  const defaultRoom: RoomFormData = useMemo(
    () => ({
      name: "",
      description: "",
      racks: [defaultRack],
    }),
    [defaultRack],
  );

  useEffect(() => {
    if (editData) {
      form.setFieldsValue({
        name: editData.name,
        location: editData.location,
        managerId: editData.managerId || editData.manager?.id,
        capacity: editData?.capacity || 0,
      });
      // Use editData rooms or fallback to default
      if (!editData.rooms || editData.rooms.length === 0) {
        setRooms([defaultRoom]);
      } else {
        setRooms(
          editData.rooms.map((room: any) => ({
            name: room.name,
            description: room.description,
            racks:
              room.racks?.length > 0
                ? room.racks.map((rack: any) => ({
                    name: rack.name,
                    description: rack.description,
                  }))
                : [defaultRack],
          })),
        );
      }
      setWarehouseData({
        name: editData.name,
        location: editData.location,
        managerId: editData.managerId || editData.manager?.id,
        capacity: editData?.capacity || 0,
      });
    } else {
      // Create mode – initialize defaults
      form.setFieldsValue({
        name: "",
        location: "",
        managerId: undefined,
        capacity: 0,
      });
      setRooms([defaultRoom]);
      setWarehouseData(null);
    }
    setCurrentStep(0);
  }, [editData, form, open, defaultRoom, defaultRack]);

  const steps = [
    { title: "Warehouse Details" },
    { title: "Rooms & Racks" },
    { title: "Review" },
  ];

  const addRoom = () =>
    setRooms([
      ...rooms,
      {
        name: `Room ${rooms.length + 1}`,
        description: "",
        racks: [defaultRack],
      },
    ]);

  const updateRoom = (index: number, field: string, value: any) => {
    const updated = [...rooms];
    (updated[index] as any)[field] = value;
    setRooms(updated);
  };

  const removeRoom = (index: number) => {
    const filtered = rooms.filter((_, i) => i !== index);
    setRooms(filtered.length > 0 ? filtered : [defaultRoom]);
  };

  const addRack = (roomIndex: number) => {
    const updated = [...rooms];
    updated[roomIndex].racks.push({
      name: `Rack ${updated[roomIndex].racks.length + 1}`,
      description: "",
    });
    setRooms(updated);
  };

  const updateRack = (
    roomIndex: number,
    rackIndex: number,
    field: string,
    value: any,
  ) => {
    const updated = [...rooms];
    (updated[roomIndex].racks[rackIndex] as any)[field] = value;
    setRooms(updated);
  };

  const removeRack = (roomIndex: number, rackIndex: number) => {
    const updated = [...rooms];
    const newRacks = updated[roomIndex].racks.filter((_, i) => i !== rackIndex);
    updated[roomIndex].racks = newRacks.length > 0 ? newRacks : [defaultRack];
    setRooms(updated);
  };

  const onWarehouseFinish = (values: any) => {
    setWarehouseData(values);
    setCurrentStep(1);
  };

  const onRoomsFinish = () => setCurrentStep(2);

  const onFinalSubmit = async () => {
    if (!warehouseData) return;

    const finalData = {
      ...warehouseData,
      rooms: rooms.map((room) => ({
        name: room.name,
        description: room.description,
        racks: room.racks.map((r) => ({
          name: r.name,
          description: r.description,
        })),
      })),
    };

    try {
      let res;
      if (editData) {
        res = await updateWarehouse({
          id: editData.id,
          data: finalData,
        }).unwrap();
      } else {
        res = await createWarehouse(finalData).unwrap();
      }

      if (res?.success) {
        toast.success(
          res.message ||
            `Warehouse ${editData ? "updated" : "created"} successfully!`,
        );
        setOpen(false);
        setCurrentStep(0);
        setRooms([defaultRoom]);
        setWarehouseData(null);
        form.resetFields();
      }
    } catch (err: any) {
      console.error(err);
      toast.error(
        err?.data?.message ||
          `Failed to ${editData ? "update" : "create"} warehouse!`,
      );
    }
  };

  const renderWarehouseStep = () => (
    <Form form={form} layout="vertical" onFinish={onWarehouseFinish}>
      <Card
        style={{ marginBottom: "16px" }}
        className="!mb-4"
        title="Warehouse Information"
        size="small"
      >
        <Form.Item
          label="Warehouse Name"
          name="name"
          rules={[{ required: true, message: "Please enter warehouse name" }]}
        >
          <Input placeholder="e.g., Main Warehouse" />
        </Form.Item>
        <Form.Item label="Location" name="location">
          <Input placeholder="Warehouse Location" />
        </Form.Item>
        <Form.Item label="Manager" name="managerId">
          <Select
            placeholder="Select a manager"
            allowClear
            showSearch
            loading={usersLoading}
            filterOption={(input, option) =>
              String(option?.label ?? "")
                .toLowerCase()
                .includes(input.toLowerCase())
            }
            options={adminUsers.map((user: any) => ({
              value: user.id,
              label: `${user.name} (${user.email})`,
            }))}
          />
        </Form.Item>
        <Form.Item label="Capacity (sq ft)" name="capacity">
          <InputNumber
            type="number"
            placeholder="Total capacity"
            style={{ width: "100%" }}
          />
        </Form.Item>
        <Form.Item
          label="Status"
          name="isActive"
          rules={[{ required: true, message: "Please select status!" }]}
          initialValue={true}
        >
          <SwitchStatus2 defaultChecked size="default" />
        </Form.Item>
      </Card>
      <div className="flex justify-end gap-2 mt-4">
        <Button onClick={() => setOpen(false)}>Cancel</Button>
        <Button type="primary" htmlType="submit">
          Next: Add Rooms & Racks
        </Button>
      </div>
    </Form>
  );

  const renderRoomsStep = () => (
    <div>
      <Card
        title={
          <div className="flex justify-between items-center">
            <span>Rooms & Racks Configuration</span>
          </div>
        }
        size="small"
        className="!mb-4"
      >
        {rooms.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <HomeOutlined className="text-2xl mb-2" />
            <div>No rooms added yet</div>
          </div>
        ) : (
          rooms.map((room, roomIndex) => (
            <Card
              style={{ marginBottom: "16px" }}
              key={roomIndex}
              title={`Room ${roomIndex + 1}`}
              size="small"
              type="inner"
              extra={
                <Tooltip title="Delete Room">
                  <Button
                    danger
                    size="middle"
                    icon={<DeleteOutlined />}
                    onClick={() => removeRoom(roomIndex)}
                  />
                </Tooltip>
              }
              className="mb-4"
            >
              <Space direction="vertical" style={{ width: "100%" }}>
                <Input
                  value={room.name}
                  onChange={(e) =>
                    updateRoom(roomIndex, "name", e.target.value)
                  }
                  placeholder="Room Name"
                />
                <TextArea
                  value={room.description}
                  onChange={(e) =>
                    updateRoom(roomIndex, "description", e.target.value)
                  }
                  placeholder="Room Description..."
                  rows={2}
                />
                <div className="mt-2">
                  <div className="flex justify-between items-center mb-2">
                    <span>Racks</span>
                    <Button
                      type="dashed"
                      size="middle"
                      icon={<PlusOutlined />}
                      onClick={() => addRack(roomIndex)}
                    >
                      Add Rack
                    </Button>
                  </div>

                  <div className="border p-2 rounded-md">
                    {room.racks.map((rack, rackIndex) => (
                      <div key={rackIndex} className=" mt-2">
                        <div className="flex mb-2 gap-4">
                          <Input
                            style={{ width: "100%" }}
                            value={rack.name}
                            onChange={(e) =>
                              updateRack(
                                roomIndex,
                                rackIndex,
                                "name",
                                e.target.value,
                              )
                            }
                            placeholder="Rack Name"
                          />

                          <Tooltip title="Delete Rack">
                            <Button
                              danger
                              size="middle"
                              icon={<DeleteOutlined />}
                              onClick={() => removeRack(roomIndex, rackIndex)}
                            />
                          </Tooltip>
                        </div>
                        <TextArea
                          value={rack.description}
                          onChange={(e) =>
                            updateRack(
                              roomIndex,
                              rackIndex,
                              "description",
                              e.target.value,
                            )
                          }
                          placeholder="Rack Description"
                          rows={2}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </Space>
            </Card>
          ))
        )}
        <Button
          size="middle"
          type="dashed"
          className="w-full"
          icon={<PlusOutlined />}
          onClick={addRoom}
        >
          Add Room
        </Button>
      </Card>

      <div className="flex justify-between gap-2 mt-4">
        <Button onClick={() => setCurrentStep(0)}>Back</Button>
        <Button
          type="primary"
          onClick={onRoomsFinish}
          disabled={rooms.length === 0}
        >
          Next: Review
        </Button>
      </div>
    </div>
  );

  const renderReviewStep = () => {
    // Find the selected manager from adminUsers
    const selectedManager = adminUsers.find(
      (user: any) => user.id === warehouseData?.managerId,
    );
    const managerDisplay = selectedManager
      ? `${selectedManager.name} (${selectedManager.email})`
      : "Not assigned";

    return (
      <div>
        <Card title="Review Warehouse Configuration" size="small">
          <div className="mb-4">
            <h4 className="font-semibold mb-2">Warehouse Details</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Name:</strong> {warehouseData?.name}
              </div>
              <div>
                <strong>Location:</strong> {warehouseData?.location || "N/A"}
              </div>
              <div>
                <strong>Manager:</strong> {managerDisplay}
              </div>
              <div>
                <strong>Capacity:</strong> {warehouseData?.capacity || "N/A"} sq
                ft
              </div>
            </div>
          </div>

          <Divider />

          <h4 className="font-semibold mb-4">Rooms & Racks</h4>
          {rooms.map((room, roomIndex) => (
            <Card
              key={roomIndex}
              size="small"
              className="mb-4"
              title={room.name}
            >
              <div className="mb-2">
                <strong>Description:</strong> {room.description || "N/A"}
              </div>
              <div>
                <strong>Racks ({room.racks.length}):</strong>
                <List
                  size="small"
                  dataSource={room.racks}
                  renderItem={(rack) => (
                    <List.Item>
                      {rack.name} − {rack.description || "No description"}
                    </List.Item>
                  )}
                />
              </div>
            </Card>
          ))}
        </Card>

        <div className="flex justify-between gap-2 mt-4">
          <Button onClick={() => setCurrentStep(1)}>Back</Button>
          <Button type="primary" loading={isLoading} onClick={onFinalSubmit}>
            {editData ? "Update Warehouse" : "Create Warehouse"}
          </Button>
        </div>
      </div>
    );
  };

  return (
    <Modal
      open={open}
      onCancel={() => {
        setOpen(false);
        setCurrentStep(0);
        setRooms([defaultRoom]);
        setWarehouseData(null);
        form.resetFields();
      }}
      footer={null}
      width={800}
      title={
        <div>
          <div className="flex items-center gap-2 mb-2">
            {editData ? "Edit Warehouse" : "Create New Warehouse"}
          </div>
          <Steps current={currentStep} size="small">
            {steps.map((step) => (
              <Step key={step.title} title={step.title} />
            ))}
          </Steps>
        </div>
      }
    >
      <div className="mt-4">
        {currentStep === 0 && renderWarehouseStep()}
        {currentStep === 1 && renderRoomsStep()}
        {currentStep === 2 && renderReviewStep()}
      </div>
    </Modal>
  );
};

export default CreateOrUpdateWarehouseModal;
