import React from "react";
import { Card, Skeleton, Space, Table } from "antd";

const ProductionRequisitionSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col gap-5 p-4">
      {/* Header Info Skeleton */}
      <Card size="small">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Skeleton.Input active size="small" style={{ width: 100 }} />
            <div className="mt-2">
              <Skeleton.Input active size="default" style={{ width: 200 }} />
            </div>
          </div>
          <div>
            <Skeleton.Input active size="small" style={{ width: 120 }} />
            <div className="mt-2">
              <Skeleton.Input active size="large" style={{ width: 150 }} />
            </div>
          </div>
        </div>
      </Card>

      {/* Variant Breakdown Skeleton */}
      <Card title={<Skeleton.Input active size="small" style={{ width: 150 }} />} size="small">
        <Table
          pagination={false}
          size="small"
          columns={[
            {
              title: <Skeleton.Input active size="small" style={{ width: 100 }} />,
              key: "1",
              render: () => <Skeleton.Input active size="small" style={{ width: "100%" }} />,
            },
            {
              title: <Skeleton.Input active size="small" style={{ width: 150 }} />,
              key: "2",
              render: () => <Skeleton.Input active size="small" style={{ width: "100%" }} />,
            },
          ]}
          dataSource={[1, 2].map((i) => ({ key: i }))}
        />
      </Card>

      {/* Product Variant Requirements Skeleton */}
      <Card title={<Skeleton.Input active size="small" style={{ width: 200 }} />} size="small">
        <div className="space-y-4">
          <Table
            pagination={false}
            size="small"
            columns={[
              { title: <Skeleton.Input active size="small" style={{ width: 120 }} />, key: "1" },
              { title: <Skeleton.Input active size="small" style={{ width: 80 }} />, key: "2" },
              { title: <Skeleton.Input active size="small" style={{ width: 100 }} />, key: "3" },
            ]}
            dataSource={[1, 2, 3].map((i) => ({ key: i }))}
          />
          <div className="bg-gray-50 p-3 rounded">
            <Space>
              <Skeleton.Input active size="small" style={{ width: 180 }} />
              <Skeleton.Input active size="small" style={{ width: 120 }} />
            </Space>
          </div>
        </div>
      </Card>

      {/* Additional Info Skeleton */}
      <Card title={<Skeleton.Input active size="small" style={{ width: 150 }} />} size="small">
        <div className="space-y-4">
          <div>
            <Skeleton.Input active size="small" style={{ width: 80 }} className="mb-2" />
            <Skeleton.Input active size="default" style={{ width: '100%' }} />
          </div>
          <div>
            <Skeleton.Input active size="small" style={{ width: 60 }} className="mb-2" />
            <Skeleton.Input active size="large" style={{ width: '100%', height: 80 }} />
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ProductionRequisitionSkeleton;
