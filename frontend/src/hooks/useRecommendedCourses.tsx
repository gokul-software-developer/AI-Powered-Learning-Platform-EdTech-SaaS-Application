const useRecommendedCourses = () => {
    const [courses, setCourses] = useState([]);
  
    useEffect(() => {
      const fetchCourses = async () => {
        try {
          const res = await ('/api/recommendations');
          setCourses(res.data);
        } catch (err) {
          console.error('Fetch failed:', err);
        }
      };
      fetchCourses();
    }, []);
  
    return courses;
  };
  