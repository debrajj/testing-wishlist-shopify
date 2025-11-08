# Fix Card Product Wishlist - Connect to Backend

## Problem
Your wishlist button uses `localStorage` instead of connecting to your app's API, so clicks don't show up in the real-time dashboard.

## Solution
Replace the JavaScript at the end of your `card-product.liquid` file.

---

## Step-by-Step Instructions

### 1. Open Your Theme File
In Shopify Admin:
- Go to **Online Store > Themes**
- Click **Actions > Edit code** on your active theme
- Navigate to **snippets/card-product.liquid**

### 2. Find the OLD JavaScript (Around Line 500+)
Look for this code at the very end:

```liquid
<script>
function toggleWishlist(btn, productId) {
  btn.classList.toggle('active');
  // Get current wishlist from localStorage
  let wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
  ...
}
...
</script>
```

### 3. DELETE Everything From `<script>` to `</script>`

### 4. PASTE the New Code
Copy the entire content from `FIXED_CARD_PRODUCT_SCRIPT.liquid` and paste it.

---

## What Changed?

### OLD (localStorage - doesn't connect to app):
```javascript
let wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
localStorage.setItem('wishlist', JSON.stringify(wishlist));
```

### NEW (API calls - connects to your app):
```javascript
fetch('/apps/wishlist/api/wishlist/add', { 
  method: 'POST', 
  body: formData 
})
```

---

## Key Features of New Code

✅ **Connects to your app's API endpoints**
- `/apps/wishlist/api/wishlist/add`
- `/apps/wishlist/api/wishlist/remove`
- `/apps/wishlist/api/wishlist/get`

✅ **Real-time updates** - Data flows to your dashboard immediately

✅ **Customer-specific** - Uses `{{ customer.id }}` to track per-user wishlists

✅ **Hides for guests** - Only logged-in customers see wishlist buttons

✅ **Works with AJAX** - Handles dynamically loaded products

---

## Testing

After making the change:

1. **Clear your browser cache** (important!)
2. **Log in** to your store as a customer
3. **Click a wishlist button** on any product
4. **Check your app dashboard** - you should see the count update in real-time

---

## Troubleshooting

**Buttons don't appear?**
- Make sure you're logged in as a customer
- Check browser console for errors (F12)

**Clicks don't register?**
- Verify your app is running: `npm run dev`
- Check the app URL matches your store
- Look at browser Network tab to see if API calls are being made

**Dashboard doesn't update?**
- Ensure Socket.io is working in your app
- Check the app console for connection errors
