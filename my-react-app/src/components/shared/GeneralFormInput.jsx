import { FaEye, FaEyeSlash } from 'react-icons/fa';

//Handle form inputs

const GeneralFormInput = ({
  type,
  value,
  onChange,         //callback function to handle changes
  placeholder,
  showToggle = false,
  showPassword,
  setShowPassword,
  required = true
}) => {
  return (
    <div className="relative">     {/**To position the eye icon inside the input field */}
      <input
        type={showToggle ? (showPassword ? 'text' : 'password') : type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="w-full p-2 border border-[#0E5D35] rounded-md"
      />
      {showToggle && (
        <span
          className="absolute top-2.5 right-3 text-gray-600 cursor-pointer"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? <FaEye /> : <FaEyeSlash />}
        </span>
      )}
    </div>
  );
};

export default GeneralFormInput;
