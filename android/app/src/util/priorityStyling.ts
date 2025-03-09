const getPriorityColor = (priority: string) => {
    switch (priority) {
        case 'Critical': return '#ff0000';
        case 'High': return '#ff6347';
        case 'Medium': return '#ffa500';
        case 'Low': return '#4A90E2';
        default: return '#4A90E2';
    }
};

export default getPriorityColor;