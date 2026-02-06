package com.who_mobile2020

import android.app.Application
import com.facebook.react.ReactApplication
import com.facebook.react.ReactNativeHost
import com.facebook.react.ReactPackage
import com.facebook.react.PackageList
import com.facebook.react.defaults.DefaultReactNativeHost
import com.facebook.soloader.SoLoader

class MainApplication : Application(), ReactApplication {

    override val reactNativeHost: ReactNativeHost =
        object : DefaultReactNativeHost(this) {

            override fun getPackages(): List<ReactPackage> {
                val packages = PackageList(this).packages.toMutableList()
                packages.add(com.example.parse_receiver.ParseReceiverPackage())
                return packages
            }

            override fun getJSMainModuleName(): String = "index"

            override fun getUseDeveloperSupport(): Boolean =
                BuildConfig.DEBUG

            // 🔴 CRITICAL: Old Architecture
            override val isNewArchEnabled: Boolean = false

            override val isHermesEnabled: Boolean = true
        }

    override fun onCreate() {
        super.onCreate()
        SoLoader.init(this, false)
        com.parse.Parse.initialize(com.parse.Parse.Configuration.Builder(this)
            .applicationId("b61f5946-1af3-4e07-9986-9ffd1e36ae93")
            .clientKey("KlYddh2OdVycHuVBhXv2")
            .server("http://whoapicd.clarisoft.com:1337/api")
            .build()
        )
        com.parse.Parse.setLogLevel(com.parse.Parse.LOG_LEVEL_DEBUG)
    }
}
