import {
  Button,
  Card,
  Col,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Modal,
  Row,
  Select,
} from "antd";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useCreatePurchasePaymentMutation } from "../../../redux/features/purchases-management/purchasesManagementApi";
import { useMediaListQuery } from "../../../redux/features/media/mediaApi";
import ImageUploader from "../../shared/ImageUploader";
import { DisplayCurrency } from "../../../utils/currency";

const { Option } = Select;
const { TextArea } = Input;

interface PurchasePaymentModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  purchase: any;
  onSuccess: () => void;
}

const PurchasePaymentModal: React.FC<PurchasePaymentModalProps> = ({
  open,
  setOpen,
  purchase,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<string>("bank_transfer");

  const [createPayment, { isLoading: loading }] =
    useCreatePurchasePaymentMutation();
  const { data: mediaResponse } = useMediaListQuery([]);

  const mediaData = mediaResponse?.data || [];

  const dueAmount = purchase?.dueAmount || 0;

  useEffect(() => {
    if (purchase && open) {
      form.setFieldsValue({
        paymentDate: dayjs(),
        amount: dueAmount,
        paymentMethod: "bank_transfer",
        paymentType: dueAmount > 0 ? "partial" : "full",
      });
      setPaymentAmount(dueAmount);
      setPaymentMethod("bank_transfer");
    }
  }, [purchase, open, form, dueAmount]);

  const onFinish = async (values: any) => {
    try {
      // Build payment data
      const paymentData: any = {
        purchaseId: purchase.id,
        paymentDate: values.paymentDate.format("YYYY-MM-DD"),
        amount: values.amount,
        paymentMethod: values.paymentMethod,
        paymentType: values.paymentType,
      };

      // Add optional fields only if they have values
      if (values.bankName) paymentData.bankName = values.bankName;
      if (values.transactionId)
        paymentData.transactionId = values.transactionId;
      if (values.slipNumber) paymentData.slipNumber = values.slipNumber;
      if (values.notes) paymentData.notes = values.notes;

      // Convert image ID to URL if attachment is selected
      if (values.attachmentUrl) {
        const selectedMedia = mediaData.find(
          (img: any) => img.id === values.attachmentUrl,
        );
        if (selectedMedia) {
          paymentData.attachmentUrl = selectedMedia.url;
        }
      }

      const res = await createPayment(paymentData).unwrap();

      if (res?.success) {
        form.resetFields();
        setOpen(false);
        onSuccess();
      }
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to record payment");
      console.error(error);
    }
  };

  const paymentMethods = [
    { value: "bank_transfer", label: "Bank Transfer" },
    { value: "cash", label: "Cash" },
    { value: "check", label: "Check" },
    { value: "digital_wallet", label: "Digital Wallet" },
  ];

  const paymentTypes = [
    { value: "full", label: "Full Payment" },
    { value: "partial", label: "Partial Payment" },
  ];

  return (
    <Modal
      open={open}
      onCancel={() => {
        setOpen(false);
        form.resetFields();
      }}
      footer={null}
      width={600}
      title={
        <div className="flex items-center gap-2">
          <span>
            Make Payment - {purchase?.purchaseId} ({purchase?.supplier?.name})
          </span>
        </div>
      }
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        className="mt-4 !space-y-4"
      >
        {/* Payment Summary */}
        <Card size="small" className="mb-4 bg-gray-50">
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-xs text-gray-600">Grand Total</div>
              <div className="text-lg font-semibold text-blue-600">
                <DisplayCurrency amount={purchase?.grandTotal} />
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-600">Total Due</div>
              <div className="text-lg font-semibold text-red-600">
                <DisplayCurrency amount={dueAmount} />
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-600">Payment Amount</div>
              <div className="text-lg font-semibold text-green-600">
                <DisplayCurrency amount={paymentAmount} />
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-600">Remaining Due</div>
              <div className="text-lg font-semibold text-orange-600">
                <DisplayCurrency amount={dueAmount - paymentAmount} />
              </div>
            </div>
          </div>
        </Card>

        {/* Payment Details */}
        <Card title="Payment Details" size="small" className="mb-4">
          <Row gutter={[16, 0]}>
            <Col span={12}>
              <Form.Item
                label="Payment Date"
                name="paymentDate"
                rules={[
                  { required: true, message: "Please select payment date" },
                ]}
              >
                <DatePicker style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Payment Type"
                name="paymentType"
                rules={[
                  { required: true, message: "Please select payment type" },
                ]}
              >
                <Select placeholder="Select payment type">
                  {paymentTypes.map((type) => (
                    <Option key={type.value} value={type.value}>
                      {type.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 0]}>
            <Col span={12}>
              <Form.Item
                label="Payment Method"
                name="paymentMethod"
                rules={[
                  { required: true, message: "Please select payment method" },
                ]}
              >
                <Select
                  placeholder="Select payment method"
                  onChange={(value) => setPaymentMethod(value)}
                >
                  {paymentMethods.map((method) => (
                    <Option key={method.value} value={method.value}>
                      {method.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Amount"
                name="amount"
                rules={[
                  { required: true, message: "Please enter payment amount" },
                  {
                    validator: (_, value) => {
                      if (!value || value <= 0) {
                        return Promise.reject(
                          new Error("Amount must be greater than 0"),
                        );
                      }
                      if (value > dueAmount) {
                        return Promise.reject(
                          new Error(
                            `Amount cannot exceed due amount (TK ${dueAmount.toFixed(
                              2,
                            )})`,
                          ),
                        );
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <InputNumber
                  type="number"
                  placeholder="Enter payment amount"
                  style={{ width: "100%" }}
                  onChange={(value) => setPaymentAmount(value || 0)}
                  min={0.01}
                  max={dueAmount}
                />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* Bank Information - Only show if payment method is not cash */}
        {paymentMethod !== "cash" && (
          <Card
            title="Bank & Transaction Details"
            size="small"
            className="mb-4"
          >
            <Row gutter={[16, 0]}>
              <Col span={12}>
                <Form.Item label="Bank Name" name="bankName">
                  <Input placeholder="Bank name" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Transaction ID" name="transactionId">
                  <Input placeholder="Transaction ID" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={[16, 0]}>
              <Col span={12}>
                <Form.Item label="Slip Number" name="slipNumber">
                  <Input placeholder="Slip or reference number" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Upload Receipt">
                  <ImageUploader form={form} fieldPath="attachmentUrl" />
                </Form.Item>
              </Col>
            </Row>
          </Card>
        )}

        {/* Additional Information */}
        <Card title="Additional Information" size="small" className="mb-4">
          <Form.Item label="Notes" name="notes">
            <TextArea
              placeholder="Add any notes about this payment..."
              rows={3}
            />
          </Form.Item>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button
            onClick={() => {
              setOpen(false);
              form.resetFields();
            }}
          >
            Cancel
          </Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            Record Payment
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default PurchasePaymentModal;
