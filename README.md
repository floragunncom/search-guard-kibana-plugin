# Search Guard Kibana Plugin

![Logo](https://raw.githubusercontent.com/floragunncom/sg-assets/master/logo/sg_dlic_small.png) 


## About this plugin
This plugin for Kibana adds session management and true multi-tenancy to a [Search Guard](https://github.com/floragunncom/search-guard) secured cluster. Multi-tenancy is available for Elasticsearch 5.x and 6.x only.

## Downloads

* [Kibana 6.0.0 / Search Guard plugin 6.0.0-beta1](https://oss.sonatype.org/content/repositories/releases/com/floragunn/search-guard-kibana-plugin/6.0.0-beta1/search-guard-kibana-plugin-6.0.0-beta1.zip)
* [Kibana 5.4.0 / Search Guard plugin 5.4.0-2](https://github.com/floragunncom/search-guard-kibana-plugin/releases/download/v5.4.0/searchguard-kibana-5.4.0-2.zip)
* [Kibana 5.3.2 / Search Guard plugin 5.3.2-2](https://github.com/floragunncom/search-guard-kibana-plugin/releases/download/v5.3.2-2/searchguard-kibana-5.3.2-2.zip)
* [Kibana 5.3.1 / Search Guard plugin 5.3.1-2](https://github.com/floragunncom/search-guard-kibana-plugin/releases/download/v5.3.1-2/searchguard-kibana-5.3.1-2.zip)
* [Kibana 5.3.0 / Search Guard plugin 5.3.0-2](https://github.com/floragunncom/search-guard-kibana-plugin/releases/download/v5.3.0-2/searchguard-kibana-5.3.0-2.zip)
* [Kibana 5.2.2 / Search Guard plugin 5.2.2-2](https://github.com/floragunncom/search-guard-kibana-plugin/releases/download/v5.2.2-2/searchguard-kibana-5.2.2-2.zip)
* [Kibana 5.2.1 / Search Guard plugin 5.2.1-2](https://github.com/floragunncom/search-guard-kibana-plugin/releases/download/v5.2.1-2/searchguard-kibana-5.2.1-2.zip)
* [Kibana 5.2.0 / Search Guard plugin 5.2.0-2](https://github.com/floragunncom/search-guard-kibana-plugin/releases/download/v5.2.0-2/searchguard-kibana-5.2.0-2.zip)
* [Kibana 5.1.2 / Search Guard plugin 5.1.2-2](https://github.com/floragunncom/search-guard-kibana-plugin/releases/download/v5.1.2-2/searchguard-kibana-5.1.2-2.zip)
* [Kibana 5.1.1 / Search Guard plugin 5.1.1-2](https://github.com/floragunncom/search-guard-kibana-plugin/releases/download/v5.1.1-2/searchguard-kibana-5.1.1-2.zip)
* [Kibana 5.0.2 / Search Guard plugin 5.0.2-2](https://github.com/floragunncom/search-guard-kibana-plugin/releases/download/v5.0.2-2/searchguard-kibana-5.0.2-2.zip)

All versions:
[GitHub](https://github.com/floragunncom/search-guard-kibana-plugin/releases)

**Choose the module version matching your Elasticsearch version, and download the jar with dependencies.**

## Installation

Download the release matching your Kibana installation, and install it like any other Kibana plugin:

```
bin/kibana-plugin install file:///path/to/searchguard-kibana-<version>.zip
```

**For multi-tenancy, you also need to install the [Search Guard multi-tenancy module](https://github.com/floragunncom/search-guard-module-kibana-multitenancy) in addition to this plugin! (5.x only)**

## Documentation

Please refer to the official Search Guard documentation for installation and configuration instructions:

[Using Search Guard with Kibana](https://github.com/floragunncom/search-guard-docs/blob/master/kibana.md)

## Commercial use
This software is licensed under the Apache2 license and can be used freely also for commercial purposes.

## License
Copyright 2015 floragunn GmbH

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.

## Legal
floragunn GmbH is not affiliated with Elasticsearch BV.

Elasticsearch, Kibana, Logstash, and Beats are trademarks of Elasticsearch BV, registered in the U.S. and in other countries.
