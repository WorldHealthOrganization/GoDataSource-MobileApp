//
//  APNSEventManager.m
//  who_mobile
//
//  Created by Anda on 12/17/18.
//  Copyright © 2018 Facebook. All rights reserved.
//

#import "APNSEventManager.h"

@implementation APNSEventManager

static APNSEventEmitter *_eventEmitter;

+ (instancetype)sharedInstance {
  static APNSEventManager *instance = nil;
  static dispatch_once_t onceToken;
  dispatch_once(&onceToken, ^{
    instance = [[APNSEventManager alloc] init];
  });
  return instance;
}

+ (RCTEventEmitter *)eventEmitter {
  return _eventEmitter;
}

+ (void)setEventEmitter:(APNSEventEmitter *)eventEmitter {
  _eventEmitter = eventEmitter;
}

- (NSArray *)allowedEvents {
  return @[@"onPushReceived", @"onParseInit"];
}

- (void)registerEventEmitter:(APNSEventEmitter *)eventEmitter {
  [[self class] setEventEmitter:eventEmitter];
}

- (void)dispatch:(NSString *)name body:(NSDictionary *)body {
  [[self class].eventEmitter sendEventWithName:name body:body];
}

@end
