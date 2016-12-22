# Search Guard Kibana Plugin

**Note: This software is in alpha state and not recommended for production yet.**

<p align="center">
![Logo](https://raw.githubusercontent.com/floragunncom/sg-assets/master/logo/sg_dlic_small.png) 


## About this plugin
This plugin for Kibana adds login and logout capabilities to a [Search Guard](https://github.com/floragunncom/search-guard) secured cluster.

## Download
All releases can be found under the [release section](https://github.com/floragunncom/search-guard-kibana-plugin/releases)

## (Preliminary) Documentation

* Download the release matching your Kibana installation
* Kibana >= 5
 * cd into your Kibana installaton directory
 * Execute: `bin/kibana-plugin install file:///path/to/searchguard-kibana-alpha-<version>.zip` 
* Kibana < 5
 * cd into your Kibana installaton directory
 * Execute: `bin/kibana plugin -i searchguard-kibana-alpha -u file:///path/to/searchguard-kibana-alpha-4.6.0.zip 
` 
* Authentication credentials are stored in an encrypted cookie. You need to configure the encryption key in your kibana.yml file. The key needs to have at least 32 characters:
 * `searchguard.cookie.password: "<your key here>"`
* If you do not specify the  `searchguard.cookie.password`, Kibana will fail to start


##License
Copyright 2015 floragunn UG (haftungsbeschränkt)

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

[http://www.apache.org/licenses/LICENSE-2.0](http://www.apache.org/licenses/LICENSE-2.0)

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.

##Legal
floragunn GmbH is not affiliated with Elasticsearch BV.

Elasticsearch, Kibana, Logstash, and Beats are trademarks of Elasticsearch BV, registered in the U.S. and in other countries.