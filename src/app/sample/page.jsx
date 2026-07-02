"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Minus, Trash, ChevronRight, ShoppingBag } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useCartStore } from "../../store/cart";

// ---------------------------------------------------------------------------
// /sample — an ALTERNATE full-page cart layout used to showcase to clients.
// It reads the REAL cart (useCartStore), so items added through the normal
// flow show up here, and "Secure Checkout" continues to the existing /checkout.
// The original sidebar cart and all existing links are left untouched.
// ---------------------------------------------------------------------------

const MIN_ORDER_VALUE = 500;

export default function SampleCartPage() {
  const router = useRouter();
  const { items, total, itemCount, updateItemQuantity, removeFromCart } =
    useCartStore();

  // The cart hydrates from localStorage on the client; wait for mount so the
  // server-rendered markup and the client match (avoids hydration mismatch).
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const formatPrice = (price) => Number(price).toLocaleString();

  const getBaseTitle = (fullTitle) => {
    if (!fullTitle) return "";
    const parts = fullTitle.split(" x");
    parts.pop();
    return parts.join(" x");
  };

  const handleDecrease = (index, item) => {
    const newQuantity = (item.quantity || 1) - 1;
    updateItemQuantity(index, newQuantity);
    if (newQuantity <= 0) {
      toast.info(`Removed ${getBaseTitle(item.title)} from cart`);
    } else {
      toast.info(`Decreased quantity of ${getBaseTitle(item.title)}`);
    }
  };

  const handleIncrease = (index, item) => {
    updateItemQuantity(index, (item.quantity || 1) + 1);
    toast.success(`Increased quantity of ${getBaseTitle(item.title)}`);
  };

  const handleRemove = (index, item) => {
    removeFromCart(index);
    toast.info(`Removed ${getBaseTitle(item.title)} from cart`);
  };

  const handleCheckout = () => {
    if (total < MIN_ORDER_VALUE) {
      toast.error(`Minimum order value is PKR ${MIN_ORDER_VALUE}.`);
      return;
    }
    router.push("/checkout");
  };

  return (
    <>
      <ToastContainer
        position="bottom-center"
        autoClose={2000}
        hideProgressBar
        newestOnTop
        closeOnClick
        theme="dark"
        style={{ bottom: "80px", width: "auto", maxWidth: "90%" }}
      />

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #dce3f5; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #689537; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #547a2c; }
      `}</style>

      <div className="min-h-screen bg-gray-50 py-8 text-black">
        <div className="max-w-7xl mx-auto px-4">
          <div className="mb-6 bg-[#08320e] text-white text-center text-xs sm:text-sm font-medium py-3 px-4 rounded-lg">
            Same-day delivery is not available. Deliveries are unavailable on Fridays.
          </div>

          {/* Page heading */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-11 h-11 rounded-xl bg-brand-600 flex items-center justify-center">
                <ShoppingBag className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">
                  Your Cart
                </h1>
                <p className="text-sm text-gray-500">
                  {itemCount} {itemCount === 1 ? "item" : "items"} in your cart
                </p>
              </div>
            </div>
          </div>

          {!mounted ? (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center text-gray-400">
              Loading your cart…
            </div>
          ) : items.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <div className="w-28 h-28 mx-auto bg-brand-50 rounded-full flex items-center justify-center mb-6">
                <ShoppingBag className="w-14 h-14 text-brand-300" />
              </div>
              <p className="text-gray-700 text-lg font-medium">
                Your cart is empty
              </p>
              <p className="text-gray-400 mt-2 mb-6">
                Add some fresh groceries to get started
              </p>
              <a
                href="/"
                className="inline-flex items-center px-5 py-2.5 bg-brand-600 text-white rounded-md hover:bg-brand-700 font-medium"
              >
                Start Shopping
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
              {/* Items list */}
              <div className="lg:col-span-2 bg-white rounded-lg shadow-sm divide-y divide-gray-100">
                {items.map((item, index) => {
                  const unitPrice = item.unitPrice || Number(item.price);
                  const totalItemPrice = unitPrice * (item.quantity || 1);
                  const baseTitle = getBaseTitle(item.title);

                  return (
                    <div
                      key={`${item._id || index}-${index}`}
                      className="p-4 sm:p-5 group hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex gap-4">
                        <div className="h-24 w-24 sm:h-28 sm:w-28 rounded-xl overflow-hidden bg-gradient-to-br from-brand-50 to-brand-100 flex-shrink-0 shadow-sm">
                          {item.imageUrl && item.imageUrl !== "" ? (
                            <img
                              src={item.imageUrl}
                              alt={baseTitle}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                              <span className="text-gray-500 text-sm">
                                No Image
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-gray-900 truncate">
                                {baseTitle}
                              </h3>
                              {item.type && (
                                <p className="text-sm text-gray-500 font-medium">
                                  {item.type}
                                </p>
                              )}
                              <p className="text-brand-700 font-semibold mt-1">
                                PKR {formatPrice(totalItemPrice)}
                              </p>
                            </div>

                            {/* Quantity stepper */}
                            <div className="flex items-center border border-gray-200 rounded-full shadow-sm bg-white flex-shrink-0">
                              <button
                                className="w-8 h-8 flex items-center justify-center text-brand-600 rounded-l-full hover:bg-brand-50 transition-colors"
                                onClick={() => handleDecrease(index, item)}
                                aria-label="Decrease quantity"
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                              <span className="w-8 text-center font-medium text-gray-700">
                                {item.quantity || 1}
                              </span>
                              <button
                                className="w-8 h-8 flex items-center justify-center text-brand-600 rounded-r-full hover:bg-brand-50 transition-colors"
                                onClick={() => handleIncrease(index, item)}
                                aria-label="Increase quantity"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {/* Modifications */}
                          {item.modifications && item.modifications.length > 0 && (
                            <div className="mt-2 space-y-1 bg-gray-50 p-2 rounded-md">
                              {item.modifications.map((mod, i) => (
                                <div key={i} className="mb-1">
                                  <p className="text-xs font-medium text-gray-600">
                                    {mod.type}:
                                  </p>
                                  <div className="space-y-0.5 pl-2">
                                    {mod.items.map((modItem, j) => (
                                      <div
                                        key={j}
                                        className="flex justify-between text-xs"
                                      >
                                        <span className="text-gray-600">
                                          • {modItem.name}
                                        </span>
                                        <span className="text-gray-600 font-medium">
                                          +PKR {formatPrice(modItem.price)}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Legacy extras (when no modifications array) */}
                          {!item.modifications &&
                            item.selectedExtras &&
                            item.selectedExtras.length > 0 && (
                              <div className="mt-2 space-y-1 bg-gray-50 p-2 rounded-md">
                                <p className="text-xs font-medium text-gray-600">
                                  Extras:
                                </p>
                                {item.selectedExtras.map((extra, i) => (
                                  <div
                                    key={i}
                                    className="flex justify-between text-xs"
                                  >
                                    <span className="text-gray-600">
                                      • {extra.name}
                                    </span>
                                    <span className="text-gray-600 font-medium">
                                      +PKR {formatPrice(extra.price || 0)}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}

                          {/* Legacy side orders (when no modifications array) */}
                          {!item.modifications &&
                            item.selectedSideOrders &&
                            item.selectedSideOrders.length > 0 && (
                              <div className="mt-2 space-y-1 bg-gray-50 p-2 rounded-md">
                                <p className="text-xs font-medium text-gray-600">
                                  Side Orders:
                                </p>
                                {item.selectedSideOrders.map((sideOrder, i) => (
                                  <div
                                    key={i}
                                    className="flex justify-between text-xs"
                                  >
                                    <span className="text-gray-600">
                                      • {sideOrder.name}
                                    </span>
                                    <span className="text-gray-600 font-medium">
                                      +PKR {formatPrice(sideOrder.price || 0)}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}

                          <div className="mt-2 flex justify-end">
                            <button
                              onClick={() => handleRemove(index, item)}
                              aria-label={`Remove ${baseTitle} from cart`}
                              className="flex items-center text-sm text-brand-600 hover:text-brand-800 transition-colors"
                            >
                              <Trash className="w-4 h-4 mr-1" /> Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                <div className="p-4 bg-gray-50">
                  <a
                    href="/"
                    className="flex items-center justify-center text-brand-700 font-semibold hover:text-brand-800 transition-colors"
                  >
                    <Plus className="w-5 h-5 mr-2 text-brand-600" />
                    Add more items
                  </a>
                </div>
              </div>

              {/* Order summary */}
              <div className="lg:sticky lg:top-8 bg-white rounded-lg p-4 sm:p-6 shadow-sm h-fit">
                <h2 className="text-lg sm:text-xl font-semibold mb-6">
                  Order Summary
                </h2>

                <div className="space-y-3 text-sm sm:text-base text-gray-600 border-t border-b border-gray-200 py-4 mb-4">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>PKR {formatPrice(total)}</span>
                  </div>
                  <p className="text-xs text-gray-400">
                    Discounts, delivery fee and promo codes are applied at
                    checkout.
                  </p>
                </div>

                <div className="flex justify-between text-base sm:text-lg font-semibold">
                  <span>Total</span>
                  <span className="text-brand-600">PKR {formatPrice(total)}</span>
                </div>

                {total < MIN_ORDER_VALUE && (
                  <div className="mt-2 text-xs text-brand-600">
                    Minimum order value is PKR {MIN_ORDER_VALUE}. Please add more
                    items.
                  </div>
                )}

                <button
                  onClick={handleCheckout}
                  disabled={total < MIN_ORDER_VALUE}
                  className="w-full mt-6 bg-brand-600 text-white py-3 rounded-md hover:bg-brand-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <span>Secure Checkout</span>
                  <ChevronRight className="w-5 h-5" />
                </button>

                <a
                  href="/"
                  className="block mt-4 text-center text-brand-500 hover:underline text-sm"
                >
                  ← Continue shopping
                </a>

                <div className="mt-4 text-center text-xs text-gray-400 space-y-1">
                  <p>We Deliver Across Karachi</p>
                  <div className="flex items-center justify-center space-x-2">
                    <span className="text-green-600">✓</span>
                    <span>From 09:00 am to 12:00 am</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
