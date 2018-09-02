import React, {Component} from 'react';
import {View, TouchableOpacity, StyleSheet, Text, Image} from 'react-native';
import {LoginButton, AccessToken, GraphRequest, GraphRequestManager}  from 'react-native-fbsdk';
import {GoogleSignin, GoogleSigninButton, statusCodes} from 'react-native-google-signin';
class Home extends Component {

  constructor(props) {
    super(props);
    this.state = {
      fullName: '',
      userImage: '',
      isLoggedIn: false,
      loggedInPlatform: ''
    };

  }

  componentWillMount() {
    GoogleSignin.configure({
      scopes: ['https://www.googleapis.com/auth/drive.readonly'], // what API you want to access on behalf of the user, default is email and profile
      // webClientId: '<FROM DEVELOPER CONSOLE>', // client ID of type WEB for your server (needed to verify user ID and offline access)
      // offlineAccess: true, // if you want to access Google API on behalf of the user FROM YOUR SERVER
      hostedDomain: '', // specifies a hosted domain restriction
      forceConsentPrompt: true, // [Android] if you want to show the authorization prompt at each login
      // accountName: '', // [Android] specifies an account name on the device that should be used
    });
  }

  _responseInfoCallback(error, result) {
    if (error) {
      alert('Error fetching data: ' + error.toString());
    } else {
      const {first_name, last_name, picture} = result;
      this.setState({
        fullName: `${first_name} ${last_name}`,
        userImage: picture.data.url,
        isLoggedIn: true,
        loggedInPlatform: 'Facebook'
      });
    }
  }

  initFacebookUser() {
    const userInfo = new GraphRequest('/me', {
      parameters: {
        fields: {
          string: 'picture,first_name,last_name'
        }
      }
    }, this._responseInfoCallback.bind(this));
    new GraphRequestManager().addRequest(userInfo).start();
  }

  async googleSignIn() {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      const {name} = userInfo.user;
      this.setState({fullName: name, isLoggedIn: true, loggedInPlatform: 'Google'});
    } catch (error) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        // user cancelled the login flow
      } else if (error.code === statusCodes.IN_PROGRESS) {
        // operation (f.e. sign in) is in progress already
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        // play services not available or outdated
      } else {
        // some other error happened
      }
    }
  };

  async logoutUser() {
    this.setState({fullName: '', userImage: '', isLoggedIn: ''});
    const {loggedInPlatform} = this.state;
    const LoggedInViaGoogle = loggedInPlatform === 'Google';
    try {
      LoggedInViaGoogle && await GoogleSignin.revokeAccess();
      LoggedInViaGoogle && await GoogleSignin.signOut();
    } catch (error) {
      console.error(error);
    }
  }

  renderButtons() {
    const {isLoggedIn, loggedInPlatform} = this.state;
    const {buttonsContainer, logoutButton} = styles;

    if (!isLoggedIn) {
      return (
        <View style={buttonsContainer}>
          <LoginButton
            publishPermissions={["publish_actions"]}
            onLoginFinished={
            (error, result) => {
              if (error) {
                alert("login has error: " + result.error);
              } else if (result.isCancelled) {
                alert("login is cancelled.");
              } else {
                AccessToken.getCurrentAccessToken().then(
                  (data) => {
                    const { accessToken } = data;
                    console.log(accessToken.toString());
                    this.initFacebookUser();
                  }
                )
              }
            }
          }
            onLogoutFinished={() => this.logoutUser()}/>

          <GoogleSigninButton
            style={{width: 230, height: 48, marginTop: 20}}
            size={GoogleSigninButton.Size.Standard}
            color={GoogleSigninButton.Color.Dark}
            onPress={() => this.googleSignIn()}
          />
        </View>
      )
    } else if (isLoggedIn && loggedInPlatform === 'Facebook') {
      return (
        <View style={buttonsContainer}>
          <LoginButton
            publishPermissions={["publish_actions"]}
            onLoginFinished={
            (error, result) => {
              if (error) {
                alert("login has error: " + result.error);
              } else if (result.isCancelled) {
                alert("login is cancelled.");
              } else {
                AccessToken.getCurrentAccessToken().then(
                  (data) => {
                    const { accessToken } = data;
                    console.log(accessToken.toString());
                    this.initFacebookUser();
                  }
                )
              }
            }
          }
            onLogoutFinished={() => this.logoutUser()}/>
        </View>
      )
    } else {
      return (
        <View style={buttonsContainer}>
          <TouchableOpacity onPress={() => this.logoutUser()} style={logoutButton}>
            <Text>Logout</Text>
          </TouchableOpacity>
        </View>
      )
    }
  }

  render() {
    const {container, header, headerImage} = styles;
    const {fullName, userImage} = this.state;
    return (
      <View style={container}>
        <View style={header}>
          <Text>Welcome {fullName}</Text>
          <Image
            style={headerImage}
            source={require('../images/react-native.png')}
          />
          { userImage.length > 0 &&
          <Image style={{width: 50, height: 50, marginTop: 10}} source={{ uri: userImage }}/> }
        </View>
        {this.renderButtons()}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    marginVertical: 30,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerImage: {
    height: 40,
    width: 40,
    marginTop: 10
  },
  buttonsContainer: {
    flex: 1,
    alignItems: 'center'
  },
  button: {
    height: 50,
    width: 140,
    marginHorizontal: 10,
    borderWidth: 1,
    borderColor: 'brown',
    borderRadius: 15,
    padding: 15,
    justifyContent: 'center',
    alignItems: 'center'
  },
  logoutButton: {
    justifyContent: 'center',
    backgroundColor: 'red',
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    height: 30
  }

});

export default Home;
