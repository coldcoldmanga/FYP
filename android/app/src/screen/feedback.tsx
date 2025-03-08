import React, { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  SafeAreaView,
  ActivityIndicator 
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { getFeedback } from '../service/feedbackServices';
import { useNavigation, useRoute, NavigationProp, useIsFocused, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const StarRating = ({ rating }: { rating: number }) => {
  return (
    <View style={styles.starContainer}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Icon 
          key={star} 
          name={star <= rating ? 'star' : 'star-border'} 
          size={16} 
          color={star <= rating ? '#FFD700' : '#AAAAAA'} 
          style={styles.starIcon}
        />
      ))}
    </View>
  );
};

const Feedback = () => {
  const navigation = useNavigation<NavigationProp<any>>();
  const route = useRoute();
  const { reportId } = route.params as { reportId: string };
  const [userEmail, setUserEmail] = useState<string | null>('');
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isFocused = useIsFocused();
  const [hasUserSubmittedFeedback, setHasUserSubmittedFeedback] = useState(false);
  
  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      setHasUserSubmittedFeedback(false);
      
      const loadData = async () => {
        const email = await AsyncStorage.getItem('userEmail');
        setUserEmail(email || '');
        
        try {
          const feedbackData = await getFeedback(reportId);
          setFeedbacks(feedbackData);
          
          const userIdFromEmail = email ? email.split('@')[0] : '';
          const userHasFeedback = feedbackData.some((feedback: any) => 
            feedback.user_id === userIdFromEmail
          );
          setHasUserSubmittedFeedback(userHasFeedback);
          console.log(userHasFeedback);

          setError(null);
        } catch (error) {
          console.error('Error fetching feedback:', error);
          setError('Failed to load feedback');
        } finally {
          setLoading(false);
        }
      };
      
      loadData();
      
      return () => {
        
      };
    }, [reportId])
  );
  
  const calculateAverageRating = () => {
    if (feedbacks.length === 0) return 0;
    const sum = feedbacks.reduce((total, feedback) => total + feedback.rating, 0);
    return (sum / feedbacks.length).toFixed(1);
  };
  
  const handleEditFeedback = (feedback: any) => {
    navigation.navigate('EditFeedback', { 
      feedbackId: feedback.feedback_id,
      reportId: reportId,
      existingRating: feedback.rating,
      existingComment: feedback.comment
    });
  };
  
  const handleAddFeedback = () => {
    navigation.navigate('AddFeedback', { 
      reportId: reportId,
    });
  };
  
  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };
  
  const renderFeedbackItem = ({ item }: { item: any }) => {
    // Check if current user is the author (you would implement this logic)
    
    const isAuthor = item.user_id == userEmail?.split('@')[0]; // Replace with actual auth logic
    return (
      <View style={styles.feedbackCard}>
        <View style={styles.feedbackHeader}>
          <Text style={styles.userName}>{item.userName || 'Anonymous'}</Text>
          <View style={styles.feedbackHeaderRight}>
            <Text style={styles.dateText}>{formatDate(item.createdAt)}</Text>
            {isAuthor && (
              <TouchableOpacity 
                onPress={() => handleEditFeedback(item)}
                style={styles.editButton}
              >
                <Icon name="edit" size={16} color="#666" />
              </TouchableOpacity>
            )}
          </View>
        </View>
        
        <StarRating rating={item.rating} />
        
        <Text style={styles.feedbackText}>{item.comment}</Text>
        
        {item.updated_at && (
          <Text style={styles.updatedText}>
            Last edited: {item.updated_at.toDate().toLocaleDateString('en-MY', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </Text>
        )}
      </View>
    );
  };
  
  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#1a2847" />
        <Text style={styles.messageText}>Loading feedback...</Text>
      </View>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="#1a2847" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Feedback</Text>
      </View>
      
      {feedbacks.length > 0 ? (
        <>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Overall Satisfaction</Text>
            <View style={styles.summaryRating}>
              <StarRating rating={Math.round(parseFloat(calculateAverageRating() as string))} />
              <Text style={styles.ratingText}>{calculateAverageRating()}/5</Text>
            </View>
            <Text style={styles.reviewCount}>
              Based on {feedbacks.length} {feedbacks.length === 1 ? 'review' : 'reviews'}
            </Text>
          </View>
          
          <FlatList
            data={feedbacks}
            renderItem={renderFeedbackItem}
            keyExtractor={(item) => item.feedback_id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        </>
      ) : (
        <View style={styles.emptyContainer}>
          <Icon name="feedback" size={64} color="#CCCCCC" />
          <Text style={styles.emptyTitle}>No feedback yet</Text>
          <Text style={styles.emptySubtitle}>Be the first to share your opinion</Text>
        </View>
      )}
      
      {(!loading && !hasUserSubmittedFeedback) && (
        <TouchableOpacity 
          style={styles.fab} 
          onPress={handleAddFeedback}
        >
          <Icon name="add" size={24} color="#FFF" />
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a2847',
    marginLeft: 12,
  },
  summaryCard: {
    margin: 16,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    alignItems: 'center',
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a2847',
    marginBottom: 8,
  },
  summaryRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a2847',
    marginLeft: 8,
  },
  reviewCount: {
    fontSize: 14,
    color: '#666666',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 80, // Extra space for FAB
  },
  feedbackCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  feedbackHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a2847',
  },
  feedbackHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 12,
    color: '#999999',
    marginRight: 8,
  },
  editButton: {
    padding: 4,
  },
  starContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  starIcon: {
    marginRight: 2,
  },
  feedbackText: {
    fontSize: 14,
    color: '#333333',
    lineHeight: 20,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  messageText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a2847',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#1a2847',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1a2847',
  },
  updatedText: {
    fontSize: 11,
    color: '#999999',
    fontStyle: 'italic',
    marginTop: 8,
    textAlign: 'right',
  },
});

export default Feedback;