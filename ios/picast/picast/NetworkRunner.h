//
//  NetworkRunner.h
//  picast
//
//  Created by Alexander Yang on 5/1/15.
//  Copyright (c) 2015 Alexander Yang. All rights reserved.
//

#ifndef picast_NetworkRunner_h
#define picast_NetworkRunner_h

@interface NetworkRunner : NSObject

+ (void)broadcast;
+ (void)connect;
+ (void)disconnect;

@end


#endif