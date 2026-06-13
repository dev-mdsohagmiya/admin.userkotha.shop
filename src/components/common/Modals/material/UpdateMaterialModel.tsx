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

import { useCategoryListQuery } from "../../../../redux/features/categories/categoriesApi";
import {
  useGetWarehouseByIdQuery,
  useWarehouseListQuery,
} from "../../../../redux/features/warehouses/warehousesApi";
import { useSupplierListQuery } from "../../../../redux/features/suppliers/suppliersApi";
import { ICategory } from "../../../../types/category";
import { IUnit } from "../../../../types/units";
import { validatePositiveNumber } from "../../../../utils/validatePositiveNumber";
import FormToggle from "../../Forms/SwitchStatus2";
import { useUnitListQuery } from "../../../../redux/features/units/unitsApi";
import { useUpdateMaterialMutation } from "../../../../redux/features/material/materialApi";
import { IMaterial } from "../../../../types/material";

const { Option } = Select;

interface UpdateRawMaterialModalProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  data?: IMaterial;
}

const UpdateMaterialModel: React.FC<UpdateRawMaterialModalProps> = ({
  open,
  setOpen,
  data,
}) => {
  const [form] = Form.useForm<IMaterial>();
  const [availableRooms, setAvailableRooms] = useState<any[]>([]);
  const [availableRacks, setAvailableRacks] = useState<any[]>([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState<string | null>(
    null,
  );
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);

  const [openCategoryModal, setOpenCategoryModal] = useState(false);
  const [openUnitModal, setOpenUnitModal] = useState(false);

  const [updateRawMaterial, { isLoading }] = useUpdateMaterialMutation();
  const [type, setType] = useState<string>(data?.type || "");
  // Fetch data
  const { data: categoriesData, isLoading: categoriesLoading } =
    useCategoryListQuery([{ name: "isActive", value: true }]);
  const { data: unitsData, isLoading: unitsLoading } = useUnitListQuery([
    { name: "isActive", value: true },
  ]);

  const { data: warehouseData, isLoading: warehouseLoading } =
    useWarehouseListQuery([{ name: "limit", value: "500" }]);
  const { data: supplierData, isLoading: supplierLoading } =
    useSupplierListQuery([{ name: "limit", value: "500" }]);

  const { data: singleWarehouseData } = useGetWarehouseByIdQuery(
    selectedWarehouse || "",
    { skip: !selectedWarehouse },
  );

  // Prepare options
  const categories = categoriesData?.data || [];
  const units = unitsData?.data || [];
  const warehouses = warehouseData?.data?.data || [];
  const suppliers = supplierData?.data || [];

  // Handle warehouse → room → rack dependencies
  useEffect(() => {
    if (singleWarehouseData?.data?.rooms) {
      setAvailableRooms(singleWarehouseData.data.rooms);
    } else {
      setAvailableRooms([]);
    }
    setAvailableRacks([]);
    setSelectedRoom(null);
  }, [singleWarehouseData]);

  const handleRoomChange = (roomId: string) => {
    setSelectedRoom(roomId);
    form.setFieldsValue({ rackId: undefined });

    const room = availableRooms.find((r) => r.id === roomId);
    setAvailableRacks(room?.racks || []);
  };

  useEffect(() => {
    if (open && data) {
      const wId = data.warehouseId || data.warehouse?.id || null;
      setSelectedWarehouse(wId);
      form.setFieldsValue({
        name: data.name,
        type: data.type,
        supplierId: data.supplierId || data.supplier?.id,
        warehouseId: wId,
        categoryId: data.categoryId || data.category?.id,
        unitId: data.unitId || data.unit?.id,
        minStock: Number(data.minStock ?? 0),
        // maxStock: data.maxStock,
        currentStock: Number(data.currentStock ?? 0),
        costPerUnit: Number(data.costPerUnit ?? 0),
        notes: data.notes,
        isActive: data.isActive,
      });
    } else {
      form.resetFields();
      setSelectedWarehouse(null);
      setSelectedRoom(null);
      setAvailableRooms([]);
      setAvailableRacks([]);
    }
  }, [open, data, form]);

  // তারপর availableRooms লোড হলে room set করো
  useEffect(() => {
    if (data && availableRooms.length > 0) {
      const rId = data.roomId || data.room?.id || null;
      setSelectedRoom(rId);
      form.setFieldsValue({ roomId: rId });
      if (rId) {
        const room = availableRooms.find((r) => r.id === rId);
        setAvailableRacks(room?.racks || []);
        form.setFieldsValue({ rackId: data.rackId || data.rack?.id });
      }
    }
  }, [availableRooms, data, form]);

  const handleCancel = () => {
    form.resetFields();
    setOpen(false);
    setSelectedWarehouse(null);
    setSelectedRoom(null);
    setAvailableRooms([]);
    setAvailableRacks([]);
  };

  const onFinish = async (values: any) => {
    try {
      const payload = {
        ...values,
        minStock: Number(values.minStock),
        currentStock: Number(values.currentStock),
        costPerUnit: Number(values.costPerUnit),
      };

      const res = await updateRawMaterial({
        id: data?.id,
        data: payload,
      }).unwrap();
      if (res?.success) {
        toast.success(res.message || "Material updated successfully!");
        handleCancel();
      }
    } catch (err: any) {
      toast.error(err?.data?.message || "Something went wrong!");
    }
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
            Update Material
          </h1>
          <p className="text-sm text-gray-500">
            Modify details of {data?.name || "this material"}
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
                onChange={(value) => setType(value)}
                placeholder="Select type"
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
        </Row>

        {/* Warehouse → Room → Rack */}
        <Row gutter={16}>
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
                  form.setFieldsValue({ roomId: undefined, rackId: undefined });
                  setAvailableRooms([]);
                  setAvailableRacks([]);
                  setSelectedRoom(null);
                }}
                loading={warehouseLoading}
              >
                {warehouses.map((w: any) => (
                  <Option key={w.id} value={w.id}>
                    {w.name}
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
                {availableRooms.map((r) => (
                  <Option key={r.id} value={r.id}>
                    {r.name ||
                      r.roomName ||
                      r.title ||
                      `Room ${r.id?.substring(0, 6)}`}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item label="Rack" name="rackId">
              <Select placeholder="Select rack" disabled={!selectedRoom}>
                {availableRacks
                  .filter((r) => r.isActive)
                  .map((r: any) => (
                    <Option key={r.id} value={r.id}>
                      {r.name ||
                        r.rackName ||
                        r.title ||
                        `Rack ${r.id?.substring(0, 6)}`}
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
                  .filter((c: any) => c.isActive)
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
                  .filter((u: IUnit) => u.isActive)
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
                min={0}
                type="number"
                placeholder="e.g., 10"
              />
            </Form.Item>
          </Col>
          {/* <Col span={6}>
            <Form.Item
              label="Maximum Stock"
              name="maxStock"
              rules={[
                { required: true, message: "Enter maximum stock!" },
                validatePositiveNumber("Maximum stock"),
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
              rules={[
                { required: true, message: "Enter current stock!" },
                validatePositiveNumber("Current stock"),
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

        {/* Buttons */}
        <div className="flex justify-end gap-3 mt-4">
          <Button onClick={handleCancel}>Cancel</Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={isLoading}
            style={{ background: "#ff3d0a", border: "none" }}
          >
            Update Material
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

export default UpdateMaterialModel;
