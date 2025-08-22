import { NextRequest, NextResponse } from "next/server";


export async function GET(request: NextRequest) {
  try {
    const handle = request.nextUrl.pathname.split("/").slice(-3)[0];

    const productResponse = await fetch(`${process.env.API_BASE_URL}/products/${handle}/`);
    if (!productResponse.ok) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const product = await productResponse.json();

    const reviewsResponse = await fetch(`${process.env.API_BASE_URL}/products/${product.id}/reviews/`);
    if (!reviewsResponse.ok) {
      return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
    }

    const reviews = await reviewsResponse.json();

    return NextResponse.json(reviews);
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const handle = request.nextUrl.pathname.split("/").slice(-3)[0];
    const body = await request.json();

    const productResponse = await fetch(`${process.env.API_BASE_URL}/products/${handle}/`);
    if (!productResponse.ok) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const product = await productResponse.json();

    const reviewData = {
      product: product.id,
      author_name: body.author_name,
      rating: body.rating,
      comment: body.comment,
      verified_purchase: false
    };

    const reviewResponse = await fetch(`${process.env.API_BASE_URL}/products/${product.id}/reviews/add/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(reviewData),
    });

    if (!reviewResponse.ok) {
      const errorData = await reviewResponse.json();
      return NextResponse.json(errorData, { status: reviewResponse.status });
    }

    const newReview = await reviewResponse.json();
    return NextResponse.json(newReview, { status: 201 });
  } catch (error) {
    console.error("Error adding review:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
