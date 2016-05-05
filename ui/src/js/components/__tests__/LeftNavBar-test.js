import React from 'react';
import expect from 'expect';
import expectJSX from 'expect-jsx';
expect.extend(expectJSX);
import { shallow, mount } from 'enzyme';

const LeftNavBarItem = require('../LeftNavBarItem.jsx');
import MenuItem from 'material-ui/MenuItem';
import TextField from 'material-ui/TextField';

describe('LeftNavBarItem', () => {

  describe('# Render with current icon', () => {
    function getNode(isActive){
      const wrapper = mount(
        <LeftNavBarItem
          key={1}
          primaryText='name'
          isActive={isActive}
          route='name'
          handleClick={() => 0}
        />
      );
       return wrapper.find('svg').node;
    }
    it('Current route match true render icon', () => {
      expect(getNode(true)).toNotBe(undefined);
    });
    it('If route not match current do not render icon', () => {
      expect(getNode(false)).toBe(undefined);
    });
  });

  it('Disable with current route', () => {
    const action = expect.createSpy();
    const wrapper = shallow(
      <LeftNavBarItem
        key={1}
        primaryText='name'
        isActive={true}
        route='name'
        handleClick={action}
      />
    );

    const expected = (
      <MenuItem
        primaryText='name'
        disabled={true}
        checked={true}
        onTouchTap={action}
      />
    );
    expect(wrapper.find({ disabled: true, checked: true }).length).toBe(1);
  });

});
