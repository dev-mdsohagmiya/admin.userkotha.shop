import { Pagination } from "antd";

interface ReusablePaginationProps {
  page?: number;
  limit?: number;
  total?: number;
  onPageChange: (page: number, limit: number) => void;
}

const CustomPagination: React.FC<ReusablePaginationProps> = ({
  page,
  limit,
  total,
  onPageChange,
}) => {
  return (
    <div className="mt-5 flex justify-center items-center">
      <Pagination
        current={page}
        pageSize={limit}
        total={total}
        showSizeChanger
        onChange={(newPage, pageSize) => {
          onPageChange(newPage, pageSize);
        }}
       
      />
    </div>
  );
};

export default CustomPagination;
