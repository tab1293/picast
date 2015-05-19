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
CFSocketRef _serverSocket;

void readCallback(CFSocketRef s, CFSocketCallBackType type, CFDataRef address, const void *data, void *info) {
    
    Alert(@"I've received some data!");

    int                     sock;
    struct sockaddr_storage addr;
    socklen_t               addrLen;
    uint8_t                 buffer[65536];
    ssize_t                 bytesRead;
    
    sock = CFSocketGetNative(_serverSocket);
    
    if (sock < 0) {
        Alert(@"Server Socket not initialized!");
        return;
    }
 
    addrLen = sizeof(struct sockaddr_storage);
    bytesRead = recvfrom(sock, buffer, sizeof(buffer), 0, (struct sockaddr *) &addr, &addrLen);
    
    if (bytesRead < 0) {
        Alert(@"Error reading in bytes");
        return;
    } else if (bytesRead == 0) {
        Alert(@"No data?");
        return;
    }
    
    NSData* dataObj;
    NSData* addrObj;
    
    dataObj = [NSData dataWithBytes:buffer length:(NSUInteger) bytesRead];
    
    if (dataObj == nil) {
        Alert(@"Error creating dataObj");
        return;
    }

    addrObj = [NSData dataWithBytes:&addr length:addrLen];
    
    if (addrObj == nil) {
        Alert(@"Error creating addrObj");
        return;
    }

    NSString* newStr = [[NSString alloc] initWithData:dataObj encoding:NSUTF8StringEncoding];

    // maybe we need to parse string here?
    // not sure of the format the data will be sent in???
    // do something with newStr

    NSString* netAddr = [newStr substringFromIndex: 3]; // 192.168.0.1:8080
    
    // Maybe we want to make a call to init connection here!
    [NetworkRunner initConnection: netAddr];
}

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
    const CFSocketContext context = { 0, NULL, NULL, NULL, NULL };
    
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

+ (void)setupListener:(int) port {
    if (port <= 0 || port >= 65536) {
        Alert(@"Incorrect Port");
        return;
    }
    
    int sock;
    int err;
    const CFSocketContext context = { 0, NULL, NULL, NULL, NULL };
    CFRunLoopSourceRef rls;
    
    sock = socket(AF_INET, SOCK_DGRAM, 0);
    if (sock < 0) {
        Alert(@"Error setting up UDP Socket");
        return;
    }
    
    struct sockaddr_in addr;
    memset(&addr, 0, sizeof(struct sockaddr_in));
    addr.sin_len = sizeof(struct sockaddr_in);
    addr.sin_family = AF_INET;
    addr.sin_port = htons(port);
    addr.sin_addr.s_addr = INADDR_ANY;
    err = bind(sock, (const struct sockaddr *) &addr, sizeof(addr));
    
    if (err < 0) {
        Alert(@"Error binding UDP server");
        return;
    }
    
    int flags;
    flags = fcntl(sock, F_GETFL);
    err = fcntl(sock, F_SETFL, flags | O_NONBLOCK);
    
    if (err < 0) {
        Alert(@"Error setting flags");
        return;
    }
    
    _serverSocket = CFSocketCreateWithNative(kCFAllocatorDefault,
                                             sock,
                                             kCFSocketReadCallBack,
                                             readCallback,
                                             &context);
    
    rls = CFSocketCreateRunLoopSource(kCFAllocatorDefault, _serverSocket, 0);
    CFRunLoopAddSource(CFRunLoopGetCurrent(), rls, kCFRunLoopDefaultMode);
    
    CFRelease(rls);
}

+ (void)initConnection:(NSString*)connectURL {
    
    // Should probe for available connections here
    _desktopSocket = [[NetworkSocket alloc] initWithURL: connectURL];
    
}

+ (void)selectVideo:(NSString*)videoURL {
    [_desktopSocket makeRequest: videoURL];
}

+ (void)playVideo {
    [_desktopSocket makeRequest: @"play"];
}

@end