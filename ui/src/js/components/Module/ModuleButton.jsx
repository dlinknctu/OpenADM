import React, { PropTypes } from 'react';
import { Menu, MainButton, ChildButton } from 'react-mfb';
import { onlyUpdateForKeys } from 'recompose';
import { iconMap } from '../../constant/moduleMapping';

const ModuleButton = onlyUpdateForKeys(['hidden'])(
  ({ hidden, togglePanel }) => {
    const childButtons = hidden.map((data, index) => (
      <ChildButton
        key={index}
        icon={iconMap[data]}
        label={data}
        onClick={() => togglePanel(data)}
      />));
    return (
      <Menu effect={'zoomin'} method={'hover'} position={'br'}>
        <MainButton iconResting="ion-ios-plus-outline" iconActive="ion-ios-close" />
        {childButtons}
      </Menu>
    );
  }
);


ModuleButton.propTypes = {
  hidden: PropTypes.array.isRequired,
  togglePanel: PropTypes.func.isRequired,
};

export default ModuleButton;
