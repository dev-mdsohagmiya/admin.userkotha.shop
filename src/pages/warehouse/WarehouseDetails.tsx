// components/pages/WarehouseDetails.tsx
import {
  Button,
  Card,
  Col,
  Empty,
  Row,
  Space,
  Tabs,
  Tag,
  Typography,
} from "antd";
import { Edit3 } from "lucide-react";
import {
  JSXElementConstructor,
  ReactElement,
  ReactNode,
  ReactPortal,
  useEffect,
  useState,
} from "react";
import { useNavigate, useParams } from "react-router-dom";
import CustomActionButton from "../../components/common/Button/CustomActionButton";
import { Loader } from "../../components/common/Loading";
import PageMeta from "../../components/common/Meta/PageMeta";
import CreateOrUpdateWarehouseModal from "../../components/common/Modals/CreateOrUpdateWarehouseModal";
import PageHeader from "../../components/common/Navigation/PageHeader";
import { useModulePermissions } from "../../hooks/usePermissions";
import { useGetWarehouseByIdQuery } from "../../redux/features/warehouses/warehousesApi";

const { Text } = Typography;

const WarehouseDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("");
  const { hasUpdate } = useModulePermissions("Warehouses");
  const {
    data: warehouseResponse,
    isLoading,
    isFetching,
  } = useGetWarehouseByIdQuery(id!);
  const warehouse = warehouseResponse?.data;

  // Set active tab to first room when data is loaded
  useEffect(() => {
    if (warehouse?.rooms && warehouse.rooms.length > 0) {
      setActiveTab(String(warehouse.rooms[0].id));
    }
  }, [warehouse]);

  if (isLoading || isFetching) {
    return <Loader />;
  }

  if (!warehouse) {
    return (
      <div className="flex flex-col justify-center items-center h-64 space-y-4">
        <Empty description="Warehouse not found" />
        <Button onClick={() => navigate("/warehouses")}>
          Back to Warehouses
        </Button>
      </div>
    );
  }

  const roomsData =
    warehouse?.rooms?.map((room: any) => ({
      ...room,
      key: room.id,
      rackCount: room.racks?.length || 0,
      shelfCount:
        room.racks?.reduce(
          (total: number, rack: any) => total + (rack.shelves?.length || 0),
          0,
        ) || 0,
    })) || [];

  // Ensure activeTab is set to first room if not set
  const effectiveActiveTab =
    activeTab || (roomsData[0]?.key ? String(roomsData[0].key) : "1");

  return (
    <div className="bg-gray-50 min-h-screen">
      <PageMeta
        title={`${warehouse?.name} | Warehouse Details`}
        description={`Warehouse details for ${warehouse?.name} - ${warehouse?.location}`}
      />

      <PageHeader
        title={warehouse?.name}
        subtitle={warehouse?.location || "Location not specified"}
        breadcrumbs={[
          { title: "Dashboard", path: "/" },
          { title: "Warehouses", path: "/warehouses" },
          { title: warehouse?.name },
        ]}
        extra={
          <Space>
            <Button onClick={() => navigate("/warehouses")}>
              Back to List
            </Button>
            {hasUpdate && (
              <CustomActionButton
                onClick={() => setOpenCreateModal(true)}
                text="Edit"
                type="primary"
                icon={<Edit3 size={16} />}
              />
            )}
          </Space>
        }
      />

      <Card
        className="!my-3 rounded-lg border-0 p-4 bg-white"
        size="small"
        title={
          <Text strong className="text-gray-700 text-lg">
            Basic Information
          </Text>
        }
      >
        <Row gutter={[16, 16]}>
          {[
            { label: "Name", value: warehouse?.name },
            { label: "Location", value: warehouse?.location },
            { label: "Manager", value: warehouse?.manager?.name },
            {
              label: "Capacity",
              value: warehouse?.capacity
                ? `${warehouse?.capacity} sq ft`
                : null,
            },
            {
              label: "Status",
              value: (
                <Tag
                  color={warehouse.isActive ? "green" : "red"}
                  className="px-2 py-1 rounded-md font-medium text-sm"
                >
                  {warehouse.isActive ? "Active" : "Inactive"}
                </Tag>
              ),
            },
            {
              label: "Created",
              value: new Date(warehouse.createdAt).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              }),
            },
            {
              label: "Updated",
              value: new Date(warehouse.updatedAt).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              }),
            },
          ].map((item, i) => (
            <Col xs={24} sm={12} md={8} lg={6} key={i}>
              <div>
                <Text strong className="text-gray-600 text-sm">
                  {item.label}
                </Text>
                <div className="mt-1">
                  {item.value || (
                    <Text type="secondary" className="text-xs">
                      Not specified
                    </Text>
                  )}
                </div>
              </div>
            </Col>
          ))}
        </Row>
      </Card>

      <Card
        className="mt-4 border rounded-lg !border-orange-50 bg-white"
        size="small"
      >
        <Tabs
          activeKey={effectiveActiveTab}
          onChange={(key) => setActiveTab(key)}
          className="custom-tabs"
          items={[
            ...roomsData.map(
              (room: {
                id: any;
                name:
                  | string
                  | number
                  | bigint
                  | boolean
                  | ReactElement<unknown, string | JSXElementConstructor<any>>
                  | Iterable<ReactNode>
                  | Promise<
                      | string
                      | number
                      | bigint
                      | boolean
                      | ReactPortal
                      | ReactElement<
                          unknown,
                          string | JSXElementConstructor<any>
                        >
                      | Iterable<ReactNode>
                      | null
                      | undefined
                    >
                  | null
                  | undefined;
                rackCount:
                  | string
                  | number
                  | bigint
                  | boolean
                  | ReactElement<unknown, string | JSXElementConstructor<any>>
                  | Iterable<ReactNode>
                  | Promise<
                      | string
                      | number
                      | bigint
                      | boolean
                      | ReactPortal
                      | ReactElement<
                          unknown,
                          string | JSXElementConstructor<any>
                        >
                      | Iterable<ReactNode>
                      | null
                      | undefined
                    >
                  | null
                  | undefined;
                racks: any[];
              }) => ({
                key: String(room.id),
                label: (
                  <Space className="flex items-center" size="small">
                    <Text className="text-sm font-medium !text-primary">
                      {room.name}
                    </Text>
                    <Text className="text-sm font-medium !text-primary">
                      {room.rackCount} {room.rackCount === 1 ? "Rack" : "Racks"}
                    </Text>
                  </Space>
                ),
                children: (
                  <div className="mt-4">
                    {room.racks && room.racks.length > 0 ? (
                      <div className="grid grid-cols-3 gap-4">
                        {room.racks.map((rack: any, idx: number) => (
                          <Card
                            key={rack.id || idx}
                            className="p-4  rounded-lg !border  transition cursor-pointer"
                            onClick={() => {
                              // Navigate to rack details or show rack shelves
                            }}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <Text
                                  strong
                                  className="text-base text-gray-900"
                                >
                                  {rack.name}
                                </Text>
                                {rack.description && (
                                  <Text
                                    type="secondary"
                                    className="text-sm text-gray-500 block mt-1"
                                  >
                                    {rack.description}
                                  </Text>
                                )}
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <Empty
                        description="No racks found in this room"
                        className="py-8"
                      />
                    )}
                  </div>
                ),
              }),
            ),
            ...(roomsData.length === 0
              ? [
                  {
                    key: "no-rooms",
                    label: "No Rooms",
                    children: (
                      <div className="py-8">
                        <Empty description="No rooms available in this warehouse" />
                      </div>
                    ),
                  },
                ]
              : []),
          ]}
        />
      </Card>

      {openCreateModal && (
        <CreateOrUpdateWarehouseModal
          open={openCreateModal}
          setOpen={setOpenCreateModal}
          editData={warehouse}
        />
      )}
    </div>
  );
};

export default WarehouseDetails;
