import React, { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Plus, Minus, ShoppingCart, Truck } from "lucide-react";
import { Spin } from "antd";
import { TbCurrencyTaka } from "react-icons/tb";

import { useGetProductByIdQuery } from "../../redux/features/product/productApi";
import { useGetComboProductByIdQuery } from "../../redux/features/comboProduct/comboProductApi";
import { IProduct, IProductVariant } from "../../types/product";
import PageMeta from "../../components/common/Meta/PageMeta";
import { useMediaListQuery } from "../../redux/features/media/mediaApi";
import { config } from "../../config";
import RichTextPreview from "../../components/shared/RichTextPreview";
import { MediaImage } from "../../types/media";

// --- Types ---
interface IQuickViewMedia {
  id?: string | number;
  url?: string;
  media?: {
    url: string;
  };
}

interface IQuickViewVariant extends Partial<IProductVariant> {
  id: string;
  name: string;
  variantName?: string;
  sellingPrice: number;
  discountedPrice?: number;
  isDefault?: boolean;
  thumbnail?: {
    url: string;
  };
  VariantImages?: IQuickViewMedia[];
  images?: IQuickViewMedia[];
}

interface IQuickViewProduct extends Omit<Partial<IProduct>, "variants"> {
  id: string;
  name: string;
  shortDesc?: string;
  detailedDesc?: string;
  thumbnail?: {
    url: string;
  };
  ProductImages?: IQuickViewMedia[];
  images?: IQuickViewMedia[];
  variants: IQuickViewVariant[];
}

// --- Components ---

// Custom TakaIcon
const TakaIcon: React.FC<{ size?: number; className?: string }> = ({
  size = 18,
  className = "",
}) => <TbCurrencyTaka style={{ fontSize: size }} className={className} />;

// Local ImageZoomMagnifier tailored for this design
const ImageZoomMagnifier: React.FC<{
  images: string[];
  thumbnailImage: string;
  productName: string;
  disableZoom?: boolean;
}> = ({ images, thumbnailImage }) => {
  const [mainImage, setMainImage] = useState(images?.[0] || thumbnailImage);

  useEffect(() => {
    setMainImage(images?.[0] || thumbnailImage);
  }, [images, thumbnailImage]);

  return (
    <div className="w-full space-y-4">
      <div className="w-full aspect-square flex justify-center bg-gray-50 rounded-lg p-4 overflow-hidden items-center border border-gray-200">
        <img
          src={mainImage || "/placeholder.jpg"}
          alt="Product"
          className="max-w-full max-h-full object-contain"
        />
      </div>
      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-3">
          {images?.slice(0, 4).map((img, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setMainImage(img)}
              className={`aspect-square rounded-lg border-2 transition-all p-1 flex-shrink-0 bg-white ${
                mainImage === img
                  ? "border-primary shadow-sm"
                  : "border-gray-200 hover:border-primary/30"
              }`}
            >
              <img
                src={img}
                className="w-full h-full object-contain rounded-md"
                alt="thumb"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const getImageUrl = (url?: string) => {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  const baseUrl = config.image_access_url?.endsWith("/")
    ? config.image_access_url.slice(0, -1)
    : config.image_access_url;
  const path = url.startsWith("/") ? url : `/${url}`;
  return `${baseUrl}${path}`;
};

const QuickViewPage: React.FC = () => {
  const { type, id } = useParams<{ type: string; id: string }>();
  const navigate = useNavigate();

  const isCombo = type === "combo";
  const isPreview = id === "preview";

  const { data: productDataRes, isLoading: isProductLoading } =
    useGetProductByIdQuery(id as string, { skip: isCombo || isPreview || !id });

  const { data: comboDataRes, isLoading: isComboLoading } =
    useGetComboProductByIdQuery(id as string, {
      skip: !isCombo || isPreview || !id,
    });

  const { data: allMediaRes } = useMediaListQuery(
    [{ name: "limit", value: "1000" }],
    { skip: !isPreview },
  );

  const allMedia = useMemo<MediaImage[]>(
    () => (allMediaRes?.data as MediaImage[]) || [],
    [allMediaRes],
  );

  const loading = !isPreview && (isProductLoading || isComboLoading);

  const product = useMemo<IQuickViewProduct | null>(() => {
    const internalResolveMedia = (mediaId: string | number) => {
      if (!mediaId) return null;
      const found = allMedia.find((m) => String(m.id) === String(mediaId));
      return found ? { media: { url: found.url } } : null;
    };

    if (isPreview) {
      try {
        const stored = localStorage.getItem("previewProductData");
        if (!stored) {
          console.warn("No preview data found in localStorage");
          return null;
        }
        const data = JSON.parse(stored);
        if (!data) return null;

        const hydratedData: IQuickViewProduct = {
          ...data,
          name: data.name || "Preview Product",
          id: data.id || "preview-id",
        };

        hydratedData.thumbnail = internalResolveMedia(
          data.thumbnailId || data.thumbnail?.id,
        )?.media;
        hydratedData.ProductImages =
          data.imageIds?.map(internalResolveMedia).filter(Boolean) || [];

        if (data.variants && Array.isArray(data.variants)) {
          hydratedData.variants = data.variants.map((v: any, idx: number) => ({
            ...v,
            id: v.id || `temp-${idx}`,
            name: v.name || v.variantName || data.name || "Variant",
            sellingPrice: Number(v.sellingPrice || 0),
            discountedPrice: v.discountedPrice
              ? Number(v.discountedPrice)
              : undefined,
            thumbnail: internalResolveMedia(v.thumbnailId || v.thumbnail?.id)
              ?.media,
            VariantImages:
              (v.imageIds || v.images?.map((im: any) => im.id))
                ?.map(internalResolveMedia)
                .filter(Boolean) || [],
          }));
        } else {
          hydratedData.variants = [];
        }

        console.log("Hydrated preview product:", hydratedData);
        return hydratedData;
      } catch (err) {
        console.error("Failed to parse preview data:", err);
        return null;
      }
    }
    return (
      isCombo ? comboDataRes?.data : productDataRes?.data
    ) as IQuickViewProduct;
  }, [isPreview, isCombo, comboDataRes, productDataRes, allMedia]);

  const [quantity, setQuantity] = useState(1);
  const [activeVariantId, setActiveVariantId] = useState<string | null>(null);

  const currentVariant = useMemo<IQuickViewVariant | null>(() => {
    if (!product?.variants?.length) return null;
    if (activeVariantId) {
      const found = product.variants.find(
        (v) => String(v.id) === String(activeVariantId),
      );
      if (found) return found;
    }

    const defaultVariant = product.variants.find((v) => v.isDefault);
    if (defaultVariant) return defaultVariant;

    const sorted = [...product.variants].sort(
      (a, b) =>
        (a.discountedPrice ?? a.sellingPrice) -
        (b.discountedPrice ?? b.sellingPrice),
    );
    return sorted[0];
  }, [product, activeVariantId]);

  const currentVariantId = currentVariant?.id;

  const getVariantImageUrls = (variantImages?: IQuickViewMedia[]): string[] => {
    if (!variantImages) return [];
    const imagesArray = Array.isArray(variantImages)
      ? variantImages
      : [variantImages];
    return imagesArray
      .map((item) => {
        const url =
          typeof item === "string"
            ? item
            : item.media?.url || item.url || (item as any).thumbnail?.url;
        return getImageUrl(url);
      })
      .filter(Boolean);
  };

  const getProductImageUrls = (productImages?: IQuickViewMedia[]): string[] => {
    if (!productImages) return [];
    const imagesArray = Array.isArray(productImages)
      ? productImages
      : [productImages];
    return imagesArray
      .map((item) => {
        const url =
          typeof item === "string"
            ? item
            : item.media?.url || item.url || (item as any).thumbnail?.url;
        return getImageUrl(url);
      })
      .filter(Boolean);
  };

  const currentImages = useMemo(() => {
    const images = [
      ...getVariantImageUrls(
        currentVariant?.VariantImages || currentVariant?.images,
      ),
      ...getProductImageUrls(product?.ProductImages || product?.images),
    ].filter(Boolean);
    return Array.from(new Set(images));
  }, [currentVariant, product]);

  const currentPrice =
    currentVariant?.discountedPrice ?? currentVariant?.sellingPrice ?? 0;
  const currentOriginalPrice = currentVariant?.discountedPrice
    ? currentVariant?.sellingPrice
    : 0;
  const currentName = currentVariant?.name || product?.name || "";
  const currentThumbnail = getImageUrl(
    currentVariant?.thumbnail?.url || product?.thumbnail?.url,
  );

  const handleQuantityChange = (delta: number) => {
    setQuantity((prev) => Math.max(1, prev + delta));
  };

  const getVariantDisplayName = (variantName: string) => {
    const parts = variantName.split("/");
    return parts[0]?.trim() || variantName;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <Spin size="large" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="text-center">
          <p className="text-gray-600 text-lg">Product not found</p>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mt-4 px-4 py-2 bg-primary text-white rounded-lg"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-12 bg-gray-50 min-h-screen">
      <PageMeta
        title={`Quick View - ${product.name}`}
        description="Product Quick View Dashboard"
      />

      <div className="max-w-7xl mx-auto bg-white rounded-lg overflow-hidden border border-gray-200">
        <div className="flex flex-col lg:flex-row gap-0">
          {/* Left: Gallery */}
          <div className="w-full lg:w-[50%] p-6 md:p-6 lg:pr-6">
            <h1 className="lg:hidden text-2xl font-bold text-gray-900 mb-6 leading-tight">
              {product?.name} - ({currentName})
            </h1>
            <ImageZoomMagnifier
              images={currentImages}
              thumbnailImage={currentThumbnail}
              productName={currentName}
              disableZoom={true}
            />
          </div>

          {/* Right: Info */}
          <div className="w-full lg:w-[50%] p-6 md:p-6 lg:pl-4 space-y-8">
            <div className="hidden lg:block">
              <h1 className="text-3xl font-bold text-gray-900 leading-tight">
                {product?.name} - (
                <span className="text-primary">{currentName}</span>)
              </h1>
            </div>

            {/* Price Section */}
            <div className="flex items-center gap-4 flex-wrap">
              {currentOriginalPrice && currentOriginalPrice > 0 ? (
                <span className="text-xl sm:text-2xl font-semibold text-gray-400 line-through flex items-center">
                  <TakaIcon size={24} className="mr-0.5" />
                  {currentOriginalPrice.toLocaleString()}
                </span>
              ) : null}
              <span className="text-2xl sm:text-2xl md:text-3xl font-semibold text-primary flex items-center">
                <TakaIcon size={32} className="mr-0.5" />
                {currentPrice.toLocaleString()}
              </span>
              {currentOriginalPrice && currentOriginalPrice > currentPrice ? (
                <span className="bg-orange-400 text-white text-xs sm:text-sm font-bold px-3 py-1.5 rounded-lg border border-secondary/20 flex items-center">
                  Save <TakaIcon size={14} className="mx-1" />
                  {(currentOriginalPrice - currentPrice).toLocaleString()}
                </span>
              ) : null}
            </div>

            {/* Short Description */}
            {product.shortDesc && (
              <div className=" ">
                <RichTextPreview
                  content={product.shortDesc}
                  className="text-base text-gray-600 prose-sm max-w-none"
                />
              </div>
            )}

            {/* Variant Selection */}
            {product.variants && product.variants.length > 1 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-gray-900">
                    Select Variant
                  </h3>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[...product.variants]
                    .sort(
                      (a, b) =>
                        (b.discountedPrice ?? b.sellingPrice) -
                        (a.discountedPrice ?? a.sellingPrice),
                    )
                    .map((variant) => {
                      const isSelected =
                        String(currentVariantId) === String(variant.id);
                      return (
                        <button
                          key={variant.id || variant.name}
                          type="button"
                          onClick={() => {
                            if (variant.id) setActiveVariantId(variant.id);
                          }}
                          className={`
                            relative p-2.5 cursor-pointer rounded-lg border-2 transition-all duration-300
                            text-sm font-semibold text-center tracking-tight
                            ${
                              isSelected
                                ? "border-primary bg-primary text-white shadow-md shadow-primary/20"
                                : "border-gray-100 bg-white text-gray-700 hover:border-primary/40 hover:bg-gray-50"
                            }
                          `}
                        >
                          {getVariantDisplayName(
                            variant.name || variant.variantName || "",
                          )}
                        </button>
                      );
                    })}
                </div>
              </div>
            )}

            {/* Quantity + Cart Button */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-4">
              <div className="flex items-center border-2 border-gray-200 rounded-lg overflow-hidden bg-white h-11">
                <button
                  type="button"
                  className="w-14 h-full flex justify-center items-center bg-transparent cursor-pointer disabled:opacity-30 hover:bg-gray-50 transition-colors"
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                >
                  <Minus className="w-5 h-5 text-gray-600" />
                </button>
                <div className="w-16 h-full flex items-center justify-center font-black text-xl text-gray-900 border-x-2 border-gray-50 bg-gray-50/30">
                  {quantity}
                </div>
                <button
                  type="button"
                  className="w-14 h-full flex justify-center items-center bg-transparent cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => handleQuantityChange(1)}
                >
                  <Plus className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              <button
                type="button"
                className="flex-1 h-11 bg-primary/90 text-white rounded-lg font-semibold text-[14px] transition-all duration-300 flex items-center justify-center active:scale-95 cursor-pointer"
              >
                <ShoppingCart className="w-6 h-6 mr-3" />
                Add to Cart
              </button>
            </div>

            {/* Main Order Button */}
            <div className="w-full">
              <button
                type="button"
                className="relative w-full h-11 rounded-lg bg-orange-400 text-white text-[14px] cursor-pointer flex items-center justify-center font-bold transition-all duration-300 active:scale-[0.98] group overflow-hidden"
              >
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent shimmer-effect" />
                <div className="relative mr-4 w-10 h-10 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border border-dashed border-white opacity-50 rotate-anim" />
                  <Truck className="w-6 h-6 truck-bounce" />
                </div>
                ক্যাশ অন ডেলিভারিতে অর্ডার করুন
              </button>
            </div>

            {/* Simple Help Note */}
            <div className="flex py-4 border-t border-gray-100 justify-center">
              <p className="text-gray-500 text-sm italic">
                Need help? Give us a call at our support number.
              </p>
            </div>
          </div>
        </div>

        {/* Product Details Section */}
        {product.detailedDesc && (
          <div className="mt-6 p-6 md:p-6 bg-white border-t-8 border-gray-50">
            <div className="flex flex-col items-center mb-10 gap-2">
              <h3 className="text-3xl font-bold">
                Product <span className="">Details</span>
              </h3>
            </div>

            <div className="p-2 md:p-8 bg-gray-50/30 rounded-lg border border-gray-100">
              <div
                className="prose prose-lg max-w-none text-gray-700
                    [&_h3]:text-2xl [&_h3]:font-black [&_h3]:text-gray-900 [&_h3]:mb-6 [&_h3]:mt-10 [&_h3]:capitalize
                    [&_h4]:text-xl [&_h4]:font-bold [&_h4]:text-gray-900 [&_h4]:mb-4 [&_h4]:mt-8
                    [&_p]:mb-6 [&_p]:text-gray-600 [&_p]:leading-relaxed
                    [&_ul]:list-disc [&_ul]:ml-8 [&_ul]:mb-8 [&_ul]:space-y-4
                    [&_li]:text-gray-600
                    [&_strong]:text-primary [&_strong]:font-black
                    [&_a]:text-primary [&_a]:underline [&_a]:font-extrabold
                "
              >
                <RichTextPreview content={product.detailedDesc} />
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        .shimmer-effect {
          animation: shimmer 2s infinite ease-in-out;
        }
        
        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .rotate-anim {
          animation: rotate 8s infinite linear;
        }
        
        @keyframes truck-bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        .truck-bounce {
          animation: truck-bounce 1s infinite ease-in-out;
        }

        .text-primary { color: #ff3d0a; }
        .bg-primary { background-color: #ff3d0a; }
        .border-primary { border-color: #ff3d0a; }
      `}</style>
    </div>
  );
};

export default QuickViewPage;
