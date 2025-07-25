const AdminHeader = ({ userProfile }) => (
  <div className="mb-6 animate-fade-in">
    <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 flex flex-wrap items-center gap-2">
      Welcome back,
      <span className="text-green-700">
        {userProfile?.firstName || "Admin"}
      </span>
    </h1>
    <p className="text-sm text-gray-600 mt-1">You are logged in as Admin</p>
  </div>
);

export default AdminHeader;
