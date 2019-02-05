package com.example.parse_receiver;

import android.util.Log;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.parse.ParseInstallation;
import com.example.parse_receiver.ParseReceiver;

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

    @ReactMethod
    public void appLoaded() {
        Log.d("App loaded", "appLoaded: App loaded beginning");
        if (this.getReactApplicationContext() != null && ParseReceiver.notificationList.size() > 0) {
            for (int i=0; i<ParseReceiver.notificationList.size(); i++) {
                this.getReactApplicationContext().getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit("onPushReceived", ParseReceiver.notificationList.get(i));
            }
        }
    }

    @Override
    public String getName() { return "ParseReceiver"; }

}
