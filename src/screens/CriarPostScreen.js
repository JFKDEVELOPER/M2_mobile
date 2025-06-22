import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth } from '../../firebase';

export default function CriarPostScreen({ navigation }) {
  const [image, setImage] = useState(null);
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('Carregando localização...');

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Erro', 'Permissão de localização negada');
        setLocation('Permissão negada');
        return;
      }

      const loc = await Location.getCurrentPositionAsync({});
      const [place] = await Location.reverseGeocodeAsync({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });

      if (place && place.city) {
        setLocation(place.city);
      } else if (place && place.region) {
        setLocation(place.region);
      } else {
        setLocation('Localização desconhecida');
      }
    })();
  }, []);

  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (permission.status !== 'granted') {
      Alert.alert('Erro', 'Permissão da câmera negada');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({ quality: 0.7 });
    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleCreatePost = async () => {
    if (!image || !description) {
      Alert.alert('Erro', 'Tire uma foto e escreva a descrição!');
      return;
    }

    const currentUser = auth.currentUser;
    if (!currentUser) {
      Alert.alert('Erro', 'Usuário não autenticado');
      return;
    }

    const newPost = {
      id: Date.now().toString(),
      user: currentUser.displayName || 'Usuário',
      userEmail: currentUser.email,         // <-- adiciona aqui o email do usuário
      userPhoto: currentUser.photoURL || 'https://i.pravatar.cc/150?img=3',
      image,
      description,
      location,
      liked: false,
      likesCount: 0,
    };

    const storedPosts = await AsyncStorage.getItem('posts');
    const posts = storedPosts ? JSON.parse(storedPosts) : [];
    posts.unshift(newPost);
    await AsyncStorage.setItem('posts', JSON.stringify(posts));

    Alert.alert('Sucesso', 'Post criado!');
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Criar novo post</Text>

      <TouchableOpacity onPress={takePhoto} style={styles.cameraButton}>
        <Text style={styles.cameraText}>{image ? '📷 Foto tirada' : 'Abrir câmera'}</Text>
      </TouchableOpacity>

      {image && <Image source={{ uri: image }} style={styles.imagePreview} />}

      <TextInput
        style={styles.input}
        placeholder="Descrição"
        placeholderTextColor="#C9A9FF"
        value={description}
        onChangeText={setDescription}
        multiline
      />

      <Text style={styles.location}>📍 {location}</Text>

      <TouchableOpacity style={styles.button} onPress={handleCreatePost}>
        <Text style={styles.buttonText}>Publicar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#2E0854' },
  title: { fontSize: 24, color: '#fff', fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  input: {
    backgroundColor: '#5B2DB6',
    color: '#fff',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  location: { color: '#C9A9FF', fontStyle: 'italic', marginBottom: 20 },
  button: {
    backgroundColor: '#A56EFF',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  cameraButton: {
    backgroundColor: '#6A0DAD',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  cameraText: { color: '#fff', fontSize: 16 },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 16,
  },
});
