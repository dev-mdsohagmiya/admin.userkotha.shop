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
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import CustomActionButton from "../../../common/Button/CustomActionButton";
import CreateCategoryModel from "../Category/CreateCategoryModel";
import CreateUnitsModel from "../CreateUnitsModel";

import { useUnitListQuery } from "../../../../redux/features/units/unitsApi";
import { ICategory } from "../../../../types/category";
import { IUnit } from "../../../../types/units";
import { validatePositiveNumber } from "../../../../utils/validatePositiveNumber";
import FormToggle from "../../Forms/SwitchStatus2";
import {
  useGetWarehouseByIdQuery,
  useWarehouseListQuery,
  useGetRacksByRoomIdQuery,
} from "../../../../redux/features/warehouses/warehousesApi";
import { useSupplierListQuery } from "../../../../redux/features/suppliers/suppliersApi";
import { useCategoryListQuery } from "../../../../redux/features/categories/categoriesApi";
import { useCreateMaterialMutation } from "../../../../redux/features/material/materialApi";
import { IMaterial } from "../../../../types/material";

const { Option } = Select;

interface CreateMaterialModalProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const CreateMaterialModel: React.FC<CreateMaterialModalProps> = ({
  open,
  setOpen,
}) => {
  const [form] = Form.useForm<IMaterial>();
  const [availableRooms, setAvailableRooms] = useState<any[]>([]);
  // const [availableRacks, setAvailableRacks] = useState<any[]>([]); // Removed state
  const [selectedWarehouse, setSelectedWarehouse] = useState<string | null>(
    null,
  );
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [type, setType] = useState<string>("");

  const [openCategoryModal, setOpenCategoryModal] = useState(false);
  const [openUnitModal, setOpenUnitModal] = useState(false);

  const { data: categoriesData, isLoading: categoriesLoading } =
    useCategoryListQuery([{ name: "isActive", value: true }]);
  const { data: unitsData, isLoading: unitsLoading } = useUnitListQuery([
    { name: "isActive", value: true },
  ]);
  const [createMaterial, { isLoading }] = useCreateMaterialMutation();

  const categories = categoriesData?.data || [];
  const units = unitsData?.data || [];

  const { data: warehouseData, isLoading: warehouseLoading } =
    useWarehouseListQuery([
      { name: "limit", value: "500" },
      { name: "isActive", value: true },
    ]);
  const { data: supplierData, isLoading: supplierLoading } =
    useSupplierListQuery([
      { name: "limit", value: "500" },
      { name: "isActive", value: true },
      { name: "type", value: type },
    ]);
  const warehouses = warehouseData?.data?.data || [];
  const suppliers = supplierData?.data || [];

  const { data: singleWarehouseData } = useGetWarehouseByIdQuery(
    selectedWarehouse as string,
    { skip: !selectedWarehouse },
  );

  // Fetch Racks using hook
  const { data: racksData, isLoading: racksLoading } = useGetRacksByRoomIdQuery(
    selectedRoom as string,
    { skip: !selectedRoom },
  );
  const availableRacks = racksData?.data || [];

  // 🏢 warehouse change হলে rooms load হবে
  useEffect(() => {
    if (singleWarehouseData?.data?.rooms) {
      setAvailableRooms(singleWarehouseData.data.rooms);
    } else {
      setAvailableRooms([]);
    }
    // setAvailableRacks([]); // No longer needed
    setSelectedRoom(null);
  }, [singleWarehouseData]);

  // 🔄 room change হলে racks load হবে
  const handleRoomChange = (roomId: string) => {
    setSelectedRoom(roomId);
    form.setFieldsValue({ rackId: undefined });
  };

  const onFinish = async (values: any) => {
    try {
      const payload = {
        ...values,
        minStock: Number(values.minStock),
        currentStock: Number(values.currentStock),
        costPerUnit: Number(values.costPerUnit),
      };

      const res = await createMaterial(payload).unwrap();
      if (res.success) {
        toast.success(res?.message || "Material created successfully!");
        handleCancel();
      }
    } catch (err: any) {
      toast.error(err?.data?.message || "Something went wrong!");
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setOpen(false);
    setAvailableRooms([]);
    // setAvailableRacks([]);
    setSelectedWarehouse(null);
    setSelectedRoom(null);
  };

  return (
    <Modal
      open={open}
      onCancel={handleCancel}
      footer={false}
      width={900}
      style={{ top: 50 }}
      title={
        <div className="mb-6">
          <h1 className="text-2xl font-semibold mb-1 text-gray-800">
            Create Material
          </h1>
          <p className="text-sm text-gray-500">
            Add new material to your inventory
          </p>
        </div>
      }
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        size="middle"
        initialValues={{ isActive: true }}
      >
        {/* Basic Info */}
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              label="Material Name"
              name="name"
              rules={[
                { required: true, message: "Please enter material name!" },
              ]}
            >
              <Input placeholder="e.g., Sugar" />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item
              label="Type"
              name="type"
              rules={[
                { required: true, message: "Please select material type!" },
              ]}
            >
              <Select
                placeholder="Select type"
                onChange={(value) => {
                  setType(value);
                  form.setFieldsValue({ supplierId: undefined }); // Reset supplier on type change
                }}
              >
                <Option value="raw">Raw</Option>
                <Option value="packaging">Packaging</Option>
              </Select>
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item
              label={`${
                type === "raw" ? "Raw Material" : "Packaging Material"
              } Supplier`}
              name="supplierId"
              rules={[{ required: true, message: "Select supplier" }]}
            >
              <Select
                disabled={!type || supplierLoading}
                placeholder={`Select ${
                  type === "raw" ? "Raw Material" : "Packaging Material"
                } Supplier`}
                loading={supplierLoading}
              >
                {suppliers.map((s: { id: string; name: string }) => (
                  <Option key={s.id} value={s.id}>
                    {s.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          {/* Warehouse → Room → Rack */}
          <Col span={8}>
            <Form.Item
              label="Warehouse"
              name="warehouseId"
              rules={[{ required: true, message: "Select warehouse!" }]}
            >
              <Select
                placeholder="Select warehouse"
                onChange={(value) => {
                  setSelectedWarehouse(value);
                  form.setFieldsValue({ roomId: undefined, rackId: undefined }); // 🔥 Room & Rack clear
                  setAvailableRooms([]);
                  // setAvailableRacks([]);
                  setSelectedRoom(null);
                }}
                loading={warehouseLoading}
              >
                {warehouses.map((s: { id: string; name: string }) => (
                  <Option key={s.id} value={s.id}>
                    {s.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item label="Room" name="roomId">
              <Select
                placeholder="Select room"
                onChange={handleRoomChange}
                disabled={!selectedWarehouse}
              >
                {availableRooms?.map((room: any) => (
                  <Option key={room.id} value={room.id}>
                    {room.name ||
                      room.roomName ||
                      room.title ||
                      `Room ${room.id?.substring(0, 6)}`}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item label="Rack" name="rackId">
              <Select
                placeholder="Select rack"
                disabled={!selectedRoom}
                loading={racksLoading}
              >
                {availableRacks
                  ?.filter((r: any) => r.isActive)
                  ?.map((rk: any) => (
                    <Option key={rk.id} value={rk.id}>
                      {rk.name ||
                        rk.rackName ||
                        rk.title ||
                        `Rack ${rk.id?.substring(0, 6)}`}
                    </Option>
                  ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        {/* Category & Unit */}
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Category"
              name="categoryId"
              rules={[{ required: true, message: "Select category!" }]}
            >
              <Select
                placeholder="Select category"
                loading={categoriesLoading}
                showSearch
                optionFilterProp="children"
                dropdownRender={(menu) => (
                  <div>
                    <div className="p-2 border-b border-gray-100 mb-1">
                      <CustomActionButton
                        type="dashed"
                        onClick={() => setOpenCategoryModal(true)}
                        icon={<Plus className="w-4 h-4" />}
                        text="Add Category"
                        width="100%"
                      />
                    </div>
                    {menu}
                  </div>
                )}
              >
                {categories
                  .filter((c: { isActive: any }) => c.isActive)
                  .map((c: ICategory) => (
                    <Option key={c.id} value={c.id}>
                      {c.name}
                    </Option>
                  ))}
              </Select>
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="Unit"
              name="unitId"
              rules={[{ required: true, message: "Select unit!" }]}
            >
              <Select
                placeholder="Select unit"
                loading={unitsLoading}
                showSearch
                optionFilterProp="children"
                dropdownRender={(menu) => (
                  <div>
                    <div className="p-2 border-b border-gray-100 mb-1">
                      <CustomActionButton
                        type="dashed"
                        onClick={() => setOpenUnitModal(true)}
                        icon={<Plus className="w-4 h-4" />}
                        text="Add Unit"
                        width="100%"
                      />
                    </div>
                    {menu}
                  </div>
                )}
              >
                {units
                  .filter((u: { isActive: any }) => u.isActive)
                  .map((u: IUnit) => (
                    <Option key={u.id} value={u.id}>
                      {u.name} ({u.symbol})
                    </Option>
                  ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        {/* Stock Fields */}
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              label="Minimum Stock"
              name="minStock"
              rules={[
                { required: true, message: "Enter minimum stock!" },
                validatePositiveNumber("Minimum stock"),
              ]}
            >
              <InputNumber
                style={{ width: "100%" }}
                type="number"
                min={0}
                placeholder="e.g., 10"
              />
            </Form.Item>
          </Col>

          {/* <Col span={6}>
            <Form.Item
              label="Maximum Stock"
              name="maxStock"
              dependencies={["minStock"]}
              rules={[
                { required: true, message: "Enter maximum stock!" },
                validatePositiveNumber("Maximum stock"),
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    const min = getFieldValue("minStock");
                    if (
                      value !== undefined &&
                      min !== undefined &&
                      value < min
                    ) {
                      return Promise.reject(
                        new Error(
                          "Maximum stock cannot be less than minimum stock!"
                        )
                      );
                    }
                    return Promise.resolve();
                  },
                }),
              ]}
            >
              <InputNumber
                type="number"
                style={{ width: "100%" }}
                min={0}
                placeholder="e.g., 100"
              />
            </Form.Item>
          </Col> */}

          <Col span={8}>
            <Form.Item
              label="Current Stock"
              name="currentStock"
              dependencies={["minStock"]}
              rules={[
                { required: true, message: "Enter current stock!" },
                validatePositiveNumber("Current stock"),
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    const min = getFieldValue("minStock");
                    // const max = getFieldValue("maxStock");
                    if (
                      value !== undefined &&
                      min !== undefined &&
                      value < min
                    ) {
                      return Promise.reject(
                        new Error(
                          "Current stock must be greater than minimum and less than maximum!",
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
                min={0}
                placeholder="e.g., 50"
              />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item
              label="Cost Per Unit"
              name="costPerUnit"
              rules={[
                { required: true, message: "Enter cost per unit!" },
                validatePositiveNumber("Cost must be positive"),
              ]}
            >
              <InputNumber
                style={{ width: "100%" }}
                type="number"
                step="0.01"
                min={0}
                placeholder="e.g., 25.50"
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item label="Note" name="notes">
          <Input.TextArea
            placeholder="Enter Notes about this  material..."
            rows={3}
          />
        </Form.Item>

        <Form.Item label="Status" name="isActive" valuePropName="checked">
          <FormToggle defaultChecked size="default" />
        </Form.Item>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 mt-4">
          <Button onClick={handleCancel}>Cancel</Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={isLoading}
            style={{ background: "#ff3d0a", border: "none" }}
          >
            Create Material
          </Button>
        </div>
      </Form>

      {openCategoryModal && (
        <CreateCategoryModel
          open={openCategoryModal}
          setOpen={setOpenCategoryModal}
        />
      )}

      {openUnitModal && (
        <CreateUnitsModel open={openUnitModal} setOpen={setOpenUnitModal} />
      )}
    </Modal>
  );
};

export default CreateMaterialModel;
