export function formatTimestamp(timestampMicro) {
  const timestampMilli = parseInt(timestampMicro) / 1000;
  const date = new Date(timestampMilli);

  const dateOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  };

  const timeOptions = {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true 
  };

  const formattedDate = date.toLocaleDateString('en-US', dateOptions);
  const formattedTime = date.toLocaleTimeString('en-US', timeOptions);

  return {
    date: formattedDate,
    time: formattedTime
  };
}