import { json } from "@remix-run/node";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function loader({ request }: LoaderFunctionArgs) {
  const { session } = await authenticate.admin(request);
  
  try {
    const shop = session?.shop || "";
    
    const stats = await prisma.wishlistStats.findUnique({
      where: { shop }
    });

    // Get actual counts from database
    const totalItems = await prisma.wishlistItem.count({
      where: { shop }
    });

    const totalCustomers = await prisma.wishlistItem.groupBy({
      by: ['customerId'],
      where: { shop }
    }).then(groups => groups.length);

    return json({
      totalItems,
      totalCustomers,
      updatedAt: stats?.updatedAt || new Date()
    });
  } catch (error) {
    console.error("Error fetching wishlist stats:", error);
    return json({ 
      totalItems: 0, 
      totalCustomers: 0, 
      updatedAt: new Date() 
    });
  }
}