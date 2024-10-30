/* eslint-disable @kbn/eslint/require-license-header */
import React, { Component } from 'react';
import { EuiButton, EuiText, EuiSpacer, EuiSwitch } from '@elastic/eui';
import { API } from "../../../../utils/constants";
import { Context } from '../../../../Context';

/**
 * A component for installing the audit log templates.
 * At the moment, this is only for one set of templates,
 * but may be extended if we add more.
 */
export class Templates extends Component {
  static contextType = Context;

  constructor(props) {
    super(props);

    this.state = {
      isInstalling: false,
      didInstall: false,
      overwrite: false,
    };
  }

  render() {
    let overwriteLabel = "Overwrite existing template: " + (this.state.overwrite === true ? 'Yes' : 'No')
    const isInstallButtonDisabled = (this.state.isInstalling || this.state.didInstall);
    let buttonLabel = 'Install';
    if (this.state.isInstalling) {
      buttonLabel = 'Installing...';
    }
    if (this.state.didInstall) {
      buttonLabel = 'Installed'
    }

    return (
        <EuiText>
          <EuiSpacer size={"s"}/>
          <h2>Search Guard Audit Logging Visualizations</h2>
          <p>
            This template provides a dashboard and visualizations for the Search Guard Audit Logging.
          </p>
          <p>
            <EuiSwitch
              label={overwriteLabel}
              checked={this.state.overwrite}
              onChange={(event) => {
                this.setState({
                  overwrite: !this.state.overwrite,
                })
              }}
            />
          </p>
          <EuiButton
            disabled={isInstallButtonDisabled}
            onClick={async () => {
              this.setState({
                isInstalling: true,
              });
              try {
                const {data: result} = await this.context.httpClient.post(API.TEMPLATES_AUDITLOG, {
                  overwrite: this.state.overwrite
                });
                if (result.errors) {
                  this.context.addErrorToast(result, {
                    title: 'Error while importing',
                    errorMessage: 'There were errors while importing',
                    errorDetails: result
                  });
                  this.setState({
                    isInstalling: false,
                  });
                } else {
                  this.setState({
                    isInstalling: false,
                    didInstall: true,
                  });
                  this.context.addSuccessToast('Import successful')
                }
              } catch (error) {
                this.context.addErrorToast('Error', {
                  title: 'Something went wrong while importing',
                });
                this.setState({
                  isInstalling: false,
                });
              }
            }}
          >
            {buttonLabel}
          </EuiButton>
        </EuiText>
    );
  }
}

