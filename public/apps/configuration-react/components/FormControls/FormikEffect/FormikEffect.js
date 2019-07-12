import React from 'react';
import { connect } from 'formik';

class FormikEffect extends React.Component {
  componentDidUpdate(prevProps) {
    const { formik, onChange } = this.props;
    if (prevProps.formik !== formik) {
      onChange(formik, prevProps.formik);
    }
  }

  render() {
    return null;
  }
}

export default connect(FormikEffect);
