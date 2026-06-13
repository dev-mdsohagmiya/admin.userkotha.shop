import { DeleteOutlined, EditOutlined, MoreOutlined } from "@ant-design/icons";
import { Dropdown, Input, MenuProps } from "antd";
import React from "react";
import type { MenuInfo } from "rc-menu/lib/interface";
import { FcFolder } from "react-icons/fc";

interface FolderItemProps {
  name: string;
  path: string;
  onClick: (path: string) => void;
  onRename?: (path: string, newName: string) => void;
  onDelete?: (path: string) => void;
}

const FolderItem: React.FC<FolderItemProps> = ({
  name,
  path,
  onClick,
  onRename,
  onDelete,
}) => {
  const [isEditing, setIsEditing] = React.useState(false);
  const [newName, setNewName] = React.useState(name);

  React.useEffect(() => {
    setNewName(name);
  }, [name]);

  const handleRename = () => {
    if (isEditing) {
      if (newName.trim() && newName.trim() !== name && onRename) {
        onRename(path, newName.trim());
      }
      setIsEditing(false);
    }
  };

  const menuItems: NonNullable<MenuProps["items"]> = [
    ...(onRename
      ? [
          {
            key: "rename",
            label: "Rename",
            icon: <EditOutlined />,
            onClick: ({ domEvent }: MenuInfo) => {
              domEvent.stopPropagation();
              setNewName(name);
              setIsEditing(true);
            },
          },
        ]
      : []),
    ...(onDelete
      ? [
          {
            key: "delete",
            label: "Delete",
            icon: <DeleteOutlined />,
            danger: true,
            onClick: ({ domEvent }: MenuInfo) => {
              domEvent.stopPropagation();
              onDelete(path);
            },
          },
        ]
      : []),
  ];

  const showFolderMenu = menuItems.length > 0;

  return (
    <div
      className="group relative flex flex-col items-center justify-center w-full p-2 rounded-lg transition-all duration-200 border border-transparent hover:bg-gray-50 hover:border-gray-200 cursor-pointer"
      title={name}
      onClick={() => !isEditing && onClick(path)}
    >
      {showFolderMenu && (
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          <Dropdown
            menu={{ items: menuItems }}
            trigger={["hover"]}
            placement="bottomRight"
          >
            <div
              className="p-1 hover:bg-gray-200 rounded-full cursor-pointer"
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
            >
              <MoreOutlined className="text-gray-500" />
            </div>
          </Dropdown>
        </div>
      )}

      <div className="flex justify-center w-full transform transition-transform duration-300 group-hover:scale-105 mb-1">
        <FcFolder className="text-[72px] drop-shadow-sm" />
      </div>

      {isEditing ? (
        <Input
          size="small"
          autoFocus
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onPressEnter={handleRename}
          onBlur={handleRename}
          onClick={(e) => e.stopPropagation()}
          className="w-full text-xs text-center"
        />
      ) : (
        <h4 className="w-full font-medium -mt-2 text-gray-700 text-xs text-center truncate px-1 leading-relaxed">
          {name}
        </h4>
      )}
    </div>
  );
};

export default FolderItem;
