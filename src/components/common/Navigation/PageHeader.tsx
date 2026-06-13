import { Breadcrumb, Divider } from "antd";
import { ReactNode } from "react";
import { Link } from "react-router-dom";

interface BreadcrumbItem {
  title: string;
  path?: string;
}

interface PageHeaderProps {
  title: string;
  subtitle?: ReactNode;
  breadcrumbs?: BreadcrumbItem[];
  extra?: ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  breadcrumbs = [],
  extra,
}) => {
  return (
    <div className="mb-4">
      {breadcrumbs.length > 0 && (
        <Breadcrumb
          className="mb-2 !mt-4"
          items={breadcrumbs.map((item, index) => {
            const isLast = index === breadcrumbs.length - 1;
            return {
              title:
                item.path && !isLast ? (
                  <Link to={item.path}>{item.title}</Link>
                ) : (
                  <span className={isLast ? "text-primary font-medium" : ""}>
                    {item.title}
                  </span>
                ),
            };
          })}
        />
      )}
      <div className="flex flex-col w-full md:flex-row sm:items-center justify-between">
        <div>
          <h2 className="!mb-0  !text-gray-800 text-xl font-semibold font-farro">
            {title}
          </h2>
          {subtitle && (
            <div className="text-gray-500 text-sm mt-1">{subtitle}</div>
          )}
        </div>
        {extra && <div className="flex gap-3">{extra}</div>}
      </div>
      <Divider className="my-4" />
    </div>
  );
};

export default PageHeader;
