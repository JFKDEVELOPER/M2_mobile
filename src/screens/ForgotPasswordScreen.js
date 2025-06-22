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
} from 'react-native';

import { auth } from '../../firebase'; // importe seu auth inicializado do firebase.js
import { sendPasswordResetEmail } from 'firebase/auth';

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState('');

  async function handleResetPassword() {
    if (!email) {
      Alert.alert('Erro', 'Por favor, digite seu email.');
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      Alert.alert('Sucesso', 'Email para redefinição enviado!');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Erro', error.message);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={90}
    >
      <View style={styles.container}>
        <Text style={styles.title}>Redefinir senha</Text>

        <TextInput
          placeholder="Digite seu email"
          placeholderTextColor="#C9A9FF"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          style={styles.input}
        />

        <TouchableOpacity style={styles.button} onPress={handleResetPassword} activeOpacity={0.8}>
          <Text style={styles.buttonText}>Enviar email de redefinição</Text>
        </TouchableOpacity>

        <Text
          onPress={() => navigation.goBack()}
          style={styles.linkText}
        >
          Voltar ao login
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: '#3B0764', // roxo escuro
  },
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
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
    marginBottom: 20,
    fontSize: 16,
    color: '#F3E8FF', // texto lilás clarinho
    backgroundColor: '#5B2DB6', // fundo roxo médio
  },
  button: {
    backgroundColor: '#A56EFF', // lilás vibrante
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
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
    color: '#C9A9FF', // lilás suave
    textAlign: 'center',
    fontSize: 16,
    textDecorationLine: 'underline',
  },
});
