import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, Alert, StyleSheet, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth } from '../../firebase';

export default function PerfilScreen() {
  const [userPosts, setUserPosts] = useState([]);
  const user = auth.currentUser;

  // Função para carregar posts do usuário
  const loadUserPosts = async () => {
    try {
      const storedPosts = await AsyncStorage.getItem('posts');
      if (storedPosts) {
        const allPosts = JSON.parse(storedPosts);
        const filteredPosts = allPosts.filter(post => post.userEmail === user.email);
        setUserPosts(filteredPosts);
      } else {
        setUserPosts([]);
      }
    } catch (error) {
      console.error('Erro ao carregar posts:', error);
    }
  };

  useEffect(() => {
    loadUserPosts();
  }, []);

  async function excluirPost(postId) {
    const excluir = async () => {
      try {
        const storedPosts = await AsyncStorage.getItem('posts');
        if (storedPosts) {
          const allPosts = JSON.parse(storedPosts);
          const postsAtualizados = allPosts.filter(post => post.id !== postId);
          await AsyncStorage.setItem('posts', JSON.stringify(postsAtualizados));
          setUserPosts(postsAtualizados.filter(post => post.userEmail === user.email));
        }
      } catch (error) {
        console.error('Erro ao excluir post:', error);
      }
    };

    if (Platform.OS === 'web') {
      const confirmado = window.confirm('Tem certeza que deseja excluir este post?');
      if (confirmado) {
        await excluir();
        // Força recarregar posts para garantir UI atualizada no web
        await loadUserPosts();
      }
    } else {
      Alert.alert(
        'Confirmar exclusão',
        'Tem certeza que deseja excluir este post?',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Excluir',
            style: 'destructive',
            onPress: async () => {
              await excluir();
            },
          },
        ],
        { cancelable: true }
      );
    }
  }

  function renderPost({ item }) {
    return (
      <View style={styles.postContainer}>
        <Image source={{ uri: item.image }} style={styles.postImage} />
        <Text style={styles.description}>{item.description}</Text>
        <TouchableOpacity onPress={() => excluirPost(item.id)} style={styles.deleteButton}>
          <Text style={styles.deleteButtonText}>Excluir Post</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {userPosts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Você ainda não fez nenhum post.</Text>
        </View>
      ) : (
        <FlatList
          data={userPosts}
          keyExtractor={(item) => item.id}
          renderItem={renderPost}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2E0854',
    padding: 16,
  },
  listContent: {
    paddingBottom: 16,
  },
  postContainer: {
    marginBottom: 20,
    backgroundColor: '#3F0071',
    borderRadius: 12,
    padding: 12,
  },
  postImage: {
    width: '100%',
    height: 250,
    borderRadius: 8,
  },
  description: {
    marginTop: 8,
    color: '#E0BBE4',
    fontSize: 16,
  },
  deleteButton: {
    marginTop: 12,
    backgroundColor: '#D9534F',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#DDA0FF',
    fontSize: 18,
  },
});
