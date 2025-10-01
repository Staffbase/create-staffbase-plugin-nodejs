![Staffbase Logo](https://staffbase.com/wp-content/themes/staffbase-theme/img/logo-blau.svg)

Welcome to your Staffbase SSO plugin server. Please follow the following instructions
to get started with your Plugin Application.

## Prerequisites
In order to get connected with the Staffbase SSO interface, you need a Valid Secret and an Audience ID.

If you are here, you probably have a secret and audience ID registered with Staffbase. If you are not sure about it or you need more information about Staffbase SSO, feel free to contact the Customer Success team at Staffbase.
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

|   *Value*   |   *Environment Variable*    |
|:------------|:--------------------------: |
|Secret       |STAFFBASE_SSO_SECRET         |
|Audience     |STAFFBASE_SSO_AUDIENCE       |
|Server Port  |PORT                         |

## Running the server
_create-staffbase-plugin_ installs the project dependencies for you.
After configurations is done, the only thing you need to do is navigate to the
folder where your app was generated and start the express server.
```bash
$ cd [path of generated app]
$ npm start
```
## Further Reading
For getting more information about Staffbase SSO, please check out the following links:

- [Developer Portal: Custom Plugins](https://developers.staffbase.com/concepts/customplugin-overview/)
- [Staffbase Plugins SDK for Node.js](https://github.com/Staffbase/plugins-sdk-nodejs/blob/main/README.MD)
