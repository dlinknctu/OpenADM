import React, { PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import SettingController from '../components/SettingController.jsx';

import { settingController } from '../actions/CoreAction';

const SettingContainer = ({
  setting,
  handleSettingController,
}) => (
  <SettingController
    setting={setting}
    settingController={handleSettingController}
  />
);

SettingContainer.propTypes = {
  setting: PropTypes.object,
  handleSettingController: PropTypes.func,
};

const mapStateToProps = state => ({
  setting: state.setting,
});

const mapDispatchToProps = dispatch => bindActionCreators({
  handleSettingController: settingController,
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(SettingContainer);
