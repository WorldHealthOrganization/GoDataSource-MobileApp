package com.who_mobile2020;

import android.view.LayoutInflater;
import android.view.View;

import com.reactnativenavigation.controllers.SplashActivity;

public class MainActivity extends SplashActivity {
    @Override
    public View createSplashLayout() {
        View v = LayoutInflater.from(this).inflate(R.layout.splash_layout,null);
        return v;
    }
}
