import { Form, InputNumber, Button, Select } from "antd";
import { PlusOutlined, DeleteOutlined, ArrowLeftOutlined, SaveOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import PageMeta from "../../components/common/Meta/PageMeta";
import PageHeader from "../../components/common/Navigation/PageHeader";
import { useCreateRecipeMutation } from "../../redux/features/productRecipeCalculator/productRecipeCalculatorApi";
import { useGetMaterialsQuery } from "../../redux/features/material/materialApi";
import { useProductListQuery } from "../../redux/features/product/productApi";
import CurrencyIcon from "../../components/common/CurrencyIcon";

const { Option } = Select;

const CreateRecipe = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [createRecipe, { isLoading }] = useCreateRecipeMutation();
  const { data: materialsData } = useGetMaterialsQuery([{ name: "limit", value: 1000 }]);
  const existingMaterials = materialsData?.data || [];
  const { data: productsData } = useProductListQuery([{ name: "limit", value: 1000 }]);
  const products = productsData?.data || [];

  const onFinish = async (values: any) => {
    try {
      const transformedMaterials = values.materials.map((m: any) => ({
        name: Array.isArray(m.name) ? m.name[0] : m.name,
        amount: (m.ratio / 100) * values.baseQuantity, // Convert ratio to actual weight
        unit: "kg",
        price: m.price,
        ratio: m.ratio, // Save ratio for future reference
      }));

      const totalBaseCost = transformedMaterials.reduce(
        (sum: number, m: any) => sum + (m.amount * m.price),
        0
      );

      const payload = {
        ...values,
        materials: transformedMaterials,
        totalBaseCost,
      };

      await createRecipe(payload).unwrap();
      toast.success("Recipe created successfully");
      navigate("/product-recipe-calculator");
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to create recipe");
    }
  };

  const handleMaterialChange = (value: string[], index: number) => {
    if (value && value.length > 0) {
      const selectedName = value[0];
      const material = existingMaterials.find((m: any) => m.name === selectedName);
      
      if (material) {
        const materials = form.getFieldValue("materials");
        materials[index] = {
          ...materials[index],
          price: material.costPerUnit || materials[index].price,
        };
        form.setFieldsValue({ materials });
      }
    }
  };

  return (
    <>
      <PageMeta title="Create Recipe - Amzad Food" description="Create a new recipe calculation for production." />
      <PageHeader
        title="Product Recipe Ratio & Price"
        subtitle="Calculate material costs based on production ratio percentage."
        extra={
          <Button 
            className="!rounded-md"
            icon={<ArrowLeftOutlined />} 
            onClick={() => navigate("/product-recipe-calculator")}
          >
            Back to List
          </Button>
        }
      />

      <div className="mt-6">
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            baseQuantity: 1,
            materials: [{ name: "", ratio: undefined, price: undefined }],
          }}
          className="p-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Form.Item
              name="productId"
              label={<span className="font-bold text-gray-800">Select Product</span>}
            >
              <Select
                showSearch
                placeholder="Search and select product..."
                optionFilterProp="children"
                allowClear
                className="w-full h-11"
              >
                {products.map((p: any) => (
                  <Option key={p.id} value={p.id}>
                    {p.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="baseQuantity"
              label={<span className="font-bold text-gray-800">Total Production Quantity (pcs)</span>}
              rules={[{ required: true, message: "Required" }]}
            >
              <InputNumber 
                min={1} 
                className="w-full! flex items-center text-lg" 
                placeholder="e.g. 100" 
                controls={false}
                onKeyPress={(event) => {
                  if (!/[0-9.]/.test(event.key)) {
                    event.preventDefault();
                  }
                }}
              />
            </Form.Item>
          </div>

          <div className="mb-6">
            <Form.List name="materials">
              {(fields, { add, remove }) => (
                <div className="space-y-3">
                  {/* Table-like Header */}
                  {fields.length > 0 && (
                    <div className="flex px-4 py-3 bg-gray-50/80 border border-gray-200 rounded-t-lg mb-[-1px]">
                      <div className="flex-[2] text-[10px] font-bold text-gray-700 uppercase tracking-widest pr-4">Material Name</div>
                      <div className="flex-1 text-[10px] font-bold text-gray-700 uppercase tracking-widest px-4">Price / kg</div>
                      <div className="flex-1 text-[10px] font-bold text-gray-700 uppercase tracking-widest px-4">Ratio (%)</div>
                      <div className="flex-1 text-[10px] font-bold text-gray-700 uppercase tracking-widest px-4">Net Qty</div>
                      <div className="flex-1 text-[10px] font-bold text-gray-700 uppercase tracking-widest text-right pl-4 mr-12">Sub Total</div>
                    </div>
                  )}

                  {fields.map(({ key, name, ...restField }, index) => (
                    <Form.Item
                      noStyle
                      shouldUpdate={(prevValues, curValues) => 
                        prevValues.materials !== curValues.materials || 
                        prevValues.baseQuantity !== curValues.baseQuantity
                      }
                      key={key}
                    >
                      {({ getFieldValue }) => {
                        const baseQty = getFieldValue("baseQuantity") || 0;
                        const rowRatio = getFieldValue(["materials", name, "ratio"]) || 0;
                        const rowPrice = getFieldValue(["materials", name, "price"]) || 0;
                        const weight = (rowRatio / 100) * baseQty;
                        const totalPrice = weight * rowPrice;

                        const selectedNames = (getFieldValue("materials") || [])
                          .map((m: any) => Array.isArray(m?.name) ? m?.name[0] : m?.name)
                          .filter(Boolean);

                        const currentName = Array.isArray(getFieldValue(["materials", name, "name"])) 
                          ? getFieldValue(["materials", name, "name"])[0] 
                          : getFieldValue(["materials", name, "name"]);

                        return (
                          <div className="flex items-center bg-white border border-gray-200 transition-all hover:bg-gray-50/30 first:rounded-none last:rounded-b-lg mb-[-1px]">
                            <div className="flex-[2] p-4">
                              <Form.Item
                                {...restField}
                                name={[name, "name"]}
                                rules={[{ required: true, message: "Required" }]}
                                className="mb-0"
                                style={{ marginBottom: 0 }}
                              >
                                <Select
                                  mode="tags"
                                  placeholder="Material Name"
                                  maxCount={1}
                                  className="w-full"
                                  onChange={(value) => handleMaterialChange(value, index)}
                                >
                                  {existingMaterials
                                    .filter((m: any) => !selectedNames.includes(m.name) || m.name === currentName)
                                    .map((m: any) => (
                                      <Option key={m.id} value={m.name}>
                                        {m.name}
                                      </Option>
                                    ))}
                                </Select>
                              </Form.Item>
                            </div>
                            
                            <div className="flex-1 p-4">
                              <Form.Item
                                {...restField}
                                name={[name, "price"]}
                                rules={[{ required: true, message: "Required" }]}
                                className="mb-0"
                                style={{ marginBottom: 0 }}
                              >
                                <InputNumber 
                                  min={0} 
                                  className="w-full! text-left" 
                                  placeholder="0" 
                                  controls={false}
                                  onKeyPress={(event) => {
                                    if (!/[0-9.]/.test(event.key)) {
                                      event.preventDefault();
                                    }
                                  }}
                                />
                              </Form.Item>
                            </div>

                            <div className="flex-1 p-4">
                              <Form.Item
                                {...restField}
                                name={[name, "ratio"]}
                                rules={[{ required: true, message: "Required" }]}
                                className="mb-0"
                                style={{ marginBottom: 0 }}
                              >
                                  <InputNumber 
                                    min={0} 
                                    max={100} 
                                    className="w-full! text-left" 
                                    placeholder="0" 
                                    addonAfter="%"
                                    controls={false}
                                    onKeyPress={(event) => {
                                      if (!/[0-9.]/.test(event.key)) {
                                        event.preventDefault();
                                      }
                                    }}
                                  />
                              </Form.Item>
                            </div>

                            <div className="flex-1 p-4 flex items-center justify-start">
                              <span className="font-mono text-gray-900 bg-gray-50 py-1 px-2 rounded">
                                {weight.toFixed(3)} kg
                              </span>
                            </div>

                            <div className="flex-1 p-4 text-right font-semibold text-gray-900">
                              <CurrencyIcon size={12} className="inline-block mr-1" />
                              {totalPrice.toLocaleString(undefined, { minimumFractionDigits: 0 })}
                            </div>
                            
                            <div className="w-12 h-full flex justify-center items-center">
                              <Button
                                danger
                                className="flex items-center justify-center h-8 w-8 rounded-lg border-red-200 hover:bg-red-50 hover:border-red-400 transition-all text-red-500 shadow-none"
                                onClick={() => remove(name)}
                                icon={<DeleteOutlined className="text-sm" />}
                              />
                            </div>
                          </div>
                        );
                      }}
                    </Form.Item>
                  ))}
                  
                  <div className="pt-2">
                    <Form.Item
                      noStyle
                      shouldUpdate={(prevValues, curValues) => prevValues.materials !== curValues.materials}
                    >
                      {({ getFieldValue }) => {
                        const mats = getFieldValue("materials") || [];
                        const totalRatio = mats.reduce((sum: number, m: any) => sum + (Number(m?.ratio) || 0), 0);
                        const isRatioFull = totalRatio >= 100;

                        return (
                          <Button
                            type="dashed"
                            onClick={() => add()}
                            block
                            icon={<PlusOutlined />}
                            disabled={isRatioFull}
                            className={`h-12 border-2 border-dashed rounded-lg flex items-center justify-center font-bold ${
                              isRatioFull ? "bg-gray-50 border-gray-200 text-gray-400" : "border-gray-200 hover:border-primary hover:text-primary transition-all"
                            }`}
                          >
                            {isRatioFull ? "Ratio reached 100%" : "Add Ingredient"}
                          </Button>
                        );
                      }}
                    </Form.Item>
                  </div>
                </div>
              )}
            </Form.List>
          </div>

          <div className="mt-8">
            <Form.Item shouldUpdate>
              {({ getFieldValue }) => {
                const materials = getFieldValue("materials") || [];
                const baseQty = getFieldValue("baseQuantity") || 0;
                
                const totalRatio = materials.reduce((sum: number, m: any) => sum + (m?.ratio || 0), 0);
                const totalCost = materials.reduce((sum: number, m: any) => {
                  const weight = ((m?.ratio || 0) / 100) * baseQty;
                  return sum + (weight * (m?.price || 0));
                }, 0);

                return (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className={`p-4 rounded-xl border-2 transition-colors ${totalRatio === 100 ? 'bg-green-50 border-green-200' : 'bg-orange-50 border-orange-200'}`}>
                      <p className="text-xs font-bold uppercase text-gray-500 mb-1">Total Ratio</p>
                      <h3 className={`text-2xl font-black ${totalRatio === 100 ? 'text-green-600' : 'text-orange-600'}`}>
                        {parseFloat(totalRatio.toFixed(2))}%
                      </h3>
                      {totalRatio !== 100 && <p className="text-[10px] text-orange-400">Ratio should equal 100%</p>}
                    </div>

                    <div className="p-4 rounded-xl border-2 bg-blue-50 border-blue-200">
                      <p className="text-xs font-bold uppercase text-gray-600 mb-1">Total Net Qty</p>
                      <h3 className="text-2xl font-bold text-blue-700">
                        {((totalRatio / 100) * baseQty).toFixed(3)} 
                      </h3>
                    </div>

                    <div className="p-4 rounded-xl border-2 bg-gray-900 border-gray-800">
                      <p className="text-xs font-bold uppercase text-gray-300 mb-1">Total Estimated Cost</p>
                      <h3 className="text-2xl font-bold text-primary">
                        <CurrencyIcon size={20} className="inline-block mr-2" />
                        {totalCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </h3>
                    </div>
                  </div>
                );
              }}
            </Form.Item>
          </div>

          <div className="flex justify-end gap-4 mt-12 border-t pt-8">
            <Button 
              size="middle" 
              onClick={() => navigate("/product-recipe-calculator")}
            >
              Cancel
            </Button>
            <Button
              type="primary"
              size="middle"
              htmlType="submit"
              loading={isLoading}
              icon={<SaveOutlined />}
            >
              Save Recipe Calculation
            </Button>
          </div>
        </Form>
      </div>
    </>
  );
};

export default CreateRecipe;
