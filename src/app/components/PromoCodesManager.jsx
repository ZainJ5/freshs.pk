"use client";

import { useState, useEffect } from "react";
import { toast } from "react-toastify";

export default function DiscountManagement() {
  const [activeTab, setActiveTab] = useState("global");

  const [percentage, setPercentage] = useState(10);
  const [isActive, setIsActive] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  const [promoCodes, setPromoCodes] = useState([]);
  const [newCode, setNewCode] = useState("");
  const [newDiscount, setNewDiscount] = useState(10);
  const [newUsageType, setNewUsageType] = useState("multiple");
  const [newMaxRedemptions, setNewMaxRedemptions] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingPromos, setIsLoadingPromos] = useState(false);

  const [thresholdOffers, setThresholdOffers] = useState([]);
  const [newMinOrderValue, setNewMinOrderValue] = useState("");
  const [newRewardType, setNewRewardType] = useState("free_delivery");
  const [newRewardValue, setNewRewardValue] = useState("");
  const [newThresholdLabel, setNewThresholdLabel] = useState("");
  const [isSubmittingThreshold, setIsSubmittingThreshold] = useState(false);
  const [isLoadingThresholds, setIsLoadingThresholds] = useState(false);

  useEffect(() => {
    fetchDiscountSetting();
    fetchPromoCodes();
    fetchThresholdOffers();
  }, []);

  const fetchDiscountSetting = async () => {
    try {
      const res = await fetch("/api/discount");
      if (res.ok) {
        const data = await res.json();
        setPercentage(data.percentage);
        setIsActive(data.isActive);
        setLastUpdated(new Date(data.updatedAt).toLocaleString());
      } else {
        toast.error("Failed to fetch discount setting");
      }
    } catch (error) {
      console.error("Error fetching discount setting:", error);
      toast.error("Error fetching discount setting");
    }
  };

  const handleUpdateDiscount = async (e) => {
    e.preventDefault();
    if (percentage < 0 || percentage > 100) {
      toast.error("Discount percentage must be between 0 and 100");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/discount", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          percentage: Number(percentage),
          isActive,
        }),
      });

      if (res.ok) {
        const updatedSetting = await res.json();
        setLastUpdated(new Date(updatedSetting.updatedAt).toLocaleString());
        toast.success("Discount setting updated successfully");
      } else {
        toast.error("Failed to update discount setting");
      }
    } catch (error) {
      console.error("Error updating discount setting:", error);
      toast.error("Error updating discount setting");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPromoCodes = async () => {
    setIsLoadingPromos(true);
    try {
      const res = await fetch("/api/promocodes");
      if (res.ok) {
        const data = await res.json();
        setPromoCodes(data);
      } else {
        toast.error("Failed to fetch promo codes");
      }
    } catch (error) {
      console.error("Error fetching promo codes:", error);
      toast.error("Error fetching promo codes");
    } finally {
      setIsLoadingPromos(false);
    }
  };

  const handleCreatePromoCode = async (e) => {
    e.preventDefault();
    if (newDiscount <= 0 || newDiscount > 100) {
      toast.error("Discount percentage must be between 1 and 100");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/promocodes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: newCode.toUpperCase(),
          discount: Number(newDiscount),
          usageType: newUsageType,
          maxRedemptions: newMaxRedemptions === "" ? 0 : Number(newMaxRedemptions),
        }),
      });

      if (res.ok) {
        const createdPromo = await res.json();
        setPromoCodes([...promoCodes, createdPromo]);
        setNewCode("");
        setNewDiscount(10);
        setNewUsageType("multiple");
        setNewMaxRedemptions("");
        toast.success("Promo code created successfully");
      } else {
        const error = await res.json();
        toast.error(error.error || "Failed to create promo code");
      }
    } catch (error) {
      console.error("Error creating promo code:", error);
      toast.error("Error creating promo code");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTogglePromoActive = async (promo) => {
    try {
      const res = await fetch(`/api/promocodes/${promo._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !promo.isActive }),
      });
      if (res.ok) {
        const updated = await res.json();
        setPromoCodes(promoCodes.map((p) => (p._id === updated._id ? updated : p)));
      } else {
        toast.error("Failed to update promo code");
      }
    } catch (error) {
      console.error("Error updating promo code:", error);
      toast.error("Error updating promo code");
    }
  };

  const handleDeletePromoCode = async (id) => {
    if (!confirm("Are you sure you want to delete this promo code?")) {
      return;
    }

    try {
      const res = await fetch(`/api/promocodes/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setPromoCodes(promoCodes.filter((promo) => promo._id !== id));
        toast.success("Promo code deleted successfully");
      } else {
        toast.error("Failed to delete promo code");
      }
    } catch (error) {
      console.error("Error deleting promo code:", error);
      toast.error("Error deleting promo code");
    }
  };

  const fetchThresholdOffers = async () => {
    setIsLoadingThresholds(true);
    try {
      const res = await fetch("/api/threshold-offers");
      if (res.ok) {
        const data = await res.json();
        setThresholdOffers(data);
      } else {
        toast.error("Failed to fetch threshold offers");
      }
    } catch (error) {
      console.error("Error fetching threshold offers:", error);
      toast.error("Error fetching threshold offers");
    } finally {
      setIsLoadingThresholds(false);
    }
  };

  const handleCreateThresholdOffer = async (e) => {
    e.preventDefault();
    if (!newMinOrderValue || Number(newMinOrderValue) <= 0) {
      toast.error("Minimum order value must be greater than 0");
      return;
    }
    if (newRewardType !== "free_delivery" && (!newRewardValue || Number(newRewardValue) <= 0)) {
      toast.error("Reward value must be greater than 0");
      return;
    }
    if (newRewardType === "percentage" && Number(newRewardValue) > 100) {
      toast.error("Percentage reward cannot exceed 100");
      return;
    }

    setIsSubmittingThreshold(true);
    try {
      const res = await fetch("/api/threshold-offers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          minOrderValue: Number(newMinOrderValue),
          rewardType: newRewardType,
          rewardValue: newRewardType === "free_delivery" ? 0 : Number(newRewardValue),
          label: newThresholdLabel,
        }),
      });

      if (res.ok) {
        const created = await res.json();
        setThresholdOffers(
          [...thresholdOffers, created].sort((a, b) => a.minOrderValue - b.minOrderValue)
        );
        setNewMinOrderValue("");
        setNewRewardType("free_delivery");
        setNewRewardValue("");
        setNewThresholdLabel("");
        toast.success("Threshold offer created successfully");
      } else {
        const error = await res.json();
        toast.error(error.error || "Failed to create threshold offer");
      }
    } catch (error) {
      console.error("Error creating threshold offer:", error);
      toast.error("Error creating threshold offer");
    } finally {
      setIsSubmittingThreshold(false);
    }
  };

  const handleToggleThresholdActive = async (offer) => {
    try {
      const res = await fetch(`/api/threshold-offers/${offer._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !offer.isActive }),
      });
      if (res.ok) {
        const updated = await res.json();
        setThresholdOffers(
          thresholdOffers.map((o) => (o._id === updated._id ? updated : o))
        );
      } else {
        toast.error("Failed to update threshold offer");
      }
    } catch (error) {
      console.error("Error updating threshold offer:", error);
      toast.error("Error updating threshold offer");
    }
  };

  const handleDeleteThresholdOffer = async (id) => {
    if (!confirm("Are you sure you want to delete this threshold offer?")) {
      return;
    }
    try {
      const res = await fetch(`/api/threshold-offers/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setThresholdOffers(thresholdOffers.filter((o) => o._id !== id));
        toast.success("Threshold offer deleted successfully");
      } else {
        toast.error("Failed to delete threshold offer");
      }
    } catch (error) {
      console.error("Error deleting threshold offer:", error);
      toast.error("Error deleting threshold offer");
    }
  };

  const describeReward = (offer) => {
    if (offer.rewardType === "free_delivery") return "Free delivery";
    if (offer.rewardType === "percentage") return `${offer.rewardValue}% off`;
    if (offer.rewardType === "fixed") return `PKR ${offer.rewardValue} off`;
    return "-";
  };

  const tabClass = (tab) =>
    `py-4 px-1 ${
      activeTab === tab
        ? "border-b-2 border-red-500 text-red-600"
        : "border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
    } font-medium text-sm sm:text-base`;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Discount Management</h1>

      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-6">
            <button onClick={() => setActiveTab("global")} className={tabClass("global")}>
              Global Discount
            </button>
            <button onClick={() => setActiveTab("promo")} className={tabClass("promo")}>
              Promo Codes
            </button>
            <button onClick={() => setActiveTab("thresholds")} className={tabClass("thresholds")}>
              Order Thresholds
            </button>
          </nav>
        </div>
      </div>

      {activeTab === "global" && (
        <div className="p-4 max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">Global Discount Setting</h2>

          <div className="bg-white rounded-lg shadow-md p-6">
            <form onSubmit={handleUpdateDiscount} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Discount Percentage
                </label>
                <div className="flex items-center">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={percentage}
                    onChange={(e) => setPercentage(e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                    required
                  />
                  <span className="ml-2 text-gray-700">%</span>
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  Set the discount percentage (0-100%)
                </p>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                />
                <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
                  Enable discount
                </label>
              </div>

              {lastUpdated && (
                <div className="text-sm text-gray-500">
                  Last updated: {lastUpdated}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
              >
                {isLoading ? "Updating..." : "Update Discount Setting"}
              </button>
            </form>

            <div className="mt-6 p-4 bg-gray-50 rounded-md">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Current Discount Status</h3>
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${isActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-gray-700">
                  {isActive
                    ? `Active - ${percentage}% discount on all orders`
                    : 'Inactive - No discount applied'}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <h3 className="text-md font-medium text-yellow-800 mb-2">About Global Discount</h3>
            <p className="text-sm text-yellow-700">
              This discount applies to all orders on the website.
              When enabled, customers will automatically receive the specified discount percentage on their order total.
            </p>
          </div>
        </div>
      )}

      {activeTab === "promo" && (
        <div className="p-4 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">Promo Code Management</h2>

          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <form onSubmit={handleCreatePromoCode} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Promo Code
                  </label>
                  <input
                    type="text"
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                    placeholder="SUMMER2025"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Discount Percentage
                  </label>
                  <div className="flex items-center">
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={newDiscount}
                      onChange={(e) => setNewDiscount(e.target.value)}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                      required
                    />
                    <span className="ml-2 text-gray-700">%</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Usage Type
                  </label>
                  <select
                    value={newUsageType}
                    onChange={(e) => setNewUsageType(e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                  >
                    <option value="multiple">Multiple use</option>
                    <option value="single">Single use (once per customer)</option>
                  </select>
                  <p className="mt-1 text-xs text-gray-500">
                    Single use is enforced per customer mobile number.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Redemptions
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newMaxRedemptions}
                    onChange={(e) => setNewMaxRedemptions(e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                    placeholder="Leave blank for unlimited"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Total times this code can be redeemed (blank = unlimited).
                  </p>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
              >
                {isSubmitting ? "Creating..." : "Create Promo Code"}
              </button>
            </form>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Promo Codes</h3>

            {isLoadingPromos ? (
              <div className="text-center py-4">Loading promo codes...</div>
            ) : promoCodes.length === 0 ? (
              <div className="text-center py-4 text-gray-500">No promo codes found</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Discount</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usage</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Redeemed</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {promoCodes.map((promo) => (
                      <tr key={promo._id}>
                        <td className="px-4 py-4 whitespace-nowrap font-medium">{promo.code}</td>
                        <td className="px-4 py-4 whitespace-nowrap">{promo.discount}%</td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm">
                          {promo.usageType === "single" ? "Single / customer" : "Multiple"}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm">
                          {promo.totalRedemptions || 0}
                          {promo.maxRedemptions > 0 ? ` / ${promo.maxRedemptions}` : ""}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <button
                            onClick={() => handleTogglePromoActive(promo)}
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              promo.isActive
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-200 text-gray-600"
                            }`}
                          >
                            {promo.isActive ? "Active" : "Inactive"}
                          </button>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-right">
                          <button
                            onClick={() => handleDeletePromoCode(promo._id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <h3 className="text-md font-medium text-yellow-800 mb-2">About Promo Codes</h3>
            <p className="text-sm text-yellow-700">
              Promo codes can be applied at checkout. A <span className="font-medium">single-use</span> code can be
              redeemed only once per customer (matched by mobile number), and an optional max-redemptions cap limits the
              total number of redemptions. Codes auto-deactivate once the cap is reached, and can be toggled active/inactive at any time.
            </p>
          </div>
        </div>
      )}

      {activeTab === "thresholds" && (
        <div className="p-4 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">Order Threshold Offers</h2>

          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <form onSubmit={handleCreateThresholdOffer} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Minimum Order Value (PKR )
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newMinOrderValue}
                    onChange={(e) => setNewMinOrderValue(e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                    placeholder="2000"
                    required
                  />
                  <p className="mt-1 text-xs text-gray-500">Applies when subtotal reaches this value.</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reward Type
                  </label>
                  <select
                    value={newRewardType}
                    onChange={(e) => setNewRewardType(e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                  >
                    <option value="free_delivery">Free delivery</option>
                    <option value="percentage">Percentage off</option>
                    <option value="fixed">Fixed amount off</option>
                  </select>
                </div>
              </div>

              {newRewardType !== "free_delivery" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {newRewardType === "percentage" ? "Discount Percentage" : "Discount Amount (PKR )"}
                  </label>
                  <div className="flex items-center">
                    <input
                      type="number"
                      min="1"
                      max={newRewardType === "percentage" ? "100" : undefined}
                      value={newRewardValue}
                      onChange={(e) => setNewRewardValue(e.target.value)}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                      placeholder={newRewardType === "percentage" ? "10" : "200"}
                      required
                    />
                    <span className="ml-2 text-gray-700">
                      {newRewardType === "percentage" ? "%" : "PKR"}
                    </span>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Label (optional)
                </label>
                <input
                  type="text"
                  value={newThresholdLabel}
                  onChange={(e) => setNewThresholdLabel(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                  placeholder="e.g. Free delivery on orders above PKR 2000"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmittingThreshold}
                className="w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
              >
                {isSubmittingThreshold ? "Creating..." : "Create Threshold Offer"}
              </button>
            </form>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Threshold Offers</h3>

            {isLoadingThresholds ? (
              <div className="text-center py-4">Loading threshold offers...</div>
            ) : thresholdOffers.length === 0 ? (
              <div className="text-center py-4 text-gray-500">No threshold offers found</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Min Order</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reward</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Label</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {thresholdOffers.map((offer) => (
                      <tr key={offer._id}>
                        <td className="px-4 py-4 whitespace-nowrap font-medium">PKR {offer.minOrderValue}</td>
                        <td className="px-4 py-4 whitespace-nowrap">{describeReward(offer)}</td>
                        <td className="px-4 py-4 text-sm text-gray-600">{offer.label || "-"}</td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <button
                            onClick={() => handleToggleThresholdActive(offer)}
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              offer.isActive
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-200 text-gray-600"
                            }`}
                          >
                            {offer.isActive ? "Active" : "Inactive"}
                          </button>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-right">
                          <button
                            onClick={() => handleDeleteThresholdOffer(offer._id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <h3 className="text-md font-medium text-yellow-800 mb-2">About Order Thresholds</h3>
            <p className="text-sm text-yellow-700">
              Threshold offers reward larger orders automatically based on the cart subtotal. When an order qualifies for
              multiple tiers, only the highest tier applies, and it stacks on top of the global discount and any promo code.
            </p>
          </div>
        </div>
      )}

      <div className="mt-8 p-5 bg-gray-50 border border-gray-200 rounded-md max-w-3xl mx-auto">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Discount Strategy Guide</h2>
        <div className="space-y-4 text-gray-700">
          <p>
            <span className="font-medium">Global Discount:</span> Applies to all orders automatically. Use this for
            site-wide sales or seasonal promotions.
          </p>
          <p>
            <span className="font-medium">Promo Codes:</span> Customer-activated discounts that require a code at checkout.
            Ideal for targeted marketing campaigns, email subscribers, or special customer segments.
          </p>
          <p>
            <span className="font-medium">Order Thresholds:</span> Automatic rewards for larger orders (e.g. free delivery
            above PKR 2000 or 10% off above PKR 3000), encouraging customers to spend more.
          </p>
        </div>
      </div>
    </div>
  );
}
