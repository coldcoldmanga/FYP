import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Dimensions, RefreshControl } from "react-native";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { PieChart, LineChart } from "react-native-chart-kit";
import Icon from "react-native-vector-icons/MaterialIcons";
import DateTimePicker from '@react-native-community/datetimepicker';
import { getReport } from "../../../service/reportServices";
import AiSummary from "./AiSummary";
import { cacheManager } from "../../../util/cacheHelper";

const AnalyticTab = () => {
    const navigation = useNavigation<NavigationProp<any>>();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [reports, setReports] = useState<any[]>([]);
    const [allReports, setAllReports] = useState<any[]>([]); // Store all reports to filter locally
    const [startDate, setStartDate] = useState<any>(new Date(new Date().setDate(new Date().getDate() - 7))); // get the date of seven days ago based on today's date
    const [endDate, setEndDate] = useState<any>(new Date());
    const [showStartPicker, setShowStartPicker] = useState(false);
    const [showEndPicker, setShowEndPicker] = useState(false);
    const [selectedView, setSelectedView] = useState('week');
    const [activeView, setActiveView] = useState('analytics');

    // Function to fetch all reports from server or cache
    const fetchAllReports = async () => {
        try {
            setLoading(true);
            
            // Use a consistent cache key for all analytics reports
            const cacheKey = 'admin_analytics_all_reports';
            
            // Get data from cache or fetch from Firestore
            const reportData = await cacheManager.getOrFetch(cacheKey, async () => {
                console.log('Fetching analytics reports from Firestore...');
                return await getReport();
            });
            
            // Store all reports in state
            setAllReports(reportData);
            
            // Apply date filtering
            filterReportsByDate(reportData, startDate, endDate);
        } catch (error) {
            console.error("Error fetching report data:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };
    
    // Function to filter reports by date (runs client-side)
    const filterReportsByDate = (reportData: any[], start: Date, end: Date) => {
        if (!reportData || reportData.length === 0) {
            setReports([]);
            return;
        }
        
        const filteredReports = reportData.filter((report: any) => {
            const reportDate = report.submitted_at.toDate();
            return reportDate >= start && reportDate <= end;
        });
        
        setReports(filteredReports);
    };

    useEffect(() => {
        // Only fetch all reports once when component mounts
        fetchAllReports();
    }, []);
    
    // When date range changes, just filter the existing data
    useEffect(() => {
        if (allReports.length > 0) {
            filterReportsByDate(allReports, startDate, endDate);
        }
    }, [startDate, endDate]);
    
    // Function to refresh all data from server
    const refreshData = () => {
        setRefreshing(true);
        // Invalidate the analytics reports cache
        cacheManager.invalidate('admin_analytics_all_reports');
        fetchAllReports();
    };

    const getFaultTypeData = () => {
        const faultTypeCounts: Record<string, number> = {};
        
        reports.forEach(report => {
            const faultType = report.fault_type;
            faultTypeCounts[faultType] = (faultTypeCounts[faultType] || 0) + 1;
        });

        const data = Object.keys(faultTypeCounts).map((key, index) => {
            const colors = [
                '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', 
                '#9966FF', '#FF9F40', '#2FDF84', '#FF6B6B'
            ];
            
            return {
                name: key,
                population: faultTypeCounts[key],
                color: colors[index % colors.length],
                legendFontColor: "#7F7F7F",
                legendFontSize: 12
            };
        });

        return data;
    };

    const getMonthlyReportData = () => {
        const monthData = Array(6).fill(0);
        const monthLabels = [];
        
        for (let i = 5; i >= 0; i--) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            monthLabels.push(date.toLocaleString('default', { month: 'short' }));
        }
        
        reports.forEach(report => {
            const reportDate = report.submitted_at.toDate();
            const monthsAgo = (new Date().getMonth() - reportDate.getMonth() + 
                              (new Date().getFullYear() - reportDate.getFullYear()) * 12) % 6;
            
            if (monthsAgo >= 0 && monthsAgo < 6) {
                monthData[5 - monthsAgo]++;
            }
        });
        
        return {
            labels: monthLabels,
            datasets: [
                {
                    data: monthData,
                    color: (opacity = 1) => `rgba(71, 117, 234, ${opacity})`,
                    strokeWidth: 2
                }
            ],
        };
    };

    const getStatusData = () => {
        const statusCounts: Record<string, number> = { 'Pending': 0, 'Assigned': 0, 'In Progress': 0, 'Completed': 0};
        
        reports.forEach(report => {
            if (statusCounts.hasOwnProperty(report.status)) {
                statusCounts[report.status]++;
            }
        });

        const data = Object.keys(statusCounts).map((key, index) => {
            const colors = ['#FFCE56', '#36A2EB', '#4BC0C0', '#FF6384'];
            
            return {
                name: key,
                population: statusCounts[key],
                color: colors[index % colors.length],
                legendFontColor: "#7F7F7F",
                legendFontSize: 12
            };
        });

        return data;
    };

    const getFacilityData = () => {
        const facilityCounts: Record<string, number> = {};
        
        reports.forEach(report => {
            const facility = report.facility_id;
            facilityCounts[facility] = (facilityCounts[facility] || 0) + 1;
        });
    
        const data = Object.entries(facilityCounts)
            .sort(([, a], [, b]) => b - a) // Sort by count in descending order
            .slice(0, 5) // Take only top 5 buildings
            .map(([key, value], index) => {
                const colors = [
                    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', 
                    '#9966FF', '#FF9F40', '#2FDF84', '#FF6B6B'
                ];
                
                return {
                    name: key,
                    population: value,
                    color: colors[index % colors.length],
                    legendFontColor: "#7F7F7F",
                    legendFontSize: 12
                };
            });
    
        return data;
    };

    const renderSummaryCards = () => {
        const totalReports = reports.length;
        const completedReports = reports.filter(report => report.status === 'Completed').length;
        const completionRate = totalReports > 0 ? ((completedReports / totalReports) * 100).toFixed(1) : 0;
        
        const avgResponseTime = reports.length > 0 
            ? reports.reduce((sum, report) => {
               
                const submittedAt = report.submitted_at.toDate();
                const updatedAt = report.updated_at 
                    ? report.updated_at.toDate() 
                    : new Date();
                return sum + (updatedAt - submittedAt) / (1000 * 60 * 60 * 24); // in days
              }, 0) / reports.length
            : 0;

        return (
            <View style={styles.summaryContainer}>
                <View style={styles.summaryCard}>
                    <Text style={styles.summaryValue}>{totalReports}</Text>
                    <Text style={styles.summaryLabel}>Total Reports</Text>
                </View>
                
                <View style={styles.summaryCard}>
                    <Text style={styles.summaryValue}>{completionRate}%</Text>
                    <Text style={styles.summaryLabel}>Completion Rate</Text>
                </View>
                
                <View style={styles.summaryCard}>
                    <Text style={styles.summaryValue}>{avgResponseTime.toFixed(1)}</Text>
                    <Text style={styles.summaryLabel}>Avg. Response (days)</Text>
                </View>
            </View>
        );
    };

    const onChangeStartDate = (event: any, selectedDate?: Date) => {
        setShowStartPicker(false);
        if (selectedDate) {
            setStartDate(selectedDate);
        }
    };

    const onChangeEndDate = (event: any, selectedDate?: Date) => {
        setShowEndPicker(false);
        if (selectedDate) {
            setEndDate(selectedDate);
        }
    };


    return (
        <ScrollView 
            style={styles.container}
            contentContainerStyle={styles.contentContainer}
            refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={refreshData}
                    colors={['#1a2847']}
                />
            }
        >
            {/* Tab Header */}
            <View style={styles.tabHeader}>
                <TouchableOpacity 
                    style={[styles.tabButton, activeView === 'analytics' && styles.activeTabButton]}
                    onPress={() => setActiveView('analytics')}
                >
                    <Text style={[styles.tabButtonText, activeView === 'analytics' && styles.activeTabButtonText]}>
                        Analytics Dashboard
                    </Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                    style={[styles.tabButton, activeView === 'ai' && styles.activeTabButton]}
                    onPress={() => setActiveView('ai')}
                >
                    <Text style={[styles.tabButtonText, activeView === 'ai' && styles.activeTabButtonText]}>
                        AI Summary
                    </Text>
                </TouchableOpacity>
            </View>

            {activeView === 'analytics' ? (
                <>
                    {/* Main Analytics Card */}
                    <View style={styles.card}>
                        <View style={styles.header}>
                            <Text style={styles.title}>Analytics Dashboard</Text>
                        </View>

                        <View style={styles.dateSection}>
                            <View style={styles.dateRow}>
                                <View style={styles.dateCol}>
                                    <Text style={styles.dateLabel}>Start Date</Text>
                                    <TouchableOpacity 
                                        style={styles.datePicker}
                                        onPress={() => setShowStartPicker(true)}
                                    >
                                        <Text style={styles.dateValue}>
                                            {startDate ? startDate.toLocaleDateString() : 'mm/dd/yyyy'}
                                        </Text>
                                        <Icon name="calendar-today" size={16} color="#666" />
                                    </TouchableOpacity>
                                </View>
                                <View style={styles.dateCol}>
                                    <Text style={styles.dateLabel}>End Date</Text>
                                    <TouchableOpacity 
                                        style={styles.datePicker}
                                        onPress={() => setShowEndPicker(true)}
                                    >
                                        <Text style={styles.dateValue}>
                                            {endDate ? endDate.toLocaleDateString() : 'mm/dd/yyyy'}
                                        </Text>
                                        <Icon name="calendar-today" size={16} color="#666" />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <View style={styles.quickFilters}>
                                <TouchableOpacity 
                                    style={[styles.quickFilter, selectedView === 'week' && styles.activeQuickFilter]} 
                                    onPress={() => {
                                        const newStartDate = new Date();
                                        newStartDate.setDate(newStartDate.getDate() - 7);
                                        setStartDate(newStartDate);
                                        setEndDate(new Date());
                                        setSelectedView('week');
                                    }}
                                >
                                    <Text style={[styles.quickFilterText, selectedView === 'week' && styles.activeQuickFilterText]}>
                                        Last 7 Days
                                    </Text>
                                </TouchableOpacity>
                                
                                <TouchableOpacity 
                                    style={[styles.quickFilter, selectedView === 'month' && styles.activeQuickFilter]} 
                                    onPress={() => {
                                        const newStartDate = new Date();
                                        newStartDate.setDate(newStartDate.getDate() - 30);
                                        setStartDate(newStartDate);
                                        setEndDate(new Date());
                                        setSelectedView('month');
                                    }}
                                >
                                    <Text style={[styles.quickFilterText, selectedView === 'month' && styles.activeQuickFilterText]}>
                                        Last 30 Days
                                    </Text>
                                </TouchableOpacity>
                                
                                <TouchableOpacity 
                                    style={[styles.quickFilter, selectedView === 'thisMonth' && styles.activeQuickFilter]} 
                                    onPress={() => {
                                        const now = new Date();
                                        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
                                        setStartDate(firstDay);
                                        setEndDate(now);
                                        setSelectedView('thisMonth');
                                    }}
                                >
                                    <Text style={[styles.quickFilterText, selectedView === 'thisMonth' && styles.activeQuickFilterText]}>
                                        This Month
                                    </Text>
                                </TouchableOpacity>
                                
                                <TouchableOpacity 
                                    style={[styles.quickFilter, selectedView === 'lastMonth' && styles.activeQuickFilter]} 
                                    onPress={() => {
                                        const now = new Date();
                                        const firstDay = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                                        const lastDay = new Date(now.getFullYear(), now.getMonth(), 0);
                                        setStartDate(firstDay);
                                        setEndDate(lastDay);
                                        setSelectedView('lastMonth');
                                    }}
                                >
                                    <Text style={[styles.quickFilterText, selectedView === 'lastMonth' && styles.activeQuickFilterText]}>
                                        Last Month
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {showStartPicker && (
                            <DateTimePicker
                                value={startDate || new Date()}
                                mode="date"
                                display="default"
                                onChange={(event, selectedDate) => {
                                    setShowStartPicker(false);
                                    if (selectedDate) {
                                        setStartDate(selectedDate);
                                        setSelectedView('custom');
                                    }
                                }}
                                maximumDate={endDate || undefined}
                            />
                        )}
                        
                        {showEndPicker && (
                            <DateTimePicker
                                value={endDate || new Date()}
                                mode="date"
                                display="default"
                                onChange={(event, selectedDate) => {
                                    setShowEndPicker(false);
                                    if (selectedDate) {
                                        setEndDate(selectedDate);
                                        setSelectedView('custom');
                                    }
                                }}
                                minimumDate={startDate || undefined}
                                maximumDate={new Date()}
                            />
                        )}

                        {loading ? (
                            <ActivityIndicator size="large" color="#1a2847" style={styles.loader} />
                        ) : (
                            <>
                                <View style={styles.summaryContainer}>
                                    <View style={styles.summaryCard}>
                                        <Text style={styles.summaryValue}>{reports.length}</Text>
                                        <Text style={styles.summaryLabel}>Total Reports</Text>
                                    </View>
                                    
                                    <View style={styles.summaryCard}>
                                        <Text style={styles.summaryValue}>
                                            {reports.length > 0 
                                                ? Math.round((reports.filter(r => r.status === 'Completed').length / reports.length) * 100)
                                                : 0}%
                                        </Text>
                                        <Text style={styles.summaryLabel}>Completion Rate</Text>
                                    </View>
                                    
                                    <View style={styles.summaryCard}>
                                        <Text style={styles.summaryValue}>
                                            {reports.length > 0 
                                                ? (reports.reduce((sum, r) => sum + (r.response_time || 3), 0) / reports.length).toFixed(1)
                                                : 0}
                                        </Text>
                                        <Text style={styles.summaryLabel}>Avg. Response (days)</Text>
                                    </View>
                                </View>
                            </>
                        )}
                    </View>

                    {/* Fault Type Distribution Card */}
                    {!loading && (
                        <View style={styles.card}>
                            <Text style={styles.sectionTitle}>Fault Type Distribution</Text>
                            {reports.length > 0 ? (
                                <>
                                    <View style={styles.chartWrapper}>
                                        <PieChart
                                            data={getFaultTypeData()}
                                            width={Dimensions.get("window").width - 80}
                                            height={200}
                                            chartConfig={{
                                                backgroundGradientFrom: "#fff",
                                                backgroundGradientTo: "#fff",
                                                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                                            }}
                                            accessor="population"
                                            backgroundColor="transparent"
                                            paddingLeft="15"
                                            absolute
                                            hasLegend={false}
                                            center={[(Dimensions.get("window").width - 80) / 5, 0]}
                                            avoidFalseZero={true}
                                        />
                                    </View>
                                    
                                    <View style={styles.legendGrid}>
                                        {getFaultTypeData().map((item, index) => (
                                            <View key={index} style={styles.legendItem}>
                                                <View style={styles.legendHeader}>
                                                    <View style={[styles.legendColor, { backgroundColor: item.color }]} />
                                                    <Text style={styles.legendText}>{item.name}</Text>
                                                </View>
                                                <Text style={styles.legendPercent}>
                                                    {Math.round((item.population / reports.length) * 100)}%
                                                </Text>
                                            </View>
                                        ))}
                                    </View>
                                </>
                            ) : (
                                <View style={styles.noDataContainer}>
                                    <Icon name="bar-chart" size={48} color="#ccc" />
                                    <Text style={styles.noDataText}>No data available</Text>
                                </View>
                            )}
                        </View>
                    )}

                    {/* Reports Over Time Card */}
                    {!loading && (
                        <View style={styles.card}>
                            <Text style={styles.sectionTitle}>Reports Over Time</Text>
                            {reports.length > 0 ? (
                                <LineChart
                                    data={getMonthlyReportData()}
                                    width={Dimensions.get("window").width - 60}
                                    height={220}
                                    chartConfig={{
                                        backgroundColor: "#fff",
                                        backgroundGradientFrom: "#fff",
                                        backgroundGradientTo: "#fff",
                                        decimalPlaces: 0,
                                        color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                                        labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                                        style: {
                                            borderRadius: 16
                                        },
                                        propsForDots: {
                                            r: "6",
                                            strokeWidth: "2",
                                            stroke: "#1a2847"
                                        }
                                    }}
                                    bezier
                                    style={{
                                        marginVertical: 8,
                                        borderRadius: 16
                                    }}
                                />
                            ) : (
                                <View style={styles.noDataContainer}>
                                    <Icon name="trending-up" size={48} color="#ccc" />
                                    <Text style={styles.noDataText}>No data available</Text>
                                </View>
                            )}
                        </View>
                    )}

                    {/* Status Distribution Card */}
                    {!loading && (
                        <View style={styles.card}>
                            <Text style={styles.sectionTitle}>Status Distribution</Text>
                            {reports.length > 0 ? (
                                <View style={styles.statusChartContainer}>
                                    <PieChart
                                        data={getStatusData()}
                                        width={Dimensions.get("window").width - 80}
                                        height={200}
                                        chartConfig={{
                                            backgroundGradientFrom: "#fff",
                                            backgroundGradientTo: "#fff",
                                            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                                        }}
                                        accessor="population"
                                        backgroundColor="transparent"
                                        paddingLeft="15"
                                        absolute
                                        hasLegend={false}
                                        center={[(Dimensions.get("window").width - 80) / 5, 0]}
                                        avoidFalseZero={true}
                                    />
                                    
                                    <View style={styles.legendContainer}>
                                        {getStatusData().map((item, index) => (
                                            <View key={index} style={styles.legendRow}>
                                                <View style={styles.legendLeft}>
                                                    <View style={[styles.legendColor, { backgroundColor: item.color }]} />
                                                    <Text style={styles.legendText}>{item.name}</Text>
                                                </View>
                                                <Text style={styles.legendPercent}>
                                                    {Math.round((item.population / reports.length) * 100)}%
                                                </Text>
                                            </View>
                                        ))}
                                    </View>
                                </View>
                            ) : (
                                <View style={styles.noDataContainer}>
                                    <Icon name="pie-chart" size={48} color="#ccc" />
                                    <Text style={styles.noDataText}>No data available</Text>
                                </View>
                            )}
                        </View>
                    )}

                    {/* Frequently Reported Building Card */}
                    {!loading && (
                        <View style={styles.card}>
                            <Text style={styles.sectionTitle}>Frequently Reported Facility</Text>
                            {reports.length > 0 ? (
                                <View style={styles.statusChartContainer}>
                                    <PieChart
                                        data={getFacilityData()}
                                        width={Dimensions.get("window").width - 80}
                                        height={200}
                                        chartConfig={{
                                            backgroundGradientFrom: "#fff",
                                            backgroundGradientTo: "#fff",
                                            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                                        }}
                                        accessor="population"
                                        backgroundColor="transparent"
                                        paddingLeft="15"
                                        absolute
                                        hasLegend={false}
                                        center={[(Dimensions.get("window").width - 80) / 5, 0]}
                                        avoidFalseZero={true}
                                    />
                                    
                                    <View style={styles.legendContainer}>
                                        {getFacilityData().map((item, index) => (
                                            <View key={index} style={styles.legendRow}>
                                                <View style={styles.legendLeft}>
                                                    <View style={[styles.legendColor, { backgroundColor: item.color }]} />
                                                    <Text style={styles.legendText}>{item.name}</Text>
                                                </View>
                                                <Text style={styles.legendPercent}>
                                                    {Math.round((item.population / reports.length) * 100)}%
                                                </Text>
                                            </View>
                                        ))}
                                    </View>
                                </View>
                            ) : (
                                <View style={styles.noDataContainer}>
                                    <Icon name="location-city" size={48} color="#ccc" />
                                    <Text style={styles.noDataText}>No data available</Text>
                                </View>
                            )}
                        </View>
                    )}
                </>
            ) : (
                // This will be replaced with the AiSummary component
                <AiSummary navigation={navigation} />
            )}

            {/* Add a spacer at the bottom */}
            <View style={styles.bottomSpacer} />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f8f9fa",
        padding: 16
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: '#e0e0e0',
        padding: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        marginBottom: 16
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20
    },
    title: {
        fontSize: 22,
        fontWeight: "600",
        color: "#333",
    },
    filterButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e0e0e0'
    },
    filterText: {
        marginLeft: 4,
        color: '#333',
        fontSize: 14
    },
    dateSection: {
        marginBottom: 20
    },
    dateRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16
    },
    dateCol: {
        width: '48%'
    },
    dateLabel: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8
    },
    datePicker: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10
    },
    dateValue: {
        fontSize: 14,
        color: '#333'
    },
    quickFilters: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    quickFilter: {
        backgroundColor: '#f5f5f5',
        paddingVertical: 8,
        paddingHorizontal: 10,
        borderRadius: 20
    },
    activeQuickFilter: {
        backgroundColor: '#1a2847'
    },
    quickFilterText: {
        fontSize: 12,
        color: '#666'
    },
    activeQuickFilterText: {
        color: '#fff'
    },
    summaryContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 24
    },
    summaryCard: {
        backgroundColor: "#fff",
        borderRadius: 8,
        padding: 12,
        width: "31%",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#e0e0e0"
    },
    summaryValue: {
        fontSize: 18,
        fontWeight: "700",
        color: "#1a2847",
        marginBottom: 4
    },
    summaryLabel: {
        fontSize: 12,
        color: "#666",
        textAlign: "center"
    },
    chartSection: {
        marginBottom: 24
    },
    chartTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: "#333",
        marginBottom: 16
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: "#333",
        marginBottom: 16
    },
    chartWrapper: {
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 10
    },
    legendGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginTop: 16
    },
    legendItem: {
        width: '48%',
        backgroundColor: '#f8f9fa',
        borderRadius: 8,
        padding: 12,
        marginBottom: 10
    },
    legendHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5
    },
    legendColor: {
        width: 12,
        height: 12,
        borderRadius: 2,
        marginRight: 8
    },
    legendText: {
        fontSize: 14,
        color: '#333'
    },
    legendPercent: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333'
    },
    statusChartContainer: {
        alignItems: 'center'
    },
    legendContainer: {
        width: '100%',
        marginTop: 16
    },
    legendRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10
    },
    legendLeft: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    loader: {
        marginVertical: 50
    },
    noDataContainer: {
        alignItems: "center",
        justifyContent: "center",
        padding: 30
    },
    noDataText: {
        marginTop: 10,
        color: "#666"
    },
    aiContainer: {
        padding: 15,
    },
    aiCard: {
        backgroundColor: "#fff",
        borderRadius: 10,
        padding: 15,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    aiHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    aiTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#1a2847",
        marginLeft: 10,
    },
    generateButtonContainer: {
        alignItems: 'flex-end',
        marginBottom: 15,
    },
    generateButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1a2847',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 20,
    },
    generateButtonText: {
        color: '#fff',
        marginLeft: 5,
        fontSize: 12,
    },
    aiContent: {
        maxHeight: 500,
    },
    aiHeaderH1: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1a2847',
        marginVertical: 10,
    },
    aiHeaderH2: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1a2847',
        marginVertical: 8,
    },
    aiText: {
        fontSize: 14,
        color: '#333',
        lineHeight: 22,
        marginBottom: 5,
    },
    bulletPoint: {
        flexDirection: 'row',
        marginBottom: 5,
        paddingRight: 10,
    },
    bullet: {
        fontSize: 14,
        color: '#1a2847',
        marginRight: 5,
        marginTop: 1,
    },
    spacer: {
        height: 8,
    },
    tabHeader: {
        flexDirection: 'row',
        marginBottom: 16,
        borderRadius: 8,
        backgroundColor: '#f5f5f5',
        padding: 4,
    },
    tabButton: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderRadius: 6,
    },
    activeTabButton: {
        backgroundColor: '#fff',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        borderWidth: 1.5,
        borderColor: '#e0e0e0',
    },
    tabButtonText: {
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
    },
    activeTabButtonText: {
        color: '#1a2847',
        fontWeight: '600',
    },
    contentContainer: {
        paddingBottom: 80, // Adjust based on your navigation bar height
    },
    bottomSpacer: {
        height: 20, // Additional space if needed
    },
});

export default AnalyticTab;