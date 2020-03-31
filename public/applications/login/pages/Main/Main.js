/**
 * @todo
 * -- License
 * -- Alternative config things
 * -- Integration test classes
 */

import React, { Component, Fragment } from 'react';

import { sgContext } from '../../../../utils/sgContext';

import {
  EuiPage,
  EuiPageBody,
  EuiPageContent,
  EuiPageContentBody,
  EuiPageContentHeader,
  EuiPageContentHeaderSection,
  EuiTitle,
  EuiSpacer,
  EuiFieldText,
  EuiFieldPassword,
  EuiForm,
} from '@elastic/eui';
import { LicenseWarningCallout } from '../../../../apps/components';

//import { SystemStateService} from '../../../../services';

import { MainContext } from '../../contexts/MainContextProvider';
// @todo Add back?
//import { LocalStorageService} from "../../../../apps/configuration-react/services";
import { get, isEmpty, map } from 'lodash';
// @todo Add back?
//import { CALLOUTS, LOCAL_STORAGE } from '../../../../apps/configuration-react/utils/constants';
//import { checkIfLicenseValid } from '../../../../apps/configuration-react/utils/helpers';
import {
  apiAccessStateForbiddenText,
  apiAccessStateNotEnabledText,
  sgLicenseNotValidText
} from '../../../configuration-react/utils/i18n/main';

//import { Callout } from '../../../components';
//import { API_ACCESS_STATE } from '../../../../apps/configuration-react/pages/Main/utils/constants';

import { APP_NAME } from '../../utils/constants';

// @todo Move this to the new app
import {sanitizeNextUrlFromFullUrl} from "../../../../apps/login/sanitize_next_url";

export default class Main extends Component {
  static contextType = MainContext;

  constructor(props, context) {
    super(props, context);

    // @todo basePath
    this.ROOT = '';
    const APP_ROOT = ``;
    this.API_ROOT = `${APP_ROOT}/api/v1`;

    // @todo Add back?
    //this.localStorage = new LocalStorageService();
    //if (isEmpty(this.localStorage.cache)) this.localStorage.cache = LOCAL_STORAGE;

    const { addErrorToast } = context;

    const API_ROOT = `${APP_ROOT}/api/v1`;
    // @todo Clean up
    this.API_ROOT = API_ROOT;

    //const BRANDIMAGE = chrome.getInjected("basicauth.login.brandimage");

    // if session was not terminated by logout, clear any remaining
    // stored paths etc. from previous users, to avoid issues
    // like a non-working default index pattern
    localStorage.clear();
    sessionStorage.clear();

    // Custom styling
    this.errorMessage = false;
    /*
    this.logintitle = chrome.getInjected("basicauth.login.title");
    this.loginsubtitle = chrome.getInjected("basicauth.login.subtitle");
    this.showbrandimage = chrome.getInjected("basicauth.login.showbrandimage");
    this.brandimage = chrome.getInjected("basicauth.login.brandimage");
    this.buttonstyle = chrome.getInjected("basicauth.login.buttonstyle");
     */


    //this.showbrandimage = chrome.getInjected("basicauth.login.showbrandimage");
    //this.brandimage = chrome.getInjected("basicauth.login.brandimage");
    //this.buttonstyle = chrome.getInjected("basicauth.login.buttonstyle");

    const loginConfig = sgContext.config.get('basicauth.login');

    // @todo No need for the variables above
    this.state = {
      loginTitle: loginConfig.title,
      loginSubTitle: loginConfig.subtitle,
      brandImage: loginConfig.brandimage,
      userName: '',
      password: '',
      alternativeLogin: this.getAlternativeLogin()
    };
  }

  componentDidMount() {

  }

  checkAPIAccess = async () => {
    return;

  }

  handleTriggerCallout = callout => {
    this.setState({ callout });
  }

  handleTriggerErrorCallout = error => {
    console.error(error);
    error = error.data || error;
    this.handleTriggerCallout({
      type: CALLOUTS.ERROR_CALLOUT,
      payload: get(error, 'message', error)
    });
  }

  getAlternativeLogin() {
    const alternativeLoginConfig = sgContext.config.get('basicauth.alternative_login');

    // Prepare alternative login for the view
    let alternativeLogin = null;

    if (alternativeLoginConfig.show_for_parameter) {

      // Build an object from the query parameters
      // Strip the first ? from the query parameters, if we have any
      let queryString = location.search.trim().replace(/^(\?)/, '');
      let queryObject = {};
      if (queryString) {
        queryString.split('&')
          .map((parameter) => {
            let parameterParts = parameter.split('=');
            if (parameterParts[1]) {
              queryObject[encodeURIComponent(parameterParts[0])] = parameterParts[1]
            }
          })
      }

      let alternativeLoginURL = queryObject[alternativeLoginConfig.show_for_parameter];
      let validRedirect = false;

      try {
        alternativeLoginConfig.valid_redirects.forEach((redirect) => {
          if (new RegExp(redirect).test(alternativeLoginURL)) {
            validRedirect = true;
          }
        });
      } catch (error) {
        console.warn(error);
      }

      if (validRedirect) {
        alternativeLogin = {
          url: queryObject[alternativeLoginConfig.show_for_parameter],
          styles: alternativeLoginConfig.buttonstyle,
          buttonLabel: alternativeLoginConfig.button_text,
        };
      }

      return alternativeLogin;
    }
  }

  onChange = (event) => {
    const { name, value } = event.target;

    console.warn('What are we setting', name, value)

    this.setState({
      [name]: value
    }, () => {
      console.log('What is state?', this.state)
    });
  };

  handleSubmit = () => {

    const {
      httpClient
    } = this.props;

    try {
      let nextUrl = sanitizeNextUrlFromFullUrl(window.location.href, this.ROOT);
      httpClient.post(`${this.API_ROOT}/auth/login`, {
        username: this.state.userName,
        password: this.state.password
      })
        .then(
          (response) => {


            // cache the current user information, we need it at several places
            sessionStorage.setItem("sg_user", JSON.stringify(response.data));
            // load and cache systeminfo and rest api info
            // perform in the callback due to Chrome cancelling the
            // promises if we navigate away from the page, even if async/await
            // @todo Add back
            /*
            const systemStateService = new SystemStateService(httpClient);

            systemStateService.loadSystemInfo().then((response) => {
              systemStateService.loadRestInfo().then((response) => {
                var user = JSON.parse(sessionStorage.getItem("sg_user"));
                window.location.href = `${nextUrl}`;
              });
            });

             */

            window.location.href = `${nextUrl}`;


          },
          (error) => {
            // @todo
            /*
            if (error.status && error.status === 401) {
              this.errorMessage = 'Invalid username or password, please try again';
            } else if (error.status && error.status === 404) {
              // This happens either when the user doesn't have any valid tenants or roles
              this.errorMessage = error.data.message;
            } else {
              this.errorMessage = 'An error occurred while checking your credentials, make sure you have an Elasticsearch cluster secured by Search Guard running.';
            }

             */
          }
        );
    } catch(error) {
      this.errorMessage = 'An internal error has occured.';
    }


  };



  render() {
    const {
      sgVersion,
      sgUser,
      callout,
    } = this.state;

    return (
      <EuiPage id={APP_NAME}>
        <EuiPageBody className="sg-container">
          <EuiPageContent verticalPosition="center" horizontalPosition="center">
            <div>
              <img alt="logo" src={this.state.brandImage} />
              @todo LOGO brandimage
            </div>

            <EuiPageContentHeader>
              <EuiPageContentHeaderSection>
                <EuiTitle>
                  <h2>
                    {this.state.loginTitle}
                  </h2>
                </EuiTitle>
              </EuiPageContentHeaderSection>
            </EuiPageContentHeader>
            <EuiPageContentBody className="sg-page-content-body">
              {this.state.loginSubTitle}
              <LicenseWarningCallout httpClient={this.props.httpClient} />

              <EuiSpacer />
              <EuiForm>
                <EuiFieldText
                  placeholder="Username"
                  icon="user"
                  name="userName"
                  value={this.state.userName}
                  onChange={this.onChange}
                />

                <EuiSpacer />
                <EuiFieldPassword
                  name="password"
                  placeholder="Password"
                  value={this.state.password}
                  onChange={this.onChange}
                />
                <input onClick={this.handleSubmit} type="submit" value="Submit" />

                {this.state.alternativeLogin && (
                  <a href={this.state.alternativeLogin.url}
                     id="sg.alternative_login"
                     className="btn btn-default btn-login">
                    {this.state.alternativeLogin.buttonLabel}
                  </a>
                )}

              </EuiForm>

              <ul>
                <li>On the password field, make sure we have autocomplete="off" (previous bugs)
                  I believe autocomplete off requires an update to EuI, or we do the fields manually with the demo html</li>
                <li>Alternative login code</li>
                <li>IDs etc for the integration tests</li>
                <li>Submit button should allow for custom styles</li>
                <li>Validation</li>
                <li>Add back / Share the license check with the other components</li>
                <li>Browser side field validation</li>
                <li>basePath for the app root - compare with legacy login</li>
                <li>Dark mode</li>
              </ul>
            </EuiPageContentBody>
          </EuiPageContent>
        </EuiPageBody>
      </EuiPage>

    );
  }
}
