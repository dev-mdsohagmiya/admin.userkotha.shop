import { useMemo, useState } from "react";
import { Button } from "antd";
import { IoClose } from "react-icons/io5";
import { config } from "../../config";
import { CurrencyIcon } from "../../utils/currency";

interface IProductVariant {
  id: string;
  productId: string;
  name: string;
  sku: string;
  sellingPrice: number;
  discountedPrice?: number;
  currentStock: number;
  thumbnail?: {
    url: string;
  };
  thumbnailId?: string;
  conversionFactor?: number;
  minStock?: number;
  maxStock?: number;
  isDeliveryChargeFree?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface IProduct {
  id: string;
  name: string;
  slug?: string;
  thumbnail?: {
    url: string;
  };
  variants?: IProductVariant[];
}

interface OrderProductCardProps {
  product: IProduct;
  onAddToCart: (product: IProduct, variant: IProductVariant) => void;
}

const OrderProductCard = ({ product, onAddToCart }: OrderProductCardProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // First variant as default selected
  const selectedVariant = useMemo<IProductVariant | null>(
    () => (product?.variants?.length ? product.variants[0] : null),
    [product],
  );

  // Calculate price range for multiple variants
  const priceRange = useMemo(() => {
    if (!product?.variants || product.variants.length === 0) return null;

    let low = Infinity;
    let high = 0;

    product.variants.forEach((variant) => {
      const price = variant.discountedPrice ?? variant.sellingPrice;
      if (!price) return;

      if (price < low) low = price;
      if (price > high) high = price;
    });

    return {
      lowPrice: low === Infinity ? 0 : low,
      highPrice: high,
    };
  }, [product]);

  // Check if stock is out
  const isStockOut = selectedVariant ? selectedVariant.currentStock < 1 : false;

  // Handle add to cart
  const handleAddToCart = () => {
    if (!selectedVariant || isStockOut) return;

    // If multiple variants, show modal
    if (product.variants && product.variants.length > 1) {
      setIsModalOpen(true);
      return;
    }

    // Single variant - add directly
    onAddToCart(product, selectedVariant);
  };

  // Handle variant selection from modal
  const handleVariantSelect = (variant: IProductVariant) => {
    onAddToCart(product, variant);
    setIsModalOpen(false);
  };

  return (
    <>
      {/* Product Card */}
      <div className="relative w-full rounded-lg border border-gray-100 bg-white transition-all duration-300 hover:border-primary/30 hover:shadow-[0_0_10px_rgba(16,185,129,0.1)]">
        <div
          className="flex items-center gap-2 p-2 cursor-pointer"
          onClick={handleAddToCart}
        >
          {/* Product Image */}
          <img
            src={config.image_access_url + product.thumbnail?.url}
            alt={product.name}
            className="w-12 h-12 object-cover rounded-md border border-gray-100 flex-shrink-0"
          />

          {/* Product Info */}
          <div className="flex-1 min-w-0">
            {/* Product Name */}
            <h4 className="text-[14px] font-semibold line-clamp-1 text-gray-800 mb-0.5 leading-relaxed py-0.5">
              {product.name}
            </h4>

            {/* Price Display */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {product?.variants && product.variants.length > 1 ? (
                // Multiple variants - show price range
                <>
                  <span className="text-[10px] font-bold text-primary flex items-center gap-1">
                    <CurrencyIcon size={10} className="text-primary" />
                    {priceRange?.lowPrice.toLocaleString()} -
                    {priceRange?.highPrice.toLocaleString()}
                  </span>
                </>
              ) : (
                // Single variant - show price with discount
                <>
                  <span className="text-[11px] font-bold text-primary flex items-center gap-1">
                    <CurrencyIcon size={12} className="text-primary" />
                    {selectedVariant?.discountedPrice
                      ? selectedVariant.discountedPrice.toLocaleString()
                      : selectedVariant?.sellingPrice?.toLocaleString()}
                  </span>
                  {selectedVariant?.discountedPrice &&
                    selectedVariant.discountedPrice <
                      selectedVariant.sellingPrice && (
                      <span className="text-[10px] text-gray-400 line-through flex items-center gap-1">
                        {selectedVariant.sellingPrice.toLocaleString()}
                      </span>
                    )}
                </>
              )}
            </div>

            {/* Stock Badge - Compact version or hidden if out of stock */}
            {isStockOut && (
              <span className="text-[9px] font-medium text-white bg-red-500 px-1 rounded block w-fit mt-0.5">
                Stock Out
              </span>
            )}
          </div>
        </div>
      </div>

      {/* VARIANT SELECTION MODAL */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4"
          onClick={() => setIsModalOpen(false)}
          style={{ animation: "fadeIn 0.15s ease-out" }}
        >
          <div
            className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden"
            onClick={(e) => e.stopPropagation()}
            style={{ animation: "zoomIn 0.2s ease-out" }}
          >
            {/* Modal Header */}
            <div className="flex items-center gap-3 p-4 border-b border-gray-100 bg-gradient-to-r from-primary/5 to-transparent">
              <img
                src={config.image_access_url + product.thumbnail?.url}
                alt={product.name}
                className="w-12 h-12 object-cover rounded-lg border border-gray-200"
              />
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-bold text-gray-800 line-clamp-2 leading-relaxed py-0.5">
                  {product.name}
                </h3>
                <p className="text-xs text-gray-500">ভেরিয়েন্ট সিলেক্ট করুন</p>
              </div>
              <Button
                type="text"
                size="small"
                onClick={() => setIsModalOpen(false)}
                className="h-8 w-8 flex items-center justify-center rounded-full bg-red-50 hover:bg-red-100 text-red-500 transition-all active:scale-90 p-0 border-0"
              >
                <IoClose size={18} />
              </Button>
            </div>

            {/* Variant List */}
            <div className="p-4 max-h-[350px] overflow-y-auto space-y-2 custom-scrollbar">
              {product?.variants?.map((v) => {
                const variantStockOut = v.currentStock < 1;
                return (
                  <button
                    key={v?.id}
                    disabled={variantStockOut}
                    onClick={() => handleVariantSelect(v)}
                    className={`w-full flex justify-between items-center px-4 py-3 border rounded-xl transition-all text-left cursor-pointer active:scale-[0.98] ${
                      variantStockOut
                        ? "opacity-50 cursor-not-allowed bg-gray-50 border-gray-200"
                        : "bg-white border-gray-200 hover:border-primary hover:bg-primary/5 hover:shadow-md"
                    }`}
                  >
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-gray-700 leading-relaxed py-0.5">
                        {v?.name}
                      </span>
                      <span className="text-[11px] text-gray-400">
                        {variantStockOut
                          ? "Stock Out"
                          : `Stock: ${v.currentStock}`}
                      </span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-sm font-bold text-primary flex items-center gap-1">
                        <CurrencyIcon size={12} className="text-primary" />
                        {v?.discountedPrice || v?.sellingPrice}
                      </span>
                      {v?.discountedPrice &&
                        v.discountedPrice < v.sellingPrice && (
                          <span className="text-[11px] text-gray-400 line-through flex items-center gap-1">
                            <CurrencyIcon size={10} className="text-gray-400" />
                            {v.sellingPrice}
                          </span>
                        )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-100 bg-gray-50/50 text-center">
              <p className="text-xs text-gray-400">
                অর্ডারে যোগ করতে যেকোনো একটি সিলেক্ট করুন
              </p>
            </div>
          </div>
        </div>
      )}

      {/* CSS Animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes zoomIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </>
  );
};

export default OrderProductCard;
