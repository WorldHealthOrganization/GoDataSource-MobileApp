//
//  APNSEventManager.h
//  who_mobile
//
//  Created by Anda on 12/17/18.
//  Copyright © 2018 Facebook. All rights reserved.
//

#import <Foundation/Foundation.h>
#import "APNSEventEmitter.h"

NS_ASSUME_NONNULL_BEGIN

@interface APNSEventManager : NSObject

@property (nonatomic, strong, class) APNSEventEmitter *eventEmitter;
@property (nonatomic, strong, readonly) NSArray *allowedEvents;

+ (instancetype)sharedInstance;
- (void)registerEventEmitter:(APNSEventEmitter *)eventEmitter;
- (void)dispatch:(NSString *)name body:(NSDictionary *)body;

@end

NS_ASSUME_NONNULL_END
