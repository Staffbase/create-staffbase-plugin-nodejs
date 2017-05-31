# Create Staffbase SSO CLI Documentation

## Getting started
Install the package in your global namespace and then run the command.

```bash
$ npm install -g create-staffbase-sso-server
$ create-staffbase-sso-server /home/user1/work/staffbase-server/ --name staffbase-sso-server
```

You can use `yarn create` to directly run the command
```bash
$ yarn create staffbase-sso-server /home/user1/work/staffbase-server/ --name staffbase-sso-server
```
## Interactive Mode
You can also run the command without passing any arguments to get into interactive
mode which would ask you the name of your app and the path where it need to be installed.
```
$ create-staffbase-sso-server

Please enter npm compatible name: (staffbase)
Please enter the folder path for the App: (/private/tmp/staffbase/server)
The directory you specified already exists. It will be overridden, Do you want to proceed (y)es|(n)o?: (no)

Setting up your project in:  /private/tmp/staffbase/server
Installing dependencies...se/server
```
