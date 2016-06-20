
import test from 'ava';
import React from 'react';
import expect from 'expect';
import expectJSX from 'expect-jsx';
expect.extend(expectJSX);
import { shallow } from 'enzyme';
import MenuItem from 'material-ui/MenuItem';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import { LeftNavBarItem } from '../LeftNavBarItem.jsx';

const muiTheme = getMuiTheme();
const shallowWithContext = (node) => shallow(node, { context: { muiTheme } });

function getNode(isActive) {
  const action = expect.createSpy();
  const wrapper = shallowWithContext(
    <LeftNavBarItem
      key={1}
      primaryText="name"
      isActive={isActive}
      route="name"
      iconType="domain"
      handleClick={action}
    />
  );
  return wrapper.find(MenuItem).node.props.disabled;
}
test('use expectJSX', () => {
  expect(<div />).toEqualJSX(<div />);
});

test('Current route match true render icon', () => {
  expect(getNode(true)).toBe(true);
});
test('If route not match current do not render icon', () => {
  expect(getNode(false)).toBe(false);
});

test('Disable with current route', () => {
  const action = expect.createSpy();
  const wrapper = shallowWithContext(
    <LeftNavBarItem
      key={1}
      primaryText="name"
      isActive
      route="name"
      iconType="domain"
      handleClick={action}
    />
  );

  expect(wrapper.find(MenuItem).nodes[0].props.disabled).toBe(true);
});
