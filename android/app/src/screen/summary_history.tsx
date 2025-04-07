import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Modal,
  ActivityIndicator,
  Dimensions,
  ScrollView
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { getSummary } from '../service/summaryService';
import moment from 'moment';
import Markdown from 'react-native-markdown-display';
import { useFocusEffect } from '@react-navigation/native';


const SummaryHistory = () => {
  const [summaries, setSummaries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Load data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadSummaries();
    }, [])
  );

  const loadSummaries = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSummary();
      setSummaries(data)
    } catch (err) {
      console.error('Failed to load summaries:', err);
      setError('Failed to load summary history. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (summaryId: string) => {
    setExpandedId(expandedId === summaryId ? null : summaryId);
  };

  const renderSummaryItem = ({ item }: { item: any }) => {
    const createdDate = moment(item.created_at?.toDate ? item.created_at.toDate() : item.created_at).format('MMM DD, YYYY • h:mm A');
    const isExpanded = expandedId === item.summary_id;
    
    return (
      <TouchableOpacity 
        style={[styles.summaryCard, isExpanded && styles.expandedCard]}
        onPress={() => toggleExpand(item.summary_id)}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.summaryTitle}>{item.title || 'AI Summary Report'}</Text>
          <Icon 
            name={isExpanded ? "keyboard-arrow-up" : "keyboard-arrow-down"} 
            size={24} 
            color="#666" 
          />
        </View>

        <View style={styles.dateContainer}>
          <Icon name="date-range" size={14} color="#666" style={styles.dateIcon} />
          <Text style={styles.dateRange}>
            {moment(item.start_date).format('MMM DD')} - {moment(item.end_date).format('MMM DD, YYYY')}
          </Text>
        </View>

        <View style={styles.summaryContent}>
          {isExpanded ? (
            <Markdown style={markdownStyles as any}>{item.summary_content}</Markdown>
          ): (
            <Text style={styles.summaryContentText} numberOfLines={2} ellipsizeMode='tail'>{item.summary_content}</Text>
          )}
        </View>

        <View style={styles.cardFooter}>
          <Text style={styles.timeStamp}>{createdDate}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4a90e2" />
          <Text style={styles.loadingText}>Loading summaries...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Icon name="error-outline" size={24} color="#d8000c" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadSummaries}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : summaries.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="history" size={64} color="#ccc" />
          <Text style={styles.emptyText}>No summary history yet</Text>
          <Text style={styles.emptySubtext}>Your generated summaries will appear here</Text>
        </View>
      ) : (
        <FlatList
          data={summaries}
          renderItem={renderSummaryItem}
          keyExtractor={(item) => item.summary_id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  listContainer: {
    padding: 16,
  },
  summaryCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  expandedCard: {
    borderColor: '#4a90e2',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  summaryContentText: {
    fontSize: 14,
    color: '#333',
    marginTop: 10,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  dateIcon: {
    marginRight: 6,
  },
  dateRange: {
    fontSize: 14,
    color: '#666',
  },
  summaryContent: {
    marginVertical: 8,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 10,
  },
  timeStamp: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginTop: 12,
    fontSize: 16,
    color: '#d8000c',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#4a90e2',
    borderRadius: 6,
  },
  retryText: {
    color: 'white',
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
  },
});

const markdownStyles = {
  body: {
    color: '#444',
  },
  heading1: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    marginTop: 20,
  },
  heading2: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    marginTop: 16,
  },
  heading3: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
    marginTop: 14,
  },
  paragraph: {
    fontSize: 15,
    lineHeight: 24,
    marginBottom: 12,
    color: '#444',
  },
  list: {
    marginBottom: 10,
  },
  listItem: {
    marginBottom: 6,
  },
  listItemText: {
    fontSize: 15,
    lineHeight: 24,
    color: '#444',
  },
  blockquote: {
    borderLeftWidth: 4,
    borderLeftColor: '#ccc',
    paddingLeft: 16,
    backgroundColor: '#f9f9f9',
    paddingVertical: 8,
    marginVertical: 10,
  },
  blockquoteText: {
    fontSize: 15,
    color: '#666',
    fontStyle: 'italic',
  },
  strong: {
    fontWeight: 'bold',
  },
  em: {
    fontStyle: 'italic',
  },
};

export default SummaryHistory;
