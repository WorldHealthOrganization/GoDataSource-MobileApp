package com.example.parse_receiver;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.parse.ParseInstallation;

import java.util.HashMap;
import java.util.Map;

public class ParseReceiverModule extends ReactContextBaseJavaModule {

    public ParseReceiverModule(ReactApplicationContext reactContext) {
        super(reactContext);
        ParseReceiver.reactContext = reactContext;
    }

    @ReactMethod
    public void initParse() {
        String installationId = ParseInstallation.getCurrentInstallation().getInstallationId();
        Map<String, String> dictionary = new HashMap<String, String>();
        dictionary.put("installationId", installationId);
        if (this.getReactApplicationContext() != null) {
            this.getReactApplicationContext().getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit("onParseInit", dictionary);
        }
    }

    @Override
    public String getName() { return "ParseReceiver"; }

}
