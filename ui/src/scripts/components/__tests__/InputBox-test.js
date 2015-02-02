jest.dontMock('../InputBox.jsx');

describe('InputBox', function () {

  var React = require('react/addons');
  var TestUtils = React.addons.TestUtils;
  var InputBox = require('../InputBox.jsx');

  it('type will change the value and state', function () {
    var inputBox = TestUtils.renderIntoDocument(<InputBox />);
    var inputBoxDOM = TestUtils.findRenderedDOMComponentWithTag(inputBox, 'input').getDOMNode();

    TestUtils.Simulate.change(inputBoxDOM, { target: { value: 'eat dinner'}});

    expect(inputBoxDOM.getAttribute('value')).toEqual('eat dinner');
  });

  it('Press Enter will clean inputBox', function(){
    var inputBox = TestUtils.renderIntoDocument(<InputBox />);
    var inputBoxDOM = TestUtils.findRenderedDOMComponentWithTag(inputBox, 'input').getDOMNode();
    TestUtils.Simulate.change(inputBoxDOM, { target: { value: 'yo'}});

    expect(inputBoxDOM.getAttribute('value')).toEqual('yo');

    TestUtils.Simulate.keyDown(inputBoxDOM, { key: "Enter", keyCode: 13 });

    expect(inputBoxDOM.getAttribute('value')).toEqual('');
  });
});