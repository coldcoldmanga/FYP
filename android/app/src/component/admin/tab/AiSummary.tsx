import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from "react-native-vector-icons/MaterialIcons";
import axios from "axios";
import Markdown from 'react-native-markdown-display';
import moment from 'moment';

const AiSummary = ({navigation}: {navigation: NavigationProp<any>}) => {
  const [summary, setSummary] = useState<string>("");
  const [generating, setGenerating] = useState<boolean>(false);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [activeFilter, setActiveFilter] = useState<string>("");
  const [showStartPicker, setShowStartPicker] = useState<boolean>(false);
  const [showEndPicker, setShowEndPicker] = useState<boolean>(false);

  const dateFilters = [
    { label: "Last 7 Days", value: "last7days" },
    { label: "Last 30 Days", value: "last30days" },
    { label: "This Month", value: "thisMonth" },
    { label: "Last Month", value: "lastMonth" },
    { label: "Custom Date", value: "customDate" },
  ];

  const handleDateFilter = (filterValue: string) => {
    setActiveFilter(filterValue);
    const now = moment();
    let start, end;

    switch (filterValue) {
      case "last7days":
        start = now.clone().subtract(7, 'days').startOf('day');
        end = now.clone().endOf('day');
        break;
      case "last30days":
        start = now.clone().subtract(30, 'days').startOf('day');
        end = now.clone().endOf('day');
        break;
      case "thisMonth":
        start = now.clone().startOf('month');
        end = now.clone().endOf('month');
        break;
      case "lastMonth":
        start = now.clone().subtract(1, 'month').startOf('month');
        end = now.clone().subtract(1, 'month').endOf('month');
        break;
      case "customDate":{
        setShowStartPicker(true);
        break;
      }
      default:
        return;
    }

    setStartDate(start?.toDate().toLocaleDateString() || "");
    setEndDate(end?.toDate().toLocaleDateString() || "");
  };

  const onStartDateChange = (event:any, selectedDate?:Date) => {
    if(selectedDate){
      setShowStartPicker(false);
      setStartDate(selectedDate.toLocaleDateString());
      setShowEndPicker(true);
    }
  }

  const onEndDateChange = (event:any, selectedDate?:Date) => {
    if(selectedDate){
      setShowEndPicker(false);
      setEndDate(selectedDate.toLocaleDateString());
    }
  }

  const generateSummary = async () => {

    if (!startDate || !endDate) {
      setError("Please select start and end dates");
      return;
    }

    setGenerating(true);
    setError("");

    try {
      const response = await axios.post("https://fyp-backend-zeta-amber.vercel.app/analyzeReport", {
        startDate: startDate,
        endDate: endDate
      });

      if (response && response.data && response.data.success) {
        setSummary(response.data.data);
      } else {
        setError("No summary data available");
      }
    } catch (error) {
      setError(error as string);
      console.error("Error generating summary:", error);
      
    }finally{
      setGenerating(false);
    }
  };


  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Icon name="analytics" size={24} color="#4a90e2" />
        <Text style={styles.headerText}>AI Analysis Report</Text>
        <TouchableOpacity style={styles.historyButton} onPress={() => navigation.navigate("Summary History")}>
          <Icon name="history" size={24} color="fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.filterContainer}>
        <Text style={styles.filterTitle}>Quick Filters</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
        >
          {dateFilters.map((filter) => (
            <TouchableOpacity
              key={filter.value}
              style={[
                styles.filterButton,
                activeFilter === filter.value && styles.filterButtonActive
              ]}
              onPress={() => handleDateFilter(filter.value)}
            >
              <Text style={[
                styles.filterButtonText,
                activeFilter === filter.value && styles.filterButtonTextActive
              ]}>
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {showStartPicker && (
                            <DateTimePicker
                                value={startDate? new Date(startDate) : new Date()}
                                mode="date"
                                display="default"
                                onChange={onStartDateChange}
                                maximumDate={new Date()}
                            />
                        )}
                        
                        {showEndPicker && (
                            <DateTimePicker
                                value={endDate? new Date(endDate) : new Date()}
                                mode="date"
                                display="default"
                                onChange={onEndDateChange}
                                minimumDate={startDate? new Date(startDate) : undefined}
                                maximumDate={new Date()}
                            />
                        )}
      </View>

      {(startDate && endDate) && (
        <View style={styles.dateInfo}>
          <Icon name="date-range" size={16} color="#666" style={styles.dateIcon} />
          <Text style={styles.dateText}>
            {startDate} - {endDate}
          </Text>
        </View>
      )}

      <TouchableOpacity 
        style={[
          styles.generateButton,
          generating && styles.generateButtonDisabled
        ]} 
        onPress={generateSummary}
        disabled={generating}
      >
        <Icon name="auto-awesome" size={20} color="white" style={styles.buttonIcon} />
        <Text style={styles.buttonText}>Generate Summary</Text>
      </TouchableOpacity>
      
      {generating && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4a90e2" />
          <Text style={styles.loadingText}>Analyzing your data...</Text>
        </View>
      )}
      
      {error && (
        <View style={styles.errorContainer}>
          <Icon name="error-outline" size={20} color="#d8000c" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
      
      {!generating && summary && (
        <ScrollView style={styles.summaryContainer}>
          <View style={styles.summaryHeader}>
            <Icon name="description" size={20} color="#4a90e2" />
            <Text style={styles.summaryTitle}>Summary Report</Text>
          </View>
          <Markdown style={markdownStyles}>{summary}</Markdown>
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 10,
    color: '#333',
  },
  filterContainer: {
    marginBottom: 20,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  filterScroll: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  filterButtonActive: {
    backgroundColor: '#4a90e2',
    borderColor: '#4a90e2',
  },
  filterButtonText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: '#ffffff',
  },
  dateInfo: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateIcon: {
    marginRight: 8,
  },
  dateText: {
    fontSize: 14,
    color: '#666',
  },
  generateButton: {
    backgroundColor: '#4a90e2',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'e0e0e0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  generateButtonDisabled: {
    backgroundColor: '#a0c4e7',
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  loadingContainer: {
    alignItems: 'center',
    marginVertical: 30,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    marginVertical: 20,
    padding: 15,
    backgroundColor: '#ffecec',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  errorText: {
    color: '#d8000c',
    marginLeft: 8,
  },
  summaryContainer: {
    marginTop: 20,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,

  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  historyButton: {
    marginLeft: 'auto', 
    width: 40,          
    height: 40,         
    borderWidth: 1.5,     
    borderColor: 'e0e0e0',
    borderRadius: 8,    
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
});

const markdownStyles = {
  body: {
    padding: 15,
    color: '#444',
  },
  heading1: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  paragraph: {
    fontSize: 15,
    lineHeight: 24,
    marginBottom: 12,
  },
};

export default AiSummary;
