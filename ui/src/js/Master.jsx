"use strict";
/**
 * Master Component
 * the root component
 */
let React = require("react");
let { Link, RouteHandler } = require("react-router");
let mui = require("material-ui");
let { AppCanvas, AppBar, IconButton, Styles } = mui;
let { Colors, Typography } = Styles;
let ThemeManager = new mui.Styles.ThemeManager();
let LeftNavBar = require("./components/LeftNavBar.jsx");
let ControllerAction = require("./actions/ControllerAction");
let ControllerStore = require("./stores/ControllerStore");
let SvgIcon = require("material-ui/lib/svg-icon");

class Master extends React.Component {

    constructor(props) {
        super(props);
        this.handleClick = this.handleClick.bind(this);
        this._onLeftIconButtonTouchTap = this._onLeftIconButtonTouchTap.bind(this);

        this.state = {
            isThemeDark: false,
            lists: ControllerStore.getState().controllerList
        };
    }

    getChildContext() {
        return {
          muiTheme: ThemeManager.getCurrentTheme()
        };
    }

    componentDidMount() {
        ControllerStore.listen(this.onChange);
    }

    componentWillUnmount() {
        ControllerStore.unlisten(this.onChnage);
    }

    _onLeftIconButtonTouchTap() {
        this.refs.leftNav.toggle();
    }

    handleClick() {
        if (this.state.isThemeDark) {
          ThemeManager.setTheme(ThemeManager.types.LIGHT);
            }
        else {
          ThemeManager.setTheme(ThemeManager.types.DARK);
        }
        this.setState({ isThemeDark: !this.state.isThemeDark });

    }

    onChange(state) {
        this.setState(state);
    }

    render() {
        var themeButton = (
              <IconButton tooltip="theme" iconStyle={{ color: "white" }}>
                  <SvgIcon {...this.props}>
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"></path>
                </SvgIcon>
              </IconButton>
        );
        return (
            <AppCanvas>
              <AppBar
                onLeftIconButtonTouchTap={this._onLeftIconButtonTouchTap}
                title="OmniUI"
                zDepth={0}
                iconElementRight={themeButton}/>

              <LeftNavBar ref="leftNav" />

              <RouteHandler {...this.props} />

            </AppCanvas>
        );
    }
}

Master.propTypes = {
    params: React.PropTypes.object.isRequired,
    query: React.PropTypes.object.isRequired
};

Master.contextTypes = {
    router: React.PropTypes.func.isRequired
};

Master.childContextTypes = {
  muiTheme: React.PropTypes.object
};

export default Master;
