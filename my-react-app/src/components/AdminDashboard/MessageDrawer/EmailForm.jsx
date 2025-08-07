import { useRef, useState } from "react";

const EmailForm = ({
  emailTo,
  subject,
  messageBody,
  setEmailTo,
  setSubject,
  setMessageBody,
  sendEmailManually,
}) => {
  const [attachments, setAttachments] = useState([]);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setAttachments((prev) => [...prev, ...selectedFiles]);
    e.target.value = null;
  };

  const handleRemove = (index) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
    if (fileInputRef.current) fileInputRef.current.value = null;
  };

  const handleSend = async () => {
    await sendEmailManually({ attachments });

    setEmailTo("");
    setSubject("");
    setMessageBody("");
    setAttachments([]);
    if (fileInputRef.current) fileInputRef.current.value = null;
  };

  return (
    <div className="p-4 space-y-3 text-sm">
      <h3 className="text-lg font-semibold text-gray-800">📤 Send Custom Email</h3>

      <input
        type="email"
        placeholder="Recipient email"
        value={emailTo}
        onChange={(e) => setEmailTo(e.target.value)}
        className="w-full p-2 border border-gray-300 rounded"
      />

      <input
        type="text"
        placeholder="Subject"
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        className="w-full p-2 border border-gray-300 rounded"
      />

      <textarea
        placeholder="Message body"
        rows={6}
        value={messageBody}
        onChange={(e) => setMessageBody(e.target.value)}
        className="w-full p-2 border border-gray-300 rounded resize-none"
      />

      {/* Custom file input */}
      <div>
        <label
          htmlFor="file-upload"
          className="cursor-pointer inline-block px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition"
        >
           Choose Files
        </label>
        <input
          id="file-upload"
          type="file"
          multiple
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Show selected or fallback message */}
        {attachments.length > 0 ? (
          <div className="mt-2 space-y-1">
            {attachments.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-gray-100 p-2 rounded text-sm"
              >
                <span className="truncate max-w-[80%]">{file.name}</span>
                <button
                  onClick={() => handleRemove(index)}
                  className="text-red-500 text-xs font-medium hover:underline ml-2"
                >
                  ✖ Remove
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-xs mt-1">No file chosen</p>
        )}
      </div>

      <button
        onClick={handleSend}
        className="bg-blue-600 text-white font-semibold px-4 py-2 rounded hover:bg-blue-700 transition"
      >
        Send Email
      </button>
    </div>
  );
};

export default EmailForm;
