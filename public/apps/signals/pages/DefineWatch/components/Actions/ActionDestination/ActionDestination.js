import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { EuiText, EuiLink } from '@elastic/eui';
import { connect as connectRedux } from 'react-redux';
import { FormikComboBox } from '../../../../../components';
import { addErrorToast } from '../../../../../redux/actions';
import { DestinationsService } from '../../../../../services';
import { isInvalid, hasError, validateEmptyArray } from '../../../../../utils/validate';
import { destinationText } from '../../../../../utils/i18n/destination';
import { createText } from '../../../../../utils/i18n/common';
import { APP_PATH } from '../../../../../utils/constants';

class ActionDestination extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isLoading: true,
      destinations: []
    };

    this.destService = new DestinationsService(this.props.httpClient);
  }

  componentDidMount() {
    this.getDestinations();
  }

  getDestinations = async () => {
    const { dispatch } = this.props;
    this.setState({ isLoading: true });
    try {
      const { resp } = await this.destService.get();
      const destinations = resp.map(({ _id: label }) => ({ label }));
      this.setState({ destinations });
    } catch (error) {
      dispatch(addErrorToast(error));
      console.error('Destinations -- getDestinations', error);
    }
    this.setState({ isLoading: false });
  }

  render() {
    const { index } = this.props;
    const { destinations, isLoading } = this.state;

    return (
      <FormikComboBox
        name={`actions[${index}].account`}
        formRow
        formikFieldProps={{ validate: validateEmptyArray }}
        rowProps={{
          label: destinationText,
          isInvalid,
          error: hasError,
          style: { paddingLeft: '0px' },
        }}
        elementProps={{
          isClearable: false,
          singleSelection: { asPlainText: true },
          placeholder: 'Select destination',
          async: true,
          isLoading,
          options: destinations,
          onBlur: (e, field, form) => {
            form.setFieldTouched(field.name, true);
          },
          onChange: (options, field, form) => {
            form.setFieldValue(field.name, options);
          },
          'data-test-subj': 'sgDestinationsComboBox',
        }}
      />
    );
  }
}

ActionDestination.propTypes = {
  httpClient: PropTypes.func.isRequired,
  index: PropTypes.number.isRequired,
  dispatch: PropTypes.func.isRequired
};

export default connectRedux()(ActionDestination);
