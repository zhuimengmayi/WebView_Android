package com.example.simple;

import android.app.Activity;
import android.graphics.Bitmap;
import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.view.ViewGroup;
import android.view.ViewParent;
import android.view.WindowManager;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.ProgressBar;
import android.widget.RelativeLayout;
import android.widget.TextView;

/**
 * 简单的WebView
 */
public class MainActivity extends Activity {

    private static final String TAG = MainActivity.class.getSimpleName();

    public static final String URL = "url";
    public static final String TITLE = "title";

    private WebView mWebView;
    private TextView mTitleView;
    private ProgressBar progressbar;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        setContentView(R.layout.simple_webview);
        if (Build.VERSION.SDK_INT >= 11) {
            getWindow().addFlags(WindowManager.LayoutParams.FLAG_HARDWARE_ACCELERATED);
        }
        init();
    }

    private void init() {
        mTitleView = (TextView) findViewById(R.id.title_text);
        mWebView = (WebView) findViewById(R.id.simple_webview);
        WebSettings settings = mWebView.getSettings();
        findViewById(R.id.title_back).setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
            	if(mWebView.canGoBack()) {
            		mWebView.goBack();
            	}
            }
        });
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.FROYO) {
            settings.setPluginState(WebSettings.PluginState.ON);
        }
        settings.setJavaScriptEnabled(true);
        settings.setAllowFileAccess(true);

        settings.setUseWideViewPort(true);
        settings.setLoadWithOverviewMode(true);
        settings.setBuiltInZoomControls(true);
        settings.setDomStorageEnabled(true);

        settings.setJavaScriptCanOpenWindowsAutomatically(true);
        settings.setRenderPriority(WebSettings.RenderPriority.HIGH);//提高渲染优先级

        //进度条
        progressbar = new ProgressBar(this, null, android.R.attr.progressBarStyleHorizontal);
        progressbar.setMax(100);
        progressbar.setProgressDrawable(this.getResources().getDrawable(R.drawable.demo_progress_bar_states));
        progressbar.setProgress(5); //先加载5%，以使用户觉得界面没有卡死
        RelativeLayout.LayoutParams params = new RelativeLayout.LayoutParams(RelativeLayout.LayoutParams.MATCH_PARENT, 6);
        params.addRule(RelativeLayout.ABOVE, R.id.simple_webview);
        ViewParent parent = mWebView.getParent();
        if (parent != null) {
            ((ViewGroup) parent).addView(progressbar, params);
        }

        mWebView.setWebViewClient(new WebViewClient() {
        	
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, String url) {
                view.loadUrl(url);
                return true;
            }


            @Override
            public void onPageStarted(WebView view, String url, Bitmap favicon) {
                super.onPageStarted(view, url, favicon);
                progressbar.setVisibility(View.VISIBLE);
            }

            @Override
            public void onPageFinished(WebView view, String url) {
                super.onPageFinished(view, url);
                progressbar.setVisibility(View.GONE);
            }

            @Override
            public void onReceivedError(WebView view, int errorCode, String description, String failingUrl) {
                super.onReceivedError(view, errorCode, description, failingUrl);
                progressbar.setVisibility(View.GONE);
            }
        });
        mWebView.setWebChromeClient(new WebChromeClient() {
        	@Override
        	public void onReceivedTitle(WebView view, String title) {
        		super.onReceivedTitle(view, title);
        		mTitleView.setText(title);
        	}

            @Override
            public void onProgressChanged(WebView view, int newProgress) {
                if(newProgress >= 5){
                    progressbar.setProgress(newProgress);
                }
                super.onProgressChanged(view, newProgress);
            }
        });
        mWebView.loadUrl("http://www.baidu.com");
    }

    public void onPause() {
        super.onPause();
        mWebView.onPause();
    }

    public void onResume() {
        super.onResume();
        mWebView.onResume();
    }

    @Override
    protected void onDestroy() {
        mWebView.destroy();
        super.onDestroy();
    }
}
