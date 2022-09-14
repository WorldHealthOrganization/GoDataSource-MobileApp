package com.who_mobile2020;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;

import com.reactnativenavigation.NavigationActivity;
// SplashActivity?
public class MainActivity extends NavigationActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(this.createSplashLayout());
    }

    public View createSplashLayout() {
        View v = LayoutInflater.from(this).inflate(R.layout.splash_layout,null);
        return v;
    }
}
