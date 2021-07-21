package com.who_mobile2020;

import android.app.Activity;

import org.reactnative.camera.RNCameraPackage;

import android.app.Application;
import android.content.Context;
import com.facebook.react.PackageList;
import com.example.parse_receiver.ParseReceiverPackage;
import com.reactnativenavigation.NavigationApplication;
import com.facebook.react.ReactInstanceManager;
import com.facebook.react.ReactNativeHost;
import com.reactnativenavigation.react.NavigationReactNativeHost;
import com.facebook.soloader.SoLoader;
import com.parse.Parse;
import com.reactnativedocumentpicker.ReactNativeDocumentPicker;
import com.rnfs.RNFSPackage;
import dog.craftz.sqlite_2.RNSqlite2Package;
import com.rnziparchive.RNZipArchivePackage;
import com.RNFetchBlob.RNFetchBlobPackage;
import com.reactnativenavigation.NavigationApplication;
import com.facebook.react.ReactPackage;
import com.github.wumke.RNExitApp.RNExitAppPackage;
import com.learnium.RNDeviceInfo.RNDeviceInfo;
import com.reactnativecommunity.asyncstorage.AsyncStoragePackage;
import com.reactnativecommunity.webview.RNCWebViewPackage;
import com.reactcommunity.rndatetimepicker.RNDateTimePickerPackage;
import com.codemotionapps.reactnativedarkmode.DarkModePackage;
import com.rnfingerprint.FingerprintAuthPackage;
import com.oblador.keychain.KeychainPackage;
import java.lang.reflect.InvocationTargetException;
import com.bitgo.randombytes.RandomBytesPackage;
import io.sentry.RNSentryPackage;
import com.reactlibrary.RNBcryptPackage;
import com.apsl.versionnumber.RNVersionNumberPackage;
import java.util.Arrays;
import java.util.List;

public class MainApplication extends NavigationApplication {

    private final ReactNativeHost mReactNativeHost =
            new NavigationReactNativeHost(this) {
                @Override
                public boolean getUseDeveloperSupport() {
                    return BuildConfig.DEBUG;
                }

                @Override
                protected List<ReactPackage> getPackages() {
                    @SuppressWarnings("UnnecessaryLocalVariable")
                    List<ReactPackage> packages = new PackageList(this).getPackages();
                    // Packages that cannot be autolinked yet can be added manually here, for example:
                    packages.add(new RNFetchBlobPackage());
                    packages.add(new RNZipArchivePackage());
                    packages.add(new KeychainPackage());
                    packages.add(new RNCameraPackage());
                    packages.add(new RNDeviceInfo());
                    packages.add(new AsyncStoragePackage());
                    packages.add(new RNCWebViewPackage());
                    packages.add(new RNSqlite2Package());
                    packages.add(new RNFSPackage());
                    packages.add(new RNExitAppPackage());
                    packages.add(new ReactNativeDocumentPicker());
                    packages.add(new ParseReceiverPackage());
                    packages.add(new RandomBytesPackage());
                    packages.add(new RNSentryPackage());
                    packages.add(new RNBcryptPackage());
                    packages.add(new RNVersionNumberPackage());
                    packages.add(new RNDateTimePickerPackage());
                    packages.add(new DarkModePackage());
                    packages.add(new FingerprintAuthPackage());

                    return packages;
                }

                @Override
                protected String getJSMainModuleName() {
                    return "index";
                }
            };

     @Override
     public void onCreate() {
         super.onCreate();
         
         initializeFlipper(this, getReactNativeHost().getReactInstanceManager());
         Parse.initialize(new Parse.Configuration.Builder(this)
                 .applicationId("b61f5946-1af3-4e07-9986-9ffd1e36ae93")
                 .clientKey("KlYddh2OdVycHuVBhXv2")
                 .server("http://whoapicd.clarisoft.com:1337/api")
                 .build()
         );
         Parse.setLogLevel(Parse.LOG_LEVEL_DEBUG);
     }

//     protected List<ReactPackage> getPackages() {
//         // Add additional packages you require here
//         // No need to add RnnPackage and MainReactPackage
//         return Arrays.<ReactPackage>asList(
//             // eg. new VectorIconsPackage()
//                 new RNFetchBlobPackage(),
//                 new RNZipArchivePackage(),
//                 new KeychainPackage(),
//                 new RNCameraPackage(),
//                 new RNDeviceInfo(),
//                 new AsyncStoragePackage(),
//                 new RNCWebViewPackage(),
//                 new RNSqlite2Package(),
//                 new RNFSPackage(),
//                 new RNExitAppPackage(),
//                 new ReactNativeDocumentPicker(),
//                 new ParseReceiverPackage(),
//                 new RandomBytesPackage(),
//                 new RNSentryPackage(),
//                 new RNBcryptPackage(),
//                 new RNVersionNumberPackage(),
//                 new RNDateTimePickerPackage(),
//                 new DarkModePackage(),
//                 new FingerprintAuthPackage()
//         );
//     }
    /**
     * Loads Flipper in React Native templates. Call this in the onCreate method with something like
     * initializeFlipper(this, getReactNativeHost().getReactInstanceManager());
     *
     * @param context
     * @param reactInstanceManager
     */
    private static void initializeFlipper(
            Context context, ReactInstanceManager reactInstanceManager) {
        if (BuildConfig.DEBUG) {
            try {
        /*
         We use reflection here to pick up the class that initializes Flipper,
        since Flipper library is not available in release mode
        */
                Class<?> aClass = Class.forName("com.rndiffapp.ReactNativeFlipper");
                aClass
                        .getMethod("initializeFlipper", Context.class, ReactInstanceManager.class)
                        .invoke(null, context, reactInstanceManager);
            } catch (ClassNotFoundException e) {
                e.printStackTrace();
            } catch (NoSuchMethodException e) {
                e.printStackTrace();
            } catch (IllegalAccessException e) {
                e.printStackTrace();
            } catch (InvocationTargetException e) {
                e.printStackTrace();
            }
        }
    }
    @Override
    public ReactNativeHost getReactNativeHost() {
        return mReactNativeHost;
    }
}