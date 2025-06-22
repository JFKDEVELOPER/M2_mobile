import React, { useState } from 'react';
import { View, TextInput, Button, Text, Alert } from 'react-native';

// Import nativo do Firebase para React Native
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

export default function RegisterScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  async function handleRegister() {
    try {
      const userCredential = await auth().createUserWithEmailAndPassword(email, password);
      await firestore()
        .collection('users')
        .doc(userCredential.user.uid)
        .set({
          name,
          email,
          phone,
          photoURL: '',
        });
      Alert.alert('Sucesso', 'Usuário registrado!');
      navigation.navigate('Login');
    } catch (error) {
      Alert.alert('Erro', error.message);
    }
  }

  return (
    <View style={{ padding: 20 }}>
      <TextInput placeholder="Nome" value={name} onChangeText={setName} />
      <TextInput
        placeholder="Telefone"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
      />
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        placeholder="Senha"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button title="Registrar" onPress={handleRegister} />
      <Text
        onPress={() => navigation.navigate('Login')}
        style={{ marginTop: 20, color: 'blue' }}
      >
        Já tem conta? Login
      </Text>
    </View>
  );
}
