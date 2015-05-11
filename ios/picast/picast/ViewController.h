//
//  ViewController.h
//  picast
//
//  Created by Alexander Yang on 4/30/15.
//  Copyright (c) 2015 Alexander Yang. All rights reserved.
//

#import <UIKit/UIKit.h>

@interface ViewController : UIViewController <UITableViewDataSource, UITableViewDelegate>

- (UIViewController*)getViewController;

@end

