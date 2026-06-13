// File: src/pages/SalesManagement/components/POSSystem.tsx
import React, { useState, useEffect, useRef } from "react";
import {
  Row,
  Col,
  Card,
  Input,
  Button,
  Divider,
  Empty,
  Tooltip,
  Select,
} from "antd";
import {
  Search,
  Plus,
  Minus,
  Trash2,
  User,
  X,
  FileText,
  ShoppingCart,
  Edit,
  UserRoundPen,
} from "lucide-react";
import { Form, InputNumber } from "antd";
import PageMeta from "../../components/common/Meta/PageMeta";
import { IProductVariant } from "../../types/product";
import { config } from "../../config";
import CreateCustomerModal from "../../components/common/Modals/Customer/CreateCustomerModal";
import { useCustomerListQuery } from "../../redux/features/customers/customersApi";
import { ICustomer } from "../../types/customer";
import CustomActionButton from "../../components/common/Button/CustomActionButton";
import { useAppDispatch, useAppSelector } from "../../redux/features/hooks";
import {
  addProduct,
  clearAllCart,
  clearCart,
  decrementProductQuantity,
  incrementProductQuantity,
  productSelector,
} from "../../redux/features/cart/cartSlice";
import {
  useCreateSaleMutation,
  useProductsVariantsForSalesQuery,
} from "../../redux/features/sales/salesApi";
import { toast } from "react-toastify";
import CustomPagination from "../../components/common/paginaction/CustomPagination";
import { Loader } from "../../components/common/Loading";
import { debounce } from "../../utils/debounce";
import { useProductCategoryListQuery } from "../../redux/features/productCategories/productCategoriesApi";
import { ICategory } from "../../types/category";
import { Option } from "antd/es/mentions";
import { RiArrowDownSLine } from "react-icons/ri";
import { DisplayCurrency } from "../../utils/currency";

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
}

// Sample customer data

export const POSSystem: React.FC = () => {
  // api.............................................................

  const [createOrder, { isLoading }] = useCreateSaleMutation();
  const [searchText, setSearchText] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null,
  );
  const [selectedProductCategory, setSelectedProductCategory] =
    useState<ICategory | null>(null);
  const [selectedProductType, setSelectedProductType] = useState<string>("all");

  const [status, setStatus] = useState("");
  const [deliveryCharge, setDeliveryCharge] = useState(0);
  const [discountValue, setDiscountValue] = useState(0);
  const [otherCharge, setOtherCharge] = useState(0);
  const [otherDescription, setOtherDescription] = useState("");
  const [notes, setNotes] = useState("");

  const [paidAmount, setPaidAmount] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(12); // Show more products for POS
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Edit mode states
  const [editingDelivery, setEditingDelivery] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState(false);
  const [editingOther, setEditingOther] = useState(false);
  const [editingPaid, setEditingPaid] = useState(false);
  const [openCreateCustomerModal, setOpenCreateCustomerModal] = useState(false);

  // Add custom CSS for InputNumber styling
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      .paid-amount-input input {
        color: #ff3d0a !important;
        font-weight: bold !important;
        font-size: 18px !important;
      }
      .paid-amount-input .ant-input-number-input {
        color: #ff3d0a !important;
        font-weight: bold !important;
        font-size: 18px !important;
      }
      .cart-item-input input {
        color: #ff3d0a !important;
        font-weight: bold !important;
        font-size: 14px !important;
      }
      .cart-item-input .ant-input-number-input {
        color: #ff3d0a !important;
        font-weight: bold !important;
        font-size: 14px !important;
      }
      .delivery-charge-input input {
        color: #000000 !important;
        font-weight: bold !important;
        font-size: 14px !important;
      }
      .delivery-charge-input .ant-input-number-input {
        color: #000000 !important;
        font-weight: bold !important;
        font-size: 14px !important;
      }
      .other-charge-input input {
        color: #000000 !important;
        font-weight: bold !important;
        font-size: 14px !important;
      }
      .other-charge-input .ant-input-number-input {
        color: #000000 !important;
        font-weight: bold !important;
        font-size: 14px !important;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // use form
  const [form] = Form.useForm();

  const {
    data: salesProductVariant,
    isLoading: salesProductVariantLoading,
    isFetching,
  } = useProductsVariantsForSalesQuery([
    { name: "limit", value: limit },
    { name: "page", value: page },
    { name: "isActive", value: true },
    searchText && { name: "search", value: searchText },
    selectedProductType !== "all" && {
      name: "productType",
      value: selectedProductType,
    },
    selectedProductCategory !== null && {
      name: "categoryId",
      value: selectedProductCategory,
    },
  ]);

  const productByVariant = salesProductVariant?.data || [];
  const metaData = salesProductVariant?.meta || {};

  // pagination

  const handlePageChange = (newPage: number, limit: number) => {
    setPage(newPage);
    setLimit(limit);
  };

  const { data: customerData, isLoading: customerLoading } =
    useCustomerListQuery([
      { name: "limit", value: 500000 },
      { name: "isActive", value: true },
    ]);

  const customers = customerData?.data || [];

  const { data: productCategoryData, isLoading: productCategoryLoading } =
    useProductCategoryListQuery([{ name: "limit", value: 500000 }]);

  const productCategories = productCategoryData?.data || [];

  const dispatch = useAppDispatch();
  const cartItems = useAppSelector(productSelector);

  // Calculate value..............................................................................
  const subTotalValue = cartItems.reduce((sum, item) => {
    return sum + Number(item.sellingPrice) * Number(item.orderQuantity);
  }, 0);

  // calculate total subtotal .................................

  const subTotal = Number(subTotalValue);
  const discount = Number(discountValue);
  const delivery = Number(deliveryCharge);
  const otherCharges = Number(otherCharge);
  const paidAmountValue = Number(paidAmount);

  const totalAmount = subTotal - discount + delivery + otherCharges;

  // const finalAmount = totalAmount - paidAmountValue;

  const handleCreateOrder = async (value: string) => {
    if (!selectedCustomer) {
      return toast.error("Please select Customer");
    }

    if (subTotal < discount) {
      return toast.error("Discount cannot be greater than subtotal");
    }

    try {
      const inputData = {
        customerId: selectedCustomer?.id,
        paymentMethod: "cash",
        totalAmount: subTotalValue || 0,
        discount: discount || 0,
        deliveryCharge: delivery || 0,
        otherCharge: otherCharges || 0,
        otherChargeDescription: otherDescription,
        finalAmount: totalAmount || 0,
        paid: paidAmountValue || 0,
        notes: notes,
        status: value,
        items: cartItems.map((item) => {
          // For regular products
          if (item.productType === "regular") {
            return {
              productId: item.productId,
              variantId: item.variantId,
              quantity: item.orderQuantity,
              unitPrice: item.sellingPrice,
              totalPrice: item.sellingPrice * item.orderQuantity,
            };
          }

          // For combo products
          if (item.productType === "combo") {
            return {
              comboProductId: item.productId, // or item.comboProductId if you have separate field
              comboVariantId: item.variantId, // or item.comboVariantId if you have separate field
              quantity: item.orderQuantity,
              unitPrice: item.sellingPrice,
              totalPrice: item.sellingPrice * item.orderQuantity,
            };
          }
        }),
      };

      const res = await createOrder(inputData).unwrap(); // trigger mutation

      if (res.success) {
        // after success:
        setSelectedCustomer(null);
        setOtherCharge(0);
        setOtherDescription("");
        setDeliveryCharge(0);
        setPaidAmount(0);
        setDiscountValue(0);
        dispatch(clearAllCart());
        form.setFieldsValue({
          paidAmount: 0,
        });
        // switch tab etc.
        toast.success(res?.message || "order created successfully");
        window.dispatchEvent(new CustomEvent("switchToInvoicesTab"));
      }
    } catch (error) {
      console.error("Failed to create order:", error);
      // show error toast or similar
    }
  };

  const handleAddToCart = (product: IProductVariant) => {
    dispatch(addProduct(product));
  };

  const debounceSearch = useRef(
    debounce((value) => {
      setSearchText(value);
      setPage(1);
    }, 500),
  ).current;

  // Edit mode handlers
  const handleEditClick = (field: string) => {
    switch (field) {
      case "delivery":
        setEditingDelivery(true);
        break;
      case "other":
        setEditingOther(true);
        break;
      case "paid":
        setEditingPaid(true);
        break;
      case "cartItem":
    }
  };

  // const handleKeyPress = (e: React.KeyboardEvent, field: string) => {
  //   if (e.key === "Enter") {
  //     switch (field) {
  //       case "delivery":
  //         setEditingDelivery(false);
  //         break;
  //       case "discount":
  //         setEditingDiscount(false);
  //         break;
  //       case "other":
  //         setEditingOther(false);
  //         break;
  //       case "paid":
  //         setEditingPaid(false);
  //         break;
  //       case "cartItem":
  //     }
  //   }
  // };

  const incrementQuantity = (product: any) =>
    dispatch(incrementProductQuantity(product));
  const decrementQuantity = (product: any) =>
    dispatch(decrementProductQuantity(product));

  // remove product Variant
  const removeFromCart = (product: any) => dispatch(clearCart(product));

  return (
    <div className="space-y-4">
      <PageMeta
        title="Sales Management | UserKotha.Shop ERP"
        description="This is Sales Management page"
      />
      {/* Search and Actions Bar */}
      <div>
        <div className="!mb-4 flex justify-between flex-wrap">
          <Input
            size="middle"
            placeholder="Search products by name or variant..."
            prefix={<Search size={16} />}
            onChange={(e) => debounceSearch(e.target.value)}
            className="max-w-md"
          />

          <div className="flex gap-3">
            <Select
              value={selectedProductType}
              onChange={(val: string) => {
                setSelectedProductType(val);
                setPage(1); // Reset to first page when filtering
              }}
              style={{ width: "150px" }}
              placeholder="Filter by status"
            >
              <Option value="all">All Products</Option>
              <Option value="regular">Regular Product</Option>
              <Option value="combo">Combo Product</Option>
            </Select>
            <Select
              showSearch
              suffixIcon={
                <RiArrowDownSLine style={{ width: 20, height: 18 }} />
              }
              placeholder="Search or Select Category"
              style={{ width: "200px" }}
              // onChange={handleChange}
              loading={productCategoryLoading}
              allowClear
              optionFilterProp="label"
              filterOption={(input, option) =>
                String(option?.label ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
              onChange={(value: string) => {
                const category = productCategories.find(
                  (c: { id: string }) => c.id === value,
                );
                setSelectedProductCategory(category || null);
              }}
              options={productCategories.map((category: ICategory) => ({
                value: category.id,
                label: `${category.name}`,
              }))}
            />
          </div>
        </div>

        <Row gutter={[16, 16]}>
          {/* Product Grid */}
          <Col xs={24} sm={24} md={24} lg={16} xl={16}>
            <Card>
              {isFetching || salesProductVariantLoading ? (
                <Loader />
              ) : metaData.total === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                  <div className="w-10 h-10 mb-6 rounded-full  flex items-center justify-center">
                    <svg
                      className="w-10 h-10 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 40 40"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>

                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    No products found for "
                    <span className="text-green-600 font-medium">xyzabc</span>"
                  </h3>

                  <p className="text-gray-600 max-w-md mb-6 leading-relaxed">
                    We couldn't find any matches for your search. Try checking
                    the spelling or using more general terms.
                  </p>
                </div>
              ) : (
                <div>
                  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4">
                    {productByVariant?.map((product: IProductVariant) => (
                      <div
                        key={product.id}
                        className="border rounded-lg hover:shadow-lg cursor-pointer transition-shadow bg-white relative"
                        onClick={() => handleAddToCart(product)}
                      >
                        {/* Stock Button */}
                        <div className="absolute top-0 left-0 z-2">
                          <Button
                            type="primary"
                            size="small"
                            style={{
                              borderRadius: "3px 0px 5px 0px",
                              backgroundColor: "#1BA143",
                              border: "none",
                            }}
                            className="hover:bg-green-700"
                          >
                            {product?.currentStock || 0}
                          </Button>
                        </div>

                        <div className="text-center">
                          <div className="mb-2 w-full">
                            <img
                              src={`${config.image_access_url}${product?.thumbnail?.url}`}
                              alt={product.variantName}
                              className="h-24 w-full object-cover rounded-t-sm"
                            />
                          </div>
                          <div className="p-3">
                            <h4
                              className="font-semibold !line-clamp-1 text-sm mb-1 overflow-hidden"
                              style={{
                                display: "-webkit-box",
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: "vertical",
                              }}
                            >
                              {product.variantName}
                            </h4>
                            <h4 className="!line-clamp-1 text-[12px] mb-1 overflow-hidden">
                              {product.productName}
                            </h4>
                            <p className="text-xs text-gray-600 mb-1"></p>
                            <div className="text-primary font-bold"></div>
                            <div className="text-xs text-gray-500 mt-1"></div>
                            <Button
                              type="primary"
                              size="small"
                              className="mt-2 w-full"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAddToCart(product);
                              }}
                            >
                              Add to Cart
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {metaData.total > 10 && (
                    <div className="mt-10">
                      <CustomPagination
                        page={page}
                        limit={limit}
                        total={metaData?.total || 0}
                        onPageChange={handlePageChange}
                      />
                    </div>
                  )}
                </div>
              )}
            </Card>
          </Col>

          {/* Cart Section */}
          <Col xs={24} sm={24} md={24} lg={8} xl={8}>
            <Card
              title={
                <div className="flex justify-between items-center">
                  <span>Cart Items</span>

                  <p className="relative inline-block">
                    {cartItems.length > 0 && (
                      <span className=" bg-primary text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                        {cartItems.length}
                      </span>
                    )}
                  </p>
                </div>
              }
              className="h-auto flex flex-col"
            >
              {/* Cart Items List */}
              <div className="flex-1 overflow-y-auto space-y-3 max-h-[300px] lg:max-h-[400px]">
                {cartItems.length === 0 ? (
                  <Empty description="Cart is empty" />
                ) : (
                  cartItems.map((item) => (
                    <div
                      key={item?.variantId}
                      className="border rounded-lg p-3"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-semibold">
                            Variant : {item?.variantName}
                          </h4>
                          <h4 className="text-[12px]">
                            Name : {item.productName}
                          </h4>
                          <h4 className="text-[12px]">
                            Price : {item.sellingPrice}
                          </h4>
                        </div>
                        <Button
                          type="text"
                          danger
                          icon={<Trash2 size={14} />}
                          onClick={() => removeFromCart(item)}
                        />
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Button
                            size="middle"
                            icon={<Minus size={12} />}
                            onClick={() => decrementQuantity(item)}
                          />
                          <span className="w-8 text-center">
                            {item.orderQuantity}
                          </span>
                          <Button
                            size="middle"
                            icon={<Plus size={12} />}
                            onClick={() => incrementQuantity(item)}
                          />
                        </div>
                        {/* <span className="font-semibold">TK ${item.total}</span> */}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Cart Summary */}
              <div className="border-t pt-4 space-y-2 ">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>
                    <DisplayCurrency amount={subTotal} />
                  </span>
                </div>
                <div className="flex justify-between">
                  {/* .......................................................Discount */}
                  <span>Discount:</span>
                  <div className="flex items-center">
                    {editingDiscount ? (
                      <Input
                        type="number"
                        size="middle"
                        value={discountValue || 0}
                        onChange={(e) =>
                          setDiscountValue(
                            Number((e.target as HTMLInputElement).value) || 0,
                          )
                        }
                        min={0}
                        className="discount-input"
                        style={
                          {
                            width: 90,
                          } as React.CSSProperties
                        }
                        autoFocus
                      />
                    ) : (
                      <div className="flex items-center gap-2">
                        <Edit
                          size={12}
                          className="text-gray-400 hover:text-black cursor-pointer"
                          onClick={() => setEditingDiscount(true)}
                        />
                        <span>
                          <DisplayCurrency amount={discountValue} />
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Delivery Charge */}
                <div className="flex justify-between items-center">
                  <span>Delivery Charge:</span>
                  <div className="flex items-center">
                    {editingDelivery ? (
                      // <InputNumber
                      //   type="number"
                      //   value={deliveryCharge}
                      //   onChange={(v) => setDeliveryCharge(v || 0)}
                      //   onKeyPress={(e) => handleKeyPress(e, "delivery")}
                      //   min={0}
                      //   controls
                      //   formatter={(v) => (v === undefined ? "" : `TK ${v}`)}
                      //   parser={(v) =>
                      //     Number(v?.replace(/[^\d.-]/g, "") || "0")
                      //   }
                      //   className="delivery-charge-input"
                      //   style={{
                      //     width: 60,
                      //     fontSize: "14px",
                      //     fontWeight: "bold",
                      //     borderColor: "#111111",
                      //     direction: "rtl",
                      //     textAlign: "right",
                      //   }}
                      //   autoFocus
                      // />

                      <Input
                        type="number"
                        value={deliveryCharge}
                        onChange={(e) =>
                          setDeliveryCharge(
                            Number((e.target as HTMLInputElement).value) || 0,
                          )
                        }
                        min={0}
                        className="discount-input"
                        size="middle"
                        style={
                          {
                            width: 90,
                          } as React.CSSProperties
                        }
                        autoFocus
                      />
                    ) : (
                      <div className="flex items-center gap-2">
                        <Edit
                          size={12}
                          className="text-gray-400 hover:text-black cursor-pointer"
                          onClick={() => handleEditClick("delivery")}
                        />
                        <span>
                          <DisplayCurrency amount={deliveryCharge} />
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Other Charge */}
                <div className="flex justify-between items-center">
                  <span>Other Charge:</span>
                  <div className="flex items-center">
                    {editingOther ? (
                      // <InputNumber
                      //   type="number"
                      //   value={otherCharge}
                      //   onChange={(v) => setOtherCharge(v || 0)}
                      //   onKeyPress={(e) => handleKeyPress(e, "other")}
                      //   min={0}
                      //   controls
                      //   formatter={(v) => (v === undefined ? "" : `TK ${v}`)}
                      //   parser={(v) =>
                      //     Number(v?.replace(/[^\d.-]/g, "") || "0")
                      //   }
                      //   className="other-charge-input"
                      //   style={{
                      //     width: 60,
                      //     fontSize: "14px",
                      //     fontWeight: "bold",
                      //     borderColor: "#111111",
                      //     direction: "rtl",
                      //     textAlign: "right",
                      //   }}
                      //   placeholder="0"
                      //   autoFocus
                      // />

                      <Input
                        type="number"
                        size="middle"
                        value={otherCharge}
                        onChange={(e) =>
                          setOtherCharge(
                            Number((e.target as HTMLInputElement).value) || 0,
                          )
                        }
                        min={0}
                        className="discount-input"
                        style={
                          {
                            width: 90,
                            fontSize: "14px",
                          } as React.CSSProperties
                        }
                        autoFocus
                      />
                    ) : (
                      <div className="flex items-center gap-2">
                        <Edit
                          size={12}
                          className="text-gray-400 hover:text-black cursor-pointer"
                          onClick={() => handleEditClick("other")}
                        />
                        <span
                          style={
                            {
                              fontSize: "14px",
                            } as React.CSSProperties
                          }
                        >
                          <DisplayCurrency amount={otherCharge} />
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Other Description */}
                <div className="mt-2">
                  <Input.TextArea
                    size="middle"
                    value={otherDescription}
                    onChange={(e) => setOtherDescription(e.target.value)}
                    placeholder="Other description"
                    style={{ width: "100%" }}
                  />
                </div>

                <Divider />

                {/* Paid Amount */}
                <div className="flex max-h-8 justify-between items-center text-[16px] font-medium">
                  <span className="">Paid Amount:</span>
                  <div className="flex items-center">
                    {editingPaid ? (
                      // <InputNumber
                      //   type="number"
                      //   value={paidAmount}
                      //   onChange={(v) => setPaidAmount(v || 0)}
                      //   onKeyPress={(e) => handleKeyPress(e, "paid")}
                      //   min={0}
                      //   controls
                      //   formatter={(v) => (v === undefined ? "" : `TK ${v}`)}
                      //   parser={(v) =>
                      //     Number(v?.replace(/[^\d.-]/g, "") || "0")
                      //   }
                      //   className="paid-amount-input"
                      //   style={
                      //     {
                      //       width: 60,
                      //       fontSize: "18px",
                      //       fontWeight: "bold",
                      //       borderColor: "#ff3d0a",
                      //       direction: "rtl",
                      //       textAlign: "right",
                      //       color: "#ff3d0a",
                      //       "--ant-color-text": "#ff3d0a",
                      //       "--ant-color-primary": "#ff3d0a",
                      //     } as React.CSSProperties
                      //   }
                      //   autoFocus
                      // />
                      //
                      //

                      <Form form={form} layout="vertical">
                        <Form.Item
                          label=" "
                          name="paidAmount"
                          // initialValue={paidAmount}
                          // rules={[
                          //   {
                          //     validator: () => {
                          //       if (0 > finalAmount) {
                          //         return Promise.reject(
                          //           `Amount cannot exceed ${finalAmount}`
                          //         );
                          //       }
                          //       return Promise.resolve();
                          //     },
                          //   },
                          // ]}
                        >
                          <InputNumber
                            style={{ width: 110, fontSize: 16 }}
                            min={0}
                            value={paidAmount}
                            onChange={(value) => {
                              const val = value || 0;
                              setPaidAmount(val);
                              form.validateFields(["paidAmount"]); // ✅ show error immediately
                            }}
                            autoFocus
                          />
                        </Form.Item>
                      </Form>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Edit
                          size={14}
                          className=" cursor-pointer"
                          onClick={() => handleEditClick("paid")}
                        />
                        <span
                          className=""
                          style={{
                            fontSize: "16px",
                          }}
                        >
                          <DisplayCurrency amount={paidAmount} />
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex justify-between text-[16px] font-medium">
                    <span>Amount Due:</span>
                    <span
                      style={{
                        fontSize: "16px",
                        color: totalAmount - paidAmount < 0 ? "red" : "#111827",
                      }}
                    >
                      {totalAmount - paidAmount >= 0 ? (
                        <DisplayCurrency amount={totalAmount - paidAmount} />
                      ) : (
                        "Error: Overpaid"
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between text-[16px] font-medium">
                    <span>Total Amount:</span>
                    <span style={{ fontSize: "16px" }}>
                      <DisplayCurrency amount={totalAmount} />
                    </span>
                  </div>
                </div>
              </div>

              {/* Customer Info */}
              <div className="mt-4 space-y-3">
                {selectedCustomer ? (
                  // Show selected customer info
                  <div className="border rounded-lg p-3 bg-blue-50">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <User size={16} className="text-primary" />
                          <h4 className="font-semibold text-primary">
                            {selectedCustomer.name}
                          </h4>
                          <Button
                            type="text"
                            size="middle"
                            onClick={() => setSelectedCustomer(null)}
                            icon={<X size={14} />}
                            className="text-gray-500 hover:text-red-500"
                          />
                        </div>
                        <div className="space-y-1 text-sm text-gray-600">
                          <div> {selectedCustomer.email}</div>
                          <div> {selectedCustomer.phone}</div>
                          <div> {selectedCustomer.address}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Show customer search input with dropdown
                  <div className="relative" ref={dropdownRef}>
                    <div className="flex gap-3 pr-12">
                      <Select
                        className="w-full"
                        showSearch
                        suffixIcon={
                          <Search style={{ width: 15, height: 15 }} />
                        }
                        placeholder="Search customer by name, email, or phone..."
                        // onChange={handleChange}
                        loading={customerLoading}
                        allowClear
                        optionFilterProp="label"
                        filterOption={(input, option) =>
                          (option?.label as string)
                            .toLowerCase()
                            .includes(input.toLowerCase())
                        }
                        onChange={(value: string) => {
                          const cust = customers.find(
                            (c: { id: string }) => c.id === value,
                          );
                          setSelectedCustomer(cust || null);
                        }}
                        options={customers.map((customer: ICustomer) => ({
                          value: customer.id,
                          label: `${customer.name} / ${customer.phone})`,
                        }))}
                      />
                      <div className="w-5">
                        <Tooltip title="Create Customer" placement="top">
                          <Button
                            size="middle"
                            className="!px-2.5"
                            onClick={() => setOpenCreateCustomerModal(true)}
                            style={{ width: 35, height: 33 }}
                            icon={
                              <UserRoundPen style={{ width: 15, height: 15 }} />
                            }
                          />
                        </Tooltip>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Payment Actions */}
              <div className="mt-4 space-y-2">
                <div className="mt-2">
                  <label>Notes</label>
                  <Input.TextArea
                    size="middle"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Other description"
                    style={{ width: "100%" }}
                    className="!mt-2 !mb-5"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <CustomActionButton
                    text="   Order Now"
                    type="primary"
                    icon={<ShoppingCart size={16} />}
                    onClick={() => {
                      handleCreateOrder("completed");
                      setStatus("completed");
                    }}
                    loading={status === "completed" && isLoading}
                    disabled={cartItems.length === 0}
                  />

                  <CustomActionButton
                    icon={<FileText size={16} />}
                    text="Quotation"
                    onClick={() => {
                      handleCreateOrder("quotation");
                      setStatus("quotation");
                    }}
                    disabled={cartItems.length === 0}
                    loading={status === "quotation" && isLoading}
                  />
                </div>
                {/* <Button
                  icon={<Printer size={16} />}
                  block
                  onClick={handlePrintInvoice}
                  disabled={cartItems.length === 0 || !selectedCustomer}
                >
                  Print Invoice
                </Button> */}
              </div>
            </Card>
          </Col>
        </Row>
      </div>

      {openCreateCustomerModal && (
        <CreateCustomerModal
          open={openCreateCustomerModal}
          setOpen={setOpenCreateCustomerModal}
        />
      )}
    </div>
  );
};
