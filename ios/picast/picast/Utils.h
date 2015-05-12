//
//  Utils.h
//  picast
//
//  Created by Alexander Yang on 5/6/15.
//  Copyright (c) 2015 Alexander Yang. All rights reserved.
//

#ifndef picast_Utils_h
#define picast_Utils_h

#import "AppDelegate.h"

static void Alert(NSString* message) {
    
    UIViewController* view = [AppDelegate getTopController];

    UIAlertController* alert = [UIAlertController alertControllerWithTitle:@"Error"
                                                                   message:message
                                                            preferredStyle:UIAlertControllerStyleAlert];
    
    UIAlertAction* defaultAction = [UIAlertAction actionWithTitle:@"OK" style:UIAlertActionStyleDefault
                                                          handler:^(UIAlertAction * action) {}];
    
    [alert addAction:defaultAction];
    [view presentViewController:alert animated:YES completion:nil];
}

#endif
