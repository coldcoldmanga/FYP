import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput, 
  SafeAreaView,
  ActivityIndicator,
  Alert
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { addFeedback } from '../../service/feedbackServices';
import { useNavigation, useRoute } from '@react-navigation/native';
import auth from '@react-native-firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
const AddFeedback = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { reportId } = route.params as { reportId: string };
  
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  const handleSubmit = async () => {
    if (rating === 0) {
      Alert.alert('Error', 'Please select a rating');
      return;
    }
    
    try {
      setSubmitting(true);
      const userEmail = await AsyncStorage.getItem('userEmail');
      const feedback = {
        user_id: userEmail?.split('@')[0],
        rating,
        comment,
        created_at: new Date(),
        updated_at: null
      };
      
      await addFeedback(reportId, feedback);
      Alert.alert('Success', 'Your feedback has been submitted', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      Alert.alert('Error', 'Failed to submit feedback');
    } finally {
      setSubmitting(false);
    }
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="#1a2847" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Feedback</Text>
      </View>
      
      <View style={styles.content}>
        <Text style={styles.sectionTitle}>How would you rate our service?</Text>
        
        <View style={styles.ratingContainer}>
          {[1, 2, 3, 4, 5].map((star) => (
            <TouchableOpacity
              key={star}
              onPress={() => setRating(star)}
            >
              <Icon 
                name={star <= rating ? 'star' : 'star-border'} 
                size={40} 
                color={star <= rating ? '#FFD700' : '#AAAAAA'} 
                style={styles.starIcon}
              />
            </TouchableOpacity>
          ))}
        </View>
        
        <Text style={styles.ratingText}>
          {rating > 0 ? `${rating}/5` : 'Tap to rate'}
        </Text>
        
        <Text style={styles.sectionTitle}>Share your experience</Text>
        <TextInput
          style={styles.commentInput}
          placeholder="Tell us what you think..."
          value={comment}
          onChangeText={setComment}
          multiline
          textAlignVertical="top"
        />
        
        <TouchableOpacity 
          style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.submitButtonText}>Submit Feedback</Text>
          )}
        </TouchableOpacity>
      </View>
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
  content: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a2847',
    marginTop: 16,
    marginBottom: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 8,
  },
  starIcon: {
    marginHorizontal: 8,
  },
  ratingText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666666',
    marginBottom: 24,
  },
  commentInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    padding: 16,
    minHeight: 120,
    fontSize: 16,
    color: '#333333',
    marginBottom: 24,
  },
  submitButton: {
    backgroundColor: '#1a2847',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#AAAAAA',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AddFeedback;