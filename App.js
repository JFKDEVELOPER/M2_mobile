import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// Importa suas telas
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import ForgotPasswordScreen from './src/screens/ForgotPasswordScreen';
import FeedScreen from './src/screens/FeedScreen';
import CriarPostScreen from './src/screens/CriarPostScreen';
import PerfilScreen from './src/screens/PerfilScreen';  // Importa a nova tela Perfil

const Stack = createStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Login">
          <Stack.Screen 
            name="Login" 
            component={LoginScreen} 
            options={{ headerShown: false }} 
          />
          <Stack.Screen 
            name="Register" 
            component={RegisterScreen} 
            options={{ title: 'Cadastro' }} 
          />
          <Stack.Screen 
            name="ForgotPassword" 
            component={ForgotPasswordScreen} 
            options={{ title: 'Recuperar Senha' }} 
          />
          <Stack.Screen 
            name="Feed" 
            component={FeedScreen} 
            options={{ title: 'Feed' }} 
          />
          <Stack.Screen
            name="CriarPost"
            component={CriarPostScreen}
            options={{ title: 'Criar Post' }}
          />
          <Stack.Screen
            name="Perfil"  // Tela de perfil adicionada
            component={PerfilScreen}
            options={{ title: 'Perfil' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
