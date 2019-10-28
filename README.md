# Search Guard Kibana Plugin

<p align="center">
<img src="http://docs.search-guard.com/latest/search-guard-frontmatter.png" style="width: 60%" class="md_image"/>
</p>

## About this plugin
This plugin for Kibana adds session management and true multi-tenancy to a [Search Guard](https://search-guard.com) secured cluster.

For Kibana 6.x it also provides a configuration GUI for Search Guard.

## Downloads

* Kibana 6.x: [Maven Central](https://search.maven.org/#search%7Cgav%7C1%7Cg%3A%22com.floragunn%22%20AND%20a%3A%22search-guard-kibana-plugin%22)
* Kibana 5.x: [GitHub](https://github.com/floragunncom/search-guard-kibana-plugin/releases)

## Installation

Download the release matching your Kibana installation, and install it like any other Kibana plugin:

```
bin/kibana-plugin install file:///path/to/searchguard-kibana-<version>.zip
```

**For multi-tenancy, you also need to install the [Search Guard multi-tenancy module](https://github.com/floragunncom/search-guard-module-kibana-multitenancy) in addition to this plugin!**

## Documentation

### Kibana 6.x
* [Installation](http://docs.search-guard.com/latest/kibana-plugin-installation)
* [Authentication](http://docs.search-guard.com/latest/kibana-authentication)
* [Multi Tenancy](http://docs.search-guard.com/latest/kibana-multi-tenancy)
* [Configuration GUI](http://docs.search-guard.com/latest/configuration-gui)

### Kibana 5.x
* [Installation](http://docs.search-guard.com/v5/kibana-plugin-installation)
* [Authentication](http://docs.search-guard.com/v5/kibana-authentication)
* [Multi Tenancy](http://docs.search-guard.com/v5/kibana-multi-tenancy)

## Commercial use
This software is licensed under the Apache2 license and can be used freely also for commercial purposes. Some features may require the Search Guard Enterprise Edition or above to function.

## Development

See the [kibana contributing guide](https://github.com/elastic/kibana/blob/master/CONTRIBUTING.md) and the Search Guard documentation above for instructions setting up your development environment. Once you have completed that, use the following yarn scripts.

  - `yarn`

    Install dependencies and crosslink Kibana and all projects/plugins.

    > ***IMPORTANT:*** Use this script instead of `yarn` to install dependencies when switching branches, and re-run it whenever your dependencies change.

  - `yarn start`

    Start kibana and have it include this plugin. You can pass any arguments that you would normally send to `bin/kibana`

      ```
      yarn start --elasticsearch.hosts http://localhost:9220
      ```

  - `./build.sh <kibana_version> <sg_plugin_version> <install|deploy>`

    Build a distributable archive of your plugin.

  - `yarn test:browser`

    Run UI unit tests.

  - `yarn test:server`

    Run server unit tests.

  - `yarn test:prepare_integration_test`

    Run script for integration tests when Elasticsearch and Kibana should have different version in the same cluster: eliminate Kibana version check error and install required packages.

For more information about any of these commands run `yarn ${task} --help`. For a full list of tasks checkout the `package.json` file, or run `yarn run`.

## License
Copyright 2015-2018 floragunn GmbH

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.

## Legal

Search Guard is a trademark of floragunn GmbH, registered in the U.S. and in other countries

Elasticsearch, Kibana, Logstash, and Beats are trademarks of Elasticsearch BV, registered in the U.S. and in other countries.

floragunn GmbH is not affiliated with Elasticsearch BV.
