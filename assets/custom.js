/*
* Broadcast Theme
*
* Use this file to add custom Javascript to Broadcast.  Keeping your custom
* Javascript in this fill will make it easier to update Broadcast. In order
* to use this file you will need to open layout/theme.liquid and uncomment
* the custom.js script import line near the bottom of the file.
*/


(function() {
  // Add custom code below this line


  




  // ^^ Keep your scripts inside this IIFE function call to 
  // avoid leaking your variables into the global scope.

 (function () {
  // 1) Ensure Klaviyo queue exists
  window._learnq = window._learnq || [];

  // 2) Helper: send to Klaviyo + log so we can see it fired
  function trackATC(item) {
    if (!item) return;
    const props = {
      ProductName: item.product_title || item.title || '',
      ProductID: item.variant_id || item.id || '',
      SKU: item.sku || '',
      Categories: item.product_type || '',
      ImageURL:
        item.image ||
        (item.featured_image && (item.featured_image.url || item.featured_image)) ||
        '',
      URL: location.href,
      Brand: item.vendor || '',
      Price: typeof item.price === 'number' ? item.price / 100 : '',
      Quantity: item.quantity || 1
    };
    console.log('[ATC captured]', props);
    try {
      _learnq.push(['track', 'Added to Cart', props]);
    } catch (e) {
      console.warn('Klaviyo push error', e);
    }
  }

  // 3) Catch fetch-based adds (Broadcast uses this)
  const origFetch = window.fetch;
  if (origFetch) {
    window.fetch = function () {
      const args = arguments;
      const url = (args[0] && args[0].toString()) || '';
      return origFetch.apply(this, args).then(function (res) {
        try {
          if (url.indexOf('/cart/add') > -1) {
            res.clone().json().then(function (data) {
              if (!data) return;
              if (Array.isArray(data.items)) data.items.forEach(trackATC);
              else trackATC(data);
            }).catch(function(){});
          }
        } catch (e) {}
        return res;
      });
    };
  }

  // 4) Catch XHR-based adds (some theme parts/apps still use XHR)
  const _open = XMLHttpRequest.prototype.open;
  const _send = XMLHttpRequest.prototype.send;
  XMLHttpRequest.prototype.open = function (method, url) {
    this.__watchAdd = (typeof url === 'string' && url.indexOf('/cart/add') > -1);
    return _open.apply(this, arguments);
  };
  XMLHttpRequest.prototype.send = function (body) {
    if (this.__watchAdd) {
      this.addEventListener('load', function () {
        try {
          const data = JSON.parse(this.responseText);
          if (!data) return;
          if (Array.isArray(data.items)) data.items.forEach(trackATC);
          else trackATC(data);
        } catch (e) {}
      });
    }
    return _send.apply(this, arguments);
  };


})();
