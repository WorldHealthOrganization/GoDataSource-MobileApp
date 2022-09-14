/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#import "AppDelegate.h"

#import <React/RCTBundleURLProvider.h>
#import <React/RCTRootView.h>
#import <ReactNativeNavigation/ReactNativeNavigation.h>

#import <React/RCTBundleURLProvider.h>

#import "APNSEventEmitter.h"
#import "APNSEventManager.h"


#if __has_include(<React/RNSentry.h>)
#import <React/RNSentry.h> // This is used for versions of react >= 0.40
#else
#import "RNSentry.h" // This is used for versions of react < 0.40
#endif

#import <UserNotifications/UserNotifications.h>
#import <Parse.h>

#define SYSTEM_VERSION_GRATERTHAN_OR_EQUALTO(v) ([[[UIDevice currentDevice] systemVersion] compare:v options:NSNumericSearch] != NSOrderedAscending)

#ifdef FB_SONARKIT_ENABLED
#import <FlipperKit/FlipperClient.h>
#import <FlipperKitLayoutPlugin/FlipperKitLayoutPlugin.h>
#import <FlipperKitUserDefaultsPlugin/FKUserDefaultsPlugin.h>
#import <FlipperKitNetworkPlugin/FlipperKitNetworkPlugin.h>
#import <SKIOSNetworkPlugin/SKIOSNetworkAdapter.h>
#import <FlipperKitReactPlugin/FlipperKitReactPlugin.h>
static void InitializeFlipper(UIApplication *application) {
  FlipperClient *client = [FlipperClient sharedClient];
  SKDescriptorMapper *layoutDescriptorMapper = [[SKDescriptorMapper alloc] initWithDefaults];
  [client addPlugin:[[FlipperKitLayoutPlugin alloc] initWithRootNode:application withDescriptorMapper:layoutDescriptorMapper]];
  [client addPlugin:[[FKUserDefaultsPlugin alloc] initWithSuiteName:nil]];
  [client addPlugin:[FlipperKitReactPlugin new]];
  [client addPlugin:[[FlipperKitNetworkPlugin alloc] initWithNetworkAdapter:[SKIOSNetworkAdapter new]]];
  [client start];
}
#endif

@interface AppDelegate () <UNUserNotificationCenterDelegate>
@property (nonatomic, strong) NSMutableArray *queuedNotifications;
@end

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  
#ifdef FB_SONARKIT_ENABLED
  InitializeFlipper(application);
#endif
  
  NSURL *jsCodeLocation;
#ifdef DEBUG
  jsCodeLocation = [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index" fallbackResource:nil];
#else
  jsCodeLocation = [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
#endif
  
  self.queuedNotifications = [NSMutableArray array];
  
  self.window = [[UIWindow alloc] initWithFrame:[UIScreen mainScreen].bounds];
    if (@available(iOS 13.0, *)) {
        self.window.backgroundColor = [UIColor systemBackgroundColor];
    } else {
        self.window.backgroundColor = [UIColor whiteColor];
    }
  
  [self registerForRemoteNotifications:[UIApplication sharedApplication]];
  
  ParseClientConfiguration *config = [ParseClientConfiguration configurationWithBlock:^(id<ParseMutableClientConfiguration>  _Nonnull configuration) {
    configuration.clientKey = @"KlYddh2OdVycHuVBhXv2";
    configuration.applicationId = @"b61f5946-1af3-4e07-9986-9ffd1e36ae93";
    configuration.server = @"http://whoapicd.clarisoft.com:1337/api";
  }];
  [Parse initializeWithConfiguration:config];
  NSDictionary *notification = [launchOptions objectForKey:UIApplicationLaunchOptionsRemoteNotificationKey];
  if (notification) {
    [self application:application didReceiveRemoteNotification:notification];
  }
  
  [ReactNativeNavigation bootstrapWithDelegate:self launchOptions:launchOptions];
  
  return YES;
}

- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
{
  #if DEBUG
    return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index" fallbackResource:nil];
  #else
    return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
  #endif
}

- (NSArray<id<RCTBridgeModule>> *)extraModulesForBridge:(RCTBridge *)bridge {
  return [ReactNativeNavigation extraModulesForBridge:bridge];
}

- (void)registerForRemoteNotifications:(UIApplication *)application {
  if ([application respondsToSelector:@selector(registerUserNotificationSettings:)]) {
    
    // greather than ios 8
    UIUserNotificationSettings *notificationSettings = [UIUserNotificationSettings settingsForTypes:(UIUserNotificationTypeSound |
                                                                                                     UIUserNotificationTypeAlert |
                                                                                                     UIUserNotificationTypeBadge)
                                                                                         categories:nil];
    [application registerUserNotificationSettings:notificationSettings];
    
  }
  
  if(SYSTEM_VERSION_GRATERTHAN_OR_EQUALTO(@"10.0")) {
    UNUserNotificationCenter *center = [UNUserNotificationCenter currentNotificationCenter];
    center.delegate = self;
    if ([center respondsToSelector:@selector(requestAuthorizationWithOptions:completionHandler:)]) {
      [center requestAuthorizationWithOptions:(UNAuthorizationOptionSound | UNAuthorizationOptionAlert | UNAuthorizationOptionBadge)
                            completionHandler:^(BOOL granted, NSError * _Nullable error) {
                              if (!error) {
                                dispatch_async(dispatch_get_main_queue(), ^{
                                  [[UIApplication sharedApplication] registerForRemoteNotifications];
                                });
                              } else {
                                
                              }
                            }];
    }
  }
}

- (void)application:(UIApplication *)application didRegisterForRemoteNotificationsWithDeviceToken:(NSData *)deviceToken {
  
  [[PFInstallation currentInstallation] setDeviceTokenFromData:deviceToken];
  [[PFInstallation currentInstallation] saveEventually:^(BOOL succeeded, NSError * _Nullable error) {
  }];
}

- (void)userNotificationCenter:(UNUserNotificationCenter *)center willPresentNotification:(UNNotification *)notification withCompletionHandler:(void (^)(UNNotificationPresentationOptions))completionHandler {
  if (self.reactAppLoaded) {
    [[APNSEventManager sharedInstance] dispatch:@"onPushReceived" body:notification.request.content.userInfo];
  } else {
    // queue notification to be send after react app is loaded
    [self.queuedNotifications addObject:notification.request.content.userInfo];
  }
}

- (void)application:(UIApplication *)application didReceiveRemoteNotification:(NSDictionary *)userInfo fetchCompletionHandler:(void (^)(UIBackgroundFetchResult))completionHandler {
  [self application:application didReceiveRemoteNotification:userInfo];
}

- (void)setReactAppLoaded:(BOOL)reactAppLoaded {
  _reactAppLoaded = YES;
  // fire queued notifications;
  [self.queuedNotifications enumerateObjectsUsingBlock:^(NSDictionary *notification, NSUInteger idx, BOOL * _Nonnull stop) {
    [[APNSEventManager sharedInstance] dispatch:@"onPushReceived" body:notification];
  }];
  [self.queuedNotifications removeAllObjects];
}

- (void)userNotificationCenter:(UNUserNotificationCenter *)center didReceiveNotificationResponse:(UNNotificationResponse *)response withCompletionHandler:(void (^)(void))completionHandler {
  
  if (completionHandler) {
    completionHandler();
  }
}

- (void)application:(UIApplication *)application didRegisterUserNotificationSettings:(UIUserNotificationSettings *)notificationSettings {
  //register to receive notifications
  dispatch_async(dispatch_get_main_queue(), ^{
    
    if ([application respondsToSelector:@selector(registerUserNotificationSettings:)]) {
      [application registerForRemoteNotifications];
    }
  });
}

- (void)application:(UIApplication *)application didFailToRegisterForRemoteNotificationsWithError:(NSError *)error {
  if (error.code == 3010) {
    
  } else {
    // show some alert or otherwise handle the failure to register.
    
  }
}

- (void)application:(UIApplication *)application didReceiveRemoteNotification:(NSDictionary *)userInfo {
  if (self.reactAppLoaded) {
    [[APNSEventManager sharedInstance] dispatch:@"onPushReceived" body:userInfo];
  } else {
    // queue notification to be send after react app is loaded
    [self.queuedNotifications addObject:userInfo];
  }
}

@end
