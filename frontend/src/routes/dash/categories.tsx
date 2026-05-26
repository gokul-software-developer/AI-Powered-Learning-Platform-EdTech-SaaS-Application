import React from 'react';

const Categories = () => {
  // Example categories - replace with your actual categories
  const categories = [
    { name: "BUSINESS", id: "business" },
    { name: "TECHNOLOGY", id: "technology" },
    { name: "DESIGN", id: "design" },
    { name: "MARKETING", id: "marketing" },
    { name: "DEVELOPMENT", id: "development" },
    { name: "DATA SCIENCE", id: "data-science" },
    { name: "FINANCE", id: "finance" },
    { name: "HEALTHCARE", id: "healthcare" },
    { name: "EDUCATION", id: "education" }
  ];

  return (
    <section className="py-10">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold mb-8 tracking-wide">CATEGORIES</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <button
              key={category.id}
              className="flex items-center justify-between px-10 py-5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
              onClick={() => console.log(`Clicked on ${category.name}`)}
            >
              <span className="font-medium tracking-wider">{category.name}</span>
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
                <div className="w-8 h-8 rounded-full overflow-hidden relative">
                  <div className="absolute top-0 right-0 w-1/3 h-full bg-emerald-400"></div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Categories;