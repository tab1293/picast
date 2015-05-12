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
#import "NetworkSocket.h"
#import <CoreFoundation/CoreFoundation.h>
#include <sys/socket.h> 
#include <netinet/in.h>
#include <arpa/inet.h>

NetworkSocket* _desktopSocket;

@interface NetworkRunner ()

@end

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
    
    // Setup and Create UDP Socket
    CFSocketContext context;
    context.version = 0;
    context.info = &context;
    context.retain = NULL;
    context.release = NULL;
    context.copyDescription = NULL;
    
    CFSocketRef udpSocket = CFSocketCreate(kCFAllocatorDefault,
                                         PF_INET,
                                         SOCK_DGRAM,
                                         IPPROTO_UDP,
                                         kCFSocketNoCallBack,
                                         NULL,
                                         &context);
    
    if (udpSocket == NULL) {
        Alert(@"Could not create socket");
        return;
    }
    
    // Make sure to set socket options to allow broadcast
    // strange that we need to access native socket (CFSocket doesn't support
    // setting this manually???)
    int yes = 1;
    int setSockResult = setsockopt(CFSocketGetNative(udpSocket),
                                   SOL_SOCKET,
                                   SO_BROADCAST,
                                   (void*)&yes,
                                   sizeof(yes));
    
    if (setSockResult < 0) {
        Alert(@"Trouble setting sock options");
        return;
    }
    
    // Set where we need to send the data
    struct sockaddr_in addr;
    memset(&addr, 0, sizeof(struct sockaddr_in));
    addr.sin_len = sizeof(struct sockaddr_in);
    addr.sin_family = AF_INET;
    addr.sin_port = htons(12345);
    addr.sin_addr.s_addr = inet_addr("255.255.255.255");
    
    CFDataRef portData = CFDataCreate(kCFAllocatorDefault,
                                            (UInt8*)(&addr),
                                            sizeof(struct sockaddr_in));
    
    if (portData == NULL) {
        Alert(@"Could not allocate port data");
        return;
    }

    // Data we intend to send
    char buffer[] = "myIP:4000";
    CFDataRef sendData = CFDataCreate(kCFAllocatorDefault,
                                      (UInt8*)(&buffer),
                                      sizeof(buffer));
    
    // Send the data
    CFSocketError err = CFSocketSendData(udpSocket,
                           portData,
                           sendData,
                           0.0);
    
    if (err != kCFSocketSuccess) {
        Alert(@"Could not send data");
        return;
    }
    
    // Release Resources (CFSockets dont seem to use ARC)
    CFRelease(portData);
    CFRelease(sendData);
    CFRelease(udpSocket);
}

+ (void)initConnection {
    
    // Should probe for available connections here
    _desktopSocket = [[NetworkSocket alloc] initWithURL: @"192.168.0.1:8080"];
    
}

+ (void)selectVideo:(NSString*)videoURL {
    [_desktopSocket makeRequest: videoURL];
}

+ (void)playVideo {
    [_desktopSocket makeRequest: @"play"];
}

@end