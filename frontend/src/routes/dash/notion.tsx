import { useEffect, useState } from "react";
import { NotionIcon } from "@/components/dashboard/notion-icon";
import { Button } from "@/components/ui/button";
import axios from "axios";

type Page = {
  id: string;
  title: string;
};
const BASE_URL = import.meta.env.VITE_BACKEND_URL;
const Notion = () => {
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hasParentPage, setHasParentPage] = useState(false);
  const [pages, setPages] = useState<Page[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    axios
      .get(`${BASE_URL}/notion/status`, {
        withCredentials: true,
      })
      .then((res) => {
        setConnected(res.data.connected);
        setHasParentPage(res.data.hasParentPage);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to check Notion status", err);
        setConnected(false);
        setLoading(false);
      });
  }, []);

  const handleConnect = () => {
    window.location.href = `${BASE_URL}/notion/login`;
  };

const fetchPages = async () => {
  try {
    const res = await axios.get(`${BASE_URL}/notion/fetched-pages`, {
      withCredentials: true,
    });
    setPages(res.data.pages);
    setShowDropdown(true);
  } catch (err) {
    console.error("Failed to fetch Notion pages", err);
  }
};


  const handleSelectPage = async (pageId: string) => {
    try {
      setSaving(true);
      await axios.post(
        `${BASE_URL}/notion/set-notion-page`,
        { parent_page_id: pageId },
        { withCredentials: true }
      );
      setHasParentPage(true);
      setShowDropdown(false);
    } catch (err) {
      console.error("Failed to set parent page", err);
      alert("❌ Failed to set page.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full p-4">
      <main className="flex justify-between items-start flex-col md:flex-row gap-4 flex-wrap">
        <section className="flex flex-col gap-1">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            Integrations - Notion
          </h1>
          <p className="text-muted-foreground text-sm font-light tracking-tight leading-tight">
            Connect with Notion to make your learning experience faster and more efficient.
          </p>
        </section>

        <div className="relative flex gap-2 flex-wrap">
          {loading ? (
            <Button variant="secondary" size="sm" disabled>
              Checking...
            </Button>
          ) : connected ? (
            <>
              <Button
                variant="outline"
                size="sm"
                disabled
                className="flex items-center gap-2 text-green-600 border-green-500 cursor-default"
              >
                <NotionIcon />
                Connected
              </Button>

              {!hasParentPage && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={fetchPages}
                  className="flex items-center gap-2"
                >
                  📄 Select Page
                </Button>
              )}

              {showDropdown && (
                <div className="absolute top-14 right-0 bg-black shadow-lg rounded border z-50 p-2 max-h-64 overflow-y-auto w-64">
                  {pages.length === 0 ? (
                    <div className="px-4 py-2 text-sm text-muted-foreground">
                      No pages available.
                    </div>
                  ) : (
                    pages.map((page) => (
                      <button
                        key={page.id}
                        onClick={() => handleSelectPage(page.id)}
                        disabled={saving}
                        className="block text-left px-4 py-2 hover:bg-gray-100 w-full text-sm"
                      >
                        {page.title}
                      </button>
                    ))
                  )}
                </div>
              )}
            </>
          ) : (
            <Button
              variant="default"
              size="sm"
              onClick={handleConnect}
              className="flex items-center gap-2"
            >
              <NotionIcon />
              Connect
            </Button>
          )}
        </div>
      </main>
    </div>
  );
};

export default Notion;
