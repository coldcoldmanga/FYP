import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";

interface AiSummaryProps {
  reports: any[];
  startDate: Date | null;
  endDate: Date | null;
  isLoading: boolean;
}

const AiSummary: React.FC<AiSummaryProps> = ({ reports, startDate, endDate, isLoading }) => {
  const [summary, setSummary] = useState<string>("");
  const [generating, setGenerating] = useState<boolean>(false);
  
  useEffect(() => {
    if (reports.length > 0 && !summary) {
      generateSummary();
    }
  }, [reports]);

  const generateSummary = async () => {
    try {
      setGenerating(true);
      
      //To simulate the API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Sample AI-generated summary (replace with actual API response later)
      const dateRange = startDate && endDate 
        ? `${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}`
        : "the selected period";
        
      const aiGeneratedSummary = `
# Fault Report Analysis Summary

## Overview
During ${dateRange}, a total of **${reports.length} reports** were submitted. 

## Key Insights
* **Most Common Issue**: ${getMostCommonIssue(reports)}
* **Average Response Time**: ${getAverageResponseTime(reports)} days
* **Completion Rate**: ${getCompletionRate(reports)}%

## Trends
The data shows ${getTrend(reports)} in report volume compared to previous periods. ${getLocationInsight(reports)}

## Recommendations
Based on the analysis:
1. ${getRecommendation1(reports)}
2. ${getRecommendation2(reports)}
3. Consider implementing preventive maintenance for recurring issues.
      `;
      
      setSummary(aiGeneratedSummary);
    } catch (error) {
      console.error("Error generating AI summary:", error);
      setSummary("Failed to generate summary. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  // Helper functions to analyze report data
  const getMostCommonIssue = (reports: any[]) => {
    const issueTypes: {[key: string]: number} = {};
    reports.forEach(report => {
      const type = report.fault_type || "Unknown";
      issueTypes[type] = (issueTypes[type] || 0) + 1;
    });
    
    let maxCount = 0;
    let mostCommon = "Unknown";
    
    Object.entries(issueTypes).forEach(([type, count]) => {
      if (count > maxCount) {
        maxCount = count;
        mostCommon = type;
      }
    });
    
    return mostCommon;
  };
  
  const getAverageResponseTime = (reports: any[]) => {
    const responseTimes = reports
      .filter(r => r.response_time)
      .map(r => r.response_time);
      
    if (responseTimes.length === 0) return "N/A";
    
    const avg = responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;
    return avg.toFixed(1);
  };
  
  const getCompletionRate = (reports: any[]) => {
    const completed = reports.filter(r => r.status === "Completed").length;
    return Math.round((completed / reports.length) * 100);
  };
  
  const getTrend = (reports: any[]) => {
    // This would normally compare to historical data
    // For now, we'll return a placeholder
    return "a steady increase";
  };
  
  const getLocationInsight = (reports: any[]) => {
    // Analyze location data
    // For now, return a placeholder
    return "Building A has the highest concentration of reports.";
  };
  
  const getRecommendation1 = (reports: any[]) => {
    const mostCommon = getMostCommonIssue(reports);
    return `Allocate additional resources to address ${mostCommon} issues.`;
  };
  
  const getRecommendation2 = (reports: any[]) => {
    return "Review response protocols to improve average response time.";
  };

  const renderSummary = () => {
    if (!summary) return null;
    
    // Parse the markdown-like format
    const lines = summary.split('\n');
    
    return lines.map((line, index) => {
      if (line.startsWith('# ')) {
        return <Text key={index} style={styles.h1}>{line.substring(2)}</Text>;
      } else if (line.startsWith('## ')) {
        return <Text key={index} style={styles.h2}>{line.substring(3)}</Text>;
      } else if (line.startsWith('* ')) {
        return (
          <View key={index} style={styles.bulletPoint}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.text}>{line.substring(2)}</Text>
          </View>
        );
      } else if (line.match(/^\d+\. /)) {
        return (
          <View key={index} style={styles.bulletPoint}>
            <Text style={styles.bullet}>{line.match(/^\d+/)?.[0]}.</Text>
            <Text style={styles.text}>{line.replace(/^\d+\. /, '')}</Text>
          </View>
        );
      } else if (line.trim() === '') {
        return <View key={index} style={styles.spacer} />;
      } else {
        return <Text key={index} style={styles.text}>{line}</Text>;
      }
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.title}>AI Insights</Text>
          
          <TouchableOpacity 
            style={styles.generateButton}
            onPress={generateSummary}
            disabled={generating || reports.length === 0}
          >
            <Icon name="refresh" size={16} color="#fff" />
            <Text style={styles.generateButtonText}>
              {generating ? "Generating..." : "Regenerate"}
            </Text>
          </TouchableOpacity>
        </View>
        
        {isLoading ? (
          <ActivityIndicator size="large" color="#1a2847" style={styles.loader} />
        ) : reports.length === 0 ? (
          <View style={styles.noDataContainer}>
            <Icon name="analytics" size={48} color="#ccc" />
            <Text style={styles.noDataText}>No data available for analysis</Text>
          </View>
        ) : generating ? (
          <View style={styles.generatingContainer}>
            <ActivityIndicator size="small" color="#1a2847" />
            <Text style={styles.generatingText}>Analyzing report data...</Text>
          </View>
        ) : (
          <ScrollView style={styles.summaryContainer}>
            {renderSummary()}
          </ScrollView>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    marginBottom: 16
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20
  },
  title: {
    fontSize: 22,
    fontWeight: "600",
    color: "#333"
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a2847',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  generateButtonText: {
    color: '#fff',
    marginLeft: 6,
    fontSize: 14,
  },
  summaryContainer: {
    maxHeight: 500,
  },
  h1: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a2847',
    marginVertical: 12,
  },
  h2: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a2847',
    marginVertical: 10,
  },
  text: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
    marginBottom: 8,
  },
  bulletPoint: {
    flexDirection: 'row',
    marginBottom: 8,
    paddingRight: 10,
  },
  bullet: {
    fontSize: 15,
    color: '#1a2847',
    marginRight: 8,
    width: 15,
  },
  spacer: {
    height: 8,
  },
  loader: {
    marginVertical: 50,
  },
  noDataContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
  },
  noDataText: {
    marginTop: 10,
    color: "#666",
  },
  generatingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  generatingText: {
    marginLeft: 10,
    color: "#666",
  },
});

export default AiSummary;
