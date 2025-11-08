# Test Wishlist Functionality

## Current Status:
✅ App is running
✅ Dashboard is showing (Total Items: 0, Active Customers: 0)
✅ Socket.io status showing (currently Offline - will connect when data flows)

---

## How to Test:

### Option 1: Test from Theme (Recommended)

1. **Go to your Shopify Admin:**
   ```
   https://wishlist-track-new.myshopify.com/admin
   ```

2. **Edit your theme:**
   - Go to: Online Store > Themes
   - Click: Actions > Edit code
   - Open: `snippets/card-product.liquid`

3. **Update the file:**
   - Copy ALL content from `card-product-COMPLETE-FIXED.liquid`
   - Paste it into your theme's `card-product.liquid`
   - Click Save

4. **Test on storefront:**
   - Create a customer account (or log in as existing customer)
   - Go to a collection page with products
   - Click the heart icon on a product
   - Open browser console (F12) to see debug messages

---

### Option 2: Test API Directly (Advanced)

Since the app uses Shopify App Proxy, you need to test through the store URL:

**Test Get Wishlist:**
```bash
# Replace 123 with a real customer ID from your store
curl "https://wishlist-track-new.myshopify.com/apps/wishlist/api/wishlist/get?customerId=123"
```

**Test Add to Wishlist:**
```bash
curl -X POST "https://wishlist-track-new.myshopify.com/apps/wishlist/api/wishlist/add" \
  -d "customerId=123" \
  -d "productId=456"
```

---

## What Should Happen:

### When you click the heart icon:

1. **Browser Console shows:**
   ```
   Toggle wishlist clicked: 7891234567890
   Sending to: /apps/wishlist/api/wishlist/add Customer: 123456
   Response: {success: true, wishlist: ["7891234567890"]}
   ```

2. **Heart icon fills with red color**

3. **Dashboard updates in real-time:**
   - Total Items: 1
   - Active Customers: 1
   - Socket.io status: Connected (green)

4. **Click again to remove:**
   - Heart becomes outline again
   - Dashboard decrements count

---

## Troubleshooting:

### Dashboard shows "Offline"
- This is normal until data starts flowing
- Once you add an item, it will show "Connected"

### Heart icon opens product page instead of adding to wishlist
- Make sure you updated the onclick attribute:
  ```liquid
  onclick="event.stopPropagation(); event.preventDefault(); toggleWishlist(this, {{ card_product.id }}); return false;"
  ```

### No heart icon visible
- You need to be logged in as a customer (not guest)
- The button is hidden for non-logged-in users

### API returns error
- Check app is still running (terminal should show "Ready, watching for changes")
- Verify customer ID is valid
- Check app terminal for error messages

---

## Quick Debug Checklist:

- [ ] App is running (`npm run dev` in terminal)
- [ ] Dashboard is accessible and showing timestamp updates
- [ ] Theme code is updated with fixed JavaScript
- [ ] Logged in as customer on storefront
- [ ] Browser console is open (F12) to see debug messages
- [ ] Heart icon is visible on product cards
- [ ] Clicking heart doesn't navigate to product page

---

## Expected Flow:

```
Customer clicks heart 
  ↓
JavaScript prevents page navigation
  ↓
POST to /apps/wishlist/api/wishlist/add
  ↓
App saves to Shopify customer metafield
  ↓
Response: {success: true}
  ↓
Heart fills with red color
  ↓
Dashboard updates via Socket.io
  ↓
Total Items: 1, Active Customers: 1
```

---

## Next Steps:

1. Update your theme with the fixed code
2. Test by clicking heart icons
3. Watch the dashboard update in real-time
4. Share any errors you see in browser console

The app is ready and waiting for wishlist data! 🎉
