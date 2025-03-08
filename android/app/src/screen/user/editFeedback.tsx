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
import { updateFeedback } from '../../service/feedbackServices';
import { useNavigation, useRoute } from '@react-navigation/native';

const EditFeedback = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { 
    reportId, 
    feedbackId, 
    existingRating, 
    existingComment 
  } = route.params as { 
    reportId: string, 
    feedbackId: string, 
    existingRating: number, 
    existingComment: string 
  };
  
  const [rating, setRating] = useState(existingRating);
  const [comment, setComment] = useState(existingComment);
  const [submitting, setSubmitting] = useState(false);
  
  const handleUpdate = async () => {
    if (rating === 0) {
      Alert.alert('Error', 'Please select a rating');
      return;
    }
    
    try {
      setSubmitting(true);
      
      const updateData = {
        rating,
        comment,
        updated_at: new Date(),
      };
      
      await updateFeedback(reportId, feedbackId, updateData);
      Alert.alert('Success', 'Your feedback has been updated', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.error('Error updating feedback:', error);
      Alert.alert('Error', 'Failed to update feedback');
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
        <Text style={styles.headerTitle}>Edit Feedback</Text>
      </View>
      
      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Update your rating</Text>
        
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
        
        <Text style={styles.ratingText}>{rating}/5</Text>
        
        <Text style={styles.sectionTitle}>Update your comments</Text>
        <TextInput
          style={styles.commentInput}
          placeholder="Tell us what you think..."
          value={comment}
          onChangeText={setComment}
          multiline
          textAlignVertical="top"
        />
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.updateButton, submitting && styles.updateButtonDisabled]}
            onPress={handleUpdate}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.updateButtonText}>Update</Text>
            )}
          </TouchableOpacity>
        </View>
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
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1a2847',
    paddingVertical: 16,
    alignItems: 'center',
    marginRight: 8,
  },
  cancelButtonText: {
    color: '#1a2847',
    fontSize: 16,
    fontWeight: '600',
  },
  updateButton: {
    flex: 1,
    backgroundColor: '#1a2847',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginLeft: 8,
  },
  updateButtonDisabled: {
    backgroundColor: '#AAAAAA',
  },
  updateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default EditFeedback;