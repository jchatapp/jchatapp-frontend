export function formatTimestamp(timestampMicro) {
    const timestampMilli = parseInt(timestampMicro) / 1000;
  
    const date = new Date(timestampMilli);
  
    const options = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false 
    };
  
    return date.toLocaleString('en-US', options);
}