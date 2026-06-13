import { Button, Card, Form, Input, InputNumber } from "antd";
import { useEffect } from "react";
import { toast } from "react-toastify";

import { Loader } from "../../../components/common/Loading";
import PageMeta from "../../../components/common/Meta/PageMeta";
import { useModulePermissions } from "../../../hooks/usePermissions";
import { useGetDynamicContentQuery } from "../../../redux/features/dynamicContent/dynamicContentApi";
import { useUpsertHomepageMutation } from "../../../redux/features/home/homeApi";

/* ===============================
    TYPES
================================ */
interface DeliveryChargeItem {
  title: string;
  amount: number;
}

interface DeliveryChargeFormValues {
  items: DeliveryChargeItem[];
}

const DeliveryCharge = () => {
  const [form] = Form.useForm<DeliveryChargeFormValues>();
  const [upsertContent, { isLoading }] = useUpsertHomepageMutation();
  const { data, isLoading: contentLoading } = useGetDynamicContentQuery([
    { name: "type", value: "home" },
  ]);

  const { hasUpdate } = useModulePermissions("Delivery Charge");

  const deliveryData = data?.data?.content?.delivery_charge;

  /* ===============================
      PRELOAD DATA
  ================================ */
  useEffect(() => {
    if (deliveryData) {
      let items: DeliveryChargeItem[] = [];

      if (Array.isArray(deliveryData)) {
        items = deliveryData;
      } else {
        // Fallback or migration if needed, though mostly we will initialize with array structure now
        // Default items if empty or not array yet (e.g. first time)
        items = [
          { title: "Inside Dhaka", amount: 60 },
          { title: "Outside Dhaka", amount: 120 },
        ];

        // If data exists in old format, map it (optional, depending on backend transition)
        if (
          typeof deliveryData === "object" &&
          deliveryData.inside_dhaka !== undefined
        ) {
          items = [
            { title: "Inside Dhaka", amount: deliveryData.inside_dhaka },
            { title: "Outside Dhaka", amount: deliveryData.outside_dhaka },
          ];
        } else if (Array.isArray(deliveryData) && deliveryData.length > 0) {
          items = deliveryData;
        }
      }

      form.setFieldsValue({
        items: items,
      });
    } else {
      // Default init when no data exists yet
      form.setFieldsValue({
        items: [
          { title: "Inside Dhaka", amount: 60 },
          { title: "Outside Dhaka", amount: 120 },
        ],
      });
    }
  }, [deliveryData, form]);

  /* ===============================
      SUBMIT
  ================================ */
  const onFinish = async (values: DeliveryChargeFormValues) => {
    try {
      const payload = {
        home: {
          delivery_charge: values.items,
        },
      };

      const res = await upsertContent(payload).unwrap();
      if (res?.success) {
        toast.success(res?.message || "Delivery Charge updated successfully");
      }
    } catch (error: any) {
      toast.error(error?.message || "Something went wrong");
    }
  };

  if (contentLoading) return <Loader />;

  return (
    <div>
      <PageMeta
        title="Delivery Charge | UserKotha.Shop ERP"
        description="Manage Delivery Charge"
      />

      <Card title="Delivery Charge Configuration">
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          className="space-y-4"
        >
          <Form.List name="items">
            {(fields) => (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {fields.map(({ key, name, fieldKey }) => (
                  <Card
                    key={key}
                    type="inner"
                    title={
                      name === 0
                        ? "Inside Dhaka Charge"
                        : name === 1
                          ? "Outside Dhaka Charge"
                          : `Charge Item ${name + 1}`
                    }
                  >
                    <Form.Item
                      label="Title"
                      name={[name, "title"]}
                      fieldKey={[fieldKey!, "title"]}
                      rules={[{ required: true, message: "Title is required" }]}
                    >
                      <Input placeholder="e.g. Inside Dhaka" />
                    </Form.Item>

                    <Form.Item
                      label="Amount"
                      name={[name, "amount"]}
                      fieldKey={[fieldKey!, "amount"]}
                      rules={[
                        { required: true, message: "Amount is required" },
                      ]}
                    >
                      <InputNumber
                        style={{ width: "100%" }}
                        placeholder="e.g. 60"
                        min={0}
                      />
                    </Form.Item>
                  </Card>
                ))}
              </div>
            )}
          </Form.List>

          {/* Save */}
          {hasUpdate && (
            <div className="flex justify-end mt-4">
              <Button
                type="primary"
                htmlType="submit"
                loading={isLoading || contentLoading}
              >
                Update Charges
              </Button>
            </div>
          )}
        </Form>
      </Card>
    </div>
  );
};

export default DeliveryCharge;
