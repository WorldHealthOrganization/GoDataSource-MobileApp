/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#import "AppDelegate.h"
#import <React/RCTBundleURLProvider.h>

#import "RCCManager.h"

#import "APNSEventEmitter.h"
#import "APNSEventManager.h"

#import <React/RCTRootView.h>

#import <UserNotifications/UserNotifications.h>
#import <Parse.h>

@interface AppDelegate () <UNUserNotificationCenterDelegate>

@end

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  NSURL *jsCodeLocation;
#ifdef DEBUG
  jsCodeLocation = [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index" fallbackResource:nil];
#else
  jsCodeLocation = [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
#endif
  
  [UNUserNotificationCenter currentNotificationCenter].delegate = self;
  [[UNUserNotificationCenter currentNotificationCenter] requestAuthorizationWithOptions:UNAuthorizationOptionAlert | UNAuthorizationOptionBadge | UNAuthorizationOptionSound
                                                                      completionHandler:^(BOOL granted, NSError * _Nullable error) {
                                                                        if (granted) {
                                                                          dispatch_async(dispatch_get_main_queue(), ^{
                                                                            [application registerForRemoteNotifications];
                                                                          });
                                                                        }
                                                                      }];
  
  ParseClientConfiguration *config = [ParseClientConfiguration configurationWithBlock:^(id<ParseMutableClientConfiguration>  _Nonnull configuration) {
    configuration.applicationId = @"b61f5946-1af3-4e07-9986-9ffd1e36ae93";
    configuration.server = @"http://whoapicd.clarisoft.com:1337/api";
  }];
  [Parse initializeWithConfiguration:config];
  
  self.window = [[UIWindow alloc] initWithFrame:[UIScreen mainScreen].bounds];
  self.window.backgroundColor = [UIColor whiteColor];
  [[RCCManager sharedInstance] initBridgeWithBundleURL:jsCodeLocation launchOptions:launchOptions];
  return YES;
}

- (void)application:(UIApplication *)application didRegisterForRemoteNotificationsWithDeviceToken:(NSData *)deviceToken {
  [[PFInstallation currentInstallation] setDeviceTokenFromData:deviceToken];
  [[PFInstallation currentInstallation] saveEventually:^(BOOL succeeded, NSError * _Nullable error) {
  }];
}

- (void)userNotificationCenter:(UNUserNotificationCenter *)center willPresentNotification:(UNNotification *)notification withCompletionHandler:(void (^)(UNNotificationPresentationOptions))completionHandler {
  [[APNSEventManager sharedInstance] dispatch:@"onPushReceived" body:notification.request.content.userInfo];
}

- (void)application:(UIApplication *)application didReceiveRemoteNotification:(NSDictionary *)userInfo fetchCompletionHandler:(void (^)(UIBackgroundFetchResult))completionHandler {
  [[APNSEventManager sharedInstance] dispatch:@"onPushReceived" body:userInfo];
}

@end
