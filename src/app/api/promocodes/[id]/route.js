import { NextResponse } from "next/server";
import connectDB from "@/app/lib/mongoose";
import PromoCode from "@/app/models/PromoCode";

export async function PATCH(request, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await request.json();

    const update = {};
    if (body.isActive !== undefined) update.isActive = !!body.isActive;
    if (body.discount !== undefined) update.discount = Number(body.discount);
    if (body.usageType !== undefined)
      update.usageType = body.usageType === "single" ? "single" : "multiple";
    if (body.maxRedemptions !== undefined)
      update.maxRedemptions = Math.max(0, Number(body.maxRedemptions) || 0);
    if (body.resetUsage) {
      update.totalRedemptions = 0;
      update.redeemedMobiles = [];
    }

    const updatedPromo = await PromoCode.findByIdAndUpdate(id, update, {
      new: true,
    });
    if (!updatedPromo) {
      return NextResponse.json(
        { error: "Promo code not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      updatedPromo.toObject({ getters: true }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating promo code:", error);
    return NextResponse.json(
      { error: "Failed to update promo code" },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const deletedPromo = await PromoCode.findByIdAndDelete(id);
    if (!deletedPromo) {
      return NextResponse.json(
        { error: "Promo code not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { message: "Promo code deleted" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting promo code:", error);
    return NextResponse.json(
      { error: "Failed to delete promo code" },
      { status: 500 }
    );
  }
}
