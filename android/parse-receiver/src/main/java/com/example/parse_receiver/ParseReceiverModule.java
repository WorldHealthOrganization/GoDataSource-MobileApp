package com.example.parse_receiver;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;
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
        WritableMap dictionary = Arguments.createMap();
        dictionary.putString("installationId", installationId);
        if (this.getReactApplicationContext() != null) {
            this.getReactApplicationContext().getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit("onParseInit", dictionary);
        }
    }

    @Override
    public String getName() { return "ParseReceiver"; }

}
