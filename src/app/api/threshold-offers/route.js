import { NextResponse } from "next/server";
import connectDB from "@/app/lib/mongoose";
import ThresholdOffer from "@/app/models/ThresholdOffer";

export async function GET(request) {
  try {
    await connectDB();
    const url = new URL(request.url);
    const activeOnly = url.searchParams.get("active");

    const query = activeOnly ? { isActive: true } : {};
    const offers = await ThresholdOffer.find(query).sort({ minOrderValue: 1 });
    const plain = offers.map((offer) => offer.toObject({ getters: true }));
    return NextResponse.json(plain, { status: 200 });
  } catch (error) {
    console.error("Error fetching threshold offers:", error);
    return NextResponse.json(
      { error: "Failed to fetch threshold offers" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();
    const { minOrderValue, rewardType, rewardValue, label } = body;

    if (!minOrderValue || Number(minOrderValue) <= 0) {
      return NextResponse.json(
        { error: "Minimum order value must be greater than 0" },
        { status: 400 }
      );
    }

    if (!["free_delivery", "fixed", "percentage"].includes(rewardType)) {
      return NextResponse.json(
        { error: "Invalid reward type" },
        { status: 400 }
      );
    }

    if (rewardType !== "free_delivery" && (!rewardValue || Number(rewardValue) <= 0)) {
      return NextResponse.json(
        { error: "Reward value must be greater than 0" },
        { status: 400 }
      );
    }

    if (rewardType === "percentage" && Number(rewardValue) > 100) {
      return NextResponse.json(
        { error: "Percentage reward cannot exceed 100" },
        { status: 400 }
      );
    }

    const newOffer = new ThresholdOffer({
      minOrderValue: Number(minOrderValue),
      rewardType,
      rewardValue: rewardType === "free_delivery" ? 0 : Number(rewardValue),
      label: label || "",
      isActive: true,
    });
    const created = await newOffer.save();
    return NextResponse.json(
      created.toObject({ getters: true }),
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating threshold offer:", error);
    return NextResponse.json(
      { error: "Failed to create threshold offer" },
      { status: 500 }
    );
  }
}
