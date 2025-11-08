# ⚠️ FIX: Replace Your Wishlist JavaScript

## Problem

Your current code uses `localStorage` which only saves in the browser. It doesn't connect to your wishlist app.

## Solution

Replace the entire `<script>` section at the end of your `card-product.liquid` file.

---

## ❌ REMOVE THIS (Current Code):

```liquid
<script>
function toggleWishlist(btn, productId) {
  btn.classList.toggle('active');
  // Get current wishlist from localStorage
  let wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
  if (btn.classList.contains('active')) {
    // Add to wishlist
    if (!wishlist.includes(productId)) {
      wishlist.push(productId);
    }
    btn.setAttribute('aria-label', btn.getAttribute('aria-label').replace('Add', 'Remove'));
  } else {
    // Remove from wishlist
    wishlist = wishlist.filter(id => id !== productId);
    btn.setAttribute('aria-label', btn.getAttribute('aria-label').replace('Remove', 'Add'));
  }
  // Save to localStorage
  localStorage.setItem('wishlist', JSON.stringify(wishlist));
}

// Initialize wishlist state on page load
document.addEventListener('DOMContentLoaded', function() {
  let wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
  document.querySelectorAll('.wishlist-btn').forEach(btn => {
    const productId = parseInt(btn.getAttribute('data-product-id'));
    if (wishlist.includes(productId)) {
      btn.classList.add('active');
      btn.setAttribute('aria-label', btn.getAttribute('aria-label').replace('Add', 'Remove'));
    }
  });
});
</script>
```

---

## ✅ REPLACE WITH THIS (Connects to Your App):

```liquid
<script>
(function() {
  const customerId = {{ customer.id | json }};
  
  if (!customerId) {
    // Hide wishlist buttons for non-logged-in users
    document.querySelectorAll('.wishlist-btn').forEach(btn => {
      btn.style.display = 'none';
    });
    return;
  }

  function initWishlist() {
    const buttons = document.querySelectorAll('.wishlist-btn:not([data-init])');
    
    buttons.forEach(btn => {
      btn.setAttribute('data-init', '1');
      const productId = btn.getAttribute('data-product-id');
      
      // Check if product is in wishlist
      fetch('/apps/wishlist/api/wishlist/get?customerId=' + customerId)
        .then(r => r.json())
        .then(d => {
          if (d.wishlist && d.wishlist.includes(productId)) {
            btn.classList.add('active');
            btn.setAttribute('aria-label', btn.getAttribute('aria-label').replace('Add', 'Remove'));
          }
        })
        .catch(err => console.error('Wishlist check error:', err));
      
      // Click handler
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const isActive = btn.classList.contains('active');
        const endpoint = isActive 
          ? '/apps/wishlist/api/wishlist/remove' 
          : '/apps/wishlist/api/wishlist/add';
        
        btn.classList.toggle('active');
        btn.disabled = true;
        
        const formData = new FormData();
        formData.append('customerId', customerId);
        formData.append('productId', productId);
        
        fetch(endpoint, { method: 'POST', body: formData })
          .then(r => r.json())
          .then(d => {
            if (d.success) {
              if (btn.classList.contains('active')) {
                btn.setAttribute('aria-label', btn.getAttribute('aria-label').replace('Add', 'Remove'));
                showToast('Added to wishlist ❤️');
              } else {
                btn.setAttribute('aria-label', btn.getAttribute('aria-label').replace('Remove', 'Add'));
                showToast('Removed from wishlist');
              }
            } else {
              btn.classList.toggle('active');
            }
            btn.disabled = false;
          })
          .catch(err => {
            console.error('Wishlist error:', err);
            btn.classList.toggle('active');
            btn.disabled = false;
          });
      });
    });
  }
  
  function showToast(message) {
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.cssText = 'position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:#333;color:white;padding:10px 20px;border-radius:4px;z-index:9999;font-size:14px;';
    document.body.appendChild(toast);
    setTimeout(() => document.body.removeChild(toast), 2000);
  }
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWishlist);
  } else {
    initWishlist();
  }
  
  if (typeof MutationObserver !== 'undefined') {
    new MutationObserver(() => initWishlist()).observe(document.body, { childList: true, subtree: true });
  }
})();
</script>
```

---

## 🎯 What This Does

✅ Connects to your wishlist app API  
✅ Uses customer ID from Shopify  
✅ Saves to your app's database (metafields)  
✅ Shows toast notifications  
✅ Only shows for logged-in customers  
✅ Syncs across devices  

---

## 📋 Quick Steps

1. Open `snippets/card-product.liquid`
2. Find the `<script>` section at the end
3. Delete the entire old script
4. Paste the new script above
5. Save

---

## ✅ Test It

1. Make sure your wishlist app is running
2. Log in as a customer
3. Click a heart icon
4. Should see "Added to wishlist ❤️" notification
5. Check browser console (F12) for any errors

---

**This will connect your theme to your wishlist app!** 🚀
