import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { Formik } from 'formik';
import { connect as connectRedux } from 'react-redux';
import queryString from 'query-string';
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiTitle,
  EuiSpacer
} from '@elastic/eui';
import {
  EmailDestination,
  SlackDestination
} from './components';
import {
  CancelButton,
  SaveButton
} from '../../components';
import { DestinationsService } from '../../services';
import { addErrorToast, addSuccessToast } from '../../redux/actions';
import { updateText, createText, saveText } from '../../utils/i18n/common';
import { updateDestinationText, createDestinationText } from '../../utils/i18n/destination';
import { destinationToFormik, formikToDestination } from './utils';
import { APP_PATH } from '../../utils/constants';
import { DESTINATION_TYPE } from '../Destinations/utils/constants';
import * as DEFAULTS from './utils/defaults';

class DefineDestination extends Component {
  constructor(props) {
    super(props);

    const { location, httpClient } = this.props;
    const { destinationType } = queryString.parse(location.search);

    this.destService = new DestinationsService(httpClient, destinationType);
    const initialValues = destinationType
      ? DEFAULTS[destinationType] : DEFAULTS[DESTINATION_TYPE.EMAIL];

    this.state = {
      initialValues: destinationToFormik(initialValues)
    };
  }

  componentDidMount() {
    this.fetchData();
  }

  fetchData = async () => {
    const { dispatch, location } = this.props;
    const { id } = queryString.parse(location.search);

    try {
      if (id) {
        const { resp: initialValues } = await this.destService.get(id);
        this.setState({ initialValues: destinationToFormik(initialValues) });
      }
    } catch (error) {
      console.error('DefineDestination -- fetchData', error);
      dispatch(addErrorToast(error));
      console.debug('DefineDestination -- id', id);
    }
  }

  onCancel = () => {
    const { history } = this.props;

    if (this.state.isEdit) history.goBack();
    history.push(APP_PATH.DESTINATIONS);
  }

  onSubmit = async (values, { setSubmitting }) => {
    const { dispatch } = this.props;
    const { _id: id, ...destination } = values;

    try {
      await this.destService.put(formikToDestination(destination), id);
      setSubmitting(false);
      dispatch(addSuccessToast((<p>{saveText} {id}</p>)));
      this.onCancel();
    } catch (error) {
      console.error('DefineDestination -- onSubmit', error);
      setSubmitting(false);
      dispatch(addErrorToast(error));
      console.debug('DefineDestination -- formik values', values);
    }
  }

  render() {
    const {
      location,
      httpClient,
      onComboBoxChange,
      onComboBoxOnBlur,
      onComboBoxCreateOption
    } = this.props;

    const { initialValues } = this.state;
    const { id, destinationType } = queryString.parse(location.search);
    const isEdit = !!id;

    let destination = (
      <EmailDestination
        httpClient={httpClient}
        id={id}
        onComboBoxChange={onComboBoxChange}
        onComboBoxOnBlur={onComboBoxOnBlur}
        onComboBoxCreateOption={onComboBoxCreateOption}
      />
    );

    if (destinationType === DESTINATION_TYPE.SLACK) {
      destination = <SlackDestination httpClient={httpClient} id={id} />;
    }

    return (
      <div>
        <Formik
          initialValues={initialValues}
          onSubmit={this.onSubmit}
          validateOnChange={false}
          enableReinitialize
          render={({ handleSubmit, isSubmitting }) => (
            <Fragment>
              <EuiTitle size="l">
                <h1>{isEdit ? updateDestinationText : createDestinationText}</h1>
              </EuiTitle>
              <EuiSpacer />
              {destination}
              <EuiSpacer />
              <EuiFlexGroup alignItems="center" justifyContent="flexEnd">
                <EuiFlexItem grow={false}>
                  <CancelButton onClick={this.onCancel} />
                </EuiFlexItem>
                <EuiFlexItem grow={false}>
                  <SaveButton
                    isLoading={isSubmitting}
                    onClick={handleSubmit}
                    value={isEdit ? updateText : createText}
                  />
                </EuiFlexItem>
              </EuiFlexGroup>
            </Fragment>
          )}
        />
      </div>
    );
  }
}

DefineDestination.propTypes = {
  location: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
  httpClient: PropTypes.func.isRequired,
  dispatch: PropTypes.func.isRequired,
  onComboBoxChange: PropTypes.func.isRequired,
  onComboBoxOnBlur: PropTypes.func.isRequired,
  onComboBoxCreateOption: PropTypes.func.isRequired
};

export default connectRedux()(DefineDestination);
