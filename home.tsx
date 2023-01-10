import React, {useState, useEffect} from 'react';
import { 
    SafeAreaView, 
    View,
    Text,
    Image
} from 'react-native';
import { Button } from 'react-native-paper';
import * as WebBrowser from 'expo-web-browser';
import * as SecureStore from 'expo-secure-store';
import UserLogIn from './components/userlogin';
import { styles } from './styles/css';
import { auth } from './lib/firebase';
import { signOut, isSignInWithEmailLink, signInWithEmailLink } from 'firebase/auth';
import Unorderedlist from 'react-native-unordered-list';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Linking from 'expo-linking';
import Constants from 'expo-constants';
import { User } from './lib/types';
import { getUserData } from './lib/utils';

//Use WebBrowser.maybeCompleteAuthSession() to use Expo AuthSession.
WebBrowser.maybeCompleteAuthSession();

export default function App() {
    const [authUser, setAuthUser] = useState<User | null>(null);
    const [emaillinkerr, setEmailLinkerr] = useState('');

    const expoUrl = __DEV__ ? 'exp://10.0.0.122:19000/--': 'exp://exp.host/@jglchen/' + Constants.manifest!.name;
    const expoLink = Linking.createURL(expoUrl);
    const FIREBASE_LINK_PROXY = 'https://firebase-auth-email.vercel.app/firebase-auth-redirect';
    const proxyUrl = `${FIREBASE_LINK_PROXY}?redirectUrl=${encodeURIComponent(expoLink)}`;
      
    useEffect(() => {
        getStoreAuthUser();
    },[]);
      
    async function getStoreAuthUser(){
        try {
          const result = await SecureStore.getItemAsync('authuser');
          if (result){
            setAuthUser(JSON.parse(result));
          }
        }catch(error){
          console.log(error);
        }
    }
    
    useEffect(() => {
        Linking.getInitialURL()
        .then((url) => {
          if (url){
            handleIncomingUrl(url);
          }
        });
    
        Linking.addEventListener('url', ({ url }) => {
          handleIncomingUrl(url);
        }); 
    });
    
    async function handleIncomingUrl(url: string){
        if (isSignInWithEmailLink(auth, url)) {
          try {
            const email = await AsyncStorage.getItem('emailForSignIn');
            if (email){
               const userCredential = await signInWithEmailLink(auth, email, url);
               const user = userCredential.user;
               const userResult = getUserData(user);
               await SecureStore.setItemAsync('authuser', JSON.stringify(userResult));
               setAuthUser(userResult);
           }
          }catch(error: any){
            setEmailLinkerr('Error: ' + error.message)
          }
        }
    }
    
    async function removeAuthUser(){
        await SecureStore.deleteItemAsync('authuser');
        await signOut(auth); 
        setAuthUser(null);
    }
    
    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAwareScrollView
                resetScrollToCoords={{ x: 0, y: 0 }}
                keyboardShouldPersistTaps='handled'
                scrollEnabled={true}
                style={styles.scrollView}
                >
                {(authUser?.uid) &&
                <View style={[styles.listItem, styles.itemSpaceBetween]}>
                    <View>
                        <Text style={styles.descrText}>{`Hi! `} 
                        {authUser?.uid &&
                        <Text>{authUser.displayName ? authUser.displayName: authUser.email}</Text>
                        }
                        </Text>
                    </View>
                    <Button
                        mode='outlined'
                        onPress={() => removeAuthUser()}
                    >
                    Sign Out
                    </Button>
                </View>
                }
                {!authUser?.uid &&
                <>
                <View style={[styles.listItem, styles.itemCenter]}>
                  <Text style={styles.titleText}>Please Log In</Text>
                </View> 
                <View style={styles.listItem}>
                <UserLogIn 
                  proxyUrl={proxyUrl} 
                  emaillinkerr={emaillinkerr}
                  />
                </View>
                </>
                }
                <View style={styles.listItem}>
                  <Text style={styles.descrText}>
                  This example creates an authentication system that uses <Text style={styles.boldText}>an encrypted storage to store session data.</Text>
                  </Text>
                </View>
                <View style={styles.listItem}>
                  <Unorderedlist><Text style={styles.descrText}>Firebase Authentication with Email Passwordless Link is used to authenticate users.</Text></Unorderedlist>
                </View>
                <View style={styles.listItem}>
                  <Unorderedlist><Text style={styles.descrText}>Session data is encrypted in local storage.</Text></Unorderedlist>
                </View>
                <View style={styles.listItem}>
                  <View style={styles.itemCenter}>
                    <Text style={{fontSize: 20}}>{authUser?.uid ? 'You are logged in!': 'You are not logged in!'}</Text>
                  </View>
                  {authUser?.photoURL &&
                  <View style={styles.itemCenter}>  
                    <Image source={{ uri: authUser?.photoURL }} style={styles.image} />
                  </View>  
                  }
                  {authUser?.displayName &&
                  <View style={styles.itemCenter}>  
                    <Text style={styles.descrText}>{authUser?.displayName}</Text>
                  </View>  
                  }
                  {authUser?.email &&
                  <View style={styles.itemCenter}>  
                    <Text style={styles.descrText}>{authUser?.email}</Text>
                  </View>  
                  }
              </View>
           </KeyboardAwareScrollView>    
          </SafeAreaView>
      );
}    