import React from 'react';
import { onlyUpdateForKeys } from 'recompose';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import { keyMap } from '../constant/moduleMapping';

const kbdStyle = {
  display: 'inline-block',
  padding: '3px 5px',
  font: '11px Consolas, "Liberation Mono", Menlo, Courier, monospace',
  lineHeight: '10px',
  color: '#555',
  verticalAlign: 'middle',
  backgroundColor: '#fcfcfc',
  border: 'solid 1px #ccc',
  borderBottomColor: '#bbb',
  borderRadius: '3px',
  boxShadow: 'inset 0 -1px 0 #bbb',
};

const tdStyle = {
  paddingTop: '3px',
  paddingBottom: '3px',
  lineHeight: '20px',
  verticalAlign: 'top',
};

const ShortcutsPannel = onlyUpdateForKeys(['hidden'])(
  ({ hidden, closeShortcuts }) =>
    <Dialog
      title="keyboard shortcuts"
      modal={false}
      open={hidden.indexOf('shortcuts') === -1}
      actions={[
        <FlatButton
          label="close"
          onTouchTap={closeShortcuts}
          keyboardFocused
          secondary
        />,
      ]}
      autoScrollBodyContent
    >
      <table>
        <tbody>
        {Object.keys(keyMap).map(d =>
          <tr key={`l-${d}`}>
            <td style={tdStyle}><kbd style={kbdStyle}>{d}</kbd></td>
            <td style={tdStyle}>: {keyMap[d]}</td>
          </tr>
        )}
        </tbody>
      </table>
    </Dialog>
);

export default ShortcutsPannel;
