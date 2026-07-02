"use client";

import { useState } from "react";
import { Plus, Minus, Trash, ChevronRight, Tag, ShoppingBag, X } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// ---------------------------------------------------------------------------
// NOTE: This is a standalone DEMO page (/sample) used to showcase a full-page
// cart layout to prospective clients. It uses local dummy data and its own
// state, so it never touches the real cart store or backend.
// ---------------------------------------------------------------------------

const MIN_ORDER_VALUE = 500;
const DELIVERY_FEE = 150;
const GLOBAL_DISCOUNT_PERCENT = 10;

// Dummy promo codes for the demo. Try "FRESH20".
const DEMO_PROMOS = {
  FRESH20: 20,
  SAVE10: 10,
};

const INITIAL_ITEMS = [
  {
    _id: "d1",
    title: "Chicken Biryani",
    type: "Family Pack",
    unitPrice: 850,
    quantity: 2,
    imageUrl:
      "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=400&q=80",
    modifications: [
      {
        type: "Extras",
        items: [
          { name: "Extra Raita", price: 60 },
          { name: "Salad", price: 40 },
        ],
      },
    ],
  },
  {
    _id: "d2",
    title: "Beef Cheese Burger",
    type: "Large",
    unitPrice: 650,
    quantity: 1,
    imageUrl:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=400&q=80",
    modifications: [
      {
        type: "Sides",
        items: [{ name: "Loaded Fries", price: 200 }],
      },
    ],
  },
  {
    _id: "d3",
    title: "Chicken Tikka Pizza",
    type: "Medium",
    unitPrice: 1200,
    quantity: 1,
    imageUrl:
      "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=400&q=80",
    modifications: null,
  },
  {
    _id: "d4",
    title: "Fresh Lime Soda",
    type: null,
    unitPrice: 180,
    quantity: 3,
    imageUrl:
      "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=400&q=80",
    modifications: null,
  },
];

export default function SampleCartPage() {
  const [items, setItems] = useState(INITIAL_ITEMS);
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState(null); // { code, discount }

  const formatPrice = (price) => Number(price).toLocaleString();

  const modPrice = (item) =>
    (item.modifications || []).reduce(
      (sum, mod) => sum + mod.items.reduce((s, m) => s + (m.price || 0), 0),
      0
    );

  const lineTotal = (item) => (item.unitPrice + modPrice(item)) * item.quantity;

  const subtotal = items.reduce((sum, item) => sum + lineTotal(item), 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const globalDiscount = Math.round(subtotal * (GLOBAL_DISCOUNT_PERCENT / 100));
  const promoDiscount = appliedPromo
    ? Math.round(subtotal * (appliedPromo.discount / 100))
    : 0;
  const totalDiscount = globalDiscount + promoDiscount;
  const deliveryFee = items.length > 0 ? DELIVERY_FEE : 0;
  const grandTotal = Math.max(0, subtotal + deliveryFee - totalDiscount);

  const handleIncrease = (index) => {
    setItems((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
    toast.success(`Increased quantity of ${items[index].title}`);
  };

  const handleDecrease = (index) => {
    const item = items[index];
    if (item.quantity <= 1) {
      handleRemove(index);
      return;
    }
    setItems((prev) =>
      prev.map((it, i) =>
        i === index ? { ...it, quantity: it.quantity - 1 } : it
      )
    );
    toast.info(`Decreased quantity of ${item.title}`);
  };

  const handleRemove = (index) => {
    const item = items[index];
    setItems((prev) => prev.filter((_, i) => i !== index));
    toast.info(`Removed ${item.title} from cart`);
  };

  const handleReset = () => {
    setItems(INITIAL_ITEMS);
    setAppliedPromo(null);
    setPromoCode("");
    toast.info("Cart reset to demo items");
  };

  const handleApplyPromo = () => {
    const code = promoCode.trim().toUpperCase();
    if (!code) {
      toast.error("Please enter a promo code");
      return;
    }
    const discount = DEMO_PROMOS[code];
    if (!discount) {
      toast.error("Invalid promo code (try FRESH20)");
      return;
    }
    setAppliedPromo({ code, discount });
    setPromoCode("");
    toast.success(`Promo ${code} applied! ${discount}% off`);
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    toast.info("Promo code removed");
  };

  const handleCheckout = () => {
    if (subtotal < MIN_ORDER_VALUE) {
      toast.error(`Minimum order value is PKR ${MIN_ORDER_VALUE}.`);
      return;
    }
    toast.success("This is a demo — checkout is disabled.");
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
          {/* Demo banner */}
          <div className="mb-6 bg-[#08320e] text-white text-center text-xs sm:text-sm font-medium py-3 px-4 rounded-lg">
            Sample full-page cart — demo layout with dummy items.
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
            <button
              onClick={handleReset}
              className="text-sm text-brand-600 hover:text-brand-800 font-medium"
            >
              Reset demo
            </button>
          </div>

          {items.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <div className="w-28 h-28 mx-auto bg-brand-50 rounded-full flex items-center justify-center mb-6">
                <ShoppingBag className="w-14 h-14 text-brand-300" />
              </div>
              <p className="text-gray-700 text-lg font-medium">
                Your cart is empty
              </p>
              <p className="text-gray-400 mt-2 mb-6">
                Add some delicious items to get started
              </p>
              <button
                onClick={handleReset}
                className="inline-flex items-center px-5 py-2.5 bg-brand-600 text-white rounded-md hover:bg-brand-700 font-medium"
              >
                Load demo items
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
              {/* Items list */}
              <div className="lg:col-span-2 bg-white rounded-lg shadow-sm divide-y divide-gray-100">
                {items.map((item, index) => (
                  <div
                    key={`${item._id}-${index}`}
                    className="p-4 sm:p-5 group hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex gap-4">
                      <div className="h-24 w-24 sm:h-28 sm:w-28 rounded-xl overflow-hidden bg-gradient-to-br from-brand-50 to-brand-100 flex-shrink-0 shadow-sm">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.title}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                            <span className="text-gray-500 text-sm">No Image</span>
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 truncate">
                              {item.title}
                            </h3>
                            {item.type && (
                              <p className="text-sm text-gray-500 font-medium">
                                {item.type}
                              </p>
                            )}
                            <p className="text-brand-700 font-semibold mt-1">
                              PKR {formatPrice(lineTotal(item))}
                            </p>
                            <p className="text-xs text-gray-400">
                              PKR {formatPrice(item.unitPrice + modPrice(item))} each
                            </p>
                          </div>

                          {/* Quantity stepper */}
                          <div className="flex items-center border border-gray-200 rounded-full shadow-sm bg-white flex-shrink-0">
                            <button
                              className="w-8 h-8 flex items-center justify-center text-brand-600 rounded-l-full hover:bg-brand-50 transition-colors"
                              onClick={() => handleDecrease(index)}
                              aria-label="Decrease quantity"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="w-8 text-center font-medium text-gray-700">
                              {item.quantity}
                            </span>
                            <button
                              className="w-8 h-8 flex items-center justify-center text-brand-600 rounded-r-full hover:bg-brand-50 transition-colors"
                              onClick={() => handleIncrease(index)}
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

                        <div className="mt-2 flex justify-end">
                          <button
                            onClick={() => handleRemove(index)}
                            aria-label={`Remove ${item.title} from cart`}
                            className="flex items-center text-sm text-brand-600 hover:text-brand-800 transition-colors"
                          >
                            <Trash className="w-4 h-4 mr-1" /> Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

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

                {/* Promo code */}
                <div className="mb-6 p-4 border border-gray-200 rounded-md bg-gray-50">
                  <div className="flex items-center mb-3">
                    <Tag className="text-brand-500 mr-2 w-4 h-4" />
                    <span className="font-medium">Promo Code</span>
                  </div>
                  {appliedPromo ? (
                    <div className="bg-green-50 border border-green-200 rounded-md p-3">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <span className="font-medium text-green-700">
                            {appliedPromo.code}
                          </span>
                          <span className="ml-2 text-sm bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                            {appliedPromo.discount}% off
                          </span>
                        </div>
                        <button
                          onClick={handleRemovePromo}
                          className="text-sm text-brand-600 hover:text-brand-800 font-medium flex items-center"
                        >
                          <X className="w-3.5 h-3.5 mr-0.5" /> Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          value={promoCode}
                          onChange={(e) =>
                            setPromoCode(e.target.value.toUpperCase())
                          }
                          onKeyDown={(e) =>
                            e.key === "Enter" && handleApplyPromo()
                          }
                          placeholder="Enter promo code"
                          className="flex-1 px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                        />
                        <button
                          onClick={handleApplyPromo}
                          disabled={!promoCode.trim()}
                          className="px-4 py-2 bg-brand-600 text-white rounded-md hover:bg-brand-700 disabled:opacity-50"
                        >
                          Apply
                        </button>
                      </div>
                      <p className="mt-2 text-xs text-gray-600 bg-gray-100 p-2 rounded-md">
                        <span className="font-medium">Tip:</span> try code{" "}
                        <span className="font-semibold">FRESH20</span> for 20% off.
                      </p>
                    </div>
                  )}
                </div>

                {/* Totals */}
                <div className="space-y-3 text-sm sm:text-base text-gray-600 border-t border-b border-gray-200 py-4 mb-4">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>PKR {formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery Fee</span>
                    <span>PKR {formatPrice(deliveryFee)}</span>
                  </div>
                  {globalDiscount > 0 && (
                    <div className="flex justify-between text-yellow-600 font-medium">
                      <span>Global Discount ({GLOBAL_DISCOUNT_PERCENT}%)</span>
                      <span>- PKR {formatPrice(globalDiscount)}</span>
                    </div>
                  )}
                  {promoDiscount > 0 && (
                    <div className="flex justify-between text-green-600 font-medium">
                      <span>Promo Discount ({appliedPromo.discount}%)</span>
                      <span>- PKR {formatPrice(promoDiscount)}</span>
                    </div>
                  )}
                  {totalDiscount > 0 && (
                    <div className="flex justify-between text-brand-600 font-bold">
                      <span>Total Discount</span>
                      <span>- PKR {formatPrice(totalDiscount)}</span>
                    </div>
                  )}
                </div>

                <div className="flex justify-between text-base sm:text-lg font-semibold">
                  <span>Grand Total</span>
                  <span className="text-brand-600">
                    PKR {formatPrice(grandTotal)}
                  </span>
                </div>

                {totalDiscount > 0 && (
                  <div className="mt-2 text-xs text-green-600 bg-green-50 p-2 rounded-md text-center">
                    You saved PKR {formatPrice(totalDiscount)} on this order!
                  </div>
                )}

                {subtotal < MIN_ORDER_VALUE && (
                  <div className="mt-2 text-xs text-brand-600">
                    Minimum order value is PKR {MIN_ORDER_VALUE}. Please add more
                    items.
                  </div>
                )}

                <button
                  onClick={handleCheckout}
                  disabled={subtotal < MIN_ORDER_VALUE}
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
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
