import React, { useCallback, useState } from "react";
import {
  Alert,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import AnimatedPostCard from "../components/AnimatedPostCard";
import CommentsModal from "../components/CommentsModal";
import CreatePostModalWithImages from "../components/CreatePostModalWithImages";
import ShareDialog from "../components/ShareDialog";
import SuccessToast from "../components/SuccessToast";
import { useThemeContext } from "../components/ThemeContext";

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
  const [shareDialogVisible, setShareDialogVisible] = useState(false);
  const [successToastVisible, setSuccessToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // Mock data with enhanced structure
  const [posts, setPosts] = useState<Post[]>([
    {
      id: "1",
      author: "Alice Johnson",
      avatar: "https://randomuser.me/api/portraits/women/1.jpg",
      content:
        "Feeling great today! Remember to stay hydrated during your cycle. Water helps so much with bloating and cramps. 💧✨",
      likes: 15,
      comments: [
        {
          id: "c1",
          author: "Sarah",
          content:
            "Thanks for the reminder! I always forget to drink enough water.",
          timestamp: "2h ago",
        },
        {
          id: "c2",
          author: "Emma",
          content:
            "So true! I noticed such a difference when I started drinking more water.",
          timestamp: "1h ago",
        },
      ],
      timestamp: "4h ago",
      isLiked: false,
    },
    {
      id: "2",
      author: "Maria Garcia",
      avatar: "https://randomuser.me/api/portraits/women/2.jpg",
      content:
        "Just tried a new healthy recipe for period-friendly smoothies! Spinach, banana, berries and ginger - surprisingly delicious! 🥤",
      likes: 22,
      comments: [
        {
          id: "c3",
          author: "Lisa",
          content: "Could you share the recipe? Sounds amazing!",
          timestamp: "3h ago",
        },
      ],
      timestamp: "6h ago",
      isLiked: true,
    },
    {
      id: "3",
      author: "Jennifer Smith",
      avatar: "https://randomuser.me/api/portraits/women/3.jpg",
      content:
        "Any tips for managing period cramps naturally? Looking for alternatives to painkillers. Heat pads help but wondering what else works for you all? 🤗",
      likes: 10,
      comments: [
        {
          id: "c4",
          author: "Anna",
          content: "Yoga and gentle stretching really help me!",
          timestamp: "2h ago",
        },
        {
          id: "c5",
          author: "Kate",
          content: "Chamomile tea and warm baths work wonders for me",
          timestamp: "1h ago",
        },
      ],
      timestamp: "8h ago",
      isLiked: false,
    },
  ]);

  const handleCreatePost = (content: string, images: PostImage[] = []) => {
    console.log("Creating new post:", { content, imageCount: images.length });
    
    const newPost: Post = {
      id: Date.now().toString(),
      author: "You",
      avatar: "https://randomuser.me/api/portraits/women/10.jpg",
      content,
      images,
      likes: 0,
      comments: [],
      timestamp: "now",
      isLiked: false,
      reactions: [],
    };
    
    setPosts([newPost, ...posts]);
    
    // Show success toast instead of Alert
    setToastMessage("Your post has been shared with the community!");
    setSuccessToastVisible(true);
  };

  const handleLike = useCallback((postId: string) => {
    console.log("Like action for post:", postId);
    
    try {
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId
            ? {
                ...post,
                isLiked: !post.isLiked,
                likes: post.isLiked ? post.likes - 1 : post.likes + 1,
              }
            : post
        )
      );
      
      console.log("Like action completed successfully");
    } catch (error) {
      console.error("Error in handleLike:", error);
    }
  }, []);

  const handleComment = useCallback((postId: string) => {
    console.log("Comment action for post:", postId);
    
    try {
      if (!postId) {
        console.warn("Comment called without postId");
        return;
      }

      setSelectedPostId(postId);
      setCommentsVisible(true);
      console.log("Comments modal opened successfully");
    } catch (error) {
      console.error("Comment error:", error);
      Alert.alert("Error", "Unable to open comments at this time");
    }
  }, []);

  const handleShare = useCallback(async (postId: string) => {
    console.log("Share action for post:", postId);
    
    try {
      if (!postId) {
        console.warn("Share called without postId");
        return;
      }

      if (Platform.OS === "android") {
        // Android-specific share handling with custom dialog
        console.log("Opening Android share dialog");
        setShareDialogVisible(true);
      } else {
        Alert.alert("Shared!", "Post link copied to clipboard");
      }
      
      console.log("Share action completed successfully");
    } catch (error) {
      console.error("Share error:", error);
      Alert.alert("Error", "Unable to share post at this time");
    }
  }, []);

  const handleCopyLink = useCallback(() => {
    try {
      setShareDialogVisible(false);
      setToastMessage("Post link copied to clipboard!");
      setSuccessToastVisible(true);
    } catch (error) {
      console.error("Copy link error:", error);
      Alert.alert("Error", "Unable to copy link at this time");
    }
  }, []);

  const handleCloseShareDialog = useCallback(() => {
    setShareDialogVisible(false);
  }, []);

  const handleHideToast = useCallback(() => {
    setSuccessToastVisible(false);
  }, []);

  const handleReaction = useCallback(
    (postId: string, reactionType: string) => {
      console.log("Reaction action:", { postId, reactionType });
      
      try {
        setPosts(
          posts.map((post) => {
            if (post.id === postId) {
              const existingReaction = post.reactions?.find(
                (r) => r.type === reactionType
              );
              let updatedReactions = post.reactions || [];

              if (existingReaction) {
                // Increment existing reaction
                updatedReactions = updatedReactions.map((r) =>
                  r.type === reactionType ? { ...r, count: r.count + 1 } : r
                );
              } else {
                // Add new reaction
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
        
        console.log("Reaction action completed successfully");
      } catch (error) {
        console.error("Error in handleReaction:", error);
      }
    },
    [posts]
  );

  const handleAddComment = (comment: string) => {
    console.log("Adding comment:", { selectedPostId, comment });
    
    try {
      if (selectedPostId) {
        const newComment: Comment = {
          id: Date.now().toString(),
          author: "You",
          content: comment,
          timestamp: "now",
        };

        setPosts(
          posts.map((post) =>
            post.id === selectedPostId
              ? { ...post, comments: [...post.comments, newComment] }
              : post
          )
        );
        
        console.log("Comment added successfully");
      } else {
        console.warn("No selectedPostId when adding comment");
      }
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const selectedPost = posts.find((post) => post.id === selectedPostId);

  // Memoized render function for better performance
  const renderPost = useCallback(
    ({ item }: { item: Post }) => {
      if (!item) {
        console.warn("Render called with undefined item");
        return null;
      }

      return (
        <AnimatedPostCard
          id={item.id}
          username={item.author}
          profileImage={item.avatar}
          content={item.content}
          images={item.images || []}
          timestamp={item.timestamp}
          likeCount={item.likes}
          commentCount={item.comments?.length || 0}
          isLiked={item.isLiked}
          reactions={item.reactions || []}
          onLike={handleLike}
          onComment={handleComment}
          onShare={handleShare}
          onReaction={handleReaction}
        />
      );
    },
    [handleLike, handleComment, handleShare, handleReaction]
  );

  // Fixed item layout for better scrolling performance (approximate height)
  const getItemLayout = useCallback(
    (data: any, index: number) => ({
      length: 300, // Approximate item height
      offset: 300 * index,
      index,
    }),
    []
  );

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
      paddingHorizontal: Platform.OS === "android" ? 0 : theme.spacing.lg,
      paddingVertical: theme.spacing.md,
    },
  });

  return (
    <View style={styles.container}>
      <SuccessToast
        visible={successToastVisible}
        message={toastMessage}
        onHide={handleHideToast}
      />

      <View style={styles.header}>
        <Text style={styles.title}>Community</Text>
        <TouchableOpacity
          style={styles.newPostButton}
          onPress={() => setCreatePostVisible(true)}
        >
          <Text style={styles.newPostButtonText}>New Post</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={(item) => item.id}
        getItemLayout={getItemLayout}
        contentContainerStyle={styles.postList}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={Platform.OS === "android"}
        initialNumToRender={4}
        maxToRenderPerBatch={5}
        windowSize={10}
        updateCellsBatchingPeriod={50}
      />

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

      <ShareDialog
        visible={shareDialogVisible}
        onClose={handleCloseShareDialog}
        onCopyLink={handleCopyLink}
      />
    </View>
  );
}
