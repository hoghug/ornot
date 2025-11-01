### Fonts
- theme.css
- overrides at the end of file
- theme.liquid
- font links + custom CSS files


### Multicolumn
- snippets/multicolumn.liquid
- remove link wrap around whole block, isolated to image. allows for mini links in text.
- section-columns.liquid 
-default image_width to 100

### Collection Product Badge
- theme.css - text-transform, letter-spacing
- snippets/product-badge - add span.badge-text around text
- TO DO: need product view access for metafield badges?

### Collection Product Grid
- snippets/product-grid-item.liquid - full copy from existing theme to include all of the SA Wholesale complexity

### Page/Socks - Text Column w/ Images
- theme.css - line 10015 - remove scale on hover

### Icon Arrows - left, right, up
icon-nav-arrow-*DIRECTION* - different SVGs, check the class

### Junip Product Summary on Collections
- snippets/junip-product-summary.liquid - created
- snippets/product-grid-item.liquid - line 761 - {% render 'junip-product-summary', product: product %}

### PDP - Shipping Policy 
- sections/product.liquid - add setting to schema - line 213
- snippets/product-price.liquid - line 33

### PDP - Variant Selector Styling
assets/theme.css - line 11606, line 11632,

### PDP Accordion Icons
- changed from +/- to chevrons
- assets/theme.css - added block to bottom
- snippets/product-tabs.liquid - line 184-185

### Related / Recently Viewed
- theme.css - line 21712 - font family spec

### PDP Upsell
- added padding top setting
- sections/product.liquid - line 864
- snippets/product.liquid - line 359, line 365-367

### AMP fixes
theme.liquid - render 'amp-upsells'


### Arrows
assets/icon-arrow-left.svg 
assets/icon-arrow-right.svg