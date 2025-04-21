import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error.message);
    }
  };

  return (
    <div className="max-w-4xl mx-auto my-8 p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-oxfordBlue">Dashboard</h1>
        <button
          onClick={handleSignOut}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
        >
          Sign Out
        </button>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Welcome, {user.email}!</h2>
        <p className="text-gray-700 mb-4">
          You're now logged in to your account. This is your personalized dashboard where you can
          access exclusive features and content.
        </p>
        
        {/* Add your dashboard features here */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <div className="border border-gray-200 p-4 rounded-lg">
            <h3 className="text-lg font-medium mb-2">Your Profile</h3>
            <p className="mb-3">Customize your profile settings and preferences</p>
            <Link 
              to="/profile" 
              className="text-sm px-3 py-1 bg-oxfordBlue text-white rounded hover:bg-opacity-90 inline-block"
            >
              Edit Profile
            </Link>
          </div>
          
          <div className="border border-gray-200 p-4 rounded-lg">
            <h3 className="text-lg font-medium mb-2">Your Activities</h3>
            <p>View your recent activity and history</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;