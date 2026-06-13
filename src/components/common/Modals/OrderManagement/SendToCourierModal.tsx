import { Modal, Select, Button, Alert, Input } from "antd";
import { useState } from "react";
import { toast } from "react-toastify";
import { useSendToCourierMutation } from "../../../../redux/features/courier/courierApi";

const { TextArea } = Input;

interface SendToCourierModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  orderIds: string[];
  onSuccess: () => void;
}

const SendToCourierModal = ({
  open,
  setOpen,
  orderIds,
  onSuccess,
}: SendToCourierModalProps) => {
  const [selectedCourier, setSelectedCourier] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [itemDescription, setItemDescription] = useState("");
  const [sendToCourier] = useSendToCourierMutation();
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (orderIds.length === 0 || !selectedCourier) return;

    setLoading(true);
    const toastId = toast.loading(
      `Sending ${orderIds.length} orders to ${selectedCourier}...`,
    );
    let successCount = 0;
    let failCount = 0;

    try {
      for (let i = 0; i < orderIds.length; i++) {
        const orderId = orderIds[i];
        toast.update(toastId, {
          render: `Sending ${i + 1}/${orderIds.length} to ${selectedCourier}...`,
        });

        try {
          const payload = {
            orderId: orderId,
            courier: selectedCourier,
            note: note || undefined,
            item_description: itemDescription || undefined,
          };
          const result = await sendToCourier(payload).unwrap();

          if (result.success) {
            successCount++;
          } else {
            failCount++;
          }
        } catch (error) {
          failCount++;
          console.error(`Failed to send order ${orderId}`, error);
        }
      }

      if (successCount > 0) {
        toast.update(toastId, {
          render: `Successfully sent ${successCount} orders to ${selectedCourier}`,
          type: "success",
          isLoading: false,
          autoClose: 3000,
        });
        onSuccess();
        setOpen(false);
        // Reset form
        setNote("");
        setItemDescription("");
        setSelectedCourier(null);
      } else {
        toast.update(toastId, {
          render: `Failed to send orders. ${failCount} failed.`,
          type: "error",
          isLoading: false,
          autoClose: 3000,
        });
      }
    } catch (error) {
      toast.update(toastId, {
        render: "An unexpected error occurred",
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const courierOptions = [
    { value: "OFFICE_DELIVERY", label: "Office Delivery" },
    { value: "STEADFAST", label: "Steadfast Delivery" },
    { value: "REDX", label: "RedX Delivery" },
    { value: "PATHAO", label: "Pathao Delivery" },
    { value: "OTHER", label: "Other Delivery" },
  ];

  return (
    <Modal
      title="Send to Courier"
      open={open}
      onCancel={() => !loading && setOpen(false)}
      centered
      maskClosable={!loading}
      footer={[
        <Button key="cancel" onClick={() => setOpen(false)} disabled={loading}>
          Cancel
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={loading}
          disabled={!selectedCourier || orderIds.length === 0}
          onClick={handleSend}
          className="bg-primary hover:!bg-primary/90 border-primary"
        >
          Confirm Send ({orderIds.length})
        </Button>,
      ]}
    >
      <div className="py-2 space-y-4">
        <Alert
          message={`You are about to send ${orderIds.length} order(s) to a courier service.`}
          type="info"
          showIcon
          className="mb-4"
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Courier Service <span className="text-red-500">*</span>
          </label>
          <Select
            className="w-full"
            placeholder="Select a courier (e.g., Pathao, Steadfast)"
            value={selectedCourier}
            onChange={setSelectedCourier}
            options={courierOptions}
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Item Description
          </label>
          <Input
            placeholder="e.g., Fragile items"
            value={itemDescription}
            onChange={(e) => setItemDescription(e.target.value)}
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Note to Courier
          </label>
          <TextArea
            placeholder="e.g., Handle with care"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            disabled={loading}
          />
        </div>
      </div>
    </Modal>
  );
};

export default SendToCourierModal;
