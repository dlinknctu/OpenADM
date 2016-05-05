import React from 'react';
import expect from 'expect';
import expectJSX from 'expect-jsx';
expect.extend(expectJSX);
import { shallow } from 'enzyme';


import TextField from 'material-ui/TextField';
import SearchBox from '../SearchBox.jsx';

describe('SearchBox', () => {

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
