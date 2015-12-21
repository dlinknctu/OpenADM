import React from 'react';
import TestUtils from 'react-addons-test-utils';
import expect from 'expect';
import expectJSX from 'expect-jsx';
expect.extend(expectJSX);
import { mount } from 'enzyme';

const LeftNavBarItem = require('../LeftNavBarItem.jsx');
import MenuItem from 'material-ui/lib/menus/menu-item';

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
    const renderer = TestUtils.createRenderer();
    renderer.render(
      <LeftNavBarItem
        key={1}
        primaryText='name'
        isActive={true}
        route='name'
        handleClick={() => 0}
      />
    );

    const actual = renderer.getRenderOutput();
    const expected = (
      <MenuItem
        primaryText='name'
        disabled={true}
        checked={true}
        onTouchTap={() => 0}
      />
    );
    expect(actual).toIncludeJSX(expected);
  });

});
