import React, { PropTypes } from 'react';
import { Menu, MainButton, ChildButton } from 'react-mfb';

const ModuleButton = ({ hiddenPanel, togglePanel }) => {
  const childButtons = hiddenPanel.map((data, index) => (
    <ChildButton
      key={index}
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
