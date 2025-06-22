import React, { useState, useEffect, useLayoutEffect } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth } from '../../firebase';

export default function FeedScreen({ navigation }) {
  const [posts, setPosts] = useState([]);

  // Carregar posts do AsyncStorage toda vez que a tela for focada
  useEffect(() => {
    const loadPosts = async () => {
      const storedPosts = await AsyncStorage.getItem('posts');
      if (storedPosts) {
        setPosts(JSON.parse(storedPosts));
      } else {
        setPosts([]);
      }
    };

    const unsubscribe = navigation.addListener('focus', loadPosts);
    return unsubscribe;
  }, [navigation]);

  // Botão perfil no header
  useLayoutEffect(() => {
    const user = auth.currentUser;
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={() => navigation.navigate('Perfil')}
          style={{ marginRight: 15 }}
        >
          <Image
            source={{
              uri: user?.photoURL || 'https://i.pravatar.cc/150?img=3',
            }}
            style={styles.profilePhoto}
          />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  async function toggleLike(postId) {
    const updatedPosts = posts.map((post) =>
      post.id === postId
        ? {
            ...post,
            liked: !post.liked,
            likesCount: post.liked ? post.likesCount - 1 : post.likesCount + 1,
          }
        : post
    );
    setPosts(updatedPosts);
    await AsyncStorage.setItem('posts', JSON.stringify(updatedPosts));
  }

  function renderPost({ item }) {
    return (
      <View style={styles.postContainer}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.navigate('Perfil')}>
            <Image source={{ uri: item.userPhoto }} style={styles.userPhoto} />
          </TouchableOpacity>
          <Text style={styles.userName}>{item.user}</Text>
        </View>

        <Image source={{ uri: item.image }} style={styles.postImage} />

        <Text style={styles.description}>{item.description}</Text>
        {item.location ? <Text style={styles.location}>📍 {item.location}</Text> : null}

        <TouchableOpacity onPress={() => toggleLike(item.id)} style={styles.likeButton}>
          <Text style={{ color: item.liked ? '#DDA0FF' : '#bbb', fontSize: 16 }}>
            {item.liked ? '💜' : '🤍'} Curtir ({item.likesCount})
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {posts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Nenhum post ainda. Seja o primeiro a postar!</Text>
        </View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id}
          renderItem={renderPost}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Botão criar post */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('CriarPost')}
        activeOpacity={0.7}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2E0854',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 100,
  },
  postContainer: {
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#6A0DAD',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#3F0071',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#4B0082',
  },
  userPhoto: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#DDA0FF',
  },
  userName: {
    fontWeight: '700',
    fontSize: 16,
    color: '#E6E6FA',
  },
  postImage: {
    width: '100%',
    height: 250,
    backgroundColor: '#6A0DAD',
  },
  description: {
    padding: 12,
    fontSize: 15,
    color: '#E0BBE4',
  },
  location: {
    paddingHorizontal: 12,
    paddingBottom: 12,
    fontSize: 13,
    color: '#CDA4DE',
    fontStyle: 'italic',
  },
  likeButton: {
    paddingVertical: 10,
    alignItems: 'center',
    borderTopWidth: 1,
    borderColor: '#6A0DAD',
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 30,
    backgroundColor: '#9F7AEA',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 12,
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 5 },
  },
  fabText: {
    color: '#fff',
    fontSize: 38,
    lineHeight: 38,
    fontWeight: '700',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    color: '#DDA0FF',
    textAlign: 'center',
  },
  profilePhoto: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#DDA0FF',
  },
});

<TouchableOpacity
  onPress={async () => {
    await AsyncStorage.removeItem('posts');
    setPosts([]); // Atualiza estado para refletir a mudança
  }}
  style={{
    backgroundColor: 'red',
    padding: 10,
    margin: 10,
    borderRadius: 6,
    alignItems: 'center',
  }}
>
  <Text style={{ color: 'white', fontWeight: 'bold' }}>Remover todos os posts</Text>
</TouchableOpacity>

