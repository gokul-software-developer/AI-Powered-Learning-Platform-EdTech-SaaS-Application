import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";

type User = {
  id: number;
  first_name: string;
  last_name: string;
};

type Course = {
  id: number;
  course_name: string;
  createdBy?: string | User; // Accept string or User object for flexibility
};

type Group = {
  id: number;
  group_name: string;
};

type StudyPlan = {
  id: number;
  plan_name: string;
  createdBy?: string | User; // Accept string or User object for flexibility
};

type SearchResults = {
  courses: Course[];
  users: User[];
  groups: Group[];
  studyPlans: StudyPlan[];
};

const SearchBar = () => {
  const backendURL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<SearchResults | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Convert string to title case
  const toTitleCase = (str: string) =>
    str
      .toLowerCase()
      .split(" ")
      .map((word) => (word ? word.charAt(0).toUpperCase() + word.slice(1) : ""))
      .join(" ");

  // Helper to format User object or string full name safely
  const getOwnerName = (createdBy?: string | User) => {
    if (!createdBy) return "";
    if (typeof createdBy === "string") return toTitleCase(createdBy);
    if (createdBy.first_name && createdBy.last_name)
      return toTitleCase(`${createdBy.first_name} ${createdBy.last_name}`);
    return "";
  };

  // Perform search on button click or enter key press
  const doSearch = () => {
    const trimmed = searchTerm.trim();
    if (!trimmed) {
      setResults(null);
      setShowDropdown(false);
      return;
    }
    setLoading(true);
    axios
      .get(`${backendURL}/search/multi?query=${encodeURIComponent(trimmed)}`, {
        withCredentials: true,
      })
      .then((res) => {
        setResults(res.data);
        setShowDropdown(true);
      })
      .catch((error) => {
        console.error("Search error:", error);
        setResults(null);
        setShowDropdown(false);
      })
      .finally(() => setLoading(false));
  };

  // Generic render function for search results
  const renderItems = (
    items: any[],
    typeLabel: string,
    keyFn: (item: any) => string,
    labelFn: (item: any) => React.ReactNode,
    pathFn: (item: any) => string,
    creatorFn?: (item: any) => string
  ) =>
    items.map((item) => (
      <li
        key={keyFn(item)}
        className="px-4 py-3 hover:bg-zinc-800 transition-colors cursor-pointer list-none rounded"
        onClick={() => {
          setSearchTerm("");
          setShowDropdown(false);
          navigate(pathFn(item));
        }}
        role="option"
        aria-label={`${typeLabel}: ${labelFn(item)}`}
      >
        <div className="text-white text-sm font-medium">{labelFn(item)}</div>
        {creatorFn && (
          <div className="text-xs text-gray-400 mt-0.5"> {creatorFn(item)}</div>
        )}
        <div className="text-xs text-gray-400">{typeLabel}</div>
      </li>
    ));

  return (
    <div className="relative w-full max-w-xl mx-auto" ref={dropdownRef}>
      <div className="flex space-x-2">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search users, groups, plans, courses..."
          className="flex-grow px-5 py-2.5 bg-[#121212] text-white placeholder-gray-400 rounded-full border border-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-shadow shadow-sm"
          onKeyDown={(e) => {
            if (e.key === "Enter") doSearch();
          }}
          aria-label="Search input"
          role="combobox"
          aria-expanded={showDropdown}
          aria-haspopup="listbox"
          aria-controls="search-results-list"
        />
        <button onClick={doSearch} aria-label="Search" title="Search" type="button">
          <Search className="w-5 h-5" />
        </button>
      </div>

      {loading && <p className="text-white mt-2 text-center select-none">Loading...</p>}

      {showDropdown && results && (
        <ul
          id="search-results-list"
          className="absolute top-[110%] left-0 w-full bg-[#1a1a1a] border border-gray-700 rounded-xl shadow-2xl z-50 max-h-80 overflow-y-auto text-sm list-none p-0"
          role="listbox"
        >
          {renderItems(
            results.users,
            "User",
            (item) => `user-${item.id}`,
            (item) => toTitleCase(`${item.first_name} ${item.last_name}`),
            (item) => `/profile/${item.id}`
          )}

          {renderItems(
            results.groups,
            "Group",
            (item) => `group-${item.id}`,
            (item) => toTitleCase(item.group_name),
            (item) => `/group/${item.id}`
          )}

          {renderItems(
            results.studyPlans,
            "Study Plan",
            (item) => `plan-${item.id}`,
            (item) => toTitleCase(item.plan_name),
            (item) => `/studyplan/${item.id}`,
            (item) => getOwnerName(item.createdBy)
          )}

          {renderItems(
            results.courses,
            "Course",
            (item) => `course-${item.id}`,
            (item) => toTitleCase(item.course_name),
            (item) => `/course-overview/${item.id}`,
            (item) => getOwnerName(item.createdBy)
          )}

          {results.courses.length === 0 &&
            results.users.length === 0 &&
            results.groups.length === 0 &&
            results.studyPlans.length === 0 && (
              <li className="px-4 py-4 text-center text-gray-500 list-none select-none">
                No results found.
              </li>
            )}
        </ul>
      )}
    </div>
  );
};

export default SearchBar;
