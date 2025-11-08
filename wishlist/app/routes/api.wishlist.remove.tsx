import { json } from "@remix-run/node";
import type { ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function action({ request }: ActionFunctionArgs) {
  let shop = "";
  
  try {
    // Try app proxy authentication first
    const { session } = await authenticate.public.appProxy(request);
    shop = session?.shop || "";
  } catch (error) {
    // If app proxy fails, get the actual shop from the database
    try {
      const latestSession = await prisma.session.findFirst({
        select: { shop: true },
        orderBy: { id: 'desc' }
      });
      shop = latestSession?.shop || "development.myshopify.com";
    } catch (dbError) {
      shop = "development.myshopify.com";
    }
    
    console.log("App proxy auth failed, using shop:", shop);
  }
  
  const formData = await request.formData();
  const customerId = formData.get("customerId") as string;
  const productId = formData.get("productId") as string;

  if (!customerId || !productId) {
    return json({ error: "Missing customerId or productId" }, { status: 400 });
  }

  console.log("Removing from wishlist:", { customerId, productId, shop });

  try {
    // Check if item exists before removing
    const existingItem = await prisma.wishlistItem.findUnique({
      where: {
        customerId_productId_shop: {
          customerId,
          productId,
          shop
        }
      }
    });

    if (existingItem) {
      // Remove from database
      await prisma.wishlistItem.delete({
        where: {
          customerId_productId_shop: {
            customerId,
            productId,
            shop
          }
        }
      });

      // Check if customer has no more items
      const remainingItems = await prisma.wishlistItem.count({
        where: { customerId, shop }
      });
      const customerRemoved = remainingItems === 0;

      // Update stats
      await prisma.wishlistStats.update({
        where: { shop },
        data: {
          totalItems: { decrement: 1 },
          totalCustomers: customerRemoved ? { decrement: 1 } : undefined,
          updatedAt: new Date()
        }
      });
      
      console.log("Item removed successfully");
    } else {
      console.log("Item not found in wishlist");
    }

    // Get updated wishlist
    const wishlist = await prisma.wishlistItem.findMany({
      where: { customerId, shop },
      select: { productId: true }
    });

    return json({ 
      success: true, 
      wishlist: wishlist.map(item => item.productId)
    });
  } catch (error) {
    console.error("Error removing from wishlist:", error);
    return json({ error: "Failed to remove from wishlist", details: String(error) }, { status: 500 });
  }
}
