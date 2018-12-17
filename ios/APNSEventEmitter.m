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
//  return @[@"onPushReceived"];
}

- (void)onPushReceived:(NSDictionary *)userInfo {
//  NSData *jsonData = [NSJSONSerialization dataWithJSONObject:userInfo
//                                                     options:NSJSONWritingPrettyPrinted
//                                                       error:nil];
//  if (!jsonData) {
//    // TODO user info is not dictionary
//  }
//  NSString *jsonString = [[NSString alloc] initWithData:jsonData encoding:NSUTF8StringEncoding];
  [self sendEventWithName:@"onPushReceived" body:@{@"name": @"TODO"}];
}

@end
