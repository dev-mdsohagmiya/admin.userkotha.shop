import { Button, Card, Checkbox, Col, Input, Modal, Row } from "antd";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { DESIGNATION_MODULE_ACTIONS } from "../../../../constants/designationModuleActions";
import { useDesignations } from "../../../../hooks/useDesignations";
import { IDesignation, IPermission } from "../../../../types/interfaces";

interface PermissionsModalProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  data: IDesignation;
}

const PermissionsModal: React.FC<PermissionsModalProps> = ({
  open,
  setOpen,
  data,
}) => {
  const [permissions, setPermissions] = useState<IPermission[]>([]);
  const { updateDesignation, updateDesignationLoading } = useDesignations();

  const moduleActions = DESIGNATION_MODULE_ACTIONS;

  const allModules = Object.keys(moduleActions);

  // Load previous permissions
  useEffect(() => {
    if (data && open) {
      setPermissions(data.permissions || []);
    }
  }, [data, open]);

  // Handle action update
  const handlePermissionChange = (
    module: string,
    action: string,
    checked: boolean,
  ) => {
    setPermissions((prev) => {
      const existing = prev.find((p) => p.module === module);
      if (existing) {
        const updated = checked
          ? [...existing.actions, action]
          : existing.actions.filter((a) => a !== action);
        return prev.map((p) =>
          p.module === module ? { ...p, actions: updated } : p,
        );
      } else {
        return [...prev, { module, actions: [action] }];
      }
    });
  };

  const isActionChecked = (module: string, action: string) => {
    const modulePerm = permissions.find((p) => p.module === module);
    return modulePerm?.actions.includes(action) || false;
  };

  // Select all actions for one module
  const handleModuleSelectAll = (module: string, checked: boolean) => {
    const actions = moduleActions[module];
    setPermissions((prev) => {
      if (checked) {
        const exists = prev.find((p) => p.module === module);
        if (exists) {
          return prev.map((p) =>
            p.module === module ? { ...p, actions: [...actions] } : p,
          );
        } else {
          return [...prev, { module, actions: [...actions] }];
        }
      } else {
        return prev.filter((p) => p.module !== module);
      }
    });
  };

  const isModuleFullySelected = (module: string) => {
    const actions = moduleActions[module];
    const modulePerm = permissions.find((p) => p.module === module);
    return modulePerm && modulePerm.actions.length === actions.length;
  };

  // Global select all
  const handleSelectAllPermissions = (checked: boolean) => {
    if (checked) {
      const all = allModules.map((module) => ({
        module,
        actions: [...moduleActions[module]],
      }));
      setPermissions(all);
    } else {
      setPermissions([]);
    }
  };

  const isAllPermissionsSelected = () => {
    return allModules.every((module) => isModuleFullySelected(module));
  };

  const handleCancel = () => {
    setPermissions(data.permissions || []);
    setOpen(false);
  };

  const handleUpdatePermissions = async () => {
    try {
      const res = await updateDesignation(data.id, { permissions });
      if (res.success) {
        toast.success("Permissions updated successfully");
        setOpen(false);
      }
    } catch {
      toast.error("Failed to update permissions");
    }
  };

  // Count functions
  const getSelectedActionsCount = (module: string) => {
    return moduleActions[module].filter((a) => isActionChecked(module, a))
      .length;
  };

  const getTotalSelectedPermissions = () => {
    return allModules.reduce((t, m) => t + getSelectedActionsCount(m), 0);
  };

  const getTotalAvailablePermissions = () => {
    return allModules.reduce((t, m) => t + moduleActions[m].length, 0);
  };

  // SEARCH STATE
  const [searchTerm, setSearchTerm] = useState("");

  // FILTERED MODULES (Case-insensitive)
  const filteredModules = allModules.filter((module) =>
    module.toLowerCase().includes(searchTerm),
  );

  return (
    <Modal
      open={open}
      onCancel={handleCancel}
      footer={null}
      width={900}
      title={
        <div className="flex justify-between items-center">
          <div>
            <div style={{ fontSize: 16, fontWeight: 600 }}>
              Manage Permissions
            </div>
            <div style={{ fontSize: 13, color: "#666" }}>
              Configure access for {data.name}
            </div>
          </div>

          {/* Search input */}
          <Input
            placeholder="Search modules..."
            prefix={<Search className="w-4 h-4 text-gray-500" />}
            allowClear
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value.toLowerCase())}
            style={{ width: 250, marginRight: "20px" }}
          />
        </div>
      }
    >
      {/* Global Controls */}
      <Card size="small" style={{ marginBottom: 16 }}>
        <div className="flex justify-between items-center">
          <Checkbox
            checked={isAllPermissionsSelected()}
            onChange={(e) => handleSelectAllPermissions(e.target.checked)}
          >
            Select all permissions
          </Checkbox>

          <div className="flex items-center gap-3">
            <div style={{ fontSize: 14 }}>
              {getTotalSelectedPermissions()} / {getTotalAvailablePermissions()}{" "}
              selected
            </div>

            <Button
              size="small"
              onClick={() => handleSelectAllPermissions(true)}
            >
              Select All
            </Button>

            <Button
              size="small"
              onClick={() => handleSelectAllPermissions(false)}
            >
              Clear All
            </Button>
          </div>
        </div>
      </Card>

      {/* MODULE GRID — Now using filteredModules */}
      <div style={{ maxHeight: 420, overflowY: "auto" }}>
        <Row gutter={[12, 12]}>
          {filteredModules.map((module) => (
            <Col xs={24} md={12} key={module}>
              <Card size="small">
                <div className="flex justify-between mb-2">
                  <div style={{ fontWeight: 600 }}>{module}</div>
                  <Checkbox
                    checked={isModuleFullySelected(module)}
                    indeterminate={
                      getSelectedActionsCount(module) > 0 &&
                      !isModuleFullySelected(module)
                    }
                    onChange={(e) =>
                      handleModuleSelectAll(module, e.target.checked)
                    }
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  {moduleActions[module].map((action) => {
                    const checked = isActionChecked(module, action);
                    return (
                      <div
                        key={action}
                        onClick={() =>
                          handlePermissionChange(module, action, !checked)
                        }
                        style={{
                          padding: "4px 8px",
                          borderRadius: 4,
                          background: checked ? "#1BA143" : "#f0f0f0",
                          color: checked ? "#fff" : "#000",
                          cursor: "pointer",
                          fontSize: 12,
                        }}
                      >
                        {action.charAt(0).toUpperCase() + action.slice(1)}
                      </div>
                    );
                  })}
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </div>

      {/* FOOTER */}
      <div className="flex justify-end mt-4 gap-3">
        <Button onClick={handleCancel}>Cancel</Button>
        <Button
          type="primary"
          loading={updateDesignationLoading}
          onClick={handleUpdatePermissions}
        >
          Update Permissions
        </Button>
      </div>
    </Modal>
  );
};

export default PermissionsModal;
