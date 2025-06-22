import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';

import { auth, db } from '../../firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

export default function RegisterScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  const isValidEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  async function handleRegister() {
    if (!name || !phone || !email || !password) {
      Alert.alert('Erro', 'Preencha todos os campos!');
      return;
    }

    if (!isValidEmail(email)) {
      Alert.alert('Erro', 'Email inválido!');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Erro', 'A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      await setDoc(doc(db, 'users', userCredential.user.uid), {
        name,
        email,
        phone,
        photoURL: '',
      });

      Alert.alert('Sucesso', 'Usuário registrado!');
      navigation.replace('Login');
    } catch (error) {
      console.error('Erro ao registrar:', error);
      Alert.alert('Erro', error.message);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={90}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Cadastrar nova conta</Text>

        <TextInput
          placeholder="Nome"
          placeholderTextColor="#C9A9FF"
          value={name}
          onChangeText={setName}
          style={styles.input}
        />

        <TextInput
          placeholder="Telefone"
          placeholderTextColor="#C9A9FF"
          value={phone}
          onChangeText={setPhone}
          style={styles.input}
          keyboardType="phone-pad"
        />

        <TextInput
          placeholder="Email"
          placeholderTextColor="#C9A9FF"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TextInput
          placeholder="Senha"
          placeholderTextColor="#C9A9FF"
          value={password}
          onChangeText={setPassword}
          style={styles.input}
          secureTextEntry
        />

        <TouchableOpacity style={styles.button} onPress={handleRegister} activeOpacity={0.8}>
          <Text style={styles.buttonText}>Registrar</Text>
        </TouchableOpacity>

        <Text
          onPress={() => navigation.navigate('Login')}
          style={styles.linkText}
        >
          Já tem conta? Faça login
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { 
    flex: 1, 
    backgroundColor: '#3B0764', // roxo escuro de fundo
  },
  container: {
    padding: 20,
    justifyContent: 'center',
    flexGrow: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 24,
    color: '#E0C3FC', // lilás claro
    textAlign: 'center',
  },
  input: {
    height: 50,
    borderColor: '#A56EFF', // borda lilás
    borderWidth: 2,
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 16,
    fontSize: 16,
    color: '#F3E8FF', // texto lilás clarinho
    backgroundColor: '#5B2DB6', // fundo roxo médio dos inputs
  },
  button: {
    backgroundColor: '#A56EFF', // lilás vibrante
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 30,
    elevation: 6,
    shadowColor: '#A56EFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.7,
    shadowRadius: 8,
  },
  buttonText: {
    color: '#3B0764', // roxo escuro para contraste
    fontWeight: '700',
    fontSize: 18,
  },
  linkText: {
    color: '#C9A9FF', // lilás suave para link
    textAlign: 'center',
    fontSize: 16,
    textDecorationLine: 'underline',
  },
});
