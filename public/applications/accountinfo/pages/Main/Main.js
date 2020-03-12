import React, { Component, Fragment } from 'react';


import {
  EuiPage,
  EuiPageBody,
  EuiPageContent,
  EuiPageContentBody,
  EuiSpacer,
 EuiText, EuiListGroup, EuiListGroupItem, EuiPageHeader
} from '@elastic/eui';

import { MainContext } from '../../contexts/MainContextProvider';



import {
  accountPageHeader,
  accountPluginVersion,
} from '../../utils/i18n/accountinfo_labels';

const APP_NAME = 'TODO'

export default class Main extends Component {
  static contextType = MainContext;

  constructor(props, context) {
    super(props, context);

    //const APP_ROOT = `${chrome.getBasePath()}`;
    const APP_ROOT = ``; // @todo
    this.API_ROOT = `${APP_ROOT}/api/v1`;


    this.state = {
      //sgVersion: chrome.getInjected('sg_version'),
      sgVersion: '@todo version from config. Can we access the manifest somehow?',
      sgUser: null,
    };

    const { addErrorToast } = context;

    this.fetchUser(addErrorToast);
  }

  componentDidMount() {

  }





  fetchUser(addErrorToast) {
    const { httpClient } = this.props;

    httpClient.get(`${this.API_ROOT}/auth/authinfo`)
      .then(
        (response) => {
          console.warn('What is data?', response)

          this.setState({
            sgUser: response
          })
        },
        (error) =>
        {
          addErrorToast(error);
        }
      );
  }


  render() {
    const {
      sgVersion,
      sgUser,
      callout,
    } = this.state;

    return (
      <EuiPage id={APP_NAME}>
        <EuiPageBody className="sg-container">
          <EuiPageHeader>
            <EuiText size="s" style={{ fontWeight: 500 }}>
              {accountPageHeader}
            </EuiText>
          </EuiPageHeader>
          <EuiPageContent>
            <EuiPageContentBody className="sg-page-content-body">

              {callout && (
                <EuiSpacer size="l"/>
              )}
              {sgUser && (
                <EuiText>
                  <h2>Username</h2>
                  <p>
                    {sgUser.user_name}
                  </p>

                  <h2>Search Guard roles</h2>
                  <p>
                    {sgUser.sg_roles.map(role => (
                      <Fragment key={role}>
                        {role}
                        <br/>
                      </Fragment>
                    ))}
                  </p>

                  <h2>Backend roles</h2>
                  <p>
                    {sgUser.backend_roles.map(role => (
                      <Fragment key={role}>
                        {role}
                        <br/>
                      </Fragment>
                    ))}
                  </p>

                  <EuiText size="xs" style={{ fontStyle: 'italic' }}>
                    {accountPluginVersion(sgVersion)}
                  </EuiText>
                </EuiText>
              )}
            </EuiPageContentBody>
          </EuiPageContent>
        </EuiPageBody>
      </EuiPage>

    );
  }
}
