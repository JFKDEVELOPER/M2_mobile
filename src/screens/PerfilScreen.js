import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth, db } from '../../firebase';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import {
  updateProfile,
  deleteUser,
  signOut,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from 'firebase/auth';

export default function PerfilScreen({ navigation }) {
  const [userPosts, setUserPosts] = useState([]);
  const [userInfo, setUserInfo] = useState({ name: '', email: '', phone: '', photoURL: '' });
  const [newPhotoUri, setNewPhotoUri] = useState(null);
  const [loading, setLoading] = useState(false);
  const user = auth.currentUser;

  // Referência para input file (Web)
  const fileInputRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
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
          const all = JSON.parse(storedPosts);
          setUserPosts(all.filter(p => p.userEmail === user.email));
        }
      } catch (error) {
        console.error('Erro ao carregar perfil:', error);
      }
    })();
  }, []);

  // Função para pegar imagem no Expo (mobile)
  const pickImageExpo = async () => {
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

  // Função para pegar imagem no Web (input file)
  const pickImageWeb = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Quando selecionar imagem no input file (Web)
  const onFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Criar uma URL local para exibir preview
    const localUri = URL.createObjectURL(file);

    setNewPhotoUri(localUri);

    // Para salvar no Firebase e AsyncStorage, vamos precisar converter para base64 ou upload
    // Para simplicidade, deixamos a URI local (web) como está
    // Em produção, deve-se fazer upload para storage e salvar a URL pública
  };

  // Salvar nova foto no Firebase e local
  const salvarNovaFoto = async () => {
    if (!newPhotoUri) return;
    setLoading(true);

    try {
      // Atualizar perfil Firebase Auth
      await updateProfile(user, { photoURL: newPhotoUri });
      // Atualizar Firestore
      await updateDoc(doc(db, 'users', user.uid), { photoURL: newPhotoUri });
      // Atualizar estado local
      setUserInfo(prev => ({ ...prev, photoURL: newPhotoUri }));
      setNewPhotoUri(null);

      // Atualizar posts locais
      const stored = await AsyncStorage.getItem('posts');
      if (stored) {
        const all = JSON.parse(stored);
        const updated = all.map(p =>
          p.userEmail === user.email ? { ...p, userPhoto: newPhotoUri } : p
        );
        await AsyncStorage.setItem('posts', JSON.stringify(updated));
        setUserPosts(updated.filter(p => p.userEmail === user.email));
      }

      Alert.alert('Sucesso', 'Foto atualizada!');
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível atualizar a foto.');
      console.error(error);
    }
    setLoading(false);
  };

  const excluirConta = () => {
    Alert.alert('Excluir Conta', 'Tem certeza que deseja excluir sua conta?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            await AsyncStorage.removeItem('posts');
            await deleteDoc(doc(db, 'users', user.uid));

            if (Platform.OS === 'web') {
              // Para web, precisa reautenticar antes de deletar
              const email = user.email;

              const senha = prompt('Por favor, digite sua senha para confirmar exclusão da conta');

              if (!senha) {
                Alert.alert('Ação cancelada', 'Senha necessária para excluir conta.');
                return;
              }

              const credential = EmailAuthProvider.credential(email, senha);

              await reauthenticateWithCredential(user, credential);

              await deleteUser(user);
            } else {
              // Mobile (Expo)
              await deleteUser(user);
            }

            navigation.replace('Login');
          } catch (error) {
            Alert.alert('Erro', error.message);
            console.error('Erro ao excluir conta:', error);
          }
        },
      },
    ]);
  };

  const logout = async () => {
    await signOut(auth);
    navigation.replace('Login');
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

      {/* Input file escondido para Web */}
      {Platform.OS === 'web' && (
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={onFileChange}
        />
      )}

      <TouchableOpacity
        onPress={Platform.OS === 'web' ? pickImageWeb : pickImageExpo}
        style={styles.photoContainer}
      >
        <Image source={{ uri: newPhotoUri || userInfo.photoURL }} style={styles.photo} />
      </TouchableOpacity>
      <Text style={styles.editText}>Toque para editar</Text>

      {newPhotoUri && (
        <View style={styles.saveCancelContainer}>
          <TouchableOpacity
            onPress={salvarNovaFoto}
            style={[styles.saveButton, loading && { opacity: 0.6 }]}
            disabled={loading}
          >
            <Text style={styles.buttonText}>{loading ? 'Salvando...' : 'Salvar Foto'}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setNewPhotoUri(null)} style={styles.cancelButton} disabled={loading}>
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>👤 {userInfo.name}</Text>
        <Text style={styles.infoText}>📧 {userInfo.email}</Text>
        <Text style={styles.infoText}>📞 {userInfo.phone}</Text>
      </View>

      <View style={styles.buttonsRow}>
        <TouchableOpacity onPress={logout} style={styles.logoutButton}>
          <Text style={styles.buttonText}>Logout</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={excluirConta} style={styles.deleteAccountButton}>
          <Text style={styles.buttonText}>Excluir Conta</Text>
        </TouchableOpacity>
      </View>

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
    backgroundColor: '#6A5ACD', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8, marginRight: 8,
  },
  cancelButton: {
    backgroundColor: '#D9534F', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8,
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
    marginTop: 12, backgroundColor: '#D9534F', paddingVertical: 10, borderRadius: 8, alignItems: 'center',
  },
  deleteButtonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  listContent: { paddingBottom: 16 },
  emptyText: { color: '#DDA0FF', fontSize: 16, textAlign: 'center' },
});
