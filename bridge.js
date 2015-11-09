//hybrid implementation
//summarized by zhangjie.
/* 1.js 2 native
 *		1> intercept url by shouldOverrideUrlLoading, this way must by async
 *		2> newer version(>=android 4.4), @JavascriptInterface can be async and sync
 *		3> intercept js prompt method .., can be async and sync.
 * 2. native 2 js
 *		if sync resolve the result directly
 *		if async we can use loadUrl('javascript:*;'), or (throw online event) window.ononline and so on
 */
(function(window, document, undefined) {
    if (window.CWORKJSBridge) {
        return;
    }
    var _readyMessageIframe,
		_setResultIframe,
    	_sendMessageQueue = [],
    	_callback_map = {},
    	_callback_count = 1000,
    	_CALLBACK_ID = 'callback',
    	_MESSAGE_TYPE = 'type',
    	_REPEAT_CALL = 'repeat',
    	_HANDLER = 'handler',
    	_event_hook_map = {},
    	_PARAMETERS = 'parameters',
    	_QUEUE_HAS_MESSAGE = '_has_message',
    	_FETCH_MESSAGE_QUEUE = '_fetch_queue',
    	_CUSTOM_PROTOCOL_SCHEME = 'CWORKJSBridge';
    	
    function _createQueueReadyIframe(doc) {
    	_setResultIframe = doc.createElement('iframe');
		_setResultIframe.id = '__CWORKBridgeIframe_SetResult';
		_setResultIframe.style.display = 'none';
		doc.documentElement.appendChild(_setResultIframe);
		
		_readyMessageIframe = doc.createElement('iframe');
        _readyMessageIframe.id = '__CWORKJSBridgeIframe';
        _readyMessageIframe.style.display = 'none';
        doc.documentElement.appendChild(_readyMessageIframe);
    }

	function _call(handler, parameters, callback) {
        if (!handler || typeof handler !== 'string') {
            return;
        }
        var msgObj = {};
        msgObj[_HANDLER] = handler;
        
        if (typeof parameters === 'object') {
			msgObj[_PARAMETERS] = parameters;
        }

        if (typeof callback === 'function') {
        	var callbackID = (_callback_count++).toString();
        	
       		msgObj[_CALLBACK_ID] = callbackID;
			_callback_map[callbackID] = callback;
        }
		_sendMessage(msgObj);
    }
	function _on(event, callback) {
		if(!event || typeof event !== 'string') {
			return;
		};

		if(typeof callback !== 'function') {
			return;
		};
		_event_hook_map[event] = callback;
    }
	function _sendMessage(message) {
		_sendMessageQueue.push(message);
		_readyMessageIframe.src = _CUSTOM_PROTOCOL_SCHEME + '://' + _QUEUE_HAS_MESSAGE;
    };
    // 提供给native调用,该函数作用:获取_sendMessageQueue返回给native,由于android不能直接获取返回的内容,所以使用url shouldOverrideUrlLoading 的方式返回内容
    function _fetchQueue() {

        var messageQueueString = encodeURIComponent(JSON.stringify(_sendMessageQueue));  

        _sendMessageQueue = [];

		_setResultIframe.src = _CUSTOM_PROTOCOL_SCHEME + '://' + _FETCH_MESSAGE_QUEUE + '/' + messageQueueString;
    };
    //提供给native使用,
    function _handleMessageFromNative(message) {
    	var _callbackId = message[_CALLBACK_ID];
    	var _messageType = message[_MESSAGE_TYPE];
    	var _repeat = message[_REPEAT_CALL];

    	if(_messageType == 'callback') {
    		if(typeof _callbackId === 'string' && typeof _callback_map[_callbackId] === 'function') {
				var jsonObj = null;
				var returnValue = message[_PARAMETERS];
				
				if (typeof returnValue === 'string') {
					try {
						jsonObj = JSON.parse(returnValue);
					} catch(e) {
						jsonObj = returnValue;
					}
				} else {
					jsonObj = returnValue;
				}
	            _callback_map[_callbackId](jsonObj);
	            if(!_repeat) {
		            delete _callback_map[_callbackId]; // can only call once
	            }
			}
    	} else if(_messageType == 'event') {
    		if(typeof _callbackId === 'string' && typeof _event_hook_map[_callbackId] === 'function') {
    			var jsonObj = null;
				var returnValue = message[_PARAMETERS];
				
				if (typeof returnValue === 'string') {
					try {
						jsonObj = JSON.parse(returnValue);
					} catch(e) {
						jsonObj = returnValue;
					}
				} else {
					jsonObj = returnValue;
				}
	            _event_hook_map[_callbackId](jsonObj);
	            if(!_repeat) {
		            delete _event_hook_map[_callbackId]; // can only call once
	            }
    		}
    	}
    }
    var __CWORKJSBridge = {
        // public
        invoke:_call,
        call:_call,
        on:_on,
        _fetchQueue: _fetchQueue,
        _handleMessageFromNative: _handleMessageFromNative,
//        _dispatchJSBridgeReady:_dispatchJSBridgeReady
    };
	window.CWORKJSBridge = __CWORKJSBridge;
	
	//Ready go
//	function _dispatchJSBridgeReady() {
		
//	}
//	if (window.CWORKJSBridge._hasInit) {
//			return;
//	}
	_createQueueReadyIframe(document);
//		window.CWORKJSBridge._hasInit = true;
		
	var readyEvent = document.createEvent('Events');
	readyEvent.initEvent('CWORKJSBridgeReady');
	document.dispatchEvent(readyEvent);
})(this, document);