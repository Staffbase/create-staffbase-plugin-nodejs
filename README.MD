# Create-Staffbase-SSO-CLI Documentation
![Staffbase Logo](https://staffbase.com/wp-content/themes/staffbase-theme/img/logo-blau.svg)
## Getting started
Install the package in your global namespace and then run the command.

```bash
$ npm install -g @staffbase/create-staffbase-plugin
$ create-staffbase-plugin /home/user1/work/staffbase-server/ --name staffbase-sso-server
```

You can use `yarn create` to directly run the command. The syntax of `yarn create staffbase-plugin` is:
> yarn create @staffbase/staffbase-plugin [Destination folder] --name [Plugin Name]

Example:
```bash
$ yarn create @staffbase/staffbase-plugin /home/user1/work/staffbase-server/ --name staffbase-sso-server
```
## Interactive Mode
You can also run the command without passing any arguments to get into interactive
mode which would ask you the name of your app and the path where it need to be installed.
```
$ create-staffbase-plugin

Please enter npm compatible name: (my-staffbase-backend)
Please enter the folder path for the App: (/private/tmp/staffbase/my-staffbase-backend)
The directory you specified already exists. It will be overridden!
Do you wish to proceed (y)es|(n)o?: (no)

Setting up your project in:  /private/tmp/staffbase/server
Installing dependencies...se/server
```

On entering the path, you can either specify an absolute path or a relative path. The relative path is resolved against the current working directory (`process.cwd()`).

## Configuration
After the scaffolding is complete, you need to provide some values for configuring your
plugin server. The following values need to be configured.

- Plugin Secret
- Plugin Audience

You can either specify these values in environment variables or directly passing
the values in the `app.js` file where the middleware is initialized.

To configure values in `app.js` file, change the following lines:

app.js
```javascript
12 ...
13 ...
14 const key = null;
15 const pluginID = null;
16 ...
```

You can also specify these values using environment variables.
Refer to the table to see which environment variables can be used.

|   *Value*     |   *Environment Variable*    |           *Default if not set*           |
|:--------------|:--------------------------: |:----------------------------------------:|
|Secret         |STAFFBASE_SSO_SECRET         | *(empty)*                                |
|Audience       |STAFFBASE_SSO_AUDIENCE       | *(empty)*                                |
|Server Port    |PORT                         | 3000                                     |
|Server Address |ADDRESS                      | *(empty, listening on all IP addresses)* |

## Running the server
_create-staffbase-plugin_ installs the project dependencies for you.
After configurations is done, the only thing you need to do is navigate to the
folder where your app was generated and start the express server.
```bash
$ cd [path of generated app]
$ npm start
```

## License

Copyright 2017-2024 Staffbase GmbH.

Licensed under the Apache License, Version 2.0: https://www.apache.org/licenses/LICENSE-2.0

<table>
  <tr>
    <td>
      <img src="docs/assets/images/staffbase.png" alt="Staffbase GmbH" width="96" />
    </td>
    <td>
      <b>Staffbase GmbH</b>
      <br />Staffbase is an internal communications platform built to revolutionize the way you work and unite your company. Staffbase is hiring: <a href="https://jobs.staffbase.com" target="_blank" rel="noreferrer">jobs.staffbase.com</a>
      <br /><a href="https://github.com/Staffbase" target="_blank" rel="noreferrer">GitHub</a> | <a href="https://staffbase.com/" target="_blank" rel="noreferrer">Website</a> | <a href="https://jobs.staffbase.com" target="_blank" rel="noreferrer">Jobs</a>
    </td>
  </tr>
</table>