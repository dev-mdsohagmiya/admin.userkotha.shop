import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { Card, Col, Row } from "antd";

const SupplierDetailsSkeleton = () => {
  return (
    <div className="mx-auto animate-pulse">
      {/* Page Header Skeleton */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="w-full md:w-1/3">
          <Skeleton
            width="60%"
            height={28}
            className="mb-2 rounded-md"
            baseColor="#e0e0e0"
            highlightColor="#f5f5f5"
          />
          <Skeleton
            width="40%"
            height={16}
            borderRadius={4}
            baseColor="#e0e0e0"
            highlightColor="#f5f5f5"
          />
        </div>
        <div>
          <Skeleton
            width={120}
            height={36}
            borderRadius={4}
            baseColor="#e0e0e0"
            highlightColor="#f5f5f5"
          />
        </div>
      </div>

      {/* Summary Cards Skeleton */}
      <Row gutter={[16, 16]} className="mb-4">
        {[1, 2, 3].map((item) => (
          <Col xs={24} sm={8} key={item}>
            <div className="bg-white p-4 rounded-lg border border-gray-200 flex items-center gap-4">
              <Skeleton circle width={48} height={48} />
              <div className="flex-1">
                <Skeleton width="60%" height={16} className="mb-1" />
                <Skeleton width="40%" height={24} />
              </div>
            </div>
          </Col>
        ))}
      </Row>

      <Row gutter={[16, 16]}>
        {/* Supplier Info Skeleton */}
        <Col xs={24} lg={8}>
          <Card
            className="h-fit rounded-xl border border-gray-200"
            title={<Skeleton width={180} height={20} />}
          >
            <div className="flex flex-col gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i}>
                  <Skeleton width="30%" height={12} className="mb-1" />
                  <Skeleton width="70%" height={16} />
                </div>
              ))}
              <div className="mt-4">
                <Skeleton width="40%" height={20} className="mb-2" />
                <Skeleton count={3} />
              </div>
            </div>
          </Card>
        </Col>

        {/* Tabs and Table Skeleton */}
        <Col xs={24} lg={16}>
          <Card className="rounded-xl border border-gray-200">
            {/* Tabs Header */}
            <div className="flex gap-4 mb-4 border-b border-gray-200">
              <Skeleton width={120} height={40} />
              <Skeleton width={120} height={40} />
            </div>

            {/* Table Skeleton */}
            <div className="pb-2">
              <div className="flex justify-between mb-4 border-b border-gray-100 pb-3 px-2">
                <Skeleton width="10%" height={16} />
                <Skeleton width="20%" height={16} />
                <Skeleton width="20%" height={16} />
                <Skeleton width="20%" height={16} />
                <Skeleton width="20%" height={16} />
              </div>

              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="flex justify-between items-center py-3 border-b border-gray-50 last:border-0 px-2"
                >
                  <Skeleton width="10%" height={16} />
                  <Skeleton width="20%" height={16} />
                  <Skeleton width="20%" height={16} />
                  <Skeleton width="20%" height={16} />
                  <Skeleton width="20%" height={16} />
                </div>
              ))}
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default SupplierDetailsSkeleton;
