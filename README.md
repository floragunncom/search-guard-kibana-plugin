# Search Guard Kibana Plugin

<p align="center">
<img src="http://docs.search-guard.com/latest/search-guard-frontmatter.png" style="width: 60%" class="md_image"/>
</p>

## About this plugin

This plugin for Kibana adds session management and true multi-tenancy to a [Search Guard](https://search-guard.com) secured cluster.

It also provides a configuration GUI for Search Guard.

## Commercial use

This software is licensed under the Apache2 license and can be used freely also for commercial purposes. Some features may require the [Search Guard Enterprise Edition](https://search-guard.com/licensing/) or above to function.

## Installation

Download the release matching your Kibana installation, and install it like any other Kibana plugin:

```
bin/kibana-plugin install file:///path/to/searchguard-kibana-<version>.zip
```

## Configuration

Execute the install_demo_configuration script to configure the Search Guard Kibana plugin with a demo configuration and create a self-signed TLS certificate. Afterward, make sure you configured the Search Guard Elasticsearch plugin accordingly. [Check the documentation](https://docs.search-guard.com/latest/authentication-authorization).

```
  ____                                 _          ____                              _ 
 / ___|    ___    __ _   _ __    ___  | |__      / ___|  _   _    __ _   _ __    __| |
 \___ \   / _ \  / _` | | '__|  / __| | '_ \    | |  _  | | | |  / _` | | '__|  / _` |
  ___) | |  __/ | (_| | | |    | (__  | | | |   | |_| | | |_| | | (_| | | |    | (_| |
 |____/   \___|  \__,_| |_|     \___| |_| |_|    \____|  \__,_|  \__,_| |_|     \__,_|
                                                                                      
? What do you want to configure? (Use arrow keys)
❯ Basic Login demo 
  OpenID Connect demo 
  JWT demo 
  SAML demo 
  Proxy demo 
  Kerberos demo 
```

### Linux
```
cd kibana/plugins/searchguard
./install_demo_configuration.sh
```

### Windows
```
cd kibana\plugins\searchguard
powershell -ExecutionPolicy Bypass -File install_demo_configuration.ps1
```

## Documentation

### Kibana 7.x
* [Installation](http://docs.search-guard.com/latest/kibana-plugin-installation)
* [Authentication](https://docs.search-guard.com/latest/kibana-authentication-types)
* [Multi Tenancy](http://docs.search-guard.com/latest/kibana-multi-tenancy)
* [Configuration GUI](http://docs.search-guard.com/latest/configuration-gui)

### Kibana 6.x
* [Installation](http://docs.search-guard.com/6.x-25/kibana-plugin-installation)
* [Authentication](http://docs.search-guard.com/6.x-25/kibana-authentication-types)
* [Multi Tenancy](http://docs.search-guard.com/6.x-25/kibana-multi-tenancy)
* [Configuration GUI](http://docs.search-guard.com/6.x-25/configuration-gui)

### Kibana 5.x
* [Installation](http://docs.search-guard.com/v5/kibana-plugin-installation)
* [Authentication](http://docs.search-guard.com/v5/kibana-authentication)
* [Multi Tenancy](http://docs.search-guard.com/v5/kibana-multi-tenancy)

## Development

See the [kibana contributing guide](https://github.com/elastic/kibana/blob/master/CONTRIBUTING.md) and the Search Guard documentation above for instructions setting up your development environment. The plugin has to be checked out inside the Kibana source tree, at `plugins/search-guard`.

Kibana and this plugin both use [pnpm](https://pnpm.io). pnpm comes with Node.js through corepack, in the version that the `packageManager` field of Kibana's `package.json` names. Enable it once with `corepack enable`; `ci/init_build.sh` does this automatically.

Run the following in the plugin folder, unless noted otherwise.

  - `pnpm kbn bootstrap`

    Install Kibana's dependencies and build its packages. Re-run it when you switch to another Kibana version.

  - `pnpm install`

    Install the plugin's own dependencies from `pnpm-lock.yaml`. The plugin is not part of Kibana's pnpm workspace, so `pnpm kbn bootstrap` does not install them. Re-run it whenever the plugin's dependencies change, for example after switching branches.

    If `package.json` and `pnpm-lock.yaml` do not agree, a plain `pnpm install` resolves again and rewrites the lockfile without saying so. Use `pnpm install --frozen-lockfile` to install exactly what the lockfile pins and to fail otherwise; CI does. If `pnpm-lock.yaml` shows as changed after an install that was not meant to change dependencies, do not commit it.

  - `pnpm add <name>`, `pnpm update <name>`

    Add or update a dependency of the plugin. Both write `package.json` and `pnpm-lock.yaml`; commit the two together. A version published less than three days ago is refused. The rules and the way to make an exception for an urgent fix (`minimumReleaseAgeExclude`) are described in the comments of `pnpm-workspace.yaml`.

    > ***NOTE:*** If the plugin folder still has a `node_modules` folder that yarn created, delete it before the first `pnpm install`. pnpm installs over it, but leaves in place what only yarn had put there.

  - `pnpm start`

    Run this one in the Kibana root folder. Start kibana and have it include this plugin. You can pass any arguments that you would normally send to `bin/kibana`

      ```
      pnpm start --elasticsearch.hosts http://localhost:9220
      ```

  - `pnpm dev --watch`

    Build the plugin's browser bundle and rebuild it on every change.

  - `./build.sh <install-local|deploy-snapshot-maven>`

    Build locally a distributable archive of your plugin or deploy snapshot to maven repository.

  - `pnpm test:browser`

    Run UI unit tests.

  - `pnpm test:server`

    Run server unit tests.

For more information about one of the plugin's own tasks run `pnpm ${task} --help`, for example `pnpm dev --help`. This does not work for `pnpm start`: `pnpm start --help` prints pnpm's help, not Kibana's. For a full list of tasks checkout the `package.json` file, or run `pnpm run`.

### Development tips

  - Use [NVM](https://github.com/nvm-sh/nvm) to manage multiple versions of Node.js.

  - Comment `/plugins` in Kibana .eslintignore file to make the eslint working in your IDE.

  - Delete the `build` folder in the plugin folder before you run the unit tests. `pnpm build` leaves it there, and jest then stops with `Duplicated files or mocks`.

### Integration tests
#### Custom branch
  You can make CI to run integration tests against specific Kibana branch or/and specific branch of Search Guard Suite plugin, for example: 
  **package.json**
```json  
    "searchguard": {  
        "test_sg_version": "7.8.0-42.0.0-SNAPSHOT",
        "kibana_branch": "7.7"
    }
```
where
  - `test_sg_version` - is the location of the latest SNAPSHOT for specified Search Guard and ES versions in Search Guard maven repository.
  - `kibana_branch` - is the branch in the official Kibana repository, which should be used for building and testing Search Guard Kibana plugin.
  
  These parameters are optional - if you don't specify them, the integration tests will be executed according to standard procedure.
  > ***IMPORTANT:*** Please, do not use these parameters in production branches of Search Guard Kibana plugin.

## License

Copyright 2015-2018 floragunn GmbH

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.

## Legal

Search Guard is a trademark of floragunn GmbH, registered in the U.S. and in other countries

Elasticsearch, Kibana, Logstash, and Beats are trademarks of Elasticsearch BV, registered in the U.S. and in other countries.

floragunn GmbH is not affiliated with Elasticsearch BV.
