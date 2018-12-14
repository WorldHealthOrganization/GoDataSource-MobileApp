//
//  APNSEventEmitter.m
//  who_mobile
//
//  Created by Anda on 12/14/18.
//  Copyright © 2018 Facebook. All rights reserved.
//

#import "APNSEventEmitter.h"

@implementation APNSEventEmitter

RCT_EXPORT_MODULE();

- (NSArray<NSString *> *)supportedEvents {
  return @[@"onPushReceived"];
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
