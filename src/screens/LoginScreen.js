import React, { useState } from 'react';
import { View, TextInput, Button, Text, Alert, TouchableOpacity } from 'react-native';
import { auth, db } from '../../firebase';



export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  async function handleLogin() {
    try {
      await auth().signInWithEmailAndPassword(email, password);
      Alert.alert('Sucesso', 'Login realizado!');
      // Aqui você pode navegar para a tela do feed, por exemplo:
      navigation.replace('Feed'); 
    } catch (error) {
      Alert.alert('Erro', error.message);
    }
  }

  return (
    <View style={{ padding: 20 }}>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        style={{ marginBottom: 10, borderBottomWidth: 1, borderColor: '#ccc' }}
      />
      <TextInput
        placeholder="Senha"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={{ marginBottom: 10, borderBottomWidth: 1, borderColor: '#ccc' }}
      />
      <Button title="Entrar" onPress={handleLogin} />

      <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
        <Text style={{ marginTop: 20, color: 'blue' }}>Esqueci a senha</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Register')}>
        <Text style={{ marginTop: 20, color: 'blue' }}>Não tem conta? Cadastre-se</Text>
      </TouchableOpacity>
    </View>
  );
}
