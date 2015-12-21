import React from 'react';
import logo from '../../assets/images/nctu.gif';
import FontIcon from 'material-ui/lib/font-icon';
import Colors from 'material-ui/lib/styles/colors';

class Home extends React.Component {

  render() {
    const iconStyles = {
      marginRight: 24,
    };
    return (
          <div>
            <h1>Simple home</h1>
            <div>
              <img className="img-thumbnail" src={logo} alt="LOGO"/>
            </div>
            <hr />
            <FontIcon style={iconStyles} className="material-icons">
            home
            </FontIcon>
            <FontIcon style={iconStyles} className="material-icons"
              color={Colors.blue500}
            >
            home
            </FontIcon>
            <FontIcon
              style={iconStyles} className="material-icons"
              color={Colors.red500}
              hoverColor={Colors.greenA200}
            >home</FontIcon>
            <hr />
            <FontIcon className="material-icons" >home</FontIcon>
            <FontIcon className="material-icons" color={Colors.red500}>
            flight_takeoff
            </FontIcon>
            <FontIcon className="material-icons" color={Colors.yellow500}>
            cloud_download
            </FontIcon>
            <FontIcon className="material-icons" color={Colors.blue500}>
              videogame_asset
            </FontIcon>
          </div>
          );
  }
}
export default Home;
