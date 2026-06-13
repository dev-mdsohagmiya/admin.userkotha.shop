import {
  AppstoreOutlined,
  HomeOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { Button, Form, Input, Modal, Select, Switch } from "antd";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { rackStorage, roomStorage } from "../../../moc/localStorageUtils";

const { TextArea } = Input;
const { Option } = Select;
interface AddRoomRackModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  warehouseId: string;
  onSuccess: () => void;
  type: "room" | "rack";
  roomId?: string; // Required if type is 'rack'
}

const AddRoomRackModal: React.FC<AddRoomRackModalProps> = ({
  open,
  setOpen,
  warehouseId,
  onSuccess,
  type,
  roomId,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [availableRooms, setAvailableRooms] = useState<any[]>([]);

  useEffect(() => {
    if (open && type === "rack") {
      // Load available rooms for this warehouse
      const rooms = roomStorage.getRoomsByWarehouse(warehouseId);
      setAvailableRooms(rooms);

      // If roomId is provided, set it as default
      if (roomId) {
        form.setFieldValue("roomId", roomId);
      }
    } else {
      setAvailableRooms([]);
    }

    // Reset form when modal opens
    if (open) {
      form.resetFields();
      form.setFieldValue("isActive", true);
    }
  }, [open, type, warehouseId, roomId, form]);

  const onFinish = async (values: any) => {
    setLoading(true);

    try {

      if (type === "room") {
        // Create room
        const roomData = {
          name: values.name,
          description: values.description,
          isActive: values.isActive,
          warehouseId: warehouseId,
        };

        const room = roomStorage.createRoom(roomData);

        if (room && room.id) {
          toast.success(`Room "${room.name}" created successfully!`);
        } else {
          throw new Error("Room creation failed - no ID returned");
        }
      } else {
        // Create rack
        if (!values.roomId) {
          toast.error("Please select a room for the rack");
          return;
        }

        const rackData = {
          name: values.name,
          description: values.description,
          isActive: values.isActive,
          roomId: values.roomId,
          warehouseId: warehouseId,
        };

        const rack = rackStorage.createRack(rackData);

        if (rack && rack.id) {
          toast.success(`Rack "${rack.name}" created successfully!`);
        } else {
          throw new Error("Rack creation failed - no ID returned");
        }
      }

      onSuccess();
      setOpen(false);
      form.resetFields();
    } catch (error: any) {
      toast.error(`Failed to create ${type}: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onCancel={() => {
        setOpen(false);
        form.resetFields();
      }}
      footer={null}
      width={500}
      title={
        <div className="flex items-center gap-2">
          {type === "room" ? <HomeOutlined /> : <AppstoreOutlined />}
          <span>Add New {type === "room" ? "Room" : "Rack"}</span>
        </div>
      }
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        className="mt-4"
        initialValues={{
          isActive: true,
        }}
      >
        {type === "rack" && (
          <Form.Item
            label="Select Room"
            name="roomId"
            rules={[{ required: true, message: "Please select a room" }]}
          >
            <Select placeholder="Choose a room for this rack">
              {availableRooms.map((room) => (
                <Option key={room.id} value={room.id}>
                  {room.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
        )}

        <Form.Item
          label={`${type === "room" ? "Room" : "Rack"} Name`}
          name="name"
          rules={[{ required: true, message: `Please enter ${type} name` }]}
        >
          <Input placeholder={`Enter ${type} name`} />
        </Form.Item>

        <Form.Item label="Description" name="description">
          <TextArea placeholder={`Enter ${type} description`} rows={3} />
        </Form.Item>

        <Form.Item label="Status" name="isActive" valuePropName="checked">
          <Switch
            checkedChildren="Active"
            unCheckedChildren="Inactive"
            defaultChecked
          />
        </Form.Item>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            icon={<PlusOutlined />}
          >
            Add {type === "room" ? "Room" : "Rack"}
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default AddRoomRackModal;
