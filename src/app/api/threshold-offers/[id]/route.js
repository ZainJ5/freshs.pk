import { NextResponse } from "next/server";
import connectDB from "@/app/lib/mongoose";
import ThresholdOffer from "@/app/models/ThresholdOffer";

export async function PATCH(request, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await request.json();

    const update = {};
    if (body.isActive !== undefined) update.isActive = !!body.isActive;
    if (body.minOrderValue !== undefined)
      update.minOrderValue = Number(body.minOrderValue);
    if (body.rewardType !== undefined) update.rewardType = body.rewardType;
    if (body.rewardValue !== undefined)
      update.rewardValue = Number(body.rewardValue);
    if (body.label !== undefined) update.label = body.label;

    const updated = await ThresholdOffer.findByIdAndUpdate(id, update, {
      new: true,
    });
    if (!updated) {
      return NextResponse.json(
        { error: "Threshold offer not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      updated.toObject({ getters: true }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating threshold offer:", error);
    return NextResponse.json(
      { error: "Failed to update threshold offer" },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const deleted = await ThresholdOffer.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json(
        { error: "Threshold offer not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { message: "Threshold offer deleted" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting threshold offer:", error);
    return NextResponse.json(
      { error: "Failed to delete threshold offer" },
      { status: 500 }
    );
  }
}
