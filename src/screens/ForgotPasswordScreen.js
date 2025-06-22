import React, { useState } from 'react';
import { View, TextInput, Button, Alert } from 'react-native';
import auth from '@react-native-firebase/auth';

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState('');

  async function handleResetPassword() {
    try {
      await auth().sendPasswordResetEmail(email);
      Alert.alert('Sucesso', 'Email para redefinição enviado!');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Erro', error.message);
    }
  }

  return (
    <View style={{ padding: 20 }}>
      <TextInput
        placeholder="Digite seu email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        style={{ marginBottom: 10, borderBottomWidth: 1, borderColor: '#ccc' }}
      />
      <Button title="Enviar email de redefinição" onPress={handleResetPassword} />
    </View>
  );
}
