package com.example.parse_receiver;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;

public class ParseReceiverModule extends ReactContextBaseJavaModule {

    public ParseReceiverModule(ReactApplicationContext reactContext) {
        super(reactContext);
        ParseReceiver.reactContext = reactContext;
    }

    @Override
    public String getName() { return "ParseReceiver"; }

}
