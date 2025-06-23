import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Platform,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth, db } from '../../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { updateProfile, deleteUser, signOut } from 'firebase/auth';

export default function PerfilScreen({ navigation }) {
  const [userPosts, setUserPosts] = useState([]);
  const [userInfo, setUserInfo] = useState({
    name: '',
    email: '',
    phone: '',
    photoURL: 'https://i.pravatar.cc/150?img=3',
  });

  const [newPhotoUri, setNewPhotoUri] = useState(null);
  const [loading, setLoading] = useState(false);

  const user = auth.currentUser;

  useEffect(() => {
    (async () => {
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const data = userSnap.data();
        setUserInfo({
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          photoURL: data.photoURL || '',
        });
      }

      const storedPosts = await AsyncStorage.getItem('posts');
      if (storedPosts) {
        const allPosts = JSON.parse(storedPosts);
        const filtered = allPosts.filter(p => p.userEmail === user.email);
        setUserPosts(filtered);
      }
    })();
  }, []);

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permissão necessária', 'Acesso à galeria é obrigatório.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({ quality: 0.7 });
    if (!result.canceled) {
      setNewPhotoUri(result.assets[0].uri);
    }
  };

  const salvarNovaFoto = async () => {
    if (!newPhotoUri) return;
    setLoading(true);

    try {
      // Atualizar auth
      await updateProfile(user, { photoURL: newPhotoUri });

      // Atualizar Firestore
      await updateDoc(doc(db, 'users', user.uid), { photoURL: newPhotoUri });

      // Atualizar AsyncStorage com nova foto
      const stored = await AsyncStorage.getItem('posts');
      if (stored) {
        const all = JSON.parse(stored);
        const updated = all.map(p =>
          p.userEmail === user.email ? { ...p, userPhoto: newPhotoUri } : p
        );
        await AsyncStorage.setItem('posts', JSON.stringify(updated));
        setUserPosts(updated.filter(p => p.userEmail === user.email));
      }

      setUserInfo(prev => ({ ...prev, photoURL: newPhotoUri }));
      setNewPhotoUri(null);
      Alert.alert('Sucesso', 'Foto atualizada!');
    } catch (error) {
      console.error(error);
      Alert.alert('Erro', 'Não foi possível atualizar a foto.');
    }

    setLoading(false);
  };

  const excluirPost = async (id) => {
    const stored = await AsyncStorage.getItem('posts');
    if (stored) {
      const all = JSON.parse(stored);
      const filtered = all.filter(p => p.id !== id);
      await AsyncStorage.setItem('posts', JSON.stringify(filtered));
      setUserPosts(filtered.filter(p => p.userEmail === user.email));
    }
  };

  const excluirConta = () => {
    Alert.alert('Confirmação', 'Tem certeza que deseja excluir sua conta?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir', style: 'destructive', onPress: async () => {
          try {
            await AsyncStorage.removeItem('posts');
            await deleteUser(auth.currentUser);
            navigation.replace('Login');
          } catch (err) {
            Alert.alert('Erro', err.message);
          }
        }
      }
    ]);
  };

  const logout = async () => {
    await signOut(auth);
    navigation.replace('Login');
  };

  const renderPost = ({ item }) => (
    <View style={styles.postContainer}>
      <Image source={{ uri: item.image }} style={styles.postImage} />
      <Text style={styles.description}>{item.description}</Text>
      <TouchableOpacity onPress={() => excluirPost(item.id)} style={styles.deleteButton}>
        <Text style={styles.deleteButtonText}>Excluir Post</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Foto de perfil clicável */}
      <TouchableOpacity onPress={pickImage} style={styles.photoContainer}>
        <Image
          source={{ uri: newPhotoUri || userInfo.photoURL }}
          style={styles.photo}
        />
      </TouchableOpacity>
      <Text style={styles.editText}>Toque para editar</Text>

      {/* Botões salvar/cancelar foto */}
      {newPhotoUri && (
        <View style={styles.saveCancelContainer}>
          <TouchableOpacity
            onPress={salvarNovaFoto}
            style={[styles.saveButton, loading && { opacity: 0.6 }]}
            disabled={loading}
          >
            <Text style={styles.buttonText}>{loading ? 'Salvando...' : 'Salvar Foto'}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setNewPhotoUri(null)} style={styles.cancelButton}>
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Informações */}
      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>👤 {userInfo.name}</Text>
        <Text style={styles.infoText}>📧 {userInfo.email}</Text>
        <Text style={styles.infoText}>📞 {userInfo.phone}</Text>
      </View>

      {/* Botões conta */}
      <View style={styles.buttonsRow}>
        <TouchableOpacity onPress={logout} style={styles.logoutButton}>
          <Text style={styles.buttonText}>Logout</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={excluirConta} style={styles.deleteAccountButton}>
          <Text style={styles.buttonText}>Excluir Conta</Text>
        </TouchableOpacity>
      </View>

      {/* Lista de posts */}
      {userPosts.length === 0 ? (
        <Text style={styles.emptyText}>Nenhum post criado.</Text>
      ) : (
        <FlatList
          data={userPosts}
          keyExtractor={i => i.id}
          renderItem={renderPost}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#2E0854', padding: 20 },
  photoContainer: { alignSelf: 'center', marginTop: 10 },
  photo: { width: 120, height: 120, borderRadius: 60, borderWidth: 3, borderColor: '#C9A9FF' },
  editText: { textAlign: 'center', color: '#DDA0FF', fontStyle: 'italic', marginBottom: 10 },
  saveCancelContainer: { flexDirection: 'row', justifyContent: 'center', marginBottom: 10 },
  saveButton: {
    backgroundColor: '#6A5ACD',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginRight: 8,
  },
  cancelButton: {
    backgroundColor: '#D9534F',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  cancelButtonText: { color: '#fff', fontWeight: 'bold' },
  infoContainer: { backgroundColor: '#3F0071', borderRadius: 12, padding: 15, marginVertical: 15 },
  infoText: { color: '#F3E8FF', fontSize: 16, marginBottom: 6 },
  buttonsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  logoutButton: { flex: 1, backgroundColor: '#6A5ACD', padding: 12, borderRadius: 8, marginRight: 8 },
  deleteAccountButton: { flex: 1, backgroundColor: '#D9534F', padding: 12, borderRadius: 8, marginLeft: 8 },
  postContainer: { marginBottom: 20, backgroundColor: '#3F0071', borderRadius: 12, padding: 12 },
  postImage: { width: '100%', height: 250, borderRadius: 8 },
  description: { marginTop: 8, color: '#E0BBE4', fontSize: 16 },
  deleteButton: {
    marginTop: 12,
    backgroundColor: '#D9534F',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteButtonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  listContent: { paddingBottom: 16 },
  emptyText: { color: '#DDA0FF', fontSize: 16, textAlign: 'center' },
});
