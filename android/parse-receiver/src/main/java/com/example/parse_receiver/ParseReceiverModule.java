package com.example.parse_receiver;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.parse.ParseInstallation;

public class ParseReceiverModule extends ReactContextBaseJavaModule {

    public ParseReceiverModule(ReactApplicationContext reactContext) {
        super(reactContext);
        ParseReceiver.reactContext = reactContext;
    }

    @ReactMethod
    public void initParse() {
        String installationId = ParseInstallation.getCurrentInstallation().getInstallationId();
        if (this.getReactApplicationContext() != null) {
            this.getReactApplicationContext().getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit("onParseInit", installationId);
        }
    }

    @Override
    public String getName() { return "ParseReceiver"; }

}
