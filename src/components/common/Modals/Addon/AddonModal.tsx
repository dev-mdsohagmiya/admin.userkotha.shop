import { Button, Form, Input, InputNumber, Modal, Select, Switch } from "antd";
import { useEffect, useState, useMemo } from "react";
import { toast } from "react-toastify";
import {
  useCreateAddonMutation,
  useUpdateAddonMutation,
} from "../../../../redux/features/addon/addonApi";
import { useGetEcommerceProductListQuery } from "../../../../redux/features/product/productApi";
import { useGetComboProductByIdQuery } from "../../../../redux/features/comboProduct/comboProductApi";
import { IAddon } from "../../../../types/addon";
import { IProductData } from "../../../../types/product";
import { IComboProductData } from "../../../../types/comboProduct";

interface AddonModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  addonData?: IAddon | null;
  defaultSourceProductId?: string;
  defaultSourceComboProductId?: string;
}

const AddonModal = ({
  open,
  setOpen,
  addonData,
  defaultSourceProductId,
  defaultSourceComboProductId,
}: AddonModalProps) => {
  const [form] = Form.useForm();
  const [createAddon, { isLoading: isCreating }] = useCreateAddonMutation();
  const [updateAddon, { isLoading: isUpdating }] = useUpdateAddonMutation();

  // Fetch products for dropdowns
  const { data: productData, isLoading: isLoadingProducts } =
    useGetEcommerceProductListQuery([{ name: "limit", value: 100000 }]);

  // Fetch combo product if ID provided
  const { data: comboProductData } = useGetComboProductByIdQuery(
    defaultSourceComboProductId as string,
    {
      skip: !defaultSourceComboProductId,
    },
  );

  const products: IProductData[] = useMemo(
    () => productData?.data || [],
    [productData],
  );

  // States to manage selected product variants
  const [selectedSourceProduct, setSelectedSourceProduct] = useState<
    IProductData | IComboProductData | undefined
  >(undefined);
  const [selectedAddonProduct, setSelectedAddonProduct] = useState<
    IProductData | IComboProductData | undefined
  >(undefined);

  useEffect(() => {
    if (addonData && products.length > 0) {
      // Determine if source is combo or regular
      const isSourceCombo = !!addonData.comboProductId;
      const isAddonCombo = !!addonData.addonComboVariantId;

      // Pre-fill form with correct field names
      const formValues: any = {
        priority: addonData.priority,
        offerLabel: addonData.offerLabel,
        matchDiscount: addonData.matchDiscount,
        matchDeliveryOffer: addonData.matchDeliveryOffer,
        isActive: addonData.isActive,
        sourceProductId: addonData.productId || addonData.comboProductId,
      };

      // Set variant field based on source type
      if (isSourceCombo) {
        formValues.comboVariantId = addonData.comboVariantId;
      } else {
        formValues.productVariantId = addonData.productVariantId;
      }

      // Set addon variant field based on addon type
      if (isAddonCombo) {
        formValues.addonComboVariantId = addonData.addonComboVariantId;
      } else {
        formValues.addonProductVariantId = addonData.addonProductVariantId;
      }

      form.setFieldsValue(formValues);

      // Find and set selected source product (regular or combo)
      if (addonData.productId) {
        const sourceProd = products.find((p) => p.id === addonData.productId);
        if (sourceProd) setSelectedSourceProduct(sourceProd);
      } else if (addonData.comboProductId) {
        // If editing a combo addon, and we have the combo product data loaded (via default prop)
        if (
          comboProductData?.data &&
          comboProductData.data.id === addonData.comboProductId
        ) {
          const comboProd = {
            ...comboProductData.data,
            productType: "combo" as const,
          };
          setSelectedSourceProduct(comboProd);
        }
      }

      // Attempt to find product of addon variant (check both regular and combo)
      const addonProd = products.find((p) =>
        p.variants?.some(
          (v) =>
            v.id === addonData.addonProductVariantId ||
            v.id === addonData.addonComboVariantId,
        ),
      );
      if (addonProd) {
        setSelectedAddonProduct(addonProd);
        form.setFieldValue("addonProductId", addonProd.id);
      }
    } else if (open) {
      form.resetFields();
      form.setFieldsValue({
        isActive: true,
        matchDiscount: false,
        matchDeliveryOffer: false,
        priority: 0,
      });
      setSelectedSourceProduct(undefined);
      setSelectedAddonProduct(undefined);

      // Handle default source product (Regular)
      if (defaultSourceProductId && products.length > 0) {
        const defaultProd = products.find(
          (p) => p.id === defaultSourceProductId,
        );
        if (defaultProd) {
          form.setFieldValue("sourceProductId", defaultSourceProductId);
          setSelectedSourceProduct(defaultProd);
        }
      }

      // Handle default source combo product
      if (defaultSourceComboProductId && comboProductData?.data) {
        const comboProd = {
          ...comboProductData.data,
          productType: "combo" as const,
        };
        form.setFieldValue("sourceProductId", defaultSourceComboProductId);
        setSelectedSourceProduct(comboProd);
      }
    }
  }, [
    addonData,
    products,
    form,
    open,
    defaultSourceProductId,
    defaultSourceComboProductId,
    comboProductData,
  ]);

  const handleSourceProductChange = (productId: string) => {
    // Check in products list first
    const prod = products.find((p) => p.id === productId);
    setSelectedSourceProduct(prod);
    // Reset both variant fields when product changes
    form.setFieldValue("productVariantId", undefined);
    form.setFieldValue("comboVariantId", undefined);
  };

  const handleAddonProductChange = (productId: string) => {
    const prod = products.find((p) => p.id === productId);
    setSelectedAddonProduct(prod);
    // Reset both variant fields when product changes
    form.setFieldValue("addonProductVariantId", undefined);
    form.setFieldValue("addonComboVariantId", undefined);
  };

  const onFinish = async (values: any) => {
    // Determine if source is a combo product or regular product
    const isSourceCombo = selectedSourceProduct?.productType === "combo";

    // Determine if addon product is combo or regular
    const isAddonCombo = selectedAddonProduct?.productType === "combo";

    const payload: any = {
      priority: values.priority,
      offerLabel: values.offerLabel,
      matchDiscount: values.matchDiscount || false,
      matchDeliveryOffer: values.matchDeliveryOffer || false,
      isActive: values.isActive,
    };

    // Set source product fields based on type
    if (isSourceCombo) {
      payload.comboProductId = values.sourceProductId;
      payload.comboVariantId = values.comboVariantId;
    } else {
      payload.productId = values.sourceProductId;
      payload.productVariantId = values.productVariantId;
    }

    // Set addon product variant field based on type
    if (isAddonCombo) {
      payload.addonComboVariantId = values.addonComboVariantId;
    } else {
      payload.addonProductVariantId = values.addonProductVariantId;
    }



    try {
      if (addonData) {
        await updateAddon({ id: addonData.id, data: payload }).unwrap();
        toast.success("Addon updated successfully");
      } else {
        await createAddon(payload).unwrap();
        toast.success("Addon created successfully");
      }
      setOpen(false);
      form.resetFields();
    } catch (error: any) {
      toast.error(error?.data?.message || "Something went wrong");
    }
  };

  return (
    <Modal
      open={open}
      onCancel={() => setOpen(false)}
      title={addonData ? "Update Addon" : "Create Addon"}
      footer={null}
      width={700}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{ isActive: true }}
      >
        <div className="grid grid-cols-2 gap-4">
          {/* Source Product Section */}
          <div className="col-span-2 md:col-span-1">
            <Form.Item
              label="Source Product"
              name="sourceProductId"
              rules={[{ required: true, message: "Required" }]}
            >
              <Select
                showSearch
                optionFilterProp="children"
                loading={isLoadingProducts}
                onChange={handleSourceProductChange}
                placeholder="Select Product"
                disabled={
                  (!!defaultSourceProductId || !!defaultSourceComboProductId) &&
                  !addonData
                }
              >
                {/* Check if we have a default combo product to display */}
                {defaultSourceComboProductId && selectedSourceProduct && (
                  <Select.Option
                    key={selectedSourceProduct.id}
                    value={selectedSourceProduct.id}
                  >
                    {selectedSourceProduct.name} (Combo)
                  </Select.Option>
                )}

                {/* Filter out the selected addon product */}
                {products
                  .filter((p) => p.id !== selectedAddonProduct?.id)
                  .map((p) => (
                    <Select.Option key={p.id} value={p.id}>
                      {p.name}
                    </Select.Option>
                  ))}
              </Select>
            </Form.Item>
          </div>
          <div className="col-span-2 md:col-span-1">
            {/* Conditional rendering based on source product type */}
            {selectedSourceProduct?.productType === "combo" ? (
              <Form.Item
                label="Source Combo Variant"
                name="comboVariantId"
                rules={[{ required: true, message: "Required" }]}
              >
                <Select
                  showSearch
                  optionFilterProp="children"
                  placeholder="Select Combo Variant"
                  disabled={!selectedSourceProduct}
                >
                  {selectedSourceProduct?.variants?.map((v: any) => (
                    <Select.Option key={v.id} value={v.id}>
                      {v.name || `Variant ${v.id}`}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            ) : (
              <Form.Item
                label="Source Product Variant"
                name="productVariantId"
                rules={[{ required: true, message: "Required" }]}
              >
                <Select
                  showSearch
                  optionFilterProp="children"
                  placeholder="Select Product Variant"
                  disabled={!selectedSourceProduct}
                >
                  {selectedSourceProduct?.variants?.map((v: any) => (
                    <Select.Option key={v.id} value={v.id}>
                      {v.unit?.name ||
                        v.variantName ||
                        v.name ||
                        `Variant ${v.id}`}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            )}
          </div>

          {/* Addon Product Section */}
          <div className="col-span-2 md:col-span-1">
            <Form.Item
              label="Addon Product"
              name="addonProductId" // Virtual field helper
              rules={[{ required: true, message: "Required" }]}
            >
              <Select
                showSearch
                optionFilterProp="children"
                loading={isLoadingProducts}
                onChange={handleAddonProductChange}
                placeholder="Select Product"
              >
                {/* Filter out the source product (if it's a regular product, not combo) */}
                {products
                  .filter((p) => {
                    // Get the source product ID from form or selected state
                    const sourceProductId =
                      form.getFieldValue("sourceProductId") ||
                      defaultSourceProductId;
                    // Don't show the source product in addon list
                    return p.id !== sourceProductId;
                  })
                  .map((p) => (
                    <Select.Option key={p.id} value={p.id}>
                      {p.name}
                    </Select.Option>
                  ))}
              </Select>
            </Form.Item>
          </div>
          <div className="col-span-2 md:col-span-1">
            {/* Conditional rendering based on product type */}
            {selectedAddonProduct?.productType === "combo" ? (
              <Form.Item
                label="Addon Combo Variant"
                name="addonComboVariantId"
                rules={[{ required: true, message: "Required" }]}
              >
                <Select
                  showSearch
                  optionFilterProp="children"
                  placeholder="Select Combo Variant"
                  disabled={!selectedAddonProduct}
                >
                  {selectedAddonProduct?.variants?.map((v: any) => (
                    <Select.Option key={v.id} value={v.id}>
                      {v.name || `Variant ${v.id}`}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            ) : (
              <Form.Item
                label="Addon Product Variant"
                name="addonProductVariantId"
                rules={[{ required: true, message: "Required" }]}
              >
                <Select
                  showSearch
                  optionFilterProp="children"
                  placeholder="Select Product Variant"
                  disabled={!selectedAddonProduct}
                >
                  {selectedAddonProduct?.variants?.map((v: any) => (
                    <Select.Option key={v.id} value={v.id}>
                      {v.unit?.name ||
                        v.variantName ||
                        v.name ||
                        `Variant ${v.id}`}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            )}
          </div>
        </div>

        <Form.Item
          label="Offer Label"
          name="offerLabel"
          tooltip="Text to show, e.g. 'Get this for 50% off'"
        >
          <Input placeholder="e.g. Special Offer" />
        </Form.Item>

        <div className="grid grid-cols-2 gap-4">
          <Form.Item label="Priority" name="priority" initialValue={0}>
            <InputNumber min={0} className="w-full" />
          </Form.Item>

          <Form.Item label="Is Active" name="isActive" valuePropName="checked">
            <Switch />
          </Form.Item>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Form.Item
            label="Match Discount"
            name="matchDiscount"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
          <Form.Item
            label="Match Delivery Offer"
            name="matchDeliveryOffer"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={isCreating || isUpdating}
          >
            {addonData ? "Update" : "Create"}
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default AddonModal;
