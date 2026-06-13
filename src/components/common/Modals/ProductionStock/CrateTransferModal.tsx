import { Button, Card, Form, Input, InputNumber, Modal, Select } from "antd";
import React, { useEffect, useState } from "react";
import { IoClose } from "react-icons/io5";
import { toast } from "react-toastify";
import { useCreateProductionTransfersMutation } from "../../../../redux/features/production/productionApi";
import {
  useGetRacksByRoomIdQuery,
  useGetRoomsByWarehouseIdQuery,
  useWarehouseListQuery,
} from "../../../../redux/features/warehouses/warehousesApi";
import { TransferFormProps } from "../../../../types/production";

const CreateTransferModal: React.FC<TransferFormProps> = ({
  open,
  setOpen,
  data,
  bulkData,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const [selectedRoomsByItem, setSelectedRoomsByItem] = useState<{
    [key: number]: string;
  }>({});

  // Fetch warehouses
  const { data: warehousesResponse, isLoading: warehousesLoading } =
    useWarehouseListQuery([]);

  // Create transfer mutation
  const [createTransfers, { isLoading: isCreating }] =
    useCreateProductionTransfersMutation();

  const warehouses = warehousesResponse?.data?.data || [];

  // Initialize form with bulk data or single data
  useEffect(() => {
    if (open) {
      if (bulkData && bulkData.length > 0) {
        // Multiple items selected
        const items = bulkData.map((item) => ({
          variantId: item.variantId,
          productName: item.productName,
          variantName: item.variant.name,
          sku: item.variant.sku,
          maxQty: item.availableQty,
          quantity: item.availableQty,
          warehouseId: "",
          roomId: "",
          rackId: "",
        }));
        form.setFieldsValue({ items });
      } else if (data) {
        // Single item
        form.setFieldsValue({
          items: [
            {
              variantId: data.variantId,
              productName: data.productName,
              variantName: data.variant.name,
              sku: data.variant.sku,
              maxQty: data.availableQty,
              quantity: data.availableQty,
              warehouseId: "",
              roomId: "",
              rackId: "",
            },
          ],
        });
      }
    }
  }, [open, data, bulkData, form]);

  const handleRoomChange = (itemIndex: number, roomId: string) => {
    setSelectedRoomsByItem((prev) => ({
      ...prev,
      [itemIndex]: roomId,
    }));
  };

  const onFinish = async (values: any) => {
    try {
      // Transform form values to API format
      const payload = values.items.map((item: any) => ({
        variantId: item.variantId,
        quantity: item.quantity,
        warehouseId: item.warehouseId,
        roomId: item.roomId || "",
        rackId: item.rackId || "",
      }));

      await createTransfers(payload).unwrap();
      toast.success("Transfer created successfully!");
      setOpen(false);
      form.resetFields();
      setSelectedRoomsByItem({});
      if (onSuccess) onSuccess();
    } catch (error: any) {
      toast.error(
        error?.data?.message || "Failed to create transfer. Please try again.",
      );
    }
  };

  return (
    <Modal
      open={open}
      onCancel={() => {
        setOpen(false);
        form.resetFields();
        setSelectedRoomsByItem({});
      }}
      footer={false}
      width={900}
    >
      <div className="mb-3">
        <h1 className="text-2xl font-semibold mb-1 text-gray-800 dark:text-white/90">
          Transfer to Warehouse
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Transfer production stock to warehouse inventory
        </p>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{
          items: [{}],
        }}
      >
        {/* Items Section */}
        <Form.List name="items">
          {(fields, { remove }) => (
            <Card title="Items to Transfer" className="space-y-3 mb-4">
              {fields.map(({ key, name, ...restField }) => {
                const itemValues = form.getFieldValue(["items", name]);

                return (
                  <Card
                    style={{ paddingBottom: "0px" }}
                    className="mb-5!"
                    key={key}
                    title={
                      <div>
                        <div className="font-semibold">
                          {itemValues?.productName || `Item ${key + 1}`}
                        </div>
                        <div className="text-sm font-normal text-gray-500">
                          {itemValues?.variantName &&
                            `Variant: ${itemValues.variantName}`}
                          {itemValues?.sku && ` | SKU: ${itemValues.sku}`}
                          {itemValues?.maxQty &&
                            ` | Available: ${itemValues.maxQty}`}
                        </div>
                      </div>
                    }
                    extra={
                      fields.length > 1 && (
                        <Button
                          type="text"
                          danger
                          icon={<IoClose />}
                          onClick={() => remove(name)}
                        />
                      )
                    }
                  >
                    {/* Hidden fields for data */}
                    <Form.Item {...restField} name={[name, "variantId"]} hidden>
                      <Input />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, "productName"]}
                      hidden
                    >
                      <Input />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, "variantName"]}
                      hidden
                    >
                      <Input />
                    </Form.Item>
                    <Form.Item {...restField} name={[name, "sku"]} hidden>
                      <Input />
                    </Form.Item>
                    <Form.Item {...restField} name={[name, "maxQty"]} hidden>
                      <InputNumber />
                    </Form.Item>

                    <div className="grid -mb-5! grid-cols-1 md:grid-cols-2 gap-4">
                      <Form.Item
                        {...restField}
                        name={[name, "quantity"]}
                        label="Quantity"
                        rules={[
                          { required: true, message: "Enter quantity!" },
                          {
                            validator: (_, value) => {
                              const maxQty = form.getFieldValue([
                                "items",
                                name,
                                "maxQty",
                              ]);
                              if (value && maxQty && value > maxQty) {
                                return Promise.reject(
                                  `Maximum available: ${maxQty}`,
                                );
                              }
                              if (value && value <= 0) {
                                return Promise.reject(
                                  "Quantity must be greater than 0",
                                );
                              }
                              return Promise.resolve();
                            },
                          },
                        ]}
                      >
                        <InputNumber
                          min={1}
                          style={{ width: "100%" }}
                          placeholder="Enter quantity"
                        />
                      </Form.Item>

                      <Form.Item
                        {...restField}
                        name={[name, "warehouseId"]}
                        label="Warehouse"
                        rules={[
                          { required: true, message: "Select warehouse!" },
                        ]}
                      >
                        <Select
                          placeholder="Select warehouse"
                          loading={warehousesLoading}
                          onChange={() => {
                            // Reset room and rack when warehouse changes
                            form.setFieldValue(
                              ["items", name, "roomId"],
                              undefined,
                            );
                            form.setFieldValue(
                              ["items", name, "rackId"],
                              undefined,
                            );
                            setSelectedRoomsByItem((prev) => ({
                              ...prev,
                              [name]: "",
                            }));
                          }}
                          showSearch
                          optionFilterProp="children"
                        >
                          {Array.isArray(warehouses) &&
                            warehouses.map((warehouse: any) => (
                              <Select.Option
                                key={warehouse.id}
                                value={warehouse.id}
                              >
                                {warehouse.name}
                              </Select.Option>
                            ))}
                        </Select>
                      </Form.Item>

                      <RoomSelect
                        warehouseId={form.getFieldValue([
                          "items",
                          name,
                          "warehouseId",
                        ])}
                        name={name}
                        restField={restField}
                        form={form}
                        onRoomChange={(roomId) =>
                          handleRoomChange(name, roomId)
                        }
                      />

                      <RackSelect
                        roomId={
                          selectedRoomsByItem[name] ||
                          form.getFieldValue(["items", name, "roomId"])
                        }
                        name={name}
                        restField={restField}
                      />
                    </div>
                  </Card>
                );
              })}
            </Card>
          )}
        </Form.List>

        {/* Footer Buttons */}
        <div className="flex justify-end gap-2 mt-4">
          <Button
            onClick={() => {
              setOpen(false);
              form.resetFields();
              setSelectedRoomsByItem({});
            }}
            type="default"
            htmlType="button"
            className="px-5!"
          >
            Cancel
          </Button>

          <Button
            type="primary"
            htmlType="submit"
            className="px-5!"
            loading={isCreating}
          >
            Transfer
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

// Room Select Component
const RoomSelect: React.FC<{
  warehouseId: string;
  name: number;
  restField: any;
  form: any;
  onRoomChange: (roomId: string) => void;
}> = ({ warehouseId, name, restField, form, onRoomChange }) => {
  const { data: roomsResponse, isLoading } = useGetRoomsByWarehouseIdQuery(
    warehouseId,
    {
      skip: !warehouseId,
    },
  );

  // Handle different possible response structures
  const rooms = roomsResponse?.data?.data || roomsResponse?.data || [];

  return (
    <Form.Item {...restField} name={[name, "roomId"]} label="Room (Optional)">
      <Select
        placeholder="Select room"
        loading={isLoading}
        disabled={!warehouseId}
        allowClear
        showSearch
        optionFilterProp="children"
        onChange={(value) => {
          // Reset rack when room changes
          form.setFieldValue(["items", name, "rackId"], undefined);
          onRoomChange(value || "");
        }}
      >
        {Array.isArray(rooms) &&
          rooms.map((room: any) => (
            <Select.Option key={room.id} value={room.id}>
              {room.name}
            </Select.Option>
          ))}
      </Select>
    </Form.Item>
  );
};

// Rack Select Component
const RackSelect: React.FC<{
  roomId: string;
  name: number;
  restField: any;
}> = ({ roomId, name, restField }) => {
  const { data: racksResponse, isLoading } = useGetRacksByRoomIdQuery(roomId, {
    skip: !roomId,
  });

  // Handle different possible response structures
  const racks = racksResponse?.data?.data || racksResponse?.data || [];

  return (
    <Form.Item {...restField} name={[name, "rackId"]} label="Rack (Optional)">
      <Select
        placeholder="Select rack"
        loading={isLoading}
        disabled={!roomId}
        allowClear
        showSearch
        optionFilterProp="children"
      >
        {Array.isArray(racks) &&
          racks.map((rack: any) => (
            <Select.Option key={rack.id} value={rack.id}>
              {rack.name}
            </Select.Option>
          ))}
      </Select>
    </Form.Item>
  );
};

export default CreateTransferModal;
