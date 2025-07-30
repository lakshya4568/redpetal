import React, { useState, useCallback } from "react";
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import AnimatedPostCard from "../components/AnimatedPostCard";
import CommentsModal from "../components/CommentsModal";
import CreatePostModalWithImages from "../components/CreatePostModalWithImages";
import { useThemeContext } from "../components/ThemeContext";
import { communityAPI } from "../services/api";
import { useFocusEffect } from "expo-router";

interface Comment {
  id: string;
  author: string;
  content: string;
  timestamp: string;
}

interface PostImage {
  id: string;
  uri: string;
}

interface Reaction {
  id: string;
  type: "like" | "love" | "laugh" | "wow" | "sad" | "angry";
  emoji: string;
  count: number;
}

interface Post {
  id: string;
  author: string;
  avatar: string;
  content: string;
  images?: PostImage[];
  likes: number;
  comments: Comment[];
  timestamp: string;
  isLiked: boolean;
  reactions?: Reaction[];
}

export default function CommunityScreen() {
  const { theme } = useThemeContext();
  const [createPostVisible, setCreatePostVisible] = useState(false);
  const [commentsVisible, setCommentsVisible] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch posts when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadPosts();
    }, [])
  );

  const loadPosts = async () => {
    try {
      setLoading(true);
      const response = await communityAPI.getPosts({
        limit: 50,
        offset: 0
      });
      
      // Transform API response to match component interface
      const transformedPosts = response.posts.map((post: any) => ({
        id: post.id,
        author: post.is_anonymous ? 'Anonymous' : (post.first_name && post.last_name 
          ? `${post.first_name} ${post.last_name}` 
          : post.username),
        avatar: post.profile_image_url || 'https://randomuser.me/api/portraits/women/10.jpg',
        content: post.content,
        images: post.images || [],
        likes: post.like_count || 0,
        comments: [], // Comments will be loaded separately when needed
        timestamp: formatTimestamp(post.created_at),
        isLiked: post.is_liked || false,
        reactions: [],
      }));
      
      setPosts(transformedPosts);
    } catch (error: any) {
      console.error('Error loading posts:', error);
      Alert.alert('Error', 'Failed to load community posts');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadPosts();
  };

  const handleCreatePost = async (content: string, images: PostImage[] = []) => {
    try {
      const imageUrls = images.map(img => img.uri);
      await communityAPI.createPost({
        content,
        images: imageUrls,
        category: 'general'
      });
      
      Alert.alert("Success", "Your post has been shared with the community!");
      loadPosts(); // Refresh posts after creating new one
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to create post");
    }
  };

  const handleLike = async (postId: string) => {
    try {
      await communityAPI.likePost(postId);
      
      // Update local state
      setPosts(posts.map(post =>
        post.id === postId
          ? {
              ...post,
              isLiked: !post.isLiked,
              likes: post.isLiked ? post.likes - 1 : post.likes + 1,
            }
          : post
      ));
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to like post");
    }
  };

  const handleComment = async (postId: string) => {
    try {
      // Load comments for the selected post
      const response = await communityAPI.getComments(postId);
      
      // Update the post with loaded comments
      setPosts(posts.map(post =>
        post.id === postId
          ? {
              ...post,
              comments: response.comments.map((comment: any) => ({
                id: comment.id,
                author: comment.is_anonymous ? 'Anonymous' : 
                  (comment.first_name && comment.last_name
                    ? `${comment.first_name} ${comment.last_name}`
                    : comment.username),
                content: comment.content,
                timestamp: formatTimestamp(comment.created_at),
              }))
            }
          : post
      ));
      
      setSelectedPostId(postId);
      setCommentsVisible(true);
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to load comments");
    }
  };

  const handleShare = (postId: string) => {
    Alert.alert("Shared!", "Post link copied to clipboard");
  };

  const handleReaction = (postId: string, reactionType: string) => {
    // Mock reaction handling for now
    setPosts(
      posts.map((post) => {
        if (post.id === postId) {
          const existingReaction = post.reactions?.find(
            (r) => r.type === reactionType
          );
          let updatedReactions = post.reactions || [];

          if (existingReaction) {
            updatedReactions = updatedReactions.map((r) =>
              r.type === reactionType ? { ...r, count: r.count + 1 } : r
            );
          } else {
            const reactionEmojis: { [key: string]: string } = {
              like: "👍",
              love: "❤️",
              laugh: "😂",
              wow: "😮",
              sad: "😢",
              angry: "😠",
            };

            const newReaction: Reaction = {
              id: Date.now().toString(),
              type: reactionType as any,
              emoji: reactionEmojis[reactionType] || "👍",
              count: 1,
            };
            updatedReactions = [...updatedReactions, newReaction];
          }

          return { ...post, reactions: updatedReactions };
        }
        return post;
      })
    );
  };

  const handleAddComment = async (comment: string) => {
    if (selectedPostId) {
      try {
        await communityAPI.addComment(selectedPostId, {
          content: comment,
          is_anonymous: false
        });
        
        // Refresh comments for the post
        await handleComment(selectedPostId);
        
        Alert.alert("Success", "Comment added successfully!");
      } catch (error: any) {
        Alert.alert("Error", error.message || "Failed to add comment");
      }
    }
  };

  const selectedPost = posts.find((post) => post.id === selectedPostId);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      padding: theme.spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    title: {
      ...theme.typography.headlineLarge,
      color: theme.colors.text,
    },
    newPostButton: {
      backgroundColor: theme.colors.primary,
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.lg,
      borderRadius: theme.borderRadius.xl,
    },
    newPostButtonText: {
      ...theme.typography.button,
      color: theme.colors.textOnPrimary,
      fontWeight: "bold",
    },
    postList: {
      padding: theme.spacing.lg,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: theme.spacing.xl,
    },
    loadingText: {
      ...theme.typography.bodyLarge,
      color: theme.colors.text,
      marginTop: theme.spacing.md,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: theme.spacing.xl,
    },
    emptyText: {
      ...theme.typography.headlineSmall,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginBottom: theme.spacing.md,
    },
    emptySubtext: {
      ...theme.typography.bodyMedium,
      color: theme.colors.textMuted,
      textAlign: 'center',
    },
  });

  if (loading && !refreshing) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Community</Text>
          <TouchableOpacity
            style={styles.newPostButton}
            onPress={() => setCreatePostVisible(true)}
          >
            <Text style={styles.newPostButtonText}>New Post</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading community posts...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Community</Text>
        <TouchableOpacity
          style={styles.newPostButton}
          onPress={() => setCreatePostVisible(true)}
        >
          <Text style={styles.newPostButtonText}>New Post</Text>
        </TouchableOpacity>
      </View>

      {posts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No posts yet</Text>
          <Text style={styles.emptySubtext}>
            Be the first to share something with the community!
          </Text>
        </View>
      ) : (
        <FlatList
          data={posts}
          renderItem={({ item }) => (
            <AnimatedPostCard
              id={item.id}
              username={item.author}
              profileImage={item.avatar}
              content={item.content}
              images={item.images || []}
              timestamp={item.timestamp}
              likeCount={item.likes}
              commentCount={item.comments.length}
              isLiked={item.isLiked}
              reactions={item.reactions || []}
              onLike={handleLike}
              onComment={handleComment}
              onShare={handleShare}
              onReaction={handleReaction}
            />
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.postList}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={theme.colors.primary}
            />
          }
        />
      )}

      <CreatePostModalWithImages
        visible={createPostVisible}
        onClose={() => setCreatePostVisible(false)}
        onSubmit={handleCreatePost}
      />

      <CommentsModal
        visible={commentsVisible}
        onClose={() => {
          setCommentsVisible(false);
          setSelectedPostId(null);
        }}
        comments={selectedPost?.comments || []}
        onAddComment={handleAddComment}
      />
    </View>
  );
}
