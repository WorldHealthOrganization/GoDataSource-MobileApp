package com.who_mobile;

import android.app.Activity;
import android.app.Application;

import com.facebook.react.ReactApplication;
import com.reactnativedocumentpicker.ReactNativeDocumentPicker;
import com.rnfs.RNFSPackage;
import dog.craftz.sqlite_2.RNSqlite2Package;
import com.oblador.keychain.KeychainPackage;
import com.rnziparchive.RNZipArchivePackage;
import com.RNFetchBlob.RNFetchBlobPackage;
import com.oblador.vectoricons.VectorIconsPackage;
import com.reactnativenavigation.NavigationApplication;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;

import java.util.Arrays;
import java.util.List;

 import com.reactnativenavigation.NavigationApplication;

 public class MainApplication extends NavigationApplication {

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
                 new RNSqlite2Package(),
                 new RNFSPackage()
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