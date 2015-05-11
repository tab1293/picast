//
//  ViewControllerVideo.m
//  picast
//
//  Created by Alexander Yang on 5/10/15.
//  Copyright (c) 2015 Alexander Yang. All rights reserved.
//


#import "ViewControllerVideo.h"
#import <MediaPlayer/MediaPlayer.h>

@interface ViewControllerVideo ()

@property (strong, nonatomic) MPMoviePlayerController *streamPlayer;

@end


@implementation ViewControllerVideo

- (void)viewDidLoad {
    
    [super viewDidLoad];
    
    NSURL *streamURL = [NSURL URLWithString:@"http://devimages.apple.com/iphone/samples/bipbop/gear1/prog_index.m3u8"];
    
    _streamPlayer = [[MPMoviePlayerController alloc] initWithContentURL:streamURL];
    
    // depending on your implementation your view may not have it's bounds set here
    // in that case consider calling the following 4 msgs later
    [self.streamPlayer.view setFrame: self.view.bounds];
    
    self.streamPlayer.controlStyle = MPMovieControlStyleEmbedded;
    
    [self.view addSubview: self.streamPlayer.view];
    
    [self.streamPlayer play];
}

@end
