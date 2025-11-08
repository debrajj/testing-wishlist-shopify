# Complete Wishlist Setup Guide

## Current Issue
Your wishlist buttons use localStorage instead of connecting to your app backend, so clicks don't appear in the real-time dashboard.

---

## Fix Steps

### Step 1: Configure App Proxy (CRITICAL!)

The app proxy is already configured in `shopify.app.toml`:

```toml
[app_proxy]
url = "https://example.com"
subpath = "wishlist"
prefix = "apps"
```

This creates the route: `https://your-store.myshopify.com/apps/wishlist/*`

**You need to deploy this configuration:**

```bash
cd wishlist
npm run deploy
```

When prompted, select your store: **testing-appx.myshopify.com**

---

### Step 2: Update Theme JavaScript

1. Go to **Shopify Admin > Online Store > Themes**
2. Click **Actions > Edit code**
3. Open **snippets/card-product.liquid**
4. Scroll to the bottom (around line 500+)
5. Find this OLD code:

```javascript
<script>
function toggleWishlist(btn, productId) {
  btn.classList.toggle('active');
  let wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
  // ... localStorage code
}
</script>
```

6. **DELETE** the entire `<script>...</script>` block
7. **PASTE** the new code from `FIXED_CARD_PRODUCT_SCRIPT.liquid`

---

### Step 3: Start Your App

```bash
cd wishlist
npm run dev
```

Make sure it connects to **testing-appx.myshopify.com**

---

### Step 4: Test

1. **Clear browser cache** (Cmd+Shift+R on Mac, Ctrl+Shift+R on Windows)
2. **Log in** to your store as a customer
3. **Visit a product collection page**
4. **Click the heart icon** on a product card
5. **Check your app dashboard** - the count should update in real-time!

---

## How It Works

### Before (localStorage):
```
Customer clicks heart → Saves to browser localStorage → ❌ No backend connection
```

### After (API):
```
Customer clicks heart → POST to /apps/wishlist/api/wishlist/add → 
Saves to Shopify metafield → ✅ Dashboard updates in real-time
```

---

## API Endpoints

Your app exposes these endpoints via app proxy:

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/apps/wishlist/api/wishlist/add` | POST | Add product to wishlist |
| `/apps/wishlist/api/wishlist/remove` | POST | Remove product from wishlist |
| `/apps/wishlist/api/wishlist/get` | GET | Get customer's wishlist |

---

## Troubleshooting

### Problem: Buttons don't appear
**Solution:** Make sure you're logged in as a customer (not just browsing as guest)

### Problem: Clicks don't register
**Check:**
1. Is your app running? (`npm run dev`)
2. Is app proxy deployed? (`npm run deploy`)
3. Open browser DevTools (F12) → Network tab → Click heart → Do you see API calls?

### Problem: Dashboard doesn't update
**Check:**
1. Is Socket.io connected? (Check browser console)
2. Is the app running on the correct store?
3. Look at app terminal for errors

### Problem: "Failed to add to wishlist" error
**Check:**
1. Customer metafield definition exists in Shopify
2. App has `write_customers` scope
3. Check app terminal for GraphQL errors

---

## Store Configuration

Your app should be running on: **testing-appx.myshopify.com**

To verify/change:
```bash
cd wishlist
npm run shopify app config link
```

---

## Next Steps

After fixing the JavaScript:

1. ✅ Wishlist clicks will save to Shopify metafields
2. ✅ Dashboard will show real-time counts
3. ✅ Data persists across devices (not just localStorage)
4. ✅ You can build features like:
   - Email notifications when wishlisted items go on sale
   - Analytics on most-wishlisted products
   - Customer segmentation based on wishlist behavior
