package com.example.parse_receiver;

import android.content.Context;
import android.content.Intent;

import com.facebook.react.bridge.ReactContext;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.parse.ParsePushBroadcastReceiver;

import java.util.ArrayList;

public class ParseReceiver extends ParsePushBroadcastReceiver {

    public static ReactContext reactContext = null;
    public static ArrayList notificationList = new ArrayList();

    @Override
    protected void onPushReceive(Context context, Intent intent) {
        super.onPushReceive(context, intent);
        if (reactContext != null) {
            reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit("onPushReceived", intent.getExtras().get("com.parse.Data"));
        } else {
            notificationList.add(intent.getExtras().get("com.parse.Data"));
        }
    }

    @Override
    protected void onPushOpen(Context context, Intent intent) {
        super.onPushOpen(context, intent);
        if (reactContext != null) {
            reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit("onPushReceived", intent.getExtras().get("com.parse.Data"));
        } else {
            notificationList.add(intent.getExtras().get("com.parse.Data"));
        }
    }

}