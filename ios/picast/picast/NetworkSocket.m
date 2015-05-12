//
//  NetworkSocket.m
//  picast
//
//  Created by Alexander Yang on 5/12/15.
//  Copyright (c) 2015 Alexander Yang. All rights reserved.
//

#import "NetworkSocket.h"
#import <Foundation/Foundation.h>
#import "Utils.h"

@implementation NetworkSocket {
    NSMutableData* _responseData;
    NSString* _url;
}

- (id)initWithURL:(NSString *)url {
    _url = url;
    return self;
}

#pragma mark NSURLConnection Delegate Methods

- (void)connection:(NSURLConnection *)connection didReceiveResponse:(NSURLResponse *)response {
    _responseData = [[NSMutableData alloc] init];
}

- (void)connection:(NSURLConnection *)connection didReceiveData:(NSData *)data {
    [_responseData appendData:data];
}

- (NSCachedURLResponse *)connection:(NSURLConnection *)connection willCacheResponse:(NSCachedURLResponse*)cachedResponse {
    return nil;
}

- (void)connectionDidFinishLoading:(NSURLConnection *)connection {
    // data received from server
    // don't expect any data from server other than a 200 OK
}

- (void)connection:(NSURLConnection *)connection didFailWithError:(NSError *)error {
    Alert(@"Connection Error");
}

- (void)makeRequest:(NSString *)req {
    NSString* url = [NSString stringWithFormat: @"http://%@/%@", _url, req];
    NSMutableURLRequest* request = [NSMutableURLRequest requestWithURL: [NSURL URLWithString: url]];
    NSURLConnection* conn = [[NSURLConnection alloc] initWithRequest:request delegate: self];
}

@end