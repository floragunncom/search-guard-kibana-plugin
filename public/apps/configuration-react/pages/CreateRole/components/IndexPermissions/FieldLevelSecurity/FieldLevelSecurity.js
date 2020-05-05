import React, { Fragment, Component } from 'react';
import { connect } from 'formik';
import PropTypes from 'prop-types';
import { isEqual } from 'lodash';
import {
  EuiSpacer,
  EuiFlexItem,
  EuiFlexGroup,
  EuiCallOut
} from '@elastic/eui';
import {
  FormikRadio,
  FormikComboBox,
  SubHeader
} from '../../../../../components';
import { FLS_MODES } from '../../../utils/constants';
import {
  fieldLevelSecurityText,
  includeOrExcludeFieldsText,
  anonymizeFieldsText,
  anonymizedFieldsDisabledText
} from '../../../../../utils/i18n/roles';
import {
  includeText,
  excludeText
} from '../../../../../utils/i18n/common';
import { fieldNamesToUiFieldNames, mappingsToFieldNames } from './utils';
import { comboBoxOptionsToArray } from '../../../../../utils/helpers';
import { ElasticsearchService } from '../../../../../services';

class FieldLevelSecurity extends Component {
  constructor(props) {
    super(props);

    this.esService = new ElasticsearchService(this.props.httpClient);

    this.state = {
      isLoading: false,
      allFields: [],
      prevIndexPatterns: null
    };
  }

  fetchFields = async () => {
    const {
      formik: { values: { _indexPermissions } },
      index,
      onTriggerErrorCallout
    } = this.props;

    const currIndexPatterns = _indexPermissions[index].index_patterns;
    const isNewPatterns = !isEqual(currIndexPatterns, this.state.prevIndexPatterns);
    if (!isNewPatterns) return;

    try {
      this.setState({ isLoading: true });
      const {
        data: { mappings },
      } = await this.esService.getIndexMappings(comboBoxOptionsToArray(currIndexPatterns));

      this.setState({
        allFields: fieldNamesToUiFieldNames(mappingsToFieldNames(mappings)),
        prevIndexPatterns: currIndexPatterns
      });
    } catch(error) {
      onTriggerErrorCallout(error);
    }
    this.setState({ isLoading: false });
  }

  componentDidMount() {
    this.fetchFields();
  }

  render() {
    const {
      formik: { values: { _indexPermissions } },
      index,
      isAnonymizedFieldsEnabled,
      onComboBoxChange,
      onComboBoxOnBlur,
      onComboBoxCreateOption
    } = this.props;

    const { isLoading, allFields } = this.state;

    return (
      <Fragment>
        <SubHeader title={<h4>{fieldLevelSecurityText}</h4>} />
        <EuiFlexGroup>
          <EuiFlexItem grow={false}>
            <FormikRadio
              name={`_indexPermissions[${index}].flsmode`}
              formRow
              elementProps={{
                // Radio id must be unique through all accordion items!
                id: `${FLS_MODES.WHITELIST}_${index}`,
                label: includeText,
                checked: _indexPermissions[index].flsmode === FLS_MODES.WHITELIST,
                onChange: ({ target: { id } }, field, form) => {
                  const flsmode = id.split('_')[0];
                  form.setFieldValue(field.name, flsmode);
                }
              }}
            />
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <FormikRadio
              name={`_indexPermissions[${index}].flsmode`}
              formRow
              elementProps={{
                // Radio id must be unique through all accordion items!
                id: `${FLS_MODES.BLACKLIST}_${index}`,
                label: excludeText,
                checked: _indexPermissions[index].flsmode === FLS_MODES.BLACKLIST,
                onChange: ({ target: { id } }, field, form) => {
                  const flsmode = id.split('_')[0];
                  form.setFieldValue(field.name, flsmode);
                }
              }}
            />
          </EuiFlexItem>
        </EuiFlexGroup>
        <EuiSpacer size="s"/>

        <FormikComboBox
          name={`_indexPermissions[${index}].fls`}
          formRow
          rowProps={{
            helpText: includeOrExcludeFieldsText
          }}
          elementProps={{
            isLoading,
            options: allFields,
            isClearable: true,
            onFocus: this.fetchFields,
            onBlur: onComboBoxOnBlur,
            onChange: onComboBoxChange(),
            onCreateOption: onComboBoxCreateOption()
          }}
        />
        {!isAnonymizedFieldsEnabled ? (
          <EuiCallOut
            data-test-subj="sgAnonymFieldsDisabledCallout"
            className="sgFixedFormItem"
            iconType="iInCircle"
            title={anonymizedFieldsDisabledText}
          />
        ) : (
          <FormikComboBox
            name={`_indexPermissions[${index}].masked_fields`}
            formRow
            rowProps={{
              helpText: anonymizeFieldsText
            }}
            elementProps={{
              isLoading,
              options: allFields,
              isClearable: true,
              onFocus: this.fetchFields,
              onBlur: onComboBoxOnBlur,
              onChange: onComboBoxChange(),
              onCreateOption: onComboBoxCreateOption()
            }}
          />
        )}
      </Fragment>
    );
  }
}

FieldLevelSecurity.propTypes = {
  httpClient: PropTypes.func.isRequired,
  index: PropTypes.number.isRequired,
  isAnonymizedFieldsEnabled: PropTypes.bool.isRequired,
  onComboBoxChange: PropTypes.func.isRequired,
  onComboBoxOnBlur: PropTypes.func.isRequired,
  onComboBoxCreateOption: PropTypes.func.isRequired,
  formik: PropTypes.shape({
    values: PropTypes.object.isRequired
  }).isRequired,
  onTriggerErrorCallout: PropTypes.func.isRequired
};

export default connect(FieldLevelSecurity);
