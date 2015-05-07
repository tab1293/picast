//
//  NetworkRunner.m
//  picast
//
//  Created by Alexander Yang on 5/1/15.
//  Copyright (c) 2015 Alexander Yang. All rights reserved.
//

#import <Foundation/Foundation.h>
#import "NetworkRunner.h"
#import "Utils.h"
#import <CoreFoundation/CoreFoundation.h>
#include <sys/socket.h> 
#include <netinet/in.h>
#include <arpa/inet.h>

@implementation NetworkRunner

/*
 
 Note that there are two types of broadcasts.
 
 The first type of broadcast is at address 255.255.255.255, this will broadcast
 on the physical local network
 
 The second type of broadcast is calculated by taking the IP Address of the host
 and the bit complement of the subnet mask and bitwise OR'ing them together
 
 Broadcast Address = (Host IP) | (~Subnet Mask)
 
 For our purposes, I think 255.255.255.255 will work.
 
 
*/

+ (void)broadcast {
    
    Alert(@"Testing Alerts!");
    
    CFSocketRef udpSocket = CFSocketCreate(kCFAllocatorDefault,
                                         PF_INET,
                                         SOCK_DGRAM,
                                         IPPROTO_UDP,
                                         kCFSocketNoCallBack,
                                         NULL,
                                         NULL);
    
    if (udpSocket == NULL) {
        Alert(@"Could not create socket");
        return;
    }
    
    struct sockaddr_in addr;
    addr.sin_family = AF_INET;
    addr.sin_port = htons(400);
    addr.sin_addr.s_addr = inet_addr("255.255.255.255");
    
    CFDataRef connectionData = CFDataCreate(kCFAllocatorDefault,
                                            (UInt8*)(&addr),
                                            sizeof(struct sockaddr_in));
    
    if (connectionData == NULL) {
        Alert(@"Could not allocate connection data");
        return;
    }
    
    CFSocketError err = CFSocketConnectToAddress(udpSocket,
                                                 connectionData,
                                                 5.0); // wait 5 seconds before timing out
    
    if (err != kCFSocketSuccess) {
        Alert(@"Could not initiate connection");
        return;
    }
    
    // Now we have successfully connected to the broadcast port
    
    
    // Release Resources (CFSockets dont seem to use ARC)
    CFRelease(connectionData);
    CFRelease(udpSocket);
}

+ (void)connect {
    
}

+ (void)disconnect {
    
}

@end