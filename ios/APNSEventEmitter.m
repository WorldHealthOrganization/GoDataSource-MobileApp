//
//  APNSEventEmitter.m
//  who_mobile
//
//  Created by Anda on 12/14/18.
//  Copyright © 2018 Facebook. All rights reserved.
//

#import "APNSEventEmitter.h"
#import <React/RCTEventEmitter.h>
#import "APNSEventManager.h"
#import <Parse.h>
#import "AppDelegate.h"

@implementation APNSEventEmitter

RCT_EXPORT_MODULE();

- (instancetype)init {
  if (self = [super init]) {
    [[APNSEventManager sharedInstance] registerEventEmitter:self];
  }
  return self;
}

- (NSArray<NSString *> *)supportedEvents {
  return [APNSEventManager sharedInstance].allowedEvents;
}

RCT_EXPORT_METHOD(initParse) {
  NSString *installationId = [PFInstallation currentInstallation].installationId;
  [[APNSEventManager sharedInstance] dispatch:@"onParseInit" body:@{ @"installationId" : installationId}];
}

RCT_EXPORT_METHOD(appLoaded) {
  AppDelegate *appDelegate = (AppDelegate *)[UIApplication sharedApplication].delegate;
  appDelegate.reactAppLoaded = YES;
}

@end
