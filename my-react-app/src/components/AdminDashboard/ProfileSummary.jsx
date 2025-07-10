import avatar from "../../assets/profile_photo.jpg";

// Displays admin avatar, greeting and profile button.
const ProfileSummary = () => (
  <div className="bg-white p-6 rounded-lg shadow flex items-center space-x-4">
    <img src={avatar} alt="avatar" className="rounded-full w-12 h-12" />
    <div>
      <h3 className="font-semibold text-lg">Hello!</h3>
      <button className="text-green-600 font-medium text-sm">Profile →</button>
    </div>
  </div>
);

export default ProfileSummary;