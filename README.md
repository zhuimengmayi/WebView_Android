# Hybrid discuss in android webview

## Js to native
  1.intercept url by shouldOverrideUrlLoading, this way just be async only
  2.newer version(>=android 4.4), @JavascriptInterface, can be sync
  3.intercept js prompt、confirm method( on ui thread ), can be sync.
## Native to js
  if sync resolve the result directly
  if async we can use loadUrl('javascript:*;'), or throw online event(window.ononline window.onoffline)..
