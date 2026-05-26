const ContactUsPage = () => {
    return (
      <div className="min-h-screen flex flex-col bg-white dark:bg-gray-800 overflow-hidden">
        <div className="flex flex-1 items-center justify-center px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center w-full max-w-6xl">
    
            {/* Left Side - Image */}
            <div className="flex justify-center">
              <img
                src="https://img.freepik.com/free-vector/flat-design-illustration-customer-support_23-2148887720.jpg?semt=ais_hybrid"
                alt="Customer Support"
                className="w-full max-w-md rounded-lg"
              />
            </div>
    
            {/* Right Side - Contact Details */}
            <div className="flex flex-col items-center md:items-start text-center md:text-left">
              <h1 className="text-5xl font-bold text-blue-600 dark:text-blue-400 font-poppins mb-2 break-words">
                Contact Us
              </h1>
              <p className="text-lg text-gray-700 dark:text-gray-300 mt-2">
                Phone : <strong>9500117868</strong>
              </p>
              <p className="text-lg text-gray-700 dark:text-gray-300 mt-2">
                Mail : <strong>hr@gk.com</strong>
              </p>
            </div>
    
          </div>
        </div>
      </div>
    );
  };
  
  export default ContactUsPage;
  