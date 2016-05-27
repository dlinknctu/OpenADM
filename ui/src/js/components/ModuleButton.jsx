import React, { Component, PropTypes } from 'react';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import ContentAdd from 'material-ui/svg-icons/content/add-circle-outline';
import styles from './module.css';
import { Menu, MainButton, ChildButton } from 'react-mfb';

const ModuleButton = ({ hiddenPanel, togglePanel }) => {
  const childButtons = hiddenPanel.map(data => (
    <ChildButton
      icon="ion-ios-gear"
      label={data}
      onClick={() => togglePanel(data)}
    />));
  return (
    <Menu effect={'zoomin'} method={'hover'} position={'br'}>
      <MainButton iconResting="ion-ios-plus-outline" iconActive="ion-ios-close" />
      {childButtons}
    </Menu>
  );
};

ModuleButton.propTypes = {
  hiddenPanel: PropTypes.array.isRequired,
  togglePanel: PropTypes.func.isRequired,
};

export default ModuleButton;
