// Function to get traffic data throughout the day
async function getTrafficData(lat, lng) {
    const timeIntervals = [
      { hour: 0, label: '12 AM' },
      { hour: 4, label: '4 AM' },
      { hour: 8, label: '8 AM' },
      { hour: 12, label: '12 PM' },
      { hour: 16, label: '4 PM' },
      { hour: 20, label: '8 PM' }
    ];
  
    try {
      // Get traffic data for each time interval
      const trafficPromises = timeIntervals.map(async interval => {
        const response = await fetch(
          `https://api.tomtom.com/traffic/services/4/flowSegmentData/absolute/10/json` +
          `?point=${lat},${lng}&key=${TOMTOM_KEY}`
        );
        const data = await response.json();
        
        return {
          time: interval.label,
          congestion: Math.round((data.flowSegmentData.currentSpeed / 
                                 data.flowSegmentData.freeFlowSpeed) * 100)
        };
      });
  
      const trafficData = await Promise.all(trafficPromises);
      return trafficData;
    } catch (error) {
      console.error('Error fetching traffic data:', error);
      return [];
    }
  }
  
  // Usage in visualization
  const TrafficChart = ({ lat, lng }) => {
    const [data, setData] = useState([]);
  
    useEffect(() => {
      const fetchData = async () => {
        const trafficData = await getTrafficData(lat, lng);
        setData(trafficData);
      };
      fetchData();
    }, [lat, lng]);
  
    return (
      <BarChart width={600} height={300} data={data}>
        <XAxis dataKey="time" />
        <YAxis label="Congestion %" />
        <Bar dataKey="congestion" fill="#8884d8" />
      </BarChart>
    );
  };

// Function to get 24-hour AQI data
async function getAQIData(lat, lng) {
    try {
      const response = await fetch(
        `https://api.openaq.org/v2/measurements?coordinates=${lat},${lng}` +
        `&radius=5000&parameter=pm25&limit=24&order_by=datetime`,
        {
          headers: {
            'Authorization': `Bearer ${OPENAQ_TOKEN}`
          }
        }
      );
      
      const data = await response.json();
      
      // Process and format the data
      const formattedData = data.results.map(reading => ({
        time: new Date(reading.date.local).toLocaleTimeString([], 
          { hour: '2-digit', hour12: true }),
        aqi: reading.value
      }));
  
      return formattedData;
    } catch (error) {
      console.error('Error fetching AQI data:', error);
      return [];
    }
  }
  
  // Usage in visualization
  const AQIChart = ({ lat, lng }) => {
    const [data, setData] = useState([]);
  
    useEffect(() => {
      const fetchData = async () => {
        const aqiData = await getAQIData(lat, lng);
        setData(aqiData);
      };
      fetchData();
    }, [lat, lng]);
  
    return (
      <LineChart width={600} height={300} data={data}>
        <XAxis dataKey="time" />
        <YAxis label="AQI" />
        <Line type="monotone" dataKey="aqi" stroke="#82ca9d" />
      </LineChart>
    );
  };

  // Function to get population trend data
async function getPopulationData(countryCode, cityName) {
    try {
      // Get historical population data
      const response = await fetch(
        `https://api.worldbank.org/v2/country/${countryCode}/indicator/SP.POP.TOTL` +
        `?format=json&per_page=10&city=${cityName}`
      );
      
      const data = await response.json();
      
      // Process and format the data
      const formattedData = data[1].map(item => ({
        year: item.date,
        population: item.value
      }));
  
      return formattedData;
    } catch (error) {
      console.error('Error fetching population data:', error);
      return [];
    }
  }
  
  // Usage in visualization
  const PopulationChart = ({ countryCode, cityName }) => {
    const [data, setData] = useState([]);
  
    useEffect(() => {
      const fetchData = async () => {
        const populationData = await getPopulationData(countryCode, cityName);
        setData(populationData);
      };
      fetchData();
    }, [countryCode, cityName]);
  
    return (
      <LineChart width={600} height={300} data={data}>
        <XAxis dataKey="year" />
        <YAxis label="Population" />
        <Line type="monotone" dataKey="population" stroke="#8884d8" />
      </LineChart>
    );
  };

  const CityDashboard = ({ cityName }) => {
    const [coordinates, setCoordinates] = useState(null);
    
    // First get coordinates using Mapbox
    useEffect(() => {
      const getCoordinates = async () => {
        try {
          const response = await fetch(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${cityName}.json` +
            `?access_token=${MAPBOX_TOKEN}`
          );
          const data = await response.json();
          setCoordinates({
            lat: data.features[0].center[1],
            lng: data.features[0].center[0]
          });
        } catch (error) {
          console.error('Error getting coordinates:', error);
        }
      };
      
      getCoordinates();
    }, [cityName]);
  
    if (!coordinates) return <div>Loading...</div>;
  
    return (
      <div className="dashboard-container">
        <TrafficChart lat={coordinates.lat} lng={coordinates.lng} />
        <AQIChart lat={coordinates.lat} lng={coordinates.lng} />
        <PopulationChart 
          countryCode={getCountryCode(cityName)} 
          cityName={cityName} 
        />
      </div>
    );
  };

  // Utility function for data processing
const processTimeSeriesData = (data, interval = 'hour') => {
    return data.reduce((acc, curr) => {
      const timeKey = interval === 'hour' ? 
        new Date(curr.timestamp).getHours() : 
        new Date(curr.timestamp).toLocaleDateString();
      
      if (!acc[timeKey]) {
        acc[timeKey] = {
          values: [],
          count: 0
        };
      }
      
      acc[timeKey].values.push(curr.value);
      acc[timeKey].count++;
      
      return acc;
    }, {});
  };
  
  // Error boundary component for charts
  const ChartErrorBoundary = ({ children }) => {
    const [hasError, setHasError] = useState(false);
  
    if (hasError) {
      return <div>Error loading chart. Please try again later.</div>;
    }
  
    return children;
  };