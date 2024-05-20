import React, {useState, useRef, useEffect} from 'react';
import { View, Text, Keyboard, TouchableHighlight, TouchableWithoutFeedback } from 'react-native';
import { Button, TextInput, ActivityIndicator } from 'react-native-paper';
//import * as WebBrowser from 'expo-web-browser';
import { auth } from '../lib/firebase';
import { sendSignInLinkToEmail } from 'firebase/auth';
import { styles } from '../styles/css';
import validator from 'email-validator';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUserData } from '../lib/utils';
import { User } from '../lib/types';

interface PropsType {
    proxyUrl: string;
    emaillinkerr: string;
}

function UserLogIn({proxyUrl, emaillinkerr}: PropsType){
    const actionCodeSettings = {
        url: proxyUrl,
        handleCodeInApp: true,
    } 
    const [email, setEmail] = useState('');
    const [emailerr, setEmailErr] = useState('');
    const emailEl = useRef(null);
    const [inPost, setInPost] = useState(false);

    useEffect(() => {
        setEmailErr(emaillinkerr);
    },[emaillinkerr]);

    function handleEmailChange(text: string){
        const value = text.replace(/<\/?[^>]*>/g, "");
        setEmail(value);
        setEmailErr('');
    }

    function resetForm(){
        Keyboard.dismiss();
        
        setEmail('');
        setEmailErr('');
    }

    async function submitForm(){
        Keyboard.dismiss();

        setEmailErr('');
        //Check if Email is filled
        if (!email){
            setEmailErr("Please type your email, this field is required!");
            (emailEl.current as any).focus();
            return;
        }
        //Validate the email
        if (!validator.validate(email)){
            setEmailErr("This email is not a legal email.");
            (emailEl.current as any).focus();
            return;
        }

        setInPost(true);
        try {
            await sendSignInLinkToEmail(auth, email, actionCodeSettings);
            await AsyncStorage.setItem('emailForSignIn', email);
            const successRemark = 'Please go to your mail box, click the sign in link in the email sent to you.';
            setEmailErr(successRemark);
        }catch(error: any){
            setEmailErr('Error: ' + error.message);
        }
        setInPost(false);
    }
 
    return (
        <View>
            <TextInput
                mode='outlined'
                label="Email"
                placeholder="Email"
                value={email}
                onChangeText={text => handleEmailChange(text)}
                autoCapitalize="none"
                autoComplete="email"
                keyboardType="email-address"
                ref={emailEl}
                />
            <Text style={{color: 'red'}}>{emailerr}</Text> 
            <View style={[styles.listItem, styles.itemLeft]}>
                <Button mode='contained' onPress={() => submitForm()}>Log In</Button>
                <Button mode='contained' style={{marginLeft: 10}} onPress={() => resetForm()}>Reset</Button>
            </View>
            {inPost &&
                <View style={styles.loading}>
                    <ActivityIndicator size="large" animating={true} color="#FFFFFF" />
                </View>
            }
        </View>
    );
}

export default UserLogIn;

