import React, { Component, Fragment } from 'react';

import {sgContext} from '../../../../utils/sgContext';

import {
  EuiPage,
  EuiPageBody,
  EuiPageContent,
  EuiPageContentBody,
  EuiSpacer,
 EuiText, EuiListGroup, EuiListGroupItem, EuiPageHeader
} from '@elastic/eui';
import { LicenseWarningCallout } from '../../../../apps/components';

import { MainContext } from '../../contexts/MainContextProvider';



import {
  accountPageHeader,
  accountPluginVersion,
} from '../../utils/i18n/accountinfo_labels';

//@todo APP_NAME used where?
const APP_NAME = 'Account Info'

export default class Main extends Component {
  static contextType = MainContext;

  constructor(props, context) {
    super(props, context);

    this.API_ROOT = `/api/v1`;

    // @todo sgVersion
    this.state = {
      sgVersion: sgContext.pluginVersion,
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

          this.setState({
            sgUser: response.data
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
              <LicenseWarningCallout httpClient={this.props.httpClient} />

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
