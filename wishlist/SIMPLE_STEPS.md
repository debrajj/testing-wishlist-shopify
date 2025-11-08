# Simple Fix Steps - Wishlist Not Working

## What to Do

Open `FIXED_CARD_PRODUCT_SCRIPT.liquid` - it has EVERYTHING you need.

---

## Step 1: Update Button (Line ~60)

In your `card-product.liquid`, find the wishlist button and change ONLY the onclick:

**BEFORE:**
```liquid
onclick="toggleWishlist(this, {{ card_product.id }})"
```

**AFTER:**
```liquid
onclick="event.stopPropagation(); event.preventDefault(); toggleWishlist(this, {{ card_product.id }}); return false;"
```

Or copy the complete button from `FIXED_CARD_PRODUCT_SCRIPT.liquid`

---

## Step 2: Replace Script (Line ~500)

At the end of `card-product.liquid`, replace the entire `<script>...</script>` section with the script from `FIXED_CARD_PRODUCT_SCRIPT.liquid`

---

## Step 3: Test

1. Save file
2. Clear browser cache (Cmd+Shift+R)
3. Open browser console (F12)
4. Click heart icon
5. Check console for messages:
   - "Toggle wishlist clicked: 123456"
   - "Sending to: /apps/wishlist/api/wishlist/add"
   - "Response: {success: true, ...}"

---

## What This Fixes

✅ Button won't open product page anymore
✅ Clicks will save to your app backend
✅ Dashboard will update in real-time
✅ Console logs help you debug

---

## Need Help?

Share the console messages (F12) and I'll help debug!
