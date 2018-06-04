# node-red-contrib-c8y-get-alarms
This is a node-red node that smoothly integrates with the Cumulocity platform to fetch alarm data.

## Installation
run npm -g install node-red-contrib-c8y-get-alarms

## Features
Fetches alarm data & can limit the data based on alarm type, status, & deviceId

## Usage

### Required inputs:
* cumulocity instance name
* tenant name

### Optional inputs:
* deviceId: limits alarms data to 1 specific device
* type: filters based on alarm type
* status: filters based on alarm status
* pageSize: Defines maximum number of records to return


## Why this module?
This node is part of a series of nodes designed to integrate with the Cumulocity IoT platform.  The long-term goal is to create a complete library of node-red nodes that can pair with Cumulocity (analogous to the AWS & Salesforce node-red libraries).

## What's next?
Optional pagination of results is coming next: This will give users to option to have the node run continuously until all alarms are returned. This will also include the ability to add a max timeout.

I also want to make it easier to have environment variables stored easily in your NodeRed flow.  Parameters like tenant name, usernames, & credentials should all be stored in one location (vs. hard-coded into each node), so that they can be changed, managed, & protected more easily.  Once I have that figured out, I'll update this node to be compatible with that.
# node-red-contrib-c8y-get-alarms
