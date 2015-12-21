import React from 'react';
import TestUtils from 'react-addons-test-utils';
import expect from 'expect';
import expectJSX from 'expect-jsx';
expect.extend(expectJSX);
import { shallow } from 'enzyme';


import TextField from 'material-ui/lib/text-field';
import SearchBox from '../SearchBox.jsx';

describe('SearchBox', () => {

  it('TestUtils: Should render with correct component', () => {
    const renderer = TestUtils.createRenderer();
    renderer.render(<SearchBox />);
    const actual = renderer.getRenderOutput();

    const expected = (
      <TextField
        defaultValue='waynelkh'
        hintText="account"
        onBlur={() => 0}
        onClick={() => 0}
      />);
    expect(actual).toEqualJSX(expected);
  });

  it('enzyme: Should render with correct component', () => {
    const wrapper = shallow(<SearchBox />);
    const expected = (
      <TextField
        defaultValue='waynelkh'
        hintText="account"
        onBlur={() => 0}
        onClick={() => 0}
      />);
    expect(wrapper.node).toEqualJSX(expected);
  });
});
