//
//  ViewController.m
//  picast
//
//  Created by Alexander Yang on 4/30/15.
//  Copyright (c) 2015 Alexander Yang. All rights reserved.
//

#import "ViewController.h"
#import "NetworkRunner.h"
// #import "Utils.h"

@interface ViewController ()

@end

@implementation ViewController {
    NSMutableArray* dataSource;
}

- (void)viewDidLoad {
    [super viewDidLoad];
    
    [UIApplication sharedApplication].keyWindow.rootViewController = self;
    // Do any additional setup after loading the view, typically from a nib.
    
    dataSource = [[NSMutableArray alloc] init];
    [dataSource addObject: @"Item 1"];
    [dataSource addObject: @"Item 2"];
    [dataSource addObject: @"Item 3"];
    [dataSource addObject: @"Item 4"];
    [dataSource addObject: @"Item 5"];
    [dataSource addObject: @"Item 6"];
    [dataSource addObject: @"Item 7"];
    [dataSource addObject: @"Item 8"];
    [dataSource addObject: @"Item 9"];
}

- (void)didReceiveMemoryWarning {
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
}

- (NSInteger)tableView:(UITableView *)tableView numberOfRowsInSection:(NSInteger)section {
    return dataSource.count;
}

- (NSIndexPath *)tableView:(UITableView *)tableView willSelectRowAtIndexPath:(NSIndexPath *)indexPath {
    
    NSString* string = [NSString stringWithFormat: @"Selected Row: %lu", (unsigned long)[indexPath indexAtPosition: 1]];
    UIViewController* view = self;
    UIAlertController* alert = [UIAlertController alertControllerWithTitle:@"Notice"
                                                                   message:string
                                                            preferredStyle:UIAlertControllerStyleAlert];
    
    UIAlertAction* defaultAction = [UIAlertAction actionWithTitle:@"OK" style:UIAlertActionStyleDefault
                                                          handler:^(UIAlertAction * action) {}];
    
    [alert addAction:defaultAction];
    [view presentViewController:alert animated:YES completion:nil];
    
    return indexPath;
}

- (UITableViewCell *)tableView:(UITableView *)tableView cellForRowAtIndexPath:(NSIndexPath *)indexPath {
    UITableViewCell* cell = [[UITableViewCell alloc] initWithStyle: UITableViewCellStyleDefault reuseIdentifier: @"cell"];
    cell.textLabel.text = dataSource[[indexPath indexAtPosition: 1]];
    return cell;
}

- (UIViewController*)getViewController {
    return self;
}

- (IBAction)broadcastClick:(id)sender {
    [NetworkRunner broadcast];
}

@end
