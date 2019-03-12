package com.who_mobile;

import android.app.Activity;

import org.reactnative.camera.RNCameraPackage;

import com.example.parse_receiver.ParseReceiverPackage;
import com.parse.Parse;
import com.reactnativedocumentpicker.ReactNativeDocumentPicker;
import com.rnfs.RNFSPackage;
import dog.craftz.sqlite_2.RNSqlite2Package;
import com.oblador.keychain.KeychainPackage;
import com.rnziparchive.RNZipArchivePackage;
import com.RNFetchBlob.RNFetchBlobPackage;
import com.reactnativenavigation.NavigationApplication;
import com.facebook.react.ReactPackage;
import com.github.wumke.RNExitApp.RNExitAppPackage;
import com.learnium.RNDeviceInfo.RNDeviceInfo;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;
import com.bitgo.randombytes.RandomBytesPackage;

import java.util.Arrays;
import java.util.List;

public class MainApplication extends NavigationApplication {

     @Override
     public void onCreate() {
         super.onCreate();

         Parse.initialize(new Parse.Configuration.Builder(this)
                 .applicationId("b61f5946-1af3-4e07-9986-9ffd1e36ae93")
                 .server("http://whoapicd.clarisoft.com:1337/api")
                 .build()
         );
         Parse.setLogLevel(Parse.LOG_LEVEL_DEBUG);
     }

     @Override
     public boolean isDebug() {
         // Make sure you are using BuildConfig from your own application
         return BuildConfig.DEBUG;
     }

     protected List<ReactPackage> getPackages() {
         // Add additional packages you require here
         // No need to add RnnPackage and MainReactPackage
         return Arrays.<ReactPackage>asList(
             // eg. new VectorIconsPackage()
                 new RNFetchBlobPackage(),
                 new RNZipArchivePackage(),
                 new KeychainPackage(),
                 new RNCameraPackage(),
                 new RNDeviceInfo(),
                 new RNSqlite2Package(),
                 new RNFSPackage(),
                 new RNExitAppPackage(),
                 new ReactNativeDocumentPicker(),
                 new ParseReceiverPackage(),
                 new RandomBytesPackage()
         );
     }

     @Override
     public List<ReactPackage> createAdditionalReactPackages() {
         return getPackages();
     }

     @Override
     public String getJSMainModuleName() {
         return "index";
     }

     @Override
     public boolean clearHostOnActivityDestroy(Activity activity) {
         return false;
     }
 }